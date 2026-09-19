# B11 — Intermediate PQC Labs
**module_id:** `track_b_b11_intermediate_pqc_labs`
**Level:** Intermediate | **Estimated Time:** 200 minutes (hands-on) | **Track:** B — Engineering
**Prerequisite:** `B10`

## Learning Objectives
- Hands-on compare RSA/ECC against their PQC counterparts across real, measured metrics.
- Perform hybrid cryptography and TLS/PQC experimentation practically.
- Build a basic cryptographic inventory and begin PQC migration planning — direct rehearsal for the Intermediate Capstone.

---

## 11.1 RSA vs. PQC Comparison
Hands-on lab: using a cryptographic library (e.g., Open Quantum Safe's liboqs, or language-specific PQC bindings), generate RSA-3072 and ML-KEM-768 keypairs and directly compare key generation time, key size, and operation speed — turning B9/B10's conceptual comparisons into measured, personally-verified data.

## 11.2 ECDH vs. ML-KEM
Hands-on lab: perform a classical ECDH key exchange and an ML-KEM key encapsulation side by side, comparing the number of round trips, data transmitted, and computation time — directly informing real protocol-design tradeoffs.

## 11.3 ECDSA vs. ML-DSA
Hands-on lab: sign and verify the same message using ECDSA and ML-DSA, comparing signature size and signing/verification speed — building the same kind of measured intuition as 11.1–11.2, now for signatures.

## 11.4 Key/Signature Size Benchmarking
Consolidating 11.1–11.3 into a structured benchmark report: tabulate key sizes, signature sizes, and operation timings across all algorithms tested, producing a small dataset the learner can reference and reason from for the rest of the program — genuine hands-on evidence rather than memorized numbers.

## 11.5 TLS/PQC Experimentation
Hands-on lab: configure a test TLS server/client pair (e.g., using OpenSSL with PQC support, or a library like liboqs's OpenSSL provider) to negotiate a PQC or hybrid key exchange, and inspect the resulting handshake — connecting B10.6's interoperability discussion to a real, working deployment.

## 11.6 Hybrid Cryptography (Hands-On)
Building on core Module 3.6's conceptual introduction, this lab configures and tests an actual hybrid classical+PQC handshake (e.g., X25519 + ML-KEM combined), verifying that the resulting session remains secure and interoperable — the practical skill underlying real-world migration strategy.

## 11.7 PQC Performance Benchmarking
Extending 11.4 to full protocol-level performance: measuring the real-world latency and throughput impact of switching a test service from classical to hybrid or pure-PQC cryptography — the kind of data an organization would need before committing to a production migration.

## 11.8 Cryptographic Inventory (Hands-On)
Hands-on exercise: given a small set of simulated/test systems, perform manual and tool-assisted discovery of what cryptographic algorithms and key sizes are in use — a smaller-scale, individual rehearsal of the Cryptographic Discovery process that Track D's Enterprise track covers at organizational scale, and directly related to what Inba's scanner engine automates for Q-CAPS.

## 11.9 PQC Migration Planning (Hands-On)
Synthesizing the entire module: using the benchmark data (11.4, 11.7) and cryptographic inventory (11.8) produced in this module, draft a basic migration plan for the lab environment — prioritizing which systems to migrate first, and whether hybrid or pure-PQC is appropriate for each. This exercise is the direct rehearsal for the Intermediate Capstone.

**🎨 Interactive/Visual Requirement:**
> Benchmark results dashboard: auto-populated from the learner's own lab results across 11.1–11.7, rendered as comparison charts — giving each learner a personalized, data-driven summary rather than a generic pre-made chart.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 11.1–11.9.
- Practical assessment: this module's hands-on labs collectively double as direct preparation for the **Intermediate Capstone** — design and test a quantum-safe migration for a fictional organization (cryptographic inventory → vulnerable-system identification → PQC selection → hybrid deployment → performance validation).
- Completion unlocks: **Certificate — CQSE (Certificate in Quantum Security Engineering)**, and progression to **Track C — Advanced / Quantum & PQC Specialist** (or relevant Bridge Modules).
