# C6 — Quantum Key Distribution
**module_id:** `track_c_c6_quantum_key_distribution`
**Level:** Advanced | **Estimated Time:** 160 minutes | **Track:** C — Specialist
**Prerequisite:** `C5`

> Note: throughout this module, keep reinforcing the QKD-vs-PQC distinction first introduced in core Module 2.3 and formalized in B9.1 — this module goes deep on QKD specifically because understanding it well is what makes the distinction from PQC credible and precise, not because Q-CAPS is a QKD platform.

## Learning Objectives
- Understand the BB84, B92, and E91 protocols in technical depth.
- Understand decoy-state methods and both measurement-device-independent and device-independent QKD.
- Understand QKD attack models, eavesdropping detection, deployment architecture, and — critically — QKD's practical limitations relative to PQC.

---

## 6.1 BB84
The original and most widely deployed QKD protocol (Bennett & Brassard, 1984): the sender encodes random bits into photon polarization using randomly chosen bases, the receiver measures using randomly chosen bases, and after publicly comparing (but not revealing) which bases were used, both parties discard mismatched-basis results, leaving a shared secret key. Security stems from the no-cloning theorem (B2.8): any eavesdropper attempting to intercept and measure photons in transit inevitably introduces detectable errors.

## 6.2 B92
A simplified variant of BB84 using only two non-orthogonal quantum states instead of four, trading some practical robustness for conceptual and implementation simplicity — useful for building intuition before tackling entanglement-based protocols like E91.

## 6.3 E91
Unlike BB84/B92, which use single photons in different bases, **E91** (Ekert, 1991) is built directly on shared entanglement (C4.2) between sender and receiver, using Bell's inequality violations to simultaneously establish a shared key and mathematically prove the absence of eavesdropping — an elegant connection between the deep foundational physics of entanglement and a practical security application.

## 6.4 Decoy-State Concepts
A practical enhancement addressing a real-world vulnerability in photon-source implementations: since perfect single-photon sources are difficult to build, **decoy states** (deliberately varying photon intensity) allow legitimate parties to detect certain classes of attacks that exploit multi-photon pulses — an example of the gap between idealized protocol security proofs and real hardware security.

## 6.5 Measurement-Device-Independent QKD
**MDI-QKD** addresses vulnerabilities in the *measurement* devices used in standard QKD implementations (a common real-world attack surface) by routing measurement through an untrusted third party in a way that remains provably secure even if that measurement device is fully compromised by an attacker.

## 6.6 Device-Independent Concepts
An even stronger security model where security is guaranteed based purely on observed statistical correlations (Bell inequality violations, as in E91) without needing to trust the internal workings of *any* device involved — the theoretical gold standard for QKD security, though currently more experimentally demanding to implement at practical rates.

## 6.7 QKD Attack Models
A survey of practical attacks demonstrated against real QKD implementations — not attacks on the underlying theory, but on real hardware imperfections (e.g., "blinding" attacks against single-photon detectors) — an important, sobering reminder that provable protocol security doesn't automatically guarantee implementation security, a theme that reappears in C10's PQC Attack Surface module.

## 6.8 Eavesdropping Detection
The formal mechanism by which QKD protocols detect an eavesdropper: comparing a sample of the shared key over a public channel and calculating the resulting error rate — if it exceeds a theoretical threshold consistent with normal channel noise, the parties know an eavesdropper (or excessive noise) is present and discard the key.

## 6.9 QKD Deployment Architecture
Building on C4's networking foundations, this section covers practical QKD deployment considerations: point-to-point links, trusted-node networks (where intermediate nodes must be physically secured, since quantum repeaters for QKD specifically remain largely experimental), and integration with classical network infrastructure.

## 6.10 QKD Limitations
A direct, honest accounting: QKD requires dedicated point-to-point (or trusted-node) hardware infrastructure, has significant distance limitations without mature quantum repeaters, cannot easily support the internet's many-to-many communication pattern, and — critically — only secures key *distribution*, not the actual encryption of data, which still relies on a classical symmetric algorithm like AES.

## 6.11 QKD vs. PQC (Full Comparison)
The capstone comparison of this module, and the most important section for Q-CAPS's own positioning: QKD offers information-theoretic security guaranteed by physics, but requires specialized hardware, has deployment/distance constraints, and doesn't scale easily to the internet. PQC requires no special hardware, deploys over existing infrastructure at internet scale, and integrates directly into protocols like TLS — but its security rests on computational hardness assumptions (believed secure, not physically proven, distinct from QKD's guarantee). This is precisely why Q-CAPS — designed for scalable, practical, internet-wide deployment — is built around PQC rather than QKD.

**🎨 Interactive/Visual Requirement:**
> BB84 protocol simulator: step-by-step walkthrough where the learner acts as sender or receiver, choosing random bases, and sees an eavesdropper (toggleable) introduce detectable errors in the resulting key — the clearest possible hands-on demonstration of why QKD's security works.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 6.1–6.11.
- Practical assessment: simulate a BB84 key exchange with and without an eavesdropper present, and calculate the resulting error rate in each case.
- Unlocks: `C7 — Advanced Cryptography`.
