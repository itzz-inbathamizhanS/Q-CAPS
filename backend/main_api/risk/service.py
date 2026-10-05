"""Compute and store risk scores (risk/score.py) whenever their inputs change."""
from typing import Optional

from sqlalchemy.orm import Session

import models
from risk import score as risk_model


def score_finding(db: Session, finding: models.Finding, asset: Optional[models.Asset] = None) -> models.RiskScore:
    """Store a new score row for the finding. Rows are never edited, so the history of inputs stays traceable."""
    asset = asset or db.get(models.Asset, finding.asset_id)
    result = risk_model.score(
        finding_type=finding.finding_type, severity=finding.severity, confidence=finding.confidence,
        criticality_level=asset.criticality_level if asset else None,
        confidentiality_years=asset.confidentiality_years if asset else None,
        data_sensitivity=asset.data_sensitivity if asset else None)
    row = models.RiskScore(finding_id=finding.id, model_version=result["model_version"], score=result["score"],
                           factors=result["factors"], inputs=result["inputs"], missing=result["missing"])
    db.add(row)
    return row


def rescore_asset(db: Session, asset: models.Asset) -> int:
    findings = db.query(models.Finding).filter(models.Finding.asset_id == asset.id).all()
    for f in findings:
        score_finding(db, f, asset)
    return len(findings)


def latest(db: Session, finding_id: str) -> Optional[models.RiskScore]:
    return (db.query(models.RiskScore).filter(models.RiskScore.finding_id == finding_id,
                                              models.RiskScore.model_version == risk_model.RISK_MODEL_VERSION)
            .order_by(models.RiskScore.computed_at.desc(), models.RiskScore.id.desc()).first())


def backfill(db: Session) -> int:
    """Score findings that have no score for the current model version (findings recorded before it existed)."""
    scored = {fid for (fid,) in db.query(models.RiskScore.finding_id).filter(
        models.RiskScore.model_version == risk_model.RISK_MODEL_VERSION).distinct()}
    n = 0
    for f in db.query(models.Finding).all():
        if f.id not in scored:
            score_finding(db, f)
            n += 1
    db.commit()
    return n
