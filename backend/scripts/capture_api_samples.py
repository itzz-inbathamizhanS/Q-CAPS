"""Capture real request/response samples from the main API for docs/api-samples/.

Runs the FastAPI app in-process against a throwaway in-memory SQLite database (never the real one), drives the main
learner flow, and writes each exchange as JSON. Bearer tokens and passwords are masked before writing.

    python backend/scripts/capture_api_samples.py

Output: docs/api-samples/<NN>_<name>.json and docs/api-samples/INDEX.md
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend" / "main_api"))
os.environ["QCAPS_DATABASE_URL"] = "sqlite://"
os.environ.pop("QCAPS_ENABLE_LEGACY_QUIZ_SUBMIT", None)
os.environ.setdefault("QCAPS_JWT_SECRET", "sample-capture-secret-not-for-production-0123456789")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import seed_quizzes  # noqa: E402
from course_content.import_curriculum import DEFAULT_SOURCE, import_curriculum  # noqa: E402
from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402

OUT = ROOT / "docs" / "api-samples"
MASK = "***MASKED***"
MAX_LIST = 3  # long arrays are trimmed so samples stay readable


def mask(value):
    if isinstance(value, dict):
        return {k: (MASK if k in {"access_token", "password", "Authorization"} else mask(v)) for k, v in value.items()}
    if isinstance(value, list):
        trimmed = [mask(v) for v in value[:MAX_LIST]]
        if len(value) > MAX_LIST:
            trimmed.append(f"... {len(value) - MAX_LIST} more items trimmed in this sample")
        return trimmed
    return value


def main():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with Session() as db:
        seed_quizzes.seed(db)
        import_curriculum(db, DEFAULT_SOURCE)

    def override():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    client = TestClient(app)
    OUT.mkdir(parents=True, exist_ok=True)
    index = []

    def call(name, method, path, body=None, auth=None, note=""):
        headers = {"Authorization": f"Bearer {auth}"} if auth else {}
        res = client.request(method, path, json=body, headers=headers)
        try:
            payload = res.json()
        except ValueError:
            payload = res.text
        record = {
            "endpoint": f"{method} {path}",
            "note": note,
            "request": {"headers": mask(headers), "body": mask(body) if body is not None else None},
            "response": {"status": res.status_code, "body": mask(payload)},
        }
        fname = f"{len(index) + 1:02d}_{name}.json"
        (OUT / fname).write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        index.append((fname, f"{method} {path}", res.status_code, note))
        return res

    call("health", "GET", "/api/health", note="Liveness check used by Render.")
    call("register", "POST", "/api/auth/register", {"name": "sample-learner", "password": "Sample-Pass-123"},
         note="Creates a learner account; the password is hashed on the server.")
    token = call("login", "POST", "/api/auth/login", {"name": "sample-learner", "password": "Sample-Pass-123"},
                 note="Returns a signed JWT (masked here).").json()["access_token"]
    call("me", "GET", "/api/auth/me", auth=token, note="Identity comes from the token, never from the client.")
    call("me_unauthenticated", "GET", "/api/auth/me", note="Without a token the API refuses the request.")

    module = "track_a_a1_computing_foundations"
    attempt = call("quiz_start", "POST", f"/api/quizzes/{module}/attempts", auth=token,
                   note="Server builds a shuffled form. No answer keys are included.").json()
    first = attempt["questions"][0]
    call("quiz_answer", "POST", f"/api/quizzes/attempts/{attempt['attempt_id']}/answers",
         {"item_id": first["item_id"], "selected_position": 0}, auth=token,
         note="Records and locks one answer; feedback is returned after locking.")
    call("quiz_submit", "POST", f"/api/quizzes/attempts/{attempt['attempt_id']}/submit",
         {"answers": [{"item_id": q["item_id"], "selected_position": 0} for q in attempt["questions"][1:3]]}, auth=token,
         note="Score, percentage and XP are computed on the server from the stored attempt (the answer locked above "
              "counts; unanswered questions count as wrong).")
    call("legacy_submit_disabled", "POST", "/api/quizzes/submit",
         {"user_id": 1, "topic": "pqc", "correct_answers": 10, "total_questions": 10}, auth=token,
         note="The old endpoint that trusted client scores is disabled (410).")
    call("diagnostic_results", "GET", "/api/diagnostic/results", auth=token)
    call("skill_matrix", "GET", "/api/users/me/skill-matrix", auth=token,
         note="Unassessed skills are reported as unknown, not as 0% or 50%.")
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    call("recommendation", "GET", f"/api/users/{me['id']}/recommendation", auth=token,
         note="Explainable recommendation for the signed-in learner.")
    call("leaderboard", "GET", "/api/leaderboard", auth=token)
    call("content_tracks", "GET", "/api/content/tracks", auth=token, note="Curriculum tracks and modules.")
    call("activities_me", "GET", "/api/activities/me", auth=token)
    call("scanner_logs", "GET", "/api/scanner/logs", auth=token)
    call("admin_forbidden", "GET", "/api/admin/content/tracks", auth=token,
         note="A learner token cannot reach admin routes.")

    app.dependency_overrides.clear()
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# API request/response samples",
        "",
        f"Captured {stamp} by `backend/scripts/capture_api_samples.py` against an in-memory test database.",
        "Tokens and passwords are masked. Long lists are trimmed to the first few items.",
        "Re-run the script to regenerate these files after an API change.",
        "",
        "| File | Endpoint | Status | Note |",
        "|---|---|---|---|",
    ]
    lines += [f"| [{f}]({f}) | `{e}` | {s} | {n} |" for f, e, s, n in index]
    (OUT / "INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(index)} samples to {OUT}")


if __name__ == "__main__":
    main()
