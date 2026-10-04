"""Risk-to-skill mapping (content/curriculum/requirement_map.json): finding -> requirement -> competencies."""
import re
from pathlib import Path

import pytest

import models
from competency import requirements
from competency.seed import load_model, model_competencies, seed_competencies
from services import evidence_service
from test_scan_assets import KEX, HSTS, TLS_OK, finding, full_result
from test_scanner_v2_backend import post_log

FINDINGS_SOURCE = Path(__file__).resolve().parents[1] / "scanner_api" / "scanner" / "findings.py"
CERT_SIG = finding("pqc.auth.classical_certificate", "info", "ECDSA", "Certificate uses classical signatures")
HYBRID = finding("pqc.kex.hybrid", "info", "X25519MLKEM768", "Hybrid post-quantum key exchange in use")
CAA = finding("dns.caa.missing", "info", None, "No CAA record")


def scanner_finding_types():
    """Every finding id the scanner can emit. Templated ids (f"tls.legacy.{key}") are reduced to a sample."""
    ids = re.findall(r'_f\(\s*f?"([a-z0-9_.{}]+)"', FINDINGS_SOURCE.read_text(encoding="utf-8"))
    ids += re.findall(r'^\s+"((?:pqc|tls|cert|http|dns|exposure)\.[a-z0-9_.]+)", "', FINDINGS_SOURCE.read_text(encoding="utf-8"), re.M)
    return sorted({re.sub(r"\{[^}]+\}", "sample", i) for i in ids})


# ---------------------------------------------------------------- the map itself

def test_every_scanner_finding_type_is_mapped_or_explicitly_unmapped():
    types = scanner_finding_types()
    assert {"pqc.kex.classical_only", "pqc.auth.classical_certificate", "tls.legacy.sample", "exposure.port.sample"} <= set(types)
    gaps = [t for t in types if requirements.classify(t) == "unknown"]
    assert gaps == [], f"finding types with no rule and no unmapped_by_design entry: {gaps}"


def test_map_references_only_model_competencies_and_requirable_levels():
    data = requirements.load_map()
    codes = {c["code"] for c in model_competencies(load_model())}
    assert requirements.validate_map(data, codes) == []
    assert data["status"] == "proposed-unreviewed"  # a draft must not present itself as reviewed


def test_validation_catches_bad_rules():
    data = {"version": "x", "status": "s", "positive_evidence": [], "unmapped_by_design": [], "rules": [
        {"requirement_id": "R", "match": {}, "requirement": "r", "pqc_relevant": "yes",
         "competencies": [{"id": "NOPE.1", "required_level": "Beginner"}]}]}
    errors = requirements.validate_map(data, {"PQC.6"})
    assert any("exactly one" in e for e in errors)
    assert any("pqc_relevant" in e for e in errors)
    assert any("unknown competency NOPE.1" in e for e in errors)
    assert any("required_level Beginner" in e for e in errors)


def test_matching_is_exact_or_prefix_and_first_rule_wins():
    assert requirements.rule_for("pqc.kex.classical_only")["requirement_id"] == "REQ.KEX.HYBRID"
    assert requirements.rule_for("pqc.kex.hybrid") is None
    assert requirements.classify("pqc.kex.hybrid") == "positive_evidence"
    assert requirements.rule_for("cert.expired")["requirement_id"] == "REQ.PKI.LIFECYCLE"
    assert requirements.rule_for("exposure.port.3389")["requirement_id"] == "REQ.NET.EXPOSURE"
    assert requirements.classify("http.hsts.missing") == "unmapped_by_design"
    assert requirements.classify("made.up.type") == "unknown"


# ---------------------------------------------------------------- ingestion

@pytest.fixture
def owner(make_user, db):
    seed_competencies(db)
    return make_user("asset-owner")


def reqs(db, finding_type):
    f = db.query(models.Finding).filter_by(finding_type=finding_type).one()
    return {(r.requirement_id, r.competency_code, r.required_level)
            for r in db.query(models.FindingRequirement).filter_by(finding_id=f.id)}


