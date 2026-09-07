# Q-CAPS Master Curriculum Index
**Owner:** Aasif (Content Security) | **Source:** Professional Quantum Computing, Cybersecurity & PQC — Master Course Architecture

This is the single source of truth for the full curriculum's structure, `module_id`s, prerequisite chains, and file locations. Niranjan's frontend should use this file to drive course navigation, unlock logic, and progress tracking — rather than each teammate maintaining their own partial view of the structure.

## How to read this file
Each row: **module_id** (used everywhere — quizzes, badges, progress tracking) → **file path** (course content) → **quiz path** → **unlocks** (what becomes available on passing, ≥70% unless noted).

---

## DEPRECATED: Standalone Core Path (2 modules remaining) — no longer a separate entry point
**Decision (2026-09-06): the user flow is a single linear path — Track A → B → C → D.** `module_1_basics` and `module_2_quantum` are redundant (superseded by `track_a_a5_cryptography_foundations` and `track_a_a6_quantum_foundations`) and are NOT wired into the main path. `module_3_pqc_mitigation` is **no longer in this deprecated list** — it was resolved and reassigned as Track A's 8th module (see Track A table above).

Files remain on disk at `course/module_1_basics.md` / `module_2_quantum.md` and matching quizzes — kept for reference, not deleted, but not linked anywhere in navigation.

| module_id | Course file | Quiz file | Status |
|---|---|---|---|
| `module_1_basics` | `course/module_1_basics.md` | `quizzes/module_1_basics_questions.json` | Superseded by `track_a_a5_cryptography_foundations` |
| `module_2_quantum` | `course/module_2_quantum.md` | `quizzes/module_2_quantum_questions.json` | Superseded by `track_a_a6_quantum_foundations` |

---

## Track A — New Beginner / Foundations (7 modules)
**Overview:** `course/track-a-foundations/00_track_a_overview.md`
**Certificate:** CQF — Certificate in Quantum Foundations

| module_id | Course file | Quiz file | Unlocks |
|---|---|---|---|
| `track_a_a1_computing_foundations` | `course/track-a-foundations/A1_computing_foundations.md` | `quizzes/track-a-foundations/A1_computing_foundations_questions.json` | `track_a_a2...` |
| `track_a_a2_mathematics_foundations` | `.../A2_mathematics_foundations.md` | `.../A2_mathematics_foundations_questions.json` | `track_a_a3...` |
| `track_a_a3_networking_foundations` | `.../A3_networking_foundations.md` | `.../A3_networking_foundations_questions.json` | `track_a_a4...` |
| `track_a_a4_cybersecurity_foundations` | `.../A4_cybersecurity_foundations.md` | `.../A4_cybersecurity_foundations_questions.json` | `track_a_a5...` |
| `track_a_a5_cryptography_foundations` | `.../A5_cryptography_foundations.md` | `.../A5_cryptography_foundations_questions.json` | `track_a_a6...` |
| `track_a_a6_quantum_foundations` | `.../A6_quantum_foundations.md` | `.../A6_quantum_foundations_questions.json` | `track_a_a7...` |
| `track_a_a7_first_quantum_programming` | `.../A7_first_quantum_programming.md` | `.../A7_first_quantum_programming_questions.json` | `track_a_a8_pqc_mitigation` |
| `track_a_a8_pqc_mitigation` | `course/track-a-foundations/A8_pqc_mitigation.md` | `quizzes/track-a-foundations/A8_pqc_mitigation_questions.json` | Beginner Capstone → Track B |

**Decision (2026-09-06): fully renamed and relocated for consistency.** This module was originally `module_3_pqc_mitigation` (part of the now-deprecated standalone Core set). It has been renamed to `track_a_a8_pqc_mitigation` and physically moved into `course/track-a-foundations/` and `quizzes/track-a-foundations/` alongside A1–A7. No content changes — only the file path, filename, and `module_id` changed. **If you already deployed/tested against the old `module_id` (`module_3_pqc_mitigation`), update those references too** — the old ID no longer exists anywhere in Track A.

