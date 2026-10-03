import ssl
import socket
from datetime import datetime

from scanner.errors import ScannerException, ScannerErrorType
from scanner.crypto.raw_tls_client import RawTLSProbe

def probe_tls(hostname: str, port: int = 443) -> dict:
    """
    Probes the TLS endpoint and extracts protocol metadata.
    Attempts to gather: tls_version, cipher_suite, certificate.
    """
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    
    # Optional: configure ALPN
    context.set_alpn_protocols(['h2', 'http/1.1'])
    
    result = {
        "tls_version": {"value": "UNKNOWN", "source": "TLS_HANDSHAKE", "status": "UNKNOWN"},
        "cipher_suite": {"value": "UNKNOWN", "source": "TLS_HANDSHAKE", "status": "UNKNOWN"},
        "alpn": {"value": "UNKNOWN", "source": "TLS_HANDSHAKE", "status": "UNKNOWN"},
        "key_exchange_group": {"value": "UNKNOWN", "source": "TLS_HANDSHAKE", "status": "NOT_TESTED"},
        "certificate_chain_der": [],
        "raw_deep_probe": None
    }
    
    # 1. Raw Socket Deep Probe & Downgrade Simulation
    try:
        raw_probe = RawTLSProbe(hostname, port)
        deep_result = raw_probe.full_deep_probe()
        result["raw_deep_probe"] = deep_result
        
        # We can extract exact key exchange info if the raw probe negotiated
        if deep_result["standard_probe"].get("status") == "NEGOTIATED":
            neg_cipher = deep_result["standard_probe"]["data"].get("negotiated_cipher")
            if neg_cipher:
                # Map standard cipher back if needed (we'll still rely on standard ssl for exact string)
                pass
    except Exception as e:
        # Silently fallback to standard ssl if raw probe fails (e.g. firewall blocks custom packets)
        pass
    
    # 2. Standard SSL Probe for Certificate and standard cipher string
    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                
                version = ssock.version()
                cipher = ssock.cipher()
                alpn = ssock.selected_alpn_protocol()
                
                if version:
                    result["tls_version"] = {
                        "value": version,
                        "source": "TLS_HANDSHAKE",
                        "status": "OBSERVED",
                        "confidence": 1.0,
                        "tool": "python_ssl"
                    }
                
                if cipher:
                    result["cipher_suite"] = {
                        "value": cipher[0],
                        "source": "TLS_HANDSHAKE",
                        "status": "OBSERVED",
                        "confidence": 1.0,
                        "tool": "python_ssl"
                    }
                
                if alpn:
                    result["alpn"] = {
                        "value": alpn,
                        "source": "TLS_HANDSHAKE",
                        "status": "OBSERVED",
                        "confidence": 1.0,
                        "tool": "python_ssl"
                    }
                    
                # Collect certificate
                der_cert = ssock.getpeercert(binary_form=True)
                if der_cert:
                    result["certificate_chain_der"].append(der_cert)
                
    except ssl.SSLError as e:
        raise ScannerException(ScannerErrorType.TLS_NEGOTIATION_FAILURE, f"SSL Handshake failed: {str(e)}")
    except socket.timeout:
        raise ScannerException(ScannerErrorType.CONNECTION_TIMEOUT, f"Connection timed out to {hostname}:{port}")
    except socket.error as e:
        raise ScannerException(ScannerErrorType.TARGET_UNREACHABLE, f"Socket error connecting to {hostname}:{port} - {str(e)}")
        
    return result
