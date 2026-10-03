import json

import pytest

import models
from course_content.import_curriculum import import_curriculum, section_blocks

ADMIN = "/api/admin/content"
PUBLIC = "/api/content"


def _track(client, headers, slug="t1", status="published"):
    r = client.post(f"{ADMIN}/tracks", headers=headers, json={"slug": slug, "code": "T", "title": "Track", "status": status})
    assert r.status_code == 201, r.text
    return r.json()


def _module(client, headers, track_id, slug="m1", status="published"):
    r = client.post(f"{ADMIN}/modules", headers=headers, json={
        "track_id": track_id, "slug": slug, "code": "M1", "title": "Module", "status": status})
    assert r.status_code == 201, r.text
    return r.json()


def _section(client, headers, module_id, slug="s1", blocks=None, status="published"):
    r = client.post(f"{ADMIN}/sections", headers=headers, json={
        "module_id": module_id, "slug": slug, "title": "Section", "status": status,
        "blocks": blocks if blocks is not None else [{"type": "text", "markdown": "hello"}]})
    assert r.status_code == 201, r.text
    return r.json()


# ---------- authentication / authorisation ----------

ADMIN_ENDPOINTS = [
    ("get", f"{ADMIN}/tracks", None),
    ("post", f"{ADMIN}/tracks", {"slug": "x", "code": "X", "title": "X"}),
    ("patch", f"{ADMIN}/tracks/1", {"title": "X"}),
    ("delete", f"{ADMIN}/tracks/1", None),
    ("put", f"{ADMIN}/tracks/reorder", {"ids": [1]}),
    ("post", f"{ADMIN}/modules", {"track_id": 1, "slug": "x", "code": "X", "title": "X"}),
    ("delete", f"{ADMIN}/sections/1", None),
]


@pytest.mark.parametrize("method,url,body", ADMIN_ENDPOINTS)
def test_admin_api_requires_token(client, method, url, body):
    assert getattr(client, method)(url, **({"json": body} if body else {})).status_code == 401


@pytest.mark.parametrize("method,url,body", ADMIN_ENDPOINTS)
def test_admin_api_forbidden_for_learner(client, learner, method, url, body):
    _, headers = learner
    r = getattr(client, method)(url, headers=headers, **({"json": body} if body else {}))
    assert r.status_code == 403


def test_client_supplied_role_is_ignored(client, learner):
    _, headers = learner
    headers = {**headers, "X-Role": "admin"}
    r = client.post(f"{ADMIN}/tracks", headers=headers, json={"slug": "x", "code": "X", "title": "X", "role": "admin"})
    assert r.status_code == 403


def test_registration_cannot_create_admin(client, db):
    r = client.post("/api/auth/register", json={"name": "sneaky", "password": "longenoughpw!", "role": "admin"})
    assert r.status_code == 200
    assert db.query(models.User).filter_by(name="sneaky").one().role == "learner"


def test_role_is_read_from_database_not_token(client, db, admin):
    user, headers = admin
    user.role = "learner"  # demoted after the token was issued
    db.commit()
    assert client.get(f"{ADMIN}/tracks", headers=headers).status_code == 403


def test_public_read_needs_no_token(client):
    assert client.get(f"{PUBLIC}/tracks").status_code == 200


# ---------- admin success, validation, audit ----------

def test_admin_full_lifecycle_and_audit(client, admin, db):
    user, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    s = _section(client, h, m["id"])

    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"title": "Renamed"})
    assert r.status_code == 200 and r.json()["title"] == "Renamed"
    assert client.delete(f"{ADMIN}/sections/{s['id']}", headers=h).status_code == 204
    assert client.delete(f"{ADMIN}/modules/{m['id']}", headers=h).status_code == 204
    assert client.delete(f"{ADMIN}/tracks/{t['id']}", headers=h).status_code == 204

    log = db.query(models.ContentAuditLog).order_by(models.ContentAuditLog.id).all()
    assert [(a.action, a.entity_type) for a in log] == [
        ("create", "track"), ("create", "module"), ("create", "section"),
        ("update", "section"), ("delete", "section"), ("delete", "module"), ("delete", "track"),
    ]
    assert all(a.actor_id == user.id for a in log)
    upd = log[3]
    assert upd.before["title"] == "Section" and upd.after["title"] == "Renamed"


def test_delete_track_cascades(client, admin, db):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    _section(client, h, m["id"])
    client.delete(f"{ADMIN}/tracks/{t['id']}", headers=h)
    assert db.query(models.CourseModule).count() == 0
    assert db.query(models.CourseSection).count() == 0


