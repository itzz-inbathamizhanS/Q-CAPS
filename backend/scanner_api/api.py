import json
import os
import re
import time
import threading
from collections import defaultdict, deque

import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS

from receipts import issue_receipt
from scanner_engine import analyze_domain

app = Flask(__name__)

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

_scan_slots = threading.BoundedSemaphore(MAX_CONCURRENT_SCANS)
_history = defaultdict(deque)
_history_lock = threading.Lock()

HOSTNAME_REGEX = re.compile(
    r'^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$'
)


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


def _rate_limited(user_id) -> bool:
    now = time.monotonic()
    with _history_lock:
        q = _history[user_id]
        while q and now - q[0] > RATE_LIMIT_WINDOW:
            q.popleft()
        if len(q) >= RATE_LIMIT_COUNT:
            return True
        q.append(now)
        return False


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

    target_url = data['url'].replace("https://", "").replace("http://", "").split("/")[0]
    if not HOSTNAME_REGEX.match(target_url):
        return jsonify({"error": "Invalid hostname format"}), 400

    if not _scan_slots.acquire(blocking=False):
        return jsonify({"error": "Scanner busy. Try again shortly."}), 503
    try:
        result = analyze_domain(target_url)
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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('SCANNER_HOST', '127.0.0.1')
    print(f"Q-CAPS OSINT API running on http://{host}:{port}")
    app.run(host=host, port=port, debug=False, threaded=True)
