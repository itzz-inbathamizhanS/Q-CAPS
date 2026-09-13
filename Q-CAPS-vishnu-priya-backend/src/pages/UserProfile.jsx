// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserProfileCard from '../components/UserProfileCard';
import { getScores } from '../services/assessmentService';

const UserProfile = () => {
    const [overallScore, setOverallScore] = useState(0);

    useEffect(() => {
        const scores = getScores();
        setOverallScore(scores.overall);
    }, []);

    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <UserProfileCard name="Student" email="student@example.com" score={overallScore} />
            </main>
            <Footer />
        </div>
    );
};

export default UserProfile;