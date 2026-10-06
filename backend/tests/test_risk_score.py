"""Risk score v1 (risk/score.py): factors, Unknown when context is missing, determinism, stored version."""
import pytest

import models
from risk import score as rm
from test_scan_assets import KEX, finding, full_result
from test_scanner_v2_backend import post_log

OLD_TLS = finding("tls.version.obsolete", "high", None, "Obsolete TLS version negotiated")


# ---------------------------------------------------------------- factors

def test_exposure_is_severity_times_confidence_and_clamped():
    assert rm.exposure(0.9, 0.5) == pytest.approx(0.45)
    assert rm.exposure(1.5, 2.0) == 1.0
    assert rm.exposure(None, 1.0) is None


def test_asset_criticality_levels():
    assert [rm.asset_criticality(x) for x in ("low", "medium", "high", "critical")] == [0.25, 0.5, 0.75, 1.0]
    assert rm.asset_criticality(None) is None and rm.asset_criticality("bogus") is None


def test_pqc_dependency_only_for_quantum_vulnerable_findings():
    assert rm.pqc_dependency("pqc.kex.classical_only") == 1.0
    assert rm.pqc_dependency("pqc.auth.classical_certificate") == 1.0
    assert rm.pqc_dependency("tls.kex.no_forward_secrecy") == 1.0
    assert rm.pqc_dependency("tls.version.obsolete") == 0.0
    assert rm.pqc_dependency("pqc.kex.hybrid") == 0.0


def test_migration_urgency_saturates_at_the_horizon_and_needs_sensitive_data():
    assert rm.migration_urgency(7.5, "restricted") == pytest.approx(0.5)
    assert rm.migration_urgency(40, "restricted") == 1.0
    assert rm.migration_urgency(40, "public") == 0.0
    assert rm.migration_urgency(-3, "restricted") == 0.0
    assert rm.migration_urgency(None, "restricted") is None
    assert rm.migration_urgency(10, None) is None


def test_missing_context_is_unknown_not_zero_or_default():
    r = rm.score(finding_type="pqc.kex.classical_only", severity=0.6, confidence=1.0, criticality_level=None,
                 confidentiality_years=None, data_sensitivity=None)
    assert r["score"] is None
    assert r["missing"] == ["asset criticality", "confidentiality lifetime or data sensitivity"]
    assert r["validated"] is False and r["model_version"] == rm.RISK_MODEL_VERSION


def test_score_is_the_product_and_deterministic():
    kw = dict(finding_type="pqc.kex.classical_only", severity=0.6, confidence=1.0, criticality_level="high",
              confidentiality_years=15, data_sensitivity="restricted")
    a, b = rm.score(**kw), rm.score(**kw)
    assert a == b
    assert a["score"] == pytest.approx(0.6 * 0.75 * 1.0 * 1.0)


# ---------------------------------------------------------------- storage and API

@pytest.fixture
def scanned(client, learner, db):
    user, h = learner
    post_log(client, user, h, full_result([KEX, OLD_TLS]))
    asset = db.query(models.Asset).one()
    findings = {f.finding_type: f for f in db.query(models.Finding).all()}
    return user, h, asset, findings


def test_scan_ingest_stores_unknown_scores_with_inputs(client, db, scanned):
    _, h, _, findings = scanned
    body = client.get(f"/api/findings/{findings['pqc.kex.classical_only'].id}/risk", headers=h).json()
    assert body["score"] is None and "asset criticality" in body["missing"]
    assert body["model_version"] == "risk-v1" and body["validated"] is False
    assert body["inputs"]["severity"] == pytest.approx(0.6)


def test_setting_the_context_rescores_and_is_audited(client, db, scanned):
    user, h, asset, findings = scanned
    ctx = {"criticality_level": "critical", "data_sensitivity": "confidential", "confidentiality_years": 10}
    r = client.put(f"/api/assets/{asset.id}/context", headers=h, json=ctx)
    assert r.status_code == 200 and r.json()["rescored_findings"] == 2
    kex = client.get(f"/api/findings/{findings['pqc.kex.classical_only'].id}/risk", headers=h).json()
    # exposure = severity 0.6 x the evidence confidence the scan recorded
    assert kex["factors"]["exposure"] == pytest.approx(0.6 * kex["inputs"]["confidence"])
    assert kex["score"] == pytest.approx(round(kex["factors"]["exposure"] * 1.0 * 1.0 * (10 / 15) * 0.67, 4))
    old_tls = client.get(f"/api/findings/{findings['tls.version.obsolete'].id}/risk", headers=h).json()
    assert old_tls["score"] == 0.0 and old_tls["factors"]["pqc_dependency"] == 0.0  # real problem, not PQC risk
    assert db.query(models.RiskScore).count() == 4  # history kept: two Unknown rows, two scored rows
    audit = db.query(models.AuditEvent).filter_by(action="asset.context").one()
    assert audit.details["after"]["criticality_level"] == "critical"
    listed = client.get("/api/scanner/assets", headers=h).json()[0]
    assert listed["criticality_level"] == "critical" and listed["can_manage"] is True


def test_context_values_are_validated(client, scanned):
    _, h, asset, _ = scanned
    assert client.put(f"/api/assets/{asset.id}/context", headers=h, json={"criticality_level": "extreme"}).status_code == 422
    assert client.put(f"/api/assets/{asset.id}/context", headers=h, json={"confidentiality_years": 500}).status_code == 422


def test_only_managers_set_context_and_others_cannot_read_risk(client, db, scanned, make_user):
    _, _, asset, findings = scanned
    _, other = make_user("someone-else")
    assert client.put(f"/api/assets/{asset.id}/context", headers=other, json={}).status_code == 404
    assert client.get(f"/api/findings/{findings['pqc.kex.classical_only'].id}/risk", headers=other).status_code == 404


def test_backfill_scores_findings_recorded_before_the_model(client, db, scanned):
    from risk.service import backfill
    db.query(models.RiskScore).delete()
    db.commit()
    assert backfill(db) == 2
    assert backfill(db) == 0
