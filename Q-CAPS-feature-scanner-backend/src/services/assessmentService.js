export const assessmentQuestions = {
  quantum_fundamentals: [
    {
      id: "qf1",
      question: "What is the basic unit of information in quantum computing?",
      options: ["Bit", "Byte", "Qubit", "Quantum Gate"],
      correctAnswer: "Qubit",
    },
    {
      id: "qf2",
      question: "Which quantum algorithm poses a significant threat to RSA encryption?",
      options: ["Grover's Algorithm", "Shor's Algorithm", "Simon's Algorithm", "Deutsch-Jozsa Algorithm"],
      correctAnswer: "Shor's Algorithm",
    }
  ],
  classical_crypto: [
    {
      id: "cc1",
      question: "Which of the following is a symmetric key algorithm?",
      options: ["RSA", "ECC", "AES", "Diffie-Hellman"],
      correctAnswer: "AES",
    }
  ],
  pqc: [
    {
      id: "pqc1",
      question: "Which NIST standardized algorithm is designed for general encryption (Key Encapsulation)?",
      options: ["ML-DSA", "ML-KEM", "SLH-DSA", "RSA-4096"],
      correctAnswer: "ML-KEM",
    },
    {
      id: "pqc2",
      question: "What mathematical problem does ML-KEM rely on?",
      options: ["Integer Factorization", "Discrete Logarithm", "Learning With Errors (LWE) over module lattices", "Elliptic Curves"],
      correctAnswer: "Learning With Errors (LWE) over module lattices",
    }
  ],
  practical_security: [
    {
      id: "ps1",
      question: "What is the primary goal of cryptographic agility?",
      options: ["To encrypt data faster", "To use multiple algorithms at once", "To easily replace outdated cryptographic algorithms without major infrastructure changes", "To break quantum algorithms"],
      correctAnswer: "To easily replace outdated cryptographic algorithms without major infrastructure changes",
    }
  ]
};

export const submitAssessment = (topic, answers) => {
  const questions = assessmentQuestions[topic];
  if (!questions) return { score: 0, total: 0 };

  let correctCount = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  
  // Save to local storage mock profile
  const storedScores = JSON.parse(localStorage.getItem("qcapsScores")) || {};
  storedScores[topic] = percentage;
  
  // Update overall score as an average
  const totalTopics = Object.keys(storedScores).length;
  const overall = Math.round(Object.values(storedScores).reduce((a, b) => a + b, 0) / totalTopics);
  
  localStorage.setItem("qcapsScores", JSON.stringify(storedScores));
  localStorage.setItem("qcapsOverallScore", overall);

  return {
    score: percentage,
    correctCount,
    total: questions.length
  };
};

export const getScores = () => {
  return {
    topics: JSON.parse(localStorage.getItem("qcapsScores")) || {},
    overall: parseInt(localStorage.getItem("qcapsOverallScore") || "0", 10)
  };
};
