# Q-CAPS Curriculum Architecture v1

Oct 3, 2026 · @Inbathamizhan S

## 1. Decisions applied

Q-CAPS v1 is a 19-module linear core (Track A, 9 modules; Track B, 10 modules) followed by four branches, each ending in an existing certificate: PQC Engineering (PQC-E), Quantum Computing (QCE), Quantum Networking & QKD (QNE) and Enterprise Architect (QSA). Every skill, item and practical maps to one of the 8 planned domains. This builds on *Q-CAPS Curriculum Inventory & Gap Analysis*; section references like "Gap §4.2" point there.

| Decision | Choice | Source of choice | Why |
| --- | --- | --- | --- |
| D1 Path structure | Linear core A→B, then role-based branches | You | Keeps one on-ramp; removes the forced 30-module detour for architects (Gap §4.2) |
| D3 Skill framework | The 8 planned domains: MATH, PROG, COMP, NET, SEC, CRYPTO, QNT, PQC | You | Already named in the master index; matches the planned placement test |
| D5 Track C | Split into three branches that match the existing QCE / PQC-E / QNE certificates | Delegated to me | Track C already ends in three certificates; C1–C3 and C7–C11 serve different careers (Gap §4.7) |
| D2 Unit of learning | Module → lesson → objective; today's sections become lessons | Proposed default | Objectives are the hook for items, skills and recommendations |
| D4 Capability levels | Unknown, Beginner, Developing, Proficient, Advanced | Proposed default | Separates "no evidence" from "low skill" |
| D6 Repeated topics | Each repeat declares a depth: Aware, Explain, Apply, Analyse | Proposed default | Turns duplication into an intentional spiral (Gap §4.1) |
| D7 Peripheral topics | AI-for-security, CTI, forensics, OT/CPS, blockchain excluded from v1 | Proposed default | Outside the quantum-readiness purpose; revisit as electives |
| D8 Readiness | Learner readiness and organisational maturity are separate scores | Proposed default | Gap §5.2; BQS maturity model is organisational |
| D9 Scanner | Used as a lab only against owned or explicitly authorised targets | Proposed default | Links E2 discovery to real evidence without enabling abuse |
| D10 Placement | Build an 8-domain placement test and 8 short bridge units | Proposed default | Master index requires both; enables test-out |

**Module ids.** Continuing modules keep their current `module_id` so existing progress, badges and quiz records stay valid; only display codes and order change. New or merged modules get new ids. Section 9 lists every mapping.

**Scope of this document.** It defines structure, sequence, skills and assessment design. It does not write lessons or questions, and it changes no software.

## 2. Path map

&#91;embedded content: Q-CAPS v1 learning path · 2 core tracks, 4 branches, 7 certificates\]

Every learner takes the same 19 core modules (A then B), earns CQSE, then picks a branch; PQCTP combines the Enterprise branch with one technical branch. The placement test (§7.2) can shorten Track A through test-out and bridge units.

## 3. Skill model

The 8 domains hold 44 competencies; every lesson objective, quiz item and practical carries exactly one primary competency id, and capability is estimated per competency, never per domain directly.

### 3.1 Domains and competencies

