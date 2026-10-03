"""Admin-only content management. Every write is audited in the same transaction."""
from typing import Any, Callable, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
from database import get_db
from .api_schemas import (
    ChecklistRequest, ModuleCreate, ModuleUpdate, ReorderRequest, SectionCreate, SectionUpdate,
    TrackCreate, TrackUpdate,
)
from .checklist import failing, publish_checklist
from .serializers import module_dict, section_dict, track_dict


def _audit(db: Session, actor: models.User, action: str, entity_type: str,
           entity_id: Optional[int], before: Any, after: Any) -> None:
    db.add(models.ContentAuditLog(
        actor_id=actor.id, action=action, entity_type=entity_type,
        entity_id=entity_id, before=before, after=after,
    ))


_NOT_NULLABLE = {
    "slug", "code", "title", "status", "blocks",
    "estimated_minutes", "xp", "prerequisites", "learning_objectives",
}


def _fields(body, *, partial: bool = False, nested=("meta", "wrap_up"), nullable=frozenset()) -> Dict[str, Any]:
    """Body as plain dicts. partial=True (PATCH) keeps only explicitly-sent fields and
    rejects an explicit null for a required column; otherwise schema defaults apply.
    `nullable` lists columns of this entity that are optional even though another entity requires them
    (a section may have no estimate; a module may not)."""
    data = body.model_dump(exclude_unset=partial)
    if partial:
        for key, value in data.items():
            if value is None and key in _NOT_NULLABLE and key not in nullable:
                raise HTTPException(status_code=422, detail=f"{key} cannot be null")
    for key in nested:
        if key in data and data[key] is not None:
            data[key] = {k: v for k, v in data[key].items() if v is not None}
    return data


def _flush(db: Session, what: str) -> None:
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"{what} conflicts with an existing record")


def _commit(db: Session, what: str) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"{what} conflicts with an existing record")


def _require_publishable(title: str, blocks: List[Dict[str, Any]]) -> None:
    """Server-side publish gate: a section cannot go live while a checklist item fails."""
    problems = failing(publish_checklist(title, blocks))
    if problems:
        raise HTTPException(status_code=422, detail={
            "message": "Section does not pass the publish checklist",
            "checklist": problems,
        })


def _delete_progress(db: Session, section_ids: List[int]) -> None:
    """Remove learner progress for sections being deleted. The FKs declare ON DELETE CASCADE, but
    SQLite does not enforce foreign keys by default, and it reuses row ids: without this, a new
    section could inherit a deleted section's completions."""
    if not section_ids:
        return
    for model in (models.CheckpointPass, models.SectionCompletion):
        db.query(model).filter(model.section_id.in_(section_ids)).delete(synchronize_session=False)


def _next_order(db: Session, column, *criteria) -> int:
    current = db.query(func.max(column)).filter(*criteria).scalar()
    return 0 if current is None else current + 1


def _apply_reorder(db, actor, entity_type, siblings, ids: List[int], scope_id: Optional[int]):
    existing = [s.id for s in siblings]
    if len(ids) != len(set(ids)) or set(ids) != set(existing):
        raise HTTPException(status_code=400, detail="ids must list every sibling exactly once")
    by_id = {s.id: s for s in siblings}
    for position, item_id in enumerate(ids):
        by_id[item_id].sort_order = position
    _audit(db, actor, "reorder", entity_type, scope_id, {"ids": existing}, {"ids": ids})
    db.commit()
    return {"ids": ids}