def test_reorder_sections_and_validation(client, admin, db):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    a = _section(client, h, m["id"], "a")["id"]
    b = _section(client, h, m["id"], "b")["id"]
    c = _section(client, h, m["id"], "c")["id"]

    assert client.put(f"{ADMIN}/modules/{m['id']}/sections/reorder", headers=h, json={"ids": [c, a, b]}).status_code == 200
    slugs = [s["slug"] for s in client.get(f"{PUBLIC}/modules/m1").json()["sections"]]
    assert slugs == ["c", "a", "b"]

    for bad in ([a, b], [a, b, b], [a, b, c, 999]):
        assert client.put(f"{ADMIN}/modules/{m['id']}/sections/reorder", headers=h, json={"ids": bad}).status_code == 400
    assert db.query(models.ContentAuditLog).filter_by(action="reorder").count() == 1


def test_validation_rejects_bad_input(client, admin):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    bad = [
        {"module_id": m["id"], "slug": "BAD SLUG", "title": "x"},
        {"module_id": m["id"], "slug": "s", "title": "x", "status": "archived"},
        {"module_id": m["id"], "slug": "s", "title": "x", "extra": 1},
        {"module_id": m["id"], "slug": "s", "title": "x", "blocks": [{"type": "nope"}]},
        {"module_id": m["id"], "slug": "s", "title": "x", "blocks": [
            {"type": "checkpoint", "question": "q", "options": ["a", "b"], "correct_index": 5}]},
        {"module_id": m["id"], "slug": "s", "title": "x", "blocks": [
            {"type": "text", "id": "dup", "markdown": "a"}, {"type": "text", "id": "dup", "markdown": "b"}]},
    ]
    for body in bad:
        assert client.post(f"{ADMIN}/sections", headers=h, json=body).status_code == 422, body
    assert client.patch(f"{ADMIN}/modules/{m['id']}", headers=h, json={"title": None}).status_code == 422


def test_duplicate_slug_conflict(client, admin):
    _, h = admin
    t = _track(client, h)
    r = client.post(f"{ADMIN}/tracks", headers=h, json={"slug": t["slug"], "code": "T", "title": "again"})
    assert r.status_code == 409


def test_text_is_sanitised(client, admin):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    s = _section(client, h, m["id"], blocks=[
        {"type": "text", "markdown": "ok <script>alert(1)</script> [x](javascript:alert(1)) \x00end"},
        {"type": "code", "language": "html", "code": "<b>kept</b>"},
    ])
    text, code = s["blocks"]
    assert "<script" not in text["markdown"] and "javascript:" not in text["markdown"]
    assert "\x00" not in text["markdown"] and "ok" in text["markdown"]
    assert code["code"] == "<b>kept</b>"


def test_video_url_allowlist(client, admin, monkeypatch):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    video = lambda url: [{"type": "video", "title": "v", "url": url}]

    def post(url):
        return client.post(f"{ADMIN}/sections", headers=h, json={
            "module_id": m["id"], "slug": "v" + str(abs(hash(url)))[:6], "title": "v", "blocks": video(url)})

    monkeypatch.delenv("QCAPS_VIDEO_HOST_ALLOWLIST", raising=False)
    assert post("https://www.youtube-nocookie.com/embed/abc").status_code == 422  # empty list rejects all

    monkeypatch.setenv("QCAPS_VIDEO_HOST_ALLOWLIST", "www.youtube-nocookie.com, videos.example.org")
    assert post("https://www.youtube-nocookie.com/embed/abc").status_code == 201
    assert post("https://videos.example.org/a.mp4").status_code == 201
    for bad in (
        "http://www.youtube-nocookie.com/embed/abc",          # not https
        "https://evil.example.com/embed/abc",                 # host not listed
        "https://www.youtube-nocookie.com.evil.com/x",        # suffix trick
        "https://user:pw@www.youtube-nocookie.com/x",         # credentials
        "javascript:alert(1)",
    ):
        assert post(bad).status_code == 422, bad


# ---------- drafts hidden from learners ----------

