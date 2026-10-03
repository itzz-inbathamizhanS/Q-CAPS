"""Server-authoritative quiz issuing and grading.

The client never receives answer keys. A form is issued once, stored with the exact
option order shown, and graded against that stored order, so scores cannot be forged
from the browser.
"""
import json
import random
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

import models

MAX_FORM_ITEMS = 15
ATTEMPT_TTL = timedelta(hours=2)
XP_PER_FIRST_CORRECT = 50  # preserves the existing 50 XP/correct concept, once per item per user

_rng = random.SystemRandom()


class QuizError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


def _now() -> datetime:
    # SQLite returns naive datetimes; keep everything naive UTC for comparisons.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _load_open_attempt(db: Session, user: models.User, attempt_id: str) -> models.QuizAttempt:
    attempt = db.get(models.QuizAttempt, attempt_id)
    # Same response for "missing" and "someone else's" so attempt ids can't be probed.
    if attempt is None or attempt.user_id != user.id:
        raise QuizError(404, "Attempt not found")
    if attempt.status != "issued":
        raise QuizError(409, "Attempt has already been submitted or has expired")
    if _now() - attempt.issued_at > ATTEMPT_TTL:
        attempt.status = "expired"
        db.commit()
        raise QuizError(410, "Attempt has expired; start a new one")
    return attempt


def _validate_position(entry: dict, item_id: str, position: int) -> None:
    if position >= len(entry["order"]):
        raise QuizError(422, f"Invalid option for question {item_id}")


def record_answer(db: Session, user: models.User, attempt_id: str, item_id: str, position: int) -> dict:
    """Record and lock one answer, returning feedback. An answer cannot be changed once recorded."""
    attempt = _load_open_attempt(db, user, attempt_id)
    form_by_item = {e["item_id"]: e for e in json.loads(attempt.form_json)}
    entry = form_by_item.get(item_id)
    if entry is None:
        raise QuizError(422, f"Question {item_id} is not part of this attempt")
    _validate_position(entry, item_id, position)
    if (
        db.query(models.QuizResponse.id)
        .filter(models.QuizResponse.attempt_id == attempt_id, models.QuizResponse.item_id == item_id)
        .first()
    ):
        raise QuizError(409, f"Question {item_id} was already answered")

    item = db.get(models.QuizItem, item_id)
    module = db.get(models.QuizModule, attempt.module_id)
    selected_original = entry["order"][position]
    is_correct = selected_original == item.correct_index
    db.add(models.QuizResponse(
        attempt_id=attempt.id, user_id=user.id, item_id=item_id,
        selected_original_index=selected_original, is_correct=is_correct,
    ))
    db.commit()

    if not module.reveal_answers:
        return {"item_id": item_id, "recorded": True, "correct": None,
                "correct_position": None, "explanation": None}
    return {"item_id": item_id, "recorded": True, "correct": is_correct,
            "correct_position": entry["order"].index(item.correct_index),
            "explanation": item.explanation}


def issue_attempt(db: Session, user: models.User, module_id: str) -> dict:
    module = db.get(models.QuizModule, module_id)
    if module is None:
        raise QuizError(404, "Quiz not found")

    items = (
        db.query(models.QuizItem)
        .filter(models.QuizItem.module_id == module_id, models.QuizItem.active.is_(True))
        .all()
    )
    if not items:
        raise QuizError(404, "Quiz has no active questions")

    items = _rng.sample(items, min(len(items), MAX_FORM_ITEMS))  # also shuffles question order

    form, questions = [], []
    for item in items:
        options = json.loads(item.options_json)
        order = list(range(len(options)))
        _rng.shuffle(order)
        form.append({"item_id": item.id, "order": order})
        questions.append({
            "item_id": item.id,
            "prompt": item.prompt,
            "options": [options[i] for i in order],
        })

    issued_at = _now()
    attempt = models.QuizAttempt(
        id=uuid4().hex,
        user_id=user.id,
        module_id=module_id,
        status="issued",
        form_json=json.dumps(form),
        passing_score_percent=module.passing_score_percent,
        issued_at=issued_at,
        total_questions=len(form),
    )
    db.add(attempt)
    db.commit()

    return {
        "attempt_id": attempt.id,
        "module_id": module_id,
        "title": module.title,
        "passing_score_percent": module.passing_score_percent,
        "total_questions": len(form),
        "issued_at": issued_at,
        "expires_at": issued_at + ATTEMPT_TTL,
        "questions": questions,
    }


