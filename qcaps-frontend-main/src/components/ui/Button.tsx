import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'cyan' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: 'var(--radius-button)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent',
    outline: 'none',
    width: fullWidth ? '100%' : 'max-content',
    ...style,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { height: '36px', padding: '0 12px', fontSize: '13px' },
    md: { height: '44px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '16px' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary-container)',
      color: '#FFFFFF',
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: 'var(--color-primary-fixed)',
      color: 'var(--color-primary)',
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
      borderColor: 'var(--color-border)',
    },
    cyan: {
      backgroundColor: 'var(--color-technical-cyan)',
      color: '#111827',
      fontWeight: 600,
      borderColor: 'transparent',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      borderColor: 'transparent',
    },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      className={`qcaps-button ${className}`}
      {...props}
    >
      {leftIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{leftIcon}</span>}
      {children}
      {rightIcon && <span style={{ display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
    </button>
  );
};
