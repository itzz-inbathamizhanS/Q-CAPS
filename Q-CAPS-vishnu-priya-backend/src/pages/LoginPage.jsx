// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock authentication
        if (email) {
            navigate('/profile');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Log In to Q-CAPS</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition-colors">
                            Log In
                        </button>
                    </form>
                    <p className="mt-4 text-center text-gray-600">
                        Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;