| Domain | Competency ids | Main source in library |
| --- | --- | --- |
| MATH — Mathematics | MATH.1 algebra, functions, logarithms · MATH.2 probability and statistics · MATH.3 linear algebra and complex vector spaces · MATH.4 modular arithmetic, number theory, finite fields · MATH.5 lattices and coding theory | Paar Ch 1, 4.3, 6.3, 8.2; Stinson §3–4 |
| PROG — Programming | PROG.1 Python fundamentals · PROG.2 algorithms and complexity · PROG.3 version control and dev workflow · PROG.4 quantum SDK programming · PROG.5 crypto library and API use | None for PROG.4 (Gap §2) |
| COMP — Computing | COMP.1 hardware, OS, processes · COMP.2 Linux and command line · COMP.3 quantum hardware and noise · COMP.4 error correction and fault tolerance | None for COMP.3–4 |
| NET — Networking | NET.1 TCP/IP and addressing · NET.2 DNS, HTTP and core services · NET.3 routing, segmentation, VPN, zero trust · NET.4 secure protocols (TLS, SSH, IPsec) · NET.5 quantum networks and QKD | Om Pal Ch 4 (partial); BQS Ch 3 for NET.5 contrast |
| SEC — Cybersecurity | SEC.1 CIA, authentication, IAM · SEC.2 threats, vulnerabilities, threat modelling · SEC.3 monitoring and incident response · SEC.4 risk management · SEC.5 ethics, authorisation and legal scope · SEC.6 governance, policy, compliance | BQS Ch 4, 7; Om Pal Ch 9, 13 |
| CRYPTO — Cryptography | CRYPTO.1 symmetric ciphers, modes, AEAD · CRYPTO.2 hashes, MACs, KDFs, randomness · CRYPTO.3 public-key (RSA, DH, ECC) · CRYPTO.4 signatures, certificates, PKI · CRYPTO.5 key management and HSMs · CRYPTO.6 security notions and proofs | Paar Ch 2–11, 13–14 |
| QNT — Quantum | QNT.1 qubits, superposition, measurement · QNT.2 gates, circuits, entanglement · QNT.3 quantum information theory · QNT.4 quantum algorithms (Grover, QFT, Shor) · QNT.5 resource estimates and threat timelines | Stinson §1; BQS Ch 1 |
| PQC — Post-quantum readiness | PQC.1 quantum threat to crypto (HNDL, Mosca) · PQC.2 PQC families and assumptions · PQC.3 standards and algorithm selection · PQC.4 implementation and testing · PQC.5 implementation attacks and defence · PQC.6 hybrid modes and crypto-agility · PQC.7 discovery and inventory (CBOM) · PQC.8 migration planning and readiness | Stinson; FIPS 203; Paar Ch 12; BQS Ch 3–8 |

PQC is deliberately broad because migration and agility are Q-CAPS's core outcome; governance sits in SEC.6 so it can apply beyond PQC.

### 3.2 Depth tags

Every objective and item also carries a depth: **Aware** (recognise, name), **Explain** (describe why), **Apply** (use in a defined task), **Analyse** (evaluate, choose, critique). Repeated topics must climb at least one depth per appearance (Decision D6).

### 3.3 Capability levels and evidence rules

Levels are estimated per competency from server-graded evidence only. Thresholds below are starting hypotheses to calibrate against pilot data, not validated cut scores.

| Level | Evidence required (proposed) |
| --- | --- |
| Unknown | Fewer than 3 scored items on this competency |
| Beginner | At least 3 items; below 60% on Aware/Explain items |
| Developing | At least 60% on Aware/Explain items |
| Proficient | Developing, plus at least 70% on Apply items and one passed practical |
| Advanced | Proficient, plus at least 70% on Analyse items or a passed capstone component |

- **Recency:** evidence older than 12 months is flagged stale and shown, not silently dropped.
- **Confidence:** each level displays its item count and practical count.
- **Domain summary:** coverage (share of competencies not Unknown) plus the median level of covered competencies. No domain percentage is shown when coverage is below 50%.
- **XP plays no part** in any level.

## 4. Linear core — Track A Foundations (9 modules, certificate CQF)

Track A gains one module by splitting cryptography in two, moves number basics into maths, and turns the old PQC Mitigation module into a beginner-level awareness module placed after quantum foundations.

