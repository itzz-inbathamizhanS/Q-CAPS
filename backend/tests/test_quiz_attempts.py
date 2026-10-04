"""Server-graded quiz tests. Run from backend/: pytest tests/test_quiz_attempts.py -q
Uses an isolated in-memory SQLite database; never touches qcaps.db."""
import json
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.pop("QCAPS_ENABLE_LEGACY_QUIZ_SUBMIT", None)

import models
import quiz_service
import seed_quizzes
from course_content.ratelimit import login_limiter
from database import Base, get_db
from main import app

MODULE = "track_a_a1_computing_foundations"


def bank_size(Session):
    """Number of active questions in the module's bank: the quiz uses the whole bank, and the content packs grow it."""
    with Session() as db:
        return db.query(models.QuizItem).filter_by(module_id=MODULE, active=True).count()


@pytest.fixture()
def env():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with Session() as db:
        seed_quizzes.seed(db)

    def override():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    login_limiter.reset()  # every test signs in the same names from the same test client
    client = TestClient(app)
    yield client, Session
    app.dependency_overrides.clear()


def signup(client, name):
    r = client.post("/api/auth/register", json={"name": name, "password": "password"})
    assert r.status_code == 200, r.text
    uid = r.json()["id"]
    tok = client.post("/api/auth/login", json={"name": name, "password": "password"}).json()["access_token"]
    return uid, {"Authorization": f"Bearer {tok}"}


def answer_all(Session, attempt, correct=True):
    """Build answers for an issued attempt using the server-side key (test-only)."""
    with Session() as db:
        form = json.loads(db.get(models.QuizAttempt, attempt["attempt_id"]).form_json)
        out = []
        for entry in form:
            key = db.get(models.QuizItem, entry["item_id"]).correct_index
            pos = entry["order"].index(key)
            if not correct:
                pos = (pos + 1) % len(entry["order"])
            out.append({"item_id": entry["item_id"], "selected_position": pos})
        return out


def test_seed_loads_all_content(env):
    _, Session = env
    with Session() as db:
        files = list(seed_quizzes.QUIZ_DIR.glob("*/*.json"))
        in_files = sum(len(json.loads(f.read_text(encoding="utf-8"))["questions"]) for f in files)
        assert db.query(models.QuizModule).count() == len(files) == 36
        assert db.query(models.QuizItem).count() == in_files


def test_form_contains_no_answer_key(env):
    client, Session = env
    _, h = signup(client, "alice")
    r = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h)
    assert r.status_code == 200
    raw = r.text.lower()
    for forbidden in ("correct_index", "correctindex", "correct_position", "explanation"):
        assert forbidden not in raw
    body = r.json()
    assert body["total_questions"] == len(body["questions"]) == bank_size(Session)
    assert all(set(q) == {"item_id", "prompt", "options"} for q in body["questions"])


def test_requires_authentication(env):
    client, _ = env
    assert client.post(f"/api/quizzes/{MODULE}/attempts").status_code == 401
    assert client.post("/api/quizzes/attempts/x/submit", json={"answers": []}).status_code == 401


def test_unknown_module_404(env):
    client, _ = env
    _, h = signup(client, "alice")
    assert client.post("/api/quizzes/nope/attempts", headers=h).status_code == 404


def test_perfect_attempt_scored_by_server(env):
    client, Session = env
    uid, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    res = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                      json={"answers": answer_all(Session, att)}, headers=h)
    assert res.status_code == 200, res.text
    r = res.json()
    assert (r["correct_answers"], r["total_questions"], r["score_percent"], r["passed"]) == (bank_size(Session), bank_size(Session), 100.0, True)
    assert r["xp_awarded"] == 50 * bank_size(Session)
    assert all(i["correct"] and i["explanation"] for i in r["items"])


def test_wrong_answers_fail_and_are_recorded(env):
    client, Session = env
    uid, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": answer_all(Session, att, correct=False)}, headers=h).json()
    assert (r["correct_answers"], r["score_percent"], r["passed"], r["xp_awarded"]) == (0, 0.0, False, 0)
    with Session() as db:
        a = db.get(models.QuizAttempt, att["attempt_id"])
        assert a.status == "graded" and a.passed is False and a.total_questions == bank_size(Session)
        assert db.query(models.QuizResponse).filter_by(attempt_id=a.id).count() == bank_size(Session)  # failures are kept


