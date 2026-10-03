"""Checkpoint rate limit, section progress, audit-log viewer, checklist dry run,
section summary/minutes, and upgrading a legacy database."""
import json

import pytest

import models

ADMIN = "/api/admin/content"
PUBLIC = "/api/content"

TEXT = {"type": "text", "markdown": "read me"}
CHECKPOINT = {"type": "checkpoint", "id": "cp", "question": "Pick b", "options": ["a", "b", "c"],
              "correct_index": 1, "explanation": "Because b."}
BAD_CHECKPOINT = {"type": "checkpoint", "id": "cp", "question": "Pick b", "options": ["a", "b"], "correct_index": 1}


def _track(client, h, slug="t1", status="published"):
    r = client.post(f"{ADMIN}/tracks", headers=h, json={"slug": slug, "code": "T", "title": "Track", "status": status})
    assert r.status_code == 201, r.text
    return r.json()


def _module(client, h, track_id, slug="m1"):
    r = client.post(f"{ADMIN}/modules", headers=h, json={
        "track_id": track_id, "slug": slug, "code": "M1", "title": "Module", "status": "published"})
    assert r.status_code == 201, r.text
    return r.json()


def _section(client, h, module_id, slug="s1", blocks=None, status="published"):
    r = client.post(f"{ADMIN}/sections", headers=h, json={
        "module_id": module_id, "slug": slug, "title": "Section", "status": status,
        "blocks": blocks if blocks is not None else [TEXT]})
    assert r.status_code == 201, r.text
    return r.json()


def _checkpoint_section(client, h):
    t = _track(client, h)
    m = _module(client, h, t["id"])
    return _section(client, h, m["id"], blocks=[CHECKPOINT])


def _progress(client, headers, slug="m1"):
    r = client.get(f"{PUBLIC}/modules/{slug}/progress", headers=headers)
    assert r.status_code == 200, r.text
    return r.json()


# ---------- checkpoint rate limit ----------

def test_checkpoint_attempts_are_rate_limited(client, admin, learner, monkeypatch):
    monkeypatch.setenv("QCAPS_CHECKPOINT_RATE_LIMIT", "3")
    _, ah = admin
    s = _checkpoint_section(client, ah)
    _, lh = learner
    url = f"{PUBLIC}/sections/{s['id']}/checkpoints/cp/check"
    for _ in range(3):
        assert client.post(url, headers=lh, json={"selected_index": 0}).status_code == 200
    r = client.post(url, headers=lh, json={"selected_index": 1})
    assert r.status_code == 429 and int(r.headers["Retry-After"]) >= 1
    # invalid requests do not use up attempts, and other users are unaffected
    assert client.post(url, headers=lh, json={"selected_index": 4}).status_code == 422
    assert client.post(url, headers=ah, json={"selected_index": 1}).status_code == 200


# ---------- section progress ----------

def test_progress_requires_login(client, admin):
    _, h = admin
    _checkpoint_section(client, h)
    assert client.get(f"{PUBLIC}/modules/m1/progress").status_code == 401
    assert client.post(f"{PUBLIC}/sections/1/complete").status_code == 401


def test_checkpoint_pass_completes_section_per_user(client, admin, learner, make_user):
    _, ah = admin
    s = _checkpoint_section(client, ah)
    _, lh = learner
    url = f"{PUBLIC}/sections/{s['id']}/checkpoints/cp/check"

    assert _progress(client, lh) == {"completed_section_ids": [], "total_sections": 1}
    client.post(url, headers=lh, json={"selected_index": 0})  # a wrong answer does not count
    assert _progress(client, lh)["completed_section_ids"] == []
    assert client.post(url, headers=lh, json={"selected_index": 1}).json()["section_completed"] is True
    assert client.post(url, headers=lh, json={"selected_index": 1}).status_code == 200  # idempotent
    assert _progress(client, lh)["completed_section_ids"] == [s["id"]]

    _, other = make_user("someone-else")
    assert _progress(client, other)["completed_section_ids"] == []  # progress is per user


def test_section_without_checkpoint_is_completed_explicitly(client, admin, learner):
    _, ah = admin
    t = _track(client, ah)
    m = _module(client, ah, t["id"])
    plain = _section(client, ah, m["id"], "plain", blocks=[TEXT])
    with_cp = _section(client, ah, m["id"], "withcp", blocks=[CHECKPOINT])
    _, lh = learner

    assert client.post(f"{PUBLIC}/sections/{plain['id']}/complete", headers=lh).json() == {"completed": True}
    client.post(f"{PUBLIC}/sections/{plain['id']}/complete", headers=lh)  # idempotent
    # a section with a checkpoint cannot be self-declared complete
    assert client.post(f"{PUBLIC}/sections/{with_cp['id']}/complete", headers=lh).status_code == 409
    assert _progress(client, lh) == {"completed_section_ids": [plain["id"]], "total_sections": 2}


