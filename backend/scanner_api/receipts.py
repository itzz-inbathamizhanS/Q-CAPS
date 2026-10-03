"""Signs scan results so the main API can verify they came from this scanner (see
backend/main_api/scan_receipts.py, which verifies them). The two services are deployed separately,
so the canonical form is duplicated here and must stay byte-for-byte identical."""
import hashlib
import json
from datetime import datetime, timedelta, timezone

import jwt

RECEIPT_TYPE = "qcaps-scan-receipt"
RECEIPT_TTL = timedelta(minutes=15)
UNSIGNED_KEYS = ("receipt", "logId")


def _normalise(value):
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, dict):
        return {k: _normalise(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalise(v) for v in value]
    return value


def canonical_hash(result) -> str:
    body = {k: v for k, v in result.items() if k not in UNSIGNED_KEYS} if isinstance(result, dict) else result
    text = json.dumps(_normalise(body), sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(text.encode("ascii")).hexdigest()


def issue_receipt(secret: str, user_id, result) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"typ": RECEIPT_TYPE, "sub": str(user_id), "sha256": canonical_hash(result),
         "iat": now, "exp": now + RECEIPT_TTL},
        secret, algorithm="HS256",
    )
