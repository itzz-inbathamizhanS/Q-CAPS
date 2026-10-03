"""Verified full scans become tracked assets with evidence and findings; everything stays private to the owner."""
import json
import uuid

import pytest
from sqlalchemy import create_engine, inspect, text

import database
import main
import models
from graph.projection import build_graph_projection
from services import evidence_service
from test_scanner_v2_backend import make_result, post_log

TLS_OK = {name: {"status": "ok", "duration_ms": 5} for name in
          ("dns", "http_headers", "tls_handshake", "tls_key_exchange", "certificate", "ports", "legacy_tls")}


def finding(fid, severity="medium", algorithm=None, title=None):
    return {"id": fid, "category": fid.split(".")[0], "severity": severity, "title": title or fid, "detail": "",
            "evidence": "e", "recommendation": "r", "algorithm": algorithm}


KEX = finding("pqc.kex.classical_only", "medium", "X25519", "Key exchange is not post-quantum protected")
HSTS = finding("http.hsts.missing", "medium", None, "HSTS is not set")
CSP = finding("http.csp.missing", "low", None, "No CSP")


def full_result(findings, stamp="t1", target="example.com", checks=None):
    result = make_result(target=target, stamp=stamp, findings=findings, mode="full", verified=True)
    result["checks"] = checks if checks is not None else dict(TLS_OK)
    return result


@pytest.fixture
def learner(make_user):
    return make_user("asset-owner")


def rows(db, model, **filters):
    return db.query(model).filter_by(**filters).all()


# ---------------------------------------------------------------- ingestion

def test_standard_and_unverified_scans_are_not_tracked(client, learner, db):
    user, h = learner
    post_log(client, user, h, make_result(findings=[KEX]))
    post_log(client, user, h, make_result(target="b.example.com", mode="full", verified=False, findings=[KEX]))
    assert db.query(models.Asset).count() == 0 and db.query(models.Finding).count() == 0
    assert client.get("/api/scanner/assets", headers=h).json() == []


def test_a_verified_full_scan_creates_asset_evidence_and_findings(client, learner, db):
    user, h = learner
    res = post_log(client, user, h, full_result([KEX, HSTS, CSP]))
    assert res.status_code == 200 and res.json()["xp_awarded"] == 20
    asset = db.query(models.Asset).one()
    assert (asset.owner_user_id, asset.canonical_target, asset.asset_type) == (user.id, "example.com", "domain")
    evidence = db.query(models.Evidence).one()
    assert evidence.asset_id == asset.id and evidence.authorization_context == "domain_verified" and evidence.scanner_version == "2.0.0"
    assert evidence.normalized_payload["tls_version"] == "TLSv1.3"
    stored = {f.finding_type: f for f in db.query(models.Finding).all()}
    assert set(stored) == {"pqc.kex.classical_only", "http.hsts.missing"}  # low/info items are advice, not tracked exposures
    assert stored["pqc.kex.classical_only"].status == "OPEN" and stored["pqc.kex.classical_only"].algorithm == "X25519"
    assert stored["pqc.kex.classical_only"].title == "Key exchange is not post-quantum protected"
    assert stored["pqc.kex.classical_only"].evidence_id == evidence.id


def test_findings_are_resolved_only_when_the_supporting_check_completed(client, learner, db):
    user, h = learner
    post_log(client, user, h, full_result([KEX, HSTS], stamp="t1"))
    # Second scan: the key exchange is fixed (hybrid), but the header check failed, so HSTS is unknown, not fixed.
    checks = dict(TLS_OK)
    checks["http_headers"] = {"status": "failed", "reason": "timed out", "duration_ms": 5}
    post_log(client, user, h, full_result([], stamp="t2", checks=checks))
    status = {f.finding_type: f.status for f in db.query(models.Finding).all()}
    assert status == {"pqc.kex.classical_only": "RESOLVED", "http.hsts.missing": "OPEN"}
    # Third scan: headers now checked and clean.
    post_log(client, user, h, full_result([], stamp="t3"))
    assert {f.status for f in db.query(models.Finding).all()} == {"RESOLVED"}


def test_a_resolved_finding_reopens_when_observed_again(client, learner, db):
    user, h = learner
    post_log(client, user, h, full_result([KEX], stamp="t1"))
    post_log(client, user, h, full_result([], stamp="t2"))
    first_seen = db.query(models.Finding).one().first_seen
    post_log(client, user, h, full_result([KEX], stamp="t3"))
    row = db.query(models.Finding).one()
    assert row.status == "OPEN" and row.first_seen == first_seen
    assert db.query(models.Asset).count() == 1 and db.query(models.Evidence).count() == 3


def test_ingestion_failure_does_not_lose_the_scan_log_or_xp(client, learner, db, monkeypatch):
    user, h = learner

    def boom(*a, **k):
        raise RuntimeError("ingestion bug")

    monkeypatch.setattr(evidence_service, "ingest_scan", boom)
    res = post_log(client, user, h, full_result([KEX]))
    assert res.status_code == 200 and res.json()["xp_awarded"] == 20
    assert db.query(models.ScannerLog).count() == 1 and db.query(models.Asset).count() == 0
    db.refresh(user)
    assert user.xp == 20


