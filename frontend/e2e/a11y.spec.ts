import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAsDemoLearner } from './fixtures';

// Serious and critical axe violations on the main pages. Violations that already existed when this check was
// added are listed in axe-baseline.json as rule id -> number of failing elements. A rule not in the baseline, or
// more failing elements than recorded, fails the test. TF.4 (the accessibility pass) fixes the baseline and
// empties it; lower a count when a fix lands. Do not raise a count to hide a new violation.
const here = dirname(fileURLToPath(import.meta.url));
const baseline: Record<string, Record<string, number>> = JSON.parse(readFileSync(resolve(here, 'axe-baseline.json'), 'utf8')).pages;
const reportDir = resolve(here, '.results/axe'); // one file per page: survives worker restarts after a failure

async function check(page: Page, name: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const severe = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const entries = severe.map((v) => ({
    id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help,
    targets: v.nodes.map((n) => `${n.target.join(' ')} :: ${(n.failureSummary ?? '').split('\n').slice(1).join(' ')}`),
  }));
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(resolve(reportDir, `${name}.json`), JSON.stringify(entries, null, 2));
  const allowed = baseline[name] ?? {};
  const unexpected = severe
    .filter((v) => v.nodes.length > (allowed[v.id] ?? 0))
    .map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes, baseline ${allowed[v.id] ?? 0}): ${v.help}`);
  expect.soft(unexpected, `new serious/critical axe violations on ${name}`).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test(`login page (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /initialize session/i })).toBeVisible();
    await check(page, `login-${theme}`);
  });

  test(`signed-in pages (${theme})`, async ({ page }) => {
    test.setTimeout(240_000); // ten pages with a full axe scan each
    await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
    await signInAsDemoLearner(page);
    const pages: Array<[string, string]> = [
      ['dashboard', '/dashboard'],
      ['skills', '/skills'],
      ['learning', '/learning'],
      ['diagnostic', '/assessment'],
      ['curriculum', '/curriculum'],
      ['quiz', '/quiz/track_a_a1_computing_foundations'],
      ['mission', '/missions/mission_flat_network_breach'],
      ['scanner', '/scanner'],
      ['badges', '/badges'],
      ['leaderboard', '/leaderboard'],
    ];
    for (const [name, path] of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading').first()).toBeVisible();
      if (name === 'quiz') await expect(page.getByRole('button', { name: /submit answer/i })).toBeVisible();
      await check(page, `${name}-${theme}`);
    }
  });
}
