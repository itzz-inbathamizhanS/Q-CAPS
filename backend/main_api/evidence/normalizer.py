from typing import Any, Dict

def _normalize_v2(raw_scan: Dict[str, Any]) -> Dict[str, Any]:
    """Scanner result schema v2: read the observed TLS facts out of the nested result."""
    tls = raw_scan.get("tls") or {}
    kex = tls.get("key_exchange") or {}
    cert = tls.get("certificate") or {}
    hybrid = kex.get("classification") == "hybrid_pqc"
    group = kex.get("preferred_group_name")
    return {
        "tls_version": tls.get("version"),
        "cipher_suite": tls.get("cipher_suite"),
        "negotiated_group": group,
        "signature_scheme": None,
        "certificate_public_key_algorithm": cert.get("public_key_algorithm"),
        "certificate_signature_algorithm": cert.get("signature_algorithm"),
        "hybrid_group": hybrid,
        "pqc_algorithm": group if hybrid else None,
    }


def normalize_scan(raw_scan: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes raw TLS scan output into a standard format.
    Extracts TLS versions, cipher suites, negotiated groups, and signatures.
    """
    if raw_scan.get("schema_version") == 2:
        return _normalize_v2(raw_scan)
    normalized = {
        "tls_version": raw_scan.get("tls_version"),
        "cipher_suite": raw_scan.get("cipher_suite"),
        "negotiated_group": raw_scan.get("negotiated_group"),
        "signature_scheme": raw_scan.get("signature_scheme"),
        "certificate_public_key_algorithm": raw_scan.get("certificate_public_key_algorithm"),
        "certificate_signature_algorithm": raw_scan.get("certificate_signature_algorithm"),
        "hybrid_group": raw_scan.get("hybrid_group", False),
        "pqc_algorithm": raw_scan.get("pqc_algorithm")
    }
    return normalized