def test_adding_a_checkpoint_makes_a_completed_section_incomplete(client, admin, learner):
    _, ah = admin
    t = _track(client, ah)
    m = _module(client, ah, t["id"])
    s = _section(client, ah, m["id"], "s", blocks=[TEXT])
    _, lh = learner
    client.post(f"{PUBLIC}/sections/{s['id']}/complete", headers=lh)
    assert _progress(client, lh)["completed_section_ids"] == [s["id"]]
    client.patch(f"{ADMIN}/sections/{s['id']}", headers=ah, json={"blocks": [TEXT, CHECKPOINT]})
    assert _progress(client, lh)["completed_section_ids"] == []


def test_cannot_complete_unpublished_section(client, admin, learner):
    _, ah = admin
    s = _checkpoint_section(client, ah)
    client.patch(f"{ADMIN}/sections/{s['id']}", headers=ah, json={"status": "draft"})
    _, lh = learner
    assert client.post(f"{PUBLIC}/sections/{s['id']}/complete", headers=lh).status_code == 404


# ---------- audit log, checklist dry run, summary/minutes ----------

def test_audit_log_endpoint(client, admin, learner):
    user, h = admin
    t = _track(client, h)
    client.patch(f"{ADMIN}/tracks/{t['id']}", headers=h, json={"title": "Renamed", "subtitle": "sub"})

    assert client.get(f"{ADMIN}/audit-log").status_code == 401
    assert client.get(f"{ADMIN}/audit-log", headers=learner[1]).status_code == 403

    body = client.get(f"{ADMIN}/audit-log", headers=h).json()
    assert body["total"] == 2
    newest = body["items"][0]
    assert (newest["action"], newest["entity_type"], newest["actor_name"]) == ("update", "track", user.name)
    assert newest["changed_fields"] == ["subtitle", "title"] and newest["label"] == "Renamed"
    assert "before" not in newest and "after" not in newest

    page = client.get(f"{ADMIN}/audit-log?limit=1&offset=1", headers=h).json()
    assert page["total"] == 2 and [i["action"] for i in page["items"]] == ["create"]
    assert client.get(f"{ADMIN}/audit-log?entity_type=section", headers=h).json()["total"] == 0
    assert client.get(f"{ADMIN}/audit-log?entity_type=bogus", headers=h).status_code == 422


def test_checklist_dry_run(client, admin, learner):
    _, h = admin
    body = {"title": "T", "blocks": [BAD_CHECKPOINT]}
    assert client.post(f"{ADMIN}/sections/checklist", json=body).status_code == 401
    assert client.post(f"{ADMIN}/sections/checklist", headers=learner[1], json=body).status_code == 403
    items = client.post(f"{ADMIN}/sections/checklist", headers=h, json=body).json()["checklist"]
    assert [i["id"] for i in items if not i["ok"]] == ["checkpoint_explanation"]
    bad = {"title": "T", "blocks": [{"type": "x"}]}
    assert client.post(f"{ADMIN}/sections/checklist", headers=h, json=bad).status_code == 422
    assert client.get(f"{ADMIN}/tracks", headers=h).json()["stats"]["sections"] == 0  # nothing stored


def test_section_summary_and_minutes(client, admin):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    r = client.post(f"{ADMIN}/sections", headers=h, json={
        "module_id": m["id"], "slug": "s", "title": "S", "summary": "  A <b>short</b> blurb  ",
        "estimated_minutes": 12, "status": "published", "blocks": [TEXT]})
    assert r.status_code == 201 and r.json()["summary"] == "A short blurb"
    sec = client.get(f"{PUBLIC}/modules/m1").json()["sections"][0]
    assert (sec["summary"], sec["estimated_minutes"]) == ("A short blurb", 12)
    assert client.patch(f"{ADMIN}/sections/{sec['id']}", headers=h, json={"estimated_minutes": 0}).status_code == 422
    assert client.patch(f"{ADMIN}/sections/{sec['id']}", headers=h, json={"summary": None}).json()["summary"] is None


# ---------- schema upgrade of an existing database ----------

def test_ensure_schema_upgrades_a_legacy_database(tmp_path, monkeypatch):
    import database
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import DatabaseError

    legacy = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")
    with legacy.begin() as c:
        c.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL, hashed_password VARCHAR NOT NULL)"))
        c.execute(text("CREATE TABLE sections (id INTEGER PRIMARY KEY, title VARCHAR(200) NOT NULL)"))
        c.execute(text("INSERT INTO users (name, hashed_password) VALUES ('old', 'x')"))
    monkeypatch.setattr(database, "engine", legacy)

    database.ensure_schema()
    database.ensure_schema()  # idempotent

    with legacy.begin() as c:
        assert c.execute(text("SELECT role FROM users WHERE name='old'")).scalar() == "learner"
        c.execute(text("SELECT summary, estimated_minutes FROM sections"))
    for bad in (
        "UPDATE users SET role='root'",
        "INSERT INTO users (name, hashed_password, role) VALUES ('x', 'y', 'root')",
    ):
        with pytest.raises(DatabaseError):
            with legacy.begin() as c:
                c.execute(text(bad))
