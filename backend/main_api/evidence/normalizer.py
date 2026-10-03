from typing import Any, Dict

def normalize_scan(raw_scan: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes raw TLS scan output into a standard format.
    Extracts TLS versions, cipher suites, negotiated groups, and signatures.
    """
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
