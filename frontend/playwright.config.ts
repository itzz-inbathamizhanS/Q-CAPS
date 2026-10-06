import { defineConfig, devices } from '@playwright/test';
import { randomBytes } from 'node:crypto';

// Isolated ports so the e2e run never attaches to a developer's servers on 8000/5173.
const API_PORT = process.env.E2E_API_PORT ?? '8011';
const WEB_PORT = process.env.E2E_WEB_PORT ?? '5181';
const WEB_URL = `http://localhost:${WEB_PORT}`;

// Random per run. Set in process.env so the backend launcher and the test workers (which inherit the runner's
// environment) see the same values.
const secret = () => randomBytes(24).toString('base64url');
process.env.E2E_API_PORT = API_PORT;
process.env.QCAPS_JWT_SECRET ??= secret() + secret();
process.env.QCAPS_ADMIN_PASSWORD ??= secret();
process.env.QCAPS_DEMO_LEARNER_PASSWORD ??= secret();
process.env.QCAPS_CORS_ORIGINS = WEB_URL;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: WEB_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/start-backend.mjs',
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: false,
      env: { VITE_API_BASE_URL: `http://localhost:${API_PORT}/api` },
    },
  ],
});
