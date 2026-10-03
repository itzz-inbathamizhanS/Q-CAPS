# Q-CAPS Curriculum Inventory & Gap Analysis

Oct 3, 2026 · @Inbathamizhan S

## Scope, sources and method

Q-CAPS has a broad, well-named curriculum skeleton (4 tracks, 36 modules, 183 quiz questions) but thin, unevenly sequenced content, a 4-domain skill model that cannot represent it, and assessment data that is not yet trustworthy evidence. The 36 modules declare about 92.5 hours of learning time but contain about 15,200 words, roughly 76 minutes of reading.

**Sources examined.** Repository `itzz-inbathamizhanS/Q-CAPS` at commit `5637701` (2026-09-20): `content/` (Course, Quizzes, Labs, Mission, Badges, ui-specs, MASTER\_CURRICULUM\_INDEX, README), `docs/tasks/`, `frontend/src/data/*.ts` (the active, rendered curriculum), curriculum/skills/learning feature code, and `backend/main_api` (models, quiz submit, readiness, recommendation). Project reference library: Paar, Pelzl & Güneysu, *Understanding Cryptography* 2nd ed. (2024); Stinson, *A Tutorial on Post-quantum Cryptography* (slides, Aug 2025); Arun, Harishankar & Rjaib, *Becoming Quantum Safe* (Wiley 2025); Takagi et al. (eds.), *Mathematical Foundations for Post-Quantum Cryptography* (Springer, Mathematics for Industry 40); Om Pal et al. (eds.), *Cyber Security Using Modern Technologies*; NIST FIPS 203 (ML-KEM).

**Active vs legacy.** Where `content/` markdown and `frontend/src/data/curriculumData.ts` disagree, the frontend file is treated as the active implementation, because it is what learners see and what drives unlocks. The Node/Express backend under `content/Backend/` is legacy; FastAPI is active.

**Evidence labels used throughout.**

- **\[A\] Source** — explicitly present in a repository file or a reference book (file or chapter named).
- **\[B\] Inferred** — a reasonable conclusion drawn from \[A\] evidence, not stated anywhere.
- **\[C\] Decision / research** — missing, contradictory, or time-sensitive; needs a team decision or fresh verification.

**Limits.** No lesson was rewritten and no software was changed. Book coverage was assessed from tables of contents plus targeted term searches, not a full read. Standards status is taken from the books (latest: Stinson, Aug 2025); anything after that is marked \[C\].

## 1. Repository content inventory

The repository holds 36 modules in 4 tracks, one 5–8 question quiz per module, a 10-question diagnostic, 7 escape-room scenarios, 2 missions, 45 badges, 5 certificate tiers and one PQC sandbox page \[A\]. There are no lesson-level units: each module is a list of 6–14 short sections.

### 1.1 Assets at a glance

| Asset | Count | Where | Notes |
| --- | --- | --- | --- |
| Tracks | 4 (A Foundations, B Engineering, C Specialist, D Enterprise) | `curriculumData.ts`, `content/Course` | Single linear path A→B→C→D, decided 2026-09-06 \[A\] |
| Modules | 36 (A 8, B 11, C 11, D 6) | same | Track D codes are E1–E6, not D1–D6 \[A\] |
| Sections ("topics") | 343 | `sections[]` per module | 1–3 paragraphs each; no lessons, no per-section objectives \[A\] |
| Module quizzes | 36 / 183 questions | `quizzesData.ts`, `content/Quizzes` | 5 questions each, A8 has 8; no difficulty, skill or objective tag per question \[A\] |
| Diagnostic assessment | 10 questions, 4 domains | `assessmentData.ts` | 2–3 questions per domain; reused for Reassessment \[A\] |
| Escape-room labs | 7 single-decision scenarios | `content/Labs/escape_room_scenarios.json` | 3 still point to removed id `module_3_pqc_mitigation` \[A\] |
| Missions | 2 built (BB84 → C6, Enterprise PQC Migration → E5); 3 specified, unbuilt | `content/Mission` | Mission spec says not every module gets one \[A\] |
| Practical assessments | 35 described in module wrap-ups | module markdown | Prose only; no submission, rubric or grading path exists \[A\] |
| Capstones | 4 (one per track; Track C offers 3 options) | track overviews | No rubric, artefact spec or reviewer \[A\] |
| Interactive specs | 41 "Interactive/Visual Requirement" callouts | module markdown | Specs for UI, mostly unbuilt; one sandbox page exists \[A\] |
| Badges | 45 (36 module, 4 capstone, 5 lab) | `badgesData.ts` | Escape-room badge names collide with module badges \[A\] |
| Certificates | CQF, CQSE, QCE/PQC-E/QNE, QSA, PQCTP | `badgesData.ts`, badges md | PQCTP depends on an undefined "Shared Professional Core" \[A\] |
| Bridge modules | 0 of 8 planned | Master index | Explicitly "not yet built" \[A\] |
| Placement diagnostic (8 domains) | Not built | Master index | Explicitly "not yet built" \[A\] |

