from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
import models
import uuid
from evidence.normalizer import normalize_scan
from evidence.hashing import hash_payload
from evidence.confidence import weighted_confidence


def create_evidence(
    db: Session,
    raw_scan: dict,
    *,
    asset_id: Optional[int] = None,
    scanner_version: Optional[str] = None,
    authorization_context: Optional[str] = None,
    commit: bool = True,
) -> models.Evidence:
    normalized = normalize_scan(raw_scan)
    payload_hash = hash_payload(normalized)

    # Calculate confidence - dummy values for prototype based on scan data presence
    conf = weighted_confidence(
        protocol_evidence=1.0 if normalized.get("tls_version") else 0.0,
        certificate_evidence=1.0 if normalized.get("certificate_public_key_algorithm") else 0.0,
        source_code_evidence=0.0,
        repeated_observation=0.0,
        freshness=1.0
    )

    if raw_scan.get("schema_version") == 2:
        scan_id = f"{raw_scan.get('target_url')}@{raw_scan.get('scan_timestamp')}"
    else:
        scan_id = raw_scan.get("scan_id")

    evidence = models.Evidence(
        id=str(uuid.uuid4()),
        scan_id=scan_id,
        asset_id=asset_id if asset_id is not None else raw_scan.get("asset_id"),
        evidence_type="TLS_SCAN",
        normalized_payload=normalized,
        payload_hash=payload_hash,
        scanner_version=scanner_version or "1.0.0",
        classifier_version="1.0.0",
        confidence=conf,
        authorization_context=authorization_context or "auto"
    )
    db.add(evidence)
    if commit:
        db.commit()
        db.refresh(evidence)
    else:
        db.flush()
    return evidence


# ---------------------------------------------------------------------------
# Verified scans -> assets, evidence and findings over time
# ---------------------------------------------------------------------------

# Only exposures become tracked findings; low/info items are advice and would otherwise drive the
# exposure-graph recommender.
SEVERITY_SCORE = {"high": 0.9, "medium": 0.6}
SEVERITY_LABEL = {"high": "high", "medium": "medium"}

# Which check has to have completed in a later scan before a missing finding counts as resolved.
# If that check failed or did not run, the finding stays OPEN: unknown is not fixed.
FINDING_CHECK = (
    ("pqc.kex.", "tls_key_exchange"),
    ("tls.kex.", "tls_handshake"),
    ("tls.version.", "tls_handshake"),
    ("tls.legacy.", "legacy_tls"),
    ("cert.", "certificate"),
    ("http.", "http_headers"),
    ("dns.", "dns"),
    ("exposure.port.", "ports"),
)
PROTOCOL = {"pqc": "TLS", "tls": "TLS", "certificate": "TLS", "http": "HTTP", "dns": "DNS", "exposure": "TCP"}


def severity_label(score: float) -> str:
    return "high" if score >= 0.8 else "medium"


def _check_for(finding_type: str) -> Optional[str]:
    for prefix, check in FINDING_CHECK:
        if finding_type.startswith(prefix):
            return check
    return None


def ingest_scan(db: Session, user: models.User, result: dict) -> Optional[dict]:
    """Record a verified full scan against an asset owned by `user` and update its findings.

    Only scans of a domain whose ownership was proven are tracked over time. The caller commits.
    Returns a summary, or None when the scan is not eligible.
    """
    auth = result.get("authorization") or {}
    target = result.get("target_url")
    if result.get("schema_version") != 2 or auth.get("mode") != "full" or auth.get("ownership_verified") is not True:
        return None
    if not isinstance(target, str) or not target:
        return None

    asset = db.query(models.Asset).filter(
        models.Asset.owner_user_id == user.id, models.Asset.canonical_target == target).first()
    if asset is None:
        asset = models.Asset(owner_user_id=user.id, canonical_target=target, asset_type="domain")
        db.add(asset)
        db.flush()

    evidence = create_evidence(
        db, result, asset_id=asset.id, scanner_version=result.get("scanner_version") or "unknown",
        authorization_context="domain_verified", commit=False)

    now = datetime.now(timezone.utc)
    present = {f["id"]: f for f in (result.get("findings") or [])
               if isinstance(f, dict) and isinstance(f.get("id"), str) and f.get("severity") in SEVERITY_SCORE}
    existing = {f.finding_type: f for f in db.query(models.Finding).filter(models.Finding.asset_id == asset.id).all()}
    checks = result.get("checks") or {}
    opened = updated = resolved = 0

    for fid, f in present.items():
        row = existing.get(fid)
        if row is None:
            db.add(models.Finding(
                id=str(uuid.uuid4()), asset_id=asset.id, evidence_id=evidence.id, finding_type=fid, title=f.get("title"),
                algorithm=f.get("algorithm"), protocol=PROTOCOL.get(f.get("category")), severity=SEVERITY_SCORE[f["severity"]],
                confidence=evidence.confidence, status="OPEN", first_seen=now, last_seen=now))
            opened += 1
            continue
        if row.status == "RESOLVED":
            row.status = "OPEN"  # observed again after being resolved
            opened += 1
        else:
            updated += 1
        row.evidence_id, row.last_seen, row.title = evidence.id, now, f.get("title") or row.title
        row.severity, row.algorithm = SEVERITY_SCORE[f["severity"]], f.get("algorithm") or row.algorithm

    for fid, row in existing.items():
        if fid in present or row.status != "OPEN":
            continue  # findings in the closure workflow are not changed by scans
        check = _check_for(fid)
        if check and (checks.get(check) or {}).get("status") == "ok":
            row.status, row.last_seen = "RESOLVED", now
            resolved += 1

    return {"asset_id": asset.id, "evidence_id": evidence.id, "opened": opened, "updated": updated, "resolved": resolved}
