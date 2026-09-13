import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AssessmentActionsProps {
  hasPrevious: boolean;
  hasNext: boolean;
  isAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReview: () => void;
  onSubmit: () => void;
}

export const AssessmentActions: React.FC<AssessmentActionsProps> = ({
  hasPrevious,
  hasNext,
  isAnswered,
  onPrevious,
  onNext,
  onReview,
  onSubmit,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <div className="assessment-actions-bar">
        <div>
          <Button
            variant="outline"
            size="md"
            leftIcon={<ArrowLeft size={16} />}
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            Previous question
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            size="md"
            onClick={onReview}
          >
            Review answers
          </Button>

          {hasNext ? (
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={16} />}
              onClick={onNext}
            >
              Next question
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              rightIcon={<CheckCircle2 size={16} />}
              onClick={onSubmit}
              disabled={!isAnswered}
            >
              Complete Assessment
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-outline)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          className="hover:text-primary transition-colors"
        >
          <Flag size={14} />
          <span>Report issue with this question</span>
        </button>
      </div>
    </div>
  );
};
