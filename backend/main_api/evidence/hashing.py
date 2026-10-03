import hashlib
import json
from typing import Any, Dict

def get_canonical_json(data: Dict[str, Any]) -> str:
    """Returns a deterministically sorted JSON string."""
    return json.dumps(data, sort_keys=True, separators=(',', ':'))

def hash_payload(data: Dict[str, Any]) -> str:
    """Returns the SHA256 hash of the canonical JSON representation of the data."""
    canonical = get_canonical_json(data)
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()
