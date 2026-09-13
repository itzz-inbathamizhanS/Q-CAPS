// src/components/SkillAssessmentForm.jsx
import React, { useState } from 'react';
import { assessmentQuestions, submitAssessment } from '../services/assessmentService';

const SkillAssessmentForm = () => {
    const [topic, setTopic] = useState('quantum_fundamentals');
    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const handleStart = (e) => {
        e.preventDefault();
        setStarted(true);
        setAnswers({});
        setResult(null);
    };

    const handleAnswerChange = (qIndex, option) => {
        setAnswers({
            ...answers,
            [qIndex]: option
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const scoreResult = submitAssessment(topic, answers);
        setResult(scoreResult);
    };

    const resetAssessment = () => {
        setStarted(false);
        setAnswers({});
        setResult(null);
    };

    if (result) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
                <p className="text-xl mb-4">
                    You scored <span className="font-bold text-blue-600">{result.score}%</span>
                </p>
                <p className="text-gray-700 mb-6">
                    Correct Answers: {result.correctCount} / {result.total}
                </p>
                <button 
                    onClick={resetAssessment}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Take Another Assessment
                </button>
            </div>
        );
    }

    if (started) {
        const questions = assessmentQuestions[topic] || [];
        
        return (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6">Diagnostic Assessment</h2>
                {questions.map((q, index) => (
                    <div key={q.id} className="mb-6 pb-4 border-b">
                        <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((option) => (
                                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name={`question-${index}`} 
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => handleAnswerChange(index, option)}
                                        className="form-radio h-4 w-4 text-blue-600"
                                        required
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-between items-center mt-6">
                    <button 
                        type="button" 
                        onClick={resetAssessment}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600 font-semibold"
                    >
                        Submit Answers
                    </button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleStart} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Diagnostic Assessment Configuration</h2>
            <div className="mb-4">
                <label htmlFor="topic" className="block text-gray-700 font-semibold mb-2">Select Topic to Assess</label>
                <select 
                    id="topic" 
                    name="topic" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="form-select mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="quantum_fundamentals">Quantum Fundamentals</option>
                    <option value="classical_crypto">Classical Cryptography</option>
                    <option value="pqc">Post-Quantum Cryptography (PQC)</option>
                    <option value="practical_security">Practical Security & Cryptographic Agility</option>
                </select>
            </div>
            
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full font-semibold mt-4">
                Start Assessment
            </button>
        </form>
    );
};

export default SkillAssessmentForm;