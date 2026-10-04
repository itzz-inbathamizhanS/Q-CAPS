import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { completeSection, fetchModule } from '@/features/lesson/lessonApi';
import { useContent } from '@/features/lesson/useContent';
import { useProgress } from '@/features/lesson/useProgress';
import { LessonError, LessonLoading } from '@/features/lesson/LessonStates';
import { BlockRenderer } from '@/features/lesson/blocks/BlockRenderer';
import { SectionReferences } from '@/features/lesson/SectionReferences';
import { ScenarioLab } from '@/features/lesson/ScenarioLab';
import { escapeRoomScenarios } from '@/data/escapeRoomData';
import '@/styles/lesson.css';

export const SectionLesson: React.FC = () => {
  const { moduleId = '', sectionId = '' } = useParams<{ moduleId: string; sectionId: string }>();
  const navigate = useNavigate();
  const { isModuleUnlocked } = useCurriculumStore();
  const { completed, refresh } = useProgress(moduleId);
  const [completing, setCompleting] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const { data: module, error, loading, retry } = useContent(`module:${moduleId}`, () => fetchModule(moduleId));

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setCompleteError(null);
    setRailOpen(false);
  }, [moduleId, sectionId]);

  if (loading) return <LessonLoading label="Loading section" />;
  if (error || !module) {
    return (
      <LessonError
        error={error ?? { name: 'Error', message: 'No data.', status: 0 }}
        onRetry={retry}
        notFoundLabel="Section"
      />
    );
  }
  // Same prerequisite guard as the overview: the lock screen lives there.
  if (!isModuleUnlocked(module.slug)) return <Navigate to={`/learning/${module.slug}`} replace />;

  const index = module.sections.findIndex((s) => s.slug === sectionId);
  if (index < 0) {
    return (
      <LessonError
        error={{ name: 'Error', message: '', status: 404 }}
        onRetry={retry}
        notFoundLabel="Section"
      />
    );
  }

  const section = module.sections[index];
  const prev = module.sections[index - 1];
  const next = module.sections[index + 1];
  const total = module.sections.length;
  const number = String(index + 1).padStart(2, '0');
  const hasCheckpoint = section.blocks.some((b) => b.type === 'checkpoint');
  const isDone = completed?.has(section.id) ?? false;
  const nextHref = next ? `/learning/${module.slug}/${next.slug}` : `/quiz/${module.slug}`;

  const completeAndContinue = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeSection(section.id);
      await refresh();
      navigate(nextHref);
    } catch {
      setCompleteError('Could not save your progress. Try again.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="ls-lesson">
      <div className="ls-topbar">
        <Link to={`/learning/${module.slug}`} className="ls-link">
          Back to {module.code} {module.title}
        </Link>
        <div className="ls-position">
          <span>
            Section {index + 1} of {total}
          </span>
          <div
            className="ls-meter"
            role="progressbar"
            aria-label="Position in module"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
          >
            <div className="ls-meter-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="ls-lesson-body">
        <aside className={railOpen ? 'ls-rail ls-rail--open' : 'ls-rail'} aria-label="Sections in this module">
          <button
            type="button"
            className="ls-rail-toggle"
            aria-expanded={railOpen}
            aria-controls="ls-rail-list"
            onClick={() => setRailOpen((o) => !o)}
          >
            <span>
              Sections · {index + 1} of {total}
            </span>
            {railOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>
          <div className="ls-eyebrow ls-rail-head">SECTIONS</div>
          <div id="ls-rail-list" className="ls-rail-list">
            {module.sections.map((s, i) => (
              <Link
                key={s.id}
                to={`/learning/${module.slug}/${s.slug}`}
                className={i === index ? 'ls-rail-item ls-rail-item--current' : 'ls-rail-item'}
                aria-current={i === index ? 'page' : undefined}
              >
                <span className={completed?.has(s.id) ? 'ls-rail-dot ls-rail-dot--done' : 'ls-rail-dot'}>
                  {completed?.has(s.id) ? <Check size={12} aria-label="Completed" /> : <span aria-hidden="true">{i + 1}</span>}
                </span>
                {s.title}
              </Link>
            ))}
          </div>
        </aside>

        <main className="ls-main">
          <header>
            <div className="ls-eyebrow">
              {module.code} · SECTION {number}
            </div>
            <h1 className="ls-h1">{section.title}</h1>
          </header>

          {section.blocks.length === 0 && <p className="ls-muted">This section has no content yet.</p>}
          {section.blocks.map((b) => (
            <BlockRenderer key={b.id} block={b} sectionId={section.id} onCheckpointPassed={() => void refresh()} />
          ))}

          {escapeRoomScenarios
            .filter((sc) => sc.module_id === module.slug && sc.section_id === section.slug)
            .map((sc) => (
              <ScenarioLab key={sc.id} scenario={sc} />
            ))}

          <SectionReferences sources={section.sources} needsVerification={section.needs_verification} />

          <nav className="ls-pager" aria-label="Section navigation">
            {prev ? (
              <Link to={`/learning/${module.slug}/${prev.slug}`} className="ls-btn ls-btn--secondary">
                Previous: {prev.title}
              </Link>
            ) : (
              <span />
            )}
            <div className="ls-pager-actions">
              {hasCheckpoint && !isDone && <p className="ls-complete-hint">Answer the checkpoint to complete this section.</p>}
              {completeError && (
                <p className="ls-complete-hint" role="alert">
                  {completeError}
                </p>
              )}
              {!hasCheckpoint && !isDone ? (
                <button type="button" className="ls-btn ls-btn--primary" onClick={() => void completeAndContinue()} disabled={completing}>
                  {next ? `Complete and continue: ${next.title}` : 'Complete and take the module quiz'}
                </button>
              ) : (
                <Link to={nextHref} className="ls-btn ls-btn--primary">
                  {next ? `Next: ${next.title}` : 'Take the module quiz'}
                </Link>
              )}
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
};