def create_admin_router(require_admin: Callable) -> APIRouter:
    router = APIRouter(prefix="/api/admin/content", tags=["admin-content"])

    def _get(db: Session, model, item_id: int, label: str):
        row = db.get(model, item_id)
        if not row:
            raise HTTPException(status_code=404, detail=f"{label} not found")
        return row

    # ---- reads (include drafts and checkpoint answers) ----

    @router.get("/tracks")
    def admin_list_tracks(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        tracks = db.query(models.CourseTrack).order_by(models.CourseTrack.sort_order).all()
        counts = {}
        for module_id, status, n in (
            db.query(models.CourseSection.module_id, models.CourseSection.status, func.count(models.CourseSection.id))
            .group_by(models.CourseSection.module_id, models.CourseSection.status)
        ):
            counts.setdefault(module_id, {})[status] = n

        def with_counts(m):
            c = counts.get(m.id, {})
            return {**module_dict(m), "section_count": sum(c.values()), "draft_section_count": c.get("draft", 0)}

        return {
            "stats": {
                "tracks": len(tracks),
                "modules": sum(len(t.modules) for t in tracks),
                "sections": sum(sum(c.values()) for c in counts.values()),
                "draft_sections": sum(c.get("draft", 0) for c in counts.values()),
            },
            "tracks": [{**track_dict(t), "modules": [with_counts(m) for m in t.modules]} for t in tracks],
        }

    @router.get("/modules/{module_id}")
    def admin_get_module(module_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        m = _get(db, models.CourseModule, module_id, "Module")
        return {**module_dict(m), "sections": [section_dict(s, public=False) for s in m.sections]}

    @router.get("/audit-log")
    def audit_log(
        limit: int = Query(50, ge=1, le=200),
        offset: int = Query(0, ge=0),
        entity_type: Optional[str] = Query(None, pattern="^(track|module|section)$"),
        db: Session = Depends(get_db),
        admin: models.User = Depends(require_admin),
    ):
        """Newest first. Lists what changed, not full snapshots (those stay in the table)."""
        query = db.query(models.ContentAuditLog, models.User.name).join(
            models.User, models.User.id == models.ContentAuditLog.actor_id
        )
        if entity_type:
            query = query.filter(models.ContentAuditLog.entity_type == entity_type)
        total = query.count()
        rows = query.order_by(models.ContentAuditLog.id.desc()).offset(offset).limit(limit).all()
        items = []
        for entry, actor_name in rows:
            before, after = entry.before or {}, entry.after or {}
            snapshot = after or before
            changed = (
                sorted(k for k in after if k not in ("updated_at", "checklist") and before.get(k) != after.get(k))
                if entry.action == "update" else []
            )
            items.append({
                "id": entry.id,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "actor_id": entry.actor_id,
                "actor_name": actor_name,
                "action": entry.action,
                "entity_type": entry.entity_type,
                "entity_id": entry.entity_id,
                "label": snapshot.get("title") or snapshot.get("slug") or (
                    "order of " + str(len(snapshot.get("ids", []))) + " items" if entry.action == "reorder" else None
                ),
                "changed_fields": changed,
            })
        return {"total": total, "items": items}

    @router.post("/sections/checklist")
    def preview_checklist(body: ChecklistRequest, admin: models.User = Depends(require_admin)):
        """Publish checklist for an unsaved draft (nothing is stored)."""
        return {"checklist": publish_checklist(body.title, body.blocks)}

    # ---- tracks ----

    @router.post("/tracks", status_code=201)
    def create_track(body: TrackCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        data = _fields(body)
        track = models.CourseTrack(**data, sort_order=_next_order(db, models.CourseTrack.sort_order))
        db.add(track)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Track slug already exists")
        out = track_dict(track)
        _audit(db, admin, "create", "track", track.id, None, out)
        _commit(db, "Track")
        return track_dict(track)

    @router.put("/tracks/reorder")
    def reorder_tracks(body: ReorderRequest, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        return _apply_reorder(db, admin, "track", db.query(models.CourseTrack).all(), body.ids, None)

    @router.patch("/tracks/{track_id}")
    def update_track(track_id: int, body: TrackUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        track = _get(db, models.CourseTrack, track_id, "Track")
        before = track_dict(track)
        for key, value in _fields(body, partial=True).items():
            setattr(track, key, value)
        track.imported_hash = None  # now owned by an admin; the importer will not overwrite it
        _flush(db, "Track")
        after = track_dict(track)
        _audit(db, admin, "update", "track", track.id, before, after)
        _commit(db, "Track")
        return after

    @router.delete("/tracks/{track_id}", status_code=204)
    def delete_track(track_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        track = _get(db, models.CourseTrack, track_id, "Track")
        before = {**track_dict(track), "module_ids": [m.id for m in track.modules]}
        _delete_progress(db, [s.id for m in track.modules for s in m.sections])
        db.delete(track)
        _audit(db, admin, "delete", "track", track_id, before, None)
        db.commit()

    @router.put("/tracks/{track_id}/modules/reorder")
    def reorder_modules(track_id: int, body: ReorderRequest, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        track = _get(db, models.CourseTrack, track_id, "Track")
        return _apply_reorder(db, admin, "module", list(track.modules), body.ids, track_id)

    # ---- modules ----

    @router.post("/modules", status_code=201)
    def create_module(body: ModuleCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        _get(db, models.CourseTrack, body.track_id, "Track")
        data = _fields(body)
        module = models.CourseModule(
            **data,
            sort_order=_next_order(db, models.CourseModule.sort_order, models.CourseModule.track_id == body.track_id),
        )
        db.add(module)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Module slug already exists")
        _audit(db, admin, "create", "module", module.id, None, module_dict(module))
        _commit(db, "Module")
        return module_dict(module)

    @router.patch("/modules/{module_id}")
    def update_module(module_id: int, body: ModuleUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        module = _get(db, models.CourseModule, module_id, "Module")
        before = module_dict(module)
        for key, value in _fields(body, partial=True).items():
            setattr(module, key, value)
        module.imported_hash = None
        _flush(db, "Module")
        after = module_dict(module)
        _audit(db, admin, "update", "module", module.id, before, after)
        _commit(db, "Module")
        return after

    @router.delete("/modules/{module_id}", status_code=204)
    def delete_module(module_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        module = _get(db, models.CourseModule, module_id, "Module")
        before = {**module_dict(module), "section_ids": [s.id for s in module.sections]}
        _delete_progress(db, before["section_ids"])
        db.delete(module)
        _audit(db, admin, "delete", "module", module_id, before, None)
        db.commit()

    @router.put("/modules/{module_id}/sections/reorder")
    def reorder_sections(module_id: int, body: ReorderRequest, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        module = _get(db, models.CourseModule, module_id, "Module")
        return _apply_reorder(db, admin, "section", list(module.sections), body.ids, module_id)

    # ---- sections ----

    @router.post("/sections", status_code=201)
    def create_section(body: SectionCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        _get(db, models.CourseModule, body.module_id, "Module")
        data = _fields(body)
        if data["status"] == "published":
            _require_publishable(data["title"], data["blocks"])
        section = models.CourseSection(
            **data,
            sort_order=_next_order(db, models.CourseSection.sort_order, models.CourseSection.module_id == body.module_id),
        )
        db.add(section)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Section slug already exists in this module")
        _audit(db, admin, "create", "section", section.id, None, section_dict(section, public=False))
        _commit(db, "Section")
        return section_dict(section, public=False)

    @router.patch("/sections/{section_id}")
    def update_section(section_id: int, body: SectionUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        section = _get(db, models.CourseSection, section_id, "Section")
        before = section_dict(section, public=False)
        for key, value in _fields(body, partial=True, nullable={"estimated_minutes"}).items():
            setattr(section, key, value)
        section.imported_hash = None
        if section.status == "published":
            _require_publishable(section.title, section.blocks or [])
        _flush(db, "Section")
        after = section_dict(section, public=False)
        _audit(db, admin, "update", "section", section.id, before, after)
        _commit(db, "Section")
        return after

    @router.delete("/sections/{section_id}", status_code=204)
    def delete_section(section_id: int, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
        section = _get(db, models.CourseSection, section_id, "Section")
        before = section_dict(section, public=False)
        _delete_progress(db, [section_id])
        db.delete(section)
        _audit(db, admin, "delete", "section", section_id, before, None)
        db.commit()

    return router
