import ssl
import socket
import json
import sys
import whois
from datetime import datetime

def analyze_domain(hostname, port=443):
    """
    Methodology:
    1. First, we use python-whois to scrape the public registration data for the domain.
    2. Then, we connect via SSL to analyze the cryptographic handshake.
    3. We combine both the OSINT and Crypto data into a single unified JSON response.
    """
    
    # 1. OSINT / WHOIS Scanning
    osint_data = {
        "registrar": "Unknown",
        "creation_date": "Unknown",
        "expiration_date": "Unknown",
        "owner_organization": "Unknown"
    }
    
    try:
        domain_info = whois.whois(hostname)
        
        # Handle cases where dates might be lists
        def parse_date(date_val):
            if isinstance(date_val, list):
                return date_val[0].isoformat() if hasattr(date_val[0], 'isoformat') else str(date_val[0])
            return date_val.isoformat() if hasattr(date_val, 'isoformat') else str(date_val)
            
        if domain_info.registrar:
            osint_data["registrar"] = domain_info.registrar
        if domain_info.creation_date:
            osint_data["creation_date"] = parse_date(domain_info.creation_date)
        if domain_info.expiration_date:
            osint_data["expiration_date"] = parse_date(domain_info.expiration_date)
        if domain_info.org:
            osint_data["owner_organization"] = domain_info.org
    except Exception as e:
        osint_data["error"] = f"WHOIS lookup failed: {str(e)}"


    # 2. Cryptographic Scanning
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    result = {
        "target_url": hostname,
        "scan_timestamp": datetime.utcnow().isoformat() + "Z",
        "osint": osint_data,
        "crypto": {
            "encryption_detected": "Unknown",
            "is_quantum_safe": False,
            "vulnerabilities_found": [],
            "mission_xp_awarded": 0
        }
    }

    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cipher = ssock.cipher()
                cipher_name = cipher[0]
                
                # Heuristic analysis
                if "RSA" in cipher_name:
                    result["crypto"]["encryption_detected"] = "RSA"
                    result["crypto"]["vulnerabilities_found"].append("Vulnerable to Shor's Algorithm (Classical RSA detected)")
                    result["crypto"]["mission_xp_awarded"] += 50
                elif "ECDHE" in cipher_name or "ECDSA" in cipher_name:
                    result["crypto"]["encryption_detected"] = "Elliptic Curve (ECC)"
                    result["crypto"]["vulnerabilities_found"].append("Vulnerable to Shor's Algorithm (Classical ECC detected)")
                    result["crypto"]["mission_xp_awarded"] += 25
                elif "KYBER" in cipher_name or "ML-KEM" in cipher_name or "DILITHIUM" in cipher_name:
                    result["crypto"]["encryption_detected"] = "Post-Quantum Cryptography"
                    result["crypto"]["is_quantum_safe"] = True
                    result["crypto"]["mission_xp_awarded"] += 10
                else:
                    result["crypto"]["encryption_detected"] = cipher_name
                    result["crypto"]["vulnerabilities_found"].append("Unknown or weak classical algorithm")
                    result["crypto"]["mission_xp_awarded"] += 10

    except Exception as e:
        result["crypto"]["vulnerabilities_found"].append(f"SSL Connection Failed: {str(e)}")

    return result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    target = target.replace("https://", "").replace("http://", "").split("/")[0]
    
    analysis = analyze_domain(target)
    print(json.dumps(analysis, indent=2))
