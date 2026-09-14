# E1 — Quantum Risk Management
**module_id:** `track_d_e1_quantum_risk_management`
**Level:** Enterprise | **Estimated Time:** 130 minutes | **Track:** D — Architect
**Prerequisite:** Track B (or equivalent working knowledge of B8's Quantum Threats)

## Learning Objectives
- Translate the technical quantum threat landscape into organizational business-impact terms.
- Assess data sensitivity and lifetime, HNDL risk, and critical-system exposure at an organizational scale.
- Build a structured quantum risk model incorporating third-party dependencies.

---

## 1.1 Quantum Threat Landscape (Business Framing)
Reframing B8's technical threat model (Shor, Grover, HNDL) for a non-technical executive audience: what matters to leadership isn't the mathematics of factoring, but the business consequences — which systems, revenue streams, or regulatory obligations are exposed, and on what realistic timeline.

## 1.2 Business Impact
Translating technical exposure into concrete business impact categories: financial loss, regulatory penalties, reputational damage, and loss of competitive advantage (e.g., stolen intellectual property becoming usable by a competitor once decrypted) — the language that secures executive buy-in and budget for migration work.

## 1.3 Data Sensitivity and Lifetime
Building directly on B8.6–8.7's HNDL formalization, this section covers the organizational process of classifying data by both sensitivity (how damaging exposure would be) and required confidentiality lifetime (how long it must remain protected) — the two inputs that together determine real HNDL exposure for any given dataset.

## 1.4 Harvest-Now-Decrypt-Later Risk (Organizational Scale)
Applying core Module 3.3 and B8.6's HNDL concept across an entire organization's data estate: which data categories (from 1.3) are actively being transmitted or stored in ways that make them plausible interception targets today.

## 1.5 Critical Systems
Identifying which systems, if compromised via future quantum-enabled decryption, would cause the most severe business impact (1.2) — the foundation for the risk prioritization that drives migration sequencing in E5.

## 1.6 Third-Party Dependencies
Organizational cryptographic risk doesn't stop at owned infrastructure — vendors, cloud providers, and partners handling sensitive data on an organization's behalf introduce dependency risk that must be assessed and, where possible, contractually addressed (connecting to E6's vendor requirements coverage).

## 1.7 Risk Modeling
Synthesizing 1.1–1.6 into a structured, repeatable risk model: combining threat likelihood (informed by B8.3's Shor threat-model timelines), data sensitivity/lifetime (1.3), and system criticality (1.5) into a scored risk output — directly mirroring the readiness/risk scoring approach used in the Q-CAPS platform's own Organization module.

**🎨 Interactive/Visual Requirement:**
> Risk-scoring calculator: interactive form where a learner inputs a hypothetical system's data sensitivity, confidentiality lifetime, and criticality, receiving a calculated risk score with a plain-language justification — direct rehearsal for building the Enterprise Capstone's risk assessment.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 1.1–1.7.
- Practical assessment: build a risk model scoring 5 hypothetical organizational systems, ranking them by migration urgency.
- Unlocks: `E2 — Cryptographic Discovery`.
