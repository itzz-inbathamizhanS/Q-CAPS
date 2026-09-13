// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import mockLeaderboard from '../data/mock_leaderboard.json';

const UserProfile = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    
    useEffect(() => {
        // Methodology: We import the mock JSON directly and sort it by XP score.
        // In the future (Phase 3), this will be replaced with an API fetch to the Python backend.
        const sortedData = [...mockLeaderboard].sort((a, b) => b.xp_score - a.xp_score);
        setLeaderboard(sortedData);
    }, []);

    return (
        <div className="min-h-screen bg-cyber-black text-white font-sans flex flex-col">
            <Header />
            <main className="container mx-auto p-8 flex-grow">
                <div className="text-center mb-12 animate-pulse-fast">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
                        Global Leaderboard
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Rank up by completing Quantum Scans & Missions</p>
                </div>

                <div className="bg-cyber-gray border border-neon-green/30 rounded-xl p-6 shadow-neon-green max-w-4xl mx-auto">
                    {leaderboard.map((user, index) => (
                        <div key={user.user_id} className="flex items-center justify-between p-4 mb-4 bg-black/50 border border-gray-800 rounded-lg hover:border-neon-blue transition duration-300">
                            
                            {/* Rank & Username */}
                            <div className="flex items-center gap-6">
                                <div className="text-3xl font-black text-neon-green">
                                    #{index + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{user.username}</h2>
                                    <p className="text-sm text-neon-blue">{user.level}</p>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="hidden md:flex gap-2">
                                {user.badges.map((badge, i) => (
                                    <span key={i} className="px-3 py-1 text-xs font-semibold bg-neon-purple/20 text-neon-purple border border-neon-purple/50 rounded-full">
                                        {badge}
                                    </span>
                                ))}
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <div className="text-2xl font-bold text-neon-green">{user.xp_score.toLocaleString()} XP</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UserProfile;