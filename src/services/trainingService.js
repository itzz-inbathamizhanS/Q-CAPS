// src/services/trainingService.js

export const trainingCourses = [
    {
        id: "tc_qf",
        title: "Quantum Fundamentals",
        description: "Learn the basics of quantum computing, qubits, superposition, and entanglement.",
        duration: "2 hours",
        topic: "quantum_fundamentals"
    },
    {
        id: "tc_pqc",
        title: "Introduction to Post-Quantum Cryptography",
        description: "Deep dive into ML-KEM and ML-DSA, understanding the math behind lattice-based cryptography.",
        duration: "4 hours",
        topic: "pqc"
    },
    {
        id: "tc_ca",
        title: "Cryptographic Agility & Migration",
        description: "How to inventory existing crypto assets and plan a migration strategy for your organization.",
        duration: "3 hours",
        topic: "practical_security"
    }
];

export const getCompletedCourses = () => {
    return JSON.parse(localStorage.getItem("qcapsCompletedCourses")) || [];
};

export const markCourseCompleted = (courseId, topic) => {
    const completed = getCompletedCourses();
    
    if (!completed.includes(courseId)) {
        completed.push(courseId);
        localStorage.setItem("qcapsCompletedCourses", JSON.stringify(completed));

        // When a course is completed, automatically boost the score for that topic in the readiness profile
        const storedScores = JSON.parse(localStorage.getItem("qcapsScores")) || {};
        const currentScore = storedScores[topic] || 0;
        
        // Boost score, maxing out at 100
        storedScores[topic] = Math.min(100, currentScore + 20); 
        
        // Update overall score as an average
        const totalTopics = Object.keys(storedScores).length;
        const overall = totalTopics > 0 ? Math.round(Object.values(storedScores).reduce((a, b) => a + b, 0) / totalTopics) : 0;
        
        localStorage.setItem("qcapsScores", JSON.stringify(storedScores));
        localStorage.setItem("qcapsOverallScore", overall);
    }
    
    return completed;
};
