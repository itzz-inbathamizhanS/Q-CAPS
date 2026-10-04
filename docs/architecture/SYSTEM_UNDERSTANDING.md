# Q-CAPS System Understanding Report

**Scope.** This analysis was produced from a read-only clone of `origin/main` at commit `5637701`. It covers the repository as of that commit only — any local changes made since are not reflected here and should be re-checked.

**Updates since this report (2026-10-03 end-to-end audit, verified by running the stack and tests).**
S1 (JWT secret from env), S4 (server-graded quizzes, legacy submit returns 410), S9 (login now throttled per address+name; leaderboard now requires auth) and S12 (exact case-insensitive name match) are resolved. S5 is resolved: `/api/scanner/log` requires a receipt signed by the scanner (`scan_receipts.py`) and derives findings/XP from the verified result. Registration validates name/password, `progress_data` must be a JSON object ≤ 64 KB (S8 partly; the blob is still client-authored), and profile readiness no longer mixes in XP. Still open: S6 (DNS-rebinding window), S7 for the diagnostic assessment, S10, S11, and evidence/findings having no ownership model.

**Scanner overhaul (2026-10-03, verified against live hosts and tests).** Sections 13 and 16 below describe the scanner as
originally analysed. It was rewritten: result schema v2, observed TLS 1.3 key-exchange detection (hybrid ML-KEM vs classical),
pinned connections (S6 resolved), findings with evidence instead of a score, fabricated breach and subdomain data removed (S2),
active checks gated behind DNS-based domain ownership, flat once-per-day scan XP, scan history and PDF report from the backend,
scanner evidence reaching the recommender, and per-user ownership of scan-derived assets, evidence and findings. See
`docs/architecture/SCANNER.md`.

**Project restructure (2026-10-03).** The legacy Node server and test artifacts were removed, mockups and planning documents moved under `docs/`, the loose backend tests moved to `backend/tests` and `backend/scripts`, and unused frontend dependencies were dropped. Paths in the sections below describe the layout at the time of the original analysis unless stated otherwise; see the root `README.md` for the current layout.

**What was not verified.** The backend test suite, the frontend build, and the end-to-end tests were not executed (this was an analysis-only pass). Anything described as "likely" is inferred from reading the code, not from running it.

---

## 1. Executive Summary

Q-CAPS is a working prototype, not a production system, and its integrity problems are bigger than its UI problems.

- **The frontend is the real system of record.** Progress, XP, badges, missions, certificates, the diagnostic assessment and most readiness displays are computed in the browser and stored in `localStorage` or an opaque JSON blob.
- **The backend trusts the client.** The FastAPI backend stores quiz scores and scanner logs, but it believes whatever numbers the client sends.
- **There are three security problems that matter immediately:**
  1. A hard-coded JWT secret in a public repo, which lets anyone forge tokens for any user.
  2. An unauthenticated scanner that will run port scans and reconnaissance against any public host.
  3. Fabricated "dark-web breach" data shown to users and printed in PDF reports as real findings.
- **The research pipeline is disconnected.** The adaptive loop (ASSESS → RECOMMEND → REASSESS) exists only in pieces. There are two recommendation engines with different taxonomies, three readiness formulas, and scanner evidence that never reaches the backend recommender because of a data-format mismatch.

## 2. Repository Structure

| Path | Role | Status |
|---|---|---|
| `frontend/` | React 18 + TypeScript + Vite + Zustand + Tailwind v4 | Active |
| `backend/main_api/` | FastAPI + SQLAlchemy + SQLite (`qcaps.db`), JWT auth | Active |
| `backend/scanner_api/` | **Flask** (not FastAPI) scanner on port 5000 | Active |
| `content/Course`, `content/Quizzes` | 36 module markdown files plus quiz JSON (Tracks A–D) | Source content |
| `content/Mission`, `Labs`, `Badges`, `ui-specs` | Mission, escape-room and badge specs | Partly compiled into `frontend/src/data` |
| `content/Backend/` | **Legacy** Node/Express/MongoDB auth server | Removed in the project restructure (nothing called it; see git history) |
| `docs/archive/tasks/*` | Team task-assignment docs | Archived planning, partly outdated |
| `docs/architecture/FRONTEND_STRUCTURE.md` | Architecture doc | Mostly accurate |
| `docs/design/interface-concept/` | Static design mockups (moved from `frontend/interface_concept/`) | Not runtime |
| `frontend/test-results/` | Playwright failure artifacts | Removed in the restructure (now git-ignored) |