| Order | Module (display title) | `module_id` | Primary competencies → depth | Change from today | Library source |
| --- | --- | --- | --- | --- | --- |
| A1 | Computing and Programming Foundations | `track_a_a1_computing_foundations` (kept) | COMP.1–2 Explain; PROG.1, PROG.3 Apply; PROG.2 Aware | Add Python and Linux practicals; remove team names | None |
| A2 | Mathematics Foundations | `track_a_a2_mathematics_foundations` (kept) | MATH.1–2 Apply; MATH.3 Explain; MATH.4 Aware | Add modular arithmetic, primes, gcd as a lesson | Paar Ch 1.4 |
| A3 | Networking Foundations | `track_a_a3_networking_foundations` (kept) | NET.1–2 Explain; NET.3 Aware | Add packet-capture practical | None |
| A4 | Cybersecurity Foundations | `track_a_a4_cybersecurity_foundations` (kept) | SEC.1–3 Explain; SEC.4 Aware; SEC.5 Explain | Add ethics, authorised testing and a threat-modelling lesson | Om Pal Ch 4 (partial) |
| A5 | Cryptography I: Symmetric Encryption and Integrity | `track_a_a5_cryptography_foundations` (kept, narrowed) | CRYPTO.1–2 Explain | Add modes, AEAD, ChaCha20, KDFs, randomness; public-key topics move to A6 | Paar Ch 2–5, 11, 13, 14.2 |
| A6 | Cryptography II: Public Key, Signatures and PKI | `track_a_a5p_public_key_pki` (new) | CRYPTO.3–4 Explain; NET.4 Aware | Built from A5.5–5.11 plus RSA/DH worked examples on small numbers | Paar Ch 6–10, 14.5 |
| A7 | Quantum Foundations | `track_a_a6_quantum_foundations` (kept) | QNT.1–2 Explain | Prerequisites become A2 + A6 | BQS Ch 1; Stinson §1 |
| A8 | First Quantum Programming | `track_a_a7_first_quantum_programming` (kept) | PROG.4 Apply; QNT.2 Apply | Real-hardware run becomes optional; simulator required | None |
| A9 | Quantum Threat and PQC Awareness | `track_a_a8_pqc_mitigation` (kept, rewritten) | PQC.1 Explain; QNT.4, PQC.3, PQC.6 Aware | Level set to Beginner; Shor/Grover stay conceptual; standards named only; Mosca's inequality added | BQS Ch 1, 5; Stinson §1 |

**Prerequisites inside Track A** (replacing the strict chain): A2 → A5 → A6; A3 → A4; A1 + A7 → A8; A6 + A7 → A9. A1–A4 can be taken in any order. The CQF requires all 9 modules plus the Beginner Capstone.

**Beginner Capstone (kept, made assessable):** secure a small lab network, encrypt and sign a file with standard libraries, and run a 2-qubit entanglement circuit, then write a one-page note on which of the three is quantum-vulnerable and why. Rubric in section 8.

## 5. Linear core — Track B Engineering (10 modules, certificate CQSE)

Track B drops from 11 to 10 modules: quantum hardware moves to the Quantum Computing branch, TLS/PKI material is consolidated into one networking module, number theory arrives before the public-key and threat modules that need it, and the labs module becomes the scanner-backed discovery practical.

