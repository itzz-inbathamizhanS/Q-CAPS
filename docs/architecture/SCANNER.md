# Q-CAPS Scanner

The scanner assesses the TLS, certificate, HTTP and DNS posture of a domain, with a focus on post-quantum (PQC)
readiness. It is a separate Flask service (`backend/scanner_api`, port 5000) that validates the same JWTs as the main
API. The browser calls it directly and relays the result to the main API (`POST /api/scanner/log`), which verifies a
signed receipt before recording it.

**Principle.** Every value in a result was observed by a check. A check that fails or is not run is reported in `checks`
with its reason; nothing is inferred or invented to fill the gap, and "unknown" is never shown as "none found".

## Flow

```
Browser -> scanner  POST /api/scan {url, mode}        JWT, rate limit, one scan per user, concurrency cap
        <- result + receipt (HS256 over a hash of the result, bound to the user, 15 min)
Browser -> main API POST /api/scanner/log             verifies receipt, stores log, awards XP, ingests verified full scans
Browser -> main API GET  /api/scanner/logs[/{id}]     history and stored results (current user only)
                    GET  /api/scanner/logs/{id}/report PDF
                    GET  /api/scanner/assets[/{id}/findings]   verified domains and tracked findings
Browser -> scanner  POST /api/domain-verification     which DNS record proves ownership, and whether it is published
```

## Scan modes

| | Standard | Full (verified domain) |
|---|---|---|
| DNS (A, AAAA, MX, NS, TXT, CAA, SPF, DMARC) | yes | yes |
| WHOIS | yes | yes |
| TLS handshake, certificate chain and trust | yes | yes |
| TLS 1.3 key-exchange group probe | yes | yes |
| One HTTPS request (security headers, max 3 re-validated redirects) | yes | yes |
| Subdomains from public Certificate Transparency logs (crt.sh) | yes | yes |
| TCP port probe (16 ports) | no | yes |
| Subdomain wordlist (DNS only) | no | yes |
| TLS 1.0 / 1.1 acceptance | no | yes |

Active checks need proof of ownership: a DNS TXT record `_qcaps-verify.<domain>` whose value is
`qcaps-verify=<HMAC(QCAPS_JWT_SECRET, user id + domain)>`. It may sit on the host or a parent domain, is checked live on every
full scan (removing it revokes access), and is useless to another account. Rotating `QCAPS_JWT_SECRET` invalidates all
tokens and receipts.

## How PQC posture is observed

Python `ssl` does not expose the TLS 1.3 key-exchange group. The scanner sends a ClientHello that lists hybrid and classical
groups but carries an empty `key_share`; a conforming server answers with a HelloRetryRequest naming the group it selected.
No key material is generated and no handshake completes. At most two hellos are sent: all groups, then (only if the first
choice was classical) hybrid groups alone. Group codepoints are classified from `scanner/crypto_registry/algorithms.json`.

- **Key exchange** (exposed to harvest-now-decrypt-later): `hybrid_pqc`, `hybrid_pqc_available` (accepted, not preferred),
  `classical`, or `unknown` (probe failed; never reported as "no").
- **Certificate authentication** is reported separately and treated as a planning item, because forged signatures only matter
  while a connection is being made.
- The result reflects the endpoint that answered. For CDN-fronted sites that is the edge, not necessarily the origin.

## Target validation (SSRF)

`resolve_target` normalises the target (http(s) URL or hostname; ports, credentials and IP literals are rejected), resolves it
once over IPv4 and IPv6, and requires every address to be globally routable (private, loopback, link-local, CGNAT, multicast,
reserved, and IPv4 embedded in mapped / NAT64 / 6to4 / Teredo addresses are refused). All connections then go to those
validated addresses with the name only in SNI and the Host header, so a DNS-rebinding answer between check and connection
cannot redirect them. Redirects are followed manually (HTTPS only, max 3) and each new host is validated and pinned again.
`ALLOW_LOCAL_SCANNING=true` permits loopback for local testing only.

## Findings

