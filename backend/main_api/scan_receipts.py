"""Scan receipts: proof that a scan result was produced by the Q-CAPS scanner for this user.

The browser relays scanner output to /api/scanner/log, so the main API cannot otherwise tell a real
scan from a fabricated one (and scan logs award XP and feed recommendations). The scanner signs a
short-lived HS256 token over a hash of its result with the shared QCAPS_JWT_SECRET; the main API
verifies it, binds it to the authenticated user and derives everything it stores from the result.

canonical_hash() must stay byte-for-byte identical to backend/scanner_api/receipts.py.
"""
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

RECEIPT_TYPE = "qcaps-scan-receipt"
RECEIPT_TTL = timedelta(minutes=15)
# Keys the browser adds to the scanner's result after it was signed.
UNSIGNED_KEYS = ("receipt", "logId")


class ReceiptError(ValueError):
    pass


def _normalise(value: Any) -> Any:
    # JSON.stringify writes 1.0 as 1; make Python and JavaScript round-trips hash the same.
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, dict):
        return {k: _normalise(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalise(v) for v in value]
    return value


def strip_unsigned(result: Any) -> Any:
    if isinstance(result, dict):
        return {k: v for k, v in result.items() if k not in UNSIGNED_KEYS}
    return result


def canonical_json(result: Any) -> str:
    return json.dumps(_normalise(strip_unsigned(result)), sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def canonical_hash(result: Any) -> str:
    return hashlib.sha256(canonical_json(result).encode("ascii")).hexdigest()


def issue_receipt(secret: str, user_id: Any, result: Any, now: datetime = None) -> str:
    now = now or datetime.now(timezone.utc)
    return jwt.encode(
        {"typ": RECEIPT_TYPE, "sub": str(user_id), "sha256": canonical_hash(result),
         "iat": now, "exp": now + RECEIPT_TTL},
        secret, algorithm="HS256",
    )


def verify_receipt(token: str, secret: str, user_id: int, result: Any) -> dict:
    """Return the receipt claims, or raise ReceiptError."""
    if not token:
        raise ReceiptError("Scan results must include the scanner's receipt")
    try:
        claims = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ReceiptError("Scanner receipt has expired")
    except jwt.PyJWTError:
        raise ReceiptError("Scanner receipt is invalid")
    if claims.get("typ") != RECEIPT_TYPE:
        # An access token is signed with the same secret; it must not pass as a receipt.
        raise ReceiptError("Scanner receipt is invalid")
    if claims.get("sub") != str(user_id):
        raise ReceiptError("Scanner receipt was issued to a different user")
    if claims.get("sha256") != canonical_hash(result):
        raise ReceiptError("Scan result does not match its receipt")
    return claims


def count_findings(result: Any) -> int:
    """Number of findings in a verified result (dict from the scanner, or the legacy list form)."""
    if isinstance(result, list):
        return len(result)
    if isinstance(result, dict):
        found = (result.get("crypto") or {}).get("vulnerabilities_found") or []
        return len(found) if isinstance(found, list) else 0
    return 0
