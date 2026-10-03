import React, { useState } from 'react';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { VerificationInfo } from '../types';
import { SectionTitle } from './shared';

interface Props {
  info: VerificationInfo | null;
  loading: boolean;
  error: string;
  onCheck: () => void;
}

const CopyField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the value is selectable text */
    }
  };
  return (
    <div>
      <div className="sc-label">{label}</div>
      <div className="sc-record">
        <span className="sc-mono">{value}</span>
        <Button variant="ghost" size="sm" onClick={copy} aria-label={`Copy ${label}`} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};

/** Full scans send active probes (ports, wordlist DNS, legacy TLS), so they need proof the user controls the domain. */
export const DomainVerificationPanel: React.FC<Props> = ({ info, loading, error, onCheck }) => (
  <section className="sc-panel" aria-labelledby="sc-verify-title">
    <div className="sc-spread">
      <div id="sc-verify-title"><SectionTitle>Domain ownership</SectionTitle></div>
      {info && (info.verified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Not verified</Badge>)}
    </div>
    <p className="sc-muted" style={{ marginTop: 0 }}>
      A full scan adds active checks (port probe, subdomain wordlist, legacy TLS). To run them, prove you control the domain by
      publishing the DNS TXT record below. The record is checked again on every full scan, so removing it ends access.
    </p>
    {info ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <CopyField label="Record name (type TXT)" value={info.record_name} />
        <CopyField label="Record value" value={info.record_value} />
        {info.note && <p className="sc-muted" style={{ margin: 0 }}>{info.note}</p>}
        {info.verified && (
          <div className="sc-banner sc-banner--ok" role="status">
            <ShieldCheck size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Ownership confirmed via {info.verified_domain}. You can run a full scan.
          </div>
        )}
      </div>
    ) : null}
    {error && <div className="sc-banner sc-banner--error" role="alert" style={{ marginTop: 12 }}>{error}</div>}
    <div style={{ marginTop: 12 }}>
      <Button variant={info?.verified ? 'outline' : 'primary'} size="sm" onClick={onCheck} disabled={loading}>
        {loading ? 'Checking DNS...' : info ? 'Check again' : 'Get verification record'}
      </Button>
    </div>
  </section>
);
