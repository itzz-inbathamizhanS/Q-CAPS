"""PDF rendering of a stored scan result (schema v2, with a minimal fallback for older logs).

The report only restates what the scan observed. It never adds breach, dark-web or vulnerability-database
claims, and it states which checks failed or were not run.

Layout is built with reportlab platypus (tables and flowables) so columns align and long values wrap; nothing
is positioned by hand except the running header and footer.
"""
import io
import json
from datetime import datetime, timezone
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (BaseDocTemplate, Frame, HRFlowable, KeepTogether, PageTemplate, Paragraph, Spacer, Table,
                                TableStyle)

SEVERITY_ORDER = ["high", "medium", "low", "info"]
SEVERITY_LABEL = {"high": "High", "medium": "Medium", "low": "Low", "info": "Info"}

INK = colors.HexColor("#1F2430")
MUTED = colors.HexColor("#5B6272")
RULE = colors.HexColor("#D9DCE3")
WASH = colors.HexColor("#F4F5F8")
ACCENT = colors.HexColor("#4B2FD0")
SEVERITY_COLOR = {
    "high": colors.HexColor("#B42318"),
    "medium": colors.HexColor("#B54708"),
    "low": colors.HexColor("#1D6F8A"),
    "info": colors.HexColor("#5B6272"),
}
OK_COLOR = colors.HexColor("#14683F")

PAGE_W, PAGE_H = A4
MARGIN_X, MARGIN_TOP, MARGIN_BOTTOM = 20 * mm, 24 * mm, 20 * mm
CONTENT_W = PAGE_W - 2 * MARGIN_X

KEY_EXCHANGE_LABEL = {
    "hybrid_pqc": "Hybrid post-quantum",
    "hybrid_pqc_available": "Classical preferred; hybrid post-quantum accepted",
    "classical": "Classical only",
    "unknown": "Not determined",
}
AUTH_LABEL = {"classical": "Classical signatures", "pqc": "Post-quantum signatures", "unknown": "Not determined"}
CHECK_LABEL = {
    "dns": "DNS and email records", "whois": "WHOIS registration", "http_headers": "HTTP security headers",
    "tls_handshake": "TLS handshake", "tls_key_exchange": "Key exchange probe (TLS 1.3)", "certificate": "Certificate",
    "ct_subdomains": "Certificate Transparency subdomains", "ports": "TCP port probe", "dns_wordlist": "Subdomain wordlist",
    "legacy_tls": "Legacy TLS versions (1.0 / 1.1)",
}
STATUS_LABEL = {"ok": "Completed", "failed": "Failed", "skipped": "Skipped", "requires_verification": "Needs verification"}
STATUS_COLOR = {"ok": OK_COLOR, "failed": SEVERITY_COLOR["high"], "skipped": MUTED, "requires_verification": SEVERITY_COLOR["medium"]}


def _style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9, leading=13, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)


S = {
    "title": _style("title", fontName="Helvetica-Bold", fontSize=21, leading=25),
    "eyebrow": _style("eyebrow", fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=ACCENT),
    "target": _style("target", fontName="Helvetica-Bold", fontSize=13, leading=17),
    "h2": _style("h2", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=MUTED, spaceBefore=16, spaceAfter=3),
    "body": _style("body"),
    "small": _style("small", fontSize=8, leading=11, textColor=MUTED),
    "label": _style("label", fontSize=8.5, leading=12, textColor=MUTED),
    "value": _style("value", wordWrap="CJK"),
    "mono": _style("mono", fontName="Courier", fontSize=8, leading=11, wordWrap="CJK"),
    "evidence": _style("evidence", fontName="Courier", fontSize=8, leading=11, wordWrap="CJK", backColor=WASH, borderPadding=(3, 4, 3, 4)),
    "finding": _style("finding", fontName="Helvetica-Bold", fontSize=10, leading=13),
    "th": _style("th", fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=MUTED),
    "count": _style("count", fontName="Helvetica-Bold", fontSize=22, leading=26, alignment=TA_CENTER),
    "count_label": _style("count_label", fontSize=8, leading=10, textColor=MUTED, alignment=TA_CENTER),
}


# ---------------------------------------------------------------- text helpers

def _safe(value) -> str:
    """Core PDF fonts are Latin-1; anything else becomes a question mark rather than a missing glyph box."""
    text = "Not available" if value is None or value == "" else str(value)
    return escape(text.encode("latin-1", "replace").decode("latin-1"))


