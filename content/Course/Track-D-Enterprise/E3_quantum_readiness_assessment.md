# E3 — Quantum Readiness Assessment
**module_id:** `track_d_e3_quantum_readiness_assessment`
**Level:** Enterprise | **Estimated Time:** 140 minutes | **Track:** D — Architect
**Prerequisite:** `E2`

## Learning Objectives
- Combine system inventory (E2) and cryptographic exposure analysis into a formal risk score.
- Understand readiness maturity assessment and prioritization methodology.
- Produce migration planning outputs directly usable in E5.

---

## 3.1 System Inventory (Assessment Context)
Building directly on E2.2's asset discovery, this section covers organizing the discovered inventory specifically for assessment purposes — grouping systems by business function and criticality rather than purely technical categorization, so the assessment output is meaningful to both technical and executive audiences.

## 3.2 Cryptographic Exposure Analysis
Combining E2's discovered algorithms/certificates/protocols with the quantum threat model from E1 and B8: for each inventoried item, determining its specific quantum exposure — is it RSA/ECC-based (vulnerable to Shor), what key size, and what data does it protect.

## 3.3 Risk Scoring
Formalizing E1.7's risk model into a concrete, repeatable scoring methodology applied across the full inventory — producing a numeric or categorical risk score per asset that enables the objective prioritization needed in 3.4, directly mirroring the readiness-score concept in Q-CAPS's own shared data schema (`readiness_score` field).

## 3.4 Prioritization
Using the risk scores from 3.3 to rank migration priority — critical systems with long-lived sensitive data and weak cryptography rank highest; low-criticality systems with already-strong or already-migrated cryptography rank lowest. This prioritized list becomes the primary input to E5's migration sequencing.

## 3.5 Readiness Maturity Assessment
Beyond scoring individual assets, this section covers assessing the organization's overall **readiness maturity** — does the organization have crypto-agility already built in (E4), an established discovery process (E2), and governance structures (E6) in place, or is it starting from zero on all fronts. This organizational-capability view is as important as the technical inventory itself for realistic migration planning.

## 3.6 Migration Planning (Assessment Output)
Closing the module by formalizing how 3.1–3.5's outputs feed directly into a draft migration plan — the bridge between "assessment" (this module) and "execution" (E5), ensuring the migration plan that follows is grounded in the actual, discovered state of the organization rather than assumptions.

**🎨 Interactive/Visual Requirement:**
> Readiness dashboard mockup: a sample organizational readiness view combining overall score, per-domain breakdown (crypto inventory completeness, workforce readiness, migration capability), and a prioritized asset list — closely modeled on the actual readiness profile structure described in the Q-CAPS master checkpoint's Organizational Readiness section.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 3.1–3.6.
- Practical assessment: using the cryptographic inventory built in E2's assessment, score and prioritize the assets, then draft a one-page readiness summary suitable for an executive audience.
- Unlocks: `E4 — Crypto-Agility`.
