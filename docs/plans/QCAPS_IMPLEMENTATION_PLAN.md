# Q-CAPS Implementation Plan — Closing the Risk-to-Skill Chain

> **For Claude Code (v2: adds the already-sound list, frontend Phase F and evaluation Phase 5).** This plan turns the research document
> (`QCAPS_Full_Project_Research_Document.md`) into working code. Do **one task per session**,
> in the order given in §4, and stop for review after each task.
> The project instructions (security first, backend authoritative, no fabricated data, minimal changes)
> apply to every task here and take precedence over this file.
>
> The research document lives at `docs/research/QCAPS_Full_Project_Research_Document.md`.

---

## 0. How to use this file

Put this file at `docs/plans/QCAPS_IMPLEMENTATION_PLAN.md` in the repo, then start each session with:

```
Read docs/plans/QCAPS_IMPLEMENTATION_PLAN.md (sections 1–3 and the task section only).
Do task <ID> only. Re-verify the baseline facts it depends on before editing.
If the task is marked PLAN FIRST, write the plan and stop for approval.
Finish with the report described in section 6.
```

---

## 1. Goal

The research document's contribution is this chain:

```
Finding → Risk → Requirement → Required competency → Assessment → Skill gap
        → Targeted training → Practical validation → Reassessment → Readiness
```

The repo implements both ends (verified scans that produce findings; learning, quizzes, labs and
missions) and has database tables for the middle, but **nothing fills the middle in**. This plan
connects it with the smallest changes that make the research questions (RQ1–RQ5) testable.

---

## 2. Rules for every task

1. **Inspect before editing.** Re-check the baseline facts in §3 that your task touches. The repo may
   have changed since this plan was written. If a fact is no longer true, report it and adapt; do not
   force the plan onto changed code.
2. **Extend, don't duplicate.** Reuse existing tables, services, components and endpoints listed here.
   Do not create a parallel implementation.
3. **Unknown is not zero.** Missing evidence must surface as `null` / `"Unknown"`, never as 0 or 50.
4. **Content is not invented.** If a task needs new quiz items, competency tags or mapping rules, you may
   draft them, but mark them `"status": "proposed-unreviewed"` so a human can review them. Never present
   drafted content as validated.
5. **Schema changes** follow the existing additive pattern in `backend/main_api/database.py`
   (`create_all` + idempotent `ALTER TABLE ... ADD COLUMN`). No destructive migrations. Preserve existing
   user data.
6. **Tests are part of the task.** Backend: `cd backend && pytest`. Content: `cd frontend && npm run test:content`.
   Build: `cd frontend && npm run build`. All must pass before you report done.
7. **Docs stay in sync.** If an API contract or algorithm changes, update `docs/architecture/` in the same task.
8. **Git.** One branch per task (`feat/<task-id>-<slug>`), logically grouped commits, no unrelated formatting.

---

## 3. Baseline facts (verified at commit `bb9c2b4`; B2–B7 re-checked at `c05c2c2`)

Re-verify the ones your task depends on.

### Backend — the chain is broken here

| # | Fact | Location |
|---|---|---|
| B1 | `User.role` is constrained to `('learner','admin')`. No Organization model. `Asset.organization_id` is an unused integer. | `models.py` (User, Asset) |
| B2 | Nothing creates `Competency` rows. | grep `Competency(` |
| B3 | Nothing creates `LearnerCapability` rows → `GET /api/users/{id}/capabilities` always returns `[]`. | grep `LearnerCapability(` |
| B4 | `competency/capability.py::update_capability_state` is unused, and it only ever increases scores (`max`), so it could never show a decline. | `main_api/competency/` |
| B5 | **Changed at `5022e63`.** The graph engine ("Candidate B") now builds `HAS_CAPABILITY` edges from the latest `QuizScore` per topic and `REQUIRES` edges from `graph/competency_map.py`, so it runs on real data. It still falls back to `recommendation_scores.py` (unattempted topics sorted as `50.0`) when no mapped finding exists. | `recommendation.py`, `graph/projection.py`, `recommendation_scores.py:~168` |
| B6 | **Changed at `5022e63`.** Two finding→learning links exist: `SCANNER_TOPIC_MAP` (algorithm-name prefix → quiz topic boost) and `graph/competency_map.py` (finding-type prefix → one of 2 quiz topics, fixed 0.8 target, `DRAFT FOR REVIEW`). | `recommendation_scores.py:~43`, `graph/competency_map.py` |
| B7 | `evidence_service.record_verified_scan` stores only findings whose severity is in `SEVERITY_SCORE = {"high","medium"}`. **Info-level PQC findings such as `pqc.auth.classical_certificate` are never persisted**, yet certificate migration is a core requirement in the research doc (§8.7). | `services/evidence_service.py:~65` |
| B8 | `Asset.criticality` and `Finding.migration_urgency` default to `1.0` and nothing sets them. | `models.py` |
| B9 | Readiness = mean of quiz scores (`None` if there are no quizzes). | `main.py:~572-580` |
| B10 | `QuizItem` already stores `competency_id` (string, e.g. `"PQC.6"`) and `depth`; `Competency.code` is the matching string key. | `models.py`, `seed_quizzes.py:~75` |
| B11 | The leaderboard WebSocket authenticates with `token` as a query parameter. | `main.py:~214` |
| B12 | Interventions are created by admins only (`POST /api/interventions`, `require_admin`). Ownership checks on findings, evidence and closures are correct (`asset_visible`). | `main.py:~468-560` |

