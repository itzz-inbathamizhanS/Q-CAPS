# Q-CAPS --- Integrated Quantum Cybersecurity Education & Organizational Readiness Platform

## 1. Project Overview

Q-CAPS is an integrated platform for Post-Quantum Cryptography (PQC)
education, authorized cryptographic assessment, workforce skill
assessment, practical training, and organizational readiness evaluation.

The central research idea is:

**Organizational Crypto Risk → Required PQC Skills → Skill Assessment →
Skill Gap → Targeted Training → Practical Validation → PQC Readiness**

Q-CAPS is not intended to create a new cryptographic algorithm. Its
proposed contribution is the integration and mapping between
cryptographic evidence, workforce competency, targeted education,
practical validation, and measurable readiness.

## 2. Domain

**Primary domain:** Cybersecurity

**Research areas:** Post-Quantum Cryptography, Cybersecurity Education,
Cryptographic Migration, Workforce Skill Assessment, Security Risk
Assessment, Cybersecurity Training, Organizational Readiness, and
Crypto-Agility.

NIST finalized FIPS 203, FIPS 204, and FIPS 205 in 2024 for ML-KEM,
ML-DSA, and SLH-DSA respectively. This makes practical PQC migration an
active engineering and organizational problem.

## 3. Problem

Organizations need to identify classical public-key cryptography,
understand migration requirements, and prepare people to perform PQC
migration tasks. Existing approaches commonly focus on separate areas
such as education, cryptographic inventory, migration planning,
scanning, or competency assessment.

The key missing connection is:

**Cryptographic finding → Required human skill → Skill assessment →
Skill gap → Targeted training → Practical validation**

For example:

**Legacy RSA/TLS configuration → PQC migration requirement → TLS/PQC
skill requirement → employee assessment → skill gap → targeted
hybrid-TLS lab → reassessment → improved readiness.**

## 4. Research Gap

A 2024 IEEE Access systematic literature review reports major PQC
migration challenges including limited PQC experience, high
implementation effort, security concerns, and migration complexity. It
also notes inconsistency in migration processes, roles, terminology, and
best practices.

Q-CAPS investigates the gap between technical migration requirements and
workforce capability:

> Existing approaches can identify cryptographic risk or provide PQC
> education, but they do not adequately provide a complete
> evidence-driven chain from organizational cryptographic findings to
> required workforce competencies, individual skill-gap analysis,
> targeted practical training, reassessment, and measurable workforce
> readiness.

## 5. Proposed Solution

Q-CAPS combines:

-   PQC education
-   Gamified learning
-   Practical PQC laboratories
-   Authorized cryptographic scanning
-   Cryptographic inventory
-   Risk identification
-   PQC migration requirement mapping
-   Workforce skill assessment
-   Skill-gap analysis
-   Targeted training recommendations
-   Practical challenges
-   Reassessment
-   Organizational readiness measurement
-   Reports and dashboards

## 6. Target Communities

### Students

Learn PQC concepts, complete practical exercises, take assessments, and
demonstrate skills.

### Cybersecurity Professionals

Evaluate PQC knowledge and practice migration-related tasks.

### Organizations

Perform authorized assessments, identify cryptographic risks, determine
required competencies, and evaluate workforce readiness.

### Instructors and Researchers

Create learning content, practical challenges, assessments, and analyze
learner progress.

## 7. Core Novel Concept --- Risk-to-Skill Mapping

The central proposed mechanism is a **Risk-to-Skill Mapping Engine**.

Instead of treating technical risk and education as separate systems:

**Cryptographic Finding → Risk Category → PQC Requirement → Required
Competency → Assessment → Skill Gap → Training → Practical Challenge →
Reassessment → Readiness**

Example:

**RSA-based key establishment detected → migration requirement →
ML-KEM/hybrid migration skill → assessment → low score → targeted
training → practical migration challenge → reassessment → improved
competency.**

