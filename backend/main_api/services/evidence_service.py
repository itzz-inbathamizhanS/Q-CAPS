from sqlalchemy.orm import Session
import models
import schemas
import uuid
from evidence.normalizer import normalize_scan
from evidence.hashing import hash_payload
from evidence.confidence import weighted_confidence

def create_evidence(db: Session, raw_scan: dict) -> models.Evidence:
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
    
    evidence = models.Evidence(
        id=str(uuid.uuid4()),
        scan_id=raw_scan.get("scan_id"),
        asset_id=raw_scan.get("asset_id"),
        evidence_type="TLS_SCAN",
        normalized_payload=normalized,
        payload_hash=payload_hash,
        scanner_version="1.0.0",
        classifier_version="1.0.0",
        confidence=conf,
        authorization_context="auto"
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence
