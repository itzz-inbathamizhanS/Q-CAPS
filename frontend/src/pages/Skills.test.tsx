import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiUrl, renderRoutes, signIn } from '@/test/render';
import { Skills } from './Skills';
import type { DiagnosticResult } from '@/services/backendService';
import type { SkillMatrix } from '@/features/skills/skillMatrix';

const routes = [{ path: '/skills', element: <Skills /> }];

const result: DiagnosticResult = {
  attempt_id: 'a1', module_id: 'DIAG-A', attempt_purpose: 'diagnostic_pre', graded_at: '2026-10-01T09:00:00Z',
  total_questions: 4, correct_answers: 2, score_percent: 50,
  domains: [
    { domain: 'PQC Fundamentals', total_questions: 2, correct_count: 0, percentage: 0 },
    { domain: 'Applied PQC', total_questions: 2, correct_count: 2, percentage: 100 },
  ],
};

const emptyMatrix: SkillMatrix = {
  competency_model_version: '1', levels_status: 'pilot-hypothesis', requirement_map_version: 'proposed-v1',
  requirement_map_status: 'proposed-unreviewed', rows: [],
};

const respond = (body: DiagnosticResult[] | null, status = 200, matrix: SkillMatrix | null = emptyMatrix, matrixStatus = 200) =>
  server.use(
    http.get(apiUrl('/diagnostic/results'), () => HttpResponse.json(body, { status })),
    http.get(apiUrl('/users/me/skill-matrix'), () => HttpResponse.json(matrix, { status: matrixStatus })),
  );

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

  it('shows Unknown and unassessed, not a low level or 0%, and links each driving finding to its closure page', async () => {
    signIn();
    respond([], 200, {
      ...emptyMatrix,
      rows: [
        {
          competency_code: 'PQC.6', competency_name: 'hybrid modes and crypto-agility', required_level: 'Proficient',
          demonstrated_level: 'Unknown', gap: 'unassessed', gap_class: 'unassessed', evidence_count: 1,
          last_evidence_at: null, knowledge_score: null, procedural_score: null,
          driving_findings: [{ finding_id: 'f-1', finding_type: 'pqc.kex.classical_only', title: 'Key exchange is not post-quantum protected',
            severity: 0.6, requirement_id: 'REQ.KEX.HYBRID', required_level: 'Proficient' }],
        },
        {
          competency_code: 'NET.4', competency_name: 'secure protocols', required_level: 'Proficient',
          demonstrated_level: 'Beginner', gap: 2, gap_class: 'high', evidence_count: 4,
          last_evidence_at: '2026-10-01T09:00:00Z', knowledge_score: 0.25, procedural_score: null, driving_findings: [],
        },
      ],
    });
    renderRoutes(routes, '/skills');

    const unknown = await screen.findByTitle(/fewer than 3 scored items/i);
    expect(unknown).toHaveTextContent('Unknown');
    expect(screen.getByText('Unassessed')).toBeInTheDocument();
    expect(screen.getByText('High gap')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Key exchange is not post-quantum protected' })).toHaveAttribute('href', '/closure/f-1');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('reports a matrix error separately from the diagnostic', async () => {
    signIn();
    respond([], 200, null, 500);
    renderRoutes(routes, '/skills');

    expect(await screen.findByRole('alert')).toHaveTextContent(/skill matrix could not be loaded/i);
    expect(await screen.findByRole('heading', { name: /no assessment evidence recorded/i })).toBeInTheDocument();
  });
});
