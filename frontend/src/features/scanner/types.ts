// Result schema produced by backend/scanner_api (schema_version 2). Every field is something the scanner
// observed; null means "not assessed" (the matching entry in `checks` says why), never "none found".

export type Severity = 'high' | 'medium' | 'low' | 'info';
export type CheckStatus = 'ok' | 'failed' | 'skipped' | 'requires_verification';
export type ScanMode = 'standard' | 'full';
export type KeyExchangeClass = 'hybrid_pqc' | 'hybrid_pqc_available' | 'classical' | 'unknown';

export interface Finding {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  detail: string;
  evidence: string;
  recommendation: string;
  algorithm: string | null;
}

export interface CheckReport {
  status: CheckStatus;
  reason?: string;
  duration_ms: number;
}

export interface DnsResult {
  A: string[];
  AAAA: string[];
  MX: string[];
  NS: string[];
  TXT: string[];
  CAA: string[];
  spf: string | null;
  dmarc: string | null;
  errors: Record<string, string>;
}

export interface WhoisResult {
  registrar: string | null;
  creation_date: string | null;
  expiration_date: string | null;
  organization: string | null;
}

export interface HeaderPresence {
  present: boolean;
  frame_ancestors?: boolean;
  max_age?: number | null;
  include_subdomains?: boolean;
  preload?: boolean;
}

export interface HttpResult {
  final_host: string;
  status: number;
  redirects: { status: number; to: string; blocked?: string }[];
  headers: {
    strict_transport_security: HeaderPresence;
    content_security_policy: HeaderPresence;
    x_content_type_options: HeaderPresence;
    x_frame_options: HeaderPresence;
    referrer_policy: HeaderPresence;
  };
}

export interface CertificateInfo {
  subject: string;
  subject_cn: string | null;
  issuer: string;
  issuer_cn: string | null;
  sans: string[];
  san_count: number;
  public_key_algorithm: string;
  key_size: number | null;
  curve: string | null;
  signature_algorithm: string;
  signature_class: 'classical' | 'pqc';
  not_before: string;
  not_after: string;
  days_remaining: number;
  self_signed: boolean;
  chain: { subject_cn: string | null; issuer_cn: string | null; public_key_algorithm: string; signature_algorithm: string }[];
}

export interface KeyExchangeInfo {
  classification: KeyExchangeClass;
  preferred_group: string | null;
  preferred_group_name: string | null;
  hybrid_pqc_supported: boolean | null;
  forward_secrecy: boolean | null;
  kex: string | null;
  method: string | null;
  evidence: string[];
}

export interface TlsResult {
  version: string | null;
  cipher_suite: string | null;
  alpn: string | null;
  trusted: boolean | null;
  trust_error: string | null;
  key_exchange: KeyExchangeInfo;
  certificate: CertificateInfo | null;
  legacy_protocols: { tls1_0: boolean | null; tls1_1: boolean | null } | null;
}

export interface PqcPosture {
  key_exchange: KeyExchangeClass;
  authentication: 'classical' | 'pqc' | 'unknown';
  summary: string;
}

export interface PortsResult {
  address: string;
  ports: Record<string, { service: string; state: 'OPEN' | 'CLOSED' | 'FILTERED' }>;
}

export interface Subdomain {
  name: string;
  source: 'ct_log' | 'dns_wordlist';
}

export interface ScanResultV2 {
  target_url: string;
  scan_timestamp: string;
  schema_version: 2;
  scanner_version: string;
  authorization: { mode: ScanMode; ownership_verified: boolean; verified_domain: string | null };
  resolved_addresses: string[];
  checks: Record<string, CheckReport>;
  dns: DnsResult | null;
  whois: WhoisResult | null;
  http: HttpResult | null;
  tls: TlsResult | null;
  pqc_posture: PqcPosture | null;
  ports?: PortsResult;
  subdomains: Subdomain[];
  findings: Finding[];
  /** Added by the scanner; used only to log the scan. Never shown or exported. */
  receipt?: string;
}

/** Row of GET /scanner/logs. */
export interface ScanLogSummary {
  id: number;
  target: string;
  created_at: string;
  schema_version: number | null;
  mode: ScanMode | null;
  counts: Record<Severity, number>;
  key_exchange: KeyExchangeClass | null;
  findings: number;
}

/** Answer of the scanner's /api/domain-verification (and the 403 body of a refused full scan). */
export interface VerificationInfo {
  hostname: string;
  record_type: 'TXT';
  record_name: string;
  record_value: string;
  verified?: boolean;
  verified_domain?: string | null;
  note?: string;
}

export type SaveOutcome =
  | { ok: true; logId: number; xpAwarded: number }
  | { ok: false; error: string };

/** Row of GET /scanner/assets: a domain scanned with verified ownership. */
export interface ScanAsset {
  id: number;
  target: string;
  created_at: string;
  open_findings: number;
  resolved_findings: number;
  last_scanned: string | null;
}

/** Row of GET /scanner/assets/{id}/findings. RESOLVED means a later scan completed the supporting check and no longer saw it. */
export interface TrackedFinding {
  id: string;
  finding_type: string;
  title: string | null;
  severity: 'high' | 'medium';
  algorithm: string | null;
  status: string;
  first_seen: string;
  last_seen: string;
}
