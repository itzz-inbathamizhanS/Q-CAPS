import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { Skills } from './Skills';
import type { DiagnosticResult } from '@/services/backendService';

const routes = [{ path: '/skills', element: <Skills /> }];

const result: DiagnosticResult = {
  attempt_id: 'a1', module_id: 'DIAG-A', attempt_purpose: 'diagnostic_pre', graded_at: '2026-10-01T09:00:00Z',
  total_questions: 4, correct_answers: 2, score_percent: 50,
  domains: [
    { domain: 'PQC Fundamentals', total_questions: 2, correct_count: 0, percentage: 0 },
    { domain: 'Applied PQC', total_questions: 2, correct_count: 2, percentage: 100 },
  ],
};

const respond = (body: DiagnosticResult[] | null, status = 200) =>
  server.use(http.get(apiUrl('/diagnostic/results'), () => HttpResponse.json(body, { status })));

describe('Skills', () => {
  it('shows the empty state, not a score, when the server has no diagnostic', async () => {
    signIn();
    respond([]);
    renderRoutes(routes, '/skills');

    expect(await screen.findByRole('heading', { name: /no assessment evidence recorded/i })).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('renders the latest server-graded result', async () => {
    signIn();
    respond([result]);
    renderRoutes(routes, '/skills');

    expect((await screen.findAllByText('PQC Fundamentals')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Applied PQC').length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: /no assessment evidence recorded/i })).not.toBeInTheDocument();
  });

  it('shows an error, not the empty state, when the results cannot be loaded', async () => {
    signIn();
    respond(null, 500);
    renderRoutes(routes, '/skills');

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be loaded/i);
    expect(screen.queryByRole('heading', { name: /no assessment evidence recorded/i })).not.toBeInTheDocument();
  });

  it('never imports an old browser-only result and tells the learner once', async () => {
    signIn(7);
    localStorage.setItem('qcaps_latest_assessment_result_7', JSON.stringify({ overallScore: 100, domainScores: [] }));
    respond([]);
    renderRoutes(routes, '/skills');

    expect(await screen.findByRole('heading', { name: /no assessment evidence recorded/i })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/cannot be verified/i);
    await userEvent.setup().click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(localStorage.getItem('qcaps_latest_assessment_result_7')).toBeNull();
  });

  // The page has no Unknown level yet: a domain with no evidence cannot be distinguished from a low score
  // (skillsTypes.generateSkillGapProfile falls back to a 0% gap). T1.6 introduces Unknown/unassessed.
  it.todo('shows Unknown, not 0%, for a competency with fewer than 3 scored items (T1.6)');
});