def test_drafts_hidden_from_public_api(client, admin):
    _, h = admin
    pub_t = _track(client, h, "pub")
    draft_t = _track(client, h, "draft-track", status="draft")
    pub_m = _module(client, h, pub_t["id"], "pub-mod")
    draft_m = _module(client, h, pub_t["id"], "draft-mod", status="draft")
    under_draft_track = _module(client, h, draft_t["id"], "mod-in-draft-track")
    _section(client, h, pub_m["id"], "visible")
    _section(client, h, pub_m["id"], "hidden", status="draft")
    _section(client, h, draft_m["id"], "in-draft-module")

    body = client.get(f"{PUBLIC}/tracks").json()
    assert [t["slug"] for t in body["tracks"]] == ["pub"]
    assert [m["slug"] for m in body["tracks"][0]["modules"]] == ["pub-mod"]
    assert body["tracks"][0]["modules"][0]["section_count"] == 1

    mod = client.get(f"{PUBLIC}/modules/pub-mod").json()
    assert [s["slug"] for s in mod["sections"]] == ["visible"]
    assert client.get(f"{PUBLIC}/modules/draft-mod").status_code == 404
    assert client.get(f"{PUBLIC}/modules/mod-in-draft-track").status_code == 404
    assert client.get(f"{PUBLIC}/modules/does-not-exist").status_code == 404


def test_drafts_visible_to_admin(client, admin):
    _, h = admin
    t = _track(client, h, status="draft")
    assert [x["slug"] for x in client.get(f"{ADMIN}/tracks", headers=h).json()["tracks"]] == [t["slug"]]


# ---------- checkpoint answers ----------

CHECKPOINT = {"type": "checkpoint", "id": "cp", "question": "Pick b", "options": ["a", "b", "c"],
              "correct_index": 1, "explanation": "Because b."}


def _checkpoint_section(client, h):
    t = _track(client, h)
    m = _module(client, h, t["id"])
    return _section(client, h, m["id"], blocks=[CHECKPOINT])


def test_checkpoint_answers_not_leaked(client, admin):
    _, h = admin
    s = _checkpoint_section(client, h)
    raw = client.get(f"{PUBLIC}/modules/m1").text
    assert "correct_index" not in raw and "Because b." not in raw
    block = json.loads(raw)["sections"][0]["blocks"][0]
    assert block["question"] == "Pick b" and block["options"] == ["a", "b", "c"]
    # the admin view still has them
    assert "correct_index" in client.get(f"{ADMIN}/modules/{s['module_id']}", headers=h).text


def test_checkpoint_is_graded_by_backend(client, admin, learner):
    _, ah = admin
    s = _checkpoint_section(client, ah)
    _, lh = learner
    url = f"{PUBLIC}/sections/{s['id']}/checkpoints/cp/check"

    assert client.post(url, json={"selected_index": 1}).status_code == 401
    wrong = client.post(url, headers=lh, json={"selected_index": 0}).json()
    assert wrong == {"correct": False, "explanation": None, "section_completed": False}
    right = client.post(url, headers=lh, json={"selected_index": 1}).json()
    assert right == {"correct": True, "explanation": "Because b.", "section_completed": True}
    assert client.post(url, headers=lh, json={"selected_index": 4}).status_code == 422
    assert client.post(f"{PUBLIC}/sections/{s['id']}/checkpoints/nope/check", headers=lh,
                       json={"selected_index": 0}).status_code == 404


def test_checkpoint_not_gradable_when_unpublished(client, admin, learner):
    _, ah = admin
    s = _checkpoint_section(client, ah)
    client.patch(f"{ADMIN}/sections/{s['id']}", headers=ah, json={"status": "draft"})
    _, lh = learner
    r = client.post(f"{PUBLIC}/sections/{s['id']}/checkpoints/cp/check", headers=lh, json={"selected_index": 1})
    assert r.status_code == 404


# ---------- import ----------

def _counts(db):
    return (db.query(models.CourseTrack).count(), db.query(models.CourseModule).count(),
            db.query(models.CourseSection).count())


def test_import_loads_36_modules_and_is_idempotent(db):
    first = import_curriculum(db)
    assert _counts(db) == (4, 36, 340)
    assert first["modules"]["created"] == 36 and first["sections"]["created"] == 340

    second = import_curriculum(db)
    assert _counts(db) == (4, 36, 340)
    for entity in ("tracks", "modules", "sections"):
        assert second[entity]["created"] == 0 and second[entity]["updated"] == 0
    assert second["sections"]["unchanged"] == 340
    assert db.query(models.CourseSection).filter(models.CourseSection.status != "published").count() == 0