def test_a_scan_derives_requirements_and_counts_unmapped_findings(client, owner, db):
    user, h = owner
    post_log(client, user, h, full_result([KEX, HSTS]))
    assert reqs(db, "pqc.kex.classical_only") == {
        ("REQ.KEX.HYBRID", "NET.4", "Proficient"), ("REQ.KEX.HYBRID", "PQC.6", "Proficient"),
        ("REQ.KEX.HYBRID", "PQC.3", "Developing"), ("REQ.KEX.HYBRID", "PQC.1", "Developing")}
    assert reqs(db, "http.hsts.missing") == set()  # tracked, but unmapped by design

    summary = evidence_service.ingest_scan(db, user, full_result([KEX, HSTS], stamp="t9"))
    assert summary["unmapped"] == 1


def test_rescanning_is_idempotent(client, owner, db):
    user, h = owner
    for stamp in ("t1", "t2", "t3"):
        post_log(client, user, h, full_result([KEX], stamp=stamp))
    assert db.query(models.FindingRequirement).count() == 4


def test_info_certificate_finding_is_tracked_and_mapped_but_other_info_items_are_not(client, owner, db):
    user, h = owner
    post_log(client, user, h, full_result([CERT_SIG, HYBRID, CAA]))
    stored = {f.finding_type: f for f in db.query(models.Finding).all()}
    assert set(stored) == {"pqc.auth.classical_certificate"}
    assert stored["pqc.auth.classical_certificate"].severity == pytest.approx(0.3)
    assert reqs(db, "pqc.auth.classical_certificate") == {
        ("REQ.PKI.PQC_SIG", "CRYPTO.4", "Proficient"), ("REQ.PKI.PQC_SIG", "PQC.3", "Developing"),
        ("REQ.PKI.PQC_SIG", "PQC.8", "Developing")}
    listed = client.get(f"/api/scanner/assets/{stored['pqc.auth.classical_certificate'].asset_id}/findings", headers=h).json()
    assert [f["severity"] for f in listed] == ["info"]


def test_info_certificate_finding_resolves_only_after_a_completed_certificate_check(client, owner, db):
    user, h = owner
    post_log(client, user, h, full_result([CERT_SIG], stamp="t1"))
    failed = dict(TLS_OK)
    failed["certificate"] = {"status": "failed", "reason": "timeout", "duration_ms": 5}
    post_log(client, user, h, full_result([], stamp="t2", checks=failed))
    assert db.query(models.Finding).one().status == "OPEN"  # unknown is not fixed
    post_log(client, user, h, full_result([], stamp="t3"))
    assert db.query(models.Finding).one().status == "RESOLVED"


# ---------------------------------------------------------------- API

def test_requirements_endpoint_returns_the_rule_and_competency_names(client, owner, db):
    user, h = owner
    post_log(client, user, h, full_result([KEX]))
    fid = db.query(models.Finding).one().id
    body = client.get(f"/api/findings/{fid}/requirements", headers=h).json()
    assert {r["competency_code"] for r in body} == {"NET.4", "PQC.6", "PQC.3", "PQC.1"}
    pqc6 = next(r for r in body if r["competency_code"] == "PQC.6")
    assert pqc6["requirement"] == "Plan hybrid / post-quantum key establishment for TLS"
    assert pqc6["competency_name"] == "hybrid modes and crypto-agility"
    assert pqc6["required_level"] == "Proficient" and pqc6["pqc_relevant"] is True
    assert pqc6["map_status"] == "proposed-unreviewed"


def test_another_user_cannot_read_the_requirements(client, owner, make_user, db):
    user, h = owner
    post_log(client, user, h, full_result([KEX]))
    fid = db.query(models.Finding).one().id
    _, other = make_user("someone-else")
    assert client.get(f"/api/findings/{fid}/requirements", headers=other).status_code == 404
    assert client.get("/api/findings/does-not-exist/requirements", headers=h).status_code == 404


def test_backfill_maps_findings_recorded_before_the_map(client, owner, db):
    user, h = owner
    post_log(client, user, h, full_result([KEX, HSTS]))
    db.query(models.FindingRequirement).delete()
    db.commit()

    assert requirements.backfill(db) == {"map_version": "proposed-v1", "mapped": 1, "unmapped": 1}
    assert len(reqs(db, "pqc.kex.classical_only")) == 4
    # Already-mapped findings are skipped; unmapped ones are re-checked (cheap, and picks up new rules).
    assert requirements.backfill(db)["mapped"] == 0
