import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'var(--color-primary)',
  height = 8,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-surface-variant)',
        borderRadius: '9999px',
        height: `${height}px`,
        overflow: 'hidden',
      }}
      className={className}
    >
      <div
        style={{
          width: `${clampedProgress}%`,
          backgroundColor: color,
          height: '100%',
          borderRadius: '9999px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
};
