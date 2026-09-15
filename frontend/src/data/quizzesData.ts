// Generated from Content-Security/Quizzes
import { ModuleQuiz } from '@/features/curriculum/curriculumTypes';

export const quizzesData: Record<string, ModuleQuiz> = {
  "track_a_a1_computing_foundations": {
    "moduleId": "track_a_a1_computing_foundations",
    "title": "A1 Quiz: Computing Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a1-q1",
        "prompt": "What isolates one running program from another on a system?",
        "options": [
          "The CPU clock speed",
          "Process isolation managed by the OS",
          "The hard drive",
          "The internet connection"
        ],
        "correctIndex": 1,
        "explanation": "The operating system runs each program as a process with its own isolated memory space."
      },
      {
        "id": "a1-q2",
        "prompt": "Which storage type is fast but loses its data when powered off?",
        "options": [
          "Storage (disk/SSD)",
          "Memory (RAM)",
          "Cloud backup",
          "USB drive"
        ],
        "correctIndex": 1,
        "explanation": "RAM is fast, temporary storage that is cleared when power is lost, unlike disk/SSD."
      },
      {
        "id": "a1-q3",
        "prompt": "In Python, which keyword starts a loop that repeats while a condition is true?",
        "options": [
          "for",
          "while",
          "def",
          "import"
        ],
        "correctIndex": 1,
        "explanation": "'while' loops repeat as long as a specified condition remains true."
      },
      {
        "id": "a1-q4",
        "prompt": "What is the correct Git workflow order for contributing a change?",
        "options": [
          "Push, commit, branch, clone",
          "Clone, branch, commit, push",
          "Commit, clone, push, branch",
          "Branch, push, clone, commit"
        ],
        "correctIndex": 1,
        "explanation": "The standard flow is: clone the repo, create a branch, commit changes, then push to the remote."
      },
      {
        "id": "a1-q5",
        "prompt": "Which Linux command lists files in the current directory?",
        "options": [
          "cd",
          "ls",
          "rm",
          "chmod"
        ],
        "correctIndex": 1,
        "explanation": "'ls' lists directory contents; 'cd' changes directory, 'rm' removes files, 'chmod' changes permissions."
      }
    ]
  },
  "track_a_a2_mathematics_foundations": {
    "moduleId": "track_a_a2_mathematics_foundations",
    "title": "A2 Quiz: Mathematics Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a2-q1",
        "prompt": "A 2048-bit RSA key means the key has how many possible values, in exponent form?",
        "options": [
          "2 x 2048",
          "2^2048",
          "2048^2",
          "2048/2"
        ],
        "correctIndex": 1,
        "explanation": "Bit-length describes key strength as an exponent: an n-bit key has 2^n possible values."
      },
      {
        "id": "a2-q2",
        "prompt": "What does a complex number consist of?",
        "options": [
          "Two real parts",
          "A real part and an imaginary part",
          "Only imaginary numbers",
          "A vector and a matrix"
        ],
        "correctIndex": 1,
        "explanation": "A complex number has a real part and an imaginary part, e.g. 3 + 4i."
      },
      {
        "id": "a2-q3",
        "prompt": "What is an eigenvector of a transformation?",
        "options": [
          "A vector that gets rotated but not scaled",
          "A vector that only gets scaled, not rotated, by the transformation",
          "Any random vector",
          "A vector with zero length"
        ],
        "correctIndex": 1,
        "explanation": "An eigenvector is only scaled (by its eigenvalue), not rotated, when the transformation is applied."
      },
      {
        "id": "a2-q4",
        "prompt": "In Boolean math, what does XOR output when both inputs are the same?",
        "options": [
          "1 (true)",
          "0 (false)",
          "Undefined",
          "Both 0 and 1"
        ],
        "correctIndex": 1,
        "explanation": "XOR outputs false (0) when both inputs match, and true (1) only when they differ."
      },
      {
        "id": "a2-q5",
        "prompt": "Why is probability and statistics foundational for quantum computing?",
        "options": [
          "Quantum computers use random passwords",
          "Quantum measurement outcomes are inherently probabilistic",
          "It's only used for classical error checking",
          "It's not actually relevant"
        ],
        "correctIndex": 1,
        "explanation": "Quantum measurement doesn't give a deterministic outcome — it gives a probabilistic one, making probability theory essential groundwork."
      }
    ]
  },
  "track_a_a3_networking_foundations": {
    "moduleId": "track_a_a3_networking_foundations",
    "title": "A3 Quiz: Networking Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a3-q1",
        "prompt": "What does DNS do?",
        "options": [
          "Assigns IP addresses automatically",
          "Translates domain names into IP addresses",
          "Encrypts network traffic",
          "Filters firewall rules"
        ],
        "correctIndex": 1,
        "explanation": "DNS (Domain Name System) translates human-readable domain names into IP addresses."
      },
      {
        "id": "a3-q2",
        "prompt": "Which protocol guarantees delivery and order of data?",
        "options": [
          "UDP",
          "TCP",
          "DNS",
          "DHCP"
        ],
        "correctIndex": 1,
        "explanation": "TCP is connection-oriented and guarantees delivery and order, unlike UDP."
      },
      {
        "id": "a3-q3",
        "prompt": "What does HTTPS add to HTTP?",
        "options": [
          "Faster loading speed only",
          "TLS-based encryption and security",
          "A different port number only",
          "Nothing, they are identical"
        ],
        "correctIndex": 1,
        "explanation": "HTTPS is HTTP secured with TLS, adding encryption, integrity, and authentication."
      },
      {
        "id": "a3-q4",
        "prompt": "What is the primary role of a router?",
        "options": [
          "Connect devices within a single LAN",
          "Connect different networks together, forwarding by IP address",
          "Assign domain names",
          "Store website content"
        ],
        "correctIndex": 1,
        "explanation": "Routers connect different networks (e.g., a LAN to a WAN), making forwarding decisions based on IP address."
      },
      {
        "id": "a3-q5",
        "prompt": "What does a firewall do?",
        "options": [
          "Encrypts all traffic automatically",
          "Filters network traffic based on rules",
          "Assigns IP addresses",
          "Speeds up DNS resolution"
        ],
        "correctIndex": 1,
        "explanation": "A firewall filters traffic based on rules like allowed ports, IPs, or protocols."
      }
    ]
  },
  "track_a_a4_cybersecurity_foundations": {
    "moduleId": "track_a_a4_cybersecurity_foundations",
    "title": "A4 Quiz: Cybersecurity Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a4-q1",
        "prompt": "What does the 'A' in the CIA triad stand for?",
        "options": [
          "Authentication",
          "Authorization",
          "Availability",
          "Anonymity"
        ],
        "correctIndex": 2,
        "explanation": "The CIA triad is Confidentiality, Integrity, and Availability — systems being accessible when needed."
      },
      {
        "id": "a4-q2",
        "prompt": "What's the difference between authentication and authorization?",
        "options": [
          "They are the same thing",
          "Authentication asks 'who are you', authorization asks 'what can you do'",
          "Authorization happens before authentication always",
          "Authentication only applies to admins"
        ],
        "correctIndex": 1,
        "explanation": "Authentication verifies identity; authorization determines what that identity is permitted to do."
      },
      {
        "id": "a4-q3",
        "prompt": "What is a vulnerability, as distinct from a threat?",
        "options": [
          "A vulnerability is a weakness in a system; a threat is a potential cause of harm exploiting it",
          "They are interchangeable terms",
          "A vulnerability only applies to hardware",
          "A threat is always internal"
        ],
        "correctIndex": 0,
        "explanation": "A vulnerability is a weakness; a threat is what could exploit that weakness to cause harm."
      },
      {
        "id": "a4-q4",
        "prompt": "What does RBAC stand for?",
        "options": [
          "Random-Based Access Control",
          "Role-Based Access Control",
          "Rule-Based Authentication Code",
          "Remote-Based Access Center"
        ],
        "correctIndex": 1,
        "explanation": "RBAC (Role-Based Access Control) assigns permissions based on a user's role rather than individually."
      },
      {
        "id": "a4-q5",
        "prompt": "In the basic risk formula, Risk equals:",
        "options": [
          "Likelihood + Impact",
          "Likelihood x Impact",
          "Likelihood - Impact",
          "Impact only"
        ],
        "correctIndex": 1,
        "explanation": "Risk is generally modeled as likelihood multiplied by impact."
      }
    ]
  },
  "track_a_a5_cryptography_foundations": {
    "moduleId": "track_a_a5_cryptography_foundations",
    "title": "A5 Quiz: Cryptography Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a5-q1",
        "prompt": "What does a MAC (Message Authentication Code) provide using only symmetric cryptography?",
        "options": [
          "Confidentiality only",
          "Integrity and authenticity",
          "Availability",
          "Anonymity"
        ],
        "correctIndex": 1,
        "explanation": "A MAC combines a hash function with a shared secret key to prove integrity and authenticity."
      },
      {
        "id": "a5-q2",
        "prompt": "What problem does Diffie-Hellman / ECDH solve?",
        "options": [
          "Password storage",
          "Establishing a shared secret key over an insecure channel without transmitting it directly",
          "Hashing large files",
          "Certificate revocation"
        ],
        "correctIndex": 1,
        "explanation": "Diffie-Hellman/ECDH lets two parties derive a shared secret without ever transmitting the secret itself."
      },
      {
        "id": "a5-q3",
        "prompt": "What does 'non-repudiation' mean in the context of digital signatures?",
        "options": [
          "The signer can later deny signing",
          "The signer cannot credibly deny having signed the message",
          "The message can be edited after signing",
          "Signatures never expire"
        ],
        "correctIndex": 1,
        "explanation": "Non-repudiation means the signer can't credibly deny they signed the message, since only their private key could have produced it."
      },
      {
        "id": "a5-q4",
        "prompt": "What TLS handshake step establishes the shared symmetric session key?",
        "options": [
          "Certificate validation alone",
          "A key exchange step (e.g., ECDHE)",
          "The HTTP request",
          "DNS resolution"
        ],
        "correctIndex": 1,
        "explanation": "The key exchange step (commonly ECDHE) is what allows client and server to derive a shared symmetric key."
      },
      {
        "id": "a5-q5",
        "prompt": "Why does poor key management matter even with a strong algorithm?",
        "options": [
          "It doesn't matter if the algorithm is strong",
          "Weak randomness or poor storage/rotation can undermine security regardless of algorithm strength",
          "Key management only affects speed",
          "Keys never need to be rotated"
        ],
        "correctIndex": 1,
        "explanation": "A strong algorithm can still be undermined by weak randomness, poor storage, or lack of key rotation — key management is a common real-world failure point."
      }
    ]
  },
  "track_a_a6_quantum_foundations": {
    "moduleId": "track_a_a6_quantum_foundations",
    "title": "A6 Quiz: Quantum Foundations",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a6-q1",
        "prompt": "What do the north and south poles of the Bloch sphere represent?",
        "options": [
          "Two different qubits",
          "The definite |0⟩ and |1⟩ states",
          "Measurement error",
          "Entanglement strength"
        ],
        "correctIndex": 1,
        "explanation": "The Bloch sphere's poles represent the two definite basis states, |0⟩ and |1⟩."
      },
      {
        "id": "a6-q2",
        "prompt": "What happens to a qubit's superposition upon measurement?",
        "options": [
          "Nothing changes",
          "It collapses to a definite classical outcome",
          "It doubles in strength",
          "It becomes entangled automatically"
        ],
        "correctIndex": 1,
        "explanation": "Measurement is destructive to superposition — it collapses the qubit to one definite classical result."
      },
      {
        "id": "a6-q3",
        "prompt": "What is quantum interference used for in algorithm design?",
        "options": [
          "Increasing noise deliberately",
          "Amplifying the probability of correct answers while canceling out wrong ones",
          "Slowing down computation",
          "Creating entanglement only"
        ],
        "correctIndex": 1,
        "explanation": "Interference lets algorithm designers boost the probability of measuring correct answers while suppressing wrong ones."
      },
      {
        "id": "a6-q4",
        "prompt": "What mathematical operation combines individual qubit states into a multi-qubit system?",
        "options": [
          "Simple addition",
          "Tensor product",
          "Subtraction",
          "Division"
        ],
        "correctIndex": 1,
        "explanation": "The tensor product combines individual qubit state vectors, explaining the 2^n scaling of multi-qubit systems."
      },
      {
        "id": "a6-q5",
        "prompt": "Which gate is commonly used to create an equal superposition from a definite |0⟩ state?",
        "options": [
          "CNOT gate",
          "Hadamard gate",
          "X gate only",
          "Measurement gate"
        ],
        "correctIndex": 1,
        "explanation": "The Hadamard gate rotates a definite state to the equator of the Bloch sphere, creating an equal superposition."
      }
    ]
  },
  "track_a_a7_first_quantum_programming": {
    "moduleId": "track_a_a7_first_quantum_programming",
    "title": "A7 Quiz: First Quantum Programming",
    "difficulty": "novice",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a7-q1",
        "prompt": "What Python framework is used throughout this program for quantum programming?",
        "options": [
          "TensorFlow",
          "Qiskit",
          "Django",
          "NumPy alone"
        ],
        "correctIndex": 1,
        "explanation": "Qiskit is IBM's open-source Python framework used throughout the program for building and running quantum circuits."
      },
      {
        "id": "a7-q2",
        "prompt": "Why are simulators used before running circuits on real quantum hardware?",
        "options": [
          "Simulators are required by law",
          "They let learners test and debug circuits without noise or hardware access limits",
          "Real hardware doesn't exist",
          "Simulators are always more accurate than real hardware"
        ],
        "correctIndex": 1,
        "explanation": "Simulators provide a controlled, accessible environment to test and debug circuits before using limited real hardware."
      },
      {
        "id": "a7-q3",
        "prompt": "In Qiskit, what does a 'shot' refer to?",
        "options": [
          "A single gate operation",
          "One full run of the circuit, producing one measurement outcome",
          "An error in the code",
          "A type of qubit"
        ],
        "correctIndex": 1,
        "explanation": "A 'shot' is one execution of the circuit; running many shots reveals the underlying probability distribution."
      },
      {
        "id": "a7-q4",
        "prompt": "What does noise simulation help demonstrate?",
        "options": [
          "That quantum computers never make errors",
          "How real hardware's error rates degrade expected circuit results",
          "How to skip using a simulator entirely",
          "That noise only affects classical computers"
        ],
        "correctIndex": 1,
        "explanation": "Noise simulation shows how real-world hardware imperfections affect circuit results compared to the ideal simulator."
      },
      {
        "id": "a7-q5",
        "prompt": "What does the Beginner Capstone combine?",
        "options": [
          "Only quantum circuits",
          "A secured network, a cryptographic application, and a quantum circuit",
          "Only Python scripting",
          "Only certificate analysis"
        ],
        "correctIndex": 1,
        "explanation": "The Beginner Capstone combines networking, cryptography, and quantum programming into one project."
      }
    ]
  },
  "track_a_a8_pqc_mitigation": {
    "moduleId": "track_a_a8_pqc_mitigation",
    "title": "Module 3 Quiz: PQC Mitigation",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "a8-q1",
        "prompt": "Shor's algorithm poses a threat to which cryptographic systems?",
        "options": [
          "AES and SHA-256 only",
          "RSA and ECC (via factoring and discrete log)",
          "Hash-based signatures only",
          "Symmetric ciphers only"
        ],
        "correctIndex": 1,
        "explanation": "Shor's algorithm efficiently solves integer factorization (breaking RSA) and discrete logarithms (breaking ECC/Diffie-Hellman) on a sufficiently large fault-tolerant quantum computer."
      },
      {
        "id": "a8-q2",
        "prompt": "What is the primary impact of Grover's algorithm on symmetric cryptography?",
        "options": [
          "It fully breaks AES regardless of key size",
          "It provides a quadratic speedup, roughly halving effective key strength",
          "It has no impact on symmetric crypto",
          "It only affects hash-based signatures"
        ],
        "correctIndex": 1,
        "explanation": "Grover's algorithm gives a quadratic speedup, so AES-128 behaves like ~64-bit security against a quantum attacker — mitigated by doubling key/hash lengths."
      },
      {
        "id": "a8-q3",
        "prompt": "What does 'Harvest Now, Decrypt Later' describe?",
        "options": [
          "A PQC algorithm name",
          "Adversaries recording encrypted data today to decrypt once quantum computers are capable",
          "A quantum error-correction technique",
          "A type of phishing attack"
        ],
        "correctIndex": 1,
        "explanation": "HNDL means encrypted data is captured today and stored, to be decrypted later once cryptographically relevant quantum computers exist."
      },
      {
        "id": "a8-q4",
        "prompt": "Which NIST-standardized algorithm is used for key encapsulation (key exchange) in the PQC suite?",
        "options": [
          "ML-DSA",
          "SLH-DSA",
          "ML-KEM",
          "AES-256"
        ],
        "correctIndex": 2,
        "explanation": "ML-KEM (formerly CRYSTALS-Kyber) is the NIST standard for post-quantum key exchange (FIPS 203)."
      },
      {
        "id": "a8-q5",
        "prompt": "Why does SLH-DSA (hash-based signatures) exist alongside ML-DSA (lattice-based signatures)?",
        "options": [
          "SLH-DSA is faster and should replace ML-DSA entirely",
          "It serves as a conservative backup based on well-understood hash security, in case lattice-based math is later weakened",
          "SLH-DSA is used only for symmetric encryption",
          "They are functionally identical"
        ],
        "correctIndex": 1,
        "explanation": "SLH-DSA relies only on hash function security, providing a diversified backup in case unforeseen weaknesses are found in lattice-based approaches."
      },
      {
        "id": "a8-q6",
        "prompt": "What is 'crypto-agility'?",
        "options": [
          "Using the fastest possible encryption algorithm always",
          "The ability to swap cryptographic algorithms without a full system re-architecture",
          "A quantum computing benchmark",
          "A synonym for hybrid cryptography"
        ],
        "correctIndex": 1,
        "explanation": "Crypto-agility is a design property letting organizations swap algorithms as standards evolve, without rebuilding entire systems."
      },
      {
        "id": "a8-q7",
        "prompt": "Why do organizations often use hybrid cryptography (classical + PQC) during migration?",
        "options": [
          "It's required by law in all countries",
          "It ensures security holds even if one of the two algorithm families is later broken or found flawed",
          "It makes systems faster than using either alone",
          "It removes the need for certificates"
        ],
        "correctIndex": 1,
        "explanation": "Hybrid cryptography combines classical and PQC algorithms so security is maintained as long as at least one remains unbroken."
      },
      {
        "id": "a8-q8",
        "prompt": "An RSA-2048 certificate is found on a critical system holding data with a 20-year confidentiality requirement. Under the HNDL model, what is the most accurate assessment?",
        "options": [
          "No risk exists until a quantum computer capable of breaking RSA is built",
          "The data may already be at risk today if it is being intercepted and stored for future decryption",
          "RSA-2048 is already quantum-safe",
          "This only matters for symmetric encryption"
        ],
        "correctIndex": 1,
        "explanation": "Because of Harvest Now, Decrypt Later, data with a long confidentiality lifetime is at risk from today's interception, even before decryption capability exists."
      }
    ]
  },
  "track_b_b10_pqc_standards": {
    "moduleId": "track_b_b10_pqc_standards",
    "title": "B10 Quiz: PQC Standards",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b10-q1",
        "prompt": "Which FIPS standard covers ML-KEM?",
        "options": [
          "FIPS 201",
          "FIPS 203",
          "FIPS 204",
          "FIPS 205"
        ],
        "correctIndex": 1,
        "explanation": "ML-KEM (formerly CRYSTALS-Kyber) is standardized under FIPS 203 for key exchange."
      },
      {
        "id": "b10-q2",
        "prompt": "Which algorithm is standardized under FIPS 205 as a conservative hash-based backup?",
        "options": [
          "ML-KEM",
          "ML-DSA",
          "SLH-DSA",
          "RSA-4096"
        ],
        "correctIndex": 2,
        "explanation": "SLH-DSA (formerly SPHINCS+) is the hash-based signature standard under FIPS 205, intended as a diversified backup."
      },
      {
        "id": "b10-q3",
        "prompt": "What is the default choice for general-purpose PQC signatures per algorithm selection guidance?",
        "options": [
          "SLH-DSA always",
          "ML-DSA",
          "ML-KEM",
          "RSA"
        ],
        "correctIndex": 1,
        "explanation": "ML-DSA is the default choice for general-purpose signatures, balancing size and performance well."
      },
      {
        "id": "b10-q4",
        "prompt": "Why should PQC standards content always be verified against nist.gov before publishing?",
        "options": [
          "It never changes so verification is unnecessary",
          "Standardization is an ongoing process and content can go stale",
          "NIST doesn't publish standards online",
          "Standards are only relevant to symmetric cryptography"
        ],
        "correctIndex": 1,
        "explanation": "PQC standardization is an active, ongoing process — content should always be checked against current official sources rather than assumed static."
      },
      {
        "id": "b10-q5",
        "prompt": "What practical concern does protocol-level negotiation address for PQC deployment?",
        "options": [
          "How fast a CPU runs",
          "How a client and server agree on and advertise PQC algorithm support during a handshake",
          "The physical color of network cables",
          "Password complexity requirements"
        ],
        "correctIndex": 1,
        "explanation": "Protocol-level negotiation covers how systems like TLS advertise and agree on PQC algorithm support between client and server."
      }
    ]
  },
  "track_b_b11_intermediate_pqc_labs": {
    "moduleId": "track_b_b11_intermediate_pqc_labs",
    "title": "B11 Quiz: Intermediate PQC Labs",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b11-q1",
        "prompt": "What is the purpose of benchmarking RSA against ML-KEM hands-on?",
        "options": [
          "To prove RSA is always better",
          "To turn conceptual comparisons into measured, personally-verified data on key size, generation time, and speed",
          "To delete RSA from all systems immediately",
          "Benchmarking serves no real purpose"
        ],
        "correctIndex": 1,
        "explanation": "Hands-on benchmarking converts conceptual comparisons into real, measured data the learner can verify and reason from."
      },
      {
        "id": "b11-q2",
        "prompt": "What does a hybrid handshake (e.g., X25519 + ML-KEM) combine?",
        "options": [
          "Two classical algorithms only",
          "A classical algorithm and a PQC algorithm combined into one session key",
          "Two unrelated hash functions",
          "Only symmetric encryption"
        ],
        "correctIndex": 1,
        "explanation": "A hybrid handshake combines a classical algorithm (like X25519) with a PQC algorithm (like ML-KEM) into a single combined session key."
      },
      {
        "id": "b11-q3",
        "prompt": "What does a cryptographic inventory exercise at this stage rehearse for later tracks?",
        "options": [
          "Nothing relevant to later content",
          "A smaller-scale version of the organizational-scale Cryptographic Discovery process covered in the Enterprise track",
          "Only quiz-writing skills",
          "Physical security testing"
        ],
        "correctIndex": 1,
        "explanation": "This hands-on inventory exercise is a smaller, individual rehearsal of the Cryptographic Discovery process covered at organizational scale in Track D."
      },
      {
        "id": "b11-q4",
        "prompt": "What should a PQC migration plan produced in this module's lab be based on?",
        "options": [
          "Guesswork with no supporting data",
          "The benchmark data and cryptographic inventory the learner produced in this same module",
          "A randomly generated list",
          "Only theoretical algorithm names with no testing"
        ],
        "correctIndex": 1,
        "explanation": "The migration plan should be grounded in the actual benchmark data and cryptographic inventory produced hands-on in this module."
      },
      {
        "id": "b11-q5",
        "prompt": "What does completing B11 unlock, per the Intermediate track structure?",
        "options": [
          "Nothing further",
          "The CQSE certificate and progression toward Track C",
          "Automatic enrollment in Track A",
          "A password reset"
        ],
        "correctIndex": 1,
        "explanation": "Completing B11 and the Intermediate Capstone unlocks the CQSE certificate and progression to Track C."
      }
    ]
  },
  "track_b_b1_advanced_math_for_quantum": {
    "moduleId": "track_b_b1_advanced_math_for_quantum",
    "title": "B1 Quiz: Advanced Mathematics for Quantum",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b1-q1",
        "prompt": "What property must a valid quantum gate's matrix representation have?",
        "options": [
          "It must be symmetric",
          "It must be unitary (preserves total probability)",
          "It must have all positive entries",
          "It must be diagonal"
        ],
        "correctIndex": 1,
        "explanation": "A unitary operator preserves the total probability (sums to 1) when applied to a quantum state — required for any valid gate."
      },
      {
        "id": "b1-q2",
        "prompt": "What does the inner product of two quantum states help compute?",
        "options": [
          "The color of the qubit",
          "The probability of measuring one state given the other",
          "The physical temperature",
          "The circuit depth"
        ],
        "correctIndex": 1,
        "explanation": "The squared magnitude of the inner product between states gives the probability of a particular measurement outcome."
      },
      {
        "id": "b1-q3",
        "prompt": "What notation uses |ψ⟩ (ket) and ⟨ψ| (bra)?",
        "options": [
          "Boolean notation",
          "Dirac (bra-ket) notation",
          "Big-O notation",
          "Binary notation"
        ],
        "correctIndex": 1,
        "explanation": "Dirac notation is the standard shorthand for quantum state vectors used throughout quantum computing literature."
      },
      {
        "id": "b1-q4",
        "prompt": "Combining two 2-dimensional single-qubit spaces via tensor product produces a space of what dimension?",
        "options": [
          "2-dimensional",
          "4-dimensional",
          "8-dimensional",
          "16-dimensional"
        ],
        "correctIndex": 1,
        "explanation": "Two 2-dimensional spaces combine via tensor product into a 4-dimensional space (2 x 2), generalizing to 2^n for n qubits."
      },
      {
        "id": "b1-q5",
        "prompt": "What quantum computing concept does basic optimization math prepare learners for?",
        "options": [
          "Classical firewall rules",
          "Variational algorithms like VQE and QAOA",
          "DNS resolution",
          "Symmetric key generation"
        ],
        "correctIndex": 1,
        "explanation": "Optimization concepts are groundwork for variational quantum algorithms, which combine quantum circuits with classical optimization."
      }
    ]
  },
  "track_b_b2_quantum_information": {
    "moduleId": "track_b_b2_quantum_information",
    "title": "B2 Quiz: Quantum Information",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b2-q1",
        "prompt": "What does a density matrix describe that a simple state vector cannot?",
        "options": [
          "Only pure states",
          "Mixed states (statistical uncertainty), in addition to pure states",
          "Only classical bits",
          "Nothing new"
        ],
        "correctIndex": 1,
        "explanation": "Density matrices can represent mixed states — statistical uncertainty about the state itself — unlike a simple state vector which only describes pure states."
      },
      {
        "id": "b2-q2",
        "prompt": "What does the no-cloning theorem prove?",
        "options": [
          "Quantum states can always be perfectly copied",
          "It's impossible to create an identical copy of an arbitrary unknown quantum state",
          "Classical bits cannot be copied",
          "Entanglement is impossible"
        ],
        "correctIndex": 1,
        "explanation": "The no-cloning theorem proves that an arbitrary unknown quantum state cannot be perfectly copied — a foundational result with security implications."
      },
      {
        "id": "b2-q3",
        "prompt": "What is decoherence?",
        "options": [
          "A type of quantum gate",
          "The process by which a qubit's quantum information leaks into its environment, degrading its state",
          "A measurement technique",
          "A classical encryption method"
        ],
        "correctIndex": 1,
        "explanation": "Decoherence is the loss of quantum information due to unwanted interactions with the environment — the central engineering challenge for quantum hardware."
      },
      {
        "id": "b2-q4",
        "prompt": "How does measuring one qubit in an entangled pair affect the other?",
        "options": [
          "It has no effect on the other qubit",
          "It instantly affects the correlated state of the other qubit",
          "It destroys both qubits permanently",
          "It only affects qubits in the same physical location"
        ],
        "correctIndex": 1,
        "explanation": "Due to entanglement, measuring one qubit instantly determines correlated information about the other, regardless of distance."
      },
      {
        "id": "b2-q5",
        "prompt": "What formal object generalizes projective measurement to describe imperfect real measurement devices?",
        "options": [
          "A Hadamard gate",
          "A POVM (Positive Operator-Valued Measure)",
          "A Bloch sphere",
          "A classical bit"
        ],
        "correctIndex": 1,
        "explanation": "A POVM generalizes measurement theory to accurately model real, imperfect measurement devices."
      }
    ]
  },
  "track_b_b3_quantum_algorithms": {
    "moduleId": "track_b_b3_quantum_algorithms",
    "title": "B3 Quiz: Quantum Algorithms",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b3-q1",
        "prompt": "Which algorithm's period-finding technique directly inspired Shor's algorithm?",
        "options": [
          "Deutsch-Jozsa",
          "Simon's algorithm",
          "Grover's algorithm",
          "QAOA"
        ],
        "correctIndex": 1,
        "explanation": "Simon's algorithm solves a hidden-period problem and directly inspired the period-finding technique at the heart of Shor's algorithm."
      },
      {
        "id": "b3-q2",
        "prompt": "What two operators does Grover's algorithm repeatedly apply?",
        "options": [
          "Encryption and decryption",
          "An oracle (marking the answer) and a diffusion operator (amplifying its amplitude)",
          "Hashing and signing",
          "Compression and decompression"
        ],
        "correctIndex": 1,
        "explanation": "Grover's algorithm repeatedly applies an oracle to mark the correct answer and a diffusion operator to amplify its amplitude."
      },
      {
        "id": "b3-q3",
        "prompt": "What is the Quantum Fourier Transform (QFT) primarily used for?",
        "options": [
          "Standalone data compression",
          "A critical subroutine inside phase estimation and Shor's algorithm",
          "Classical file encryption",
          "Password hashing"
        ],
        "correctIndex": 1,
        "explanation": "The QFT isn't typically useful standalone but is the critical subroutine inside phase estimation, which powers Shor's algorithm."
      },
      {
        "id": "b3-q4",
        "prompt": "How does Grover's quadratic speedup compare to Shor's speedup against the problems they target?",
        "options": [
          "Both are exponential",
          "Grover's is quadratic; Shor's is exponential — a much more severe threat to RSA/ECC",
          "Grover's is exponential; Shor's is quadratic",
          "Neither offers any speedup"
        ],
        "correctIndex": 1,
        "explanation": "Grover's algorithm offers a quadratic speedup for search; Shor's offers an exponential speedup for factoring — making Shor's the far more serious cryptographic threat."
      },
      {
        "id": "b3-q5",
        "prompt": "What distinguishes variational algorithms like VQE from Shor's algorithm in terms of hardware requirements?",
        "options": [
          "They require identical hardware",
          "Variational algorithms are designed to run on today's noisy NISQ-era hardware, unlike Shor's which needs full error correction",
          "VQE requires MORE error correction than Shor's",
          "Neither requires any quantum hardware"
        ],
        "correctIndex": 1,
        "explanation": "Variational algorithms (VQE, QAOA) are designed to be useful even on noisy near-term hardware, unlike Shor's algorithm which requires large-scale fault tolerance."
      }
    ]
  },
  "track_b_b4_quantum_programming": {
    "moduleId": "track_b_b4_quantum_programming",
    "title": "B4 Quiz: Quantum Programming",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b4-q1",
        "prompt": "What is transpilation in the context of quantum programming?",
        "options": [
          "Translating quantum code into a classical language",
          "Converting an abstract circuit into one compatible with a specific backend's native gates and connectivity",
          "Deleting unused qubits",
          "Encrypting a circuit's contents"
        ],
        "correctIndex": 1,
        "explanation": "Transpilation converts an abstract circuit into a form compatible with a specific backend's native gate set and qubit connectivity."
      },
      {
        "id": "b4-q2",
        "prompt": "How does error mitigation differ from full error correction?",
        "options": [
          "They are identical techniques",
          "Error mitigation reduces noise impact without the massive qubit overhead full error correction requires",
          "Error mitigation requires more qubits than error correction",
          "Error mitigation only works on classical computers"
        ],
        "correctIndex": 1,
        "explanation": "Error mitigation techniques reduce noise impact on results without requiring the large qubit overhead of full fault-tolerant error correction."
      },
      {
        "id": "b4-q3",
        "prompt": "Why is circuit optimization especially important on noisy hardware?",
        "options": [
          "It has no real impact",
          "Fewer gates mean fewer opportunities for error to accumulate",
          "It makes circuits run on classical computers instead",
          "It increases circuit depth intentionally"
        ],
        "correctIndex": 1,
        "explanation": "Reducing gate count and circuit depth through optimization reduces the opportunities for noise-induced errors to accumulate."
      },
      {
        "id": "b4-q4",
        "prompt": "What describes the interaction pattern of most practically useful near-term quantum algorithms?",
        "options": [
          "Purely quantum with no classical involvement",
          "A hybrid quantum-classical loop alternating between circuit execution and classical processing",
          "Purely classical simulation only",
          "A one-time single circuit run with no follow-up"
        ],
        "correctIndex": 1,
        "explanation": "Most near-term useful algorithms alternate between quantum circuit execution and classical post-processing/parameter adjustment."
      },
      {
        "id": "b4-q5",
        "prompt": "What does benchmarking a quantum circuit typically measure?",
        "options": [
          "Only the circuit's color scheme",
          "Success probability, fidelity vs. ideal simulation, and runtime",
          "The programmer's typing speed",
          "The price of the quantum computer"
        ],
        "correctIndex": 1,
        "explanation": "Benchmarking evaluates success probability, fidelity compared to ideal simulation, and runtime performance."
      }
    ]
  },
  "track_b_b5_quantum_hardware": {
    "moduleId": "track_b_b5_quantum_hardware",
    "title": "B5 Quiz: Quantum Hardware",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b5-q1",
        "prompt": "What is the most widely deployed physical qubit approach in today's commercial quantum computers?",
        "options": [
          "Trapped ions",
          "Superconducting qubits",
          "Photonic qubits",
          "Spin qubits"
        ],
        "correctIndex": 1,
        "explanation": "Superconducting qubits, cooled to near-absolute-zero, are the most widely deployed approach used by companies like IBM and Google."
      },
      {
        "id": "b5-q2",
        "prompt": "What tradeoff do trapped-ion qubits typically offer compared to superconducting qubits?",
        "options": [
          "Faster gates but shorter coherence",
          "Longer coherence and higher fidelity, but slower gate operations",
          "No tradeoff exists",
          "They are identical in every respect"
        ],
        "correctIndex": 1,
        "explanation": "Trapped ions typically offer longer coherence times and higher gate fidelity at the cost of slower gate speeds."
      },
      {
        "id": "b5-q3",
        "prompt": "What does gate fidelity measure?",
        "options": [
          "The color of the qubit",
          "How closely a real gate operation matches its ideal mathematical description",
          "The price of the hardware",
          "The number of qubits available"
        ],
        "correctIndex": 1,
        "explanation": "Gate fidelity measures how closely a physical gate matches its ideal behavior, determining how many gates can be chained reliably."
      },
      {
        "id": "b5-q4",
        "prompt": "What does 'connectivity' refer to in quantum hardware?",
        "options": [
          "Internet access speed",
          "Which qubit pairs can directly interact with each other",
          "The number of classical bits available",
          "The cooling system's efficiency"
        ],
        "correctIndex": 1,
        "explanation": "Connectivity describes which physical qubit pairs can directly interact, affecting how transpilation must route operations."
      },
      {
        "id": "b5-q5",
        "prompt": "What is widely regarded as the central engineering challenge on the path to large, fault-tolerant quantum computers?",
        "options": [
          "Writing more software",
          "Scaling qubit count while maintaining coherence and fidelity",
          "Finding more electricity",
          "Reducing internet latency"
        ],
        "correctIndex": 1,
        "explanation": "Scaling to more qubits while maintaining coherence and fidelity is widely considered the central hardware engineering challenge."
      }
    ]
  },
  "track_b_b6_network_security_engineering": {
    "moduleId": "track_b_b6_network_security_engineering",
    "title": "B6 Quiz: Network & Security Engineering",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b6-q1",
        "prompt": "What is the core principle of Zero Trust architecture?",
        "options": [
          "Trust all devices inside the network perimeter automatically",
          "Never automatically trust any device or user, inside or outside the perimeter — verify every request",
          "Trust is granted permanently after first login",
          "Only external users need verification"
        ],
        "correctIndex": 1,
        "explanation": "Zero Trust never automatically trusts any device or user; every request is independently authenticated and authorized."
      },
      {
        "id": "b6-q2",
        "prompt": "What does network segmentation aim to prevent?",
        "options": [
          "Devices from connecting to the internet",
          "A compromise in one zone from automatically granting access to others",
          "DNS resolution failures",
          "TLS handshakes"
        ],
        "correctIndex": 1,
        "explanation": "Segmentation isolates network zones so that a compromise in one doesn't automatically compromise the rest."
      },
      {
        "id": "b6-q3",
        "prompt": "What does IAM primarily manage?",
        "options": [
          "Internet bandwidth allocation",
          "Identity and access — including SSO and MFA — across systems",
          "Physical server temperature",
          "DNS record types"
        ],
        "correctIndex": 1,
        "explanation": "IAM (Identity and Access Management) covers centralized identity, single sign-on, and multi-factor authentication across systems."
      },
      {
        "id": "b6-q4",
        "prompt": "Why is VPN cryptography directly relevant to this program's PQC migration concerns?",
        "options": [
          "VPNs don't use cryptography",
          "VPN tunnels often rely on TLS or IPsec, subject to the same PQC migration considerations as any TLS deployment",
          "VPNs are being phased out entirely",
          "VPN cryptography is unrelated to certificates"
        ],
        "correctIndex": 1,
        "explanation": "VPN cryptography (often TLS-based or IPsec) is subject to the same quantum vulnerability and PQC migration considerations as other TLS deployments."
      },
      {
        "id": "b6-q5",
        "prompt": "What operational challenge does certificate rotation at organizational scale primarily address?",
        "options": [
          "Reducing electricity costs",
          "Keeping certificates from expiring or using outdated cryptography across many systems",
          "Speeding up DNS lookups",
          "Reducing the number of employees needed"
        ],
        "correctIndex": 1,
        "explanation": "Certificate lifecycle automation at scale prevents expired certificates and ensures certificates use current, approved cryptography."
      }
    ]
  },
  "track_b_b7_advanced_cryptography": {
    "moduleId": "track_b_b7_advanced_cryptography",
    "title": "B7 Quiz: Advanced Cryptography",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b7-q1",
        "prompt": "What is a KEM (Key Encapsulation Mechanism) structurally different from?",
        "options": [
          "It's identical to encrypting an arbitrary message",
          "It generates and securely transmits a random shared secret, rather than encrypting arbitrary chosen data",
          "It only works with symmetric keys",
          "It replaces the need for a public key"
        ],
        "correctIndex": 1,
        "explanation": "A KEM generates a random shared secret and securely transmits it, a slightly different structure than encrypting arbitrary chosen plaintext."
      },
      {
        "id": "b7-q2",
        "prompt": "What does an HSM (Hardware Security Module) primarily protect against?",
        "options": [
          "Network latency",
          "Exposing private keys to software compromise by keeping operations in tamper-resistant hardware",
          "DNS spoofing",
          "Password reuse"
        ],
        "correctIndex": 1,
        "explanation": "An HSM performs key operations in tamper-resistant hardware without ever exposing the private key to the host software."
      },
      {
        "id": "b7-q3",
        "prompt": "What security property does a signature scheme's 'existential unforgeability' guarantee?",
        "options": [
          "Signatures never expire",
          "An attacker cannot forge a valid signature on any new message, even after seeing many valid ones",
          "All signatures look identical",
          "Signatures can be reused across different messages"
        ],
        "correctIndex": 1,
        "explanation": "Existential unforgeability means an attacker cannot produce a valid forged signature, even after observing many legitimate signatures."
      },
      {
        "id": "b7-q4",
        "prompt": "What is a common real-world cause of PKI failure, independent of any cryptographic weakness?",
        "options": [
          "Poor certificate lifecycle management (e.g., expired certificates)",
          "Using AES-256",
          "Having too many CAs",
          "Using ECC instead of RSA"
        ],
        "correctIndex": 0,
        "explanation": "Poor lifecycle management — like certificates expiring unnoticed — is one of the most common real-world PKI failure modes, unrelated to cryptographic strength."
      },
      {
        "id": "b7-q5",
        "prompt": "Why is SSH grouped with TLS in terms of underlying cryptographic building blocks?",
        "options": [
          "They are the exact same protocol",
          "Both use asymmetric key exchange, symmetric encryption, and MACs, just in different protocol structures",
          "SSH doesn't use any cryptography",
          "TLS is only used for email"
        ],
        "correctIndex": 1,
        "explanation": "SSH and TLS both rely on the same core cryptographic building blocks (key exchange, symmetric encryption, MACs) within different protocol structures."
      }
    ]
  },
  "track_b_b8_quantum_threats": {
    "moduleId": "track_b_b8_quantum_threats",
    "title": "B8 Quiz: Quantum Threats",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b8-q1",
        "prompt": "Why is it a misconception that ECC's smaller key size makes it more quantum-resistant than RSA?",
        "options": [
          "It's not a misconception — ECC is fully quantum-safe",
          "Shor's algorithm's period-finding technique generalizes to break the elliptic curve discrete log problem too",
          "ECC doesn't use any hard math problem",
          "Only RSA uses Shor's algorithm"
        ],
        "correctIndex": 1,
        "explanation": "Shor's algorithm generalizes to solve the elliptic curve discrete logarithm problem, meaning ECC is equally vulnerable despite its smaller keys."
      },
      {
        "id": "b8-q2",
        "prompt": "What four factors combine in a formal quantum threat model for a given asset?",
        "options": [
          "Color, size, weight, price",
          "Key type/size, data lifetime, criticality, and estimated quantum computing timeline",
          "Only the algorithm name",
          "Only the organization's budget"
        ],
        "correctIndex": 1,
        "explanation": "A formal threat model combines key type/size, data lifetime, asset criticality, and quantum timeline estimates into a risk assessment."
      },
      {
        "id": "b8-q3",
        "prompt": "What quantitative impact does Grover's algorithm have on AES-128 against a quantum attacker?",
        "options": [
          "No impact at all",
          "Effectively reduces it to roughly AES-64-equivalent strength",
          "It fully breaks it instantly",
          "It strengthens it"
        ],
        "correctIndex": 1,
        "explanation": "Grover's quadratic speedup effectively halves the bit-strength, making AES-128 behave like roughly AES-64 against a quantum attacker."
      },
      {
        "id": "b8-q4",
        "prompt": "Which data category is most exposed under the Harvest-Now-Decrypt-Later model?",
        "options": [
          "Data with a very short (minutes-long) confidentiality requirement",
          "Data with a long confidentiality lifetime, like health records or state secrets",
          "Publicly available data",
          "Deleted data"
        ],
        "correctIndex": 1,
        "explanation": "Data requiring long-term confidentiality (health records, government secrets, long-term IP) is most exposed to HNDL risk."
      },
      {
        "id": "b8-q5",
        "prompt": "What is the correct order of the quantum threat modeling process?",
        "options": [
          "Prioritize, then discover dependencies",
          "Identify cryptographic dependencies, assess exposure, factor in data lifetime, then prioritize remediation",
          "Remediate everything immediately without assessment",
          "Only assess data lifetime, ignore cryptography"
        ],
        "correctIndex": 1,
        "explanation": "The process is: identify dependencies, assess exposure using threat models, factor in data lifetime, then prioritize remediation."
      }
    ]
  },
  "track_b_b9_pqc_fundamentals": {
    "moduleId": "track_b_b9_pqc_fundamentals",
    "title": "B9 Quiz: PQC Fundamentals",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "b9-q1",
        "prompt": "What fundamentally distinguishes PQC from quantum cryptography like QKD?",
        "options": [
          "PQC requires quantum hardware; QKD doesn't",
          "PQC is classical math run on ordinary computers; QKD uses actual quantum physical phenomena as part of its security mechanism",
          "They are the exact same thing",
          "QKD is a subset of PQC"
        ],
        "correctIndex": 1,
        "explanation": "PQC uses classical math believed to resist quantum attacks and runs on ordinary computers; QKD uses actual quantum phenomena as part of the security mechanism."
      },
      {
        "id": "b9-q2",
        "prompt": "Which PQC family currently has the strongest balance of performance, key size, and security confidence, making it the most widely adopted?",
        "options": [
          "Multivariate approaches",
          "Lattice-based cryptography",
          "Code-based cryptography only",
          "None are adopted"
        ],
        "correctIndex": 1,
        "explanation": "Lattice-based cryptography currently offers the strongest balance of performance and key size, making it the most widely adopted PQC approach."
      },
      {
        "id": "b9-q3",
        "prompt": "What is the primary tradeoff of hash-based cryptography (like SLH-DSA)?",
        "options": [
          "It's completely insecure",
          "Larger signatures and slower performance, in exchange for relying only on well-studied hash security",
          "It requires quantum hardware",
          "It cannot be standardized"
        ],
        "correctIndex": 1,
        "explanation": "Hash-based schemes trade larger signatures and slower performance for security resting on well-studied, conservative hash function assumptions."
      },
      {
        "id": "b9-q4",
        "prompt": "What does a PQC KEM (Key Encapsulation Mechanism) allow?",
        "options": [
          "Only signing documents",
          "A recipient's public key is used to generate and encapsulate a random shared secret, decapsulated using their private key",
          "Storing passwords in plaintext",
          "Broadcasting a private key openly"
        ],
        "correctIndex": 1,
        "explanation": "A KEM lets a sender use the recipient's public key to encapsulate a random secret, which the recipient decapsulates with their private key."
      },
      {
        "id": "b9-q5",
        "prompt": "Why is code-based cryptography (e.g., McEliece) attractive for long-term security despite large key sizes?",
        "options": [
          "It has no known weaknesses ever discovered",
          "It benefits from decades of cryptanalytic scrutiny since the 1970s",
          "It's the newest PQC approach",
          "It requires no keys at all"
        ],
        "correctIndex": 1,
        "explanation": "Code-based cryptography has been studied since the 1970s, giving it a long track record of cryptanalytic scrutiny despite its large key sizes."
      }
    ]
  },
  "track_c_c10_pqc_attack_surface": {
    "moduleId": "track_c_c10_pqc_attack_surface",
    "title": "C10 Quiz: PQC Attack Surface",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c10-q1",
        "prompt": "What can a side-channel attack extract without breaking the underlying cryptographic math?",
        "options": [
          "Nothing useful",
          "Secret information, by observing unintended physical signals like timing, power, or cache behavior",
          "Only publicly available data",
          "The algorithm's name"
        ],
        "correctIndex": 1,
        "explanation": "Side-channel attacks extract secrets by observing unintended leaked signals (timing, power, cache), not by breaking the underlying math."
      },
      {
        "id": "c10-q2",
        "prompt": "What implementation practice directly defends against timing attacks?",
        "options": [
          "Faster hardware alone",
          "Constant-time design, ensuring execution time doesn't depend on secret data",
          "Using longer keys only",
          "Ignoring the issue since it's rare"
        ],
        "correctIndex": 1,
        "explanation": "Constant-time design ensures execution time is independent of secret data, directly countering timing-based information leakage."
      },
      {
        "id": "c10-q3",
        "prompt": "What is a protocol downgrade attack?",
        "options": [
          "A software update process",
          "An attacker manipulating negotiation to force use of a weaker algorithm than both parties would otherwise agree to",
          "A method for upgrading to PQC safely",
          "A type of side-channel attack"
        ],
        "correctIndex": 1,
        "explanation": "A downgrade attack forces both parties into a weaker algorithm than they'd otherwise negotiate, relevant to PQC migration scenarios."
      },
      {
        "id": "c10-q4",
        "prompt": "Why is randomness quality often a root cause across multiple attack categories?",
        "options": [
          "Randomness quality doesn't matter for security",
          "Weak or predictable randomness can undermine an otherwise mathematically sound scheme entirely, both classical and PQC",
          "Only PQC schemes are affected by randomness weaknesses",
          "Randomness only affects performance, not security"
        ],
        "correctIndex": 1,
        "explanation": "Weak or predictable randomness is one of the most common real-world causes of cryptographic failure across both classical and PQC systems."
      },
      {
        "id": "c10-q5",
        "prompt": "What is a supply-chain risk in the context of PQC deployment?",
        "options": [
          "A shipping delay for hardware",
          "The cryptographic libraries and hardware components an organization depends on could themselves be compromised upstream",
          "A pricing negotiation issue",
          "A type of side-channel attack specifically"
        ],
        "correctIndex": 1,
        "explanation": "Supply-chain risk refers to potential compromise of the upstream libraries or hardware an organization relies on for its PQC implementation."
      }
    ]
  },
  "track_c_c11_pqc_defense_engineering": {
    "moduleId": "track_c_c11_pqc_defense_engineering",
    "title": "C11 Quiz: PQC Defense Engineering",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c11-q1",
        "prompt": "What technique directly defends against fault-injection attacks?",
        "options": [
          "Using longer passwords",
          "Redundant computation and result-verification to detect deliberately or accidentally corrupted computation",
          "Constant-time design alone",
          "Disabling all cryptography"
        ],
        "correctIndex": 1,
        "explanation": "Fault detection via redundant computation and result verification directly defends against fault-injection attacks."
      },
      {
        "id": "c11-q2",
        "prompt": "Why does algorithm agility matter as an ongoing defense principle, even after a successful PQC migration?",
        "options": [
          "It doesn't matter once migration is complete",
          "It allows quick response to a hypothetical future weakness discovered even in a currently-standardized PQC algorithm",
          "Algorithm agility only applies to classical cryptography",
          "It eliminates the need for any future updates ever"
        ],
        "correctIndex": 1,
        "explanation": "Algorithm agility allows an organization to respond quickly if a weakness is ever found in a currently-trusted algorithm, without a full system redesign."
      },
      {
        "id": "c11-q3",
        "prompt": "What is masking, as a side-channel defense technique?",
        "options": [
          "Hiding the source code from developers",
          "Randomizing intermediate computation values to obscure their correlation with secret data",
          "A type of firewall rule",
          "Encrypting the entire hard drive"
        ],
        "correctIndex": 1,
        "explanation": "Masking randomizes intermediate values during computation, obscuring their correlation with secret data to defend against side-channel analysis."
      },
      {
        "id": "c11-q4",
        "prompt": "What does formal verification offer beyond ordinary testing?",
        "options": [
          "It's identical to testing",
          "Mathematically proving an implementation correctly matches its specification, offering stronger assurance against implementation bugs",
          "It only checks code style",
          "It replaces the need for any security review"
        ],
        "correctIndex": 1,
        "explanation": "Formal verification mathematically proves correctness against a specification, offering stronger assurance than testing alone against implementation bugs."
      },
      {
        "id": "c11-q5",
        "prompt": "Why is correctly implemented hybrid deployment currently considered best practice during PQC migration?",
        "options": [
          "It has no security benefit",
          "It hedges against weaknesses in either the classical or the PQC algorithm during the transition period",
          "It's slower with no other benefit",
          "Hybrid deployment is being phased out"
        ],
        "correctIndex": 1,
        "explanation": "Hybrid deployment hedges risk during migration: security holds even if a weakness emerges in either the classical or PQC component."
      }
    ]
  },
  "track_c_c1_advanced_quantum_information": {
    "moduleId": "track_c_c1_advanced_quantum_information",
    "title": "C1 Quiz: Advanced Quantum Information",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c1-q1",
        "prompt": "What formal mathematical setting is quantum mechanics defined in?",
        "options": [
          "Euclidean geometry",
          "Hilbert space",
          "Boolean algebra alone",
          "Cartesian coordinates only"
        ],
        "correctIndex": 1,
        "explanation": "A Hilbert space is the complete, formal complex vector space setting quantum mechanics is defined in."
      },
      {
        "id": "c1-q2",
        "prompt": "What two defining properties must a valid density operator have?",
        "options": [
          "Negative entries and trace of 0",
          "Positive semi-definite and trace equal to 1",
          "Only real number entries",
          "Infinite dimensionality"
        ],
        "correctIndex": 1,
        "explanation": "A density operator must be positive semi-definite with trace equal to 1 to be a valid quantum state description."
      },
      {
        "id": "c1-q3",
        "prompt": "Why must a quantum channel be 'completely positive,' not just 'positive'?",
        "options": [
          "It's not actually required",
          "To correctly describe how the channel acts on part of a larger entangled system",
          "Complete positivity only matters for classical channels",
          "It ensures the channel runs faster"
        ],
        "correctIndex": 1,
        "explanation": "Complete positivity ensures the channel produces valid states even when acting on part of a larger entangled system, a stronger requirement than simple positivity."
      },
      {
        "id": "c1-q4",
        "prompt": "What does Von Neumann entropy quantify?",
        "options": [
          "The temperature of a qubit",
          "The uncertainty or 'mixedness' of a density operator",
          "The speed of a quantum gate",
          "The number of physical qubits available"
        ],
        "correctIndex": 1,
        "explanation": "Von Neumann entropy extends Shannon entropy to quantum states, quantifying uncertainty/mixedness — also used to measure entanglement."
      },
      {
        "id": "c1-q5",
        "prompt": "What does a POVM generalize beyond simple projective measurement?",
        "options": [
          "Nothing new",
          "The most general possible description of a quantum measurement, including imperfect real devices",
          "Only classical measurement",
          "Entanglement generation"
        ],
        "correctIndex": 1,
        "explanation": "A POVM generalizes projective measurement to accurately model the most general, including imperfect, quantum measurement devices."
      }
    ]
  },
  "track_c_c2_advanced_quantum_algorithms": {
    "moduleId": "track_c_c2_advanced_quantum_algorithms",
    "title": "C2 Quiz: Advanced Quantum Algorithms",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c2-q1",
        "prompt": "What proven result distinguishes Grover's quadratic speedup from Shor's exponential speedup?",
        "options": [
          "Both have proven classical-impossibility results",
          "Grover's speedup is proven optimal for unstructured search; Shor's has no such proven classical-impossibility counterpart",
          "Neither speedup has been proven",
          "Shor's speedup is proven optimal, Grover's is not"
        ],
        "correctIndex": 1,
        "explanation": "Grover's quadratic speedup is proven to be the best possible for unstructured search, unlike Shor's exponential speedup which lacks a proven classical-impossibility counterpart."
      },
      {
        "id": "c2-q2",
        "prompt": "What does amplitude estimation combine to estimate an unknown probability efficiently?",
        "options": [
          "Only classical Monte Carlo sampling",
          "Amplitude amplification with phase estimation",
          "Only Grover's algorithm alone",
          "Classical hashing"
        ],
        "correctIndex": 1,
        "explanation": "Amplitude estimation combines amplitude amplification and phase estimation to estimate probabilities with quadratically fewer samples than classical Monte Carlo."
      },
      {
        "id": "c2-q3",
        "prompt": "What structure do VQE and QAOA share as algorithms?",
        "options": [
          "Both are purely classical",
          "Both are hybrid algorithms using a quantum circuit plus classical optimization in an iterative loop",
          "Both require full fault-tolerant error correction",
          "Neither uses any quantum hardware"
        ],
        "correctIndex": 1,
        "explanation": "VQE and QAOA both use a hybrid quantum-classical loop: a quantum circuit for state preparation, and classical optimization to iteratively improve parameters."
      },
      {
        "id": "c2-q4",
        "prompt": "What was Hamiltonian simulation originally proposed as a motivating application for?",
        "options": [
          "Password cracking",
          "Simulating quantum physical systems, as originally proposed by Feynman",
          "Classical web browsing",
          "DNS resolution"
        ],
        "correctIndex": 1,
        "explanation": "Hamiltonian simulation, originally proposed by Feynman, remains a strong candidate application area for genuine quantum advantage, particularly in chemistry and materials science."
      },
      {
        "id": "c2-q5",
        "prompt": "What complexity class formally describes problems quantum computers can efficiently solve?",
        "options": [
          "NP-complete only",
          "BQP",
          "P vs NP is irrelevant here",
          "O(1)"
        ],
        "correctIndex": 1,
        "explanation": "BQP (Bounded-error Quantum Polynomial time) is the complexity class describing problems efficiently solvable by quantum computers."
      }
    ]
  },
  "track_c_c3_quantum_error_correction": {
    "moduleId": "track_c_c3_quantum_error_correction",
    "title": "C3 Quiz: Quantum Error Correction",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c3-q1",
        "prompt": "How many physical qubits does Shor's original quantum error-correcting code use to protect one logical qubit?",
        "options": [
          "3",
          "7",
          "9",
          "27"
        ],
        "correctIndex": 2,
        "explanation": "Shor's 9-qubit code was the first quantum error-correcting code, using 9 physical qubits to correct an arbitrary single-qubit error."
      },
      {
        "id": "c3-q2",
        "prompt": "What family of codes does Steane's 7-qubit code belong to?",
        "options": [
          "Surface codes",
          "CSS (Calderbank-Shor-Steane) codes",
          "Classical Hamming codes only",
          "Repetition codes"
        ],
        "correctIndex": 1,
        "explanation": "Steane's code belongs to the CSS code family, constructing quantum codes directly from pairs of classical error-correcting codes."
      },
      {
        "id": "c3-q3",
        "prompt": "What does the stabilizer formalism allow, without directly measuring (and destroying) protected quantum information?",
        "options": [
          "Faster classical computation",
          "Revealing error information via measurement operators called stabilizers",
          "Deleting qubits safely",
          "Bypassing the no-cloning theorem"
        ],
        "correctIndex": 1,
        "explanation": "Stabilizer formalism uses measurement operators (stabilizers) whose outcomes reveal error information without destroying the protected quantum data."
      },
      {
        "id": "c3-q4",
        "prompt": "What does the quantum threshold theorem prove?",
        "options": [
          "Quantum error correction is theoretically impossible",
          "If physical error rate is below a threshold, arbitrarily reliable long computation becomes possible with enough error-correction overhead",
          "All quantum computers already exceed the threshold",
          "Error correction requires no additional qubits"
        ],
        "correctIndex": 1,
        "explanation": "The threshold theorem proves that below a certain physical error rate, adding sufficient error-correction overhead makes arbitrarily long reliable computation possible."
      },
      {
        "id": "c3-q5",
        "prompt": "Why do surface codes require only nearest-neighbor qubit interactions?",
        "options": [
          "This is a disadvantage with no benefit",
          "It's a major practical advantage given real hardware connectivity constraints",
          "Surface codes don't actually require this",
          "It makes the code less scalable"
        ],
        "correctIndex": 1,
        "explanation": "Surface codes' 2D nearest-neighbor structure is a major practical advantage, matching realistic hardware connectivity limitations."
      }
    ]
  },
  "track_c_c4_quantum_networking": {
    "moduleId": "track_c_c4_quantum_networking",
    "title": "C4 Quiz: Quantum Networking",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c4-q1",
        "prompt": "Does quantum teleportation violate relativity by transmitting information faster than light?",
        "options": [
          "Yes, it transmits information instantly with no limits",
          "No — it requires a classical communication channel, limiting it to no faster than light speed",
          "Teleportation transmits physical matter, not information",
          "Teleportation has never been demonstrated"
        ],
        "correctIndex": 1,
        "explanation": "Quantum teleportation requires classical communication alongside pre-shared entanglement, so it cannot exceed light speed and doesn't violate relativity."
      },
      {
        "id": "c4-q2",
        "prompt": "Why can't quantum repeaters simply amplify a quantum signal like classical repeaters?",
        "options": [
          "Amplification is easy and commonly used",
          "The no-cloning theorem prevents simply copying/amplifying an unknown quantum state",
          "Quantum signals don't degrade over distance",
          "Repeaters aren't needed for quantum networks"
        ],
        "correctIndex": 1,
        "explanation": "The no-cloning theorem prevents simple amplification, so quantum repeaters use entanglement swapping instead."
      },
      {
        "id": "c4-q3",
        "prompt": "What technique allows entanglement to be extended between two parties who never directly interacted?",
        "options": [
          "Direct photon transmission only",
          "Entanglement swapping via an intermediate node with a joint measurement",
          "Classical signal boosting",
          "Quantum teleportation of matter"
        ],
        "correctIndex": 1,
        "explanation": "Entanglement swapping uses an intermediate node and joint measurement to extend entanglement between parties who never directly interacted."
      },
      {
        "id": "c4-q4",
        "prompt": "What is the practical role of a quantum memory in a repeater network?",
        "options": [
          "Permanently storing classical passwords",
          "Temporarily storing a quantum state long enough to synchronize repeater operations",
          "Replacing the need for entanglement entirely",
          "Speeding up classical internet traffic"
        ],
        "correctIndex": 1,
        "explanation": "Quantum memories temporarily store quantum states to synchronize timing across a quantum repeater network."
      },
      {
        "id": "c4-q5",
        "prompt": "Roughly what distance does direct fiber-based entanglement distribution become impractical past, without repeaters?",
        "options": [
          "1 meter",
          "Roughly 100km due to photon loss",
          "10,000km",
          "There is no distance limit"
        ],
        "correctIndex": 1,
        "explanation": "Photon loss in fiber makes direct entanglement distribution impractical past roughly 100km without quantum repeaters."
      }
    ]
  },
  "track_c_c5_quantum_communications": {
    "moduleId": "track_c_c5_quantum_communications",
    "title": "C5 Quiz: Quantum Communications",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c5-q1",
        "prompt": "How much classical information can superdense coding transmit using one qubit and one pre-shared entangled pair?",
        "options": [
          "0.5 classical bits",
          "1 classical bit",
          "2 classical bits",
          "4 classical bits"
        ],
        "correctIndex": 2,
        "explanation": "Superdense coding transmits 2 classical bits using one qubit transmission plus pre-shared entanglement — twice the capacity of an unentangled qubit."
      },
      {
        "id": "c5-q2",
        "prompt": "What resource cost does quantum teleportation require to transmit one qubit's worth of information?",
        "options": [
          "No resources at all",
          "One shared entangled pair and 2 classical bits of communication",
          "Only a classical bit, no entanglement needed",
          "10 entangled pairs"
        ],
        "correctIndex": 1,
        "explanation": "Teleportation consumes one shared entangled pair and requires transmitting 2 classical bits to convey one qubit's quantum information."
      },
      {
        "id": "c5-q3",
        "prompt": "Why does no-cloning force quantum communication protocols to be designed around 'consuming' entanglement resources?",
        "options": [
          "Entanglement can be freely duplicated",
          "Because quantum information cannot be copied, so it must be consumed/used directly rather than amplified or duplicated",
          "No-cloning doesn't affect communication protocols",
          "Classical communication has the same restriction"
        ],
        "correctIndex": 1,
        "explanation": "Since quantum information can't be copied, protocols must consume entanglement resources directly rather than duplicating signals as classical systems do."
      },
      {
        "id": "c5-q4",
        "prompt": "What is a key advantage of satellite-based quantum communication over pure fiber-based approaches?",
        "options": [
          "Satellites have no distance limitations at all",
          "Free-space links avoid the cumulative photon loss of long fiber runs, enabling longer-range entanglement distribution",
          "Satellites are cheaper than fiber",
          "Satellites don't use photons"
        ],
        "correctIndex": 1,
        "explanation": "Satellite links avoid cumulative fiber photon loss, enabling demonstrated longer-range entanglement distribution than fiber alone currently achieves."
      },
      {
        "id": "c5-q5",
        "prompt": "What two metrics determine a real quantum communication system's performance?",
        "options": [
          "Screen brightness and battery life",
          "Entanglement distribution rate and fidelity",
          "CPU clock speed and RAM",
          "Only cost"
        ],
        "correctIndex": 1,
        "explanation": "Entanglement distribution rate (pairs generated per second) and fidelity (closeness to perfect entanglement) are the key performance metrics."
      }
    ]
  },
  "track_c_c6_quantum_key_distribution": {
    "moduleId": "track_c_c6_quantum_key_distribution",
    "title": "C6 Quiz: Quantum Key Distribution",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c6-q1",
        "prompt": "What physical principle does BB84's security rest on?",
        "options": [
          "RSA factoring difficulty",
          "The no-cloning theorem — an eavesdropper measuring photons in transit introduces detectable errors",
          "AES key length",
          "Classical firewall rules"
        ],
        "correctIndex": 1,
        "explanation": "BB84's security stems from the no-cloning theorem: an eavesdropper cannot measure transmitted photons without introducing detectable errors."
      },
      {
        "id": "c6-q2",
        "prompt": "What makes E91 different from BB84 in its foundational mechanism?",
        "options": [
          "E91 uses no photons",
          "E91 is built on shared entanglement and Bell inequality violations, rather than single photons in random bases",
          "E91 doesn't require any security proof",
          "E91 is identical to BB84"
        ],
        "correctIndex": 1,
        "explanation": "E91 uses entanglement and Bell inequality violations to establish a key and prove the absence of eavesdropping, unlike BB84's single-photon-basis approach."
      },
      {
        "id": "c6-q3",
        "prompt": "What real-world vulnerability does Measurement-Device-Independent QKD (MDI-QKD) specifically address?",
        "options": [
          "Vulnerabilities in the classical internet",
          "Vulnerabilities in the measurement devices used in standard QKD implementations",
          "Weaknesses in RSA factoring",
          "AES key length weaknesses"
        ],
        "correctIndex": 1,
        "explanation": "MDI-QKD addresses measurement-device vulnerabilities, a common real-world attack surface in standard QKD hardware implementations."
      },
      {
        "id": "c6-q4",
        "prompt": "Why is QKD generally considered less practical for internet-scale deployment than PQC?",
        "options": [
          "QKD is actually more scalable than PQC",
          "QKD requires specialized hardware, has distance limitations, and doesn't easily support many-to-many communication patterns",
          "PQC requires special satellites",
          "There is no meaningful difference in deployability"
        ],
        "correctIndex": 1,
        "explanation": "QKD's hardware requirements, distance limitations, and difficulty scaling to many-to-many communication make it less practical for internet-scale deployment than PQC."
      },
      {
        "id": "c6-q5",
        "prompt": "What does QKD alone NOT provide, even when properly implemented?",
        "options": [
          "Key distribution security",
          "The actual encryption of data itself, which still relies on a classical symmetric algorithm like AES",
          "Physics-based security guarantees",
          "Eavesdropping detection"
        ],
        "correctIndex": 1,
        "explanation": "QKD only secures key distribution — actual data encryption still relies on a classical symmetric algorithm like AES using the distributed key."
      }
    ]
  },
  "track_c_c7_advanced_cryptography": {
    "moduleId": "track_c_c7_advanced_cryptography",
    "title": "C7 Quiz: Advanced Cryptography",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c7-q1",
        "prompt": "What formal security notion is the gold standard for modern KEMs like ML-KEM?",
        "options": [
          "IND-CCA2 (indistinguishability under adaptive chosen-ciphertext attack)",
          "Simple key length",
          "Password complexity",
          "Certificate expiration date"
        ],
        "correctIndex": 0,
        "explanation": "IND-CCA2 security is the standard modern KEMs, including ML-KEM, are designed and formally proven against."
      },
      {
        "id": "c7-q2",
        "prompt": "What does 'provable security' mean in cryptography?",
        "options": [
          "A scheme has never been attacked",
          "Reducing a scheme's security to the hardness of a well-studied mathematical problem via a formal proof",
          "The scheme is open-source",
          "The scheme runs quickly"
        ],
        "correctIndex": 1,
        "explanation": "Provable security means formally reducing a scheme's security to a well-studied hard math problem, rather than relying on the absence of known attacks alone."
      },
      {
        "id": "c7-q3",
        "prompt": "What historically underestimated topic is a frequent real-world cause of cryptographic failure?",
        "options": [
          "Algorithm marketing",
          "Weak or poor-quality randomness during key generation",
          "Too much documentation",
          "Overly long key sizes"
        ],
        "correctIndex": 1,
        "explanation": "Weak randomness during key generation is a frequently underestimated but historically significant cause of real-world cryptographic failures."
      },
      {
        "id": "c7-q4",
        "prompt": "What does EUF-CMA stand for and apply to?",
        "options": [
          "A network protocol",
          "Existential Unforgeability under Chosen-Message Attack — a formal signature security notion",
          "A type of hash function",
          "An encryption mode"
        ],
        "correctIndex": 1,
        "explanation": "EUF-CMA (Existential Unforgeability under Chosen-Message Attack) is the standard formal security proof target for signature schemes."
      },
      {
        "id": "c7-q5",
        "prompt": "Why can protocol-level attacks succeed even when no individual cryptographic primitive is weak?",
        "options": [
          "This is impossible",
          "Composition security issues can emerge purely from how primitives are combined into a protocol",
          "Protocols never have vulnerabilities",
          "Only weak primitives can ever cause protocol failures"
        ],
        "correctIndex": 1,
        "explanation": "Protocol-level attacks can exploit how individually-secure primitives are combined, independent of any single primitive's own weakness."
      }
    ]
  },
  "track_c_c8_pqc_mathematics": {
    "moduleId": "track_c_c8_pqc_mathematics",
    "title": "C8 Quiz: PQC Mathematics",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c8-q1",
        "prompt": "What hardness assumption is ML-KEM and ML-DSA specifically built on?",
        "options": [
          "Plain integer factoring",
          "Module-LWE (Module Learning With Errors)",
          "Discrete logarithm over elliptic curves",
          "Simple hash collision"
        ],
        "correctIndex": 1,
        "explanation": "ML-KEM and ML-DSA are built on Module-LWE, explaining the 'Module-Lattice' in both algorithms' full names."
      },
      {
        "id": "c8-q2",
        "prompt": "What makes the Learning With Errors (LWE) problem hard, distinct from a simple system of linear equations?",
        "options": [
          "Nothing, it's the same as linear equations",
          "Deliberately introduced 'noise' in the equations, making it provably as hard as certain worst-case lattice problems",
          "It uses only positive numbers",
          "It has no mathematical basis"
        ],
        "correctIndex": 1,
        "explanation": "The deliberate noise in LWE's equations is what makes recovering the secret provably hard, unlike solving clean linear equations."
      },
      {
        "id": "c8-q3",
        "prompt": "What data structure do hash-based signature schemes like SLH-DSA build on?",
        "options": [
          "A binary search tree of passwords",
          "A Merkle tree combining one-time signature keypairs",
          "A lattice basis directly",
          "A classical linked list"
        ],
        "correctIndex": 1,
        "explanation": "Hash-based signatures combine one-time signature schemes with a Merkle tree structure to build a full, reusable signature scheme."
      },
      {
        "id": "c8-q4",
        "prompt": "What underlies the security of code-based cryptography like the McEliece cryptosystem?",
        "options": [
          "The syndrome decoding problem for general linear codes",
          "RSA factoring",
          "AES key length",
          "Hash collision resistance"
        ],
        "correctIndex": 0,
        "explanation": "Code-based cryptography's security rests on the syndrome decoding problem, believed hard for both classical and quantum computers."
      },
      {
        "id": "c8-q5",
        "prompt": "What tradeoff does Ring-LWE offer compared to plain LWE?",
        "options": [
          "No tradeoffs exist",
          "Significant efficiency and key-size improvements, at the cost of relying on a more structured (and more studied for potential weaknesses) problem",
          "Ring-LWE is strictly worse in every way",
          "Ring-LWE requires quantum hardware to use"
        ],
        "correctIndex": 1,
        "explanation": "Ring-LWE offers efficiency gains over plain LWE by using structured polynomial rings, trading some conservatism for performance."
      }
    ]
  },
  "track_c_c9_pqc_implementation_engineering": {
    "moduleId": "track_c_c9_pqc_implementation_engineering",
    "title": "C9 Quiz: PQC Implementation Engineering",
    "difficulty": "quantum_expert",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "c9-q1",
        "prompt": "Why must decapsulation failure be handled carefully in lattice-based KEMs like ML-KEM?",
        "options": [
          "Decapsulation never fails in lattice-based KEMs",
          "Due to the LWE noise term, decapsulation can rarely fail even with correct keys, requiring careful handling to avoid security weaknesses",
          "It only affects hash-based schemes",
          "Failure handling is not a security concern"
        ],
        "correctIndex": 1,
        "explanation": "The LWE noise term can rarely cause decapsulation to fail even with correct keys, and mishandling this can introduce security weaknesses."
      },
      {
        "id": "c9-q2",
        "prompt": "What deployment consideration is especially relevant to SLH-DSA due to its larger signature sizes?",
        "options": [
          "It has no memory implications",
          "Memory-constrained environments like embedded devices or smart cards may struggle with the larger signature/key sizes",
          "SLH-DSA has the smallest signatures of any PQC scheme",
          "It only affects desktop computers"
        ],
        "correctIndex": 1,
        "explanation": "SLH-DSA's larger signature sizes create real memory considerations for constrained environments like embedded devices."
      },
      {
        "id": "c9-q3",
        "prompt": "What is the purpose of known-answer tests in PQC deployment testing?",
        "options": [
          "To measure code readability",
          "Verifying an implementation's output against official test vectors",
          "To test network speed only",
          "To replace the need for any other testing"
        ],
        "correctIndex": 1,
        "explanation": "Known-answer tests verify that an implementation produces output matching official test vectors, a core part of deployment testing."
      },
      {
        "id": "c9-q4",
        "prompt": "Why does good API design matter for reducing PQC implementation vulnerabilities?",
        "options": [
          "API design has no security impact",
          "Well-designed APIs make the correct, secure usage pattern the easy default, reducing misuse-driven vulnerabilities",
          "APIs only affect performance, not security",
          "Complex APIs are always more secure"
        ],
        "correctIndex": 1,
        "explanation": "Good API design makes secure usage the easy default, structurally reducing the chance of implementation-level vulnerabilities from misuse."
      },
      {
        "id": "c9-q5",
        "prompt": "Why is interoperability testing important for PQC deployment?",
        "options": [
          "It's unnecessary since all implementations are identical",
          "Independent implementations from different vendors/libraries must correctly interoperate for real-world multi-vendor deployment",
          "Interoperability only matters for classical algorithms",
          "It only applies to a single vendor's software"
        ],
        "correctIndex": 1,
        "explanation": "Real-world deployments often involve a client and server using different software libraries, making interoperability testing essential."
      }
    ]
  },
  "track_d_e1_quantum_risk_management": {
    "moduleId": "track_d_e1_quantum_risk_management",
    "title": "E1 Quiz: Quantum Risk Management",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e1-q1",
        "prompt": "Why is translating technical quantum threats into business-impact terms important?",
        "options": [
          "It's unnecessary — executives understand factoring algorithms directly",
          "It secures executive buy-in and budget by framing risk in terms of financial loss, regulatory penalty, and reputational damage",
          "Technical framing is always more persuasive",
          "Business impact framing is only for marketing purposes"
        ],
        "correctIndex": 1,
        "explanation": "Business-impact framing (financial, regulatory, reputational) is the language that secures executive buy-in and budget for migration work."
      },
      {
        "id": "e1-q2",
        "prompt": "What two inputs determine an asset's HNDL exposure?",
        "options": [
          "Data sensitivity and required confidentiality lifetime",
          "Server color and physical location only",
          "Employee headcount",
          "Marketing budget"
        ],
        "correctIndex": 0,
        "explanation": "Data sensitivity (how damaging exposure would be) and confidentiality lifetime (how long it must stay protected) together determine HNDL exposure."
      },
      {
        "id": "e1-q3",
        "prompt": "Why must third-party vendor dependencies be included in organizational risk modeling?",
        "options": [
          "Vendors never handle sensitive data",
          "Vendors and partners handling sensitive data introduce dependency risk that must be assessed and contractually addressed",
          "Third parties are outside the scope of any risk model",
          "Only internal systems carry any risk"
        ],
        "correctIndex": 1,
        "explanation": "Vendor and partner dependencies introduce real organizational risk that must be assessed and addressed, often through contractual requirements."
      },
      {
        "id": "e1-q4",
        "prompt": "What three factors combine into a structured organizational risk model?",
        "options": [
          "Employee satisfaction, office location, budget",
          "Threat likelihood, data sensitivity/lifetime, and system criticality",
          "Marketing reach, brand recognition, stock price",
          "None of the above"
        ],
        "correctIndex": 1,
        "explanation": "A structured risk model combines threat likelihood, data sensitivity/lifetime, and system criticality into a scored output."
      },
      {
        "id": "e1-q5",
        "prompt": "What does this module's risk model directly mirror in the Q-CAPS platform itself?",
        "options": [
          "Nothing related",
          "The readiness/risk scoring approach used in Q-CAPS's own Organization module",
          "Only the login page design",
          "The quiz difficulty levels"
        ],
        "correctIndex": 1,
        "explanation": "This structured risk-scoring approach directly mirrors the readiness scoring used in Q-CAPS's own Organization module."
      }
    ]
  },
  "track_d_e2_cryptographic_discovery": {
    "moduleId": "track_d_e2_cryptographic_discovery",
    "title": "E2 Quiz: Cryptographic Discovery",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e2-q1",
        "prompt": "What is the foundational artifact that grounds all later risk modeling and migration planning?",
        "options": [
          "A marketing brochure",
          "A comprehensive cryptographic inventory",
          "An employee handbook",
          "A social media policy"
        ],
        "correctIndex": 1,
        "explanation": "The cryptographic inventory — a comprehensive record of algorithms, keys, certificates, and protocols in use — grounds all subsequent risk and migration work."
      },
      {
        "id": "e2-q2",
        "prompt": "What makes asset discovery surprisingly difficult at enterprise scale?",
        "options": [
          "Assets never change over time",
          "'Shadow IT' (unofficial, unregistered systems) and forgotten legacy infrastructure",
          "There are usually very few systems to find",
          "Discovery is fully automated with no challenges"
        ],
        "correctIndex": 1,
        "explanation": "Shadow IT and forgotten legacy systems make comprehensive asset discovery a genuinely difficult enterprise-scale problem."
      },
      {
        "id": "e2-q3",
        "prompt": "What does dependency mapping reveal that a simple inventory list does not?",
        "options": [
          "Nothing additional",
          "The relationships between assets — which applications depend on which certificates or services",
          "Only the total number of assets",
          "Employee names"
        ],
        "correctIndex": 1,
        "explanation": "Dependency mapping traces relationships between assets, revealing the true blast radius of migrating (or not migrating) any single component."
      },
      {
        "id": "e2-q4",
        "prompt": "Which discovery category is often the hardest, requiring source-code or binary analysis rather than observing network traffic?",
        "options": [
          "Certificate discovery",
          "Application discovery (cryptography embedded directly in source code)",
          "Protocol discovery",
          "Asset discovery"
        ],
        "correctIndex": 1,
        "explanation": "Application discovery — finding cryptography embedded in source code — is often the hardest category since it can't be found by simply observing network traffic."
      },
      {
        "id": "e2-q5",
        "prompt": "What organizational process does this module describe at the process level that Inba's scanner automates technically?",
        "options": [
          "Employee onboarding",
          "Cryptographic discovery — algorithm, certificate, and protocol identification",
          "Payroll processing",
          "Marketing analytics"
        ],
        "correctIndex": 1,
        "explanation": "This module describes the organizational process that Inba's scanner engine automates at the technical level."
      }
    ]
  },
  "track_d_e3_quantum_readiness_assessment": {
    "moduleId": "track_d_e3_quantum_readiness_assessment",
    "title": "E3 Quiz: Quantum Readiness Assessment",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e3-q1",
        "prompt": "Why should assessment inventory be organized by business function and criticality, not just technical category?",
        "options": [
          "Technical categorization is always sufficient",
          "So the assessment output is meaningful to both technical and executive audiences",
          "Business function is irrelevant to security",
          "This makes the assessment less accurate"
        ],
        "correctIndex": 1,
        "explanation": "Organizing by business function and criticality makes the assessment meaningful to both technical teams and executive stakeholders."
      },
      {
        "id": "e3-q2",
        "prompt": "What does readiness maturity assessment evaluate, beyond individual asset risk scores?",
        "options": [
          "Only the CEO's opinion",
          "Whether the organization has crypto-agility, discovery processes, and governance already in place",
          "Employee vacation days",
          "Office building security only"
        ],
        "correctIndex": 1,
        "explanation": "Readiness maturity assessment evaluates organizational capability — crypto-agility, discovery processes, governance — not just individual asset scores."
      },
      {
        "id": "e3-q3",
        "prompt": "What Q-CAPS platform field does this module's risk-scoring methodology directly mirror?",
        "options": [
          "The user's email address",
          "The readiness_score field in the shared data schema",
          "The badge icon color",
          "The login timestamp"
        ],
        "correctIndex": 1,
        "explanation": "This module's risk scoring directly mirrors the readiness_score concept from Q-CAPS's own shared data schema."
      },
      {
        "id": "e3-q4",
        "prompt": "What determines which assets rank highest for migration priority?",
        "options": [
          "Random selection",
          "High criticality, long-lived sensitive data, and weak existing cryptography",
          "Alphabetical order of asset names",
          "Whichever system was purchased most recently"
        ],
        "correctIndex": 1,
        "explanation": "Assets combining high criticality, long-lived sensitive data, and weak cryptography rank highest for migration priority."
      },
      {
        "id": "e3-q5",
        "prompt": "What does the readiness assessment module's output directly feed into?",
        "options": [
          "Nothing further in the program",
          "The draft migration plan developed fully in the Enterprise PQC Migration module",
          "Only the quiz scoring system",
          "Employee performance reviews"
        ],
        "correctIndex": 1,
        "explanation": "The readiness assessment's outputs feed directly into the draft migration plan, bridging assessment and execution."
      }
    ]
  },
  "track_d_e4_crypto_agility": {
    "moduleId": "track_d_e4_crypto_agility",
    "title": "E4 Quiz: Crypto-Agility",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e4-q1",
        "prompt": "What is the single most important design decision determining how painful a future algorithm swap will be?",
        "options": [
          "The office layout",
          "Algorithm abstraction — never hardcoding a specific algorithm into business logic",
          "The marketing budget",
          "The number of employees"
        ],
        "correctIndex": 1,
        "explanation": "Algorithm abstraction is the foundational architectural pattern determining how easily an organization can swap algorithms in the future."
      },
      {
        "id": "e4-q2",
        "prompt": "What does configuration-driven algorithm selection enable?",
        "options": [
          "Nothing useful",
          "An algorithm swap via configuration change and redeployment, rather than a full code rewrite",
          "Faster internet speeds",
          "Automatic password resets"
        ],
        "correctIndex": 1,
        "explanation": "Configuration-driven algorithm selection allows swapping algorithms through configuration changes rather than rewriting code."
      },
      {
        "id": "e4-q3",
        "prompt": "What does certificate agility directly enable, connecting to earlier PQC migration content?",
        "options": [
          "Faster certificate expiration",
          "Issuing and rotating certificates using multiple algorithm types concurrently, enabling hybrid approaches",
          "Removing the need for certificates entirely",
          "Slower certificate deployment"
        ],
        "correctIndex": 1,
        "explanation": "Certificate agility enables hybrid certificate deployment by supporting multiple algorithm types concurrently."
      },
      {
        "id": "e4-q4",
        "prompt": "What genuine architectural constraint can pure software agility NOT fully solve?",
        "options": [
          "There are no such constraints",
          "Hardware limitations, like HSMs or embedded devices with fixed cryptographic capabilities",
          "Software bugs",
          "Employee training gaps"
        ],
        "correctIndex": 1,
        "explanation": "Fixed hardware capabilities (HSMs, embedded devices) represent a real constraint that software-level agility alone cannot fully resolve."
      },
      {
        "id": "e4-q5",
        "prompt": "What common real-world scenario does this module's guidance on retrofitting agility address?",
        "options": [
          "Building brand-new systems only",
          "Existing systems that weren't originally designed with crypto-agility in mind",
          "Systems that don't use any cryptography",
          "Marketing website design"
        ],
        "correctIndex": 1,
        "explanation": "Most organizations face the challenge of retrofitting crypto-agility into existing systems not originally designed with it in mind."
      }
    ]
  },
  "track_d_e5_enterprise_pqc_migration": {
    "moduleId": "track_d_e5_enterprise_pqc_migration",
    "title": "E5 Quiz: Enterprise PQC Migration",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e5-q1",
        "prompt": "What is the correct order of the 12-phase enterprise migration process?",
        "options": [
          "Migrate first, then discover assets afterward",
          "Discover, Inventory, Classify, Risk-Rank, Select PQC, Prototype, Benchmark, Pilot, Hybrid Migration, Production Rollout, Monitor, Retire",
          "Retire, then discover",
          "Random order, sequence doesn't matter"
        ],
        "correctIndex": 1,
        "explanation": "The migration process follows a specific sequence: Discover through Retire, ensuring each phase's output grounds the next."
      },
      {
        "id": "e5-q2",
        "prompt": "Why do most organizations migrate through hybrid cryptography rather than a direct cutover?",
        "options": [
          "Hybrid is always slower with no benefit",
          "It maintains security even if unexpected issues emerge with the newer PQC components",
          "Direct cutover is always safer",
          "Hybrid cryptography is required by law"
        ],
        "correctIndex": 1,
        "explanation": "Hybrid migration maintains security through the transition, hedging against unexpected issues with newly deployed PQC components."
      },
      {
        "id": "e5-q3",
        "prompt": "What is the purpose of the 'Pilot' phase before full production rollout?",
        "options": [
          "To skip testing entirely",
          "Validating real-world behavior and interoperability on a limited, monitored subset before full deployment",
          "To announce the migration publicly",
          "To reduce the migration budget"
        ],
        "correctIndex": 1,
        "explanation": "Piloting validates real-world behavior on a limited scope, catching issues with limited blast radius before full rollout."
      },
      {
        "id": "e5-q4",
        "prompt": "What is the final phase, often delayed too long in practice?",
        "options": [
          "Discover",
          "Retire vulnerable cryptography",
          "Prototype",
          "Classify"
        ],
        "correctIndex": 1,
        "explanation": "Retiring the classical-only fallback is the final phase, often delayed in practice even after hybrid deployment has proven stable."
      },
      {
        "id": "e5-q5",
        "prompt": "What ongoing activity does the 'Monitor' phase feed back into?",
        "options": [
          "Nothing further",
          "The readiness assessment process, as an ongoing cycle rather than a one-time project",
          "Only the marketing team",
          "Employee performance reviews"
        ],
        "correctIndex": 1,
        "explanation": "Monitoring feeds back into the readiness assessment process, reflecting that migration is an ongoing cycle, not a single event."
      }
    ]
  },
  "track_d_e6_governance": {
    "moduleId": "track_d_e6_governance",
    "title": "E6 Quiz: Governance",
    "difficulty": "professional",
    "passingScorePercent": 70,
    "questions": [
      {
        "id": "e6-q1",
        "prompt": "Why does a migration project need a formal quantum-readiness policy rather than just a technical project plan?",
        "options": [
          "Policy is purely symbolic",
          "It institutionalizes the effort, ensuring it outlasts any single project team or budget cycle",
          "Technical plans are always sufficient alone",
          "Policy replaces the need for any technical work"
        ],
        "correctIndex": 1,
        "explanation": "Formal policy turns a technical project into an institutionalized, ongoing organizational priority beyond any single team or budget cycle."
      },
      {
        "id": "e6-q2",
        "prompt": "What tends to happen to a well-designed migration plan without clear risk ownership?",
        "options": [
          "It always succeeds regardless",
          "It tends to stall, since no one is accountable for driving it forward against competing priorities",
          "Ownership doesn't affect outcomes",
          "It automatically completes itself"
        ],
        "correctIndex": 1,
        "explanation": "Without a named accountable owner, even a well-designed plan tends to stall against competing organizational priorities."
      },
      {
        "id": "e6-q3",
        "prompt": "What does embedding cryptographic requirements into procurement processes prevent?",
        "options": [
          "Nothing meaningful",
          "New systems entering the organization non-agile and non-PQC-capable, adding to future migration debt",
          "Faster hardware purchases",
          "Vendor relationships"
        ],
        "correctIndex": 1,
        "explanation": "Procurement requirements ensure new systems arrive crypto-agile and PQC-capable, preventing them from adding to future migration debt."
      },
      {
        "id": "e6-q4",
        "prompt": "What increasingly common driver is making PQC migration timelines externally mandated in some industries?",
        "options": [
          "Social media trends",
          "Regulatory and compliance requirements in regulated industries like finance, healthcare, government",
          "Weather patterns",
          "Employee preferences"
        ],
        "correctIndex": 1,
        "explanation": "Compliance requirements in regulated industries are increasingly making PQC migration externally mandated rather than purely voluntary."
      },
      {
        "id": "e6-q5",
        "prompt": "What is the highest-level certificate awarded upon full program completion, spanning all tracks?",
        "options": [
          "CQF only",
          "PQCTP — Professional Quantum Computing & Quantum-Safe Technology Professional",
          "QSA only",
          "There is no final certificate"
        ],
        "correctIndex": 1,
        "explanation": "PQCTP is the program's highest-level certification, awarded after progressing through the Shared Professional Core following Track D completion."
      }
    ]
  }
};
