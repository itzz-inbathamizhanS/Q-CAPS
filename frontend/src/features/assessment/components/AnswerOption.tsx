import React from 'react';
import { AssessmentOption } from '../assessmentTypes';

interface AnswerOptionProps {
  option: AssessmentOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      className={`answer-option-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(option.id)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect(option.id);
        }
      }}
    >
      <div className="radio-circle">
        <div className="radio-dot" />
      </div>
      <span className="answer-text">{option.text}</span>
    </div>
  );
};
