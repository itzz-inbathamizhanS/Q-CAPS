# Book → Course Source Map and Content Implementation Plan

Prepared 2026-10-03 (analysis stage; no code or content changed). Builds on
`docs/SYSTEM_UNDERSTANDING.md`, `docs/Html/Q-CAPS Curriculum Architecture v1.md` and
`docs/Html/Q-CAPS Curriculum Inventory & Gap Analysis.md`. Where this document and those disagree,
this one was checked against the live code and dev database on the date above.

---

## 1. How the learning system actually works (verified)

```
Track (tracks)                      4 rows   = "course"; certificate + capstone live in tracks.meta
 └─ Module (modules)               36 rows   objectives, prerequisites, xp, domain, recommendation_topic
     ├─ Section (sections)         340 rows  = "lesson"; ordered list of typed blocks (JSON)
     │    blocks: text | code | callout | checkpoint | video | visual
     │    checkpoint answers are stripped before reaching the browser and graded server-side
     └─ Module quiz (quiz_modules / quiz_items)   36 quizzes, 183 items, server-graded attempts
Practical assets (not in the DB, compiled into the frontend bundle):
     escape rooms (content/Labs, 7)  single-decision scenarios, each linked to one module
     missions (content/Mission, 2)   BB84 (C6), enterprise migration (E5)
     visual components               only `tls-handshake` exists; 41 other visual blocks are
                                     design notes hidden from learners (kind "planned-interactive"/"simulation")
```

**Content pipelines (three, each with a different owner):**

| Pipeline | Source | Writes | Notes |
|---|---|---|---|
| `npm run content:compile` | `content/Course/*.md`, manifest, labs, missions, badges | `frontend/src/data/*.ts` | Validated; emits only text + visual blocks |
| `python -m course_content.import_curriculum` | `frontend/src/data/curriculumData.ts` | `tracks/modules/sections` | Hash-keyed; rows with `imported_hash = NULL` (admin edits) are left alone |
| `python seed_quizzes.py` | `content/Quizzes/**/*.json` | `quiz_modules/quiz_items` | Upsert by item id; never deactivates removed items |
| `python -m course_content.validate_pack` | book content pack JSON | nothing | Validator only. **No pack importer exists yet.** |
| Admin UI (`/admin`) | human edits | `sections` + `content_audit_log` | Role checked server-side |

**Progress:** section completion is server-authoritative (checkpoint passes or explicit completion).
Module completion, badges and certificates are still computed client-side in `curriculumStore`
(known open item, Phase 4 in the system report; not changed by this plan).

**Not present:** code execution of any kind, a lab/simulation/project entity, per-section source
citations (the pack format has `sources`, but the `sections` table has no column for them).

## 2. Audit findings relevant to content

| # | Finding | Evidence | Impact |
|---|---|---|---|
| C1 | Lessons are outlines, not lessons | 340 sections, 16,075 words total, median 44 words; 104 under 40 words | Learners cannot learn from the current text |
| C2 | Stale cross-references | 33 sections in 14 modules say "Reinforces core Module 1.2" etc. (old numbering) | Broken navigation in prose |
| C3 | Imprecise wording | A5 §5.5 describes signing as "hash + private key encryption" | Textbook shorthand that Paar also uses, but real RSA signatures use structured padding (RSA-PSS, Paar 10.2) and DSA/ECDSA cannot encrypt at all (Paar 10.4). **Fixed in the A5 pack.** |
| C4 | 41 visual blocks never render | kinds `planned-interactive` (34), `simulation` (7) have no component | "Simulations" promised in text do not exist |
| C5 | Only 1 checkpoint in 340 sections | block type counts | Almost no in-lesson practice; section completion is click-through |
| C6 | Quizzes are thin | 35 quizzes × 5 items, 1 × 8 | Too few items for per-competency capability estimates |
| C7 | No pack importer | `validate_pack.py` writes nothing | Book-sourced content has no path into the DB |
| C8 | Citations cannot be stored | no `sources` column | Book references would be lost on import |
| C9 | Quiz seed cannot retire items | `seed_quizzes.seed` only upserts | Replacing a question in place would change the meaning of past responses |
| C10 | No placeholder text found | grep for lorem/TODO/coming soon/dummy in content and `src` | — |