def _p(value, style="value") -> Paragraph:
    return Paragraph(_safe(value), S[style])


def _rich(markup: str, style="body") -> Paragraph:
    return Paragraph(markup, S[style])


def _when(value) -> str:
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    except ValueError:
        return _safe(value)


def _date(value) -> str:
    return str(value).split("T")[0] if value else "Not available"


def _colored(text, color, bold=True) -> str:
    inner = f"<b>{_safe(text)}</b>" if bold else _safe(text)
    return f'<font color="{color.hexval().replace("0x", "#")}">{inner}</font>'


# ---------------------------------------------------------------- building blocks

def _section(title):
    return [Paragraph(_safe(title).upper(), S["h2"]), HRFlowable(width="100%", thickness=0.6, color=RULE, spaceAfter=5)]


def _kv_table(rows, label_w=44 * mm):
    """Two aligned columns: muted label, value. Values may be strings or flowables."""
    data = [[Paragraph(_safe(k), S["label"]), v if not isinstance(v, str) else _p(v)] for k, v in rows]
    table = Table(data, colWidths=[label_w, CONTENT_W - label_w], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def _grid_table(header, rows, widths, align_right=()):
    data = [[Paragraph(_safe(h).upper(), S["th"]) for h in header]] + rows
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, INK),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    for col in align_right:
        style.append(("ALIGN", (col, 0), (col, -1), "RIGHT"))
    table.setStyle(TableStyle(style))
    return table


def _counts_table(findings):
    counts = {s: sum(1 for f in findings if f.get("severity") == s) for s in SEVERITY_ORDER}
    cells = []
    for s in SEVERITY_ORDER:
        color = SEVERITY_COLOR[s] if counts[s] else RULE
        number = Paragraph(f'<font color="{color.hexval().replace("0x", "#")}">{counts[s]}</font>', S["count"])
        cells.append([number, Paragraph(SEVERITY_LABEL[s].upper(), S["count_label"])])
    table = Table([cells], colWidths=[CONTENT_W / 4] * 4)
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("LINEAFTER", (0, 0), (-2, -1), 0.6, RULE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def _finding_block(f):
    sev = f.get("severity", "info")
    color = SEVERITY_COLOR.get(sev, MUTED)
    inner = [Paragraph(f'{_colored(SEVERITY_LABEL.get(sev, sev).upper(), color)}&nbsp;&nbsp;{_safe(f.get("title"))}', S["finding"])]
    if f.get("detail"):
        inner += [Spacer(1, 2), _p(f["detail"], "body")]
    inner += [Spacer(1, 4), Paragraph("EVIDENCE", S["th"]), Spacer(1, 1), _p(f.get("evidence"), "evidence"),
              Spacer(1, 5), Paragraph("RECOMMENDATION", S["th"]), Spacer(1, 1), _p(f.get("recommendation"), "body")]
    table = Table([["", inner]], colWidths=[2.2 * mm, CONTENT_W - 2.2 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("BOX", (0, 0), (-1, -1), 0.5, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0), ("RIGHTPADDING", (0, 0), (0, 0), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 10), ("RIGHTPADDING", (1, 0), (1, 0), 10),
        ("TOPPADDING", (1, 0), (1, 0), 8), ("BOTTOMPADDING", (1, 0), (1, 0), 9),
    ]))
    return KeepTogether([table, Spacer(1, 7)])


# ---------------------------------------------------------------- report bodies

def _cover(log, data):
    story = [Paragraph("Q-CAPS", S["eyebrow"]), Spacer(1, 3), Paragraph("Cryptographic Posture Report", S["title"]), Spacer(1, 10)]
    if data is not None:
        auth = data.get("authorization") or {}
        full = auth.get("mode") == "full"
        scan_type = ("Full scan; domain ownership verified" + (f" ({_safe(auth.get('verified_domain'))})" if auth.get("verified_domain") else "")
                     if full else "Standard scan; passive checks only")
        rows = [
            ("Target", Paragraph(_safe(data.get("target_url")), S["target"])),
            ("Scan type", scan_type),
            ("Scanned", _when(data.get("scan_timestamp"))),
            ("Resolved addresses", ", ".join(data.get("resolved_addresses") or []) or "Not available"),
            ("Scanner version", data.get("scanner_version")),
            ("Report reference", f"Scan #{log.id}"),
        ]
    else:
        rows = [("Target", Paragraph(_safe(log.endpoint), S["target"])), ("Scan status", log.status),
                ("Recorded", _when(log.created_at.isoformat())), ("Report reference", f"Scan #{log.id}")]
    story.append(_kv_table(rows))
    return story


