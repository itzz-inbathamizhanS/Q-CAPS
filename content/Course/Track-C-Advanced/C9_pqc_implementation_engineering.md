# C9 — PQC Implementation Engineering
**module_id:** `track_c_c9_pqc_implementation_engineering`
**Level:** Advanced | **Estimated Time:** 200 minutes (hands-on) | **Track:** C — Specialist
**Prerequisite:** `C8`, `B11`

## Learning Objectives
- Implement ML-KEM, ML-DSA, and SLH-DSA operations directly, beyond the library-level usage in B11.
- Understand key generation, encapsulation/decapsulation, and signing/verification implementation details.
- Understand serialization, API design, memory considerations, performance tuning, interoperability, and deployment testing.

---

## 9.1 ML-KEM Implementation
Building on C8.4's mathematical foundation, this section walks through implementing ML-KEM's core operations directly (or studying a reference implementation closely): generating a Module-LWE-based keypair, and performing encapsulation/decapsulation — going beyond B11's black-box library usage to understand what's actually happening inside those function calls.

## 9.2 ML-DSA Implementation
Similarly, implementing or closely studying ML-DSA's signing and verification operations, built on the same Module-LWE/Module-SIS mathematical foundation covered in C8.4–8.5 — connecting the abstract lattice math directly to working code.

## 9.3 SLH-DSA Implementation
Implementing or studying SLH-DSA's hash-based signing process — building a Merkle tree (C8.6) of one-time signature keypairs (C8.7) and understanding why this construction results in the notably larger signature sizes discussed since B9.5.

## 9.4 Key Generation (Engineering Depth)
Practical engineering concerns in generating PQC keys correctly: sourcing sufficient high-quality randomness (connecting to C7.10), and avoiding subtle implementation bugs that have historically undermined otherwise-sound cryptographic schemes.

## 9.5 Encapsulation/Decapsulation
Implementation-level detail on the KEM operations introduced conceptually in B7.3/B9.2/C7.6 — including correct handling of decapsulation failures, a subtlety specific to lattice-based KEMs (due to the LWE noise term, decapsulation can rarely fail even with correct keys) that implementers must handle carefully to avoid introducing security weaknesses.

## 9.6 Signing/Verification
Implementation-level detail on ML-DSA and SLH-DSA signing/verification, including the performance and determinism considerations that differ between the two algorithm families.

## 9.7 Serialization
The practical concern of encoding PQC keys, ciphertexts, and signatures into byte formats for storage or network transmission — including current standardization efforts around consistent serialization formats to ensure interoperability, connecting to B10.6's interoperability discussion.

## 9.8 API Design
Best practices for exposing PQC operations through clean, misuse-resistant software APIs — designing interfaces that make the correct, secure usage pattern the easy default, reducing the chance of the implementation-level vulnerabilities catalogued fully in C10.

## 9.9 Memory Considerations
PQC keys and intermediate values are generally larger than their classical RSA/ECC counterparts, with implications for memory-constrained environments (embedded devices, smart cards) — a genuine deployment consideration, especially relevant for SLH-DSA's larger signatures (C8.7).

## 9.10 Performance
Building on B11's hands-on benchmarking, this section covers performance optimization techniques for PQC implementations: efficient polynomial arithmetic (for lattice-based schemes) and hardware acceleration opportunities (e.g., SIMD instructions, dedicated hardware).

## 9.11 Interoperability
Ensuring independent PQC implementations correctly interoperate — critical for real-world deployment where a client and server may use entirely different software libraries, extending B10.6's protocol-level discussion to the implementation level.

## 9.12 Deployment Testing
Closing the module with systematic testing methodology for PQC implementations before production deployment: known-answer tests (verifying against official test vectors), interoperability testing against multiple independent implementations, and performance regression testing.

**🎨 Interactive/Visual Requirement:**
> Step-through code walkthrough tool: annotated ML-KEM reference implementation where the learner can step through key generation, encapsulation, and decapsulation line-by-line, with each step's mathematical meaning (connecting back to C8.4) displayed alongside the code.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 9.1–9.12.
- Practical assessment: implement or configure a working ML-KEM key exchange from source/library, verify against official test vectors, and document a basic deployment test plan.
- Unlocks: `C10 — PQC Attack Surface`.
