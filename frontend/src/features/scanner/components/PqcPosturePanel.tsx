import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { ScanResultV2 } from '../types';
import { KEY_EXCHANGE } from './constants';
import { SectionTitle } from './shared';

const AUTH_LABEL = { classical: 'Classical signatures', pqc: 'Post-quantum signatures', unknown: 'Not determined' } as const;

/** Key exchange (exposed to harvest-now-decrypt-later) and certificate authentication (attackable only in real time), kept apart. */
export const PqcPosturePanel: React.FC<{ result: ScanResultV2 }> = ({ result }) => {
  const posture = result.pqc_posture;
  const tls = result.tls;
  if (!posture || !tls) {
    const reason = result.checks.tls_handshake?.reason ?? result.checks.tls_key_exchange?.reason;
    return (
      <section className="sc-panel">
        <SectionTitle>Post-quantum posture</SectionTitle>
        <p className="sc-muted" style={{ margin: 0 }}>
          No verified result available: the TLS checks did not complete{reason ? ` (${reason})` : ''}.
        </p>
      </section>
    );
  }
  const kx = KEY_EXCHANGE[posture.key_exchange];
  const cert = tls.certificate;
  const certDetail = cert ? [cert.public_key_algorithm, cert.curve ?? cert.key_size].filter(Boolean).join(' ') : null;
  return (
    <section className="sc-panel">
      <SectionTitle>Post-quantum posture</SectionTitle>
      <div className="sc-posture">
        <div className="sc-posture-cell">
          <span className="sc-label">Key exchange (protects recorded traffic)</span>
          <span className="sc-posture-value">{tls.key_exchange.preferred_group_name ?? kx.label}</span>
          <div className="sc-row">
            <Badge variant={kx.variant}>{kx.label}</Badge>
            {tls.version && <Badge variant="neutral">{tls.version}</Badge>}
            {tls.key_exchange.forward_secrecy === false && <Badge variant="error">No forward secrecy</Badge>}
          </div>
          <p className="sc-muted" style={{ margin: 0 }}>
            An attacker can record encrypted traffic today and decrypt it once a quantum computer exists, unless the key exchange is
            post-quantum. Hybrid ML-KEM groups such as X25519MLKEM768 close that gap.
          </p>
        </div>
        <div className="sc-posture-cell">
          <span className="sc-label">Certificate authentication</span>
          <span className="sc-posture-value">{certDetail ?? AUTH_LABEL[posture.authentication]}</span>
          <div className="sc-row">
            <Badge variant="neutral">{AUTH_LABEL[posture.authentication]}</Badge>
          </div>
          <p className="sc-muted" style={{ margin: 0 }}>
            Forged signatures only matter while a connection is being made, so classical certificates are a migration-planning item
            rather than an urgent exposure. ML-DSA certificates are not yet issued by public CAs.
          </p>
        </div>
      </div>
      <p style={{ margin: '14px 0 6px', fontSize: 14 }}>{posture.summary}</p>
      <ul className="sc-list">
        {tls.key_exchange.evidence.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </section>
  );
};