**Remote branches.** Besides `main`, the repo has `Content-Security`, `Sample-01`, `sample-02`, `feature/scanner-backend` and `vishnu-priya-backend`. All are older than `main`. Not diffed.

**Missing infrastructure.** No root README, Dockerfile, CI configuration or deployment configuration.

## 3. Complete Architecture

```
Browser (React SPA :5173)
 ├─ localStorage: qcaps-auth-storage (JWT), qcaps-curriculum-progress,
 │                qcaps_latest_assessment_result_<id>, scanner history
 ├─ REST  → FastAPI :8000  (/api/auth, /users, /quizzes, /scanner/log, /leaderboard)
 ├─ WS    → ws://localhost:8000/api/ws/leaderboard?token=…   (hard-coded URL)
 └─ REST  → Flask   :5000  /api/scan   (no auth)
               └─ outbound: WHOIS, DNS, crt.sh, hackertarget, TLS, TCP ports, ip-api (geo off)
```

The browser calls the scanner directly, then forwards the scanner's output to the FastAPI backend at `/api/scanner/log`. The backend has no way to verify that the forwarded scan result is genuine.

## 4. Frontend Architecture

**Routing.** All 17 pages are imported eagerly in `src/app/routes/index.tsx`, with no `lazy()` or code splitting.

**Route protection.** `ProtectedRoute` only checks the `isAuthenticated` boolean stored in `localStorage`. It never validates the token or its expiry.

**State.**
- `features/auth/authStore.ts` holds identity and the token, persisted to `localStorage`.
- `features/curriculum/curriculumStore.ts` is the de facto progress engine. It owns completedModules, quizScores, unlockedBadges, totalXp, readinessScore, missions, escapes, capstones and streak.

**Static data.** About 380 KB of source data is bundled into the app:
- `curriculumData.ts` (207 KB)
- `quizzesData.ts` (110 KB, including answer keys)
- `missionsData.ts`, `badgesData.ts`, `escapeRoomData.ts`, `assessmentData.ts`

**API clients.**
- `services/backendService.ts` talks to FastAPI. Errors are mostly logged and swallowed.
- `features/scanner/scannerService.js` talks to Flask. It's plain JS, alongside the 33 KB `ScannerTool.jsx`, so the scanner feature isn't type-checked.

