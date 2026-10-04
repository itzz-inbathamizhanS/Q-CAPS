"""Build a ready-to-run database for a fresh deployment (used by the Render build step, safe to run locally).

    QCAPS_ADMIN_PASSWORD=... python deploy_bootstrap.py

What it does, in order (all idempotent):
  1. creates the tables;
  2. imports the curriculum structure, the question banks and the competency model;
  3. creates the admin account (QCAPS_ADMIN_NAME, default "admin"; QCAPS_ADMIN_PASSWORD, at least 12 characters);
  4. imports every lesson pack in content/packs (validated first, audited as the admin);
  5. creates the two DEMO learner accounts when their passwords are set:
       QCAPS_DEMO_LEARNER_PASSWORD  -> "demo-learner"  (mid-course progress)
       QCAPS_DEMO_COMPLETE_PASSWORD -> "demo-complete" (everything completed)

Passwords come only from the environment. The database is whatever QCAPS_DATABASE_URL points to. On a free
Render instance the file system is rebuilt on every deploy and restart, so users who register after the build
do not survive a restart; the build re-creates the content and the three accounts above.
"""
import json
import os
import sys
from pathlib import Path

from sqlalchemy import func


def main() -> int:
    import models
    from database import Base, SessionLocal, engine, ensure_schema
    from course_content.cli import create_admin
    from course_content.import_curriculum import DEFAULT_SOURCE, import_curriculum
    from course_content.import_pack import import_pack
    from demo_account import create_demo_account
    import seed_quizzes
    from competency.seed import seed_competencies

    Base.metadata.create_all(bind=engine)
    ensure_schema()

    admin_name = os.environ.get("QCAPS_ADMIN_NAME", "admin")
    admin_password = os.environ.get("QCAPS_ADMIN_PASSWORD", "")
    if len(admin_password) < 12:
        print("QCAPS_ADMIN_PASSWORD (at least 12 characters) is required", file=sys.stderr)
        return 2

    with SessionLocal() as db:
        print("curriculum:", {k: v for k, v in import_curriculum(db, DEFAULT_SOURCE).items()})
        seed_quizzes.seed_if_empty(db)
        print("competencies:", seed_competencies(db))
        user, how = create_admin(db, admin_name, admin_password)
        print(f"admin account {admin_name!r}: {how}")
        packs = sorted((Path(__file__).resolve().parents[2] / "content" / "packs").glob("pack_*.json"))
        for path in packs:
            report = import_pack(db, json.loads(path.read_text(encoding="utf-8")), admin_name, label=path.name)
            print(f"{path.name}: {len(report['replaced'])} replaced, {len(report['created'])} created, {len(report['unchanged'])} unchanged")
        for env, name, profile in (("QCAPS_DEMO_LEARNER_PASSWORD", "demo-learner", "partial"), ("QCAPS_DEMO_COMPLETE_PASSWORD", "demo-complete", "complete")):
            password = os.environ.get(env, "")
            if len(password) >= 12:
                print(create_demo_account(db, name, password, reset=True, profile=profile))
            else:
                print(f"{env} not set (>= 12 characters): {name} not created")
        print("users:", [(u.name, u.role) for u in db.query(models.User).order_by(models.User.id)])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