Baseline checks (2026-10-03): backend pytest **147 passed**; `tsc -b` **0 errors**;
`test:content` **23/23**; `content:check` **passed**. Dev DB fingerprint unchanged by the tests.

## 3. Source inventory

Text was extracted locally with `pdftotext -layout` for searching; nothing from the books is stored
in the repository. Locators below are chapter/section numbers from each book's own table of contents.

| ID | Source | Type / currency | Use in Q-CAPS | Limits |
|---|---|---|---|---|
| B01 | Paar, Pelzl & Güneysu, *Understanding Cryptography*, 2nd ed., Springer 2024 (ISBN 978-3-662-69007-9) | Undergraduate textbook, 14 chapters | Primary spine for symmetric crypto, public key, hashes, MACs, key management, PQC intro | PQC status stops at the 2022 selections; uses Kyber/Dilithium names (1 mention of ML-KEM) |
| B02 | Boneh & Shoup, *A Graduate Course in Applied Cryptography*, v0.6, Jan 2023 (`book.pdf`) | Graduate text, 23 chapters, security definitions and proofs | Security notions (CPA/CCA/AE), ChaCha, GCM, TLS 1.3 record and handshake, AKE/forward secrecy, password storage, Lamport/Winternitz, quantum attacks on factoring/DL | Ch 17 (lattice PQC) is a 3-page placeholder in v0.6; no NIST PQC names at all |
| B03 | Stinson, *A Tutorial on Post-quantum Cryptography*, slides, 11 Aug 2025 | Graduate tutorial, 141 slides | Order/period finding, NIST process and security categories, hash-based, code-based, lattices (LWE, Ring-LWE, NTRU, Kyber/Dilithium), multivariate, isogenies (SIKE break) | Slides: terse, need expansion; most current book source |
| B04 | NIST FIPS 203, *ML-KEM*, 13 Aug 2024 | Normative standard | ML-KEM KeyGen/Encaps/Decaps, K-PKE, NTT, parameter sets, implementation requirements | Covers ML-KEM only |
| B05 | Arun, Harishankar & Rjaibi, *Becoming Quantum Safe: Protect Your Business and Mitigate Risks with Post-Quantum Cryptography and Crypto-Agility*, Wiley (copyright page says 2026) | Practitioner/business book, 9 chapters | Track D: risk framework, heat maps, maturity model, discovery and CBOM, transition roadmap, pitfalls, global guidance, crypto-agility, role-based training | Vendor-authored (IBM); case studies are illustrative, not independent evidence |
| B06 | Om Pal et al. (eds.), *Cyber Security Using Modern Technologies*, CRC Press 2024 | Edited volume, 16 chapters, uneven | Ch 2 (PQ signatures, pre-FIPS names), Ch 4 (network security), Ch 13 (network forensics); Ch 8–12 out of v1 scope | Pre-FIPS naming only; chapter quality varies; use for context, not as sole authority |
| B07 | Takagi et al. (eds.), *Mathematical Foundations for Post-Quantum Cryptography*, Springer 2026, open access (ISBN 978-981-96-1218-5) | Research papers and surveys | Track C only: Shor for binary ECDLP (survey), BKZ/lattice reduction, UOV fault attacks, isogeny attack survey, hash-based signature improvements, Ring-LWE/NTRU attacks | Research level; cite as advanced/further reading, not as core lesson spine |

### Official sources checked on the web (2026-10-03)