**Unused dependencies** (zero imports found): `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `framer-motion`, `clsx`, `tailwind-merge`.

## 5. Backend Architecture

**`backend/main_api/main.py`** is a single module containing auth, routes, the WebSocket manager and PDF generation.

**Endpoints:**

| Endpoint | Auth | Ownership check |
|---|---|---|
| `GET /`, `/api/health` | none | n/a |
| `POST /api/auth/register`, `/api/auth/login` | none | n/a |
| `WS /api/ws/leaderboard` | JWT in query string | n/a |
| `POST /api/users/{id}/progress` | JWT | yes |
| `POST /api/quizzes/submit` | JWT | yes (`user_id` must equal token's user) |
| `POST /api/scanner/log` | JWT | yes |
| `GET /api/scanner/logs/{id}/report` | JWT | yes (filtered by `user_id`) |
| `GET /api/users/{id}/profile` | JWT | yes |
| `GET /api/users/{id}/recommendation` | JWT | yes |
| `GET /api/leaderboard` | **none** | n/a |

**Supporting modules.** `recommendation.py` holds the scoring logic. `leaderboard.py` builds rankings and has an O(n) full table scan.

**`requirements.txt` is incomplete.** It lists only fastapi, uvicorn, sqlalchemy and pydantic. It omits `passlib`, `PyJWT`, `reportlab` and `httpx` (needed for tests). The scanner has **no requirements file at all**; it needs flask, flask-cors, python-whois, dnspython, requests and cryptography.

## 6. Database Architecture

The schema lives in `backend/main_api/models.py`, on SQLite at a hard-coded path (`database.py`, `DATABASE_URL`).

- **`User`**: id, name (unique), hashed_password, xp, `progress_data` (Text JSON blob).
- **`QuizScore`**: user_id, topic, score, correct_answers, total_questions, created_at.
- **`ScannerLog`**: user_id, endpoint, status, vulnerabilities_found, details (Text), created_at.

**Structural problems:**
- No foreign keys, no index on `user_id`, no migrations (uses `create_all` when the module is imported).
- No tables for badges, missions, attempts, per-question answers, assessments or skills. All of those live only in `progress_data` or `localStorage`.
- `QuizScore` stores only a coarse topic (4 values), not the module ID. Per-module history is lost.

**Git history.** `qcaps.db` was committed in `4d30c2a`. It was later untracked and is now in `.gitignore`. The historical copy has one user and no password column. Informational only.

## 7. Authentication & Authorization

**Login flow:**
1. `LoginPage` calls `registerUser` (on signup) and then `loginUser`.
2. The backend `login()` returns an HS256 JWT valid for 7 days, with `sub` set to the user ID.
3. The frontend stores the token via `authStore.login`, calls `fetchUserProfile`, and runs `curriculumStore.rehydrate(progress_data)`.

**What works.** `get_current_user` validates the token and loads the user. The per-user endpoints correctly compare `current_user.id` to the path or body `user_id`, so there's no IDOR on those routes.

**Gaps:**
- No roles exist.
- No logout or revocation on the server.
- No rate limiting.
- No password policy. The frontend even falls back to the password `'default'` (`backendService.ts`, `registerUser` and `loginUser`).
- Usernames are matched with `ilike()`, so the SQL wildcard characters `%` and `_` in a submitted name act as patterns.

## 8. Feature Map

| Feature | Real implementation | Where state lives |
|---|---|---|
| Curriculum and modules (36) | Yes, static | Bundle plus local store |
| Module quizzes (36) | Yes, scored client-side | Local store; backend only on pass |
| Diagnostic assessment (10 questions) | Yes, scored client-side | `localStorage` only |
| Skills / gap analysis | Yes, client-side | Derived from `localStorage` |
| Learning recommendations | Two separate engines | Frontend and backend |
| Badges and certificates | Client-side | Local store |
| Missions (BB84, Enterprise migration) | Client-side simulation | Local store |
| Escape rooms | Client-side | Local store |
| PQC Sandbox | Visual simulation using random strings, no real crypto | None |
| Scanner | Real network recon, plus fabricated breach and subdomain data | Flask, then backend log |
| PDF threat report | Yes | Backend |
| Leaderboard plus WebSocket | Yes | Backend XP |
| Community | **Hard-coded `MOCK_THREADS`, not labeled as demo** | None |
| Reassessment | Page exists; not deeply traced | Not determined from the current codebase |

## 9. User/Data Flow (traced)

**Quiz.**
1. `QuizPage` scores the quiz locally against `correctIndex`.
2. It calls `curriculumStore.completeQuiz(moduleId, pct, badge, mod.xp)`.
3. Local XP, badges and readiness are updated.
4. **Only if the score is ≥70%**, it calls `submitQuizScore({topic, correct_answers: round(pct/10), total_questions: 10})`.
5. The backend stores the score and adds `correct × 50` XP.
6. It broadcasts the leaderboard over the WebSocket.
7. Separately, `persistToBackend` overwrites `progress_data` with the full local state.

**Scanner.**
1. `ScannerTool.handleScan` calls `scanEndpoint`, which hits Flask `/api/scan`.
2. The frontend calls `logScannerResult({details: JSON.stringify(entireResult), vulnerabilities_found: n})`. The backend awards `10 + 5n` XP.
3. The UI waits an artificial 6 seconds, then calls `addXp(10 + 5n)` **locally as well**.

**Dashboard.**
- `fetchUserProfile` and `fetchUserRecommendation` feed `KpiSection`, which prefers backend XP and readiness and falls back to local values.
- Other pages (`CurriculumMap`, Badges) show the **local** values. Different screens can therefore show different XP and readiness numbers.

## 10. Assessment & Learning Engine

**Diagnostic assessment.** `pages/Assessment.tsx` uses `data/assessmentData.ts`: 10 questions across 4 domains, with 2–3 questions per domain.
- Domain scores can only be 0, 33, 50, 67 or 100%, which is too coarse to support skill-level claims.
- Results go to `utils/assessmentStorage.ts` (`localStorage`) and **never reach the backend**.

**Skills and learning.** `features/skills/skillsTypes.ts` (`generateSkillGapProfile`, ≥75 = Strong, ≥50 = Developing) and `features/learning/learningRecommendation.ts` (`getPersonalizedLearning`) are purely client-side.
- When there's no assessment data, modules default to "Medium Priority" with score 0. That produces explanation text like "developing 0% capability".
- The taxonomy uses 4 *domains*. The backend uses 4 different *topics*. Nothing maps one to the other.

## 11. Quiz & Gamification System

**Answer keys are exposed.** Every quiz's `correctIndex` and the diagnostic's `correctOptionId` ship in the JS bundle.

**The backend payload doesn't match the real quizzes:**
- Actual sizes: 35 quizzes have **5 questions** and 1 has **8**.
- The frontend always sends `total_questions: 10` with `correct = round(pct/10)`. For example, 4/5 is recorded as 8/10, which earns 400 XP.
- Failing attempts are never sent, so the backend never sees weak scores.

**Prerequisite locks can be bypassed.** `CourseModule` enforces prerequisites, but `/quiz/:moduleId` doesn't check `isModuleUnlocked`.

**XP is counted in two places.**
- **Backend**: 50 per correct answer, plus scanner XP.
- **Local**: `module.xp`, mission, escape, capstone and badge XP, plus scanner XP.

The two counters diverge.

**XP de-duplication breaks across devices.** `xpAwardedModules` isn't included in the `persistToBackend` payload. After `rehydrate` on a new device, the dedup list is lost and local XP can be re-awarded.

**Other store issues:**
- `resetProgress` and `clearLocalProgress` don't reset the streak.
- `persistToBackend` and `submitQuizScore` are called from inside Zustand `set()` updaters, which is a side effect inside state reducers.

**Probable build issue (unverified).** `isModuleUnlocked` exists in the store object but not in the `CurriculumState` interface, while consumers destructure it. Under `strict` TypeScript, `tsc -b` very likely fails.

**Badges and certificates** are evaluated entirely client-side in `BadgesAndCerts.tsx`.

## 12. Quantum/PQC System

**Educational content.** The PQC content in Tracks B9–B11, C8–C11 and D/E is substantial.

**Interactive features:**
- **`SandboxPage.tsx`** is an animated simulation. The "ciphertext" is random characters from `Math.random`, and the log says "Data encrypted with RSA-2048 and CRYSTALS-Kyber", which doesn't happen. It's framed as a simulation, but the log text is misleading.
- **BB84 mission** (`MissionPlay.tsx`) is a reasonable probabilistic classroom simulation.

**PQC detection in the scanner is effectively unreachable.**
- `ssl.cipher()` returns the cipher-suite name, not the key-exchange group. Hybrid ML-KEM shows up as a *group* (for example X25519MLKEM768), so `quantum_status = "quantum_safe"` can never trigger.
- TLS 1.3 suite names (such as `TLS_AES_256_GCM_SHA384`) contain no RSA or ECDHE, so modern servers fall through to "inconclusive". The algorithm is actually identified only through the certificate signature algorithm.

## 13. Scanner Architecture

*Rewritten 2026-10-03; the earlier description (open CORS, `md5`-derived breaches, invented subdomains, unvalidated
`ssl.cipher()` heuristics, all headers reported missing) no longer applies.* The current design, schema and limits are in
`docs/architecture/SCANNER.md`.

## 14. Recommendation & Skill-Gap Engine

**Backend** (`recommendation.py`, `get_recommendation_from_scores`):
- It can only recommend **3 of the 36 modules**: A6, B9 and E4.
- The topic `classical_crypto` (2 modules) is ignored.
- The latest score per topic collapses 10–13 modules into a single number.
- Unattempted topics are labeled `not_attempted` (good), but they sort as if the score were 50. That partly conflicts with the "unknown ≠ 50%" requirement.
- The explanation strings are reasonable.

**Scanner evidence never reaches the backend recommender.** `get_user_recommendation` parses `ScannerLog.details` as a **list** of `{algorithmDetected, threatLevel}`. The real frontend sends the full scan **object**, so the parser silently produces no findings. Only `test_api.py` uses the list format.

**Dead code.** The default-recommendation branch in `main.py:get_recommendation` (`if not recommendations`) can't be reached, because the engine always returns a dict.

**Frontend** (`learningRecommendation.ts`) is a separate engine that works from the diagnostic assessment. It doesn't use quiz history or scanner data.

## 15. Readiness System

There are three inconsistent formulas:

1. **`curriculumStore.calcReadinessScore`**: the average of the best local quiz % per module.
2. **`main.py:get_user_profile`**: `0.7 × avg(all QuizScore rows) + 30 × min(xp, 1000)/1000`. This mixes XP into capability, contrary to project principles. The KPI card labels it "Based on quiz performance", which is inaccurate.
3. **`MissionPlay`**: a mission-local `readiness_score` used for outcome bands.

No readiness score uses scanner evidence, recency or coverage.

## 16. Security Findings

| # | Severity | Finding | Location |
|---|---|---|---|
| S1 | **Critical** | Hard-coded JWT secret in a public repo. Anyone can forge `{"sub": "<id>"}` and take over any account in any deployment running this code. | `main.py` `SECRET_KEY` |
| S2 | **Critical** (integrity) | Fabricated breach intelligence presented as real in the UI and in PDF reports. Fabricated subdomains as well. | `scanner_engine.check_data_leaks`, `enumerate_subdomains`; `ScannerTool.jsx`; `main.py:download_scan_report` |
| S3 | **High** | Scanner is unauthenticated, has CORS `*`, no rate limit, no quota and no target authorization. It acts as an open port-scanning and recon proxy against arbitrary public hosts. | `scanner_api/api.py:scan_endpoint` |
| S4 | **High** | Client-authoritative scoring. `correct_answers`, `total_questions` and `topic` are trusted, so unlimited resubmission gives unlimited XP and arbitrary readiness. | `main.py:submit_quiz_score` |
| S5 | **High** | Client-controlled `vulnerabilities_found` in scanner logs gives arbitrary XP. Scan results aren't verified as coming from the scanner. | `main.py:log_scanner_result` |
| S6 | **Medium** | SSRF time-of-check/time-of-use and DNS rebinding. The IP is validated once with `gethostbyname` (IPv4 only), then each sub-check re-resolves through `create_connection`, `requests.head` and `scan_ports`. IPv6/AAAA paths are never validated. 100.64.0.0/10 is not blocked. | `scanner_engine.analyze_domain` |
| S7 | **Medium** | Answer keys are shipped to the client for all quizzes and the diagnostic, so assessments have no validity. | `data/quizzesData.ts`, `data/assessmentData.ts` |
| S8 | **Medium** | `progress_data` is an unbounded, unvalidated blob that is blindly spread into the store via `rehydrate`. Badges, certificates and completions are entirely client-controlled. | `main.py:update_user_progress`, `curriculumStore.rehydrate` |
| S9 | **Medium** | No login rate limiting. The public `/api/leaderboard` exposes every user's ID and name, which enables username enumeration and supports brute force. | `main.py:login`, `get_leaderboard` |
| S10 | **Medium** | WebSocket issues: token passed in the URL, no user-existence check, token expiry not re-checked on a long-lived socket, unbounded connections, dead sockets not pruned on send failure, hard-coded `ws://`. | `main.py:websocket_leaderboard`, `ConnectionManager`; `Organization.tsx` |
| S11 | **Medium** | 7-day JWT stored in `localStorage` (exposed to any XSS), with no revocation. | `authStore.ts`, `ACCESS_TOKEN_EXPIRE_MINUTES` |
| S12 | **Low** | `ilike()` username matching allows `%` and `_` wildcards in login and register lookups. | `main.py:login`, `register_user` |
| S13 | **Low** | Exception text returned to clients. | `api.py` `str(e)`; `get_leaderboard` |
| S14 | **Low** | Frontend defaults to the password `'default'`; no password policy on the backend. | `backendService.ts` |
| S15 | **Low** | Scan targets are leaked to third parties (hackertarget, crt.sh) without disclosure. | `enumerate_subdomains` |
| S16 | **Info** | Ownership checks on the per-user endpoints are correctly implemented. | `main.py` |
| S17 | **Info** | CORS origins and DB path are hard-coded; no environment configuration exists in the backend. | `main.py`, `database.py` |

