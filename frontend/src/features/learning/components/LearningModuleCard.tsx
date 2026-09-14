import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Clock, BookOpen, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { LearningModule } from '../learningTypes';

interface LearningModuleCardProps {
  module: LearningModule;
  featured?: boolean;
}

export const LearningModuleCard: React.FC<LearningModuleCardProps> = ({
  module,
  featured = false,
}) => {
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'secondary';
      case 'Advanced':
      default:
        return 'neutral';
    }
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'High Priority':
        return 'error';
      case 'Medium Priority':
        return 'warning';
      case 'Low Priority':
      default:
        return 'neutral';
    }
  };

  return (
    <Card
      variant="glass"
      padding="normal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        borderLeft: featured ? '4px solid var(--color-primary)' : undefined,
        position: 'relative',
      }}
    >
      <div>
        {/* Badges Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge variant="primary">{module.domain}</Badge>
            <Badge variant={getLevelBadgeVariant(module.level)}>{module.level}</Badge>
          </div>

          {module.priorityLevel && (
            <Badge variant={getPriorityBadgeVariant(module.priorityLevel)}>
              {module.priorityLevel}
            </Badge>
          )}
        </div>

        {/* Title and Subtitle */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: '4px' }}>
          {module.title}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
          {module.subtitle}
        </p>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.5, marginBottom: '16px' }}>
          {module.description}
        </p>

        {/* Explainability Reason if recommended */}
        {module.recommendationReason && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(84, 39, 230, 0.05)',
              border: '1px solid rgba(84, 39, 230, 0.15)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.4 }}>
              {module.recommendationReason}
            </span>
          </div>
        )}

        {/* Learning Objectives */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-outline)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Core Objectives:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {module.objectives.map((obj, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={13} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area: Meta, Progress, CTA */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            <span>{module.durationMinutes} min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} />
            <span>{module.lessonCount} Lessons</span>
          </div>
          <div>
            <span>Progress: {module.progressPercentage}%</span>
          </div>
        </div>

        <ProgressBar progress={module.progressPercentage} height={6} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            rightIcon={<Play size={14} fill="currentColor" />}
            title="Lesson player planned for subsequent phase"
          >
            Start Module
          </Button>
        </div>
      </div>
    </Card>
  );
};
