"""Skill matrix: required vs demonstrated competency level per learner (docs/architecture/SKILL_MATRIX.md).

required_level comes from the requirement rows of the learner's open findings (risk-to-skill map); demonstrated_level
from the capability estimator. Unknown is never treated as rank 0: a gap against an Unknown level is "unassessed".
"""
from typing import Dict, List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
from competency import requirements
from competency.seed import load_model

# v1 gap classes (a hypothesis to calibrate, documented in SKILL_MATRIX.md): by rank difference, escalated one step
# when a driving finding is high severity.
GAP_CLASSES = ("none", "medium", "high", "critical")
ESCALATION_SEVERITY = 0.9


def level_ranks(model: dict) -> Dict[str, int]:
    return {lv["id"]: lv["rank"] for lv in model["capability_levels"]["levels"]}


def gap_class(rank_gap: int, max_severity: float) -> str:
    if rank_gap <= 0:
        return "none"  # requirement met: no escalation, a met requirement is not a gap
    index = min(rank_gap, 3)  # 1 medium, 2 high, >=3 critical
    if max_severity >= ESCALATION_SEVERITY:
        index = min(index + 1, 3)
    return GAP_CLASSES[index]


def build(db: Session, user: models.User) -> dict:
    model = load_model()
    ranks = level_ranks(model)
    req_map = requirements.load_map()

    # The learner's own open findings plus shared (ownerless) records, as elsewhere. Admins get the same scope: the
    # matrix describes the learner's environment, not every user's assets.
    rows = (db.query(models.FindingRequirement, models.Finding)
            .join(models.Finding, models.Finding.id == models.FindingRequirement.finding_id)
            .join(models.Asset, models.Asset.id == models.Finding.asset_id)
            .filter(models.Finding.status == "OPEN",
                    models.FindingRequirement.map_version == req_map["version"],
                    or_(models.Asset.owner_user_id == user.id, models.Asset.owner_user_id.is_(None)))
            .all())
    required: Dict[str, dict] = {}
    for req, finding in rows:
        entry = required.setdefault(req.competency_code, {"level": None, "findings": {}})
        if entry["level"] is None or ranks[req.required_level] > ranks[entry["level"]]:
            entry["level"] = req.required_level
        entry["findings"][finding.id] = {
            "finding_id": finding.id, "finding_type": finding.finding_type, "title": finding.title,
            "severity": finding.severity, "requirement_id": req.requirement_id, "required_level": req.required_level,
        }

    competencies = {c.id: c for c in db.query(models.Competency).all()}
    by_code = {c.code: c for c in competencies.values()}
    capabilities = {competencies[c.competency_id].code: c
                    for c in db.query(models.LearnerCapability).filter(models.LearnerCapability.user_id == user.id)
                    if c.competency_id in competencies}

    out: List[dict] = []
    for code in sorted(set(required) | set(capabilities)):
        comp = by_code.get(code)
        cap = capabilities.get(code)
        demonstrated = (cap.level if cap and cap.level else "Unknown")
        req = required.get(code)
        required_level: Optional[str] = req["level"] if req else None
        drivers = sorted(req["findings"].values(), key=lambda f: -f["severity"]) if req else []
        if required_level is None:
            gap, klass = None, None  # no current requirement
        elif demonstrated == "Unknown":
            gap, klass = "unassessed", "unassessed"
        else:
            gap = ranks[required_level] - ranks[demonstrated]
            klass = gap_class(gap, max(f["severity"] for f in drivers))
        out.append({
            "competency_code": code,
            "competency_name": comp.name if comp else None,
            "required_level": required_level,
            "demonstrated_level": demonstrated,
            "gap": gap,
            "gap_class": klass,
            "driving_findings": drivers,
            "evidence_count": cap.evidence_count if cap else 0,
            "last_evidence_at": cap.last_evidence_at if cap else None,
            "knowledge_score": cap.knowledge_score if cap else None,
            "procedural_score": cap.procedural_score if cap else None,
        })

    order = {"critical": 0, "high": 1, "medium": 2, "unassessed": 3, "none": 4, None: 5}
    out.sort(key=lambda r: (order[r["gap_class"]], r["competency_code"]))
    return {
        "competency_model_version": str(model["version"]),
        "levels_status": model["capability_levels"].get("status"),
        "requirement_map_version": req_map["version"],
        "requirement_map_status": req_map["status"],
        "rows": out,
    }
