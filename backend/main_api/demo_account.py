"""Create a clearly named DEMO account whose course is fully completed (development and demonstrations only).

    python demo_account.py                      # creates "demo-complete" with a random password, printed once
    python demo_account.py --name demo-b --reset

The records are written straight to the database, in the same shape the server writes them when a learner
completes the course: graded 100% quiz attempts for every module (with module and per-question XP), every
checkpoint or section completion, every practice lab, and every mission. Nothing here is real learner
evidence, so the account name starts with "demo" and the script refuses other names. Back up the database first.
"""
import argparse
import json
import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy.orm import Session

import models
from activities import catalogue

_pwd = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
XP_PER_FIRST_CORRECT = 50  # same constant as quiz_service


def create_demo_account(db: Session, name: str, password: str, reset: bool = False) -> dict:
    if not name.lower().startswith("demo"):
        raise ValueError("demo accounts must have a name that starts with 'demo'")
    existing = db.query(models.User).filter(models.User.name == name).first()
    if existing:
        if not reset:
            raise ValueError(f"account {name!r} already exists; pass reset=True (--reset) to rebuild it")
        _delete_account(db, existing)
    user = models.User(name=name, hashed_password=_pwd.hash(password), xp=0, progress_data="{}", role="learner")
    db.add(user)
    db.flush()
    now = datetime.now(timezone.utc)
    xp = 0

    # Quizzes: a graded, passed attempt per module with every question answered correctly.
    modules = db.query(models.QuizModule).all()
    course = {m.slug: m for m in db.query(models.CourseModule).all()}
    for qm in modules:
        items = db.query(models.QuizItem).filter_by(module_id=qm.module_id, active=True).all()
        if not items:
            continue
        attempt_id = f"demo-{user.id}-{qm.module_id}"[:80]
        form = [{"item_id": i.id, "order": list(range(len(json.loads(i.options_json))))} for i in items]
        module_xp = int(course[qm.module_id].xp or 0) if qm.module_id in course else 0
        attempt_xp = XP_PER_FIRST_CORRECT * len(items) + module_xp
        db.add(models.QuizAttempt(id=attempt_id, user_id=user.id, module_id=qm.module_id, status="graded", form_json=json.dumps(form),
                                  passing_score_percent=qm.passing_score_percent, issued_at=now - timedelta(minutes=30), graded_at=now,
                                  total_questions=len(items), correct_answers=len(items), score_percent=100.0, passed=True, xp_awarded=attempt_xp))
        for i in items:
            db.add(models.QuizResponse(attempt_id=attempt_id, user_id=user.id, item_id=i.id, selected_original_index=i.correct_index, is_correct=True))
        db.add(models.QuizScore(user_id=user.id, topic=qm.topic, score=100.0, correct_answers=len(items), total_questions=len(items)))
        xp += attempt_xp

    # Lessons: every checkpoint passed, and sections without a checkpoint marked complete.
    sections = 0
    for section in db.query(models.CourseSection).filter_by(status="published").all():
        sections += 1
        checkpoints = [b["id"] for b in (section.blocks or []) if b.get("type") == "checkpoint"]
        if checkpoints:
            for block_id in checkpoints:
                db.add(models.CheckpointPass(user_id=user.id, section_id=section.id, block_id=block_id))
        else:
            db.add(models.SectionCompletion(user_id=user.id, section_id=section.id))

    # Practice labs and missions, with the XP and badge the server would have awarded.
    labs = catalogue._load()["labs"]
    missions = catalogue._load()["missions"]
    for lab in labs.values():
        db.add(models.ActivityAttempt(user_id=user.id, activity_id=lab["id"], correct=True))
        db.add(models.ActivityCompletion(user_id=user.id, kind="lab", activity_id=lab["id"], xp_awarded=int(lab["mission_xp_awarded"]), badge=lab.get("badge_awarded")))
        xp += int(lab["mission_xp_awarded"])
    for m in missions.values():
        reward = m.get("rewards") or {}
        db.add(models.ActivityCompletion(user_id=user.id, kind="mission", activity_id=m["mission_id"], xp_awarded=int(reward.get("mission_xp_awarded", 0)), badge=reward.get("badge_awarded")))
        xp += int(reward.get("mission_xp_awarded", 0))

    user.xp = xp
    db.commit()
    return {"user_id": user.id, "name": name, "modules": len(modules), "sections": sections, "labs": len(labs), "missions": len(missions), "xp": xp}


def _delete_account(db: Session, user: models.User) -> None:
    uid = user.id
    for model in (models.QuizResponse, models.QuizScore, models.CheckpointPass, models.SectionCompletion, models.ActivityCompletion,
                  models.ActivityAttempt, models.MissionRun, models.QuizAttempt):
        db.query(model).filter(model.user_id == uid).delete(synchronize_session=False)
    db.delete(user)
    db.flush()


def main() -> None:
    from database import Base, SessionLocal, engine
    Base.metadata.create_all(bind=engine)
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--name", default="demo-complete")
    ap.add_argument("--password", default=None, help="default: a random password, printed once")
    ap.add_argument("--reset", action="store_true", help="rebuild the account if it already exists")
    args = ap.parse_args()
    password = args.password or secrets.token_urlsafe(12)
    with SessionLocal() as db:
        summary = create_demo_account(db, args.name, password, args.reset)
    print(json.dumps(summary))
    if not args.password:
        print(f"password: {password}")


if __name__ == "__main__":
    main()