### 1.2 Module inventory

Minutes, XP and the frontend prerequisite come from `curriculumData.ts`; the content prerequisite comes from the module markdown; words are the rendered section text.

| Code | Module | Level | Min | Words | Content prerequisite | Frontend prerequisite | Diagnostic domain tag | Backend topic | Quiz Qs | Practice attached |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Computing Foundations | Beginner | 120 | 391 | none | none | Cybersecurity Fund. | practical\_security | 5 | — |
| A2 | Mathematics Foundations | Beginner | 150 | 283 | A1 recommended | A1 | Cybersecurity Fund. | quantum\_fundamentals | 5 | — |
| A3 | Networking Foundations | Beginner | 130 | 435 | none stated | A2 | Cybersecurity Fund. | practical\_security | 5 | — |
| A4 | Cybersecurity Foundations | Beginner | 130 | 324 | A3 recommended | A3 | Cybersecurity Fund. | practical\_security | 5 | — |
| A5 | Cryptography Foundations | Beginner | 140 | 421 | A4 recommended | A4 | Cryptography Fund. | classical\_crypto | 5 | — |
| A6 | Quantum Foundations | Beginner | 140 | 392 | A2, A5 recommended | A5 | PQC Fund. | quantum\_fundamentals | 5 | Escape 4 |
| A7 | First Quantum Programming | Beginner | 150 | 404 | A1, A6 | A6 | PQC Fund. | quantum\_fundamentals | 5 | Mission (planned) |
| A8 | PQC Mitigation | **Intermediate** | 110 | 1162 | `module_2_quantum` (deleted) | A7 | PQC Fund. | pqc | 8 | Escapes 1–3 (old id) |
| B1 | Advanced Math for Quantum | Intermediate | 160 | 292 | A2 | A8 | PQC Fund. | quantum\_fundamentals | 5 | — |
| B2 | Quantum Information | Intermediate | 150 | 354 | B1 | B1 | PQC Fund. | quantum\_fundamentals | 5 | — |
| B3 | Quantum Algorithms | Intermediate | 180 | 462 | B1, B2 | B2 | PQC Fund. | quantum\_fundamentals | 5 | — |
| B4 | Quantum Programming | Intermediate | 170 | 385 | A7, B3 | B3 | PQC Fund. | quantum\_fundamentals | 5 | — |
| B5 | Quantum Hardware | Intermediate | 140 | 458 | B2 recommended | B4 | PQC Fund. | quantum\_fundamentals | 5 | — |
| B6 | Network & Security Engineering | Intermediate | 150 | 427 | A3, A4 | B5 | Cybersecurity Fund. | practical\_security | 5 | — |
| B7 | Advanced Cryptography | Intermediate | 160 | 502 | A5 | B6 | Cryptography Fund. | classical\_crypto | 5 | — |
| B8 | Quantum Threats | Intermediate | 140 | 378 | B3, B7 | B7 | PQC Fund. | pqc | 5 | Escape 5 |
| B9 | PQC Fundamentals | Intermediate | 150 | 428 | B8 | B8 | PQC Fund. | pqc | 5 | — |
| B10 | PQC Standards | Intermediate | 130 | 279 | B9 | B9 | PQC Fund. | pqc | 5 | — |
| B11 | Intermediate PQC Labs | Intermediate | 200 | 379 | B10 | B10 | PQC Fund. | pqc | 5 | Lab prose only |
| C1 | Advanced Quantum Information | Advanced | 170 | 335 | B2 | B11 | Applied PQC | quantum\_fundamentals | 5 | — |
| C2 | Advanced Quantum Algorithms | Advanced | 190 | 458 | B3, C1 | C1 | Applied PQC | quantum\_fundamentals | 5 | Mission (planned) |
| C3 | Quantum Error Correction | Advanced | 180 | 450 | C1, B5 | C2 | Applied PQC | quantum\_fundamentals | 5 | — |
| C4 | Quantum Networking | Advanced | 150 | 401 | C1, B6 | C3 | Applied PQC | practical\_security | 5 | — |
| C5 | Quantum Communications | Advanced | 140 | 337 | C4 | C4 | Applied PQC | practical\_security | 5 | — |
| C6 | Quantum Key Distribution | Advanced | 160 | 597 | C5 | C5 | Applied PQC | pqc | 5 | Mission: BB84 |
| C7 | Advanced Cryptography | Advanced | 170 | 388 | B7 | C6 | Applied PQC | pqc | 5 | — |
| C8 | PQC Mathematics | Advanced | 190 | 456 | B9, C7 | C7 | Applied PQC | pqc | 5 | — |
| C9 | PQC Implementation Engineering | Advanced | 200 | 394 | C8, B11 | C8 | Applied PQC | pqc | 5 | — |
| C10 | PQC Attack Surface | Advanced | 180 | 567 | C9 | C9 | Applied PQC | pqc | 5 | Escape 6 |
| C11 | PQC Defense Engineering | Advanced | 190 | 567 | C10 | C10 | Applied PQC | pqc | 5 | Mission (planned) |
| E1 | Quantum Risk Management | Enterprise | 130 | 278 | Track B or B8 knowledge | C11 | Applied PQC | practical\_security | 5 | Escape 7 |
| E2 | Cryptographic Discovery | Enterprise | 140 | 344 | E1 | E1 | Applied PQC | practical\_security | 5 | — |
| E3 | Quantum Readiness Assessment | Enterprise | 140 | 271 | E2 | E2 | Applied PQC | pqc | 5 | — |
| E4 | Crypto-Agility | Enterprise | 130 | 342 | E3 | E3 | Applied PQC | practical\_security | 5 | — |
| E5 | Enterprise PQC Migration | Enterprise | 160 | 412 | E4 | E4 | Applied PQC | pqc | 5 | Mission: migration |
| E6 | Governance | Enterprise | 130 | 460 | E5 | E5 | Applied PQC | practical\_security | 5 | Capstone in text |

