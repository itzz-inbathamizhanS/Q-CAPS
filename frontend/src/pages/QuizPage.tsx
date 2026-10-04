// src/pages/QuizPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { curriculumModules } from '@/data/curriculumData';
import { badgesData } from '@/data/badgesData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { fetchActivityProgress } from '@/services/activityApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  startQuizAttempt,
  answerQuizQuestion,
  finishQuizAttempt,
  QuizApiError,
  type QuizAttempt,
  type QuizAnswerFeedback,
  type QuizAttemptResult,
} from '@/services/backendService';

interface DisplayOption {
  text: string;
  position: number; // position shown to the learner; the server maps it to the real option
}

export const QuizPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const applyActivityProgress = useCurriculumStore((st) => st.applyActivityProgress);
  const completedModules = useCurriculumStore((s) => s.completedModules);

  const currentMod = moduleId
    ? curriculumModules.find((m) => m.id === moduleId)
    : null;
  // Same rule as the module overview: a quiz opens once its prerequisite modules are complete.
  const missingPrereqs = currentMod
    ? currentMod.prerequisites.filter((p) => !completedModules.includes(p))
    : [];
  const locked = !!currentMod && !completedModules.includes(currentMod.id) && missingPrereqs.length > 0;

  // Find badge for this quiz
  const matchingBadge = badgesData.find((b) =>
    moduleId && b.unlockTrigger.toLowerCase().includes(moduleId.toLowerCase())
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<
    Array<{ selected: number; isCorrect: boolean }>
  >([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [attemptNonce, setAttemptNonce] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [feedback, setFeedback] = useState<QuizAnswerFeedback | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const passingScorePercent = attempt?.passing_score_percent ?? 70;

  // Ask the server for a fresh form whenever the module changes or the learner retries.
  useEffect(() => {
    if (!moduleId || locked) return;
    let cancelled = false;
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
    setAnswersHistory([]);
    setFeedback(null);
    setResult(null);
    setActionError(null);
    setAttempt(null);
    setLoadState('loading');
    startQuizAttempt(moduleId)
      .then((a) => {
        if (cancelled) return;
        setAttempt(a);
        setLoadState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError({
          status: e instanceof QuizApiError ? e.status : 0,
          message: e instanceof Error ? e.message : 'Could not load the quiz.',
        });
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, attemptNonce, locked]);

  if (!currentMod) {
    return (
      <div style={{ maxWidth: '720px', margin: '60px auto', textAlign: 'center' }}>
        <Card variant="glass" padding="large">
          <ShieldAlert size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Quiz Not Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            No assessment found for module ID: <code>{moduleId}</code>
          </p>
          <Button variant="primary" onClick={() => navigate('/learning')}>
            Return to Curriculum Map
          </Button>
        </Card>
      </div>
    );
  }

  if (locked) {
    const titleOf = (id: string) => {
      const m = curriculumModules.find((x) => x.id === id);
      return m ? `${m.code} ${m.title}` : id;
    };
    return (
      <div style={{ maxWidth: '720px', margin: '60px auto', textAlign: 'center' }}>
        <Card variant="glass" padding="large">
          <ShieldAlert size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {currentMod.code} quiz is locked
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Complete the prerequisite modules first:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 24px' }}>
            {missingPrereqs.map((p) => (
              <li key={p} style={{ margin: '4px 0' }}>
                <Link to={`/learning/${p}`} style={{ color: 'var(--color-primary)' }}>{titleOf(p)}</Link>
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => navigate('/curriculum')}>
            Back to curriculum
          </Button>
        </Card>
      </div>
    );
  }

  if (loadState !== 'ready' || !attempt) {
    const needsLogin = loadState === 'error' && loadError?.status === 401;
    return (
      <div style={{ maxWidth: '720px', margin: '60px auto', textAlign: 'center' }}>
        <Card variant="glass" padding="large">
          {loadState === 'loading' ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Preparing your quiz…</p>
          ) : (
            <>
              <ShieldAlert size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {needsLogin ? 'Sign in to take this quiz' : 'Quiz unavailable'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                {needsLogin
                  ? 'Quizzes are graded on the server so your results count. Please sign in and try again.'
                  : loadError?.message}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="primary" onClick={() => (needsLogin ? navigate('/login') : setAttemptNonce((n) => n + 1))}>
                  {needsLogin ? 'Go to Sign In' : 'Try Again'}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/learning')}>
                  Back to Curriculum
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  const currentOptions: DisplayOption[] = currentQuestion
    ? currentQuestion.options.map((text, position) => ({ text, position }))
    : [];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const fb = await answerQuizQuestion(attempt.attempt_id, currentQuestion.item_id, selectedOption);
      setFeedback(fb);
      setIsAnswerSubmitted(true);
      setAnswersHistory((prev) => [...prev, { selected: selectedOption, isCorrect: fb.correct === true }]);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not record your answer.');
    } finally {
      setBusy(false);
    }
  };

  const handleNextQuestion = async () => {
    if (busy) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setFeedback(null);
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      // The server grades the attempt; the page only displays what it returns.
      const res = await finishQuizAttempt(attempt.attempt_id);
      setResult(res);
      setQuizFinished(true);
      // XP, completion and the module badge are decided by the server; mirror its record.
      void fetchActivityProgress().then(applyActivityProgress).catch(() => undefined);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not submit the quiz.');
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => setAttemptNonce((n) => n + 1);

  const displayCorrectCount = result?.correct_answers ?? 0;
  const finalScorePercent = result ? Math.round(result.score_percent) : 0;
  const isPassed = result?.passed ?? false;

  // Find next module
  const currentModIndex = curriculumModules.findIndex((m) => m.id === currentMod.id);
  const nextMod =
    currentModIndex >= 0 && currentModIndex < curriculumModules.length - 1
      ? curriculumModules[currentModIndex + 1]
      : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <Link
          to={`/learning/${currentMod.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          <ChevronLeft size={16} />
          <span>Exit to {currentMod.code} Lesson</span>
        </Link>

        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Pass benchmark: <strong style={{ color: 'var(--color-emerald)' }}>{passingScorePercent}%</strong>
        </div>
      </div>

      {/* Main Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
        }}
      >
        {!quizFinished ? (
          <>
            {/* Region A: Progress Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--color-border, #f1f5f9)',
                marginBottom: '28px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {currentMod.code} Knowledge Check · Question {currentIndex + 1} of {totalQuestions}
                </span>
              </div>

              {/* Progress Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {questions.map((_, dotIdx) => {
                  const isDone = dotIdx < currentIndex;
                  const isCurrent = dotIdx === currentIndex;
                  const hist = answersHistory[dotIdx];
                  return (
                    <div
                      key={dotIdx}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isDone
                          ? hist?.isCorrect
                            ? 'var(--color-emerald)'
                            : 'var(--color-error)'
                          : isCurrent
                          ? 'var(--color-primary)'
                          : '#e2e8f0',
                        transition: 'all 0.2s ease',
                        transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Region B: One Question at a Time */}
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #0f172a)',
                  lineHeight: 1.5,
                  marginBottom: '24px'
                }}
              >
                {currentQuestion.prompt}
              </h2>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentOptions.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrectAnswer = isAnswerSubmitted && feedback?.correct_position === opt.position;

                  let rowBorder = '1px solid var(--color-border, #e2e8f0)';
                  let rowBg = 'var(--color-surface, #ffffff)';
                  let leftBorder = '4px solid transparent';

                  if (isAnswerSubmitted) {
                    if (isCorrectAnswer) {
                      rowBorder = '1px solid rgba(16, 185, 129, 0.4)';
                      rowBg = 'rgba(16, 185, 129, 0.06)';
                      leftBorder = '4px solid #10b981';
                    } else if (isSelected && !isCorrectAnswer) {
                      rowBorder = '1px solid rgba(239, 68, 68, 0.4)';
                      rowBg = 'rgba(239, 68, 68, 0.06)';
                      leftBorder = '4px solid #ef4444';
                    }
                  } else if (isSelected) {
                    rowBorder = '1px solid var(--color-primary, #5427e6)';
                    rowBg = 'rgba(84, 39, 230, 0.04)';
                    leftBorder = '4px solid var(--color-primary, #5427e6)';
                  }

                  return (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isAnswerSubmitted}
                      aria-pressed={isSelected}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        font: 'inherit',
                        color: 'inherit',
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: rowBg,
                        border: rowBorder,
                        borderLeft: leftBorder,
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected && !isAnswerSubmitted ? '0 2px 8px rgba(84, 39, 230, 0.1)' : 'none'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '15px',
                          color: 'var(--color-text-primary, #1e293b)',
                          lineHeight: 1.4,
                          fontWeight: isSelected ? 500 : 400
                        }}
                      >
                        {opt.text}
                      </span>

                      {isAnswerSubmitted && (
                        <div>
                          {isCorrectAnswer && <CheckCircle2 size={20} color="#10b981" />}
                          {isSelected && !isCorrectAnswer && <XCircle size={20} color="#ef4444" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation Slide-in after submission */}
            {isAnswerSubmitted && (
              <div
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '28px',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-primary, #0369a1)',
                    marginBottom: '4px'
                  }}
                >
                  Explanation
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-primary, #1e293b)', lineHeight: 1.5 }}>
                  {feedback?.explanation}
                </div>
              </div>
            )}

            {actionError && (
              <p role="alert" style={{ color: '#b91c1c', fontSize: '14px', marginBottom: '12px', textAlign: 'right' }}>
                {actionError}
              </p>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  disabled={selectedOption === null || busy}
                  onClick={handleSubmitAnswer}
                  style={{ minWidth: '140px' }}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={handleNextQuestion}
                  style={{ minWidth: '140px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{currentIndex < totalQuestions - 1 ? 'Continue →' : 'View Results →'}</span>
                </Button>
              )}
            </div>
          </>
        ) : (
          /* Region C: Final Score Screen */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              {isPassed ? (
                <Award size={36} color="#10b981" />
              ) : (
                <RotateCcw size={36} color="#f59e0b" />
              )}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {isPassed ? 'Congratulations! Quiz Passed' : 'Not Quite There Yet'}
            </h2>

            <div
              style={{
                fontSize: '42px',
                fontWeight: 800,
                color: isPassed ? 'var(--color-emerald)' : 'var(--color-amber)',
                marginTop: '10px'
              }}
            >
              {finalScorePercent}%
            </div>

            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              You answered <strong>{displayCorrectCount}</strong> of <strong>{totalQuestions}</strong> questions correctly.
              (Passing benchmark: {passingScorePercent}%)
            </p>

            {/* Badge unlocked celebration banner */}
            {isPassed && matchingBadge && (
              <div
                style={{
                  margin: '28px auto',
                  maxWidth: '480px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Badge Unlocked!
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {matchingBadge.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {/* XP is awarded by the server (first correct answer per question), not the module's nominal XP. */}
                    {result && result.xp_awarded > 0
                      ? `+${result.xp_awarded} XP added to your profile`
                      : 'No new XP: you already earned it for these questions'}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '32px',
                flexWrap: 'wrap'
              }}
            >
              {isPassed ? (
                <>
                  {nextMod ? (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/learning/${nextMod.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>Continue to {nextMod.code}: {nextMod.title}</span>
                      <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => navigate('/learning')}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>Return to Curriculum Map</span>
                      <ArrowRight size={16} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/learning/${currentMod.id}`)}
                  >
                    Review Lesson
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleRetry}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <RotateCcw size={16} />
                    <span>Retry Quiz</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/learning/${currentMod.id}`)}
                  >
                    Review Lesson Material
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
