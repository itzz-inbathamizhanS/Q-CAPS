import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ScanLogSummary, ScanMode } from '../types';
import { formatDateTime, KEY_EXCHANGE, MODE_LABEL } from './constants';
import { SectionTitle } from './shared';

interface Props {
  history: ScanLogSummary[] | null;
  error: string;
  busy: boolean;
  onOpen: (id: number) => void;
  onRescan: (target: string, mode: ScanMode) => void;
}

export const ScanHistory: React.FC<Props> = ({ history, error, busy, onOpen, onRescan }) => (
  <section className="sc-panel">
    <SectionTitle>Scan history</SectionTitle>
    {error ? (
      <div className="sc-banner sc-banner--error" role="alert">{error}</div>
    ) : history === null ? (
      <p className="sc-muted" style={{ margin: 0 }}>Loading your scans...</p>
    ) : history.length === 0 ? (
      <p className="sc-muted" style={{ margin: 0 }}>No scans yet. Results you run here are saved to your account.</p>
    ) : (
      <div className="sc-history">
        {history.map((s) => (
          <div key={s.id} className="sc-history-item">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span className="sc-history-target">{s.target}</span>
              <span className="sc-muted">{formatDateTime(s.created_at)}{s.mode && ` · ${MODE_LABEL[s.mode]}`}</span>
            </div>
            <div className="sc-row">
              {s.schema_version === 2 ? (
                <>
                  {s.key_exchange && <Badge size="sm" variant={KEY_EXCHANGE[s.key_exchange].variant}>{KEY_EXCHANGE[s.key_exchange].label}</Badge>}
                  <Badge size="sm" variant={s.counts.high ? 'error' : s.counts.medium ? 'warning' : 'neutral'}>
                    {s.counts.high} high · {s.counts.medium} medium
                  </Badge>
                </>
              ) : (
                <Badge size="sm" variant="neutral">Earlier scanner version</Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => onOpen(s.id)} disabled={busy}>Open</Button>
              <Button variant="ghost" size="sm" onClick={() => onRescan(s.target, s.mode ?? 'standard')} disabled={busy}>Re-scan</Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
