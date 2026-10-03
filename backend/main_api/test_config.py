"""Run: pytest test_config.py -q"""
import pathlib

import pytest

from config import MIN_SECRET_LENGTH, load_jwt_secret

GOOD = "x" * 40


def test_uses_configured_secret():
    assert load_jwt_secret({"QCAPS_JWT_SECRET": GOOD}) == GOOD


def test_rejects_short_secret_in_any_environment():
    for env in ({"QCAPS_JWT_SECRET": "short"}, {"QCAPS_JWT_SECRET": "short", "QCAPS_ENV": "production"}):
        with pytest.raises(RuntimeError, match="at least"):
            load_jwt_secret(env)


def test_production_requires_secret():
    with pytest.raises(RuntimeError, match="required"):
        load_jwt_secret({"QCAPS_ENV": "production"})
    with pytest.raises(RuntimeError, match="required"):
        load_jwt_secret({"QCAPS_ENV": "PRODUCTION", "QCAPS_JWT_SECRET": "  "})


def test_development_fallback_is_random_and_long():
    a, b = load_jwt_secret({}), load_jwt_secret({})
    assert a != b and len(a) >= MIN_SECRET_LENGTH


def test_old_hardcoded_key_is_gone():
    here = pathlib.Path(__file__).parent
    for f in here.glob("*.py"):
        if f.name != "test_config.py":
            assert "qcaps_super_secret" not in f.read_text(), f.name