| Order | Module (display title) | `module_id` | Primary competencies → depth | Change from today | Library source |
| --- | --- | --- | --- | --- | --- |
| B1 | Mathematics for Quantum and Cryptography | `track_b_b1_advanced_math_for_quantum` (kept) | MATH.3 Apply; MATH.4 Apply; MATH.5 Aware | Absorbs number theory, groups, finite fields from C7.1–7.3; adds a lattice intuition lesson | Paar Ch 4.3, 6.3, 8.2; Stinson §4 intro |
| B2 | Quantum Information | `track_b_b2_quantum_information` (kept) | QNT.3 Explain | Declares its depth vs C1 (Explain here, Analyse in C1) | None |
| B3 | Quantum Algorithms for Security | `track_b_b3_quantum_algorithms` (kept, trimmed) | QNT.4 Explain | Keeps Deutsch–Jozsa, Grover, QFT, phase estimation, Shor; walks, variational methods and complexity move to the QC branch | Stinson §1 (order/period finding); Paar Ch 12.1 |
| B4 | Quantum Programming | `track_b_b4_quantum_programming` (kept) | PROG.4 Apply | Practical: implement small Grover and period-finding circuits on a simulator | None |
| B5 | Network and Protocol Security | `track_b_b6_network_security_engineering` (kept, expanded) | NET.3–4 Apply; CRYPTO.4 Apply | Absorbs B7.5–7.9 (PKI architecture, certificate lifecycle, TLS internals, SSH, VPN crypto) | Paar Ch 14.5; Om Pal Ch 4 |
| B6 | Applied Cryptography Engineering | `track_b_b7_advanced_cryptography` (kept, renamed) | CRYPTO.3, CRYPTO.5 Apply; CRYPTO.2 Apply | Keeps RSA/ECC security, padding, KEM concept, signatures, HSMs, key lifecycle; adds KDFs in protocols | Paar Ch 7–10, 14 |
| B7 | Quantum Threats and Resource Estimation | `track_b_b8_quantum_threats` (kept, expanded) | PQC.1 Apply; QNT.5 Explain; SEC.2 Apply | Adds resource-estimate reasoning (from old B5.10) and Mosca's inequality as a worked practical | Stinson (Threat Timeline Report 2024); BQS Ch 1, 5 |
| B8 | PQC Fundamentals | `track_b_b9_pqc_fundamentals` (kept) | PQC.2 Explain | Adds isogeny-based crypto and the 2022 SIKE break as the algorithm-diversity case | Stinson §2–5; Paar Ch 12 |
| B9 | PQC Standards and Algorithm Selection | `track_b_b10_pqc_standards` (kept, rewritten) | PQC.3 Apply | Adds NIST security categories, ML-KEM parameter sets, FN-DSA, HQC, stateful hash signatures; publish-time verification required | FIPS 203; Stinson §1; BQS Ch 3 |
| B10 | PQC Labs and Cryptographic Discovery | `track_b_b11_intermediate_pqc_labs` (kept, refocused) | PQC.4, PQC.6, PQC.7 Apply | Adds a CBOM-style inventory of an authorised target using the Q-CAPS scanner | FIPS 203; BQS Ch 4–5 (CBOM) |

**Prerequisites inside Track B:** B1 → B2 → B3 → B4; B1 → B6; A6 → B5; B3 + B6 → B7 → B8 → B9 → B10; B5 → B10. Quantum (B2–B4) and security (B5–B6) strands can run in parallel and meet at B7.

**Intermediate Capstone (kept, made assessable):** for a fictional organisation, produce a cryptographic inventory, rank exposures using Mosca's inequality, select algorithms with justification against B9's selection criteria, and benchmark one hybrid configuration. CQSE requires all 10 modules plus this capstone.

**Track A + Track B together are the "Shared Professional Core"** that the badges file referenced but never defined.

## 6. Branches after Track B

Each branch requires CQSE, has 3–6 modules and one capstone, and awards one existing certificate; old Track C is redistributed across three branches and Track D becomes the fourth unchanged in content.

### 6.1 PQC Engineering branch → PQC-E

For developers and security engineers who build, test and harden PQC deployments.

| Order | Module | `module_id` | Competencies → depth | Change from today | Source |
| --- | --- | --- | --- | --- | --- |
| P1 | Cryptographic Security Notions | `track_c_c7_advanced_cryptography` (kept, refocused) | CRYPTO.6 Analyse; CRYPTO.2 Analyse | Number theory moves to B1; adds IND-CCA, EUF-CMA and the Fujisaki–Okamoto transform | Paar Ch 7.8; Stinson §1 criteria |
| P2 | PQC Mathematics | `track_c_c8_pqc_mathematics` (kept) | MATH.5 Analyse; PQC.2 Analyse | Adds LLL/BKZ attack intuition | Stinson §2–4; Takagi (DeepBKZ, Ring-LWE) as optional reading |
| P3 | PQC Implementation Engineering | `track_c_c9_pqc_implementation_engineering` (kept, expanded) | PQC.4 Analyse; PROG.5 Apply | Adds FIPS 203 internals: K-PKE, NTT, implicit rejection, input checks, known-answer tests | FIPS 203 §3–8 |
| P4 | PQC Attack Surface | `track_c_c10_pqc_attack_surface` (kept) | PQC.5 Analyse | Links each attack to a P5 defence | Paar side-channel notes; Takagi (UOV fault, noisy GCD) |
| P5 | PQC Defence Engineering | `track_c_c11_pqc_defense_engineering` (kept) | PQC.5, PQC.6 Analyse | Hybrid combiner and KDF design explicitly covered | BQS Ch 5, 8 |

