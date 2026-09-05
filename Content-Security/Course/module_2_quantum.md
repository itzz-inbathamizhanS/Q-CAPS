# Module 2: The Full Quantum Concept
**module_id:** `module_2_quantum`
**Track:** Q-CAPS Foundations | **Level:** Beginner–Intermediate | **Estimated Time:** 100 minutes
**Prerequisite:** `module_1_basics` passed (≥70%)

---

## 2.1 What Is a Qubit?
**Text:** A classical bit is 0 or 1. A qubit can exist in a superposition — a combination of 0 and 1 — until measured. Analogy first: a spinning coin isn't "heads" or "tails" until it lands.

**🎨 Interactive/Visual:** Coin-spin animation → click "Measure" to collapse it randomly; running tally shows ~50/50 over repeated trials. Reveal the real notation (α|0⟩ + β|1⟩) after the analogy plays once.

## 2.2 Superposition (deeper dive)
**Text:** *n* qubits can represent 2ⁿ states simultaneously — the foundation of why Shor's algorithm (Module 3) threatens RSA/ECC. Important nuance: measurement collapses the state, so it's not "free infinite computation" — it's carefully engineered probability.

**🎨 Interactive/Visual:** Slider from 1–20 qubits with a live 2ⁿ counter, next to a bar chart comparing classical bits vs. qubits needed for the same state space.

## 2.3 Entanglement
**Text:** Linked qubits — measuring one instantly determines the other's state, regardless of distance. Explicitly flag: **QKD ≠ PQC**. QKD distributes keys using quantum hardware; PQC is classical math that runs on ordinary computers. Q-CAPS is a PQC platform.

**🎨 Interactive/Visual:** Two "linked coins" — measuring one instantly flips the other, with a simulated distance slider showing the correlation holds regardless.

**Knowledge Check:** "QKD and PQC are the same thing." → False.

## 2.4 Quantum Gates & Circuits (light touch, optional)
**Text:** Gates (Hadamard, CNOT) manipulate qubits the way AND/OR gates manipulate bits — enough literacy to read a simple circuit diagram later.

**🎨 Interactive/Visual:** Optional/collapsible drag-and-drop 2-qubit circuit builder with a "Run" button showing the resulting probability bar chart.

## 2.5 How a Quantum Computer Actually Works
**Text:** Qubits are physically fragile and need extreme cooling/isolation. Today's "NISQ era" (Noisy Intermediate-Scale Quantum) machines cannot yet break RSA-2048. The real threat is "Harvest Now, Decrypt Later," not an imminent break — keep the course technically honest on this point.

**🎨 Interactive/Visual:** Timeline slider (Today → 2035+) marking NISQ era and the HNDL risk window in orange — content team must verify current public roadmap estimates before publishing.

---
## Module 2 Wrap-Up
- CTA: "Take the Module 2 Quiz" → `module_2_quantum_questions.json`.
- Submission posted in the same exact `shared_data_schema.md` Quiz Submission shape, with `"module_id": "module_2_quantum"`.
- Unlocks: `module_3_pqc_mitigation`.