def test_unanswered_items_count_as_incorrect(env):
    client, Session = env
    _, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    partial = answer_all(Session, att)[:2]
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json={"answers": partial}, headers=h).json()
    assert (r["correct_answers"], r["total_questions"], r["score_percent"]) == (2, bank_size(Session), round(100 * 2 / bank_size(Session), 2))


def test_retake_does_not_farm_xp(env):
    client, Session = env
    uid, h = signup(client, "alice")
    xps = []
    for _ in range(3):
        att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
        r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                        json={"answers": answer_all(Session, att)}, headers=h).json()
        xps.append(r["xp_awarded"])
    assert xps == [50 * bank_size(Session), 0, 0]
    with Session() as db:
        assert db.get(models.User, uid).xp == 50 * bank_size(Session)


def test_double_submit_rejected(env):
    client, Session = env
    _, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    body = {"answers": answer_all(Session, att)}
    assert client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json=body, headers=h).status_code == 200
    assert client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json=body, headers=h).status_code == 409


def test_cannot_submit_another_users_attempt(env):
    client, Session = env
    _, ha = signup(client, "alice")
    _, hb = signup(client, "bob")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=ha).json()
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": answer_all(Session, att)}, headers=hb)
    assert r.status_code == 404
    with Session() as db:
        assert db.get(models.QuizAttempt, att["attempt_id"]).status == "issued"


@pytest.mark.parametrize("bad", [
    {"item_id": "not-in-attempt", "selected_position": 0},
    {"item_id": None, "selected_position": 9},  # replaced below with a real id and out-of-range position
])
def test_invalid_answers_rejected(env, bad):
    client, Session = env
    _, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    if bad["item_id"] is None:
        bad = {"item_id": att["questions"][0]["item_id"], "selected_position": 9}
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json={"answers": [bad]}, headers=h)
    assert r.status_code == 422
    with Session() as db:  # a rejected submission must not consume the attempt
        assert db.get(models.QuizAttempt, att["attempt_id"]).status == "issued"


def test_duplicate_answer_rejected(env):
    client, _ = env
    _, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    iid = att["questions"][0]["item_id"]
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": [{"item_id": iid, "selected_position": 0}, {"item_id": iid, "selected_position": 1}]},
                    headers=h)
    assert r.status_code == 422


def test_expired_attempt_rejected(env):
    client, Session = env
    _, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    with Session() as db:
        a = db.get(models.QuizAttempt, att["attempt_id"])
        a.issued_at = a.issued_at - quiz_service.ATTEMPT_TTL - quiz_service.timedelta(minutes=1)
        db.commit()
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": answer_all(Session, att)}, headers=h)
    assert r.status_code == 410


def test_non_revealing_module_hides_key_after_grading(env):
    client, Session = env
    _, h = signup(client, "alice")
    with Session() as db:
        db.get(models.QuizModule, MODULE).reveal_answers = False
        db.commit()
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": answer_all(Session, att, correct=False)}, headers=h).json()
    assert all(i["correct_position"] is None and i["explanation"] is None for i in r["items"])


def test_graded_attempt_feeds_legacy_score_and_readiness(env):
    client, Session = env
    uid, h = signup(client, "alice")
    att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
    client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                json={"answers": answer_all(Session, att)}, headers=h)
    with Session() as db:
        rows = db.query(models.QuizScore).filter_by(user_id=uid).all()
        assert len(rows) == 1 and rows[0].topic == "practical_security" and rows[0].score == 100.0
    prof = client.get(f"/api/users/{uid}/profile", headers=h).json()
    assert prof["readiness_score"] > 0


def test_legacy_submit_disabled_by_default(env):
    client, _ = env
    uid, h = signup(client, "alice")
    r = client.post("/api/quizzes/submit", headers=h,
                    json={"user_id": uid, "topic": "pqc", "correct_answers": 10, "total_questions": 10})
    assert r.status_code == 410


def start(client, h):
    return client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()


def key_position(Session, attempt, item_id):
    with Session() as db:
        form = {e["item_id"]: e for e in json.loads(db.get(models.QuizAttempt, attempt["attempt_id"]).form_json)}
        key = db.get(models.QuizItem, item_id).correct_index
        return form[item_id]["order"].index(key)


