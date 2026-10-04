import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderRoutes, signIn } from '@/test/render';
import { Skills } from './Skills';
import type { AssessmentSubmissionResult } from '@/features/assessment/assessmentTypes';

const routes = [{ path: '/skills', element: <Skills /> }];

// Skills currently reads the diagnostic result from localStorage (plan fact F1). T1.5 moves the diagnostic to
// the server and T1.6 replaces this page's data source with the skill-matrix endpoint; these tests must then
// switch to MSW handlers.
describe('Skills', () => {
  it('shows the empty state, not a score, when no assessment exists', () => {
    signIn();
    renderRoutes(routes, '/skills');

    expect(screen.getByRole('heading', { name: /no assessment evidence recorded/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start diagnostic assessment/i })).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('renders the stored domain results when an assessment exists', () => {
    signIn(7);
    const result: AssessmentSubmissionResult = {
      totalQuestions: 4,
      answeredCount: 4,
      correctCount: 2,
      overallScore: 50,
      completedAt: '2026-10-01T09:00:00Z',
      domainScores: [
        { domain: 'PQC Fundamentals', totalQuestions: 2, correctCount: 0, percentage: 0, status: 'Critical Gap' },
        { domain: 'Applied PQC', totalQuestions: 2, correctCount: 2, percentage: 100, status: 'Aligned' },
      ],
    };
    localStorage.setItem('qcaps_latest_assessment_result_7', JSON.stringify(result));

    renderRoutes(routes, '/skills');

    expect(screen.queryByRole('heading', { name: /no assessment evidence recorded/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('PQC Fundamentals').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Applied PQC').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /retake diagnostic assessment/i })).toBeInTheDocument();
  });

  it("does not show another user's stored result", () => {
    localStorage.setItem(
      'qcaps_latest_assessment_result_99',
      JSON.stringify({ totalQuestions: 1, answeredCount: 1, correctCount: 1, overallScore: 100, completedAt: '2026-10-01T09:00:00Z', domainScores: [] }),
    );
    signIn(7);
    renderRoutes(routes, '/skills');

    expect(screen.getByRole('heading', { name: /no assessment evidence recorded/i })).toBeInTheDocument();
  });

  // The page has no Unknown level yet: a domain with no evidence cannot be distinguished from a low score
  // (skillsTypes.generateSkillGapProfile falls back to a 0% gap). T1.6 introduces Unknown/unassessed.
  it.todo('shows Unknown, not 0%, for a competency with fewer than 3 scored items (T1.6)');
});
