# Q-CAPS Track A Lesson Design v1

Oct 3, 2026 · @Inbathamizhan S

## 1. Conventions

Track A becomes 61 lessons across 9 modules, about 19 hours of required learning, with one measurable objective per lesson, one module practical each, and a four-part Beginner Capstone. This document designs structure only; no lesson text or quiz item is written here. It implements *Q-CAPS Curriculum Architecture v1* §4.

**Defaults applied for the open items** (change them and this design adjusts):

- **O1 order:** the table order is the recommended order; only listed prerequisites are enforced.
- **O2 leadership path:** none in v1; Track A is required for everyone.
- **O10 lesson length:** 15–25 minutes, so module time now reflects actual content.

**Lesson ids.** `<module code>.L<n>`, e.g. `A5.L3`, stored alongside the kept `module_id`. Display codes follow Architecture §4 (A1–A9).

**Reading the tables.**

- *Objective* — what the learner can do after the lesson; every quiz item and practical criterion traces to one.
- *Competency · depth* — the skill-model id and depth tag (Aware, Explain, Apply, Analyse).
- *From* — the current repository section it builds on (e.g. `5.2`), or **new**.
- *Source* — the reference-library chapter that backs it, where one exists; "—" means no library source yet (Architecture O7).
- *Min* — estimated learner minutes.

**Changes against the architecture.** Two depths were raised during lesson design because the objectives require it: A2 teaches MATH.4 at Explain (was Aware), and A4's threat-modelling lesson stays at Explain with a practical that previews Apply. Both are noted where they occur.

## 2. A1–A3: computing, mathematics and networking

These three modules can be taken in any order; A2 must precede A5, and A1 must precede A8.

### A1 Computing and Programming Foundations — 7 lessons, 150 min

`track_a_a1_computing_foundations` · no prerequisites

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A1.L1 How a computer runs a program | describe how CPU, memory and storage cooperate to execute a program | COMP.1 · Explain | 1.1, 1.3 | — | 20 |
| A1.L2 Operating systems, processes and permissions | explain processes, users and file permissions, and why least privilege matters | COMP.1 · Explain | 1.2 | — | 20 |
| A1.L3 Linux command line | navigate, inspect and change permissions on files from a shell | COMP.2 · Apply | 1.8 | — | 25 |
| A1.L4 Python basics | write a script using variables, conditions, loops and functions | PROG.1 · Apply | 1.4, 1.5 | — | 25 |
| A1.L5 Working with data and bytes in Python | read files and convert between text, bytes and hex | PROG.1 · Apply | 1.5 (new emphasis on bytes) | — | 20 |
| A1.L6 Algorithms and growth rates | compare growth rates and explain why a 2ⁿ search becomes infeasible | PROG.2 · Explain | 1.6 | — | 20 |
| A1.L7 Git and development environments | clone, commit, branch, and use a virtual environment | PROG.3 · Apply | 1.7 | — | 20 |

A1.L5 and A1.L6 are the hooks later modules rely on: bytes for A5–A6 labs, growth rates for key-length and Grover arguments.

### A2 Mathematics Foundations — 7 lessons, 135 min

`track_a_a2_mathematics_foundations` · A1 recommended

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A2.L1 Algebra, exponents and logarithms | solve exponent and log expressions and relate an n-bit key to 2ⁿ possibilities | MATH.1 · Apply | 2.1, 2.2 | — | 20 |
| A2.L2 Probability and statistics | compute probabilities of independent events and expected values | MATH.2 · Apply | 2.3 | — | 20 |
| A2.L3 Boolean logic and XOR | evaluate truth tables and use XOR's self-inverse property | MATH.1 · Apply | 2.8 | — | 15 |
| A2.L4 Modular arithmetic, primes and gcd | compute small modular sums, products and gcds, and explain "clock arithmetic" | MATH.4 · Explain (raised from Aware) | **new** | Paar Ch 1.4 | 20 |
| A2.L5 Complex numbers | add, multiply and find the magnitude of complex numbers | MATH.3 · Explain | 2.4 | — | 20 |
| A2.L6 Vectors and matrices | multiply a matrix by a vector and interpret a vector as a state | MATH.3 · Apply | 2.5, 2.6 | — | 25 |
| A2.L7 Eigenvalues, conceptually | explain what an eigenvector is and recognise one in a 2×2 example | MATH.3 · Aware | 2.7 | — | 15 |

A2.L4 is new and must precede A6, where RSA and Diffie–Hellman are computed with small numbers.

### A3 Networking Foundations — 7 lessons, 135 min

