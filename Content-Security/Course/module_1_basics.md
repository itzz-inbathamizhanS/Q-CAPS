# Module 1: What Is Cybersecurity?
**module_id:** `module_1_basics`
**Track:** Q-CAPS Foundations | **Level:** Beginner | **Estimated Time:** 90 minutes
**Prerequisite:** None — entry point for every learner.

## Learning Objectives
By the end of this module, a learner should be able to:
- Explain the three pillars of cybersecurity (confidentiality, integrity, authenticity) with real examples.
- Distinguish symmetric from asymmetric encryption and explain when each is used.
- Describe what a cryptographic hash function does and why it's used for password storage.
- Explain what a digital signature proves and how PKI establishes trust on the internet.

---

## 1.1 Why Cryptography Exists

Every time you send a message, log into a website, or make an online payment, that data travels across networks you don't control and often can't see — routers, ISPs, cloud servers. Cryptography is the toolkit that makes it safe to trust an untrusted channel. It exists to guarantee three properties, no matter who else can see the traffic:

- **Confidentiality** — only the intended recipient can read the content. If Eve intercepts the message, all she sees is scrambled noise.
- **Integrity** — the recipient can be sure the message wasn't changed in transit, even by one bit. This matters as much for a $10 transaction as a $10,000,000 one.
- **Authenticity** — the recipient can verify who actually sent the message. Without this, anyone could pretend to be your bank, your professor, or your teammate.

A useful way to remember these: imagine Alice mails Bob a letter. Confidentiality is a sealed envelope. Integrity is a tamper-evident seal that shows if it was opened. Authenticity is a signature that proves it's really from Alice. Cryptography is how we build the digital equivalent of all three — at scale, automatically, for every request your browser makes.

**🎨 Interactive/Visual Requirement:**
> Insert a 3-panel animated diagram: Panel 1 shows plaintext "HELLO" traveling openly and being read by an eavesdropper (❌ confidentiality broken). Panel 2 shows the message altered in transit (❌ integrity broken). Panel 3 shows an impersonator sending a fake message as "Bank" (❌ authenticity broken). User taps each panel to see the fix (encryption, hashing, digital signatures respectively). Clickable SVG/Canvas component, not a static image.

**Knowledge Check:** "Alice sends Bob a message. Eve reads it without changing it. Which pillar is broken?" → **Confidentiality** (Integrity and Authenticity remain intact — the message arrived unaltered and genuinely from Alice; Eve simply read it).

---

## 1.2 Symmetric Encryption (AES)

Symmetric encryption uses **one shared secret key** for both locking (encrypting) and unlocking (decrypting) data. Think of it like a physical padlock: whoever has a copy of the key can both lock and unlock the box. This is fast and efficient, which is why it's used for the bulk of the actual data you send — files, video streams, and the main body of a TLS-protected web session after the initial handshake.

**AES (Advanced Encryption Standard)** is the modern standard, typically used at 128, 192, or 256-bit key lengths. AES-256 is considered the strongest common configuration and is required in many government and financial-grade systems. Its predecessor, **DES (Data Encryption Standard)**, used a 56-bit key that can now be brute-forced in hours on ordinary hardware — it should be taught only as historical context, never presented as a usable option today.

The core weakness of symmetric encryption isn't the algorithm — it's key distribution. If Alice and Bob have never met, how do they agree on a shared secret key without someone intercepting it in transit? This exact problem is what asymmetric encryption solves, covered next.

**🎨 Interactive/Visual Requirement:**
> Interactive key-and-lock slider: user drags a single key icon between a "Lock" (encrypt) and "Unlock" (decrypt) animation on the same padlock, reinforcing "one key does both." Toggle for key length (128/192/256-bit) that visually changes the padlock's complexity — purely illustrative, with a tooltip clarifying key length ≠ literal pin count.

**Knowledge Check:** "In symmetric encryption like AES, how many keys are used?" → **One key**, shared by both parties for encryption and decryption.

---

## 1.3 Asymmetric Encryption (RSA & ECC)

Asymmetric (public-key) encryption solves the key-distribution problem by using **two mathematically linked keys**: a public key (freely shared with anyone) and a private key (never shared, kept secret by its owner). Data encrypted with someone's public key can only be decrypted with their matching private key — and vice versa for signatures.

**RSA** bases its security on the difficulty of factoring the product of two very large prime numbers. Given a 2048-bit or 3072-bit RSA public key, no known classical algorithm can efficiently recover the private key — this is what protects the vast majority of today's HTTPS connections and SSH keys.

