# Q-CAPS: Project Overview

**Q-CAPS** (Quantum Cybersecurity Assessment, Preparedness & Skills Platform) is a web platform that teaches
quantum-safe (post-quantum) cryptography, measures what a learner actually knows, and connects that learning to a
cryptographic reconnaissance scanner. This file describes the whole project as it is implemented today, including what is
real, what is demonstration data, and what is not done. For deeper engineering detail see
[`architecture/SYSTEM_UNDERSTANDING.md`](architecture/SYSTEM_UNDERSTANDING.md).

Author and maintainer: Inbathamizhan S.

---

## 1. Purpose and problem

Large-scale quantum computers are expected to break the public-key cryptography that protects today's internet (RSA,
Diffie-Hellman, elliptic-curve schemes) through Shor's algorithm. Two consequences drive the project:

- **Harvest now, decrypt later (HNDL).** An attacker can record encrypted traffic today and decrypt it once a capable
  quantum computer exists. Data that must stay secret for many years is already exposed to this risk.
- **Migration takes years.** NIST published the first post-quantum standards in 2024 (FIPS 203 ML-KEM, FIPS 204 ML-DSA,
  FIPS 205 SLH-DSA). Organisations must find where they use vulnerable cryptography, plan, pilot, and migrate. This needs
  people with the right skills.

Q-CAPS addresses the skills side and gives a hands-on way to observe the technical side:

1. **Teach** the foundations through advanced quantum, cryptography and migration topics (36 modules).
2. **Assess** with server-graded quizzes, scenario labs and decision missions.
3. **Observe** real TLS / certificate / DNS posture of a domain with a scanner that detects hybrid post-quantum key exchange.
4. **Recommend** what to study next, with an explanation of why.
5. **Track** progress, XP, badges, readiness and the follow-through on security findings.

The research method the platform is built around is: ASSESS → DISCOVER → MODEL → RECOMMEND → TRAIN → REASSESS → MEASURE.

## 2. What is implemented (at a glance)

| Area | Status |
|---|---|
| Course content | 4 tracks, 36 modules, 360 sections, all with lessons, executed code listings, checkpoints and sources (A8 wrap-up, C11 capstone/certificate and E6 capstone sections are deliberately outline text) |
| Quizzes | 599 question items across the 36 modules, graded on the server, answer keys never sent to the browser |
| Scenario labs | 38 (one or more per module), each with XP and a badge |
| Decision missions | 11 (2 original + 9 new), server-driven, each tied to a lesson section |
| Badges | 90 defined, plus 5 certificates (see `content/Badges/master_badges_and_certificates.md`) |
| Authentication | Register / login with JWT, hashed passwords, rate limiting |
| Admin | Course manager, section editor, audit log |
| Scanner | Separate Flask service with SSRF protection, real hybrid-PQC detection, ownership-gated active checks (not deployed publicly) |
| Evidence loop | Evidence, findings, interventions, verification and closure tracking |
| Deployment | Render (API, free) + Vercel (frontend, free) |
| Tests | Backend pytest suite (213 passing at the last run) and 38 frontend content tests |

---

## 3. Curriculum

Four tracks. Module codes: tracks A, B, C use their own letter; Track D (Enterprise) uses module codes `E1`–`E6`.

### Track A: Foundations (8 modules)
A1 Computing foundations · A2 Mathematics foundations · A3 Networking foundations · A4 Cybersecurity foundations ·
A5 Cryptography foundations · A6 Quantum foundations · A7 First quantum programming · A8 PQC awareness / mitigation

### Track B: Intermediate (11 modules)
B1 Advanced math for quantum · B2 Quantum information · B3 Quantum algorithms · B4 Quantum programming ·
B5 Quantum hardware · B6 Network security engineering · B7 Advanced cryptography · B8 Quantum threats ·
B9 PQC fundamentals · B10 PQC standards · B11 Intermediate PQC labs

