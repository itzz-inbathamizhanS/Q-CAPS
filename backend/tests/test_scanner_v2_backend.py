"""Backend handling of schema v2 scan results: findings count, XP, history, recommendations, PDF."""
import json
from datetime import datetime, timedelta, timezone

import pytest

import main
import models
import scan_receipts
from recommendation_scores import get_score_based_recommendation


def make_result(target="example.com", stamp="2026-10-03T12:00:00Z", findings=None, mode="standard", verified=False, kex="classical"):
    return {
        "target_url": target, "scan_timestamp": stamp, "schema_version": 2, "scanner_version": "2.0.0",
        "authorization": {"mode": mode, "ownership_verified": verified, "verified_domain": target if verified else None},
        "resolved_addresses": ["93.184.216.34"],
        "checks": {"dns": {"status": "ok", "duration_ms": 5}, "ct_subdomains": {"status": "failed", "reason": "timed out", "duration_ms": 10000}},
        "tls": {"version": "TLSv1.3", "cipher_suite": "TLS_AES_256_GCM_SHA384", "trusted": True,
                "key_exchange": {"classification": kex, "evidence": ["Server selected group X25519"]},
                "certificate": {"subject_cn": target, "issuer_cn": "Test CA", "public_key_algorithm": "ECDSA", "curve": "secp256r1",
                                "signature_algorithm": "ecdsa-with-SHA256", "not_after": "2027-01-01", "days_remaining": 90}},
        "pqc_posture": {"key_exchange": kex, "authentication": "classical", "summary": "Key exchange: classical only (X25519)."},
        "findings": findings if findings is not None else [
            {"id": "pqc.kex.classical_only", "category": "pqc", "severity": "medium", "title": "Key exchange is not post-quantum protected",
             "detail": "", "evidence": "Preferred group: X25519", "recommendation": "Enable a hybrid group.", "algorithm": "X25519"},
            {"id": "http.csp.missing", "category": "http", "severity": "low", "title": "No CSP", "detail": "", "evidence": "-",
             "recommendation": "Add one.", "algorithm": None},
            {"id": "pqc.auth.classical_certificate", "category": "pqc", "severity": "info", "title": "Classical certificate", "detail": "",
             "evidence": "ECDSA 256", "recommendation": "Plan.", "algorithm": "ECDSA"},
        ],
    }


@pytest.fixture
def learner(make_user):
    return make_user("scan-learner")


def post_log(client, user, headers, result):
    return client.post("/api/scanner/log", headers=headers, json={
        "user_id": user.id, "endpoint": "x", "status": "success", "details": json.dumps(result),
        "receipt": scan_receipts.issue_receipt(main.SECRET_KEY, user.id, result)})


def test_only_medium_and_high_findings_count():
    assert scan_receipts.count_findings(make_result()) == 1
    assert scan_receipts.count_findings(make_result(findings=[])) == 0
    legacy = {"crypto": {"vulnerabilities_found": ["a", "b"]}}
    assert scan_receipts.count_findings(legacy) == 2 and scan_receipts.count_findings([1, 2, 3]) == 3


def test_xp_is_flat_and_a_verified_full_scan_earns_more():
    assert scan_receipts.xp_for(make_result()) == 10
    assert scan_receipts.xp_for(make_result(findings=[])) == 10  # not proportional to findings
    assert scan_receipts.xp_for(make_result(mode="full", verified=True)) == 20
    assert scan_receipts.xp_for(make_result(mode="full", verified=False)) == 10
    forged = {"authorization": {"mode": "full", "ownership_verified": True}}  # no schema_version: not trusted
    assert scan_receipts.xp_for(forged) == 10


def test_summary_counts_by_severity():
    s = scan_receipts.summarize(make_result())
    assert s["counts"] == {"high": 0, "medium": 1, "low": 1, "info": 1} and s["key_exchange"] == "classical" and s["mode"] == "standard"
    assert scan_receipts.summarize({"crypto": {}})["schema_version"] is None


def test_xp_is_awarded_once_per_target_per_day(client, learner, db):
    user, h = learner
    first = post_log(client, user, h, make_result(stamp="2026-10-03T12:00:00Z"))
    again = post_log(client, user, h, make_result(stamp="2026-10-03T12:05:00Z"))
    other = post_log(client, user, h, make_result(target="example.org"))
    assert (first.json()["xp_awarded"], again.json()["xp_awarded"], other.json()["xp_awarded"]) == (10, 0, 10)
    assert again.status_code == 200  # the scan is still recorded
    db.refresh(user)
    assert user.xp == 20


