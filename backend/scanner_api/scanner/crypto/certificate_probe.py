from cryptography import x509
from cryptography.hazmat.backends import default_backend
from datetime import datetime, timezone

from scanner.errors import ScannerException, ScannerErrorType

def parse_certificate(der_cert: bytes) -> dict:
    """
    Parses an X.509 certificate and extracts cryptographic parameters securely.
    """
    try:
        cert = x509.load_der_x509_certificate(der_cert, default_backend())
    except Exception as e:
        raise ScannerException(ScannerErrorType.CERTIFICATE_PARSE_FAILURE, f"Failed to parse certificate: {str(e)}")

    sig_alg = cert.signature_algorithm_oid._name
    pub_key = cert.public_key()
    pub_alg = pub_key.__class__.__name__  # e.g., RSAPublicKey, EllipticCurvePublicKey
    
    key_size = "UNKNOWN"
    curve = "UNKNOWN"
    
    if hasattr(pub_key, "key_size"):
        key_size = pub_key.key_size
    
    if hasattr(pub_key, "curve"):
        curve = pub_key.curve.name
        
    expires = cert.not_valid_after_utc if hasattr(cert, 'not_valid_after_utc') else cert.not_valid_after
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    
    return {
        "signature_algorithm": {
            "value": sig_alg,
            "source": "CERTIFICATE",
            "status": "OBSERVED",
            "confidence": 1.0,
            "tool": "cryptography"
        },
        "public_key_algorithm": {
            "value": pub_alg,
            "source": "CERTIFICATE",
            "status": "OBSERVED",
            "confidence": 1.0,
            "tool": "cryptography"
        },
        "public_key_size": {
            "value": key_size,
            "source": "CERTIFICATE",
            "status": "OBSERVED",
            "confidence": 1.0,
            "tool": "cryptography"
        },
        "public_key_curve": {
            "value": curve,
            "source": "CERTIFICATE",
            "status": "OBSERVED" if curve != "UNKNOWN" else "NOT_APPLICABLE",
            "confidence": 1.0,
            "tool": "cryptography"
        },
        "issuer": cert.issuer.rfc4514_string(),
        "subject": cert.subject.rfc4514_string(),
        "expires_at": expires.isoformat(),
        "expires_in_days": (expires - datetime.now(timezone.utc)).days
    }