### Track C: Advanced (11 modules)
C1 Advanced quantum information · C2 Advanced quantum algorithms · C3 Quantum error correction · C4 Quantum networking ·
C5 Quantum communications · C6 Quantum key distribution · C7 Advanced cryptography · C8 PQC mathematics ·
C9 PQC implementation engineering · C10 PQC attack surface · C11 PQC defense engineering

### Track D: Enterprise (6 modules, codes E1–E6)
E1 Quantum risk management · E2 Cryptographic discovery · E3 Quantum readiness assessment · E4 Crypto agility ·
E5 Enterprise PQC migration · E6 Governance

Modules have **prerequisites**; a module unlocks only when the ones it depends on are passed (enforced by the backend).
A module has a code, title, XP value, estimated time, ordered sections and one quiz.

### What a section contains
Lessons are made of typed content blocks: explanatory text, code listings, callouts, checkpoints, diagrams, references
and optional video (https only, host allow-list). Code listings in the packs are **executed**: `check_code.py` re-runs the
embedded Python so printed outputs are real, not typed in. Each section carries sources and, where a claim could not be
confirmed against a source, a `needs_verification` flag instead of an assertion.

**Checkpoints** are short in-lesson questions graded on the server (answers not exposed). A section without a checkpoint
is marked complete explicitly.

### Content sources and pipeline
- `content/Course/` – original module markdown. `content/curriculum/` – competency model and Track A lesson plan.
- `content/packs/pack_*.json` – book-sourced lesson packs, one per module (A2 has two).
- `content/Quizzes/` – question banks (JSON) per track; the source of truth for quiz items.
- `content/Labs/escape_room_scenarios.json` – the 38 scenario labs.
- `content/Mission/mission_*.json` – the 11 missions. `content/Badges/` – badges and certificates. `content/ui-specs/` – UI specs.

Pipeline for a lesson pack:

```
pack JSON → python -m course_content.validate_pack → python -m course_content.import_pack --actor <admin>
```

Imports are idempotent and hash-stamped; a section that an admin edited by hand is protected from being overwritten by a
re-import. Writes are recorded in the content audit log. Details: `docs/content-authoring/` (including
`BOOK_COURSE_MAP.md`, which lists sources and status per module).

---

## 4. Learner experience

Pages (React Router, `frontend/src/pages`):

| Page | What it does |
|---|---|
| Login / Register | Account creation and sign-in |
| Dashboard | Progress, XP, readiness view, next recommended module |
| Curriculum map | All tracks and modules with lock/unlock state |
| Module overview | Sections, quiz, prerequisites for one module |
| Section lesson | The lesson blocks, checkpoints, and the labs and missions that belong to that section |
| Quiz | Server-graded module quiz with attempts |
| Learning / Skills | Recommendations and a competency/skills view |
| Assessment / Reassessment | Assessment results and re-assessment (pre/post measurement) |
| Badges & certificates | Earned badges |
| Mission play | Plays the BB84 simulation mission |
| Scanner | Cryptographic scanner UI (needs the scanner service) |
| Organization | Organisation-level view |
| Closure | Findings follow-through and closure timeline |
| Admin: Courses, Section editor, Audit | Content management (admin role only) |

**Navigation:** a hamburger drawer (the sidebar is hidden by default) with the Q-CAPS logo always visible in the header.

**Labs and missions are not standalone pages.** They appear only inside the lesson section they belong to, so a learner
meets a lab or mission at the point where the material has just been taught.

### Quizzes
- A quiz attempt is created on the server; the form (question order and option order) is fixed per attempt.
- The browser receives questions and options only. On submit the server grades, stores each response, the score,
  percentage, pass/fail and timestamp, and returns the result. The question count is whatever the bank holds, not a fixed 10.
- Passing score is per module. Clients cannot submit a score (the legacy score-submit endpoint returns HTTP 410 unless
  explicitly enabled).