def test_xp_is_available_again_on_a_later_day(client, learner, db):
    user, h = learner
    assert post_log(client, user, h, make_result(stamp="a")).json()["xp_awarded"] == 10
    log = db.query(models.ScannerLog).first()
    log.created_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=1, minutes=1)
    db.commit()
    assert post_log(client, user, h, make_result(stamp="b")).json()["xp_awarded"] == 10


def test_scan_history_is_scoped_to_the_user(client, learner, make_user):
    user, h = learner
    other, other_h = make_user("someone-else")
    post_log(client, user, h, make_result(target="example.com"))
    post_log(client, other, other_h, make_result(target="secret.example.org"))
    rows = client.get("/api/scanner/logs", headers=h).json()
    assert [r["target"] for r in rows] == ["example.com"]
    assert rows[0]["counts"]["medium"] == 1 and rows[0]["mode"] == "standard" and rows[0]["key_exchange"] == "classical"
    other_id = client.get("/api/scanner/logs", headers=other_h).json()[0]["id"]
    assert client.get(f"/api/scanner/logs/{other_id}", headers=h).status_code == 404
    assert client.get(f"/api/scanner/logs/{other_id}/report", headers=h).status_code == 404
    assert client.get("/api/scanner/logs").status_code == 401


def test_a_stored_result_can_be_reopened(client, learner):
    user, h = learner
    log_id = post_log(client, user, h, make_result()).json()["id"]
    body = client.get(f"/api/scanner/logs/{log_id}", headers=h).json()
    assert json.loads(body["details"])["schema_version"] == 2


def test_recommender_uses_v2_findings(db, learner):
    user, _ = learner
    db.add(models.ScannerLog(user_id=user.id, endpoint="example.com", status="success", vulnerabilities_found=1,
                             details=json.dumps(make_result())))
    db.commit()
    rec = get_score_based_recommendation(db, user.id)
    assert rec["scanner_risk"] == "Medium"


def test_recommender_ignores_info_findings_and_superseded_scans(db, learner):
    user, _ = learner
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    old = make_result(stamp="old")
    fixed = make_result(stamp="new", findings=[{"id": "pqc.kex.hybrid", "category": "pqc", "severity": "info", "title": "Hybrid PQC",
                                                "detail": "", "evidence": "X25519MLKEM768", "recommendation": "-", "algorithm": "X25519MLKEM768"}])
    db.add(models.ScannerLog(user_id=user.id, endpoint="example.com", status="success", details=json.dumps(old), created_at=now - timedelta(days=5)))
    db.add(models.ScannerLog(user_id=user.id, endpoint="example.com", status="success", details=json.dumps(fixed), created_at=now))
    db.commit()
    assert get_score_based_recommendation(db, user.id).get("scanner_risk") is None  # the newer scan no longer shows the exposure


def test_recommender_ignores_scans_older_than_90_days(db, learner):
    user, _ = learner
    db.add(models.ScannerLog(user_id=user.id, endpoint="example.com", status="success", details=json.dumps(make_result()),
                             created_at=datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=120)))
    db.commit()
    assert get_score_based_recommendation(db, user.id).get("scanner_risk") is None


def test_report_pdf_for_v2_and_legacy(client, learner):
    user, h = learner
    v2_id = post_log(client, user, h, make_result()).json()["id"]
    legacy = {"target_url": "old.example.com", "crypto": {"vulnerabilities_found": ["RSA certificate"], "notes": ["n"]}}
    legacy_id = post_log(client, user, h, legacy).json()["id"]
    for log_id in (v2_id, legacy_id):
        res = client.get(f"/api/scanner/logs/{log_id}/report", headers=h)
        assert res.status_code == 200 and res.headers["content-type"] == "application/pdf" and res.content.startswith(b"%PDF")


def test_report_text_states_failed_checks_and_has_no_breach_claims(db, learner):
    import scan_report
    user, _ = learner
    log = models.ScannerLog(id=1, user_id=user.id, endpoint="example.com", status="success", details=json.dumps(make_result()),
                            created_at=datetime.now(timezone.utc))
    captured = []
    original = scan_report._Writer.line
    scan_report._Writer.line = lambda self, text, *a, **k: (captured.append(str(text)), original(self, text, *a, **k))[1]
    try:
        scan_report.render_report(log)
    finally:
        scan_report._Writer.line = original
    text = "\n".join(captured)
    assert "ct_subdomains: failed - timed out" in text
    assert "Recommendation: Enable a hybrid group." in text
    assert "dark-web" in text and "No breach" in text  # stated as a limitation, never as a finding