### 1.3 Where the inventory contradicts itself \[A\]

- `MASTER_CURRICULUM_INDEX.md` calls Track A "7 modules" in its heading and lists 8; `00_track_a_overview.md` lists 7 and awards CQF on "all 7 module quizzes".
- `A8_pqc_mitigation.md` still declares `module_id: module_3_pqc_mitigation`, title "Module 3", Level Intermediate, and prerequisite `module_2_quantum`, which no longer exists. The index says the rename is complete.
- The index references `course/module_1_basics.md` and `module_2_quantum.md` "kept for reference"; neither file exists on disk. Index paths are lower-case (`course/track-a-foundations/`) while the repo uses `Course/Track-A-Foundations/`.
- Track B's overview still describes a "3-module core track most Q-CAPS users complete", which was removed.
- The badges file promises "all 5 track certificates" for `Full Program Graduate`; there are 4 tracks plus PQCTP.
- Eleven learner-facing sentences name the development team ("Inba's scanner engine", "your teammates").

## 2. Reference-library inventory

The six references cover classical crypto, PQC theory, PQC standards and enterprise migration well, but none covers quantum computing practice (Qiskit appears once across all six), QKD protocols in depth, or cybersecurity fundamentals such as networking and incident response. No module currently cites any of them \[A\].

| Source | Type and depth | What it explicitly covers \[A\] | Best Q-CAPS fit \[B\] | Cautions |
| --- | --- | --- | --- | --- |
| Paar, Pelzl & Güneysu, *Understanding Cryptography* 2nd ed., 2024 | University textbook, 14 chapters with problems | Modular arithmetic, stream ciphers (ChaCha, Salsa20, Trivium), DES/AES and Galois fields, block-cipher modes, public-key number theory, RSA incl. padding, KEM and attacks, DLP/Diffie–Hellman/Elgamal, elliptic curves, signatures (RSA, DSA, ECDSA), SHA-2/SHA-3, PQC (lattice, code, hash, standardization), MACs/HMAC, key management, KDFs, PKI | Primary spine for A5, B7, C7 and the math under B8; Ch 12 for B9 | Pre-dates FIPS 203–205 names in places (term search: ML-KEM 1 hit, ML-DSA 0) |
| Stinson, *A Tutorial on Post-quantum Cryptography*, slides, Aug 2025 | Graduate tutorial, 141 slides | Order- and period-finding (Shor), NIST process rounds 1–4, five NIST security categories, Lamport/Winternitz/Merkle signatures, linear codes, McEliece, Niederreiter, ISD, BIKE, HQC, lattices, LLL, LWE, Regev, LPR, Ring-LWE, NTRU, Kyber/Dilithium, Oil-and-Vinegar, isogenies, the additional-signature on-ramp | Primary source for B9, C8 and the standards status in B10 | Most current source in the library; states HQC selected 11 Mar 2025, SIKE broken Aug 2022, 14 additional signature candidates in Round 2 (Oct 2024) |
| NIST FIPS 203 (ML-KEM) | Normative standard, 56 pp. | K-PKE, NTT, sampling, internal algorithms, ML-KEM KeyGen/Encaps/Decaps, parameter sets ML-KEM-512/768/1024, differences from CRYSTALS-Kyber | Normative anchor for B10 and C9 | FIPS 204 and 205 are not in the library; B10 and C9 depend on them |
| Arun, Harishankar & Rjaib, *Becoming Quantum Safe*, Wiley 2025 | Business/practitioner book, 9 chapters | Quantum basics for leaders, crypto primer for business, ML-KEM/ML-DSA/SLH-DSA sizes, QKD/QRNG contrast, quantum risk framework, discovery and inventory, CBOM, risk heat map, 5-level Quantum-Safe Readiness Maturity Model, transition roadmap, pitfalls, global guidance (CNSA 2.0, NIST, ENISA), crypto-agility framework, role-tiered crypto-awareness training, case studies | Primary source for Track D (E1–E6), the readiness model, and learner personas | Vendor-authored (IBM); case studies are illustrative, not independent evidence |
| Takagi et al. (eds.), *Mathematical Foundations for PQC*, Springer | Research collection, 22 papers | Quantum walks, Shor for binary ECDLP, quantum GRS cryptanalysis, RSA key recovery from noisy GCD side channels, fault attacks on UOV, Gröbner bases, parallel DeepBKZ lattice reduction, MP-LWE, Ring-LWE/NTRU attacks, UOV variants, isogeny attacks, expander-graph hashes, hash-based signature improvements | Optional research-depth readings for C2, C8, C10 | Far beyond the current Track C depth; isogeny and multivariate material is mostly non-standardized |
| Om Pal et al. (eds.), *Cyber Security Using Modern Technologies* | Edited volume, 16 chapters | Quantum computing overview, post-quantum signatures, modern network security, smart-grid AMI and blockchain, group key distribution, AI for security, cloud risk-assessment models, threat-intelligence generation, CPS energy security, ML intrusion detection, network forensics, encrypted-traffic classification | Ch 2 supports B9; Ch 4, 9, 12, 13 could feed A4/B6 or electives | Pre-FIPS naming (ML-KEM 0 hits); uneven chapter quality; mostly outside the PQC core |

