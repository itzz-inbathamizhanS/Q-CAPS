import { useEffect, useState } from 'react';
import { fetchDiagnosticResults, type DiagnosticResult } from '@/services/backendService';
import type { AssessmentDomain, AssessmentSubmissionResult, DomainScore } from './assessmentTypes';

/** The server-side diagnostic instrument (content/Quizzes/Diagnostic). */
export const DIAGNOSTIC_MODULE_ID = 'DIAG-A';

const KNOWN_DOMAINS: AssessmentDomain[] = ['Cybersecurity Fundamentals', 'Cryptography Fundamentals', 'PQC Fundamentals', 'Applied PQC'];

/** Display band for a domain percentage. Presentation only: the score itself comes from the server. */
const domainStatus = (percentage: number): DomainScore['status'] =>
  percentage >= 75 ? 'Aligned' : percentage >= 50 ? 'Moderate Gap' : 'Critical Gap';

/** Shape a server-graded diagnostic result for the existing result and skill-profile views. */
export function toSubmissionResult(r: DiagnosticResult): AssessmentSubmissionResult {
  const domainScores: DomainScore[] = r.domains
    .filter((d): d is typeof d & { domain: AssessmentDomain } => KNOWN_DOMAINS.includes(d.domain as AssessmentDomain))
    .map((d) => ({
      domain: d.domain,
      totalQuestions: d.total_questions,
      correctCount: d.correct_count,
      percentage: d.percentage,
      status: domainStatus(d.percentage),
    }));
  return {
    totalQuestions: r.total_questions,
    answeredCount: r.total_questions,
    correctCount: r.correct_answers,
    overallScore: Math.round(r.score_percent),
    domainScores,
    completedAt: r.graded_at,
  };
}

export type DiagnosticState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; results: DiagnosticResult[] };

/** Load the learner's diagnostic results from the server; loading, error and "none yet" stay distinct. */
export function useDiagnosticResults(): DiagnosticState {
  const [state, setState] = useState<DiagnosticState>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    fetchDiagnosticResults()
      .then((results) => live && setState({ status: 'ready', results }))
      .catch((e: unknown) => live && setState({ status: 'error', message: e instanceof Error ? e.message : 'Request failed' }));
    return () => {
      live = false;
    };
  }, []);
  return state;
}
