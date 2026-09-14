// src/features/curriculum/components/ModuleNode.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { CurriculumModule, ModuleStatus } from '../curriculumTypes';

interface ModuleNodeProps {
  module: CurriculumModule;
  status: ModuleStatus;
  score?: number;
  prevModuleTitle?: string;
}

export const ModuleNode: React.FC<ModuleNodeProps> = ({
  module,
  status,
  score,
  prevModuleTitle
}) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
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
        zIndex: showTooltip ? 30 : 10
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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
            ? '#10b981'
            : isCurrent
            ? '#080b14'
            : isLocked
            ? '#1a1e29'
            : '#1e293b',
          border: isCompleted
            ? '2px solid #10b981'
            : isCurrent
            ? '2px solid #38bdf8'
            : isLocked
            ? '2px solid #2d3748'
            : '2px solid #64748b',
          boxShadow: isCompleted
            ? '0 0 12px rgba(16, 185, 129, 0.35)'
            : isCurrent
            ? '0 0 16px rgba(56, 189, 248, 0.45)'
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
              backgroundColor: '#38bdf8'
            }}
          />
        )}
        {isLocked && <Lock size={16} color="#64748b" />}
        {!isCompleted && !isCurrent && !isLocked && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#94a3b8'
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
            ? '#10b981'
            : isCurrent
            ? '#38bdf8'
            : isLocked
            ? '#64748b'
            : '#94a3b8'
        }}
      >
        {module.code}
      </span>

      {/* Tooltip on Hover */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '200px',
            maxWidth: '260px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            zIndex: 50,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {module.code} · {module.level}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
            {module.title}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <span>⏱️ {module.estimatedMinutes}m</span>
            <span>⚡ +{module.xp} XP</span>
          </div>
          {isCompleted && score !== undefined && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              Quiz Score: {score}%
            </div>
          )}
          {isLocked && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#f87171' }}>
              🔒 Locked
            </div>
          )}
        </div>
      )}

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
            border: '1px solid #ef4444',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11px',
            color: '#fecaca',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
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
