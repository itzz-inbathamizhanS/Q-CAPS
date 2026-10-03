import ipaddress
import socket
import re
from urllib.parse import urlparse
import os

from scanner.errors import ScannerException, ScannerErrorType

# Basic hostname validation pattern (allow localhost)
HOSTNAME_REGEX = re.compile(
    r'^localhost$|^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$'
)

def is_safe_ip(ip_str: str, allow_local: bool = False) -> bool:
    try:
        ip_obj = ipaddress.ip_address(ip_str)
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved:
            if allow_local and ip_obj.is_loopback:
                return True # Allow 127.0.0.1 for testing if explicitly enabled
            return False
        return True
    except ValueError:
        return False

def validate_target(target: str) -> str:
    """
    Validates a target hostname or URL, stripping scheme and ensuring it does not resolve
    to an internal/restricted IP address (SSRF protection).
    Returns the normalized hostname.
    """
    if not target:
        raise ScannerException(ScannerErrorType.TARGET_INVALID, "Target cannot be empty.")

    # Strip scheme if present
    if "://" in target:
        parsed = urlparse(target)
        hostname = parsed.hostname
        if not hostname:
            raise ScannerException(ScannerErrorType.TARGET_INVALID, "Could not parse hostname from URL.")
    else:
        hostname = target.split('/')[0]

    # Quick regex check
    if not HOSTNAME_REGEX.match(hostname):
        # Allow raw IP addresses? Let's check if it's a valid IP.
        try:
            ipaddress.ip_address(hostname)
        except ValueError:
            raise ScannerException(ScannerErrorType.TARGET_INVALID, f"Invalid hostname format: {hostname}")

    # Resolve IP and check SSRF
    allow_local = os.environ.get("ALLOW_LOCAL_SCANNING", "False").lower() == "true"
    
    try:
        ip = socket.gethostbyname(hostname)
    except Exception as e:
        raise ScannerException(ScannerErrorType.DNS_FAILURE, f"DNS resolution failed for {hostname}: {str(e)}")

    if not is_safe_ip(ip, allow_local=allow_local):
        raise ScannerException(ScannerErrorType.PERMISSION_DENIED, f"Target '{hostname}' resolves to a restricted IP address ({ip}). SSRF Protection triggered.")

    return hostname
