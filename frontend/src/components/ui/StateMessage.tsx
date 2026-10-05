import React from 'react';
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import { Button } from './Button';

export interface StateMessageProps {
  kind: 'loading' | 'empty' | 'error';
  /** What is happening, or what is missing; for errors, what failed (the cause is added from `detail`). */
  message: string;
  detail?: string;
  onRetry?: () => void;
}

const ICON = { loading: Loader2, empty: Inbox, error: AlertTriangle };

/**
 * One way to show the three non-data states, so a failed request never looks like "no data":
 * loading is announced politely, errors are alerts with an optional retry, empty explains what is missing.
 */
export const StateMessage: React.FC<StateMessageProps> = ({ kind, message, detail, onRetry }) => {
  const Icon = ICON[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
      className={`state-message state-message--${kind}`}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 12,
        border: `1px solid ${kind === 'error' ? 'var(--color-error)' : 'var(--color-border)'}`,
        background: kind === 'error' ? 'var(--color-error-container)' : 'var(--color-surface)',
        color: kind === 'error' ? 'var(--color-on-error-container, var(--color-text-primary))' : 'var(--color-text-secondary)',
      }}
    >
      <Icon size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} className={kind === 'loading' ? 'state-message-spin' : undefined} />
      <div style={{ flex: 1, fontSize: 14 }}>
        <span>{message}</span>
        {detail && <span style={{ display: 'block', fontSize: 12, marginTop: 2, opacity: 0.85 }}>{detail}</span>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
