"""Row -> dict conversion. The public variants never include checkpoint answers."""
from typing import Any, Dict

import models
from .blocks import public_blocks
from .checklist import publish_checklist


def _iso(dt):
    return dt.isoformat() if dt else None


def track_dict(t: models.CourseTrack) -> Dict[str, Any]:
    return {
        "id": t.id, "slug": t.slug, "code": t.code, "title": t.title,
        "subtitle": t.subtitle, "description": t.description,
        "accent_color": t.accent_color, "meta": t.meta or {},
        "status": t.status, "sort_order": t.sort_order,
        "created_at": _iso(t.created_at), "updated_at": _iso(t.updated_at),
    }


def module_dict(m: models.CourseModule) -> Dict[str, Any]:
    return {
        "id": m.id, "slug": m.slug, "track_id": m.track_id, "code": m.code,
        "title": m.title, "subtitle": m.subtitle, "level": m.level,
        "estimated_minutes": m.estimated_minutes, "xp": m.xp,
        "recommendation_topic": m.recommendation_topic, "domain": m.domain,
        "prerequisites": m.prerequisites or [], "unlocks": m.unlocks,
        "learning_objectives": m.learning_objectives or [], "wrap_up": m.wrap_up,
        "status": m.status, "sort_order": m.sort_order,
        "created_at": _iso(m.created_at), "updated_at": _iso(m.updated_at),
    }


def section_dict(s: models.CourseSection, *, public: bool) -> Dict[str, Any]:
    """public=True strips checkpoint answers; admin reads keep them."""
    data = {
        "id": s.id, "slug": s.slug, "module_id": s.module_id, "title": s.title,
        "summary": s.summary, "estimated_minutes": s.estimated_minutes,
        "blocks": public_blocks(s.blocks) if public else (s.blocks or []),
        "sources": s.sources or [], "needs_verification": s.needs_verification,
        "status": s.status, "sort_order": s.sort_order,
        "created_at": _iso(s.created_at), "updated_at": _iso(s.updated_at),
    }
    if not public:
        data["checklist"] = publish_checklist(s.title, s.blocks or [])
    return data
