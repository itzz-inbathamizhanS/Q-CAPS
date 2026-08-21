// src/components/ReadinessReport.jsx
import React, { useState, useEffect } from 'react';
import { getScores } from '../services/assessmentService';

const getLevelText = (score) => {
    if (score === undefined || score === null) return <span className="text-gray-500 italic">Not Started</span>;
    if (score < 40) return <span className="text-red-600 font-semibold">Beginner ({score}%)</span>;
    if (score < 80) return <span className="text-yellow-600 font-semibold">Intermediate ({score}%)</span>;
    return <span className="text-green-600 font-semibold">Advanced ({score}%)</span>;
};

const ReadinessReport = () => {
    const [scores, setScores] = useState({ topics: {}, overall: 0 });

    useEffect(() => {
        setScores(getScores());
    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Readiness Report</h2>
            <p className="text-gray-700 mb-6">Your individualized competency profile based on diagnostic assessments, practical labs, and cryptographic scanning.</p>
            
            <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Overall Score: <span className="text-blue-600">{scores.overall}%</span></h3>
            </div>

            <ul className="list-disc pl-5 space-y-3">
                <li><strong>Quantum Fundamentals:</strong> {getLevelText(scores.topics['quantum_fundamentals'])}</li>
                <li><strong>Classical Cryptography:</strong> {getLevelText(scores.topics['classical_crypto'])}</li>
                <li><strong>PQC Knowledge:</strong> {getLevelText(scores.topics['pqc'])}</li>
                <li><strong>Practical Security & Scanning:</strong> {getLevelText(scores.topics['practical_security'])}</li>
            </ul>
        </div>
    );
};

export default ReadinessReport;