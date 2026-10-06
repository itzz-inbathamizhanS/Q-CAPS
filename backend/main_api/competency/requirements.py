"""Risk-to-skill mapping: which requirement a scanner finding creates and which competencies it needs.

The mapping lives in content/curriculum/requirement_map.json (versioned, proposed-unreviewed until experts review
it; see docs/architecture/RISK_TO_SKILL_MAPPING.md). This module loads and validates it, matches finding types
against it and stores the derived rows in finding_requirements.
"""
import json
import os
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from sqlalchemy.orm import Session

import models
from competency.seed import load_model, model_competencies

MAP_PATH = Path(os.getenv("QCAPS_REQUIREMENT_MAP", Path(__file__).resolve().parents[3] / "content" / "curriculum" / "requirement_map.json"))
LEVELS = ("Unknown", "Beginner", "Developing", "Proficient", "Advanced")
# A requirement at "Unknown" or "Beginner" would mean "no skill needed"; the map only uses the higher levels.
REQUIRABLE_LEVELS = ("Developing", "Proficient", "Advanced")


def _matches(match: dict, finding_type: str) -> bool:
    if "finding_type" in match:
        return finding_type == match["finding_type"]
    if "finding_type_prefix" in match:
        return finding_type.startswith(match["finding_type_prefix"])
    return False


def validate_map(data: dict, competency_codes: set) -> List[str]:
    errors = []
    for key in ("version", "status", "rules", "positive_evidence", "unmapped_by_design"):
        if key not in data:
            errors.append(f"missing {key}")
    for i, rule in enumerate(data.get("rules", [])):
        where = rule.get("requirement_id") or f"rule {i}"
        match = rule.get("match") or {}
        if len([k for k in ("finding_type", "finding_type_prefix") if k in match]) != 1:
            errors.append(f"{where}: match needs exactly one of finding_type or finding_type_prefix")
        if not rule.get("requirement"):
            errors.append(f"{where}: no requirement text")
        if not isinstance(rule.get("pqc_relevant"), bool):
            errors.append(f"{where}: pqc_relevant must be true or false")
        if not rule.get("competencies"):
            errors.append(f"{where}: no competencies")
        seen = set()
        for c in rule.get("competencies", []):
            if c.get("id") not in competency_codes:
                errors.append(f"{where}: unknown competency {c.get('id')}")
            if c.get("required_level") not in REQUIRABLE_LEVELS:
                errors.append(f"{where}: required_level {c.get('required_level')} is not one of {REQUIRABLE_LEVELS}")
            if c.get("id") in seen:
                errors.append(f"{where}: competency {c.get('id')} listed twice")
            seen.add(c.get("id"))
    return errors


@lru_cache(maxsize=1)
def load_map(path: str = str(MAP_PATH)) -> dict:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    codes = {c["code"] for c in model_competencies(load_model())}
    errors = validate_map(data, codes)
    if errors:
        raise ValueError(f"{path} is invalid: " + "; ".join(errors))
    return data


def rule_for(finding_type: str, data: Optional[dict] = None) -> Optional[dict]:
    """The first rule matching the finding type, or None."""
    data = data or load_map()
    for rule in data["rules"]:
        if _matches(rule["match"], finding_type):
            return rule
    return None


def classify(finding_type: str, data: Optional[dict] = None) -> str:
    """mapped | positive_evidence | unmapped_by_design | unknown. "unknown" means the map has a gap."""
    data = data or load_map()
    if rule_for(finding_type, data):
        return "mapped"
    if any(_matches(p, finding_type) for p in data["positive_evidence"]):
        return "positive_evidence"
    if any(_matches(u, finding_type) for u in data["unmapped_by_design"]):
        return "unmapped_by_design"
    return "unknown"


def derive_requirements(db: Session, finding: models.Finding, data: Optional[dict] = None) -> bool:
    """(Re)derive the requirement rows of one finding for the current map version. Idempotent: rows that still
    apply are kept, rows the current map no longer produces are removed (rows of other map versions are kept for
    traceability). Returns True when a rule matched."""
    data = data or load_map()
    version = data["version"]
    rule = rule_for(finding.finding_type, data)
    wanted = set()
    if rule:
        wanted = {(rule["requirement_id"], c["id"], c["required_level"]) for c in rule["competencies"]}
    current = db.query(models.FindingRequirement).filter(
        models.FindingRequirement.finding_id == finding.id, models.FindingRequirement.map_version == version).all()
    have = set()
    for row in current:
        key = (row.requirement_id, row.competency_code, row.required_level)
        if key in wanted:
            have.add(key)
        else:
            db.delete(row)
    now = datetime.now(timezone.utc)
    for requirement_id, code, level in sorted(wanted - have):
        db.add(models.FindingRequirement(finding_id=finding.id, requirement_id=requirement_id, competency_code=code,
                                         required_level=level, map_version=version, created_at=now))
    return rule is not None


def describe(row: models.FindingRequirement, data: Optional[dict] = None) -> dict:
    """API view of a stored row, with the rule's text when the row comes from the loaded map version."""
    data = data or load_map()
    rule = None
    if row.map_version == data["version"]:
        rule = next((r for r in data["rules"] if r["requirement_id"] == row.requirement_id), None)
    return {
        "requirement_id": row.requirement_id,
        "requirement": rule["requirement"] if rule else None,
        "pqc_relevant": rule["pqc_relevant"] if rule else None,
        "rationale": rule["rationale"] if rule else None,
        "competency_code": row.competency_code,
        "required_level": row.required_level,
        "map_version": row.map_version,
        "map_status": data["status"] if rule else None,
    }


def backfill(db: Session) -> dict:
    """Derive requirements for findings that have none for the current map version (findings recorded before the
    map existed, or before a new map version). Idempotent; run on startup."""
    data = load_map()
    done = {fid for (fid,) in db.query(models.FindingRequirement.finding_id).filter(
        models.FindingRequirement.map_version == data["version"]).distinct()}
    mapped = unmapped = 0
    for finding in db.query(models.Finding).all():
        if finding.id in done:
            continue
        if derive_requirements(db, finding, data):
            mapped += 1
        else:
            unmapped += 1
    db.commit()
    return {"map_version": data["version"], "mapped": mapped, "unmapped": unmapped}
