"""Server-authoritative closure verification and the hash-chained closure events (closure/service.py)."""
import pytest

import models
from closure import service as closure_service
from closure.service import verify_chain
from competency.seed import seed_competencies
from test_scan_assets import KEX, full_result
from test_scanner_v2_backend import post_log


@pytest.fixture
def setup(client, db, make_user):
    seed_competencies(db)
    owner, h = make_user("owner")
    post_log(client, owner, h, full_result([KEX], stamp="t1"))
    finding = db.query(models.Finding).one()
    pqc6 = db.query(models.Competency).filter_by(code="PQC.6").one()
    db.add(models.Intervention(id="iv1", finding_id=finding.id, competency_id=pqc6.id, intervention_type="module",
                               module_id="track_d_e4_crypto_agility"))
    db.commit()
    return owner, h, finding, pqc6


def set_level(db, user, comp, level):
    row = db.query(models.LearnerCapability).filter_by(user_id=user.id, competency_id=comp.id).one_or_none()
    if row is None:
        row = models.LearnerCapability(user_id=user.id, competency_id=comp.id)
        db.add(row)
    row.level = level
    db.commit()


def events(db, finding_id):
    return db.query(models.ClosureEvent).filter_by(finding_id=finding_id).order_by(models.ClosureEvent.created_at).all()


def test_an_open_finding_is_not_closed_and_the_attempt_is_recorded(client, db, setup):
    owner, h, finding, _ = setup
    r = client.post("/api/interventions/iv1/verify", headers=h, json={})
    body = r.json()
    assert r.status_code == 200
    assert body["status"] == "OPEN" and body["technical_ok"] is False and body["learner_result_ok"] is False
    assert body["learner"]["level"] == "Unknown" and body["learner"]["required_level"] == "Proficient"
    v = db.query(models.Verification).one()
    assert v.verifier_version == "closure-v2" and v.before_evidence_id == finding.evidence_id
    assert [e.new_state for e in events(db, finding.id)] == ["OPEN"]


def test_closed_only_when_resolved_by_a_verified_scan_and_the_level_is_reached(client, db, setup):
    # Service-level: the estimator is bypassed so the learner side can be set to exact levels.
    owner, h, finding, pqc6 = setup
    intervention = db.get(models.Intervention, "iv1")
    set_level(db, owner, pqc6, "Developing")
    assert closure_service.verify(db, intervention)["status"] == "OPEN"  # below Proficient, finding open

    set_level(db, owner, pqc6, "Proficient")
    assert closure_service.verify(db, intervention)["status"] == "PARTIALLY_CLOSED"  # learner ok, finding still open

    post_log(client, owner, h, full_result([], stamp="t2"))  # key-exchange check completed, finding gone
    db.refresh(finding)
    assert finding.status == "RESOLVED"
    set_level(db, owner, pqc6, "Proficient")
    closed = closure_service.verify(db, intervention)
    assert closed["status"] == "CLOSED" and closed["technical_ok"] is True
    assert closed["technical"]["after_evidence_id"] != closed["technical"]["before_evidence_id"]

    chain = events(db, finding.id)
    assert [(e.previous_state, e.new_state) for e in chain] == [
        ("OPEN", "OPEN"), ("OPEN", "PARTIALLY_CLOSED"), ("PARTIALLY_CLOSED", "CLOSED")]
    assert chain[1].previous_event_hash == chain[0].event_hash
    assert verify_chain(chain)


def test_the_endpoint_does_not_trust_a_level_without_evidence(client, db, setup):
    owner, h, _, pqc6 = setup
    set_level(db, owner, pqc6, "Advanced")  # written directly, no answers or practicals behind it
    body = client.post("/api/interventions/iv1/verify", headers=h, json={}).json()
    assert body["learner"]["level"] == "Unknown" and body["learner_result_ok"] is False


def test_tampering_with_a_closure_event_breaks_the_chain(client, db, setup):
    _, h, finding, _ = setup
    client.post("/api/interventions/iv1/verify", headers=h, json={})
    client.post("/api/interventions/iv1/verify", headers=h, json={})
    chain = events(db, finding.id)
    assert verify_chain(chain)
    chain[0].new_state = "CLOSED"
    assert not verify_chain(chain)


def test_client_supplied_results_are_rejected(client, db, setup):
    _, h, _, _ = setup
    for field in ("learner_result", "after_scan_raw", "technical_result"):
        r = client.post("/api/interventions/iv1/verify", headers=h, json={field: {"knowledge_score": 1.0}})
        assert r.status_code == 422, field
    assert db.query(models.Verification).count() == 0


def test_only_the_owner_or_an_admin_can_verify(client, db, setup, make_user):
    _, _, finding, _ = setup
    _, stranger = make_user("stranger")
    _, admin = make_user("root", "admin")
    assert client.post("/api/interventions/iv1/verify", headers=stranger, json={}).status_code == 404
    assert client.post("/api/interventions/iv1/verify", headers=admin, json={}).status_code == 200


def test_ownerless_records_are_verified_by_admins_only(client, db, make_user):
    seed_competencies(db)
    _, h = make_user("learner")
    asset = models.Asset(canonical_target="shared.example.org", asset_type="domain")
    db.add(asset)
    db.flush()
    db.add(models.Finding(id="f-shared", asset_id=asset.id, finding_type="pqc.kex.classical_only", severity=0.6, confidence=0.5))
    db.add(models.Intervention(id="iv-shared", finding_id="f-shared", intervention_type="module"))
    db.commit()
    assert client.post("/api/interventions/iv-shared/verify", headers=h, json={}).status_code == 403


def test_a_stored_verification_becomes_operational_evidence(client, db, setup):
    owner, h, finding, pqc6 = setup
    post_log(client, owner, h, full_result([], stamp="t2"))  # resolved
    client.post("/api/interventions/iv1/verify", headers=h, json={})
    cap = db.query(models.LearnerCapability).filter_by(user_id=owner.id, competency_id=pqc6.id).one()
    assert cap.operational_score == 1.0


def test_closures_endpoint_lists_events_in_order(client, db, setup):
    _, h, finding, _ = setup
    client.post("/api/interventions/iv1/verify", headers=h, json={})
    client.post("/api/interventions/iv1/verify", headers=h, json={})
    body = client.get(f"/api/closures/{finding.id}", headers=h).json()
    assert len(body) == 2 and body[1]["previous_event_hash"] == body[0]["event_hash"]
