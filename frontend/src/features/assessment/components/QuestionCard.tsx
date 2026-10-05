import React, { useRef } from 'react';
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
  const groupRef = useRef<HTMLDivElement>(null);
  const ids = question.options.map((o) => o.id);
  const tabStop = selectedOptionId ?? ids[0];
  const move = (from: string, direction: 1 | -1) => {
    const next = ids[(ids.indexOf(from) + direction + ids.length) % ids.length];
    onSelectOption(next);
    groupRef.current?.querySelector<HTMLElement>(`[data-option-id="${next}"]`)?.focus();
  };
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

      <div ref={groupRef} className="assessment-options-grid" role="radiogroup" aria-label={`Question ${question.number}: ${question.question}`}>
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            onSelect={onSelectOption}
            tabbable={option.id === tabStop}
            onArrow={(direction) => move(option.id, direction)}
          />
        ))}
      </div>
    </div>
  );
};
