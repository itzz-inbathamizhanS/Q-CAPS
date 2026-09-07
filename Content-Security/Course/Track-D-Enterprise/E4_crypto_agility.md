# E4 — Crypto-Agility
**module_id:** `track_d_e4_crypto_agility`
**Level:** Enterprise | **Estimated Time:** 130 minutes | **Track:** D — Architect
**Prerequisite:** `E3`

## Learning Objectives
- Understand algorithm abstraction and configuration-driven algorithm selection as architectural patterns.
- Understand key-lifecycle, certificate, and protocol agility as applied concepts.
- Apply crypto-agility principles to both software architecture and hardware considerations.

---

## 4.1 Algorithm Abstraction
The foundational architectural pattern for crypto-agility, first introduced conceptually in core Module 3.6 and B7.11: designing software so cryptographic operations are called through an abstract interface, never hardcoding a specific algorithm's implementation details directly into business logic — the single most important design decision determining how painful (or painless) a future algorithm swap will be.

## 4.2 Crypto APIs
Practical implementation of algorithm abstraction (4.1): well-designed cryptographic APIs (building on C9.8/C11.7's secure API design principles) that expose operations like "encrypt," "sign," or "establish a shared key" without the calling code needing to know or care which specific algorithm is used underneath.

## 4.3 Configuration-Driven Algorithms
Extending 4.1–4.2: algorithm selection controlled by external configuration (a config file, database setting, or policy service) rather than compiled directly into code — enabling an algorithm swap via a configuration change and redeployment, rather than a full code rewrite.

## 4.4 Key Lifecycle Abstraction
Applying crypto-agility specifically to key management (building on B7.11 and C11.4): abstracting key generation, storage, and rotation behind consistent interfaces so that migrating to new key types (e.g., larger PQC keys) doesn't require redesigning the surrounding key-management infrastructure.

## 4.5 Certificate Agility
Applying crypto-agility to PKI specifically (building on B7.5–7.6 and C10.11): architecture that supports issuing, deploying, and rotating certificates using multiple algorithm types concurrently — a direct enabler of the hybrid certificate approach discussed in core Module 3.6 and demonstrated hands-on in B11.6.

## 4.6 Protocol Agility
Extending crypto-agility to the protocol layer: systems and infrastructure capable of negotiating and supporting multiple protocol versions and cipher suites simultaneously, enabling gradual migration without a disruptive "flag day" cutover — directly relevant to avoiding the protocol downgrade risks discussed in C10.9.

## 4.7 Software Architecture (Crypto-Agility)
Synthesizing 4.1–4.6 into concrete software architecture guidance: where in a system's architecture cryptographic abstraction boundaries should live, and how to retrofit agility into existing systems that weren't originally designed with it — a common, difficult real-world scenario most organizations actually face.

## 4.8 Hardware Considerations
Extending crypto-agility considerations to hardware: HSMs (B7.10) and embedded devices (C9.9) that may have fixed, difficult-to-update cryptographic capabilities — a genuine architectural constraint that pure software agility cannot fully solve, requiring careful hardware lifecycle and procurement planning (connecting to E6's vendor requirements).

**🎨 Interactive/Visual Requirement:**
> "Before/after" architecture diagram: a tightly-coupled system where RSA is hardcoded throughout, versus the same system refactored with a crypto-agility abstraction layer — visually demonstrates why the upfront architectural investment pays off during a migration event.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 4.1–4.8.
- Practical assessment: given a described system with hardcoded cryptography, propose a refactored architecture introducing algorithm abstraction, and identify remaining hardware-level constraints.
- Unlocks: `E5 — Enterprise PQC Migration`.