| Fact | Status found | Source |
|---|---|---|
| FIPS 203 / 204 / 205 | Final, published 13 Aug 2024 | csrc.nist.gov/publications/fips |
| Falcon (FN-DSA) and HQC | "selected for ongoing standardization; that process is underway"; no FIPS 206/207 page found | csrc.nist.gov/projects/post-quantum-cryptography |
| HQC selection date | 11 Mar 2025 | same page; agrees with B03 |
| NIST IR 8547 (transition timeline) | Still Initial Public Draft (12 Nov 2024) | csrc.nist.gov/pubs/ir/8547/ipd |
| SP 800-227 (KEM recommendations) | Final, Sep 2025 | csrc.nist.gov/pubs/sp/800/227/final |
| Additional signature schemes | Round 2 | NIST PQC project page |
| Hybrid ML-KEM in TLS (`draft-ietf-tls-ecdhe-mlkem`) | Internet-Draft rev 05 (Aug 2026), intended Proposed Standard, not an RFC | datatracker.ietf.org |
| TLS 1.3 | RFC 9846 (obsoletes RFC 8446) | datatracker (referenced by the existing pilot block) |

Web search was unavailable in this session (tool error); pages were fetched directly. Any lesson
that states a standard's status must carry the check date and be re-checked at publish time.

### Reconciliation rules

| Disagreement | Cause | Rule for lessons |
|---|---|---|
| B01/B06 say Kyber, Dilithium, SPHINCS+, Falcon; FIPS uses ML-KEM, ML-DSA, SLH-DSA, FN-DSA | Renaming at standardization (2024) | Teach FIPS names; mention the submission name once as history. FIPS 203 Appendix C lists the changes from CRYSTALS-Kyber, so ML-KEM ≠ Kyber round 3 byte-for-byte |
| B01 "four schemes selected" (2022) vs today | Book predates 2024–2025 decisions | Use NIST status table above, dated |
| B02 Ch 17 placeholder | Draft book version | Use B03 + B04 for lattices; B02 only for definitions |
| B05 deadlines and guidance | Guidance documents change | State as "B05 reports …", plus `needs_verification` until checked against the issuing body |
| IR 8547 dates (2030 deprecate / 2035 disallow) | Draft, not final | Present as "proposed in a draft NIST report", never as a rule |

## 4. Book → module map

Display codes are today's. "Add" lists what the books support; practical items are proposals
(see §5 for how each is delivered). ✱ = no book coverage; needs official documentation (§6, Wave 2).

### Track A — Foundations

| Module | Books (chapter/section) | Add | Practical |
|---|---|---|---|
| A1 Computing ✱ | none | Keep; fix stale refs only in Wave 1 | Python/Git/Linux exercises from official docs (Wave 2) |
| A2 Mathematics | B01 1.4, 6.3; B02 App. (algebra) | Modular arithmetic, gcd/EEA, primes, modular inverse, binary/XOR | Code: EEA and fast exponentiation in Python; sim: modular clock |
| A3 Networking ✱ | B02 21.10 (TLS session setup, for 3.7 only) | Keep TLS pilot; rest Wave 2 | Packet capture lab (Wireshark docs) |
| A4 Cybersecurity | B02 18.3–18.8 (passwords, salts, slow hashes, OTP, challenge-response); B06 Ch 4 | Password storage, authentication factors, threat basics | Code: salted slow hashing with `hashlib.scrypt`; checkpoint: rainbow tables vs salt |
| A5 Cryptography | B01 1–5, 10, 11, 13, 14.2; B02 2–3, 5, 6, 8, 9 | Kerckhoffs, OTP and perfect secrecy, stream vs block, AES overview, modes (ECB pitfalls, CTR, GCM), AEAD, nonces, hashes, HMAC, KDFs; **fix C3** | Code: AES-GCM and HMAC with `cryptography`; sim: ECB-penguin-style pattern leak (text, no image copying); checkpoints per section |
| A6 Quantum | B05 Ch 1; B03 §1 intro | Qubits, superposition, measurement, why Shor/Grover matter (conceptual) | Existing escape room 4 |
| A7 First quantum programming ✱ | none | Wave 2 (Qiskit docs) | Simulator exercise |
| A8 PQC Mitigation | B05 1, 3, 4; B03 §1; B01 12.1 | HNDL, Mosca's inequality, Shor vs Grover impact, standards named with dates | Sim: Mosca calculator; existing escape rooms 1–3 |

