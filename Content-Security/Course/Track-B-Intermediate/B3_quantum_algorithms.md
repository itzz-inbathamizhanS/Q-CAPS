# B3 — Quantum Algorithms
**module_id:** `track_b_b3_quantum_algorithms`
**Level:** Intermediate | **Estimated Time:** 180 minutes | **Track:** B — Engineering
**Prerequisite:** `B1`, `B2`

## Learning Objectives
- Understand the historical progression of quantum algorithms from Deutsch-Jozsa through Shor.
- Understand Grover's algorithm and amplitude amplification in depth.
- Understand the Quantum Fourier Transform and phase estimation, and how they enable Shor's algorithm.
- Gain introductory exposure to quantum walks and variational algorithms.

---

## 3.1 Deutsch-Jozsa Algorithm
The **Deutsch-Jozsa algorithm** was one of the first algorithms to demonstrate a provable quantum speedup — determining whether a function is "constant" or "balanced" in a single query, versus potentially exponentially many queries classically. While not practically useful on its own, it's the historical proof-of-concept that quantum computers can outperform classical ones for certain structured problems, setting the stage for everything that follows.

## 3.2 Bernstein-Vazirani Algorithm
A related early algorithm that finds a hidden bit-string in a single query, versus n queries classically — another foundational demonstration of quantum parallelism applied to a structured problem.

## 3.3 Simon's Algorithm
**Simon's algorithm** solves a hidden-period-finding problem exponentially faster than any classical algorithm, and — importantly for this course — its core technique directly inspired the period-finding approach at the heart of **Shor's algorithm**.

## 3.4 Grover's Algorithm (Full Treatment)
Building on the introduction in core Module 3.2, this section covers Grover's algorithm's actual mechanism: **amplitude amplification** — repeatedly applying an "oracle" (marking the correct answer) and a "diffusion" operator (amplifying the marked state's amplitude while suppressing others) across roughly √N iterations to search an unsorted database of N items, versus N/2 average classical queries.

## 3.5 Quantum Fourier Transform (QFT)
The **Quantum Fourier Transform** is the quantum analog of the classical discrete Fourier transform, but computable exponentially faster on a quantum computer. It's not useful as a standalone algorithm, but it's the critical subroutine inside both phase estimation and Shor's algorithm.

## 3.6 Phase Estimation
**Quantum phase estimation** uses the QFT to determine the eigenvalue phase of a unitary operator applied to one of its eigenvectors — this exact technique is the mathematical engine that makes Shor's algorithm work, extracting the periodicity information needed to factor large numbers.

## 3.7 Shor's Algorithm (Full Treatment)
Building on core Module 3.1's threat-level introduction, this section covers the actual algorithm: reducing integer factorization to a period-finding problem, then using QFT-based phase estimation to find that period exponentially faster than any known classical method — the complete technical picture behind why RSA and ECC are vulnerable to a sufficiently powerful quantum computer.

## 3.8 Amplitude Amplification (General Framework)
Grover's algorithm (3.4) is actually a special case of a more general technique called **amplitude amplification**, which can be applied to boost the success probability of a wide range of quantum algorithms beyond simple search.

## 3.9 Quantum Walks
The quantum analog of classical random walks, offering speedups for certain graph-search and optimization problems — an active research area with applications beyond pure cryptography.

## 3.10 Variational Algorithms (Introduction)
A brief introduction to the family of algorithms (fully covered in Track C) that combine a quantum circuit with classical optimization — designed to run usefully even on today's noisy, error-prone NISQ-era hardware, unlike Shor's algorithm which requires full error correction.

## 3.11 Complexity Analysis
Closing the module with the formal language for comparing algorithms: Big-O notation, and precisely how "exponential speedup" (Shor's) differs from "quadratic speedup" (Grover's) in complexity-theory terms — tying directly back to the distinction first introduced conceptually in core Modules 3.1 and 3.2.

**🎨 Interactive/Visual Requirement:**
> Side-by-side algorithm complexity chart: classical vs. quantum runtime curves plotted as problem size grows, for Grover's (quadratic) and Shor's (exponential) — visually cements why Shor's is the far more serious cryptographic threat.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 3.1–3.11.
- Practical assessment: implement Deutsch-Jozsa and Grover's algorithm in Qiskit for a small input size, and observe measured runtime/success-rate against theoretical predictions.
- Unlocks: `B4 — Quantum Programming`.
