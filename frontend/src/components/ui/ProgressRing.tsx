import React from 'react';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 48,
  strokeWidth = 3.5,
  trackColor = 'var(--color-surface-variant)',
  progressColor = 'var(--color-primary)',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
          transform: 'rotate(-90deg)',
        }}
        viewBox="0 0 36 36"
      >
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={progressColor}
          strokeDasharray={`${clampedProgress} 100`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          className="progress-ring"
        />
      </svg>
    </div>
  );
};