### Track B — Intermediate

| Module | Books | Add | Practical |
|---|---|---|---|
| B1 Advanced math | B01 4.3 (GF(2^8)), 6.3, 8.2 (groups), 9.1; B03 §4 (lattice basics) | Groups, finite fields, polynomial rings, lattice intuition | Code: GF(2^8) multiply; sim: 2-D lattice / short vector |
| B2–B5 quantum ✱ | B03 §1 (order/period finding) for B3 only | B3: period finding → Shor reduction | B4/B5 Wave 2 |
| B6 Network & security engineering | B02 21 (AKE, forward secrecy, TLS 1.3 handshake), 9.8 (TLS record); B01 14.5 (PKI); B06 Ch 4, 13 | TLS 1.3 handshake end-to-end, PFS, certificates and chains, revocation | Lab: inspect a TLS handshake of an owned host with `openssl s_client` (version-pinned); existing `tls-handshake` visual |
| B7 Advanced cryptography | B01 6–10, 14; B02 10–13, 15, 19.3 | RSA (keygen, padding OAEP/PSS, KEM), DH/ECDH, ECC, signatures (RSA-PSS, ECDSA, nonce reuse), key lifecycle | Code: toy RSA with small numbers + why textbook RSA fails; ECDSA nonce-reuse explanation; checkpoints |
| B8 Quantum threats | B02 16.5; B03 §1; B01 12.1; B05 1, 4 | What Shor breaks (RSA, DH, ECC), Grover and symmetric keys, resource-estimate reasoning | Sim: "what breaks" matrix; existing escape room 5 |
| B9 PQC fundamentals | B03 §2–5; B01 12.2–12.4; B02 14 | Families: lattice (LWE), code (McEliece), hash (Lamport, Winternitz, Merkle), multivariate, isogeny + SIKE break | Code: Lamport one-time signature in Python (hashlib only); sim: toy LWE |
| B10 PQC standards | B04 (whole); B03 §1 (NIST process, categories); B05 3 | ML-KEM/ML-DSA/SLH-DSA, parameter sets, security categories, FN-DSA/HQC status (dated), KEM vs KEX | Checkpoints on parameter-set choice |
| B11 Intermediate PQC labs | B04 3.3, 7, 8; B05 4–5 (CBOM) | Hybrid key exchange concept, crypto inventory | Lab: ML-KEM round trip with a named library version; lab: authorised scan → CBOM-style inventory (uses existing scanner, owned target only) |

### Track C — Advanced

| Module | Books | Add |
|---|---|---|
| C1–C3 ✱ | B07 (quantum walks) for C2 further reading only | Wave 2 |
| C4–C6 ✱ | none (BB84 only in passing) | Wave 2; keep BB84 mission |
| C7 Advanced cryptography | B02 2, 5, 9, 12 (semantic security, CPA, AE, CCA, FO-style transforms); B01 7.8 | Security games explained without proofs; why ML-KEM uses an FO transform (B04 §6) |
| C8 PQC mathematics | B03 §4 (LWE, Regev, LPR, Ring-LWE, NTRU), §3 (codes, ISD); B07 (BKZ, Ring-LWE/NTRU attacks) | Hardness assumptions, parameters vs attacks |
| C9 PQC implementation | B04 2.4, 4 (NTT, sampling), 5–7, 3.3 (requirements) | Read the FIPS pseudocode; NTT; implicit rejection; input checks |
| C10 PQC attack surface | B07 (UOV fault attack, isogeny attacks); B02 7.7 (timing attacks); B01 side-channel notes | Side channels, fault attacks, decryption-failure attacks |
| C11 PQC defense | B04 3.3; B01 14.6 | Constant-time code, KAT testing, validation |