**Note:** A5 and A6 overlap significantly with core `module_1_basics`/`module_2_quantum` — allow "test out" credit if those are already passed.

---

## Track B — Intermediate / Quantum & Security Engineering (11 modules)
**Overview:** `course/track-b-intermediate/00_track_b_overview.md`
**Certificate:** CQSE — Certificate in Quantum Security Engineering

| module_id | Course file | Quiz file | Unlocks |
|---|---|---|---|
| `track_b_b1_advanced_math_for_quantum` | `course/track-b-intermediate/B1_advanced_math_for_quantum.md` | `quizzes/track-b-intermediate/B1_..._questions.json` | `track_b_b2...` |
| `track_b_b2_quantum_information` | `.../B2_quantum_information.md` | `.../B2_..._questions.json` | `track_b_b3...` |
| `track_b_b3_quantum_algorithms` | `.../B3_quantum_algorithms.md` | `.../B3_..._questions.json` | `track_b_b4...` |
| `track_b_b4_quantum_programming` | `.../B4_quantum_programming.md` | `.../B4_..._questions.json` | `track_b_b5...` |
| `track_b_b5_quantum_hardware` | `.../B5_quantum_hardware.md` | `.../B5_..._questions.json` | `track_b_b6...` |
| `track_b_b6_network_security_engineering` | `.../B6_network_security_engineering.md` | `.../B6_..._questions.json` | `track_b_b7...` |
| `track_b_b7_advanced_cryptography` | `.../B7_advanced_cryptography.md` | `.../B7_..._questions.json` | `track_b_b8...` |
| `track_b_b8_quantum_threats` | `.../B8_quantum_threats.md` | `.../B8_..._questions.json` | `track_b_b9...` |
| `track_b_b9_pqc_fundamentals` | `.../B9_pqc_fundamentals.md` | `.../B9_..._questions.json` | `track_b_b10...` |
| `track_b_b10_pqc_standards` | `.../B10_pqc_standards.md` | `.../B10_..._questions.json` | `track_b_b11...` |
| `track_b_b11_intermediate_pqc_labs` | `.../B11_intermediate_pqc_labs.md` | `.../B11_..._questions.json` | Intermediate Capstone → Track C |

**Note:** B8/B9/B10 overlap with core `module_3_pqc_mitigation` at engineering depth — allow test-out credit similarly.

---

## Track C — Advanced / Quantum & PQC Specialist (11 modules)
**Overview:** `course/track-c-advanced/00_track_c_overview.md`
**Certificates:** QCE, PQC-E, or QNE (based on chosen capstone)

| module_id | Course file | Quiz file | Unlocks |
|---|---|---|---|
| `track_c_c1_advanced_quantum_information` | `course/track-c-advanced/C1_advanced_quantum_information.md` | `quizzes/track-c-advanced/C1_..._questions.json` | `track_c_c2...` |
| `track_c_c2_advanced_quantum_algorithms` | `.../C2_advanced_quantum_algorithms.md` | `.../C2_..._questions.json` | `track_c_c3...` |
| `track_c_c3_quantum_error_correction` | `.../C3_quantum_error_correction.md` | `.../C3_..._questions.json` | `track_c_c4...` |
| `track_c_c4_quantum_networking` | `.../C4_quantum_networking.md` | `.../C4_..._questions.json` | `track_c_c5...` |
| `track_c_c5_quantum_communications` | `.../C5_quantum_communications.md` | `.../C5_..._questions.json` | `track_c_c6...` |
| `track_c_c6_quantum_key_distribution` | `.../C6_quantum_key_distribution.md` | `.../C6_..._questions.json` | `track_c_c7...` |
| `track_c_c7_advanced_cryptography` | `.../C7_advanced_cryptography.md` | `.../C7_..._questions.json` | `track_c_c8...` |
| `track_c_c8_pqc_mathematics` | `.../C8_pqc_mathematics.md` | `.../C8_..._questions.json` | `track_c_c9...` |
| `track_c_c9_pqc_implementation_engineering` | `.../C9_pqc_implementation_engineering.md` | `.../C9_..._questions.json` | `track_c_c10...` |
| `track_c_c10_pqc_attack_surface` | `.../C10_pqc_attack_surface.md` | `.../C10_..._questions.json` | `track_c_c11...` (paired Attack→Defense) |
| `track_c_c11_pqc_defense_engineering` | `.../C11_pqc_defense_engineering.md` | `.../C11_..._questions.json` | Advanced Capstone (choice of 3) → Track D |

