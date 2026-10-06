"""Who may see and manage what (docs/plans/T2.1_ORGANIZATIONS_PLAN.md, section 2). Every endpoint asks here.

Asset kinds:
  personal       owner_user_id set, organization_id NULL: the owner (and platform admins).
  organization   organization_id set: org_admin, member and instructor of that organization view it; org_admin manages.
  legacy shared  both NULL: every signed-in user views; platform admins manage.
Researchers never see individual assets; they get aggregate endpoints only.
"""
from typing import Optional

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

import models

VIEW_ROLES = ("org_admin", "member", "instructor")
MANAGE_ROLES = ("org_admin",)


def is_platform_admin(user: models.User) -> bool:
    return user.role == "admin"


def org_role(db: Session, user: models.User, organization_id: Optional[int]) -> Optional[str]:
    if organization_id is None:
        return None
    m = (db.query(models.OrganizationMembership)
         .filter_by(organization_id=organization_id, user_id=user.id).one_or_none())
    return m.org_role if m else None


def orgs_with_role(db: Session, user: models.User, roles=VIEW_ROLES) -> list:
    return [oid for (oid,) in db.query(models.OrganizationMembership.organization_id)
            .filter(models.OrganizationMembership.user_id == user.id, models.OrganizationMembership.org_role.in_(roles))]


def _asset(db: Session, asset_or_id):
    if asset_or_id is None or isinstance(asset_or_id, models.Asset):
        return asset_or_id
    return db.get(models.Asset, asset_or_id)


def can_view_asset(db: Session, user: models.User, asset_or_id) -> bool:
    """True when the user may see the asset and everything recorded against it. A record with no asset
    (asset_id NULL) is a shared record, as before."""
    if asset_or_id is None:
        return True
    asset = _asset(db, asset_or_id)
    if asset is None:
        return True  # dangling reference: nothing private to protect (the caller still 404s on missing rows)
    if is_platform_admin(user):
        return True
    if asset.organization_id is not None:
        return org_role(db, user, asset.organization_id) in VIEW_ROLES
    if asset.owner_user_id is not None:
        return asset.owner_user_id == user.id
    return True  # legacy shared record


def can_manage_asset(db: Session, user: models.User, asset_or_id) -> bool:
    asset = _asset(db, asset_or_id)
    if asset is None:
        return is_platform_admin(user)
    if is_platform_admin(user):
        return True
    if asset.organization_id is not None:
        return org_role(db, user, asset.organization_id) in MANAGE_ROLES
    return asset.owner_user_id is not None and asset.owner_user_id == user.id


def visible_asset_filter(db: Session, user: models.User, include_shared: bool = True):
    """SQLAlchemy filter for assets the user may view in their own working scope (used by lists, the skill matrix
    and the graph). Platform admins are scoped like everyone else here: these views describe the user's own
    environment, not every tenant's."""
    clauses = [and_(models.Asset.owner_user_id == user.id, models.Asset.organization_id.is_(None))]
    orgs = orgs_with_role(db, user)
    if orgs:
        clauses.append(models.Asset.organization_id.in_(orgs))
    if include_shared:
        clauses.append(and_(models.Asset.owner_user_id.is_(None), models.Asset.organization_id.is_(None)))
    return or_(*clauses)


def learner_for(db: Session, intervention: models.Intervention) -> Optional[int]:
    """Whose capability an intervention is judged against: the assigned learner, else the asset's owner."""
    if intervention.assigned_user_id is not None:
        return intervention.assigned_user_id
    finding = db.get(models.Finding, intervention.finding_id)
    asset = db.get(models.Asset, finding.asset_id) if finding else None
    return asset.owner_user_id if asset else None


def audit(db: Session, actor: Optional[models.User], action: str, organization_id: Optional[int] = None,
          target_type: Optional[str] = None, target_id=None, details: Optional[dict] = None) -> None:
    """Append an audit event; the caller commits with the action it records."""
    db.add(models.AuditEvent(actor_user_id=actor.id if actor else None, organization_id=organization_id, action=action,
                             target_type=target_type, target_id=None if target_id is None else str(target_id), details=details))
