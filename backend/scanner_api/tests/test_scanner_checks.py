"""Offline tests for the scanner checks. Nothing here touches the network."""
import os
import struct
import sys

os.environ["QCAPS_JWT_SECRET"] = "test-secret-not-for-production-use-0123456789"
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import jwt
import pytest
import requests

import api
import scanner_engine
from scanner import checks, ownership
from scanner.crypto import raw_tls_client as raw
from scanner.errors import ScannerException, ScannerErrorType
from scanner.findings import derive_findings
from scanner.security.target_validator import is_safe_ip, normalize_hostname

SECRET = os.environ["QCAPS_JWT_SECRET"]


# ---------------------------------------------------------------- SSRF / target validation

@pytest.mark.parametrize("ip", [
    "10.0.0.1", "127.0.0.1", "169.254.169.254", "192.168.1.1", "172.16.0.1", "100.64.1.1", "0.0.0.0",
    "::1", "fe80::1", "fd00::1", "::ffff:10.0.0.1", "::ffff:127.0.0.1", "64:ff9b::a00:1", "2002:a00:1::", "224.0.0.1",
])
def test_restricted_addresses_are_blocked(ip):
    assert not is_safe_ip(ip)


@pytest.mark.parametrize("ip", ["8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"])
def test_public_addresses_are_allowed(ip):
    assert is_safe_ip(ip)


@pytest.mark.parametrize("target, expected", [
    ("Example.COM", "example.com"), ("https://Example.com/path?q=1", "example.com"), ("example.com.", "example.com"),
])
def test_normalize_hostname(target, expected):
    assert normalize_hostname(target) == expected


@pytest.mark.parametrize("target", [
    "", "   ", "127.0.0.1", "[::1]", "http://example.com:8080", "user:pw@example.com", "ftp://example.com",
    "exa mple.com", "-bad.example.com", "localhost", "example", "a" * 64 + ".com",
])
def test_normalize_hostname_rejects(target):
    if target == "localhost":
        assert normalize_hostname(target) == "localhost"  # syntactically valid; resolve_target rejects it
        return
    with pytest.raises(ScannerException) as exc:
        normalize_hostname(target)
    assert exc.value.error_type == ScannerErrorType.TARGET_INVALID


# ---------------------------------------------------------------- HTTP headers (regression: all headers read as MISSING)

def test_header_parsing_is_case_insensitive_and_reads_real_values():
    headers = requests.structures.CaseInsensitiveDict({
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
    })
    parsed = checks.analyze_headers(headers)
    assert parsed["strict_transport_security"] == {"present": True, "max_age": 63072000, "include_subdomains": True, "preload": True}
    assert parsed["content_security_policy"] == {"present": True, "frame_ancestors": True}
    assert parsed["x_content_type_options"]["present"] is True
    assert parsed["x_frame_options"]["present"] is False


def test_redirect_to_a_private_host_is_not_followed(monkeypatch):
    calls = []

    def fake_fetch(host, ips, path="/"):
        calls.append(host)
        return 302, requests.structures.CaseInsensitiveDict({"Location": "https://internal.example/admin"})

    def fake_resolve(target):
        raise ScannerException(ScannerErrorType.PERMISSION_DENIED, "restricted")

    monkeypatch.setattr(checks, "_fetch_once", fake_fetch)
    monkeypatch.setattr(checks, "resolve_target", fake_resolve)
    out = checks.check_http("example.com", ["93.184.216.34"])
    assert calls == ["example.com"]  # the internal host was never contacted
    assert out["redirects"][0]["blocked"] == "restricted"


# ---------------------------------------------------------------- TLS probe parsing

