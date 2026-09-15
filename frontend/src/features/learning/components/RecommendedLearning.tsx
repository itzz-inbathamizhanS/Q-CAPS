import React from 'react';
import { Sparkles } from 'lucide-react';
import { LearningModule } from '../learningTypes';
import { LearningModuleCard } from './LearningModuleCard';

interface RecommendedLearningProps {
  recommendedModules: LearningModule[];
  topPriorityReason?: string;
}

export const RecommendedLearning: React.FC<RecommendedLearningProps> = ({
  recommendedModules,
  topPriorityReason,
}) => {
  if (recommendedModules.length === 0) return null;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Adaptive Recommendation
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Recommended For You
          </h2>
          {topPriorityReason && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {topPriorityReason}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {recommendedModules.map((module) => (
          <LearningModuleCard key={module.id} module={module} featured />
        ))}
      </div>
    </section>
  );
};