### Content

| # | Fact |
|---|---|
| C1 | `content/curriculum/competency_model.json` (`status: proposed-v1`) defines 8 domains / 44 competencies (the plan first said 43; corrected at T1.1) (MATH, PROG, COMP, NET, SEC, CRYPTO, QNT, PQC), 4 depths (Aware, Explain, Apply, Analyse) and the levels Unknown/Beginner/Developing/Proficient/Advanced, each with an evidence rule. |
| C2 | Of the 599 items in `content/Quizzes/**/*.json`, only **124 have a `competency_id`**. |
| C4 | The level `evidence` rules in `competency_model.json` are **prose strings** (e.g. "At least 60% on Aware/Explain items"); only `min_items_for_known`, `stale_after_months` and `min_coverage_for_domain_score` are machine-readable. Code cannot read the thresholds until a structured field is added (T1.4). |
| C3 | Scanner finding ids (`backend/scanner_api/scanner/findings.py`): `pqc.kex.classical_only`, `pqc.kex.hybrid`, `pqc.kex.hybrid_available`, `pqc.auth.classical_certificate`, `tls.kex.no_forward_secrecy`, `tls.version.obsolete`, `cert.expired`, `cert.expiring`, `cert.untrusted`, `exposure.port.<n>`, `http.*`, `dns.*`. |

### Frontend

| # | Fact | Location |
|---|---|---|
| F1 | The baseline diagnostic (10 items) ships `correctOptionId` to the client, is scored in the browser and saved to localStorage. `Skills.tsx` and `Learning.tsx` read it from there. | `data/assessmentData.ts`, `pages/Assessment.tsx:~47-96`, `utils/assessmentStorage.ts` |
| F2 | Two recommendation engines: the Dashboard uses the server (`/recommendation`); Learning uses client-side `getPersonalizedLearning()`. | `pages/Dashboard.tsx`, `pages/Learning.tsx` |
| F3 | The leaderboard WebSocket is hard-coded to `ws://localhost:8000/...?token=` | `pages/Organization.tsx:~37` |
| F4 | The API base URL is duplicated in 3 files. | `services/backendService.ts`, `features/admin/adminApi.ts`, `features/lesson/lessonApi.ts` |
| F5 | Header: the search input has no handler, the Help button does nothing, and the notification bell shows a permanent unread dot with no data behind it. | `components/layout/Header.tsx` |
| F6 | Services catch errors and return `[]`/`null`; `AppShell` uses `.catch(() => undefined)`. A failed request looks the same as having no data. | `features/*/…Service.ts`, `AppShell.tsx` |
| F7 | `CapabilityState`, `EvidenceCard`, `InterventionPlan` are not used by any page; `/closure/:findingId` exists but nothing links to it. | `features/capabilities|evidence|interventions|closure` |
| F8 | The theme is applied in `Header`'s `useEffect` (flash of the light theme; `/login` never gets dark). Fonts load twice (`index.html` + `@import` in `index.css`). | |
| F9 | Production build: a single JS chunk of 1,351 KB (386 KB gzip), no lazy routes, and a 326 KB logo PNG. | `npm run build` |
| F10 | 590 inline `style={{}}` objects and 280 hard-coded hex colors in TSX. These colors ignore the dark theme. | worst: `MissionPlay.tsx`, `BadgesAndCerts.tsx`, `DecisionMissionEngine.tsx` |

### Already sound — do not rebuild

These parts were checked and work as intended. Tasks may **extend** them but must not replace them.
If a task seems to require rewriting one, stop and explain why first.

| Area | What is already right | Location |
|---|---|---|
| Auth & ownership | JWT auth; per-user checks on profile, capabilities, findings, evidence, interventions, closures (`asset_visible`, `_finding_visible`); role read only from the server | `main.py`, `models.User.role` |
| Server-authoritative progress | The server is the only source of XP, quiz passes, scores and badges; server-owned keys are stripped from the progress blob | commit `c962817`, `SERVER_OWNED_PROGRESS_KEYS` |
| Module quizzes | Attempt → answer → submit flow graded on the server; question count, answers and timestamps stored (`QuizAttempt`, `QuizResponse`) | `quiz_service.py`, `QuizPage.tsx` |
| Lesson checkpoints | Answer keys are removed from learner content and graded server-side | `course_content/public_routes.py`, `blocks.py` |
| Labs & missions | Served and scored by the server, with abuse limits (lockouts, per-hour caps) | `activities/` |
| Scanner safety | One-time resolution with DNS-rebinding protection, private/reserved IPv4/IPv6 and embedded-IPv4 checks, domain ownership verification before active checks, per-user rate limits | `scanner/security/target_validator.py`, `ownership.py`, `scanner_api/api.py` |
| Honest scan output | Failed or skipped checks produce no finding and show "No verified result available"; no aggregate score | `scanner/findings.py`, `DetailSections.tsx`, `PqcPosturePanel.tsx` |
| Closure evidence chain | Before/after evidence, versioned verifier, hash-chained `ClosureEvent`s | `closure/`, `models.py` |
| Simulation labelling | `SIMULATION` badge on scripted visuals; the admin editor requires the flag | `SimulationBadge.tsx`, `BlockEditor.tsx` |
| Content pipeline | Pack validator, importer, content audit log, admin editor | `course_content/`, `scripts/*.test.cjs` |
| Competency model | Explicit levels with evidence rules, honestly labelled `proposed-v1` / `pilot-hypothesis` | `content/curriculum/competency_model.json` |

