"""Practice labs and missions: the server grades answers, replays missions and awards XP once."""
import json

import pytest

import models
from activities import catalogue
from activities.routes import lab_limiter, run_limiter


@pytest.fixture(autouse=True)
def _reset_limiter():
    lab_limiter.reset()
    run_limiter.reset()
    yield


def lab():
    return next(iter(catalogue._load()["labs"].values()))


def correct_and_wrong(scenario):
    right = next(c for c in scenario["choices"] if c["correct"])
    wrong = next(c for c in scenario["choices"] if not c["correct"])
    return right, wrong


def age_attempts(db, seconds=120):
    """Move earlier lab attempts into the past so the cooldown after a wrong answer has passed."""
    from datetime import datetime, timedelta, timezone
    for row in db.query(models.ActivityAttempt).all():
        row.created_at = datetime.now(timezone.utc) - timedelta(seconds=seconds)
    db.commit()


def xp_of(db, user):
    db.expire_all()
    return db.get(models.User, user.id).xp or 0


def is_best(choice):
    return choice["feedback"].startswith("Correct")


def test_requires_login(client):
    assert client.post(f"/api/activities/labs/{lab()['id']}/answer", json={"choice_id": "a"}).status_code == 401
    assert client.get("/api/activities/me").status_code == 401


def test_wrong_lab_answer_awards_nothing_and_explains(client, learner, db):
    user, headers = learner
    s = lab()
    _, wrong = correct_and_wrong(s)
    r = client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": wrong["id"]}, headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body["correct"] is False and body["awarded"] is None and body["feedback"]
    assert xp_of(db, user) == 0


def test_correct_lab_answer_awards_xp_and_badge_once(client, learner, db):
    user, headers = learner
    s = lab()
    right, _ = correct_and_wrong(s)
    first = client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": right["id"]}, headers=headers).json()
    assert first["correct"] is True
    assert first["awarded"] == {"xp": s["mission_xp_awarded"], "badge": s["badge_awarded"]}  # first try: full XP
    again = client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": right["id"]}, headers=headers).json()
    assert again["correct"] is True and again["awarded"] is None
    assert xp_of(db, user) == s["mission_xp_awarded"]
    me = client.get("/api/activities/me", headers=headers).json()
    assert me["completed_labs"] == [s["id"]] and me["badges"] == [s["badge_awarded"]] and me["xp"] == s["mission_xp_awarded"]


def test_unknown_lab_and_choice(client, learner):
    _, headers = learner
    assert client.post("/api/activities/labs/nope/answer", json={"choice_id": "a"}, headers=headers).status_code == 404
    assert client.post(f"/api/activities/labs/{lab()['id']}/answer", json={"choice_id": "zz"}, headers=headers).status_code == 400