### Scenario labs (38)
A scenario lab shows a realistic situation (setup, prompt) with three choices; one is correct and each has feedback.
Grading is server-side. After a wrong answer there is a cooldown (15 / 30 / 45 / 60 seconds) and the XP reward shrinks with
wrong attempts (100% / 75% / 50% / 25%). Rate limit: 12 answers per minute. Completion awards XP and a badge once.

### Decision missions (11)
Multi-stage decision exercises: `incident_ransomware_monday`, `leaked_signing_key`, `flat_network_breach`,
`quantum_threat_briefing`, `hybrid_pilot_lab`, `side_channel_report`, `discovery_sprint`, `agility_retrofit`,
`crypto_incident_commander`, plus the original BB84 key-distribution simulation (Module C6) and the enterprise migration
mission (Module E5). Each has a HUD, stages with choices, outcome bands (success / partial / failure) and rewards.
The server holds the scenario state and consequences; the browser is sent only what it needs to show. XP and badge are
awarded only for the success/partial band, once. Runs are capped at 10 per hour. In the BB84 mission the **server**
generates the photons and hides whether an eavesdropper (Eve) is present; the learner samples the sifted key and decides
to accept or abort. This is a **SIMULATION** of the protocol, not real quantum hardware.

### Gamification
- **XP**: 50 per question answered correctly for the first time, plus the module's XP once on first pass, plus lab and
  mission XP once each, plus small flat scanner XP. XP is a motivation device, not a measure of capability.
- **Badges** and **certificates**; a **leaderboard** (REST plus websocket).
- All XP is computed by the server. The browser store only caches and displays it.

### Recommendations, skills and readiness
- The recommender uses quiz performance and scanner evidence. It distinguishes "no data" (unknown) from a low score, and
  gives a reason for each recommendation. Scanner findings that name a classical algorithm raise the urgency of the
  relevant PQC topics (only the latest scan per target within 90 days counts; low/info items never do).
- A competency model (`content/curriculum/competency_model.json`) and learner capability records support the skills view.
- **Readiness today is the mean of quiz scores.** This is a simple, reproducible figure; it is not yet the multi-evidence
  readiness model described in the project rules.

### Evidence → finding → intervention → verification → closure
For verified scans, the platform creates an owned **asset**, an **evidence** record and **findings**; a learner can attach
an **intervention** plan, **verify** it with a later scan, and **close** the finding. A finding becomes `RESOLVED` only when
a later scan completed the check that detects it and no longer saw it (if that check failed it stays `OPEN`).
`RESOLVED` is a technical observation and is distinct from the learner's closure workflow (`CLOSED`).

---

## 5. Scanner

Location: `backend/scanner_api` (Flask, port 5000). It validates the same JWTs as the main API. Full documentation:
[`architecture/SCANNER.md`](architecture/SCANNER.md).

**Principle:** every value in a result was observed by a check. A check that fails or is not run is reported with its
reason. Nothing is guessed or invented, and "unknown" is never shown as "none found". There is no aggregate "threat score".

Flow: browser → scanner `POST /api/scan` → result + signed receipt (HS256 over the result hash, bound to the user, 15 min)
→ browser relays to main API `POST /api/scanner/log` → main API verifies the receipt before storing.

| Check | Standard | Full (verified domain) |
|---|---|---|
| DNS (A, AAAA, MX, NS, TXT, CAA, SPF, DMARC), WHOIS | yes | yes |
| TLS handshake, certificate chain and trust | yes | yes |
| TLS 1.3 key-exchange group probe | yes | yes |
| One HTTPS request (security headers; max 3 re-validated redirects) | yes | yes |
| Subdomains from public Certificate Transparency logs | yes | yes |
| TCP port probe (16 ports) | no | yes |
| Subdomain wordlist (DNS only) | no | yes |
| TLS 1.0 / 1.1 acceptance | no | yes |

