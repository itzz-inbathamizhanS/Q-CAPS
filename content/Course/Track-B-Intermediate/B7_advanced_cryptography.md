# B7 — Advanced Cryptography
**module_id:** `track_b_b7_advanced_cryptography`
**Level:** Intermediate | **Estimated Time:** 160 minutes | **Track:** B — Engineering
**Prerequisite:** `A5`

## Learning Objectives
- Understand RSA/ECC security in depth, including ECDSA/ECDH specifics.
- Understand KEM concepts and digital signature systems formally.
- Understand PKI architecture, certificate lifecycle, SSH, VPN cryptography, HSMs, and key lifecycle at an engineering level.

---

## 7.1 RSA/ECC Security (Engineering Depth)
Building on A5.6–5.7, this section covers real-world RSA/ECC security considerations: recommended key sizes for different threat models and time horizons, padding scheme choices (e.g., why raw "textbook RSA" is insecure and OAEP padding is required in practice), and common implementation pitfalls.

## 7.2 ECDSA/ECDH
**ECDSA (Elliptic Curve Digital Signature Algorithm)** and **ECDH (Elliptic Curve Diffie-Hellman)** are the two specific, standardized ECC constructions used respectively for signatures and key exchange in real-world protocols like TLS — connecting the general ECC concept from A5.7 to its actual named implementations.

## 7.3 KEM Concepts
A **KEM (Key Encapsulation Mechanism)** is a cryptographic primitive that lets one party generate a random shared secret and securely transmit it to another party using their public key — a slightly different structure than "encrypt an arbitrary message," and the exact primitive type that ML-KEM (covered in B10) implements. Understanding KEM as a formal concept here prepares learners for why NIST's PQC key-exchange standard is a KEM rather than a direct encryption scheme.

## 7.4 Digital Signature Systems (Formal Treatment)
Building on A5.5, this section covers the formal security properties expected of a signature system: existential unforgeability (an attacker can't forge a valid signature on any new message, even after seeing many valid signatures) — the benchmark every signature scheme, classical or post-quantum, is measured against.

## 7.5 PKI Architecture
Building on B6.6's operational overview, this section covers PKI design choices: single-tier vs. multi-tier CA hierarchies, cross-certification between organizations, and trust store management — the architectural decisions that determine how resilient an organization's chain of trust actually is.

## 7.6 Certificate Lifecycle
The full lifecycle of a certificate: request, issuance, deployment, monitoring, renewal, and revocation. Poor lifecycle management — expired certificates causing outages, or revoked certificates not being properly checked — is one of the most common real-world PKI failure modes, independent of any cryptographic weakness.

## 7.7 TLS Internals
Deeper than B6.5's operational view: the exact byte-level structure of TLS records, the specific cryptographic computations at each handshake step, and how TLS 1.3 (the current version) simplified and hardened the handshake compared to earlier versions.

## 7.8 SSH
**SSH (Secure Shell)** uses the same core cryptographic building blocks (asymmetric key exchange, symmetric encryption, MACs) as TLS but in a different protocol structure, primarily for secure remote system administration — directly relevant since Inba's scanner engine's Phase 3 scope includes SSH configuration analysis.

## 7.9 VPN Cryptography
Building on B6.4, this section covers the specific cryptographic protocols used in common VPN implementations (e.g., IPsec's IKE key exchange, or a TLS-based VPN's handshake) — reinforcing that VPNs are, cryptographically, another application of the same primitives covered throughout this course.

## 7.10 HSM Concepts
An **HSM (Hardware Security Module)** is dedicated, tamper-resistant hardware for generating and storing cryptographic keys, performing operations without ever exposing the private key to the host system's software — the gold-standard approach for protecting the most sensitive keys (e.g., a Root CA's private key) against both software compromise and certain physical attacks.

## 7.11 Key Lifecycle (Engineering Depth)
Building on A5.11, this section covers formal key lifecycle stages: generation, distribution, storage, rotation, and destruction — and why crypto-agility (introduced in core Module 3.6) fundamentally depends on having disciplined key lifecycle management already in place before a migration can even begin.

**🎨 Interactive/Visual Requirement:**
> Certificate lifecycle timeline widget: interactive stages (Request → Issue → Deploy → Monitor → Renew/Revoke) with a simulated "expired certificate causes outage" scenario the learner can trigger and then diagnose.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 7.1–7.11.
- Practical assessment: audit a simulated certificate inventory for lifecycle issues (expired, soon-to-expire, weak key sizes) and propose remediation priorities.
- Unlocks: `B8 — Quantum Threats`.
