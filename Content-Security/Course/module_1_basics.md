# Module 1: What Is Cybersecurity?
**module_id:** `module_1_basics`
**Track:** Q-CAPS Foundations | **Level:** Beginner | **Estimated Time:** 90 minutes
**Prerequisite:** None — entry point for every learner (student, employee, org admin).

> ⚠️ Schema note: `module_id` values used across this project must exactly match `shared_data_schema.md`'s convention (`module_1_basics` is the confirmed example). Modules 2 and 3 follow the same pattern (`module_2_quantum`, `module_3_pqc_mitigation`) — confirm with the team before final merge.

---

## 1.1 Why Cryptography Exists
**Text:** Cryptography exists to guarantee three things over an untrusted channel: **Confidentiality** (only the intended party reads it), **Integrity** (it wasn't altered), and **Authenticity** (you know who really sent it).

**🎨 Interactive/Visual:** 3-panel clickable diagram — Eve reading a message (breaks confidentiality), Eve altering it (breaks integrity), Eve impersonating the sender (breaks authenticity). Each panel reveals its fix (encryption / hashing / signatures) on tap.

**Knowledge Check:** "Alice sends Bob a message. Eve reads it without changing it. Which pillar is broken?" → Confidentiality (not Integrity/Authenticity).

## 1.2 Symmetric Encryption (AES)
**Text:** One shared key encrypts and decrypts. Fast, used for bulk data. AES-256 is the modern standard; DES is legacy/broken — teach as history only, never as a usable option.

**🎨 Interactive/Visual:** Drag-the-key slider between "Lock" and "Unlock" states on one padlock, reinforcing "one key does both."

## 1.3 Asymmetric Encryption (RSA & ECC)
**Text:** Two mathematically linked keys — public (shared) and private (secret). RSA's security rests on factoring difficulty; ECC's rests on the elliptic curve discrete log problem, achieving RSA-equivalent security at far smaller key sizes (256-bit ECC ≈ 3072-bit RSA).

**🎨 Interactive/Visual:** Encrypt/decrypt demo widget (type a message → encrypt with Bob's public key → decrypt with his private key). Include a "wrong key" failure state to show the asymmetry.

**Knowledge Check:** "Encrypt a secret for Bob using which key?" → Bob's public key.

## 1.4 Hashing & Digital Signatures
**Text:** Hashing (SHA-256) is one-way, used for integrity and password storage (bcrypt — this is exactly what the Login/Signup system for Q-CAPS itself uses). Digital signatures combine a private-key signature with public-key verification to prove authenticity + integrity together.

**🎨 Interactive/Visual:** Live "tamper detector" — user edits a sentence character-by-character, watches the SHA-256 hash change completely (avalanche effect), computed client-side via `crypto.subtle.digest`.

## 1.5 PKI (Public Key Infrastructure)
**Text:** Certificate Authorities (CAs) sign certificates to build a chain of trust — Root CA → Intermediate CA → Server Certificate. This is exactly what Inba's scanner engine inspects when it reads a site's TLS certificate.

**🎨 Interactive/Visual:** Clickable chain-of-trust diagram. Callout: "If the Root CA's cryptography is broken by a quantum computer, the whole chain collapses" — sets up Module 3.

---
## Module 1 Wrap-Up
- CTA: "Take the Module 1 Quiz" → loads `module_1_basics_questions.json`.
- On pass (≥70%), submission must be posted to Vishnu Priya's API in the **exact** Quiz Submission shape from `shared_data_schema.md`:
```json
{
  "user_id": "U-992400",
  "module_id": "module_1_basics",
  "questions_answered": 7,
  "correct_answers": 6,
  "time_taken_seconds": 210,
  "passed": true
}
```
- Unlocks: `module_2_quantum`.
