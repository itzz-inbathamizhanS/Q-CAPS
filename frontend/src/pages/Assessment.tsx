import React, { useState } from 'react';
import { assessmentQuestions } from '@/data/assessmentData';
import { AssessmentHeader } from '@/features/assessment/components/AssessmentHeader';
import { QuestionCard } from '@/features/assessment/components/QuestionCard';
import { AssessmentActions } from '@/features/assessment/components/AssessmentActions';
import { AssessmentReviewModal } from '@/features/assessment/components/AssessmentReviewModal';
import { AssessmentResult } from '@/features/assessment/components/AssessmentResult';
import {
  AssessmentDomain,
  AssessmentSubmissionResult,
  DomainScore,
} from '@/features/assessment/assessmentTypes';
import { saveAssessmentResult } from '@/utils/assessmentStorage';

export const Assessment: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<AssessmentSubmissionResult | null>(null);

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const domains: AssessmentDomain[] = [
      'Cybersecurity Fundamentals',
      'Cryptography Fundamentals',
      'PQC Fundamentals',
      'Applied PQC',
    ];

    let totalCorrect = 0;
    const domainScores: DomainScore[] = domains.map((domain) => {
      const domainQuestions = assessmentQuestions.filter(
        (q) => q.domain === domain
      );
      const correctInDomain = domainQuestions.filter(
        (q) => answers[q.id] === q.correctOptionId
      ).length;

      totalCorrect += correctInDomain;
      const percentage =
        domainQuestions.length > 0
          ? Math.round((correctInDomain / domainQuestions.length) * 100)
          : 0;

      let status: 'Aligned' | 'Moderate Gap' | 'Critical Gap' = 'Critical Gap';
      if (percentage >= 75) status = 'Aligned';
      else if (percentage >= 50) status = 'Moderate Gap';

      return {
        domain,
        totalQuestions: domainQuestions.length,
        correctCount: correctInDomain,
        percentage,
        status,
      };
    });

    const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

    const result: AssessmentSubmissionResult = {
      totalQuestions,
      answeredCount: Object.keys(answers).length,
      correctCount: totalCorrect,
      overallScore,
      domainScores,
      completedAt: new Date().toISOString(),
    };

    saveAssessmentResult(result);
    setSubmissionResult(result);
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setSubmissionResult(null);
  };

  if (isSubmitted && submissionResult) {
    return (
      <AssessmentResult
        result={submissionResult}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="assessment-wrapper">
      {/* Header & Progress */}
      <AssessmentHeader
        currentQuestionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
      />

      {/* Main Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        onSelectOption={handleSelectOption}
      />

      {/* Action Controls */}
      <AssessmentActions
        hasPrevious={currentQuestionIndex > 0}
        hasNext={currentQuestionIndex < totalQuestions - 1}
        isAnswered={!!selectedOptionId}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onReview={() => setIsReviewOpen(true)}
        onSubmit={handleSubmit}
      />

      {/* Review Answers Modal */}
      <AssessmentReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        questions={assessmentQuestions}
        answers={answers}
        currentQuestionIndex={currentQuestionIndex}
        onJumpToQuestion={(idx) => setCurrentQuestionIndex(idx)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Assessment;
