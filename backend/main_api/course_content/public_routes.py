"""Learner-facing API: published content only, no checkpoint answers, server-side progress."""
from typing import Callable, Dict, List, Set

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
from database import get_db
from .api_schemas import CheckpointAttempt
from .ratelimit import checkpoint_limiter
from .serializers import module_dict, section_dict, track_dict


def _checkpoint_ids(section: models.CourseSection) -> List[str]:
    return [b["id"] for b in (section.blocks or []) if b.get("type") == "checkpoint"]


def completed_section_ids(db: Session, user_id: int, sections: List[models.CourseSection]) -> List[int]:
    """A section is complete when every checkpoint in it has been passed, or, for sections
    without a checkpoint, when the learner explicitly marked it complete. Computed from the
    sections' current blocks, so adding a checkpoint later makes the section incomplete again."""
    ids = [s.id for s in sections]
    if not ids:
        return []
    passed: Dict[int, Set[str]] = {}
    for section_id, block_id in db.query(models.CheckpointPass.section_id, models.CheckpointPass.block_id).filter(
        models.CheckpointPass.user_id == user_id, models.CheckpointPass.section_id.in_(ids)
    ):
        passed.setdefault(section_id, set()).add(block_id)
    marked = {
        row[0] for row in db.query(models.SectionCompletion.section_id).filter(
            models.SectionCompletion.user_id == user_id, models.SectionCompletion.section_id.in_(ids)
        )
    }
    done = []
    for s in sections:
        checkpoints = set(_checkpoint_ids(s))
        if checkpoints:
            if checkpoints <= passed.get(s.id, set()):
                done.append(s.id)
        elif s.id in marked:
            done.append(s.id)
    return done


def create_public_router(get_current_user: Callable) -> APIRouter:
    router = APIRouter(prefix="/api/content", tags=["content"])

    def _published_module(db: Session, slug: str) -> models.CourseModule:
        m = (
            db.query(models.CourseModule)
            .join(models.CourseTrack, models.CourseTrack.id == models.CourseModule.track_id)
            .filter(
                models.CourseModule.slug == slug,
                models.CourseModule.status == "published",
                models.CourseTrack.status == "published",
            )
            .first()
        )
        if not m:
            raise HTTPException(status_code=404, detail="Module not found")
        return m

    def _published_section(db: Session, section_id: int) -> models.CourseSection:
        s = db.query(models.CourseSection).filter(
            models.CourseSection.id == section_id, models.CourseSection.status == "published"
        ).first()
        if not s:
            raise HTTPException(status_code=404, detail="Section not found")
        _published_module(db, s.module.slug)
        return s

    @router.get("/tracks")
    def list_tracks(db: Session = Depends(get_db)):
        counts = dict(
            db.query(models.CourseSection.module_id, func.count(models.CourseSection.id))
            .filter(models.CourseSection.status == "published")
            .group_by(models.CourseSection.module_id)
            .all()
        )
        tracks = (
            db.query(models.CourseTrack)
            .filter(models.CourseTrack.status == "published")
            .order_by(models.CourseTrack.sort_order, models.CourseTrack.id)
            .all()
        )
        out = []
        for t in tracks:
            td = track_dict(t)
            td["modules"] = [
                {
                    "slug": m.slug, "code": m.code, "title": m.title, "subtitle": m.subtitle,
                    "level": m.level, "estimated_minutes": m.estimated_minutes, "xp": m.xp,
                    "section_count": counts.get(m.id, 0),
                }
                for m in t.modules if m.status == "published"
            ]
            out.append(td)
        return {"tracks": out}

    @router.get("/modules/{slug}")
    def get_module(slug: str, db: Session = Depends(get_db)):
        m = _published_module(db, slug)
        data = module_dict(m)
        data["track"] = {"slug": m.track.slug, "code": m.track.code, "title": m.track.title}
        data["sections"] = [
            section_dict(s, public=True) for s in m.sections if s.status == "published"
        ]
        return data

    @router.get("/modules/{slug}/progress")
    def get_progress(
        slug: str,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
    ):
        """The caller's own section progress for one module."""
        m = _published_module(db, slug)
        sections = [s for s in m.sections if s.status == "published"]
        return {
            "completed_section_ids": completed_section_ids(db, current_user.id, sections),
            "total_sections": len(sections),
        }

    @router.post("/sections/{section_id}/checkpoints/{block_id}/check")
    def check_checkpoint(
        section_id: int,
        block_id: str,
        attempt: CheckpointAttempt,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
    ):
        """Grade a checkpoint on the server. The answer key never leaves the backend;
        the explanation is only returned once the learner is correct."""
        s = _published_section(db, section_id)
        block = next(
            (b for b in (s.blocks or []) if b.get("id") == block_id and b.get("type") == "checkpoint"),
            None,
        )
        if not block:
            raise HTTPException(status_code=404, detail="Checkpoint not found")
        if attempt.selected_index >= len(block["options"]):
            raise HTTPException(status_code=422, detail="selected_index out of range")

        retry_after = checkpoint_limiter.hit((current_user.id, section_id, block_id))
        if retry_after:
            raise HTTPException(
                status_code=429,
                detail=f"Too many attempts. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        correct = attempt.selected_index == block["correct_index"]
        section_completed = False
        if correct:
            exists = db.query(models.CheckpointPass).filter_by(
                user_id=current_user.id, section_id=section_id, block_id=block_id
            ).first()
            if not exists:
                db.add(models.CheckpointPass(user_id=current_user.id, section_id=section_id, block_id=block_id))
                try:
                    db.commit()
                except IntegrityError:  # concurrent duplicate: already recorded
                    db.rollback()
            section_completed = section_id in completed_section_ids(db, current_user.id, [s])
        return {
            "correct": correct,
            "explanation": block.get("explanation") if correct else None,
            "section_completed": section_completed,
        }

    @router.post("/sections/{section_id}/complete")
    def complete_section(
        section_id: int,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user),
    ):
        """Mark a section without checkpoints as complete. Sections with checkpoints
        complete only through the grader, so progress cannot be self-declared."""
        s = _published_section(db, section_id)
        if _checkpoint_ids(s):
            raise HTTPException(status_code=409, detail="Answer the checkpoint to complete this section.")
        exists = db.query(models.SectionCompletion).filter_by(user_id=current_user.id, section_id=section_id).first()
        if not exists:
            db.add(models.SectionCompletion(user_id=current_user.id, section_id=section_id))
            try:
                db.commit()
            except IntegrityError:
                db.rollback()
        return {"completed": True}

    return router
