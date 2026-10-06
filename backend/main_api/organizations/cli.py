"""Bootstrap organizations from the command line (platform operators only; run from backend/main_api).

    python -m organizations.cli create-org --name "Acme" --slug acme --admin alice
    python -m organizations.cli create-lab --name "Q-CAPS Lab" --slug qcaps-lab --admin admin
    python -m organizations.cli add-member acme bob member

Every change is written to audit_events (actor: none, i.e. the command line).
"""
import argparse
import sys

import models
from database import Base, SessionLocal, engine, ensure_schema
from organizations import access


def _user(db, name):
    u = db.query(models.User).filter_by(name=name).first()
    if u is None:
        raise SystemExit(f"no user named {name!r}")
    return u


def create_org(db, name: str, slug: str, kind: str, admin: str) -> models.Organization:
    if db.query(models.Organization).filter_by(slug=slug).first():
        raise SystemExit(f"organization {slug!r} exists")
    admin_user = _user(db, admin)
    org = models.Organization(name=name, slug=slug, kind=kind)
    db.add(org)
    db.flush()
    db.add(models.OrganizationMembership(organization_id=org.id, user_id=admin_user.id, org_role="org_admin"))
    access.audit(db, None, "organization.create", org.id, "organization", org.id, {"kind": kind, "via": "cli", "admin": admin})
    db.commit()
    return org


def add_member(db, slug: str, user_name: str, role: str) -> None:
    org = db.query(models.Organization).filter_by(slug=slug).first()
    if org is None:
        raise SystemExit(f"no organization {slug!r}")
    if role not in models.ORG_ROLES:
        raise SystemExit(f"role must be one of {models.ORG_ROLES}")
    user = _user(db, user_name)
    if access.org_role(db, user, org.id) is not None:
        raise SystemExit(f"{user_name} is already a member")
    db.add(models.OrganizationMembership(organization_id=org.id, user_id=user.id, org_role=role))
    access.audit(db, None, "membership.add", org.id, "user", user.id, {"org_role": role, "via": "cli"})
    db.commit()


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    for cmd in ("create-org", "create-lab"):
        s = sub.add_parser(cmd)
        s.add_argument("--name", required=True)
        s.add_argument("--slug", required=True)
        s.add_argument("--admin", required=True, help="user name of the first org_admin")
    s = sub.add_parser("add-member")
    s.add_argument("slug")
    s.add_argument("user")
    s.add_argument("role", choices=models.ORG_ROLES)
    args = p.parse_args(argv)
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as db:
        if args.cmd in ("create-org", "create-lab"):
            org = create_org(db, args.name, args.slug, "lab" if args.cmd == "create-lab" else "organization", args.admin)
            print(f"created {org.kind} {org.slug} (id {org.id})")
        else:
            add_member(db, args.slug, args.user, args.role)
            print(f"added {args.user} to {args.slug} as {args.role}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
