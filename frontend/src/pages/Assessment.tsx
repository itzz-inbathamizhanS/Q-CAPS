import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentHeader } from '@/features/assessment/components/AssessmentHeader';
import { QuestionCard } from '@/features/assessment/components/QuestionCard';
import { AssessmentActions } from '@/features/assessment/components/AssessmentActions';
import { AssessmentReviewModal } from '@/features/assessment/components/AssessmentReviewModal';
import { AssessmentResult } from '@/features/assessment/components/AssessmentResult';
import type { AssessmentDomain, AssessmentQuestion, AssessmentSubmissionResult } from '@/features/assessment/assessmentTypes';
import { DIAGNOSTIC_MODULE_ID, toSubmissionResult } from '@/features/assessment/diagnostic';
import { clearLegacyLocalResult } from '@/utils/assessmentStorage';
import {
  fetchDiagnosticResults,
  QuizApiError,
  startQuizAttempt,
  submitQuizAnswers,
  type QuizAttempt,
} from '@/services/backendService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/** Server questions in the shape the assessment components render. Option ids are the positions shown. */
function toQuestions(attempt: QuizAttempt): AssessmentQuestion[] {
  return attempt.questions.map((q, i) => ({
    id: q.item_id,
    number: i + 1,
    domain: (q.domain ?? 'Cybersecurity Fundamentals') as AssessmentDomain,
    domainCode: (q.domain ?? '').toUpperCase(),
    question: q.prompt,
    options: q.options.map((text, position) => ({ id: String(position), text })),
  }));
}

type Load = { status: 'loading' } | { status: 'error'; message: string; needsLogin: boolean } | { status: 'ready' };

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmissionResult | null>(null);

  const begin = useCallback(() => {
    setLoad({ status: 'loading' });
    setAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionResult(null);
    setSubmitError(null);
    startQuizAttempt(DIAGNOSTIC_MODULE_ID)
      .then((a) => {
        setAttempt(a);
        setQuestions(toQuestions(a));
        setLoad({ status: 'ready' });
      })
      .catch((e: unknown) =>
        setLoad({
          status: 'error',
          message: e instanceof Error ? e.message : 'Could not load the diagnostic.',
          needsLogin: e instanceof QuizApiError && e.status === 401,
        }),
      );
  }, []);

  useEffect(begin, [begin]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleSubmit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // The server grades the attempt; unanswered questions count as incorrect.
      const payload = Object.entries(answers).map(([item_id, pos]) => ({ item_id, selected_position: Number(pos) }));
      await submitQuizAnswers(attempt.attempt_id, payload);
      const results = await fetchDiagnosticResults();
      const mine = results.find((r) => r.attempt_id === attempt.attempt_id);
      if (!mine) throw new Error('The graded result could not be loaded. It is saved; open Skills to see it.');
      clearLegacyLocalResult(); // a verified result now exists; the old browser-only one is obsolete
      setIsReviewOpen(false);
      setSubmissionResult(toSubmissionResult(mine));
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit the diagnostic.');
    } finally {
      setSubmitting(false);
    }
  };

  if (load.status === 'loading') {
    return (
      <Card variant="glass" padding="large" style={{ maxWidth: 720, margin: '60px auto', textAlign: 'center' }}>
        <p role="status">Preparing your diagnostic…</p>
      </Card>
    );
  }

  if (load.status === 'error') {
    return (
      <Card variant="glass" padding="large" style={{ maxWidth: 720, margin: '60px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>{load.needsLogin ? 'Sign in to take the diagnostic' : 'Diagnostic unavailable'}</h2>
        <p role="alert" style={{ color: 'var(--color-text-secondary)', margin: '8px 0 24px' }}>
          {load.needsLogin ? 'The diagnostic is scored on the server so your baseline counts.' : load.message}
        </p>
        <Button variant="primary" onClick={() => (load.needsLogin ? navigate('/login') : begin())}>
          {load.needsLogin ? 'Go to Sign In' : 'Try Again'}
        </Button>
      </Card>
    );
  }

  if (submissionResult) {
    return (
      <>
        {attempt?.attempt_purpose === 'diagnostic_post' && (
          <p role="note" style={{ maxWidth: 960, margin: '0 auto 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            This was a reassessment with the same question set as your first diagnostic, so part of any change can come
            from having seen the questions before (retest effect).
          </p>
        )}
        <AssessmentResult result={submissionResult} onRetake={begin} />
      </>
    );
  }

  return (
    <div className="assessment-wrapper">
      <AssessmentHeader currentQuestionNumber={currentQuestionIndex + 1} totalQuestions={totalQuestions} />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          selectedOptionId={selectedOptionId}
          onSelectOption={(optionId) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))}
        />
      )}

      {submitError && (
        <p role="alert" style={{ color: 'var(--color-error)', textAlign: 'right', margin: '8px 0' }}>
          {submitError}
        </p>
      )}

      <AssessmentActions
        hasPrevious={currentQuestionIndex > 0}
        hasNext={currentQuestionIndex < totalQuestions - 1}
        isAnswered={!!selectedOptionId}
        onPrevious={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1))}
        onReview={() => setIsReviewOpen(true)}
        onSubmit={handleSubmit}
      />

      <AssessmentReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        questions={questions}
        answers={answers}
        currentQuestionIndex={currentQuestionIndex}
        onJumpToQuestion={(idx) => setCurrentQuestionIndex(idx)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Assessment;
