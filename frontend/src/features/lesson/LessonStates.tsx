import React from 'react';
import { Link } from 'react-router-dom';
import type { LessonApiError } from './lessonApi';

export const LessonLoading: React.FC<{ label?: string }> = ({ label = 'Loading content' }) => (
  <div className="ls-page" role="status" aria-live="polite" aria-busy="true">
    <span className="ls-sr-only">{label}</span>
    <div className="ls-skeleton ls-skeleton--line" style={{ width: '40%' }} />
    <div className="ls-skeleton ls-skeleton--header" />
    <div className="ls-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="ls-skeleton ls-skeleton--card" />
      ))}
    </div>
  </div>
);

interface ErrorProps {
  error: LessonApiError;
  onRetry: () => void;
  notFoundLabel: string;
}

export const LessonError: React.FC<ErrorProps> = ({ error, onRetry, notFoundLabel }) => {
  const notFound = error.status === 404;
  return (
    <div className="ls-page">
      <div className="ls-card ls-state" role="alert">
        <h1 className="ls-card-title">{notFound ? `${notFoundLabel} not found` : 'Could not load this content'}</h1>
        <p className="ls-muted">
          {notFound
            ? 'It may not exist or has not been published yet.'
            : `${error.message} Check that the backend is running and try again.`}
        </p>
        <div className="ls-row">
          {!notFound && (
            <button type="button" className="ls-btn ls-btn--primary" onClick={onRetry}>
              Retry
            </button>
          )}
          <Link to="/curriculum" className="ls-btn ls-btn--secondary">
            Back to curriculum
          </Link>
        </div>
      </div>
    </div>
  );
};
