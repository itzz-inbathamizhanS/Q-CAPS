import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { Dashboard } from './Dashboard';
import { Organization } from './Organization';
import { AppShell } from '@/components/layout/AppShell';

// With the backend stopped, pages must say that loading failed, not that there is no data (plan task T0.4).
const down = (...paths: string[]) => server.use(...paths.map((p) => http.get(apiUrl(p), () => HttpResponse.error())));

describe('backend unreachable', () => {
  it('Dashboard shows errors with a retry for both the profile and the recommendation', async () => {
    signIn(7);
    down('/users/7/profile', '/users/7/recommendation');
    renderRoutes([{ path: '/dashboard', element: <Dashboard /> }], '/dashboard');

    expect(await screen.findByText(/progress figures could not be loaded/i)).toBeInTheDocument();
    expect(await screen.findByText(/recommendation could not be loaded/i)).toBeInTheDocument();
    expect(screen.getAllByText(/the server could not be reached/i)).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /try again/i })).toHaveLength(2);
  });

  it('Organization shows an error, not "no operators"', async () => {
    signIn(7);
    down('/leaderboard');
    renderRoutes([{ path: '/organization', element: <Organization /> }], '/organization');

    expect(await screen.findByText(/leaderboard could not be loaded/i)).toBeInTheDocument();
    expect(screen.queryByText(/no operators found/i)).not.toBeInTheDocument();
  });

  it('the app shell reports that progress could not be synced', async () => {
    signIn(7);
    down('/activities/me');
    renderRoutes([{ path: '/', element: <AppShell><p>page</p></AppShell> }], '/');

    expect(await screen.findByText(/progress could not be synced/i)).toBeInTheDocument();
  });

  it('a server error carries the server message', async () => {
    signIn(7);
    server.use(
      http.get(apiUrl('/users/7/profile'), () => HttpResponse.json({ detail: 'Database is being migrated' }, { status: 503 })),
      http.get(apiUrl('/users/7/recommendation'), () => HttpResponse.json({ detail: 'x' }, { status: 503 })),
    );
    renderRoutes([{ path: '/dashboard', element: <Dashboard /> }], '/dashboard');
    expect(await screen.findByText('Database is being migrated')).toBeInTheDocument();
  });
});
