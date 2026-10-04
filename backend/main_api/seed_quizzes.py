"""Load quiz content into the server-side item bank.

Usage:  python seed_quizzes.py            (idempotent upsert from content/Quizzes)

Answer keys are written to the database only; nothing here is served to clients.
"""
import json
import os
from pathlib import Path

from sqlalchemy.orm import Session

import models

HERE = Path(__file__).resolve().parent
QUIZ_DIR = Path(os.getenv("QCAPS_QUIZ_DIR", HERE.parents[1] / "content" / "Quizzes"))
TOPICS_FILE = HERE / "seed_data" / "module_topics.json"


def _validate(module_id: str, quiz: dict, topics: dict) -> None:
    if module_id not in topics:
        raise ValueError(f"{module_id}: no topic in module_topics.json")
    seen = set()
    for q in quiz["questions"]:
        n = len(q["options"])
        if n < 2:
            raise ValueError(f"{q['id']}: needs at least 2 options")
        if not 0 <= q["correct_index"] < n:
            raise ValueError(f"{q['id']}: correct_index out of range")
        if q["id"] in seen:
            raise ValueError(f"{q['id']}: duplicate id in {module_id}")
        seen.add(q["id"])
    if not any(q.get("active", True) for q in quiz["questions"]):
        raise ValueError(f"{module_id}: every question is retired; a quiz needs at least one active question")


def seed(db: Session, quiz_dir: Path = QUIZ_DIR) -> dict:
    topics = json.loads(TOPICS_FILE.read_text(encoding="utf-8"))
    files = sorted(quiz_dir.glob("*/*.json"))
    if not files:
        raise FileNotFoundError(f"No quiz files under {quiz_dir}")

    modules = items = 0
    for path in files:
        quiz = json.loads(path.read_text(encoding="utf-8"))
        module_id = quiz["module_id"]
        _validate(module_id, quiz, topics)

        mod = db.get(models.QuizModule, module_id)
        if mod is None:
            mod = models.QuizModule(module_id=module_id)
            db.add(mod)
        mod.title = quiz["title"]
        mod.difficulty = quiz.get("difficulty")
        mod.passing_score_percent = quiz.get("passing_score_percent", 70)
        mod.topic = topics[module_id]
        if mod.reveal_answers is None:
            mod.reveal_answers = True
        modules += 1

        for q in quiz["questions"]:
            row = db.get(models.QuizItem, q["id"])
            if row is None:
                row = models.QuizItem(id=q["id"], active=True)
                db.add(row)
            row.module_id = module_id
            row.prompt = q["prompt"]
            row.options_json = json.dumps(q["options"])
            row.correct_index = q["correct_index"]
            row.explanation = q.get("explanation")
            # A retired question stays in the table (past responses reference it) but is never issued.
            if "active" in q:
                row.active = bool(q["active"])
            _apply_tags(row, q, quiz)
            items += 1
    db.commit()
    return {"modules": modules, "items": items}


TAG_FIELDS = ("competency_id", "depth", "lesson_id", "tag_status")


def _content_tags(q: dict, quiz: dict) -> dict:
    """The curriculum tags of one content item. Track A files carry the review status at file level
    (tagging_status); drafted items elsewhere carry it per item (tag_status)."""
    tags = {f: q.get(f) for f in ("competency_id", "depth", "lesson_id")}
    tags["tag_status"] = q.get("tag_status") or (quiz.get("tagging_status") if q.get("competency_id") else None)
    return tags


def _apply_tags(row: models.QuizItem, q: dict, quiz: dict) -> bool:
    """Copy content tags onto the row. A field the content leaves empty never clears a value already set."""
    changed = False
    for field, value in _content_tags(q, quiz).items():
        if value is not None and getattr(row, field) != value:
            setattr(row, field, value)
            changed = True
    return changed


def sync_tags(db: Session, quiz_dir: Path = QUIZ_DIR) -> dict:
    """Bring competency tags of existing items in line with the content files, without touching prompts,
    options or answer keys. Runs on every start so tags drafted after a database was seeded reach it."""
    rows = {r.id: r for r in db.query(models.QuizItem).all()}
    updated = missing = 0
    for path in sorted(quiz_dir.glob("*/*.json")):
        quiz = json.loads(path.read_text(encoding="utf-8"))
        for q in quiz["questions"]:
            row = rows.get(q["id"])
            if row is None:
                missing += 1  # new items arrive through seed(), which also validates them
                continue
            updated += _apply_tags(row, q, quiz)
    db.commit()
    return {"updated": updated, "not_in_database": missing}


def seed_if_empty(db: Session) -> dict | None:
    if db.query(models.QuizItem).first() is not None:
        return None
    return seed(db)


if __name__ == "__main__":
    from database import Base, SessionLocal, engine

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        print(seed(session))
