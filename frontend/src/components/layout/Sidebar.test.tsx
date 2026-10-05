import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RouteObject } from 'react-router-dom';
import { renderRoutes, signIn } from '@/test/render';
import { Sidebar } from './Sidebar';
import { NAV_GROUPS } from './navItems';
import { useAdminStatus } from '@/features/admin/adminStatus';
import { router } from '@/app/routes';

function routePaths(routes: RouteObject[], prefix = ''): string[] {
  return routes.flatMap((r) => {
    const here = r.index ? prefix || '/' : r.path ? `${prefix}/${r.path}`.replace(/\/+/g, '/') : prefix;
    return [...(r.path || r.index ? [here] : []), ...routePaths(r.children ?? [], here)];
  });
}

describe('navigation', () => {
  it('every navigation item points at a real route', () => {
    const paths = new Set(routePaths(router.routes as RouteObject[]));
    for (const group of NAV_GROUPS) for (const item of group.items) expect(paths, item.to).toContain(item.to);
  });

  it('every top-level destination stays reachable from the navigation', () => {
    const linked = new Set(NAV_GROUPS.flatMap((g) => g.items.map((i) => i.to)));
    // Routes reached from within a page (a module, lesson, quiz, mission or finding) or redirects are not nav items.
    const reachedInPage = /:|^\/login$|^\/$|^\/missions$|^\/escape-room$|^\/organization$/;
    const unlinked = routePaths(router.routes as RouteObject[]).filter((p) => !reachedInPage.test(p) && !linked.has(p));
    expect(unlinked).toEqual([]);
  });

  it('groups the links by the research workflow and hides admin links from learners', () => {
    signIn();
    useAdminStatus.setState({ role: 'learner' });
    renderRoutes([{ path: '/dashboard', element: <Sidebar /> }], '/dashboard');
    const groups = screen.getAllByRole('group').map((g) => g.getAttribute('aria-label'));
    expect(groups).toEqual(['Overview', 'Assess', 'Secure', 'Learn', 'Progress']);
    expect(within(screen.getByRole('group', { name: 'Progress' })).getByRole('link', { name: 'Leaderboard' })).toHaveAttribute('href', '/leaderboard');
  });

  it('a collapsed rail keeps every link reachable by its accessible name', async () => {
    signIn();
    useAdminStatus.setState({ role: 'learner' });
    let collapsed = false;
    const { rerender } = renderRoutes(
      [{ path: '/dashboard', element: <Sidebar variant="rail" collapsed={collapsed} onToggleCollapsed={() => { collapsed = !collapsed; }} /> }],
      '/dashboard',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Collapse navigation' }));
    expect(collapsed).toBe(true);
    rerender(<></>);
    renderRoutes([{ path: '/dashboard', element: <Sidebar variant="rail" collapsed /> }], '/dashboard');
    expect(screen.getByRole('link', { name: 'Crypto scanner' })).toHaveAttribute('href', '/scanner');
    expect(screen.queryByText('Assess')).not.toBeInTheDocument(); // group headings hidden, links keep labels
  });
});
