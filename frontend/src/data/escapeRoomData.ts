// Generated from content/Labs/escape_room_scenarios.json
export interface EscapeScenarioChoice {
  id: string;
  text: string;
}

export interface EscapeRoomScenario {
  id: string;
  title: string;
  module_id: string;
  section_id: string;
  difficulty: 'novice' | 'intermediate' | 'professional' | 'expert' | 'quantum_expert';
  setup: string;
  prompt: string;
  choices: EscapeScenarioChoice[];
  badge_awarded: string;
  mission_xp_awarded: number;
}

export const escapeRoomScenarios: EscapeRoomScenario[] = [
  {
    "id": "escape-1-hndl",
    "title": "The Patient Records Leak",
    "module_id": "track_a_a8_pqc_mitigation",
    "section_id": "sec-3",
    "difficulty": "novice",
    "setup": "You're the security lead at a hospital. Your patient records are encrypted with RSA-2048 and must remain confidential for 25 years per regulation. An intelligence report indicates a foreign actor has been silently intercepting and storing your encrypted traffic for the past year.",
    "prompt": "A threat actor has stolen your encrypted data today and will decrypt it in 5-10 years using a quantum computer. Which mitigation strategy do you apply?",
    "choices": [
      {
        "id": "a",
        "text": "Do nothing — RSA-2048 hasn't been broken yet, so there's no current risk."
      },
      {
        "id": "b",
        "text": "Begin migrating long-lifetime data flows to hybrid classical+PQC encryption (e.g., ECDHE + ML-KEM) immediately, prioritized by data sensitivity and lifetime."
      },
      {
        "id": "c",
        "text": "Switch immediately to pure ML-KEM with no classical fallback, since PQC is 'quantum-safe.'"
      }
    ],
    "badge_awarded": "HNDL Responder",
    "mission_xp_awarded": 50
  },
  {
    "id": "escape-2-cert-chain",
    "title": "The Cracked Chain of Trust",
    "module_id": "track_a_a8_pqc_mitigation",
    "section_id": "sec-6",
    "difficulty": "professional",
    "setup": "Your organization's root CA still signs certificates using RSA-2048. A Q-CAPS scan flags this as a long-term migration risk across 40 downstream systems.",
    "prompt": "You have limited migration budget this quarter. What's the most crypto-agile first move?",
    "choices": [
      {
        "id": "a",
        "text": "Re-issue all 40 downstream certificates individually with ML-DSA signatures, leaving the root CA unchanged."
      },
      {
        "id": "b",
        "text": "Pilot a hybrid root CA (RSA + ML-DSA signatures) first, then cascade migration down the chain in priority order of asset criticality."
      },
      {
        "id": "c",
        "text": "Ignore the root CA and only patch the 5 lowest-criticality systems first, since they're 'easiest.'"
      }
    ],
    "badge_awarded": "Crypto-Agility Architect",
    "mission_xp_awarded": 75
  },
  {
    "id": "escape-3-symmetric",
    "title": "The Overlooked AES Key",
    "module_id": "track_a_a8_pqc_mitigation",
    "section_id": "sec-2",
    "difficulty": "novice",
    "setup": "A Q-CAPS scan of your file storage system shows AES-128 encryption protecting archived financial records with a 10-year retention requirement.",
    "prompt": "Grover's algorithm roughly halves effective symmetric key strength against a quantum attacker. What should you do?",
    "choices": [
      {
        "id": "a",
        "text": "Leave it as-is — AES-128 is still considered 'strong' classically."
      },
      {
        "id": "b",
        "text": "Upgrade to AES-256 for all newly stored data with long retention, and prioritize re-encrypting the most sensitive existing archives."
      },
      {
        "id": "c",
        "text": "Switch to ML-KEM for the archived files instead of AES."
      }
    ],
    "badge_awarded": "Symmetric Defender",
    "mission_xp_awarded": 40
  },
  {
    "id": "escape-4-superposition-panic",
    "title": "The Spinning Coin Interview",
    "module_id": "track_a_a6_quantum_foundations",
    "section_id": "sec-3",
    "difficulty": "novice",
    "setup": "During a mock technical interview, the interviewer asks you to explain, in one sentence a non-technical manager would understand, why a qubit isn't 'just a faster classical bit.'",
    "prompt": "Which explanation correctly captures superposition without overclaiming what it means?",
    "choices": [
      {
        "id": "a",
        "text": "\"A qubit can be 0 and 1 at the same time, so quantum computers can try every answer simultaneously for free.\""
      },
      {
        "id": "b",
        "text": "\"A qubit holds a combination of 0 and 1 until measured, like a spinning coin — that's what lets certain carefully designed algorithms explore possibilities far more efficiently than a classical computer.\""
      },
      {
        "id": "c",
        "text": "\"A qubit is just a bit that runs at a higher clock speed.\""
      }
    ],
    "badge_awarded": "Quantum Beginner",
    "mission_xp_awarded": 30
  },
  {
    "id": "escape-5-grover-vs-shor-budget",
    "title": "The Migration Budget Meeting",
    "module_id": "track_b_b8_quantum_threats",
    "section_id": "sec-4",
    "difficulty": "professional",
    "setup": "Your organization has limited budget this year for quantum-readiness work. Leadership asks you to justify why RSA/ECC migration gets more urgency and funding than simply doubling AES key lengths everywhere.",
    "prompt": "What's the technically accurate justification?",
    "choices": [
      {
        "id": "a",
        "text": "\"They're equally urgent — Shor's and Grover's algorithms pose the same level of threat to both.\""
      },
      {
        "id": "b",
        "text": "\"RSA/ECC face a full break via Shor's algorithm (exponential speedup), while AES only faces a weakening via Grover's algorithm (quadratic speedup, fixed by simply doubling key length) — so RSA/ECC migration to entirely new algorithms is the harder, more urgent problem.\""
      },
      {
        "id": "c",
        "text": "\"Neither is a real concern until a quantum computer capable of breaking RSA-2048 actually exists.\""
      }
    ],
    "badge_awarded": "Risk Prioritizer",
    "mission_xp_awarded": 70
  },
  {
    "id": "escape-6-hybrid-mode-flaw",
    "title": "The Combiner Bug Report",
    "module_id": "track_c_c10_pqc_attack_surface",
    "section_id": "sec-10",
    "difficulty": "quantum_expert",
    "setup": "A security researcher reports that your organization's hybrid TLS handshake (ECDHE + ML-KEM) might have a subtle weakness — not in either individual algorithm, but in how the two shared secrets are combined into the final session key.",
    "prompt": "What is the technically correct response?",
    "choices": [
      {
        "id": "a",
        "text": "\"That's impossible — if both ECDHE and ML-KEM are individually secure, the combination must automatically be secure too.\""
      },
      {
        "id": "b",
        "text": "\"Treat this seriously — hybrid combiner constructions require their own dedicated security analysis, separate from validating each individual algorithm.\""
      },
      {
        "id": "c",
        "text": "\"Immediately drop ML-KEM and revert to classical-only ECDHE to eliminate the risk.\""
      }
    ],
    "badge_awarded": "Hybrid Mode Auditor",
    "mission_xp_awarded": 90
  },
  {
    "id": "escape-7-executive-buyin",
    "title": "The Boardroom Pitch",
    "module_id": "track_d_e1_quantum_risk_management",
    "section_id": "sec-1",
    "difficulty": "professional",
    "setup": "You have five minutes with the executive board to secure budget for a multi-year PQC migration. One board member says: \"Quantum computers that can break encryption don't exist yet — why should we spend money on this now?\"",
    "prompt": "What is the single most effective response, per this program's risk framework?",
    "choices": [
      {
        "id": "a",
        "text": "\"You're right, let's revisit this in a few years once quantum computers are more advanced.\""
      },
      {
        "id": "b",
        "text": "\"The attack window opened the day our sensitive data was recorded, not the day the quantum computer arrives — and given how long enterprise migration takes, waiting means we're already behind.\""
      },
      {
        "id": "c",
        "text": "\"Every one of our systems is critically at risk right now and could be breached today.\""
      }
    ],
    "badge_awarded": "Executive Communicator",
    "mission_xp_awarded": 70
  },
  {
    "id": "escape-8-a1-slow-report",
    "title": "The 40-Minute Report",
    "module_id": "track_a_a1_computing_foundations",
    "section_id": "sec-3",
    "difficulty": "novice",
    "setup": "A nightly report job takes 40 minutes. Profiling shows the CPU is mostly idle: for every one of 2 million records the program re-reads the same 200 MB lookup file from the SSD.",
    "prompt": "What is the most effective first fix?",
    "choices": [
      {
        "id": "a",
        "text": "Buy a CPU with twice the clock speed."
      },
      {
        "id": "b",
        "text": "Load the lookup file into memory once at the start and read it from there."
      },
      {
        "id": "c",
        "text": "Compress the lookup file so it is smaller on disk."
      }
    ],
    "badge_awarded": "Performance Detective",
    "mission_xp_awarded": 30
  },
  {
    "id": "escape-9-a2-bucket-skew",
    "title": "The Lopsided Buckets",
    "module_id": "track_a_a2_mathematics_foundations",
    "section_id": "pk-modular",
    "difficulty": "novice",
    "setup": "A developer spreads customer records over 10 database shards with `shard = customer_id % 10`. Every customer id is issued as a multiple of 10 (1000, 1010, 1020, ...). One shard is overloaded and nine are empty.",
    "prompt": "Why does this happen and what is the right fix?",
    "choices": [
      {
        "id": "a",
        "text": "The ids are random, so the overload is bad luck; add more shards."
      },
      {
        "id": "b",
        "text": "Every id shares the factor 10 with the modulus, so the remainder is always 0; use a modulus that shares no factor with the ids, such as a prime like 11 or 97, or hash the id first."
      },
      {
        "id": "c",
        "text": "Switch to `customer_id // 10`."
      }
    ],
    "badge_awarded": "Modulus Mechanic",
    "mission_xp_awarded": 40
  },
  {
    "id": "escape-10-a3-one-way-door",
    "title": "The One-Way Door",
    "module_id": "track_a_a3_networking_foundations",
    "section_id": "sec-9",
    "difficulty": "novice",
    "setup": "Your web server is in a cloud subnet. The firewall rule (security group) allows inbound TCP 443. The subnet's network ACL, which is stateless, allows inbound 443 and allows outbound only to port 443. Browsers connect but pages never load.",
    "prompt": "What is wrong?",
    "choices": [
      {
        "id": "a",
        "text": "The network ACL is stateless: the replies go from port 443 to the client's ephemeral port (1024 to 65535), and the outbound rule blocks them. Allow outbound ephemeral ports."
      },
      {
        "id": "b",
        "text": "Open every inbound port so nothing can be blocked."
      },
      {
        "id": "c",
        "text": "Disable the security group, because only the ACL matters."
      }
    ],
    "badge_awarded": "Packet Pathfinder",
    "mission_xp_awarded": 40
  },
  {
    "id": "escape-11-a4-leaked-hashes",
    "title": "The Leaked Password Table",
    "module_id": "track_a_a4_cybersecurity_foundations",
    "section_id": "sec-2",
    "difficulty": "novice",
    "setup": "Your user database is leaked. Passwords were stored as unsalted SHA-256 hashes. Attackers will try common passwords against the hashes.",
    "prompt": "Beyond forcing a password reset, how should passwords be stored from now on?",
    "choices": [
      {
        "id": "a",
        "text": "Use a slow, salted password hash such as Argon2id, scrypt, bcrypt or PBKDF2 with a per-user salt."
      },
      {
        "id": "b",
        "text": "Switch to SHA-512, which is longer and therefore stronger."
      },
      {
        "id": "c",
        "text": "Encrypt the passwords with AES and keep the key in the same database."
      }
    ],
    "badge_awarded": "Credential Guardian",
    "mission_xp_awarded": 50
  },
  {
    "id": "escape-12-a5-reused-nonce",
    "title": "The Constant Nonce",
    "module_id": "track_a_a5_cryptography_foundations",
    "section_id": "pk-modes",
    "difficulty": "novice",
    "setup": "A developer encrypts every message with AES-GCM under one key and a hard-coded nonce of twelve zero bytes 'so that messages are reproducible for testing'. The service is in production.",
    "prompt": "What is the correct judgement?",
    "choices": [
      {
        "id": "a",
        "text": "It is fine: the key is secret, so the nonce does not matter."
      },
      {
        "id": "b",
        "text": "Hash the zero nonce first so it looks random."
      },
      {
        "id": "c",
        "text": "It is a critical flaw: use a fresh unique nonce for every message (a counter or 96 random bits with a bounded message count) and rotate the key."
      }
    ],
    "badge_awarded": "Nonce Keeper",
    "mission_xp_awarded": 50
  },
  {
    "id": "escape-13-a7-missing-measure",
    "title": "The Empty Histogram",
    "module_id": "track_a_a7_first_quantum_programming",
    "section_id": "sec-4",
    "difficulty": "novice",
    "setup": "A learner builds a Bell-state circuit in Qiskit (Hadamard on qubit 0, CNOT from 0 to 1), runs it on a simulator with 1,000 shots and gets no useful counts, only an empty or error result. They expected about 500 results of 00 and 500 of 11.",
    "prompt": "What is the fix?",
    "choices": [
      {
        "id": "a",
        "text": "Raise the shots to 100,000."
      },
      {
        "id": "b",
        "text": "Add more Hadamard gates until the output appears."
      },
      {
        "id": "c",
        "text": "Add measurement of both qubits into classical bits, then run it again; expect roughly 50% 00 and 50% 11."
      }
    ],
    "badge_awarded": "Circuit Debugger",
    "mission_xp_awarded": 40
  },
  {
    "id": "escape-14-b1-non-unitary",
    "title": "The Almost-Gate",
    "module_id": "track_b_b1_advanced_math_for_quantum",
    "section_id": "sec-5",
    "difficulty": "intermediate",
    "setup": "A colleague proposes a one-qubit 'gate' with the matrix [[1, 1], [0, 1]] and says it is valid because all entries are real numbers.",
    "prompt": "Is it a valid quantum gate?",
    "choices": [
      {
        "id": "a",
        "text": "Yes: any real matrix is a valid gate."
      },
      {
        "id": "b",
        "text": "No: a gate must be unitary (U-dagger times U equals the identity), and this matrix stretches the vector (1, 1), so it is not."
      },
      {
        "id": "c",
        "text": "Yes, as long as its determinant is 1."
      }
    ],
    "badge_awarded": "Unitary Inspector",
    "mission_xp_awarded": 55
  },
  {
    "id": "escape-15-b2-cloning-pitch",
    "title": "The Backup Qubit",
    "module_id": "track_b_b2_quantum_information",
    "section_id": "sec-8",
    "difficulty": "intermediate",
    "setup": "A vendor sells a 'quantum backup appliance' that copies an unknown qubit state onto spare qubits so the original can be restored if it decoheres.",
    "prompt": "What is the correct assessment?",
    "choices": [
      {
        "id": "a",
        "text": "Reject the claim: the no-cloning theorem forbids copying an unknown quantum state; error correction instead spreads one logical qubit across many physical qubits without copying it."
      },
      {
        "id": "b",
        "text": "Accept it: the copies are possible but only for entangled qubits."
      },
      {
        "id": "c",
        "text": "Accept it if the appliance uses many copies to average out the noise."
      }
    ],
    "badge_awarded": "No-Cloning Skeptic",
    "mission_xp_awarded": 60
  },
  {
    "id": "escape-16-b3-grover-claim",
    "title": "The One-Millisecond Search",
    "module_id": "track_b_b3_quantum_algorithms",
    "section_id": "sec-4",
    "difficulty": "intermediate",
    "setup": "A vendor says a quantum computer will search an unsorted database of one billion records 'instantly' using Grover's algorithm.",
    "prompt": "What does Grover's algorithm actually promise?",
    "choices": [
      {
        "id": "a",
        "text": "An exponential speedup: the search takes a number of steps proportional to log of the size."
      },
      {
        "id": "b",
        "text": "A quadratic speedup: about the square root of N queries, roughly 31,600 for a billion records, plus overhead for error correction, which is a large gain but not an instant one."
      },
      {
        "id": "c",
        "text": "No speedup, because a database is classical data."
      }
    ],
    "badge_awarded": "Speedup Auditor",
    "mission_xp_awarded": 60
  },
  {
    "id": "escape-17-b4-noisy-bell",
    "title": "The Stray Counts",
    "module_id": "track_b_b4_quantum_programming",
    "section_id": "sec-5",
    "difficulty": "intermediate",
    "setup": "On a noisy simulator a Bell circuit with 4,000 shots gives about 47% 00, 47% 11, 3% 01 and 3% 10. A colleague says the circuit has a bug because 01 and 10 should never appear.",
    "prompt": "What is the right response?",
    "choices": [
      {
        "id": "a",
        "text": "Reduce the number of shots until 01 and 10 disappear."
      },
      {
        "id": "b",
        "text": "Treat it as a bug and rebuild the circuit."
      },
      {
        "id": "c",
        "text": "Run the same circuit on a noise-free simulator, which should show only 00 and 11; the small 01 and 10 counts are the expected effect of the noise model, and mitigation or a better backend is the response."
      }
    ],
    "badge_awarded": "Noise Reader",
    "mission_xp_awarded": 60
  },
  {
    "id": "escape-18-b5-platform-pick",
    "title": "The Platform Pick",
    "module_id": "track_b_b5_quantum_hardware",
    "section_id": "sec-2",
    "difficulty": "intermediate",
    "setup": "A research group needs a small processor for an experiment that depends on long coherence times and on any qubit being able to interact with any other qubit in the register.",
    "prompt": "Which platform fits best of the three below?",
    "choices": [
      {
        "id": "a",
        "text": "Superconducting qubits, because their gates are the slowest and therefore most precise."
      },
      {
        "id": "b",
        "text": "Trapped ions: long coherence times and effective all-to-all connectivity in a single chain, at the price of slower gates."
      },
      {
        "id": "c",
        "text": "Photonic qubits, because they interact strongly with each other."
      }
    ],
    "badge_awarded": "Platform Strategist",
    "mission_xp_awarded": 65
  },
  {
    "id": "escape-19-b6-flat-network",
    "title": "The Flat Network",
    "module_id": "track_b_b6_network_security_engineering",
    "section_id": "sec-9",
    "difficulty": "intermediate",
    "setup": "An attacker compromises one employee laptop and within an hour reaches the finance database, because the internal network is flat and trusts every internal address.",
    "prompt": "What architectural change addresses the root cause?",
    "choices": [
      {
        "id": "a",
        "text": "Buy a bigger perimeter firewall."
      },
      {
        "id": "b",
        "text": "Segment the network and apply zero trust: least-privilege access per workload, authentication and authorisation on every request, no trust based on network location."
      },
      {
        "id": "c",
        "text": "Hide the finance database by changing its port number."
      }
    ],
    "badge_awarded": "Segmentation Lead",
    "mission_xp_awarded": 65
  },
  {
    "id": "escape-20-b7-ecdsa-nonce",
    "title": "The Repeated k",
    "module_id": "track_b_b7_advanced_cryptography",
    "section_id": "sec-2",
    "difficulty": "intermediate",
    "setup": "An audit of a signing service finds two ECDSA signatures on different documents that share the same r value, which means the same per-signature nonce k was used twice.",
    "prompt": "What does this mean?",
    "choices": [
      {
        "id": "a",
        "text": "Nothing: only those two documents are affected."
      },
      {
        "id": "b",
        "text": "The private key can be computed from the two signatures; treat it as compromised, revoke and rotate it, and generate nonces deterministically (RFC 6979 style) or from a verified random source."
      },
      {
        "id": "c",
        "text": "Switch to a longer hash and keep the same key."
      }
    ],
    "badge_awarded": "Signature Auditor",
    "mission_xp_awarded": 75
  },
  {
    "id": "escape-21-b9-wrong-family",
    "title": "The Wrong Family",
    "module_id": "track_b_b9_pqc_fundamentals",
    "section_id": "sec-3",
    "difficulty": "intermediate",
    "setup": "A design document says 'we will replace our RSA code-signing with ML-KEM, since PQC replaces RSA'.",
    "prompt": "What is the correction?",
    "choices": [
      {
        "id": "a",
        "text": "ML-KEM is a key-encapsulation mechanism, not a signature scheme; code signing needs a post-quantum signature such as ML-DSA (or SLH-DSA)."
      },
      {
        "id": "b",
        "text": "Fine as written: ML-KEM can sign by encrypting a hash of the file."
      },
      {
        "id": "c",
        "text": "Use ML-KEM for signing and ML-DSA for key exchange."
      }
    ],
    "badge_awarded": "Algorithm Matchmaker",
    "mission_xp_awarded": 70
  },
  {
    "id": "escape-22-b10-standards-memo",
    "title": "The Pre-Standard Claim",
    "module_id": "track_b_b10_pqc_standards",
    "section_id": "sec-6",
    "difficulty": "intermediate",
    "setup": "A vendor's data sheet says the product 'implements CRYSTALS-Kyber, round 3 of the NIST competition' and calls it NIST-compliant.",
    "prompt": "What should your procurement requirement say?",
    "choices": [
      {
        "id": "a",
        "text": "Accept it: Kyber and ML-KEM are the same thing."
      },
      {
        "id": "b",
        "text": "Require ML-KEM as specified in FIPS 203, ask for algorithm and module validation evidence from NIST's lists, and a statement of how pre-standard versions are handled."
      },
      {
        "id": "c",
        "text": "Ask only for the key size."
      }
    ],
    "badge_awarded": "Standards Scholar II",
    "mission_xp_awarded": 70
  },
  {
    "id": "escape-23-b11-silent-decaps",
    "title": "The Silent Decapsulation",
    "module_id": "track_b_b11_intermediate_pqc_labs",
    "section_id": "sec-2",
    "difficulty": "intermediate",
    "setup": "In a lab, an engineer flips one bit of an ML-KEM ciphertext and calls decapsulate. No error is raised, and the engineer concludes the library is broken.",
    "prompt": "What is actually happening?",
    "choices": [
      {
        "id": "a",
        "text": "The library is broken and should have raised an exception."
      },
      {
        "id": "b",
        "text": "ML-KEM uses implicit rejection: a bad ciphertext yields a different, pseudorandom secret instead of an error, so the failure shows up later, for example as an authentication failure of the data channel."
      },
      {
        "id": "c",
        "text": "The flipped bit was in an unused part of the ciphertext, so nothing changed."
      }
    ],
    "badge_awarded": "Lab Debugger",
    "mission_xp_awarded": 100
  },
  {
    "id": "escape-24-c1-same-density",
    "title": "The Indistinguishable Ensembles",
    "module_id": "track_c_c1_advanced_quantum_information",
    "section_id": "sec-2",
    "difficulty": "expert",
    "setup": "Alice claims she can tell whether a qubit source is a 50/50 mixture of |0> and |1> or a 50/50 mixture of |+> and |-> by examining its density matrix.",
    "prompt": "Is she right?",
    "choices": [
      {
        "id": "a",
        "text": "Yes: the Z-basis mixture has a diagonal density matrix and the X-basis one has off-diagonal terms."
      },
      {
        "id": "b",
        "text": "No: both ensembles have the density matrix I/2 (the maximally mixed state), so no measurement can distinguish them."
      },
      {
        "id": "c",
        "text": "Yes, because their purities differ."
      }
    ],
    "badge_awarded": "Density Theorist",
    "mission_xp_awarded": 80
  },
  {
    "id": "escape-25-c2-shor-claim",
    "title": "The Hundred-Qubit Claim",
    "module_id": "track_c_c2_advanced_quantum_algorithms",
    "section_id": "sec-1",
    "difficulty": "expert",
    "setup": "A board slide states: 'With 100 qubits, a quantum computer can break RSA-2048 next year, so we must act this week.'",
    "prompt": "How should a technical adviser respond?",
    "choices": [
      {
        "id": "a",
        "text": "Agree: 100 qubits is enough for Shor's algorithm."
      },
      {
        "id": "b",
        "text": "Correct the claim without dismissing the risk: published estimates (Gidney, 2025) put RSA-2048 at under about a million noisy physical qubits with error correction, far beyond 100 qubits, but the trend and harvest-now-decrypt-later risk justify planning now."
      },
      {
        "id": "c",
        "text": "Say it is impossible for any quantum computer ever, so no action is needed."
      }
    ],
    "badge_awarded": "Resource Estimator",
    "mission_xp_awarded": 85
  },
  {
    "id": "escape-26-c3-threshold",
    "title": "The Distance Gamble",
    "module_id": "track_c_c3_quantum_error_correction",
    "section_id": "sec-9",
    "difficulty": "expert",
    "setup": "A team plans to reach reliable logical qubits by raising the surface-code distance from 5 to 15. Their physical error rate is above the code's threshold for their noise model.",
    "prompt": "What will happen?",
    "choices": [
      {
        "id": "a",
        "text": "The logical error rate will fall quickly with distance."
      },
      {
        "id": "b",
        "text": "Larger distance will make the logical error rate worse, not better: first reduce the physical error rate below the threshold, then scale the distance."
      },
      {
        "id": "c",
        "text": "Nothing will change, because distance does not affect logical errors."
      }
    ],
    "badge_awarded": "Threshold Keeper",
    "mission_xp_awarded": 85
  },
  {
    "id": "escape-27-c4-swap-chain",
    "title": "The Twelve-Link Chain",
    "module_id": "track_c_c4_quantum_networking",
    "section_id": "sec-4",
    "difficulty": "expert",
    "setup": "A network joins two sites with twelve entanglement links in a row; each link produces a Werner state with parameter w = 0.9. Intermediate nodes perform entanglement swapping.",
    "prompt": "Is the end-to-end pair usable as entanglement?",
    "choices": [
      {
        "id": "a",
        "text": "Yes: each link is high quality, so the chain is high quality."
      },
      {
        "id": "b",
        "text": "No: the end-to-end parameter is 0.9 to the power 12, about 0.28, below 1/3, so the state is separable; the chain needs purification between swaps or fewer, better links."
      },
      {
        "id": "c",
        "text": "Yes, as long as the classical channel is authenticated."
      }
    ],
    "badge_awarded": "Repeater Planner",
    "mission_xp_awarded": 85
  },
  {
    "id": "escape-28-c5-hashing-bound",
    "title": "The Distillation Choice",
    "module_id": "track_c_c5_quantum_communications",
    "section_id": "sec-4",
    "difficulty": "expert",
    "setup": "A link delivers Werner pairs with fidelity 0.78. The team plans to use one-way hashing distillation, which only works when the fidelity is above about 0.81.",
    "prompt": "What should they do?",
    "choices": [
      {
        "id": "a",
        "text": "Run the one-way hashing protocol anyway; any fidelity above 0.5 works."
      },
      {
        "id": "b",
        "text": "Use a two-way recurrence protocol such as BBPSSW, which works for fidelity above 0.5, or improve the source, and accept the cost in pairs."
      },
      {
        "id": "c",
        "text": "Discard the link, because fidelity below 0.81 cannot be improved."
      }
    ],
    "badge_awarded": "Capacity Analyst",
    "mission_xp_awarded": 85
  },
  {
    "id": "escape-29-c6-qkd-pitch",
    "title": "The QKD Sales Pitch",
    "module_id": "track_c_c6_quantum_key_distribution",
    "section_id": "sec-11",
    "difficulty": "expert",
    "setup": "A vendor says: 'Buy our QKD boxes and you no longer need post-quantum cryptography, including for signing your software updates to 20,000 devices in the field.'",
    "prompt": "What is the technically correct answer?",
    "choices": [
      {
        "id": "a",
        "text": "QKD provides no digital signatures, needs an authenticated classical channel and dedicated links, and does not scale to field devices; software signing still needs a post-quantum signature such as ML-DSA or SLH-DSA."
      },
      {
        "id": "b",
        "text": "Correct: QKD replaces every cryptographic function."
      },
      {
        "id": "c",
        "text": "QKD can sign if combined with a one-time pad."
      }
    ],
    "badge_awarded": "QKD Realist",
    "mission_xp_awarded": 90
  },
  {
    "id": "escape-30-c7-length-extension",
    "title": "The Naive MAC",
    "module_id": "track_c_c7_advanced_cryptography",
    "section_id": "sec-5",
    "difficulty": "expert",
    "setup": "An API authenticates requests with tag = SHA-256(secret || message). An attacker who sees one valid message and tag appends extra data and computes a valid tag without knowing the secret.",
    "prompt": "Why does this work and what is the fix?",
    "choices": [
      {
        "id": "a",
        "text": "Because SHA-256 is broken; switch to MD5."
      },
      {
        "id": "b",
        "text": "The Merkle-Damgard construction lets an attacker continue from the published digest (length extension); use HMAC (or a keyed construction designed for MACs) instead of hashing secret || message."
      },
      {
        "id": "c",
        "text": "Make the secret longer so the attacker cannot guess it."
      }
    ],
    "badge_awarded": "Hash Internals Expert",
    "mission_xp_awarded": 90
  },
  {
    "id": "escape-31-c8-parameter-shortcut",
    "title": "The Smaller Lattice",
    "module_id": "track_c_c8_pqc_mathematics",
    "section_id": "sec-10",
    "difficulty": "expert",
    "setup": "To save bandwidth an engineer proposes reducing the module dimension and noise in a lattice KEM below the standardised ML-KEM-768 values 'because the maths still works'.",
    "prompt": "What is the correct reply?",
    "choices": [
      {
        "id": "a",
        "text": "Approve: correctness of decryption is all that matters."
      },
      {
        "id": "b",
        "text": "Reject it: parameters are chosen from analyses of the best known attacks, so use a standardised parameter set (ML-KEM-512, 768 or 1024) and not a home-made one."
      },
      {
        "id": "c",
        "text": "Approve if the noise is made larger to compensate."
      }
    ],
    "badge_awarded": "Parameter Skeptic",
    "mission_xp_awarded": 90
  },
  {
    "id": "escape-32-c9-byte-order",
    "title": "The Mismatched Encoding",
    "module_id": "track_c_c9_pqc_implementation_engineering",
    "section_id": "sec-11",
    "difficulty": "expert",
    "setup": "Two teams implement ML-KEM independently. Each passes its own tests, but their public keys are rejected by the other's code.",
    "prompt": "What is the right way to find and prevent the problem?",
    "choices": [
      {
        "id": "a",
        "text": "Convert one team's keys to hexadecimal."
      },
      {
        "id": "b",
        "text": "Test both against the standard's known-answer test vectors and the byte encodings defined in FIPS 203, and add cross-implementation tests to continuous integration."
      },
      {
        "id": "c",
        "text": "Let the receiving side guess the encoding from the length."
      }
    ],
    "badge_awarded": "Interop Engineer",
    "mission_xp_awarded": 90
  },
  {
    "id": "escape-33-c11-timing-leak",
    "title": "The Early Exit",
    "module_id": "track_c_c11_pqc_defense_engineering",
    "section_id": "sec-2",
    "difficulty": "quantum_expert",
    "setup": "A reviewer finds that a custom ML-KEM decapsulation compares the re-encrypted ciphertext with the received one using an ordinary equality check that exits at the first differing byte.",
    "prompt": "What is the vulnerability and the fix?",
    "choices": [
      {
        "id": "a",
        "text": "No issue: ciphertexts are public values."
      },
      {
        "id": "b",
        "text": "Add a random delay to hide the timing."
      },
      {
        "id": "c",
        "text": "A timing side channel: use a constant-time comparison and constant-time selection of the output secret, preferably by using a maintained library."
      }
    ],
    "badge_awarded": "Timing Defender",
    "mission_xp_awarded": 95
  },
  {
    "id": "escape-34-e2-shadow-service",
    "title": "The Unlisted Endpoint",
    "module_id": "track_d_e2_cryptographic_discovery",
    "section_id": "sec-2",
    "difficulty": "professional",
    "setup": "Your authorised discovery sweep finds a TLS service with an expired RSA-1024 certificate that appears in no asset register.",
    "prompt": "What is the correct next step?",
    "choices": [
      {
        "id": "a",
        "text": "Ignore it: it is not in the register, so it is not your responsibility."
      },
      {
        "id": "b",
        "text": "Record it in the inventory as unowned, trace its owner, assess it (weak key, expired certificate), and decide whether to fix or retire it."
      },
      {
        "id": "c",
        "text": "Block the port immediately without telling anyone."
      }
    ],
    "badge_awarded": "Shadow Hunter",
    "mission_xp_awarded": 70
  },
  {
    "id": "escape-35-e3-blank-score",
    "title": "The Blank Score",
    "module_id": "track_d_e3_quantum_readiness_assessment",
    "section_id": "sec-3",
    "difficulty": "professional",
    "setup": "Your scoring sheet has an asset whose algorithm, impact and lifetime are all unknown. A manager asks you to just enter 50 for each so the table is complete.",
    "prompt": "What do you do?",
    "choices": [
      {
        "id": "a",
        "text": "Enter 50 for each so the total looks complete."
      },
      {
        "id": "b",
        "text": "Report the asset with a score range and the label insufficient evidence, and put it on an assess-first list with an owner and a date."
      },
      {
        "id": "c",
        "text": "Leave the asset out of the report."
      }
    ],
    "badge_awarded": "Evidence Assessor",
    "mission_xp_awarded": 75
  },
  {
    "id": "escape-36-e4-hard-coded",
    "title": "The Compiled-In Algorithm",
    "module_id": "track_d_e4_crypto_agility",
    "section_id": "sec-1",
    "difficulty": "professional",
    "setup": "An advisory means an algorithm must be replaced in 20 services. The team estimates four months because every service calls the cryptography library directly with the algorithm name written in code.",
    "prompt": "What is the lasting fix after the emergency change?",
    "choices": [
      {
        "id": "a",
        "text": "Hire more developers for the next advisory."
      },
      {
        "id": "b",
        "text": "Introduce a crypto boundary and policy-driven algorithm selection so that the next change is a configuration change that is tested and deployed once."
      },
      {
        "id": "c",
        "text": "Stockpile older library versions for quick rollback."
      }
    ],
    "badge_awarded": "Agility Engineer",
    "mission_xp_awarded": 80
  },
  {
    "id": "escape-37-e5-big-bang",
    "title": "The Big-Bang Weekend",
    "module_id": "track_d_e5_enterprise_pqc_migration",
    "section_id": "sec-10",
    "difficulty": "professional",
    "setup": "A project plan proposes switching all 40 internet-facing services to a hybrid key exchange on one Saturday night, with rollback 'if anything goes wrong'.",
    "prompt": "What is the strongest improvement to the plan?",
    "choices": [
      {
        "id": "a",
        "text": "Add more staff on the night."
      },
      {
        "id": "b",
        "text": "Stage the rollout through a canary and increasing shares of traffic with pre-agreed stop gates and a rehearsed one-step rollback, starting with the highest-risk services."
      },
      {
        "id": "c",
        "text": "Switch off monitoring during the change to avoid false alarms."
      }
    ],
    "badge_awarded": "Rollout Gatekeeper",
    "mission_xp_awarded": 85
  },
  {
    "id": "escape-38-e6-ownerless-risk",
    "title": "The Ownerless Risk",
    "module_id": "track_d_e6_governance",
    "section_id": "sec-3",
    "difficulty": "professional",
    "setup": "Your risk register shows an open quantum-readiness risk on an archive. Its owner left the company last month and the due date has passed.",
    "prompt": "How should governance treat it?",
    "choices": [
      {
        "id": "a",
        "text": "Close the risk as inactive."
      },
      {
        "id": "b",
        "text": "Escalate immediately, assign one named active person as accountable with a new due date, and link the register to the staff directory so leavers trigger a review."
      },
      {
        "id": "c",
        "text": "Assign it to the whole team alias."
      }
    ],
    "badge_awarded": "Accountability Lead",
    "mission_xp_awarded": 85
  }
];
