import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, Stub } from '@/test/render';
import { LoginPage } from './LoginPage';
import { useAuthStore } from '@/features/auth/authStore';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <Stub label="dashboard" /> },
];

async function fillAndSubmit(name: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/operator id/i), name);
  await user.type(screen.getByLabelText(/access key/i), password);
  await user.click(screen.getByRole('button', { name: /initialize session/i }));
}

describe('LoginPage', () => {
  it('keeps the submit button disabled until both fields are filled', async () => {
    renderRoutes(routes, '/login');
    const submit = screen.getByRole('button', { name: /initialize session/i });
    expect(submit).toBeDisabled();
    await userEvent.setup().type(screen.getByLabelText(/operator id/i), 'alice');
    expect(submit).toBeDisabled();
  });

  it('stores the session returned by the server and opens the dashboard', async () => {
    let sentBody: unknown = null;
    server.use(
      http.post(apiUrl('/auth/login'), async ({ request }) => {
        sentBody = await request.json();
        return HttpResponse.json({ access_token: 'server-token', user_id: 42, user_name: 'alice' });
      }),
      http.get(apiUrl('/users/42/profile'), () =>
        HttpResponse.json({ id: 42, name: 'alice', xp: 0, progress_data: '{}' }),
      ),
    );

    const { currentPath } = renderRoutes(routes, '/login');
    await fillAndSubmit('alice', 'correct-horse');

    expect(await screen.findByText('dashboard')).toBeInTheDocument();
    expect(currentPath()).toBe('/dashboard');
    expect(sentBody).toEqual({ name: 'alice', password: 'correct-horse' });
    const auth = useAuthStore.getState();
    expect(auth).toMatchObject({ isAuthenticated: true, userId: 42, userName: 'alice', token: 'server-token' });
  });

  it("shows the server's error and stays signed out when the credentials are rejected", async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json({ detail: 'Invalid name or password' }, { status: 401 }),
      ),
    );

    const { currentPath } = renderRoutes(routes, '/login');
    await fillAndSubmit('alice', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid name or password');
    expect(currentPath()).toBe('/login');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('reports a network failure instead of failing silently', async () => {
    server.use(http.post(apiUrl('/auth/login'), () => HttpResponse.error()));

    renderRoutes(routes, '/login');
    await fillAndSubmit('alice', 'whatever');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