## 17. Performance Findings

**Frontend bundle.**
- No code splitting. About 380 KB of data source is pulled in at startup, because `curriculumStore` imports `curriculumData` and the store is used in layout components.
- `qcaps-logo.png` is 326 KB and duplicated in both `public/` and `assets/`.
- `index.css` is 47 KB.
- Seven unused dependencies are declared.

**Backend.**
- `get_leaderboard_data` and `get_user_rank` load every user on each call. The profile endpoint runs a full scan.
- Every quiz submission or scan log broadcasts the full user list to every socket, which costs O(users × connections).

**Client sync.**
- `persistToBackend` sends the whole progress blob on every action, with no debounce.

**Scanner.**
- Synchronous Flask with serial network I/O. Worst case is roughly 25–35 seconds per request (crt.sh alone has a 10-second timeout, plus 7 one-second DNS lookups, 8 × 0.5-second port probes and a 5-second TLS handshake).
- There's no concurrency cap, so this is an easy path to resource exhaustion.
- The UI adds a fixed 6-second artificial delay on top.

## 18. Testing Coverage

**`backend/scripts/smoke_api.py` (was `main_api/test_api.py`).**
- It's a script, not pytest: it uses custom `check()` calls inside `run_api_tests()`, so pytest would collect 0 tests.
- It hits the **real `qcaps.db`**, so a second run would fail at the duplicate "Alice" registration.
- It uses the scanner `details` list format that production never sends.
- **Covered:** health, register/login, quiz scoring, recommendations, leaderboard ranks, profile.
- **Not covered:** 401/403 paths, cross-user IDOR attempts, WebSocket, PDF report.

