import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, describeError } from '@/features/admin/adminApi';
import type { AuditEntry } from '@/features/admin/adminTypes';
import '@/styles/lesson.css';
import '@/styles/admin.css';

const PAGE_SIZE = 25;
const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'track', label: 'Tracks' },
  { value: 'module', label: 'Modules' },
  { value: 'section', label: 'Sections' },
];

const formatWhen = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const AdminAudit: React.FC = () => {
  const [entityType, setEntityType] = useState('');
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<{ total: number; items: AuditEntry[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await adminApi.auditLog({ limit: PAGE_SIZE, offset, entityType: entityType || undefined }));
      setError(null);
    } catch (err) {
      setError(describeError(err));
    }
  }, [offset, entityType]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = data?.total ?? 0;

  return (
    <div className="ls-page">
      <header className="adm-header">
        <div>
          <h1 className="ls-h1">Audit log</h1>
          <p className="ls-muted">Every change to course content, newest first.</p>
        </div>
        <Link to="/admin" className="ls-btn ls-btn--secondary">
          Back to courses
        </Link>
      </header>

      <div className="adm-filters" role="group" aria-label="Filter by item type">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="adm-chip-btn"
            aria-pressed={entityType === f.value}
            onClick={() => {
              setEntityType(f.value);
              setOffset(0);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="ls-card ls-state" role="alert">
          <p className="ls-muted">{error}</p>
          <button type="button" className="ls-btn ls-btn--primary" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : !data ? (
        <div className="ls-skeleton ls-skeleton--header" role="status" aria-busy="true" />
      ) : data.items.length === 0 ? (
        <div className="ls-card ls-state">
          <p className="ls-muted">No changes recorded yet.</p>
        </div>
      ) : (
        <div className="adm-audit-wrap">
          <table className="adm-audit">
            <thead>
              <tr>
                <th>WHEN</th>
                <th>WHO</th>
                <th>ACTION</th>
                <th>ITEM</th>
                <th>CHANGED</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e.id}>
                  <td className="ls-fineprint">{formatWhen(e.created_at)}</td>
                  <td>{e.actor_name}</td>
                  <td>
                    <span className="adm-tag">{e.action.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="ls-fineprint">{e.entity_type} </span>
                    {e.label ?? `#${e.entity_id ?? ''}`}
                  </td>
                  <td className="ls-fineprint">{e.changed_fields.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && total > PAGE_SIZE && (
        <div className="ls-row" style={{ alignItems: 'center' }}>
          <button type="button" className="ls-btn ls-btn--secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
            Newer
          </button>
          <span className="ls-fineprint">
            {offset + 1} to {Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <button type="button" className="ls-btn ls-btn--secondary" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
            Older
          </button>
        </div>
      )}
    </div>
  );
};
