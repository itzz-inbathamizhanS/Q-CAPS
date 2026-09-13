// src/pages/HomePage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';

const HomePage = () => {
    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Welcome to Q-CAPS: Quantum Cybersecurity Education & Organizational Readiness Platform</h1>
                <p className="mb-6 text-gray-700">An adaptive education and assessment platform designed to prepare students and organizations for the post-quantum cybersecurity era.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CourseCard title="Quantum Fundamentals" description="Learn the basics of quantum computing, qubits, and how they threaten classical cryptography." />
                    <CourseCard title="Post-Quantum Cryptography (PQC)" description="Deep dive into ML-KEM, ML-DSA, and NIST standardized quantum-resistant algorithms." />
                    <CourseCard title="Cryptographic Scanning" description="Hands-on laboratory to scan authorized targets, identify vulnerable crypto, and plan migrations." />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;