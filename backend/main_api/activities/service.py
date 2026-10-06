"""Grading and awarding for practice labs and missions. Everything here runs on the server."""
import secrets
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
from . import catalogue
from competency import capability


class ActivityError(Exception):
    def __init__(self, status: int, detail: str):
        super().__init__(detail)
        self.status = status
        self.detail = detail


def _award(db: Session, user: models.User, kind: str, activity_id: str, xp: int, badge: Optional[str]) -> Optional[dict]:
    """Record the completion and add the XP, once per user and activity. Returns the award, or
    None when it had already been earned (a concurrent duplicate loses on the unique constraint)."""
    exists = db.query(models.ActivityCompletion).filter_by(user_id=user.id, kind=kind, activity_id=activity_id).first()
    if exists:
        return None
    db.add(models.ActivityCompletion(user_id=user.id, kind=kind, activity_id=activity_id, xp_awarded=xp, badge=badge))
    user.xp = (user.xp or 0) + xp
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    return {"xp": xp, "badge": badge}


def progress(db: Session, user: models.User) -> dict:
    """Everything the server has verified about this learner: XP, graded quiz passes and best scores,
    completed labs and missions. The browser only mirrors it."""
    rows = db.query(models.ActivityCompletion).filter_by(user_id=user.id).all()
    # Diagnostics are an assessment instrument, not course modules: they never count as passed modules.
    diagnostic = [m for (m,) in db.query(models.QuizModule.module_id).filter(models.QuizModule.kind == "diagnostic")]
    attempts = db.query(models.QuizAttempt.module_id, models.QuizAttempt.score_percent, models.QuizAttempt.passed).filter(
        models.QuizAttempt.user_id == user.id, models.QuizAttempt.status == "graded",
        models.QuizAttempt.module_id.notin_(diagnostic)).all()
    best: Dict[str, float] = {}
    for module_id, score, _ in attempts:
        best[module_id] = max(best.get(module_id, 0.0), float(score or 0))
    return {
        "completed_labs": sorted(r.activity_id for r in rows if r.kind == "lab"),
        "completed_missions": sorted(r.activity_id for r in rows if r.kind == "mission"),
        "badges": sorted({r.badge for r in rows if r.badge}),
        "passed_modules": sorted({m for m, _, passed in attempts if passed}),
        "quiz_scores": best,
        "xp": user.xp or 0,
    }


# ------------------------------------------------------------------ labs
def answer_lab(db: Session, user: models.User, scenario_id: str, choice_id: str) -> dict:
    scenario = catalogue.get_lab(scenario_id)
    if scenario is None:
        raise ActivityError(404, "Unknown lab")
    choice = next((c for c in scenario["choices"] if c["id"] == choice_id), None)
    if choice is None:
        raise ActivityError(400, "Unknown choice")
    awarded = None
    wrong_attempts = db.query(models.ActivityAttempt).filter_by(user_id=user.id, activity_id=scenario_id, correct=False).order_by(models.ActivityAttempt.id.desc()).all()
    wrong_before = len(wrong_attempts)
    # After a wrong answer the lab is locked for a while (15 s, then 30 s, then 45 s, at most 60 s), so the options cannot be tried in quick succession.
    if wrong_attempts:
        cooldown = min(60, 15 * wrong_before)
        last = wrong_attempts[0].created_at
        last = last if last.tzinfo else last.replace(tzinfo=timezone.utc)
        waited = (datetime.now(timezone.utc) - last).total_seconds()
        if waited < cooldown:
            raise ActivityError(429, f"Read the feedback first: try again in {int(cooldown - waited) + 1} seconds.")
    db.add(models.ActivityAttempt(user_id=user.id, activity_id=scenario_id, correct=bool(choice["correct"])))
    db.commit()
    if choice["correct"]:
        # Trying the options in turn costs XP: 100%, 75%, 50%, then 25% for any later correct answer.
        factor = max(0.25, 1 - 0.25 * wrong_before)
        xp = max(1, round(int(scenario["mission_xp_awarded"]) * factor))
        awarded = _award(db, user, "lab", scenario_id, xp, scenario.get("badge_awarded"))
    capability.refresh(db, user.id, capability.codes_for_activity("lab", scenario_id))
    return {"correct": bool(choice["correct"]), "feedback": choice["feedback"], "awarded": awarded}


# ------------------------------------------------------------------ decision missions
def _clamp(h: dict, value: float) -> float:
    value = max(0, value)
    return min(h["max"], value) if h.get("max") is not None else value


def _choice_stages(mission: dict) -> List[dict]:
    return [s for s in mission["stages"] if s.get("choices")]


def _band(mission: dict, values: Dict[str, float]) -> dict:
    bands = mission["outcome"]["bands"]
    for b in bands:
        ok = True
        for key, rule in b["requires"].items():
            v = values[key]
            if ("min" in rule and v < rule["min"]) or ("max" in rule and v > rule["max"]):
                ok = False
                break
        if ok:
            return b
    return bands[-1]


def _owned_run(db: Session, user: models.User, run_id: str) -> models.MissionRun:
    run = db.get(models.MissionRun, run_id)
    if run is None or run.user_id != user.id:
        raise ActivityError(404, "Unknown run")
    return run