def _server_hello(group=None, version=0x0304, hrr=True, extra_ext=b""):
    random = raw.HRR_RANDOM if hrr else b"\x11" * 32
    exts = b""
    if version == 0x0304:
        exts += struct.pack("!HHH", 0x002B, 2, 0x0304)
    if group is not None:
        exts += struct.pack("!HHH", 0x0033, 2, group)
    exts += extra_ext
    body = (b"\x03\x03" + random + b"\x20" + b"\x00" * 32 + struct.pack("!H", 0x1302) + b"\x00"
            + struct.pack("!H", len(exts)) + exts)
    hs = b"\x02" + len(body).to_bytes(3, "big") + body
    return b"\x16\x03\x03" + struct.pack("!H", len(hs)) + hs


def test_parse_hello_retry_request_names_the_selected_group():
    res = raw.parse_response(_server_hello(group=0x11EC))
    assert res == {"outcome": "selected", "version": 0x0304, "cipher": 0x1302, "group": 0x11EC, "hello_retry_request": True}


def test_parse_classical_group_and_alert_and_garbage():
    assert raw.parse_response(_server_hello(group=0x001D))["group"] == 0x001D
    assert raw.parse_response(b"\x15\x03\x03\x00\x02\x02\x28") == {"outcome": "rejected", "alert": 0x28}
    assert raw.parse_response(b"")["outcome"] == "error"
    assert raw.parse_response(b"\x16\x03\x03\x00\x05\x02\x00\x00\x00\x00")["outcome"] == "error"


def test_client_hello_carries_an_empty_key_share_and_sni():
    hello = raw.build_client_hello("example.com", [0x11EC, 0x001D])
    assert hello[0] == 0x16 and hello[5] == 0x01
    assert struct.pack("!HHH", 0x0033, 2, 0) in hello  # empty client_shares: no key material is sent
    assert b"example.com" in hello


class _FakeProbe(raw.RawTLSProbe):
    def __init__(self, replies):
        super().__init__("example.com", ["93.184.216.34"])
        self.replies = list(replies)

    def probe_groups(self, groups):
        return self.replies.pop(0)


def _selected(group, version=0x0304):
    return {"outcome": "selected", "version": version, "cipher": 0x1301, "group": group, "hello_retry_request": True}


def test_key_exchange_classification_logic():
    hybrid = _FakeProbe([_selected(0x11EC)]).probe_key_exchange()
    assert hybrid["hybrid_pqc_supported"] is True and hybrid["preferred_group"] == 0x11EC

    classical = _FakeProbe([_selected(0x001D), {"outcome": "rejected", "alert": 40}]).probe_key_exchange()
    assert classical["hybrid_pqc_supported"] is False and classical["preferred_group"] == 0x001D

    available = _FakeProbe([_selected(0x001D), _selected(0x11EC)]).probe_key_exchange()
    assert available["hybrid_pqc_supported"] is True

    unknown = _FakeProbe([_selected(0x001D), {"outcome": "error", "reason": "timed out"}]).probe_key_exchange()
    assert unknown["hybrid_pqc_supported"] is None  # a failed probe is not a "no"

    tls12_only = _FakeProbe([{"outcome": "rejected", "alert": 70}]).probe_key_exchange()
    assert tls12_only["tls13_supported"] is False and tls12_only["hybrid_pqc_supported"] is False

    failed = _FakeProbe([{"outcome": "error", "reason": "refused"}]).probe_key_exchange()
    assert failed["hybrid_pqc_supported"] is None and failed["tls13_supported"] is None


# ---------------------------------------------------------------- findings

def _result(**over):
    base = {
        "checks": {n: {"status": "ok"} for n in ("tls_handshake", "tls_key_exchange", "certificate", "http_headers", "dns", "ports")},
        "tls": {"version": "TLSv1.3", "cipher_suite": "TLS_AES_256_GCM_SHA384", "trusted": True,
                "key_exchange": {"classification": "classical", "preferred_group": "X25519", "preferred_group_name": "X25519",
                                 "hybrid_pqc_supported": False, "forward_secrecy": True},
                "certificate": {"days_remaining": 90, "signature_class": "classical", "public_key_algorithm": "ECDSA",
                                "key_size": 256, "signature_algorithm": "ecdsa-with-SHA256", "not_after": "2027-01-01"},
                "legacy_protocols": None},
        "http": {"headers": {"strict_transport_security": {"present": True}, "content_security_policy": {"present": True, "frame_ancestors": False},
                             "x_content_type_options": {"present": True}, "x_frame_options": {"present": True}}},
        "dns": {"errors": {}, "dmarc": "v=DMARC1; p=reject", "spf": "v=spf1 -all", "CAA": ['0 issue "letsencrypt.org"']},
    }
    base.update(over)
    return base


