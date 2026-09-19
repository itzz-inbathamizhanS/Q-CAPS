import React from 'react';
import { Card } from './Card';
import { ProgressRing } from './ProgressRing';
import { ProgressBar } from './ProgressBar';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface StatCardProps {
  title: string;
  value: string;
  badge?: {
    text: string;
    variant?: 'cyan' | 'primary' | 'secondary' | 'success';
  };
  supportingText: string;
  linkText?: string;
  linkTo?: string;
  visualType?: 'ring' | 'bar' | 'icon';
  ringProgress?: number;
  barProgress?: number;
  icon?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  badge,
  supportingText,
  linkText,
  linkTo = '#',
  visualType = 'icon',
  ringProgress = 0,
  barProgress = 0,
  icon,
  iconBgColor = 'rgba(92, 75, 195, 0.1)',
  iconColor = 'var(--color-secondary)',
}) => {
  return (
    <Card
      variant="glass"
      padding="normal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: '18px',
                color: 'var(--color-outline)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 500,
                marginBottom: '4px',
              }}
            >
              {title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  lineHeight: '40px',
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text-primary)',
                }}
              >
                {value}
              </span>
              {badge && (
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: badge.variant === 'cyan' ? 'var(--color-technical-cyan)' : 'var(--color-primary)',
                    backgroundColor:
                      badge.variant === 'cyan' ? 'rgba(60, 183, 232, 0.12)' : 'rgba(84, 39, 230, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {badge.text}
                </span>
              )}
            </div>
          </div>

          {/* Visual Element */}
          {visualType === 'ring' && (
            <ProgressRing progress={ringProgress} size={48} progressColor="var(--color-primary)" />
          )}

          {visualType === 'icon' && icon && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '9999px',
                backgroundColor: iconBgColor,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Progress Bar (if bar visual) */}
        {visualType === 'bar' && (
          <div style={{ marginBottom: '12px' }}>
            <ProgressBar progress={barProgress} height={8} />
          </div>
        )}

        <p
          style={{
            fontSize: '14px',
            lineHeight: '20px',
            color: 'var(--color-text-on-surface-variant)',
            marginBottom: '24px',
          }}
        >
          {supportingText}
        </p>
      </div>

      {linkText && (
        <Link
          to={linkTo}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500,
            marginTop: 'auto',
          }}
          className="stat-card-link"
        >
          {linkText} <ArrowRight size={14} />
        </Link>
      )}
    </Card>
  );
};