`track_a_a3_networking_foundations` · no prerequisites

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A3.L1 Networks and layered models | map common protocols to OSI and TCP/IP layers | NET.1 · Explain | 3.1, 3.2 | — | 20 |
| A3.L2 IP addressing and subnetting | calculate subnet ranges and contrast IPv4 with IPv6 | NET.1 · Apply | 3.3, 3.4 | — | 25 |
| A3.L3 TCP and UDP | explain ports, the TCP handshake and when UDP is used | NET.1 · Explain | 3.5 | — | 15 |
| A3.L4 DNS and DHCP | trace a DNS resolution and explain a DHCP lease | NET.2 · Explain | 3.6 | — | 20 |
| A3.L5 HTTP and HTTPS | read an HTTP exchange and identify where TLS sits | NET.2 · Explain | 3.7 | — | 15 |
| A3.L6 Routing, firewalls and VPNs | explain a packet's path and how filtering and tunnelling change it | NET.3 · Aware | 3.8, 3.9 | Om Pal Ch 4 (partial) | 20 |
| A3.L7 Monitoring and packet capture | find a DNS query, TCP handshake and TLS version in a packet capture | NET.2 · Apply | 3.10 | — | 20 |

## 3. A4–A6: cybersecurity and classical cryptography

A4 adds ethics and threat modelling; A5 and A6 replace the single 11-primitive crypto module with two modules of 7 lessons each, sequenced as Paar's textbook does.

### A4 Cybersecurity Foundations — 8 lessons, 145 min

`track_a_a4_cybersecurity_foundations` · requires A3

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A4.L1 The CIA triad | classify an incident by its confidentiality, integrity and availability impact | SEC.1 · Explain | 4.1 | — | 15 |
| A4.L2 Authentication, authorisation and IAM | distinguish authentication from authorisation and explain MFA, RBAC and least privilege | SEC.1 · Explain | 4.2, 4.3 | — | 20 |
| A4.L3 Threats, vulnerabilities and attacks | distinguish threat, vulnerability and risk, and name common attack classes | SEC.2 · Explain | 4.4 | — | 20 |
| A4.L4 Threat modelling basics | identify threats to a simple data-flow diagram using a structured checklist | SEC.2 · Explain | **new** | — | 20 |
| A4.L5 Network and endpoint controls | explain how layered network and endpoint controls reduce exposure | SEC.1 · Explain | 4.5, 4.6 | Om Pal Ch 4 (partial) | 20 |
| A4.L6 Monitoring and incident response | order the incident-response phases and triage a sample alert | SEC.3 · Explain | 4.7, 4.8 | Om Pal Ch 13 (partial) | 20 |
| A4.L7 Risk fundamentals | rate a risk as likelihood × impact on a simple matrix | SEC.4 · Aware | 4.9 | BQS Ch 4 (heat map) | 15 |
| A4.L8 Ethics, authorisation and legal scope | explain why written authorisation and agreed scope are required before any scan, and what Q-CAPS's scanner permits | SEC.5 · Explain | **new** | — | 15 |

A4.L8 is the gate for every later scanner exercise (B10, D2) and should be required before scanner access is granted.

### A5 Cryptography I: Symmetric Encryption and Integrity — 7 lessons, 130 min

`track_a_a5_cryptography_foundations` (narrowed) · requires A2

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A5.L1 Goals, keys and Kerckhoffs's principle | define plaintext, ciphertext, key and key space, and explain why security must rest on the key | CRYPTO.1 · Explain | 5.1 | Paar Ch 1 | 15 |
| A5.L2 Block ciphers and AES | describe AES as a keyed permutation and compare key sizes | CRYPTO.1 · Explain | 5.2 | Paar Ch 4 | 20 |
| A5.L3 Modes of operation and AEAD | explain why ECB leaks patterns, how CTR and GCM work, and why nonce reuse is dangerous | CRYPTO.1 · Explain | **new** | Paar Ch 5 | 25 |
| A5.L4 Stream ciphers and ChaCha20 | explain keystream encryption and the need for unique nonces | CRYPTO.1 · Explain | **new** | Paar Ch 2 | 15 |
| A5.L5 Hash functions | state preimage, second-preimage and collision resistance and name SHA-2 and SHA-3 uses | CRYPTO.2 · Explain | 5.3 | Paar Ch 11 | 20 |
| A5.L6 MACs and HMAC | explain how a MAC adds authenticity that a plain hash lacks | CRYPTO.2 · Explain | 5.4 | Paar Ch 13 | 15 |
| A5.L7 Randomness and key derivation | distinguish a CSPRNG from a PRNG and explain what a KDF does | CRYPTO.2 · Explain | **new** (part of 5.11) | Paar Ch 2.2, 14.2 | 20 |

