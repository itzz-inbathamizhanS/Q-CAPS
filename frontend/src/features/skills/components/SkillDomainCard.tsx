import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Shield, Key, Cpu, Terminal } from 'lucide-react';
import { SkillDomainAnalysis } from '../skillsTypes';

interface SkillDomainCardProps {
  analysis: SkillDomainAnalysis;
}

export const SkillDomainCard: React.FC<SkillDomainCardProps> = ({ analysis }) => {
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Cybersecurity Fundamentals':
        return <Shield size={20} />;
      case 'Cryptography Fundamentals':
        return <Key size={20} />;
      case 'PQC Fundamentals':
        return <Cpu size={20} />;
      case 'Applied PQC':
      default:
        return <Terminal size={20} />;
    }
  };

  const getCapabilityBadgeVariant = (capability: string) => {
    switch (capability) {
      case 'Strong Capability':
        return 'success';
      case 'Developing Capability':
        return 'primary';
      case 'Needs Improvement':
      default:
        return 'error';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Low Priority':
        return 'neutral';
      case 'Medium Priority':
        return 'secondary';
      case 'High Priority':
      default:
        return 'warning';
    }
  };

  return (
    <Card variant="glass" padding="normal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(84, 39, 230, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getDomainIcon(analysis.domain)}
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                {analysis.domain}
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {analysis.correctCount} / {analysis.totalQuestions} questions verified
              </span>
            </div>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 800,
              color: analysis.color,
            }}
          >
            {analysis.score}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '14px' }}>
          <ProgressBar progress={analysis.score} height={8} />
        </div>

        {/* Explanation */}
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          {analysis.explanation}
        </p>
      </div>

      {/* Badges footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '8px' }}>
        <Badge variant={getCapabilityBadgeVariant(analysis.capabilityLevel)}>
          {analysis.capabilityLevel}
        </Badge>
        <Badge variant={getPriorityBadgeVariant(analysis.priorityLevel)}>
          {analysis.priorityLevel}
        </Badge>
      </div>
    </Card>
  );
};
