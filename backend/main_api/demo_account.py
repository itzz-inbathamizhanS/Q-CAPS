"""Create DEMO accounts for development and demonstrations, and make sure an admin account exists.

    python demo_account.py --profile complete --name demo-complete   # every module, lab and mission done
    python demo_account.py --profile partial  --name demo-learner    # a coherent mid-course learner
    python demo_account.py --make-admin admin                         # create or reset an admin account

Profiles
  complete  graded 100% attempts for every module, every checkpoint and section, every lab and mission.
  partial   all of Track A (A1 to A8) and B1, B2 passed in prerequisite order with realistic scores (some below 100%,
            some modules needing a second attempt), their lessons complete, the labs and missions of those modules
            done, and B3 started (its first four sections complete). Nothing is complete that a learner could not
            have reached: every passed module has its prerequisites passed.

The records are written straight to the database in the shape the server writes them, so XP follows the server
rules (50 per first-time-correct question, plus the module's XP once on the first pass, plus lab and mission XP).
They are not real learner evidence: demo account names must start with "demo". Back up the database first.
Passwords are random and printed once unless given with --password.
"""
import argparse
import json
import random
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Set

from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
from activities import catalogue

_pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
XP_PER_FIRST_CORRECT = 50  # same constant as quiz_service
PARTIAL_PASSED_CODES = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2"]
PARTIAL_STARTED = ("B3", 4)  # module code and how many of its sections are complete


def _module_by_code(db: Session) -> Dict[str, models.CourseModule]:
    return {m.code: m for m in db.query(models.CourseModule).all()}


def _check_prerequisites(db: Session, passed_slugs: Set[str]) -> None:
    """A passed module must have all of its prerequisites passed; the demo data must not break the unlock rules."""
    for m in db.query(models.CourseModule).filter(models.CourseModule.slug.in_(passed_slugs)).all():
        missing = [p for p in (m.prerequisites or []) if p not in passed_slugs]
        if missing:
            raise ValueError(f"{m.code} would be passed without its prerequisites {missing}")


def _add_attempt(db: Session, user: models.User, qm: models.QuizModule, items: List[models.QuizItem], correct_ids: Set[str],
                 earned: Set[str], when: datetime, attempt_no: int, module_xp_due: int) -> int:
    attempt_id = f"demo-{user.id}-{qm.module_id}-{attempt_no}"[:80]
    n = len(items)
    score = round(100 * len(correct_ids) / n, 2)
    passed = score >= qm.passing_score_percent
    first_time = len(correct_ids - earned)
    xp = XP_PER_FIRST_CORRECT * first_time + (module_xp_due if passed else 0)
    form = [{"item_id": i.id, "order": list(range(len(json.loads(i.options_json))))} for i in items]
    db.add(models.QuizAttempt(id=attempt_id, user_id=user.id, module_id=qm.module_id, status="graded", form_json=json.dumps(form),
                              passing_score_percent=qm.passing_score_percent, issued_at=when - timedelta(minutes=20), graded_at=when,
                              total_questions=n, correct_answers=len(correct_ids), score_percent=score, passed=passed, xp_awarded=xp))
    for i in items:
        right = i.id in correct_ids
        wrong_index = (i.correct_index + 1) % len(json.loads(i.options_json))
        db.add(models.QuizResponse(attempt_id=attempt_id, user_id=user.id, item_id=i.id,
                                   selected_original_index=i.correct_index if right else wrong_index, is_correct=right))
    db.add(models.QuizScore(user_id=user.id, topic=qm.topic, score=score, correct_answers=len(correct_ids), total_questions=n))
    earned |= correct_ids
    return xp


