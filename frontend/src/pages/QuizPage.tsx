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
import { quizzesData } from '@/data/quizzesData';
import { curriculumModules } from '@/data/curriculumData';
import { badgesData } from '@/data/badgesData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

<<<<<<< HEAD
interface ShuffledOption {
  text: string;
  originalIndex: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

=======
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
export const QuizPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { completeQuiz } = useCurriculumStore();

  const quiz = moduleId ? quizzesData[moduleId] : null;
  const currentMod = moduleId
    ? curriculumModules.find((m) => m.id === moduleId)
    : null;

  // Find badge for this quiz
  const matchingBadge = badgesData.find((b) =>
    moduleId && b.unlockTrigger.toLowerCase().includes(moduleId.toLowerCase())
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<
    Array<{ selected: number; isCorrect: boolean }>
  >([]);
<<<<<<< HEAD
  const [shuffledOptionsList, setShuffledOptionsList] = useState<ShuffledOption[][]>([]);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const passingScorePercent = quiz?.passingScorePercent || 70;

  // Reset & re-shuffle options if moduleId or quiz changes
=======

  // Reset if moduleId changes
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectCount(0);
    setQuizFinished(false);
    setAnswersHistory([]);
<<<<<<< HEAD
    if (quiz?.questions) {
      setShuffledOptionsList(
        quiz.questions.map((q) =>
          shuffleArray(q.options.map((text, originalIndex) => ({ text, originalIndex })))
        )
      );
    }
  }, [moduleId, quiz]);
=======
  }, [moduleId]);
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14

  if (!quiz || !currentMod) {
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

<<<<<<< HEAD
  const currentOptions: ShuffledOption[] =
    shuffledOptionsList[currentIndex] ||
    (currentQuestion
      ? currentQuestion.options.map((text, originalIndex) => ({ text, originalIndex }))
      : []);
=======
  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const passingScorePercent = quiz.passingScorePercent || 70;
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
<<<<<<< HEAD
    if (selectedOption === null || isAnswerSubmitted || !currentQuestion) return;
    const selectedOriginalIndex = currentOptions[selectedOption]?.originalIndex;
    const isCorrect = selectedOriginalIndex === currentQuestion.correctIndex;
=======
    if (selectedOption === null || isAnswerSubmitted) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
    setIsAnswerSubmitted(true);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    setAnswersHistory((prev) => [...prev, { selected: selectedOption, isCorrect }]);
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished!
      const finalCorrect = correctCount;
      const scorePercent = Math.round((finalCorrect / totalQuestions) * 100);
      setQuizFinished(true);

      // Trigger store completion
      completeQuiz(
        quiz.moduleId,
        scorePercent,
        matchingBadge?.name,
        currentMod.xp
      );
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCorrectCount(0);
    setQuizFinished(false);
    setAnswersHistory([]);
<<<<<<< HEAD
    if (quiz?.questions) {
      setShuffledOptionsList(
        quiz.questions.map((q) =>
          shuffleArray(q.options.map((text, originalIndex) => ({ text, originalIndex })))
        )
      );
    }
=======
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
  };

  const finalScorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = finalScorePercent >= passingScorePercent;

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
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: '#94a3b8',
                    marginTop: '2px'
                  }}
                >
                  id: <code>{currentQuestion.id}</code>
                </div>
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
<<<<<<< HEAD
                {currentOptions.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrectAnswer = opt.originalIndex === currentQuestion.correctIndex;
=======
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrectAnswer = optIdx === currentQuestion.correctIndex;
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14

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
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
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
<<<<<<< HEAD
                        {opt.text}
=======
                        {optionText}
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
                      </span>

                      {isAnswerSubmitted && (
                        <div>
                          {isCorrectAnswer && <CheckCircle2 size={20} color="#10b981" />}
                          {isSelected && !isCorrectAnswer && <XCircle size={20} color="#ef4444" />}
                        </div>
                      )}
                    </div>
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
                    color: '#0369a1',
                    marginBottom: '4px'
                  }}
                >
                  Explanation
                </div>
<<<<<<< HEAD
                <div style={{ fontSize: '14px', color: 'var(--color-text-primary, #1e293b)', lineHeight: 1.5 }}>
=======
                <div style={{ fontSize: '14px', color: 'var(--color-surface)', lineHeight: 1.5 }}>
>>>>>>> f062018aa6ab8ffdcaf3ff4ae6d74c3c28808d14
                  {currentQuestion.explanation}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  style={{ minWidth: '140px' }}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="primary"
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
              You answered <strong>{correctCount}</strong> of <strong>{totalQuestions}</strong> questions correctly.
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
                  <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600, textTransform: 'uppercase' }}>
                    Badge Unlocked!
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-surface)' }}>
                    {matchingBadge.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    +{currentMod.xp} XP added to your Common User Profile
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
