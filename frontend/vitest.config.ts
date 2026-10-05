import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Component and flow tests. The network is mocked with MSW (src/test/msw), so the tests exercise the real
// services in src/services rather than stubbed functions. End-to-end tests live in e2e/ and run with Playwright.
export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      restoreMocks: true,
      // Generous limits: flow tests click through whole pages and this machine can be slow under load.
      testTimeout: 15_000,
    },
  }),
);