**PQC detection.** Python's `ssl` does not expose the TLS 1.3 key-exchange group. The scanner sends a ClientHello with an
empty `key_share`; a conforming server answers with a HelloRetryRequest naming the group it chose. No key material is
generated and no handshake completes. Key exchange is reported as `hybrid_pqc`, `hybrid_pqc_available`, `classical` or
`unknown`; certificate authentication is reported separately as a planning item. The result reflects the endpoint that
answered (for CDN sites, the edge).

**Security of the scanner itself:** targets are normalised, resolved once over IPv4 and IPv6, and every address must be
globally routable (private, loopback, link-local, CGNAT, multicast, reserved and embedded-IPv4 forms are refused); all
connections are pinned to the validated addresses (defeats DNS rebinding); redirects are re-validated; JWT required;
rate limit (default 5 per 60 s), one scan per user at a time, concurrency cap (default 3).

**Ownership gate for active checks.** Active checks need proof of ownership: a DNS TXT record
`_qcaps-verify.<domain>` whose value is derived from a secret HMAC over the user and domain. It is checked live on every
full scan (removing it revokes access) and is useless to another account.

**Findings** are derived only from completed checks (severity high / medium / low / info; rules in `scanner/findings.py`).

**Deployment status:** the scanner is **not deployed** on the public site. The hosted site therefore shows no live scans;
run the scanner locally to use it.

---

## 6. Architecture

```
Browser (React SPA, Vercel)  ──HTTPS──▶  Main API (FastAPI, Render)  ──▶  SQLite (SQLAlchemy)
        │                                        ▲
        └──────▶ Scanner API (Flask, local) ─ signed receipt relayed by the browser
```

### Backend (`backend/main_api`)
FastAPI, SQLAlchemy, SQLite by default (`QCAPS_DATABASE_URL`), JWT bearer authentication, PBKDF2 password hashing
(passlib), additive schema migrations in `ensure_schema`. Modules: `main.py` (routes), `models.py`, `schemas.py`,
`quiz_service.py`, `recommendation*.py`, `scan_receipts.py`, `scan_report.py` (PDF), `leaderboard.py`, `activities/`
(labs, missions, XP), `course_content/` (content API, importer, validator, CLI), `evidence/`, `closure/`, `competency/`,
`graph/`, `services/`, `demo_account.py`, `deploy_bootstrap.py`, `seed_quizzes.py`.

Main endpoint groups:
- **Auth:** `POST /api/auth/register`, `/login`, `GET /me`.
- **Quizzes:** create attempt `POST /api/quizzes/{module}/attempts`, answers, `POST .../attempts/{id}/submit`; legacy score submit returns 410.
- **Activities:** `GET /api/activities/me`; `POST /api/activities/labs/{id}/answer`; `POST /api/activities/missions/{id}/runs`, `.../runs/{run_id}/choose`, `.../runs/{run_id}/decide`.
- **Course content (public/learner):** tracks, modules, sections, checkpoint check, section complete.
- **Course content (admin):** section create/update/delete/reorder, checklist, audit log.
- **Scanner:** log, logs, report (PDF), assets, findings.
- **Evidence loop:** evidence, findings, interventions, verification, closures (ownership-checked).
- **Users:** profile, recommendation, capabilities. **Leaderboard** with websocket. **Health:** `GET /api/health`.

Data model (main tables): User, QuizScore, ScannerLog, ScanTarget, EvidenceCapsule, CryptoDelta, Asset, Evidence, Finding,
Competency, LearnerCapability, Intervention, Verification, ClosureEvent, CourseTrack, CourseModule, CourseSection,
ContentAuditLog, CheckpointPass, SectionCompletion, QuizModule, QuizItem, QuizAttempt, QuizResponse, ActivityCompletion,
MissionRun, ActivityAttempt.

