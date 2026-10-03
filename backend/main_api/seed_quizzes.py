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
            # Never overwrite tags that curriculum tagging has already set.
            for field in ("competency_id", "depth", "lesson_id"):
                if q.get(field) is not None:
                    setattr(row, field, q[field])
            items += 1
    db.commit()
    return {"modules": modules, "items": items}


def seed_if_empty(db: Session) -> dict | None:
    if db.query(models.QuizItem).first() is not None:
        return None
    return seed(db)


if __name__ == "__main__":
    from database import Base, SessionLocal, engine

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        print(seed(session))