---

## 4. Recommended order

```
Phase F0 (frontend safety net): TF.1 first — tests protect every later UI change
Phase 1 (core chain):  T1.1 → T1.2 → T1.3 → T1.4 → T1.5 → T1.6 → T1.7 → T1.8
Phase 0 (integrity):   T0.1–T0.6 can be done between Phase 1 tasks (small, independent)
Phase F (frontend):    TF.2–TF.4 alongside Phase 1; TF.5 after T1.8; TF.6–TF.9 after Phase 2 starts
Phase 2 (organization): T2.1 (PLAN FIRST) → T2.2 → T2.3 → T2.4
Phase 3 (research):     T3.1 (PLAN FIRST) → T3.2 → T3.3 (PLAN ONLY)
Phase 5 (evaluation):   T5.1 and T5.2 can start right after T1.3; T5.3–T5.6 after T3.1
```

### Single-paper scope (current decision)

The goal is **one paper** combining the model, the system and its evaluation. Only the tasks below
are on the critical path; everything else waits until the paper is submitted.

| Required for the paper | Deferred until after submission |
|---|---|
| TF.1 tests; T0.1–T0.4 integrity fixes | T0.5 theme flash, T0.6 bundle splitting |
| T1.1–T1.8 the full chain | TF.6 search, TF.8 notifications |
| T2.1 **minimal** (one organization type, `org_admin` + `member` + `researcher` roles), T2.2, T2.3, T2.4 minimal | Full multi-tenant organization features |
| T3.1 study mode, T3.2 instrument quality | TF.7 settings (except consent withdrawal, which is part of T3.1) |
| T5.1–T5.6 evaluation support | TF.9 console (the T5.4 scripts are enough) |
| TF.3 navigation, TF.4 accessibility, TF.5 readiness path, TF.2 only on pages used in the study | T3.3 sandbox lab (future work in the paper), Phase 4 scanner expansion |

**Study context: the lab organization.** Study participants (e.g. students) do not own servers, so the
scanner-driven condition would have no findings to work from. Solution, to be built into T3.1 / T5.3:

- Create a clearly labelled **lab organization** whose assets are the T5.1 testbed endpoints
  (e.g. classical-only key exchange plus a classical certificate).
- Its findings come from **real scans of the testbed**, not invented data, and the UI labels the
  organization "Lab environment".
- Every participant is a member of it. The required competencies are those the requirement map
  produces for its findings.
- The primary outcome is the gain on **those required competencies** under the same time budget in
  every condition. This is what lets the paper test the risk link directly.

**The real bottleneck is content, not code.** T1.2 needs about 475 quiz items tagged and T1.3 needs
expert review of the mapping. Claude Code can draft both, but people must review them
(T5.2 provides the review tool). Start recruiting reviewers early.

---

## 5. Tasks

### Phase 0 — Integrity fixes (small, independent)

