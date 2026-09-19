# A7 — First Quantum Programming
**module_id:** `track_a_a7_first_quantum_programming`
**Level:** Beginner | **Estimated Time:** 150 minutes (hands-on) | **Track:** A — Foundations
**Prerequisite:** `A1` (Python) and `A6` (Quantum Foundations)

## Learning Objectives
- Write and run a basic quantum circuit using Qiskit.
- Use a quantum simulator to test circuits before ever touching real hardware.
- Apply basic gates, take measurements, and understand simulated noise.
- Run a beginner experiment on real quantum hardware where available.

---

## 7.1 Qiskit Concepts
**Qiskit** is IBM's open-source Python framework for building and running quantum circuits — the industry-standard tool for quantum programming education. Because it's Python-based, everything learned in A1's Python fundamentals transfers directly here.

## 7.2 Circuit Creation
In Qiskit, a circuit is built by creating a `QuantumCircuit` object, specifying the number of qubits, then adding gates one at a time — directly mirroring the circuit diagrams introduced conceptually in A6.8.

```python
from qiskit import QuantumCircuit

# A 1-qubit circuit
qc = QuantumCircuit(1, 1)   # 1 qubit, 1 classical bit for the measurement result
qc.h(0)                     # Apply a Hadamard gate — creates superposition
qc.measure(0, 0)            # Measure the qubit into the classical bit
```

## 7.3 Simulators
Rather than requiring access to expensive, limited quantum hardware, Qiskit provides **simulators** — classical programs that mathematically compute what a quantum circuit's measurement outcomes would be. Simulators are the primary environment for learning, testing, and debugging circuits before ever touching real hardware.

## 7.4 Measurements
Running a circuit on a simulator many times (called "shots") produces a distribution of outcomes reflecting the underlying probabilities — directly demonstrating the probabilistic nature of measurement covered in A6.4.

```python
from qiskit_aer import AerSimulator
from qiskit import transpile

sim = AerSimulator()
compiled = transpile(qc, sim)
result = sim.run(compiled, shots=1000).result()
print(result.get_counts())   # e.g. {'0': 498, '1': 502} — roughly 50/50, as expected from a Hadamard gate
```

## 7.5 Basic Gates
Hands-on practice with the most common gates: **X** (bit-flip, the quantum equivalent of a classical NOT), **H** (Hadamard, creates superposition), and **CNOT** (a 2-qubit gate that creates entanglement between two qubits, connecting directly to A6.9).

## 7.6 Noise Simulation
Real quantum hardware is noisy (as covered in the core track's discussion of the NISQ era). Qiskit allows simulating this noise on a classical computer, letting learners see how error rates degrade a circuit's expected results — an important, honest bridge between the idealized simulator and messy real hardware.

## 7.7 Running Beginner Experiments on Real Quantum Hardware
Where available (e.g., via IBM Quantum's free-tier cloud access), learners run their simple circuits on genuine quantum hardware and compare the noisy real-world results against their clean simulator predictions — a powerful, concrete way to internalize the theory-vs-reality gap discussed throughout this program.

**🎨 Interactive/Visual Requirement:**
> Embedded code editor + "Run" button that executes the learner's Qiskit circuit against a simulator backend and displays a live histogram of measurement outcomes — this should be the primary hands-on lab experience of the entire Beginner track.

---

## Beginner Capstone Project
Combine A3 (networking), A5 (cryptography), and A6/A7 (quantum) into one project:
1. Build a small secured network segment (conceptual/simulated).
2. Implement a basic cryptographic application (e.g., an AES file-encryption script in Python, reinforcing A1 + A5).
3. Build and run a simple quantum circuit demonstrating superposition and/or entanglement.

**Certificate awarded on completion: CQF — Certificate in Quantum Foundations.**

---

## Module Wrap-Up
- Knowledge check quiz covering sections 7.1–7.7.
- Practical assessment: submit a working Qiskit circuit + simulator output as part of the Beginner Capstone.
- Unlocks: **Track B — Intermediate / Quantum & Security Engineering** (or Bridge Modules, if diagnostic assessment indicates a targeted gap).