### Track D — Enterprise (all primarily B05)

| Module | B05 chapters | Practical |
|---|---|---|
| E1 Quantum risk management | Ch 4 (risk framework, heat maps) | Sim: risk heat map / Mosca exercise |
| E2 Cryptographic discovery | Ch 4–5 (discovery, inventory, CBOM) | Lab: authorised scan → inventory |
| E3 Readiness assessment | Ch 4 (maturity model) | Self-assessment worksheet (labelled as organisational maturity, separate from learner readiness) |
| E4 Crypto-agility | Ch 8 | Code: algorithm-agnostic interface design exercise |
| E5 Enterprise migration | Ch 5–6 (roadmap, pitfalls; DB2 case study labelled as vendor case) | Existing mission |
| E6 Governance | Ch 7 (global guidance), 8 | Dated guidance table with `needs_verification` |

**Out of v1 scope (per Architecture D7):** B06 Ch 3, 5, 7–12, 14–16; B02 Ch 20, 22, 23; B07 papers on
Rabi models, Farey fractals, layer-2 protocols, PIR.

## 5. Delivery design (reuses existing architecture)

| Need | Delivered as | New code required |
|---|---|---|
| Lesson text, examples, mistakes, takeaways | `text` + `callout` blocks in sections | none |
| Knowledge checks | `checkpoint` blocks (server-graded, already supported) | none |
| Code examples | `code` blocks: complete, runnable locally, library + version stated, expected output shown | none |
| Code exercises | Section with task, starter code, expected output and a checkpoint on the result. No in-browser execution (none exists; see decision D3) | none |
| Labs | A section titled "Lab: …" with a fixed structure: objective, prerequisites, setup, steps, expected output, verification checkpoint, troubleshooting, cleanup | none |
| Simulations | New React components registered in `visualRegistry.ts`, each labelled SIMULATION, with reset, explanation and a checkpoint after it | yes, one component each |
| Projects | Existing capstones (track `meta`) expanded with problem, tasks, deliverables, rubric | none for text; rubric display may need a small UI change |
| Citations | `sources` per section, shown as "References" under the lesson | yes (column + importer + UI) |
| Module quizzes | New items added to `content/Quizzes/*.json` with new ids, 8–12 per module | small seed change to retire items |

### Infrastructure tasks (do first; security/data-integrity sensitive)

1. **I1 Pack importer** `course_content/import_pack.py`: validate with `validate_pack`, then create/replace
   sections by slug inside one transaction; preserve section ids and slugs on `replace` so existing
   checkpoint passes and completions keep their keys; write `content_audit_log` rows; mark rows with a
   `pack:<sha256>` hash so `import_curriculum` will not overwrite them, and make `import_curriculum`
   skip `pack:` rows. Tests: idempotency, replace keeps ids, curriculum re-import does not clobber, invalid pack writes nothing.
2. **I2 Section sources**: nullable `sources` JSON column (+ `ensure_schema` migration), included in the
   public section payload, rendered as a References list in `SectionLesson`. Tests: API includes sources; checkpoint keys still stripped.
3. **I3 Quiz item retirement**: support `"active": false` in quiz JSON; seed sets it; attempts draw only active items. Existing items are never rewritten in meaning. Tests.
4. **I4 Pack validator update**: allow `visual` blocks whose `kind` is in a shared list of built components; allow 3–12 quiz items for modify packs (validator currently requires 5–12).
5. **I5 Simulation components** (one at a time, each with a unit test of its model): `modular-clock`, `mosca-inequality`, `toy-lwe`, `lamport-signature`, `risk-heatmap`. Each must state what is simplified.

### Bulk content (repetitive; suited to the implementation model)