### Frontend (`frontend`)
React 18, TypeScript, Vite, Zustand. Feature folders under `src/features`: `admin`, `assessment`, `auth`, `capabilities`,
`closure`, `curriculum`, `dashboard`, `evidence`, `interventions`, `learning`, `lesson`, `missions`, `scanner`, `skills`.
Course data is compiled at build time by `scripts/compile-content.cjs`, which **strips answer keys, feedback and
consequences** from the bundle so they cannot be read in the browser. The Zustand store is a display cache of server state.
Admin CSS classes use the prefix `adm-` (ad blockers hide classes starting with `ad-`). In production the scanner page
never falls back to `localhost`.

### Security model
- Backend is authoritative for identity, authorization, quiz grading, XP, checkpoints, labs and missions.
- Server-owned keys in the progress blob are dropped if a client tries to save them.
- Ownership checks on user-specific resources (evidence, findings, interventions, closures, scan logs).
- Secrets only from environment; production refuses to start without `QCAPS_JWT_SECRET` (min 32 chars).
- Rate limits: login (10 per 5 min per address and name), checkpoints (6 per min), lab answers (12 per min), mission runs (10 per hour), scanner limits above.
- Content security: video hosts from an allow-list, https only.
- **No fabricated security intelligence.** Simulated content is labelled `SIMULATION` or `DEMO DATA`; if no verified result exists the product says so.

### Environment variables (see `backend/.env.example`)
`QCAPS_JWT_SECRET`, `QCAPS_ENV`, `QCAPS_TOKEN_EXPIRE_MINUTES`, `QCAPS_DATABASE_URL`, `QCAPS_CORS_ORIGINS`,
`QCAPS_ENABLE_LEGACY_QUIZ_SUBMIT`, `QCAPS_VIDEO_HOST_ALLOWLIST`, `QCAPS_ADMIN_PASSWORD`, `QCAPS_LOGIN_RATE_LIMIT` /
`_WINDOW_SECONDS`, `QCAPS_CHECKPOINT_RATE_LIMIT` / `_WINDOW_SECONDS`, `SCANNER_HOST`, `SCANNER_RATE_LIMIT`,
`SCANNER_RATE_WINDOW_SECONDS`, `SCANNER_MAX_CONCURRENT`. Deployment-only: `QCAPS_ADMIN_NAME`,
`QCAPS_DEMO_LEARNER_PASSWORD`, `QCAPS_DEMO_COMPLETE_PASSWORD`.

---

## 7. Accounts and roles

- **learner**: normal users. **admin**: can use the course manager, section editor and audit log.
- On the hosted site there is one admin account and two clearly named **DEMO** accounts:
  - `demo-learner`: a coherent mid-course learner (all of Track A, B1, B2 passed in prerequisite order, B3 started).
  - `demo-complete`: every module, lab and mission completed.
- Demo account names must start with `demo`. Their records are written directly to the database in the same shape the
  server writes them; they are **not real learner evidence**.
- Passwords are **not stored in the repository**. They are set as environment variables on the host (Render) and shared
  privately. Rotate them by changing the variables and redeploying.
- Create or reset accounts locally from `backend/main_api`:

```bash
python demo_account.py --profile complete --name demo-complete
python demo_account.py --profile partial  --name demo-learner
python demo_account.py --make-admin admin
```

(Back up `qcaps.db` before running; the script prints a random password once unless one is given.)

---

## 8. Running, testing and deploying

Local setup, import and test commands are in the root [`README.md`](../README.md). In short: backend on port 8000
(`python backend/run_dev.py main`), scanner on 5000, frontend on 5173 (`npm run dev`). Tests: `cd backend && pytest`;
frontend `npm run build`, `npm run lint`, `npm run test:content`, `npm run content:check`.

**Hosted deployment (free tiers):**
- Frontend: Vercel (`https://qcaps.vercel.app`), static Vite build with an SPA rewrite (`frontend/vercel.json`).
- API: Render free web service (`https://qcaps-api.onrender.com`), blueprint in `render.yaml`. The build runs
  `deploy_bootstrap.py`, which creates a fresh database in about nine seconds: curriculum, quiz banks, admin, all lesson
  packs and the demo accounts.
