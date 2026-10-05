"""Server-side diagnostic (DIAG-A): fixed form, no key, no XP, pre/post purpose decided by the server."""
import pytest

import models
import seed_quizzes
from competency.seed import seed_competencies


@pytest.fixture
def bank(db):
    seed_quizzes.seed(db)
    seed_competencies(db)


def take(client, h, correct_by_prompt=None, all_first=False):
    """Start DIAG-A and submit every answer at once (the UI lets learners review before submitting)."""
    attempt = client.post("/api/quizzes/DIAG-A/attempts", headers=h).json()
    answers = []
    for q in attempt["questions"]:
        pos = 0 if all_first else q["options"].index(correct_by_prompt[q["prompt"]])
        answers.append({"item_id": q["item_id"], "selected_position": pos})
    result = client.post(f"/api/quizzes/attempts/{attempt['attempt_id']}/submit", headers=h, json={"answers": answers})
    return attempt, result


def key(db):
    import json
    return {i.prompt: json.loads(i.options_json)[i.correct_index] for i in db.query(models.QuizItem).filter_by(module_id="DIAG-A")}


def test_the_form_has_every_item_with_its_domain_and_no_answer_key(client, bank, learner):
    _, h = learner
    r = client.post("/api/quizzes/DIAG-A/attempts", headers=h)
    body = r.json()
    assert r.status_code == 200 and body["kind"] == "diagnostic" and body["attempt_purpose"] == "diagnostic_pre"
    assert body["total_questions"] == len(body["questions"]) == 10  # all items, not a sample
    assert {q["domain"] for q in body["questions"]} == {
        "Cybersecurity Fundamentals", "Cryptography Fundamentals", "PQC Fundamentals", "Applied PQC"}
    for forbidden in ("correct_index", "correct_position", "explanation", "correctoptionid"):
        assert forbidden not in r.text.lower()


def test_answers_get_no_feedback_during_the_diagnostic(client, bank, learner):
    _, h = learner
    attempt = client.post("/api/quizzes/DIAG-A/attempts", headers=h).json()
    q = attempt["questions"][0]
    fb = client.post(f"/api/quizzes/attempts/{attempt['attempt_id']}/answers", headers=h,
                     json={"item_id": q["item_id"], "selected_position": 0}).json()
    assert fb["correct"] is None and fb["correct_position"] is None and fb["explanation"] is None


def test_grading_is_server_side_awards_no_xp_and_keeps_course_records_clean(client, db, bank, learner):
    user, h = learner
    _, result = take(client, h, key(db))
    body = result.json()
    assert result.status_code == 200
    assert (body["correct_answers"], body["score_percent"], body["xp_awarded"]) == (10, 100.0, 0)
    assert all(i["correct_position"] is None for i in body["items"])  # reveal_answers is off for diagnostics
    db.refresh(user)
    assert user.xp == 0
    assert db.query(models.QuizScore).filter_by(user_id=user.id).count() == 0
    assert "DIAG-A" not in client.get("/api/activities/me", headers=h).json()["passed_modules"]


def test_first_diagnostic_is_the_pre_test_and_later_ones_are_post_tests(client, db, bank, learner):
    _, h = learner
    take(client, h, all_first=True)
    second = client.post("/api/quizzes/DIAG-A/attempts", headers=h).json()
    assert second["attempt_purpose"] == "diagnostic_post"


def test_an_abandoned_attempt_does_not_count_as_the_pre_test(client, bank, make_user):
    _, h = make_user("abandoner")
    client.post("/api/quizzes/DIAG-A/attempts", headers=h)
    assert client.post("/api/quizzes/DIAG-A/attempts", headers=h).json()["attempt_purpose"] == "diagnostic_pre"


def test_results_endpoint_reports_own_attempts_with_domain_breakdown(client, db, bank, make_user):
    user, h = make_user("diag-user")
    _, other_h = make_user("other-user")
    take(client, other_h, all_first=True)
    take(client, h, key(db))
    take(client, h, all_first=True)

    results = client.get("/api/diagnostic/results", headers=h).json()
    assert [r["attempt_purpose"] for r in results] == ["diagnostic_post", "diagnostic_pre"]  # newest first
    pre = results[1]
    assert pre["score_percent"] == 100.0 and pre["correct_answers"] == pre["total_questions"] == 10
    assert {d["domain"]: (d["correct_count"], d["total_questions"], d["percentage"]) for d in pre["domains"]} == {
        "Applied PQC": (2, 2, 100), "Cryptography Fundamentals": (3, 3, 100),
        "Cybersecurity Fundamentals": (2, 2, 100), "PQC Fundamentals": (3, 3, 100)}
    assert len(client.get("/api/diagnostic/results", headers=other_h).json()) == 1


def test_one_user_cannot_submit_another_users_attempt(client, bank, make_user):
    _, h1 = make_user("owner")
    _, h2 = make_user("intruder")
    attempt = client.post("/api/quizzes/DIAG-A/attempts", headers=h1).json()
    r = client.post(f"/api/quizzes/attempts/{attempt['attempt_id']}/submit", headers=h2, json={"answers": []})
    assert r.status_code == 404


def test_diagnostic_answers_are_capability_evidence(client, db, bank, learner):
    user, h = learner
    take(client, h, key(db))
    caps = {c["competency_code"]: c for c in client.get(f"/api/users/{user.id}/capabilities", headers=h).json()}
    # Ten items over seven competencies: each has fewer than 3 items, so every level stays Unknown.
    assert caps["PQC.1"]["knowledge_by_depth"]["aware_explain"]["total"] == 2
    assert {c["level"] for c in caps.values()} == {"Unknown"}


def test_results_require_authentication(client, bank):
    assert client.get("/api/diagnostic/results").status_code == 401