One pack file per module under `content/packs/`, validated with `validate_pack`, imported with I1.
Per module: replace the existing outline sections (keep slugs `sec-N`), fix C2/C3, 150–400 words per
section, at least one checkpoint per section, code where §4 lists it, 1–2 labs where listed, 3–7 new quiz items.

**Wave 1 (book-backed, in this order):** A5 → A2 → A4 → A8 → B7 → B6 → B8 → B9 → B10 → B11 → B1 → C7 → C8 → C9 → C10 → C11 → E1 → E2 → E3 → E4 → E5 → E6.
**Wave 2 (official documentation only, flagged ✱):** A1, A3, A6, A7, B2–B5, C1–C6. Each section's
sources are official docs or RFCs with access dates; no book citations invented.

## 6. Decisions needed before implementation

| # | Decision | Default if not answered |
|---|---|---|
| D1 | Commit the current uncommitted work (112 files on `handoff/server-quizzes`, tests green) before content work starts, so content changes are reviewable separately | Yes: commit as-is on this branch, then branch `content/book-packs` |
| D2 | Apply the Architecture v1 restructure now (split A5 → new `track_a_a5p_public_key_pki`, renumber display codes, merge C4/C5)? | No: fill existing modules first; restructure later. A5 keeps its public-key sections |
| D3 | Code exercises: view-and-run-locally only, or add in-browser Python (Pyodide, client-side, not authoritative)? Server-side execution is not recommended | View and run locally |
| D4 | Wave 2 modules (no book coverage): author from official docs now, or leave as-is and mark "not yet sourced"? | Wave 1 first; Wave 2 after the audit |
| D5 | Scope per session: all of Wave 1 (22 modules), or a vertical slice first (A5 complete with lab, simulation, quiz) reviewed in the browser before the rest | Vertical slice (I1–I3 + A5) first, then the rest of Wave 1 |

## 8. Implementation status (updated 2026-10-03)

| Item | State |
|---|---|
| I1 pack importer (`course_content/import_pack.py`) | Done, 21+ tests |
| I2 section citations (column, API, References list) | Done |
| I3 quiz retirement (`active: false`, `retire_quiz_items`) | Done |
| I4 validator: built visuals only, new-quiz-item rules | Done |
| `hash-avalanche` visual (real SHA-256 in the browser) | Done, 5 tests |
| Pack A5 Cryptography (15 lessons, lab, +10 quiz items) | Done; imported into a throwaway DB and checked in the browser (desktop and 375 px) |
| Pack A2 Mathematics (4 new number-theory lessons, XOR rewrite, +7 quiz items) | Done; imported into a throwaway DB |
| Pack A8 PQC awareness (7 lessons rewritten + Mosca-style lesson, +8 quiz items) | Done; imported into a throwaway DB |
| Packs for A4, B1, B6 to B11, C7 to C11, E1 to E6 | Not started |
| Wave 2 modules (no book coverage) | Not started |
| Simulations: modular clock, Mosca calculator, toy LWE, Lamport, risk heat map | Not started |
| Packs imported into the real dev database | Not done; run `python -m course_content.import_pack content/packs/<pack>.json --actor <admin>` from `backend/main_api` |
| Module-level `estimated_minutes` for A2 (old outline sections still counted) | Not updated |

Packs live in `content/packs/`. Their code listings were run before inclusion and their expected output is copied from the real run.

## 7. Verification plan

- Every pack: `python -m course_content.validate_pack` with 0 errors before import.
- Backend: `pytest` for I1–I3 plus the existing 147 tests; dev DB fingerprinted before and after.
- Frontend: `tsc -b`, `npm run lint`, `test:content`, `content:check`, `vite build`.
- Browser (isolated stack on 8011/5181, throwaway DB, per project memory): register → open module →
  read section → pass checkpoint → section completes → take quiz → result; admin edits a pack-owned
  section; learner cannot reach admin routes; mobile width 375 px.
- Code blocks: every Python example executed locally in a scratch venv with the stated library version, and the shown output compared.
