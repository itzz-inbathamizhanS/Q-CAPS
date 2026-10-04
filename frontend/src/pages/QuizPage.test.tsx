import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { QuizPage } from './QuizPage';

// A1 has no prerequisites, so its quiz is never locked.
const MODULE_ID = 'track_a_a1_computing_foundations';
const ATTEMPT_ID = 'attempt-1';

// Three questions on purpose: the page must not assume a fixed quiz length.
const attempt = {
  attempt_id: ATTEMPT_ID,
  module_id: MODULE_ID,
  title: 'A1 quiz',
  passing_score_percent: 70,
  total_questions: 3,
  issued_at: '2026-10-05T10:00:00Z',
  expires_at: '2026-10-05T11:00:00Z',
  questions: [
    { item_id: 'q1', prompt: 'Question one?', options: ['1a', '1b', '1c'] },
    { item_id: 'q2', prompt: 'Question two?', options: ['2a', '2b'] },
    { item_id: 'q3', prompt: 'Question three?', options: ['3a', '3b', '3c', '3d'] },
  ],
};

const routes = [{ path: '/quiz/:moduleId', element: <QuizPage /> }];

function mockQuizServer(answers: Array<{ item_id: string; selected_position: number }>) {
  server.use(
    http.post(apiUrl(`/quizzes/${MODULE_ID}/attempts`), () => HttpResponse.json(attempt)),
    http.post(apiUrl(`/quizzes/attempts/${ATTEMPT_ID}/answers`), async ({ request }) => {
      const body = (await request.json()) as { item_id: string; selected_position: number };
      answers.push(body);
      // Per-answer feedback claims every answer is correct ...
      return HttpResponse.json({
        item_id: body.item_id, recorded: true, correct: true, correct_position: body.selected_position, explanation: null,
      });
    }),
    // ... but the server's grade is what counts, and the page must show it unchanged.
    http.post(apiUrl(`/quizzes/attempts/${ATTEMPT_ID}/submit`), () =>
      HttpResponse.json({
        attempt_id: ATTEMPT_ID, module_id: MODULE_ID, correct_answers: 2, score_percent: 66.67, passed: false,
        passing_score_percent: 70, xp_awarded: 0, graded_at: '2026-10-05T10:05:00Z',
      }),
    ),
    http.get(apiUrl('/activities/me'), () =>
      HttpResponse.json({ completed_labs: [], completed_missions: [], badges: [], passed_modules: [], quiz_scores: {}, xp: 0 }),
    ),
  );
}

describe('QuizPage', () => {
  it('sends each chosen position to the server and displays the server-graded result', async () => {
    signIn();
    const answers: Array<{ item_id: string; selected_position: number }> = [];
    mockQuizServer(answers);
    const user = userEvent.setup();

    renderRoutes(routes, `/quiz/${MODULE_ID}`);

    const picks = ['1b', '2a', '3d'];
    for (const [i, pick] of picks.entries()) {
      await user.click(await screen.findByRole('button', { name: pick }));
      await user.click(screen.getByRole('button', { name: /submit answer/i }));
      const next = i < picks.length - 1 ? /continue/i : /view results/i;
      await user.click(await screen.findByRole('button', { name: next }));
    }

    expect(await screen.findByRole('heading', { name: /not quite there yet/i })).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    const summary = screen.getByText(/you answered/i);
    expect(within(summary).getByText('2')).toBeInTheDocument();
    expect(within(summary).getByText('3')).toBeInTheDocument();

    expect(answers).toEqual([
      { item_id: 'q1', selected_position: 1 },
      { item_id: 'q2', selected_position: 0 },
      { item_id: 'q3', selected_position: 3 },
    ]);
  });

  it('asks the learner to sign in when the server rejects the attempt with 401', async () => {
    signIn();
    server.use(
      http.post(apiUrl(`/quizzes/${MODULE_ID}/attempts`), () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 }),
      ),
    );

    renderRoutes(routes, `/quiz/${MODULE_ID}`);

    expect(await screen.findByRole('heading', { name: /sign in to take this quiz/i })).toBeInTheDocument();
  });

  it('shows the server error and a retry when the quiz cannot be loaded', async () => {
    signIn();
    server.use(
      http.post(apiUrl(`/quizzes/${MODULE_ID}/attempts`), () =>
        HttpResponse.json({ detail: 'Quiz bank unavailable' }, { status: 503 }),
      ),
    );

    renderRoutes(routes, `/quiz/${MODULE_ID}`);

    expect(await screen.findByRole('heading', { name: /quiz unavailable/i })).toBeInTheDocument();
    expect(screen.getByText('Quiz bank unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
