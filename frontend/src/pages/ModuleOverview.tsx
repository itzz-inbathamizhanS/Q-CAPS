import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, Trophy } from 'lucide-react';
import { useCurriculumStore } from '@/features/curriculum/curriculumStore';
import { fetchModule, fetchTracks } from '@/features/lesson/lessonApi';
import { useContent } from '@/features/lesson/useContent';
import { useProgress } from '@/features/lesson/useProgress';
import { LessonError, LessonLoading } from '@/features/lesson/LessonStates';
import type { LessonSection } from '@/features/lesson/lessonTypes';
import { isBuiltVisual } from '@/features/lesson/blocks/visualRegistry';
import '@/styles/lesson.css';

const formatDuration = (minutes: number) => {
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `About ${h} h${m ? ` ${m} min` : ''}` : `About ${m} min`;
};

/** Chips describe what a section contains, derived from its stored blocks. */
const sectionChips = (s: LessonSection): string[] => {
  const types = new Set(s.blocks.map((b) => b.type));
  const chips: string[] = [];
  if (types.has('video')) chips.push('Video');
  // Only visuals learners can actually see count; described-but-unbuilt ones are hidden.
  const built = s.blocks.filter((b) => b.type === 'visual' && isBuiltVisual(b.kind));
  if (built.some((b) => b.type === 'visual' && b.simulation)) chips.push('Simulation');
  else if (built.length > 0) chips.push('Visual');
  if (types.has('text') || types.has('code') || types.has('callout')) chips.push('Reading');
  if (types.has('checkpoint')) chips.push('Checkpoint');
  return chips;
};

