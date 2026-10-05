import { expect, test } from '@playwright/test';

// The saved theme is applied by an inline script in index.html before React mounts (plan task T0.5), so dark mode
// does not flash light and /login, which has no header toggle, honours it too.
test('a saved dark theme is applied before the app renders, including on /login', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/login', { waitUntil: 'commit' });
  const atDomReady = await page.evaluate(
    () => new Promise<string | null>((resolve) => {
      const read = () => resolve(document.documentElement.getAttribute('data-theme'));
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', read, { once: true });
      else read();
    }),
  );
  expect(atDomReady).toBe('dark');
  await expect(page.getByRole('button', { name: /initialize session/i })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('without a saved choice the system preference decides', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/login');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull(); // nothing is written on load
  await context.close();
});