def test_per_question_flow_matches_server_grade(env):
    client, Session = env
    uid, h = signup(client, "alice")
    att = start(client, h)
    for n, q in enumerate(att["questions"]):
        right = key_position(Session, att, q["item_id"])
        pos = right if n < len(att["questions"]) - 1 else (right + 1) % len(q["options"])  # last one wrong
        fb = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/answers",
                         json={"item_id": q["item_id"], "selected_position": pos}, headers=h)
        assert fb.status_code == 200
        f = fb.json()
        assert f["correct"] == (n < len(att["questions"]) - 1) and f["correct_position"] == right and f["explanation"]
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json={"answers": []}, headers=h).json()
    assert (r["correct_answers"], r["score_percent"], r["passed"], r["xp_awarded"]) == (bank_size(Session) - 1, round(100 * (bank_size(Session) - 1) / bank_size(Session), 2), True, 50 * (bank_size(Session) - 1))
    with Session() as db:
        assert db.get(models.User, uid).xp == 50 * (bank_size(Session) - 1)
        assert db.query(models.QuizResponse).filter_by(attempt_id=att["attempt_id"]).count() == bank_size(Session)


def test_recorded_answer_is_locked(env):
    client, Session = env
    _, h = signup(client, "alice")
    att = start(client, h)
    iid = att["questions"][0]["item_id"]
    url = f"/api/quizzes/attempts/{att['attempt_id']}/answers"
    assert client.post(url, json={"item_id": iid, "selected_position": 0}, headers=h).status_code == 200
    assert client.post(url, json={"item_id": iid, "selected_position": 1}, headers=h).status_code == 409


def test_answer_endpoint_is_owner_only_and_validates(env):
    client, _ = env
    _, ha = signup(client, "alice")
    _, hb = signup(client, "bob")
    att = start(client, ha)
    iid = att["questions"][0]["item_id"]
    url = f"/api/quizzes/attempts/{att['attempt_id']}/answers"
    assert client.post(url, json={"item_id": iid, "selected_position": 0}, headers=hb).status_code == 404
    assert client.post(url, json={"item_id": "zzz", "selected_position": 0}, headers=ha).status_code == 422
    assert client.post(url, json={"item_id": iid, "selected_position": 9}, headers=ha).status_code == 422


def test_final_submit_cannot_override_recorded_answer(env):
    client, _ = env
    _, h = signup(client, "alice")
    att = start(client, h)
    iid = att["questions"][0]["item_id"]
    client.post(f"/api/quizzes/attempts/{att['attempt_id']}/answers",
                json={"item_id": iid, "selected_position": 0}, headers=h)
    r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                    json={"answers": [{"item_id": iid, "selected_position": 1}]}, headers=h)
    assert r.status_code == 422


def test_withheld_feedback_module_returns_no_correctness_per_question(env):
    client, Session = env
    _, h = signup(client, "alice")
    with Session() as db:
        db.get(models.QuizModule, MODULE).reveal_answers = False
        db.commit()
    att = start(client, h)
    iid = att["questions"][0]["item_id"]
    f = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/answers",
                    json={"item_id": iid, "selected_position": 0}, headers=h).json()
    assert f == {"item_id": iid, "recorded": True, "correct": None, "correct_position": None, "explanation": None}


def test_per_question_retake_does_not_farm_xp(env):
    client, Session = env
    uid, h = signup(client, "alice")
    xps = []
    for _ in range(2):
        att = start(client, h)
        for q in att["questions"]:
            client.post(f"/api/quizzes/attempts/{att['attempt_id']}/answers",
                        json={"item_id": q["item_id"], "selected_position": key_position(Session, att, q["item_id"])},
                        headers=h)
        xps.append(client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit",
                               json={"answers": []}, headers=h).json()["xp_awarded"])
    assert xps == [50 * bank_size(Session), 0]


def test_module_completion_xp_is_awarded_once_by_the_server(env):
    client, Session = env
    with Session() as db:
        track = models.CourseTrack(slug="track-a", code="A", title="Foundations")
        db.add(track)
        db.flush()
        db.add(models.CourseModule(slug=MODULE, track_id=track.id, code="A1", title="Computing", xp=250, sort_order=1))
        db.commit()
    uid, h = signup(client, "alice")
    paid = []
    for _ in range(2):
        att = client.post(f"/api/quizzes/{MODULE}/attempts", headers=h).json()
        r = client.post(f"/api/quizzes/attempts/{att['attempt_id']}/submit", json={"answers": answer_all(Session, att)}, headers=h).json()
        paid.append((r["xp_awarded"], r["module_xp_awarded"]))
    assert paid == [(50 * bank_size(Session) + 250, 250), (0, 0)]
    with Session() as db:
        assert db.get(models.User, uid).xp == 50 * bank_size(Session) + 250
