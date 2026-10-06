"""One explainable recommendation engine (recommendation.py): gap tier, score tier, no evidence."""
from datetime import datetime

import pytest

import models
import seed_quizzes
from competency.seed import seed_competencies
from course_content.import_curriculum import DEFAULT_SOURCE, import_curriculum
from recommendation import get_user_recommendation
from test_scan_assets import HSTS, KEX, full_result
from test_scanner_v2_backend import post_log


@pytest.fixture
def content(db):
    import_curriculum(db, DEFAULT_SOURCE)
    seed_quizzes.seed(db)
    seed_competencies(db)


def set_level(db, user, code, level):
    comp = db.query(models.Competency).filter_by(code=code).one()
    db.add(models.LearnerCapability(user_id=user.id, competency_id=comp.id, level=level, evidence_count=5))
    db.commit()


def pass_all_modules_except(db, user, *keep_locked):
    for n, (slug,) in enumerate(db.query(models.CourseModule.slug)):
        if slug in keep_locked:
            continue
        db.add(models.QuizAttempt(id=f"p-{user.id}-{n}", user_id=user.id, module_id=slug, status="graded", form_json="[]",
                                  passing_score_percent=70, issued_at=datetime(2026, 9, 1), total_questions=1, passed=True))
    db.commit()


def reason(rec, kind):
    return next(r for r in rec["reasons"] if r["type"] == kind)


def test_a_gap_from_a_finding_drives_the_recommendation_and_is_explained(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")  # requirements met: only PQC.6 remains
    set_level(db, user, "PQC.6", "Beginner")
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    assert rec["engine"] == "gap" and rec["status"] == "recommendation"
    assert rec["course_id"] == "track_d_e4_crypto_agility"  # most PQC.6 Aware/Explain items
    assert rec["priority"] == "High"  # Proficient(3) - Beginner(1) = 2
    gap = reason(rec, "gap")
    assert (gap["competency"], gap["required"], gap["demonstrated"], gap["gap_class"]) == ("PQC.6", "Proficient", "Beginner", "high")
    assert gap["finding_title"] == "Key exchange is not post-quantum protected"
    assert reason(rec, "teaches")["module_id"] == "track_d_e4_crypto_agility"
    assert reason(rec, "model_status")["requirement_map_status"] == "proposed-unreviewed"
    assert "Key exchange is not post-quantum protected" in rec["reason"] and "Beginner" in rec["reason"]
    assert rec["quiz_score"] is None and rec["graph_paths"] == []


def test_unassessed_competency_asks_for_an_assessment_not_a_score(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    pass_all_modules_except(db, user)
    rec = get_user_recommendation(db, user.id)
    assert rec["priority"] == "Unassessed"
    assert rec["recommendations"][0]["action"] == "assess"
    assert reason(rec, "unassessed")["demonstrated"] == "Unknown"
    assert "not been assessed" in rec["reason"]


def test_a_locked_module_is_replaced_by_its_open_prerequisite(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")
    set_level(db, user, "PQC.6", "Beginner")
    pass_all_modules_except(db, user, "track_d_e3_quantum_readiness_assessment")  # E4's prerequisite

    rec = get_user_recommendation(db, user.id)
    assert rec["course_id"] == "track_d_e3_quantum_readiness_assessment"
    prereq = reason(rec, "prerequisite")
    assert (prereq["module_id"], prereq["unlocks"]) == ("track_d_e3_quantum_readiness_assessment", "track_d_e4_crypto_agility")
    assert "prerequisite" in rec["reason"]


def test_developing_towards_proficient_recommends_a_practical(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([KEX]))
    for code in ("NET.4", "PQC.1", "PQC.3"):
        set_level(db, user, code, "Advanced")
    set_level(db, user, "PQC.6", "Developing")
    pass_all_modules_except(db, user)

    rec = get_user_recommendation(db, user.id)
    top = rec["recommendations"][0]
    assert top["action"] == "practice" and top["practical"]["depth"] in ("Apply", "Analyse")
    assert reason(rec, "practical")["competency"] == "PQC.6"


def test_met_requirements_fall_back_to_scores_without_a_stand_in(client, db, content, learner):
    user, h = learner
    post_log(client, user, h, full_result([HSTS]))  # unmapped finding: no requirement
    db.add(models.QuizScore(user_id=user.id, topic="quantum_fundamentals", score=95, correct_answers=19, total_questions=20))
    db.add(models.QuizScore(user_id=user.id, topic="practical_security", score=90, correct_answers=18, total_questions=20))
    db.commit()

    rec = get_user_recommendation(db, user.id)
    assert rec["engine"] == "score"
    assert rec["topic"] == "pqc" and rec["quiz_score"] is None
    assert rec["reasons"][0]["type"] == "not_attempted"


def test_no_evidence_is_reported_as_such(db, content, learner):
    user, _ = learner
    rec = get_user_recommendation(db, user.id)
    assert (rec["status"], rec["engine"], rec["priority"]) == ("no_evidence", "none", "Unknown")
    assert rec["reasons"] == [{"type": "no_evidence"}]


def test_endpoint_returns_reasons_and_stays_private(client, db, content, make_user):
    user, h = make_user("rec-owner")
    other, _ = make_user("someone")
    post_log(client, user, h, full_result([KEX]))
    body = client.get(f"/api/users/{user.id}/recommendation", headers=h).json()
    assert body["engine"] == "gap" and body["reasons"] and body["recommendations"]
    assert client.get(f"/api/users/{other.id}/recommendation", headers=h).status_code == 403
