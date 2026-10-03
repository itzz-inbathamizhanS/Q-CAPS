"""Regression tests for issues found in the 2026-10-03 end-to-end audit."""
import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

import pytest

import database
import main
import models
import scan_receipts
from test_course_progress import ADMIN, PUBLIC, TEXT, _module, _progress, _section, _track


def _sign(payload: dict) -> str:
    """HS256 token with the server's secret (used to forge edge-case claims)."""
    def b64(obj):
        return base64.urlsafe_b64encode(json.dumps(obj).encode()).rstrip(b"=").decode()
    head, body = b64({"alg": "HS256", "typ": "JWT"}), b64(payload)
    sig = hmac.new(main.SECRET_KEY.encode(), f"{head}.{body}".encode(), hashlib.sha256).digest()
    return f"{head}.{body}." + base64.urlsafe_b64encode(sig).rstrip(b"=").decode()


# ---------- token handling ----------

def test_non_numeric_subject_is_401_not_500(client):
    token = _sign({"sub": "abc", "exp": int((datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp())})
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_scan_receipt_is_not_an_access_token(client, learner):
    user, _ = learner
    receipt = scan_receipts.issue_receipt(main.SECRET_KEY, user.id, {"target_url": "example.com"})
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {receipt}"}).status_code == 401


# ---------- registration and login ----------

@pytest.mark.parametrize("name,password", [
    ("", "long-enough-pw"),
    ("   ", "long-enough-pw"),
    ("n" * 101, "long-enough-pw"),
    ("bad\x00name", "long-enough-pw"),
    ("short-pw-user", "a"),
])
def test_register_rejects_invalid_input(client, name, password):
    assert client.post("/api/auth/register", json={"name": name, "password": password}).status_code == 422


def test_register_trims_name_and_reports_unknown_readiness(client):
    r = client.post("/api/auth/register", json={"name": "  spaced  ", "password": "long-enough-pw"})
    assert r.status_code == 200
    assert r.json()["name"] == "spaced"
    assert r.json()["readiness_score"] is None
    assert client.post("/api/auth/login", json={"name": " spaced ", "password": "long-enough-pw"}).status_code == 200


def test_login_attempts_are_rate_limited(client, monkeypatch):
    monkeypatch.setenv("QCAPS_LOGIN_RATE_LIMIT", "3")
    client.post("/api/auth/register", json={"name": "victim", "password": "long-enough-pw"})
    codes = [client.post("/api/auth/login", json={"name": "victim", "password": "wrong"}).status_code for _ in range(3)]
    assert codes == [401, 401, 401]
    blocked = client.post("/api/auth/login", json={"name": "VICTIM", "password": "long-enough-pw"})
    assert blocked.status_code == 429 and "Retry-After" in blocked.headers
    # Another account from the same address is not affected.
    client.post("/api/auth/register", json={"name": "other", "password": "long-enough-pw"})
    assert client.post("/api/auth/login", json={"name": "other", "password": "long-enough-pw"}).status_code == 200


# ---------- progress blob ----------

@pytest.mark.parametrize("blob", ["not json", "[1, 2]", json.dumps({"pad": "x" * (64 * 1024)})],
                         ids=["not-json", "array", "over-64k"])
def test_progress_blob_must_be_a_bounded_json_object(client, learner, blob):
    user, h = learner
    assert client.post(f"/api/users/{user.id}/progress", headers=h, json={"progress_data": blob}).status_code == 422


def test_valid_progress_blob_is_stored(client, learner, db):
    user, h = learner
    r = client.post(f"/api/users/{user.id}/progress", headers=h, json={"progress_data": '{"completedModules": []}'})
    assert r.status_code == 200
    db.refresh(user)
    assert json.loads(user.progress_data) == {"completedModules": []}


# ---------- scanner logs ----------

SCAN = {"target_url": "example.com", "scan_timestamp": "2026-10-03T12:00:00Z",
        "crypto": {"vulnerabilities_found": ["RSA certificate", "ECDHE key exchange"], "notes": []}}


def _log(client, user, h, result=SCAN, receipt_user=None, **extra):
    body = {"user_id": user.id, "endpoint": "ignored", "status": "success", "vulnerabilities_found": 0,
            "details": json.dumps(result),
            "receipt": scan_receipts.issue_receipt(main.SECRET_KEY, receipt_user or user.id, result)}
    body.update(extra)
    return client.post("/api/scanner/log", headers=h, json=body)


def test_scan_log_derives_findings_and_xp_from_the_verified_result(client, learner, db):
    user, h = learner
    r = _log(client, user, h, vulnerabilities_found=100000)
    assert r.status_code == 200, r.text
    assert r.json()["vulnerabilities_found"] == 2
    assert r.json()["xp_awarded"] == 10  # flat per scan, not per finding
    assert r.json()["endpoint"] == "example.com"
    db.refresh(user)
    assert user.xp == 10


def test_scan_log_without_receipt_is_rejected(client, learner, db):
    user, h = learner
    r = _log(client, user, h, receipt=None)
    assert r.status_code == 422
    db.refresh(user)
    assert user.xp == 0


def test_scan_log_with_tampered_result_is_rejected(client, learner):
    user, h = learner
    tampered = json.loads(json.dumps(SCAN))
    tampered["crypto"]["vulnerabilities_found"] += ["invented"] * 50
    body_receipt = scan_receipts.issue_receipt(main.SECRET_KEY, user.id, SCAN)
    r = _log(client, user, h, result=tampered, receipt=body_receipt)
    assert r.status_code == 422 and "does not match" in r.json()["detail"]


def test_scan_log_with_another_users_receipt_is_rejected(client, learner, make_user):
    user, h = learner
    other, _ = make_user("someone-else")
    assert _log(client, user, h, receipt_user=other.id).status_code == 422


def test_expired_scan_receipt_is_rejected(client, learner):
    user, h = learner
    old = scan_receipts.issue_receipt(main.SECRET_KEY, user.id, SCAN, now=datetime.now(timezone.utc) - timedelta(hours=1))
    assert _log(client, user, h, receipt=old).status_code == 422


def test_scan_log_replay_is_rejected(client, learner, db):
    user, h = learner
    assert _log(client, user, h).status_code == 200
    # Same result re-encoded with different whitespace and key order is still the same scan.
    reencoded = json.dumps(dict(reversed(list(SCAN.items()))), indent=2)
    r = client.post("/api/scanner/log", headers=h, json={
        "user_id": user.id, "endpoint": "x", "status": "success", "details": reencoded,
        "receipt": scan_receipts.issue_receipt(main.SECRET_KEY, user.id, SCAN)})
    assert r.status_code == 409
    db.refresh(user)
    assert user.xp == 10


def test_receipt_hash_survives_a_javascript_round_trip():
    result = {"a": 1.0, "b": [2.0, {"c": "é"}], "receipt": "x", "logId": 7}
    as_js_would_send = {"b": [2, {"c": "é"}], "a": 1}
    assert scan_receipts.canonical_hash(result) == scan_receipts.canonical_hash(as_js_would_send)


# ---------- readiness ----------

def test_readiness_is_quiz_performance_only(client, learner, db):
    user, h = learner
    user.xp = 100000
    db.add(models.QuizScore(user_id=user.id, topic="pqc", score=40.0, correct_answers=2, total_questions=5))
    db.commit()
    assert client.get(f"/api/users/{user.id}/profile", headers=h).json()["readiness_score"] == 40


# ---------- deleting content removes its learner progress ----------

@pytest.mark.parametrize("delete", ["section", "module", "track"])
def test_deleting_content_removes_learner_progress(client, admin, learner, db, delete):
    _, ah = admin
    _, lh = learner
    t = _track(client, ah)
    m = _module(client, ah, t["id"])
    s = _section(client, ah, m["id"])
    assert client.post(f"{PUBLIC}/sections/{s['id']}/complete", headers=lh).status_code == 200
    target = {"section": f"sections/{s['id']}", "module": f"modules/{m['id']}", "track": f"tracks/{t['id']}"}[delete]
    assert client.delete(f"{ADMIN}/{target}", headers=ah).status_code == 204
    assert db.query(models.SectionCompletion).count() == 0

    # SQLite reuses the freed row id; the new section must not start out completed.
    t2 = t if delete != "track" else _track(client, ah, slug="t2")
    m2 = m if delete == "section" else _module(client, ah, t2["id"], slug="m2")
    _section(client, ah, m2["id"], slug="s2")
    assert _progress(client, lh, slug=m2["slug"])["completed_section_ids"] == []


def test_startup_sweep_removes_orphaned_progress(client, admin, learner, db):
    _, ah = admin
    user, lh = learner
    t = _track(client, ah)
    m = _module(client, ah, t["id"])
    s = _section(client, ah, m["id"])
    db.add(models.SectionCompletion(user_id=user.id, section_id=s["id"] + 1000))
    db.add(models.CheckpointPass(user_id=user.id, section_id=s["id"] + 1000, block_id="cp"))
    db.add(models.SectionCompletion(user_id=user.id, section_id=s["id"]))
    db.commit()
    database.ensure_schema()
    db.expire_all()
    assert [r.section_id for r in db.query(models.SectionCompletion)] == [s["id"]]
    assert db.query(models.CheckpointPass).count() == 0


# ---------- leaderboard ----------

def test_admins_are_not_on_the_leaderboard_or_ranked(client, admin, learner, make_user, db):
    admin_user, ah = admin
    learner_user, lh = learner
    other, _ = make_user("second-learner")
    admin_user.xp, learner_user.xp, other.xp = 5000, 100, 300
    db.commit()
    board = client.get("/api/leaderboard", headers=lh).json()
    assert [e["name"] for e in board] == ["second-learner", "learner-user"]
    assert [e["rank"] for e in board] == [1, 2]
    assert client.get("/api/leaderboard/rank", headers=lh).json()["rank"] == 2
    assert client.get("/api/leaderboard/rank", headers=ah).json()["rank"] == 0
