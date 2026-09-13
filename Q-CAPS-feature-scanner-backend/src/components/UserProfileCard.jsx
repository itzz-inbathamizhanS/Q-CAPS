// src/components/UserProfileCard.js
import React from 'react';

const UserProfileCard = ({ name, email, score }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{name}</h2>
            <p className="text-gray-700 mb-2">{email}</p>
            <p className="text-blue-600 font-semibold">Overall Quantum Readiness Score: {score}%</p>
        </div>
    );
};

export default UserProfileCard;