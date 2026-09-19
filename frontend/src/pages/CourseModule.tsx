import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumModules, curriculumTracks } from '@/data/curriculumData';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { quizzesData } from '@/data/quizzesData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Trophy,
  Zap,
  Clock,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const CourseModule: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const {
    markModuleRead,
    isModuleUnlocked,
    isModuleCompleted,
    quizScores,
  } = useCurriculumStore();

  const moduleData = curriculumModules.find((m) => m.id === moduleId);

  // Derive track information
  const trackInfo = moduleData
    ? curriculumTracks.find((t) => t.id === moduleData.trackId)
    : undefined;

  // Active section for reading outline
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  useEffect(() => {
    if (moduleData && moduleData.sections.length > 0) {
      setActiveSectionId(moduleData.sections[0].id);
    }
  }, [moduleId, moduleData]);

  if (!moduleData) {
    return (
      <div className="reader-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'var(--color-surface-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <BookOpen size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Module Not Found
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            The course module you are looking for does not exist in the curriculum catalog.
          </p>
          <Link
            to="/learning"
            className="btn-module-action btn-module-action--primary"
            style={{ padding: '10px 20px', display: 'inline-flex' }}
          >
            <ArrowLeft size={16} /> Return to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  // Prerequisite guard: prevent direct URL access to locked modules
  const unlocked = isModuleUnlocked(moduleData.id);
  if (!unlocked) {
    return (
      <div className="reader-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}>
        <div className="reader-locked">
          <div className="reader-locked-icon">
            <Lock size={28} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-error)',
              background: 'rgba(186, 26, 26, 0.08)',
              padding: '3px 10px',
              borderRadius: '4px',
            }}
          >
            PREREQUISITE REQUIRED
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '12px', marginBottom: '8px' }}>
            Module Locked: {moduleData.code}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            This technical unit requires verified completion of foundational prerequisites before unlock.
          </p>

          {moduleData.prerequisites.length > 0 && (
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '18px 20px',
                textAlign: 'left',
                marginBottom: '28px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '12px',
                }}
              >
                Required Preceding Modules
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moduleData.prerequisites.map((prereqId) => {
                  const prereq = curriculumModules.find((m) => m.id === prereqId);
                  const isPrereqDone = isModuleCompleted(prereqId);
                  const isPrereqUnlocked = isModuleUnlocked(prereqId);

                  return (
                    <div
                      key={prereqId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--color-surface-dim)',
                        borderRadius: '6px',
                        border: '1px solid var(--color-surface-variant)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isPrereqDone ? (
                          <CheckCircle2 size={16} color="var(--color-emerald)" />
                        ) : (
                          <Lock size={15} color="var(--color-outline)" />
                        )}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {prereq?.code || prereqId}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          — {prereq?.title || prereqId}
                        </span>
                      </div>
                      {isPrereqUnlocked && !isPrereqDone && (
                        <Link
                          to={`/learning/${prereqId}`}
                          className="btn-module-action btn-module-action--secondary"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Start Module <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/learning"
              className="btn-module-action btn-module-action--ghost"
              style={{ padding: '9px 18px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <ArrowLeft size={15} /> Return to Catalog
            </Link>
            <Link
              to="/curriculum"
              className="btn-module-action btn-module-action--primary"
              style={{ padding: '9px 18px' }}
            >
              View Curriculum Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completed = isModuleCompleted(moduleData.id);
  const quizScore = quizScores[moduleData.id];
  const hasQuiz = !!(moduleId && quizzesData[moduleId]);

  // Find previous and next modules in the curriculum
  const currentIdx = curriculumModules.findIndex((m) => m.id === moduleId);
  const prevModule = currentIdx > 0 ? curriculumModules[currentIdx - 1] : null;
  const nextModule =
    currentIdx >= 0 && currentIdx < curriculumModules.length - 1
      ? curriculumModules[currentIdx + 1]
      : null;

  const handleMarkComplete = () => {
    if (!moduleId || completed) return;
    markModuleRead(moduleId);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const levelStyles: Record<string, { bg: string; color: string; border: string }> = {
    foundations: { bg: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.2)' },
    intermediate: { bg: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', border: 'rgba(79, 70, 229, 0.2)' },
    advanced: { bg: 'rgba(147, 51, 234, 0.08)', color: '#9333ea', border: 'rgba(147, 51, 234, 0.2)' },
    enterprise: { bg: 'rgba(217, 119, 6, 0.08)', color: '#d97706', border: 'rgba(217, 119, 6, 0.2)' },
  };
  const currentLevelStyle =
    levelStyles[moduleData.level.toLowerCase()] || levelStyles.foundations;

  return (
    <div className="reader-page">
      {/* ==========================================================
          HEADER BANNER & METADATA BAR
          ========================================================== */}
      <header className="reader-header">
        <div className="reader-header-inner">
          {/* Breadcrumb navigation */}
          <nav className="reader-breadcrumb" aria-label="Breadcrumb">
            <Link to="/learning">Learning</Link>
            <span className="reader-breadcrumb-sep">/</span>
            {trackInfo && (
              <>
                <Link to="/learning">{trackInfo.title}</Link>
                <span className="reader-breadcrumb-sep">/</span>
              </>
            )}
            <span className="reader-breadcrumb-active">{moduleData.code}</span>
          </nav>

          {/* Module Headline Row */}
          <div className="reader-module-headline">
            <div>
              <div className="reader-module-meta">
                <span
                  className="reader-module-level-badge"
                  style={{
                    background: currentLevelStyle.bg,
                    color: currentLevelStyle.color,
                    border: `1px solid ${currentLevelStyle.border}`,
                  }}
                >
                  {moduleData.level}
                </span>
                <span className="reader-module-code">{moduleData.code}</span>
                {trackInfo && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Track {trackInfo.code.replace('track-', '').toUpperCase()}
                  </span>
                )}
              </div>

              <h1 className="reader-module-title">{moduleData.title}</h1>
              {moduleData.subtitle && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '4px',
                    maxWidth: '720px',
                    lineHeight: 1.5,
                  }}
                >
                  {moduleData.subtitle}
                </p>
              )}
            </div>

            {/* Header Stats Cluster */}
            <div className="reader-module-stats">
              <div className="reader-stat-pill">
                <Clock size={14} color="var(--color-outline)" />
                <span>{moduleData.estimatedMinutes} mins</span>
              </div>

              <div className="reader-stat-pill reader-stat-pill--primary">
                <Zap size={14} />
                <span>+{moduleData.xp} XP</span>
              </div>

              {quizScore !== undefined && (
                <div className="reader-stat-pill reader-stat-pill--amber">
                  <Trophy size={14} />
                  <span>Quiz: {quizScore}%</span>
                </div>
              )}

              {completed ? (
                <div className="reader-stat-pill reader-stat-pill--success">
                  <CheckCircle2 size={14} />
                  <span>Completed</span>
                </div>
              ) : (
                <div className="reader-stat-pill">
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      background: 'var(--color-primary)',
                      display: 'inline-block',
                    }}
                  />
                  <span>In Progress</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================================
          THREE-COLUMN OPERATIONAL READER LAYOUT
          ========================================================== */}
      <div className="reader-layout">
        {/* LEFT COLUMN: Course Outline Navigation (Sticky Sidebar) */}
        <aside className="course-outline" aria-label="Course Sections">
          <div className="course-outline-header">
            <span className="course-outline-title">Course Outline</span>
            <span className="course-outline-count">
              {moduleData.sections.length} Units
            </span>
          </div>

          <div className="course-outline-list">
            {moduleData.sections.map((section, index) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`course-outline-item ${isActive ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="course-outline-item-num">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="course-outline-item-label">
                    {section.title}
                  </span>
                  {completed && (
                    <CheckCircle2 size={13} className="course-outline-item-check" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Outline footer meta */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface-dim)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>PROGRESS</span>
            <span style={{ fontWeight: 700, color: completed ? 'var(--color-emerald)' : 'var(--color-primary)' }}>
              {completed ? '100%' : 'IN PROGRESS'}
            </span>
          </div>
        </aside>

        {/* MIDDLE COLUMN: The Reader Core Content */}
        <main className="reader-content">
          {/* Target Competencies / Objectives Card */}
          {moduleData.learningObjectives && moduleData.learningObjectives.length > 0 && (
            <section className="objectives-card" aria-label="Learning Objectives">
              <div className="objectives-card-header">
                <div className="objectives-card-icon">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="objectives-card-title">Target Competencies & Learning Objectives</h2>
                  <p className="objectives-card-subtitle">
                    Validated against NIST SP 800-181 Cyberspace Workforce Framework
                  </p>
                </div>
              </div>

              <div className="objectives-list">
                {moduleData.learningObjectives.map((obj, idx) => (
                  <div key={idx} className="objective-item">
                    <CheckCircle2 size={15} className="objective-check" />
                    <span className="objective-text">{obj}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section Content Cards */}
          {moduleData.sections.map((section, index) => {
            const isActive = activeSectionId === section.id;

            return (
              <article
                key={section.id}
                id={`section-${section.id}`}
                className={`section-card ${isActive ? 'active-section' : ''}`}
              >
                <div className="section-card-header">
                  <div className="section-card-number">
                    SECTION {String(index + 1).padStart(2, '0')} • CORE MATERIAL
                  </div>
                  <h2 className="section-card-title">{section.title}</h2>
                </div>

                <div className="section-card-body">
                  {/* Markdown Content */}
                  <div className="prose-learning">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content}
                    </ReactMarkdown>
                  </div>

                  {/* Embedded Interactive Callout / Tactical Advisory */}
                  {section.interactiveCallout && (
                    <div className="callout callout--advisory">
                      <div className="callout-icon">
                        <Zap size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="callout-content-title">
                          Tactical Advisory & Operational Note
                        </div>
                        <div className="callout-content-body">
                          <ReactMarkdown>{section.interactiveCallout}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </main>

        {/* RIGHT COLUMN: Lesson Context & Metadata Panel */}
        <aside className="lesson-context" aria-label="Module Context">
          {/* Module Track & Position Card */}
          <div className="context-card">
            <div className="context-card-title">Curriculum Track</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-fixed)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                }}
              >
                {trackInfo?.code.toUpperCase() || 'TRACK'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {trackInfo?.title || 'Cyber Curriculum'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
              {trackInfo?.description || 'Foundational to advanced enterprise cybersecurity.'}
            </p>
          </div>

          {/* Module Completion Meter */}
          <div className="context-card">
            <div className="context-card-title">Unit Status</div>
            <div className="context-progress-value">
              {completed ? '100%' : 'In Progress'}
            </div>
            <div className="context-progress-sub">
              Module {currentIdx + 1} of {curriculumModules.length} in Catalog
            </div>
            <ProgressBar
              progress={completed ? 100 : 40}
              height={5}
              color={completed ? 'var(--color-emerald)' : 'var(--color-primary)'}
            />
          </div>

          {/* Next Module Preview Card */}
          {nextModule && (
            <div className="context-card" style={{ background: 'var(--color-surface-dim)' }}>
              <div className="context-card-title">Next in Sequence</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '2px',
                }}
              >
                {nextModule.code}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  marginBottom: '10px',
                  lineHeight: 1.3,
                }}
              >
                {nextModule.title}
              </div>
              <Link
                to={`/learning/${nextModule.id}`}
                className="btn-module-action btn-module-action--secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px 10px' }}
              >
                Preview Next <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </aside>
      </div>

      {/* ==========================================================
          FIXED BOTTOM COMMAND RAIL / FOOTER
          ========================================================== */}
      <footer className="reader-footer">
        <div className="reader-footer-inner">
          {/* Previous Module Link */}
          <div>
            {prevModule ? (
              <Link to={`/learning/${prevModule.id}`} className="reader-footer-nav-btn">
                <ArrowLeft size={15} />
                <span>Prev: {prevModule.code}</span>
              </Link>
            ) : (
              <span className="reader-footer-nav-btn reader-footer-nav-btn--disabled">
                <ArrowLeft size={15} />
                <span>Beginning</span>
              </span>
            )}
          </div>

          {/* Center Actions: Quiz + Mark Complete */}
          <div className="reader-footer-center">
            <span className="reader-footer-position">
              Module {currentIdx + 1} of {curriculumModules.length}
            </span>

            {hasQuiz && (
              <button
                type="button"
                className="reader-footer-action-btn reader-footer-action-btn--quiz"
                onClick={() => navigate(`/quiz/${moduleId}`)}
              >
                <Trophy size={15} />
                <span>{quizScore !== undefined ? `Retake Quiz (${quizScore}%)` : 'Take Quiz (+50 XP)'}</span>
              </button>
            )}

            {completed ? (
              <span className="reader-footer-action-btn reader-footer-action-btn--success">
                <CheckCircle2 size={16} />
                <span>Completed (+{moduleData.xp} XP)</span>
              </span>
            ) : (
              <button
                type="button"
                className="reader-footer-action-btn reader-footer-action-btn--primary"
                onClick={handleMarkComplete}
              >
                <CheckCircle size={15} />
                <span>Mark Complete (+{moduleData.xp} XP)</span>
              </button>
            )}
          </div>

          {/* Next Module Link */}
          <div>
            {nextModule ? (
              <Link to={`/learning/${nextModule.id}`} className="reader-footer-nav-btn">
                <span>Next: {nextModule.code}</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link to="/learning" className="reader-footer-nav-btn">
                <span>Finish Catalog</span>
                <CheckCircle2 size={15} color="var(--color-emerald)" />
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseModule;
