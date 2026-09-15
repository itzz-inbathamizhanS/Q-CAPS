// Generated from Content-Security/Course
import { CurriculumModule, CurriculumTrack } from '@/features/curriculum/curriculumTypes';

export const curriculumTracks: CurriculumTrack[] = [
  {
    "id": "track-a",
    "code": "Track A",
    "title": "Foundations",
    "subtitle": "Computing, Networking, Cryptography & Quantum Basics",
    "description": "Foundational on-ramp for cybersecurity and quantum computing, with zero prerequisites required.",
    "entryProfile": "Little or no prior exposure to quantum computing, cybersecurity, networking, cryptography, or advanced mathematics.",
    "certificateName": "Certificate in Quantum Foundations",
    "certificateCode": "CQF",
    "capstoneTitle": "Beginner Capstone",
    "capstoneDescription": "Build a secure small network plus a basic cryptographic application and an introductory quantum circuit.",
    "accentColor": "#38bdf8",
    "moduleIds": [
      "track_a_a1_computing_foundations",
      "track_a_a2_mathematics_foundations",
      "track_a_a3_networking_foundations",
      "track_a_a4_cybersecurity_foundations",
      "track_a_a5_cryptography_foundations",
      "track_a_a6_quantum_foundations",
      "track_a_a7_first_quantum_programming",
      "module_3_pqc_mitigation"
    ]
  },
  {
    "id": "track-b",
    "code": "Track B",
    "title": "Intermediate / Engineering",
    "subtitle": "Quantum Algorithms, Circuits, Advanced Cryptography & PQC Fundamentals",
    "description": "Deep dive into quantum information, algorithm mechanics, hardware realities, and lattice-based PQC standards.",
    "entryProfile": "Completed Track A or possesses university-level STEM background in linear algebra, basic cryptography, and Python.",
    "certificateName": "Certificate in Quantum Security Engineering",
    "certificateCode": "CQSE",
    "capstoneTitle": "Intermediate Capstone",
    "capstoneDescription": "Design and simulate an enterprise cryptographic migration plan with hybrid key exchange.",
    "accentColor": "#818cf8",
    "moduleIds": [
      "track_b_b1_advanced_math_for_quantum",
      "track_b_b2_quantum_information",
      "track_b_b3_quantum_algorithms",
      "track_b_b4_quantum_programming",
      "track_b_b5_quantum_hardware",
      "track_b_b6_network_security_engineering",
      "track_b_b7_advanced_cryptography",
      "track_b_b8_quantum_threats",
      "track_b_b9_pqc_fundamentals",
      "track_b_b10_pqc_standards",
      "track_b_b11_intermediate_pqc_labs"
    ]
  },
  {
    "id": "track-c",
    "code": "Track C",
    "title": "Advanced / Specialist",
    "subtitle": "Quantum Error Correction, QKD, Implementation Attacks & Defense Engineering",
    "description": "Specialist engineering in quantum key distribution, fault tolerance, side-channel attacks, and constant-time PQC defense.",
    "entryProfile": "Completed Track B or holds substantial hands-on cryptography or quantum physics engineering experience.",
    "certificateName": "Quantum & PQC Specialist Certification",
    "certificateCode": "QCE / PQC-E / QNE",
    "capstoneTitle": "Advanced Specialist Capstone",
    "capstoneDescription": "Select from Implementation Security, Quantum Network Architecture, or Secure Communications capstone.",
    "accentColor": "#c084fc",
    "moduleIds": [
      "track_c_c1_advanced_quantum_information",
      "track_c_c2_advanced_quantum_algorithms",
      "track_c_c3_quantum_error_correction",
      "track_c_c4_quantum_networking",
      "track_c_c5_quantum_communications",
      "track_c_c6_quantum_key_distribution",
      "track_c_c7_advanced_cryptography",
      "track_c_c8_pqc_mathematics",
      "track_c_c9_pqc_implementation_engineering",
      "track_c_c10_pqc_attack_surface",
      "track_c_c11_pqc_defense_engineering"
    ]
  },
  {
    "id": "track-d",
    "code": "Track D",
    "title": "Enterprise Architect",
    "subtitle": "Crypto Discovery, CBOM, Agility, Migration Governance & Board Strategy",
    "description": "Executive and architectural governance for executing enterprise-wide post-quantum migrations and risk management.",
    "entryProfile": "CISOs, Lead Security Architects, Risk Officers, and Senior Engineers managing enterprise cryptographic assets.",
    "certificateName": "Quantum Security Architect Certificate",
    "certificateCode": "QSA",
    "capstoneTitle": "Architect Capstone",
    "capstoneDescription": "Produce an end-to-end enterprise quantum readiness assessment, CBOM strategy, and executive migration roadmap.",
    "accentColor": "#f59e0b",
    "moduleIds": [
      "track_d_e1_quantum_risk_management",
      "track_d_e2_cryptographic_discovery",
      "track_d_e3_quantum_readiness_assessment",
      "track_d_e4_crypto_agility",
      "track_d_e5_enterprise_pqc_migration",
      "track_d_e6_governance"
    ]
  }
];

