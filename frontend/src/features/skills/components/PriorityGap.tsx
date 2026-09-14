import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SkillDomainAnalysis } from '../skillsTypes';

interface PriorityGapProps {
  topGap: SkillDomainAnalysis;
}

export const PriorityGap: React.FC<PriorityGapProps> = ({ topGap }) => {
  const navigate = useNavigate();

  return (
    <Card
      variant="glass"
      padding="large"
      style={{
        borderLeft: '4px solid var(--color-error)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(186, 26, 26, 0.1)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={20} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-error)', letterSpacing: '0.04em', fontWeight: 600 }}>
              Primary Skill Gap &bull; Immediate Action
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Next Focus: {topGap.domain}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="error">{topGap.priorityLevel}</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--color-error)' }}>
            {topGap.score}%
          </span>
        </div>
      </div>

      <p style={{ fontSize: '15px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.6 }}>
        {topGap.explanation}
      </p>

      {/* Suggested Focus Areas */}
      <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-dim)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-outline)', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
          Targeted Remediation Topics:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {topGap.suggestedFocusTopics.map((topic, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
              <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
        <Button
          variant="primary"
          size="md"
          rightIcon={<ArrowRight size={16} />}
          onClick={() => navigate('/learning')}
        >
          View Recommended Learning
        </Button>
      </div>
    </Card>
  );
};
