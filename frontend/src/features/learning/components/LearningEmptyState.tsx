import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ArrowRight, FileQuestion } from 'lucide-react';

export const LearningEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card
      variant="glass"
      padding="large"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderLeft: '4px solid var(--color-primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '640px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(84, 39, 230, 0.1)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={24} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="primary">COMPLETE YOUR BASELINE</Badge>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Unlock Personalized Learning Recommendations
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Complete the initial Q-CAPS diagnostic assessment to identify your exact skill gaps and generate a prioritized curriculum path.
          </p>
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        leftIcon={<FileQuestion size={16} />}
        rightIcon={<ArrowRight size={16} />}
        onClick={() => navigate('/assessment')}
      >
        Start Diagnostic Assessment
      </Button>
    </Card>
  );
};
