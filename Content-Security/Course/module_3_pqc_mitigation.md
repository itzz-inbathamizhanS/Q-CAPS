# Module 3: PQC Mitigation
**module_id:** `module_3_pqc_mitigation`
**Display name:** `Module 3: PQC Mitigation` (matches the exact string used in `shared_data_schema.md`'s `recommended_next_module` example)
**Track:** Q-CAPS Foundations | **Level:** Intermediate | **Estimated Time:** 110 minutes
**Prerequisite:** `module_2_quantum` passed (≥70%)

## Learning Objectives
By the end of this module, a learner should be able to:
- Explain what Shor's and Grover's algorithms threaten, and why the mitigations differ for each.
- Explain "Harvest Now, Decrypt Later" and why it creates urgency today, not just in the future.
- Name and describe the three families of NIST-standardized PQC algorithms and what each is used for.
- Explain crypto-agility and hybrid cryptography as the practical migration strategy organizations use.

---

## 3.1 Shor's Algorithm — Breaking RSA & ECC

**Shor's algorithm**, published by mathematician Peter Shor in 1994, is a quantum algorithm that can efficiently factor large numbers and solve the discrete logarithm problem — the exact two hard-math problems that RSA and ECC/Diffie-Hellman respectively depend on for their security. On a classical computer, factoring a 2048-bit RSA number would take longer than the age of the universe with known methods. On a sufficiently large, fault-tolerant quantum computer, Shor's algorithm could do it in a matter of hours.

The critical honesty point, carried forward from Module 2: this requires a **large-scale, error-corrected quantum computer that does not exist yet.** Public estimates for when such a machine might exist vary widely and should always be checked against current sources rather than assumed — but building an organization's entire migration strategy around "it'll never happen" or "it's happening tomorrow" are both mistakes. The responsible position is: it takes years to migrate a large organization's cryptography, so planning must start well before the threat materializes.

**🎨 Interactive/Visual Requirement:**
> Reuse the Module 1 chain-of-trust diagram, animated "breaking": Root CA → Intermediate → Server cert, with a red crack propagating down the chain when the user clicks "Run Shor's Algorithm (Simulated)." Side panel: real Shor's requires thousands of logical (error-corrected) qubits — today's largest machines have hundreds of physical, noisy qubits.

**Knowledge Check:** "Shor's algorithm poses a threat to which cryptographic systems?" → **RSA and ECC**, via factoring and discrete logarithm respectively.

---

## 3.2 Grover's Algorithm — Weakening Symmetric Crypto

**Grover's algorithm** is a different quantum algorithm that provides a **quadratic speedup** for unstructured search problems — including brute-forcing a symmetric key. This is a fundamentally smaller threat than Shor's exponential speedup against RSA/ECC: instead of completely breaking a symmetric cipher, it effectively halves the key's bit-strength against a quantum attacker. Practically, that means AES-128 behaves like roughly AES-64-strength against a quantum adversary — no longer considered safe — while AES-256 only drops to roughly AES-128-strength, which remains solidly secure.

This gives us the simplest, most immediately actionable mitigation in the entire course: **double your symmetric key and hash lengths.** Move from AES-128 to AES-256, and from SHA-256 to SHA-384 or SHA-512 for anything requiring long-term integrity guarantees. Unlike the RSA/ECC problem, this doesn't require adopting entirely new algorithm families — just larger, already-standardized parameters.

**🎨 Interactive/Visual Requirement:**
> Speedometer-style gauge: AES-128 needle drops sharply, AES-256 needle barely moves, when toggled to "post-quantum view" — visually contrasts the severity of the Grover threat against the Shor threat.

**Knowledge Check:** "What is the primary impact of Grover's algorithm on symmetric cryptography?" → **A quadratic speedup**, roughly halving effective key strength — mitigated by doubling key length.

---

## 3.3 "Harvest Now, Decrypt Later" (HNDL)

This is the single concept that turns quantum-safe migration from an academic curiosity into an urgent, present-day business decision. **Harvest Now, Decrypt Later** describes a strategy where an adversary intercepts and stores encrypted traffic today, with no ability to read it yet — betting that a capable quantum computer will exist before that data's confidentiality requirement expires, at which point they decrypt everything they've been storing.

This matters enormously for data with a **long confidentiality lifetime**: medical records that must remain private for decades, government or military secrets, long-term intellectual property, and legal or financial records under extended retention requirements. If your data must stay confidential for 20 years, and quantum computers capable of breaking RSA emerge in 10, an adversary who started recording today gets a 10-year head start on decrypting it.

The most important sentence in this entire course, worth remembering word for word: **"The attack window opened the day your data was recorded — not the day the quantum computer arrives."** This single idea is what should drive organizational buy-in and urgency, independent of exactly when large-scale quantum computers eventually arrive.

**🎨 Interactive/Visual Requirement:**
> Extend the Module 2 timeline widget: add a draggable marker for "data's required confidentiality lifetime" (e.g., "medical record: 25 years"). If the marker crosses the estimated quantum-risk window, flash a red "AT RISK" badge.

**Knowledge Check:** "What does 'Harvest Now, Decrypt Later' describe?" → **Adversaries recording encrypted data today to decrypt once quantum computers are capable.**

---

## 3.4 Post-Quantum Cryptography (PQC) — The Fix

**Post-Quantum Cryptography** refers to classical algorithms — designed to run on today's ordinary computers, no quantum hardware required — whose security rests on math problems believed to remain hard even for quantum computers. Two families matter most for this course:

- **Lattice-based cryptography** bases its security on hard problems involving high-dimensional mathematical lattices, such as the Learning With Errors (LWE) problem. It offers fast performance and moderate key sizes, making it practical for widespread deployment — it's the foundation for both ML-KEM (key exchange) and ML-DSA (signatures).
- **Hash-based cryptography** bases its security entirely on the collision-resistance of hash functions — a property that's extremely well-studied and conservative, with decades of cryptanalysis behind it. The tradeoff is larger signature sizes and slower performance compared to lattice-based approaches. It's the foundation for SLH-DSA, positioned as a diversified backup in case unexpected weaknesses are ever found in lattice-based math.

**🎨 Interactive/Visual Requirement:**
> Extend the Module 1 RSA-vs-ECC key-size bar chart with ML-KEM-768 and SLH-DSA-128s bars for direct comparison, with a tooltip on each explaining what it's used for.

---

## 3.5 NIST PQC Standards

In 2024, the U.S. National Institute of Standards and Technology (NIST) finalized its first set of Post-Quantum Cryptography standards after a multi-year, worldwide evaluation process:

- **ML-KEM** (Module-Lattice Key Encapsulation Mechanism, formerly known as CRYSTALS-Kyber) — standardized for key exchange under **FIPS 203**.
- **ML-DSA** (Module-Lattice Digital Signature Algorithm, formerly CRYSTALS-Dilithium) — standardized for digital signatures under **FIPS 204**.
- **SLH-DSA** (Stateless Hash-Based Digital Signature Algorithm, formerly SPHINCS+) — a conservative, hash-based signature backup standard under **FIPS 205**.

Content team note, carried forward as a publish-time checklist item: always verify current FIPS numbers and standardization status directly against nist.gov before publishing this section — standards references should never be hardcoded from memory without a source check.

**🎨 Interactive/Visual Requirement:**
> "Standards matcher" drag-and-drop game: user drags each acronym (ML-KEM, ML-DSA, SLH-DSA) onto the correct use-case card (Key Exchange / Signatures / Signatures-Conservative-Backup), with instant color feedback.

**Knowledge Check:** "Which NIST-standardized algorithm handles key exchange in the PQC suite?" → **ML-KEM** (FIPS 203).

---

## 3.6 Migration: Crypto-Agility & Hybrid Cryptography

**Crypto-agility** is a design philosophy: build systems so that cryptographic algorithms can be swapped out without a full architectural rebuild. In practice, this means never hardcoding a specific algorithm deep into application logic — instead, abstracting cryptographic operations behind a configurable layer, so that when a new standard (or vulnerability) emerges, the fix is a configuration change, not a rewrite.

**Hybrid cryptography** is the practical bridge strategy used during the PQC transition period: running a classical algorithm (RSA or ECC) alongside a PQC algorithm (ML-KEM) simultaneously, combining both into the final session key. This provides defense in depth — the connection remains secure as long as *at least one* of the two algorithms hasn't been broken, hedging against both a future quantum computer breaking the classical side, and the small but real possibility of an implementation flaw being discovered in the newer, less battle-tested PQC algorithms.

This directly connects to the organizational side of Q-CAPS — Crypto Inventory and PQC Migration Requirements — since an organization can't apply crypto-agility or hybrid cryptography to systems it doesn't know are using vulnerable algorithms in the first place. This is exactly the handoff point into the platform's Scan Engine.

**🎨 Interactive/Visual Requirement:**
> "Hybrid handshake" animated diagram: a simplified TLS handshake showing two parallel key-exchange lines (classical ECDHE + ML-KEM) merging into one combined session key. Clicking either line shows a one-line explainer.

**Knowledge Check:** "Why do organizations often use hybrid cryptography during migration?" → **It ensures security holds even if one of the two algorithm families is later broken or found flawed.**

---

## Module 3 Wrap-Up
**Summary:** You've covered what Shor's and Grover's algorithms actually threaten and how the mitigations differ, why "Harvest Now, Decrypt Later" creates urgency today rather than someday, the two families of PQC and the three NIST-standardized algorithms built on them, and how crypto-agility and hybrid cryptography form the practical migration strategy organizations use in the real world.

- CTA: "Take the Module 3 Quiz" → `module_3_pqc_mitigation_questions.json`.
- Submission uses `"module_id": "module_3_pqc_mitigation"` in the shared Quiz Submission format.
- Final CTA: **"You've completed PQC Foundations. Try your first Authorized Crypto Scan →"** — hands off directly to Inba's Scanner Engine.
