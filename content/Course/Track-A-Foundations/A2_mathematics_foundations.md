# A2 — Mathematics Foundations
**module_id:** `track_a_a2_mathematics_foundations`
**Level:** Beginner | **Estimated Time:** 150 minutes | **Track:** A — Foundations
**Prerequisite:** `A1` recommended but not required

## Learning Objectives
- Build comfort with algebra, exponents, and logarithms as they apply to cryptographic key sizes.
- Understand basic probability and statistics — essential for reasoning about quantum measurement later.
- Understand complex numbers, vectors, and matrices at an introductory level.
- Recognize eigenvalues/eigenvectors and Boolean math conceptually, without requiring a full linear algebra course yet (that's Track B).

---

## 2.1 Arithmetic and Algebra
Solid algebra — solving equations, working with variables — underlies every formula you'll encounter later, from RSA key generation to quantum probability calculations.

## 2.2 Functions, Exponents, and Logarithms
This section matters more than it looks. Cryptographic key strength is described in terms of exponents (a 2048-bit key means 2²⁰⁴⁸ possible values) and cracking time is described using logarithms. Understanding "2ⁿ" intuitively here directly prepares you for Module 2's "n qubits = 2ⁿ states" concept in the core PQC Foundations track.

## 2.3 Probability and Statistics
Basic probability (what's the chance of an event, how do independent events combine) is essential groundwork for understanding quantum measurement, where outcomes are inherently probabilistic rather than deterministic.

## 2.4 Complex Numbers
A complex number has a real and an imaginary part (e.g., 3 + 4i). This might seem disconnected from cybersecurity, but complex numbers are the mathematical language quantum mechanics is written in — qubit amplitudes (α and β from earlier) are complex numbers.

## 2.5 Vectors and Matrices
A vector is an ordered list of numbers; a matrix is a grid of numbers that can transform vectors. Quantum gates are literally represented as matrices that transform qubit-state vectors — this section is direct preparation for quantum circuit math in Track B.

## 2.6 Basic Linear Algebra
Building on vectors/matrices: operations like matrix multiplication and understanding what a linear transformation does geometrically.

## 2.7 Eigenvalues/Eigenvectors (Conceptual Introduction)
An eigenvector of a transformation is a vector that only gets scaled (not rotated) by that transformation; the scale factor is its eigenvalue. This concept becomes essential in Track B/C when studying quantum measurement and unitary operators — introduced here only conceptually, with the full mathematical treatment deferred to Track B.

## 2.8 Boolean Mathematics
AND, OR, NOT, XOR — the logic underlying classical digital circuits, and a useful contrast point when later comparing classical logic gates to quantum gates in A6/A7.

**🎨 Interactive/Visual Requirement:**
> Interactive vector/matrix visualizer: user adjusts a 2D vector and a simple transformation matrix, watching the vector rotate/scale in real time — builds geometric intuition before the abstract notation is introduced.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 2.1–2.8.
- Practical assessment: a short problem set applying exponents/logs to key-size comparisons (tying directly back to the RSA/ECC key-size discussion in PQC Foundations Module 1).
- Unlocks: `A3 — Networking Foundations`.
