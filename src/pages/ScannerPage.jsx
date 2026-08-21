// src/pages/ScannerPage.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScannerTool from '../components/ScannerTool';

const ScannerPage = () => {
    return (
        <div>
            <Header />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Cryptographic Scanning Engine</h1>
                <p className="text-gray-700 mb-6">
                    Simulate scanning authorized endpoints to discover classical cryptographic algorithms 
                    that are vulnerable to quantum computing threats and identify a migration path to NIST-approved PQC.
                </p>
                <ScannerTool />
            </main>
            <Footer />
        </div>
    );
};

export default ScannerPage;