def start_run(db: Session, user: models.User, mission_id: str, photons: Optional[int] = None) -> dict:
    mission = catalogue.get_mission(mission_id)
    if mission is None:
        raise ActivityError(404, "Unknown mission")
    run_id = uuid.uuid4().hex
    if mission["type"] == "simulation":
        return _start_bb84(db, user, mission, run_id, photons)
    values = {h["key"]: h["start"] for h in mission["hud"]}
    db.add(models.MissionRun(id=run_id, user_id=user.id, mission_id=mission_id, state={"values": values, "stage": 0, "history": []}))
    db.commit()
    return {"run_id": run_id, "values": values}


def choose(db: Session, user: models.User, run_id: str, choice_id: str) -> dict:
    run = _owned_run(db, user, run_id)
    mission = catalogue.get_mission(run.mission_id)
    if run.status != "active" or mission is None or mission["type"] != "decision_scenario":
        raise ActivityError(409, "This run is not accepting choices")
    stages = _choice_stages(mission)
    state = dict(run.state)
    idx = state["stage"]
    choice = next((c for c in stages[idx]["choices"] if c["id"] == choice_id), None)
    if choice is None:
        raise ActivityError(400, "Unknown choice")
    values = dict(state["values"])
    for h in mission["hud"]:
        delta = choice.get("consequence", {}).get(h["key"])
        if isinstance(delta, (int, float)):
            values[h["key"]] = _clamp(h, values[h["key"]] + delta)
    state.update(values=values, stage=idx + 1, history=state["history"] + [{"stage": idx, "choice": choice_id}])
    out = {"feedback": choice["feedback"], "values": values, "finished": False, "band": None, "awarded": None}
    if idx + 1 >= len(stages):
        band = _band(mission, values)
        run.status, run.band = "finished", band["id"]
        reward = mission.get("rewards") or {}
        out.update(finished=True, band=band["id"])
        run.state = state
        db.commit()
        if band["id"] in ("success", "partial"):
            out["awarded"] = _award(db, user, "mission", mission["mission_id"], int(reward.get("mission_xp_awarded", 0)), reward.get("badge_awarded"))
        capability.refresh(db, user.id, capability.codes_for_activity("mission", mission["mission_id"]))
        return out
    run.state = state
    db.commit()
    return out


# ------------------------------------------------------------------ BB84 simulation
_rng = secrets.SystemRandom()
PHOTON_CHOICES = (20, 30, 40, 50, 60)


def _start_bb84(db: Session, user: models.User, mission: dict, run_id: str, photons: Optional[int]) -> dict:
    if photons not in PHOTON_CHOICES:
        raise ActivityError(400, f"photons must be one of {list(PHOTON_CHOICES)}")
    eve = _rng.random() < 0.5
    alice_bits, alice_bases, bob_bases, bob_results, sifted = [], [], [], [], []
    for i in range(photons):
        bit = _rng.randrange(2)
        a, b = _rng.choice("+x"), _rng.choice("+x")
        alice_bits.append(bit)
        alice_bases.append(a)
        bob_bases.append(b)
        if a == b:
            disturbed = eve and _rng.random() < 0.25
            bob_results.append(1 - bit if disturbed else bit)
            sifted.append(i)
        else:
            bob_results.append(_rng.randrange(2))
    data = {"alice_bits": alice_bits, "alice_bases": alice_bases, "bob_bases": bob_bases, "bob_results": bob_results, "sifted": sifted}
    db.add(models.MissionRun(id=run_id, user_id=user.id, mission_id=mission["mission_id"], state={**data, "eve": eve}))
    db.commit()
    # The eavesdropper flag stays on the server until the learner has decided.
    return {"run_id": run_id, **data}


def decide_bb84(db: Session, user: models.User, run_id: str, sample_size: int, decision: str) -> dict:
    run = _owned_run(db, user, run_id)
    mission = catalogue.get_mission(run.mission_id)
    if run.status != "active" or mission is None or mission["type"] != "simulation":
        raise ActivityError(409, "This run is not accepting a decision")
    if decision not in ("accept", "abort"):
        raise ActivityError(400, "decision must be accept or abort")
    st = run.state
    if not st["sifted"]:
        raise ActivityError(409, "No sifted bits to sample")
    if not isinstance(sample_size, int) or not 1 <= sample_size <= len(st["sifted"]):
        raise ActivityError(400, "sample_size is out of range")
    sampled = st["sifted"][:sample_size]
    mismatches = sum(1 for i in sampled if st["alice_bits"][i] != st["bob_results"][i])
    rate = round(100 * mismatches / len(sampled))
    correct = (decision == "abort" and rate > 10) or (decision == "accept" and rate <= 10)
    run.status = "finished"
    run.band = "success" if correct else "failure"  # the run's outcome, used as practical evidence
    db.commit()
    reward = mission.get("rewards") or {}
    awarded = None
    if correct:
        awarded = _award(db, user, "mission", mission["mission_id"], int(reward.get("mission_xp_awarded", 0)), reward.get("badge_awarded"))
    capability.refresh(db, user.id, capability.codes_for_activity("mission", mission["mission_id"]))
    return {"correct": correct, "error_rate": rate, "eve_present": st["eve"], "awarded": awarded}
