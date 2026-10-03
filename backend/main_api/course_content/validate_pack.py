"""Validate a content pack (JSON authored from books) before it is imported.

Run from backend/main_api:
    python -m course_content.validate_pack PACK.json [MORE.json ...]

Checks structure, source citations, block validity (the same validators the admin API uses),
the publish checklist, and that module/section slugs fit the existing course. Prints errors
and warnings; exit code 1 if there is any error. Nothing is written to the database.
"""
import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

from pydantic import ValidationError

from .api_schemas import SLUG
from .blocks import validate_blocks
from .checklist import failing, publish_checklist
from .import_curriculum import DEFAULT_SOURCE, load_source

ALLOWED_BLOCK_TYPES = {"text", "code", "callout", "checkpoint", "visual"}
# Visual components that exist in frontend/src/features/lesson/blocks/visualRegistry.ts. A test keeps
# this list in step with the registry. A pack may only use a visual whose component is built.
BUILT_VISUAL_KINDS = {"tls-handshake", "hash-avalanche"}
QUIZ_DIR = Path(__file__).resolve().parents[3] / "content" / "Quizzes"
LEVELS = {"Novice", "Beginner", "Intermediate", "Advanced", "Enterprise"}
MIN_TEXT_WORDS = 120
MODULE_KEYS = {
    "slug", "action", "continuation", "track", "code", "title", "level", "estimated_minutes",
    "learning_objectives", "prerequisites", "category", "sections", "quiz", "retire_quiz_items", "notes",
}
SECTION_KEYS = {
    "slug", "action", "after", "title", "summary", "estimated_minutes", "blocks", "sources",
    "needs_verification",
}
BOOK_KEYS = {"id", "title", "authors", "edition", "year", "publisher", "isbn"}
QUIZ_KEYS = {"id", "prompt", "options", "correct_index", "explanation", "source",
             "competency_id", "depth", "lesson_id"}
DEPTHS = {"Aware", "Explain", "Apply", "Analyse"}
QUIZ_ID = r"^[a-z0-9][a-z0-9_-]{1,39}$"


class Report:
    def __init__(self) -> None:
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def error(self, where: str, msg: str) -> None:
        self.errors.append(f"{where}: {msg}")

    def warn(self, where: str, msg: str) -> None:
        self.warnings.append(f"{where}: {msg}")


def _words(text: str) -> int:
    return len(re.findall(r"\w+", text))


def _unknown(report: Report, where: str, obj: Dict[str, Any], allowed: Set[str]) -> None:
    for key in obj:
        if key not in allowed:
            report.error(where, f"unknown field '{key}'")


def _check_sources(report: Report, where: str, sources: Any, books: Set[str]) -> None:
    if not isinstance(sources, list) or not sources:
        report.error(where, "every section needs at least one source")
        return
    for i, src in enumerate(sources):
        w = f"{where}.sources[{i}]"
        if not isinstance(src, dict):
            report.error(w, "must be an object")
            continue
        _unknown(report, w, src, {"book", "locator", "note"})
        if src.get("book") not in books:
            report.error(w, f"book '{src.get('book')}' is not listed in 'books'")
        if not str(src.get("locator", "")).strip():
            report.error(w, "locator (chapter and pages) is required")