**Coverage blind spots across the whole library \[B\].** No source in the library teaches: Qiskit or quantum programming (A7, B4), quantum hardware platforms (B5), QKD protocols such as BB84/E91 (C6 and the BB84 mission; BB84 appears 3 times, all in passing), quantum error correction codes (C3), networking and OS fundamentals (A1, A3), incident response and IAM (A4, B6), or TLS 1.3 and hybrid key exchange internals (B6, B11). These modules currently have no source backing in the project library \[C\].

## 3. Coverage map by knowledge area

Quantum theory and PQC are covered at three or four depths each, while symmetric crypto, number theory, key derivation and hands-on security practice are thin or absent. "Depth" below is \[B\], judged from section text; "Library support" is \[A\].

| Knowledge area | Where in Q-CAPS | Depth today \[B\] | Library support | Status |
| --- | --- | --- | --- | --- |
| Computing, Python, Git, Linux | A1 | Survey, 8 sections in 391 words | None | Thin |
| Algebra, probability, complex numbers, linear algebra | A2 → B1 | Survey → formal outline | None for quantum math | Thin; B1 restates A2 topics |
| Number theory, groups, finite fields | C7.1–7.3 only | Outline | Paar Ch 1, 4.3, 6.3, 8.2 | **Misplaced** — needed by A5/B7/B8, taught after them |
| Networking (OSI, TCP/IP, DNS, routing) | A3 → B6 | Survey → engineering outline | Om Pal Ch 4 (partial) | Adequate outline, no labs |
| Security fundamentals (CIA, IAM, threats, IR, risk) | A4, part of B6 | Survey | Om Pal Ch 4, 9, 13 (partial) | Thin; no threat modelling method, no secure coding |
| Symmetric ciphers, modes, AEAD, stream ciphers | A5.2, C7.4 | One paragraph each | Paar Ch 2–5 | **Gap** — no modes/AEAD/ChaCha anywhere before Track C |
| Hashes, MACs, KDFs, randomness | A5.3–5.4, C7.5, C7.10 | Outline | Paar Ch 2.2, 11, 13, 14.2 | Gap — no KDF/HKDF, RNG only in Track C |
| RSA, DH, ECC, signatures | A5, B7, C7 | Three passes, none with worked math | Paar Ch 6–10 | Repetitive, shallow |
| PKI, certificates, TLS, SSH, VPN, HSM | A5.9–5.10, B6.5–6.6, B7.5–7.10 | Two overlapping passes in Track B | Paar Ch 14 | Duplicated (B6 vs B7) |
| Quantum foundations (qubits, gates, circuits) | A6 | Survey | BQS Ch 1, Stinson intro | Adequate for beginners |
| Quantum information theory | B2 → C1 | Outline → formal outline | None | Duplicated topics (density matrices, channels) |
| Quantum algorithms (Shor, Grover, QFT) | A8 → B3 → B8 → C2 | Four passes | Stinson §1, Paar Ch 12.1, Takagi | Fragmented across 4 modules |
| Quantum programming (Qiskit) | A7 → B4 | Hands-on described, not built | None | Unsupported by library |
| Quantum hardware, QEC | B5, C3 | Outline | None | Unsupported by library |
| Quantum networking, communications, QKD | C4, C5, C6 | Outline; one built mission | BQS Ch 3 (contrast only) | Duplicated C4/C5; thin sourcing |
| Quantum threat and timeline (HNDL, Mosca) | A8.3, B8, E1 | Three passes | Stinson (Threat Timeline Report 2024), BQS Ch 1, 4–5 | Mosca's inequality never named |
| PQC families (lattice, code, hash, multivariate, isogeny) | B9, C8 | Outline → math outline | Stinson §2–5, Paar Ch 12, Takagi | Isogeny absent; SIKE break not taught |
| PQC standards (FIPS 203/204/205, FN-DSA, HQC) | A8.5, B10 | Names only | FIPS 203, Stinson, BQS Ch 3 | **Stale** — no HQC, no Falcon/FN-DSA, no security categories |
| PQC implementation | B11, C9 | Lab descriptions | FIPS 203 | No runnable lab, no test-vector exercise |
| Implementation attacks and defence | C10, C11 | Outline (strongest Track C text) | Paar side-channel notes, Takagi fault/side-channel papers | Adequate outline |
| Hybrid key exchange and certificates | A8.6, B11.6, C10.10, C11.9 | Four passes | BQS Ch 5 | Fragmented |
| Crypto discovery, CBOM, inventory | B11.8, E2 | Outline | BQS Ch 4–5 (CBOM) | CBOM not named; scanner not linked |
| Readiness, maturity, risk scoring | E3 | Outline | BQS Ch 4 maturity model | No model chosen |
| Crypto-agility | A8.6, E4, C11.8 | Three passes | BQS Ch 8 | Fragmented |
| Migration, governance, compliance | E5, E6 | Outline | BQS Ch 5–7 (CNSA 2.0, NIST, ENISA) | No regulatory timeline content |
| AI/ML for security, CTI, forensics, OT/CPS | none | — | Om Pal Ch 8–13 | Out of scope unless decided \[C\] |

