import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, FileQuestion } from 'lucide-react';

export const LearningEmptyState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-state-banner">
      <div className="empty-state-card">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-fixed)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                COMPLETE YOUR BASELINE
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '3px' }}>
              Unlock Personalized Learning Recommendations
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Complete the initial Q-CAPS diagnostic assessment to identify your exact skill gaps and generate a prioritized curriculum path.
            </p>
          </div>
        </div>

        <button
          className="btn-module-action btn-module-action--primary"
          style={{ padding: '9px 18px', fontSize: '13px', gap: '8px' }}
          onClick={() => navigate('/assessment')}
        >
          <FileQuestion size={16} />
          <span>Start Diagnostic Assessment</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
