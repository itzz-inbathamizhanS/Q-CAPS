import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchAssetFindings, fetchScanAssets } from '../../../services/backendService';
import type { ScanAsset, TrackedFinding } from '../types';
import { formatDateTime, SEVERITY_LABEL, SEVERITY_VARIANT } from './constants';
import { SectionTitle } from './shared';
import { AssetContextForm } from './AssetContextForm';
import { Link } from 'react-router-dom';

interface Props {
  /** Changes whenever a scan was saved, so the counts are refreshed. */
  refreshKey: number;
}

/**
 * Findings of domains scanned with verified ownership, tracked over time: a finding is Resolved only when a
 * later scan completed the check that detects it and no longer saw it.
 */
export const AssetsPanel: React.FC<Props> = ({ refreshKey }) => {
  const [assets, setAssets] = useState<ScanAsset[] | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [findings, setFindings] = useState<TrackedFinding[] | null>(null);
  const [findingsError, setFindingsError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchScanAssets()
      .then((rows) => !cancelled && (setAssets(rows), setError('')))
      .catch(() => !cancelled && setError('Your verified domains could not be loaded.'));
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reload]);

  const toggle = (id: number) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    setFindings(null);
    setFindingsError('');
    fetchAssetFindings(id).then(setFindings).catch(() => setFindingsError('The findings could not be loaded.'));
  };

  if (!error && (assets === null || assets.length === 0)) return null; // nothing verified yet: the scan history already says so

  return (
    <section className="sc-panel">
      <SectionTitle>Verified domains</SectionTitle>
      {error ? (
        <div className="sc-banner sc-banner--error" role="alert">{error}</div>
      ) : (
        <div className="sc-history">
          {assets!.map((a) => (
            <div key={a.id}>
              <div className="sc-history-item">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span className="sc-history-target">{a.target}</span>
                  {a.organization_kind === 'lab' && <Badge size="sm" variant="cyan">Lab environment</Badge>}
                  {a.organization_kind === 'organization' && a.organization_name && (
                    <Badge size="sm" variant="neutral">{a.organization_name}</Badge>
                  )}
                  <span className="sc-muted">Last full scan {formatDateTime(a.last_scanned)}</span>
                </div>
                <div className="sc-row">
                  <Badge size="sm" variant={a.open_findings ? 'warning' : 'success'}>{a.open_findings} open</Badge>
                  <Badge size="sm" variant="neutral">{a.resolved_findings} resolved</Badge>
                  <Button variant="outline" size="sm" onClick={() => toggle(a.id)} aria-expanded={openId === a.id}>
                    {openId === a.id ? 'Hide findings' : 'Show findings'}
                  </Button>
                </div>
              </div>
              {openId === a.id && (
                <div className="sc-findings" style={{ marginTop: 8 }}>
                  <AssetContextForm asset={a} onSaved={() => setReload((n) => n + 1)} />
                  {findingsError && <div className="sc-banner sc-banner--error" role="alert">{findingsError}</div>}
                  {!findingsError && findings === null && <p className="sc-muted" style={{ margin: 0 }}>Loading...</p>}
                  {findings?.length === 0 && <p className="sc-muted" style={{ margin: 0 }}>No exposures have been tracked for this domain.</p>}
                  {findings?.map((f) => (
                    <article key={f.id} className={`sc-finding sc-finding--${f.severity}`}>
                      <div className="sc-row">
                        <Badge variant={SEVERITY_VARIANT[f.severity]}>{SEVERITY_LABEL[f.severity]}</Badge>
                        <Badge variant={f.status === 'OPEN' ? 'warning' : 'success'}>{f.status === 'OPEN' ? 'Open' : f.status === 'RESOLVED' ? 'Resolved' : f.status}</Badge>
                        <Link className="sc-finding-title" to={`/closure/${f.id}`} style={{ color: 'var(--color-primary)' }}>
                          {f.title ?? f.finding_type}
                        </Link>
                      </div>
                      <span className="sc-muted">
                        First seen {formatDateTime(f.first_seen)} · {f.status === 'RESOLVED' ? 'last seen / resolved' : 'last seen'} {formatDateTime(f.last_seen)}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