## 4. Gap analysis

The three structural problems are: the rendered path replaces the content's real prerequisite graph with a 36-step chain, the same concepts are re-taught in 3–4 places without a depth model, and nothing below the module level is mapped to skills or assessed.

### 4.1 Duplicated content

| Concept | Appears in | Type of overlap | Evidence |
| --- | --- | --- | --- |
| Shor, Grover, HNDL, NIST standards, hybrid, crypto-agility | A8 ↔ B8, B9, B10, B11, E4 | A8 is the old 3-module core course; B-track files still say "reinforcing core Module 3.5" | \[A\] |
| TLS, PKI, VPN | A5.9–5.10, B6.4–6.6, B7.5–7.9 | B6 and B7 both teach TLS and PKI at "engineering depth" | \[A\] section titles |
| Density matrices, quantum channels, measurement | B2.3–2.5 ↔ C1.2–1.4 | Same topics, "formal" vs "advanced" | \[A\] |
| Teleportation, entanglement distribution, repeaters | C4.2–4.5 ↔ C5.1, 5.5, 5.6 | Same topics, "networking" vs "communications context" | \[A\] |
| QFT, phase estimation, Grover, Shor, quantum walks, complexity | B3 ↔ C2 | Same list at two depths | \[A\] |
| Tensor products, amplitudes | A6.5, A6.11 ↔ B1.6–1.7 | Conceptual then formal | \[A\]; acceptable spiral if intended \[B\] |
| Two "Advanced Cryptography" modules | B7 and C7 | Identical titles, different content | \[A\] |
| Discovery and inventory | B11.8 ↔ E2 ↔ E5.1–5.2 | Three passes | \[A\] |
| Badge names | Escape 5/6/7 vs B8/C11/E1 badges | `Threat Modeler`, `Defense Engineer`, `Risk Strategist` awarded by two triggers | \[A\] |

Some repetition is intentional spiral design \[B\]; the problem is that no file states the intended depth per pass, so authors cannot tell reinforcement from redundancy \[C\].

### 4.2 Prerequisites and sequencing

- **The rendered chain ignores declared prerequisites \[A\].** The frontend makes every module require only the one before it. Examples: B6 (network security) is locked behind B5 (quantum hardware); C7 (crypto) behind C6 (QKD); E1 (risk management, content prerequisite "Track B") behind all of Track C.
- **Enterprise learners must finish 30 technical modules first \[A→B\].** Track D's entry profile is architects and managers, and E1 needs only B8-level knowledge; the chain forces about 78 hours of A–C first.
- **Number theory arrives after it is used \[A\].** Modular arithmetic, groups, factoring and DLP are first taught in C7.1–7.2, yet A5 teaches RSA/DH, B7 their security, and B8 explains why Shor breaks them. Paar places this material in Ch 1 and 6, before RSA.
- **A8 sits at the wrong level \[A\].** It is labelled Intermediate, is 3× longer than any other Track A module, and teaches Shor, Grover and NIST standards before any quantum algorithm module (B3).
- **Quantum threat before quantum algorithms is defensible at awareness level only \[B\].** A8 and B8 both precede or straddle B3; B8 correctly requires B3.
- **B5 hardware before QEC is fine; C3 requires B5 and C1 \[A\]**, but the chain puts C2 between them for no stated reason.
- **A8's prerequisite `module_2_quantum` no longer exists \[A\].**
- **No prerequisite exists anywhere for scanner use \[B\]**, although the scanner performs DNS/TLS/port reconnaissance that needs A3/A4 ethics and authorization context.

