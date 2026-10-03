"""Import a validated content pack (sections and quiz changes authored from the reference books).

Run from backend/main_api:
    python -m course_content.import_pack PACK.json [MORE.json ...] --actor ADMIN_NAME [--dry-run]

Rules
  - The pack must pass course_content.validate_pack with no errors, or nothing is written.
  - Everything for one pack happens in one transaction; an error rolls the whole pack back.
  - A section is matched by (module, slug). `replace` keeps the row id, so learner progress keyed on
    the section id survives; a replaced section with `after` is also moved to follow that section. Keep the id of every unchanged checkpoint block; a checkpoint that is
    removed or renamed no longer counts toward completion, and a checkpoint that is added makes a
    completed section incomplete again. The summary prints how many learners have progress on each
    replaced section so the effect is visible before it ships.
  - Rows are stamped imported_hash = "pack:<sha256>". import_curriculum leaves such rows alone, and
    re-running the same pack changes nothing. A row an admin edited (imported_hash NULL) is skipped
    unless --overwrite-admin-edits is given.
  - A modify entry may also carry `estimated_minutes` and `learning_objectives`, which update the module row
    (stamped pack-owned, so import_curriculum will not revert them).
  - Quiz questions are added to content/Quizzes/<track>/<module>.json (the source of truth) and the
    database is re-seeded from those files. A published question is never edited: retire it with
    `retire_quiz_items` (active: false) and add a new id.
  - Every write is recorded in content_audit_log under the --actor admin.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

import models
from .blocks import validate_blocks
from .quiz_files import DEFAULT_QUIZ_DIR, find_quiz_file, write_quiz_file
from .serializers import section_dict
from .validate_pack import Report, validate_pack

PACK_PREFIX = "pack:"


class PackError(Exception):
    pass


def _digest(payload: Dict[str, Any]) -> str:
    return PACK_PREFIX + hashlib.sha256(
        json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()


def _book_index(pack: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    return {b["id"]: b for b in pack["books"]}


def resolve_sources(raw: List[Dict[str, Any]], books: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Expand {book: 'B01', locator, note} into a self-contained reference for the lesson page."""
    out = []
    for src in raw:
        book = books[src["book"]]
        entry = {
            "book_id": book["id"], "title": book["title"], "authors": book["authors"],
            "edition": book.get("edition"), "year": book.get("year"), "publisher": book.get("publisher"),
            "locator": src["locator"].strip(),
        }
        if src.get("note"):
            entry["note"] = src["note"].strip()
        out.append({k: v for k, v in entry.items() if v is not None})
    return out


def _audit(db: Session, actor: models.User, action: str, entity_id: Optional[int], before: Any, after: Any):
    db.add(models.ContentAuditLog(
        actor_id=actor.id, action=action, entity_type="section", entity_id=entity_id,
        before=before, after=after,
    ))


def _affected_learners(db: Session, section_id: int) -> int:
    passes = {r[0] for r in db.query(models.CheckpointPass.user_id).filter_by(section_id=section_id)}
    done = {r[0] for r in db.query(models.SectionCompletion.user_id).filter_by(section_id=section_id)}
    return len(passes | done)


def _apply_order(db: Session, module: models.CourseModule, inserts: Dict[str, Optional[str]]) -> None:
    """Place new sections after their `after` section (or at the end), then renumber sort_order 0..n-1."""
    rows = db.query(models.CourseSection).filter_by(module_id=module.id).order_by(models.CourseSection.sort_order, models.CourseSection.id).all()
    order = [r for r in rows if r.slug not in inserts]
    by_slug = {r.slug: r for r in rows}
    for slug, after in inserts.items():  # dict keeps pack order
        row = by_slug[slug]
        if after is not None and after in {o.slug for o in order}:
            at = next(i for i, o in enumerate(order) if o.slug == after) + 1
        else:
            at = len(order)
        order.insert(at, row)
    for i, row in enumerate(order):
        row.sort_order = i