def _v2_story(log, data):
    story = _cover(log, data)
    findings = data.get("findings") or []
    tls = data.get("tls") or {}
    cert = tls.get("certificate") or {}
    posture = data.get("pqc_posture")

    story += _section("Summary")
    story += [_counts_table(findings), Spacer(1, 10)]
    if posture:
        kex = tls.get("key_exchange") or {}
        group = kex.get("preferred_group_name")
        key_exchange = _rich(f'<b>{_safe(KEY_EXCHANGE_LABEL.get(posture["key_exchange"], posture["key_exchange"]))}</b>'
                             + (f" ({_safe(group)})" if group else ""), "value")
        size = cert.get("curve") or cert.get("key_size")
        auth_text = AUTH_LABEL.get(posture["authentication"], posture["authentication"])
        auth_detail = f" ({_safe(cert.get('public_key_algorithm'))} {_safe(size)})" if cert else ""
        story.append(_kv_table([
            ("Key exchange", key_exchange),
            ("Certificate authentication", _rich(f"<b>{_safe(auth_text)}</b>{auth_detail}", "value")),
        ]))
        story.append(Spacer(1, 6))
        story.append(_p("Key exchange protects recorded traffic against a future quantum computer; hybrid ML-KEM groups such as "
                        "X25519MLKEM768 provide that protection. Certificate signatures only matter while a connection is being "
                        "made, so classical certificates are a migration-planning item.", "small"))
        for evidence in kex.get("evidence") or []:
            story.append(_p("- " + evidence, "small"))
    else:
        story.append(_p("No verified result available: the TLS checks did not complete.", "body"))

    story += _section("Findings")
    if findings:
        for sev in SEVERITY_ORDER:
            story += [_finding_block(f) for f in findings if f.get("severity") == sev]
    else:
        story.append(_p("No findings were derived from the checks that completed. See Checks performed for any check that did not run.", "body"))

    story += _section("TLS and certificate")
    if tls:
        trusted = {True: "Yes", False: "No", None: "Not determined"}[tls.get("trusted")]
        rows = [("Protocol", tls.get("version")), ("Cipher suite", Paragraph(_safe(tls.get("cipher_suite")), S["mono"])),
                ("Application protocol", tls.get("alpn")),
                ("Trusted by public roots", trusted + (f" ({tls['trust_error']})" if tls.get("trust_error") else ""))]
        legacy = tls.get("legacy_protocols")
        if legacy:
            rows.append(("TLS 1.0 / 1.1 accepted", " / ".join({True: "Yes", False: "No", None: "Unknown"}[legacy.get(k)] for k in ("tls1_0", "tls1_1"))))
        if cert:
            size = cert.get("curve") or cert.get("key_size")
            rows += [("Subject", cert.get("subject_cn") or cert.get("subject")), ("Issuer", cert.get("issuer_cn") or cert.get("issuer")),
                     ("Public key", f"{cert.get('public_key_algorithm')} {size or ''}".strip()),
                     ("Signature algorithm", cert.get("signature_algorithm")),
                     ("Valid until", f"{_date(cert.get('not_after'))} ({cert.get('days_remaining')} days remaining)"),
                     ("Certificate names", f"{cert.get('san_count')} subject alternative name(s)"),
                     ("Chain", " > ".join(c.get("subject_cn") or "?" for c in cert.get("chain") or []))]
        story.append(_kv_table(rows))
    else:
        story.append(_p("No verified result available.", "body"))

    http = data.get("http")
    story += _section("HTTP security headers")
    if http:
        names = [("strict_transport_security", "Strict-Transport-Security"), ("content_security_policy", "Content-Security-Policy"),
                 ("x_content_type_options", "X-Content-Type-Options"), ("x_frame_options", "X-Frame-Options"), ("referrer_policy", "Referrer-Policy")]
        rows = []
        for key, label in names:
            present = (http["headers"].get(key) or {}).get("present")
            rows.append((label, _rich(_colored("Present", OK_COLOR) if present else _colored("Missing", SEVERITY_COLOR["medium"]), "value")))
        rows.append(("Response", f"HTTP {http.get('status')}" + (f" after {len(http['redirects'])} redirect(s)" if http.get("redirects") else "")))
        story.append(_kv_table(rows))
    else:
        story.append(_p(_check_reason(data, "http_headers", "HTTP headers"), "body"))

    dns = data.get("dns")
    story += _section("DNS and email")
    if dns:
        errors = dns.get("errors") or {}

        def records(key):
            if errors.get(key):
                return "Lookup failed"
            items = dns.get(key) or []
            return Paragraph("<br/>".join(_safe(i) for i in items), S["mono"]) if items else "None"

        story.append(_kv_table([("A", records("A")), ("AAAA", records("AAAA")), ("MX", records("MX")), ("NS", records("NS")),
                                ("CAA", records("CAA")),
                                ("SPF", Paragraph(_safe(dns.get("spf") or ("Lookup failed" if errors.get("TXT") else "None")), S["mono"])),
                                ("DMARC", Paragraph(_safe(dns.get("dmarc") or ("Lookup failed" if errors.get("DMARC") else "None")), S["mono"]))]))
    else:
        story.append(_p(_check_reason(data, "dns", "DNS"), "body"))

    whois = data.get("whois")
    story += _section("Registration")
    if whois:
        story.append(_kv_table([("Registrar", whois.get("registrar") or "Not published"), ("Organization", whois.get("organization") or "Not published"),
                                ("Created", _date(whois.get("creation_date"))), ("Expires", _date(whois.get("expiration_date")))]))
    else:
        story.append(_p(_check_reason(data, "whois", "WHOIS"), "body"))

    if data.get("ports"):
        story += _section("TCP ports")
        port_rows = []
        for port, meta in sorted((data["ports"].get("ports") or {}).items(), key=lambda kv: int(kv[0])):
            state = meta.get("state")
            label = {"OPEN": "Open", "CLOSED": "Closed", "FILTERED": "No answer (state unknown)"}.get(state, state)
            colour = SEVERITY_COLOR["medium"] if state == "OPEN" else MUTED
            port_rows.append([_p(port), _p(meta.get("service")), _rich(_colored(label, colour, bold=state == "OPEN"), "value")])
        story.append(_grid_table(["Port", "Service", "State"], port_rows, [22 * mm, 50 * mm, CONTENT_W - 72 * mm]))
        story += [Spacer(1, 4), _p(f"Probed at {data['ports'].get('address')}.", "small")]

    story += _section("Subdomains")
    subs = data.get("subdomains") or []
    if subs:
        rows = [[_p(s["name"], "mono"), _p("Certificate Transparency log" if s.get("source") == "ct_log" else "DNS wordlist")] for s in subs]
        story.append(_grid_table(["Name", "Source"], rows, [CONTENT_W - 60 * mm, 60 * mm]))
    elif (data.get("checks") or {}).get("ct_subdomains", {}).get("status") == "failed":
        story.append(_p(_check_reason(data, "ct_subdomains", "Certificate Transparency subdomains"), "body"))
    else:
        story.append(_p("No subdomains appear in public Certificate Transparency logs. Names that never had a public certificate would not appear.", "body"))

    story += _section("Checks performed")
    rows = []
    for name, c in (data.get("checks") or {}).items():
        status = c.get("status")
        rows.append([_p(CHECK_LABEL.get(name, name)), _rich(_colored(STATUS_LABEL.get(status, status), STATUS_COLOR.get(status, MUTED)), "value"),
                     _p(f"{(c.get('duration_ms') or 0) / 1000:.1f} s" if status != "requires_verification" else "-"), Paragraph(_safe(c["reason"]) if c.get("reason") else "", S["small"])])
    story.append(_grid_table(["Check", "Result", "Time", "Note"], rows, [56 * mm, 32 * mm, 16 * mm, CONTENT_W - 104 * mm], align_right=(2,)))

    story += _section("Limitations")
    for text in ("Observations are a point-in-time view from one network location.",
                 "The TLS key exchange reflects the endpoint that answered; for CDN-fronted sites this is the edge, not necessarily the origin.",
                 "No breach, dark-web or vulnerability-database lookups are performed. Findings come only from the checks listed above."):
        story.append(_p("- " + text, "body"))
    return story