# ---------------------------------------------------------------- asset API + privacy

def test_asset_endpoints_list_own_assets_and_findings_only(client, make_user, db):
    alice, alice_h = make_user("alice")
    bob, bob_h = make_user("bob")
    post_log(client, alice, alice_h, full_result([KEX, HSTS], stamp="a1"))
    post_log(client, alice, alice_h, full_result([HSTS], stamp="a2"))
    assets = client.get("/api/scanner/assets", headers=alice_h).json()
    assert [(a["target"], a["open_findings"], a["resolved_findings"]) for a in assets] == [("example.com", 1, 1)]
    assert assets[0]["last_scanned"] is not None
    detail = client.get(f"/api/scanner/assets/{assets[0]['id']}/findings", headers=alice_h).json()
    assert [(f["finding_type"], f["status"], f["severity"]) for f in detail] == [
        ("http.hsts.missing", "OPEN", "medium"), ("pqc.kex.classical_only", "RESOLVED", "medium")]
    assert detail[1]["title"] == "Key exchange is not post-quantum protected"

    assert client.get("/api/scanner/assets", headers=bob_h).json() == []
    assert client.get(f"/api/scanner/assets/{assets[0]['id']}/findings", headers=bob_h).status_code == 404
    assert client.get("/api/scanner/assets").status_code == 401


def test_evidence_and_findings_of_one_user_are_not_readable_by_another(client, make_user, db):
    alice, alice_h = make_user("alice")
    _, bob_h = make_user("bob")
    _, admin_h = make_user("root", "admin")
    post_log(client, alice, alice_h, full_result([KEX]))
    evidence_id = db.query(models.Evidence).one().id
    finding_id = db.query(models.Finding).one().id
    db.add(models.Intervention(id="iv1", finding_id=finding_id, intervention_type="module"))
    db.commit()

    for url in (f"/api/evidence/{evidence_id}", f"/api/findings/{finding_id}", "/api/interventions/iv1"):
        assert client.get(url, headers=alice_h).status_code == 200, url
        assert client.get(url, headers=admin_h).status_code == 200, url
        assert client.get(url, headers=bob_h).status_code == 404, url  # same answer as for an id that does not exist
    assert client.get(f"/api/findings/{finding_id}/interventions", headers=bob_h).status_code == 404
    assert [i["id"] for i in client.get(f"/api/findings/{finding_id}/interventions", headers=alice_h).json()] == ["iv1"]
    assert client.get(f"/api/closures/{finding_id}", headers=bob_h).json() == []
    verify = client.post("/api/interventions/iv1/verify", headers=bob_h, json={"before_evidence_id": evidence_id})
    assert verify.status_code == 404


def test_ownerless_records_stay_shared(client, learner, db):
    _, h = learner
    asset = models.Asset(canonical_target="shared.example.org", asset_type="domain")
    db.add(asset)
    db.flush()
    db.add(models.Finding(id="f-shared", asset_id=asset.id, finding_type="x", severity=0.5, confidence=0.5))
    db.commit()
    assert client.get("/api/findings/f-shared", headers=h).status_code == 200


def test_recommendation_graph_excludes_other_users_assets(client, make_user, db):
    alice, alice_h = make_user("alice")
    bob, _ = make_user("bob")
    post_log(client, alice, alice_h, full_result([KEX]))
    shared = models.Asset(canonical_target="shared.example.org", asset_type="domain")
    db.add(shared)
    db.commit()
    own_id = db.query(models.Asset).filter_by(owner_user_id=alice.id).one().id
    node_ids = lambda user: {n.id for n in build_graph_projection(db, user.id).nodes}  # noqa: E731
    assert f"asset_{own_id}" in node_ids(alice) and f"asset_{shared.id}" in node_ids(alice)
    assert f"asset_{own_id}" not in node_ids(bob) and f"asset_{shared.id}" in node_ids(bob)


# ---------------------------------------------------------------- additive schema migration

def test_ensure_schema_adds_the_new_columns_to_existing_databases(monkeypatch):
    engine = create_engine("sqlite://")
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE assets (id INTEGER PRIMARY KEY, canonical_target VARCHAR NOT NULL, asset_type VARCHAR NOT NULL)"))
        conn.execute(text("CREATE TABLE findings (id VARCHAR PRIMARY KEY, finding_type VARCHAR NOT NULL)"))
        conn.execute(text("INSERT INTO assets (canonical_target, asset_type) VALUES ('old.example.com', 'domain')"))
    monkeypatch.setattr(database, "engine", engine)
    database.ensure_schema()
    database.ensure_schema()  # idempotent
    insp = inspect(engine)
    assert "owner_user_id" in {c["name"] for c in insp.get_columns("assets")}
    assert "title" in {c["name"] for c in insp.get_columns("findings")}
    with engine.connect() as conn:
        assert conn.execute(text("SELECT owner_user_id FROM assets")).scalar() is None  # existing rows stay shared
