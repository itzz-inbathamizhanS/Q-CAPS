// src/pages/ReadinessPage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReadinessReport from '../components/ReadinessReport';

const ReadinessPage = () => {
    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Quantum Readiness Profile</h1>
                <ReadinessReport />
            </main>
            <Footer />
        </div>
    );
};

export default ReadinessPage;