A5.L3 and A5.L7 close the two largest foundational gaps found in the inventory (Gap §4.3).

### A6 Cryptography II: Public Key, Signatures and PKI — 7 lessons, 135 min

`track_a_a5p_public_key_pki` (new) · requires A5

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A6.L1 The key distribution problem | explain why symmetric keys don't scale and what public-key crypto changes | CRYPTO.3 · Explain | 5.6 intro | Paar Ch 6 | 15 |
| A6.L2 RSA with small numbers | compute a toy RSA key pair, encryption and decryption, and explain why real RSA needs padding | CRYPTO.3 · Explain | 5.6 | Paar Ch 7 | 25 |
| A6.L3 Diffie–Hellman and discrete logs | compute a toy Diffie–Hellman exchange and state the discrete-log problem | CRYPTO.3 · Explain | 5.8 | Paar Ch 8 | 20 |
| A6.L4 Elliptic curves, conceptually | explain why ECC achieves similar security with shorter keys | CRYPTO.3 · Aware | 5.7 | Paar Ch 9 | 15 |
| A6.L5 Digital signatures | explain signing and verification and compare RSA and ECDSA signatures | CRYPTO.4 · Explain | 5.5 | Paar Ch 10 | 20 |
| A6.L6 Certificates and PKI | trace a certificate chain to a trusted root and explain revocation | CRYPTO.4 · Explain | 5.9 | Paar Ch 14.5 | 20 |
| A6.L7 TLS and key lifecycle overview | identify which primitive does which job in a TLS 1.3 handshake, and name key-lifecycle stages | NET.4 · Aware; CRYPTO.5 · Aware | 5.10, 5.11 | Paar Ch 14 | 20 |

A6.L2 and A6.L3 are the first place learners meet factoring and discrete logs, which A9 then shows Shor's algorithm breaks.

## 4. A7–A9: quantum foundations, programming and threat awareness

The quantum modules keep their current content order; A9 is rebuilt from old A8 at Beginner depth and adds Mosca's inequality and a hype-check lesson.

### A7 Quantum Foundations — 7 lessons, 135 min

`track_a_a6_quantum_foundations` · requires A2 and A6

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A7.L1 Bits, qubits and quantum states | write a single-qubit state as a vector and contrast it with a classical bit | QNT.1 · Explain | 6.1, 6.2 | BQS Ch 1 | 20 |
| A7.L2 Superposition, amplitudes and measurement | compute measurement probabilities from amplitudes | QNT.1 · Explain | 6.3, 6.4, 6.5 | — | 25 |
| A7.L3 The Bloch sphere | place basis and equal-superposition states on the Bloch sphere | QNT.1 · Aware | 6.6 | — | 15 |
| A7.L4 Single-qubit gates | apply X, Z and H to a state using matrices | QNT.2 · Explain | 6.7 | — | 20 |
| A7.L5 Multi-qubit states and tensor products | form a two-qubit state from two single-qubit states | QNT.2 · Explain | 6.11 | — | 20 |
| A7.L6 Circuits, CNOT and entanglement | build a Bell state on paper and explain why it cannot be written as a product | QNT.2 · Explain | 6.8, 6.9 | — | 20 |
| A7.L7 Interference | explain how interference amplifies right answers, and why "trying all answers at once" is a misconception | QNT.2 · Explain | 6.10 | Stinson §1 (intro) | 15 |

### A8 First Quantum Programming — 5 lessons, 90 min required + 20 optional

`track_a_a7_first_quantum_programming` · requires A1 and A7

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A8.L1 Qiskit concepts and setup | install the SDK and explain circuits, backends and jobs | PROG.4 · Apply | 7.1 | — | 20 |
| A8.L2 Building circuits with basic gates | build circuits with X, H, Z and CNOT in code | PROG.4 · Apply | 7.2, 7.5 | — | 25 |
| A8.L3 Simulators, shots and measurement statistics | run a circuit on a simulator and interpret the histogram | PROG.4 · Apply; MATH.2 · Apply | 7.3, 7.4 | — | 25 |
| A8.L4 Noise | compare ideal and noisy simulation results and explain the difference | QNT.2 · Explain | 7.6 | — | 20 |
| A8.L5 Optional: real hardware | submit a circuit to a public quantum device and compare with simulation | PROG.4 · Apply | 7.7 | — | 20 (optional) |

