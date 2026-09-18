import ssl
import socket
import json
import sys
import whois
import requests
import dns.resolver
from datetime import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend

# PROBLEM 1: IP Geolocation Tracking
def get_geolocation(hostname, enable_geo=False):
    """
    Geolocation requires sending IP to a third-party service (ip-api.com).
    For privacy, it is disabled by default. Set enable_geo=True to use.
    """
    data = {"ip": "Unknown", "country": "Unknown", "isp": "Unknown"}
    if not enable_geo:
        return data
    try:
        ip = socket.gethostbyname(hostname)
        data["ip"] = ip
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3).json()
        if response.get("status") == "success":
            data["country"] = f"{response.get('city', '')}, {response.get('country', '')}"
            data["isp"] = response.get("isp", "Unknown")
    except Exception:
        pass
    return data

def enumerate_subdomains(hostname):
    subdomains = set()
    try:
        response = requests.get(f"https://crt.sh/?q=%25.{hostname}&output=json", timeout=10)
        if response.status_code == 200:
            data = response.json()
            for entry in data:
                name_value = entry.get('name_value', '')
                for name in name_value.split('\n'):
                    name = name.strip().lower()
                    if name.endswith(hostname) and name != hostname and '*' not in name:
                        subdomains.add(name)
    except Exception:
        pass
    return list(subdomains)[:20]

def scan_ports(hostname):
    ports_to_scan = [21, 22, 25, 53, 80, 443, 3306, 8080]
    results = {}
    try:
        ip = socket.gethostbyname(hostname)
        for port in ports_to_scan:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.settimeout(0.5)
                    if s.connect_ex((ip, port)) == 0:
                        results[str(port)] = "OPEN"
                    else:
                        results[str(port)] = "CLOSED"
            except Exception:
                 results[str(port)] = "CLOSED"
    except Exception:
        pass
    return results

# PROBLEM 2: DNS Record Enumeration
def enumerate_dns(hostname):
    records = {"A": [], "MX": [], "TXT": []}
    try:
        for rdata in dns.resolver.resolve(hostname, 'A'):
            records["A"].append(rdata.to_text())
    except Exception: pass
    
    try:
        for rdata in dns.resolver.resolve(hostname, 'MX'):
            records["MX"].append(rdata.to_text())
    except Exception: pass
    
    try:
        for rdata in dns.resolver.resolve(hostname, 'TXT'):
            records["TXT"].append(rdata.to_text())
    except Exception: pass
    
    return records

# PROBLEM 3: HTTP Security Header Inspection
def analyze_headers(hostname):
    headers = {"hsts": False, "x_frame_options": False, "content_security_policy": False}
    try:
        response = requests.head(f"https://{hostname}", timeout=3)
        h = response.headers
        headers["hsts"] = "strict-transport-security" in h.lower()
        headers["x_frame_options"] = "x-frame-options" in h.lower()
        headers["content_security_policy"] = "content-security-policy" in h.lower()
    except Exception:
        pass
    return headers

import ipaddress

