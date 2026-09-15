# E5 — Enterprise PQC Migration
**module_id:** `track_d_e5_enterprise_pqc_migration`
**Level:** Enterprise | **Estimated Time:** 160 minutes | **Track:** D — Architect
**Prerequisite:** `E4`

> This module's 11-step process is the direct architectural blueprint for the Enterprise Capstone — treat each section as one concrete phase of that final deliverable.

## Learning Objectives
- Execute the full Discover → Inventory → Classify → Risk-Rank → Select PQC → Prototype → Benchmark → Pilot → Hybrid Migration → Production Rollout → Monitor → Retire sequence.
- Understand each phase's specific deliverables and how they connect to earlier tracks' technical content.

---

## 5.1 Discover
The migration process begins with E2's asset discovery methodology, applied comprehensively across the organization — this phase's output is a raw list of systems and cryptographic touchpoints, not yet organized or analyzed.

## 5.2 Inventory
Organizing 5.1's discovery output into the structured cryptographic inventory covered fully in E2.1 — every algorithm, certificate, protocol, and application catalogued and cross-referenced via dependency mapping (E2.7).

## 5.3 Classify
Categorizing inventoried assets by business function, data sensitivity, and confidentiality lifetime (E1.3) — the classification work that makes objective risk-ranking (5.4) possible rather than relying on subjective judgment calls.

## 5.4 Risk-Rank
Applying E3.3's risk scoring methodology to the classified inventory, producing the prioritized asset list (E3.4) that determines migration sequencing for every subsequent phase.

## 5.5 Select PQC
For each prioritized asset, selecting the appropriate PQC algorithm(s) using B9.8/B10.5's algorithm-selection guidance — ML-KEM for key exchange, ML-DSA for general signatures, SLH-DSA where conservative diversification is specifically required.

## 5.6 Prototype
Building small-scale proof-of-concept implementations of the selected algorithms (5.5) in a controlled test environment — applying C9's implementation engineering practices before any production commitment, catching integration issues early and cheaply.

## 5.7 Benchmark
Extending B11.4/B11.7's hands-on benchmarking methodology to the organization's actual prototyped systems (5.6) — measuring real performance impact (latency, throughput, resource usage) specific to the organization's actual infrastructure and traffic patterns, not just generic published figures.

## 5.8 Pilot
Deploying the benchmarked PQC implementation (5.7) to a limited, carefully monitored subset of real production traffic or systems — validating real-world behavior and interoperability (B10.6, C9.11) before full rollout, and providing an opportunity to catch issues with limited blast radius.

## 5.9 Hybrid Migration
For most organizations, the actual production migration path runs through **hybrid cryptography** (core Module 3.6, B11.6, C11.9) rather than a direct cutover — deploying classical+PQC combined algorithms in production, maintaining security even if unexpected issues emerge with the newer PQC components.

## 5.10 Production Rollout
Scaling the piloted (5.8) and hybrid-validated (5.9) migration from limited deployment to the full prioritized asset list (5.4), following the sequencing established by risk-ranking — the highest-risk, highest-priority systems typically migrate first, though practical dependencies (E2.7) may require adjusting pure risk-order sequencing.

## 5.11 Monitor
Post-migration, continuously monitoring migrated systems for performance regressions, interoperability failures, and — critically — verifying the migration is actually achieving its intended risk reduction, feeding back into the readiness assessment process (E3) as an ongoing cycle rather than a one-time project.

## 5.12 Retire Vulnerable Cryptography
The final phase, often delayed too long in practice: once hybrid deployment (5.9) has proven stable and organizational confidence in the PQC implementation is established, formally retiring the classical-only fallback — completing the transition from "hedged" to "fully quantum-safe" for that asset.

**🎨 Interactive/Visual Requirement:**
> Interactive migration pipeline tracker: a Kanban-style board showing the 12 phases (5.1–5.12) with a sample set of organizational assets moving through them — lets the learner visualize migration as an ongoing, staged process rather than a single event.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 5.1–5.12.
- Practical assessment: this module's 12-phase process is the direct blueprint for the Architect Capstone's migration strategy component.
- Unlocks: `E6 — Governance`.