def _check_section(report: Report, where: str, sec: Dict[str, Any], books: Set[str],
                   existing: Set[str], seen: Set[str]) -> None:
    _unknown(report, where, sec, SECTION_KEYS)
    slug = sec.get("slug", "")
    if not re.match(SLUG, str(slug)):
        report.error(where, f"slug '{slug}' must be lowercase letters, numbers, - or _")
    if slug in seen:
        report.error(where, f"duplicate section slug '{slug}' in this module")
    seen.add(slug)
    action = sec.get("action")
    if action not in ("new", "replace"):
        report.error(where, "action must be 'new' or 'replace'")
    elif action == "replace" and slug not in existing:
        report.error(where, f"action 'replace' but section '{slug}' does not exist in this module")
    elif action == "new" and slug in existing:
        report.error(where, f"action 'new' but section '{slug}' already exists; use 'replace'")
    after = sec.get("after")
    if after is not None and after not in existing and after not in seen:
        report.error(where, f"'after' refers to unknown section '{after}'")
    title = str(sec.get("title", "")).strip()
    if not title or len(title) > 200:
        report.error(where, "title is required (max 200 characters)")
    summary = sec.get("summary")
    if summary is not None and len(str(summary)) > 300:
        report.error(where, "summary is longer than 300 characters")
    minutes = sec.get("estimated_minutes")
    if minutes is not None and not (isinstance(minutes, int) and 1 <= minutes <= 600):
        report.error(where, "estimated_minutes must be a whole number from 1 to 600")

    raw_blocks = sec.get("blocks")
    if not isinstance(raw_blocks, list) or not raw_blocks:
        report.error(where, "blocks must be a non-empty list")
    else:
        bad_types = {b.get("type") for b in raw_blocks if isinstance(b, dict)} - ALLOWED_BLOCK_TYPES
        if bad_types:
            report.error(where, f"block types not allowed in a pack: {sorted(map(str, bad_types))} "
                                f"(use {sorted(ALLOWED_BLOCK_TYPES)})")
        for b in raw_blocks:
            if isinstance(b, dict) and b.get("type") == "visual" and b.get("kind") not in BUILT_VISUAL_KINDS:
                report.error(where, f"visual kind '{b.get('kind')}' has no built component "
                                    f"(built: {sorted(BUILT_VISUAL_KINDS)})")
        try:
            blocks = validate_blocks(raw_blocks)
        except (ValidationError, ValueError) as exc:
            report.error(where, f"invalid blocks: {str(exc).splitlines()[0:6]}")
            blocks = []
        if blocks:
            for item in failing(publish_checklist(title, blocks)):
                report.error(where, f"publish checklist: {item['label']}. {item['detail'] or ''}".strip())
            text_words = sum(_words(b["markdown"]) for b in blocks if b["type"] == "text")
            if text_words == 0:
                report.error(where, "a section needs at least one text block")
            elif text_words < MIN_TEXT_WORDS:
                report.warn(where, f"only {text_words} words of text (aim for {MIN_TEXT_WORDS}+)")
            for b in blocks:
                text = b.get("markdown") or b.get("text") or ""
                if re.search(r'"[^"\n]{160,}"', text) or re.search(r"“[^”\n]{160,}”", text):
                    report.warn(where, "a long quotation: paraphrase instead of copying from the book")
    _check_sources(report, where, sec.get("sources"), books)

    nv = sec.get("needs_verification")
    if nv is not None and not (isinstance(nv, dict) and str(nv.get("reason", "")).strip()):
        report.error(where, "needs_verification must be an object with a non-empty 'reason'")


def _competency_ids() -> Set[str]:
    path = Path(__file__).resolve().parents[3] / "content" / "curriculum" / "competency_model.json"
    model = json.loads(path.read_text(encoding="utf-8"))
    return {c["id"] for d in model["domains"] for c in d["competencies"]}


def _lesson_ids() -> Set[str]:
    path = Path(__file__).resolve().parents[3] / "content" / "curriculum" / "track_a_lessons.json"
    return {l["lesson_id"] for l in json.loads(path.read_text(encoding="utf-8"))["lessons"]}


