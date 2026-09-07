# Master Badges & Certificates — 4-Track Final Program (36 modules)
**Note:** the old `badges/badges_list.md` is now obsolete (it only covered the removed `module_1/2/3` set) — safe to delete. This file is the sole source of truth for all badges.
**Schema rule still applies:** every badge string below goes verbatim into `unlocked_badges` — no separate ID-to-name translation layer, per `shared_data_schema.md`.

---

## Track A — Foundations (8 module badges + 1 capstone + 1 certificate)

| Badge string | Unlock Trigger |
|---|---|
| `Computing Foundations` | Pass `track_a_a1_computing_foundations` quiz (≥70%) |
| `Mathematics Foundations` | Pass `track_a_a2_mathematics_foundations` quiz |
| `Networking Foundations` | Pass `track_a_a3_networking_foundations` quiz |
| `Cybersecurity Foundations` | Pass `track_a_a4_cybersecurity_foundations` quiz |
| `Cryptography Foundations` | Pass `track_a_a5_cryptography_foundations` quiz |
| `Quantum Foundations` | Pass `track_a_a6_quantum_foundations` quiz |
| `First Quantum Circuit` | Pass `track_a_a7_first_quantum_programming` quiz + submit a working Qiskit circuit |
| `PQC Mitigation Aware` | Pass `track_a_a8_pqc_mitigation` quiz (formerly the standalone `module_3_pqc_mitigation`, now Track A's 8th module) |
| `Beginner Capstone Complete` | Submit the combined networking + crypto + quantum capstone project |
| `CQF Certified` | Complete all 8 Track A modules + Beginner Capstone |


## Track B — Intermediate / Engineering (11 module badges + 1 capstone + 1 certificate)

| Badge string | Unlock Trigger |
|---|---|
| `Quantum Math Adept` | Pass `track_b_b1_advanced_math_for_quantum` quiz |
| `Quantum Information Scholar` | Pass `track_b_b2_quantum_information` quiz |
| `Algorithm Architect` | Pass `track_b_b3_quantum_algorithms` quiz |
| `Circuit Engineer` | Pass `track_b_b4_quantum_programming` quiz |
| `Hardware Analyst` | Pass `track_b_b5_quantum_hardware` quiz |
| `Network Defender` | Pass `track_b_b6_network_security_engineering` quiz |
| `Cipher Specialist` | Pass `track_b_b7_advanced_cryptography` quiz |
| `Threat Modeler` | Pass `track_b_b8_quantum_threats` quiz |
| `PQC Apprentice` | Pass `track_b_b9_pqc_fundamentals` quiz |
| `Standards Scholar` | Pass `track_b_b10_pqc_standards` quiz |
| `Lab Bench Veteran` | Pass `track_b_b11_intermediate_pqc_labs` quiz + complete all hands-on labs |
| `Intermediate Capstone Complete` | Submit the quantum-safe migration design project |
| `CQSE Certified` | Complete all 11 Track B modules + Intermediate Capstone |

## Track C — Advanced / Specialist (11 module badges + 1 capstone + certificate choice)

| Badge string | Unlock Trigger |
|---|---|
| `Hilbert Space Theorist` | Pass `track_c_c1_advanced_quantum_information` quiz |
| `Quantum Algorithm Master` | Pass `track_c_c2_advanced_quantum_algorithms` quiz |
| `Error Correction Engineer` | Pass `track_c_c3_quantum_error_correction` quiz |
| `Quantum Network Architect` | Pass `track_c_c4_quantum_networking` quiz |
| `Communications Specialist` | Pass `track_c_c5_quantum_communications` quiz |
| `QKD Expert` | Pass `track_c_c6_quantum_key_distribution` quiz |
| `Cryptography Theorist` | Pass `track_c_c7_advanced_cryptography` quiz |
| `Lattice Mathematician` | Pass `track_c_c8_pqc_mathematics` quiz |
| `PQC Implementer` | Pass `track_c_c9_pqc_implementation_engineering` quiz |
| `Attack Surface Hunter` | Pass `track_c_c10_pqc_attack_surface` quiz |
| `Defense Engineer` | Pass `track_c_c11_pqc_defense_engineering` quiz |
| `Advanced Capstone Complete` | Submit chosen capstone (Implementation Security / Network Architecture / Secure Comms) |
| `QCE Certified` / `PQC-E Certified` / `QNE Certified` | Awarded based on which capstone path was chosen |

## Track D — Enterprise Architect (6 module badges + 1 capstone + 1 certificate)

| Badge string | Unlock Trigger |
|---|---|
| `Risk Strategist` | Pass `track_d_e1_quantum_risk_management` quiz |
| `Crypto Discovery Lead` | Pass `track_d_e2_cryptographic_discovery` quiz |
| `Readiness Assessor` | Pass `track_d_e3_quantum_readiness_assessment` quiz |
| `Agility Architect` | Pass `track_d_e4_crypto_agility` quiz |
| `Migration Commander` | Pass `track_d_e5_enterprise_pqc_migration` quiz |
| `Governance Lead` | Pass `track_d_e6_governance` quiz |
| `Architect Capstone Complete` | Submit the enterprise readiness assessment + migration strategy |
| `QSA Certified` | Complete all 6 Track D modules + Architect Capstone |

## Final Program Certification

| Badge string | Unlock Trigger |
|---|---|
| `PQCTP Certified` | Complete Track D + Shared Professional Core requirements — the program's highest-level certification |
| `Full Program Graduate` | Hold all 5 track certificates (CQF, CQSE, one of QCE/PQC-E/QNE, QSA) plus PQCTP |

---

## Implementation Notes
- **Naming convention:** module badges use short, role-flavored titles (e.g., `Threat Modeler`, `Migration Commander`) rather than literal module names — more motivating for a gamified UI (per Niranjan's brief) while still being unambiguous via the unlock trigger's `module_id` reference.
- **Certificate badges are separate from module badges** in `unlocked_badges` — a certificate badge only unlocks after every module badge in that track is already present, so the backend should check for the full set before awarding the certificate-tier badge.
- **Track C's certificate is conditional** on which capstone the learner chose — the backend must track capstone selection, not just quiz completion, to award the correct one of QCE/PQC-E/QNE.
- All backend awarding logic still follows the same rule established in `badges/badges_list.md`: **validate server-side**, push the exact string to `unlocked_badges`, dedupe before saving.
- Icon design: keep consistent with the original core-track badges — flat, single-accent-color line icons. Confirm with Niranjan before finalizing.