**Capstone:** implement or configure ML-KEM from a library, pass official test vectors, then evaluate it against the P4 attack list with a written threat report.

### 6.2 Quantum Computing branch → QCE

For learners heading into quantum software, hardware or research roles.

| Order | Module | `module_id` | Competencies → depth | Change from today | Source |
| --- | --- | --- | --- | --- | --- |
| Q1 | Quantum Hardware | `track_b_b5_quantum_hardware` (moved from core) | COMP.3 Explain | Resource-estimate lesson stays in core B7 | None |
| Q2 | Advanced Quantum Information | `track_c_c1_advanced_quantum_information` (kept, shared with QNE) | QNT.3 Analyse | Declares depth vs B2 | None |
| Q3 | Advanced Quantum Algorithms | `track_c_c2_advanced_quantum_algorithms` (kept, expanded) | QNT.4 Analyse | Receives quantum walks, variational methods and complexity from B3 | Stinson §1; Takagi (quantum walks, binary-ECDLP Shor) |
| Q4 | Quantum Error Correction | `track_c_c3_quantum_error_correction` (kept) | COMP.4 Apply | Prerequisites Q1 + Q2 | None |

**Capstone:** design and simulate a small error-corrected or algorithmic experiment, and report its resource cost against current hardware limits.

### 6.3 Quantum Networking & QKD branch → QNE

For network engineers evaluating quantum communication and QKD against PQC.

| Order | Module | `module_id` | Competencies → depth | Change from today | Source |
| --- | --- | --- | --- | --- | --- |
| N1 | Advanced Quantum Information | `track_c_c1_advanced_quantum_information` (shared with QCE) | QNT.3 Analyse | Same module, credited once | None |
| N2 | Quantum Networking and Communications | `track_c_c4_quantum_networking_communications` (new, merges C4 + C5) | NET.5 Explain | Removes the duplicated teleportation, distribution and repeater lessons | None |
| N3 | Quantum Key Distribution | `track_c_c6_quantum_key_distribution` (kept) | NET.5 Apply; PQC.6 Analyse | BB84 mission becomes its required practical; QKD-vs-PQC lesson ends the branch | BQS Ch 3 (QKD/QRNG contrast) |

**Capstone:** design a secure communication link for a defined scenario, justify QKD, PQC or both, and state the trust and hardware assumptions.

### 6.4 Enterprise Architect branch → QSA

For architects, security managers and consultants. Content keeps the E1–E6 ids; display codes become D1–D6.

| Order | Module | `module_id` | Competencies → depth | Change from today | Source |
| --- | --- | --- | --- | --- | --- |
| D1 | Quantum Risk Management | `track_d_e1_quantum_risk_management` (kept) | SEC.4 Analyse; PQC.1 Analyse | Prerequisite becomes CQSE, not Track C; HNDL re-teaching cut to a recap | BQS Ch 4 |
| D2 | Cryptographic Discovery and CBOM | `track_d_e2_cryptographic_discovery` (kept) | PQC.7 Analyse | Names CBOM; uses scanner output as practical evidence | BQS Ch 4–5 |
| D3 | Quantum Readiness Assessment | `track_d_e3_quantum_readiness_assessment` (kept) | PQC.8 Analyse | Adopts the BQS 5-level maturity model and heat map | BQS Ch 4 |
| D4 | Crypto-Agility | `track_d_e4_crypto_agility` (kept) | PQC.6 Analyse | Adds vendor engagement lifecycle | BQS Ch 8 |
| D5 | Enterprise PQC Migration | `track_d_e5_enterprise_pqc_migration` (kept) | PQC.8 Analyse | Enterprise migration mission is its practical | BQS Ch 5–6 |
| D6 | Governance and Compliance | `track_d_e6_governance` (kept, expanded) | SEC.6 Analyse | Adds CNSA 2.0 and NIST/NSA transition timelines, ENISA guidance (verify dates) | BQS Ch 7 |

**Capstone (kept):** an enterprise readiness assessment with maturity level, CBOM summary, risk heat map and a multi-year migration roadmap with measurable milestones.

