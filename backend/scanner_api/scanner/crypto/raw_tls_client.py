import socket
import struct
import binascii
import time

from scanner.errors import ScannerException, ScannerErrorType

# --- TLS Constants ---
TLS_VERSION_1_0 = b"\x03\x01"
TLS_VERSION_1_2 = b"\x03\x03"
TLS_VERSION_1_3 = b"\x03\x04"

HANDSHAKE_CLIENT_HELLO = 1
HANDSHAKE_SERVER_HELLO = 2

# CIPHER SUITES (Selected mix of Classical and PQC if defined, mostly classical for baseline)
CIPHER_SUITES = [
    0x1301, # TLS_AES_128_GCM_SHA256 (TLS 1.3)
    0x1302, # TLS_AES_256_GCM_SHA384 (TLS 1.3)
    0x1303, # TLS_CHACHA20_POLY1305_SHA256 (TLS 1.3)
    0xc02b, # TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
    0xc02f, # TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    0x009e, # TLS_DHE_RSA_WITH_AES_128_GCM_SHA256
]

class RawTLSProbe:
    """
    Bypasses python's ssl module to send raw ClientHello packets
    and parse ServerHello responses for deep protocol inspection.
    """
    
    def __init__(self, hostname: str, port: int = 443, timeout: float = 3.0):
        self.hostname = hostname
        self.port = port
        self.timeout = timeout

    def _build_sni_extension(self) -> bytes:
        hostname_bytes = self.hostname.encode('utf-8')
        server_name_list = struct.pack("!H", len(hostname_bytes) + 3) + b"\x00" + struct.pack("!H", len(hostname_bytes)) + hostname_bytes
        ext_data = struct.pack("!H", len(server_name_list)) + server_name_list
        return struct.pack("!H", 0x0000) + ext_data  # SNI is type 0x0000

    def _build_supported_groups_extension(self, groups: list) -> bytes:
        # groups is list of 16-bit ints
        group_bytes = b"".join([struct.pack("!H", g) for g in groups])
        ext_data = struct.pack("!H", len(group_bytes)) + group_bytes
        return struct.pack("!H", 0x000a) + struct.pack("!H", len(ext_data)) + ext_data  # Supported Groups is type 0x000a

    def _build_supported_versions_extension(self) -> bytes:
        versions = TLS_VERSION_1_3 + TLS_VERSION_1_2
        ext_data = struct.pack("!B", len(versions)) + versions
        return struct.pack("!H", 0x002b) + struct.pack("!H", len(ext_data)) + ext_data # Supported Versions is type 0x002b

    def _build_client_hello(self, custom_groups: list = None) -> bytes:
        # 1. Handshake header
        # Version 1.2 in record layer (0x0301 or 0x0303 often used for compatibility)
        client_version = TLS_VERSION_1_2
        
        # Random bytes (32 bytes)
        import os
        random_bytes = os.urandom(32)
        
        # Session ID (0 bytes for fresh connection)
        session_id = b"\x00"
        
        # Cipher Suites
        cipher_bytes = b"".join([struct.pack("!H", c) for c in CIPHER_SUITES])
        cipher_len = struct.pack("!H", len(cipher_bytes))
        ciphers = cipher_len + cipher_bytes
        
        # Compression Methods (1 byte length, 0x00 for null)
        compressions = b"\x01\x00"
        
        # Extensions
        exts = self._build_sni_extension()
        exts += self._build_supported_versions_extension()
        
        # Determine Groups to offer
        # Standard: X25519 (0x001d), SECP256R1 (0x0017)
        # PQC Hybrid Drafts (e.g., X25519Kyber768Draft00 = 0x6399, X25519MLKEM768 = 0x11ec)
        groups_to_offer = custom_groups if custom_groups else [0x11ec, 0x6399, 0x001d, 0x0017]
        exts += self._build_supported_groups_extension(groups_to_offer)
        
        exts_len = struct.pack("!H", len(exts))
        extensions = exts_len + exts
        
        # Client Hello Payload
        payload = client_version + random_bytes + session_id + ciphers + compressions + extensions
        payload_len = len(payload)
        
        # Handshake Header (Type 1 for ClientHello, 3-byte length)
        handshake_header = b"\x01" + payload_len.to_bytes(3, byteorder='big')
        
        # Record Layer Header (Type 22 for Handshake, Version 1.0, 2-byte length)
        record = b"\x16" + TLS_VERSION_1_0 + struct.pack("!H", len(handshake_header) + payload_len)
        
        return record + handshake_header + payload

    def _parse_server_hello(self, data: bytes) -> dict:
        """
        Minimal ServerHello parser to extract negotiated cipher and extensions.
        """
        result = {
            "negotiated_cipher": None,
            "tls_version": None,
            "extensions_found": []
        }
        
        if len(data) < 5:
            return result
            
        record_type = data[0]
        if record_type != 22: # Not Handshake
            return result
            
        record_len = struct.unpack("!H", data[3:5])[0]
        payload = data[5:5+record_len]
        
        if len(payload) < 4:
            return result
            
        msg_type = payload[0]
        if msg_type != 2: # Not ServerHello
            return result
            
        # Parse ServerHello
        # Version (2), Random (32), Session ID len (1), Session ID (var), Cipher (2), Compression (1), Extensions len (2), Extensions (var)
        idx = 4
        if idx + 2 > len(payload): return result
        
        srv_version = payload[idx:idx+2]
        result["tls_version"] = srv_version.hex()
        idx += 2
        
        idx += 32 # Skip Random
        
        if idx >= len(payload): return result
        session_id_len = payload[idx]
        idx += 1 + session_id_len
        
        if idx + 2 > len(payload): return result
        cipher = struct.unpack("!H", payload[idx:idx+2])[0]
        result["negotiated_cipher"] = hex(cipher)
        idx += 2
        
        idx += 1 # Skip Compression
        
        # Extensions
        if idx + 2 <= len(payload):
            ext_len = struct.unpack("!H", payload[idx:idx+2])[0]
            idx += 2
            end_idx = idx + ext_len
            while idx < end_idx and idx + 4 <= len(payload):
                ext_type = struct.unpack("!H", payload[idx:idx+2])[0]
                e_len = struct.unpack("!H", payload[idx+2:idx+4])[0]
                result["extensions_found"].append(hex(ext_type))
                idx += 4 + e_len
                
        return result

    def probe_custom_groups(self, groups: list) -> dict:
        """
        Sends a ClientHello with ONLY the specified groups.
        Returns the parsed ServerHello or connection error.
        """
        client_hello = self._build_client_hello(custom_groups=groups)
        
        try:
            with socket.create_connection((self.hostname, self.port), timeout=self.timeout) as sock:
                sock.sendall(client_hello)
                response = sock.recv(4096)
                
                if not response:
                    return {"status": "CONNECTION_DROPPED", "reason": "No response"}
                    
                parsed = self._parse_server_hello(response)
                
                if parsed["negotiated_cipher"]:
                    return {"status": "NEGOTIATED", "data": parsed}
                else:
                    return {"status": "HANDSHAKE_FAILED", "data": response.hex()[:100]}
                    
        except socket.timeout:
            return {"status": "TIMEOUT"}
        except ConnectionResetError:
            return {"status": "CONNECTION_RESET"}
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

    def simulate_downgrade_attack(self) -> dict:
        """
        Attempts to force the server into a classical-only negotiation.
        If the server allows it (i.e. it isn't enforcing strict PQC), it is vulnerable.
        """
        # Classical-only groups (e.g. SECP256R1)
        classical_groups = [0x0017, 0x0018]
        result = self.probe_custom_groups(classical_groups)
        
        is_vulnerable = False
        if result["status"] == "NEGOTIATED":
            is_vulnerable = True # The server accepted a classical-only downgrade!
            
        return {
            "downgrade_attempted": True,
            "server_accepted_classical": is_vulnerable,
            "probe_result": result
        }

    def full_deep_probe(self) -> dict:
        # 1. PQC / Hybrid Supported Probe
        hybrid_groups = [0x11ec, 0x6399, 0x001d, 0x0017] # ML-KEM, Kyber, X25519, P-256
        standard_result = self.probe_custom_groups(hybrid_groups)
        
        # 2. Downgrade Attack
        downgrade_result = self.simulate_downgrade_attack()
        
        return {
            "raw_probe_supported": True,
            "standard_probe": standard_result,
            "downgrade_simulation": downgrade_result
        }