### 4.3 Foundational gaps \[A unless noted\]

- Block-cipher modes, AEAD (GCM), stream ciphers (ChaCha20) — absent before C7 (Paar Ch 2, 5).
- Key derivation (HKDF/KDF) — absent everywhere, though hybrid KEM combiners depend on it (Paar Ch 14.2).
- RNG and entropy — only C7.10 and C11.3.
- RSA padding and KEM framing — only B7 ("padding"), yet A8 and B9 teach KEMs (Paar Ch 7.7–7.8).
- Modular arithmetic and finite fields — see 4.2.
- Security ethics, legal authorization and rules of engagement for scanning — absent \[B\].
- Threat-modelling method (e.g. STRIDE) and secure software practice — absent \[B\].

### 4.4 Advanced and currency gaps

- **Standards status is stale \[A, Stinson\].** B10 mentions a "fourth-round evaluation" generically. Stinson records HQC selected for standardization on 11 Mar 2025, FALCON selected in 2022, and 14 additional signature candidates in Round 2 since Oct 2024. None of these appear in Q-CAPS.
- **No NIST security categories (1–5) \[A\].** Stinson lists them; FIPS 203 parameter sets depend on them. Q-CAPS mentions ML-KEM-768 only in A8/B11.
- **FIPS 203 details absent \[A\].** K-PKE, NTT, implicit rejection and encapsulation-key checks are not covered in B10 or C9; C9 asks learners to "verify against official test vectors" without teaching what is checked.
- **Stateful hash-based signatures (XMSS/LMS, SP 800-208) absent \[A\].** Paar and BQS reference them.
- **Isogeny and the SIKE break absent \[A\].** Stinson and Takagi cover both; this is the clearest real-world lesson in why algorithm diversity matters.
- **Regulatory timelines absent \[A, BQS\].** CNSA 2.0 (2033 for national security systems in BQS) and the NIST/NSA 2035 horizon are not in E5/E6.
- **Mosca's inequality and CBOM never named \[A\].** BQS uses CBOM 21 times; E2 does not use the term.
- **Current status after Aug 2025 (FIPS 206 FN-DSA, HQC draft standard, NIST transition guidance) is outside the library \[C\]** — requires verification against nist.gov before authoring.

### 4.5 Disconnected modules

- **A2 Mathematics and B1** feed nothing measurable: tagged "Cybersecurity Fundamentals" and "PQC Fundamentals" respectively \[A\].
- **B5 Quantum Hardware, C3 QEC, C4/C5 networking** have no link to any cryptographic decision, mission or readiness factor \[B\].
- **E2 Cryptographic Discovery does not reference the Q-CAPS scanner** although the scanner performs TLS/algorithm discovery \[A\].
- **The PQC sandbox page is linked to no module** and uses the pre-standard name "Kyber" \[A\].

### 4.6 Topics that belong together

- Number theory (C7.1–7.3) with A5/B7 public-key material \[B\].
- B6.5–6.6 TLS/PKI with B7.5–7.7 \[B\].
- C4 and C5 into one quantum networking and communications module \[B\].
- All hybrid material (A8.6, B11.6, C10.10, C11.9) as one progression with stated depths \[B\].
- E2 discovery with the scanner and B11.8 inventory lab \[B\].

### 4.7 Topics that should be separated

- A1 packs hardware, OS, Python, algorithms, Git and Linux into 391 words; Python and Linux are each multi-hour practical skills \[B\].
- A5 packs 11 primitives into 421 words, about 38 words per primitive \[A\].
- C2 combines Shor proofs with QML, VQE, QAOA and Hamiltonian simulation; only Shor/Grover bear on Q-CAPS's security purpose \[B\].
- Quantum-computing specialist content (C1–C3) versus PQC engineering (C7–C11) are two different careers inside one track \[B\].

### 4.8 Difficulty mismatches

- **Too advanced for position:** A8 (Shor, NIST standards in beginner track) \[A\]; A7.7 real-hardware runs at beginner level \[B\]; B3.9–3.11 quantum walks and complexity in an engineering track \[B\].
- **Too basic for position:** B1 re-lists A2 topics with "formal treatment" but 292 words \[A\]; E1 explains HNDL again after A8 and B8 \[A\]; C7 "Advanced Cryptography" is 388 words, shorter than A5 \[A\].

### 4.9 Terminology issues