## 7. Credentials, bridge units and placement

Seven certificates remain, each now tied to server-graded modules plus a rubric-scored capstone; PQCTP is redefined as core + Enterprise + one technical branch.

### 7.1 Credentials

| Credential | Requires | Change from today |
| --- | --- | --- |
| CQF — Certificate in Quantum Foundations | 9 Track A modules + Beginner Capstone | 8 → 9 modules |
| CQSE — Certificate in Quantum Security Engineering | CQF + 10 Track B modules + Intermediate Capstone | 11 → 10 modules |
| PQC-E — PQC Engineer | CQSE + P1–P5 + capstone | Track C subset only |
| QCE — Quantum Computing Engineer | CQSE + Q1–Q4 + capstone | Track C subset + old B5 |
| QNE — Quantum Networking Engineer | CQSE + N1–N3 + capstone | Track C subset |
| QSA — Quantum Security Architect | CQSE + D1–D6 + capstone | No longer requires Track C |
| PQCTP — final program certification | CQSE + QSA + one of PQC-E / QCE / QNE | Replaces undefined "Shared Professional Core" |

`Full Program Graduate` is retired or redefined as holding all four branch certificates \[decision pending, §10\]. Module badges keep their names; the three escape-room badges that duplicate module badges are renamed.

### 7.2 Placement test (pre-assessment)

- 8 domains × 5 items = 40 items, about 30 minutes; items tagged to competencies and depths, drawn from the module item banks.
- Purpose: place the learner, seed competency levels, and serve as the **pre-test** in the research loop.
- Test-out rule for Track A modules: every primary competency of the module reaches Developing.
- Test-out for Track B modules requires a module challenge exam including its Apply items, because placement items stop at Explain.
- Branch modules cannot be tested out of in v1.

### 7.3 Bridge units

Eight short units (30–60 minutes each), one per domain, built from existing Track A lessons rather than new content. A learner placed beyond Track A but Beginner or Unknown in one domain is assigned that domain's bridge unit instead of repeating the full track.

| Bridge | Built from | Typical trigger |
| --- | --- | --- |
| Mathematics | A2 lessons + B1 number theory intro | Track B entry with MATH.3/4 below Developing |
| Programming | A1 Python lessons | PROG.1 below Developing |
| Computing / Linux | A1 OS and Linux lessons | COMP.2 below Developing |
| Networking | A3 | NET.1–2 below Developing |
| Cybersecurity | A4 | SEC.1–2 below Developing |
| Cryptography | A5 + A6 core lessons | CRYPTO.1–4 below Developing |
| Quantum | A7 | QNT.1–2 below Developing |
| PQC | A9 | PQC.1 below Developing |

## 8. Assessment and readiness architecture

Every score that feeds skills, readiness or credentials is graded on the server from per-item responses; XP becomes engagement-only and leaves the readiness formula.

### 8.1 Assessment layers

| Layer | Form | Size (proposed) | Graded by | Feeds |
| --- | --- | --- | --- | --- |
| Placement / pre-test | MCQ, 8 domains | 40 items | Server | Competency levels, placement, research pre-score |
| Lesson check | 2–3 MCQ per lesson | Formative, unlimited retries | Server | Practice only, not levels |
| Module quiz | MCQ + short scenario items covering every objective | 10–15 items per form; bank ≥ 2× form size, ≥ 3 items per objective | Server; keys never sent to client; option order randomised | Competency levels, module completion |
| Module practical | Lab task (code, config, analysis, scanner artefact) | 1 per module with Apply objectives | Automated checks where possible, else rubric | Proficient-level evidence |
| Escape rooms and missions | Decision scenarios and simulations | Existing 7 + 2, extended | Server-recorded choices | Formative; missions count as practicals where mapped |
| Track checkpoint / post-test | Parallel form of placement, track-scoped | 30–40 items | Server | Research post-score, learning gain |
| Capstone | Artefact + written justification | 1 per track/branch | 4-criterion rubric, human reviewer | Advanced-level evidence, credentials |

### 8.2 Item and data requirements