The novelty claim should be treated as a research hypothesis and
validated against the latest literature and patent prior art, rather
than stated as proof that no similar system exists.

## 8. Main Modules

### 8.1 User Management

Registration, authentication, authorization, roles, student accounts,
employee accounts, organization accounts, instructors, and researchers.

### 8.2 PQC Education

Beginner-to-advanced learning covering computer basics, cybersecurity,
cryptography, quantum computing, Shor's algorithm, Grover's algorithm,
PQC, ML-KEM, ML-DSA, SLH-DSA, hybrid cryptography, crypto-agility, and
migration.

### 8.3 Gamified Learning

Levels, points, badges, quizzes, challenges, progress tracking, and
skill milestones.

### 8.4 Cryptographic Scan Engine

Authorized assessment of approved TLS/SSL, SSH, certificates, public-key
algorithms, cryptographic libraries, application configuration, approved
repositories, and other permitted assets.

Example findings: - RSA detected - ECDSA detected - ECDH detected -
Legacy TLS configuration - Classical certificate - PQC algorithm
detected - Hybrid configuration detected - Unknown cryptographic
dependency

The scanner should produce structured evidence such as asset, protocol,
algorithm, usage, location, risk category, migration relevance, required
competency, evidence, and priority.

### 8.5 Cryptographic Inventory

Stores assets, protocols, algorithms, usage, PQC relevance, and
migration priority.

### 8.6 Risk Analysis

Risk can consider algorithm, asset importance, data sensitivity,
exposure, migration difficulty, dependencies, certificate lifetime,
protocol support, business criticality, and long-term confidentiality
requirements.

A prototype may use a transparent scoring model, for example:

**Risk Score = Exposure × Asset Criticality × PQC Dependency × Migration
Urgency**

The exact model must be experimentally validated.

### 8.7 PQC Requirement Mapping

Examples:

  Finding                 Requirement                Required Skill
  ----------------------- -------------------------- ------------------------------
  RSA in TLS              PQC/hybrid TLS migration   TLS + PQC
  Classical certificate   Certificate migration      PKI + PQC signatures
  ECC dependency          Public-key transition      ECC/PQC migration
  Legacy library          Library upgrade            Secure dependency management
  HSM dependency          PQC-capable HSM planning   Key management + HSM

### 8.8 Skill Assessment

Knowledge tests, technical tasks, configuration analysis, algorithm
identification, migration decisions, and practical tasks.

### 8.9 Skill Matrix

Example:

  Skill                Required   Current   Gap
  ------------------ ---------- --------- -----
  PQC Fundamentals           80        75     5
  ML-KEM                     80        45    35
  ML-DSA                     70        50    20
  TLS Migration              90        40    50
  PKI                        75        65    10

### 8.10 Skill-Gap Engine

**Required Competency − Demonstrated Competency = Skill Gap**

Gaps can be classified as critical, high, medium, or low.

### 8.11 Recommendation Engine

Maps identified gaps to specific lessons, labs, challenges, and
assessments.

### 8.12 Practical Lab Engine

Controlled exercises such as identifying classical algorithms, analyzing
TLS configurations, working with ML-KEM, analyzing certificate
requirements, comparing classical/PQC configurations, and creating
simulated migration plans.

### 8.13 Reassessment

Measures improvement before and after targeted training.

### 8.14 Readiness Engine

Can report cryptographic coverage, critical-risk coverage, workforce
competency, practical competency, training completion, skill-gap
severity, and reassessment performance.

## 9. Three-Tier Architecture

### Presentation Layer

-   Student Portal
-   Employee Portal
-   Organization Portal
-   Instructor/Research Portal
-   Training Interface
-   Assessment Interface
-   Readiness Dashboard

### Application Layer

-   Authentication & RBAC
-   PQC Education
-   Crypto Scan Engine
-   Risk & PQC Analysis
-   Skill Assessment
-   Skill-Gap Engine
-   Recommendation Engine
-   Practical Lab Engine
-   Reassessment Engine
-   Readiness Engine
-   Reporting & Analytics

