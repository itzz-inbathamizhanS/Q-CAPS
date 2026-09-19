import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Activity } from 'lucide-react';
import { SkillGapProfile } from '../skillsTypes';

interface CapabilitySummaryProps {
  profile: SkillGapProfile;
}

export const CapabilitySummary: React.FC<CapabilitySummaryProps> = ({ profile }) => {
  const getBadgeVariant = (capability: string) => {
    switch (capability) {
      case 'Strong Capability':
        return 'success';
      case 'Developing Capability':
        return 'primary';
      case 'Needs Improvement':
      default:
        return 'warning';
    }
  };

  return (
    <Card variant="glass" padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(84, 39, 230, 0.1)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-outline)', letterSpacing: '0.04em' }}>
              Q-CAPS Baseline Diagnostic
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              Demonstrated Capability Profile
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={getBadgeVariant(profile.overallCapability)}>
            {profile.overallCapability}
          </Badge>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '24px',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'var(--color-surface-dim)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ProgressRing progress={profile.overallScore} size={64} strokeWidth={4} progressColor="var(--color-primary)" />
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.1 }}>
              {profile.overallScore}%
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Overall Readiness
            </div>
          </div>
        </div>

        <p style={{ fontSize: '15px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.6, margin: 0 }}>
          {profile.overallInterpretation}
        </p>
      </div>
    </Card>
  );
};