def _ids(result):
    return {f["id"]: f["severity"] for f in derive_findings(result)}


def test_classical_only_key_exchange_is_a_medium_finding_with_evidence():
    ids = _ids(_result())
    assert ids["pqc.kex.classical_only"] == "medium"
    assert ids["pqc.auth.classical_certificate"] == "info"
    assert not any(sev == "high" for sev in ids.values())


def test_hybrid_key_exchange_is_not_a_vulnerability():
    r = _result()
    r["tls"]["key_exchange"] = {"classification": "hybrid_pqc", "preferred_group": "X25519MLKEM768"}
    ids = _ids(r)
    assert ids["pqc.kex.hybrid"] == "info" and "pqc.kex.classical_only" not in ids


def test_missing_headers_become_findings_only_when_the_header_check_ran():
    r = _result()
    r["http"]["headers"] = {k: {"present": False, "frame_ancestors": False} for k in r["http"]["headers"]}
    ids = _ids(r)
    assert ids["http.hsts.missing"] == "medium" and ids["http.csp.missing"] == "low"
    r["checks"]["http_headers"] = {"status": "failed"}
    assert not any(i.startswith("http.") for i in _ids(r))  # unknown is not "missing"


def test_certificate_and_protocol_findings():
    r = _result()
    r["tls"].update(trusted=False, trust_error="certificate has expired")
    r["tls"]["certificate"]["days_remaining"] = -3
    r["tls"]["legacy_protocols"] = {"tls1_0": True, "tls1_1": False}
    ids = _ids(r)
    assert ids["cert.untrusted"] == "high" and ids["cert.expired"] == "high" and ids["tls.legacy.tls1_0"] == "medium"
    assert "tls.legacy.tls1_1" not in ids
    r["tls"]["certificate"]["days_remaining"] = 5
    assert _ids(r)["cert.expiring"] == "medium"


def test_rsa_key_transport_and_exposed_ports():
    r = _result()
    r["tls"]["key_exchange"].update(forward_secrecy=False, kex="RSA")
    r["ports"] = {"address": "93.184.216.34", "ports": {"23": {"state": "OPEN"}, "22": {"state": "OPEN"}, "3389": {"state": "FILTERED"}}}
    ids = _ids(r)
    assert ids["tls.kex.no_forward_secrecy"] == "high"
    assert ids["exposure.port.23"] == "high"
    assert "exposure.port.22" not in ids and "exposure.port.3389" not in ids  # SSH is expected; FILTERED is unknown


def test_dns_posture_findings_ignore_failed_lookups():
    r = _result()
    r["dns"] = {"errors": {"DMARC": "Timeout"}, "dmarc": None, "spf": "v=spf1 +all", "CAA": []}
    ids = _ids(r)
    assert "dns.dmarc.missing" not in ids  # the DMARC query failed, so absence is not established
    assert ids["dns.spf.weak"] == "low" and ids["dns.caa.missing"] == "info"


# ---------------------------------------------------------------- ownership

def test_ownership_token_is_bound_to_user_and_domain():
    a = ownership.record_value(SECRET, 1, "example.com")
    assert a == ownership.record_value(SECRET, 1, "example.com")
    assert a != ownership.record_value(SECRET, 2, "example.com")
    assert a != ownership.record_value(SECRET, 1, "example.org")
    assert a.startswith("qcaps-verify=")


