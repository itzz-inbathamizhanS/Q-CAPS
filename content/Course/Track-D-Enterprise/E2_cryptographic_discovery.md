# E2 — Cryptographic Discovery
**module_id:** `track_d_e2_cryptographic_discovery`
**Level:** Enterprise | **Estimated Time:** 140 minutes | **Track:** D — Architect
**Prerequisite:** `E1`

> This module describes, at the organizational-process level, exactly what Inba's Scanner Engine automates technically for Q-CAPS — worth reading alongside their scanner documentation for the clearest picture of theory-meets-implementation.

## Learning Objectives
- Build a complete cryptographic inventory covering assets, algorithms, certificates, protocols, and applications.
- Understand dependency mapping and data-flow mapping as discovery techniques.
- Understand asset discovery methodology at organizational scale.

---

## 2.1 Cryptographic Inventory
The foundational artifact of this entire track: a **cryptographic inventory** is a comprehensive record of every cryptographic algorithm, key, certificate, and protocol in use across an organization's systems — without this, none of E1's risk modeling or E5's migration planning can be grounded in reality rather than guesswork.

## 2.2 Asset Discovery
The first practical step: identifying what systems, servers, applications, and devices exist across the organization in the first place — a surprisingly difficult problem at enterprise scale due to "shadow IT" (unofficial, unregistered systems) and forgotten legacy infrastructure.

## 2.3 Algorithm Discovery
Building on B7's TLS/PKI engineering depth, this section covers systematically identifying which cryptographic algorithms (RSA, ECC, AES, and their specific parameters) are actually in use across discovered assets — exactly the technical operation Inba's scanner performs when it connects to a target and reports its detected encryption algorithm.

## 2.4 Certificate Discovery
Specifically cataloguing certificates in use: their issuing CA, key algorithm/size, expiration date, and where they're deployed — building directly on B7.6's certificate lifecycle coverage, now applied as a discovery exercise across the whole organization rather than a single system.

## 2.5 Protocol Discovery
Identifying which network protocols (TLS versions, SSH configurations, VPN protocols) are actually in use, since protocol version alone can indicate outdated, weaker configurations even before considering the specific algorithms within them — connecting to B6.5 and B6.4's protocol-level engineering coverage.

## 2.6 Application Discovery
Extending discovery beyond network-facing cryptography to cryptography embedded directly within application source code — often the hardest category to discover, since it requires source-code or binary analysis rather than simply observing network traffic, and connects to the original Q-CAPS checkpoint's mention of "controlled source-code cryptographic analysis" as a scanner capability.

## 2.7 Dependency Mapping
Beyond simply listing what's found, **dependency mapping** traces the relationships between discovered assets — which applications depend on which certificates, which services depend on which cryptographic libraries — essential for understanding the true blast radius of migrating (or failing to migrate) any single component.

## 2.8 Data-Flow Mapping
Complementing dependency mapping: tracing how sensitive data actually moves through the organization's systems, which directly informs E1.3–1.4's data sensitivity and HNDL risk assessment by showing exactly where and how that data is being transmitted or stored.

**🎨 Interactive/Visual Requirement:**
> Interactive dependency graph: a sample small-organization inventory rendered as a node graph (assets, certificates, applications), where clicking any node highlights its full dependency chain — makes the abstract "why does this one certificate matter so much" question visually obvious.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 2.1–2.8.
- Practical assessment: given a small set of simulated scan results (structured similarly to Inba's Scanner Mission JSON output), compile them into a structured cryptographic inventory with dependency notes.
- Unlocks: `E3 — Quantum Readiness Assessment`.
