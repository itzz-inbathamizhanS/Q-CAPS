import React from 'react';
import { AssessmentOption } from '../assessmentTypes';

interface AnswerOptionProps {
  option: AssessmentOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  /** Roving tab stop: only one option of the group is in the Tab order. */
  tabbable: boolean;
  /** Arrow keys move the selection within the group (WAI-ARIA radio group pattern). */
  onArrow: (direction: 1 | -1) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isSelected,
  onSelect,
  tabbable,
  onArrow,
}) => {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={tabbable ? 0 : -1}
      data-option-id={option.id}
      className={`answer-option-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(option.id)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect(option.id);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          onArrow(1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          onArrow(-1);
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
