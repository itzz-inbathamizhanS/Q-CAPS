# C5 — Quantum Communications
**module_id:** `track_c_c5_quantum_communications`
**Level:** Advanced | **Estimated Time:** 140 minutes | **Track:** C — Specialist
**Prerequisite:** `C4`

## Learning Objectives
- Understand teleportation and superdense coding as the two foundational quantum communication protocols.
- Understand quantum channel capacity concepts and entanglement distribution/repeaters in a communications-theory context.
- Understand satellite and optical quantum communications as real-world deployment approaches.

---

## 5.1 Teleportation (Communications-Theory Framing)
Revisiting C4.3 from an information-theory perspective: quantum teleportation consumes one shared entangled pair and 2 classical bits of communication to transmit one qubit's worth of quantum information — a precise "resource cost" framing useful for comparing communication protocols.

## 5.2 Superdense Coding
The conceptual mirror image of teleportation: **superdense coding** uses one shared entangled pair and the transmission of a single qubit to communicate 2 classical bits of information — twice the classical capacity of sending an unentangled qubit alone, demonstrating a genuine, provable communication advantage from pre-shared entanglement.

## 5.3 No-Cloning (Communications Implications)
Revisiting B2.8's no-cloning theorem specifically for its communications implications: because quantum information cannot be copied, quantum communication protocols must be designed around consuming and consuming entanglement resources, rather than freely amplifying or duplicating signals the way classical communication systems do — directly explaining why quantum repeaters (C4.5) require entanglement swapping rather than simple amplification.

## 5.4 Quantum Channel Capacity Concepts
An introduction to the quantum information-theoretic question of how much information can reliably be transmitted through a noisy quantum channel — the quantum generalization of Shannon's classical channel capacity theory, referencing the information measures introduced formally in C1.7.

## 5.5 Entanglement Distribution (Communications Context)
Revisiting C4.2 with communications-engineering framing: entanglement distribution rate (entangled pairs generated per second) and fidelity (how close to perfectly entangled the pairs actually are) as the two key performance metrics for any real quantum communication system.

## 5.6 Quantum Repeaters (Communications Context)
Revisiting C4.5 from a systems-engineering perspective: repeater rate, memory storage time, and swap success probability as the concrete engineering parameters determining a real quantum network's achievable range and throughput.

## 5.7 Satellite Quantum Communication
Free-space quantum communication via satellite has demonstrated significantly longer-range entanglement distribution than is currently practical through fiber alone, since satellite links avoid the cumulative photon loss of long fiber runs — an active area of real-world experimental deployment worth checking against current published results for the latest achieved distances and milestones.

## 5.8 Optical Quantum Communications
The broader category of using photons in optical fiber or free space as the physical carrier for quantum information — encompassing both the fiber-based approaches discussed in C4 and the satellite-based approaches in 5.7, unified by their shared reliance on photonic qubit encoding.

**🎨 Interactive/Visual Requirement:**
> Side-by-side comparison chart: fiber-based vs. satellite-based quantum communication across achievable distance, current data rate, and deployment maturity — with a clear content-team note to verify current figures before publishing, given how quickly this field advances.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 5.1–5.8.
- Practical assessment: given a target distance and use case, evaluate whether a fiber-based or satellite-based approach is more appropriate, citing the tradeoffs covered in this module.
- Unlocks: `C6 — Quantum Key Distribution`.
