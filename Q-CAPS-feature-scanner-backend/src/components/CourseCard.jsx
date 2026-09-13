// src/components/CourseCard.js
import React from 'react';

const CourseCard = ({ title, description }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-gray-700">{description}</p>
        </div>
    );
};

export default CourseCard;