def _check_reason(data, check, what):
    c = (data.get("checks") or {}).get(check) or {}
    return f"No verified result available for {what}" + (f": {c['reason']}." if c.get("reason") else ".")


def _legacy_story(log):
    story = _cover(log, None)
    story.append(Spacer(1, 6))
    story.append(_p("This scan was recorded before the current scanner version; only its stored summary is available.", "body"))
    try:
        crypto = (json.loads(log.details or "{}") or {}).get("crypto") or {}
    except (ValueError, AttributeError):
        crypto = {}
    story += _section("Recorded findings")
    items = crypto.get("vulnerabilities_found") or []
    for item in items:
        story.append(_p("- " + str(item), "body"))
    if not items:
        story.append(_p("None recorded.", "body"))
    for note in crypto.get("notes") or []:
        story.append(_p("Note: " + str(note), "small"))
    return story


FLOWING_SECTIONS = {"FINDINGS", "TCP PORTS", "SUBDOMAINS", "CHECKS PERFORMED"}  # can be long: allowed to break across pages


def _keep_sections_together(story) -> list:
    """Wrap each short section (heading, rule and content) in KeepTogether so a table never starts at the foot of a page."""
    sections = []  # (heading text or None for the cover, flowables)
    for item in story:
        if isinstance(item, Paragraph) and item.style.name == "h2":
            sections.append((item.getPlainText(), [item]))
        elif sections:
            sections[-1][1].append(item)
        else:
            sections.append((None, [item]))
    out = []
    for heading, items in sections:
        if heading is None or heading in FLOWING_SECTIONS:
            out.extend(items)
        else:
            out.append(KeepTogether(items))
    return out


