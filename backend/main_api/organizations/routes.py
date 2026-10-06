"""Organization and membership endpoints (docs/plans/T2.1_ORGANIZATIONS_PLAN.md). All changes are audited."""
import re
from typing import Callable, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from database import get_db
from organizations import access

OrgRole = Literal["org_admin", "member", "instructor", "researcher"]


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=80)
    kind: Literal["organization", "lab"] = "organization"
    admin_user_id: Optional[int] = None  # first org_admin


class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str
    kind: str
    org_role: Optional[str] = None


class MemberIn(BaseModel):
    user_name: str = Field(min_length=1, max_length=100)
    org_role: OrgRole


class MemberRoleIn(BaseModel):
    org_role: OrgRole


class MemberOut(BaseModel):
    user_id: int
    name: str
    org_role: str


def _org_or_404(db: Session, user: models.User, org_id: int, need_admin: bool) -> models.Organization:
    """404 for an organization the user does not belong to (same as a missing id); 403 when a member lacks the
    org_admin role for a management action."""
    org = db.get(models.Organization, org_id)
    role = access.org_role(db, user, org_id) if org else None
    if org is None or (role is None and not access.is_platform_admin(user)):
        raise HTTPException(status_code=404, detail="Organization not found")
    if need_admin and role != "org_admin" and not access.is_platform_admin(user):
        raise HTTPException(status_code=403, detail="Organization admin access required")
    return org


def _admin_count(db: Session, org_id: int) -> int:
    return db.query(models.OrganizationMembership).filter_by(organization_id=org_id, org_role="org_admin").count()


def create_organizations_router(get_current_user: Callable) -> APIRouter:
    router = APIRouter(prefix="/api/organizations", tags=["organizations"])

    @router.post("", response_model=OrganizationOut, status_code=201)
    def create_organization(body: OrganizationCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        if not access.is_platform_admin(user):
            raise HTTPException(status_code=403, detail="Admin access required")
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", body.slug):
            raise HTTPException(status_code=422, detail="slug: lowercase letters, digits and hyphens")
        if db.query(models.Organization).filter_by(slug=body.slug).first():
            raise HTTPException(status_code=409, detail="An organization with this slug exists")
        org = models.Organization(name=body.name.strip(), slug=body.slug, kind=body.kind, created_by=user.id)
        db.add(org)
        db.flush()
        if body.admin_user_id is not None:
            if db.get(models.User, body.admin_user_id) is None:
                raise HTTPException(status_code=422, detail="admin_user_id: unknown user")
            db.add(models.OrganizationMembership(organization_id=org.id, user_id=body.admin_user_id, org_role="org_admin", created_by=user.id))
        access.audit(db, user, "organization.create", org.id, "organization", org.id, {"kind": org.kind, "admin_user_id": body.admin_user_id})
        db.commit()
        return OrganizationOut(id=org.id, name=org.name, slug=org.slug, kind=org.kind)

    @router.get("/mine", response_model=List[OrganizationOut])
    def my_organizations(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        rows = (db.query(models.Organization, models.OrganizationMembership.org_role)
                .join(models.OrganizationMembership, models.OrganizationMembership.organization_id == models.Organization.id)
                .filter(models.OrganizationMembership.user_id == user.id).order_by(models.Organization.name).all())
        return [OrganizationOut(id=o.id, name=o.name, slug=o.slug, kind=o.kind, org_role=r) for o, r in rows]

    @router.get("/{org_id}/members", response_model=List[MemberOut])
    def list_members(org_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        _org_or_404(db, user, org_id, need_admin=True)
        rows = (db.query(models.OrganizationMembership, models.User.name)
                .join(models.User, models.User.id == models.OrganizationMembership.user_id)
                .filter(models.OrganizationMembership.organization_id == org_id).order_by(models.User.name).all())
        return [MemberOut(user_id=m.user_id, name=name, org_role=m.org_role) for m, name in rows]

    @router.post("/{org_id}/members", response_model=MemberOut, status_code=201)
    def add_member(org_id: int, body: MemberIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        _org_or_404(db, user, org_id, need_admin=True)
        target = db.query(models.User).filter(models.User.name == body.user_name).first()
        if target is None:
            raise HTTPException(status_code=422, detail="No user with that name")
        if access.org_role(db, target, org_id) is not None:
            raise HTTPException(status_code=409, detail="Already a member; change the role instead")
        db.add(models.OrganizationMembership(organization_id=org_id, user_id=target.id, org_role=body.org_role, created_by=user.id))
        access.audit(db, user, "membership.add", org_id, "user", target.id, {"org_role": body.org_role})
        db.commit()
        return MemberOut(user_id=target.id, name=target.name, org_role=body.org_role)

    @router.patch("/{org_id}/members/{user_id}", response_model=MemberOut)
    def change_role(org_id: int, user_id: int, body: MemberRoleIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        _org_or_404(db, user, org_id, need_admin=True)
        m = db.query(models.OrganizationMembership).filter_by(organization_id=org_id, user_id=user_id).one_or_none()
        if m is None:
            raise HTTPException(status_code=404, detail="Member not found")
        if m.org_role == "org_admin" and body.org_role != "org_admin" and _admin_count(db, org_id) == 1:
            raise HTTPException(status_code=409, detail="An organization needs at least one org_admin")
        access.audit(db, user, "membership.role", org_id, "user", user_id, {"from": m.org_role, "to": body.org_role})
        m.org_role = body.org_role
        db.commit()
        return MemberOut(user_id=user_id, name=db.get(models.User, user_id).name, org_role=m.org_role)

    @router.delete("/{org_id}/members/{user_id}", status_code=204)
    def remove_member(org_id: int, user_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
        _org_or_404(db, user, org_id, need_admin=True)
        m = db.query(models.OrganizationMembership).filter_by(organization_id=org_id, user_id=user_id).one_or_none()
        if m is None:
            raise HTTPException(status_code=404, detail="Member not found")
        if m.org_role == "org_admin" and _admin_count(db, org_id) == 1:
            raise HTTPException(status_code=409, detail="An organization needs at least one org_admin")
        access.audit(db, user, "membership.remove", org_id, "user", user_id, {"org_role": m.org_role})
        db.delete(m)
        db.commit()

    return router
