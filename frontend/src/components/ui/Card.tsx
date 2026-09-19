import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'dark' | 'flat';
  padding?: 'none' | 'normal' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'normal',
  className = '',
  style = {},
  ...props
}) => {
  const paddingMap: Record<string, string> = {
    none: '0',
    normal: 'var(--card-padding)',
    large: 'var(--card-padding-lg)',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    glass: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--radius-card)',
    },
    dark: {
      backgroundColor: 'var(--cyber-card)',
      border: '1px solid var(--cyber-border)',
      borderRadius: 'var(--radius-card)',
      color: '#FFFFFF',
    },
    flat: {
      backgroundColor: 'var(--color-surface-low)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
    },
  };

  return (
    <div
      style={{
        padding: paddingMap[padding],
        ...variantStyles[variant],
        ...style,
      }}
      className={`${variant === 'glass' ? 'glass-card' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
