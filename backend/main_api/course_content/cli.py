"""Administration CLI. Run from backend/main_api:

    python -m course_content.cli create-admin NAME
    python -m course_content.cli revoke-admin NAME

create-admin promotes an existing user, or creates one. The password for a new user is read
from QCAPS_ADMIN_PASSWORD or an interactive prompt (never a command-line argument).
Roles cannot be set through the HTTP API.
"""
import argparse
import getpass
import os
import sys

from sqlalchemy import func

MIN_PASSWORD_LENGTH = 12


def _find(db, name):
    import models
    return db.query(models.User).filter(func.lower(models.User.name) == name.lower()).first()


def create_admin(db, name: str, password: str = None):
    import models
    user = _find(db, name)
    if user:
        user.role = "admin"
        db.commit()
        return user, "promoted"
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"A new admin needs a password of at least {MIN_PASSWORD_LENGTH} characters")
    from main import get_password_hash  # single source of truth for password hashing
    user = models.User(name=name, hashed_password=get_password_hash(password), xp=0, role="admin")
    db.add(user)
    db.commit()
    return user, "created"


def revoke_admin(db, name: str):
    user = _find(db, name)
    if not user:
        raise ValueError("User not found")
    user.role = "learner"
    db.commit()
    return user


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("create-admin").add_argument("name")
    sub.add_parser("revoke-admin").add_argument("name")
    args = parser.parse_args(argv)

    from database import Base, SessionLocal, engine, ensure_schema
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as db:
        try:
            if args.command == "create-admin":
                password = None
                if not _find(db, args.name):
                    password = os.environ.get("QCAPS_ADMIN_PASSWORD") or getpass.getpass("Password for new admin: ")
                user, outcome = create_admin(db, args.name, password)
                print(f"{outcome}: {user.name} is now an admin")
            else:
                user = revoke_admin(db, args.name)
                print(f"{user.name} is now a learner")
        except ValueError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