Derived from observed data by `scanner/findings.py` (rules in its docstring); there is no aggregate score. Severity:
high (TLS < 1.2, RSA key transport, untrusted or expired certificate, exposed Telnet/SMB/RDP/database port), medium
(classical-only key exchange, certificate expiring within 14 days, missing HSTS, TLS 1.0/1.1 accepted), low (missing CSP /
nosniff / framing protection, no DMARC, weak SPF), info (classical certificate signature, no CAA, hybrid PQC in use).
A finding is only produced when the check supporting it completed.

## Backend handling

- **XP**: flat per scan (10, or 20 for a verified full scan), earned once per target per UTC day. Not proportional to findings.
- **Recommendations**: medium and high findings that name a classical algorithm raise urgency for the PQC topics; only the
  latest scan per target in the last 90 days counts; info and low items never do.
- **Verified full scans** also create an `Asset` owned by the user, an `Evidence` row (`authorization_context=domain_verified`)
  and `Finding` rows for medium/high findings, updated on every scan. A finding becomes `RESOLVED` only when a later scan
  completed the check that detects it and no longer saw it; if that check failed, it stays `OPEN`. It reopens if seen again.
  `RESOLVED` is a technical observation, distinct from the learner closure workflow (`CLOSED`).
- **Privacy**: assets, evidence, findings, interventions and closures of a user's verified scans are readable by that user and
  admins only (other users receive 404). Records without an owner are shared, admin-managed data. The exposure-graph
  recommender only reads the user's own assets plus shared ones.
- Receipts bind a result to the scanner and the user, so the browser cannot invent findings or XP. They do not make a result
  true: they prove it came from this scanner for this account.

## Result schema v2 (summary)

`target_url`, `scan_timestamp`, `schema_version: 2`, `scanner_version`, `authorization{mode, ownership_verified,
verified_domain}`, `resolved_addresses`, `checks{name: {status: ok|failed|requires_verification, reason?, duration_ms}}`,
`dns`, `whois`, `http{final_host, status, redirects, headers}`, `tls{version, cipher_suite, alpn, trusted, trust_error,
key_exchange, certificate{..., chain}, legacy_protocols}`, `pqc_posture{key_exchange, authentication, summary}`, `ports?`
(full only), `subdomains[{name, source}]`, `findings[{id, category, severity, title, detail, evidence, recommendation,
algorithm}]`. A section is `null` when its check did not produce a result. Older (v1) logs remain readable in the PDF report
and history list but are not displayed as results.

## Configuration

`QCAPS_JWT_SECRET` (shared with the main API; the scanner refuses to scan without it), `QCAPS_CORS_ORIGINS`,
`SCANNER_HOST`, `PORT`, `SCANNER_RATE_LIMIT`, `SCANNER_RATE_WINDOW_SECONDS`, `SCANNER_MAX_CONCURRENT`,
`VITE_SCANNER_API_URL` (frontend). See `backend/.env.example`.

## Hosted deployment

`render.yaml` defines a `qcaps-scanner` web service (gunicorn, one worker) next to `qcaps-api`. After the blueprint is applied:
1. On `qcaps-scanner`, set `QCAPS_CORS_ORIGINS` to the Vercel origin (for example `https://qcaps.vercel.app`, no trailing slash).
   `QCAPS_JWT_SECRET` is copied from `qcaps-api`; if you set it by hand it must be identical on both services.
2. On Vercel, set `VITE_SCANNER_API_URL` to the scanner's public URL (no trailing slash) for Production and redeploy,
   because Vite inlines the value at build time. Without it the page reports "The scanner is not available in this deployment."
3. `GET /api/health` on the scanner should return `{"status":"ok","scanning_enabled":true}`.

## Known limits

- crt.sh and WHOIS are third-party services; when they are slow or down the check shows `failed` with the reason.
- The in-memory rate limiter and per-user lock are per process; run one scanner process or move them to shared storage.
- The scanner is synchronous Flask with threads; a scan cannot be cancelled server-side (the browser stops waiting).
- No frontend unit-test runner is configured; the scanner UI was verified in a browser on an isolated stack.
- Breach and dark-web intelligence is intentionally absent: there is no verified source, so none is shown.
