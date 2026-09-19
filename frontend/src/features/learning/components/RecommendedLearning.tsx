import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LearningModule } from '../learningTypes';

interface RecommendedLearningProps {
  recommendedModules: LearningModule[];
  topPriorityReason?: string;
}

export const RecommendedLearning: React.FC<RecommendedLearningProps> = ({
  recommendedModules,
  topPriorityReason,
}) => {
  const navigate = useNavigate();

  if (recommendedModules.length === 0) return null;

  return (
    <section className="recommendation-section">
      {/* Section header */}
      <div className="section-eyebrow">
        <Sparkles size={12} />
        <span>Recommended For You</span>
      </div>
      <h2 className="section-title">Priority Learning Queue</h2>
      {topPriorityReason && (
        <p className="section-subtitle">{topPriorityReason}</p>
      )}

      {/* Cards grid */}
      <div className="recommendation-grid">
        {recommendedModules.map((module) => (
          <div
            key={module.id}
            className="rec-module-card"
          >
            {/* Accent bar */}
            <div className="rec-module-card-accent" />

            <div className="rec-module-card-body">
              {/* Eyebrow */}
              <div className="rec-module-eyebrow">
                <span className="rec-module-track-pill">
                  {module.trackId === 'track-a' ? 'Track A · Foundations'
                    : module.trackId === 'track-b' ? 'Track B · Intermediate'
                    : module.trackId === 'track-c' ? 'Track C · Advanced'
                    : 'Track D · Enterprise'}
                </span>
                <span className="rec-module-code">{module.code}</span>
              </div>

              {/* Title */}
              <h3 className="rec-module-title">{module.title}</h3>

              {/* Reason */}
              {module.recommendationReason && (
                <p className="rec-module-reason">{module.recommendationReason}</p>
              )}

              {/* Competencies */}
              {module.learningObjectives && module.learningObjectives.length > 0 && (
                <>
                  <div style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--color-outline)',
                    marginBottom: '6px',
                  }}>
                    Core Competencies
                  </div>
                  <div className="rec-module-competencies">
                    {module.learningObjectives.slice(0, 3).map((obj, idx) => (
                      <div key={idx} className="rec-module-competency">
                        <CheckCircle2 size={12} className="rec-module-competency-icon" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="rec-module-footer">
                <div className="rec-module-meta">
                  <span className="rec-module-meta-item">
                    <Clock size={12} />
                    {module.estimatedMinutes} min
                  </span>
                  <span className="rec-module-meta-item">
                    <BookOpen size={12} />
                    {module.sections?.length || 0} sections
                  </span>
                </div>

                {module.progressPercentage > 0 && module.progressPercentage < 100 && (
                  <ProgressBar
                    progress={module.progressPercentage}
                    height={4}
                    color="var(--color-primary)"
                  />
                )}

                <button
                  className="btn-module-action btn-module-action--primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(`/learning/${module.id}`)}
                >
                  {module.progressPercentage > 0 ? 'Continue Learning' : 'Start Module'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
