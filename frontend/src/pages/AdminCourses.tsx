import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { adminApi, describeError } from '@/features/admin/adminApi';
import type { AdminModule, AdminModuleRow, AdminOverview, AdminTrack, ContentStatus } from '@/features/admin/adminTypes';
import { ConfirmDialog, ModuleDialog, SectionDialog, TrackDialog } from '@/features/admin/AdminDialogs';
import '@/styles/lesson.css';
import '@/styles/admin.css';

const formatDate = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const StatusBadge: React.FC<{ status: ContentStatus }> = ({ status }) => (
  <span className={`ad-status ad-status--${status}`}>{status === 'published' ? 'Published' : 'Draft'}</span>
);

type Dialog =
  | { kind: 'track'; track?: AdminTrack }
  | { kind: 'module'; module?: AdminModuleRow; trackId: number }
  | { kind: 'section'; moduleId: number }
  | { kind: 'delete-track'; track: AdminTrack }
  | { kind: 'delete-module'; module: AdminModuleRow }
  | null;

const move = <T,>(items: T[], index: number, delta: -1 | 1): T[] | null => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return null;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const AdminCourses: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<AdminModule | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.overview();
      setOverview(data);
      setLoadError(null);
      setTrackId((current) => (current !== null && data.tracks.some((t) => t.id === current) ? current : data.tracks[0]?.id ?? null));
    } catch (err) {
      setLoadError(describeError(err));
    }
  }, []);

  const loadExpanded = useCallback(async (moduleId: number | null) => {
    if (moduleId === null) {
      setExpandedModule(null);
      return;
    }
    try {
      setExpandedModule(await adminApi.getModule(moduleId));
    } catch (err) {
      setNotice({ kind: 'error', text: describeError(err) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadExpanded(expanded);
  }, [expanded, loadExpanded]);

  const run = async (action: () => Promise<unknown>, okText?: string) => {
    try {
      await action();
      await load();
      await loadExpanded(expanded);
      setNotice(okText ? { kind: 'ok', text: okText } : null);
    } catch (err) {
      setNotice({ kind: 'error', text: describeError(err) });
    }
  };

  if (loadError) {
    return (
      <div className="ls-page">
        <div className="ls-card ls-state" role="alert">
          <h1 className="ls-card-title">Could not load course content</h1>
          <p className="ls-muted">{loadError}</p>
          <button type="button" className="ls-btn ls-btn--primary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!overview) {
    return (
      <div className="ls-page" role="status" aria-busy="true">
        <div className="ls-skeleton ls-skeleton--header" />
        <div className="ls-skeleton ls-skeleton--card" />
      </div>
    );
  }

  const track = overview.tracks.find((t) => t.id === trackId) ?? null;
  const stats = [
    { label: 'Tracks', value: overview.stats.tracks },
    { label: 'Modules', value: overview.stats.modules },
    { label: 'Sections', value: overview.stats.sections },
    { label: 'Draft sections', value: overview.stats.draft_sections },
  ];

  const trackIndex = overview.tracks.findIndex((t) => t.id === trackId);

  return (
    <div className="ls-page">
      <header className="ad-header">
        <div>
          <h1 className="ls-h1">Course management</h1>
          <p className="ls-muted">Create and edit tracks, modules and sections. Changes stay as drafts until published.</p>
        </div>
        <div className="ls-row">
          <button type="button" className="ls-btn ls-btn--secondary" onClick={() => setDialog({ kind: 'track' })}>
            <Plus size={15} aria-hidden="true" /> New track
          </button>
          <button
            type="button"
            className="ls-btn ls-btn--primary"
            disabled={!track}
            onClick={() => track && setDialog({ kind: 'module', trackId: track.id })}
          >
            <Plus size={15} aria-hidden="true" /> New module
          </button>
        </div>
      </header>

      {notice && (
        <div className={notice.kind === 'error' ? 'ad-banner ad-banner--error' : 'ad-banner'} role={notice.kind === 'error' ? 'alert' : 'status'}>
          {notice.text}
          <button type="button" className="ad-banner-close" onClick={() => setNotice(null)} aria-label="Dismiss">
            x
          </button>
        </div>
      )}

      <section className="ad-stats" aria-label="Content totals">
        {stats.map((s) => (
          <div key={s.label} className="ad-stat">
            <div className="ls-muted">{s.label}</div>
            <div className="ad-stat-value">{s.value}</div>
          </div>
        ))}
      </section>

      <div className="ad-layout">
        <aside className="ad-tracks" aria-label="Tracks">
          <div className="ls-eyebrow ad-muted-eyebrow">TRACKS</div>
          {overview.tracks.length === 0 && <p className="ls-muted">No tracks yet.</p>}
          {overview.tracks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === trackId ? 'ad-track ad-track--on' : 'ad-track'}
              onClick={() => {
                setTrackId(t.id);
                setExpanded(null);
              }}
              aria-current={t.id === trackId ? 'true' : undefined}
            >
              <span>
                {t.code} · {t.title}
              </span>
              <span className="ls-fineprint">{t.modules.length}</span>
            </button>
          ))}
        </aside>

        <section className="ad-table" aria-label="Modules">
          {!track ? (
            <p className="ls-muted ad-pad">Create a track to start adding modules.</p>
          ) : (
            <>
              <div className="ad-table-head">
                <div>
                  <div className="ls-eyebrow">{track.code.toUpperCase()}</div>
                  <div className="ad-track-title">
                    {track.title} <StatusBadge status={track.status} />
                  </div>
                </div>
                <div className="ls-row">
                  <button
                    type="button"
                    className="ls-btn ls-btn--secondary ad-small"
                    disabled={trackIndex <= 0}
                    onClick={() => {
                      const ids = move(overview.tracks.map((t) => t.id), trackIndex, -1);
                      if (ids) void run(() => adminApi.reorderTracks(ids));
                    }}
                  >
                    <ArrowUp size={14} aria-hidden="true" /> Track up
                  </button>
                  <button
                    type="button"
                    className="ls-btn ls-btn--secondary ad-small"
                    disabled={trackIndex < 0 || trackIndex >= overview.tracks.length - 1}
                    onClick={() => {
                      const ids = move(overview.tracks.map((t) => t.id), trackIndex, 1);
                      if (ids) void run(() => adminApi.reorderTracks(ids));
                    }}
                  >
                    <ArrowDown size={14} aria-hidden="true" /> Track down
                  </button>
                  <button type="button" className="ls-btn ls-btn--secondary ad-small" onClick={() => setDialog({ kind: 'track', track })}>
                    Track settings
                  </button>
                  <button
                    type="button"
                    className="ls-btn ls-btn--secondary ad-small"
                    onClick={() =>
                      void run(() => adminApi.updateTrack(track.id, { status: track.status === 'published' ? 'draft' : 'published' }))
                    }
                  >
                    {track.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" className="ls-btn ad-btn--danger ad-small" onClick={() => setDialog({ kind: 'delete-track', track })}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="ad-cols ad-cols--head" aria-hidden="true">
                <span />
                <span>MODULE</span>
                <span>SECTIONS</span>
                <span>STATUS</span>
                <span>UPDATED</span>
                <span />
              </div>

              {track.modules.length === 0 && <p className="ls-muted ad-pad">This track has no modules yet.</p>}
              {track.modules.map((m, i) => {
                const open = expanded === m.id;
                return (
                  <div key={m.id} className="ad-module">
                    <div className="ad-cols">
                      <button
                        type="button"
                        className="ad-iconbtn"
                        aria-expanded={open}
                        aria-label={`${open ? 'Collapse' : 'Expand'} ${m.code} ${m.title}`}
                        onClick={() => setExpanded(open ? null : m.id)}
                      >
                        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <span className="ad-module-name">
                        <span className="ad-code">{m.code}</span>
                        <span>{m.title}</span>
                      </span>
                      <span>
                        {m.section_count}
                        {m.draft_section_count > 0 && <span className="ls-fineprint"> ({m.draft_section_count} draft)</span>}
                      </span>
                      <span>
                        <StatusBadge status={m.status} />
                      </span>
                      <span className="ls-fineprint">{formatDate(m.updated_at)}</span>
                      <span className="ad-move">
                        <button
                          type="button"
                          className="ad-iconbtn"
                          disabled={i === 0}
                          aria-label={`Move ${m.code} up`}
                          onClick={() => {
                            const ids = move(track.modules.map((x) => x.id), i, -1);
                            if (ids) void run(() => adminApi.reorderModules(track.id, ids));
                          }}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          className="ad-iconbtn"
                          disabled={i === track.modules.length - 1}
                          aria-label={`Move ${m.code} down`}
                          onClick={() => {
                            const ids = move(track.modules.map((x) => x.id), i, 1);
                            if (ids) void run(() => adminApi.reorderModules(track.id, ids));
                          }}
                        >
                          <ArrowDown size={15} />
                        </button>
                      </span>
                    </div>

                    {open && (
                      <div className="ad-expanded">
                        <div className="ls-row">
                          <button type="button" className="ls-btn ls-btn--secondary ad-small" onClick={() => setDialog({ kind: 'module', module: m, trackId: track.id })}>
                            Module settings
                          </button>
                          <button
                            type="button"
                            className="ls-btn ls-btn--secondary ad-small"
                            onClick={() => void run(() => adminApi.updateModule(m.id, { status: m.status === 'published' ? 'draft' : 'published' }))}
                          >
                            {m.status === 'published' ? 'Unpublish module' : 'Publish module'}
                          </button>
                          <button type="button" className="ls-btn ls-btn--primary ad-small" onClick={() => setDialog({ kind: 'section', moduleId: m.id })}>
                            <Plus size={14} aria-hidden="true" /> Add section
                          </button>
                          <button type="button" className="ls-btn ad-btn--danger ad-small" onClick={() => setDialog({ kind: 'delete-module', module: m })}>
                            Delete module
                          </button>
                        </div>
                        {!expandedModule || expandedModule.id !== m.id ? (
                          <p className="ls-muted">Loading sections...</p>
                        ) : expandedModule.sections.length === 0 ? (
                          <p className="ls-muted">No sections yet.</p>
                        ) : (
                          <ol className="ad-sections">
                            {expandedModule.sections.map((s, si) => (
                              <li key={s.id} className="ad-section-row">
                                <span className="ad-section-title">{s.title}</span>
                                <StatusBadge status={s.status} />
                                <span className="ls-fineprint">{s.blocks.length} {s.blocks.length === 1 ? 'block' : 'blocks'}</span>
                                <span className="ad-move">
                                  <button
                                    type="button"
                                    className="ad-iconbtn"
                                    disabled={si === 0}
                                    aria-label={`Move section ${s.title} up`}
                                    onClick={() => {
                                      const ids = move(expandedModule.sections.map((x) => x.id), si, -1);
                                      if (ids) void run(() => adminApi.reorderSections(m.id, ids));
                                    }}
                                  >
                                    <ArrowUp size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="ad-iconbtn"
                                    disabled={si === expandedModule.sections.length - 1}
                                    aria-label={`Move section ${s.title} down`}
                                    onClick={() => {
                                      const ids = move(expandedModule.sections.map((x) => x.id), si, 1);
                                      if (ids) void run(() => adminApi.reorderSections(m.id, ids));
                                    }}
                                  >
                                    <ArrowDown size={15} />
                                  </button>
                                </span>
                                <Link to={`/admin/modules/${m.id}/sections/${s.id}`} className="ls-btn ls-btn--secondary ad-small">
                                  Edit
                                </Link>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </section>
      </div>

      {dialog?.kind === 'track' && (
        <TrackDialog
          track={dialog.track}
          onClose={() => setDialog(null)}
          onSubmit={async (value) => {
            if (dialog.track) await adminApi.updateTrack(dialog.track.id, value);
            else {
              const created = await adminApi.createTrack(value);
              setTrackId(created.id);
            }
            setDialog(null);
            await load();
            setNotice({ kind: 'ok', text: dialog.track ? 'Track saved.' : 'Track created.' });
          }}
        />
      )}
      {dialog?.kind === 'module' && (
        <ModuleDialog
          module={dialog.module}
          trackId={dialog.trackId}
          onClose={() => setDialog(null)}
          onSubmit={async (value) => {
            if (dialog.module) await adminApi.updateModule(dialog.module.id, value);
            else await adminApi.createModule(value);
            setDialog(null);
            await load();
            await loadExpanded(expanded);
            setNotice({ kind: 'ok', text: dialog.module ? 'Module saved.' : 'Module created.' });
          }}
        />
      )}
      {dialog?.kind === 'section' && (
        <SectionDialog
          onClose={() => setDialog(null)}
          onSubmit={async ({ title, slug }) => {
            const created = await adminApi.createSection({ module_id: dialog.moduleId, title, slug });
            setDialog(null);
            await load();
            await loadExpanded(expanded);
            setNotice({ kind: 'ok', text: `Section "${created.title}" created as a draft.` });
          }}
        />
      )}
      {dialog?.kind === 'delete-track' && (
        <ConfirmDialog
          danger
          title={`Delete ${dialog.track.title}?`}
          message={`This permanently deletes the track, its ${dialog.track.modules.length} modules and all their sections. It is recorded in the audit log but cannot be undone.`}
          confirmLabel="Delete track"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            const id = dialog.track.id;
            setDialog(null);
            setExpanded(null);
            void run(() => adminApi.deleteTrack(id), 'Track deleted.');
          }}
        />
      )}
      {dialog?.kind === 'delete-module' && (
        <ConfirmDialog
          danger
          title={`Delete ${dialog.module.code} ${dialog.module.title}?`}
          message={`This permanently deletes the module and its ${dialog.module.section_count} sections. It cannot be undone.`}
          confirmLabel="Delete module"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            const id = dialog.module.id;
            setDialog(null);
            setExpanded(null);
            void run(() => adminApi.deleteModule(id), 'Module deleted.');
          }}
        />
      )}
    </div>
  );
};