- Each item stores: competency id, depth tag, objective id, difficulty estimate, answer key (server only), explanation, source reference.
- Each attempt stores: user, module, form id, item ids, chosen options, correctness, time, timestamp — including failed attempts.
- Answer positions are balanced across the bank and shuffled per form (Gap §4.11: 94.5% of current keys are option B).
- Current 183 items are kept as seed items after tagging and rebalancing; each module needs roughly 25–45 items to meet the bank rule.

### 8.3 Capstone rubric (shared skeleton)

Four criteria, each scored 0–3: technical correctness; justification against sources and standards; security and risk reasoning; communication of trade-offs. Pass = at least 8 of 12 with no criterion at 0.

### 8.4 Readiness

- **Learner Quantum-Readiness:** derived only from competency levels in PQC, CRYPTO, SEC.4, SEC.6 and QNT.5, with coverage and recency shown. Below 50% coverage it displays "Insufficient evidence" instead of a number. The weighting is a separate, documented algorithm decision.
- **Organisational Maturity:** BQS 5-level model (Ad Hoc → Optimized Resilience) assessed in D3 and on the Organization page from a questionnaire plus scanner/CBOM evidence.
- The two are never merged into one number.

### 8.5 XP and badges

- XP rewards engagement: once per module completion, practical, mission and capstone; never per retake or per vulnerability found.
- Scanner XP, if kept, rewards completing an authorised assessment and a remediation note, not the count of findings.
- XP, badges and certificates are awarded by the backend only.

### 8.6 Research loop mapping

ASSESS = placement; DISCOVER = scanner/CBOM (B10, D2); MODEL = competency levels; RECOMMEND = next module/bridge with a stated reason; TRAIN = modules and practicals; REASSESS = checkpoint post-test; MEASURE = per-competency gain between parallel forms. The hypothesis to test — that recommendation-driven paths produce larger gains than the fixed path — is not yet evidenced.

## 9. Migration map from the current repository

Of the 36 current modules, 33 keep their id and place (with content changes), 1 moves from core to a branch, 2 merge into 1 new id, and 1 new module is added; no learner progress record needs deleting.

| Current code | Current `module_id` | New place | Action |
| --- | --- | --- | --- |
| A1 | `track_a_a1_computing_foundations` | Core A1 | Keep; add practicals |
| A2 | `track_a_a2_mathematics_foundations` | Core A2 | Keep; add modular arithmetic |
| A3 | `track_a_a3_networking_foundations` | Core A3 | Keep |
| A4 | `track_a_a4_cybersecurity_foundations` | Core A4 | Keep; add ethics, threat modelling |
| A5 | `track_a_a5_cryptography_foundations` | Core A5 | Narrow to symmetric and integrity |
| — | `track_a_a5p_public_key_pki` | Core A6 | **New**, built from A5.5–5.11 |
| A6 | `track_a_a6_quantum_foundations` | Core A7 | Keep; display code changes |
| A7 | `track_a_a7_first_quantum_programming` | Core A8 | Keep; display code changes |
| A8 | `track_a_a8_pqc_mitigation` | Core A9 | Rewrite to awareness depth; fix stale `module_3` metadata |
| B1 | `track_b_b1_advanced_math_for_quantum` | Core B1 | Absorb C7.1–7.3 |
| B2 | `track_b_b2_quantum_information` | Core B2 | Keep |
| B3 | `track_b_b3_quantum_algorithms` | Core B3 | Trim; advanced topics to Q3 |
| B4 | `track_b_b4_quantum_programming` | Core B4 | Keep |
| B5 | `track_b_b5_quantum_hardware` | QCE Q1 | **Move** to branch |
| B6 | `track_b_b6_network_security_engineering` | Core B5 | Absorb B7.5–7.9 |
| B7 | `track_b_b7_advanced_cryptography` | Core B6 | Rename; TLS/PKI parts move to B5 |
| B8 | `track_b_b8_quantum_threats` | Core B7 | Add resource estimation, Mosca |
| B9 | `track_b_b9_pqc_fundamentals` | Core B8 | Add isogeny / SIKE case |
| B10 | `track_b_b10_pqc_standards` | Core B9 | Rewrite; verify standards status |
| B11 | `track_b_b11_intermediate_pqc_labs` | Core B10 | Add scanner-backed discovery lab |
| C1 | `track_c_c1_advanced_quantum_information` | QCE Q2 = QNE N1 | Keep; shared |
| C2 | `track_c_c2_advanced_quantum_algorithms` | QCE Q3 | Receive B3 advanced topics |
| C3 | `track_c_c3_quantum_error_correction` | QCE Q4 | Keep |
| C4 | `track_c_c4_quantum_networking` | QNE N2 | **Merge** into `track_c_c4_quantum_networking_communications` |
| C5 | `track_c_c5_quantum_communications` | QNE N2 | **Merge** (as above) |
| C6 | `track_c_c6_quantum_key_distribution` | QNE N3 | Keep; BB84 mission required |
| C7 | `track_c_c7_advanced_cryptography` | PQC-E P1 | Refocus on security notions |
| C8 | `track_c_c8_pqc_mathematics` | PQC-E P2 | Keep |
| C9 | `track_c_c9_pqc_implementation_engineering` | PQC-E P3 | Add FIPS 203 internals |
| C10 | `track_c_c10_pqc_attack_surface` | PQC-E P4 | Keep |
| C11 | `track_c_c11_pqc_defense_engineering` | PQC-E P5 | Keep |
| E1–E6 | `track_d_e1_…` to `track_d_e6_…` | QSA D1–D6 | Keep ids; display codes D1–D6 |