def _check_quiz(report: Report, where: str, quiz: Any, books: Set[str], module_slug: str,
                retire: List[str], quiz_dir: Path = None) -> None:
    """`quiz` lists NEW items to add to the module's existing quiz; `retire` lists ids to retire."""
    from .quiz_files import DEFAULT_QUIZ_DIR, find_quiz_file, same_item

    found = find_quiz_file(module_slug, quiz_dir or DEFAULT_QUIZ_DIR)
    if found is None:
        report.error(where, f"no quiz file for module '{module_slug}' under content/Quizzes")
        return
    existing = {q["id"]: q for q in found[1]["questions"]}
    if quiz is not None and (not isinstance(quiz, list) or not (3 <= len(quiz) <= 12)):
        report.error(where, "quiz must list 3 to 12 NEW questions to add to the existing quiz")
        quiz = []
    competencies, lessons = _competency_ids(), _lesson_ids()
    seen: Set[str] = set()
    added = 0
    for i, q in enumerate(quiz or []):
        w = f"{where}[{i}]"
        if not isinstance(q, dict):
            report.error(w, "must be an object")
            continue
        _unknown(report, w, q, QUIZ_KEYS)
        qid = str(q.get("id", ""))
        if not re.match(QUIZ_ID, qid):
            report.error(w, "id is required (lowercase letters, numbers, - or _)")
        elif qid in seen:
            report.error(w, f"duplicate id {qid} in this pack")
        else:
            seen.add(qid)
            if qid in existing:
                if not same_item(existing[qid], q):
                    report.error(w, f"id {qid} already exists with different content; retire it and use a new id")
            else:
                added += 1
        opts = q.get("options")
        if not str(q.get("prompt", "")).strip():
            report.error(w, "prompt is required")
        if not isinstance(opts, list) or not (3 <= len(opts) <= 5) or any(not str(o).strip() for o in opts):
            report.error(w, "options must be 3 to 5 non-empty strings")
        elif len({str(o).strip().lower() for o in opts}) != len(opts):
            report.error(w, "options must be different from each other")
        elif not isinstance(q.get("correct_index"), int) or not (0 <= q["correct_index"] < len(opts)):
            report.error(w, "correct_index must point at one of the options")
        if not str(q.get("explanation", "")).strip():
            report.error(w, "explanation is required")
        tags = [q.get("competency_id"), q.get("depth"), q.get("lesson_id")]
        if any(t is not None for t in tags):
            if any(t is None for t in tags):
                report.error(w, "competency_id, depth and lesson_id must be set together")
            else:
                if q["competency_id"] not in competencies:
                    report.error(w, f"unknown competency_id {q['competency_id']}")
                if q["depth"] not in DEPTHS:
                    report.error(w, f"depth must be one of {sorted(DEPTHS)}")
                if q["lesson_id"] not in lessons:
                    report.error(w, f"unknown lesson_id {q['lesson_id']}")
        _check_sources(report, w, [q["source"]] if isinstance(q.get("source"), dict) else None, books)
    for rid in retire:
        if rid not in existing:
            report.error(where, f"cannot retire '{rid}': no such question in the quiz")
    active_after = (
        sum(1 for qid, q in existing.items() if q.get("active", True) and qid not in retire) + added
    )
    if active_after < 5:
        report.error(where, f"the quiz would have {active_after} active questions; it needs at least 5")


