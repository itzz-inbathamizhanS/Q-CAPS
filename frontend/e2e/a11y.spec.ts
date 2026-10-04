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
const reportFile = resolve(here, '.results/axe-report.json');
const report: Record<string, Array<{ id: string; impact: string | null | undefined; nodes: number; help: string }>> = {};

async function check(page: Page, name: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const severe = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  report[name] = severe.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
  const allowed = baseline[name] ?? {};
  const unexpected = severe
    .filter((v) => v.nodes.length > (allowed[v.id] ?? 0))
    .map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes, baseline ${allowed[v.id] ?? 0}): ${v.help}`);
  expect.soft(unexpected, `new serious/critical axe violations on ${name}`).toEqual([]);
}

test.describe.configure({ mode: 'serial' });

test.afterAll(() => {
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
});

test('login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /initialize session/i })).toBeVisible();
  await check(page, 'login');
});

test('signed-in pages', async ({ page }) => {
  await signInAsDemoLearner(page);
  const pages: Array<[string, string, RegExp]> = [
    ['dashboard', '/dashboard', /welcome back/i],
    ['skills', '/skills', /your skill profile/i],
    ['curriculum', '/curriculum', /./],
    ['quiz', '/quiz/track_a_a1_computing_foundations', /./],
    ['scanner', '/scanner', /./],
  ];
  for (const [name, path, heading] of pages) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading }).or(page.getByRole('heading', { level: 2 })).first()).toBeVisible();
    if (name === 'quiz') await expect(page.getByRole('button', { name: /submit answer/i })).toBeVisible();
    await check(page, name);
  }
});
