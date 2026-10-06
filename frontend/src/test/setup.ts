import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { server } from './msw/server';
import { useAuthStore } from '@/features/auth/authStore';

configure({ asyncUtilTimeout: 3000 }); // findBy* waits; the default 1 s is tight under load

// jsdom has no matchMedia; report "no match" (light theme, no reduced-motion preference).
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => undefined, removeListener: () => undefined,
    addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ isAuthenticated: false, userId: null, userName: null, token: null, sessionExpired: false });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
