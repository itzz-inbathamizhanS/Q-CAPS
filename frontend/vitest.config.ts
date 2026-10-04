import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Component and flow tests. The network is mocked with MSW (src/test/msw), so the tests exercise the real
// services in src/services rather than stubbed functions. End-to-end tests live in e2e/ and run with Playwright.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      restoreMocks: true,
    },
  }),
);
