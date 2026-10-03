import React, { useEffect, useRef, useState } from 'react';
import type {
  AdminModuleRow,
  AdminTrack,
  ContentStatus,
  ModuleInput,
  TrackInput,
} from './adminTypes';
import { AdminApiError } from './adminApi';
import { slugify } from './slug';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect: callers pass a new function
  // every render, and re-running would steal focus back to the first field while typing.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, []);

  return (
    <div className="ad-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="ad-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="ls-card-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel, danger, onConfirm, onCancel }) => (
  <Modal title={title} onClose={onCancel}>
    <p className="ls-muted">{message}</p>
    <div className="ad-modal-actions">
      <button type="button" className="ls-btn ls-btn--secondary" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" className={`ls-btn ${danger ? 'ad-btn--danger' : 'ls-btn--primary'}`} onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

const StatusSelect: React.FC<{ value: ContentStatus; onChange: (s: ContentStatus) => void }> = ({ value, onChange }) => (
  <label className="ad-field">
    <span className="ad-field-label">Status</span>
    <select className="ad-input" value={value} onChange={(e) => onChange(e.target.value as ContentStatus)}>
      <option value="draft">Draft (hidden from learners)</option>
      <option value="published">Published</option>
    </select>
  </label>
);

function ServerErrors({ error }: { error: AdminApiError | null }) {
  if (!error) return null;
  return (
    <div className="ad-problems" role="alert">
      <strong>{error.message}</strong>
      {error.issues.length > 0 && (
        <ul>
          {error.issues.map((i) => (
            <li key={i.loc.join('.') + i.msg}>
              {i.loc.join(' / ')}: {i.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FormProps<T> {
  onSubmit: (value: T) => Promise<void>;
  onClose: () => void;
}

const useSubmit = (action: () => Promise<void>) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminApiError | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof AdminApiError ? err : new AdminApiError('Something went wrong.', 0));
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, submit };
};

const Actions: React.FC<{ busy: boolean; onClose: () => void; label: string }> = ({ busy, onClose, label }) => (
  <div className="ad-modal-actions">
    <button type="button" className="ls-btn ls-btn--secondary" onClick={onClose}>
      Cancel
    </button>
    <button type="submit" className="ls-btn ls-btn--primary" disabled={busy}>
      {busy ? 'Saving...' : label}
    </button>
  </div>
);

export const TrackDialog: React.FC<FormProps<TrackInput> & { track?: AdminTrack }> = ({ track, onSubmit, onClose }) => {
  const [slug, setSlug] = useState(track?.slug ?? '');
  const [code, setCode] = useState(track?.code ?? '');
  const [title, setTitle] = useState(track?.title ?? '');
  const [subtitle, setSubtitle] = useState(track?.subtitle ?? '');
  const [description, setDescription] = useState(track?.description ?? '');
  const [color, setColor] = useState(track?.accent_color ?? '');
  const [status, setStatus] = useState<ContentStatus>(track?.status ?? 'draft');
  const [meta, setMeta] = useState({
    entry_profile: track?.meta?.entry_profile ?? '',
    certificate_name: track?.meta?.certificate_name ?? '',
    certificate_code: track?.meta?.certificate_code ?? '',
    capstone_title: track?.meta?.capstone_title ?? '',
    capstone_description: track?.meta?.capstone_description ?? '',
  });
  const setMetaField = (key: keyof typeof meta) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setMeta((m) => ({ ...m, [key]: e.target.value }));

  const { busy, error, submit } = useSubmit(() =>
    onSubmit({
      ...(track ? {} : { slug: slug.replace(/_/g, '-') }),
      code,
      title,
      subtitle: subtitle || null,
      description: description || null,
      accent_color: color || null,
      meta: Object.fromEntries(Object.entries(meta).filter(([, v]) => v.trim() !== '')),
      status,
    }),
  );

  return (
    <Modal title={track ? 'Track settings' : 'New track'} onClose={onClose}>
      <form onSubmit={submit} className="ad-form">
        <div className="ad-row">
          <label className="ad-field">
            <span className="ad-field-label">Code</span>
            <input className="ad-input" value={code} required maxLength={50} onChange={(e) => setCode(e.target.value)} placeholder="Track E" />
          </label>
          <label className="ad-field">
            <span className="ad-field-label">Title</span>
            <input
              className="ad-input"
              value={title}
              required
              maxLength={200}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!track) setSlug(slugify(e.target.value));
              }}
            />
          </label>
        </div>
        {!track && (
          <label className="ad-field">
            <span className="ad-field-label">URL slug</span>
            <input className="ad-input ad-mono" value={slug} required pattern="[a-z0-9][a-z0-9_\-]*" onChange={(e) => setSlug(e.target.value)} />
            <span className="ad-hint">Lowercase letters, numbers, - and _. Cannot be changed later.</span>
          </label>
        )}
        <label className="ad-field">
          <span className="ad-field-label">Subtitle</span>
          <input className="ad-input" value={subtitle} maxLength={300} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        <label className="ad-field">
          <span className="ad-field-label">Description</span>
          <textarea className="ad-input ad-textarea" rows={3} value={description} maxLength={4000} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="ad-row">
          <label className="ad-field">
            <span className="ad-field-label">Accent colour</span>
            <input type="color" className="ad-color" value={color || '#5427e6'} onChange={(e) => setColor(e.target.value)} />
          </label>
          <StatusSelect value={status} onChange={setStatus} />
        </div>
        <details className="ad-details">
          <summary>Certificate and capstone details</summary>
          <div className="ad-form">
            <label className="ad-field">
              <span className="ad-field-label">Entry profile</span>
              <textarea className="ad-input ad-textarea" rows={2} maxLength={1000} value={meta.entry_profile} onChange={setMetaField('entry_profile')} />
            </label>
            <div className="ad-row">
              <label className="ad-field">
                <span className="ad-field-label">Certificate name</span>
                <input className="ad-input" maxLength={200} value={meta.certificate_name} onChange={setMetaField('certificate_name')} />
              </label>
              <label className="ad-field">
                <span className="ad-field-label">Certificate code</span>
                <input className="ad-input" maxLength={100} value={meta.certificate_code} onChange={setMetaField('certificate_code')} />
              </label>
            </div>
            <label className="ad-field">
              <span className="ad-field-label">Capstone title</span>
              <input className="ad-input" maxLength={200} value={meta.capstone_title} onChange={setMetaField('capstone_title')} />
            </label>
            <label className="ad-field">
              <span className="ad-field-label">Capstone description</span>
              <textarea className="ad-input ad-textarea" rows={2} maxLength={1000} value={meta.capstone_description} onChange={setMetaField('capstone_description')} />
            </label>
          </div>
        </details>
        <ServerErrors error={error} />
        <Actions busy={busy} onClose={onClose} label={track ? 'Save track' : 'Create track'} />
      </form>
    </Modal>
  );
};

const LEVELS = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Enterprise'];

export const ModuleDialog: React.FC<FormProps<ModuleInput> & { module?: AdminModuleRow; trackId: number }> = ({
  module,
  trackId,
  onSubmit,
  onClose,
}) => {
  const [slug, setSlug] = useState(module?.slug ?? '');
  const [code, setCode] = useState(module?.code ?? '');
  const [title, setTitle] = useState(module?.title ?? '');
  const [subtitle, setSubtitle] = useState(module?.subtitle ?? '');
  const [level, setLevel] = useState(module?.level ?? 'Beginner');
  const [minutes, setMinutes] = useState(String(module?.estimated_minutes ?? 60));
  const [xp, setXp] = useState(String(module?.xp ?? 100));
  const [prereqs, setPrereqs] = useState((module?.prerequisites ?? []).join(', '));
  const [objectives, setObjectives] = useState((module?.learning_objectives ?? []).join('\n'));
  const [status, setStatus] = useState<ContentStatus>(module?.status ?? 'draft');

  const { busy, error, submit } = useSubmit(() =>
    onSubmit({
      ...(module ? {} : { track_id: trackId, slug }),
      code,
      title,
      subtitle: subtitle || null,
      level: level || null,
      estimated_minutes: Number(minutes) || 0,
      xp: Number(xp) || 0,
      prerequisites: prereqs.split(',').map((p) => p.trim()).filter(Boolean),
      learning_objectives: objectives.split('\n').map((o) => o.trim()).filter(Boolean),
      status,
    }),
  );

  return (
    <Modal title={module ? 'Module settings' : 'New module'} onClose={onClose}>
      <form onSubmit={submit} className="ad-form">
        <div className="ad-row">
          <label className="ad-field">
            <span className="ad-field-label">Code</span>
            <input className="ad-input" value={code} required maxLength={20} onChange={(e) => setCode(e.target.value)} placeholder="A9" />
          </label>
          <label className="ad-field">
            <span className="ad-field-label">Title</span>
            <input
              className="ad-input"
              value={title}
              required
              maxLength={200}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!module) setSlug(slugify(`${code} ${e.target.value}`));
              }}
            />
          </label>
        </div>
        {!module && (
          <label className="ad-field">
            <span className="ad-field-label">URL slug</span>
            <input className="ad-input ad-mono" value={slug} required pattern="[a-z0-9][a-z0-9_\-]*" onChange={(e) => setSlug(e.target.value)} />
            <span className="ad-hint">Used in learner URLs and prerequisites. Cannot be changed later.</span>
          </label>
        )}
        <label className="ad-field">
          <span className="ad-field-label">Subtitle</span>
          <input className="ad-input" value={subtitle} maxLength={300} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        <div className="ad-row ad-row--3">
          <label className="ad-field">
            <span className="ad-field-label">Level</span>
            <select className="ad-input" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span className="ad-field-label">Estimated minutes</span>
            <input className="ad-input" type="number" min={0} max={3000} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </label>
          <label className="ad-field">
            <span className="ad-field-label">XP</span>
            <input className="ad-input" type="number" min={0} max={10000} value={xp} onChange={(e) => setXp(e.target.value)} />
          </label>
        </div>
        <label className="ad-field">
          <span className="ad-field-label">Prerequisite module slugs</span>
          <input className="ad-input ad-mono" value={prereqs} onChange={(e) => setPrereqs(e.target.value)} placeholder="track_a_a2_mathematics_foundations" />
          <span className="ad-hint">Comma separated.</span>
        </label>
        <label className="ad-field">
          <span className="ad-field-label">Learning objectives</span>
          <textarea className="ad-input ad-textarea" rows={4} value={objectives} onChange={(e) => setObjectives(e.target.value)} />
          <span className="ad-hint">One per line.</span>
        </label>
        <StatusSelect value={status} onChange={setStatus} />
        <ServerErrors error={error} />
        <Actions busy={busy} onClose={onClose} label={module ? 'Save module' : 'Create module'} />
      </form>
    </Modal>
  );
};

export const SectionDialog: React.FC<FormProps<{ title: string; slug: string }>> = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const { busy, error, submit } = useSubmit(() => onSubmit({ title, slug }));

  return (
    <Modal title="New section" onClose={onClose}>
      <form onSubmit={submit} className="ad-form">
        <label className="ad-field">
          <span className="ad-field-label">Section title</span>
          <input
            className="ad-input"
            value={title}
            required
            maxLength={200}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(slugify(e.target.value).replace(/_/g, '-'));
            }}
          />
        </label>
        <label className="ad-field">
          <span className="ad-field-label">URL slug</span>
          <input className="ad-input ad-mono" value={slug} required pattern="[a-z0-9][a-z0-9_\-]*" onChange={(e) => setSlug(e.target.value)} />
          <span className="ad-hint">Unique within the module. New sections start as drafts.</span>
        </label>
        <ServerErrors error={error} />
        <Actions busy={busy} onClose={onClose} label="Create section" />
      </form>
    </Modal>
  );
};
