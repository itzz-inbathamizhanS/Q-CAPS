import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileQuestion, ArrowRight, ShieldAlert } from 'lucide-react';

export const SkillsEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto', width: '100%' }}>
      <Card variant="glass" padding="large" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(84, 39, 230, 0.1)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <Badge variant="neutral">EVIDENCE REQUIRED</Badge>
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          No Assessment Evidence Recorded
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '520px', lineHeight: 1.6, marginBottom: '28px' }}>
          Q-CAPS generates personalized skill profiles and identifies readiness gaps using diagnostic assessment data. Complete the initial baseline assessment to unlock your competency matrix.
        </p>

        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight size={18} />}
          onClick={() => navigate('/assessment')}
          leftIcon={<FileQuestion size={18} />}
        >
          Start Diagnostic Assessment
        </Button>
      </Card>
    </div>
  );
};
