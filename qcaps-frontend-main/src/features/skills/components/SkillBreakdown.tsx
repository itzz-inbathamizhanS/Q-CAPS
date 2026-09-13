import React from 'react';
import { SkillDomainAnalysis } from '../skillsTypes';
import { SkillDomainCard } from './SkillDomainCard';

interface SkillBreakdownProps {
  domains: SkillDomainAnalysis[];
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ domains }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Domain-Specific Competency Breakdown
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Empirical score and priority classification across 4 cybersecurity & PQC dimensions
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {domains.map((analysis) => (
          <SkillDomainCard key={analysis.domain} analysis={analysis} />
        ))}
      </div>
    </div>
  );
};
