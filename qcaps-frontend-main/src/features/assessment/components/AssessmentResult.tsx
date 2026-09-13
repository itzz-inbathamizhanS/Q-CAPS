import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AssessmentSubmissionResult } from '../assessmentTypes';

interface AssessmentResultProps {
  result: AssessmentSubmissionResult;
  onRetake: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  result,
  onRetake,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: 'Aligned' | 'Moderate Gap' | 'Critical Gap') => {
    switch (status) {
      case 'Aligned':
        return <Badge variant="success">Aligned</Badge>;
      case 'Moderate Gap':
        return <Badge variant="warning">Moderate Gap</Badge>;
      case 'Critical Gap':
      default:
        return <Badge variant="error">Critical Gap</Badge>;
    }
  };

  const getDomainColor = (percentage: number) => {
    if (percentage >= 75) return 'var(--color-emerald)';
    if (percentage >= 50) return 'var(--color-primary)';
    return 'var(--color-error)';
  };

  const criticalGaps = result.domainScores.filter((ds) => ds.status !== 'Aligned');

  return (
    <div className="assessment-wrapper">
      <Card variant="glass" padding="large" className="flex flex-col gap-8">
        {/* Header summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={22} color="var(--color-primary)" />
              <Badge variant="primary">DIAGNOSTIC BASELINE COMPLETE</Badge>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Capability Diagnostic Summary
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
              Evaluated {result.answeredCount} of {result.totalQuestions} questions across 4 core competency domains.
            </p>
          </div>

          {/* Overall score ring */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: 'var(--color-surface-low)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              minWidth: '140px',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-outline)', letterSpacing: '0.05em' }}>
              Overall Score
            </span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.1 }}>
              {result.overallScore}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {result.correctCount} / {result.totalQuestions} correct
            </span>
          </div>
        </div>

        {/* Domain-Level Competency Breakdown */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Domain-Level Competency Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.domainScores.map((ds, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-surface-dim)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {ds.domain}
                    </span>
                    <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      ({ds.correctCount}/{ds.totalQuestions} questions)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(ds.status)}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: getDomainColor(ds.percentage),
                        minWidth: '48px',
                        textAlign: 'right',
                      }}
                    >
                      {ds.percentage}%
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-surface-variant)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${ds.percentage}%`,
                      height: '100%',
                      backgroundColor: getDomainColor(ds.percentage),
                      borderRadius: '9999px',
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Skill Gaps Insight */}
        {criticalGaps.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(92, 75, 195, 0.06)',
              border: '1px solid rgba(92, 75, 195, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={20} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Targeted Learning Recommendations Generated
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.5 }}>
                Priority skill gaps identified in <strong>{criticalGaps.map((g) => g.domain).join(', ')}</strong>. Personalized curriculum modules have been queued in your Learning Path.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <Button
            variant="outline"
            size="md"
            leftIcon={<RotateCcw size={16} />}
            onClick={onRetake}
          >
            Retake Diagnostic
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/skills')}
            >
              View Skill Profile & Next Steps
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
