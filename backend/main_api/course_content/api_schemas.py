"""Request bodies for the content API (strict: unknown fields are rejected)."""
import re
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .blocks import validate_blocks
from .sanitize import clean_line, clean_text

Status = Literal["draft", "published"]
SLUG = r"^[a-z0-9][a-z0-9_-]{0,99}$"
Level = Literal["Novice", "Beginner", "Intermediate", "Advanced", "Enterprise"]


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


def _line(v):
    return v if v is None else clean_line(v)


def _text(v):
    return v if v is None else clean_text(v)


def _prereqs(v):
    if v is not None and any(not re.match(SLUG, p) for p in v):
        raise ValueError("prerequisites must be module slugs")
    return v


def _objectives(v):
    if v is None:
        return v
    out = [clean_line(o) for o in v]
    if any(not o or len(o) > 500 for o in out):
        raise ValueError("each objective must be 1-500 characters")
    return out


class TrackMeta(_Strict):
    entry_profile: Optional[str] = Field(default=None, max_length=1000)
    certificate_name: Optional[str] = Field(default=None, max_length=200)
    certificate_code: Optional[str] = Field(default=None, max_length=100)
    capstone_title: Optional[str] = Field(default=None, max_length=200)
    capstone_description: Optional[str] = Field(default=None, max_length=1000)


class WrapUp(_Strict):
    summary: Optional[str] = Field(default=None, max_length=4000)
    deliverables: Optional[List[str]] = Field(default=None, max_length=20)
    unlocks_next: Optional[str] = Field(default=None, max_length=300)


class TrackCreate(_Strict):
    slug: str = Field(pattern=SLUG)
    code: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=4000)
    accent_color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    meta: Optional[TrackMeta] = None
    status: Status = "draft"

    @field_validator("code", "title", "subtitle")
    @classmethod
    def _lines(cls, v):
        return _line(v)

    @field_validator("description")
    @classmethod
    def _desc(cls, v):
        return _text(v)


class TrackUpdate(_Strict):
    slug: Optional[str] = Field(default=None, pattern=SLUG)
    code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=4000)
    accent_color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    meta: Optional[TrackMeta] = None
    status: Optional[Status] = None

    @field_validator("code", "title", "subtitle")
    @classmethod
    def _lines(cls, v):
        return _line(v)

    @field_validator("description")
    @classmethod
    def _desc(cls, v):
        return _text(v)


class ModuleCreate(_Strict):
    track_id: int
    slug: str = Field(pattern=SLUG)
    code: str = Field(min_length=1, max_length=20)
    title: str = Field(min_length=1, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    level: Optional[Level] = None
    estimated_minutes: int = Field(default=0, ge=0, le=3000)
    xp: int = Field(default=0, ge=0, le=10000)
    recommendation_topic: Optional[str] = Field(default=None, pattern=r"^[a-z0-9_]{1,100}$")
    domain: Optional[str] = Field(default=None, max_length=100)
    prerequisites: List[str] = Field(default_factory=list, max_length=20)
    unlocks: Optional[str] = Field(default=None, pattern=SLUG)
    learning_objectives: List[str] = Field(default_factory=list, max_length=30)
    wrap_up: Optional[WrapUp] = None
    status: Status = "draft"

    @field_validator("code", "title", "subtitle", "domain")
    @classmethod
    def _lines(cls, v):
        return _line(v)

    @field_validator("prerequisites")
    @classmethod
    def _p(cls, v):
        return _prereqs(v)

    @field_validator("learning_objectives")
    @classmethod
    def _o(cls, v):
        return _objectives(v)


class ModuleUpdate(_Strict):
    slug: Optional[str] = Field(default=None, pattern=SLUG)
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    subtitle: Optional[str] = Field(default=None, max_length=300)
    level: Optional[Level] = None
    estimated_minutes: Optional[int] = Field(default=None, ge=0, le=3000)
    xp: Optional[int] = Field(default=None, ge=0, le=10000)
    recommendation_topic: Optional[str] = Field(default=None, pattern=r"^[a-z0-9_]{1,100}$")
    domain: Optional[str] = Field(default=None, max_length=100)
    prerequisites: Optional[List[str]] = Field(default=None, max_length=20)
    unlocks: Optional[str] = Field(default=None, pattern=SLUG)
    learning_objectives: Optional[List[str]] = Field(default=None, max_length=30)
    wrap_up: Optional[WrapUp] = None
    status: Optional[Status] = None

    @field_validator("code", "title", "subtitle", "domain")
    @classmethod
    def _lines(cls, v):
        return _line(v)

    @field_validator("prerequisites")
    @classmethod
    def _p(cls, v):
        return _prereqs(v)

    @field_validator("learning_objectives")
    @classmethod
    def _o(cls, v):
        return _objectives(v)


class SectionCreate(_Strict):
    module_id: int
    slug: str = Field(pattern=SLUG)
    title: str = Field(min_length=1, max_length=200)
    summary: Optional[str] = Field(default=None, max_length=300)
    estimated_minutes: Optional[int] = Field(default=None, ge=1, le=600)
    blocks: List[Dict[str, Any]] = Field(default_factory=list)
    status: Status = "draft"

    @field_validator("title", "summary")
    @classmethod
    def _t(cls, v):
        return _line(v)

    @field_validator("blocks")
    @classmethod
    def _blocks(cls, v):
        return validate_blocks(v)


class SectionUpdate(_Strict):
    slug: Optional[str] = Field(default=None, pattern=SLUG)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    summary: Optional[str] = Field(default=None, max_length=300)
    estimated_minutes: Optional[int] = Field(default=None, ge=1, le=600)
    blocks: Optional[List[Dict[str, Any]]] = None
    status: Optional[Status] = None

    @field_validator("title", "summary")
    @classmethod
    def _t(cls, v):
        return _line(v)

    @field_validator("blocks")
    @classmethod
    def _blocks(cls, v):
        return v if v is None else validate_blocks(v)


class ChecklistRequest(_Strict):
    """Dry run of the publish checklist for an unsaved draft. Nothing is stored."""
    title: str = Field(max_length=200)
    blocks: List[Dict[str, Any]] = Field(default_factory=list)

    @field_validator("blocks")
    @classmethod
    def _blocks(cls, v):
        return validate_blocks(v)


class ReorderRequest(_Strict):
    ids: List[int] = Field(min_length=1, max_length=500)


class CheckpointAttempt(_Strict):
    selected_index: int = Field(ge=0, le=5)
