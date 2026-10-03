import type { BadgeProps } from '@/components/ui/Badge';
import type { KeyExchangeClass, ScanMode, Severity } from '../types';

export const SEVERITY_ORDER: Severity[] = ['high', 'medium', 'low', 'info'];

export const SEVERITY_LABEL: Record<Severity, string> = { high: 'High', medium: 'Medium', low: 'Low', info: 'Info' };

export const SEVERITY_VARIANT: Record<Severity, NonNullable<BadgeProps['variant']>> = {
  high: 'error',
  medium: 'warning',
  low: 'cyan',
  info: 'neutral',
};

export const KEY_EXCHANGE: Record<KeyExchangeClass, { label: string; variant: NonNullable<BadgeProps['variant']> }> = {
  hybrid_pqc: { label: 'Hybrid post-quantum', variant: 'success' },
  hybrid_pqc_available: { label: 'Hybrid supported, not preferred', variant: 'warning' },
  classical: { label: 'Classical only', variant: 'warning' },
  unknown: { label: 'Not determined', variant: 'neutral' },
};

export const CHECK_LABEL: Record<string, string> = {
  dns: 'DNS and email records',
  whois: 'WHOIS registration',
  http_headers: 'HTTP security headers',
  tls_handshake: 'TLS handshake',
  tls_key_exchange: 'Key exchange probe (TLS 1.3)',
  certificate: 'Certificate',
  ct_subdomains: 'Certificate Transparency subdomains',
  ports: 'TCP port probe',
  dns_wordlist: 'Subdomain wordlist',
  legacy_tls: 'Legacy TLS versions (1.0 / 1.1)',
};

export const STANDARD_CHECKS = ['dns', 'whois', 'http_headers', 'tls_handshake', 'tls_key_exchange', 'certificate', 'ct_subdomains'];
export const ACTIVE_CHECKS = ['ports', 'dns_wordlist', 'legacy_tls'];

export const MODE_LABEL: Record<ScanMode, string> = { standard: 'Standard', full: 'Full (verified domain)' };

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Not available';
  // The API stores naive UTC timestamps for logs; treat a missing zone as UTC.
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? iso.split('T')[0] : 'Not available';
}