const blurb = (s: LessonSection): string => {
  if (s.summary) return s.summary;
  const text = s.blocks.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') return '';
  const plain = text.markdown
    .replace(/^\s*(?:[-*>#]+\s+)/gm, '')
    .replace(/[`*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 140 ? `${plain.slice(0, 137)}...` : plain;
};

export const ModuleOverview: React.FC = () => {
  const { moduleId = '' } = useParams<{ moduleId: string }>();
  const { isModuleUnlocked } = useCurriculumStore();
  const { data: module, error, loading, retry } = useContent(`module:${moduleId}`, () => fetchModule(moduleId));
  const { data: tracks } = useContent('tracks', fetchTracks);
  const { completed: sectionDone } = useProgress(moduleId);

  const titleOf = useMemo(() => {
    const map = new Map<string, string>();
    tracks?.forEach((t) => t.modules.forEach((m) => map.set(m.slug, `${m.code} ${m.title}`)));
    return (slug: string) => map.get(slug) ?? slug;
  }, [tracks]);

  if (loading) return <LessonLoading label="Loading module" />;
  if (error || !module) {
    return (
      <LessonError
        error={error ?? { name: 'Error', message: 'No data.', status: 0 }}
        onRetry={retry}
        notFoundLabel="Module"
      />
    );
  }

  if (!isModuleUnlocked(module.slug)) {
    return (
      <div className="ls-page">
        <div className="ls-card ls-state" role="status">
          <Lock size={28} aria-hidden="true" />
          <h1 className="ls-card-title">
            {module.code} {module.title} is locked
          </h1>
          <p className="ls-muted">Complete the prerequisite modules first:</p>
          <ul className="ls-list">
            {module.prerequisites.map((p) => (
              <li key={p}>
                <Link to={`/learning/${p}`} className="ls-link">
                  {titleOf(p)}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/curriculum" className="ls-btn ls-btn--secondary">
            Back to curriculum
          </Link>
        </div>
      </div>
    );
  }

  const first = module.sections[0];
  const doneCount = sectionDone ? module.sections.filter((s) => sectionDone.has(s.id)).length : null;
  const nextUp = sectionDone ? module.sections.find((s) => !sectionDone.has(s.id)) ?? null : first ?? null;
  const started = doneCount !== null && doneCount > 0;
  const allDone = doneCount !== null && module.sections.length > 0 && doneCount === module.sections.length;
  const duration = formatDuration(module.estimated_minutes);

  return (
    <div className="ls-page">
      <nav className="ls-breadcrumb" aria-label="Breadcrumb">
        <Link to="/curriculum">Curriculum</Link>
        <span aria-hidden="true">/</span>
        <span>
          {module.track.code} · {module.track.title}
        </span>
        <span aria-hidden="true">/</span>
        <span className="ls-breadcrumb-current" aria-current="page">
          {module.code} {module.title}
        </span>
      </nav>

      <header className="ls-card ls-hero">
        <div className="ls-hero-main">
          <div className="ls-eyebrow">
            MODULE {module.code}
            {module.level ? ` · ${module.level.toUpperCase()}` : ''}
          </div>
          <h1 className="ls-h1">{module.title}</h1>
          {module.learning_objectives.length > 0 && (
            <>
              <p className="ls-muted ls-hero-lead">By the end of this module you can:</p>
              <ul className="ls-list ls-objectives">
                {module.learning_objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </>
          )}
          <div className="ls-pills">
            <span className="ls-pill">{module.sections.length} sections</span>
            {duration && <span className="ls-pill">{duration}</span>}
            <span className="ls-pill ls-pill--accent">+{module.xp} XP</span>
            {allDone && <span className="ls-pill ls-pill--done">All sections complete</span>}
          </div>
        </div>
        <div className="ls-hero-side">
          {doneCount !== null && module.sections.length > 0 && (
            <div className="ls-progress">
              <div className="ls-progress-row">
                <span className="ls-muted">Your progress</span>
                <strong>
                  {doneCount} of {module.sections.length} sections
                </strong>
              </div>
              <div
                className="ls-meter ls-meter--wide"
                role="progressbar"
                aria-label="Sections completed"
                aria-valuemin={0}
                aria-valuemax={module.sections.length}
                aria-valuenow={doneCount}
              >
                <div className="ls-meter-fill" style={{ width: `${(doneCount / module.sections.length) * 100}%` }} />
              </div>
            </div>
          )}
          {nextUp ? (
            <Link to={`/learning/${module.slug}/${nextUp.slug}`} className="ls-btn ls-btn--primary ls-btn--block">
              {started ? 'Continue' : 'Start'}: {nextUp.title}
            </Link>
          ) : first ? (
            <Link to={`/learning/${module.slug}/${first.slug}`} className="ls-btn ls-btn--secondary ls-btn--block">
              Review from the start
            </Link>
          ) : (
            <p className="ls-muted">No sections have been published for this module yet.</p>
          )}
          <Link to={`/quiz/${module.slug}`} className="ls-btn ls-btn--secondary ls-btn--block">
            <Trophy size={16} aria-hidden="true" /> Take the module quiz
          </Link>
        </div>
      </header>

      <section aria-labelledby="ls-sections-heading">
        <div className="ls-section-head">
          <h2 id="ls-sections-heading" className="ls-card-title">
            Sections
          </h2>
          <span className="ls-fineprint">Video · Simulation · Reading · Checkpoint</span>
        </div>
        {module.sections.length === 0 ? (
          <div className="ls-card ls-state">
            <p className="ls-muted">This module has no published sections yet.</p>
          </div>
        ) : (
          <div className="ls-grid">
            {module.sections.map((s, i) => (
              <Link key={s.id} to={`/learning/${module.slug}/${s.slug}`} className="ls-section-card">
                <span className="ls-thumb" aria-hidden="true">
                  {s.estimated_minutes ? `${s.estimated_minutes} min` : String(i + 1).padStart(2, '0')}
                </span>
                <span className="ls-section-body">
                  <span className="ls-mono ls-muted">SECTION {String(i + 1).padStart(2, '0')}</span>
                  <span className="ls-section-title">{s.title}</span>
                  {blurb(s) && <span className="ls-muted ls-blurb">{blurb(s)}</span>}
                  <span className="ls-chips">
                    {sectionChips(s).map((c) => (
                      <span key={c} className={c === 'Simulation' ? 'ls-chip ls-chip--sim' : 'ls-chip'}>
                        {c}
                      </span>
                    ))}
                    {sectionDone && (
                      <span className={sectionDone.has(s.id) ? 'ls-chip ls-chip--done' : 'ls-chip ls-chip--todo'}>
                        {sectionDone.has(s.id) ? 'Completed' : 'Not started'}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