- Limits to know: the free API sleeps when idle (first request after sleep can take about a minute); the SQLite file is
  **ephemeral**, so accounts registered after a deploy or restart are lost, while content and the three seeded accounts are
  rebuilt; Render does not auto-deploy on push (deploy is triggered manually); the scanner is not deployed.
- For persistence, point `QCAPS_DATABASE_URL` at a hosted Postgres (not yet tested with this code).

---

## 9. What is real, what is simulated

| Item | Nature |
|---|---|
| Lessons, quizzes, labs, missions | Authored educational content, sourced and flagged where unverified |
| Executed code listings | Real output from re-running the code |
| Scanner results | Real observations of the target at scan time (when the scanner runs) |
| BB84 mission | **SIMULATION** of quantum key distribution |
| Scenario labs and decision missions | Fictional scenarios for training, not real incidents |
| Demo accounts | **DEMO DATA** |
| Leaderboard, XP, badges | Gamification, not capability measurement |

## 10. Known limitations (be upfront about these)

- No user study has been run, so there is **no measured evidence yet of learning gains**. Do not claim effectiveness.
- Readiness equals mean quiz score; it does not yet combine practical, scanner and recency evidence.
- No capstone submission or review flow; A8 wrap-up, C11 capstone/certificates and E6 capstone are outline text.
- Scanner is not deployed publicly. Lab brute-forcing is made costly (cooldown, reduced XP) but not impossible.
- The browser's XP display cache is still fed by some older flows (documented in `SYSTEM_UNDERSTANDING.md`).
- Hosted database is ephemeral; the Render free tier cold-starts.
- `deploy_bootstrap` content and demo accounts must be rebuilt after each restart.

## 11. Repository map

```
backend/main_api/    FastAPI app, models, content importer, activities, deployment bootstrap
backend/scanner_api/ Flask scanner (api.py, scanner_engine.py, receipts.py, scanner/{checks,findings,net,ownership,crypto,crypto_registry,security})
backend/tests/       pytest suite (in-memory database)
backend/scripts/     smoke_api.py, check_recommendation.py
frontend/src/        features/, pages/, components/, data/, styles/, services/
frontend/scripts/    compile-content.cjs, curriculum-validation(.test).cjs
content/             Course, Quizzes, curriculum, packs, Labs, Mission, Badges, ui-specs
docs/                architecture, curriculum, content-authoring, design, archive, this file
render.yaml          Render blueprint
```

Documentation index: `architecture/SYSTEM_UNDERSTANDING.md` (current-state report, findings, development order),
`architecture/SCANNER.md`, `architecture/FRONTEND_STRUCTURE.md`, `content-authoring/BOOK_COURSE_MAP.md`,
`content-authoring/CURRENT_STRUCTURE.md`, `curriculum/` (architecture, gap analysis, Track A design), `design/` (mockups).

## 12. Using this for an academic presentation

Suggested storyline: threat (Shor, HNDL) → skills gap → what Q-CAPS is → curriculum map (4 tracks, 36 modules) → how
assessment is made trustworthy (server grading, hidden keys) → labs and missions → scanner and PQC detection method →
evidence loop and measurement method → architecture and security → results to date → limitations and future work.

Claims that are safe: the counts in section 2, server-authoritative grading, the HelloRetryRequest detection method, the
SSRF and ownership controls, and that content is sourced with unverified items flagged. Claims to avoid: improved learning
outcomes, novelty over existing platforms, "production-ready", or any real-world finding derived from demo data.
Good "future work": a pre/post user study using the Assessment/Reassessment flow, a multi-evidence readiness score,
persistent hosted database, scanner deployment with quotas, and a capstone review flow.
