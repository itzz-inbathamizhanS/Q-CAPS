// src/pages/CourseModule.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  FileCode2
} from 'lucide-react';
import { curriculumModules, curriculumTracks } from '@/data/curriculumData';
import { quizzesData } from '@/data/quizzesData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const CourseModule: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { completedModules, isModuleCompleted, quizScores } = useCurriculumStore();

  // Find module
  const currentMod = curriculumModules.find((m) => m.id === moduleId) || curriculumModules[0];
  const track = curriculumTracks.find((t) => t.id === currentMod.trackId) || curriculumTracks[0];

  // Track progress
  const trackModules = curriculumModules.filter((m) => m.trackId === currentMod.trackId);
  const trackCompletedCount = trackModules.filter((m) => completedModules.includes(m.id)).length;
  const isPassed = isModuleCompleted(currentMod.id);
  const existingScore = quizScores[currentMod.id];

  // Index navigation
  const currentIndex = curriculumModules.findIndex((m) => m.id === currentMod.id);
  const prevModule = currentIndex > 0 ? curriculumModules[currentIndex - 1] : null;
  const nextModule = currentIndex < curriculumModules.length - 1 ? curriculumModules[currentIndex + 1] : null;

  // Has quiz data?
  const hasQuiz = Boolean(quizzesData[currentMod.id]);

  // Interactive sandbox expanded state
  const [expandedCallout, setExpandedCallout] = useState<Record<string, boolean>>({});

  const toggleCallout = (secId: string) => {
    setExpandedCallout((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Region A: Module Header */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        {/* Breadcrumbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-text-secondary, #64748b)',
            marginBottom: '12px'
          }}
        >
          <Link
            to="/learning"
            style={{
              color: 'var(--color-primary, #5427e6)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            Curriculum
          </Link>
          <span>/</span>
          <Link
            to="/learning"
            style={{
              color: 'var(--color-text-secondary, #64748b)',
              textDecoration: 'none'
            }}
          >
            {track.code}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary, #0f172a)', fontWeight: 600 }}>
            {currentMod.code}: {currentMod.title}
          </span>
        </div>

        {/* Title & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(84, 39, 230, 0.1)',
                  color: 'var(--color-primary, #5427e6)',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {currentMod.code}
              </span>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary, #0f172a)',
                  letterSpacing: '-0.3px',
                  margin: 0
                }}
              >
                {currentMod.title}
              </h1>
            </div>

            {/* Traceability module_id */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#94a3b8',
                marginTop: '4px'
              }}
            >
              module_id: <code>{currentMod.id}</code>
            </div>
          </div>

          {/* Badges & Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.03)',
                fontSize: '13px',
                color: 'var(--color-text-secondary)'
              }}
            >
              <Clock size={15} />
              <span>{currentMod.estimatedMinutes} mins</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#b45309',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Zap size={15} />
              <span>+{currentMod.xp} XP</span>
            </div>

            {isPassed && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#065f46',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={15} />
                <span>Passed ({existingScore}%)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Region B: Learning Objectives Callout */}
      {currentMod.learningObjectives && currentMod.learningObjectives.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(84, 39, 230, 0.03)',
            border: '1px solid rgba(84, 39, 230, 0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '32px'
          }}
        >
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-primary, #5427e6)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BookOpen size={18} />
            <span>Learning Objectives</span>
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {currentMod.learningObjectives.map((obj, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-primary, #1e293b)',
                  lineHeight: 1.5
                }}
              >
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Region C: Body Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '40px' }}>
        {currentMod.sections && currentMod.sections.length > 0 ? (
          currentMod.sections.map((sec) => (
            <div
              key={sec.id}
              style={{
                backgroundColor: 'var(--color-surface, #ffffff)',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '14px',
                padding: '24px 28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary, #0f172a)',
                  marginBottom: '14px',
                  borderBottom: '1px solid var(--color-border, #f1f5f9)',
                  paddingBottom: '10px'
                }}
              >
                {sec.title}
              </h2>

              {/* Text content rendered paragraph by paragraph */}
              <div
                style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: '#334155',
                  whiteSpace: 'pre-line'
                }}
              >
                {sec.content}
              </div>

              {/* Interactive Visual Callout if specified */}
              {sec.interactiveCallout && (
                <div
                  style={{
                    marginTop: '20px',
                    borderRadius: '10px',
                    border: '1px dashed #38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    padding: '16px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleCallout(sec.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCode2 size={18} color="#0284c7" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1' }}>
                        Interactive Component / Code Lab Specification
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0284c7', textDecoration: 'underline' }}>
                      {expandedCallout[sec.id] ? 'Hide Details' : 'View Spec'}
                    </span>
                  </div>

                  {expandedCallout[sec.id] && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(56, 189, 248, 0.2)',
                        fontSize: '13px',
                        color: '#0f172a',
                        lineHeight: 1.6
                      }}
                    >
                      {sec.interactiveCallout}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <Card variant="glass" padding="large">
            <p>Module content is being compiled for this lesson.</p>
          </Card>
        )}

        {/* Wrap Up & Deliverables */}
        {currentMod.wrapUp?.summary && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '20px 24px'
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#065f46',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Award size={18} />
              <span>Module Wrap-Up</span>
            </h3>
            <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {currentMod.wrapUp.summary}
            </div>
          </div>
        )}
      </div>

      {/* Region D: Module Footer Navigation */}
      <div
        style={{
          backgroundColor: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        {/* Track Progress Indicator */}
        <div style={{ minWidth: '220px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            {track.code} Progress: {trackCompletedCount} / {trackModules.length} complete
          </div>
          <div
            style={{
              width: '180px',
              height: '6px',
              backgroundColor: 'rgba(0,0,0,0.06)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.round((trackCompletedCount / trackModules.length) * 100)}%`,
                height: '100%',
                backgroundColor: '#10b981',
                borderRadius: '3px'
              }}
            />
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {prevModule && (
            <Button
              variant="outline"
              onClick={() => navigate(`/learning/${prevModule.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ChevronLeft size={16} />
              <span>Previous ({prevModule.code})</span>
            </Button>
          )}

          {/* Primary CTA: Take Quiz or Next Module */}
          {hasQuiz ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/quiz/${currentMod.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isPassed ? '#10b981' : 'var(--color-primary)'
              }}
            >
              <span>{isPassed ? `Retake ${currentMod.code} Quiz` : `Take the ${currentMod.code} Quiz →`}</span>
              <Play size={15} fill="currentColor" />
            </Button>
          ) : nextModule ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/learning/${nextModule.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Next: {nextModule.code}</span>
              <ChevronRight size={16} />
            </Button>
          ) : null}

          {/* If already passed and there's a next module, allow direct jump */}
          {isPassed && nextModule && (
            <Button
              variant="outline"
              onClick={() => navigate(`/learning/${nextModule.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Next ({nextModule.code})</span>
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
