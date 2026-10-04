import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, Plus, X } from 'lucide-react';
import { adminApi, AdminApiError, describeError } from '@/features/admin/adminApi';
import type { AdminBlock, AdminModule, AdminSection, ChecklistItem, SectionUpdateBody } from '@/features/admin/adminTypes';
import { BlockEditor } from '@/features/admin/BlockEditor';
import { requiredFieldProblems, toPayload } from '@/features/admin/blockEditorModel';
import { ConfirmDialog, SectionDialog } from '@/features/admin/AdminDialogs';
import { BlockRenderer } from '@/features/lesson/blocks/BlockRenderer';
import '@/styles/lesson.css';
import '@/styles/admin.css';

const snapshot = (title: string, blocks: AdminBlock[], summary: string, minutes: string) =>
  JSON.stringify({ title, summary: summary.trim(), minutes: minutes.trim(), blocks: toPayload(blocks) });

const minutesText = (n: number | null) => (n ? String(n) : '');

export const AdminSectionEditor: React.FC = () => {
  const { moduleId = '', sectionId = '' } = useParams<{ moduleId: string; sectionId: string }>();
  const navigate = useNavigate();
  const moduleNum = Number(moduleId);
  const sectionNum = Number(sectionId);

  const [module, setModule] = useState<AdminModule | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<AdminBlock[]>([]);
  const [summary, setSummary] = useState('');
  const [minutes, setMinutes] = useState('');
  const [liveChecklist, setLiveChecklist] = useState<ChecklistItem[] | null>(null);
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'error' | 'ok'; text: string; list?: string[] } | null>(null);
  const [problems, setProblems] = useState<Record<number, string[]>>({});
  const [failedChecklist, setFailedChecklist] = useState<ChecklistItem[]>([]);
  const [dialog, setDialog] = useState<'add' | 'delete' | null>(null);

  const section: AdminSection | undefined = module?.sections.find((s) => s.id === sectionNum);

  const loadModule = useCallback(async () => {
    try {
      setModule(await adminApi.getModule(moduleNum));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof AdminApiError && err.status === 404 ? 'This module no longer exists.' : describeError(err));
    }
  }, [moduleNum]);

  useEffect(() => {
    void loadModule();
  }, [loadModule]);

  // Start a fresh draft whenever a different section is opened (not on every save).
  useEffect(() => {
    if (section && loadedFor !== section.id) {
      setTitle(section.title);
      setBlocks(section.blocks);
      setSummary(section.summary ?? '');
      setMinutes(minutesText(section.estimated_minutes));
      setLiveChecklist(null);
      setLoadedFor(section.id);
      setProblems({});
      setFailedChecklist([]);
      setBanner(null);
      setPreview(false);
    }
  }, [section, loadedFor]);

  const dirty = useMemo(
    () => !!section && loadedFor === section.id && snapshot(title, blocks, summary, minutes) !==
        snapshot(section.title, section.blocks, section.summary ?? '', minutesText(section.estimated_minutes)),
    [section, loadedFor, title, blocks, summary, minutes],
  );

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Dry-run the publish checklist on the server while the draft has unsaved edits.
  // Invalid drafts (e.g. a blank block) are rejected by validation; the last result stays.
  useEffect(() => {
    if (!dirty) {
      setLiveChecklist(null);
      return;
    }
    const handle = window.setTimeout(() => {
      adminApi.checklist(title, toPayload(blocks)).then(
        (r) => setLiveChecklist(r.checklist),
        () => undefined,
      );
    }, 600);
    return () => window.clearTimeout(handle);
  }, [dirty, title, blocks]);

  const applyServerError = (err: unknown) => {
    setProblems({});
    setFailedChecklist([]);
    if (err instanceof AdminApiError && err.issues.length > 0) {
      const byBlock: Record<number, string[]> = {};
      const general: string[] = [];
      for (const issue of err.issues) {
        const [scope, index, ...rest] = issue.loc;
        if (scope === 'blocks' && typeof index === 'number') {
          (byBlock[index] ??= []).push(`${rest.filter((p) => typeof p === 'string').join(' ')}: ${issue.msg}`.replace(/^: /, ''));
        } else {
          general.push(`${issue.loc.join(' ')}: ${issue.msg}`);
        }
      }
      setProblems(byBlock);
      setBanner({ kind: 'error', text: 'Fix the highlighted fields and try again.', list: general });
    } else if (err instanceof AdminApiError && err.checklist.length > 0) {
      setFailedChecklist(err.checklist);
      setBanner({ kind: 'error', text: 'This section cannot be published yet.', list: err.checklist.map((c) => c.detail ?? c.label) });
    } else {
      setBanner({ kind: 'error', text: describeError(err) });
    }
  };

  const save = async (status?: 'published' | 'draft') => {
    if (!section) return;
    const missing = status === 'draft' ? [] : requiredFieldProblems(blocks);
    if (missing.length > 0 || !title.trim()) {
      setBanner({ kind: 'error', text: 'Some required fields are empty.', list: [...(title.trim() ? [] : ['Section title is required']), ...missing] });
      return;
    }
    const minutesValue = minutes.trim() === '' ? null : Number(minutes);
    if (status !== 'draft' && minutesValue !== null && (!Number.isInteger(minutesValue) || minutesValue < 1 || minutesValue > 600)) {
      setBanner({ kind: 'error', text: 'Estimated minutes must be a whole number between 1 and 600.' });
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      const body: SectionUpdateBody =
        status === 'draft'
          ? { status }
          : {
              title: title.trim(),
              summary: summary.trim() || null,
              estimated_minutes: minutesValue,
              blocks: toPayload(blocks),
              ...(status ? { status } : {}),
            };
      const updated = await adminApi.updateSection(section.id, body);
      setModule((m) => (m ? { ...m, sections: m.sections.map((s) => (s.id === updated.id ? updated : s)) } : m));
      if (status !== 'draft') {
        setTitle(updated.title);
        setBlocks(updated.blocks);
        setSummary(updated.summary ?? '');
        setMinutes(minutesText(updated.estimated_minutes));
      }
      setProblems({});
      setFailedChecklist([]);
      setBanner({
        kind: 'ok',
        text: status === 'published' ? 'Published. Learners can see this section.' : status === 'draft' ? 'Unpublished. Hidden from learners.' : 'Saved.',
      });
    } catch (err) {
      applyServerError(err);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = async (index: number, delta: -1 | 1) => {
    if (!module) return;
    const ids = module.sections.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await adminApi.reorderSections(module.id, ids);
      await loadModule();
    } catch (err) {
      setBanner({ kind: 'error', text: describeError(err) });
    }
  };

  if (loadError) {
    return (
      <div className="ls-page">
        <div className="ls-card ls-state" role="alert">
          <h1 className="ls-card-title">Could not open the editor</h1>
          <p className="ls-muted">{loadError}</p>
          <Link to="/admin" className="ls-btn ls-btn--secondary">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }
  if (!module) {
    return (
      <div className="ls-page" role="status" aria-busy="true">
        <div className="ls-skeleton ls-skeleton--header" />
      </div>
    );
  }
  if (!section) {
    return (
      <div className="ls-page">
        <div className="ls-card ls-state" role="alert">
          <h1 className="ls-card-title">Section not found</h1>
          <Link to="/admin" className="ls-btn ls-btn--secondary">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const checklist = failedChecklist.length > 0 ? failedChecklist : liveChecklist ?? section.checklist;
  const allPass = checklist.every((c) => c.ok);
  const published = section.status === 'published';

  return (
    <div className="ls-lesson adm-editor">
      <div className="ls-topbar adm-topbar">
        <nav className="ls-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin" className="ls-link">
            Courses
          </Link>
          <span aria-hidden="true">/</span>
          <span>
            {module.code} {module.title}
          </span>
          <span aria-hidden="true">/</span>
          <span className="ls-breadcrumb-current" aria-current="page">
            {section.title}
          </span>
        </nav>
        <div className="ls-row adm-topbar-actions">
          <span className="ls-fineprint" role="status">
            {dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button type="button" className="ls-btn ls-btn--secondary" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
            {preview ? 'Back to editing' : 'Preview'}
          </button>
          <button type="button" className="ls-btn ls-btn--secondary" onClick={() => void save()} disabled={saving || !dirty}>
            {published ? 'Save changes' : 'Save draft'}
          </button>
          {published ? (
            <button type="button" className="ls-btn ls-btn--secondary" onClick={() => void save('draft')} disabled={saving}>
              Unpublish
            </button>
          ) : (
            <button type="button" className="ls-btn ls-btn--primary" onClick={() => void save('published')} disabled={saving}>
              Publish
            </button>
          )}
        </div>
      </div>

      {banner && (
        <div className={banner.kind === 'error' ? 'adm-banner adm-banner--error' : 'adm-banner'} role={banner.kind === 'error' ? 'alert' : 'status'}>
          <div>
            {banner.text}
            {banner.list && banner.list.length > 0 && (
              <ul className="adm-banner-list">
                {banner.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="adm-banner-close" onClick={() => setBanner(null)} aria-label="Dismiss">
            x
          </button>
        </div>
      )}

      <div className="ls-lesson-body adm-editor-body">
        <aside className="ls-rail adm-rail" aria-label="Sections in this module">
          <div className="adm-rail-head">
            <span className="ls-eyebrow adm-muted-eyebrow">SECTIONS</span>
            <button type="button" className="adm-linkbtn" onClick={() => setDialog('add')}>
              <Plus size={13} aria-hidden="true" /> Add
            </button>
          </div>
          {module.sections.map((s, i) => (
            <div key={s.id} className={s.id === section.id ? 'adm-rail-row adm-rail-row--on' : 'adm-rail-row'}>
              <Link to={`/admin/modules/${module.id}/sections/${s.id}`} className="adm-rail-link" aria-current={s.id === section.id ? 'page' : undefined}>
                <span className={`adm-dot adm-dot--${s.status}`} title={s.status} aria-label={s.status} />
                {s.title}
              </Link>
              <span className="adm-move">
                <button type="button" className="adm-iconbtn" disabled={i === 0} onClick={() => void moveSection(i, -1)} aria-label={`Move ${s.title} up`}>
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="adm-iconbtn"
                  disabled={i === module.sections.length - 1}
                  onClick={() => void moveSection(i, 1)}
                  aria-label={`Move ${s.title} down`}
                >
                  <ArrowDown size={14} />
                </button>
              </span>
            </div>
          ))}
        </aside>

        <main className="adm-editor-main">
          {preview ? (
            <div className="ls-main adm-preview">
              <div className="ls-eyebrow">PREVIEW · INCLUDES UNSAVED EDITS · CHECKPOINTS ARE NOT GRADED HERE</div>
              <h1 className="ls-h1">{title || 'Untitled section'}</h1>
              {blocks.map((b) => (
                <BlockRenderer key={b.id} block={b} sectionId={section.id} preview />
              ))}
              {blocks.length === 0 && <p className="ls-muted">No blocks yet.</p>}
            </div>
          ) : (
            <>
              <section className="adm-panel">
                <label className="adm-field">
                  <span className="adm-field-label">Section title</span>
                  <input className="adm-input adm-title-input" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
                </label>
              </section>
              <div className="adm-blocks-head">
                <h2 className="adm-h2">Content blocks</h2>
                <span className="ls-fineprint">Shown to learners in this order</span>
              </div>
              <BlockEditor blocks={blocks} onChange={setBlocks} problems={problems} />
            </>
          )}
        </main>

        <aside className="adm-side">
          <section className="adm-panel">
            <div className="ls-eyebrow adm-muted-eyebrow">SECTION SETTINGS</div>
            <div className="adm-kv">
              <span className="ls-muted">Status</span>
              <span className={`adm-status adm-status--${section.status}`}>{published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="adm-kv">
              <span className="ls-muted">URL slug</span>
              <code className="adm-mono">{section.slug}</code>
            </div>
            <label className="adm-field">
              <span className="adm-field-label">Summary on the module overview</span>
              <textarea className="adm-input adm-textarea" rows={3} maxLength={300} value={summary} onChange={(e) => setSummary(e.target.value)} />
              <span className="adm-hint">Optional. Falls back to the start of the first text block.</span>
            </label>
            <label className="adm-field">
              <span className="adm-field-label">Estimated minutes</span>
              <input
                className="adm-input"
                type="number"
                min={1}
                max={600}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </label>
            {published && (
              <Link to={`/learning/${module.slug}/${section.slug}`} className="ls-link" target="_blank" rel="noopener noreferrer">
                View as learner
              </Link>
            )}
            <button type="button" className="ls-btn adm-btn--danger" onClick={() => setDialog('delete')}>
              Delete section
            </button>
          </section>

          <section className="adm-panel" aria-labelledby="adm-checklist-title">
            <div id="adm-checklist-title" className="ls-eyebrow adm-muted-eyebrow">
              PUBLISH CHECKLIST
            </div>
            <ul className="adm-checklist">
              {checklist.map((c) => (
                <li key={c.id} className={c.ok ? 'adm-check-ok' : 'adm-check-fail'}>
                  {c.ok ? <Check size={15} aria-label="Passes" /> : <X size={15} aria-label="Needs attention" />}
                  <span>
                    {c.label}
                    {c.detail && <span className="adm-hint"> {c.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="adm-hint">
              {allPass ? 'Ready to publish.' : 'Publishing is blocked until every item passes.'}{' '}
              {dirty ? (liveChecklist ? 'Updates as you edit.' : 'Fix the highlighted fields to refresh it.') : 'Matches the saved version.'}
            </p>
          </section>
        </aside>
      </div>

      {dialog === 'add' && (
        <SectionDialog
          onClose={() => setDialog(null)}
          onSubmit={async ({ title: t, slug }) => {
            const created = await adminApi.createSection({ module_id: module.id, title: t, slug });
            setDialog(null);
            await loadModule();
            navigate(`/admin/modules/${module.id}/sections/${created.id}`);
          }}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmDialog
          danger
          title={`Delete "${section.title}"?`}
          message="This permanently deletes the section and its blocks. It is recorded in the audit log but cannot be undone."
          confirmLabel="Delete section"
          onCancel={() => setDialog(null)}
          onConfirm={async () => {
            try {
              await adminApi.deleteSection(section.id);
              setBlocks(section.blocks);
              setTitle(section.title);
              navigate('/admin');
            } catch (err) {
              setDialog(null);
              setBanner({ kind: 'error', text: describeError(err) });
            }
          }}
        />
      )}
      {blocker.state === 'blocked' && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="You have edits that are not saved. Leaving this section will lose them."
          confirmLabel="Discard and leave"
          danger
          onCancel={() => blocker.reset()}
          onConfirm={() => blocker.proceed()}
        />
      )}
    </div>
  );
};
