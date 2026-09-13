import React from 'react';
import { Key } from 'lucide-react';
import { AssessmentQuestion } from '../assessmentTypes';
import { AnswerOption } from './AnswerOption';

interface QuestionCardProps {
  question: AssessmentQuestion;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
}) => {
  return (
    <div className="assessment-question-card">
      <div className="question-header-row">
        <div className="question-domain-badge">
          <Key size={16} />
          <span>
            Q{question.number}. {question.domainCode}
          </span>
        </div>
        <h3 className="question-prompt">{question.question}</h3>
      </div>

      <div className="assessment-options-grid" role="radiogroup" aria-label={`Question ${question.number} options`}>
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
};