def grade_attempt(db: Session, user: models.User, attempt_id: str, answers: list) -> dict:
    """Finalise an attempt. Answers already recorded via record_answer are used as-is;
    any remaining items may be supplied here, and anything still missing counts as incorrect."""
    attempt = _load_open_attempt(db, user, attempt_id)
    form = json.loads(attempt.form_json)
    form_by_item = {entry["item_id"]: entry for entry in form}

    recorded = {
        r.item_id: r
        for r in db.query(models.QuizResponse).filter(models.QuizResponse.attempt_id == attempt_id).all()
    }

    supplied = {}
    for ans in answers:
        if ans.item_id not in form_by_item:
            raise QuizError(422, f"Question {ans.item_id} is not part of this attempt")
        if ans.item_id in supplied or ans.item_id in recorded:
            raise QuizError(422, f"Question {ans.item_id} was answered more than once")
        _validate_position(form_by_item[ans.item_id], ans.item_id, ans.selected_position)
        supplied[ans.item_id] = ans.selected_position

    # Claim the attempt atomically so a double submit cannot grade (and award XP) twice.
    claimed = (
        db.query(models.QuizAttempt)
        .filter(models.QuizAttempt.id == attempt_id, models.QuizAttempt.status == "issued")
        .update({"status": "graded"}, synchronize_session=False)
    )
    if claimed != 1:
        db.rollback()
        raise QuizError(409, "Attempt has already been submitted or has expired")

    module = db.get(models.QuizModule, attempt.module_id)
    item_ids = list(form_by_item)
    items = {row.id: row for row in db.query(models.QuizItem).filter(models.QuizItem.id.in_(item_ids)).all()}

    # Only earlier attempts count as "already earned"; this attempt's own rows are excluded.
    prior_correct = {
        row[0]
        for row in db.query(models.QuizResponse.item_id)
        .filter(
            models.QuizResponse.user_id == user.id,
            models.QuizResponse.is_correct.is_(True),
            models.QuizResponse.item_id.in_(item_ids),
            models.QuizResponse.attempt_id != attempt_id,
        )
        .all()
    }

    results, correct_count, first_time_correct = [], 0, 0
    for entry in form:
        item = items[entry["item_id"]]
        order = entry["order"]
        resp = recorded.get(item.id)
        if resp is None:
            pos = supplied.get(item.id)
            selected_original = order[pos] if pos is not None else None
            resp = models.QuizResponse(
                attempt_id=attempt.id, user_id=user.id, item_id=item.id,
                selected_original_index=selected_original,
                is_correct=selected_original == item.correct_index,
            )
            db.add(resp)
        selected_original = resp.selected_original_index
        pos = order.index(selected_original) if selected_original is not None else None
        if resp.is_correct:
            correct_count += 1
            if item.id not in prior_correct:
                first_time_correct += 1
        result = {"item_id": item.id, "selected_position": pos, "correct": bool(resp.is_correct),
                  "correct_position": None, "explanation": None}
        if module.reveal_answers:
            result["correct_position"] = order.index(item.correct_index)
            result["explanation"] = item.explanation
        results.append(result)

    total = len(form)
    score = round(correct_count / total * 100, 2)
    passed = score >= attempt.passing_score_percent
    xp = first_time_correct * XP_PER_FIRST_CORRECT
    graded_at = _now()

    attempt.correct_answers = correct_count
    attempt.score_percent = score
    attempt.passed = passed
    attempt.graded_at = graded_at
    attempt.xp_awarded = xp
    user.xp = (user.xp or 0) + xp

    # Keep the legacy score table populated so recommendations and readiness keep working.
    db.add(models.QuizScore(
        user_id=user.id, topic=module.topic, score=score,
        correct_answers=correct_count, total_questions=total,
    ))
    db.commit()

    return {
        "attempt_id": attempt.id,
        "module_id": attempt.module_id,
        "total_questions": total,
        "correct_answers": correct_count,
        "score_percent": score,
        "passed": passed,
        "passing_score_percent": attempt.passing_score_percent,
        "xp_awarded": xp,
        "graded_at": graded_at,
        "items": results,
    }