---

## Track D — Enterprise Quantum Security Architect (6 modules)
**Overview:** `course/track-d-enterprise/00_track_d_overview.md`
**Certificate:** QSA — Quantum Security Architect Certificate

| module_id | Course file | Quiz file | Unlocks |
|---|---|---|---|
| `track_d_e1_quantum_risk_management` | `course/track-d-enterprise/E1_quantum_risk_management.md` | `quizzes/track-d-enterprise/E1_..._questions.json` | `track_d_e2...` |
| `track_d_e2_cryptographic_discovery` | `.../E2_cryptographic_discovery.md` | `.../E2_..._questions.json` | `track_d_e3...` |
| `track_d_e3_quantum_readiness_assessment` | `.../E3_quantum_readiness_assessment.md` | `.../E3_..._questions.json` | `track_d_e4...` |
| `track_d_e4_crypto_agility` | `.../E4_crypto_agility.md` | `.../E4_..._questions.json` | `track_d_e5...` |
| `track_d_e5_enterprise_pqc_migration` | `.../E5_enterprise_pqc_migration.md` | `.../E5_..._questions.json` | `track_d_e6...` |
| `track_d_e6_governance` | `.../E6_governance.md` | `.../E6_..._questions.json` | Architect Capstone → **PQCTP** (final program certification) |

---

## Full Progression Summary
```
Diagnostic Assessment
        ↓
Track A (7 modules, Beginner)  ──→  CQF certificate
        ↓
Track B (11 modules, Intermediate)  ──→  CQSE certificate
        ↓
Track C (11 modules, Advanced)  ──→  QCE / PQC-E / QNE certificate
        ↓
Track D (6 modules, Enterprise)  ──→  QSA certificate
        ↓
Shared Professional Core + Specialization Pathways
        ↓
PQCTP — Professional Quantum Computing & Quantum-Safe Technology Professional (final)
```
**Single linear path — Track A is the sole entry point.** No parallel/alternate track. Total: **36 modules across the 4 main tracks** (Track A now has 8 modules, including the reassigned `module_3_pqc_mitigation`; the 2 remaining deprecated Core modules above are not part of this count/flow).

## Bridge Modules (not yet built)
The master architecture describes 8 targeted Bridge Modules (Mathematics, Python, Linux, Networking, Cybersecurity, Cryptography, Quantum, PQC) for learners with isolated knowledge gaps, selected by the diagnostic assessment rather than forcing a full track repeat. **Not yet built — flag to the team if these are in scope**, since they weren't part of the original 3-module brief and represent additional, separate content.

## Diagnostic / Placement System (not yet built)
The master architecture calls for a domain-based diagnostic assessment (Mathematics, Programming, Computing, Networking, Cybersecurity, Cryptography, Quantum, PQC) to place learners directly into the appropriate track/module rather than defaulting everyone to the beginning. **Not yet built** — this is a logic/scoring system, likely belonging to Vishnu Priya's Skill-Gap Engine rather than Aasif's content role, but flagged here since it's structurally required for the "multiple entry points" design the whole curriculum assumes.
