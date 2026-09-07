# E6 — Governance
**module_id:** `track_d_e6_governance`
**Level:** Enterprise | **Estimated Time:** 130 minutes | **Track:** D — Architect
**Prerequisite:** `E5`

## Learning Objectives
- Establish quantum-readiness and cryptographic policy at an organizational level.
- Understand risk ownership, vendor requirements, and procurement considerations for PQC readiness.
- Understand compliance, architecture review, business continuity, and incident response as ongoing governance functions.

---

## 6.1 Quantum-Readiness Policy
Formalizing everything covered in E1–E5 into organizational policy: a documented commitment to quantum-readiness objectives, timelines, and accountability — turning a technical migration project into an institutionalized, ongoing organizational priority that outlasts any single project team or budget cycle.

## 6.2 Cryptographic Policy
A specific policy layer governing which algorithms, key sizes, and configurations are approved for use across the organization (directly informed by B10.5 and E5.5's algorithm-selection guidance) — the governance mechanism ensuring crypto-agility (E4) and migration progress (E5) don't erode over time as new systems are built without oversight.

## 6.3 Risk Ownership
Assigning clear organizational accountability for quantum-readiness risk (E1, E3) — without a named owner, even a well-designed risk model and migration plan tends to stall, since no single person or team is accountable for driving it forward against competing organizational priorities.

## 6.4 Vendor Requirements
Extending E1.6's third-party dependency coverage into formal governance: requiring vendors and partners to meet defined cryptographic and PQC-readiness standards as a condition of doing business, closing a risk gap that internal migration efforts alone cannot address.

## 6.5 Procurement
Embedding cryptographic and PQC-readiness requirements directly into procurement processes for new hardware (connecting to E4.8's hardware considerations) and software — ensuring new systems entering the organization are crypto-agile and PQC-capable from day one, rather than adding to future migration debt.

## 6.6 Compliance
Connecting quantum-readiness governance to applicable regulatory and industry compliance requirements — an increasingly common driver in regulated industries (finance, healthcare, government) where PQC migration timelines may become externally mandated rather than purely internally motivated.

## 6.7 Architecture Review
Establishing a formal review process (informed by E4's crypto-agility architecture principles) ensuring new system designs are evaluated for crypto-agility and PQC-readiness before deployment — a governance checkpoint preventing new instances of the exact hardcoded-cryptography problem E4.7 describes retrofitting.

## 6.8 Business Continuity
Ensuring migration activities (E5) are planned and executed without introducing unacceptable operational risk — connecting to E5.8's piloting approach and E5.11's monitoring phase as the practical mechanisms that protect business continuity during an active migration.

## 6.9 Incident Response
Extending A4.8's foundational incident-response introduction to quantum-specific scenarios: what an organization's response process looks like if a cryptographic weakness is discovered in production (whether classical or PQC), or if evidence of HNDL-style data harvesting (E1.4) is detected — ensuring the organization has a rehearsed response plan, not an improvised one.

**🎨 Interactive/Visual Requirement:**
> Governance framework diagram: policy (6.1–6.2) → ownership (6.3) → external controls (6.4–6.6) → internal controls (6.7) → operational resilience (6.8–6.9), shown as a connected framework rather than a flat list — helps learners see governance as a coherent system rather than disconnected checklist items.

---

## Enterprise / Architect Capstone
Produce an enterprise quantum-readiness assessment and multi-year quantum-safe migration strategy, synthesizing the entire track:
- **Risk** (E1) and **Discovery/Inventory** (E2) establish the factual baseline.
- **Readiness Assessment** (E3) scores and prioritizes.
- **Crypto-Agility** (E4) architecture underpins the technical approach.
- **Migration** (E5)'s 12-phase process provides the execution roadmap.
- **Governance** (E6) ensures the strategy is institutionally sustainable, not a one-time project.

Present the final deliverable covering assets, cryptography, network protocols, PKI, certificates, applications, vendors, governance, architecture, risks, and measurable milestones — with technical, risk, cost, and business justification.

**Certificate awarded on completion: QSA — Quantum Security Architect Certificate.**

---

## Module Wrap-Up
- Knowledge check quiz covering sections 6.1–6.9.
- Practical assessment: this module's content directly completes the governance component of the Architect Capstone described above.
- Completion of Track D + Capstone: full progression through the **Shared Professional Core** and eligibility for the final **PQCTP — Professional Quantum Computing & Quantum-Safe Technology Professional** certification, the program's highest level.
