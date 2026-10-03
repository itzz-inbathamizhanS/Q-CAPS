import React from 'react';
import { FileJson, FileText, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SaveOutcome, ScanResultV2 } from '../types';
import { formatDateTime, MODE_LABEL, SEVERITY_LABEL, SEVERITY_ORDER, SEVERITY_VARIANT } from './constants';

interface Props {
  result: ScanResultV2;
  /** null when the result was opened from history (already saved). */
  saved: SaveOutcome | null;
  /** A stored log exists for this result (saved just now, or opened from history). */
  canReport: boolean;
  reportBusy: boolean;
  reportError: string;
  onReport: () => void;
  onExport: () => void;
  onRescan: () => void;
  onNew: () => void;
}

const SaveBanner: React.FC<{ saved: SaveOutcome | null }> = ({ saved }) => {
  if (!saved) return <div className="sc-banner" role="status">Opened from your scan history.</div>;
  if (!saved.ok) {
    return (
      <div className="sc-banner sc-banner--warn" role="alert">
        This result was not saved: {saved.error} It is shown here only, so no XP was awarded and the PDF report is unavailable.
      </div>
    );
  }
  return (
    <div className="sc-banner sc-banner--ok" role="status">
      {saved.xpAwarded > 0
        ? `Saved to your history. +${saved.xpAwarded} XP.`
        : 'Saved to your history. No XP this time: this domain already earned XP today.'}
    </div>
  );
};

export const ScanSummary: React.FC<Props> = ({ result, saved, canReport, reportBusy, reportError, onReport, onExport, onRescan, onNew }) => {
  const counts = SEVERITY_ORDER.map((s) => ({ s, n: result.findings.filter((f) => f.severity === s).length }));
  return (
    <section className="sc-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="sc-spread" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span className="sc-summary-target">{result.target_url}</span>
          <span className="sc-muted">
            {formatDateTime(result.scan_timestamp)} · {MODE_LABEL[result.authorization.mode]} · scanner v{result.scanner_version}
          </span>
          {result.resolved_addresses.length > 0 && (
            <span className="sc-muted sc-mono">Resolved: {result.resolved_addresses.join(', ')}</span>
          )}
        </div>
        <div className="sc-counts" aria-label="Findings by severity">
          {counts.map(({ s, n }) => (
            <Badge key={s} variant={n > 0 ? SEVERITY_VARIANT[s] : 'neutral'}>{n} {SEVERITY_LABEL[s]}</Badge>
          ))}
        </div>
      </div>
      <SaveBanner saved={saved} />
      {reportError && <div className="sc-banner sc-banner--error" role="alert">{reportError}</div>}
      <div className="sc-row">
        <Button variant="outline" size="sm" onClick={onReport} disabled={!canReport || reportBusy} leftIcon={<FileText size={14} />}>
          {reportBusy ? 'Preparing...' : 'PDF report'}
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} leftIcon={<FileJson size={14} />}>JSON</Button>
        <Button variant="outline" size="sm" onClick={onRescan} leftIcon={<RefreshCw size={14} />}>Re-scan</Button>
        <Button size="sm" onClick={onNew} leftIcon={<Plus size={14} />}>New scan</Button>
      </div>
    </section>
  );
};