def validate_pack(data: Any, report: Report, label: str = "pack", quiz_dir: Path = None) -> Tuple[int, int]:
    """Returns (modules, sections) checked."""
    course = load_source(DEFAULT_SOURCE)
    tracks = {t["id"] for t in course["tracks"]}
    modules = {m["id"]: m for m in course["modules"]}
    if not isinstance(data, dict):
        report.error(label, "top level must be an object")
        return 0, 0
    _unknown(report, label, data, {"pack_version", "books", "modules"})
    if data.get("pack_version") != 1:
        report.error(label, "pack_version must be 1")

    books: Set[str] = set()
    for i, b in enumerate(data.get("books") or []):
        w = f"{label}.books[{i}]"
        if not isinstance(b, dict):
            report.error(w, "must be an object")
            continue
        _unknown(report, w, b, BOOK_KEYS)
        if not re.match(r"^B\d{2,3}$", str(b.get("id", ""))):
            report.error(w, "id must look like B01")
        elif b["id"] in books:
            report.error(w, f"duplicate book id {b['id']}")
        else:
            books.add(b["id"])
        for key in ("title", "authors"):
            if not str(b.get(key, "")).strip():
                report.error(w, f"{key} is required")
        if b.get("year") is not None and not isinstance(b["year"], int):
            report.error(w, "year must be a number")
    if not books:
        report.error(label, "books must list every book that is cited")

    mods = data.get("modules")
    if not isinstance(mods, list) or not mods:
        report.error(label, "modules must be a non-empty list")
        return 0, 0
    pack_slugs = {m.get("slug") for m in mods if isinstance(m, dict)}
    n_sections = 0
    for mi, m in enumerate(mods):
        w = f"{label}.modules[{mi}]"
        if not isinstance(m, dict):
            report.error(w, "must be an object")
            continue
        _unknown(report, w, m, MODULE_KEYS)
        slug = m.get("slug", "")
        w = f"{label}.module[{slug}]"
        if not re.match(SLUG, str(slug)):
            report.error(w, f"slug '{slug}' is invalid")
        action = m.get("action")
        if action not in ("keep", "modify", "new"):
            report.error(w, "action must be 'keep', 'modify' or 'new'")
        exists = slug in modules
        if action in ("keep", "modify") and not exists:
            report.error(w, "action says existing module but no module has this slug (see CURRENT_STRUCTURE.md)")
        if action == "new":
            if exists:
                report.error(w, "action 'new' but a module with this slug already exists")
            if m.get("track") not in tracks:
                report.error(w, f"new modules need 'track' to be one of {sorted(tracks)}")
            for key in ("code", "title", "level", "estimated_minutes", "learning_objectives"):
                if m.get(key) in (None, "", []):
                    report.error(w, f"new modules need '{key}'")
        if m.get("level") is not None and m["level"] not in LEVELS:
            report.error(w, f"level must be one of {sorted(LEVELS)}")
        minutes = m.get("estimated_minutes")
        if minutes is not None and not (isinstance(minutes, int) and not isinstance(minutes, bool) and 1 <= minutes <= 1000):
            report.error(w, "estimated_minutes must be a whole number from 1 to 1000")
        objectives = m.get("learning_objectives")
        if objectives is not None and not (isinstance(objectives, list) and 3 <= len(objectives) <= 8):
            report.error(w, "learning_objectives must list 3 to 8 items")
        for p in m.get("prerequisites") or []:
            if p not in modules and p not in pack_slugs:
                report.error(w, f"prerequisite '{p}' is not an existing or packed module")
        if m.get("continuation") and action == "new":
            report.error(w, "a continuation cannot create a module; use action 'modify'")

        existing_sections = {s["id"] for s in modules[slug]["sections"]} if exists else set()
        seen: Set[str] = set()
        sections = m.get("sections") or []
        if action != "keep" and not sections and m.get("quiz") is None and not m.get("retire_quiz_items"):
            report.error(w, "nothing to import: add sections or a quiz, or use action 'keep'")
        for si, sec in enumerate(sections):
            if not isinstance(sec, dict):
                report.error(f"{w}.sections[{si}]", "must be an object")
                continue
            _check_section(report, f"{w}.section[{sec.get('slug', si)}]", sec, books, existing_sections, seen)
            n_sections += 1
        retire = m.get("retire_quiz_items") or []
        if not isinstance(retire, list) or any(not isinstance(r, str) for r in retire):
            report.error(w, "retire_quiz_items must be a list of question ids")
            retire = []
        if m.get("quiz") is not None or retire:
            if action == "new":
                report.error(w, "quiz changes apply to existing modules only")
            elif exists:
                _check_quiz(report, f"{w}.quiz", m.get("quiz"), books, slug, retire, quiz_dir)
        if action == "new" and not 4 <= len(sections) <= 14:
            report.warn(w, f"{len(sections)} sections (aim for 6 to 12)")
    return len(mods), n_sections


def main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args(argv)

    report = Report()
    totals = [0, 0]
    for path in args.files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            report.error(str(path), f"cannot read as JSON: {exc}")
            continue
        m, s = validate_pack(data, report, path.name)
        totals[0] += m
        totals[1] += s
    for line in report.warnings:
        print("warning:", line)
    for line in report.errors:
        print("ERROR:  ", line)
    print(f"\n{totals[0]} module entries, {totals[1]} sections: "
          f"{len(report.errors)} errors, {len(report.warnings)} warnings")
    return 1 if report.errors else 0


if __name__ == "__main__":
    sys.exit(main())
