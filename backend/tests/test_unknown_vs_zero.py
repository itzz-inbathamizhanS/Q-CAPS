"""No evidence must be reported as unknown, never as a score of 0 or as 'Strong'.

Project rule: do not treat "no assessment data" as a low or a good skill level.
"""
import models


def test_profile_readiness_is_null_without_quiz_evidence(client, learner):
    user, headers = learner
    res = client.get(f"/api/users/{user.id}/profile", headers=headers)
    assert res.status_code == 200
    assert res.json()["readiness_score"] is None


def test_profile_readiness_is_a_number_once_a_quiz_is_recorded(client, learner, db):
    user, headers = learner
    db.add(models.QuizScore(user_id=user.id, topic="pqc", score=0.0, correct_answers=0, total_questions=5))
    db.commit()
    body = client.get(f"/api/users/{user.id}/profile", headers=headers).json()
    assert body["readiness_score"] == 0  # a real, failed assessment is a genuine 0, not unknown


def test_recommendation_without_evidence_is_not_strong(client, learner):
    user, headers = learner
    body = client.get(f"/api/users/{user.id}/recommendation", headers=headers).json()
    assert body["status"] == "no_evidence"
    assert body["priority"] != "Strong"
    assert "No assessment" in body["reason"]


def test_recommendation_with_every_topic_strong_is_strong(client, learner, db):
    user, headers = learner
    for topic in ("quantum_fundamentals", "pqc", "practical_security"):
        db.add(models.QuizScore(user_id=user.id, topic=topic, score=100.0, correct_answers=5, total_questions=5))
    db.commit()
    body = client.get(f"/api/users/{user.id}/recommendation", headers=headers).json()
    assert body["status"] == "no_major_skill_gap"
    assert body["priority"] == "Strong"


def test_recommendation_response_keeps_graph_paths(client, learner):
    user, headers = learner
    body = client.get(f"/api/users/{user.id}/recommendation", headers=headers).json()
    assert "graph_paths" in body and isinstance(body["graph_paths"], list)


def test_weak_quiz_topic_is_not_reported_as_no_gap(client, learner, db):
    """The graph engine only knows modelled findings; failing quizzes must still produce a recommendation."""
    user, headers = learner
    db.add(models.QuizScore(user_id=user.id, topic="pqc", score=20.0, correct_answers=1, total_questions=5))
    db.commit()
    body = client.get(f"/api/users/{user.id}/recommendation", headers=headers).json()
    assert body["status"] == "recommendation"
    assert body["course_id"] == "track_b_b9_pqc_fundamentals"
    assert body["priority"] == "Critical"
