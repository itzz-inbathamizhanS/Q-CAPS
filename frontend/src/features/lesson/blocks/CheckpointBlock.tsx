import React, { useState } from 'react';
import { checkCheckpoint, LessonApiError } from '../lessonApi';
import type { CheckpointBlockData, CheckpointResult } from '../lessonTypes';

interface Props {
  block: CheckpointBlockData;
  sectionId: number;
  preview?: boolean;
  /** Called when the server confirms a correct answer. */
  onPassed?: (sectionCompleted: boolean) => void;
}

/** Answers are graded by the backend; nothing here knows the correct option. */
export const CheckpointBlock: React.FC<Props> = ({ block, sectionId, preview = false, onPassed }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<CheckpointResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = async (index: number) => {
    if (pending || result?.correct) return;
    setPicked(index);
    if (preview) {
      setError('Preview only: answers are checked by the server once the section is published.');
      return;
    }
    setResult(null);
    setError(null);
    setPending(true);
    try {
      const res = await checkCheckpoint(sectionId, block.id, index);
      setResult(res);
      if (res.correct) onPassed?.(res.section_completed);
    } catch (err) {
      if (err instanceof LessonApiError && err.status === 401) {
        setError('Your session has expired. Sign in again to check your answer.');
      } else if (err instanceof LessonApiError && err.status === 429) {
        setError(err.message); // "Too many attempts. Try again in N seconds."
      } else {
        setError('Could not check your answer. Try again.');
      }
    } finally {
      setPending(false);
    }
  };

  const stateOf = (i: number) => {
    if (picked !== i || !result) return '';
    return result.correct ? 'ls-option--correct' : 'ls-option--wrong';
  };

  return (
    <section className="ls-card ls-checkpoint" aria-labelledby={`cp-${block.id}`}>
      <div className="ls-eyebrow">CHECKPOINT</div>
      <h2 id={`cp-${block.id}`} className="ls-card-title ls-card-title--question">
        {block.question}
      </h2>
      <div className="ls-options" role="group" aria-labelledby={`cp-${block.id}`}>
        {block.options.map((label, i) => (
          <button
            key={label + i}
            type="button"
            className={`ls-option ${stateOf(i)}`}
            onClick={() => choose(i)}
            disabled={pending || result?.correct === true}
            aria-pressed={picked === i}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ls-feedback" aria-live="polite">
        {pending && <span className="ls-muted">Checking...</span>}
        {error && <span className="ls-feedback--wrong">{error}</span>}
        {result && result.correct && (
          <span className="ls-feedback--correct">
            <strong>Correct.</strong> {result.explanation}
          </span>
        )}
        {result && !result.correct && (
          <span className="ls-feedback--wrong">Not quite. Pick another option and try again.</span>
        )}
      </div>
    </section>
  );
};
