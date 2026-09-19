# C10 — PQC Attack Surface
**module_id:** `track_c_c10_pqc_attack_surface`
**Level:** Advanced | **Estimated Time:** 180 minutes | **Track:** C — Specialist
**Prerequisite:** `C9`

> This module follows the program's Attack-to-Defense learning model: understanding how PQC implementations can be attacked directly enables the defense engineering practices covered in C11.

## Learning Objectives
- Understand side-channel, timing, cache-based, and power-analysis/fault-injection attack categories as they apply to PQC.
- Understand randomness weaknesses and key-generation failures as a recurring root cause.
- Understand implementation bugs, protocol downgrade, hybrid-mode weaknesses, certificate migration failures, and supply-chain risk.

---

## 10.1 Side-Channel Attacks
A **side-channel attack** extracts secret information not by breaking the underlying mathematics, but by observing unintended physical signals leaked during computation — timing, power consumption, electromagnetic emissions, or cache behavior. This is a critical theme for this module: a PQC algorithm can be mathematically unbreakable (per C7-C8's hardness assumptions) while still being practically broken through a poorly implemented side channel.

## 10.2 Timing Attacks
A specific side-channel category where an attacker measures how long an operation takes, inferring secret information if execution time varies depending on secret key bits — directly motivating the "constant-time" implementation requirement covered as a core defense in C11.2.

## 10.3 Cache-Based Attacks
A specific side-channel exploiting CPU cache behavior — observing which memory addresses were accessed (and thus present in cache) can leak information about secret-dependent memory access patterns, a documented real-world attack vector against several classical and PQC cryptographic implementations.

## 10.4 Power-Analysis Concepts
Particularly relevant to embedded and IoT devices: measuring a device's power consumption during a cryptographic operation can reveal information correlated with secret key bits — a mature attack category originally developed against classical smart-card cryptography, now an active research area for PQC implementations targeting similar constrained devices.

## 10.5 Fault-Injection Concepts
Deliberately inducing computational errors (via voltage glitches, laser pulses, or electromagnetic interference) and analyzing the resulting faulty output to extract secret key information — a physical attack category requiring device access, but a serious concern for hardware security modules (B7.10) and embedded PQC deployments.

## 10.6 Randomness Weaknesses
Revisiting C7.10's coverage of secure randomness specifically as an attack surface: weak or predictable randomness during key generation is one of the most common real-world causes of cryptographic failure across both classical and PQC systems, since a compromised randomness source can undermine an otherwise mathematically sound scheme entirely.

## 10.7 Key-Generation Failures
Building on 10.6 and C9.4: documented historical failure patterns in key generation — insufficient entropy at system boot, flawed random number generator implementations, or key reuse — with direct relevance to how PQC key generation must be implemented and tested (C9.12) to avoid repeating these failure classes.

## 10.8 Implementation Bugs
General software vulnerabilities (buffer overflows, incorrect boundary checks, logic errors) occurring within cryptographic library code — a reminder that most real-world cryptographic breaks in practice stem from implementation bugs rather than breaking the underlying mathematics, reinforcing why C9's implementation-engineering rigor matters as much as C8's mathematical foundations.

## 10.9 Protocol Downgrade
An attack where an adversary manipulates a protocol negotiation (e.g., during a TLS handshake) to force both parties into using a weaker, more easily broken algorithm than they would otherwise agree to — directly relevant to PQC migration, where a downgrade attack could force a connection back to classical-only cryptography even when both endpoints support PQC.

## 10.10 Hybrid-Mode Weaknesses
A nuanced, PQC-specific concern: incorrectly implemented hybrid classical+PQC cryptography (core Module 3.6, B11.6) could theoretically introduce new weaknesses if the combination method itself is flawed — even if both individual algorithms remain secure — underscoring why hybrid combiner constructions require their own careful security analysis, not just "use both and assume it's fine."

## 10.11 Certificate Migration Failures
Operational (not purely cryptographic) risks during PKI migration to PQC certificates: misconfigured certificate chains, incomplete trust store updates, or compatibility failures with systems not yet supporting PQC — connecting directly back to B7.5–7.6's PKI architecture and certificate lifecycle coverage.

## 10.12 Supply-Chain Risks
A closing, broader concern: the cryptographic libraries and hardware components an organization depends on for PQC implementation are themselves potential attack vectors if compromised upstream — an increasingly recognized risk category in modern security practice, relevant to the vendor requirements covered later in Track D's Governance module.

**🎨 Interactive/Visual Requirement:**
> Timing attack simulator: a simplified (non-real) comparison function where the learner can measure execution time across many guesses and observe how timing variation leaks information — a safe, hands-on demonstration of why constant-time implementation (previewed here, covered fully in C11.2) matters.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 10.1–10.12.
- Practical assessment: given a described PQC deployment scenario, identify the most likely attack surface category and propose an appropriate mitigation direction (fully developed in C11).
- Unlocks: `C11 — PQC Defense Engineering`.
