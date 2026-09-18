import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
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
  const navigate = useNavigate();
  
  return (
    <Card 
      variant={featured ? "glass" : "flat"}
      padding="large"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        border: featured ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
        boxShadow: featured ? '0 8px 24px rgba(84, 39, 230, 0.15)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {featured && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
        }} />
      )}

      <div style={{ flex: 1 }}>
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 600, 
              backgroundColor: 'var(--color-surface-dim)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {module.domain}
            </span>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 600, 
              backgroundColor: module.level === 'Beginner' ? 'rgba(34, 197, 94, 0.1)' 
                : module.level === 'Intermediate' ? 'rgba(234, 179, 8, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              color: module.level === 'Beginner' ? '#16a34a' 
                : module.level === 'Intermediate' ? '#ca8a04' 
                : '#dc2626',
            }}>
              {module.level}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
          {module.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'var(--color-text-on-surface-variant)', lineHeight: 1.5, marginBottom: '16px' }}>
          {module.subtitle || 'Learn the foundational concepts and skills needed for this curriculum track.'}
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
            {module.learningObjectives?.map((obj, idx) => (
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
            <span>{module.estimatedMinutes || 45} min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} />
            <span>{module.sections?.length || 0} Lessons</span>
          </div>
          <div>
            <span>Progress: {module.progressPercentage || 0}%</span>
          </div>
        </div>

        <ProgressBar progress={module.progressPercentage || 0} height={6} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            rightIcon={<Play size={14} fill="currentColor" />}
            onClick={() => navigate(`/learning/${module.id}`)}
          >
            Start Module
          </Button>
        </div>
      </div>
    </Card>
  );
};