### Data Layer

-   User & Role Database
-   Cryptographic Inventory
-   Scan Results
-   Risk & PQC Requirements
-   Skill Matrix
-   Assessment Records
-   Training Repository
-   Lab Results
-   Progress Data
-   Readiness Reports

## 10. Complete Workflow

**User/Organization → PQC Education → Authorized Scan → Cryptographic
Inventory → Risk Analysis → PQC Requirements → Required Skill Mapping →
Skill Assessment → Skill Gap → Targeted Training → Practical Challenge →
Reassessment → Readiness Evaluation → Report/Dashboard**

## 11. Research Methodology

1.  Literature review
2.  Gap identification
3.  Requirement analysis
4.  System design
5.  Implementation
6.  Integration
7.  Experimental evaluation

The literature review covers PQC migration, PQC education, cryptographic
inventory, crypto-agility, competency models, adaptive learning, and
gamified cybersecurity education.

## 12. Research Questions

**RQ1:** Can organizational cryptographic findings be systematically
converted into required PQC workforce competencies?

**RQ2:** Can skill-gap analysis provide more targeted PQC training than
a fixed curriculum?

**RQ3:** Does risk-linked practical training improve demonstrated PQC
competency?

**RQ4:** Can reassessment provide measurable evidence of workforce
improvement?

**RQ5:** Can technical cryptographic evidence and workforce capability
be combined into an organizational PQC readiness view?

## 13. Experimental Design

A useful experiment compares:

**Group A --- Conventional Learning:** Standard PQC learning.

**Group B --- Q-CAPS:** Initial assessment → skill-gap analysis →
targeted training → practical challenge → reassessment.

Possible metrics:

**Learning Gain = Post-Test Score − Pre-Test Score**

**Skill-Gap Reduction = Initial Gap − Final Gap**

**Practical Success Rate = Successful Tasks / Total Tasks × 100**

Do not claim superiority until actual experiments are performed.

## 14. Expected Contributions

1.  Integrated PQC education and organizational assessment platform.
2.  Cryptographic evidence-to-skill mapping model.
3.  PQC competency matrix.
4.  Automated skill-gap identification.
5.  Evidence-driven training recommendation.
6.  Practical competency validation.
7.  Reassessment-based readiness measurement.
8.  Organizational PQC readiness profile.

## 15. Difference from Existing Approaches

  --------------------------------------------------------------------------
  Existing Approach Main Focus        Limitation        Q-CAPS
  ----------------- ----------------- ----------------- --------------------
  PQC Courses       Learning          Fixed curriculum  Risk-linked learning

  Crypto Scanners   Technical         No workforce      Finding → Skill
                    findings          assessment        

  Migration         Migration         Limited personnel Risk → Skill →
  Frameworks        planning          measurement       Training

  Competency Models Skills            Not tied to live  Requirement-driven
                                      crypto            skills
                                      requirements      

  Gamified Learning Engagement        Limited           Practical +
                                      organizational    risk-linked
                                      context           

  Readiness Models  Organization      Limited           Technical +
                                      individual        workforce readiness
                                      validation        
  --------------------------------------------------------------------------

## 16. Security Requirements

Because Q-CAPS can assess organizational assets, the scanner must
require explicit authorization and controlled scope.

Required controls include:

-   Role-based access
-   Authorization before scanning
-   Audit logs
-   Encryption in transit
-   Encryption at rest
-   Secure credential storage
-   Scope restrictions
-   Rate limiting
-   Tenant isolation
-   Secure report access

The scanner should not be an unrestricted attack tool.

## 17. Example End-to-End Scenario

An organization registers an approved web server.

