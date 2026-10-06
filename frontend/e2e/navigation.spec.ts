import { expect, test } from '@playwright/test';
import { signInAsDemoLearner } from './fixtures';

// TF.3: a persistent rail on wide screens, the drawer on small ones, and /organization -> /leaderboard.
test('wide screens show a persistent, collapsible navigation rail', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signInAsDemoLearner(page);
  const rail = page.locator('.app-rail');
  await expect(rail).toBeVisible();
  await expect(page.getByRole('button', { name: /toggle navigation menu/i })).toBeHidden();

  await rail.getByRole('link', { name: 'Skills & gaps' }).click();
  await expect(page).toHaveURL(/\/skills$/);

  await rail.getByRole('button', { name: 'Collapse navigation' }).click();
  await expect(rail.getByRole('link', { name: 'Crypto scanner' })).toBeVisible(); // icon-only, still named
  await expect.poll(async () => (await rail.boundingBox())?.width ?? 999).toBeLessThan(100); // after the width transition
  await page.reload();
  await expect(page.locator('.app-rail').getByRole('button', { name: 'Expand navigation' })).toBeVisible(); // remembered
});

test('small screens use the drawer and never scroll sideways', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signInAsDemoLearner(page);
  await expect(page.locator('.app-rail')).toBeHidden();
  await page.getByRole('button', { name: /toggle navigation menu/i }).click();
  await page.getByRole('link', { name: 'Leaderboard' }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the old /organization address redirects to the leaderboard', async ({ page }) => {
  await signInAsDemoLearner(page);
  await page.goto('/organization');
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole('heading', { level: 1, name: /leaderboard/i })).toBeVisible();
});
