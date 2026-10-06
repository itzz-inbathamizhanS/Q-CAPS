import json

import models
import seed_quizzes


def _write_quiz(tmp_path, questions, **extra):
    d = tmp_path / "Track-X"
    d.mkdir(exist_ok=True)
    quiz = {"module_id": "track_a_a1_computing_foundations", "title": "t", "passing_score_percent": 70, "questions": questions, **extra}
    (d / "q.json").write_text(json.dumps(quiz), encoding="utf-8")
    return tmp_path


def _item(**kw):
    return {"id": "x-q1", "prompt": "p?", "options": ["a", "b"], "correct_index": 1, **kw}


def test_sync_adds_drafted_tags_to_an_existing_database_without_touching_the_item(db, tmp_path):
    quiz_dir = _write_quiz(tmp_path, [_item()])
    seed_quizzes.seed(db, quiz_dir)
    row = db.get(models.QuizItem, "x-q1")
    row.prompt = "edited in the database"
    db.commit()

    _write_quiz(tmp_path, [_item(competency_id="PQC.6", depth="Apply", tag_status="proposed-unreviewed", correct_index=0)])
    result = seed_quizzes.sync_tags(db, quiz_dir)

    row = db.get(models.QuizItem, "x-q1")
    assert result == {"updated": 1, "not_in_database": 0}
    assert (row.competency_id, row.depth, row.tag_status) == ("PQC.6", "Apply", "proposed-unreviewed")
    assert row.prompt == "edited in the database"  # sync touches tags only
    assert row.correct_index == 1


def test_sync_is_idempotent_and_never_clears_a_tag(db, tmp_path):
    quiz_dir = _write_quiz(tmp_path, [_item(competency_id="PQC.6", depth="Apply")], tagging_status="proposed-unreviewed")
    seed_quizzes.seed(db, quiz_dir)
    assert db.get(models.QuizItem, "x-q1").tag_status == "proposed-unreviewed"  # file-level status (Track A style)

    assert seed_quizzes.sync_tags(db, quiz_dir)["updated"] == 0
    _write_quiz(tmp_path, [_item()])
    seed_quizzes.sync_tags(db, quiz_dir)
    assert db.get(models.QuizItem, "x-q1").competency_id == "PQC.6"


def test_new_content_items_are_left_to_seed(db, tmp_path):
    quiz_dir = _write_quiz(tmp_path, [_item(competency_id="PQC.6", depth="Apply")])
    assert seed_quizzes.sync_tags(db, quiz_dir) == {"updated": 0, "not_in_database": 1}
    assert db.get(models.QuizItem, "x-q1") is None


def test_real_content_tags_reach_the_bank(db):
    seed_quizzes.seed(db)
    items = db.query(models.QuizItem).all()
    tagged = [i for i in items if i.competency_id]
    assert len(tagged) >= 592
    assert all(i.depth and i.tag_status in ("proposed-unreviewed", "reviewed") for i in tagged)
    assert {i.tag_status for i in items if not i.competency_id} <= {None, "no-competency"}