**ECC (Elliptic Curve Cryptography)** achieves equivalent security using the elliptic curve discrete logarithm problem instead, and does so with dramatically smaller keys: a 256-bit ECC key offers roughly the same security as a 3072-bit RSA key. Smaller keys mean faster computation and less bandwidth, which is why ECC has become the preferred choice in modern TLS and mobile applications.

In practice, asymmetric and symmetric encryption are used together: a TLS handshake uses asymmetric cryptography (RSA/ECC) just long enough to securely agree on a fast, shared symmetric (AES) key, which then encrypts the actual session data. This hybrid pattern will reappear later when we discuss hybrid classical+PQC cryptography in Module 3.

**🎨 Interactive/Visual Requirement:**
> Two-key demo widget: user types a short message, clicks "Encrypt with Bob's Public Key," watches it scramble, then clicks "Decrypt with Bob's Private Key" to reveal it. Include a failed-attempt state using the wrong private key, showing a garbage-output animation.
>
> Second widget: side-by-side bar chart comparing RSA-3072 vs ECC-256 key sizes at equivalent security — sets up the PQC key-size comparisons in Module 3.

**Knowledge Check:** "You want to send Bob a secret message only he can read. Which key should you encrypt with?" → **Bob's public key** — only his matching private key can decrypt it.

---

## 1.4 Hashing & Digital Signatures

A **hash function** takes input of any size and produces a fixed-length output ("digest") in a way that is one-way (you cannot reverse it to get the original input) and collision-resistant (it's computationally infeasible to find two different inputs producing the same output). **SHA-256** is the most widely used modern hash function.

Hashing has two major applications you'll interact with directly in this course:
1. **Integrity checking** — software downloads publish a SHA-256 hash so you can verify the file wasn't corrupted or tampered with.
2. **Password storage** — instead of storing your actual password, a system stores a hash of it (typically using **bcrypt**, a hash function purpose-built for passwords, with a built-in "work factor" that deliberately slows down brute-force attempts). This is exactly what secures your own Q-CAPS login, which you'll build in Phase 2 of this course.

**Digital signatures** combine hashing with asymmetric cryptography: the sender hashes their message, then encrypts that hash with their own private key. Anyone with the sender's public key can decrypt the hash and compare it to their own hash of the message — if they match, this proves both **authenticity** (only the real sender could have produced that signature) and **integrity** (any change to the message would produce a completely different hash).

**🎨 Interactive/Visual Requirement:**
> "Tamper detector" widget: a text box where the user edits a sentence character-by-character and watches a live SHA-256 hash output change completely (avalanche effect) in real time, computed client-side via `crypto.subtle.digest` — no backend call needed.

**Knowledge Check:** "What does a digital signature prove?" → **Authenticity and integrity** of the signed data together.

---

## 1.5 PKI (Public Key Infrastructure)

Public keys solve encryption, but they introduce a new question: how do you know a public key actually belongs to the person or website it claims to? This is where **PKI (Public Key Infrastructure)** comes in.

A **Certificate Authority (CA)** is a trusted organization that verifies an entity's identity and then digitally signs a certificate binding that entity's name to their public key. Your browser ships with a built-in list of trusted Root CAs. When you visit a website, its certificate is typically signed by an **Intermediate CA**, which is itself signed by a **Root CA** — forming a **chain of trust**. Your browser walks this chain, verifying each signature, until it reaches a Root CA it already trusts. If every link checks out, you see the padlock icon.

This chain has an important weak point: if the cryptography protecting any link — especially the Root CA — is broken, the entire chain of trust for every certificate beneath it collapses. This single idea is the emotional and technical throughline connecting this module to Module 3's discussion of quantum threats to PKI, and to Inba's scanner engine, which inspects exactly this chain on real systems.

**🎨 Interactive/Visual Requirement:**
> Chain-of-trust diagram: Root CA → Intermediate CA → Server Certificate, rendered as connected nodes. User clicks each node to see its role. Highlight in red: "If the Root CA's cryptography is broken, the entire chain collapses."

**Knowledge Check:** "In PKI, what is the role of a Certificate Authority?" → **It vouches for and signs digital certificates**, establishing the chain of trust.

---

## Module 1 Wrap-Up
**Summary:** You've now covered the three pillars of security (confidentiality, integrity, authenticity), how symmetric (AES) and asymmetric (RSA/ECC) encryption work and why they're used together, how hashing protects passwords and file integrity, how digital signatures combine both to prove authenticity, and how PKI extends trust across the internet through certificate chains.

- CTA: "Take the Module 1 Quiz" → `module_1_basics_questions.json`.
- On pass (≥70%), submission posted to Vishnu Priya's API in the exact Quiz Submission shape from `shared_data_schema.md`:
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
