# Aasif's Q-CAPS Deliverables — Schema-Aligned Rebuild
Rebuilt: 2026-08-29 — replaces the earlier version entirely.

## What changed from the first draft
Every file now conforms to `shared_data_schema.md` instead of using my own naming conventions:
- `module_id` values follow the schema's confirmed pattern (`module_1_basics`, plus `module_2_quantum` / `module_3_pqc_mitigation`).
- The auth backend's `User` model and every API response use the **exact** Common User Profile field names (`user_id`, `readiness_score`, `total_xp`, `global_rank`, `unlocked_badges`, `recommended_next_module`) — snake_case throughout, no mapping layer, one function (`toPublicProfile()`) is the single source of truth for that shape.
- Badge strings match the schema's own examples exactly (`"Quantum Novice"`, `"RSA Hacker"` are used verbatim) so `unlocked_badges` never mismatches.
- Added `quizzes/quiz_submission_schema.md`, documenting precisely how my question banks map into the schema's Quiz Submission object — this was a gap before.

## Phase 1: Interactive Course Design — ✅
- `course/module_1_basics.md`, `course/module_2_quantum.md`, `course/module_3_pqc_mitigation.md` — each with 5 sub-sections, a specified visual/interactive component per section, and the exact Quiz Submission JSON shown at the end so it's unambiguous for whoever wires the frontend.
- `quizzes/module_1_basics_questions.json` (7 Qs, novice), `module_2_quantum_questions.json` (6 Qs, professional), `module_3_pqc_mitigation_questions.json` (8 Qs, quantum_expert) — difficulty tiers match the exact names used in `master_implementation_plan.md` Segment 3 ("Novice, Professional, Quantum Expert").
- `quizzes/quiz_submission_schema.md` — the missing link between my content and the shared API contract.

## Phase 2: Security Hardening — ✅
- `backend/User.model.js`, `backend/auth.routes.js`, `backend/authMiddleware.js`, `backend/README.md` — rebuilt so every response Niranjan's frontend receives is schema-exact, and Vishnu Priya's scoring/leaderboard logic has the right fields already on the same document to write into.

## Phase 3: Advanced Scenario Labs — ✅
- `labs/escape_room_scenarios.json` — 3 scenarios, now tagged with `module_id` and a `mission_xp_awarded` field (matching the Scanner Mission object's XP convention from the shared schema) plus exact `badge_awarded` strings.
- `badges/badges_list.md` — full list, schema-exact strings, cross-referenced to the labs file so nothing drifts.

## Still open (flagging honestly)
- [ ] Backend stack confirmation — built in Node/Express/MongoDB; port to FastAPI if the team consolidates there (see `backend/README.md` §8).
- [ ] Actual React components for the interactive elements described in the course markdown — currently specifications, not built UI code.
- [ ] Verify NIST FIPS 203/204/205 status against nist.gov before publishing Module 3 content.
- [ ] Vishnu Priya and Niranjan still need to agree and implement the actual `POST /api/submit-quiz` logic described in `quiz_submission_schema.md` — I've defined the contract, not built that endpoint (it's her module per the master plan).

## Next step
Say if you want me to build the React quiz component next (wired to these exact JSON files and the schema), or help you prep what to say to the team about the schema alignment before you push.
