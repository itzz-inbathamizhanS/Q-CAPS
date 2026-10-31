# API request/response samples

Captured 2026-10-31 15:53 UTC by `backend/scripts/capture_api_samples.py` against an in-memory test database.
Tokens and passwords are masked. Long lists are trimmed to the first few items.
Re-run the script to regenerate these files after an API change.

| File | Endpoint | Status | Note |
|---|---|---|---|
| [01_health.json](01_health.json) | `GET /api/health` | 200 | Liveness check used by Render. |
| [02_register.json](02_register.json) | `POST /api/auth/register` | 200 | Creates a learner account; the password is hashed on the server. |
| [03_login.json](03_login.json) | `POST /api/auth/login` | 200 | Returns a signed JWT (masked here). |
| [04_me.json](04_me.json) | `GET /api/auth/me` | 200 | Identity comes from the token, never from the client. |
| [05_me_unauthenticated.json](05_me_unauthenticated.json) | `GET /api/auth/me` | 401 | Without a token the API refuses the request. |
| [06_quiz_start.json](06_quiz_start.json) | `POST /api/quizzes/track_a_a1_computing_foundations/attempts` | 200 | Server builds a shuffled form. No answer keys are included. |
| [07_quiz_answer.json](07_quiz_answer.json) | `POST /api/quizzes/attempts/316b2e68277d4b069791122585020a6e/answers` | 200 | Records and locks one answer; feedback is returned after locking. |
| [08_quiz_submit.json](08_quiz_submit.json) | `POST /api/quizzes/attempts/316b2e68277d4b069791122585020a6e/submit` | 200 | Score, percentage and XP are computed on the server from the stored attempt (the answer locked above counts; unanswered questions count as wrong). |
| [09_legacy_submit_disabled.json](09_legacy_submit_disabled.json) | `POST /api/quizzes/submit` | 410 | The old endpoint that trusted client scores is disabled (410). |
| [10_diagnostic_results.json](10_diagnostic_results.json) | `GET /api/diagnostic/results` | 200 |  |
| [11_skill_matrix.json](11_skill_matrix.json) | `GET /api/users/me/skill-matrix` | 200 | Unassessed skills are reported as unknown, not as 0% or 50%. |
| [12_recommendation.json](12_recommendation.json) | `GET /api/users/1/recommendation` | 200 | Explainable recommendation for the signed-in learner. |
| [13_leaderboard.json](13_leaderboard.json) | `GET /api/leaderboard` | 200 |  |
| [14_content_tracks.json](14_content_tracks.json) | `GET /api/content/tracks` | 200 | Curriculum tracks and modules. |
| [15_activities_me.json](15_activities_me.json) | `GET /api/activities/me` | 200 |  |
| [16_scanner_logs.json](16_scanner_logs.json) | `GET /api/scanner/logs` | 200 |  |
| [17_admin_forbidden.json](17_admin_forbidden.json) | `GET /api/admin/content/tracks` | 403 | A learner token cannot reach admin routes. |
