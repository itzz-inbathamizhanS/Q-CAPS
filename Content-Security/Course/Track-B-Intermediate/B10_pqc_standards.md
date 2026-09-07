# B10 — PQC Standards
**module_id:** `track_b_b10_pqc_standards`
**Level:** Intermediate | **Estimated Time:** 130 minutes | **Track:** B — Engineering
**Prerequisite:** `B9`

> Note: overlaps with core **PQC Foundations Module 3**, section 3.5. Verify all standard numbers/status against nist.gov before publishing — this is the module most likely to go stale, since standardization is an ongoing process.

## Learning Objectives
- Know the three finalized NIST PQC standards (FIPS 203/204/205) and what each is used for.
- Understand the broader, still-evolving standardization landscape beyond the first three.
- Understand practical algorithm selection and interoperability considerations.

---

## 10.1 NIST FIPS 203 — ML-KEM
Reinforcing core Module 3.5: **ML-KEM** (Module-Lattice Key Encapsulation Mechanism, formerly CRYSTALS-Kyber), standardized under FIPS 203, is the primary NIST-standardized algorithm for post-quantum key exchange, built on the lattice-based (specifically Module-LWE) foundation covered in B9.4.

## 10.2 NIST FIPS 204 — ML-DSA
**ML-DSA** (Module-Lattice Digital Signature Algorithm, formerly CRYSTALS-Dilithium), standardized under FIPS 204, is the primary NIST-standardized algorithm for post-quantum digital signatures — also lattice-based, offering a strong balance of signature size and performance for most general-purpose use cases.

## 10.3 NIST FIPS 205 — SLH-DSA
**SLH-DSA** (Stateless Hash-Based Digital Signature Algorithm, formerly SPHINCS+), standardized under FIPS 205, is the conservative hash-based signature standard, intended as a diversified backup in case unexpected weaknesses are ever discovered in lattice-based assumptions — trading larger signature sizes and slower performance for a fundamentally different, extremely well-studied security foundation.

## 10.4 Emerging and Evolving Standardization
NIST's PQC standardization process is ongoing beyond the first three finalized standards — including a fourth-round evaluation of additional KEM candidates for algorithm diversity, and separate signature scheme evaluations. This module must always be treated as a living document: content teams should check nist.gov directly for the current state before every publish cycle, rather than treating any snapshot as permanent.

## 10.5 Algorithm Selection
Practical guidance connecting B9.8's tradeoff comparison to concrete standards: ML-KEM is the default choice for key exchange; ML-DSA is the default choice for general-purpose signatures; SLH-DSA is selected specifically where algorithm diversity or maximum conservative security confidence is required, accepting its performance/size cost.

## 10.6 Implementation and Interoperability Considerations
Standardizing an algorithm on paper doesn't guarantee smooth real-world deployment — this section covers practical concerns: library support maturity across programming languages, protocol-level negotiation (how TLS advertises and agrees on PQC algorithm support between client and server), and backward compatibility with systems that don't yet support PQC — directly setting up B11's hands-on TLS/PQC experimentation.

**🎨 Interactive/Visual Requirement:**
> "Standards matcher" drag-and-drop game (can reuse/extend the core Module 3.5 version): match each acronym (ML-KEM, ML-DSA, SLH-DSA) to its FIPS number and primary use case, now with an added "why you'd pick this over the alternative" reasoning card revealed after each correct match.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 10.1–10.6.
- Practical assessment: given three deployment scenarios, select and justify which standardized algorithm(s) fit each.
- Unlocks: `B11 — Intermediate PQC Labs`.
