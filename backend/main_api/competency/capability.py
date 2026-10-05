"""Capability estimator: fills learner_capabilities from stored evidence (docs/architecture/CAPABILITY_MODEL.md).

Every estimate is recomputed from the evidence, never updated incrementally, so a score can go down after later
wrong answers and the same evidence always gives the same result. Missing evidence is None, never 0 or 50, and a
competency with fewer than min_items_for_known scored items is "Unknown".

Evidence per user and competency:
  knowledge   quiz items tagged with the competency; the latest graded response per item counts.
  procedural  tagged labs and missions: a lab is passed when the learner's first answer was correct, a mission when
              its latest finished run ended in a passing band.
  operational verifications of interventions for the competency on the learner's own assets.
Levels follow the structured rules in content/curriculum/competency_model.json (capability_levels.levels[].rule).
"""
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, Iterable, List, Optional

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

import models
from activities import catalogue
from competency.seed import load_model

logger = logging.getLogger("qcaps.capability")

DEPTH_GROUP = {"Aware": "aware_explain", "Explain": "aware_explain", "Apply": "apply", "Analyse": "analyse"}
PRACTICAL_DEPTHS = ("Apply", "Analyse")  # a practical counts towards Proficient only at these depths
PASSING_MISSION_BANDS = ("success", "partial")  # the bands that also earn the mission's XP


@dataclass
class Evidence:
    items: Dict[str, tuple] = field(default_factory=dict)       # item_id -> (depth, correct, when, tag_status)
    practicals: Dict[str, tuple] = field(default_factory=dict)  # "lab:id" -> (depth, passed, when)
    verifications: List[tuple] = field(default_factory=list)    # (passed, when)


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    return dt if dt is None or dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _levels(model: dict) -> List[dict]:
    return sorted(model["capability_levels"]["levels"], key=lambda lv: lv["rank"])


def _share(items: Iterable[tuple], depths: Iterable[str]) -> Optional[float]:
    selected = [correct for depth, correct, *_ in items if depth in depths]
    return sum(selected) / len(selected) if selected else None


def level_for(ev: Evidence, model: dict) -> str:
    """Apply the level rules of the model in rank order; the highest level whose rule holds wins."""
    min_items = model["capability_levels"]["min_items_for_known"]
    items = list(ev.items.values())
    if len(items) < min_items:
        return "Unknown"
    passed_practicals = sum(1 for depth, passed, _ in ev.practicals.values() if passed and depth in PRACTICAL_DEPTHS)
    achieved: List[str] = []
    for level in _levels(model):
        rule = level.get("rule") or {}
        if rule.get("below_min_items"):
            continue
        if "requires" in rule and rule["requires"] not in achieved:
            break
        ok = len(items) >= rule.get("min_items", min_items)
        if ok and "depths" in rule:
            share = _share(items, rule["depths"])
            ok = share is not None and share >= rule["min_share"]
            # A passed capstone component is an alternative route to Advanced; the platform records no capstone
            # evidence yet, so this route never applies (documented in CAPABILITY_MODEL.md).
        if ok and rule.get("passed_practicals"):
            ok = passed_practicals >= rule["passed_practicals"]
        if not ok:
            break
        achieved.append(level["id"])
    return achieved[-1] if achieved else "Unknown"


