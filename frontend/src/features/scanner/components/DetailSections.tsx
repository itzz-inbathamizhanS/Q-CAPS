import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { CheckReport, ScanResultV2 } from '../types';
import { formatDate } from './constants';
import { KeyValue, SectionTitle } from './shared';

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="sc-panel">
    <SectionTitle>{title}</SectionTitle>
    {children}
  </section>
);

/** Shown instead of data when a check did not produce any: unknown is never rendered as empty or "none". */
const NotAssessed: React.FC<{ check?: CheckReport; what: string }> = ({ check, what }) => (
  <p className="sc-muted" style={{ margin: 0 }}>
    No verified result available for {what}
    {check?.reason ? `: ${check.reason}` : '.'}
  </p>
);

const List: React.FC<{ label: string; items: string[]; unavailable?: boolean }> = ({ label, items, unavailable }) => (
  <KeyValue label={label} mono>
    {unavailable ? 'lookup failed' : items.length ? items.map((i) => <div key={i}>{i}</div>) : 'none'}
  </KeyValue>
);

const HEADERS: [keyof NonNullable<ScanResultV2['http']>['headers'], string][] = [
  ['strict_transport_security', 'Strict-Transport-Security'],
  ['content_security_policy', 'Content-Security-Policy'],
  ['x_content_type_options', 'X-Content-Type-Options'],
  ['x_frame_options', 'X-Frame-Options'],
  ['referrer_policy', 'Referrer-Policy'],
];

export const DetailSections: React.FC<{ result: ScanResultV2 }> = ({ result }) => {
  const { dns, whois, http, tls, ports, checks } = result;
  const cert = tls?.certificate ?? null;
  const dnsErr = dns?.errors ?? {};
  return (
    <div className="sc-grid">
      <Panel title="DNS and email">
        {dns ? (
          <div className="sc-kv">
            <List label="A" items={dns.A} unavailable={!!dnsErr.A} />
            <List label="AAAA" items={dns.AAAA} unavailable={!!dnsErr.AAAA} />
            <List label="MX" items={dns.MX} unavailable={!!dnsErr.MX} />
            <List label="NS" items={dns.NS} unavailable={!!dnsErr.NS} />
            <List label="CAA" items={dns.CAA} unavailable={!!dnsErr.CAA} />
            <KeyValue label="SPF" mono>{dnsErr.TXT ? 'lookup failed' : dns.spf ?? 'none'}</KeyValue>
            <KeyValue label="DMARC" mono>{dnsErr.DMARC ? 'lookup failed' : dns.dmarc ?? 'none'}</KeyValue>
          </div>
        ) : <NotAssessed check={checks.dns} what="DNS" />}
      </Panel>

      <Panel title="Certificate">
        {cert ? (
          <div className="sc-kv">
            <KeyValue label="Subject">{cert.subject_cn ?? cert.subject}</KeyValue>
            <KeyValue label="Issuer">{cert.issuer_cn ?? cert.issuer}</KeyValue>
            <KeyValue label="Public key">{[cert.public_key_algorithm, cert.curve ?? cert.key_size].filter(Boolean).join(' ')}</KeyValue>
            <KeyValue label="Signature">{cert.signature_algorithm}</KeyValue>
            <KeyValue label="Valid until">{formatDate(cert.not_after)} ({cert.days_remaining} days)</KeyValue>
            <KeyValue label="Names (SAN)">{cert.san_count}</KeyValue>
            <KeyValue label="Trusted by public roots">
              {tls?.trusted === null ? 'Not determined' : tls?.trusted ? <Badge variant="success" size="sm">Yes</Badge> : <Badge variant="error" size="sm">No</Badge>}
            </KeyValue>
            {tls?.trust_error && <KeyValue label="Validation error">{tls.trust_error}</KeyValue>}
            <KeyValue label="Chain">{cert.chain.map((c) => c.subject_cn ?? '?').join(' → ')}</KeyValue>
          </div>
        ) : <NotAssessed check={checks.certificate} what="the certificate" />}
      </Panel>

      <Panel title="HTTP security headers">
        {http ? (
          <div className="sc-kv">
            {HEADERS.map(([key, label]) => (
              <KeyValue key={key} label={label}>
                <Badge size="sm" variant={http.headers[key].present ? 'success' : 'warning'}>{http.headers[key].present ? 'Present' : 'Missing'}</Badge>
              </KeyValue>
            ))}
            <KeyValue label="Response">HTTP {http.status}{http.redirects.length > 0 && ` after ${http.redirects.length} redirect(s)`}</KeyValue>
            {http.redirects.filter((r) => r.blocked).map((r) => (
              <KeyValue key={r.to} label="Redirect not followed">{r.blocked}</KeyValue>
            ))}
          </div>
        ) : <NotAssessed check={checks.http_headers} what="HTTP headers" />}
      </Panel>

      <Panel title="Registration (WHOIS)">
        {whois ? (
          <div className="sc-kv">
            <KeyValue label="Registrar">{whois.registrar ?? 'Not published'}</KeyValue>
            <KeyValue label="Organization">{whois.organization ?? 'Not published'}</KeyValue>
            <KeyValue label="Created">{formatDate(whois.creation_date)}</KeyValue>
            <KeyValue label="Expires">{formatDate(whois.expiration_date)}</KeyValue>
          </div>
        ) : <NotAssessed check={checks.whois} what="WHOIS" />}
      </Panel>

      <Panel title="Open ports">
        {ports ? (
          <div className="sc-kv">
            {Object.entries(ports.ports).map(([port, p]) => (
              <KeyValue key={port} label={`${port} ${p.service}`}>
                <Badge size="sm" variant={p.state === 'OPEN' ? 'cyan' : 'neutral'}>{p.state === 'FILTERED' ? 'No answer (unknown)' : p.state}</Badge>
              </KeyValue>
            ))}
          </div>
        ) : checks.ports?.status === 'requires_verification' ? (
          <p className="sc-muted" style={{ margin: 0 }}>Not run. The port probe is an active check and needs verified ownership of the domain (choose Full scan).</p>
        ) : <NotAssessed check={checks.ports} what="ports" />}
      </Panel>

      <Panel title="Subdomains">
        {result.subdomains.length > 0 ? (
          <div className="sc-scroll">
            {result.subdomains.map((s) => (
              <div key={s.name}>{s.name} <Badge size="sm" variant="neutral">{s.source === 'ct_log' ? 'CT log' : 'DNS wordlist'}</Badge></div>
            ))}
          </div>
        ) : checks.ct_subdomains?.status === 'failed' ? (
          <NotAssessed check={checks.ct_subdomains} what="Certificate Transparency subdomains" />
        ) : (
          <p className="sc-muted" style={{ margin: 0 }}>No subdomains appear in Certificate Transparency logs. Names that never had a public certificate would not show up here.</p>
        )}
      </Panel>
    </div>
  );
};
