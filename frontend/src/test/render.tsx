/* eslint-disable react-refresh/only-export-components -- test helpers, never hot-reloaded */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BACKEND_BASE_URL } from '@/services/backendService';
import { useAuthStore } from '@/features/auth/authStore';

/** Absolute URL of a backend path, for MSW handlers. Uses the same base the services use. */
export const apiUrl = (path: string) => `${BACKEND_BASE_URL}${path}`;

export interface TestRoute {
  path: string;
  element: React.ReactNode;
}

const LocationProbe: React.FC = () => <output data-testid="location">{useLocation().pathname}</output>;

/**
 * Render routes in a MemoryRouter starting at `initialPath`.
 *
 * Not createMemoryRouter: the data router builds a fetch Request with jsdom's AbortSignal, which Node's fetch
 * rejects. No page under test uses loaders or actions, so the plain router behaves the same.
 */
export function renderRoutes(routes: TestRoute[], initialPath: string) {
  const utils = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {routes.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
  return { ...utils, currentPath: () => screen.getByTestId('location').textContent };
}

/** Put a signed-in user in the auth store, as a successful login would. */
export function signIn(userId = 7, name = 'tester', token = 'test-token') {
  useAuthStore.getState().login(userId, name, token);
}

export const Stub: React.FC<{ label: string }> = ({ label }) => <p>{label}</p>;