- "Kyber" in the sandbox UI versus "ML-KEM" in modules \[A\].
- Track D codes `E1–E6` versus track id `track-d` \[A\].
- Level vocabulary: `Novice / Beginner / Intermediate / Advanced / Enterprise` in types; quiz difficulty uses `novice`; escape rooms use `professional` and `quantum_expert` \[A\].
- "PQC vs quantum cryptography" is taught in B9.1, but the diagnostic domain list puts all quantum modules under "PQC Fundamentals" \[A\].
- Sandbox animates RSA being cracked by a "4,096-qubit quantum simulator"; B8 and the escape-room text say thousands of *logical* qubits are needed, an inconsistency that also risks overstating present capability \[A\].

### 4.10 Missing practical components

- 35 practical assessments and 4 capstones are described in prose with no submission, rubric or grader \[A\].
- Labs exist only as single-choice escape rooms (7) and two missions; Tracks A and B have no mission at all \[A\].
- No runnable code environment for Python (A1), Qiskit (A7/B4), or PQC libraries (B11/C9); a Pyodide sandbox is specified but not built \[A\].
- The scanner is not used as a teaching lab anywhere in the curriculum \[A\].

### 4.11 Missing assessments

- One 5-question quiz per module; at \~150 minutes per module that is one question per 30 minutes \[A\].
- 173 of 183 quiz answers are option B (94.5%), so a learner can pass every quiz by always choosing B \[A\].
- Answer keys ship to the browser in `quizzesData.ts` and `assessmentData.ts` \[A\].
- No pre/post test pairing, no item difficulty, no item–objective mapping, no question pools for retakes \[A\].
- No capstone or certificate assessment beyond quiz passes \[A\].

### 4.12 Missing skill mappings

- The only skill model is 4 diagnostic domains; the master index specifies 8 (Mathematics, Programming, Computing, Networking, Cybersecurity, Cryptography, Quantum, PQC) \[A\].
- Module `domain` tags are wrong for 18 of 36 modules by their own content: e.g. A2 Math → Cybersecurity, A6/A7/B1–B5 → PQC, all of Track C including QEC → Applied PQC \[A→B\].
- The backend collapses everything into 4 topics; `classical_crypto` has no recommendable course, and only 3 of 36 modules (A6, B9, E4) can ever be recommended \[A\].
- No learning objective, section or question carries a skill or competency id \[A\]. No external framework (NICE, SFIA, ENISA ECSF) is referenced \[C\].

## 5. Gamification, assessment, readiness and certification

XP, readiness and certificates are currently driven by evidence that is client-reported, guessable and partly double-counted, so none of them can yet support a research claim about capability \[A→B\].

### 5.1 How each mechanism works today \[A\]

| Mechanism | Where computed | Rule | Problem | Impact |
| --- | --- | --- | --- | --- |
| Module XP | Frontend `curriculumStore` | 120 (A), 160 (A8, B), 200 (C), 250 (D) once per passed module; total 6,460 | Independent of backend XP | Two XP totals can diverge |
| Quiz XP | Backend `/api/quizzes/submit` | 50 × `correct_answers` on every submission | Retakes re-award XP; count is client-supplied | XP is farmable |
| Quiz submission | Frontend → backend | Only passes sent; `correct_answers = round(score% × 10)`, `total_questions = 10`, `topic` = 1 of 4 buckets | Real question count, module id, failures and per-item answers are lost | Backend cannot reconstruct what was assessed |
| Scanner XP | Backend `/api/scanner/log` | 10 + 5 × vulnerabilities found | Rewards finding issues, not remediation or authorised scope | Incentive misaligned with security ethics |
| Readiness score | Backend profile endpoint | min(100, 0.7 × mean quiz % + 30 × min(XP, 1000) / 1000) | XP is 30% of readiness; no assessment ⇒ 0, not "unknown" | Measures engagement as capability |
| Skill profile | Frontend `skillsTypes.ts` | % correct per domain from 2–3 diagnostic items; ≥75 Strong, ≥50 Developing, else Needs Improvement | One item flips a level; no confidence or recency | Unstable gap estimates |
| Recommendation | Backend `recommendation.py` | Lowest quiz topic among 3 courses, boosted by scanner findings | 33 of 36 modules unreachable; classical crypto has no course | Recommendations cannot cover the curriculum |
| Badges | Frontend list, 45 | Quiz pass, lab, capstone triggers | Awarded client-side; 3 names duplicated by escape rooms | Badges are not verifiable |
| Certificates | Badges file | CQF/CQSE/QSA: all module quizzes ≥70% + capstone; Track C cert depends on capstone choice; PQCTP needs "Shared Professional Core" | Capstones have no rubric or submission; Shared Core undefined | Certificates have no assessable basis |

### 5.2 Readiness models available in the sources

- **Organisational readiness \[A, BQS Ch 4\].** The Quantum-Safe Readiness Maturity Model has 5 levels: Ad Hoc, Initial Awareness, Structured Planning (CBOMs, heat maps), Operational Integration (crypto-agility, PQC pilots, crypto metrics in SIEM), Optimized Resilience (automated inventory, high-risk PQC rollout done). It assesses discovery, strategy, migration, agility and monitoring.
- **Individual readiness \[C\].** No source defines a learner-level quantum-readiness model. Q-CAPS conflates the two today: E3 teaches organisational maturity, while the dashboard score is individual.
- **Role tiers \[A, BQS Ch 8\].** Training should be tiered by role: executives (business impact), legal/compliance (regulation), developers (APIs, standards, secure design), DevSecOps (deprecation response, CI/CD).