#### T0.1 Leaderboard WebSocket: configurable URL, no token in the URL
- **Why:** F3 + B11. Broken in production (and mixed content under HTTPS); a token in the URL leaks into logs.
- **Do:**
  - Frontend: derive the WebSocket URL from the shared API base (T0.3, or inline if T0.3 isn't done yet): `http→ws`, `https→wss`.
  - Backend: accept the connection, then require a first message `{"type":"auth","token":"..."}` within 5 s; otherwise close with code 4401.
  - Keep the query-token path for one release behind a deprecation log line, or remove it if no other consumer exists (check first).
- **Accept when:** no `localhost` in `Organization.tsx`; a test covers valid auth, a missing first message (timeout) and an invalid token.

#### T0.2 Remove fake or non-functional header controls
- **Why:** F5. The unread dot is a fabricated signal.
- **Do:** Remove the unread dot. Hide the search input and Help button until they are implemented (T1.8 / later), or link Help to an existing docs page. Make the avatar open a small menu with Logout, reusing Sidebar's `logout`.
- **Accept when:** no element shows state that isn't backed by data.

#### T0.3 One API client
- **Why:** F4.
- **Do:** Create `src/services/apiConfig.ts` exporting `API_BASE_URL` and `WS_BASE_URL`. In production builds, require `VITE_API_BASE_URL`, the same way `scannerService.ts` already refuses a localhost fallback. Replace the 3 copies.
- **Accept when:** `grep -rn "localhost:8000" frontend/src` returns only `apiConfig.ts` (dev fallback).

#### T0.4 Separate loading, empty and error states
- **Why:** F6.
- **Do:**
  - Services throw typed errors instead of returning `[]`/`null` on failure. Callers render explicit loading, empty and error states.
  - Scope: `Dashboard`, `Skills`, `Organization`, `AppShell` activity sync.
  - Add one small shared `<StateMessage kind="loading|empty|error">` component in `components/ui/`, styled with existing tokens.
- **Accept when:** with the backend stopped, these pages show an error, not "No data".

#### T0.5 Theme and font loading
- **Why:** F8.
- **Do:** Add an inline script in `index.html` that sets `data-theme` before React mounts (same localStorage key and `prefers-color-scheme` logic). Keep the toggle in Header. Remove the duplicate font `@import` from `index.css`.
- **Accept when:** no flash on reload in dark mode; `/login` honours the theme.

#### T0.6 Route splitting and logo
- **Why:** F9.
- **Do:** `React.lazy` + `Suspense` for admin, scanner, mission play, quiz, reassessment and badges routes. Convert the logo to SVG, or WebP plus a size-appropriate PNG fallback.
- **Accept when:** you report before/after chunk sizes from `vite build`. Do not claim an improvement you didn't measure.

---

### Phase 1 — Make the chain real

#### T1.1 Seed the competency model into the database
- **Why:** B2. Everything else in Phase 1 depends on `Competency` rows.
- **Do:**
  - `main_api/competency/seed.py`: idempotent upsert of every competency in `competency_model.json` into `Competency` (`code` = id, `name`, `description`). Store domain and depth metadata only if a column is needed; justify any new column.
  - Run it from startup / `deploy_bootstrap.py` alongside the existing seeding, and expose it as a CLI command.
  - Add a `model_version` column (additive) so later scores can say which model version produced them.
- **Tests:** seeding twice gives the same row count; every id in the JSON exists afterwards.
- **Accept when:** a fresh database has all competencies; existing databases gain them without data loss.

#### T1.2 Competency tagging: validation and coverage report
- **Why:** C2. Only 124/599 quiz items are tagged, so capability estimates would be "Unknown" almost everywhere.
- **Do:**
  - Extend the existing `scripts/competency-validation.test.cjs` (don't add a parallel validator): every `competency_id` and `depth` present must exist in the model.
  - Add a coverage report script listing per module: total items, tagged items, and which competencies have ≥3 items (the "Unknown" threshold in C1).
  - Also tag labs and missions: find where activities are defined and add `competency_id` + `depth` fields. The "Proficient" level requires a passed practical, so practicals must be tagged.
  - **Drafting tags is allowed only as `proposed-unreviewed`** (rule 4). Write drafts to the content files with a `tag_status` field and list them in the report.
- **Accept when:** validation passes; the report runs; no draft tag is presented as reviewed.

#### T1.3 Requirement map: finding → requirement → required competencies (answers RQ1)
- **Why:** B6, B7 and research doc §7/§8.7. This is the paper's core mechanism.
- **Do:**
  1. Create `content/curriculum/requirement_map.json`:
     ```json
     {
       "version": "proposed-v1",
       "status": "proposed-unreviewed",
       "competency_model_version": "proposed-v1",
       "rules": [
         {
           "requirement_id": "REQ.KEX.HYBRID",
           "match": { "finding_type": "pqc.kex.classical_only" },
           "requirement": "Plan hybrid / post-quantum key establishment for TLS",
           "pqc_relevant": true,
           "competencies": [
             { "id": "NET.4", "required_level": "Proficient" },
             { "id": "PQC.6", "required_level": "Proficient" },
             { "id": "PQC.3", "required_level": "Developing" },
             { "id": "PQC.1", "required_level": "Developing" }
           ],
           "rationale": "Classical-only key exchange is exposed to harvest-now-decrypt-later.",
           "sources": ["FIPS 203"]
         }
       ]
     }
     ```
     Draft starter rules (all `proposed-unreviewed`, for expert review):

     | finding_type | requirement_id | competencies (required level) | pqc_relevant |
     |---|---|---|---|
     | `pqc.kex.classical_only` | REQ.KEX.HYBRID | NET.4 (P), PQC.6 (P), PQC.3 (D), PQC.1 (D) | true |
     | `pqc.auth.classical_certificate` | REQ.PKI.PQC_SIG | CRYPTO.4 (P), PQC.3 (D), PQC.8 (D) | true |
     | `tls.kex.no_forward_secrecy` | REQ.TLS.FS | NET.4 (P), CRYPTO.3 (D) | false |
     | `tls.version.obsolete` | REQ.TLS.VERSION | NET.4 (P) | false |
     | `cert.expired` / `cert.expiring` / `cert.untrusted` | REQ.PKI.LIFECYCLE | CRYPTO.4 (D), CRYPTO.5 (D) | false |
     | `exposure.port.*` (prefix match) | REQ.NET.EXPOSURE | NET.3 (D), SEC.2 (D) | false |
     | `pqc.kex.hybrid`, `pqc.kex.hybrid_available` | — (positive evidence, no requirement) | — | true |

     (P = Proficient, D = Developing.) `http.*` and `dns.*` stay **unmapped by design** for now; record them as such, not silently.
  2. A content test: every `finding_type` in `findings.py` is either matched by a rule or listed in an `"unmapped_by_design"` array; every competency id exists in the model.
  3. New table `finding_requirements` (`id`, `finding_id` FK, `requirement_id`, `competency_code`, `required_level`, `map_version`, `created_at`). Unique on (`finding_id`, `requirement_id`, `competency_code`, `map_version`).
  4. In `evidence_service.record_verified_scan`: after a finding is opened or updated, (re)derive its requirements from the map. Findings with no matching rule increment an `unmapped` count in the returned summary; they are not dropped.
  5. Fix B7: persist info-level PQC planning findings (at least `pqc.auth.classical_certificate`). Add `info` to the severity map with a low score (e.g. 0.3) and justify the value in a comment. Make sure the resolution logic (`_check_for`) still behaves correctly; add tests.
  6. Endpoint `GET /api/findings/{finding_id}/requirements`, using the same visibility check as `get_finding`.
- **Tests:** mapping, the unmapped path, idempotency on re-scan, info finding persisted, authorization (another user gets 404).
- **Doc:** `docs/architecture/RISK_TO_SKILL_MAPPING.md` covering the schema, matching rules, versioning and review status.

#### T1.4 Capability estimator (fills `LearnerCapability`)
- **Why:** B3, B4, B5.
- **Design (implement exactly, document in `docs/architecture/CAPABILITY_MODEL.md`):**
  - Recompute from stored evidence, not incremental `max`, so scores can go down and the result is reproducible.
  - Per user × competency:
    - `knowledge_score`: share of correct answers on quiz items tagged with the competency, using **each item's most recent response** (`QuizResponse` ⨝ `QuizItem.competency_id`). Report it per depth group: Aware/Explain vs Apply vs Analyse.
    - `procedural_score`: passed / attempted tagged labs (`ActivityAttempt` / `ActivityCompletion`).
    - `operational_score`: from `Verification` rows linked to interventions for that competency (`null` if none).
    - `evidence_count` (new column) and `last_evidence_at` (new column).
    - `level` (new column) derived by applying the level rules in `competency_model.json` (C1). **Read the thresholds from the JSON; don't hard-code them.** Fewer than 3 scored items → `Unknown`.
    - Scores are `null` when there is no evidence for that component (make the columns nullable via the additive migration pattern).
  - Store the `model_version` used.
  - Trigger a recompute for the affected competencies after: `quiz_service.grade_attempt`, a lab answer, a mission completion, and `verify_intervention`.
  - Delete the unused `update_capability_state` (B4), or reimplement it on top of the estimator. Check it really has no callers first.
- **Tests:** Unknown below 3 items; each level boundary; a score decreases after later wrong answers; only the latest response per item counts; a user cannot read another user's capabilities (existing 403 behaviour kept).
- **Accept when:** after a demo user takes tagged quizzes, `/capabilities` returns populated rows, and the Candidate B recommender receives them (log or test it).

#### T1.5 Server-side diagnostic (valid pre/post)
- **Why:** F1. Without it, RQ3/RQ4 have no trustworthy baseline.
- **Do:**
  - Move the 10 diagnostic items into the backend as a quiz module (e.g. `module_id = "DIAG-A"`), reusing the existing attempt flow (`POST /quizzes/{module_id}/attempts` → `/answers` → `/submit`). Do not create a new scoring path.
  - Tag each item with a competency and depth.
  - Mark attempts on diagnostic modules with an `attempt_purpose` (`diagnostic_pre` / `diagnostic_post`), as an additive column on `QuizAttempt`.
  - Frontend: `Assessment.tsx` uses the attempt API. Delete `correctOptionId` from `assessmentData.ts` (keep prompts only if still needed, or load them from the server). `Skills.tsx` and `Learning.tsx` read results from the server.
  - Old localStorage results: **do not import them** (untrusted). Show a one-time notice asking the user to retake.
  - Report a limitation: 10 items over 4 domains is below the 3-items-per-competency threshold for most competencies. Draft a longer `DIAG-A` and a parallel `DIAG-B` as `proposed-unreviewed` for human authoring; until `DIAG-B` exists, reassessment reuses `DIAG-A`, and the UI notes the retest effect.
- **Tests:** no answer key in the built bundle (`grep -r correctOptionId frontend/dist` is empty); diagnostic scoring is server-side; one user cannot submit another user's attempt.

#### T1.6 Skill matrix endpoint and Skills page
- **Why:** Research doc §8.9/§8.10. "Required" doesn't exist yet.
- **Do:** `GET /api/users/me/skill-matrix` returns, per competency that is either required or assessed:
  - `required_level`: the highest required level across `finding_requirements` of the user's open visible findings. `null` means "no current requirement".
  - `demonstrated_level`: from T1.4 (may be `Unknown`).
  - `gap`: required rank − demonstrated rank, **or `"unassessed"` when demonstrated is Unknown**. Never treat Unknown as rank 0.
  - `gap_class` (v1 rule, documented as a hypothesis): rank gap ≥3 → critical, 2 → high, 1 → medium, ≤0 → none; escalate one step if any driving finding has severity ≥ 0.9; cap at critical.
  - `driving_findings` (ids and titles), `evidence_count`, `last_evidence_at`.
  - Frontend `Skills.tsx`: render the matrix with Unknown/unassessed shown distinctly, and link each driving finding to `/closure/:findingId`.
- **Tests:** a user with no findings gets `required_level: null`; Unknown gives `"unassessed"`; escalation; other users' findings never appear.

#### T1.7 One explainable recommendation engine
- **Why:** B5, F2.
- **Do:**
  - Server: when skill-matrix gaps exist, recommend by gap (class, then driving-finding severity, then prerequisites from `Competency.prerequisites`). Otherwise fall back to the current score-based method, but **remove the `50.0` stand-in for unattempted topics**: unattempted becomes its own explicit tier with a reason.
  - Every recommendation returns a `reasons` list of structured factors, e.g. `{"type":"gap","competency":"PQC.6","required":"Proficient","demonstrated":"Beginner","finding_id":"..."}`.
  - Frontend: the Learning page uses the server recommendation; delete or retire `learningRecommendation.ts` after checking its consumers. Add a "Why this?" disclosure that renders `reasons`.
- **Tests:** the existing `scripts/check_recommendation.py` and recommendation tests still pass (update expectations deliberately, explaining each change); a test that unattempted ≠ 50.

#### T1.8 Wire the finding → intervention → closure loop into the UI
- **Why:** F7, B12. The backend and components exist but can't be reached.
- **Do:**
  - Scanner `AssetsPanel` lists findings per verified asset. Each finding links to `/closure/:findingId`.
  - `ClosurePage` shows: the finding, its requirements (T1.3), the user's matching skill gaps (T1.6), interventions (`InterventionPlan`), evidence (`EvidenceCard`) and the timeline.
  - Use the existing components and services, and fix their error handling per T0.4.
  - Interventions stay admin-created for now. Show "No intervention assigned yet" rather than hiding the section.
- **Accept when:** a demo user can go scanner → finding → closure page entirely through clicks.

---

### Phase 2 — Organization dimension (RQ5)

#### T2.1 Organizations, membership, roles — **PLAN FIRST**
- **Why:** B1. The research doc requires organization accounts, employees and instructors/researchers.
- **Plan must cover:**
  - `Organization` and `OrganizationMembership` (`user_id`, `org_id`, `org_role` ∈ `org_admin|member|instructor|researcher`) models. Keep the global `User.role` for platform admin only.
  - A tenant-scoping rule for every asset, finding, evidence, intervention and report query. List each query that changes.
  - Migration of existing `owner_user_id` assets: they stay personal; organization assets are new.
  - How `asset_visible` / `_finding_visible` extend to organization membership.
  - How researchers get only anonymized aggregates (ties into T3.1).
  - The authorization test matrix (role × resource × action).
- **Stop after writing the plan.** Do not implement until it's approved.

#### T2.2 Asset context and risk score v1
- **Why:** B8, research doc §8.6.
- **Do:**
  - Org admins set asset `criticality`, `data_sensitivity` (new) and `confidentiality_lifetime`.
  - Risk score v1 in `main_api/risk/score.py`, a pure function, versioned (`RISK_MODEL_VERSION`). Use the research doc's form `Exposure × Asset criticality × PQC dependency × Migration urgency`, where each factor's derivation is explicit and normalized to [0,1]. Store the inputs and version with every computed score.
  - Label it in the UI and docs as an unvalidated model (the research doc requires experimental validation).
- **Tests:** a unit test per factor, determinism, version stored.

#### T2.3 Readiness v1
- **Why:** B9, research doc §8.14.
- **Do:**
  - Replace mean-of-quizzes with a documented composite, reported **with its components and coverage**: crypto coverage (assets assessed / registered), critical-finding coverage, workforce competency on required skills, practical competency, training completion, gap severity, reassessment change.
  - If a component has no evidence, it is `null` and excluded from the composite, and the response states which components were missing. Do not fill them in.
  - Individual readiness (learner) and organization readiness (aggregate over members) use the same component definitions.
  - Document the formula in `docs/architecture/READINESS.md` with a worked example labelled as an example.
  - Keep the existing `readiness_score` field working (now computed by v1); add `readiness_breakdown`.
- **Tests:** null components excluded; reproducible output; XP does not appear anywhere in the formula.

#### T2.4 Organization readiness dashboard and report
- **Do:** An organization page (rename or replace the current leaderboard-only "Organization" page; move the leaderboard to its own route) showing the research doc's §18 view from real data, each figure with its coverage, plus a downloadable report (CSV/JSON first; PDF later). Visible to org admins only.
- **Accept when:** every number on the page traces back to stored rows; empty organizations show empty states, not zeros.

---

### Phase 3 — Research validity (RQ2–RQ4)

#### T3.1 Study mode — **PLAN FIRST**
- **Plan must cover:**
  - Informed consent capture (versioned consent text, timestamp, withdrawal).
  - Random assignment to Group A (fixed curriculum) or Group B (Q-CAPS targeted path), stored server-side, possibly stratified by diagnostic score.
  - How Group A's experience differs in code (e.g. recommendations disabled, fixed module order) without breaking anything else.
  - An event log (what was recommended, opened, completed, when).
  - Pre/post instruments (T1.5 `DIAG-A` / `DIAG-B`).
  - Anonymized export (CSV) for researchers: pseudonymous ids, no names, no scan targets.
  - Metrics computed exactly as defined: raw gain, **normalized gain g = (post − pre) / (100 − pre)** (undefined when pre = 100), skill-gap reduction, and practical success rate.
  - Note for the human: ethics / institutional approval is required before collecting data from participants. The code must not collect study data unless a study is configured and consent is recorded.
- **Stop after writing the plan.**

#### T3.2 Instrument quality analytics
- **Do:** A script plus a researcher-only endpoint computing, per quiz/diagnostic module: item difficulty (p-value), item discrimination (point-biserial), and KR-20 reliability, plus a flag list of weak items (e.g. discrimination < 0.2). Require a minimum sample size before showing a statistic; below it, show "insufficient data".
- **Tests:** against a small fixture with hand-computed values.

#### T3.3 Verifiable practical lab — **PLAN ONLY**
- **Goal:** A practical where the learner configures hybrid TLS in an isolated sandbox and the existing scanner verifies the hybrid group. This yields `Verification` before/after evidence and an `operational_score`.
- **Plan must cover:** sandbox isolation (no egress, resource limits, lifetime), how the scanner is allowed to target **only** the sandbox (SSRF rules stay intact), cost, and abuse limits.
- **No implementation in this task.**

---

### Phase F — Frontend

General rules for this phase: use the existing CSS tokens in `styles/index.css` and the components in
`components/ui/`; no new UI library; no decorative gradients or glow; every visual element must carry
information; every data view has loading, empty and error states (T0.4); keyboard accessible;
works at 375 px wide.

#### TF.1 Frontend test harness (do first)
- **Why:** there are no component or flow tests today; Phase 1 changes the assessment, quiz and skills flows.
- **Do:**
  - Vitest + React Testing Library + MSW (mock API at the network layer, so tests use the real services).
  - First tests: login, quiz attempt (server-graded result is displayed as returned), diagnostic flow (after T1.5), Skills empty / Unknown / populated states.
  - Playwright smoke e2e against a local backend seeded with `demo_account.py`: login → dashboard → take a quiz → see the result. Add `@axe-core/playwright` checks on the main pages.
  - Add `npm run test` and `npm run test:e2e` scripts.
- **Accept when:** both suites run locally with documented commands.

#### TF.2 Design-system consolidation (incremental, no redesign)
- **Why:** F10. 280 hard-coded colors ignore the dark theme; three styling systems are in use.
- **Do:**
  - Add semantic tokens to `index.css` for both themes: `--color-success|warning|danger|info`, severity (`--sev-high|medium|low|info`), and capability levels (`--lvl-unknown|beginner|developing|proficient|advanced`). Unknown must look clearly different from Beginner, not just a lighter version of it.
  - Replace hex colors and the repeated inline styles in `MissionPlay.tsx`, `BadgesAndCerts.tsx` and `DecisionMissionEngine.tsx` first (one file per commit). Use `<Button>`/`<Card>` where a raw element duplicates them.
  - Add a lint rule or script that reports new hex literals in `.tsx` files.
- **Accept when:** these three pages look correct in both themes (before/after screenshots in the report); the hex count is reported before and after.

#### TF.3 Navigation and information architecture
- **Why:** on desktop, 11 destinations are hidden behind a drawer; the "Organization" page is only a leaderboard.
- **Do:**
  - Persistent collapsible side rail at ≥1024 px; keep the drawer on mobile. Reuse `Sidebar.tsx`.
  - Group the navigation by the research workflow: **Assess** (Diagnostic, Skills), **Secure** (Scanner, Findings), **Learn** (Learning, Curriculum, Missions), **Progress** (Reassessment, Badges, Leaderboard), **Organization** (after T2.4), **Admin/Research** (by role).
  - Move the leaderboard to `/leaderboard` and keep a redirect from `/organization` until T2.4 replaces it.
- **Accept when:** every existing route is still reachable; the e2e smoke test passes.

#### TF.4 Accessibility pass
- **Do:** visible `:focus-visible` styles everywhere; `prefers-reduced-motion` in all stylesheets; keyboard operation of quiz options, mission choices and scanner forms; `aria-live` for graded results and scan progress; contrast fixes found by axe (TF.1).
- **Accept when:** axe reports no serious or critical violations on the main pages.

#### TF.5 "My readiness path" view (the platform's signature screen)
- **Why:** this is the research chain made visible to one learner, and it makes the paper's key figure.
- **Do:** one page (`/path`) showing, for the current user, from real data only:
  `Open findings → Required competencies → Current level → Gap → Recommended training → Practical → Reassessment change`.
  - Each step shows a count, a status, and a link to where it can be acted on (closure page, skill matrix, module, reassessment).
  - Steps with no data show why ("No verified scan yet", "Not assessed"); never placeholder numbers.
  - Uses the T1.3, T1.4, T1.6, T1.7 and T1.8 endpoints; no new backend logic except an optional aggregate endpoint if it removes more than 3 round trips.
- **Accept when:** works for three seeded demo users (no scan; scan without assessment; full data).

#### TF.6 Real search (command palette)
- **Do:** replace the dead header input with a Ctrl/Cmd+K palette over modules, sections, findings and pages. Use curriculum metadata from the server plus the user's own findings; no third-party search service.
- **Accept when:** fully keyboard operable; never shows results the user cannot open.

#### TF.7 Profile and settings
- **Do:** a `/settings` page for password change (new backend endpoint: requires the current password, rate limited), theme, research consent status and withdrawal (after T3.1), export of the user's own data (JSON), and an account deletion request.
- **Accept when:** backend tests cover the password-change authorization and rate limit.

#### TF.8 Notifications backed by real events (optional)
- **Do:** only if there are real events to show: badge earned, scan finished, intervention assigned, reassessment due. Add a server-side `notifications` table written by those code paths. The unread indicator comes back only when it reflects stored, unread rows.

#### TF.9 Researcher console (after T3.1, T3.2)
- **Do:** researcher-role pages for study setup, cohort status (counts only), the instrument-quality report (T3.2) and the anonymized export. No per-person identifiable views.

---

### Phase 5 — Evaluation support (makes the paper defensible)

#### T5.1 Scanner accuracy testbed
- **Why:** the paper must show the scanner's findings are correct, not just produced.
- **Do:**
  - `eval/testbed/docker-compose.yml` with local TLS endpoints of **known** configuration: classical-only key exchange, hybrid ML-KEM key exchange (e.g. OpenSSL 3.5+ or oqs-provider; confirm the versions you use), TLS 1.0/1.1 enabled, RSA key transport, expired certificate, self-signed certificate, correctly configured baseline.
  - A ground-truth file listing the expected finding ids per endpoint.
  - A script that scans each endpoint and reports per-finding precision, recall and the confusion matrix.
  - Scanner safety: the testbed runs only on an isolated docker network; add an explicit, test-only allowlist for it. Never weaken the default `is_safe_ip` rules.
- **Accept when:** the script runs end-to-end with one command and writes `eval/results/scanner_accuracy.json`.

#### T5.2 Expert review tool for the requirement map (RQ1 validity)
- **Do:**
  - Researcher/admin page plus endpoint where reviewers rate each rule in `requirement_map.json`:
    relevance of each competency (1–4), whether the required level is appropriate, and missing competencies (free text).
  - Store reviews per reviewer and map version.
  - Compute the item-level content validity index (I-CVI), the scale-level index (S-CVI/Ave) and Fleiss' kappa. Require at least 3 reviewers before showing any statistic.
  - When a review round is accepted, publish a new map version (`reviewed-v1`) and keep the old version for traceability.
- **Tests:** CVI and kappa against hand-computed fixtures.

#### T5.3 Experimental conditions (ablation)
- **Why:** to show the risk link itself adds value, not just "more personalization".
- **Do:** as part of T3.1, support three server-side conditions:
  **A** fixed curriculum; **B1** gap-targeted from assessment only (scanner requirements ignored);
  **B2** full Q-CAPS (scanner requirements + assessment gaps). The condition changes only which recommendations and paths are shown.
- **Accept when:** a test shows each condition produces the documented recommendation behaviour.

#### T5.4 Reproducible analysis pipeline
- **Do:** `eval/analysis/` Python scripts that read only the anonymized export and produce:
  descriptive statistics, raw and normalized gain, ANCOVA of post-test with pre-test as covariate (condition as factor), effect sizes with 95% confidence intervals, and a non-parametric check (Wilcoxon / Mann-Whitney). Also the figures.
  - Include a synthetic fixture generator **for testing the scripts only**. Its outputs must be written to a separate folder and every file and figure watermarked `SYNTHETIC — NOT RESULTS`.
- **Accept when:** `make analysis` (or one documented command) regenerates every table and figure from an export file.

#### T5.5 Usability and engagement instruments
- **Do:** an optional System Usability Scale (SUS, 10 items) after the post-test, and a few Likert items on whether recommendations were understandable (the "Why this?" explanations). Store them with the study data; include them in the export.

#### T5.6 Research artifact
- **Do:** a one-command local setup (docker compose for backend, scanner, frontend and testbed), seed scripts, the versioned competency model, requirement map and risk/readiness model versions, and an `ARTIFACT.md` explaining how to reproduce every table in the paper. Tag a release so it can be archived with a DOI.

---

### Not in scope now (Phase 4, needs separate approval)

Expanding the scanner to SSH key-exchange enumeration, CBOM export, or repository/dependency scanning (research doc §8.4). Each needs its own security and abuse review. Until then, the research document should describe these as future work.

---

## 6. Report format (end of every task)

```
Task: <ID> <title>
Baseline facts re-verified: <ids>, changed: <any that were no longer true>
What changed and why:
Files affected:
Schema changes: <tables/columns, migration path>
API changes: <endpoints, consumers updated, docs updated>
Tests: <commands run, pass/fail counts, new tests added>
Not verified: <anything you could not run or check>
Remaining risks / follow-ups:
Content marked proposed-unreviewed: <list, if any>
```

Do not write "production-ready", "validated" or "proven" unless the evidence for it is in the report.

---

## 7. Research-document traceability

| Research doc / paper need | Tasks |
|---|---|
| RQ1 finding → competencies | T1.1, T1.3, **T5.2** (expert validation: CVI, kappa) |
| RQ2 targeted vs fixed | T1.6, T1.7, T3.1, **T5.3** (A / B1 / B2 ablation) |
| RQ3 practical training improves competency | T1.4, T1.5, T3.3 |
| RQ4 reassessment shows improvement | T1.5, T3.1, T3.2, **T5.4** |
| RQ5 technical + workforce readiness | T2.1–T2.4, TF.5 |
| Scanner correctness claim | **T5.1** |
| §8.9 skill matrix / §8.10 gap engine | T1.4, T1.6 |
| §8.6 risk analysis | T2.2 |
| §8.14 readiness | T2.3 |
| §9 portals (student / organization / researcher) | TF.3, T2.4, TF.9 |
| §16 security (tenant isolation, audit, rate limits) | T2.1; audit log and a shared rate-limit store go into T2.1's plan |
| Usability / explainability claims | TF.5, T1.7, **T5.5** |
| Reproducibility | **T5.4**, **T5.6** |
