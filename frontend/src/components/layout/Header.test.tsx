import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoutes, signIn, Stub } from '@/test/render';
import { Header } from './Header';
import { useAuthStore } from '@/features/auth/authStore';

const routes = [
  { path: '/dashboard', element: <Header /> },
  { path: '/login', element: <Stub label="login page" /> },
];

describe('Header', () => {
  it('shows no control that is not backed by data or a handler', () => {
    signIn(7, 'alice');
    renderRoutes(routes, '/dashboard');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument(); // no dead search input
    expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /help/i })).not.toBeInTheDocument();
    expect(document.querySelector('.header-unread-dot')).toBeNull();
  });

  it('opens an account menu whose Sign out ends the session', async () => {
    signIn(7, 'alice');
    const user = userEvent.setup();
    const { currentPath } = renderRoutes(routes, '/dashboard');

    const avatar = screen.getByRole('button', { name: /account menu for alice/i });
    expect(avatar).toHaveAttribute('aria-expanded', 'false');
    await user.click(avatar);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(avatar);
    await user.click(screen.getByRole('menuitem', { name: /sign out/i }));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(currentPath()).toBe('/login');
  });
});
