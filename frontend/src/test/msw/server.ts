import { setupServer } from 'msw/node';

// No default handlers: each test declares the responses it depends on, and any request a test did not
// expect fails the test (onUnhandledRequest: 'error' in setup.ts).
export const server = setupServer();