**`backend/scripts/check_recommendation.py` (was `test_recommendation.py`).** 24 checks against the pure function `get_recommendation_from_scores`. Decent unit coverage of that logic.

**Scanner.** No tests at all.

**Frontend.** No unit tests. The Playwright spec (`tests/qcaps-flows.spec.ts`) and its config **aren't committed**, and Playwright isn't in `package.json`. The committed artifacts show **all 4 E2E flows failed**; the Scanner flow failed waiting for a button labeled "INITIATE SCAN".

**Pass/fail status.** Not determined. Running the suites requires installing dependencies.

## 19. Legacy/Duplicate/Dead Code

**Legacy and planning material:**
- **`content/Backend/`** (removed in the restructure) was a full Express/MongoDB auth server with bcrypt and rate-limiting. Nothing references it. Ironically it has better auth hygiene than the active backend, including a secret from the environment.
- **`docs/archive/tasks/*`** describe the "FastAPI or Node", "SQLite or MongoDB" and "Organizational Readiness Score" plans. They're planning docs, not the current state.

**Broken content pipeline.** `frontend/scripts/compile-content.cjs` reads from `../../Content-Security`, which **doesn't exist**; the folder is now `content/`. The generated `src/data/*.ts` files can't be regenerated, so it's unclear whether the markdown/JSON in `content/` or the `.ts` files are the real source of truth.