def test_ownership_accepts_the_record_on_the_host_or_a_parent_only():
    value = ownership.record_value(SECRET, 7, "example.com")
    records = {"_qcaps-verify.example.com": [value]}
    lookup = lambda name: records.get(name, [])  # noqa: E731
    assert ownership.check_ownership(SECRET, 7, "app.example.com", lookup) == {
        "verified": True, "domain": "example.com", "record_name": "_qcaps-verify.example.com"}
    assert ownership.check_ownership(SECRET, 7, "example.com", lookup)["verified"] is True
    assert ownership.check_ownership(SECRET, 8, "app.example.com", lookup)["verified"] is False  # another account
    assert ownership.check_ownership(SECRET, 7, "example.org", lookup)["verified"] is False
    assert ownership.check_ownership(SECRET, 7, "com", lookup)["verified"] is False
    assert ownership.candidate_domains("a.b.example.com") == ["a.b.example.com", "b.example.com", "example.com"]


# ---------------------------------------------------------------- engine (mocked checks)

@pytest.fixture
def engine(monkeypatch):
    monkeypatch.setattr(scanner_engine, "resolve_target", lambda t: ("example.test", ["93.184.216.34"]))
    monkeypatch.setattr(checks, "check_dns", lambda h: {"errors": {}, "A": ["93.184.216.34"], "spf": None, "dmarc": None, "CAA": []})
    monkeypatch.setattr(checks, "check_whois", lambda h: (_ for _ in ()).throw(RuntimeError("whois down")))
    monkeypatch.setattr(checks, "check_http", lambda h, ips: {"final_host": h, "status": 200, "redirects": [],
                        "headers": checks.analyze_headers(requests.structures.CaseInsensitiveDict({}))})
    monkeypatch.setattr(checks, "check_ct_subdomains", lambda h: [{"name": "www.example.test", "source": "ct_log"}])
    monkeypatch.setattr(checks, "check_ports", lambda ips: {"address": ips[0], "ports": {"23": {"service": "Telnet", "state": "OPEN"}}})
    monkeypatch.setattr(checks, "check_wordlist_subdomains", lambda h: [{"name": "api.example.test", "source": "dns_wordlist"}])
    monkeypatch.setattr(scanner_engine, "probe_tls", lambda ips, h: {"version": "TLSv1.3", "cipher": "TLS_AES_256_GCM_SHA384", "alpn": "h2",
                        "chain_der": [], "trusted": True, "trust_error": None})
    monkeypatch.setattr(scanner_engine, "RawTLSProbe", lambda h, ips: _FakeProbe([_selected(0x11EC)]))
    return scanner_engine


def test_standard_scan_marks_active_checks_as_requiring_verification(engine):
    res = engine.analyze_domain("example.test")
    assert res["schema_version"] == 2 and res["authorization"]["mode"] == "standard"
    for name in ("ports", "dns_wordlist", "legacy_tls"):
        assert res["checks"][name]["status"] == "requires_verification"
    assert "ports" not in res
    assert res["checks"]["whois"]["status"] == "failed" and res["whois"] is None  # a failed check is reported, not hidden
    assert res["pqc_posture"]["key_exchange"] == "hybrid_pqc"
    assert res["tls"]["key_exchange"]["classification"] == "hybrid_pqc"
    assert [s["name"] for s in res["subdomains"]] == ["www.example.test"]


def test_full_scan_requires_verified_ownership(engine):
    assert "error" in engine.analyze_domain("example.test", mode="full")
    res = engine.analyze_domain("example.test", mode="full",
                                authorization={"ownership_verified": True, "verified_domain": "example.test"})
    assert res["checks"]["ports"]["status"] == "ok" and res["authorization"]["ownership_verified"] is True
    assert any(f["id"] == "exposure.port.23" for f in res["findings"])
    assert {s["source"] for s in res["subdomains"]} == {"ct_log", "dns_wordlist"}


# ---------------------------------------------------------------- API gating

