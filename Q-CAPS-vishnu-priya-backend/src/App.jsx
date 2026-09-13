// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';
import AssessmentPage from './pages/AssessmentPage';
import ReadinessPage from './pages/ReadinessPage';
import UserProfile from './pages/UserProfile';
import ScannerPage from './pages/ScannerPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/assessment" element={<AssessmentPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/readiness" element={<ReadinessPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Routes>
        </Router>
    );
};

export default App;