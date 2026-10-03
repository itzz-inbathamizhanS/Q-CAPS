"""Small in-memory sliding-window limiter (checkpoint attempts, login attempts).

State is per process: with several workers each has its own counters, so the effective
limit is limit x workers. Checkpoints are formative (no XP, no score), so there it is friction
against answer enumeration, not a security boundary. For logins it slows online password
guessing; a deployment with several workers or hosts should use a shared store instead.
"""
import os
import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict, Hashable, Optional


def _int_env(name: str, default: int) -> int:
    try:
        return max(1, int(os.environ.get(name, default)))
    except ValueError:
        return default


class SlidingWindowLimiter:
    def __init__(self, limit_env: str = "QCAPS_CHECKPOINT_RATE_LIMIT", default_limit: int = 6,
                 window_env: str = "QCAPS_CHECKPOINT_RATE_WINDOW_SECONDS", default_window: int = 60) -> None:
        self._limit_env, self._default_limit = limit_env, default_limit
        self._window_env, self._default_window = window_env, default_window
        self._hits: Dict[Hashable, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: Hashable, now: Optional[float] = None) -> int:
        """Record an attempt. Returns 0 if allowed, else seconds until another is allowed."""
        limit = _int_env(self._limit_env, self._default_limit)
        window = _int_env(self._window_env, self._default_window)
        now = time.monotonic() if now is None else now
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] >= window:
                hits.popleft()
            if len(hits) >= limit:
                return max(1, int(window - (now - hits[0])) + 1)
            hits.append(now)
            return 0

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


checkpoint_limiter = SlidingWindowLimiter()
# Keyed on (client address, lower-cased name): limits guessing against one account from one
# address without letting a remote attacker lock the real user out from their own address.
login_limiter = SlidingWindowLimiter("QCAPS_LOGIN_RATE_LIMIT", 10, "QCAPS_LOGIN_RATE_WINDOW_SECONDS", 300)
