# B4 — Quantum Programming
**module_id:** `track_b_b4_quantum_programming`
**Level:** Intermediate | **Estimated Time:** 170 minutes (hands-on) | **Track:** B — Engineering
**Prerequisite:** `A7`, `B3`

## Learning Objectives
- Implement the algorithms from B3 in Qiskit, beyond the beginner circuits built in A7.
- Understand circuit optimization, transpilation, and backend selection.
- Apply noise models and error mitigation techniques, and benchmark circuit performance.

---

## 4.1 Qiskit (Intermediate Usage)
Building on A7.1, this section covers Qiskit's more advanced APIs: parameterized circuits, custom gates, and working with multi-register circuits needed to implement the algorithms from B3.

## 4.2 Circuit Optimization
Real quantum circuits often contain redundant or simplifiable gate sequences. **Circuit optimization** reduces gate count and circuit depth — critical on noisy hardware, where every additional gate is another opportunity for error to accumulate.

## 4.3 Transpilation
**Transpilation** is the process of converting an abstract circuit into one that's compatible with a specific quantum backend's native gate set and physical qubit connectivity — an essential, often invisible step between "the algorithm you designed" and "what actually runs on hardware."

## 4.4 Backend Selection
Different quantum backends (simulators, various real hardware types) have different qubit counts, connectivity, noise characteristics, and queue times. Learning to select an appropriate backend for a given circuit and goal is a practical engineering skill distinct from algorithm design itself.

## 4.5 Noise Models
Building on A7.6's introduction, this section covers building and applying realistic, backend-specific noise models to simulators — allowing developers to predict how a circuit will perform on real hardware before submitting an actual job (which often involves queue time and, on commercial platforms, cost).

## 4.6 Error Mitigation
Distinct from full error *correction* (Track C), **error mitigation** techniques (e.g., zero-noise extrapolation, readout error correction) reduce the impact of noise on results without requiring the enormous qubit overhead of full fault tolerance — the practical, deployable approach for today's NISQ-era hardware.

## 4.7 Runtime Concepts
Modern quantum cloud platforms use "runtime" execution models that keep classical and quantum processing tightly coupled for algorithms requiring many rounds of interaction (like variational algorithms) — understanding this execution model matters for the hybrid quantum-classical workflows in 4.8.

## 4.8 Quantum-Classical Workflows
Most practically useful near-term quantum algorithms aren't purely quantum — they alternate between a quantum circuit (computing something hard classically) and classical post-processing (interpreting results, adjusting parameters, deciding the next circuit to run). Understanding this loop is essential preparation for the variational algorithms (VQE, QAOA) covered fully in Track C.

## 4.9 Benchmarking
Systematic methods for evaluating circuit performance: success probability, fidelity compared to ideal simulation, and runtime — the same kind of benchmarking mindset used later in B11's PQC performance comparisons.

## 4.10 Hardware Execution
Practical walkthrough of submitting a real job to quantum hardware, understanding queue behavior, and interpreting results that include real device noise — extending the beginner hardware experience from A7.7 to the more complex circuits built in this module.

**🎨 Interactive/Visual Requirement:**
> Before/after circuit diagram showing a circuit pre- and post-transpilation for a specific backend, highlighting added/removed gates — makes the normally invisible transpilation step tangible.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 4.1–4.10.
- Practical assessment: take a Grover's algorithm implementation from B3, optimize and transpile it for a specific backend, and benchmark its fidelity against the ideal simulator result.
- Unlocks: `B5 — Quantum Hardware`.