export const curriculumModules: CurriculumModule[] = [
  {
    "id": "track_a_a1_computing_foundations",
    "trackId": "track-a",
    "code": "A1",
    "title": "Computing Foundations",
    "level": "Beginner",
    "estimatedMinutes": 120,
    "xp": 120,
    "prerequisites": [],
    "unlocks": "track_a_a2_mathematics_foundations",
    "learningObjectives": [
      "Explain what a computer actually does at the hardware level (CPU, memory, storage).",
      "Understand what an operating system and a process are, and why that matters for security later.",
      "Write and run basic Python programs.",
      "Understand core algorithm/data-structure concepts and use Git for version control.",
      "Navigate a Linux command line confidently."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "1.1 Computer Fundamentals",
        "content": "A computer is fundamentally a machine that follows instructions extremely fast and extremely literally. Every action — opening a browser, running a scan, encrypting a file — ultimately reduces to billions of simple operations executed by the **CPU (Central Processing Unit)**. Understanding this \"instructions in, instructions out\" model is the foundation for understanding both how software works and how it can be attacked (e.g., an attacker exploiting how the CPU executes instructions is the basis of side-channel attacks, covered much later in Track C)."
      },
      {
        "id": "sec-2",
        "title": "1.2 Operating Systems and Processes",
        "content": "An **operating system (OS)** manages hardware resources and runs **processes** — individual running programs, each with their own memory space, isolated from other processes. This isolation is a foundational security concept: it's *why* one browser tab crashing doesn't crash your whole computer, and it's the same principle behind sandboxing and containerization used in modern cybersecurity architecture."
      },
      {
        "id": "sec-3",
        "title": "1.3 CPU, Memory, and Storage",
        "content": "- **CPU** — executes instructions.\n- **Memory (RAM)** — fast, temporary storage for data actively being used; lost when powered off.\n- **Storage (disk/SSD)** — slower, permanent storage.\n\nThis distinction matters directly for cryptography: cryptographic keys held only in memory are more vulnerable to certain live-system attacks, while keys on disk are vulnerable to different threats (theft, unauthorized access) — informing key-management decisions covered in Track B."
      },
      {
        "id": "sec-4",
        "title": "1.4 Programming Concepts",
        "content": "Variables, functions, loops, conditionals, and data types are the building blocks of every program you'll write in this course, including the Python scanning and scoring scripts your teammates are building."
      },
      {
        "id": "sec-5",
        "title": "1.5 Python Fundamentals",
        "content": "Python is the primary language used across Q-CAPS — Inba's scanner engine and Vishnu Priya's backend both use it. Core skills to build here: variables and data types, control flow (`if`/`for`/`while`), functions, working with strings and JSON, and using libraries (`import`).",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** In-browser Python code sandbox (e.g., embedded Pyodide) where learners can run small snippets directly and see output immediately, rather than just reading code blocks."
      },
      {
        "id": "sec-6",
        "title": "1.6 Algorithms and Data Structures",
        "content": "Basic algorithmic thinking (searching, sorting, complexity/Big-O intuition at a beginner level) and core data structures (lists, dictionaries, sets) — enough to read and reason about code you'll encounter throughout the program, including quantum algorithm pseudocode later in Track B."
      },
      {
        "id": "sec-7",
        "title": "1.7 Git and Development Environments",
        "content": "Version control is not optional for any team-based technical project. Learners should be able to: clone a repository, create a branch, commit changes, push to a remote, and open a Pull Request — exactly the workflow your own Q-CAPS team already uses."
      },
      {
        "id": "sec-8",
        "title": "1.8 Linux Fundamentals",
        "content": "Basic command-line navigation (`cd`, `ls`, `pwd`), file operations (`cp`, `mv`, `rm`), permissions (`chmod`), and process management (`ps`, `kill`) — essential because most servers, scanning tools, and cloud infrastructure run on Linux.\n\n---"
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering all 8 sections above.\n- Practical assessment: complete a short Python scripting exercise and a Git workflow exercise (clone → branch → commit → push → PR).\n- Unlocks: `A2 — Mathematics Foundations`."
    }
  },
  {
    "id": "track_a_a2_mathematics_foundations",
    "trackId": "track-a",
    "code": "A2",
    "title": "Mathematics Foundations",
    "level": "Beginner",
    "estimatedMinutes": 150,
    "xp": 120,
    "prerequisites": [
      "track_a_a1_computing_foundations"
    ],
    "unlocks": "track_a_a3_networking_foundations",
    "learningObjectives": [
      "Build comfort with algebra, exponents, and logarithms as they apply to cryptographic key sizes.",
      "Understand basic probability and statistics — essential for reasoning about quantum measurement later.",
      "Understand complex numbers, vectors, and matrices at an introductory level.",
      "Recognize eigenvalues/eigenvectors and Boolean math conceptually, without requiring a full linear algebra course yet (that's Track B)."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "2.1 Arithmetic and Algebra",
        "content": "Solid algebra — solving equations, working with variables — underlies every formula you'll encounter later, from RSA key generation to quantum probability calculations."
      },
      {
        "id": "sec-2",
        "title": "2.2 Functions, Exponents, and Logarithms",
        "content": "This section matters more than it looks. Cryptographic key strength is described in terms of exponents (a 2048-bit key means 2²⁰⁴⁸ possible values) and cracking time is described using logarithms. Understanding \"2ⁿ\" intuitively here directly prepares you for Module 2's \"n qubits = 2ⁿ states\" concept in the core PQC Foundations track."
      },
      {
        "id": "sec-3",
        "title": "2.3 Probability and Statistics",
        "content": "Basic probability (what's the chance of an event, how do independent events combine) is essential groundwork for understanding quantum measurement, where outcomes are inherently probabilistic rather than deterministic."
      },
      {
        "id": "sec-4",
        "title": "2.4 Complex Numbers",
        "content": "A complex number has a real and an imaginary part (e.g., 3 + 4i). This might seem disconnected from cybersecurity, but complex numbers are the mathematical language quantum mechanics is written in — qubit amplitudes (α and β from earlier) are complex numbers."
      },
      {
        "id": "sec-5",
        "title": "2.5 Vectors and Matrices",
        "content": "A vector is an ordered list of numbers; a matrix is a grid of numbers that can transform vectors. Quantum gates are literally represented as matrices that transform qubit-state vectors — this section is direct preparation for quantum circuit math in Track B."
      },
      {
        "id": "sec-6",
        "title": "2.6 Basic Linear Algebra",
        "content": "Building on vectors/matrices: operations like matrix multiplication and understanding what a linear transformation does geometrically."
      },
      {
        "id": "sec-7",
        "title": "2.7 Eigenvalues/Eigenvectors (Conceptual Introduction)",
        "content": "An eigenvector of a transformation is a vector that only gets scaled (not rotated) by that transformation; the scale factor is its eigenvalue. This concept becomes essential in Track B/C when studying quantum measurement and unitary operators — introduced here only conceptually, with the full mathematical treatment deferred to Track B."
      },
      {
        "id": "sec-8",
        "title": "2.8 Boolean Mathematics",
        "content": "AND, OR, NOT, XOR — the logic underlying classical digital circuits, and a useful contrast point when later comparing classical logic gates to quantum gates in A6/A7.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Interactive vector/matrix visualizer: user adjusts a 2D vector and a simple transformation matrix, watching the vector rotate/scale in real time — builds geometric intuition before the abstract notation is introduced."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 2.1–2.8.\n- Practical assessment: a short problem set applying exponents/logs to key-size comparisons (tying directly back to the RSA/ECC key-size discussion in PQC Foundations Module 1).\n- Unlocks: `A3 — Networking Foundations`."
    }
  },
  {
    "id": "track_a_a3_networking_foundations",
    "trackId": "track-a",
    "code": "A3",
    "title": "Networking Foundations",
    "level": "Beginner",
    "estimatedMinutes": 130,
    "xp": 120,
    "prerequisites": [
      "track_a_a2_mathematics_foundations"
    ],
    "unlocks": "track_a_a4_cybersecurity_foundations",
    "learningObjectives": [
      "Understand LAN/WAN, the OSI and TCP/IP models, and how data actually travels across a network.",
      "Understand IP addressing, DNS, DHCP, and the difference between TCP and UDP.",
      "Understand HTTP/HTTPS, routing/switching basics, and firewall/VPN fundamentals."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "3.1 LAN/WAN",
        "content": "A **LAN (Local Area Network)** connects devices within a limited area (a home, office, campus). A **WAN (Wide Area Network)** connects LANs across larger distances — the internet itself is the largest WAN. Every scan Inba's scanner engine performs travels across this exact LAN → WAN → target-server path."
      },
      {
        "id": "sec-2",
        "title": "3.2 OSI and TCP/IP Models",
        "content": "The **OSI model** (7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application) is the conceptual reference model for how network communication is layered. The **TCP/IP model** (4 layers: Link, Internet, Transport, Application) is the practical model the real internet actually runs on. Understanding these layers matters directly for this course: TLS/SSL — the exact thing being scanned for PQC readiness — operates at the boundary between the Transport and Application layers."
      },
      {
        "id": "sec-3",
        "title": "3.3 IP Addressing and Subnetting",
        "content": "Every device on a network needs a unique **IP address** to be reachable. **Subnetting** divides a network into smaller segments — important for both network design and for understanding how organizations scope which assets are \"in bounds\" for an authorized security scan (a concept that becomes critical in the Organization module of full Q-CAPS)."
      },
      {
        "id": "sec-4",
        "title": "3.4 IPv4 and IPv6",
        "content": "IPv4 uses 32-bit addresses (e.g., 192.168.1.1) and is running out of available addresses; IPv6 uses 128-bit addresses to solve this at internet scale. Both remain widely deployed today."
      },
      {
        "id": "sec-5",
        "title": "3.5 TCP/UDP",
        "content": "**TCP (Transmission Control Protocol)** is connection-oriented and guarantees delivery and order — used for web traffic, email, and virtually all TLS-protected connections. **UDP (User Datagram Protocol)** is connectionless and faster but doesn't guarantee delivery — used for video streaming, gaming, DNS lookups."
      },
      {
        "id": "sec-6",
        "title": "3.6 DNS and DHCP",
        "content": "**DNS (Domain Name System)** translates human-readable domain names (google.com) into IP addresses. **DHCP (Dynamic Host Configuration Protocol)** automatically assigns IP addresses to devices joining a network. Both are common attack surfaces in real-world cybersecurity, and DNS resolution is the very first step Inba's scanner performs before it can even connect to a target."
      },
      {
        "id": "sec-7",
        "title": "3.7 HTTP/HTTPS",
        "content": "**HTTP** is the protocol web browsers and servers use to communicate. **HTTPS** is HTTP secured by TLS — this is precisely the certificate and cryptographic handshake that the entire Q-CAPS platform is built to analyze for post-quantum readiness."
      },
      {
        "id": "sec-8",
        "title": "3.8 Routing and Switching",
        "content": "**Switches** connect devices within a LAN. **Routers** connect different networks together (e.g., your LAN to your ISP's WAN), making forwarding decisions based on IP addresses."
      },
      {
        "id": "sec-9",
        "title": "3.9 Firewalls and VPN Basics",
        "content": "A **firewall** filters network traffic based on rules (allow/block by port, IP, protocol). A **VPN (Virtual Private Network)** creates an encrypted tunnel between two points over an untrusted network — itself a real-world application of exactly the cryptography covered in PQC Foundations Module 1."
      },
      {
        "id": "sec-10",
        "title": "3.10 Network Monitoring",
        "content": "Basic awareness of tools and techniques for observing traffic and identifying anomalies — foundational for the \"detection\" stage of the Attack-to-Defense learning model used throughout Tracks B and C.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Animated packet-journey diagram: user's browser → DNS lookup → TCP handshake → TLS handshake → HTTP request → server response, each step highlighted with a one-line explanation as it \"travels\" across a simple network diagram."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 3.1–3.10.\n- Practical assessment: subnet a small network on paper/simulator and trace a full HTTPS request's journey through the OSI layers.\n- Unlocks: `A4 — Cybersecurity Foundations`."
    }
  },
  {
    "id": "track_a_a4_cybersecurity_foundations",
    "trackId": "track-a",
    "code": "A4",
    "title": "Cybersecurity Foundations",
    "level": "Beginner",
    "estimatedMinutes": 130,
    "xp": 120,
    "prerequisites": [
      "track_a_a3_networking_foundations"
    ],
    "unlocks": "track_a_a5_cryptography_foundations",
    "learningObjectives": [
      "Explain the CIA triad and how it relates to the confidentiality/integrity/authenticity model from PQC Foundations Module 1.",
      "Understand authentication, authorization, and identity/access control.",
      "Recognize common threat and vulnerability categories.",
      "Understand network security, endpoint security, security monitoring, and incident response at a foundational level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "4.1 The CIA Triad",
        "content": "**Confidentiality, Integrity, Availability** — the classic security model. Confidentiality and Integrity map directly to what you already learned in the core PQC Foundations track; **Availability** (systems and data are accessible when needed) is the addition here — a reminder that security isn't only about secrecy, but also about resilience against denial-of-service and outages."
      },
      {
        "id": "sec-2",
        "title": "4.2 Authentication and Authorization",
        "content": "**Authentication** answers \"who are you?\" (e.g., logging in with a password). **Authorization** answers \"what are you allowed to do?\" (e.g., an admin vs. a regular user). These are distinct steps that are frequently confused — a system can authenticate you correctly but still authorize you incorrectly, which is a common real-world vulnerability class. This distinction is exactly what your own Q-CAPS auth system (JWT + role-based middleware) implements."
      },
      {
        "id": "sec-3",
        "title": "4.3 Identity and Access Control",
        "content": "Extending 4.2: models like **RBAC (Role-Based Access Control)** assign permissions based on a user's role rather than individually per user — directly reflected in Q-CAPS's own `role` field (student/employee/organization/instructor/researcher) and the `verify_role` middleware built for it."
      },
      {
        "id": "sec-4",
        "title": "4.4 Threats and Vulnerabilities",
        "content": "A **vulnerability** is a weakness in a system; a **threat** is a potential cause of harm that could exploit that vulnerability. Common categories: malware, phishing, misconfigurations, outdated/vulnerable cryptography (directly relevant to this entire program), and social engineering."
      },
      {
        "id": "sec-5",
        "title": "4.5 Network Security",
        "content": "Applying the networking concepts from A3 defensively: segmentation, firewalls, intrusion detection, and secure protocol choices (e.g., preferring HTTPS over HTTP, disabling outdated TLS versions)."
      },
      {
        "id": "sec-6",
        "title": "4.6 Endpoint Security",
        "content": "Protecting individual devices (laptops, servers, mobile devices) — antivirus/EDR tools, patch management, and device hardening."
      },
      {
        "id": "sec-7",
        "title": "4.7 Security Monitoring",
        "content": "Continuously observing systems for signs of compromise — logs, alerts, anomaly detection. This is the same underlying skill needed to interpret Q-CAPS scan findings and readiness dashboards later in the program."
      },
      {
        "id": "sec-8",
        "title": "4.8 Incident Response",
        "content": "The structured process for handling a security incident once detected: identify, contain, eradicate, recover, and review. A useful mental model even at the foundational level, since it reappears formally in Track D's Governance module."
      },
      {
        "id": "sec-9",
        "title": "4.9 Security Risk Fundamentals",
        "content": "Risk = likelihood × impact. Understanding this basic formula prepares learners for the more formal risk-scoring models used later in Track D's Quantum Readiness Assessment.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Scenario-based mini-quiz widget: short real-world scenarios (e.g., \"an employee clicks a suspicious link\") where the learner identifies which CIA property is threatened and what control would help — reinforces application, not just memorization."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 4.1–4.9.\n- Practical assessment: classify 10 short scenario descriptions by which CIA property is at risk and suggest an appropriate control.\n- Unlocks: `A5 — Cryptography Foundations`."
    }
  },
  {
    "id": "track_a_a5_cryptography_foundations",
    "trackId": "track-a",
    "code": "A5",
    "title": "Cryptography Foundations",
    "level": "Beginner",
    "estimatedMinutes": 140,
    "xp": 120,
    "prerequisites": [
      "track_a_a4_cybersecurity_foundations"
    ],
    "unlocks": "track_a_a6_quantum_foundations",
    "learningObjectives": [
      "Reinforce plaintext/ciphertext/key vocabulary, symmetric cryptography (AES), and hashing.",
      "Understand MACs, digital signatures, RSA, ECC, and Diffie-Hellman/ECDH in more depth than the core track.",
      "Understand PKI, certificates, TLS, and key management as practiced in real systems."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "5.1 Plaintext, Ciphertext, and Keys",
        "content": "Foundational vocabulary: **plaintext** is readable data, **ciphertext** is its encrypted form, and a **key** is the secret parameter controlling the transformation between them. Every concept in this module builds on this vocabulary."
      },
      {
        "id": "sec-2",
        "title": "5.2 Symmetric Cryptography & AES",
        "content": "Reinforces core Module 1.2: one shared key for encryption and decryption. Here, go one level deeper into **modes of operation** — how AES processes data longer than one block (e.g., CBC, GCM), and why GCM's built-in authentication makes it the modern preferred choice over older modes."
      },
      {
        "id": "sec-3",
        "title": "5.3 Hashing and SHA Concepts",
        "content": "Reinforces core Module 1.4, with added depth on hash properties: pre-image resistance, second pre-image resistance, and collision resistance — the three formal properties that make SHA-256 suitable for integrity checking and digital signatures."
      },
      {
        "id": "sec-4",
        "title": "5.4 MACs (Message Authentication Codes)",
        "content": "A **MAC** combines a hash function with a shared secret key to prove both integrity and authenticity using only symmetric cryptography — a lighter-weight alternative to full digital signatures when both parties already share a secret key (e.g., **HMAC**, widely used in API authentication and VPN protocols)."
      },
      {
        "id": "sec-5",
        "title": "5.5 Digital Signatures",
        "content": "Reinforces core Module 1.4 with formal treatment: signature generation (hash + private key encryption) and verification (hash + public key decryption + comparison), and why signatures provide **non-repudiation** — the signer can't later credibly deny having signed something."
      },
      {
        "id": "sec-6",
        "title": "5.6 RSA",
        "content": "Reinforces core Module 1.3 with deeper treatment of RSA key generation (choosing large primes, computing the modulus and exponents) at a conceptual level — full mathematical derivation is deferred to Track C."
      },
      {
        "id": "sec-7",
        "title": "5.7 ECC",
        "content": "Reinforces core Module 1.3's ECC coverage, adding why elliptic curve point arithmetic provides equivalent security to RSA at much smaller key sizes."
      },
      {
        "id": "sec-8",
        "title": "5.8 Diffie-Hellman / ECDH",
        "content": "**Diffie-Hellman** is a method for two parties to establish a shared secret key over an insecure channel without ever transmitting the key itself — the mathematical basis for how TLS establishes session keys. **ECDH** is the elliptic-curve variant, used far more commonly in modern TLS than classic Diffie-Hellman."
      },
      {
        "id": "sec-9",
        "title": "5.9 PKI and Certificates",
        "content": "Reinforces core Module 1.5's chain-of-trust concept, with added depth: certificate fields (issuer, subject, validity period, public key), certificate revocation (CRLs, OCSP), and why certificate expiration/revocation matters for real-world security hygiene."
      },
      {
        "id": "sec-10",
        "title": "5.10 TLS",
        "content": "A deeper look at the TLS handshake: how a client and server negotiate a protocol version, exchange certificates, perform a key exchange (Diffie-Hellman/ECDH), and derive symmetric session keys — tying together nearly every concept from this module into one real protocol."
      },
      {
        "id": "sec-11",
        "title": "5.11 Key Management",
        "content": "The often-overlooked practical side of cryptography: how keys are generated, stored, rotated, and eventually retired. Poor key management (weak randomness, keys stored in plaintext, never rotating keys) is one of the most common real-world causes of cryptographic failure — often a bigger risk in practice than the choice of algorithm itself.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Full TLS handshake step-by-step animation: ClientHello → ServerHello + Certificate → Key Exchange → Finished, with each message's purpose explained as it \"sends\" across the diagram — the capstone visual tying the whole module together."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 5.1–5.11.\n- Practical assessment: annotate a captured (simulated) TLS handshake, identifying each step and what cryptographic operation it represents.\n- Unlocks: `A6 — Quantum Foundations`."
    }
  },
  {
    "id": "track_a_a6_quantum_foundations",
    "trackId": "track-a",
    "code": "A6",
    "title": "Quantum Foundations",
    "level": "Beginner",
    "estimatedMinutes": 140,
    "xp": 120,
    "prerequisites": [
      "track_a_a5_cryptography_foundations"
    ],
    "unlocks": "track_a_a7_first_quantum_programming",
    "learningObjectives": [
      "Reinforce classical bits vs. qubits, superposition, and measurement with more formal treatment.",
      "Understand probability amplitudes and visualize single-qubit states using the Bloch sphere.",
      "Understand quantum gates, circuits, entanglement, interference, and tensor products at an introductory level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "6.1 Classical Bits vs. Qubits",
        "content": "Reinforces core Module 2.1. A classical bit is deterministic (always 0 or 1); a qubit's state is described probabilistically until measured."
      },
      {
        "id": "sec-2",
        "title": "6.2 Quantum States",
        "content": "A quantum state is the complete mathematical description of a qubit (or system of qubits) at a given moment — written as a vector of complex probability amplitudes."
      },
      {
        "id": "sec-3",
        "title": "6.3 Superposition",
        "content": "Reinforces core Module 2.1–2.2. Revisit the spinning-coin analogy, then move to the formal α|0⟩ + β|1⟩ notation with concrete numeric examples (e.g., an equal superposition where α = β = 1/√2)."
      },
      {
        "id": "sec-4",
        "title": "6.4 Measurement",
        "content": "Measurement is the act of \"asking\" a qubit for a definite classical answer, collapsing its superposition. Crucially, measurement is probabilistic and destructive — once measured, the superposition information is gone."
      },
      {
        "id": "sec-5",
        "title": "6.5 Probability Amplitudes",
        "content": "Deeper treatment of α and β: they are complex numbers (connecting back to A2.4), and their squared magnitudes (|α|² and |β|²) give real, physical measurement probabilities that must sum to 1."
      },
      {
        "id": "sec-6",
        "title": "6.6 Bloch Sphere",
        "content": "The **Bloch sphere** is a geometric way to visualize any single-qubit state as a point on the surface of a 3D sphere — the north and south poles represent the definite |0⟩ and |1⟩ states, while every other point represents a superposition. This is the single most useful visualization tool for building single-qubit intuition.",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Interactive 3D Bloch sphere: user drags a point on the sphere's surface and sees the corresponding α|0⟩ + β|1⟩ notation update live, plus a \"Measure\" button showing the probabilistic collapse to a pole."
      },
      {
        "id": "sec-7",
        "title": "6.7 Quantum Gates",
        "content": "Reinforces core Module 2.4. Gates are represented as matrices (connecting to A2.5–2.6) that rotate a qubit's position on the Bloch sphere. The Hadamard gate, for instance, rotates a definite |0⟩ state to the sphere's \"equator\" — an equal superposition."
      },
      {
        "id": "sec-8",
        "title": "6.8 Quantum Circuits",
        "content": "A sequence of gates applied to one or more qubits, read left to right, ending in measurement — the basic unit of a quantum program."
      },
      {
        "id": "sec-9",
        "title": "6.9 Entanglement",
        "content": "Reinforces core Module 2.3, including the QKD-vs-PQC distinction — critical to repeat here since this module may be a learner's first quantum exposure if they tested out of the core track."
      },
      {
        "id": "sec-10",
        "title": "6.10 Interference",
        "content": "Quantum interference occurs when probability amplitudes combine — constructively (increasing the probability of an outcome) or destructively (canceling it out entirely). This is the actual mechanism quantum algorithms exploit: clever circuit design uses interference to boost the probability of measuring the correct answer while canceling out wrong ones — the real explanation behind the \"amplitude engineering\" idea introduced conceptually in core Module 2.2."
      },
      {
        "id": "sec-11",
        "title": "6.11 Tensor Products",
        "content": "When combining multiple qubits into one system, their individual state vectors combine via the **tensor product** — the mathematical operation explaining why n qubits produce a 2ⁿ-dimensional state space (connecting directly back to core Module 2.2's exponential scaling).\n\n---"
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 6.1–6.11.\n- Practical assessment: given a simple 1-2 gate circuit, predict the resulting measurement probabilities by hand.\n- Unlocks: `A7 — First Quantum Programming`."
    }
  },
  {
    "id": "track_a_a7_first_quantum_programming",
    "trackId": "track-a",
    "code": "A7",
    "title": "A 1-qubit circuit",
    "level": "Beginner",
    "estimatedMinutes": 150,
    "xp": 120,
    "prerequisites": [
      "track_a_a6_quantum_foundations"
    ],
    "unlocks": "module_3_pqc_mitigation",
    "learningObjectives": [
      "Write and run a basic quantum circuit using Qiskit.",
      "Use a quantum simulator to test circuits before ever touching real hardware.",
      "Apply basic gates, take measurements, and understand simulated noise.",
      "Run a beginner experiment on real quantum hardware where available."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "7.1 Qiskit Concepts",
        "content": "**Qiskit** is IBM's open-source Python framework for building and running quantum circuits — the industry-standard tool for quantum programming education. Because it's Python-based, everything learned in A1's Python fundamentals transfers directly here."
      },
      {
        "id": "sec-2",
        "title": "7.2 Circuit Creation",
        "content": "In Qiskit, a circuit is built by creating a `QuantumCircuit` object, specifying the number of qubits, then adding gates one at a time — directly mirroring the circuit diagrams introduced conceptually in A6.8.\n\n```python\nfrom qiskit import QuantumCircuit\n\n# A 1-qubit circuit\nqc = QuantumCircuit(1, 1)   # 1 qubit, 1 classical bit for the measurement result\nqc.h(0)                     # Apply a Hadamard gate — creates superposition\nqc.measure(0, 0)            # Measure the qubit into the classical bit\n```"
      },
      {
        "id": "sec-3",
        "title": "7.3 Simulators",
        "content": "Rather than requiring access to expensive, limited quantum hardware, Qiskit provides **simulators** — classical programs that mathematically compute what a quantum circuit's measurement outcomes would be. Simulators are the primary environment for learning, testing, and debugging circuits before ever touching real hardware."
      },
      {
        "id": "sec-4",
        "title": "7.4 Measurements",
        "content": "Running a circuit on a simulator many times (called \"shots\") produces a distribution of outcomes reflecting the underlying probabilities — directly demonstrating the probabilistic nature of measurement covered in A6.4.\n\n```python\nfrom qiskit_aer import AerSimulator\nfrom qiskit import transpile\n\nsim = AerSimulator()\ncompiled = transpile(qc, sim)\nresult = sim.run(compiled, shots=1000).result()\nprint(result.get_counts())   # e.g. {'0': 498, '1': 502} — roughly 50/50, as expected from a Hadamard gate\n```"
      },
      {
        "id": "sec-5",
        "title": "7.5 Basic Gates",
        "content": "Hands-on practice with the most common gates: **X** (bit-flip, the quantum equivalent of a classical NOT), **H** (Hadamard, creates superposition), and **CNOT** (a 2-qubit gate that creates entanglement between two qubits, connecting directly to A6.9)."
      },
      {
        "id": "sec-6",
        "title": "7.6 Noise Simulation",
        "content": "Real quantum hardware is noisy (as covered in the core track's discussion of the NISQ era). Qiskit allows simulating this noise on a classical computer, letting learners see how error rates degrade a circuit's expected results — an important, honest bridge between the idealized simulator and messy real hardware."
      },
      {
        "id": "sec-7",
        "title": "7.7 Running Beginner Experiments on Real Quantum Hardware",
        "content": "Where available (e.g., via IBM Quantum's free-tier cloud access), learners run their simple circuits on genuine quantum hardware and compare the noisy real-world results against their clean simulator predictions — a powerful, concrete way to internalize the theory-vs-reality gap discussed throughout this program.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Embedded code editor + \"Run\" button that executes the learner's Qiskit circuit against a simulator backend and displays a live histogram of measurement outcomes — this should be the primary hands-on lab experience of the entire Beginner track."
      },
      {
        "id": "sec-8",
        "title": "Beginner Capstone Project",
        "content": "Combine A3 (networking), A5 (cryptography), and A6/A7 (quantum) into one project:\n1. Build a small secured network segment (conceptual/simulated).\n2. Implement a basic cryptographic application (e.g., an AES file-encryption script in Python, reinforcing A1 + A5).\n3. Build and run a simple quantum circuit demonstrating superposition and/or entanglement.\n\n**Certificate awarded on completion: CQF — Certificate in Quantum Foundations.**\n\n---"
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 7.1–7.7.\n- Practical assessment: submit a working Qiskit circuit + simulator output as part of the Beginner Capstone.\n- Unlocks: **Track B — Intermediate / Quantum & Security Engineering** (or Bridge Modules, if diagnostic assessment indicates a targeted gap)."
    }
  },
  {
    "id": "module_3_pqc_mitigation",
    "trackId": "track-a",
    "code": "A8",
    "title": "Module 3: PQC Mitigation",
    "level": "Intermediate",
    "estimatedMinutes": 110,
    "xp": 160,
    "prerequisites": [
      "track_a_a7_first_quantum_programming"
    ],
    "unlocks": "track_b_b1_advanced_math_for_quantum",
    "learningObjectives": [
      "Explain what Shor's and Grover's algorithms threaten, and why the mitigations differ for each.",
      "Explain \"Harvest Now, Decrypt Later\" and why it creates urgency today, not just in the future.",
      "Name and describe the three families of NIST-standardized PQC algorithms and what each is used for.",
      "Explain crypto-agility and hybrid cryptography as the practical migration strategy organizations use."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "3.1 Shor's Algorithm — Breaking RSA & ECC",
        "content": "**Shor's algorithm**, published by mathematician Peter Shor in 1994, is a quantum algorithm that can efficiently factor large numbers and solve the discrete logarithm problem — the exact two hard-math problems that RSA and ECC/Diffie-Hellman respectively depend on for their security. On a classical computer, factoring a 2048-bit RSA number would take longer than the age of the universe with known methods. On a sufficiently large, fault-tolerant quantum computer, Shor's algorithm could do it in a matter of hours.\n\nThe critical honesty point, carried forward from Module 2: this requires a **large-scale, error-corrected quantum computer that does not exist yet.** Public estimates for when such a machine might exist vary widely and should always be checked against current sources rather than assumed — but building an organization's entire migration strategy around \"it'll never happen\" or \"it's happening tomorrow\" are both mistakes. The responsible position is: it takes years to migrate a large organization's cryptography, so planning must start well before the threat materializes.\n\n\n**Knowledge Check:** \"Shor's algorithm poses a threat to which cryptographic systems?\" → **RSA and ECC**, via factoring and discrete logarithm respectively.\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Reuse the Module 1 chain-of-trust diagram, animated \"breaking\": Root CA → Intermediate → Server cert, with a red crack propagating down the chain when the user clicks \"Run Shor's Algorithm (Simulated).\" Side panel: real Shor's requires thousands of logical (error-corrected) qubits — today's largest machines have hundreds of physical, noisy qubits."
      },
      {
        "id": "sec-2",
        "title": "3.2 Grover's Algorithm — Weakening Symmetric Crypto",
        "content": "**Grover's algorithm** is a different quantum algorithm that provides a **quadratic speedup** for unstructured search problems — including brute-forcing a symmetric key. This is a fundamentally smaller threat than Shor's exponential speedup against RSA/ECC: instead of completely breaking a symmetric cipher, it effectively halves the key's bit-strength against a quantum attacker. Practically, that means AES-128 behaves like roughly AES-64-strength against a quantum adversary — no longer considered safe — while AES-256 only drops to roughly AES-128-strength, which remains solidly secure.\n\nThis gives us the simplest, most immediately actionable mitigation in the entire course: **double your symmetric key and hash lengths.** Move from AES-128 to AES-256, and from SHA-256 to SHA-384 or SHA-512 for anything requiring long-term integrity guarantees. Unlike the RSA/ECC problem, this doesn't require adopting entirely new algorithm families — just larger, already-standardized parameters.\n\n\n**Knowledge Check:** \"What is the primary impact of Grover's algorithm on symmetric cryptography?\" → **A quadratic speedup**, roughly halving effective key strength — mitigated by doubling key length.\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Speedometer-style gauge: AES-128 needle drops sharply, AES-256 needle barely moves, when toggled to \"post-quantum view\" — visually contrasts the severity of the Grover threat against the Shor threat."
      },
      {
        "id": "sec-3",
        "title": "3.3 \"Harvest Now, Decrypt Later\" (HNDL)",
        "content": "This is the single concept that turns quantum-safe migration from an academic curiosity into an urgent, present-day business decision. **Harvest Now, Decrypt Later** describes a strategy where an adversary intercepts and stores encrypted traffic today, with no ability to read it yet — betting that a capable quantum computer will exist before that data's confidentiality requirement expires, at which point they decrypt everything they've been storing.\n\nThis matters enormously for data with a **long confidentiality lifetime**: medical records that must remain private for decades, government or military secrets, long-term intellectual property, and legal or financial records under extended retention requirements. If your data must stay confidential for 20 years, and quantum computers capable of breaking RSA emerge in 10, an adversary who started recording today gets a 10-year head start on decrypting it.\n\nThe most important sentence in this entire course, worth remembering word for word: **\"The attack window opened the day your data was recorded — not the day the quantum computer arrives.\"** This single idea is what should drive organizational buy-in and urgency, independent of exactly when large-scale quantum computers eventually arrive.\n\n\n**Knowledge Check:** \"What does 'Harvest Now, Decrypt Later' describe?\" → **Adversaries recording encrypted data today to decrypt once quantum computers are capable.**\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Extend the Module 2 timeline widget: add a draggable marker for \"data's required confidentiality lifetime\" (e.g., \"medical record: 25 years\"). If the marker crosses the estimated quantum-risk window, flash a red \"AT RISK\" badge."
      },
      {
        "id": "sec-4",
        "title": "3.4 Post-Quantum Cryptography (PQC) — The Fix",
        "content": "**Post-Quantum Cryptography** refers to classical algorithms — designed to run on today's ordinary computers, no quantum hardware required — whose security rests on math problems believed to remain hard even for quantum computers. Two families matter most for this course:\n\n- **Lattice-based cryptography** bases its security on hard problems involving high-dimensional mathematical lattices, such as the Learning With Errors (LWE) problem. It offers fast performance and moderate key sizes, making it practical for widespread deployment — it's the foundation for both ML-KEM (key exchange) and ML-DSA (signatures).\n- **Hash-based cryptography** bases its security entirely on the collision-resistance of hash functions — a property that's extremely well-studied and conservative, with decades of cryptanalysis behind it. The tradeoff is larger signature sizes and slower performance compared to lattice-based approaches. It's the foundation for SLH-DSA, positioned as a diversified backup in case unexpected weaknesses are ever found in lattice-based math.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Extend the Module 1 RSA-vs-ECC key-size bar chart with ML-KEM-768 and SLH-DSA-128s bars for direct comparison, with a tooltip on each explaining what it's used for."
      },
      {
        "id": "sec-5",
        "title": "3.5 NIST PQC Standards",
        "content": "In 2024, the U.S. National Institute of Standards and Technology (NIST) finalized its first set of Post-Quantum Cryptography standards after a multi-year, worldwide evaluation process:\n\n- **ML-KEM** (Module-Lattice Key Encapsulation Mechanism, formerly known as CRYSTALS-Kyber) — standardized for key exchange under **FIPS 203**.\n- **ML-DSA** (Module-Lattice Digital Signature Algorithm, formerly CRYSTALS-Dilithium) — standardized for digital signatures under **FIPS 204**.\n- **SLH-DSA** (Stateless Hash-Based Digital Signature Algorithm, formerly SPHINCS+) — a conservative, hash-based signature backup standard under **FIPS 205**.\n\nContent team note, carried forward as a publish-time checklist item: always verify current FIPS numbers and standardization status directly against nist.gov before publishing this section — standards references should never be hardcoded from memory without a source check.\n\n\n**Knowledge Check:** \"Which NIST-standardized algorithm handles key exchange in the PQC suite?\" → **ML-KEM** (FIPS 203).\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** \"Standards matcher\" drag-and-drop game: user drags each acronym (ML-KEM, ML-DSA, SLH-DSA) onto the correct use-case card (Key Exchange / Signatures / Signatures-Conservative-Backup), with instant color feedback."
      },
      {
        "id": "sec-6",
        "title": "3.6 Migration: Crypto-Agility & Hybrid Cryptography",
        "content": "**Crypto-agility** is a design philosophy: build systems so that cryptographic algorithms can be swapped out without a full architectural rebuild. In practice, this means never hardcoding a specific algorithm deep into application logic — instead, abstracting cryptographic operations behind a configurable layer, so that when a new standard (or vulnerability) emerges, the fix is a configuration change, not a rewrite.\n\n**Hybrid cryptography** is the practical bridge strategy used during the PQC transition period: running a classical algorithm (RSA or ECC) alongside a PQC algorithm (ML-KEM) simultaneously, combining both into the final session key. This provides defense in depth — the connection remains secure as long as *at least one* of the two algorithms hasn't been broken, hedging against both a future quantum computer breaking the classical side, and the small but real possibility of an implementation flaw being discovered in the newer, less battle-tested PQC algorithms.\n\nThis directly connects to the organizational side of Q-CAPS — Crypto Inventory and PQC Migration Requirements — since an organization can't apply crypto-agility or hybrid cryptography to systems it doesn't know are using vulnerable algorithms in the first place. This is exactly the handoff point into the platform's Scan Engine.\n\n\n**Knowledge Check:** \"Why do organizations often use hybrid cryptography during migration?\" → **It ensures security holds even if one of the two algorithm families is later broken or found flawed.**\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** \"Hybrid handshake\" animated diagram: a simplified TLS handshake showing two parallel key-exchange lines (classical ECDHE + ML-KEM) merging into one combined session key. Clicking either line shows a one-line explainer."
      },
      {
        "id": "sec-7",
        "title": "Module 3 Wrap-Up",
        "content": "**Summary:** You've covered what Shor's and Grover's algorithms actually threaten and how the mitigations differ, why \"Harvest Now, Decrypt Later\" creates urgency today rather than someday, the two families of PQC and the three NIST-standardized algorithms built on them, and how crypto-agility and hybrid cryptography form the practical migration strategy organizations use in the real world.\n\n- CTA: \"Take the Module 3 Quiz\" → `module_3_pqc_mitigation_questions.json`.\n- Submission uses `\"module_id\": \"module_3_pqc_mitigation\"` in the shared Quiz Submission format.\n- Final CTA: **\"You've completed PQC Foundations. Try your first Authorized Crypto Scan →\"** — hands off directly to Inba's Scanner Engine."
      }
    ],
    "wrapUp": {
      "summary": ""
    }
  },
  {
    "id": "track_b_b1_advanced_math_for_quantum",
    "trackId": "track-b",
    "code": "B1",
    "title": "Advanced Mathematics for Quantum",
    "level": "Intermediate",
    "estimatedMinutes": 160,
    "xp": 160,
    "prerequisites": [
      "track_a_a8_pqc_mitigation"
    ],
    "unlocks": "track_b_b2_quantum_information",
    "learningObjectives": [
      "Work formally with complex vector spaces, inner products, and matrix operations.",
      "Understand eigenvectors, unitary operators, and Dirac notation.",
      "Apply probability amplitudes and tensor products rigorously, and understand basic optimization concepts."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "1.1 Linear Algebra (Formal Treatment)",
        "content": "Building on A2's introduction, this section treats vector spaces, linear independence, and basis vectors formally — the mathematical language every quantum algorithm in this track will be expressed in."
      },
      {
        "id": "sec-2",
        "title": "1.2 Complex Vector Spaces",
        "content": "Quantum states live in complex vector spaces, not real ones. A qubit's state vector has complex-number components, which is why A2.4's introduction to complex numbers was necessary groundwork."
      },
      {
        "id": "sec-3",
        "title": "1.3 Inner Products",
        "content": "The **inner product** of two vectors measures their overlap/similarity, and in quantum mechanics it's used to compute probabilities: the probability of measuring a particular outcome is the squared magnitude of the inner product between the current state and that outcome's basis state."
      },
      {
        "id": "sec-4",
        "title": "1.4 Matrix Operations",
        "content": "Formal treatment of matrix multiplication, transposition, and the **conjugate transpose** (also called the Hermitian adjoint) — essential for working with quantum gates, which are represented as matrices."
      },
      {
        "id": "sec-5",
        "title": "1.5 Eigenvectors and Unitary Operators",
        "content": "Reinforces A2.7. A **unitary operator** is a special kind of matrix that preserves the total probability (always sums to 1) when applied to a quantum state — every valid quantum gate must be unitary. Eigenvectors of these operators play a central role in algorithms like phase estimation, covered in B3."
      },
      {
        "id": "sec-6",
        "title": "1.6 Probability Amplitudes (Formal Treatment)",
        "content": "Building on A6.5, this section works through multi-qubit amplitude calculations rigorously, including how amplitudes combine under tensor products."
      },
      {
        "id": "sec-7",
        "title": "1.7 Tensor Products (Formal Treatment)",
        "content": "Reinforces A6.11 with worked examples: combining two 2-dimensional single-qubit spaces via tensor product produces a 4-dimensional two-qubit space, generalizing to 2ⁿ dimensions for n qubits."
      },
      {
        "id": "sec-8",
        "title": "1.8 Dirac Notation",
        "content": "**Dirac (bra-ket) notation** — |ψ⟩ for a \"ket\" (state vector) and ⟨ψ| for its corresponding \"bra\" (conjugate transpose) — is the standard shorthand used throughout quantum computing literature. Fluency here is necessary to read any quantum algorithm paper or documentation, including the NIST PQC standardization documents referenced in B10."
      },
      {
        "id": "sec-9",
        "title": "1.9 Basic Optimization",
        "content": "A light introduction to optimization concepts (minimizing/maximizing a function, gradient-based intuition) — groundwork for variational quantum algorithms (VQE, QAOA) covered in Track C.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Step-by-step worked-example widget: user picks a 2-qubit state and a gate, and the tool shows the tensor product and matrix multiplication step by step, building the muscle memory needed before tackling full algorithms in B3."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 1.1–1.9.\n- Practical assessment: work through 2-3 full amplitude calculations by hand, verified against a computational tool.\n- Unlocks: `B2 — Quantum Information`."
    }
  },
  {
    "id": "track_b_b2_quantum_information",
    "trackId": "track-b",
    "code": "B2",
    "title": "Quantum Information",
    "level": "Intermediate",
    "estimatedMinutes": 150,
    "xp": 160,
    "prerequisites": [
      "track_b_b1_advanced_math_for_quantum"
    ],
    "unlocks": "track_b_b3_quantum_algorithms",
    "learningObjectives": [
      "Understand multi-qubit systems, density matrices, and quantum channels.",
      "Understand measurement theory formally, plus quantum noise and decoherence mechanisms.",
      "Understand the no-cloning theorem and its security implications."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "2.1 Qubits and Multi-Qubit Systems",
        "content": "Building on B1's tensor product treatment, this section explores how real quantum algorithms operate on registers of many qubits simultaneously, and how to reason about subsystems within a larger entangled system."
      },
      {
        "id": "sec-2",
        "title": "2.2 Entanglement (Formal Treatment)",
        "content": "Revisiting A6.9/core Module 2.3 with formal mathematical treatment: entangled states cannot be written as a simple tensor product of individual qubit states — this \"non-separability\" is the precise mathematical definition of entanglement."
      },
      {
        "id": "sec-3",
        "title": "2.3 Density Matrices",
        "content": "A **density matrix** is a more general way to describe a quantum state, capable of representing not just pure states (fully known) but also **mixed states** (statistical uncertainty about the state itself, distinct from the quantum uncertainty of superposition). This becomes essential when describing real, noisy hardware."
      },
      {
        "id": "sec-4",
        "title": "2.4 Quantum Channels",
        "content": "A **quantum channel** describes how a quantum state evolves when passing through some process — including noisy, imperfect real-world hardware. This formalism underlies how error models are built for the noise simulation introduced in A7.6."
      },
      {
        "id": "sec-5",
        "title": "2.5 Measurement Theory",
        "content": "A rigorous treatment of measurement beyond A6.4's introduction: projective measurements, measurement operators, and how measuring one qubit in an entangled system affects the others — directly explaining the \"instant correlation\" behavior introduced conceptually back in core Module 2.3."
      },
      {
        "id": "sec-6",
        "title": "2.6 Quantum Noise",
        "content": "Formal categories of noise affecting real quantum hardware: bit-flip errors, phase-flip errors, and amplitude damping (energy loss). Understanding these categories is prerequisite knowledge for Track C's Quantum Error Correction module."
      },
      {
        "id": "sec-7",
        "title": "2.7 Decoherence",
        "content": "The formal explanation for what was introduced conceptually in core Module 2.5: decoherence is the process by which a qubit's quantum information leaks into its environment through unwanted interactions, degrading superposition and entanglement over time — the central engineering challenge of building practical quantum computers."
      },
      {
        "id": "sec-8",
        "title": "2.8 No-Cloning Theorem",
        "content": "The **no-cloning theorem** proves that it's impossible to create an identical copy of an arbitrary unknown quantum state. This has direct security relevance: it's part of why quantum key distribution (QKD, first introduced in core Module 2.3) can detect eavesdropping — an eavesdropper cannot simply copy the quantum states being transmitted without disturbing them."
      },
      {
        "id": "sec-9",
        "title": "2.9 Quantum Information Concepts (Synthesis)",
        "content": "This closing section ties 2.1–2.8 together into a coherent picture of what \"quantum information\" means as a field distinct from both classical information theory and quantum algorithms — the lens through which Track C's advanced quantum information content will build further.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Density matrix visualizer: user toggles between a \"pure state\" and a \"mixed state\" example, seeing how the density matrix representation differs, with a plain-language explanation of what \"statistical uncertainty\" vs. \"quantum uncertainty\" means in practice."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 2.1–2.9.\n- Practical assessment: given a simple 2-qubit entangled state, compute the reduced density matrix of one qubit.\n- Unlocks: `B3 — Quantum Algorithms`."
    }
  },
  {
    "id": "track_b_b3_quantum_algorithms",
    "trackId": "track-b",
    "code": "B3",
    "title": "Quantum Algorithms",
    "level": "Intermediate",
    "estimatedMinutes": 180,
    "xp": 160,
    "prerequisites": [
      "track_b_b2_quantum_information"
    ],
    "unlocks": "track_b_b4_quantum_programming",
    "learningObjectives": [
      "Understand the historical progression of quantum algorithms from Deutsch-Jozsa through Shor.",
      "Understand Grover's algorithm and amplitude amplification in depth.",
      "Understand the Quantum Fourier Transform and phase estimation, and how they enable Shor's algorithm.",
      "Gain introductory exposure to quantum walks and variational algorithms."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "3.1 Deutsch-Jozsa Algorithm",
        "content": "The **Deutsch-Jozsa algorithm** was one of the first algorithms to demonstrate a provable quantum speedup — determining whether a function is \"constant\" or \"balanced\" in a single query, versus potentially exponentially many queries classically. While not practically useful on its own, it's the historical proof-of-concept that quantum computers can outperform classical ones for certain structured problems, setting the stage for everything that follows."
      },
      {
        "id": "sec-2",
        "title": "3.2 Bernstein-Vazirani Algorithm",
        "content": "A related early algorithm that finds a hidden bit-string in a single query, versus n queries classically — another foundational demonstration of quantum parallelism applied to a structured problem."
      },
      {
        "id": "sec-3",
        "title": "3.3 Simon's Algorithm",
        "content": "**Simon's algorithm** solves a hidden-period-finding problem exponentially faster than any classical algorithm, and — importantly for this course — its core technique directly inspired the period-finding approach at the heart of **Shor's algorithm**."
      },
      {
        "id": "sec-4",
        "title": "3.4 Grover's Algorithm (Full Treatment)",
        "content": "Building on the introduction in core Module 3.2, this section covers Grover's algorithm's actual mechanism: **amplitude amplification** — repeatedly applying an \"oracle\" (marking the correct answer) and a \"diffusion\" operator (amplifying the marked state's amplitude while suppressing others) across roughly √N iterations to search an unsorted database of N items, versus N/2 average classical queries."
      },
      {
        "id": "sec-5",
        "title": "3.5 Quantum Fourier Transform (QFT)",
        "content": "The **Quantum Fourier Transform** is the quantum analog of the classical discrete Fourier transform, but computable exponentially faster on a quantum computer. It's not useful as a standalone algorithm, but it's the critical subroutine inside both phase estimation and Shor's algorithm."
      },
      {
        "id": "sec-6",
        "title": "3.6 Phase Estimation",
        "content": "**Quantum phase estimation** uses the QFT to determine the eigenvalue phase of a unitary operator applied to one of its eigenvectors — this exact technique is the mathematical engine that makes Shor's algorithm work, extracting the periodicity information needed to factor large numbers."
      },
      {
        "id": "sec-7",
        "title": "3.7 Shor's Algorithm (Full Treatment)",
        "content": "Building on core Module 3.1's threat-level introduction, this section covers the actual algorithm: reducing integer factorization to a period-finding problem, then using QFT-based phase estimation to find that period exponentially faster than any known classical method — the complete technical picture behind why RSA and ECC are vulnerable to a sufficiently powerful quantum computer."
      },
      {
        "id": "sec-8",
        "title": "3.8 Amplitude Amplification (General Framework)",
        "content": "Grover's algorithm (3.4) is actually a special case of a more general technique called **amplitude amplification**, which can be applied to boost the success probability of a wide range of quantum algorithms beyond simple search."
      },
      {
        "id": "sec-9",
        "title": "3.9 Quantum Walks",
        "content": "The quantum analog of classical random walks, offering speedups for certain graph-search and optimization problems — an active research area with applications beyond pure cryptography."
      },
      {
        "id": "sec-10",
        "title": "3.10 Variational Algorithms (Introduction)",
        "content": "A brief introduction to the family of algorithms (fully covered in Track C) that combine a quantum circuit with classical optimization — designed to run usefully even on today's noisy, error-prone NISQ-era hardware, unlike Shor's algorithm which requires full error correction."
      },
      {
        "id": "sec-11",
        "title": "3.11 Complexity Analysis",
        "content": "Closing the module with the formal language for comparing algorithms: Big-O notation, and precisely how \"exponential speedup\" (Shor's) differs from \"quadratic speedup\" (Grover's) in complexity-theory terms — tying directly back to the distinction first introduced conceptually in core Modules 3.1 and 3.2.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Side-by-side algorithm complexity chart: classical vs. quantum runtime curves plotted as problem size grows, for Grover's (quadratic) and Shor's (exponential) — visually cements why Shor's is the far more serious cryptographic threat."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 3.1–3.11.\n- Practical assessment: implement Deutsch-Jozsa and Grover's algorithm in Qiskit for a small input size, and observe measured runtime/success-rate against theoretical predictions.\n- Unlocks: `B4 — Quantum Programming`."
    }
  },
  {
    "id": "track_b_b4_quantum_programming",
    "trackId": "track-b",
    "code": "B4",
    "title": "Quantum Programming",
    "level": "Intermediate",
    "estimatedMinutes": 170,
    "xp": 160,
    "prerequisites": [
      "track_b_b3_quantum_algorithms"
    ],
    "unlocks": "track_b_b5_quantum_hardware",
    "learningObjectives": [
      "Implement the algorithms from B3 in Qiskit, beyond the beginner circuits built in A7.",
      "Understand circuit optimization, transpilation, and backend selection.",
      "Apply noise models and error mitigation techniques, and benchmark circuit performance."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "4.1 Qiskit (Intermediate Usage)",
        "content": "Building on A7.1, this section covers Qiskit's more advanced APIs: parameterized circuits, custom gates, and working with multi-register circuits needed to implement the algorithms from B3."
      },
      {
        "id": "sec-2",
        "title": "4.2 Circuit Optimization",
        "content": "Real quantum circuits often contain redundant or simplifiable gate sequences. **Circuit optimization** reduces gate count and circuit depth — critical on noisy hardware, where every additional gate is another opportunity for error to accumulate."
      },
      {
        "id": "sec-3",
        "title": "4.3 Transpilation",
        "content": "**Transpilation** is the process of converting an abstract circuit into one that's compatible with a specific quantum backend's native gate set and physical qubit connectivity — an essential, often invisible step between \"the algorithm you designed\" and \"what actually runs on hardware.\""
      },
      {
        "id": "sec-4",
        "title": "4.4 Backend Selection",
        "content": "Different quantum backends (simulators, various real hardware types) have different qubit counts, connectivity, noise characteristics, and queue times. Learning to select an appropriate backend for a given circuit and goal is a practical engineering skill distinct from algorithm design itself."
      },
      {
        "id": "sec-5",
        "title": "4.5 Noise Models",
        "content": "Building on A7.6's introduction, this section covers building and applying realistic, backend-specific noise models to simulators — allowing developers to predict how a circuit will perform on real hardware before submitting an actual job (which often involves queue time and, on commercial platforms, cost)."
      },
      {
        "id": "sec-6",
        "title": "4.6 Error Mitigation",
        "content": "Distinct from full error *correction* (Track C), **error mitigation** techniques (e.g., zero-noise extrapolation, readout error correction) reduce the impact of noise on results without requiring the enormous qubit overhead of full fault tolerance — the practical, deployable approach for today's NISQ-era hardware."
      },
      {
        "id": "sec-7",
        "title": "4.7 Runtime Concepts",
        "content": "Modern quantum cloud platforms use \"runtime\" execution models that keep classical and quantum processing tightly coupled for algorithms requiring many rounds of interaction (like variational algorithms) — understanding this execution model matters for the hybrid quantum-classical workflows in 4.8."
      },
      {
        "id": "sec-8",
        "title": "4.8 Quantum-Classical Workflows",
        "content": "Most practically useful near-term quantum algorithms aren't purely quantum — they alternate between a quantum circuit (computing something hard classically) and classical post-processing (interpreting results, adjusting parameters, deciding the next circuit to run). Understanding this loop is essential preparation for the variational algorithms (VQE, QAOA) covered fully in Track C."
      },
      {
        "id": "sec-9",
        "title": "4.9 Benchmarking",
        "content": "Systematic methods for evaluating circuit performance: success probability, fidelity compared to ideal simulation, and runtime — the same kind of benchmarking mindset used later in B11's PQC performance comparisons."
      },
      {
        "id": "sec-10",
        "title": "4.10 Hardware Execution",
        "content": "Practical walkthrough of submitting a real job to quantum hardware, understanding queue behavior, and interpreting results that include real device noise — extending the beginner hardware experience from A7.7 to the more complex circuits built in this module.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Before/after circuit diagram showing a circuit pre- and post-transpilation for a specific backend, highlighting added/removed gates — makes the normally invisible transpilation step tangible."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 4.1–4.10.\n- Practical assessment: take a Grover's algorithm implementation from B3, optimize and transpile it for a specific backend, and benchmark its fidelity against the ideal simulator result.\n- Unlocks: `B5 — Quantum Hardware`."
    }
  },
  {
    "id": "track_b_b5_quantum_hardware",
    "trackId": "track-b",
    "code": "B5",
    "title": "Quantum Hardware",
    "level": "Intermediate",
    "estimatedMinutes": 140,
    "xp": 160,
    "prerequisites": [
      "track_b_b4_quantum_programming"
    ],
    "unlocks": "track_b_b6_network_security_engineering",
    "learningObjectives": [
      "Understand the major physical approaches to building qubits and their tradeoffs.",
      "Understand control electronics, noise/coherence, gate fidelity, and readout at a conceptual level.",
      "Understand connectivity and scaling challenges facing real quantum hardware."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "5.1 Superconducting Qubits",
        "content": "The most widely deployed approach in today's commercial quantum computers (used by IBM, Google, and others). Superconducting qubits are tiny electrical circuits cooled to near-absolute-zero temperatures, where they exhibit quantum behavior. They offer fast gate operations but relatively short coherence times, requiring extensive error mitigation (B4.6) and, eventually, error correction (Track C)."
      },
      {
        "id": "sec-2",
        "title": "5.2 Trapped Ions",
        "content": "Individual charged atoms (\"ions\") held in place by electromagnetic fields and manipulated with precisely tuned lasers. Trapped-ion qubits typically offer longer coherence times and higher gate fidelity than superconducting qubits, at the cost of slower gate operation speeds — a genuine engineering tradeoff, not a simple \"better/worse\" comparison."
      },
      {
        "id": "sec-3",
        "title": "5.3 Neutral Atoms",
        "content": "A newer approach using individual neutral atoms held in place by laser \"tweezers,\" offering promising scalability to large qubit counts and flexible qubit arrangement — an active area of rapid recent progress worth verifying against current sources given how quickly this subfield moves."
      },
      {
        "id": "sec-4",
        "title": "5.4 Photonic Approaches",
        "content": "Using individual photons (particles of light) as qubits. Photonic approaches have a natural advantage for quantum networking and communication (relevant to Track C's Quantum Networking module) since photons can travel through fiber optic cable, but face different engineering challenges for building large-scale general-purpose quantum computers."
      },
      {
        "id": "sec-5",
        "title": "5.5 Spin Qubits",
        "content": "Using the quantum spin state of individual electrons or atomic nuclei, often built using semiconductor manufacturing techniques similar to classical computer chips — an approach attractive for its potential compatibility with existing chip fabrication infrastructure."
      },
      {
        "id": "sec-6",
        "title": "5.6 Control Electronics",
        "content": "Every physical qubit approach requires precise classical control systems — generating exact microwave pulses, laser timings, or voltage signals to implement gates. This \"classical-quantum interface\" is a significant engineering challenge in its own right, often underappreciated relative to the qubits themselves."
      },
      {
        "id": "sec-7",
        "title": "5.7 Noise and Coherence",
        "content": "Reinforces B2.6–2.7 with hardware-specific detail: each physical qubit type has characteristic noise sources and typical **coherence times** (how long a qubit can maintain useful quantum information) — a key specification when comparing hardware platforms."
      },
      {
        "id": "sec-8",
        "title": "5.8 Gate Fidelity",
        "content": "**Gate fidelity** measures how closely a real, physical gate operation matches its ideal mathematical description — directly determining how many gates can be chained together before accumulated error makes results unreliable, which in turn determines what size/depth of circuit is practically useful on a given machine."
      },
      {
        "id": "sec-9",
        "title": "5.9 Readout",
        "content": "The process of measuring a qubit's final state and converting it to a classical result. Readout itself has an error rate, distinct from gate errors — an important nuance when interpreting circuit results, tying back to B4.6's error mitigation techniques (some of which specifically target readout error)."
      },
      {
        "id": "sec-10",
        "title": "5.10 Connectivity and Scaling",
        "content": "Physical qubits aren't always directly connected to every other qubit — **connectivity** describes which qubit pairs can directly interact, affecting how transpilation (B4.3) must route operations between distant qubits. **Scaling** — building machines with more qubits while maintaining coherence and fidelity — is widely regarded as the central engineering challenge on the path toward the large, fault-tolerant machines discussed as a future threat throughout this program.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Comparison table/card layout: the 5 hardware approaches (5.1–5.5) side by side across coherence time, gate speed, scalability, and current maturity — with a clear caveat that all figures should be checked against current sources at publish time, since this field moves quickly."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 5.1–5.10.\n- Practical assessment: given a hypothetical use case (e.g., \"building a quantum network node\" vs. \"running Shor's algorithm at scale\"), justify which hardware approach is best suited and why.\n- Unlocks: `B6 — Network & Security Engineering`."
    }
  },
  {
    "id": "track_b_b6_network_security_engineering",
    "trackId": "track-b",
    "code": "B6",
    "title": "Network & Security Engineering",
    "level": "Intermediate",
    "estimatedMinutes": 150,
    "xp": 160,
    "prerequisites": [
      "track_b_b5_quantum_hardware"
    ],
    "unlocks": "track_b_b7_advanced_cryptography",
    "learningObjectives": [
      "Apply advanced TCP/IP, routing, and VLAN concepts in security-focused contexts.",
      "Understand Zero Trust architecture and IAM at a practitioner level.",
      "Understand network segmentation, cloud networking, and secure protocol design."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "6.1 Advanced TCP/IP",
        "content": "Building on A3.2–3.5, this section covers TCP/IP behavior under real operational conditions: connection state tracking, common misconfigurations, and how attackers exploit protocol-level assumptions."
      },
      {
        "id": "sec-2",
        "title": "6.2 Routing and Switching (Advanced)",
        "content": "Extending A3.8: dynamic routing protocols, redundancy, and how routing infrastructure itself becomes an attack target (e.g., BGP hijacking) — the network layer equivalent of the certificate-chain trust concerns raised throughout the cryptography content."
      },
      {
        "id": "sec-3",
        "title": "6.3 VLANs",
        "content": "**VLANs (Virtual LANs)** logically segment a single physical network into isolated broadcast domains — a foundational tool for the network segmentation strategy covered fully in 6.9."
      },
      {
        "id": "sec-4",
        "title": "6.4 VPNs (Advanced)",
        "content": "Building on A3.9's introduction, this section covers VPN architecture choices (site-to-site vs. remote-access), tunneling protocols, and — directly relevant to this entire program — how VPN cryptography (often IPsec or a TLS-based tunnel) is itself subject to the same PQC migration concerns as any other TLS deployment."
      },
      {
        "id": "sec-5",
        "title": "6.5 TLS (Engineering Depth)",
        "content": "Building on A5.10's handshake walkthrough, this section covers TLS from an engineering/operations perspective: cipher suite configuration, certificate management at scale, and common misconfigurations that weaken an otherwise-correct TLS deployment — directly relevant to what Inba's scanner engine is built to detect."
      },
      {
        "id": "sec-6",
        "title": "6.6 PKI (Engineering Depth)",
        "content": "Building on A5.9, this section covers operating a PKI at organizational scale: certificate lifecycle automation, internal vs. public CAs, and the practical challenges of certificate rotation — essential context for understanding why PQC certificate migration (covered in B11) is a genuinely difficult operational problem, not just a cryptographic one."
      },
      {
        "id": "sec-7",
        "title": "6.7 Zero Trust",
        "content": "**Zero Trust** is a security architecture philosophy: never automatically trust any device or user, whether inside or outside the network perimeter — every request is authenticated and authorized independently. This represents a significant shift from older \"trusted internal network\" models and is increasingly the default assumption in modern enterprise security architecture."
      },
      {
        "id": "sec-8",
        "title": "6.8 IAM (Identity and Access Management)",
        "content": "Building on A4.3's introduction to RBAC, this section covers IAM at an enterprise level: centralized identity providers, single sign-on (SSO), multi-factor authentication (MFA), and the operational challenge of managing access across many systems consistently."
      },
      {
        "id": "sec-9",
        "title": "6.9 Network Segmentation",
        "content": "The practice of dividing a network into isolated zones so that a compromise in one segment doesn't automatically grant access to others — implemented using the VLAN (6.3) and firewall (A3.9) concepts already covered, now applied as a deliberate defensive architecture strategy."
      },
      {
        "id": "sec-10",
        "title": "6.10 Cloud Networking",
        "content": "Modern infrastructure increasingly runs in cloud environments (AWS, Azure, GCP) with their own networking models — virtual private clouds, security groups, and cloud-native load balancing — requiring the same fundamental TCP/IP and TLS understanding applied to a different operational context."
      },
      {
        "id": "sec-11",
        "title": "6.11 Secure Protocols",
        "content": "A closing synthesis: reviewing which protocols (HTTPS, SSH, VPN protocols) provide which security properties, and why protocol choice itself is a security decision — directly setting up the \"what's actually vulnerable and where\" mindset needed for B8's Quantum Threats module.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Interactive network topology builder: user drags network zones (DMZ, internal, cloud) and connects them with firewalls/VLANs, receiving feedback on whether the resulting segmentation follows Zero Trust principles."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 6.1–6.11.\n- Practical assessment: design a segmented network architecture for a small hypothetical organization, justifying each segmentation and access-control decision.\n- Unlocks: `B7 — Advanced Cryptography`."
    }
  },
  {
    "id": "track_b_b7_advanced_cryptography",
    "trackId": "track-b",
    "code": "B7",
    "title": "Advanced Cryptography",
    "level": "Intermediate",
    "estimatedMinutes": 160,
    "xp": 160,
    "prerequisites": [
      "track_b_b6_network_security_engineering"
    ],
    "unlocks": "track_b_b8_quantum_threats",
    "learningObjectives": [
      "Understand RSA/ECC security in depth, including ECDSA/ECDH specifics.",
      "Understand KEM concepts and digital signature systems formally.",
      "Understand PKI architecture, certificate lifecycle, SSH, VPN cryptography, HSMs, and key lifecycle at an engineering level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "7.1 RSA/ECC Security (Engineering Depth)",
        "content": "Building on A5.6–5.7, this section covers real-world RSA/ECC security considerations: recommended key sizes for different threat models and time horizons, padding scheme choices (e.g., why raw \"textbook RSA\" is insecure and OAEP padding is required in practice), and common implementation pitfalls."
      },
      {
        "id": "sec-2",
        "title": "7.2 ECDSA/ECDH",
        "content": "**ECDSA (Elliptic Curve Digital Signature Algorithm)** and **ECDH (Elliptic Curve Diffie-Hellman)** are the two specific, standardized ECC constructions used respectively for signatures and key exchange in real-world protocols like TLS — connecting the general ECC concept from A5.7 to its actual named implementations."
      },
      {
        "id": "sec-3",
        "title": "7.3 KEM Concepts",
        "content": "A **KEM (Key Encapsulation Mechanism)** is a cryptographic primitive that lets one party generate a random shared secret and securely transmit it to another party using their public key — a slightly different structure than \"encrypt an arbitrary message,\" and the exact primitive type that ML-KEM (covered in B10) implements. Understanding KEM as a formal concept here prepares learners for why NIST's PQC key-exchange standard is a KEM rather than a direct encryption scheme."
      },
      {
        "id": "sec-4",
        "title": "7.4 Digital Signature Systems (Formal Treatment)",
        "content": "Building on A5.5, this section covers the formal security properties expected of a signature system: existential unforgeability (an attacker can't forge a valid signature on any new message, even after seeing many valid signatures) — the benchmark every signature scheme, classical or post-quantum, is measured against."
      },
      {
        "id": "sec-5",
        "title": "7.5 PKI Architecture",
        "content": "Building on B6.6's operational overview, this section covers PKI design choices: single-tier vs. multi-tier CA hierarchies, cross-certification between organizations, and trust store management — the architectural decisions that determine how resilient an organization's chain of trust actually is."
      },
      {
        "id": "sec-6",
        "title": "7.6 Certificate Lifecycle",
        "content": "The full lifecycle of a certificate: request, issuance, deployment, monitoring, renewal, and revocation. Poor lifecycle management — expired certificates causing outages, or revoked certificates not being properly checked — is one of the most common real-world PKI failure modes, independent of any cryptographic weakness."
      },
      {
        "id": "sec-7",
        "title": "7.7 TLS Internals",
        "content": "Deeper than B6.5's operational view: the exact byte-level structure of TLS records, the specific cryptographic computations at each handshake step, and how TLS 1.3 (the current version) simplified and hardened the handshake compared to earlier versions."
      },
      {
        "id": "sec-8",
        "title": "7.8 SSH",
        "content": "**SSH (Secure Shell)** uses the same core cryptographic building blocks (asymmetric key exchange, symmetric encryption, MACs) as TLS but in a different protocol structure, primarily for secure remote system administration — directly relevant since Inba's scanner engine's Phase 3 scope includes SSH configuration analysis."
      },
      {
        "id": "sec-9",
        "title": "7.9 VPN Cryptography",
        "content": "Building on B6.4, this section covers the specific cryptographic protocols used in common VPN implementations (e.g., IPsec's IKE key exchange, or a TLS-based VPN's handshake) — reinforcing that VPNs are, cryptographically, another application of the same primitives covered throughout this course."
      },
      {
        "id": "sec-10",
        "title": "7.10 HSM Concepts",
        "content": "An **HSM (Hardware Security Module)** is dedicated, tamper-resistant hardware for generating and storing cryptographic keys, performing operations without ever exposing the private key to the host system's software — the gold-standard approach for protecting the most sensitive keys (e.g., a Root CA's private key) against both software compromise and certain physical attacks."
      },
      {
        "id": "sec-11",
        "title": "7.11 Key Lifecycle (Engineering Depth)",
        "content": "Building on A5.11, this section covers formal key lifecycle stages: generation, distribution, storage, rotation, and destruction — and why crypto-agility (introduced in core Module 3.6) fundamentally depends on having disciplined key lifecycle management already in place before a migration can even begin.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Certificate lifecycle timeline widget: interactive stages (Request → Issue → Deploy → Monitor → Renew/Revoke) with a simulated \"expired certificate causes outage\" scenario the learner can trigger and then diagnose."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 7.1–7.11.\n- Practical assessment: audit a simulated certificate inventory for lifecycle issues (expired, soon-to-expire, weak key sizes) and propose remediation priorities.\n- Unlocks: `B8 — Quantum Threats`."
    }
  },
  {
    "id": "track_b_b8_quantum_threats",
    "trackId": "track-b",
    "code": "B8",
    "title": "Quantum Threats",
    "level": "Intermediate",
    "estimatedMinutes": 140,
    "xp": 160,
    "prerequisites": [
      "track_b_b7_advanced_cryptography"
    ],
    "unlocks": "track_b_b9_pqc_fundamentals",
    "learningObjectives": [
      "Explain precisely why RSA and ECC are vulnerable, using the formal Shor's algorithm treatment from B3.",
      "Explain the Grover threat model with quantitative rigor.",
      "Understand hash security considerations under quantum attack, and build a structured quantum threat model."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "8.1 Why RSA Is Vulnerable",
        "content": "Connecting B3.7's formal Shor's algorithm treatment directly to B7.1's RSA security discussion: RSA's security assumption (factoring is hard) is exactly the problem Shor's algorithm solves efficiently. This section walks through that connection explicitly, rather than treating \"Shor breaks RSA\" as a fact to memorize."
      },
      {
        "id": "sec-2",
        "title": "8.2 Why ECC Is Vulnerable",
        "content": "Similarly connecting B3.7 to B7.1–7.2: Shor's algorithm's period-finding technique generalizes to solve the elliptic curve discrete logarithm problem, meaning ECDSA and ECDH are equally vulnerable to a sufficiently powerful quantum computer — often a point of confusion since ECC's smaller keys can create a false impression of being \"more quantum-resistant,\" which is not the case."
      },
      {
        "id": "sec-3",
        "title": "8.3 Shor Threat Model",
        "content": "A formal threat model: what resources (logical qubit count, circuit depth, error rates) would an adversary actually need to break a given RSA or ECC key size, and how do current public estimates compare to today's and near-future hardware capability (referencing B5's hardware discussion). This section should always be built from current, cited research rather than fixed numbers, since estimates are actively refined as both quantum hardware and algorithmic techniques improve."
      },
      {
        "id": "sec-4",
        "title": "8.4 Grover and Symmetric Cryptography",
        "content": "Building on B3.4's full treatment of Grover's algorithm, this section quantifies the exact impact on symmetric ciphers: AES-128 effectively becomes AES-64-equivalent strength, formalizing the intuition introduced in core Module 3.2."
      },
      {
        "id": "sec-5",
        "title": "8.5 Hash Security Considerations",
        "content": "Grover's algorithm also affects hash function security for certain use cases (like brute-forcing a preimage), providing similar quadratic speedup — reinforcing why the same \"double the output length\" mitigation strategy (SHA-256 → SHA-384/512) applies here as it does for symmetric keys."
      },
      {
        "id": "sec-6",
        "title": "8.6 Harvest-Now-Decrypt-Later",
        "content": "Building on core Module 3.3's introduction, this section formalizes HNDL as a quantitative risk model: (data confidentiality lifetime) vs. (estimated time until cryptographically relevant quantum computing) — the exact comparison visualized in the core module's timeline widget, now grounded in the more rigorous threat modeling developed throughout this module."
      },
      {
        "id": "sec-7",
        "title": "8.7 Long-Lived Sensitive Data",
        "content": "A practical taxonomy of data categories most exposed to HNDL risk: healthcare records, government/military communications, long-term intellectual property, and financial records under extended retention — directly informing prioritization in real migration planning (Track D)."
      },
      {
        "id": "sec-8",
        "title": "8.8 Quantum Threat Modeling",
        "content": "Synthesizing the entire module into a repeatable process: identify cryptographic dependencies (informed by B7's PKI/certificate depth) → assess exposure using the Shor/Grover threat models (8.3, 8.4) → factor in data lifetime (8.6, 8.7) → prioritize remediation. This exact process is what the Q-CAPS platform's own Risk-to-Skill mapping and Organization module operationalize at scale.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Quantitative risk calculator widget: learner inputs an asset's key type/size, data lifetime, and current estimated quantum timeline range, and receives a calculated risk score with a plain-language explanation — a hands-on rehearsal of the formal threat-modeling process in 8.8."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 8.1–8.8.\n- Practical assessment: build a threat model for 3 hypothetical assets with different key types and data lifetimes, ranking them by urgency.\n- Unlocks: `B9 — PQC Fundamentals`."
    }
  },
  {
    "id": "track_b_b9_pqc_fundamentals",
    "trackId": "track-b",
    "code": "B9",
    "title": "PQC Fundamentals",
    "level": "Intermediate",
    "estimatedMinutes": 150,
    "xp": 160,
    "prerequisites": [
      "track_b_b8_quantum_threats"
    ],
    "unlocks": "track_b_b10_pqc_standards",
    "learningObjectives": [
      "Clearly distinguish PQC from quantum cryptography (QKD) with technical precision.",
      "Understand KEMs and digital signatures as the two primary PQC primitive categories.",
      "Understand the four major PQC mathematical approaches and their relative security assumptions and tradeoffs."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "9.1 PQC vs. Quantum Cryptography",
        "content": "Reinforcing core Module 2.3's QKD-vs-PQC distinction with full technical precision: **PQC** algorithms are classical algorithms (run on ordinary computers, use no quantum phenomena) chosen specifically because their underlying math problems are believed to resist quantum attack. **Quantum cryptography** (including QKD) uses actual quantum physical phenomena as part of the security mechanism itself. This distinction is worth over-teaching, since it's the single most common point of confusion in the entire field, and getting it wrong undermines credibility with technical audiences (e.g., during your project's own faculty review)."
      },
      {
        "id": "sec-2",
        "title": "9.2 KEMs (Key Encapsulation Mechanisms)",
        "content": "Building on B7.3's formal introduction, this section covers how PQC KEMs specifically work: a recipient generates a public/private keypair; a sender uses the public key to generate and encapsulate a random shared secret; the recipient uses their private key to decapsulate it. **ML-KEM** (covered fully in B10) is the standardized PQC implementation of this pattern."
      },
      {
        "id": "sec-3",
        "title": "9.3 Digital Signatures (PQC)",
        "content": "Building on B7.4's formal security properties, this section covers how PQC signature schemes achieve those same properties (existential unforgeability) using entirely different mathematical foundations than RSA/ECC — the two standardized approaches being **ML-DSA** and **SLH-DSA** (both covered in B10)."
      },
      {
        "id": "sec-4",
        "title": "9.4 Lattice-Based Cryptography",
        "content": "Reinforcing core Module 3.4's introduction: security rests on the hardness of certain problems in high-dimensional mathematical lattices, most notably **Learning With Errors (LWE)**. Lattice-based schemes are currently the most widely adopted PQC approach due to a strong balance of performance, key/signature size, and security confidence — ML-KEM and ML-DSA are both lattice-based."
      },
      {
        "id": "sec-5",
        "title": "9.5 Hash-Based Cryptography",
        "content": "Reinforcing core Module 3.4: security rests entirely on the collision-resistance of a chosen hash function, a property with an exceptionally long and well-studied track record. The tradeoff is larger signatures and slower performance. **SLH-DSA** is the standardized hash-based signature scheme, explicitly positioned as a conservative backup."
      },
      {
        "id": "sec-6",
        "title": "9.6 Code-Based Cryptography",
        "content": "Security rests on the hardness of decoding a general linear error-correcting code — a mathematical problem studied since the 1970s (the McEliece cryptosystem being the classic example). Code-based schemes tend to have very large public keys but benefit from decades of cryptanalytic scrutiny, making them attractive for certain long-term-security applications despite their size overhead."
      },
      {
        "id": "sec-7",
        "title": "9.7 Multivariate Approaches",
        "content": "Security rests on the difficulty of solving systems of multivariate polynomial equations over finite fields. Historically important in PQC research, though less prominent in the final NIST standardization results compared to lattice- and hash-based approaches — worth knowing as part of the broader PQC landscape even though it's not one of the three FIPS-standardized families covered in B10."
      },
      {
        "id": "sec-8",
        "title": "9.8 Security Assumptions and Tradeoffs",
        "content": "A closing synthesis comparing all four families (9.4–9.7) across key/signature size, computational performance, and maturity/confidence of the underlying security assumption — direct preparation for the algorithm-selection decisions covered formally in B10 and applied practically in B11's labs.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Multi-axis comparison radar chart: the four PQC families (Lattice, Hash-based, Code-based, Multivariate) plotted across Performance, Key Size, Maturity, and Signature Size — lets learners visually grasp the tradeoff space at a glance before diving into specific algorithms in B10."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 9.1–9.8.\n- Practical assessment: given a hypothetical deployment constraint (e.g., \"extremely bandwidth-limited IoT device\" vs. \"maximum long-term security confidence required\"), select and justify the most appropriate PQC family.\n- Unlocks: `B10 — PQC Standards`."
    }
  },
  {
    "id": "track_b_b10_pqc_standards",
    "trackId": "track-b",
    "code": "B10",
    "title": "PQC Standards",
    "level": "Intermediate",
    "estimatedMinutes": 130,
    "xp": 160,
    "prerequisites": [
      "track_b_b9_pqc_fundamentals"
    ],
    "unlocks": "track_b_b11_intermediate_pqc_labs",
    "learningObjectives": [
      "Know the three finalized NIST PQC standards (FIPS 203/204/205) and what each is used for.",
      "Understand the broader, still-evolving standardization landscape beyond the first three.",
      "Understand practical algorithm selection and interoperability considerations."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "10.1 NIST FIPS 203 — ML-KEM",
        "content": "Reinforcing core Module 3.5: **ML-KEM** (Module-Lattice Key Encapsulation Mechanism, formerly CRYSTALS-Kyber), standardized under FIPS 203, is the primary NIST-standardized algorithm for post-quantum key exchange, built on the lattice-based (specifically Module-LWE) foundation covered in B9.4."
      },
      {
        "id": "sec-2",
        "title": "10.2 NIST FIPS 204 — ML-DSA",
        "content": "**ML-DSA** (Module-Lattice Digital Signature Algorithm, formerly CRYSTALS-Dilithium), standardized under FIPS 204, is the primary NIST-standardized algorithm for post-quantum digital signatures — also lattice-based, offering a strong balance of signature size and performance for most general-purpose use cases."
      },
      {
        "id": "sec-3",
        "title": "10.3 NIST FIPS 205 — SLH-DSA",
        "content": "**SLH-DSA** (Stateless Hash-Based Digital Signature Algorithm, formerly SPHINCS+), standardized under FIPS 205, is the conservative hash-based signature standard, intended as a diversified backup in case unexpected weaknesses are ever discovered in lattice-based assumptions — trading larger signature sizes and slower performance for a fundamentally different, extremely well-studied security foundation."
      },
      {
        "id": "sec-4",
        "title": "10.4 Emerging and Evolving Standardization",
        "content": "NIST's PQC standardization process is ongoing beyond the first three finalized standards — including a fourth-round evaluation of additional KEM candidates for algorithm diversity, and separate signature scheme evaluations. This module must always be treated as a living document: content teams should check nist.gov directly for the current state before every publish cycle, rather than treating any snapshot as permanent."
      },
      {
        "id": "sec-5",
        "title": "10.5 Algorithm Selection",
        "content": "Practical guidance connecting B9.8's tradeoff comparison to concrete standards: ML-KEM is the default choice for key exchange; ML-DSA is the default choice for general-purpose signatures; SLH-DSA is selected specifically where algorithm diversity or maximum conservative security confidence is required, accepting its performance/size cost."
      },
      {
        "id": "sec-6",
        "title": "10.6 Implementation and Interoperability Considerations",
        "content": "Standardizing an algorithm on paper doesn't guarantee smooth real-world deployment — this section covers practical concerns: library support maturity across programming languages, protocol-level negotiation (how TLS advertises and agrees on PQC algorithm support between client and server), and backward compatibility with systems that don't yet support PQC — directly setting up B11's hands-on TLS/PQC experimentation.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** \"Standards matcher\" drag-and-drop game (can reuse/extend the core Module 3.5 version): match each acronym (ML-KEM, ML-DSA, SLH-DSA) to its FIPS number and primary use case, now with an added \"why you'd pick this over the alternative\" reasoning card revealed after each correct match."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 10.1–10.6.\n- Practical assessment: given three deployment scenarios, select and justify which standardized algorithm(s) fit each.\n- Unlocks: `B11 — Intermediate PQC Labs`."
    }
  },
  {
    "id": "track_b_b11_intermediate_pqc_labs",
    "trackId": "track-b",
    "code": "B11",
    "title": "Intermediate PQC Labs",
    "level": "Intermediate",
    "estimatedMinutes": 200,
    "xp": 160,
    "prerequisites": [
      "track_b_b10_pqc_standards"
    ],
    "unlocks": "track_c_c1_advanced_quantum_information",
    "learningObjectives": [
      "Hands-on compare RSA/ECC against their PQC counterparts across real, measured metrics.",
      "Perform hybrid cryptography and TLS/PQC experimentation practically.",
      "Build a basic cryptographic inventory and begin PQC migration planning — direct rehearsal for the Intermediate Capstone."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "11.1 RSA vs. PQC Comparison",
        "content": "Hands-on lab: using a cryptographic library (e.g., Open Quantum Safe's liboqs, or language-specific PQC bindings), generate RSA-3072 and ML-KEM-768 keypairs and directly compare key generation time, key size, and operation speed — turning B9/B10's conceptual comparisons into measured, personally-verified data."
      },
      {
        "id": "sec-2",
        "title": "11.2 ECDH vs. ML-KEM",
        "content": "Hands-on lab: perform a classical ECDH key exchange and an ML-KEM key encapsulation side by side, comparing the number of round trips, data transmitted, and computation time — directly informing real protocol-design tradeoffs."
      },
      {
        "id": "sec-3",
        "title": "11.3 ECDSA vs. ML-DSA",
        "content": "Hands-on lab: sign and verify the same message using ECDSA and ML-DSA, comparing signature size and signing/verification speed — building the same kind of measured intuition as 11.1–11.2, now for signatures."
      },
      {
        "id": "sec-4",
        "title": "11.4 Key/Signature Size Benchmarking",
        "content": "Consolidating 11.1–11.3 into a structured benchmark report: tabulate key sizes, signature sizes, and operation timings across all algorithms tested, producing a small dataset the learner can reference and reason from for the rest of the program — genuine hands-on evidence rather than memorized numbers."
      },
      {
        "id": "sec-5",
        "title": "11.5 TLS/PQC Experimentation",
        "content": "Hands-on lab: configure a test TLS server/client pair (e.g., using OpenSSL with PQC support, or a library like liboqs's OpenSSL provider) to negotiate a PQC or hybrid key exchange, and inspect the resulting handshake — connecting B10.6's interoperability discussion to a real, working deployment."
      },
      {
        "id": "sec-6",
        "title": "11.6 Hybrid Cryptography (Hands-On)",
        "content": "Building on core Module 3.6's conceptual introduction, this lab configures and tests an actual hybrid classical+PQC handshake (e.g., X25519 + ML-KEM combined), verifying that the resulting session remains secure and interoperable — the practical skill underlying real-world migration strategy."
      },
      {
        "id": "sec-7",
        "title": "11.7 PQC Performance Benchmarking",
        "content": "Extending 11.4 to full protocol-level performance: measuring the real-world latency and throughput impact of switching a test service from classical to hybrid or pure-PQC cryptography — the kind of data an organization would need before committing to a production migration."
      },
      {
        "id": "sec-8",
        "title": "11.8 Cryptographic Inventory (Hands-On)",
        "content": "Hands-on exercise: given a small set of simulated/test systems, perform manual and tool-assisted discovery of what cryptographic algorithms and key sizes are in use — a smaller-scale, individual rehearsal of the Cryptographic Discovery process that Track D's Enterprise track covers at organizational scale, and directly related to what Inba's scanner engine automates for Q-CAPS."
      },
      {
        "id": "sec-9",
        "title": "11.9 PQC Migration Planning (Hands-On)",
        "content": "Synthesizing the entire module: using the benchmark data (11.4, 11.7) and cryptographic inventory (11.8) produced in this module, draft a basic migration plan for the lab environment — prioritizing which systems to migrate first, and whether hybrid or pure-PQC is appropriate for each. This exercise is the direct rehearsal for the Intermediate Capstone.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Benchmark results dashboard: auto-populated from the learner's own lab results across 11.1–11.7, rendered as comparison charts — giving each learner a personalized, data-driven summary rather than a generic pre-made chart."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 11.1–11.9.\n- Practical assessment: this module's hands-on labs collectively double as direct preparation for the **Intermediate Capstone** — design and test a quantum-safe migration for a fictional organization (cryptographic inventory → vulnerable-system identification → PQC selection → hybrid deployment → performance validation).\n- Completion unlocks: **Certificate — CQSE (Certificate in Quantum Security Engineering)**, and progression to **Track C — Advanced / Quantum & PQC Specialist** (or relevant Bridge Modules)."
    }
  },
  {
    "id": "track_c_c1_advanced_quantum_information",
    "trackId": "track-c",
    "code": "C1",
    "title": "Advanced Quantum Information",
    "level": "Advanced",
    "estimatedMinutes": 170,
    "xp": 200,
    "prerequisites": [
      "track_b_b11_intermediate_pqc_labs"
    ],
    "unlocks": "track_c_c2_advanced_quantum_algorithms",
    "learningObjectives": [
      "Work formally with Hilbert spaces, density operators, and POVMs.",
      "Understand quantum channels as completely positive maps.",
      "Understand quantum entropy, information measures, and entanglement theory at a research level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "1.1 Hilbert Spaces",
        "content": "A **Hilbert space** is the complete, formal mathematical setting quantum mechanics is defined in — a complex vector space equipped with an inner product (introduced conceptually in B1.3), generalized here to arbitrary (including infinite) dimensions. Every quantum state discussed in this course, from a single qubit to a large multi-qubit register, is formally a vector in some Hilbert space."
      },
      {
        "id": "sec-2",
        "title": "1.2 Density Operators",
        "content": "Building on B2.3's introduction to density matrices, this section treats **density operators** with full mathematical rigor: their defining properties (positive semi-definite, trace equal to 1), and how they unify the description of both pure and mixed quantum states within a single formalism."
      },
      {
        "id": "sec-3",
        "title": "1.3 POVMs",
        "content": "A **POVM (Positive Operator-Valued Measure)** generalizes the projective measurements introduced in B2.5 to the most general possible description of a quantum measurement — essential for accurately modeling real, imperfect measurement devices, and a standard tool in quantum information research literature."
      },
      {
        "id": "sec-4",
        "title": "1.4 Quantum Channels",
        "content": "Building formally on B2.4's introduction, this section covers quantum channels as **completely positive, trace-preserving (CPTP) maps** — the rigorous mathematical definition ensuring a channel always maps valid quantum states to valid quantum states, even under the noise processes covered in B2.6–2.7."
      },
      {
        "id": "sec-5",
        "title": "1.5 Completely Positive Maps",
        "content": "A deeper mathematical treatment of the \"completely positive\" requirement introduced in 1.4 — explaining precisely why this stronger condition (versus ordinary positivity) is necessary to correctly describe how a quantum channel acts on part of a larger entangled system."
      },
      {
        "id": "sec-6",
        "title": "1.6 Quantum Entropy",
        "content": "**Von Neumann entropy** extends the classical concept of Shannon entropy to quantum states, quantifying the uncertainty or \"mixedness\" of a density operator. This becomes the formal tool for measuring information content and, critically, entanglement (1.8) in quantum systems."
      },
      {
        "id": "sec-7",
        "title": "1.7 Information Measures",
        "content": "Beyond entropy alone, this section covers formal quantum information measures — quantum mutual information, relative entropy — that quantify correlations and distinguishability between quantum states, forming the theoretical backbone for evaluating quantum communication protocols in C4–C6."
      },
      {
        "id": "sec-8",
        "title": "1.8 Entanglement Theory",
        "content": "A formal, research-level treatment of entanglement (building on B2.2's rigorous introduction): entanglement measures, entanglement entropy, and the classification of entangled states — theoretical groundwork directly relevant to evaluating the quantum networking and QKD protocols covered later in this track.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Entropy calculator widget: learner inputs a simple 2-qubit density matrix and the tool computes and visualizes its von Neumann entropy, with a side-by-side comparison against a pure-state example showing zero entropy."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 1.1–1.8.\n- Practical assessment: compute the von Neumann entropy of a given mixed-state density matrix and interpret the result.\n- Unlocks: `C2 — Advanced Quantum Algorithms`."
    }
  },
  {
    "id": "track_c_c2_advanced_quantum_algorithms",
    "trackId": "track-c",
    "code": "C2",
    "title": "Advanced Quantum Algorithms",
    "level": "Advanced",
    "estimatedMinutes": 190,
    "xp": 200,
    "prerequisites": [
      "track_c_c1_advanced_quantum_information"
    ],
    "unlocks": "track_c_c3_quantum_error_correction",
    "learningObjectives": [
      "Master Shor's algorithm and Grover's complexity analysis at full mathematical depth.",
      "Understand QFT/phase estimation, amplitude estimation, and Hamiltonian simulation.",
      "Understand VQE, QAOA, quantum walks, quantum machine learning, and quantum optimization at an introductory research level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "2.1 Shor's Algorithm — Full Mathematical Depth",
        "content": "Building on B3.7's complete conceptual/technical walkthrough, this section works through the full mathematical derivation: reducing factoring to order-finding, the modular exponentiation circuit, and the precise role of QFT-based phase estimation (2.3) in extracting the period — the deepest treatment of the algorithm underlying this entire program's central threat model."
      },
      {
        "id": "sec-2",
        "title": "2.2 Grover Complexity",
        "content": "A rigorous complexity-theoretic treatment building on B3.4: proving the √N query complexity bound, and — importantly — the proven optimality result showing Grover's quadratic speedup is the *best possible* for unstructured search on a quantum computer, unlike Shor's exponential speedup which has no proven classical-impossibility counterpart."
      },
      {
        "id": "sec-3",
        "title": "2.3 QFT and Phase Estimation (Full Depth)",
        "content": "Building formally on B3.5–3.6: the complete circuit construction for the Quantum Fourier Transform, its gate complexity, and the full phase estimation algorithm's precision/resource tradeoffs — the mathematical toolkit reused across nearly every advanced quantum algorithm in this module."
      },
      {
        "id": "sec-4",
        "title": "2.4 Amplitude Estimation",
        "content": "Generalizing Grover's amplitude amplification (B3.8) further: **amplitude estimation** combines amplitude amplification with phase estimation (2.3) to estimate an unknown probability with quadratically fewer samples than classical Monte Carlo methods — with practical applications in quantum finance and quantum machine learning."
      },
      {
        "id": "sec-5",
        "title": "2.5 Hamiltonian Simulation",
        "content": "Simulating the time evolution of a quantum physical system (governed by its Hamiltonian) is one of the original motivating applications for quantum computing (first proposed by Feynman) and remains one of the strongest candidates for genuine quantum advantage in chemistry and materials science — included here as important context beyond the cryptography-focused algorithms."
      },
      {
        "id": "sec-6",
        "title": "2.6 VQE (Variational Quantum Eigensolver)",
        "content": "Building on B4.8's introduction to quantum-classical workflows, **VQE** is a hybrid algorithm designed to find the lowest eigenvalue (typically the ground-state energy) of a Hamiltonian, using a quantum circuit for state preparation and classical optimization to iteratively improve parameters — one of the most promising near-term (NISQ-era) algorithms because it doesn't require full error correction."
      },
      {
        "id": "sec-7",
        "title": "2.7 QAOA (Quantum Approximate Optimization Algorithm)",
        "content": "A related variational algorithm applied to combinatorial optimization problems (e.g., Max-Cut), using the same hybrid quantum-classical loop structure as VQE but targeting a different problem class — together, VQE and QAOA represent the current leading near-term approach to extracting practical value from noisy quantum hardware."
      },
      {
        "id": "sec-8",
        "title": "2.8 Quantum Walks (Advanced)",
        "content": "Extending B3.9's introduction with formal treatment of continuous-time and discrete-time quantum walks, and their proven speedups for specific graph-traversal and element-distinctness problems."
      },
      {
        "id": "sec-9",
        "title": "2.9 Quantum Machine Learning",
        "content": "An introductory survey of how quantum computing intersects with machine learning: quantum-enhanced feature spaces, variational quantum classifiers, and honest discussion of the current, actively-debated state of proven quantum advantage in this subfield."
      },
      {
        "id": "sec-10",
        "title": "2.10 Quantum Optimization",
        "content": "Synthesizing 2.6–2.9 into a broader view of quantum approaches to optimization problems, and how they compare against best-in-class classical optimization methods — an important, intellectually honest framing given that classical algorithms remain highly competitive for many real-world optimization tasks."
      },
      {
        "id": "sec-11",
        "title": "2.11 Complexity Analysis (Advanced)",
        "content": "Closing the module with formal complexity class discussion (BQP and its relationship to classical complexity classes like P and NP) — the theoretical framework precisely describing which problems quantum computers are proven, suspected, or unlikely to meaningfully accelerate.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** VQE convergence visualizer: live-updating chart showing the classical optimizer's parameter updates converging toward the ground-state energy across iterations, making the hybrid quantum-classical loop tangible rather than abstract."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 2.1–2.11.\n- Practical assessment: implement a simple VQE or QAOA instance in Qiskit and analyze its convergence behavior.\n- Unlocks: `C3 — Quantum Error Correction`."
    }
  },
  {
    "id": "track_c_c3_quantum_error_correction",
    "trackId": "track-c",
    "code": "C3",
    "title": "Quantum Error Correction",
    "level": "Advanced",
    "estimatedMinutes": 180,
    "xp": 200,
    "prerequisites": [
      "track_c_c2_advanced_quantum_algorithms"
    ],
    "unlocks": "track_c_c4_quantum_networking",
    "learningObjectives": [
      "Understand quantum noise models formally and the specific challenge of correcting quantum (not just classical) errors.",
      "Understand bit-flip/phase-flip codes, Shor's code, Steane's code, and the stabilizer formalism.",
      "Understand surface codes, logical qubits, fault tolerance, and the threshold theorem."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "3.1 Noise Models (Formal Treatment)",
        "content": "Building on B2.6's categorization of quantum noise, this section covers formal noise channel models (depolarizing channel, amplitude damping channel, phase damping channel) expressed using the quantum channel formalism from C1.4 — the precise mathematical language error-correcting codes are designed against."
      },
      {
        "id": "sec-2",
        "title": "3.2 Bit-Flip and Phase-Flip Codes",
        "content": "The simplest quantum error-correcting codes, each protecting against one specific error type by encoding one \"logical\" qubit's information redundantly across multiple physical qubits — the conceptual starting point before combining both protections in more complete codes."
      },
      {
        "id": "sec-3",
        "title": "3.3 Shor's Code (Error Correction)",
        "content": "Not to be confused with Shor's *factoring* algorithm (a different, unrelated result by the same researcher) — **Shor's 9-qubit code** was the first quantum error-correcting code, combining bit-flip and phase-flip protection to correct an arbitrary single-qubit error using 9 physical qubits per logical qubit."
      },
      {
        "id": "sec-4",
        "title": "3.4 Steane's Code",
        "content": "A more efficient 7-qubit code achieving similar single-error correction with fewer physical qubits than Shor's code, and notably belonging to the important family of **CSS (Calderbank-Shor-Steane) codes**, which construct quantum codes directly from pairs of classical error-correcting codes."
      },
      {
        "id": "sec-5",
        "title": "3.5 Stabilizer Formalism",
        "content": "The **stabilizer formalism** is the dominant modern mathematical framework for describing and designing quantum error-correcting codes efficiently, describing a code by a set of measurement operators (\"stabilizers\") whose outcomes reveal error information without directly measuring (and thus destroying) the protected quantum information itself."
      },
      {
        "id": "sec-6",
        "title": "3.6 Surface Codes",
        "content": "Currently the leading practical approach for near-term fault-tolerant quantum computing, **surface codes** arrange physical qubits in a 2D lattice with only nearest-neighbor interactions required — a major practical advantage given the connectivity constraints discussed in B5.10 — at the cost of requiring a very large number of physical qubits per logical qubit."
      },
      {
        "id": "sec-7",
        "title": "3.7 Logical Qubits",
        "content": "A **logical qubit** is the error-protected, effectively noise-free qubit that emerges from correctly operating an error-correcting code across many physical qubits — the actual unit of computation an algorithm like Shor's factoring algorithm (2.1) would run on at scale, as opposed to today's raw, unprotected physical qubits."
      },
      {
        "id": "sec-8",
        "title": "3.8 Fault Tolerance",
        "content": "Beyond correcting errors in stored quantum information, **fault-tolerant** quantum computing must also ensure that the error-correction and gate operations *themselves* don't introduce more errors than they fix — a substantially harder engineering and theoretical problem than error correction alone."
      },
      {
        "id": "sec-9",
        "title": "3.9 Threshold Concepts",
        "content": "The **quantum threshold theorem** proves that if the physical error rate per operation is below a certain threshold, arbitrarily long and reliable quantum computation becomes possible by adding enough error-correction overhead — the single most important theoretical result justifying long-term confidence that large-scale, fault-tolerant quantum computers (and therefore a real Shor's-algorithm threat to RSA/ECC) are achievable in principle."
      },
      {
        "id": "sec-10",
        "title": "3.10 Error-Correction Overhead",
        "content": "Closing the module with the practical, sobering reality: current estimates suggest thousands of physical qubits may be required per logical qubit at realistic near-term error rates — directly explaining why B5's discussion of scaling challenges and this course's repeated emphasis on \"the threat is real but not immediate\" are both simultaneously true.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Surface code lattice visualizer: interactive 2D grid showing data qubits and stabilizer measurement qubits, with a simulated single-qubit error and its detection/correction highlighted step by step."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 3.1–3.10.\n- Practical assessment: implement a basic 3-qubit bit-flip code in Qiskit, inject a simulated error, and verify correction.\n- Unlocks: `C4 — Quantum Networking`."
    }
  },
  {
    "id": "track_c_c4_quantum_networking",
    "trackId": "track-c",
    "code": "C4",
    "title": "Quantum Networking",
    "level": "Advanced",
    "estimatedMinutes": 150,
    "xp": 200,
    "prerequisites": [
      "track_c_c3_quantum_error_correction"
    ],
    "unlocks": "track_c_c5_quantum_communications",
    "learningObjectives": [
      "Understand quantum channels, entanglement distribution, and quantum teleportation/swapping.",
      "Understand quantum repeaters and memories as engineering solutions to distance limitations.",
      "Understand quantum network architecture, routing, and internet concepts at an introductory level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "4.1 Quantum Channels (Networking Context)",
        "content": "Building on C1.4's formal treatment, this section applies the quantum channel concept specifically to physical transmission media — optical fiber and free-space links — used to transmit quantum states (typically encoded in photons) between distant locations."
      },
      {
        "id": "sec-2",
        "title": "4.2 Entanglement Distribution",
        "content": "The process of establishing entanglement (B2.2, C1.8) between two physically separated locations by generating an entangled photon pair and transmitting one photon to each location — the foundational operation underlying both quantum teleportation (4.3) and QKD protocols like E91 (covered in C6)."
      },
      {
        "id": "sec-3",
        "title": "4.3 Quantum Teleportation",
        "content": "Despite the name, **quantum teleportation** transmits quantum *information* (not matter) from one location to another using a combination of pre-shared entanglement (4.2) and classical communication — it does not violate relativity, since the classical communication channel is required and limits the process to no faster than light speed. This is a foundational protocol for quantum networking, not a threat-relevant topic, and worth teaching precisely to avoid popular-science misconceptions."
      },
      {
        "id": "sec-4",
        "title": "4.4 Entanglement Swapping",
        "content": "A technique allowing entanglement to be extended between two parties who have never directly interacted, by entangling each with a shared intermediate node and then performing a joint measurement at that intermediate point — the core mechanism enabling quantum repeaters (4.5) to extend entanglement across long distances."
      },
      {
        "id": "sec-5",
        "title": "4.5 Quantum Repeaters",
        "content": "Because photon loss increases with fiber distance, direct long-distance entanglement distribution becomes impractical past roughly 100km. **Quantum repeaters** use entanglement swapping (4.4) at intermediate nodes to extend effective range — the quantum-networking analog of classical signal repeaters, but fundamentally more challenging due to the no-cloning theorem (B2.8) preventing simple signal amplification."
      },
      {
        "id": "sec-6",
        "title": "4.6 Quantum Memories",
        "content": "A **quantum memory** temporarily stores a quantum state (typically a photon's polarization state, transferred to a more stable physical system) long enough to synchronize operations across a quantum repeater network — a critical, still-maturing engineering component for practical long-distance quantum networking."
      },
      {
        "id": "sec-7",
        "title": "4.7 Quantum Network Architectures",
        "content": "Building on B6's classical networking foundations, this section covers how quantum network topologies are designed, incorporating the repeater (4.5) and memory (4.6) infrastructure needed to overcome the fundamental transmission-distance limitations unique to quantum information."
      },
      {
        "id": "sec-8",
        "title": "4.8 Quantum Routing Concepts",
        "content": "Preliminary research-level concepts for how entanglement resources might be efficiently routed and allocated across a quantum network with multiple possible paths — an active, evolving research area without the mature standardization that classical routing (B6.2) enjoys today."
      },
      {
        "id": "sec-9",
        "title": "4.9 Quantum Internet Concepts",
        "content": "A forward-looking synthesis: what a future \"quantum internet\" — a network capable of distributing entanglement and quantum information globally — might enable (distributed quantum computing, provably secure communication via QKD at scale) and the substantial engineering distance between current lab-scale demonstrations and that vision.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Quantum repeater chain animation: visualize entanglement swapping extending a connection across 3-4 simulated repeater nodes, with photon loss/success probability shown at each hop."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 4.1–4.9.\n- Practical assessment: design a basic quantum repeater network topology for a hypothetical city-to-city link, justifying repeater node placement.\n- Unlocks: `C5 — Quantum Communications`."
    }
  },
  {
    "id": "track_c_c5_quantum_communications",
    "trackId": "track-c",
    "code": "C5",
    "title": "Quantum Communications",
    "level": "Advanced",
    "estimatedMinutes": 140,
    "xp": 200,
    "prerequisites": [
      "track_c_c4_quantum_networking"
    ],
    "unlocks": "track_c_c6_quantum_key_distribution",
    "learningObjectives": [
      "Understand teleportation and superdense coding as the two foundational quantum communication protocols.",
      "Understand quantum channel capacity concepts and entanglement distribution/repeaters in a communications-theory context.",
      "Understand satellite and optical quantum communications as real-world deployment approaches."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "5.1 Teleportation (Communications-Theory Framing)",
        "content": "Revisiting C4.3 from an information-theory perspective: quantum teleportation consumes one shared entangled pair and 2 classical bits of communication to transmit one qubit's worth of quantum information — a precise \"resource cost\" framing useful for comparing communication protocols."
      },
      {
        "id": "sec-2",
        "title": "5.2 Superdense Coding",
        "content": "The conceptual mirror image of teleportation: **superdense coding** uses one shared entangled pair and the transmission of a single qubit to communicate 2 classical bits of information — twice the classical capacity of sending an unentangled qubit alone, demonstrating a genuine, provable communication advantage from pre-shared entanglement."
      },
      {
        "id": "sec-3",
        "title": "5.3 No-Cloning (Communications Implications)",
        "content": "Revisiting B2.8's no-cloning theorem specifically for its communications implications: because quantum information cannot be copied, quantum communication protocols must be designed around consuming and consuming entanglement resources, rather than freely amplifying or duplicating signals the way classical communication systems do — directly explaining why quantum repeaters (C4.5) require entanglement swapping rather than simple amplification."
      },
      {
        "id": "sec-4",
        "title": "5.4 Quantum Channel Capacity Concepts",
        "content": "An introduction to the quantum information-theoretic question of how much information can reliably be transmitted through a noisy quantum channel — the quantum generalization of Shannon's classical channel capacity theory, referencing the information measures introduced formally in C1.7."
      },
      {
        "id": "sec-5",
        "title": "5.5 Entanglement Distribution (Communications Context)",
        "content": "Revisiting C4.2 with communications-engineering framing: entanglement distribution rate (entangled pairs generated per second) and fidelity (how close to perfectly entangled the pairs actually are) as the two key performance metrics for any real quantum communication system."
      },
      {
        "id": "sec-6",
        "title": "5.6 Quantum Repeaters (Communications Context)",
        "content": "Revisiting C4.5 from a systems-engineering perspective: repeater rate, memory storage time, and swap success probability as the concrete engineering parameters determining a real quantum network's achievable range and throughput."
      },
      {
        "id": "sec-7",
        "title": "5.7 Satellite Quantum Communication",
        "content": "Free-space quantum communication via satellite has demonstrated significantly longer-range entanglement distribution than is currently practical through fiber alone, since satellite links avoid the cumulative photon loss of long fiber runs — an active area of real-world experimental deployment worth checking against current published results for the latest achieved distances and milestones."
      },
      {
        "id": "sec-8",
        "title": "5.8 Optical Quantum Communications",
        "content": "The broader category of using photons in optical fiber or free space as the physical carrier for quantum information — encompassing both the fiber-based approaches discussed in C4 and the satellite-based approaches in 5.7, unified by their shared reliance on photonic qubit encoding.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Side-by-side comparison chart: fiber-based vs. satellite-based quantum communication across achievable distance, current data rate, and deployment maturity — with a clear content-team note to verify current figures before publishing, given how quickly this field advances."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 5.1–5.8.\n- Practical assessment: given a target distance and use case, evaluate whether a fiber-based or satellite-based approach is more appropriate, citing the tradeoffs covered in this module.\n- Unlocks: `C6 — Quantum Key Distribution`."
    }
  },
  {
    "id": "track_c_c6_quantum_key_distribution",
    "trackId": "track-c",
    "code": "C6",
    "title": "Quantum Key Distribution",
    "level": "Advanced",
    "estimatedMinutes": 160,
    "xp": 200,
    "prerequisites": [
      "track_c_c5_quantum_communications"
    ],
    "unlocks": "track_c_c7_advanced_cryptography",
    "learningObjectives": [
      "Understand the BB84, B92, and E91 protocols in technical depth.",
      "Understand decoy-state methods and both measurement-device-independent and device-independent QKD.",
      "Understand QKD attack models, eavesdropping detection, deployment architecture, and — critically — QKD's practical limitations relative to PQC."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "6.1 BB84",
        "content": "The original and most widely deployed QKD protocol (Bennett & Brassard, 1984): the sender encodes random bits into photon polarization using randomly chosen bases, the receiver measures using randomly chosen bases, and after publicly comparing (but not revealing) which bases were used, both parties discard mismatched-basis results, leaving a shared secret key. Security stems from the no-cloning theorem (B2.8): any eavesdropper attempting to intercept and measure photons in transit inevitably introduces detectable errors."
      },
      {
        "id": "sec-2",
        "title": "6.2 B92",
        "content": "A simplified variant of BB84 using only two non-orthogonal quantum states instead of four, trading some practical robustness for conceptual and implementation simplicity — useful for building intuition before tackling entanglement-based protocols like E91."
      },
      {
        "id": "sec-3",
        "title": "6.3 E91",
        "content": "Unlike BB84/B92, which use single photons in different bases, **E91** (Ekert, 1991) is built directly on shared entanglement (C4.2) between sender and receiver, using Bell's inequality violations to simultaneously establish a shared key and mathematically prove the absence of eavesdropping — an elegant connection between the deep foundational physics of entanglement and a practical security application."
      },
      {
        "id": "sec-4",
        "title": "6.4 Decoy-State Concepts",
        "content": "A practical enhancement addressing a real-world vulnerability in photon-source implementations: since perfect single-photon sources are difficult to build, **decoy states** (deliberately varying photon intensity) allow legitimate parties to detect certain classes of attacks that exploit multi-photon pulses — an example of the gap between idealized protocol security proofs and real hardware security."
      },
      {
        "id": "sec-5",
        "title": "6.5 Measurement-Device-Independent QKD",
        "content": "**MDI-QKD** addresses vulnerabilities in the *measurement* devices used in standard QKD implementations (a common real-world attack surface) by routing measurement through an untrusted third party in a way that remains provably secure even if that measurement device is fully compromised by an attacker."
      },
      {
        "id": "sec-6",
        "title": "6.6 Device-Independent Concepts",
        "content": "An even stronger security model where security is guaranteed based purely on observed statistical correlations (Bell inequality violations, as in E91) without needing to trust the internal workings of *any* device involved — the theoretical gold standard for QKD security, though currently more experimentally demanding to implement at practical rates."
      },
      {
        "id": "sec-7",
        "title": "6.7 QKD Attack Models",
        "content": "A survey of practical attacks demonstrated against real QKD implementations — not attacks on the underlying theory, but on real hardware imperfections (e.g., \"blinding\" attacks against single-photon detectors) — an important, sobering reminder that provable protocol security doesn't automatically guarantee implementation security, a theme that reappears in C10's PQC Attack Surface module."
      },
      {
        "id": "sec-8",
        "title": "6.8 Eavesdropping Detection",
        "content": "The formal mechanism by which QKD protocols detect an eavesdropper: comparing a sample of the shared key over a public channel and calculating the resulting error rate — if it exceeds a theoretical threshold consistent with normal channel noise, the parties know an eavesdropper (or excessive noise) is present and discard the key."
      },
      {
        "id": "sec-9",
        "title": "6.9 QKD Deployment Architecture",
        "content": "Building on C4's networking foundations, this section covers practical QKD deployment considerations: point-to-point links, trusted-node networks (where intermediate nodes must be physically secured, since quantum repeaters for QKD specifically remain largely experimental), and integration with classical network infrastructure."
      },
      {
        "id": "sec-10",
        "title": "6.10 QKD Limitations",
        "content": "A direct, honest accounting: QKD requires dedicated point-to-point (or trusted-node) hardware infrastructure, has significant distance limitations without mature quantum repeaters, cannot easily support the internet's many-to-many communication pattern, and — critically — only secures key *distribution*, not the actual encryption of data, which still relies on a classical symmetric algorithm like AES."
      },
      {
        "id": "sec-11",
        "title": "6.11 QKD vs. PQC (Full Comparison)",
        "content": "The capstone comparison of this module, and the most important section for Q-CAPS's own positioning: QKD offers information-theoretic security guaranteed by physics, but requires specialized hardware, has deployment/distance constraints, and doesn't scale easily to the internet. PQC requires no special hardware, deploys over existing infrastructure at internet scale, and integrates directly into protocols like TLS — but its security rests on computational hardness assumptions (believed secure, not physically proven, distinct from QKD's guarantee). This is precisely why Q-CAPS — designed for scalable, practical, internet-wide deployment — is built around PQC rather than QKD.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** BB84 protocol simulator: step-by-step walkthrough where the learner acts as sender or receiver, choosing random bases, and sees an eavesdropper (toggleable) introduce detectable errors in the resulting key — the clearest possible hands-on demonstration of why QKD's security works."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 6.1–6.11.\n- Practical assessment: simulate a BB84 key exchange with and without an eavesdropper present, and calculate the resulting error rate in each case.\n- Unlocks: `C7 — Advanced Cryptography`."
    }
  },
  {
    "id": "track_c_c7_advanced_cryptography",
    "trackId": "track-c",
    "code": "C7",
    "title": "Advanced Cryptography",
    "level": "Advanced",
    "estimatedMinutes": 170,
    "xp": 200,
    "prerequisites": [
      "track_c_c6_quantum_key_distribution"
    ],
    "unlocks": "track_c_c8_pqc_mathematics",
    "learningObjectives": [
      "Understand number theory foundations underlying RSA and ECC at a rigorous level.",
      "Understand advanced symmetric cryptography, hash function internals, and formal KEM/signature security.",
      "Understand provable-security concepts, cryptographic protocols, and secure randomness at a research level."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "7.1 Number Theory",
        "content": "Rigorous treatment of the number-theoretic foundations underlying classical public-key cryptography: modular arithmetic, Euler's theorem, and the structure of multiplicative groups modulo n — the formal mathematical machinery RSA (7.2) is built from."
      },
      {
        "id": "sec-2",
        "title": "7.2 Factoring and Discrete Logarithms",
        "content": "The two \"hard problems\" underlying nearly all classical public-key cryptography, treated formally here: **integer factorization** (RSA's foundation) and the **discrete logarithm problem** (Diffie-Hellman/ECC's foundation) — including why both are believed hard classically, and precisely how Shor's algorithm (C2.1) breaks that classical hardness assumption."
      },
      {
        "id": "sec-3",
        "title": "7.3 Elliptic Curves",
        "content": "A rigorous mathematical treatment of elliptic curve group structure — point addition, the group law, and curve parameter selection — going well beyond B7.2's practitioner-level ECDSA/ECDH treatment into the actual algebraic geometry underlying ECC's security."
      },
      {
        "id": "sec-4",
        "title": "7.4 Advanced Symmetric Cryptography",
        "content": "Deeper treatment of block cipher design principles (substitution-permutation networks, Feistel structures), and formal security notions for symmetric encryption (semantic security, indistinguishability under chosen-plaintext attack) — the rigorous standard AES and its modes of operation (B7 introduced conceptually) are actually measured against."
      },
      {
        "id": "sec-5",
        "title": "7.5 Hash Functions (Internal Construction)",
        "content": "Building on A5.3/B7's usage-level treatment, this section covers how hash functions like SHA-256 are actually constructed internally (compression functions, the Merkle-Damgård construction) — directly relevant preparation for understanding hash-based PQC signatures (SLH-DSA) covered formally in C8.9."
      },
      {
        "id": "sec-6",
        "title": "7.6 KEM Security",
        "content": "Formal security definitions for Key Encapsulation Mechanisms (introduced conceptually in B7.3, B9.2): **IND-CCA2 security** (indistinguishability under adaptive chosen-ciphertext attack) as the gold-standard security notion every modern KEM, including ML-KEM, is designed and proven against."
      },
      {
        "id": "sec-7",
        "title": "7.7 Signature Security",
        "content": "Formal treatment building on B7.4: the precise mathematical definition of existential unforgeability under chosen-message attack (EUF-CMA) — the standard security proof target for signature schemes including ML-DSA and SLH-DSA."
      },
      {
        "id": "sec-8",
        "title": "7.8 Provable-Security Concepts",
        "content": "An introduction to the methodology of **provable security**: reducing a cryptographic scheme's security to the hardness of a well-studied mathematical problem via a formal security proof — the rigorous foundation underlying confidence in both classical schemes (RSA reducing to factoring) and PQC schemes (ML-KEM reducing to Module-LWE hardness, covered in C8)."
      },
      {
        "id": "sec-9",
        "title": "7.9 Cryptographic Protocols",
        "content": "Beyond individual primitives, this section covers how primitives combine into full protocols (like TLS) and the additional security considerations that emerge only at the protocol level — composition security, protocol-level attacks that don't exploit any individual primitive's weakness but rather how they're combined."
      },
      {
        "id": "sec-10",
        "title": "7.10 Randomness and Key Generation",
        "content": "A frequently underestimated topic: cryptographic security fundamentally depends on high-quality randomness for key generation. This section covers cryptographically secure pseudorandom number generators (CSPRNGs), entropy sources, and historical real-world failures caused by weak randomness — directly setting up C10's coverage of randomness-related attack surfaces.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Security-reduction diagram: visual \"proof chain\" showing how ML-KEM's security formally reduces to Module-LWE hardness, mirrored against how RSA's security reduces to factoring hardness — makes the abstract concept of provable security concrete and comparable across classical and PQC schemes."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 7.1–7.10.\n- Practical assessment: given a described cryptographic scheme, identify which formal security notion (IND-CCA2, EUF-CMA, etc.) is the appropriate target and explain why.\n- Unlocks: `C8 — PQC Mathematics`."
    }
  },
  {
    "id": "track_c_c8_pqc_mathematics",
    "trackId": "track-c",
    "code": "C8",
    "title": "PQC Mathematics",
    "level": "Advanced",
    "estimatedMinutes": 190,
    "xp": 200,
    "prerequisites": [
      "track_c_c7_advanced_cryptography"
    ],
    "unlocks": "track_c_c9_pqc_implementation_engineering",
    "learningObjectives": [
      "Understand lattice concepts, LWE, Ring-LWE, and Module-LWE at the mathematical level underlying ML-KEM and ML-DSA.",
      "Understand SIS/Module-SIS and Merkle trees/hash-based signatures at the level underlying SLH-DSA.",
      "Understand coding theory and syndrome decoding as an alternative PQC mathematical foundation."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "8.1 Lattice Concepts",
        "content": "A **lattice** is a regular, infinite grid of points in n-dimensional space, generated by integer combinations of a set of basis vectors. Certain computational problems on lattices — like finding the shortest non-zero vector — are believed to be hard even for quantum computers, forming the mathematical bedrock for lattice-based PQC (B9.4)."
      },
      {
        "id": "sec-2",
        "title": "8.2 LWE (Learning With Errors)",
        "content": "The **Learning With Errors** problem asks an attacker to recover a secret vector given many noisy linear equations involving it — deliberately \"noisy\" in a way that makes the problem provably as hard as certain worst-case lattice problems. LWE is the foundational hardness assumption most modern lattice-based cryptography, including the schemes discussed in this module, are built on."
      },
      {
        "id": "sec-3",
        "title": "8.3 Ring-LWE",
        "content": "A structured variant of LWE, operating over polynomial rings rather than plain vectors — offering significant efficiency and key-size improvements over plain LWE, at the cost of relying on the hardness of a more structured (and therefore, in principle, potentially more attackable) mathematical problem, a tradeoff actively studied in ongoing cryptanalysis research."
      },
      {
        "id": "sec-4",
        "title": "8.4 Module-LWE",
        "content": "A middle ground between plain LWE (8.2) and Ring-LWE (8.3), offering much of Ring-LWE's efficiency while retaining more of plain LWE's structural flexibility and conservative security profile — this is the specific hardness assumption **ML-KEM and ML-DSA** are built on, directly explaining the \"Module-Lattice\" in both algorithms' full names."
      },
      {
        "id": "sec-5",
        "title": "8.5 SIS/Module-SIS",
        "content": "The **Short Integer Solution (SIS)** problem is a complementary lattice problem to LWE, and its module variant (**Module-SIS**) underlies certain lattice-based signature constructions — included here for mathematical completeness alongside the (M)LWE-based schemes."
      },
      {
        "id": "sec-6",
        "title": "8.6 Merkle Trees",
        "content": "A **Merkle tree** is a binary tree structure where each non-leaf node's value is the hash of its children's values, allowing efficient and secure verification of a large dataset's integrity via a compact proof path — the foundational data structure hash-based signature schemes are built on."
      },
      {
        "id": "sec-7",
        "title": "8.7 Hash-Based Signatures",
        "content": "Building on B9.5's conceptual introduction, this section covers the mathematical construction of hash-based signatures: combining one-time signature schemes (each securely usable only once) with Merkle trees (8.6) to build a full, reusable signature scheme whose security rests entirely on the hash function's collision resistance — no lattice or number-theoretic assumption required."
      },
      {
        "id": "sec-8",
        "title": "8.8 Coding Theory",
        "content": "An introduction to error-correcting codes from a cryptographic (rather than networking) perspective: linear codes, generator matrices, and the general decoding problem — mathematical groundwork for code-based cryptography (B9.6)."
      },
      {
        "id": "sec-9",
        "title": "8.9 Syndrome Decoding",
        "content": "The **syndrome decoding problem** — recovering an error pattern from a linear code's syndrome — is believed hard for both classical and quantum computers, and is the foundational hardness assumption underlying code-based schemes like the classic McEliece cryptosystem, first referenced in B9.6."
      },
      {
        "id": "sec-10",
        "title": "8.10 Security Assumptions and Parameter Tradeoffs",
        "content": "Closing the module by connecting all the mathematical foundations covered (8.1–8.9) back to the practical algorithm-selection tradeoffs introduced in B9.8 and B10 — but now with full understanding of *why* those tradeoffs exist at the mathematical level, rather than treating them as given facts.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Lattice visualizer: interactive 2D lattice where the learner attempts to find the shortest vector manually as dimension/basis complexity increases, building direct intuition for why this problem becomes computationally intractable at the high dimensions real cryptographic schemes use."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 8.1–8.10.\n- Practical assessment: given a small LWE instance, work through recovering the secret with and without noise, illustrating why the noise term makes the problem hard.\n- Unlocks: `C9 — PQC Implementation Engineering`."
    }
  },
  {
    "id": "track_c_c9_pqc_implementation_engineering",
    "trackId": "track-c",
    "code": "C9",
    "title": "PQC Implementation Engineering",
    "level": "Advanced",
    "estimatedMinutes": 200,
    "xp": 200,
    "prerequisites": [
      "track_c_c8_pqc_mathematics"
    ],
    "unlocks": "track_c_c10_pqc_attack_surface",
    "learningObjectives": [
      "Implement ML-KEM, ML-DSA, and SLH-DSA operations directly, beyond the library-level usage in B11.",
      "Understand key generation, encapsulation/decapsulation, and signing/verification implementation details.",
      "Understand serialization, API design, memory considerations, performance tuning, interoperability, and deployment testing."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "9.1 ML-KEM Implementation",
        "content": "Building on C8.4's mathematical foundation, this section walks through implementing ML-KEM's core operations directly (or studying a reference implementation closely): generating a Module-LWE-based keypair, and performing encapsulation/decapsulation — going beyond B11's black-box library usage to understand what's actually happening inside those function calls."
      },
      {
        "id": "sec-2",
        "title": "9.2 ML-DSA Implementation",
        "content": "Similarly, implementing or closely studying ML-DSA's signing and verification operations, built on the same Module-LWE/Module-SIS mathematical foundation covered in C8.4–8.5 — connecting the abstract lattice math directly to working code."
      },
      {
        "id": "sec-3",
        "title": "9.3 SLH-DSA Implementation",
        "content": "Implementing or studying SLH-DSA's hash-based signing process — building a Merkle tree (C8.6) of one-time signature keypairs (C8.7) and understanding why this construction results in the notably larger signature sizes discussed since B9.5."
      },
      {
        "id": "sec-4",
        "title": "9.4 Key Generation (Engineering Depth)",
        "content": "Practical engineering concerns in generating PQC keys correctly: sourcing sufficient high-quality randomness (connecting to C7.10), and avoiding subtle implementation bugs that have historically undermined otherwise-sound cryptographic schemes."
      },
      {
        "id": "sec-5",
        "title": "9.5 Encapsulation/Decapsulation",
        "content": "Implementation-level detail on the KEM operations introduced conceptually in B7.3/B9.2/C7.6 — including correct handling of decapsulation failures, a subtlety specific to lattice-based KEMs (due to the LWE noise term, decapsulation can rarely fail even with correct keys) that implementers must handle carefully to avoid introducing security weaknesses."
      },
      {
        "id": "sec-6",
        "title": "9.6 Signing/Verification",
        "content": "Implementation-level detail on ML-DSA and SLH-DSA signing/verification, including the performance and determinism considerations that differ between the two algorithm families."
      },
      {
        "id": "sec-7",
        "title": "9.7 Serialization",
        "content": "The practical concern of encoding PQC keys, ciphertexts, and signatures into byte formats for storage or network transmission — including current standardization efforts around consistent serialization formats to ensure interoperability, connecting to B10.6's interoperability discussion."
      },
      {
        "id": "sec-8",
        "title": "9.8 API Design",
        "content": "Best practices for exposing PQC operations through clean, misuse-resistant software APIs — designing interfaces that make the correct, secure usage pattern the easy default, reducing the chance of the implementation-level vulnerabilities catalogued fully in C10."
      },
      {
        "id": "sec-9",
        "title": "9.9 Memory Considerations",
        "content": "PQC keys and intermediate values are generally larger than their classical RSA/ECC counterparts, with implications for memory-constrained environments (embedded devices, smart cards) — a genuine deployment consideration, especially relevant for SLH-DSA's larger signatures (C8.7)."
      },
      {
        "id": "sec-10",
        "title": "9.10 Performance",
        "content": "Building on B11's hands-on benchmarking, this section covers performance optimization techniques for PQC implementations: efficient polynomial arithmetic (for lattice-based schemes) and hardware acceleration opportunities (e.g., SIMD instructions, dedicated hardware)."
      },
      {
        "id": "sec-11",
        "title": "9.11 Interoperability",
        "content": "Ensuring independent PQC implementations correctly interoperate — critical for real-world deployment where a client and server may use entirely different software libraries, extending B10.6's protocol-level discussion to the implementation level."
      },
      {
        "id": "sec-12",
        "title": "9.12 Deployment Testing",
        "content": "Closing the module with systematic testing methodology for PQC implementations before production deployment: known-answer tests (verifying against official test vectors), interoperability testing against multiple independent implementations, and performance regression testing.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Step-through code walkthrough tool: annotated ML-KEM reference implementation where the learner can step through key generation, encapsulation, and decapsulation line-by-line, with each step's mathematical meaning (connecting back to C8.4) displayed alongside the code."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 9.1–9.12.\n- Practical assessment: implement or configure a working ML-KEM key exchange from source/library, verify against official test vectors, and document a basic deployment test plan.\n- Unlocks: `C10 — PQC Attack Surface`."
    }
  },
  {
    "id": "track_c_c10_pqc_attack_surface",
    "trackId": "track-c",
    "code": "C10",
    "title": "PQC Attack Surface",
    "level": "Advanced",
    "estimatedMinutes": 180,
    "xp": 200,
    "prerequisites": [
      "track_c_c9_pqc_implementation_engineering"
    ],
    "unlocks": "track_c_c11_pqc_defense_engineering",
    "learningObjectives": [
      "Understand side-channel, timing, cache-based, and power-analysis/fault-injection attack categories as they apply to PQC.",
      "Understand randomness weaknesses and key-generation failures as a recurring root cause.",
      "Understand implementation bugs, protocol downgrade, hybrid-mode weaknesses, certificate migration failures, and supply-chain risk."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "10.1 Side-Channel Attacks",
        "content": "A **side-channel attack** extracts secret information not by breaking the underlying mathematics, but by observing unintended physical signals leaked during computation — timing, power consumption, electromagnetic emissions, or cache behavior. This is a critical theme for this module: a PQC algorithm can be mathematically unbreakable (per C7-C8's hardness assumptions) while still being practically broken through a poorly implemented side channel."
      },
      {
        "id": "sec-2",
        "title": "10.2 Timing Attacks",
        "content": "A specific side-channel category where an attacker measures how long an operation takes, inferring secret information if execution time varies depending on secret key bits — directly motivating the \"constant-time\" implementation requirement covered as a core defense in C11.2."
      },
      {
        "id": "sec-3",
        "title": "10.3 Cache-Based Attacks",
        "content": "A specific side-channel exploiting CPU cache behavior — observing which memory addresses were accessed (and thus present in cache) can leak information about secret-dependent memory access patterns, a documented real-world attack vector against several classical and PQC cryptographic implementations."
      },
      {
        "id": "sec-4",
        "title": "10.4 Power-Analysis Concepts",
        "content": "Particularly relevant to embedded and IoT devices: measuring a device's power consumption during a cryptographic operation can reveal information correlated with secret key bits — a mature attack category originally developed against classical smart-card cryptography, now an active research area for PQC implementations targeting similar constrained devices."
      },
      {
        "id": "sec-5",
        "title": "10.5 Fault-Injection Concepts",
        "content": "Deliberately inducing computational errors (via voltage glitches, laser pulses, or electromagnetic interference) and analyzing the resulting faulty output to extract secret key information — a physical attack category requiring device access, but a serious concern for hardware security modules (B7.10) and embedded PQC deployments."
      },
      {
        "id": "sec-6",
        "title": "10.6 Randomness Weaknesses",
        "content": "Revisiting C7.10's coverage of secure randomness specifically as an attack surface: weak or predictable randomness during key generation is one of the most common real-world causes of cryptographic failure across both classical and PQC systems, since a compromised randomness source can undermine an otherwise mathematically sound scheme entirely."
      },
      {
        "id": "sec-7",
        "title": "10.7 Key-Generation Failures",
        "content": "Building on 10.6 and C9.4: documented historical failure patterns in key generation — insufficient entropy at system boot, flawed random number generator implementations, or key reuse — with direct relevance to how PQC key generation must be implemented and tested (C9.12) to avoid repeating these failure classes."
      },
      {
        "id": "sec-8",
        "title": "10.8 Implementation Bugs",
        "content": "General software vulnerabilities (buffer overflows, incorrect boundary checks, logic errors) occurring within cryptographic library code — a reminder that most real-world cryptographic breaks in practice stem from implementation bugs rather than breaking the underlying mathematics, reinforcing why C9's implementation-engineering rigor matters as much as C8's mathematical foundations."
      },
      {
        "id": "sec-9",
        "title": "10.9 Protocol Downgrade",
        "content": "An attack where an adversary manipulates a protocol negotiation (e.g., during a TLS handshake) to force both parties into using a weaker, more easily broken algorithm than they would otherwise agree to — directly relevant to PQC migration, where a downgrade attack could force a connection back to classical-only cryptography even when both endpoints support PQC."
      },
      {
        "id": "sec-10",
        "title": "10.10 Hybrid-Mode Weaknesses",
        "content": "A nuanced, PQC-specific concern: incorrectly implemented hybrid classical+PQC cryptography (core Module 3.6, B11.6) could theoretically introduce new weaknesses if the combination method itself is flawed — even if both individual algorithms remain secure — underscoring why hybrid combiner constructions require their own careful security analysis, not just \"use both and assume it's fine.\""
      },
      {
        "id": "sec-11",
        "title": "10.11 Certificate Migration Failures",
        "content": "Operational (not purely cryptographic) risks during PKI migration to PQC certificates: misconfigured certificate chains, incomplete trust store updates, or compatibility failures with systems not yet supporting PQC — connecting directly back to B7.5–7.6's PKI architecture and certificate lifecycle coverage."
      },
      {
        "id": "sec-12",
        "title": "10.12 Supply-Chain Risks",
        "content": "A closing, broader concern: the cryptographic libraries and hardware components an organization depends on for PQC implementation are themselves potential attack vectors if compromised upstream — an increasingly recognized risk category in modern security practice, relevant to the vendor requirements covered later in Track D's Governance module.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Timing attack simulator: a simplified (non-real) comparison function where the learner can measure execution time across many guesses and observe how timing variation leaks information — a safe, hands-on demonstration of why constant-time implementation (previewed here, covered fully in C11.2) matters."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 10.1–10.12.\n- Practical assessment: given a described PQC deployment scenario, identify the most likely attack surface category and propose an appropriate mitigation direction (fully developed in C11).\n- Unlocks: `C11 — PQC Defense Engineering`."
    }
  },
  {
    "id": "track_c_c11_pqc_defense_engineering",
    "trackId": "track-c",
    "code": "C11",
    "title": "PQC Defense Engineering",
    "level": "Advanced",
    "estimatedMinutes": 190,
    "xp": 200,
    "prerequisites": [
      "track_c_c10_pqc_attack_surface"
    ],
    "unlocks": "track_d_e1_quantum_risk_management",
    "learningObjectives": [
      "Apply secure implementation practices directly countering C10's attack categories: constant-time design, secure randomness, key protection, and side-channel resistance.",
      "Understand fault detection, secure API design, algorithm agility, and hybrid deployment as defense strategies.",
      "Understand testing, formal-verification concepts, and security evaluation methodology for PQC systems."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "11.1 Secure Implementation (Overview)",
        "content": "A synthesis framing for this module: secure implementation isn't a single technique but a discipline combining every principle in this module — the practical answer to the entire attack surface catalogued in C10."
      },
      {
        "id": "sec-2",
        "title": "11.2 Constant-Time Design",
        "content": "The direct defense against timing attacks (C10.2): implementing cryptographic operations so their execution time is independent of secret data, eliminating the information leakage that timing analysis exploits — a rigorous engineering discipline requiring careful avoidance of secret-dependent branches and memory access patterns."
      },
      {
        "id": "sec-3",
        "title": "11.3 Secure Randomness",
        "content": "The direct defense against C10.6–10.7's randomness weaknesses and key-generation failures: using properly seeded cryptographically secure random number generators, verified entropy sources, and following established best practices (and standards) for random number generation in security-critical code."
      },
      {
        "id": "sec-4",
        "title": "11.4 Key Protection",
        "content": "Building on B7.10's HSM introduction, this section covers defense-in-depth key protection strategies: minimizing key exposure in memory, using hardware-backed key storage where available, and secure key deletion — direct mitigation for several of C10's attack categories that ultimately aim to extract key material."
      },
      {
        "id": "sec-5",
        "title": "11.5 Side-Channel Resistance",
        "content": "Broader defenses beyond constant-time design (11.2) alone: masking techniques (randomizing intermediate computation values to obscure their correlation with secret data), and physical countermeasures for power-analysis (C10.4) and cache-based (C10.3) attacks."
      },
      {
        "id": "sec-6",
        "title": "11.6 Fault Detection",
        "content": "The direct defense against fault-injection attacks (C10.5): redundant computation and result-verification techniques that detect when a computation has been deliberately or accidentally corrupted, before any faulty output is released."
      },
      {
        "id": "sec-7",
        "title": "11.7 Secure APIs",
        "content": "Building on C9.8's API design coverage, this section focuses specifically on the security dimension: designing interfaces that make implementation bugs (C10.8) structurally harder to introduce, through careful input validation, safe defaults, and minimizing the surface area exposed to misuse."
      },
      {
        "id": "sec-8",
        "title": "11.8 Algorithm Agility",
        "content": "Directly reinforcing crypto-agility (core Module 3.6, B7.11) as a defense principle in its own right: systems designed for algorithm agility can respond quickly to newly discovered weaknesses in any single algorithm — including a hypothetical future weakness discovered in a currently-standardized PQC algorithm — without requiring a full system redesign."
      },
      {
        "id": "sec-9",
        "title": "11.9 Hybrid Deployment",
        "content": "Building on B11.6's hands-on hybrid cryptography lab and directly addressing C10.9–10.10's downgrade and hybrid-mode concerns: correctly implemented hybrid deployment (combining classical and PQC algorithms with a properly analyzed combiner) as the current best-practice defense strategy during the migration period, hedging against weaknesses in either individual algorithm family."
      },
      {
        "id": "sec-10",
        "title": "11.10 Testing",
        "content": "Extending C9.12's deployment testing into an ongoing security discipline: fuzzing (automated testing with malformed/unexpected inputs to discover implementation bugs), and continuous security testing integrated into the development lifecycle rather than a one-time pre-deployment check."
      },
      {
        "id": "sec-11",
        "title": "11.11 Formal-Verification Concepts",
        "content": "An introduction to mathematically proving that an implementation correctly matches its specification — a rigorous, resource-intensive approach increasingly applied to high-assurance cryptographic code, offering the strongest possible confidence against implementation bugs (C10.8) beyond what testing alone can achieve."
      },
      {
        "id": "sec-12",
        "title": "11.12 Security Evaluation",
        "content": "Closing the module — and Track C's core technical content — with a synthesis of how a PQC implementation is holistically evaluated: combining the mathematical confidence from C7-C8, the implementation rigor from C9, the attack-surface awareness from C10, and the defense practices from this module into a structured security evaluation process.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** \"Defense checklist\" scorecard tool: learner is given a described (flawed) PQC implementation and must identify which C11 defenses are missing, mapped directly back to which C10 attack category each addresses — a synthesis exercise reinforcing the full attack-to-defense arc of the module pair."
      },
      {
        "id": "sec-13",
        "title": "Advanced Capstones (choose one)",
        "content": "1. **PQC Implementation Security Evaluation** — apply C9–C11 directly: implement a PQC component, then conduct a structured security evaluation identifying attack surface and verifying defenses.\n2. **Quantum Network Architecture** — apply C4–C6: design a quantum network architecture for a specified use case, justifying repeater/node placement and protocol choice (QKD variant or classical PQC-secured links).\n3. **Secure Quantum Communication System** — apply C5–C6 with an implementation component: build and test a working QKD or quantum-communication protocol simulation."
      },
      {
        "id": "sec-14",
        "title": "Certificates",
        "content": "Awarded based on capstone path: **QCE** (Quantum Computing Engineer), **PQC-E** (Post-Quantum Cryptography Engineer), or **QNE** (Quantum Networking Engineer).\n\n---"
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 11.1–11.12.\n- Practical assessment: this module's content feeds directly into the Advanced Capstone selection above.\n- Unlocks: **Track D — Enterprise Quantum Security Architect** (or direct entry to the Shared Professional Core / Specialization Pathways for learners not pursuing the enterprise/architect path)."
    }
  },
  {
    "id": "track_d_e1_quantum_risk_management",
    "trackId": "track-d",
    "code": "E1",
    "title": "Quantum Risk Management",
    "level": "Enterprise",
    "estimatedMinutes": 130,
    "xp": 250,
    "prerequisites": [
      "track_c_c11_pqc_defense_engineering"
    ],
    "unlocks": "track_d_e2_cryptographic_discovery",
    "learningObjectives": [
      "Translate the technical quantum threat landscape into organizational business-impact terms.",
      "Assess data sensitivity and lifetime, HNDL risk, and critical-system exposure at an organizational scale.",
      "Build a structured quantum risk model incorporating third-party dependencies."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "1.1 Quantum Threat Landscape (Business Framing)",
        "content": "Reframing B8's technical threat model (Shor, Grover, HNDL) for a non-technical executive audience: what matters to leadership isn't the mathematics of factoring, but the business consequences — which systems, revenue streams, or regulatory obligations are exposed, and on what realistic timeline."
      },
      {
        "id": "sec-2",
        "title": "1.2 Business Impact",
        "content": "Translating technical exposure into concrete business impact categories: financial loss, regulatory penalties, reputational damage, and loss of competitive advantage (e.g., stolen intellectual property becoming usable by a competitor once decrypted) — the language that secures executive buy-in and budget for migration work."
      },
      {
        "id": "sec-3",
        "title": "1.3 Data Sensitivity and Lifetime",
        "content": "Building directly on B8.6–8.7's HNDL formalization, this section covers the organizational process of classifying data by both sensitivity (how damaging exposure would be) and required confidentiality lifetime (how long it must remain protected) — the two inputs that together determine real HNDL exposure for any given dataset."
      },
      {
        "id": "sec-4",
        "title": "1.4 Harvest-Now-Decrypt-Later Risk (Organizational Scale)",
        "content": "Applying core Module 3.3 and B8.6's HNDL concept across an entire organization's data estate: which data categories (from 1.3) are actively being transmitted or stored in ways that make them plausible interception targets today."
      },
      {
        "id": "sec-5",
        "title": "1.5 Critical Systems",
        "content": "Identifying which systems, if compromised via future quantum-enabled decryption, would cause the most severe business impact (1.2) — the foundation for the risk prioritization that drives migration sequencing in E5."
      },
      {
        "id": "sec-6",
        "title": "1.6 Third-Party Dependencies",
        "content": "Organizational cryptographic risk doesn't stop at owned infrastructure — vendors, cloud providers, and partners handling sensitive data on an organization's behalf introduce dependency risk that must be assessed and, where possible, contractually addressed (connecting to E6's vendor requirements coverage)."
      },
      {
        "id": "sec-7",
        "title": "1.7 Risk Modeling",
        "content": "Synthesizing 1.1–1.6 into a structured, repeatable risk model: combining threat likelihood (informed by B8.3's Shor threat-model timelines), data sensitivity/lifetime (1.3), and system criticality (1.5) into a scored risk output — directly mirroring the readiness/risk scoring approach used in the Q-CAPS platform's own Organization module.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Risk-scoring calculator: interactive form where a learner inputs a hypothetical system's data sensitivity, confidentiality lifetime, and criticality, receiving a calculated risk score with a plain-language justification — direct rehearsal for building the Enterprise Capstone's risk assessment."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 1.1–1.7.\n- Practical assessment: build a risk model scoring 5 hypothetical organizational systems, ranking them by migration urgency.\n- Unlocks: `E2 — Cryptographic Discovery`."
    }
  },
  {
    "id": "track_d_e2_cryptographic_discovery",
    "trackId": "track-d",
    "code": "E2",
    "title": "Cryptographic Discovery",
    "level": "Enterprise",
    "estimatedMinutes": 140,
    "xp": 250,
    "prerequisites": [
      "track_d_e1_quantum_risk_management"
    ],
    "unlocks": "track_d_e3_quantum_readiness_assessment",
    "learningObjectives": [
      "Build a complete cryptographic inventory covering assets, algorithms, certificates, protocols, and applications.",
      "Understand dependency mapping and data-flow mapping as discovery techniques.",
      "Understand asset discovery methodology at organizational scale."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "2.1 Cryptographic Inventory",
        "content": "The foundational artifact of this entire track: a **cryptographic inventory** is a comprehensive record of every cryptographic algorithm, key, certificate, and protocol in use across an organization's systems — without this, none of E1's risk modeling or E5's migration planning can be grounded in reality rather than guesswork."
      },
      {
        "id": "sec-2",
        "title": "2.2 Asset Discovery",
        "content": "The first practical step: identifying what systems, servers, applications, and devices exist across the organization in the first place — a surprisingly difficult problem at enterprise scale due to \"shadow IT\" (unofficial, unregistered systems) and forgotten legacy infrastructure."
      },
      {
        "id": "sec-3",
        "title": "2.3 Algorithm Discovery",
        "content": "Building on B7's TLS/PKI engineering depth, this section covers systematically identifying which cryptographic algorithms (RSA, ECC, AES, and their specific parameters) are actually in use across discovered assets — exactly the technical operation Inba's scanner performs when it connects to a target and reports its detected encryption algorithm."
      },
      {
        "id": "sec-4",
        "title": "2.4 Certificate Discovery",
        "content": "Specifically cataloguing certificates in use: their issuing CA, key algorithm/size, expiration date, and where they're deployed — building directly on B7.6's certificate lifecycle coverage, now applied as a discovery exercise across the whole organization rather than a single system."
      },
      {
        "id": "sec-5",
        "title": "2.5 Protocol Discovery",
        "content": "Identifying which network protocols (TLS versions, SSH configurations, VPN protocols) are actually in use, since protocol version alone can indicate outdated, weaker configurations even before considering the specific algorithms within them — connecting to B6.5 and B6.4's protocol-level engineering coverage."
      },
      {
        "id": "sec-6",
        "title": "2.6 Application Discovery",
        "content": "Extending discovery beyond network-facing cryptography to cryptography embedded directly within application source code — often the hardest category to discover, since it requires source-code or binary analysis rather than simply observing network traffic, and connects to the original Q-CAPS checkpoint's mention of \"controlled source-code cryptographic analysis\" as a scanner capability."
      },
      {
        "id": "sec-7",
        "title": "2.7 Dependency Mapping",
        "content": "Beyond simply listing what's found, **dependency mapping** traces the relationships between discovered assets — which applications depend on which certificates, which services depend on which cryptographic libraries — essential for understanding the true blast radius of migrating (or failing to migrate) any single component."
      },
      {
        "id": "sec-8",
        "title": "2.8 Data-Flow Mapping",
        "content": "Complementing dependency mapping: tracing how sensitive data actually moves through the organization's systems, which directly informs E1.3–1.4's data sensitivity and HNDL risk assessment by showing exactly where and how that data is being transmitted or stored.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Interactive dependency graph: a sample small-organization inventory rendered as a node graph (assets, certificates, applications), where clicking any node highlights its full dependency chain — makes the abstract \"why does this one certificate matter so much\" question visually obvious."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 2.1–2.8.\n- Practical assessment: given a small set of simulated scan results (structured similarly to Inba's Scanner Mission JSON output), compile them into a structured cryptographic inventory with dependency notes.\n- Unlocks: `E3 — Quantum Readiness Assessment`."
    }
  },
  {
    "id": "track_d_e3_quantum_readiness_assessment",
    "trackId": "track-d",
    "code": "E3",
    "title": "Quantum Readiness Assessment",
    "level": "Enterprise",
    "estimatedMinutes": 140,
    "xp": 250,
    "prerequisites": [
      "track_d_e2_cryptographic_discovery"
    ],
    "unlocks": "track_d_e4_crypto_agility",
    "learningObjectives": [
      "Combine system inventory (E2) and cryptographic exposure analysis into a formal risk score.",
      "Understand readiness maturity assessment and prioritization methodology.",
      "Produce migration planning outputs directly usable in E5."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "3.1 System Inventory (Assessment Context)",
        "content": "Building directly on E2.2's asset discovery, this section covers organizing the discovered inventory specifically for assessment purposes — grouping systems by business function and criticality rather than purely technical categorization, so the assessment output is meaningful to both technical and executive audiences."
      },
      {
        "id": "sec-2",
        "title": "3.2 Cryptographic Exposure Analysis",
        "content": "Combining E2's discovered algorithms/certificates/protocols with the quantum threat model from E1 and B8: for each inventoried item, determining its specific quantum exposure — is it RSA/ECC-based (vulnerable to Shor), what key size, and what data does it protect."
      },
      {
        "id": "sec-3",
        "title": "3.3 Risk Scoring",
        "content": "Formalizing E1.7's risk model into a concrete, repeatable scoring methodology applied across the full inventory — producing a numeric or categorical risk score per asset that enables the objective prioritization needed in 3.4, directly mirroring the readiness-score concept in Q-CAPS's own shared data schema (`readiness_score` field)."
      },
      {
        "id": "sec-4",
        "title": "3.4 Prioritization",
        "content": "Using the risk scores from 3.3 to rank migration priority — critical systems with long-lived sensitive data and weak cryptography rank highest; low-criticality systems with already-strong or already-migrated cryptography rank lowest. This prioritized list becomes the primary input to E5's migration sequencing."
      },
      {
        "id": "sec-5",
        "title": "3.5 Readiness Maturity Assessment",
        "content": "Beyond scoring individual assets, this section covers assessing the organization's overall **readiness maturity** — does the organization have crypto-agility already built in (E4), an established discovery process (E2), and governance structures (E6) in place, or is it starting from zero on all fronts. This organizational-capability view is as important as the technical inventory itself for realistic migration planning."
      },
      {
        "id": "sec-6",
        "title": "3.6 Migration Planning (Assessment Output)",
        "content": "Closing the module by formalizing how 3.1–3.5's outputs feed directly into a draft migration plan — the bridge between \"assessment\" (this module) and \"execution\" (E5), ensuring the migration plan that follows is grounded in the actual, discovered state of the organization rather than assumptions.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Readiness dashboard mockup: a sample organizational readiness view combining overall score, per-domain breakdown (crypto inventory completeness, workforce readiness, migration capability), and a prioritized asset list — closely modeled on the actual readiness profile structure described in the Q-CAPS master checkpoint's Organizational Readiness section."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 3.1–3.6.\n- Practical assessment: using the cryptographic inventory built in E2's assessment, score and prioritize the assets, then draft a one-page readiness summary suitable for an executive audience.\n- Unlocks: `E4 — Crypto-Agility`."
    }
  },
  {
    "id": "track_d_e4_crypto_agility",
    "trackId": "track-d",
    "code": "E4",
    "title": "Crypto-Agility",
    "level": "Enterprise",
    "estimatedMinutes": 130,
    "xp": 250,
    "prerequisites": [
      "track_d_e3_quantum_readiness_assessment"
    ],
    "unlocks": "track_d_e5_enterprise_pqc_migration",
    "learningObjectives": [
      "Understand algorithm abstraction and configuration-driven algorithm selection as architectural patterns.",
      "Understand key-lifecycle, certificate, and protocol agility as applied concepts.",
      "Apply crypto-agility principles to both software architecture and hardware considerations."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "4.1 Algorithm Abstraction",
        "content": "The foundational architectural pattern for crypto-agility, first introduced conceptually in core Module 3.6 and B7.11: designing software so cryptographic operations are called through an abstract interface, never hardcoding a specific algorithm's implementation details directly into business logic — the single most important design decision determining how painful (or painless) a future algorithm swap will be."
      },
      {
        "id": "sec-2",
        "title": "4.2 Crypto APIs",
        "content": "Practical implementation of algorithm abstraction (4.1): well-designed cryptographic APIs (building on C9.8/C11.7's secure API design principles) that expose operations like \"encrypt,\" \"sign,\" or \"establish a shared key\" without the calling code needing to know or care which specific algorithm is used underneath."
      },
      {
        "id": "sec-3",
        "title": "4.3 Configuration-Driven Algorithms",
        "content": "Extending 4.1–4.2: algorithm selection controlled by external configuration (a config file, database setting, or policy service) rather than compiled directly into code — enabling an algorithm swap via a configuration change and redeployment, rather than a full code rewrite."
      },
      {
        "id": "sec-4",
        "title": "4.4 Key Lifecycle Abstraction",
        "content": "Applying crypto-agility specifically to key management (building on B7.11 and C11.4): abstracting key generation, storage, and rotation behind consistent interfaces so that migrating to new key types (e.g., larger PQC keys) doesn't require redesigning the surrounding key-management infrastructure."
      },
      {
        "id": "sec-5",
        "title": "4.5 Certificate Agility",
        "content": "Applying crypto-agility to PKI specifically (building on B7.5–7.6 and C10.11): architecture that supports issuing, deploying, and rotating certificates using multiple algorithm types concurrently — a direct enabler of the hybrid certificate approach discussed in core Module 3.6 and demonstrated hands-on in B11.6."
      },
      {
        "id": "sec-6",
        "title": "4.6 Protocol Agility",
        "content": "Extending crypto-agility to the protocol layer: systems and infrastructure capable of negotiating and supporting multiple protocol versions and cipher suites simultaneously, enabling gradual migration without a disruptive \"flag day\" cutover — directly relevant to avoiding the protocol downgrade risks discussed in C10.9."
      },
      {
        "id": "sec-7",
        "title": "4.7 Software Architecture (Crypto-Agility)",
        "content": "Synthesizing 4.1–4.6 into concrete software architecture guidance: where in a system's architecture cryptographic abstraction boundaries should live, and how to retrofit agility into existing systems that weren't originally designed with it — a common, difficult real-world scenario most organizations actually face."
      },
      {
        "id": "sec-8",
        "title": "4.8 Hardware Considerations",
        "content": "Extending crypto-agility considerations to hardware: HSMs (B7.10) and embedded devices (C9.9) that may have fixed, difficult-to-update cryptographic capabilities — a genuine architectural constraint that pure software agility cannot fully solve, requiring careful hardware lifecycle and procurement planning (connecting to E6's vendor requirements).\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** \"Before/after\" architecture diagram: a tightly-coupled system where RSA is hardcoded throughout, versus the same system refactored with a crypto-agility abstraction layer — visually demonstrates why the upfront architectural investment pays off during a migration event."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 4.1–4.8.\n- Practical assessment: given a described system with hardcoded cryptography, propose a refactored architecture introducing algorithm abstraction, and identify remaining hardware-level constraints.\n- Unlocks: `E5 — Enterprise PQC Migration`."
    }
  },
  {
    "id": "track_d_e5_enterprise_pqc_migration",
    "trackId": "track-d",
    "code": "E5",
    "title": "Enterprise PQC Migration",
    "level": "Enterprise",
    "estimatedMinutes": 160,
    "xp": 250,
    "prerequisites": [
      "track_d_e4_crypto_agility"
    ],
    "unlocks": "track_d_e6_governance",
    "learningObjectives": [
      "Execute the full Discover → Inventory → Classify → Risk-Rank → Select PQC → Prototype → Benchmark → Pilot → Hybrid Migration → Production Rollout → Monitor → Retire sequence.",
      "Understand each phase's specific deliverables and how they connect to earlier tracks' technical content."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "5.1 Discover",
        "content": "The migration process begins with E2's asset discovery methodology, applied comprehensively across the organization — this phase's output is a raw list of systems and cryptographic touchpoints, not yet organized or analyzed."
      },
      {
        "id": "sec-2",
        "title": "5.2 Inventory",
        "content": "Organizing 5.1's discovery output into the structured cryptographic inventory covered fully in E2.1 — every algorithm, certificate, protocol, and application catalogued and cross-referenced via dependency mapping (E2.7)."
      },
      {
        "id": "sec-3",
        "title": "5.3 Classify",
        "content": "Categorizing inventoried assets by business function, data sensitivity, and confidentiality lifetime (E1.3) — the classification work that makes objective risk-ranking (5.4) possible rather than relying on subjective judgment calls."
      },
      {
        "id": "sec-4",
        "title": "5.4 Risk-Rank",
        "content": "Applying E3.3's risk scoring methodology to the classified inventory, producing the prioritized asset list (E3.4) that determines migration sequencing for every subsequent phase."
      },
      {
        "id": "sec-5",
        "title": "5.5 Select PQC",
        "content": "For each prioritized asset, selecting the appropriate PQC algorithm(s) using B9.8/B10.5's algorithm-selection guidance — ML-KEM for key exchange, ML-DSA for general signatures, SLH-DSA where conservative diversification is specifically required."
      },
      {
        "id": "sec-6",
        "title": "5.6 Prototype",
        "content": "Building small-scale proof-of-concept implementations of the selected algorithms (5.5) in a controlled test environment — applying C9's implementation engineering practices before any production commitment, catching integration issues early and cheaply."
      },
      {
        "id": "sec-7",
        "title": "5.7 Benchmark",
        "content": "Extending B11.4/B11.7's hands-on benchmarking methodology to the organization's actual prototyped systems (5.6) — measuring real performance impact (latency, throughput, resource usage) specific to the organization's actual infrastructure and traffic patterns, not just generic published figures."
      },
      {
        "id": "sec-8",
        "title": "5.8 Pilot",
        "content": "Deploying the benchmarked PQC implementation (5.7) to a limited, carefully monitored subset of real production traffic or systems — validating real-world behavior and interoperability (B10.6, C9.11) before full rollout, and providing an opportunity to catch issues with limited blast radius."
      },
      {
        "id": "sec-9",
        "title": "5.9 Hybrid Migration",
        "content": "For most organizations, the actual production migration path runs through **hybrid cryptography** (core Module 3.6, B11.6, C11.9) rather than a direct cutover — deploying classical+PQC combined algorithms in production, maintaining security even if unexpected issues emerge with the newer PQC components."
      },
      {
        "id": "sec-10",
        "title": "5.10 Production Rollout",
        "content": "Scaling the piloted (5.8) and hybrid-validated (5.9) migration from limited deployment to the full prioritized asset list (5.4), following the sequencing established by risk-ranking — the highest-risk, highest-priority systems typically migrate first, though practical dependencies (E2.7) may require adjusting pure risk-order sequencing."
      },
      {
        "id": "sec-11",
        "title": "5.11 Monitor",
        "content": "Post-migration, continuously monitoring migrated systems for performance regressions, interoperability failures, and — critically — verifying the migration is actually achieving its intended risk reduction, feeding back into the readiness assessment process (E3) as an ongoing cycle rather than a one-time project."
      },
      {
        "id": "sec-12",
        "title": "5.12 Retire Vulnerable Cryptography",
        "content": "The final phase, often delayed too long in practice: once hybrid deployment (5.9) has proven stable and organizational confidence in the PQC implementation is established, formally retiring the classical-only fallback — completing the transition from \"hedged\" to \"fully quantum-safe\" for that asset.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Interactive migration pipeline tracker: a Kanban-style board showing the 12 phases (5.1–5.12) with a sample set of organizational assets moving through them — lets the learner visualize migration as an ongoing, staged process rather than a single event."
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 5.1–5.12.\n- Practical assessment: this module's 12-phase process is the direct blueprint for the Architect Capstone's migration strategy component.\n- Unlocks: `E6 — Governance`."
    }
  },
  {
    "id": "track_d_e6_governance",
    "trackId": "track-d",
    "code": "E6",
    "title": "Governance",
    "level": "Enterprise",
    "estimatedMinutes": 130,
    "xp": 250,
    "prerequisites": [
      "track_d_e5_enterprise_pqc_migration"
    ],
    "unlocks": "PQCTP Program Completion",
    "learningObjectives": [
      "Establish quantum-readiness and cryptographic policy at an organizational level.",
      "Understand risk ownership, vendor requirements, and procurement considerations for PQC readiness.",
      "Understand compliance, architecture review, business continuity, and incident response as ongoing governance functions."
    ],
    "sections": [
      {
        "id": "sec-1",
        "title": "6.1 Quantum-Readiness Policy",
        "content": "Formalizing everything covered in E1–E5 into organizational policy: a documented commitment to quantum-readiness objectives, timelines, and accountability — turning a technical migration project into an institutionalized, ongoing organizational priority that outlasts any single project team or budget cycle."
      },
      {
        "id": "sec-2",
        "title": "6.2 Cryptographic Policy",
        "content": "A specific policy layer governing which algorithms, key sizes, and configurations are approved for use across the organization (directly informed by B10.5 and E5.5's algorithm-selection guidance) — the governance mechanism ensuring crypto-agility (E4) and migration progress (E5) don't erode over time as new systems are built without oversight."
      },
      {
        "id": "sec-3",
        "title": "6.3 Risk Ownership",
        "content": "Assigning clear organizational accountability for quantum-readiness risk (E1, E3) — without a named owner, even a well-designed risk model and migration plan tends to stall, since no single person or team is accountable for driving it forward against competing organizational priorities."
      },
      {
        "id": "sec-4",
        "title": "6.4 Vendor Requirements",
        "content": "Extending E1.6's third-party dependency coverage into formal governance: requiring vendors and partners to meet defined cryptographic and PQC-readiness standards as a condition of doing business, closing a risk gap that internal migration efforts alone cannot address."
      },
      {
        "id": "sec-5",
        "title": "6.5 Procurement",
        "content": "Embedding cryptographic and PQC-readiness requirements directly into procurement processes for new hardware (connecting to E4.8's hardware considerations) and software — ensuring new systems entering the organization are crypto-agile and PQC-capable from day one, rather than adding to future migration debt."
      },
      {
        "id": "sec-6",
        "title": "6.6 Compliance",
        "content": "Connecting quantum-readiness governance to applicable regulatory and industry compliance requirements — an increasingly common driver in regulated industries (finance, healthcare, government) where PQC migration timelines may become externally mandated rather than purely internally motivated."
      },
      {
        "id": "sec-7",
        "title": "6.7 Architecture Review",
        "content": "Establishing a formal review process (informed by E4's crypto-agility architecture principles) ensuring new system designs are evaluated for crypto-agility and PQC-readiness before deployment — a governance checkpoint preventing new instances of the exact hardcoded-cryptography problem E4.7 describes retrofitting."
      },
      {
        "id": "sec-8",
        "title": "6.8 Business Continuity",
        "content": "Ensuring migration activities (E5) are planned and executed without introducing unacceptable operational risk — connecting to E5.8's piloting approach and E5.11's monitoring phase as the practical mechanisms that protect business continuity during an active migration."
      },
      {
        "id": "sec-9",
        "title": "6.9 Incident Response",
        "content": "Extending A4.8's foundational incident-response introduction to quantum-specific scenarios: what an organization's response process looks like if a cryptographic weakness is discovered in production (whether classical or PQC), or if evidence of HNDL-style data harvesting (E1.4) is detected — ensuring the organization has a rehearsed response plan, not an improvised one.\n\n\n---",
        "interactiveCallout": "**🎨 Interactive/Visual Requirement:** Governance framework diagram: policy (6.1–6.2) → ownership (6.3) → external controls (6.4–6.6) → internal controls (6.7) → operational resilience (6.8–6.9), shown as a connected framework rather than a flat list — helps learners see governance as a coherent system rather than disconnected checklist items."
      },
      {
        "id": "sec-10",
        "title": "Enterprise / Architect Capstone",
        "content": "Produce an enterprise quantum-readiness assessment and multi-year quantum-safe migration strategy, synthesizing the entire track:\n- **Risk** (E1) and **Discovery/Inventory** (E2) establish the factual baseline.\n- **Readiness Assessment** (E3) scores and prioritizes.\n- **Crypto-Agility** (E4) architecture underpins the technical approach.\n- **Migration** (E5)'s 12-phase process provides the execution roadmap.\n- **Governance** (E6) ensures the strategy is institutionally sustainable, not a one-time project.\n\nPresent the final deliverable covering assets, cryptography, network protocols, PKI, certificates, applications, vendors, governance, architecture, risks, and measurable milestones — with technical, risk, cost, and business justification.\n\n**Certificate awarded on completion: QSA — Quantum Security Architect Certificate.**\n\n---"
      }
    ],
    "wrapUp": {
      "summary": "- Knowledge check quiz covering sections 6.1–6.9.\n- Practical assessment: this module's content directly completes the governance component of the Architect Capstone described above.\n- Completion of Track D + Capstone: full progression through the **Shared Professional Core** and eligibility for the final **PQCTP — Professional Quantum Computing & Quantum-Safe Technology Professional** certification, the program's highest level."
    }
  }
];
