import pytest
from main_api.evidence.normalizer import normalize_scan

def test_normalize_scan_extracts_fields():
    raw_scan = {
        "scan_id": "123",
        "asset_id": 1,
        "tls_version": "TLSv1.3",
        "cipher_suite": "TLS_AES_128_GCM_SHA256",
        "negotiated_group": "X25519",
        "extra_field": "should_be_ignored"
    }
    
    normalized = normalize_scan(raw_scan)
    
    assert normalized["tls_version"] == "TLSv1.3"
    assert normalized["cipher_suite"] == "TLS_AES_128_GCM_SHA256"
    assert "extra_field" not in normalized
    assert normalized["pqc_algorithm"] is None
