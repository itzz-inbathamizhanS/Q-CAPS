import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { Assessment } from './Assessment';

const attempt = {
  attempt_id: 'diag-1', module_id: 'DIAG-A', title: 'Diagnostic', passing_score_percent: 0, total_questions: 2,
  issued_at: '2026-10-05T10:00:00Z', expires_at: '2026-10-05T12:00:00Z', kind: 'diagnostic', attempt_purpose: 'diagnostic_pre',
  questions: [
    { item_id: 'diag-a-q1', prompt: 'First diagnostic question?', options: ['opt A', 'opt B'], domain: 'PQC Fundamentals' },
    { item_id: 'diag-a-q2', prompt: 'Second diagnostic question?', options: ['opt C', 'opt D'], domain: 'Applied PQC' },
  ],
};

describe('Assessment (server-side diagnostic)', () => {
  it('submits the chosen positions and shows the result the server graded', async () => {
    signIn();
    let submitted: unknown = null;
    server.use(
      http.post(apiUrl('/quizzes/DIAG-A/attempts'), () => HttpResponse.json(attempt)),
      http.post(apiUrl('/quizzes/attempts/diag-1/submit'), async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({
          attempt_id: 'diag-1', module_id: 'DIAG-A', total_questions: 2, correct_answers: 1, score_percent: 50, passed: true,
          passing_score_percent: 0, xp_awarded: 0, graded_at: '2026-10-05T10:05:00Z', items: [],
        });
      }),
      http.get(apiUrl('/diagnostic/results'), () =>
        HttpResponse.json([{
          attempt_id: 'diag-1', module_id: 'DIAG-A', attempt_purpose: 'diagnostic_pre', graded_at: '2026-10-05T10:05:00Z',
          total_questions: 2, correct_answers: 1, score_percent: 50,
          domains: [
            { domain: 'Applied PQC', total_questions: 1, correct_count: 0, percentage: 0 },
            { domain: 'PQC Fundamentals', total_questions: 1, correct_count: 1, percentage: 100 },
          ],
        }]),
      ),
    );
    const user = userEvent.setup();
    renderRoutes([{ path: '/assessment', element: <Assessment /> }], '/assessment');

    expect(await screen.findByText('First diagnostic question?')).toBeInTheDocument();
    await user.click(screen.getByText('opt B'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByText('opt C'));
    await user.click(screen.getByRole('button', { name: /complete assessment/i }));

    expect(await screen.findByText('50%')).toBeInTheDocument();
    expect(submitted).toEqual({ answers: [
      { item_id: 'diag-a-q1', selected_position: 1 },
      { item_id: 'diag-a-q2', selected_position: 0 },
    ] });
  });

  it('shows an error with a retry when the diagnostic cannot be issued', async () => {
    signIn();
    server.use(http.post(apiUrl('/quizzes/DIAG-A/attempts'), () => HttpResponse.json({ detail: 'Quiz not found' }, { status: 404 })));
    renderRoutes([{ path: '/assessment', element: <Assessment /> }], '/assessment');

    expect(await screen.findByRole('alert')).toHaveTextContent('Quiz not found');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
