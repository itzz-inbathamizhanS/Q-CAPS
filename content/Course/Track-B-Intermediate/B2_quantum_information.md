# B2 — Quantum Information
**module_id:** `track_b_b2_quantum_information`
**Level:** Intermediate | **Estimated Time:** 150 minutes | **Track:** B — Engineering
**Prerequisite:** `B1`

## Learning Objectives
- Understand multi-qubit systems, density matrices, and quantum channels.
- Understand measurement theory formally, plus quantum noise and decoherence mechanisms.
- Understand the no-cloning theorem and its security implications.

---

## 2.1 Qubits and Multi-Qubit Systems
Building on B1's tensor product treatment, this section explores how real quantum algorithms operate on registers of many qubits simultaneously, and how to reason about subsystems within a larger entangled system.

## 2.2 Entanglement (Formal Treatment)
Revisiting A6.9/core Module 2.3 with formal mathematical treatment: entangled states cannot be written as a simple tensor product of individual qubit states — this "non-separability" is the precise mathematical definition of entanglement.

## 2.3 Density Matrices
A **density matrix** is a more general way to describe a quantum state, capable of representing not just pure states (fully known) but also **mixed states** (statistical uncertainty about the state itself, distinct from the quantum uncertainty of superposition). This becomes essential when describing real, noisy hardware.

## 2.4 Quantum Channels
A **quantum channel** describes how a quantum state evolves when passing through some process — including noisy, imperfect real-world hardware. This formalism underlies how error models are built for the noise simulation introduced in A7.6.

## 2.5 Measurement Theory
A rigorous treatment of measurement beyond A6.4's introduction: projective measurements, measurement operators, and how measuring one qubit in an entangled system affects the others — directly explaining the "instant correlation" behavior introduced conceptually back in core Module 2.3.

## 2.6 Quantum Noise
Formal categories of noise affecting real quantum hardware: bit-flip errors, phase-flip errors, and amplitude damping (energy loss). Understanding these categories is prerequisite knowledge for Track C's Quantum Error Correction module.

## 2.7 Decoherence
The formal explanation for what was introduced conceptually in core Module 2.5: decoherence is the process by which a qubit's quantum information leaks into its environment through unwanted interactions, degrading superposition and entanglement over time — the central engineering challenge of building practical quantum computers.

## 2.8 No-Cloning Theorem
The **no-cloning theorem** proves that it's impossible to create an identical copy of an arbitrary unknown quantum state. This has direct security relevance: it's part of why quantum key distribution (QKD, first introduced in core Module 2.3) can detect eavesdropping — an eavesdropper cannot simply copy the quantum states being transmitted without disturbing them.

## 2.9 Quantum Information Concepts (Synthesis)
This closing section ties 2.1–2.8 together into a coherent picture of what "quantum information" means as a field distinct from both classical information theory and quantum algorithms — the lens through which Track C's advanced quantum information content will build further.

**🎨 Interactive/Visual Requirement:**
> Density matrix visualizer: user toggles between a "pure state" and a "mixed state" example, seeing how the density matrix representation differs, with a plain-language explanation of what "statistical uncertainty" vs. "quantum uncertainty" means in practice.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 2.1–2.9.
- Practical assessment: given a simple 2-qubit entangled state, compute the reduced density matrix of one qubit.
- Unlocks: `B3 — Quantum Algorithms`.
