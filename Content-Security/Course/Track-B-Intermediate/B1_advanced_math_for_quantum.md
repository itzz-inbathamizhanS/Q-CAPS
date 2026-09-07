# B1 — Advanced Mathematics for Quantum
**module_id:** `track_b_b1_advanced_math_for_quantum`
**Level:** Intermediate | **Estimated Time:** 160 minutes | **Track:** B — Engineering
**Prerequisite:** `A2` (Math Foundations) or equivalent

## Learning Objectives
- Work formally with complex vector spaces, inner products, and matrix operations.
- Understand eigenvectors, unitary operators, and Dirac notation.
- Apply probability amplitudes and tensor products rigorously, and understand basic optimization concepts.

---

## 1.1 Linear Algebra (Formal Treatment)
Building on A2's introduction, this section treats vector spaces, linear independence, and basis vectors formally — the mathematical language every quantum algorithm in this track will be expressed in.

## 1.2 Complex Vector Spaces
Quantum states live in complex vector spaces, not real ones. A qubit's state vector has complex-number components, which is why A2.4's introduction to complex numbers was necessary groundwork.

## 1.3 Inner Products
The **inner product** of two vectors measures their overlap/similarity, and in quantum mechanics it's used to compute probabilities: the probability of measuring a particular outcome is the squared magnitude of the inner product between the current state and that outcome's basis state.

## 1.4 Matrix Operations
Formal treatment of matrix multiplication, transposition, and the **conjugate transpose** (also called the Hermitian adjoint) — essential for working with quantum gates, which are represented as matrices.

## 1.5 Eigenvectors and Unitary Operators
Reinforces A2.7. A **unitary operator** is a special kind of matrix that preserves the total probability (always sums to 1) when applied to a quantum state — every valid quantum gate must be unitary. Eigenvectors of these operators play a central role in algorithms like phase estimation, covered in B3.

## 1.6 Probability Amplitudes (Formal Treatment)
Building on A6.5, this section works through multi-qubit amplitude calculations rigorously, including how amplitudes combine under tensor products.

## 1.7 Tensor Products (Formal Treatment)
Reinforces A6.11 with worked examples: combining two 2-dimensional single-qubit spaces via tensor product produces a 4-dimensional two-qubit space, generalizing to 2ⁿ dimensions for n qubits.

## 1.8 Dirac Notation
**Dirac (bra-ket) notation** — |ψ⟩ for a "ket" (state vector) and ⟨ψ| for its corresponding "bra" (conjugate transpose) — is the standard shorthand used throughout quantum computing literature. Fluency here is necessary to read any quantum algorithm paper or documentation, including the NIST PQC standardization documents referenced in B10.

## 1.9 Basic Optimization
A light introduction to optimization concepts (minimizing/maximizing a function, gradient-based intuition) — groundwork for variational quantum algorithms (VQE, QAOA) covered in Track C.

**🎨 Interactive/Visual Requirement:**
> Step-by-step worked-example widget: user picks a 2-qubit state and a gate, and the tool shows the tensor product and matrix multiplication step by step, building the muscle memory needed before tackling full algorithms in B3.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 1.1–1.9.
- Practical assessment: work through 2-3 full amplitude calculations by hand, verified against a computational tool.
- Unlocks: `B2 — Quantum Information`.