MODULE_FIELDS = ("estimated_minutes", "learning_objectives")


def _update_module_fields(db: Session, actor: models.User, module: models.CourseModule, mod: Dict[str, Any],
                          overwrite_admin: bool, stats: Dict[str, Any]) -> None:
    """Apply the module-level fields a pack may carry. The row is stamped pack-owned so that
    import_curriculum does not put the old values back."""
    fields = {k: mod[k] for k in MODULE_FIELDS if mod.get(k) is not None}
    if not fields:
        return
    digest = _digest(fields)
    if module.imported_hash == digest:
        return
    if module.imported_hash is None and not overwrite_admin:
        stats["skipped_admin_edited"].append(f"{mod['slug']} (module fields)")
        return
    before = {k: getattr(module, k) for k in fields}
    for k, v in fields.items():
        setattr(module, k, v)
    module.imported_hash = digest
    db.flush()
    db.add(models.ContentAuditLog(actor_id=actor.id, action="update", entity_type="module",
                                  entity_id=module.id, before=before, after=fields))
    stats["module_updated"].append(mod["slug"])


def _import_module(db: Session, actor: models.User, pack: Dict[str, Any], mod: Dict[str, Any],
                   overwrite_admin: bool, stats: Dict[str, Any]) -> None:
    module = db.query(models.CourseModule).filter_by(slug=mod["slug"]).first()
    if module is None:
        raise PackError(f"module '{mod['slug']}' is not in the database; run import_curriculum first")
    _update_module_fields(db, actor, module, mod, overwrite_admin, stats)
    books = _book_index(pack)
    inserts: Dict[str, Optional[str]] = {}
    for sec in mod.get("sections") or []:
        blocks = validate_blocks(sec["blocks"])
        payload = {
            "title": sec["title"].strip(), "summary": sec.get("summary"),
            "estimated_minutes": sec.get("estimated_minutes"), "blocks": blocks,
            "sources": resolve_sources(sec["sources"], books),
            "needs_verification": sec.get("needs_verification"),
        }
        digest = _digest(payload)
        row = db.query(models.CourseSection).filter_by(module_id=module.id, slug=sec["slug"]).first()
        key = f"{mod['slug']}/{sec['slug']}"
        if row is None:
            if sec["action"] == "replace":
                raise PackError(f"{key}: action 'replace' but the section is not in the database")
            row = models.CourseSection(module_id=module.id, slug=sec["slug"], status="published",
                                       sort_order=10_000, imported_hash=digest, **payload)
            db.add(row)
            db.flush()
            inserts[sec["slug"]] = sec.get("after")
            _audit(db, actor, "create", row.id, None, section_dict(row, public=False))
            stats["created"].append(key)
            continue
        if row.imported_hash == digest:
            stats["unchanged"].append(key)
            continue
        if row.imported_hash is None and not overwrite_admin:
            stats["skipped_admin_edited"].append(key)
            continue
        before = section_dict(row, public=False)
        for k, v in payload.items():
            setattr(row, k, v)
        row.imported_hash = digest
        db.flush()
        _audit(db, actor, "update", row.id, before, section_dict(row, public=False))
        if sec.get("after") is not None:
            inserts[sec["slug"]] = sec["after"]  # reposition; the row id (and so learner progress) is kept
        stats["replaced"].append({"section": key, "learners_with_progress": _affected_learners(db, row.id)})
    if inserts:
        _apply_order(db, module, inserts)