def build_story(log) -> list:
    try:
        data = json.loads(log.details or "")
    except ValueError:
        data = None
    if isinstance(data, dict) and data.get("schema_version") == 2:
        return _keep_sections_together(_v2_story(log, data))
    return _legacy_story(log)


def story_text(story) -> str:
    """Plain text of a story, for tests."""
    parts = []

    def walk(item):
        if isinstance(item, Paragraph):
            parts.append(item.getPlainText())
        elif isinstance(item, Table):
            for row in item._cellvalues:
                for cell in row:
                    walk(cell)
        elif isinstance(item, KeepTogether):
            for sub in item._content:
                walk(sub)
        elif isinstance(item, (list, tuple)):
            for sub in item:
                walk(sub)

    walk(story)
    return "\n".join(parts)


# ---------------------------------------------------------------- page chrome

class _NumberedCanvas(canvas.Canvas):
    """Draws the running header and footer once the page count is known ("Page 2 of 4")."""

    def __init__(self, *args, meta=None, **kwargs):
        super().__init__(*args, **kwargs)
        self._meta = meta or {}
        self._pages = []

    def showPage(self):
        self._pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._pages)
        for state in self._pages:
            self.__dict__.update(state)
            self._chrome(total)
            super().showPage()
        super().save()

    def _chrome(self, total):
        number = self._pageNumber
        if number > 1:  # the first page carries the title block
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(ACCENT)
            self.drawString(MARGIN_X, PAGE_H - 14 * mm, "Q-CAPS")
            self.setFont("Helvetica", 8)
            self.setFillColor(MUTED)
            self.drawString(MARGIN_X + 14 * mm, PAGE_H - 14 * mm, "Cryptographic Posture Report")
            self.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 14 * mm, self._meta.get("target", ""))
            self.setStrokeColor(RULE)
            self.setLineWidth(0.5)
            self.line(MARGIN_X, PAGE_H - 17 * mm, PAGE_W - MARGIN_X, PAGE_H - 17 * mm)
        self.setStrokeColor(RULE)
        self.setLineWidth(0.5)
        self.line(MARGIN_X, 14 * mm, PAGE_W - MARGIN_X, 14 * mm)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(MUTED)
        self.drawString(MARGIN_X, 9.5 * mm, self._meta.get("generated", ""))
        self.drawRightString(PAGE_W - MARGIN_X, 9.5 * mm, f"Page {number} of {total}")


def render_report(log) -> bytes:
    buffer = io.BytesIO()
    target = _safe(log.endpoint)
    meta = {"target": target, "generated": "Generated " + datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}
    doc = BaseDocTemplate(buffer, pagesize=A4, title=f"Q-CAPS Cryptographic Posture Report - {log.endpoint}", author="Q-CAPS",
                          subject="Cryptographic posture assessment")
    # Zero frame padding so tables, rules and cards share exactly the same left and right edge.
    frame = Frame(MARGIN_X, MARGIN_BOTTOM, CONTENT_W, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM, leftPadding=0, rightPadding=0,
                  topPadding=0, bottomPadding=0, id="body")
    doc.addPageTemplates([PageTemplate(id="page", frames=[frame])])
    doc.build(build_story(log), canvasmaker=lambda *a, **k: _NumberedCanvas(*a, meta=meta, **k))
    return buffer.getvalue()
