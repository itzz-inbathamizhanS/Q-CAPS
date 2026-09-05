# Module 3: PQC Mitigation
**module_id:** `module_3_pqc_mitigation`
**Display name:** `Module 3: PQC Mitigation` (matches the exact string used in `shared_data_schema.md`'s `recommended_next_module` example — keep this consistent everywhere it's displayed)
**Track:** Q-CAPS Foundations | **Level:** Intermediate | **Estimated Time:** 110 minutes
**Prerequisite:** `module_2_quantum` passed (≥70%)

---

## 3.1 Shor's Algorithm — Breaking RSA & ECC
**Text:** Efficiently factors large numbers (breaks RSA) and solves discrete logs (breaks ECC/Diffie-Hellman) — on a large, fault-tolerant quantum computer that doesn't exist yet. Migration planning must start now regardless, because it takes years.

**🎨 Interactive/Visual:** Reuse the Module 1 chain-of-trust diagram — animate a crack propagating down it when the user clicks "Run Shor's Algorithm (Simulated)." Side panel: real Shor's requires thousands of *logical* (error-corrected) qubits; today's machines have hundreds of *physical*, noisy ones.

## 3.2 Grover's Algorithm — Weakening Symmetric Crypto
**Text:** Quadratic (not exponential) speedup for brute-force search. AES-128 behaves like ~64-bit security against a quantum attacker; AES-256 only drops to ~128-bit — so doubling key length is the practical fix.

**🎨 Interactive/Visual:** Speedometer-style gauge: AES-128 needle drops sharply, AES-256 needle barely moves, when toggled to "post-quantum view."

## 3.3 "Harvest Now, Decrypt Later" (HNDL)
**Text:** Adversaries can record encrypted traffic today and decrypt it once a capable quantum computer exists. Data with long confidentiality lifetimes (health records, IP, state secrets) is at risk **today**, not just in the future. Key line for org buy-in: *"The attack window opened the day your data was recorded — not the day the quantum computer arrives."*

**🎨 Interactive/Visual:** Extend the Module 2 timeline: draggable marker for "data's required confidentiality lifetime" — flashes "AT RISK" if it crosses the estimated quantum-risk window.

## 3.4 Post-Quantum Cryptography (PQC) — The Fix
**Text:** Two main families: **Lattice-based** (fast, moderate key sizes — basis for ML-KEM/ML-DSA) and **Hash-based** (very conservative, larger signatures — basis for SLH-DSA).

**🎨 Interactive/Visual:** Extend the Module 1 RSA-vs-ECC key-size bar chart with ML-KEM-768 and SLH-DSA-128s bars for direct comparison.

## 3.5 NIST PQC Standards
**Text:** **ML-KEM** (formerly Kyber, key exchange, FIPS 203), **ML-DSA** (formerly Dilithium, signatures, FIPS 204), **SLH-DSA** (formerly SPHINCS+, hash-based signature backup, FIPS 205). Content team must verify current FIPS status against nist.gov before publish — never hardcode standards references from memory alone.

**🎨 Interactive/Visual:** Drag-and-drop "standards matcher" — match each acronym to its correct use-case card, with instant color feedback.

## 3.6 Migration: Crypto-Agility & Hybrid Cryptography
**Text:** Crypto-agility = designing systems so algorithms can be swapped without a full rebuild. Hybrid cryptography = running classical + PQC together during transition, so security holds even if one is later broken. Explicitly connects to the org-side Crypto Inventory / PQC Migration Requirements modules elsewhere in Q-CAPS.

**🎨 Interactive/Visual:** Animated hybrid TLS handshake — two parallel key-exchange lines (ECDHE + ML-KEM) merging into one session key.

---
## Module 3 Wrap-Up
- CTA: "Take the Module 3 Quiz" → `module_3_pqc_mitigation_questions.json`.
- Submission uses `"module_id": "module_3_pqc_mitigation"` in the shared Quiz Submission format.
- Final CTA: **"You've completed PQC Foundations. Try your first Authorized Crypto Scan →"** — hands off directly to Inba's Scanner Engine.
