# A6 — Quantum Foundations
**module_id:** `track_a_a6_quantum_foundations`
**Level:** Beginner | **Estimated Time:** 140 minutes | **Track:** A — Foundations
**Prerequisite:** `A2` (math) and `A5` (crypto) recommended

> Note: this module overlaps with the core **PQC Foundations Module 2 (`module_2_quantum`)**. Treat this as reinforcement with added formal depth (Bloch sphere, interference, tensor products) — allow "test out" credit if `module_2_quantum` is already passed.

## Learning Objectives
- Reinforce classical bits vs. qubits, superposition, and measurement with more formal treatment.
- Understand probability amplitudes and visualize single-qubit states using the Bloch sphere.
- Understand quantum gates, circuits, entanglement, interference, and tensor products at an introductory level.

---

## 6.1 Classical Bits vs. Qubits
Reinforces core Module 2.1. A classical bit is deterministic (always 0 or 1); a qubit's state is described probabilistically until measured.

## 6.2 Quantum States
A quantum state is the complete mathematical description of a qubit (or system of qubits) at a given moment — written as a vector of complex probability amplitudes.

## 6.3 Superposition
Reinforces core Module 2.1–2.2. Revisit the spinning-coin analogy, then move to the formal α|0⟩ + β|1⟩ notation with concrete numeric examples (e.g., an equal superposition where α = β = 1/√2).

## 6.4 Measurement
Measurement is the act of "asking" a qubit for a definite classical answer, collapsing its superposition. Crucially, measurement is probabilistic and destructive — once measured, the superposition information is gone.

## 6.5 Probability Amplitudes
Deeper treatment of α and β: they are complex numbers (connecting back to A2.4), and their squared magnitudes (|α|² and |β|²) give real, physical measurement probabilities that must sum to 1.

## 6.6 Bloch Sphere
The **Bloch sphere** is a geometric way to visualize any single-qubit state as a point on the surface of a 3D sphere — the north and south poles represent the definite |0⟩ and |1⟩ states, while every other point represents a superposition. This is the single most useful visualization tool for building single-qubit intuition.

**🎨 Interactive/Visual Requirement:**
> Interactive 3D Bloch sphere: user drags a point on the sphere's surface and sees the corresponding α|0⟩ + β|1⟩ notation update live, plus a "Measure" button showing the probabilistic collapse to a pole.

## 6.7 Quantum Gates
Reinforces core Module 2.4. Gates are represented as matrices (connecting to A2.5–2.6) that rotate a qubit's position on the Bloch sphere. The Hadamard gate, for instance, rotates a definite |0⟩ state to the sphere's "equator" — an equal superposition.

## 6.8 Quantum Circuits
A sequence of gates applied to one or more qubits, read left to right, ending in measurement — the basic unit of a quantum program.

## 6.9 Entanglement
Reinforces core Module 2.3, including the QKD-vs-PQC distinction — critical to repeat here since this module may be a learner's first quantum exposure if they tested out of the core track.

## 6.10 Interference
Quantum interference occurs when probability amplitudes combine — constructively (increasing the probability of an outcome) or destructively (canceling it out entirely). This is the actual mechanism quantum algorithms exploit: clever circuit design uses interference to boost the probability of measuring the correct answer while canceling out wrong ones — the real explanation behind the "amplitude engineering" idea introduced conceptually in core Module 2.2.

## 6.11 Tensor Products
When combining multiple qubits into one system, their individual state vectors combine via the **tensor product** — the mathematical operation explaining why n qubits produce a 2ⁿ-dimensional state space (connecting directly back to core Module 2.2's exponential scaling).

---

## Module Wrap-Up
- Knowledge check quiz covering sections 6.1–6.11.
- Practical assessment: given a simple 1-2 gate circuit, predict the resulting measurement probabilities by hand.
- Unlocks: `A7 — First Quantum Programming`.
