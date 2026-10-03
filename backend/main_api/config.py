"""Runtime configuration. Secrets come from the environment and are never hard-coded."""
import logging
import os
import secrets

logger = logging.getLogger("qcaps.config")

MIN_SECRET_LENGTH = 32


def load_jwt_secret(env=None) -> str:
    """Return the JWT signing secret.

    QCAPS_JWT_SECRET must be at least 32 characters. If it is unset:
      - QCAPS_ENV=production  -> refuse to start
      - otherwise (development/test) -> use a random per-process secret; existing
        tokens become invalid on restart, and multiple workers will not share it.
    """
    env = os.environ if env is None else env
    secret = env.get("QCAPS_JWT_SECRET", "").strip()

    if secret:
        if len(secret) < MIN_SECRET_LENGTH:
            raise RuntimeError(
                f"QCAPS_JWT_SECRET must be at least {MIN_SECRET_LENGTH} characters "
                "(generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\")"
            )
        return secret

    if env.get("QCAPS_ENV", "development").lower() == "production":
        raise RuntimeError("QCAPS_JWT_SECRET is required when QCAPS_ENV=production")

    logger.warning(
        "QCAPS_JWT_SECRET is not set; using a temporary random secret. "
        "Logins will not survive a restart. Set QCAPS_JWT_SECRET to keep sessions."
    )
    return secrets.token_urlsafe(48)