**Duplicate logic:**
- 2 recommendation engines
- 3 readiness formulas
- 2 XP counters
- Scanner XP formula duplicated in `ScannerTool.jsx` and `main.py`
- Ranking logic in `leaderboard.py`, overridden by index-based re-ranking in `Organization.tsx` (which also loses ties)

**Dead code:**
- Default-recommendation branch in `main.py:get_recommendation`
- `mission_xp_awarded` in the scanner output
- `VITE_ENABLE_MOCK_DATA` (never read)
- Unused npm packages

**Mock data presented as real.** `Community.tsx` shows `MOCK_THREADS` with no label.

## 20. Technical Debt

**Backend structure and configuration:**
- One monolithic `main.py`.
- No environment config, migrations, foreign keys or indexes.
- Incomplete `requirements.txt`; no requirements file for the scanner.
- Naive vs. timezone-aware `datetime` usage is mixed.

**Frontend:**
- The scanner is in untyped JS.
- Errors are swallowed with `console.warn` everywhere.

**Delivery:**
- No CI, Docker or root README.
- Hard-coded `localhost` URLs in the WebSocket code.

## 21. Research Opportunities (proposed, not implemented)

These require evidence before any novelty claim can be made.

1. **Server-side item-level assessment with pre/post design.** Store per-question responses on the backend. Use the diagnostic as a pre-test and Reassessment as a post-test. Measure learning gain per domain.
   - *Required first:* a larger item bank (the current 2–3 items per domain is too thin) and hidden answer keys.
