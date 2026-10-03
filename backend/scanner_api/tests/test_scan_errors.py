"""A scan that could not run must be reported as an error, never as findings.

Regression: an unresolvable or restricted target used to come back as HTTP 200 with the error text inside
crypto.vulnerabilities_found, so the UI listed "getaddrinfo failed" as a vulnerability, scored a threat
level and awarded XP for a scan that never happened.
"""
import os
import sys

os.environ["QCAPS_JWT_SECRET"] = "test-secret-not-for-production-use-0123456789"
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import jwt
import pytest

import api
import scanner_engine


@pytest.fixture
def client():
    api._history.clear()
    api._active_users.clear()
    return api.app.test_client()


@pytest.fixture
def headers():
    token = jwt.encode({"sub": "1"}, os.environ["QCAPS_JWT_SECRET"], algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


def test_unresolvable_target_is_an_error_without_findings():
    result = scanner_engine.analyze_domain("qcaps-nonexistent-test.invalid")
    assert "error" in result
    # An error is not a result: no findings, checks or posture are attached to it.
    assert "findings" not in result and "crypto" not in result


def test_api_returns_4xx_for_a_scan_that_could_not_run(client, headers):
    res = client.post("/api/scan", json={"url": "qcaps-nonexistent-test.invalid"}, headers=headers)
    assert res.status_code == 422
    body = res.get_json()
    assert "error" in body and "crypto" not in body


def test_successful_scan_is_passed_through_with_a_receipt(client, headers, monkeypatch):
    fake = {"target_url": "example.com", "crypto": {"vulnerabilities_found": ["real finding"], "score": 1.0}}
    monkeypatch.setattr(api, "analyze_domain", lambda host, **kw: dict(fake))
    res = client.post("/api/scan", json={"url": "example.com"}, headers=headers)
    assert res.status_code == 200
    body = res.get_json()
    receipt = body.pop("receipt")
    assert body == fake
    claims = jwt.decode(receipt, os.environ["QCAPS_JWT_SECRET"], algorithms=["HS256"])
    assert claims["typ"] == "qcaps-scan-receipt" and claims["sub"] == "1"
    # The hash covers the result as the browser receives it, including after a JS round-trip
    # (JSON.stringify writes 1.0 as 1).
    import receipts
    assert claims["sha256"] == receipts.canonical_hash({**body, "crypto": {**body["crypto"], "score": 1}})


def test_a_receipt_is_not_accepted_as_an_access_token(client):
    import receipts
    receipt = receipts.issue_receipt(os.environ["QCAPS_JWT_SECRET"], 1, {"target_url": "example.com"})
    res = client.post("/api/scan", json={"url": "example.com"}, headers={"Authorization": f"Bearer {receipt}"})
    assert res.status_code == 401
