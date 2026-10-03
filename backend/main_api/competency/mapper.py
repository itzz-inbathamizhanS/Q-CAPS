from typing import List, Dict, Any

def get_required_competencies(exposure_type: str, algorithm: str, protocol: str) -> List[str]:
    """
    Maps a specific cryptographic exposure to required competency codes.
    This would typically query a graph or database, but we use a static map for the prototype.
    """
    # Dummy static mapping for prototype
    mapping = {
        "RSA_CERTIFICATE": ["CERT_MIGRATION", "PQC_AWARENESS"],
        "ECDSA_CERTIFICATE": ["CERT_MIGRATION", "PQC_AWARENESS"],
        "VULNERABLE_TLS_GROUP": ["TLS_CONFIG", "HYBRID_KEY_EXCHANGE"]
    }
    
    # Generic fallback
    return mapping.get(exposure_type, ["GENERAL_CRYPTO_MIGRATION"])
