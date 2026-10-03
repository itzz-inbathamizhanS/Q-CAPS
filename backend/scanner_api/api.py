import json
import os
import time
import threading
from collections import defaultdict, deque

import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS

import scanner.ownership as ownership
from receipts import issue_receipt
from scanner.errors import ScannerException, ScannerErrorType
from scanner.security.target_validator import normalize_hostname
from scanner_engine import analyze_domain

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4096  # requests are tiny: {"url": ..., "mode": ...}

# CORS restricted to configured frontend origins (comma-separated).
_origins = [o.strip() for o in os.environ.get(
    "QCAPS_CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",") if o.strip()]
CORS(app, origins=_origins)

# The scanner validates the same JWTs issued by the main API (shared secret).
# Fail closed: without a configured secret no scan is allowed.
JWT_SECRET = os.environ.get("QCAPS_JWT_SECRET")
JWT_ALGORITHM = "HS256"

RATE_LIMIT_COUNT = int(os.environ.get("SCANNER_RATE_LIMIT", 5))
RATE_LIMIT_WINDOW = int(os.environ.get("SCANNER_RATE_WINDOW_SECONDS", 60))
MAX_CONCURRENT_SCANS = int(os.environ.get("SCANNER_MAX_CONCURRENT", 3))
MODES = ("standard", "full")

_scan_slots = threading.BoundedSemaphore(MAX_CONCURRENT_SCANS)
_history = defaultdict(deque)
_history_lock = threading.Lock()
_active_users = set()  # one running scan per user


def _authenticate():
    """Return the user id from a valid Bearer JWT, or None."""
    if not JWT_SECRET:
        return None
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        payload = jwt.decode(header[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("typ") is not None:  # a scan receipt is not an access token
        return None
    return payload.get("sub")


def _rate_limited(key) -> bool:
    now = time.monotonic()
    with _history_lock:
        q = _history[key]
        while q and now - q[0] > RATE_LIMIT_WINDOW:
            q.popleft()
        if len(q) >= RATE_LIMIT_COUNT:
            return True
        q.append(now)
        return False


def _verification_info(user_id, hostname, verified=None):
    domain = hostname
    body = {"hostname": hostname, "record_type": "TXT", "record_name": ownership.record_name(domain),
            "record_value": ownership.record_value(JWT_SECRET, user_id, domain),
            "note": "The record may instead be published on a parent domain (for example the registered domain)."}
    if verified is not None:
        body["verified"] = verified["verified"]
        body["verified_domain"] = verified["domain"]
    return body


@app.route('/api/domain-verification', methods=['POST'])
def domain_verification():
    """Tell the user which DNS TXT record proves they control a domain, and whether it is published."""
    if not JWT_SECRET:
        return jsonify({"error": "Scanner is not configured (QCAPS_JWT_SECRET missing)"}), 503
    user_id = _authenticate()
    if user_id is None:
        return jsonify({"error": "Authentication required"}), 401
    if _rate_limited(("verify", user_id)):
        return jsonify({"error": "Rate limit exceeded. Try again later."}), 429
    data = request.get_json(silent=True)
    if not data or not isinstance(data.get("hostname"), str):
        return jsonify({"error": "Missing hostname parameter"}), 400
    try:
        hostname = normalize_hostname(data["hostname"])
    except ScannerException as e:
        return jsonify({"error": e.message}), 400
    return jsonify(_verification_info(user_id, hostname, ownership.check_ownership(JWT_SECRET, user_id, hostname)))


@app.route('/api/scan', methods=['POST'])
def scan_endpoint():
    if not JWT_SECRET:
        return jsonify({"error": "Scanner is not configured (QCAPS_JWT_SECRET missing)"}), 503
    user_id = _authenticate()
    if user_id is None:
        return jsonify({"error": "Authentication required"}), 401
    if _rate_limited(user_id):
        return jsonify({"error": "Rate limit exceeded. Try again later."}), 429

    data = request.get_json(silent=True)
    if not data or not isinstance(data.get('url'), str):
        return jsonify({"error": "Missing URL parameter"}), 400
    mode = data.get("mode", "standard")
    if mode not in MODES:
        return jsonify({"error": "mode must be 'standard' or 'full'"}), 400
    try:
        target_url = normalize_hostname(data['url'])
    except ScannerException as e:
        return jsonify({"error": e.message}), 400

    authorization = {"ownership_verified": False, "verified_domain": None}
    if mode == "full":
        proof = ownership.check_ownership(JWT_SECRET, user_id, target_url)
        if not proof["verified"]:
            body = _verification_info(user_id, target_url, proof)
            body["error"] = "Full scans need verified ownership of the domain. Publish the DNS TXT record below, then retry."
            return jsonify(body), 403
        authorization = {"ownership_verified": True, "verified_domain": proof["domain"]}

    with _history_lock:
        if user_id in _active_users:
            return jsonify({"error": "A scan is already running for this account."}), 429
        _active_users.add(user_id)
    if not _scan_slots.acquire(blocking=False):
        with _history_lock:
            _active_users.discard(user_id)
        return jsonify({"error": "Scanner busy. Try again shortly."}), 503
    try:
        result = analyze_domain(target_url, mode=mode, authorization=authorization)
        if result.get("error"):
            # The target could not be scanned (does not resolve, or is restricted). That is a request
            # problem, not a result: do not return it as scan data.
            return jsonify({"error": result["error"]}), 422
        # Lets the main API verify that a result relayed by the browser really came from this scan.
        # Sign exactly what the browser receives (Flask's encoder, not json.dumps, serialises it).
        result = json.loads(app.json.dumps(result))
        result["receipt"] = issue_receipt(JWT_SECRET, user_id, result)
        return jsonify(result)
    except Exception:
        app.logger.exception("Scan failed")
        return jsonify({"error": "Scan failed"}), 500
    finally:
        _scan_slots.release()
        with _history_lock:
            _active_users.discard(user_id)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('SCANNER_HOST', '127.0.0.1')
    print(f"Q-CAPS scanner API running on http://{host}:{port}")
    app.run(host=host, port=port, debug=False, threaded=True)