2. **Evidence-fusion readiness model.** Combine knowledge mastery with crypto-inventory evidence from real scans, with explicit uncertainty (Unknown vs. Beginner).
   - *Hypothesis:* scanner-informed recommendations improve migration-relevant post-test scores more than quiz-only recommendations. Test with A/B assignment.
3. **Honest TLS/PQC inventory.** Detect negotiated key-exchange groups, including hybrid ML-KEM, using a tool that exposes them rather than Python's `ssl.cipher()`. This would produce a defensible crypto-inventory signal.
4. **Explainable recommendation logs.** Persist each recommendation together with its inputs, so outcomes can be audited.

## 22. Critical Files

**Backend:**
- `backend/main_api/main.py` (auth, all routes, readiness, XP, WebSocket, PDF)
- `backend/main_api/recommendation.py`
- `backend/main_api/models.py`
- `backend/main_api/database.py`

**Scanner:**
- `backend/scanner_api/scanner_engine.py`
- `backend/scanner_api/api.py`

**Frontend state and clients:**
- `frontend/src/features/curriculum/curriculumStore.ts`
- `frontend/src/services/backendService.ts`
- `frontend/src/features/scanner/scannerService.js`
- `frontend/src/features/scanner/ScannerTool.jsx`

**Frontend pages and logic:**
- `frontend/src/pages/QuizPage.tsx`
- `frontend/src/pages/Assessment.tsx`
- `frontend/src/features/learning/learningRecommendation.ts`
- `frontend/src/features/skills/skillsTypes.ts`

**Data and tooling:**
- `frontend/src/data/quizzesData.ts`
- `frontend/scripts/compile-content.cjs`

## 23. Recommended Development Order

1. **Security baseline.**
   - Move the JWT secret, CORS origins and DB URL into environment configuration, and rotate the secret.
   - Add authentication, rate limiting and a concurrency cap to the scanner.
   - Remove or clearly label the fabricated breach and subdomain data as `SIMULATION`. Where no real data exists, show "No verified result available".
