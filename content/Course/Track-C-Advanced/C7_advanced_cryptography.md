# C7 — Advanced Cryptography
**module_id:** `track_c_c7_advanced_cryptography`
**Level:** Advanced | **Estimated Time:** 170 minutes | **Track:** C — Specialist
**Prerequisite:** `B7`

## Learning Objectives
- Understand number theory foundations underlying RSA and ECC at a rigorous level.
- Understand advanced symmetric cryptography, hash function internals, and formal KEM/signature security.
- Understand provable-security concepts, cryptographic protocols, and secure randomness at a research level.

---

## 7.1 Number Theory
Rigorous treatment of the number-theoretic foundations underlying classical public-key cryptography: modular arithmetic, Euler's theorem, and the structure of multiplicative groups modulo n — the formal mathematical machinery RSA (7.2) is built from.

## 7.2 Factoring and Discrete Logarithms
The two "hard problems" underlying nearly all classical public-key cryptography, treated formally here: **integer factorization** (RSA's foundation) and the **discrete logarithm problem** (Diffie-Hellman/ECC's foundation) — including why both are believed hard classically, and precisely how Shor's algorithm (C2.1) breaks that classical hardness assumption.

## 7.3 Elliptic Curves
A rigorous mathematical treatment of elliptic curve group structure — point addition, the group law, and curve parameter selection — going well beyond B7.2's practitioner-level ECDSA/ECDH treatment into the actual algebraic geometry underlying ECC's security.

## 7.4 Advanced Symmetric Cryptography
Deeper treatment of block cipher design principles (substitution-permutation networks, Feistel structures), and formal security notions for symmetric encryption (semantic security, indistinguishability under chosen-plaintext attack) — the rigorous standard AES and its modes of operation (B7 introduced conceptually) are actually measured against.

## 7.5 Hash Functions (Internal Construction)
Building on A5.3/B7's usage-level treatment, this section covers how hash functions like SHA-256 are actually constructed internally (compression functions, the Merkle-Damgård construction) — directly relevant preparation for understanding hash-based PQC signatures (SLH-DSA) covered formally in C8.9.

## 7.6 KEM Security
Formal security definitions for Key Encapsulation Mechanisms (introduced conceptually in B7.3, B9.2): **IND-CCA2 security** (indistinguishability under adaptive chosen-ciphertext attack) as the gold-standard security notion every modern KEM, including ML-KEM, is designed and proven against.

## 7.7 Signature Security
Formal treatment building on B7.4: the precise mathematical definition of existential unforgeability under chosen-message attack (EUF-CMA) — the standard security proof target for signature schemes including ML-DSA and SLH-DSA.

## 7.8 Provable-Security Concepts
An introduction to the methodology of **provable security**: reducing a cryptographic scheme's security to the hardness of a well-studied mathematical problem via a formal security proof — the rigorous foundation underlying confidence in both classical schemes (RSA reducing to factoring) and PQC schemes (ML-KEM reducing to Module-LWE hardness, covered in C8).

## 7.9 Cryptographic Protocols
Beyond individual primitives, this section covers how primitives combine into full protocols (like TLS) and the additional security considerations that emerge only at the protocol level — composition security, protocol-level attacks that don't exploit any individual primitive's weakness but rather how they're combined.

## 7.10 Randomness and Key Generation
A frequently underestimated topic: cryptographic security fundamentally depends on high-quality randomness for key generation. This section covers cryptographically secure pseudorandom number generators (CSPRNGs), entropy sources, and historical real-world failures caused by weak randomness — directly setting up C10's coverage of randomness-related attack surfaces.

**🎨 Interactive/Visual Requirement:**
> Security-reduction diagram: visual "proof chain" showing how ML-KEM's security formally reduces to Module-LWE hardness, mirrored against how RSA's security reduces to factoring hardness — makes the abstract concept of provable security concrete and comparable across classical and PQC schemes.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 7.1–7.10.
- Practical assessment: given a described cryptographic scheme, identify which formal security notion (IND-CCA2, EUF-CMA, etc.) is the appropriate target and explain why.
- Unlocks: `C8 — PQC Mathematics`.
