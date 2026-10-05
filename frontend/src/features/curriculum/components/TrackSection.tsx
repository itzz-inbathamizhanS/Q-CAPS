// src/features/curriculum/components/TrackSection.tsx
import React from 'react';
import { ChevronDown, ChevronRight, Lock, Award } from 'lucide-react';
import { CurriculumTrack, CurriculumModule, ModuleStatus } from '../curriculumTypes';
import { ModuleNode } from './ModuleNode';

interface TrackSectionProps {
  track: CurriculumTrack;
  modules: CurriculumModule[];
  completedModules: string[];
  currentModuleId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLockedTrack?: boolean;
  requiresGateText?: string;
}

export const TrackSection: React.FC<TrackSectionProps> = ({
  track,
  modules,
  completedModules,
  currentModuleId,
  isExpanded,
  onToggle,
  isLockedTrack = false,
  requiresGateText
}) => {
  const completedCount = modules.filter((m) => completedModules.includes(m.id)).length;
  const totalCount = modules.length;
  const isFullyCompleted = completedCount === totalCount && totalCount > 0;
  const isInProgress = completedCount > 0 && !isFullyCompleted;

  // Determine track status badge
  let statusBadge = {
    label: 'Not Started',
    color: 'var(--color-text-secondary)',
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.25)'
  };

  if (isFullyCompleted) {
    statusBadge = {
      label: 'Completed',
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)'
    };
  } else if (isInProgress) {
    statusBadge = {
      label: 'In Progress',
      color: 'var(--color-info)',
      bg: 'var(--color-info-bg)',
      border: 'var(--color-info-bg)'
    };
  } else if (isLockedTrack) {
    statusBadge = {
      label: 'Locked',
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
      border: 'var(--color-danger-bg)'
    };
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${isExpanded ? 'var(--color-primary-soft)' : 'var(--color-border)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isExpanded
          ? '0 10px 30px var(--color-primary-soft)'
          : '0 2px 10px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s ease',
        marginBottom: '20px'
      }}
    >
      {/* Header Row - Clickable */}
      <div
        onClick={onToggle}
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: isExpanded ? 'var(--color-surface-low)' : 'transparent', // neutral, so text and status chips keep their contrast
          borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          {/* Track Code Pill */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: isLockedTrack ? 'rgba(100, 116, 139, 0.1)' : 'var(--color-primary-soft)',
              color: isLockedTrack ? 'var(--color-text-secondary)' : 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {track.code}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {track.title}
              </h3>
              {isLockedTrack && <Lock size={15} color="var(--color-text-secondary)" />}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
              {track.subtitle}
            </p>
          </div>
        </div>

        {/* Right side stats & status */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 18px' }}>
          {/* Certificate Badge Hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0,0,0,0.03)'
            }}
          >
            <Award size={14} color="#8b5cf6" />
            <span>{track.certificateCode}</span>
          </div>

          {/* Module completion count */}
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {completedCount} / {totalCount} complete
          </div>

          {/* Status Tag */}
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: statusBadge.color,
              backgroundColor: statusBadge.bg,
              border: `1px solid ${statusBadge.border}`
            }}
          >
            {statusBadge.label}
          </div>

          {/* Toggle icon */}
          <div style={{ color: 'var(--color-text-secondary)' }}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded Track Content */}
      {isExpanded && (
        <div style={{ padding: '24px' }}>
          {/* Certificate Gate alert if present */}
          {requiresGateText && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#b45309',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Lock size={16} />
              <span>
                <strong>Prerequisite Gate:</strong> {requiresGateText}
              </span>
            </div>
          )}

          {/* Description & Entry Profile */}
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            {track.description}
          </p>

          {/* Node Chain Container */}
          <div
            className="custom-scrollbar"
            style={{
              overflowX: 'auto',
              paddingBottom: '40px',
              paddingTop: '20px',
              position: 'relative',
              zIndex: 10
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                minWidth: `${modules.length * 90}px`,
                position: 'relative',
                padding: '0 20px'
              }}
            >
              {/* Connected Line behind nodes */}
              <div
                style={{
                  position: 'absolute',
                  top: '22px',
                  left: '40px',
                  right: '40px',
                  height: '3px',
                  backgroundColor: 'var(--color-text-primary)',
                  zIndex: 1
                }}
              />

              {/* Individual nodes */}
              {modules.map((mod, idx) => {
                const isCompleted = completedModules.includes(mod.id);
                let status: ModuleStatus = 'locked';

                if (isCompleted) {
                  status = 'completed';
                } else {
                  // Use the canonical prerequisite check from the module's actual prerequisites
                  const prereqsMet = mod.prerequisites.length === 0 ||
                    mod.prerequisites.every(prereqId => completedModules.includes(prereqId));

                  if (prereqsMet && !isLockedTrack) {
                    // Module is accessible — determine if it's the current one or just available
                    const isCur = mod.id === currentModuleId;
                    status = isCur ? 'in_progress' : 'available';
                  } else {
                    status = 'locked';
                  }
                }

                const prevTitle = idx > 0 ? modules[idx - 1].title : undefined;

                return (
                  <React.Fragment key={mod.id}>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <ModuleNode
                        module={mod}
                        status={status}
                        prevModuleTitle={prevTitle}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Capstone Box */}
          <div
            style={{
              marginTop: '16px',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-soft)',
              border: '1px dashed var(--color-primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={20} color="var(--color-primary)" />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {track.capstoneTitle}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {track.capstoneDescription}
                </p>
              </div>
            </div>

            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isFullyCompleted ? 'var(--color-success)' : 'var(--color-text-secondary)'
              }}
            >
              {isFullyCompleted ? '✓ Capstone Eligible' : `Requires all ${totalCount} modules`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
