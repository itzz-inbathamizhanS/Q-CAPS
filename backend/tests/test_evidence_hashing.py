import pytest
from main_api.evidence.hashing import hash_payload

def test_hash_payload_deterministic():
    payload1 = {"tls_version": "TLSv1.3", "cipher_suite": "TLS_AES_128_GCM_SHA256"}
    payload2 = {"cipher_suite": "TLS_AES_128_GCM_SHA256", "tls_version": "TLSv1.3"}
    
    hash1 = hash_payload(payload1)
    hash2 = hash_payload(payload2)
    
    # Hashes should be identical regardless of dictionary key order
    assert hash1 == hash2
