import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'primary' | 'secondary' | 'cyan' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  style = {},
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    neutral: {
      backgroundColor: 'var(--color-surface-variant)',
      color: 'var(--color-text-on-surface-variant)',
    },
    primary: {
      backgroundColor: 'var(--color-primary-fixed)',
      color: 'var(--color-primary)',
    },
    secondary: {
      backgroundColor: 'rgba(92, 75, 195, 0.1)',
      color: 'var(--color-secondary)',
    },
    cyan: {
      backgroundColor: 'rgba(60, 183, 232, 0.12)',
      color: 'var(--color-technical-cyan)',
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      color: 'var(--color-emerald)',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      color: 'var(--color-amber)',
    },
    error: {
      backgroundColor: 'var(--color-error-container)',
      color: 'var(--color-error)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: '11px', padding: '2px 6px', height: '20px' },
    md: { fontSize: '12px', padding: '3px 8px', height: '24px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: '6px',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      className={`qcaps-badge ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
