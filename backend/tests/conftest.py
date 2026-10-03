"""Shared fixtures: an isolated in-memory SQLite database, reset for every test.

QCAPS_DATABASE_URL must be set before main/database are imported, so the real
qcaps.db is never touched by the API tests.
"""
import os
import sys
from datetime import timedelta
from pathlib import Path

os.environ["QCAPS_DATABASE_URL"] = "sqlite://"
os.environ.setdefault("QCAPS_JWT_SECRET", "test-secret-not-for-production-use-0123456789")

MAIN_API = Path(__file__).resolve().parents[1] / "main_api"
if str(MAIN_API) not in sys.path:
    sys.path.insert(0, str(MAIN_API))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import database  # noqa: E402
import main  # noqa: E402
from course_content.ratelimit import checkpoint_limiter, login_limiter  # noqa: E402
import models  # noqa: E402


@pytest.fixture(autouse=True)
def _fresh_database():
    database.Base.metadata.drop_all(bind=database.engine)
    database.Base.metadata.create_all(bind=database.engine)
    checkpoint_limiter.reset()
    login_limiter.reset()
    yield


@pytest.fixture
def db():
    session = database.SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    return TestClient(main.app)


@pytest.fixture
def make_user(db):
    def _make(name: str, role: str = "learner"):
        user = models.User(name=name, hashed_password=main.get_password_hash("x" * 12), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        token = main.create_access_token({"sub": str(user.id)}, timedelta(minutes=5))
        return user, {"Authorization": f"Bearer {token}"}
    return _make


@pytest.fixture
def admin(make_user):
    return make_user("admin-user", "admin")


@pytest.fixture
def learner(make_user):
    return make_user("learner-user", "learner")
