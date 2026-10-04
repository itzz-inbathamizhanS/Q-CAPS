// Start an isolated backend for the end-to-end tests.
//
// Every run gets a fresh throwaway SQLite database under e2e/.tmp (never backend/main_api/qcaps.db), seeded by
// deploy_bootstrap.py: curriculum, question banks, an admin and the DEMO learner "demo-learner". Passwords and the
// JWT secret come from playwright.config.ts through the environment and are random per run.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mainApi = resolve(here, '../../backend/main_api');
const tmp = resolve(here, '.tmp');
const dbFile = resolve(tmp, 'e2e.db');
const python = process.env.E2E_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const port = process.env.E2E_API_PORT;

for (const name of ['E2E_API_PORT', 'QCAPS_JWT_SECRET', 'QCAPS_ADMIN_PASSWORD', 'QCAPS_DEMO_LEARNER_PASSWORD', 'QCAPS_CORS_ORIGINS']) {
  if (!process.env[name]) {
    console.error(`${name} is not set; start the e2e tests with "npm run test:e2e".`);
    process.exit(2);
  }
}

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const env = {
  ...process.env,
  QCAPS_ENV: 'development',
  QCAPS_DATABASE_URL: `sqlite:///${dbFile.replace(/\\/g, '/')}`,
};

const seed = spawnSync(python, ['deploy_bootstrap.py'], { cwd: mainApi, env, encoding: 'utf8' });
if (seed.status !== 0) {
  console.error(seed.stdout, seed.stderr);
  console.error(`Seeding the e2e database failed (exit ${seed.status}).`);
  process.exit(1);
}

const server = spawn(python, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', port], {
  cwd: mainApi,
  env,
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code ?? 0));
