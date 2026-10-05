import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';
import { signInAsDemoLearner } from './fixtures';

// Opt-in visual capture for before/after comparisons (not an assertion suite):
//   SCREENSHOT_DIR=<folder> SCREENSHOT_LABEL=before npx playwright test e2e/screenshots.spec.ts
const dir = process.env.SCREENSHOT_DIR;
const label = process.env.SCREENSHOT_LABEL ?? 'shot';

const PAGES: Array<[string, string]> = [
  ['badges', '/badges'],
  ['mission-decision', '/missions/mission_flat_network_breach'],
  ['mission-simulation', '/missions/mission_bb84_diplomatic_channel'],
  ['skills', '/skills'],
  ['dashboard', '/dashboard'],
];

test.skip(!dir, 'set SCREENSHOT_DIR to capture screenshots');

for (const theme of ['light', 'dark'] as const) {
  test(`capture pages in ${theme} theme`, async ({ page }) => {
    mkdirSync(dir as string, { recursive: true });
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await signInAsDemoLearner(page);
    for (const [name, path] of PAGES) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: join(dir as string, `${label}-${name}-${theme}.png`), fullPage: true });
    }
  });
}
