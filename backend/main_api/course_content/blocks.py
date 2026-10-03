"""Validated section blocks: text, video, visual, code, callout, checkpoint."""
import os
import uuid
from typing import Annotated, Any, Dict, List, Literal, Optional, Union
from urllib.parse import urlsplit

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter, field_validator, model_validator

from .sanitize import clean_code, clean_line, clean_text

MAX_BLOCKS_PER_SECTION = 50


def allowed_video_hosts() -> set:
    """Read at validation time from QCAPS_VIDEO_HOST_ALLOWLIST (comma separated).
    Unset or empty means no video URL is accepted."""
    raw = os.environ.get("QCAPS_VIDEO_HOST_ALLOWLIST", "")
    return {h.strip().lower() for h in raw.split(",") if h.strip()}


def validate_allowlisted_url(value: str) -> str:
    parts = urlsplit(value.strip())
    if parts.scheme != "https":
        raise ValueError("URL must use https")
    if parts.username or parts.password:
        raise ValueError("URL must not contain credentials")
    host = (parts.hostname or "").lower()
    if not host or host not in allowed_video_hosts():
        raise ValueError("URL host is not in the allowed video host list")
    return value.strip()


class _Block(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12], pattern=r"^[A-Za-z0-9_-]{1,40}$")


class TextBlock(_Block):
    type: Literal["text"]
    markdown: str = Field(min_length=1, max_length=20000)

    @field_validator("markdown")
    @classmethod
    def _clean(cls, v):
        return clean_text(v)


class VideoBlock(_Block):
    type: Literal["video"]
    url: str = Field(max_length=500)
    title: str = Field(min_length=1, max_length=200)
    duration_seconds: Optional[int] = Field(default=None, ge=1, le=14400)
    captions_url: Optional[str] = Field(default=None, max_length=500)
    transcript_url: Optional[str] = Field(default=None, max_length=500)

    @field_validator("url", "captions_url", "transcript_url")
    @classmethod
    def _allowlisted(cls, v):
        return v if v is None else validate_allowlisted_url(v)

    @field_validator("title")
    @classmethod
    def _title(cls, v):
        return clean_line(v)


class VisualBlock(_Block):
    type: Literal["visual"]
    kind: str = Field(pattern=r"^[a-z0-9][a-z0-9-]{0,49}$")
    title: Optional[str] = Field(default=None, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    # True when the visual shows scripted/simulated behaviour rather than real data.
    simulation: bool = False

    @field_validator("title")
    @classmethod
    def _title(cls, v):
        return v if v is None else clean_line(v)

    @field_validator("description")
    @classmethod
    def _clean(cls, v):
        return clean_text(v)


class CodeBlock(_Block):
    type: Literal["code"]
    language: str = Field(default="text", pattern=r"^[a-z0-9+#.-]{1,20}$")
    code: str = Field(min_length=1, max_length=20000)
    caption: Optional[str] = Field(default=None, max_length=200)

    @field_validator("code")
    @classmethod
    def _code(cls, v):
        return clean_code(v)

    @field_validator("caption")
    @classmethod
    def _caption(cls, v):
        return v if v is None else clean_line(v)


class CalloutBlock(_Block):
    type: Literal["callout"]
    variant: Literal["info", "tip", "warning", "danger"] = "info"
    title: Optional[str] = Field(default=None, max_length=200)
    text: str = Field(min_length=1, max_length=4000)

    @field_validator("title")
    @classmethod
    def _title(cls, v):
        return v if v is None else clean_line(v)

    @field_validator("text")
    @classmethod
    def _clean(cls, v):
        return clean_text(v)


class CheckpointBlock(_Block):
    type: Literal["checkpoint"]
    question: str = Field(min_length=1, max_length=500)
    options: List[str] = Field(min_length=2, max_length=6)
    correct_index: int = Field(ge=0)
    explanation: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("question")
    @classmethod
    def _question(cls, v):
        return clean_line(v)

    @field_validator("options")
    @classmethod
    def _options(cls, v):
        cleaned = [clean_line(o) for o in v]
        if any(not o or len(o) > 300 for o in cleaned):
            raise ValueError("each option must be 1-300 characters")
        return cleaned

    @field_validator("explanation")
    @classmethod
    def _explanation(cls, v):
        return v if v is None else clean_text(v)

    @model_validator(mode="after")
    def _index_in_range(self):
        if self.correct_index >= len(self.options):
            raise ValueError("correct_index is out of range")
        return self


Block = Annotated[
    Union[TextBlock, VideoBlock, VisualBlock, CodeBlock, CalloutBlock, CheckpointBlock],
    Field(discriminator="type"),
]
BlockList = Annotated[List[Block], Field(max_length=MAX_BLOCKS_PER_SECTION)]
_block_list_adapter = TypeAdapter(BlockList)


def validate_blocks(raw: Any) -> List[Dict[str, Any]]:
    """Validate and normalise a list of blocks. Raises pydantic.ValidationError
    (or ValueError for duplicate ids). Block ids are unique within a section."""
    blocks = [b.model_dump() for b in _block_list_adapter.validate_python(raw)]
    ids = [b["id"] for b in blocks]
    if len(ids) != len(set(ids)):
        raise ValueError("block ids must be unique within a section")
    return blocks


def public_blocks(blocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Learner-facing copy of stored blocks: checkpoint answers are removed."""
    out = []
    for b in blocks or []:
        if b.get("type") == "checkpoint":
            b = {k: v for k, v in b.items() if k not in ("correct_index", "explanation")}
        out.append(b)
    return out
