import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface AssessmentHeaderProps {
  currentQuestionNumber: number;
  totalQuestions: number;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  currentQuestionNumber,
  totalQuestions,
}) => {
  const progressPercentage = Math.round((currentQuestionNumber / totalQuestions) * 100);

  return (
    <div className="assessment-header">
      <div>
        <h2 className="assessment-title">Module assessment</h2>
        <p className="assessment-subtitle">Baseline Diagnostic v2.4</p>
      </div>

      <div className="assessment-progress-wrapper">
        <div className="assessment-progress-labels">
          <span>Progress</span>
          <span>
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
        </div>
        <ProgressBar progress={progressPercentage} height={8} />
      </div>
    </div>
  );
};
