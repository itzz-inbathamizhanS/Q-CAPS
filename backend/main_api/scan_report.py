"""PDF rendering of a stored scan result (schema v2, with a minimal fallback for older logs).

The report only restates what the scan observed. It never adds breach, dark-web or vulnerability-database
claims, and it states which checks failed or were not run.
"""
import io
import json
import textwrap

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

SEVERITY_ORDER = ["high", "medium", "low", "info"]
LEFT, TOP, BOTTOM = 50, 750, 55


def _latin(text) -> str:
    return str("" if text is None else text).encode("latin-1", "replace").decode("latin-1")


class _Writer:
    def __init__(self):
        self.buffer = io.BytesIO()
        self.pdf = canvas.Canvas(self.buffer, pagesize=letter)
        self.y = TOP

    def _room(self, needed=15):
        if self.y < BOTTOM + needed:
            self.pdf.showPage()
            self.y = TOP

    def heading(self, text, size=13):
        self._room(40)
        self.y -= 8
        self.pdf.setFont("Helvetica-Bold", size)
        self.pdf.drawString(LEFT, self.y, _latin(text))
        self.y -= size + 6

    def line(self, text, indent=0, bold=False, size=10, width=92):
        self.pdf.setFont("Helvetica-Bold" if bold else "Helvetica", size)
        for part in textwrap.wrap(_latin(text), width=width - indent // 5) or [""]:
            self._room()
            self.pdf.drawString(LEFT + indent, self.y, part)
            self.y -= size + 4

    def gap(self, n=6):
        self.y -= n

    def finish(self) -> bytes:
        self.pdf.showPage()
        self.pdf.save()
        return self.buffer.getvalue()


def _fmt_ports(ports):
    return ", ".join(f"{p} {m.get('service', '')}: {m.get('state')}" for p, m in sorted(ports.items(), key=lambda kv: int(kv[0])))


def _render_v2(w: _Writer, log, data: dict):
    auth = data.get("authorization") or {}
    w.line(f"Target: {data.get('target_url')}", bold=True, size=12)
    w.line(f"Scanned: {data.get('scan_timestamp')}   Scanner v{data.get('scanner_version')}")
    mode = auth.get("mode", "standard")
    w.line(f"Mode: {mode}" + (f" (ownership verified via {auth.get('verified_domain')})" if auth.get("ownership_verified") else
                               " (passive checks only; no ownership verification)"))
    if data.get("resolved_addresses"):
        w.line("Resolved addresses: " + ", ".join(data["resolved_addresses"]))

    posture = data.get("pqc_posture")
    w.heading("1. Post-quantum posture")
    w.line(posture["summary"] if posture else "No verified result available: the TLS checks did not complete.")
    kex = ((data.get("tls") or {}).get("key_exchange") or {})
    for ev in kex.get("evidence") or []:
        w.line("- " + ev, indent=10)

    findings = data.get("findings") or []
    w.heading("2. Findings")
    if not findings:
        w.line("No findings were derived from the checks that completed (see section 4 for checks that did not).")
    for sev in SEVERITY_ORDER:
        for f in (x for x in findings if x.get("severity") == sev):
            w.gap(3)
            w.line(f"[{sev.upper()}] {f.get('title')}", bold=True)
            if f.get("detail"):
                w.line(f["detail"], indent=10)
            w.line("Evidence: " + str(f.get("evidence")), indent=10)
            w.line("Recommendation: " + str(f.get("recommendation")), indent=10)

    tls = data.get("tls") or {}
    cert = tls.get("certificate") or {}
    w.heading("3. TLS and certificate")
    if tls:
        w.line(f"Version: {tls.get('version')}   Cipher suite: {tls.get('cipher_suite')}   ALPN: {tls.get('alpn')}")
        w.line(f"Certificate trusted by public roots: {tls.get('trusted')}" + (f" ({tls.get('trust_error')})" if tls.get("trust_error") else ""))
    else:
        w.line("No verified result available.")
    if cert:
        size = cert.get("curve") or cert.get("key_size")
        w.line(f"Subject: {cert.get('subject_cn')}   Issuer: {cert.get('issuer_cn')}")
        w.line(f"Public key: {cert.get('public_key_algorithm')} {size}   Signature: {cert.get('signature_algorithm')}")
        w.line(f"Valid until: {cert.get('not_after')} ({cert.get('days_remaining')} days remaining)")
    if data.get("ports"):
        w.line("Ports: " + _fmt_ports(data["ports"].get("ports") or {}))

    w.heading("4. Checks performed")
    for name, c in (data.get("checks") or {}).items():
        reason = f" - {c['reason']}" if c.get("reason") else ""
        w.line(f"{name}: {c.get('status')}{reason}", indent=10)

    w.heading("5. Limitations")
    for text in (
        "Observations are a point-in-time view from one network location.",
        "The TLS key exchange reflects the endpoint that answered; for CDN-fronted sites this is the edge, not necessarily the origin.",
        "No breach, dark-web or vulnerability-database lookups are performed. Findings come only from the checks listed above.",
    ):
        w.line("- " + text, indent=10)


def _render_legacy(w: _Writer, log):
    w.line(f"Target: {log.endpoint}", bold=True, size=12)
    w.line(f"Status: {log.status}")
    w.line("This scan was recorded before the current scanner version; only its stored summary is available.")
    try:
        crypto = (json.loads(log.details or "{}") or {}).get("crypto") or {}
    except (ValueError, AttributeError):
        crypto = {}
    w.heading("Recorded findings")
    for item in crypto.get("vulnerabilities_found") or []:
        w.line("- " + str(item), indent=10)
    if not crypto.get("vulnerabilities_found"):
        w.line("None recorded.")
    for note in crypto.get("notes") or []:
        w.line("Note: " + str(note), indent=10)


def render_report(log) -> bytes:
    w = _Writer()
    w.pdf.setFont("Helvetica-Bold", 18)
    w.pdf.drawString(LEFT, w.y, "Q-CAPS Cryptographic Posture Report")
    w.y -= 24
    w.line(f"Report generated from scan #{log.id} recorded {log.created_at.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    w.gap()
    try:
        data = json.loads(log.details or "")
    except ValueError:
        data = None
    if isinstance(data, dict) and data.get("schema_version") == 2:
        _render_v2(w, log, data)
    else:
        _render_legacy(w, log)
    return w.finish()