**Progress handling for merges and splits.** A learner who completed C4 or C5 gets partial credit on N2 (completed lessons carry over) but must pass N2's quiz. A learner who completed old A5 gets A6 marked "review" rather than complete, since A6 adds public-key content they were only shown in summary. Exact ids for C4/C5 should be checked against `curriculumData.ts` before migration.

**Linked assets to update:** escape rooms 1–3 (old `module_3_pqc_mitigation` → `track_a_a8_pqc_mitigation`), escape room 4–7 module links, the two missions, badge triggers, recommendation catalog, frontend `prerequisites` arrays, and `domain` tags (replaced by competency ids).

## 10. Open items needing your input

These are the choices this architecture still leaves to you; none blocks starting lesson design for Track A.

| # | Item | My default if you don't decide | Affects |
| --- | --- | --- | --- |
| O1 | Within-track order: strict chain or prerequisite-based flexibility (as in §4–5) | Recommended order shown, prerequisites enforced, any valid order allowed | Unlock logic |
| O2 | Executive / leadership learners: must they complete the full core before D1–D6? | Yes in v1; consider a short leadership path in v2 based on BQS role tiers | QSA reach |
| O3 | Capability thresholds in §3.3 | Use as pilot hypotheses, recalibrate after first cohort | Skill levels, test-out |
| O4 | Learner readiness weighting | Separate algorithm doc, reviewed before implementation | Dashboard |
| O5 | `Full Program Graduate` badge | Redefine as all four branch certificates | Gamification |
| O6 | Capstone reviewers: instructor, peer, or automated + spot check | Instructor review, automated checks where possible | Credential cost |
| O7 | Missing library sources (Qiskit, hardware, QEC, QKD, TLS 1.3/hybrid, networking) | Add vendor-neutral texts and official docs before authoring those modules | A1, A3, A8, B4, B5, Q1–Q4, N2–N3 |
| O8 | Standards status after Aug 2025 (FIPS 204/205/206, HQC, NIST transition guidance, CNSA 2.0 dates) | Verify on nist.gov / nsa.gov at authoring time and record the check date in B9 and D6 | B9, P3, D6 |
| O9 | Electives for excluded topics (AI-for-security, CTI, forensics, OT/CPS) | Out of v1 | Scope |
| O10 | Lesson length target | 15–25 minutes per lesson, so declared module time matches content | Authoring effort |

**Suggested next stage:** confirm O1, O2 and O10, then design Track A at lesson level (objectives, competency tags, practicals and item-bank plan per lesson) as the first build increment.