def gather_evidence(db: Session, user_id: int, codes: Optional[set] = None) -> Dict[str, Evidence]:
    out: Dict[str, Evidence] = defaultdict(Evidence)

    # Knowledge: latest graded response per tagged item.
    q = db.query(models.QuizResponse, models.QuizItem, models.QuizAttempt.graded_at) \
        .join(models.QuizItem, models.QuizItem.id == models.QuizResponse.item_id) \
        .join(models.QuizAttempt, models.QuizAttempt.id == models.QuizResponse.attempt_id) \
        .filter(models.QuizResponse.user_id == user_id, models.QuizAttempt.user_id == user_id,
                models.QuizAttempt.status == "graded", models.QuizItem.competency_id.isnot(None),
                models.QuizItem.depth.isnot(None))
    if codes is not None:
        q = q.filter(models.QuizItem.competency_id.in_(codes))
    latest: Dict[str, tuple] = {}
    for resp, item, graded_at in q.all():
        when = _aware(graded_at or resp.created_at)
        key = (when, resp.id)
        if item.id not in latest or key > latest[item.id][0]:
            latest[item.id] = (key, item, resp)
    for (when, _), item, resp in latest.values():
        out[item.competency_id].items[item.id] = (item.depth, bool(resp.is_correct), when, item.tag_status)

    # Procedural: labs (first answer) and missions (latest finished run).
    first_lab: Dict[str, models.ActivityAttempt] = {}
    for a in db.query(models.ActivityAttempt).filter(models.ActivityAttempt.user_id == user_id) \
            .order_by(models.ActivityAttempt.created_at, models.ActivityAttempt.id):
        first_lab.setdefault(a.activity_id, a)
    for lab_id, attempt in first_lab.items():
        lab = catalogue.get_lab(lab_id) or {}
        for c in lab.get("competencies") or []:
            if codes is None or c["id"] in codes:
                out[c["id"]].practicals[f"lab:{lab_id}"] = (c["depth"], bool(attempt.correct), _aware(attempt.created_at))
    latest_run: Dict[str, models.MissionRun] = {}
    for run in db.query(models.MissionRun).filter(models.MissionRun.user_id == user_id, models.MissionRun.status == "finished") \
            .order_by(models.MissionRun.created_at, models.MissionRun.id):
        latest_run[run.mission_id] = run
    for mission_id, run in latest_run.items():
        mission = catalogue.get_mission(mission_id) or {}
        for c in mission.get("competencies") or []:
            if codes is None or c["id"] in codes:
                out[c["id"]].practicals[f"mission:{mission_id}"] = (c["depth"], run.band in PASSING_MISSION_BANDS, _aware(run.created_at))

    # Operational: verifications of interventions for a competency that judge this learner: interventions assigned
    # to the learner, or unassigned ones on the learner's own assets.
    vq = db.query(models.Verification, models.Competency.code) \
        .join(models.Intervention, models.Intervention.id == models.Verification.intervention_id) \
        .join(models.Competency, models.Competency.id == models.Intervention.competency_id) \
        .join(models.Finding, models.Finding.id == models.Intervention.finding_id) \
        .join(models.Asset, models.Asset.id == models.Finding.asset_id) \
        .filter(or_(models.Intervention.assigned_user_id == user_id,
                    and_(models.Intervention.assigned_user_id.is_(None), models.Asset.owner_user_id == user_id)))
    for verification, code in vq.all():
        if codes is None or code in codes:
            passed = bool((verification.technical_result or {}).get("remediated")) and \
                bool((verification.technical_result or {}).get("same_asset"))
            out[code].verifications.append((passed, _aware(verification.verified_at)))
    return out


def estimate(ev: Evidence, model: dict) -> dict:
    items = list(ev.items.values())
    groups = {g: {"correct": 0, "total": 0} for g in ("aware_explain", "apply", "analyse")}
    for depth, correct, *_ in items:
        g = groups[DEPTH_GROUP[depth]]
        g["total"] += 1
        g["correct"] += int(correct)
    practicals = list(ev.practicals.values())
    times = ([when for _, _, when, _ in items if when] + [when for _, _, when in practicals if when]
             + [when for _, when in ev.verifications if when])
    last = max(times) if times else None
    stale_months = model["capability_levels"].get("stale_after_months")
    stale = bool(last and stale_months and last < datetime.now(timezone.utc) - timedelta(days=30 * stale_months))
    return {
        "knowledge_score": sum(c for _, c, *_ in items) / len(items) if items else None,
        "knowledge_by_depth": {
            **groups,
            "reviewed_items": sum(1 for *_, status in items if status == "reviewed"),
        },
        "procedural_score": sum(1 for _, p, _ in practicals if p) / len(practicals) if practicals else None,
        "operational_score": sum(1 for p, _ in ev.verifications if p) / len(ev.verifications) if ev.verifications else None,
        "evidence_count": len(items) + len(practicals) + len(ev.verifications),
        "last_evidence_at": last,
        "level": level_for(ev, model),
        "freshness": None if last is None else (0.0 if stale else 1.0),
    }


