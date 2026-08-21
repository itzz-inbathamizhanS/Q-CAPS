import ssl
import socket
import json
import sys
from datetime import datetime

def analyze_certificate(hostname, port=443):
    """
    Methodology:
    1. We create a default SSL context which handles the handshake securely.
    2. We wrap a standard TCP socket with this SSL context.
    3. We connect to the target hostname on port 443 (HTTPS).
    4. We extract the binary certificate (DER format) using `getpeercert(binary_form=True)`.
    5. Because Python's built-in ssl module doesn't easily parse the raw public key algorithm from the cert dict, 
       we use basic heuristics on the cipher suite or we can rely on standard libraries. 
       For this standalone script, we will examine the negotiated cipher.
    """
    context = ssl.create_default_context()
    
    # We don't want to fail if the cert is expired, we just want to analyze its crypto
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    result = {
        "target_url": hostname,
        "scan_timestamp": datetime.utcnow().isoformat() + "Z",
        "encryption_detected": "Unknown",
        "is_quantum_safe": False,
        "vulnerabilities_found": [],
        "mission_xp_awarded": 0
    }

    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cipher = ssock.cipher()
                # cipher returns a tuple: (cipher_name, ssl_version, secret_bits)
                cipher_name = cipher[0]
                
                # Heuristic analysis based on Cipher Suite Name
                if "RSA" in cipher_name:
                    result["encryption_detected"] = "RSA"
                    result["vulnerabilities_found"].append("Vulnerable to Shor's Algorithm (Classical RSA detected)")
                    result["mission_xp_awarded"] += 50
                elif "ECDHE" in cipher_name or "ECDSA" in cipher_name:
                    result["encryption_detected"] = "Elliptic Curve (ECC)"
                    result["vulnerabilities_found"].append("Vulnerable to Shor's Algorithm (Classical ECC detected)")
                    result["mission_xp_awarded"] += 25
                elif "KYBER" in cipher_name or "ML-KEM" in cipher_name or "DILITHIUM" in cipher_name:
                    result["encryption_detected"] = "Post-Quantum Cryptography"
                    result["is_quantum_safe"] = True
                    result["mission_xp_awarded"] += 10
                else:
                    result["encryption_detected"] = cipher_name
                    result["vulnerabilities_found"].append("Unknown or weak classical algorithm")
                    result["mission_xp_awarded"] += 10

    except Exception as e:
        result["vulnerabilities_found"].append(f"Connection Failed: {str(e)}")

    return result

if __name__ == "__main__":
    # If no argument is passed, default to example.com
    target = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    
    # Clean up the URL if the user passes https://
    target = target.replace("https://", "").replace("http://", "").split("/")[0]
    
    analysis = analyze_certificate(target)
    
    # Output the exact JSON format required by the Shared Data Schema API Contract
    print(json.dumps(analysis, indent=2))