The Beginner Capstone currently inside the A7 markdown file moves to the end of Track A (section 5). A8.L5 is optional because hardware access depends on an external account and queue.

### A9 Quantum Threat and PQC Awareness — 6 lessons, 105 min

`track_a_a8_pqc_mitigation` (rewritten, Beginner) · requires A6 and A7

| Lesson | Objective — the learner can… | Competency · depth | From | Source | Min |
| --- | --- | --- | --- | --- | --- |
| A9.L1 What quantum computers threaten, and what they don't | state that Shor's algorithm breaks RSA, ECC and Diffie–Hellman while Grover only weakens symmetric keys and hashes | PQC.1 · Explain; QNT.4 · Aware | 3.1, 3.2 | Stinson §1; Paar Ch 12.1 | 25 |
| A9.L2 Harvest now, decrypt later, and Mosca's inequality | decide whether data is at risk using shelf life + migration time vs time to a cryptographically relevant quantum computer | PQC.1 · Explain | 3.3 + **new** | BQS Ch 1, 5 | 20 |
| A9.L3 What PQC is — and how it differs from QKD | name the main PQC families and contrast PQC with quantum key distribution | PQC.2 · Aware | 3.4 | Stinson §2–5; BQS Ch 3 | 15 |
| A9.L4 The standards landscape | match ML-KEM, ML-DSA and SLH-DSA to FIPS 203, 204 and 205, and note FN-DSA and HQC status (verified at publish time) | PQC.3 · Aware | 3.5 | FIPS 203; Stinson §1 | 15 |
| A9.L5 Crypto-agility and hybrid deployment | explain why organisations combine classical and PQC algorithms during transition | PQC.6 · Aware | 3.6 | BQS Ch 8 | 15 |
| A9.L6 Reading quantum claims critically | distinguish physical from logical qubits and question claims about imminent RSA breaks | QNT.5 · Aware | **new** | Stinson (Threat Timeline Report 2024) | 15 |

Old A8's detailed Shor and Grover mechanics move to B3 and B7, where the prerequisite maths exists.

## 5. Practicals and Beginner Capstone

Each module gets one practical that tests its Apply-level objectives; seven of nine can be graded automatically, but five need a code-execution environment Q-CAPS does not yet have.

### 5.1 Module practicals

| Module | Practical | Tests | Learner submits | Grading | Environment needed |
| --- | --- | --- | --- | --- | --- |
| A1 | Write a Python script that reads a provided file, prints its size and a hex preview, and commit it to a Git repository | A1.L3–L5, L7 | Script + commit hash or repo export | Automated: run against hidden inputs | Python runner; Git (local or exported) |
| A2 | Implement gcd, modular exponentiation and 2×2 matrix–vector multiplication | A2.L1, L4, L6 | Functions | Automated unit tests | Python runner |
| A3 | Analyse a **provided** packet capture: find the DNS query, TCP handshake and TLS version | A3.L2–L5, L7 | Answers to structured questions | Automated answer check | File download only |
| A4 | Threat-model a provided small web-app diagram and triage three sample alerts | A4.L3, L4, L6 | Threat list + triage decisions | Triage auto-checked; threat list by rubric | None |
| A5 | Encrypt and decrypt with AES-GCM, show tamper detection, then show ECB pattern leakage on a provided image | A5.L2, L3, L6 | Script output | Automated checks on outputs | Python runner with a crypto library |
| A6 | Compute toy RSA and Diffie–Hellman by hand-sized numbers in Python, then read a provided certificate chain and name each algorithm | A6.L2, L3, L6, L7 | Values + structured answers | Automated | Python runner |
| A7 | Compute output probabilities for three small circuits | A7.L2, L4–L6 | Numeric answers | Automated with tolerance | None |
| A8 | Build Bell and GHZ circuits, run ideal and noisy simulations, and explain the difference | A8.L2–L4 | Notebook + 3-sentence explanation | Distribution auto-checked; explanation by rubric | Qiskit runner |
| A9 | Apply Mosca's inequality to three data types and complete re-pointed escape rooms 1–3 | A9.L1, L2, L5 | Worksheet + escape-room results | Automated | None |

The A3 and A6 practicals use **provided** files rather than live captures or live sites, so no learner traffic or third-party systems are involved.

### 5.2 Beginner Capstone

Taken after all nine modules; required for CQF. Four parts, one per Track A strand, using scenario materials Q-CAPS provides.

