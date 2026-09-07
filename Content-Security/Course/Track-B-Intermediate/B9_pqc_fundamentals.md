# B9 — PQC Fundamentals
**module_id:** `track_b_b9_pqc_fundamentals`
**Level:** Intermediate | **Estimated Time:** 150 minutes | **Track:** B — Engineering
**Prerequisite:** `B8`

> Note: overlaps with core **PQC Foundations Module 3**, section 3.4. This module goes considerably deeper into the mathematical families underlying PQC.

## Learning Objectives
- Clearly distinguish PQC from quantum cryptography (QKD) with technical precision.
- Understand KEMs and digital signatures as the two primary PQC primitive categories.
- Understand the four major PQC mathematical approaches and their relative security assumptions and tradeoffs.

---

## 9.1 PQC vs. Quantum Cryptography
Reinforcing core Module 2.3's QKD-vs-PQC distinction with full technical precision: **PQC** algorithms are classical algorithms (run on ordinary computers, use no quantum phenomena) chosen specifically because their underlying math problems are believed to resist quantum attack. **Quantum cryptography** (including QKD) uses actual quantum physical phenomena as part of the security mechanism itself. This distinction is worth over-teaching, since it's the single most common point of confusion in the entire field, and getting it wrong undermines credibility with technical audiences (e.g., during your project's own faculty review).

## 9.2 KEMs (Key Encapsulation Mechanisms)
Building on B7.3's formal introduction, this section covers how PQC KEMs specifically work: a recipient generates a public/private keypair; a sender uses the public key to generate and encapsulate a random shared secret; the recipient uses their private key to decapsulate it. **ML-KEM** (covered fully in B10) is the standardized PQC implementation of this pattern.

## 9.3 Digital Signatures (PQC)
Building on B7.4's formal security properties, this section covers how PQC signature schemes achieve those same properties (existential unforgeability) using entirely different mathematical foundations than RSA/ECC — the two standardized approaches being **ML-DSA** and **SLH-DSA** (both covered in B10).

## 9.4 Lattice-Based Cryptography
Reinforcing core Module 3.4's introduction: security rests on the hardness of certain problems in high-dimensional mathematical lattices, most notably **Learning With Errors (LWE)**. Lattice-based schemes are currently the most widely adopted PQC approach due to a strong balance of performance, key/signature size, and security confidence — ML-KEM and ML-DSA are both lattice-based.

## 9.5 Hash-Based Cryptography
Reinforcing core Module 3.4: security rests entirely on the collision-resistance of a chosen hash function, a property with an exceptionally long and well-studied track record. The tradeoff is larger signatures and slower performance. **SLH-DSA** is the standardized hash-based signature scheme, explicitly positioned as a conservative backup.

## 9.6 Code-Based Cryptography
Security rests on the hardness of decoding a general linear error-correcting code — a mathematical problem studied since the 1970s (the McEliece cryptosystem being the classic example). Code-based schemes tend to have very large public keys but benefit from decades of cryptanalytic scrutiny, making them attractive for certain long-term-security applications despite their size overhead.

## 9.7 Multivariate Approaches
Security rests on the difficulty of solving systems of multivariate polynomial equations over finite fields. Historically important in PQC research, though less prominent in the final NIST standardization results compared to lattice- and hash-based approaches — worth knowing as part of the broader PQC landscape even though it's not one of the three FIPS-standardized families covered in B10.

## 9.8 Security Assumptions and Tradeoffs
A closing synthesis comparing all four families (9.4–9.7) across key/signature size, computational performance, and maturity/confidence of the underlying security assumption — direct preparation for the algorithm-selection decisions covered formally in B10 and applied practically in B11's labs.

**🎨 Interactive/Visual Requirement:**
> Multi-axis comparison radar chart: the four PQC families (Lattice, Hash-based, Code-based, Multivariate) plotted across Performance, Key Size, Maturity, and Signature Size — lets learners visually grasp the tradeoff space at a glance before diving into specific algorithms in B10.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 9.1–9.8.
- Practical assessment: given a hypothetical deployment constraint (e.g., "extremely bandwidth-limited IoT device" vs. "maximum long-term security confidence required"), select and justify the most appropriate PQC family.
- Unlocks: `B10 — PQC Standards`.
