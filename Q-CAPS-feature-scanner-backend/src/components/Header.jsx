// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Header = () => {
    return (
        <header className="bg-white p-4 shadow-md">
            <nav className="flex flex-wrap justify-between items-center container mx-auto">
                <div className="flex items-center mb-4 md:mb-0">
                    <img src={logo} alt="Q-CAPS Logo" className="h-10 w-10 rounded-full mr-4 object-cover border-2 border-purple-500 shadow-sm" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Q-CAPS</h1>
                </div>
                <div className="flex items-center space-x-6 text-sm font-semibold">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                    <Link to="/training" className="text-gray-700 hover:text-blue-600 transition-colors">Training</Link>
                    <Link to="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors">Assessment</Link>
                    <Link to="/scanner" className="text-gray-700 hover:text-blue-600 transition-colors">Scanner</Link>
                    <Link to="/readiness" className="text-gray-700 hover:text-blue-600 transition-colors">Readiness</Link>
                    <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors mr-4">Profile</Link>
                    
                    <div className="flex space-x-2 border-l pl-6 border-gray-300">
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">Log In</Link>
                        <Link to="/signup" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">Sign Up</Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;