def create_demo_account(db: Session, name: str, password: str, reset: bool = False, profile: str = "complete") -> dict:
    if not name.lower().startswith("demo"):
        raise ValueError("demo accounts must have a name that starts with 'demo'")
    if profile not in ("complete", "partial"):
        raise ValueError("profile must be 'complete' or 'partial'")
    existing = db.query(models.User).filter(models.User.name == name).first()
    if existing:
        if not reset:
            raise ValueError(f"account {name!r} already exists; pass reset=True (--reset) to rebuild it")
        delete_account_data(db, existing, keep_user=False)
    user = models.User(name=name, hashed_password=_pwd.hash(password), xp=0, progress_data="{}", role="learner")
    db.add(user)
    db.flush()
    now = datetime.now(timezone.utc)
    by_code = _module_by_code(db)
    qmods = {q.module_id: q for q in db.query(models.QuizModule).all()}

    if profile == "complete":
        passed_slugs = {q for q in qmods}
        started: Optional[tuple] = None
    else:
        passed_slugs = {by_code[c].slug for c in PARTIAL_PASSED_CODES}
        started = (by_code[PARTIAL_STARTED[0]].slug, PARTIAL_STARTED[1])
    _check_prerequisites(db, passed_slugs)

    # Quizzes, in the order a learner would take them. Complete: 100% each. Partial: realistic scores, and about
    # one module in four needs a second attempt after a failed first one.
    xp = 0
    by_slug = {m.slug: m for m in by_code.values()}
    ordered: List[str] = []
    remaining = sorted(passed_slugs, key=lambda sl: (by_slug[sl].sort_order if sl in by_slug else 0, sl))
    while remaining:  # a module is taken only after the passed modules it depends on
        nxt = next(sl for sl in remaining if all(p not in passed_slugs or p in ordered for p in ((by_slug[sl].prerequisites or []) if sl in by_slug else [])))
        ordered.append(nxt)
        remaining.remove(nxt)
    when = now - timedelta(days=len(ordered))
    for slug in ordered:
        qm = qmods.get(slug)
        items = db.query(models.QuizItem).filter_by(module_id=slug, active=True).order_by(models.QuizItem.id).all()
        if qm is None or not items:
            continue
        when += timedelta(days=1)
        module_xp = int(by_slug[slug].xp or 0) if slug in by_slug else 0
        ids = [i.id for i in items]
        earned: Set[str] = set()
        if profile == "complete":
            xp += _add_attempt(db, user, qm, items, set(ids), earned, when, 1, module_xp)
            continue
        rng = random.Random(slug)
        if rng.random() < 0.25:
            first = set(rng.sample(ids, int(len(ids) * 0.55)))
            xp += _add_attempt(db, user, qm, items, first, earned, when - timedelta(hours=3), 1, module_xp)
            second_target = rng.choice([0.8, 0.85, 0.9])
            second = set(rng.sample(ids, int(len(ids) * second_target)))
            xp += _add_attempt(db, user, qm, items, second, earned, when, 2, module_xp)
        else:
            target = rng.choice([0.8, 0.85, 0.9, 0.95, 1.0])
            xp += _add_attempt(db, user, qm, items, set(rng.sample(ids, int(round(len(ids) * target)))), earned, when, 1, module_xp)

    # Lessons: every checkpoint passed, sections without a checkpoint marked complete.
    sections = 0
    def complete_section(section: models.CourseSection) -> None:
        nonlocal sections
        sections += 1
        checkpoints = [b["id"] for b in (section.blocks or []) if b.get("type") == "checkpoint"]
        if checkpoints:
            for block_id in checkpoints:
                db.add(models.CheckpointPass(user_id=user.id, section_id=section.id, block_id=block_id))
        else:
            db.add(models.SectionCompletion(user_id=user.id, section_id=section.id))
    done_section_slugs: Set[tuple] = set()
    for module in db.query(models.CourseModule).all():
        secs = sorted([s for s in module.sections if s.status == "published"], key=lambda s: s.sort_order)
        if module.slug in passed_slugs:
            chosen = secs
        elif started and module.slug == started[0]:
            chosen = secs[:started[1]]
        else:
            continue
        for s in chosen:
            complete_section(s)
            done_section_slugs.add((module.slug, s.slug))

    # Practice labs and missions: only for lesson sections the learner has actually completed.
    labs, missions = catalogue._load()["labs"], catalogue._load()["missions"]
    lab_count = mission_count = 0
    for lab in labs.values():
        if profile == "partial" and (lab["module_id"], lab["section_id"]) not in done_section_slugs:
            continue
        lab_count += 1
        db.add(models.ActivityAttempt(user_id=user.id, activity_id=lab["id"], correct=True))
        db.add(models.ActivityCompletion(user_id=user.id, kind="lab", activity_id=lab["id"], xp_awarded=int(lab["mission_xp_awarded"]), badge=lab.get("badge_awarded")))
        xp += int(lab["mission_xp_awarded"])
    for m in missions.values():
        if profile == "partial" and (m["linked_module_id"], m.get("section_id")) not in done_section_slugs:
            continue
        mission_count += 1
        reward = m.get("rewards") or {}
        db.add(models.ActivityCompletion(user_id=user.id, kind="mission", activity_id=m["mission_id"], xp_awarded=int(reward.get("mission_xp_awarded", 0)), badge=reward.get("badge_awarded")))
        xp += int(reward.get("mission_xp_awarded", 0))

    user.xp = xp
    db.commit()
    return {"user_id": user.id, "name": name, "profile": profile, "modules_passed": len(passed_slugs), "sections": sections,
            "labs": lab_count, "missions": mission_count, "xp": xp}


def delete_account_data(db: Session, user: models.User, keep_user: bool = True) -> None:
    """Remove a user's learning records (and the user unless keep_user)."""
    uid = user.id
    run_ids = [r[0] for r in db.query(models.MissionRun.id).filter(models.MissionRun.user_id == uid)]
    for model in (models.QuizResponse, models.QuizScore, models.CheckpointPass, models.SectionCompletion, models.ActivityCompletion,
                  models.ActivityAttempt, models.MissionRun, models.QuizAttempt, models.ScannerLog):
        db.query(model).filter(model.user_id == uid).delete(synchronize_session=False)
    if keep_user:
        user.xp = 0
        user.progress_data = "{}"
    else:
        db.delete(user)
    db.flush()
    return None


def ensure_admin(db: Session, name: str, password: str) -> dict:
    """Create the admin account, or reset an existing one to a clean slate with a new password."""
    user = db.query(models.User).filter(models.User.name == name).first()
    if user is None:
        user = models.User(name=name, hashed_password=_pwd.hash(password), xp=0, progress_data="{}", role="admin")
        db.add(user)
        db.flush()
    else:
        delete_account_data(db, user, keep_user=True)
        user.hashed_password = _pwd.hash(password)
        user.role = "admin"
    db.commit()
    return {"user_id": user.id, "name": name, "role": "admin"}


def main() -> None:
    from database import Base, SessionLocal, engine
    Base.metadata.create_all(bind=engine)
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--name", default="demo-complete")
    ap.add_argument("--profile", default="complete", choices=["complete", "partial"])
    ap.add_argument("--make-admin", metavar="NAME", help="create or reset this admin account instead of a demo learner")
    ap.add_argument("--password", default=None, help="default: a random password, printed once")
    ap.add_argument("--reset", action="store_true", help="rebuild the account if it already exists")
    args = ap.parse_args()
    password = args.password or secrets.token_urlsafe(12)
    with SessionLocal() as db:
        summary = ensure_admin(db, args.make_admin, password) if args.make_admin else create_demo_account(db, args.name, password, args.reset, args.profile)
    print(json.dumps(summary))
    if not args.password:
        print(f"password: {password}")


if __name__ == "__main__":
    main()