### 5.3 What is reusable \[B\]

- The 4-track ladder and certificate names are a reasonable credential scaffold once each certificate has a defined, server-graded assessment.
- The mission design (investigation loop, state variables, honest simulation rules in the BB84 mission) is the strongest assessment design in the repo and can serve as the template for performance-based items.
- The escape-room format works as low-stakes formative practice, not as evidence for badges or readiness.
- Backend separation of "not attempted" from a score of 0 in `recommendation.py` is the right principle and should extend to readiness and skills.

## 6. Open decisions and further research

Ten decisions must be settled before curriculum design starts; the first four change the shape of everything else. Each is \[C\].

### 6.1 Decisions

| # | Decision | Options | Evidence for each | Blocks |
| --- | --- | --- | --- | --- |
| D1 | Path structure | (a) keep single linear A→B→C→D; (b) prerequisite graph with role-based entry paths | (a) team decision 2026-09-06; (b) content's own prerequisites, Track D entry profile, BQS role tiers | Unlock logic, placement, recommendations |
| D2 | Unit of learning | Keep module = sections, or introduce module → lesson → objective | 343 sections have no objectives or assessment hooks | Skill mapping, item writing |
| D3 | Skill framework | Planned 8 domains; external framework (NICE, SFIA, ENISA ECSF); or Q-CAPS-specific competency list mapped to one | Master index lists 8 domains; no framework in sources | Diagnostic, readiness, recommendations |
| D4 | Capability levels | Adopt Unknown / Beginner / Developing / Proficient / Advanced with evidence thresholds | Project instructions; current 3-level % bands | Skill profile, readiness |
| D5 | Track C scope | Split into Quantum Computing and PQC Engineering specialisations, or trim quantum theory to security-relevant depth | C1–C3 vs C7–C11 serve different careers; certificates already split QCE/PQC-E/QNE | Track C size, capstones |
| D6 | Depth policy for repeated topics | Declare a depth per pass (aware / explain / apply / analyse) or remove repeats | Section 4.1 duplications | Merge/split of A8, B6/B7, B2/C1, C4/C5, B3/C2 |
| D7 | Peripheral scope | Include or exclude AI for security, CTI, forensics, OT/CPS, blockchain | Om Pal Ch 5, 8–13 | Number of electives |
| D8 | Individual vs organisational readiness | Separate learner readiness from org maturity (BQS 5-level model) or blend | Section 5.2 | Dashboard, E3, Organization page |
| D9 | Scanner as curriculum lab | Use scanner results on authorised/owned targets as E2/B11 lab evidence | Scanner exists; no module links it | Practical assessment, readiness evidence |
| D10 | Bridge modules and placement test | Build the 8 bridge modules and an 8-domain placement diagnostic, or rely on recommendations into existing modules | Master index: both "not yet built" | Entry points, test-out credit |

### 6.2 Research and verification required

- **Standards after Aug 2025:** current status of FIPS 204, 205, draft FIPS 206 (FN-DSA), the HQC standard, NIST transition timeline guidance, SP 800-227, and CNSA 2.0 dates. Verify on nist.gov and nsa.gov; the library ends at Stinson (Aug 2025).
- **Add normative texts to the library:** FIPS 204 and FIPS 205 at minimum; SP 800-208 for stateful hash signatures.
- **Missing source coverage:** choose references for quantum programming (Qiskit documentation), quantum hardware and QEC, QKD protocols (BB84/E91 and security proofs), TLS 1.3 and hybrid key exchange (IETF drafts/RFCs), networking and OS fundamentals.
- **Quantum threat estimates:** pick one cited source for resource estimates and timelines (Stinson cites the Quantum Threat Timeline Report 2024) and correct the sandbox "4,096-qubit" claim against it.
- **Learner population:** confirm the primary audiences (students, developers, security engineers, architects, executives) to size role paths.
- **Assessment design:** decide item counts per objective, question pools, answer-position balancing, server-side grading, and pre/post pairing needed for the ASSESS → TRAIN → REASSESS → MEASURE research loop.

### 6.3 Housekeeping already identified (no decision needed)

- Fix A8's `module_id`, title, level and prerequisite; update the master index and Track A overview to 8 modules.
- Re-point escape rooms 1–3 from `module_3_pqc_mitigation` to `track_a_a8_pqc_mitigation`; rename duplicate badges.
- Remove development-team names from learner-facing text.
- Align level vocabulary and Track D codes.
- Rebalance answer positions in all 183 questions.
- Rename "Kyber" to ML-KEM in the sandbox and label it SIMULATION.