def test_import_preserves_text_and_converts_callouts(db):
    import_curriculum(db)
    a1 = db.query(models.CourseModule).filter_by(slug="track_a_a1_computing_foundations").one()
    assert [s.slug for s in a1.sections][:2] == ["sec-1", "sec-2"]
    assert a1.sections[0].blocks[0]["markdown"].startswith("A computer is fundamentally a machine")

    visuals = [b for s in db.query(models.CourseSection) for b in s.blocks if b["type"] == "visual"
               and b["kind"] != "tls-handshake"]
    assert len(visuals) == 41
    assert sum(1 for b in visuals if b["simulation"]) == 7
    assert all(b["kind"] == ("simulation" if b["simulation"] else "planned-interactive") for b in visuals)
    assert all("Interactive/Visual Requirement" not in b["description"] for b in visuals)


def test_import_keeps_text_except_the_trailing_rule():
    """Importing runs the same sanitiser as the admin API; it may drop only the stray
    '---' separator at the end of a section, never real text."""
    from course_content.import_curriculum import DEFAULT_SOURCE, clean_content, load_source
    mods = load_source(DEFAULT_SOURCE)["modules"]
    trimmed = 0
    for m in mods:
        for s in m["sections"]:
            text = [b for b in section_blocks(m["id"], s) if b["type"] == "text"]
            assert text and text[0]["markdown"] == clean_content(s["content"]), (m["id"], s["id"])
            assert not text[0]["markdown"].rstrip().endswith("---"), (m["id"], s["id"])
            if text[0]["markdown"] != s["content"].strip():
                trimmed += 1
                assert s["content"].strip().startswith(text[0]["markdown"][:40])
    assert trimmed == 44  # the sections that carried a stray separator


def test_no_team_member_names_in_learner_content():
    from course_content.import_curriculum import DEFAULT_SOURCE, load_source
    import re
    data = load_source(DEFAULT_SOURCE)
    blob = json.dumps(data, ensure_ascii=False)
    assert not re.search(r"(Inba|Vishnu|Priya)|[Tt]eammates?", blob)


def test_import_does_not_overwrite_admin_edits(client, admin, db):
    _, h = admin
    import_curriculum(db)
    sec = db.query(models.CourseSection).filter_by(slug="sec-1").first()
    client.patch(f"{ADMIN}/sections/{sec.id}", headers=h, json={"title": "Edited by admin"})
    stats = import_curriculum(db)
    db.expire_all()
    assert db.get(models.CourseSection, sec.id).title == "Edited by admin"
    assert stats["sections"]["skipped_admin_edited"] == 1


def test_imported_a3_pilot_and_public_read(client, db):
    import_curriculum(db)
    mod = client.get(f"{PUBLIC}/modules/track_a_a3_networking_foundations").json()
    assert len(mod["sections"]) == 10
    http = next(s for s in mod["sections"] if s["slug"] == "sec-7")
    tls = next(b for b in http["blocks"] if b["type"] == "visual")
    assert tls["kind"] == "tls-handshake" and tls["simulation"] is True
    cp = next(b for b in http["blocks"] if b["type"] == "checkpoint")
    assert "correct_index" not in cp and "explanation" not in cp
    assert "correct_index" not in json.dumps(client.get(f"{PUBLIC}/tracks").json())

    tracks = client.get(f"{PUBLIC}/tracks").json()["tracks"]
    assert [t["slug"] for t in tracks] == ["track-a", "track-b", "track-c", "track-d"]
    assert sum(len(t["modules"]) for t in tracks) == 36


# ---------- CLI ----------

def test_cli_create_and_revoke_admin(db):
    from course_content.cli import create_admin, revoke_admin
    user, outcome = create_admin(db, "root", "a-long-enough-password")
    assert (outcome, user.role) == ("created", "admin")
    with pytest.raises(ValueError):
        create_admin(db, "other", "short")
    assert revoke_admin(db, "ROOT").role == "learner"
    promoted, outcome = create_admin(db, "root")
    assert (outcome, promoted.role) == ("promoted", "admin")


# ---------- /api/auth/me ----------

def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_me_reports_stored_role(client, admin, learner):
    assert client.get("/api/auth/me", headers=admin[1]).json()["role"] == "admin"
    assert client.get("/api/auth/me", headers=learner[1]).json()["role"] == "learner"


# ---------- publish checklist gate ----------

BAD_CHECKPOINT = {"type": "checkpoint", "id": "cp", "question": "Pick b", "options": ["a", "b"], "correct_index": 1}


