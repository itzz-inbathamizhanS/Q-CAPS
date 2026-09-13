import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface LearningHeaderProps {
  hasAssessmentEvidence: boolean;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  hasAssessmentEvidence,
}) => {
  return (
    <section className="dashboard-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="dashboard-title">Targeted Learning</h1>
          <p className="dashboard-subtitle">
            {hasAssessmentEvidence
              ? 'Personalized post-quantum cybersecurity curriculum targeted to resolve your verified diagnostic skill gaps.'
              : 'Explore the complete foundational and applied quantum-safe cybersecurity curriculum catalog.'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {hasAssessmentEvidence ? (
            <>
              <Sparkles size={14} color="var(--color-primary)" />
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Skill-Gap Adaptive Path</span>
            </>
          ) : (
            <>
              <BookOpen size={14} color="var(--color-outline)" />
              <span>Full Curriculum Catalog</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