1.  The organization selects the authorized asset.
2.  Q-CAPS performs a cryptographic assessment.
3.  The scanner identifies classical dependencies.
4.  Findings are added to the cryptographic inventory.
5.  Risk analysis determines migration priority.
6.  Required PQC competencies are generated.
7.  Employees complete skill assessments.
8.  Q-CAPS compares required and demonstrated skills.
9.  Skill gaps are identified.
10. Targeted training is recommended.
11. Employees complete practical migration challenges.
12. Employees are reassessed.
13. The organization receives an updated readiness profile.

## 18. Expected Dashboard

Illustrative example only:

``` text
Q-CAPS ORGANIZATIONAL READINESS

Crypto Assets Assessed       128
High-Priority Findings        23
PQC Requirements              18

Workforce Members             42
Required PQC Skills           15
Critical Skill Gaps             7

Training Completion           74%
Practical Competency          68%
Critical Skill Coverage       61%

Overall PQC Readiness         69%
```

These numbers are examples, not experimental results.

## 19. Limitations

-   A scanner cannot guarantee discovery of every cryptographic
    dependency.
-   Source-code analysis may produce false positives and false
    negatives.
-   Skill scores depend on assessment quality.
-   Readiness scores depend on the selected scoring model.
-   Organizational readiness is broader than employee skill alone.
-   PQC standards and migration guidance can evolve.
-   Production scanning requires strict authorization.
-   Experimental results must be collected before effectiveness claims.

## 20. Strong Research Position

Do not present the project simply as:

> "A PQC learning website."

Present it as:

> **An evidence-driven PQC workforce readiness system that converts
> authorized cryptographic findings into required competencies, measures
> workforce skill gaps, delivers targeted practical training, and
> validates improvement through reassessment.**

## 21. Final Research Hypothesis

> If organizational cryptographic requirements are explicitly mapped to
> workforce competencies, and identified competency gaps are addressed
> through targeted practical training followed by reassessment, then
> workforce PQC readiness can be measured more directly than through
> standalone PQC education or standalone cryptographic scanning.

## 22. Suggested Research Paper Structure

1.  Introduction
2.  Background and Motivation
3.  Related Work / Literature Survey
4.  Research Gap
5.  Problem Statement
6.  Q-CAPS Architecture
7.  Risk-to-Skill Mapping Model
8.  Cryptographic Scan Engine
9.  PQC Competency and Skill-Gap Model
10. Training and Practical Challenge Framework
11. Readiness Measurement
12. Implementation
13. Experimental Methodology
14. Results and Discussion
15. Limitations
16. Conclusion and Future Work

## 23. Technical Foundation

NIST finalized three PQC standards in August 2024:

-   **FIPS 203 --- ML-KEM**
-   **FIPS 204 --- ML-DSA**
-   **FIPS 205 --- SLH-DSA**

ML-KEM is a key-encapsulation mechanism, while ML-DSA and SLH-DSA are
digital-signature standards.

A 2024 IEEE Access systematic literature review of PQC migration
reported challenges including lack of PQC experience, high realization
effort, security concerns, and high complexity. These findings strongly
support investigating the workforce capability side of migration.

## 24. References

\[1\] National Institute of Standards and Technology, FIPS 203,
Module-Lattice-Based Key-Encapsulation Mechanism Standard, 2024.

\[2\] National Institute of Standards and Technology, FIPS 204,
Module-Lattice-Based Digital Signature Standard, and FIPS 205, Stateless
Hash-Based Digital Signature Standard, 2024.

\[3\] "Migrating Software Systems Toward Post-Quantum Cryptography---A
Systematic Literature Review," IEEE Access, vol. 12, pp. 132107--132126,
Aug. 2024, DOI: 10.1109/ACCESS.2024.3450306.

\[4\] National Institute of Standards and Technology, Post-Quantum
Cryptography and PQC Migration Guidance.

## 25. One-Line Definition

**Q-CAPS connects organizational cryptographic risk with workforce PQC
skills and closes the gap through targeted learning, practical
validation, and measurable readiness.**
