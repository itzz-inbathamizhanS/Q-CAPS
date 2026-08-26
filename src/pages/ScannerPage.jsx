// src/pages/ScannerPage.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScannerTool from '../components/ScannerTool';

const ScannerPage = () => {
    return (
        <div className="min-h-screen bg-cyber-black text-white flex flex-col font-sans">
            <Header />
            <main className="container mx-auto p-8 flex-grow">
                <div className="text-center mb-12 animate-pulse-fast">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">
                        Quantum OSINT Recon
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Execute deep cryptographic analysis and WHOIS reconnaissance on authorized targets.
                    </p>
                </div>
                <ScannerTool />
            </main>
            <Footer />
        </div>
    );
};

export default ScannerPage;
