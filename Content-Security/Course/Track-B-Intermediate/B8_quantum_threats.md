# B8 — Quantum Threats
**module_id:** `track_b_b8_quantum_threats`
**Level:** Intermediate | **Estimated Time:** 140 minutes | **Track:** B — Engineering
**Prerequisite:** `B3`, `B7`

> Note: this module overlaps substantially with the core **PQC Foundations Module 3 (`module_3_pqc_mitigation`)**, sections 3.1–3.3. Treat this as reinforcement with engineering-level depth, connecting the formal algorithm treatment from B3 to the cryptographic systems detailed in B7.

## Learning Objectives
- Explain precisely why RSA and ECC are vulnerable, using the formal Shor's algorithm treatment from B3.
- Explain the Grover threat model with quantitative rigor.
- Understand hash security considerations under quantum attack, and build a structured quantum threat model.

---

## 8.1 Why RSA Is Vulnerable
Connecting B3.7's formal Shor's algorithm treatment directly to B7.1's RSA security discussion: RSA's security assumption (factoring is hard) is exactly the problem Shor's algorithm solves efficiently. This section walks through that connection explicitly, rather than treating "Shor breaks RSA" as a fact to memorize.

## 8.2 Why ECC Is Vulnerable
Similarly connecting B3.7 to B7.1–7.2: Shor's algorithm's period-finding technique generalizes to solve the elliptic curve discrete logarithm problem, meaning ECDSA and ECDH are equally vulnerable to a sufficiently powerful quantum computer — often a point of confusion since ECC's smaller keys can create a false impression of being "more quantum-resistant," which is not the case.

## 8.3 Shor Threat Model
A formal threat model: what resources (logical qubit count, circuit depth, error rates) would an adversary actually need to break a given RSA or ECC key size, and how do current public estimates compare to today's and near-future hardware capability (referencing B5's hardware discussion). This section should always be built from current, cited research rather than fixed numbers, since estimates are actively refined as both quantum hardware and algorithmic techniques improve.

## 8.4 Grover and Symmetric Cryptography
Building on B3.4's full treatment of Grover's algorithm, this section quantifies the exact impact on symmetric ciphers: AES-128 effectively becomes AES-64-equivalent strength, formalizing the intuition introduced in core Module 3.2.

## 8.5 Hash Security Considerations
Grover's algorithm also affects hash function security for certain use cases (like brute-forcing a preimage), providing similar quadratic speedup — reinforcing why the same "double the output length" mitigation strategy (SHA-256 → SHA-384/512) applies here as it does for symmetric keys.

## 8.6 Harvest-Now-Decrypt-Later
Building on core Module 3.3's introduction, this section formalizes HNDL as a quantitative risk model: (data confidentiality lifetime) vs. (estimated time until cryptographically relevant quantum computing) — the exact comparison visualized in the core module's timeline widget, now grounded in the more rigorous threat modeling developed throughout this module.

## 8.7 Long-Lived Sensitive Data
A practical taxonomy of data categories most exposed to HNDL risk: healthcare records, government/military communications, long-term intellectual property, and financial records under extended retention — directly informing prioritization in real migration planning (Track D).

## 8.8 Quantum Threat Modeling
Synthesizing the entire module into a repeatable process: identify cryptographic dependencies (informed by B7's PKI/certificate depth) → assess exposure using the Shor/Grover threat models (8.3, 8.4) → factor in data lifetime (8.6, 8.7) → prioritize remediation. This exact process is what the Q-CAPS platform's own Risk-to-Skill mapping and Organization module operationalize at scale.

**🎨 Interactive/Visual Requirement:**
> Quantitative risk calculator widget: learner inputs an asset's key type/size, data lifetime, and current estimated quantum timeline range, and receives a calculated risk score with a plain-language explanation — a hands-on rehearsal of the formal threat-modeling process in 8.8.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 8.1–8.8.
- Practical assessment: build a threat model for 3 hypothetical assets with different key types and data lifetimes, ranking them by urgency.
- Unlocks: `B9 — PQC Fundamentals`.