2. **Make the test harness trustworthy.**
   - Complete `requirements.txt` files.
   - Convert both backend scripts to pytest with an isolated test database.
   - Add 401/403/IDOR tests.
   - Verify that `tsc -b` and `vite build` pass, starting with the `isModuleUnlocked` typing.
3. **Server-authoritative quizzes.**
   - The backend serves questions without answers.
   - The backend scores per-question submissions and records attempts by module ID with the real question count, including failed attempts.
   - The backend becomes the only XP source; remove local XP awarding.
4. **Fix the scanner data contract.** Have Flask's output, the `ScannerLog.details` schema and the recommendation parser agree on one format. Ideally FastAPI should call the scanner itself, rather than trusting a result relayed by the client.
5. **Unify progress, badges and missions** in backend tables. Retire the `progress_data` blob and stop spreading it blindly into the store.
6. **One readiness model and one recommendation engine.** Use a shared taxonomy, cover all 36 modules, and represent Unknown explicitly.
7. **Fix the content pipeline path** and decide which copy of the content is the single source of truth.
8. **Performance work:** lazy-loaded routes, moving quiz data to the API, paginated leaderboard queries, and an async scanner.
9. **UI/UX polish,** labeling Community as demo data until it's real.
10. **Research instrumentation:** pre/post assessment and recommendation logs.

## 24. Practice labs and missions (added 2026-10-04)

Practice labs (branching scenarios) and missions are shown inside the lesson section they belong to (`section_id` in `content/Labs/escape_room_scenarios.json` and `content/Mission/mission_*.json`); there is no standalone list page.

The **server is authoritative** (`backend/main_api/activities/`):

| Endpoint | Purpose |
|---|---|
| `GET /api/activities/me` | completed labs and missions, badges, XP of the caller |
| `POST /api/activities/labs/{id}/answer` | grades one answer, returns feedback, awards XP and the badge once per user |
| `POST /api/activities/missions/{id}/runs` | starts a run; for the BB84 simulation the server generates the transmission and keeps the eavesdropper flag secret |
| `POST /api/activities/missions/runs/{run_id}/choose` | applies a decision's consequences on the server; the final choice returns the outcome band and any award (success or partial only) |
| `POST /api/activities/missions/runs/{run_id}/decide` | BB84: recomputes the error rate from the server-held data and grades accept or abort |

Answer keys, feedback and consequences are removed from the data compiled into the browser bundle (`frontend/scripts/compile-content.cjs`), so they cannot be read client-side. XP goes into `users.xp` and each award is stored once in `activity_completions`.

Abuse limits: a lab is locked for 15 s (then 30, 45, at most 60) after a wrong answer, a correct answer pays 100%, 75%, 50% or 25% of the lab's XP depending on the wrong answers before it, and a mission can be started at most 10 times per hour. These make trial and error expensive; they do not make it impossible.

Single source of XP: `users.xp` is the only XP. Quiz XP is 50 per first-time-correct question plus the module's `xp` once on the first pass, both awarded in `quiz_service.py`. `GET /api/activities/me` also returns passed modules and best quiz scores, from which the browser derives completion, readiness and module badges. `POST /api/users/{id}/progress` drops the server-owned keys (XP, completion, scores, badges) from the saved blob. The capstone cards have no submission flow yet, so no capstone XP exists.

### Demo and admin accounts (development only)

`backend/main_api/demo_account.py` creates accounts for demonstrations and makes sure an admin exists: `--profile complete` (every module, lab and mission done), `--profile partial` (all of Track A plus B1 and B2 passed in prerequisite order with realistic scores and retakes, their lessons, labs and missions done, B3 started) and `--make-admin NAME` (create or reset an admin to a clean slate). Records are written in the shape the server writes them, XP follows the server rules, demo names must start with `demo`, and passwords are random and printed once. Back up the database before running it.