def _apply_quiz(pack: Dict[str, Any], mod: Dict[str, Any], quiz_dir: Path, stats: Dict[str, Any]) -> Optional[Path]:
    """Update the quiz JSON for one module in memory-checked fashion. Returns the file if it changed."""
    new_items = mod.get("quiz") or []
    retire = set(mod.get("retire_quiz_items") or [])
    if not new_items and not retire:
        return None
    found = find_quiz_file(mod["slug"], quiz_dir)
    if found is None:
        raise PackError(f"no quiz file for {mod['slug']}")
    path, data = found
    existing = {q["id"]: q for q in data["questions"]}
    changed = False
    for q in new_items:
        if q["id"] in existing:
            continue
        item = {"id": q["id"]}
        for tag in ("lesson_id", "competency_id", "depth"):
            if q.get(tag) is not None:
                item[tag] = q[tag]
        item.update(prompt=q["prompt"].strip(), options=[o.strip() for o in q["options"]],
                    correct_index=q["correct_index"], explanation=q["explanation"].strip(),
                    source=resolve_sources([q["source"]], _book_index(pack))[0])
        data["questions"].append(item)
        stats["quiz_added"].append(q["id"])
        changed = True
    for q in data["questions"]:
        if q["id"] in retire and q.get("active", True):
            q["active"] = False
            stats["quiz_retired"].append(q["id"])
            changed = True
    return (path, data) if changed else None


def import_pack(db: Session, pack: Dict[str, Any], actor_name: str, *, quiz_dir: Path = DEFAULT_QUIZ_DIR,
                overwrite_admin: bool = False, dry_run: bool = False, label: str = "pack") -> Dict[str, Any]:
    report = Report()
    validate_pack(pack, report, label, quiz_dir)
    if report.errors:
        raise PackError("pack is invalid:\n  " + "\n  ".join(report.errors))
    actor = db.query(models.User).filter(func.lower(models.User.name) == actor_name.lower()).first()
    if actor is None or actor.role != "admin":
        raise PackError(f"--actor '{actor_name}' must be an existing admin user")
    for m in pack["modules"]:
        if m["action"] == "new":
            raise PackError(f"{m['slug']}: importing brand-new modules is not supported yet")

    stats: Dict[str, Any] = {k: [] for k in
                             ("created", "replaced", "unchanged", "skipped_admin_edited", "module_updated", "quiz_added", "quiz_retired")}
    quiz_writes = []
    try:
        for m in pack["modules"]:
            if m["action"] == "keep":
                continue
            _import_module(db, actor, pack, m, overwrite_admin, stats)
            write = _apply_quiz(pack, m, quiz_dir, stats)
            if write:
                quiz_writes.append(write)
        if dry_run:
            db.rollback()
            return {**stats, "dry_run": True}
        db.commit()
    except Exception:
        db.rollback()
        raise
    if quiz_writes:
        import seed_quizzes
        for path, data in quiz_writes:
            write_quiz_file(path, data)
        seed_quizzes.seed(db, quiz_dir)
    return {**stats, "dry_run": False, "warnings": report.warnings}


def main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--actor", required=True, help="name of an existing admin user (recorded in the audit log)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--overwrite-admin-edits", action="store_true")
    args = parser.parse_args(argv)

    from database import Base, SessionLocal, engine, ensure_schema
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    code = 0
    with SessionLocal() as db:
        for path in args.files:
            try:
                pack = json.loads(path.read_text(encoding="utf-8"))
                result = import_pack(db, pack, args.actor, overwrite_admin=args.overwrite_admin_edits,
                                     dry_run=args.dry_run, label=path.name)
            except (OSError, json.JSONDecodeError, PackError) as exc:
                print(f"{path.name}: {exc}", file=sys.stderr)
                code = 1
                continue
            for w in result.get("warnings", []):
                print("warning:", w)
            print(f"{path.name}: " + json.dumps({k: (len(v) if isinstance(v, list) else v)
                                                 for k, v in result.items() if k != "warnings"}))
            for r in result["replaced"]:
                if r["learners_with_progress"]:
                    print(f"  note: {r['section']} has progress from {r['learners_with_progress']} learner(s)")
            for s in result["skipped_admin_edited"]:
                print(f"  skipped (edited by an admin): {s}")
    return code


if __name__ == "__main__":
    sys.exit(main())
