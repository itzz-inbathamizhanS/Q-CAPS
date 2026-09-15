# Aasif's Q-CAPS Deliverables — 4-Track Final Version
Last rebuilt: 2026-09-06 — single linear path, Track A → B → C → D, 36 modules total.

## Scope note (read this first)
Final decision: **4 tracks only, no separate "Module 1/2/3" entry path.** Track A is the sole entry point. Track A now has 8 modules (A1–A7 + A8, where A8 is the former standalone PQC-mitigation module, folded in to close a content gap). See `MASTER_CURRICULUM_INDEX.md` for the complete structure and decision history.

## What's built

### 1. Course content — 36 modules, full lesson text
- **Track A — Foundations (8):** `course/track-a-foundations/`
- **Track B — Intermediate (11):** `course/track-b-intermediate/`
- **Track C — Advanced (11):** `course/track-c-advanced/`
- **Track D — Enterprise (6):** `course/track-d-enterprise/`

Every module has learning objectives, full explanatory sections (not bullet outlines), interactive/visual component specs for whoever builds the frontend UI, and knowledge checks.

### 2. Quizzes — 36 question banks, all validated JSON
Mirrors the course structure exactly under `quizzes/`, plus `quizzes/quiz_submission_schema.md` documenting how a completed quiz maps into `shared_data_schema.md`'s Quiz Submission object.

### 3. Auth backend — schema-aligned
`backend/` — Node/Express + bcrypt + JWT. Every API response matches `shared_data_schema.md`'s Common User Profile object exactly (snake_case, one `toPublicProfile()` function as the single source of truth). See `backend/README.md` for setup and the Vishnu Priya handoff notes.

### 4. Escape room labs — 7 scenarios
`labs/escape_room_scenarios.json` — 3 original scenarios (HNDL, cert-chain migration, symmetric key sizing) plus 4 track-capstone scenarios, one per track (A–D).

### 5. Badges & certificates — full coverage
`badges/master_badges_and_certificates.md` — a badge per module across all 4 tracks (including A8), 4 capstone-completion badges, all 5 certificate tiers (CQF, CQSE, QCE/PQC-E/QNE, QSA), plus the final PQCTP certification. This is now the **only** badges file — the old `badges_list.md` is obsolete and safe to delete (see below).

### 6. Master Curriculum Index
`MASTER_CURRICULUM_INDEX.md` — single source of truth for all 36 `module_id`s, file paths, and unlock chains. Frontend navigation/progress logic should be built against this file.

## Still open (flagging honestly)
- [ ] **`badges/badges_list.md` should be deleted** — it only covered the now-removed 3-module set (badge names like "Crypto Explorer" tied to `module_1_basics`). Fully superseded by `master_badges_and_certificates.md`.
- [ ] **Backend stack confirmation** — built in Node/Express/MongoDB; port to FastAPI if the team consolidates there (see `backend/README.md` §8).
- [ ] **React components** for the interactive elements described throughout the course markdown — currently specifications, not built UI code.
- [ ] **NIST FIPS 203/204/205 verification** against nist.gov before publishing any PQC standards content — flagged repeatedly throughout the course files themselves.
- [ ] **`POST /api/submit-quiz` endpoint** — the contract is documented in `quizzes/quiz_submission_schema.md`, but building it is Vishnu Priya's module per the master plan, not built here.
- [ ] **Bridge Modules (8)** and **Diagnostic/Placement system** — described in the Master Course Architecture but not yet built; likely belongs partly to content (bridge modules) and partly to Vishnu Priya's Skill-Gap Engine (placement logic). See `MASTER_CURRICULUM_INDEX.md`'s closing sections for detail.
- [ ] Escape room scenarios exist for 7 key modules, not all 36 individually, by design (see rationale in that file's description).

## Next step
This is the final, settled scope: 4 tracks, 36 modules, single linear path. Ready to commit and move toward frontend integration whenever the team is ready.
