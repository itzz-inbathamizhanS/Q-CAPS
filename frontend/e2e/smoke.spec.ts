import { expect, test } from '@playwright/test';
import { DEMO_LEARNER, signInAsDemoLearner } from './fixtures';

// Login -> dashboard -> take a quiz -> see the server-graded result, against the real backend.
test('a learner can sign in, take a module quiz and see the graded result', async ({ page }) => {
  await signInAsDemoLearner(page);
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(DEMO_LEARNER, 'i') })).toBeVisible();

  // A1 has no prerequisites, so its quiz is always open.
  await page.goto('/quiz/track_a_a1_computing_foundations');

  const submit = page.getByRole('button', { name: /submit answer/i });
  const finish = page.getByRole('button', { name: /view results/i });
  const next = page.getByRole('button', { name: /continue/i });

  // The number of questions comes from the server; answer until the last one.
  for (let answered = 0; answered < 100; answered++) {
    await expect(submit).toBeVisible();
    await page.locator('button[aria-pressed]').first().click();
    await submit.click();
    await expect(next.or(finish)).toBeVisible();
    if (await finish.isVisible()) break;
    await next.click();
  }

  const graded = page.waitForResponse((r) => r.url().includes('/quizzes/attempts/') && r.url().endsWith('/submit'));
  await finish.click();
  const result = await (await graded).json();

  await expect(page.getByRole('heading', { name: /quiz passed|not quite there yet/i })).toBeVisible();
  await expect(page.getByText(`${Math.round(result.score_percent)}%`, { exact: true })).toBeVisible();
  await expect(page.getByText(/you answered/i)).toContainText(`${result.correct_answers} of`);
});