@pytest.fixture
def client():
    api._history.clear()
    api._active_users.clear()
    return api.app.test_client()


@pytest.fixture
def headers():
    token = jwt.encode({"sub": "5"}, SECRET, algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


def test_full_mode_without_the_dns_record_is_403_with_instructions(client, headers, monkeypatch):
    monkeypatch.setattr(api.ownership, "check_ownership", lambda *a, **k: {"verified": False, "domain": None, "record_name": None})
    monkeypatch.setattr(api, "analyze_domain", lambda *a, **k: pytest.fail("must not scan"))
    res = client.post("/api/scan", json={"url": "example.com", "mode": "full"}, headers=headers)
    assert res.status_code == 403
    body = res.get_json()
    assert body["record_name"] == "_qcaps-verify.example.com" and body["record_value"].startswith("qcaps-verify=")


def test_full_mode_with_the_record_runs_with_authorization(client, headers, monkeypatch):
    seen = {}
    monkeypatch.setattr(api.ownership, "check_ownership", lambda *a, **k: {"verified": True, "domain": "example.com", "record_name": "x"})

    def fake(host, mode, authorization):
        seen.update(mode=mode, authorization=authorization)
        return {"target_url": host}

    monkeypatch.setattr(api, "analyze_domain", fake)
    assert client.post("/api/scan", json={"url": "app.example.com", "mode": "full"}, headers=headers).status_code == 200
    assert seen["mode"] == "full" and seen["authorization"] == {"ownership_verified": True, "verified_domain": "example.com"}


def test_bad_mode_and_bad_target_are_400(client, headers):
    assert client.post("/api/scan", json={"url": "example.com", "mode": "aggressive"}, headers=headers).status_code == 400
    assert client.post("/api/scan", json={"url": "127.0.0.1"}, headers=headers).status_code == 400
    assert client.post("/api/scan", json={"url": "example.com:8080"}, headers=headers).status_code == 400


def test_only_one_scan_per_user_at_a_time(client, headers, monkeypatch):
    api._active_users.add("5")
    monkeypatch.setattr(api, "analyze_domain", lambda *a, **k: pytest.fail("must not scan"))
    assert client.post("/api/scan", json={"url": "example.com"}, headers=headers).status_code == 429


def test_the_slot_is_released_after_a_failed_scan(client, headers, monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("boom")

    monkeypatch.setattr(api, "analyze_domain", boom)
    assert client.post("/api/scan", json={"url": "example.com"}, headers=headers).status_code == 500
    assert "5" not in api._active_users


def test_domain_verification_endpoint(client, headers, monkeypatch):
    monkeypatch.setattr(api.ownership, "check_ownership", lambda *a, **k: {"verified": True, "domain": "example.com", "record_name": "x"})
    res = client.post("/api/domain-verification", json={"hostname": "https://app.example.com/"}, headers=headers)
    body = res.get_json()
    assert res.status_code == 200 and body["verified"] is True and body["record_name"] == "_qcaps-verify.app.example.com"
    assert client.post("/api/domain-verification", json={"hostname": "example.com"}).status_code == 401
    assert client.post("/api/domain-verification", json={"hostname": 5}, headers=headers).status_code == 400


# ---------------------------------------------------------------- observation client

def test_observation_context_accepts_weak_servers_but_is_not_a_trust_decision():
    """Regression: a server offering only legacy suites (e.g. static RSA) failed the handshake and was reported as
    not determined instead of being assessed. The observation client must accept them without validating certificates."""
    import ssl
    from scanner.crypto.tls_probe import observation_context
    ctx = observation_context()
    assert ctx.verify_mode == ssl.CERT_NONE and ctx.check_hostname is False
    assert ctx.minimum_version == ssl.TLSVersion.MINIMUM_SUPPORTED
    assert any("RSA" in c["name"] and "ECDHE" not in c["name"] and "DHE" not in c["name"] for c in ctx.get_ciphers())
