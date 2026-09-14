# A5 — Cryptography Foundations
**module_id:** `track_a_a5_cryptography_foundations`
**Level:** Beginner | **Estimated Time:** 140 minutes | **Track:** A — Foundations
**Prerequisite:** `A4` recommended

> Note: this module overlaps significantly with the core **PQC Foundations Module 1 (`module_1_basics`)** you may have already completed. If so, treat this as reinforcement with added depth (key management, TLS internals) rather than entirely new material — the platform should allow "test out" credit here if `module_1_basics` is already passed.

## Learning Objectives
- Reinforce plaintext/ciphertext/key vocabulary, symmetric cryptography (AES), and hashing.
- Understand MACs, digital signatures, RSA, ECC, and Diffie-Hellman/ECDH in more depth than the core track.
- Understand PKI, certificates, TLS, and key management as practiced in real systems.

---

## 5.1 Plaintext, Ciphertext, and Keys
Foundational vocabulary: **plaintext** is readable data, **ciphertext** is its encrypted form, and a **key** is the secret parameter controlling the transformation between them. Every concept in this module builds on this vocabulary.

## 5.2 Symmetric Cryptography & AES
Reinforces core Module 1.2: one shared key for encryption and decryption. Here, go one level deeper into **modes of operation** — how AES processes data longer than one block (e.g., CBC, GCM), and why GCM's built-in authentication makes it the modern preferred choice over older modes.

## 5.3 Hashing and SHA Concepts
Reinforces core Module 1.4, with added depth on hash properties: pre-image resistance, second pre-image resistance, and collision resistance — the three formal properties that make SHA-256 suitable for integrity checking and digital signatures.

## 5.4 MACs (Message Authentication Codes)
A **MAC** combines a hash function with a shared secret key to prove both integrity and authenticity using only symmetric cryptography — a lighter-weight alternative to full digital signatures when both parties already share a secret key (e.g., **HMAC**, widely used in API authentication and VPN protocols).

## 5.5 Digital Signatures
Reinforces core Module 1.4 with formal treatment: signature generation (hash + private key encryption) and verification (hash + public key decryption + comparison), and why signatures provide **non-repudiation** — the signer can't later credibly deny having signed something.

## 5.6 RSA
Reinforces core Module 1.3 with deeper treatment of RSA key generation (choosing large primes, computing the modulus and exponents) at a conceptual level — full mathematical derivation is deferred to Track C.

## 5.7 ECC
Reinforces core Module 1.3's ECC coverage, adding why elliptic curve point arithmetic provides equivalent security to RSA at much smaller key sizes.

## 5.8 Diffie-Hellman / ECDH
**Diffie-Hellman** is a method for two parties to establish a shared secret key over an insecure channel without ever transmitting the key itself — the mathematical basis for how TLS establishes session keys. **ECDH** is the elliptic-curve variant, used far more commonly in modern TLS than classic Diffie-Hellman.

## 5.9 PKI and Certificates
Reinforces core Module 1.5's chain-of-trust concept, with added depth: certificate fields (issuer, subject, validity period, public key), certificate revocation (CRLs, OCSP), and why certificate expiration/revocation matters for real-world security hygiene.

## 5.10 TLS
A deeper look at the TLS handshake: how a client and server negotiate a protocol version, exchange certificates, perform a key exchange (Diffie-Hellman/ECDH), and derive symmetric session keys — tying together nearly every concept from this module into one real protocol.

## 5.11 Key Management
The often-overlooked practical side of cryptography: how keys are generated, stored, rotated, and eventually retired. Poor key management (weak randomness, keys stored in plaintext, never rotating keys) is one of the most common real-world causes of cryptographic failure — often a bigger risk in practice than the choice of algorithm itself.

**🎨 Interactive/Visual Requirement:**
> Full TLS handshake step-by-step animation: ClientHello → ServerHello + Certificate → Key Exchange → Finished, with each message's purpose explained as it "sends" across the diagram — the capstone visual tying the whole module together.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 5.1–5.11.
- Practical assessment: annotate a captured (simulated) TLS handshake, identifying each step and what cryptographic operation it represents.
- Unlocks: `A6 — Quantum Foundations`.
