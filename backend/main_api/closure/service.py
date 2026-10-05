"""Server-authoritative closure verification (docs/architecture/CLOSURE.md).

A finding's intervention is verified from evidence the server already holds, never from values the client sends:
  technical  the finding was RESOLVED by a later verified scan that completed the supporting check
             (evidence_service.ingest_scan decides this; "check failed" or "not run" keeps it OPEN);
  learner    the capability estimate of the asset owner for the intervention's competency reaches the level the
             finding requires (finding_requirements), or the intervention's minimum knowledge score when the
             finding has no mapped requirement.
Each verification is stored (verifications) and appended to the finding's hash-chained closure events.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

import models
from closure.state_machine import ClosureStatus
from evidence.hashing import hash_payload

VERIFIER_VERSION = "closure-v2"
LEVEL_RANK = {"Unknown": 0, "Beginner": 1, "Developing": 2, "Proficient": 3, "Advanced": 4}


def _technical(db: Session, finding: models.Finding) -> dict:
    """Remediated when the finding is RESOLVED; the after-evidence is the newest verified scan of the same asset."""
    after = (db.query(models.Evidence)
             .filter(models.Evidence.asset_id == finding.asset_id, models.Evidence.authorization_context == "domain_verified")
             .order_by(models.Evidence.observed_at.desc(), models.Evidence.id.desc()).first())
    return {
        "remediated": finding.status == "RESOLVED",
        "same_asset": after is not None and after.asset_id == finding.asset_id,
        "finding_status": finding.status,
        "before_evidence_id": finding.evidence_id,  # the last scan that observed the finding
        "after_evidence_id": after.id if after else None,
        "rule": "finding RESOLVED by a verified scan whose supporting check completed",
    }


def _learner(db: Session, learner_id: Optional[int], intervention: models.Intervention, finding: models.Finding) -> dict:
    competency = db.get(models.Competency, intervention.competency_id) if intervention.competency_id else None
    if competency is None or learner_id is None:
        return {"ok": False, "competency": None, "detail": "The intervention names no competency, so no learner evidence applies."}
    cap = (db.query(models.LearnerCapability)
           .filter_by(user_id=learner_id, competency_id=competency.id).one_or_none())
    level = cap.level if cap and cap.level else "Unknown"
    req = (db.query(models.FindingRequirement)
           .filter_by(finding_id=finding.id, competency_code=competency.code)
           .order_by(models.FindingRequirement.created_at.desc()).first())
    if req:
        ok = level != "Unknown" and LEVEL_RANK[level] >= LEVEL_RANK[req.required_level]
        rule = f"level {level} >= required {req.required_level}"
    else:
        knowledge = cap.knowledge_score if cap else None
        ok = knowledge is not None and knowledge >= (intervention.minimum_score or 0.8)
        rule = f"knowledge score {knowledge} >= {intervention.minimum_score}"
    return {
        "ok": ok, "learner_id": learner_id, "competency": competency.code, "level": level,
        "required_level": req.required_level if req else None,
        "knowledge_score": cap.knowledge_score if cap else None,
        "procedural_score": cap.procedural_score if cap else None,
        "rule": rule,
    }


def append_event(db: Session, finding_id: str, intervention_id: Optional[str], verification_id: Optional[str],
                 new_state: str, reason: str) -> models.ClosureEvent:
    """Append a closure event whose hash covers its content and the previous event's hash (tamper evidence)."""
    last = (db.query(models.ClosureEvent).filter_by(finding_id=finding_id)
            .order_by(models.ClosureEvent.created_at.desc(), models.ClosureEvent.id.desc()).first())
    previous_state = last.new_state if last else ClosureStatus.OPEN
    created_at = datetime.now(timezone.utc)
    body = {
        "finding_id": finding_id, "intervention_id": intervention_id, "verification_id": verification_id,
        "previous_state": previous_state, "new_state": new_state, "reason": reason,
        "previous_event_hash": last.event_hash if last else None, "created_at": created_at.isoformat(),
    }
    event = models.ClosureEvent(id=str(uuid.uuid4()), event_hash=hash_payload(body), **{**body, "created_at": created_at})
    db.add(event)
    return event


def verify_chain(events: list) -> bool:
    """True when every event's hash matches its content and links to its predecessor."""
    previous = None
    for e in events:
        created = e.created_at if e.created_at.tzinfo else e.created_at.replace(tzinfo=timezone.utc)
        body = {
            "finding_id": e.finding_id, "intervention_id": e.intervention_id, "verification_id": e.verification_id,
            "previous_state": e.previous_state, "new_state": e.new_state, "reason": e.reason,
            "previous_event_hash": e.previous_event_hash, "created_at": created.isoformat(),
        }
        if e.previous_event_hash != previous or hash_payload(body) != e.event_hash:
            return False
        previous = e.event_hash
    return True


def verify(db: Session, intervention: models.Intervention) -> dict:
    finding = db.get(models.Finding, intervention.finding_id)
    asset = db.get(models.Asset, finding.asset_id) if finding else None
    learner_id = asset.owner_user_id if asset else None
    technical = _technical(db, finding)
    learner = _learner(db, learner_id, intervention, finding)
    technical_ok = technical["remediated"] and technical["same_asset"]
    if technical_ok and learner["ok"]:
        status = ClosureStatus.CLOSED
    elif technical_ok or learner["ok"]:
        status = ClosureStatus.PARTIALLY_CLOSED
    else:
        status = ClosureStatus.OPEN

    verification = models.Verification(
        id=str(uuid.uuid4()), intervention_id=intervention.id,
        before_evidence_id=technical["before_evidence_id"], after_evidence_id=technical["after_evidence_id"],
        technical_result=technical, learner_result=learner, verifier_version=VERIFIER_VERSION)
    db.add(verification)
    db.flush()
    reason = f"technical {'ok' if technical_ok else 'not met'}; learner {'ok' if learner['ok'] else 'not met'}"
    event = append_event(db, finding.id, intervention.id, verification.id, status, reason)
    db.commit()
    return {
        "status": status, "verification_id": verification.id, "event_hash": event.event_hash,
        "technical": technical, "learner": learner, "technical_ok": technical_ok, "learner_result_ok": learner["ok"],
        "verifier_version": VERIFIER_VERSION,
    }
