# A4 — Cybersecurity Foundations
**module_id:** `track_a_a4_cybersecurity_foundations`
**Level:** Beginner | **Estimated Time:** 130 minutes | **Track:** A — Foundations
**Prerequisite:** `A3` recommended

## Learning Objectives
- Explain the CIA triad and how it relates to the confidentiality/integrity/authenticity model from PQC Foundations Module 1.
- Understand authentication, authorization, and identity/access control.
- Recognize common threat and vulnerability categories.
- Understand network security, endpoint security, security monitoring, and incident response at a foundational level.

---

## 4.1 The CIA Triad
**Confidentiality, Integrity, Availability** — the classic security model. Confidentiality and Integrity map directly to what you already learned in the core PQC Foundations track; **Availability** (systems and data are accessible when needed) is the addition here — a reminder that security isn't only about secrecy, but also about resilience against denial-of-service and outages.

## 4.2 Authentication and Authorization
**Authentication** answers "who are you?" (e.g., logging in with a password). **Authorization** answers "what are you allowed to do?" (e.g., an admin vs. a regular user). These are distinct steps that are frequently confused — a system can authenticate you correctly but still authorize you incorrectly, which is a common real-world vulnerability class. This distinction is exactly what your own Q-CAPS auth system (JWT + role-based middleware) implements.

## 4.3 Identity and Access Control
Extending 4.2: models like **RBAC (Role-Based Access Control)** assign permissions based on a user's role rather than individually per user — directly reflected in Q-CAPS's own `role` field (student/employee/organization/instructor/researcher) and the `verify_role` middleware built for it.

## 4.4 Threats and Vulnerabilities
A **vulnerability** is a weakness in a system; a **threat** is a potential cause of harm that could exploit that vulnerability. Common categories: malware, phishing, misconfigurations, outdated/vulnerable cryptography (directly relevant to this entire program), and social engineering.

## 4.5 Network Security
Applying the networking concepts from A3 defensively: segmentation, firewalls, intrusion detection, and secure protocol choices (e.g., preferring HTTPS over HTTP, disabling outdated TLS versions).

## 4.6 Endpoint Security
Protecting individual devices (laptops, servers, mobile devices) — antivirus/EDR tools, patch management, and device hardening.

## 4.7 Security Monitoring
Continuously observing systems for signs of compromise — logs, alerts, anomaly detection. This is the same underlying skill needed to interpret Q-CAPS scan findings and readiness dashboards later in the program.

## 4.8 Incident Response
The structured process for handling a security incident once detected: identify, contain, eradicate, recover, and review. A useful mental model even at the foundational level, since it reappears formally in Track D's Governance module.

## 4.9 Security Risk Fundamentals
Risk = likelihood × impact. Understanding this basic formula prepares learners for the more formal risk-scoring models used later in Track D's Quantum Readiness Assessment.

**🎨 Interactive/Visual Requirement:**
> Scenario-based mini-quiz widget: short real-world scenarios (e.g., "an employee clicks a suspicious link") where the learner identifies which CIA property is threatened and what control would help — reinforces application, not just memorization.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 4.1–4.9.
- Practical assessment: classify 10 short scenario descriptions by which CIA property is at risk and suggest an appropriate control.
- Unlocks: `A5 — Cryptography Foundations`.
