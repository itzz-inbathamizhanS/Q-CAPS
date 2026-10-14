"""Compute and store risk scores (risk/score.py) whenever their inputs change."""
from typing import Dict, Iterable, Optional

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


def latest_scores(db: Session, finding_ids: Iterable[str]) -> Dict[str, Optional[float]]:
    """Latest current-version score per finding, in one query. A finding without a score row, or whose latest row is
    Unknown (missing context), maps to None."""
    ids = list(set(finding_ids))
    if not ids:
        return {}
    latest_row: Dict[str, models.RiskScore] = {}
    for row in db.query(models.RiskScore).filter(models.RiskScore.finding_id.in_(ids),
                                                  models.RiskScore.model_version == risk_model.RISK_MODEL_VERSION):
        held = latest_row.get(row.finding_id)
        if held is None or _recency(row) > _recency(held):
            latest_row[row.finding_id] = row
    return {fid: (latest_row[fid].score if fid in latest_row else None) for fid in ids}


def _recency(row: models.RiskScore) -> tuple:
    return (row.computed_at is not None, row.computed_at, row.id)


def order_key(score: Optional[float]) -> tuple:
    """Sort key that puts scored findings first, highest risk first, and Unknown (None) after every scored one.
    Unknown is never ranked as if it were 0: it has no position among the scored findings."""
    return (0, -score) if score is not None else (1, 0.0)


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
