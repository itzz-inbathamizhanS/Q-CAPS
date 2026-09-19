import React from 'react';
import { BookOpen, Sparkles, Zap, Flame } from 'lucide-react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';

interface LearningHeaderProps {
  hasAssessmentEvidence: boolean;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  hasAssessmentEvidence,
}) => {
  const { streakDays, totalXp } = useCurriculumStore();
  const currentLevel = Math.floor(totalXp / 500) + 1;

  return (
    <div className="learning-page-header">
      <div className="learning-header-inner">
        {/* Left: Titles */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          <div className="learning-breadcrumb">
            <span>Q-CAPS</span>
            <span className="learning-breadcrumb-sep">/</span>
            <span className="learning-breadcrumb-active">Learning</span>
          </div>

          {/* Adaptive / Catalog badge */}
          <div className="learning-adaptive-badge">
            {hasAssessmentEvidence ? (
              <>
                <Sparkles size={12} />
                <span>Skill-Adaptive Path Active</span>
              </>
            ) : (
              <>
                <BookOpen size={12} />
                <span>Full Curriculum Catalog</span>
              </>
            )}
          </div>

          <h1 className="learning-page-title">Curriculum Hub</h1>
          <p className="learning-page-subtitle">
            {hasAssessmentEvidence
              ? 'Your personalized path to quantum-safe cybersecurity, targeted to your verified skill gaps.'
              : 'Structured progression from foundations to enterprise quantum security. Begin with Track A.'}
          </p>
        </div>

        {/* Right: Progress Cluster */}
        <div className="learning-progress-cluster">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'var(--color-primary-fixed)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--color-outline)',
                fontFamily: 'var(--font-mono)',
              }}>
                Operator Level
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}>
                Level {currentLevel}
              </div>
            </div>
          </div>

          <div className="learning-stat-row">
            <div className="learning-stat-item">
              <span className="learning-stat-label">Total XP</span>
              <span className="learning-stat-value learning-stat-value--violet">
                {totalXp.toLocaleString()}
              </span>
            </div>
            <div className="learning-stat-item">
              <span className="learning-stat-label">Streak</span>
              <span className="learning-stat-value learning-stat-value--amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={16} />
                {streakDays}d
              </span>
            </div>
            <div className="learning-stat-item">
              <span className="learning-stat-label">Next Lv.</span>
              <span className="learning-stat-value" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {500 - (totalXp % 500)} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
