import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AssessmentQuestion } from '../assessmentTypes';

interface AssessmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: AssessmentQuestion[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
  onJumpToQuestion: (index: number) => void;
  onSubmit: () => void;
}

export const AssessmentReviewModal: React.FC<AssessmentReviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  answers,
  currentQuestionIndex,
  onJumpToQuestion,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 24, 33, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card-hover)',
          maxWidth: '560px',
          width: '100%',
          padding: '24px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Review Assessment Answers
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {answeredCount} of {questions.length} questions completed
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Question Grid */}
        <p style={{ fontSize: '13px', color: 'var(--color-text-on-surface-variant)', marginBottom: '12px' }}>
          Click any question below to jump directly to it:
        </p>

        <div className="review-grid">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = currentQuestionIndex === idx;

            return (
              <button
                key={q.id}
                type="button"
                className={`review-tile ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => {
                  onJumpToQuestion(idx);
                  onClose();
                }}
              >
                <span>Q{q.number}</span>
                <span style={{ fontSize: '10px', marginTop: '2px' }}>
                  {isAnswered ? 'Answered' : 'Pending'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: allAnswered ? 'var(--color-emerald)' : 'var(--color-amber)' }}>
            {allAnswered ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{allAnswered ? 'All questions answered' : `${questions.length - answeredCount} pending`}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={onClose}>
              Back to Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onSubmit();
              }}
              disabled={answeredCount === 0}
            >
              Submit Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