def test_lab_attempts_are_rate_limited(client, learner):
    _, headers = learner
    s = lab()
    _, wrong = correct_and_wrong(s)
    codes = [client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": wrong["id"]}, headers=headers).status_code for _ in range(14)]
    assert 429 in codes


def decision_mission():
    return catalogue.get_mission("mission_incident_ransomware_monday")


def play(client, headers, mission, picker):
    run = client.post(f"/api/activities/missions/{mission['mission_id']}/runs", json={}, headers=headers).json()
    result = None
    for stage in [s for s in mission["stages"] if s.get("choices")]:
        result = client.post(f"/api/activities/missions/runs/{run['run_id']}/choose", json={"choice_id": picker(stage)}, headers=headers).json()
    return run, result


def best(stage):
    return next(c for c in stage["choices"] if is_best(c))["id"]


def worst(stage):
    return next(c for c in stage["choices"] if not is_best(c))["id"]


def test_best_path_finishes_with_success_and_award_once(client, learner, db):
    user, headers = learner
    m = decision_mission()
    _, result = play(client, headers, m, best)
    reward = m["rewards"]
    assert result["finished"] and result["band"] == "success"
    assert result["awarded"] == {"xp": reward["mission_xp_awarded"], "badge": reward["badge_awarded"]}
    assert xp_of(db, user) == reward["mission_xp_awarded"]
    _, again = play(client, headers, m, best)
    assert again["band"] == "success" and again["awarded"] is None
    assert xp_of(db, user) == reward["mission_xp_awarded"]


def test_worst_path_fails_and_awards_nothing(client, learner, db):
    user, headers = learner
    _, result = play(client, headers, decision_mission(), worst)
    assert result["finished"] and result["band"] == "fail" and result["awarded"] is None
    assert xp_of(db, user) == 0


def test_server_applies_the_consequences(client, learner):
    _, headers = learner
    m = decision_mission()
    run = client.post(f"/api/activities/missions/{m['mission_id']}/runs", json={}, headers=headers).json()
    first = m["stages"][0]["choices"][0]
    r = client.post(f"/api/activities/missions/runs/{run['run_id']}/choose", json={"choice_id": first["id"]}, headers=headers).json()
    for key, delta in first["consequence"].items():
        start = next(h["start"] for h in m["hud"] if h["key"] == key)
        assert r["values"][key] == max(0, start + delta)


def test_runs_belong_to_their_owner_and_cannot_be_resumed_after_finishing(client, make_user):
    _, a = make_user("run-owner")
    _, b = make_user("run-intruder")
    m = decision_mission()
    run, _ = play(client, a, m, lambda st: st["choices"][0]["id"])
    choice = m["stages"][0]["choices"][0]["id"]
    assert client.post(f"/api/activities/missions/runs/{run['run_id']}/choose", json={"choice_id": choice}, headers=b).status_code == 404
    assert client.post(f"/api/activities/missions/runs/{run['run_id']}/choose", json={"choice_id": choice}, headers=a).status_code == 409


def test_bb84_run_hides_the_eavesdropper_until_the_decision(client, learner, db):
    user, headers = learner
    bb = "mission_bb84_diplomatic_channel"
    run = client.post(f"/api/activities/missions/{bb}/runs", json={"photons": 60}, headers=headers).json()
    assert "eve" not in json.dumps(run) and len(run["alice_bits"]) == 60 and run["sifted"]
    sample = run["sifted"][:8]
    mism = sum(1 for i in sample if run["alice_bits"][i] != run["bob_results"][i])
    rate = round(100 * mism / len(sample))
    decision = "abort" if rate > 10 else "accept"
    r = client.post(f"/api/activities/missions/runs/{run['run_id']}/decide", json={"sample_size": 8, "decision": decision}, headers=headers).json()
    assert r["correct"] is True and r["error_rate"] == rate and r["awarded"]["badge"]
    assert xp_of(db, user) == r["awarded"]["xp"]


def test_bb84_wrong_decision_is_not_rewarded_and_inputs_are_validated(client, learner, db):
    user, headers = learner
    bb = "mission_bb84_diplomatic_channel"
    assert client.post(f"/api/activities/missions/{bb}/runs", json={"photons": 7}, headers=headers).status_code == 400
    run = client.post(f"/api/activities/missions/{bb}/runs", json={"photons": 20}, headers=headers).json()
    url = f"/api/activities/missions/runs/{run['run_id']}/decide"
    assert client.post(url, json={"sample_size": 0, "decision": "accept"}, headers=headers).status_code == 400
    assert client.post(url, json={"sample_size": 1, "decision": "maybe"}, headers=headers).status_code == 400
    first = run["sifted"][0]
    mismatch = run["alice_bits"][first] != run["bob_results"][first]
    wrong = "accept" if mismatch else "abort"
    r = client.post(url, json={"sample_size": 1, "decision": wrong}, headers=headers).json()
    assert r["correct"] is False and r["awarded"] is None
    assert xp_of(db, user) == 0


def test_every_decision_mission_can_be_started_with_its_variables(client, learner):
    _, headers = learner
    for mid, m in catalogue._load()["missions"].items():
        if m["type"] != "decision_scenario":
            continue
        run = client.post(f"/api/activities/missions/{mid}/runs", json={}, headers=headers).json()
        assert set(run["values"]) == {h["key"] for h in m["hud"]}


def test_trying_the_options_in_turn_costs_xp(client, learner, db):
    user, headers = learner
    s = lab()
    right, _ = correct_and_wrong(s)
    wrongs = [c for c in s["choices"] if not c["correct"]]
    for w in wrongs:
        client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": w["id"]}, headers=headers)
        age_attempts(db)
    r = client.post(f"/api/activities/labs/{s['id']}/answer", json={"choice_id": right["id"]}, headers=headers).json()
    assert r["awarded"]["xp"] == max(1, round(s["mission_xp_awarded"] * 0.5))
    assert xp_of(db, user) == r["awarded"]["xp"]


def test_mission_runs_are_capped_per_hour(client, learner):
    _, headers = learner
    mid = decision_mission()["mission_id"]
    codes = [client.post(f"/api/activities/missions/{mid}/runs", json={}, headers=headers).status_code for _ in range(12)]
    assert codes[:10] == [200] * 10 and 429 in codes[10:]


def test_progress_reports_verified_quiz_passes_and_scores(client, learner, db):
    user, headers = learner
    module = "track_a_a1_computing_foundations"
    db.add(models.QuizModule(module_id=module, title="t", difficulty="x", passing_score_percent=70, topic="t", reveal_answers=True))
    db.flush()
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    db.add_all([
        models.QuizAttempt(id="a1", user_id=user.id, module_id=module, status="graded", form_json="[]", passing_score_percent=70, issued_at=now, graded_at=now, total_questions=10, correct_answers=5, score_percent=50.0, passed=False),
        models.QuizAttempt(id="a2", user_id=user.id, module_id=module, status="graded", form_json="[]", passing_score_percent=70, issued_at=now, graded_at=now, total_questions=10, correct_answers=8, score_percent=80.0, passed=True),
    ])
    db.commit()
    me = client.get("/api/activities/me", headers=headers).json()
    assert me["passed_modules"] == [module] and me["quiz_scores"] == {module: 80.0}


def test_client_cannot_store_its_own_xp_or_completion(client, learner, db):
    user, headers = learner
    forged = {"totalXp": 99999, "completedModules": ["track_a_a1_computing_foundations"], "unlockedBadges": ["PQCTP Certified"],
              "quizScores": {"x": 100}, "completedEscapes": ["a"], "completedMissions": ["b"], "readinessScore": 100, "currentModuleId": "m2", "streakDays": 3}
    r = client.post(f"/api/users/{user.id}/progress", json={"progress_data": json.dumps(forged)}, headers=headers)
    assert r.status_code == 200
    db.expire_all()
    stored = json.loads(db.get(models.User, user.id).progress_data)
    assert stored == {"currentModuleId": "m2", "streakDays": 3}
    assert client.post(f"/api/users/{user.id}/progress", json={"progress_data": "not json"}, headers=headers).status_code == 422
    assert client.post(f"/api/users/{user.id}/progress", json={"progress_data": "[1]"}, headers=headers).status_code == 422


def test_a_wrong_answer_locks_the_lab_briefly(client, learner, db):
    _, headers = learner
    s = lab()
    right, wrong = correct_and_wrong(s)
    url = f"/api/activities/labs/{s['id']}/answer"
    assert client.post(url, json={"choice_id": wrong["id"]}, headers=headers).status_code == 200
    locked = client.post(url, json={"choice_id": right["id"]}, headers=headers)
    assert locked.status_code == 429 and "seconds" in locked.json()["detail"]
    age_attempts(db)
    assert client.post(url, json={"choice_id": right["id"]}, headers=headers).json()["correct"] is True