def _draft_section(client, h, blocks):
    t = _track(client, h)
    m = _module(client, h, t["id"])
    return _section(client, h, m["id"], blocks=blocks, status="draft")


def test_cannot_publish_checkpoint_without_explanation(client, admin):
    _, h = admin
    s = _draft_section(client, h, [BAD_CHECKPOINT])
    assert [i["id"] for i in s["checklist"] if not i["ok"]] == ["checkpoint_explanation"]

    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "published"})
    assert r.status_code == 422
    assert r.json()["detail"]["checklist"][0]["id"] == "checkpoint_explanation"

    fixed = {**BAD_CHECKPOINT, "explanation": "Because b."}
    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "published", "blocks": [fixed]})
    assert r.status_code == 200 and r.json()["status"] == "published"
    assert client.get(f"{PUBLIC}/modules/m1").json()["sections"][0]["id"] == s["id"]


def test_published_section_cannot_be_edited_into_a_failing_state(client, admin):
    _, h = admin
    s = _draft_section(client, h, [{"type": "text", "markdown": "ok"}])
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "published"}).status_code == 200
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"blocks": []}).status_code == 422
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"blocks": [BAD_CHECKPOINT]}).status_code == 422
    # drafts may be saved in any valid state
    client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "draft"})
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"blocks": [BAD_CHECKPOINT]}).status_code == 200


def test_create_published_section_is_gated(client, admin):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    r = client.post(f"{ADMIN}/sections", headers=h, json={
        "module_id": m["id"], "slug": "s", "title": "S", "status": "published", "blocks": []})
    assert r.status_code == 422


def test_video_captions_and_simulation_label_rules(client, admin, monkeypatch):
    _, h = admin
    monkeypatch.setenv("QCAPS_VIDEO_HOST_ALLOWLIST", "videos.example.org")
    video = {"type": "video", "title": "Intro", "url": "https://videos.example.org/a.mp4"}
    s = _draft_section(client, h, [video])
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "published"}).status_code == 422
    with_captions = {**video, "captions_url": "https://videos.example.org/a.vtt"}
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h,
                        json={"status": "published", "blocks": [with_captions]}).status_code == 200

    sim = {"type": "visual", "kind": "demo", "description": "A simulation of key exchange.", "simulation": False}
    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"blocks": [with_captions, sim]})
    assert r.status_code == 422 and r.json()["detail"]["checklist"][0]["id"] == "simulation_label"
    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h,
                     json={"blocks": [with_captions, {**sim, "simulation": True}]})
    assert r.status_code == 200


def test_checklist_is_admin_only(client, admin):
    _, h = admin
    s = _draft_section(client, h, [{"type": "text", "markdown": "x"}])
    client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"status": "published"})
    assert "checklist" in client.get(f"{ADMIN}/modules/{s['module_id']}", headers=h).text
    assert "checklist" not in client.get(f"{PUBLIC}/modules/m1").text


def test_admin_track_list_has_counts_and_stats(client, admin):
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    _section(client, h, m["id"], "a")
    _section(client, h, m["id"], "b", status="draft")
    body = client.get(f"{ADMIN}/tracks", headers=h).json()
    assert body["stats"] == {"tracks": 1, "modules": 1, "sections": 2, "draft_sections": 1}
    mod = body["tracks"][0]["modules"][0]
    assert (mod["section_count"], mod["draft_section_count"]) == (2, 1)


# ---------- optional section estimate (editor sends null for "no estimate") ----------

def test_section_estimated_minutes_may_be_cleared_but_module_minutes_may_not(client, admin):
    """Imported sections have no estimate. The editor sends null back on save, which must be accepted
    for a section (nullable column) while a module's estimate stays required."""
    _, h = admin
    t = _track(client, h)
    m = _module(client, h, t["id"])
    s = _section(client, h, m["id"])
    # section: null is a valid "no estimate", and the rest of the edit is applied
    r = client.patch(f"{ADMIN}/sections/{s['id']}", headers=h,
                     json={"title": "Renamed", "estimated_minutes": None, "summary": None})
    assert r.status_code == 200, r.text
    assert r.json()["title"] == "Renamed" and r.json()["estimated_minutes"] is None
    # module: still required
    assert client.patch(f"{ADMIN}/modules/{m['id']}", headers=h, json={"estimated_minutes": None}).status_code == 422
    # other required section fields stay required
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"title": None}).status_code == 422
    assert client.patch(f"{ADMIN}/sections/{s['id']}", headers=h, json={"blocks": None}).status_code == 422