| Part | Task | Draws on |
| --- | --- | --- |
| 1 Secure | For a provided small-office network diagram, write five firewall rules and a short threat model | A3, A4 |
| 2 Protect | Encrypt a file with AES-GCM and sign it, then verify both with a provided script | A5, A6 |
| 3 Explore | Build and run a 2-qubit entanglement circuit on a simulator | A7, A8 |
| 4 Assess | One page: which of parts 1–3 rely on quantum-vulnerable cryptography, what Mosca's inequality says about the scenario's data, and what you would migrate first | A9 |

Graded with the shared four-criterion rubric (Architecture §8.3): technical correctness, justification against sources, security and risk reasoning, communication of trade-offs. Parts 2 and 3 are auto-checked for correctness; parts 1 and 4 need a reviewer.

## 6. Item-bank plan and build effort

Track A needs a bank of at least 216 graded items; the repository supplies 43 seed items, so about 173 must be written, plus about 122 separate lesson-check items.

### 6.1 Graded item bank per module

Bank minimum = the larger of 3 items per lesson objective or twice a 12-item quiz form (24), per Architecture §8.2.

| Module | Lessons | Bank minimum | Seed items from repo | New items needed |
| --- | --- | --- | --- | --- |
| A1 Computing and Programming | 7 | 24 | 5 | 19 |
| A2 Mathematics | 7 | 24 | 5 | 19 |
| A3 Networking | 7 | 24 | 5 | 19 |
| A4 Cybersecurity | 8 | 24 | 5 | 19 |
| A5 Crypto I | 7 | 24 | \~3 (split of old A5) | \~21 |
| A6 Crypto II | 7 | 24 | \~2 (split of old A5) | \~22 |
| A7 Quantum Foundations | 7 | 24 | 5 (old A6) | 19 |
| A8 First Quantum Programming | 5 | 24 | 5 (old A7) | 19 |
| A9 Threat and PQC Awareness | 6 | 24 | 8 (old A8) | 16 |
| **Total** | **61** | **216** | **43** | **\~173** |

Seed items count only after they are re-tagged with lesson, competency and depth, and their answer positions rebalanced; any that no longer match an objective are retired rather than forced in.

### 6.2 Other item pools

- **Lesson checks:** about 2 per lesson (≈122), formative only and kept separate from the graded bank so practising never exposes quiz items.
- **Placement test:** 5 items per domain drawn from the Track A banks; Track A already touches all 8 domains, so placement can launch with Track A.
- **Distribution rule:** within each module bank, at least one item per objective at the objective's stated depth, and answer keys spread evenly across positions.

### 6.3 Time

Required learning time is 1,160 minutes (about 19.3 hours) across 61 lessons, plus the optional 20-minute hardware lesson, practicals and the capstone. Today's Track A declares 1,070 minutes but its rendered text is about 3,800 words in total, roughly 475 per module; the new estimate assumes lessons are written to fill their minutes (Architecture O10).

## 7. Open items before authoring

The two decisions that most affect build effort are where learner code runs and who reviews capstones; the rest are assets and references to gather.

| # | Item | Why it matters | Default if undecided |
| --- | --- | --- | --- |
| T1 | Code execution: in-browser Python (e.g. Pyodide) vs a server-side sandbox | A1, A2, A5, A6 need Python; A8 needs Qiskit, which may not run in-browser. A server sandbox is security-sensitive (isolation, resource limits, no network) | In-browser for A1–A6; Qiskit via local install with notebook upload until a sandbox is reviewed |
| T2 | Crypto library for A5/A6 labs | Must offer AES-GCM, RSA and signatures in the chosen runtime | Verify availability in the runtime before authoring A5/A6 practicals |
| T3 | Scenario assets | Practicals depend on a packet capture, a certificate chain, two diagrams, sample alerts and an ECB demo image | Create synthetic assets owned by Q-CAPS; no real third-party data |
| T4 | Capstone review (Architecture O6) | Parts 1 and 4 need a human reviewer | Instructor review |
| T5 | Standards status for A9.L4 | FN-DSA and HQC status may have changed after Aug 2025 | Verify on nist.gov at authoring time and record the date checked |
| T6 | References for A1, A3, A7, A8 | No library source backs these lessons (Architecture O7) | Use official Python, Qiskit and IETF documentation; add a vendor-neutral networking text |
| T7 | Subject-matter review | Crypto and quantum lessons need accuracy review before release | One technical reviewer per strand (crypto, quantum, networking/security) |
| T8 | Seed-item triage | 43 seed items must be re-tagged or retired | Do this first; it is quick and unblocks quiz forms |

**Suggested next stage:** settle T1, then either (a) design Track B at lesson level in the same format, or (b) start authoring Track A, beginning with A5 and A6 because they close the largest gaps.
