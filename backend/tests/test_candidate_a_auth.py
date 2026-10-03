"""Evidence, findings, interventions, closures and capabilities must not be reachable anonymously.

Policy: reads and verify need a login; creating evidence/findings/interventions is admin-only
(the frontend never creates them); a learner's capabilities are readable by that learner or an admin.
There is no per-user owner column on evidence/findings yet, so these are authentication gates,
not object-level ownership checks.
"""
import pytest

READS = [
    ("get", "/api/evidence/nope"),
    ("get", "/api/findings/nope"),
    ("get", "/api/interventions/nope"),
    ("get", "/api/closures/nope"),
    ("get", "/api/users/1/capabilities"),
]
WRITES = [
    ("post", "/api/evidence", {}),
    ("post", "/api/findings", {}),
    ("post", "/api/interventions", {}),
    ("post", "/api/interventions/nope/verify", {}),
]


@pytest.mark.parametrize("method,url", READS)
def test_reads_require_login(client, method, url):
    assert getattr(client, method)(url).status_code == 401


@pytest.mark.parametrize("method,url,body", WRITES)
def test_writes_require_login(client, method, url, body):
    assert getattr(client, method)(url, json=body).status_code == 401


@pytest.mark.parametrize("url", ["/api/evidence", "/api/findings", "/api/interventions"])
def test_creating_is_admin_only(client, learner, url):
    _, headers = learner
    assert client.post(url, json={}, headers=headers).status_code == 403


def test_logged_in_read_of_missing_object_is_404_not_401(client, learner):
    _, headers = learner
    assert client.get("/api/evidence/nope", headers=headers).status_code == 404
    assert client.get("/api/findings/nope", headers=headers).status_code == 404
    assert client.get("/api/interventions/nope", headers=headers).status_code == 404


def test_capabilities_owner_and_admin_only(client, make_user):
    alice, alice_h = make_user("alice")
    _, bob_h = make_user("bob")
    _, admin_h = make_user("root", "admin")
    url = f"/api/users/{alice.id}/capabilities"
    assert client.get(url, headers=alice_h).status_code == 200
    assert client.get(url, headers=bob_h).status_code == 403
    assert client.get(url, headers=admin_h).status_code == 200


def test_finding_interventions_requires_login_and_lists_for_finding(client, learner, admin, db):
    import models
    assert client.get("/api/findings/f1/interventions").status_code == 401
    _, lh = learner
    assert client.get("/api/findings/f1/interventions", headers=lh).status_code == 404
    db.add(models.Finding(id="f1", finding_type="RSA_CERTIFICATE", severity=1.0, confidence=1.0))
    db.add(models.Intervention(id="i1", finding_id="f1", intervention_type="LAB_REMEDIATION"))
    db.add(models.Intervention(id="i2", finding_id="other", intervention_type="THEORY_MODULE"))
    db.commit()
    res = client.get("/api/findings/f1/interventions", headers=lh)
    assert res.status_code == 200
    assert [i["id"] for i in res.json()] == ["i1"]


def test_leaderboard_requires_login(client, learner):
    assert client.get("/api/leaderboard").status_code == 401
    _, headers = learner
    res = client.get("/api/leaderboard", headers=headers)
    assert res.status_code == 200 and isinstance(res.json(), list)
