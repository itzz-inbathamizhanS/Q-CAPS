"""Import the bundled curriculum (frontend/src/data/curriculumData.ts) into the content tables.

Run from backend/main_api:
    python -m course_content.import_curriculum [--source PATH]

Idempotent. A row is keyed by slug and stores a hash of the source it was imported from:
  - missing            -> created as published
  - same hash          -> unchanged
  - different hash     -> updated from source
  - imported_hash NULL -> edited by an admin, left alone
  - imported_hash "pack:..." -> written by import_pack (book content); left alone
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Dict, List

from sqlalchemy.orm import Session

import models
from .blocks import validate_blocks

DEFAULT_SOURCE = Path(__file__).resolve().parents[3] / "frontend" / "src" / "data" / "curriculumData.ts"

_CALLOUT_PREFIX = re.compile(r"^\*\*[^*]*Interactive/Visual Requirement:\*\*\s*")
# A horizontal rule left over from the markdown source at the very end of a section.
_TRAILING_RULE = re.compile(r"\s*\n\s*-{3,}\s*$")


def clean_content(text: str) -> str:
    return _TRAILING_RULE.sub("", text).strip()


# Pilot content authored for the learner-page slice. It is NOT in curriculumData.ts.
# A3 "HTTP/HTTPS" is where HTTPS/TLS is first introduced.
PILOT_BLOCKS = {
    ("track_a_a3_networking_foundations", "sec-7"): [
        {
            "type": "visual", "id": "pilot-tls", "kind": "tls-handshake",
            "title": "Walk through the TLS 1.3 handshake",
            "description": (
                "Step through the main messages of a TLS 1.3 handshake, following RFC 9846. "
                "Simplified: optional messages are left out, and nothing here is a real connection."
            ),
            "simulation": True,
        },
        {
            "type": "checkpoint", "id": "pilot-cp1",
            "question": (
                "Which part of the TLS 1.3 handshake lets the browser check that the server "
                "really holds the private key for its certificate?"
            ),
            "options": [
                "The key_share in ClientHello",
                "The CertificateVerify signature",
                "The client's Finished message",
            ],
            "correct_index": 1,
            "explanation": (
                "CertificateVerify is a signature over the handshake, made with the private key that "
                "matches the certificate's public key, so only the real key holder can produce it. "
                "The Certificate message alone only presents the key. With RSA or ECDSA keys, this is "
                "also the signature a large quantum computer could forge."
            ),
        },
    ],
}


def _extract_array(source: str, name: str) -> List[Dict[str, Any]]:
    start = source.index(f"export const {name}")
    start = source.index("= [", start) + 2
    end = source.index("\n];", start) + 2
    return json.loads(source[start:end])


def load_source(path: Path) -> Dict[str, List[Dict[str, Any]]]:
    text = Path(path).read_text(encoding="utf-8")
    return {
        "tracks": _extract_array(text, "curriculumTracks"),
        "modules": _extract_array(text, "curriculumModules"),
    }


def _hash(payload: Dict[str, Any]) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


def _callout_block(index: int, text: str) -> Dict[str, Any]:
    description = _CALLOUT_PREFIX.sub("", text).strip()
    simulation = "simulat" in description.lower()
    return {
        "type": "visual", "id": f"b{index}",
        # "planned-interactive": the source only describes a widget that is not built yet.
        "kind": "simulation" if simulation else "planned-interactive",
        "description": description,
        "simulation": simulation,
    }


def section_blocks(module_slug: str, section: Dict[str, Any]) -> List[Dict[str, Any]]:
    blocks: List[Dict[str, Any]] = []
    if clean_content(section.get("content", "")):
        blocks.append({"type": "text", "id": "b1", "markdown": clean_content(section["content"])})
    if section.get("codeSnippet"):
        blocks.append({"type": "code", "id": "b2", "language": "text", "code": section["codeSnippet"]})
    if section.get("interactiveCallout"):
        blocks.append(_callout_block(len(blocks) + 1, section["interactiveCallout"]))
    blocks.extend(PILOT_BLOCKS.get((module_slug, section["id"]), []))
    return validate_blocks(blocks)


def _track_payload(t: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "code": t["code"], "title": t["title"], "subtitle": t.get("subtitle"),
        "description": t.get("description"), "accent_color": t.get("accentColor"),
        "meta": {
            "entry_profile": t.get("entryProfile"),
            "certificate_name": t.get("certificateName"),
            "certificate_code": t.get("certificateCode"),
            "capstone_title": t.get("capstoneTitle"),
            "capstone_description": t.get("capstoneDescription"),
        },
    }


def _module_payload(m: Dict[str, Any]) -> Dict[str, Any]:
    wrap = m.get("wrapUp") or {}
    return {
        "code": m["code"], "title": m["title"], "subtitle": m.get("subtitle"),
        "level": m.get("level"), "estimated_minutes": m.get("estimatedMinutes", 0),
        "xp": m.get("xp", 0), "recommendation_topic": m.get("recommendationTopic"),
        "domain": m.get("domain"), "prerequisites": m.get("prerequisites", []),
        "unlocks": m.get("unlocks") or None,
        "learning_objectives": m.get("learningObjectives", []),
        "wrap_up": {
            k: v for k, v in {
                "summary": wrap.get("summary"),
                "deliverables": wrap.get("deliverables"),
                "unlocks_next": wrap.get("unlocksNext"),
            }.items() if v is not None
        } or None,
    }


def _upsert(db: Session, model, lookup: Dict[str, Any], payload: Dict[str, Any],
            create_extra: Dict[str, Any], stats: Dict[str, int]):
    digest = _hash(payload)
    row = db.query(model).filter_by(**lookup).first()
    if row is None:
        row = model(**lookup, **payload, **create_extra, status="published", imported_hash=digest)
        db.add(row)
        stats["created"] += 1
    elif row.imported_hash is None:
        stats["skipped_admin_edited"] += 1
    elif row.imported_hash.startswith("pack:"):
        stats["skipped_pack_owned"] += 1
    elif row.imported_hash != digest:
        for key, value in payload.items():
            setattr(row, key, value)
        row.imported_hash = digest
        stats["updated"] += 1
    else:
        stats["unchanged"] += 1
    db.flush()
    return row


def import_curriculum(db: Session, source: Path = DEFAULT_SOURCE) -> Dict[str, Dict[str, int]]:
    db.expire_all()  # see edits committed by other sessions (e.g. the admin API)
    data = load_source(source)
    stats = {k: {"created": 0, "updated": 0, "unchanged": 0, "skipped_admin_edited": 0, "skipped_pack_owned": 0}
             for k in ("tracks", "modules", "sections")}

    order_in_track = {mid: i for t in data["tracks"] for i, mid in enumerate(t["moduleIds"])}
    track_rows: Dict[str, models.CourseTrack] = {}
    for i, t in enumerate(data["tracks"]):
        track_rows[t["id"]] = _upsert(
            db, models.CourseTrack, {"slug": t["id"]}, _track_payload(t),
            {"sort_order": i}, stats["tracks"],
        )

    for m in data["modules"]:
        track = track_rows[m["trackId"]]
        module = _upsert(
            db, models.CourseModule, {"slug": m["id"]}, _module_payload(m),
            {"track_id": track.id, "sort_order": order_in_track.get(m["id"], len(order_in_track))},
            stats["modules"],
        )
        for i, s in enumerate(m["sections"]):
            _upsert(
                db, models.CourseSection, {"module_id": module.id, "slug": s["id"]},
                {"title": s["title"], "blocks": section_blocks(m["id"], s)},
                {"sort_order": i}, stats["sections"],
            )
    db.commit()
    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    args = parser.parse_args()

    from database import Base, SessionLocal, engine, ensure_schema
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    with SessionLocal() as db:
        print(json.dumps(import_curriculum(db, args.source), indent=2))


if __name__ == "__main__":
    main()