def recompute(db: Session, user_id: int, codes: Optional[Iterable[str]] = None, model: Optional[dict] = None) -> List[models.LearnerCapability]:
    """Recompute the capability rows of one learner (all competencies, or only `codes`) and commit.

    Competencies without any evidence get no row: the absence of a row means Unknown with no evidence.
    A row whose evidence disappeared (for example a retagged item) is updated to the no-evidence state."""
    model = model or load_model()
    version = str(model["version"])
    code_set = set(codes) if codes is not None else None
    evidence = gather_evidence(db, user_id, code_set)
    competencies = {c.code: c for c in db.query(models.Competency).all()}
    existing = {}
    for row in db.query(models.LearnerCapability).filter(models.LearnerCapability.user_id == user_id).all():
        comp = next((c for c in competencies.values() if c.id == row.competency_id), None)
        if comp:
            existing[comp.code] = row
    targets = set(evidence) | {c for c in existing if code_set is None or c in code_set}
    rows = []
    now = datetime.now(timezone.utc)
    for code in sorted(targets):
        comp = competencies.get(code)
        if comp is None:
            continue  # tag points at a competency that is not seeded; the content validator reports it
        values = estimate(evidence.get(code, Evidence()), model)
        row = existing.get(code)
        if row is None:
            row = models.LearnerCapability(user_id=user_id, competency_id=comp.id)
            db.add(row)
        for key, value in values.items():
            setattr(row, key, value)
        row.confidence = None  # not estimated yet; the level and evidence_count carry the uncertainty
        row.model_version = version
        row.updated_at = now
        rows.append(row)
    db.commit()
    return rows


def codes_for_items(db: Session, item_ids: Iterable[str]) -> set:
    ids = list(item_ids)
    if not ids:
        return set()
    return {c for (c,) in db.query(models.QuizItem.competency_id).filter(
        models.QuizItem.id.in_(ids), models.QuizItem.competency_id.isnot(None)).distinct()}


def codes_for_activity(kind: str, activity_id: str) -> set:
    entry = catalogue.get_lab(activity_id) if kind == "lab" else catalogue.get_mission(activity_id)
    return {c["id"] for c in (entry or {}).get("competencies") or []}


def refresh(db: Session, user_id: int, codes: Iterable[str]) -> None:
    """Recompute after new evidence was committed. The evidence itself is already stored, so a failure here must
    not undo or fail the learner's action: it is logged, and the next recompute (any later evidence for the
    competency, or a full recompute) repairs the estimate."""
    codes = set(codes)
    if not codes:
        return
    try:
        recompute(db, user_id, codes)
    except Exception:  # noqa: BLE001 - see docstring; logged with traceback, not swallowed silently
        db.rollback()
        logger.exception("capability recompute failed for user %s, competencies %s", user_id, sorted(codes))


def recompute_all(db: Session) -> dict:
    """Recompute every learner (CLI and deploy bootstrap). Used after a model or tagging change, and for records
    written directly to the database such as the demo accounts."""
    model = load_model()
    users = [uid for (uid,) in db.query(models.User.id).order_by(models.User.id)]
    rows = 0
    for uid in users:
        rows += len(recompute(db, uid, model=model))
    return {"users": len(users), "capability_rows": rows}


if __name__ == "__main__":
    from database import Base, SessionLocal, engine, ensure_schema
    from competency.seed import seed_competencies

    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as session:
        seed_competencies(session)
        print(recompute_all(session))
