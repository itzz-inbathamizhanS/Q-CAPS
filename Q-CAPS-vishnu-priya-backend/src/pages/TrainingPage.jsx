// src/pages/TrainingPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { trainingCourses, getCompletedCourses, markCourseCompleted } from '../services/trainingService';

const TrainingPage = () => {
    const [completedCourses, setCompletedCourses] = useState([]);

    useEffect(() => {
        setCompletedCourses(getCompletedCourses());
    }, []);

    const handleComplete = (courseId, topic) => {
        const updatedCompleted = markCourseCompleted(courseId, topic);
        setCompletedCourses([...updatedCompleted]);
    };

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Quantum Cybersecurity Training</h1>
                <p className="text-gray-700 mb-8">
                    Access personalized learning paths covering classical cryptography, quantum threats, Shor's algorithm, and practical PQC deployment. Completing modules will increase your overall Readiness Score.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trainingCourses.map((course) => {
                        const isCompleted = completedCourses.includes(course.id);
                        return (
                            <div key={course.id} className={`p-6 rounded-lg shadow-md border-l-4 ${isCompleted ? 'bg-green-50 border-green-500' : 'bg-white border-blue-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
                                    {isCompleted && (
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                            </svg>
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-4">{course.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-500">Duration: {course.duration}</span>
                                    <button
                                        onClick={() => handleComplete(course.id, course.topic)}
                                        disabled={isCompleted}
                                        className={`py-2 px-4 rounded font-semibold text-sm transition-colors ${
                                            isCompleted 
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {isCompleted ? 'Module Finished' : 'Mark as Complete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TrainingPage;