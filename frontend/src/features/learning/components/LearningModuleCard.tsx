import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, BookOpen, ArrowRight, Lock } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LearningModule } from '../learningTypes';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { curriculumModules } from '@/data/curriculumData';

interface LearningModuleCardProps {
  module: LearningModule;
  featured?: boolean;
  trackAccentColor?: string;
}

export const LearningModuleCard: React.FC<LearningModuleCardProps> = ({
  module,
  featured = false,
  trackAccentColor,
}) => {
  const navigate = useNavigate();
  const { isModuleUnlocked, isModuleCompleted } = useCurriculumStore();

  const isUnlocked = isModuleUnlocked(module.id);
  const isCompleted = isModuleCompleted(module.id);
  const isInProgress = isUnlocked && !isCompleted && module.progressPercentage > 0;

  let statusVariant: 'completed' | 'inprogress' | 'available' | 'locked' = 'available';
  if (isCompleted) statusVariant = 'completed';
  else if (!isUnlocked) statusVariant = 'locked';
  else if (isInProgress) statusVariant = 'inprogress';

  const statusLabels: Record<typeof statusVariant, string> = {
    completed: '✓ Completed',
    inprogress: '● In Progress',
    available: '→ Available',
    locked: '🔒 Locked',
  };

  // Find prerequisite names for locked modules
  const prereqNames = module.prerequisites
    .map(prereqId => {
      const prereq = curriculumModules.find(m => m.id === prereqId);
      return prereq ? `${prereq.code} — ${prereq.title}` : prereqId;
    })
    .slice(0, 2); // Show max 2 prereqs

  const accentColor = trackAccentColor ?? 'var(--color-primary)';

  const handleAction = () => {
    if (!isUnlocked) return;
    navigate(`/learning/${module.id}`);
  };

  return (
    <div className={`module-card${statusVariant === 'locked' ? ' module-card--locked' : ''}${featured ? ' module-card--featured' : ''}`}>
      {/* Thin accent bar at top */}
      <div
        className="module-card-accent-bar"
        style={{
          background: isCompleted
            ? 'var(--color-emerald)'
            : statusVariant === 'locked'
            ? 'var(--color-outline-variant)'
            : accentColor,
          opacity: statusVariant === 'locked' ? 0.4 : 1,
        }}
      />

      <div className="module-card-body">
        {/* Eyebrow: code + status badge */}
        <div className="module-card-eyebrow">
          <span className={`module-card-code${statusVariant === 'locked' ? ' module-card-code--locked' : ''}`}>
            {module.code}
          </span>
          <span className={`module-status-badge module-status-badge--${statusVariant}`}>
            {statusLabels[statusVariant]}
          </span>
        </div>

        {/* Title */}
        <h3 className="module-card-title">{module.title}</h3>

        {/* Description */}
        <p className="module-card-description">
          {module.subtitle || 'Master foundational concepts and techniques for this curriculum track.'}
        </p>

        {/* Locked state: show prerequisites */}
        {statusVariant === 'locked' && prereqNames.length > 0 && (
          <div className="module-card-lock-info">
            <Lock size={13} color="var(--color-outline)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span className="module-card-lock-text">
              Complete {prereqNames.join(' and ')} to unlock
            </span>
          </div>
        )}

        {/* Objectives (available & completed) */}
        {statusVariant !== 'locked' && module.learningObjectives && module.learningObjectives.length > 0 && (
          <div className="module-card-objectives">
            {module.learningObjectives.slice(0, 3).map((obj, idx) => (
              <div key={idx} className="module-card-objective">
                <CheckCircle2
                  size={12}
                  className="module-card-objective-icon"
                  style={{ color: isCompleted ? 'var(--color-emerald)' : 'var(--color-primary)' }}
                />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="module-card-footer">
        {/* Meta row */}
        <div className="module-card-meta">
          <span className="module-card-meta-item">
            <Clock size={12} />
            {module.estimatedMinutes} min
          </span>
          <span className="module-card-meta-item">
            <BookOpen size={12} />
            {module.sections?.length || 0} sections
          </span>
          <span className="module-card-meta-item" style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '1px 6px',
            borderRadius: '4px',
            background: 'var(--color-surface-low)',
            border: '1px solid var(--color-surface-variant)',
          }}>
            {module.level}
          </span>
        </div>

        {/* Progress bar (if has progress or completed) */}
        {(isCompleted || isInProgress) && (
          <div className="module-card-progress-row">
            <div style={{ flex: 1 }}>
              <ProgressBar
                progress={isCompleted ? 100 : module.progressPercentage}
                height={4}
                color={isCompleted ? 'var(--color-emerald)' : 'var(--color-primary)'}
              />
            </div>
            <span className="module-card-progress-label">
              {isCompleted ? '100%' : `${module.progressPercentage}%`}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="module-card-cta">
          {statusVariant === 'locked' ? (
            <span className="btn-module-action btn-module-action--locked">
              <Lock size={13} />
              Locked
            </span>
          ) : isCompleted ? (
            <button
              className="btn-module-action btn-module-action--ghost"
              onClick={handleAction}
            >
              <CheckCircle2 size={14} color="var(--color-emerald)" />
              Review Module
            </button>
          ) : isInProgress ? (
            <button
              className="btn-module-action btn-module-action--secondary"
              onClick={handleAction}
            >
              Continue Learning
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn-module-action btn-module-action--primary"
              onClick={handleAction}
            >
              Start Module
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
