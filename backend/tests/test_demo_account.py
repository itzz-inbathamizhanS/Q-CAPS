"""The demo-account script writes records that the real API reads back as a fully completed course."""
import pytest

import models
import seed_quizzes
from activities import catalogue
from demo_account import create_demo_account


@pytest.fixture
def seeded(db):
    seed_quizzes.seed(db)
    return db


def test_demo_account_is_fully_completed_as_the_api_sees_it(client, seeded):
    db = seeded
    summary = create_demo_account(db, "demo-complete", "a-demo-password-1")
    token = client.post("/api/auth/login", json={"name": "demo-complete", "password": "a-demo-password-1"}).json()["access_token"]
    me = client.get("/api/activities/me", headers={"Authorization": f"Bearer {token}"}).json()
    quiz_modules = [m.module_id for m in db.query(models.QuizModule).all()]
    assert sorted(me["passed_modules"]) == sorted(quiz_modules) and len(quiz_modules) == 36
    assert all(score == 100.0 for score in me["quiz_scores"].values())
    labs, missions = catalogue._load()["labs"], catalogue._load()["missions"]
    assert len(me["completed_labs"]) == len(labs) and len(me["completed_missions"]) == len(missions)
    assert me["xp"] == summary["xp"] > 0
    assert "Incident Handler" in me["badges"]


def test_demo_accounts_need_a_demo_name_and_an_explicit_reset(seeded):
    with pytest.raises(ValueError, match="starts with 'demo'"):
        create_demo_account(seeded, "alice", "a-demo-password-1")
    create_demo_account(seeded, "demo-x", "a-demo-password-1")
    with pytest.raises(ValueError, match="already exists"):
        create_demo_account(seeded, "demo-x", "a-demo-password-1")
    again = create_demo_account(seeded, "demo-x", "a-demo-password-1", reset=True)
    assert seeded.query(models.User).filter_by(name="demo-x").count() == 1 and again["xp"] > 0
