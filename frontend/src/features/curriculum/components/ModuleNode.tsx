// src/features/curriculum/components/ModuleNode.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { CurriculumModule, ModuleStatus } from '../curriculumTypes';

interface ModuleNodeProps {
  module: CurriculumModule;
  status: ModuleStatus;
  prevModuleTitle?: string;
}

export const ModuleNode: React.FC<ModuleNodeProps> = ({
  module,
  status,
  prevModuleTitle
}) => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClick = () => {
    if (status === 'locked') {
      const msg = prevModuleTitle
        ? `Complete "${prevModuleTitle}" to unlock this module`
        : 'Prerequisites required to unlock this module';
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3200);
      return;
    }
    navigate(`/learning/${module.id}`);
  };

  const isCompleted = status === 'completed';
  const isCurrent = status === 'in_progress';
  const isLocked = status === 'locked';

  return (
    <div
      className="module-node-wrapper"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        zIndex: 10
      }}
      onClick={handleClick}
    >
      {/* Node Circle */}
      <div
        className={`module-node-circle ${isCurrent ? 'pulse-node' : ''}`}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backgroundColor: isCompleted
            ? 'var(--color-success)'
            : isCurrent
            ? 'var(--color-bg)'
            : isLocked
            ? '#1a1e29'
            : 'var(--color-surface-container)',
          border: isCompleted
            ? '2px solid var(--color-success)'
            : isCurrent
            ? '2px solid var(--color-info)'
            : isLocked
            ? '2px solid #2d3748'
            : '2px solid var(--color-text-secondary)',
          boxShadow: isCompleted
            ? '0 0 12px var(--color-success-bg)'
            : isCurrent
            ? '0 0 16px var(--color-info-bg)'
            : 'none'
        }}
      >
        {isCompleted && <Check size={20} color="#ffffff" strokeWidth={3} />}
        {isCurrent && (
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-info)'
            }}
          />
        )}
        {isLocked && <Lock size={16} color="var(--color-text-secondary)" />}
        {!isCompleted && !isCurrent && !isLocked && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-text-secondary)'
            }}
          />
        )}
      </div>

      {/* Node Code Label */}
      <span
        style={{
          marginTop: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 600,
          color: isCompleted
            ? 'var(--color-success)'
            : isCurrent
            ? 'var(--color-info)'
            : isLocked
            ? 'var(--color-text-secondary)'
            : 'var(--color-text-secondary)'
        }}
      >
        {module.code}
      </span>

      {/* Toast Warning if clicked while locked */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            backgroundColor: '#450a0a',
            border: '1px solid var(--color-danger)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11px',
            color: 'var(--color-danger)',
            textAlign: 'center',
            boxShadow: '0 4px 16px var(--color-danger-border)',
            zIndex: 60,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