# PROBLEM 4: Combine Solutions
def analyze_domain(hostname, port=443, enable_geo=False):
    
    # 0. SSRF Protection & Validation
    try:
        ip = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip)
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
            raise ValueError(f"Scan target '{hostname}' resolves to a restricted IP address ({ip}).")
    except Exception as e:
        return {
            "target_url": hostname,
            "scan_timestamp": datetime.utcnow().isoformat() + "Z",
            "error": f"Invalid or restricted domain: {str(e)}",
            "crypto": {
                "encryption_detected": "Unknown",
                "quantum_status": "inconclusive",
                "vulnerabilities_found": [f"Invalid or restricted domain: {str(e)}"],
                "mission_xp_awarded": 0
            }
        }

    # 1. OSINT / WHOIS Scanning
    osint_data = {
        "registrar": "Unknown",
        "creation_date": "Unknown",
        "expiration_date": "Unknown",
        "owner_organization": "Unknown"
    }
    
    try:
        domain_info = whois.whois(hostname)
        
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

    # Add Advanced OSINT Features
    geo_data = get_geolocation(hostname, enable_geo)
    dns_data = enumerate_dns(hostname)
    header_data = analyze_headers(hostname)
    subdomains = enumerate_subdomains(hostname)
    ports = scan_ports(hostname)

    # 2. Cryptographic Scanning
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    result = {
        "target_url": hostname,
        "scan_timestamp": datetime.utcnow().isoformat() + "Z",
        "osint": osint_data,
        "infrastructure": {
            "geo": geo_data,
            "dns": dns_data,
            "security_headers": header_data,
            "ports": ports,
            "subdomains": subdomains
        },
        "crypto": {
            "encryption_detected": "Unknown",
            "quantum_status": "inconclusive",
            "vulnerabilities_found": [],
            "mission_xp_awarded": 0,
            "certificate": None
        }
    }

    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cipher = ssock.cipher()
                cipher_name = cipher[0]
                result["crypto"]["encryption_detected"] = cipher_name
                
                # X.509 Certificate Extraction
                try:
                    der_cert = ssock.getpeercert(binary_form=True)
                    if der_cert:
                        cert = x509.load_der_x509_certificate(der_cert, default_backend())
                        sig_alg = cert.signature_algorithm_oid._name
                        issuer = cert.issuer.rfc4514_string()
                        
                        # Handle timezone-aware deprecations in cryptography
                        expires = cert.not_valid_after_utc.isoformat() if hasattr(cert, 'not_valid_after_utc') else cert.not_valid_after.isoformat()
                        
                        result["crypto"]["certificate"] = {
                            "signature_algorithm": sig_alg,
                            "issuer": issuer,
                            "expires": expires
                        }
                        
                        # Check certificate signature algorithm for quantum vulnerabilities
                        if "rsa" in (sig_alg or "").lower():
                            result["crypto"]["vulnerabilities_found"].append(f"X.509 Cert signed with legacy RSA ({sig_alg}) - Vulnerable to Shor's Algorithm")
                            result["crypto"]["mission_xp_awarded"] += 50
                        elif "ecdsa" in (sig_alg or "").lower() or "ecdhe" in (sig_alg or "").lower():
                            result["crypto"]["vulnerabilities_found"].append(f"X.509 Cert signed with legacy ECC ({sig_alg}) - Vulnerable to Shor's Algorithm")
                            result["crypto"]["mission_xp_awarded"] += 25
                except Exception as cert_err:
                    pass
                
                # Heuristic analysis
                if "RSA" in cipher_name:
                    result["crypto"]["vulnerabilities_found"].append("Public-key crypto vulnerable to Shor's Algorithm (Classical RSA detected)")
                    result["crypto"]["mission_xp_awarded"] += 50
                elif "ECDHE" in cipher_name or "ECDSA" in cipher_name:
                    result["crypto"]["vulnerabilities_found"].append("Public-key crypto vulnerable to Shor's Algorithm (Classical ECC detected)")
                    result["crypto"]["mission_xp_awarded"] += 25
                
                # Check for PQC
                if "KYBER" in cipher_name or "ML-KEM" in cipher_name or "DILITHIUM" in cipher_name:
                    result["crypto"]["quantum_status"] = "quantum_safe"
                    result["crypto"]["mission_xp_awarded"] += 10
                    
                # Note about symmetric
                if "AES" in cipher_name or "CHACHA20" in cipher_name:
                    # Symmetric is generally quantum-safe against Shor's, susceptible to Grover's but not critically if 256-bit
                    # Conservative crypto classification: We only classify as quantum_safe if PQC is explicitly detected
                    pass
                    
                if not result["crypto"]["vulnerabilities_found"] and result["crypto"]["quantum_status"] == "inconclusive":
                    result["crypto"]["vulnerabilities_found"].append("Could not conclusively determine quantum safety from cipher string")
                    result["crypto"]["mission_xp_awarded"] += 10

    except Exception as e:
        result["crypto"]["vulnerabilities_found"].append(f"SSL Connection Failed: {str(e)}")

    return result

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "example.com"
    target = target.replace("https://", "").replace("http://", "").split("/")[0]
    
    analysis = analyze_domain(target)
    print(json.dumps(analysis, indent=2))
