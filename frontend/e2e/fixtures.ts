import { expect, type Page } from '@playwright/test';

/** The DEMO learner created by deploy_bootstrap.py in the throwaway e2e database (see start-backend.mjs). */
export const DEMO_LEARNER = 'demo-learner';

export async function signInAsDemoLearner(page: Page) {
  const password = process.env.QCAPS_DEMO_LEARNER_PASSWORD;
  if (!password) throw new Error('QCAPS_DEMO_LEARNER_PASSWORD is not set; run the tests with "npm run test:e2e".');
  await page.goto('/login');
  await page.getByLabel(/operator id/i).fill(DEMO_LEARNER);
  await page.getByLabel(/access key/i).fill(password);
  await page.getByRole('button', { name: /initialize session/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
