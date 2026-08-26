// src/pages/ScannerPage.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScannerTool from '../components/ScannerTool';

const ScannerPage = () => {
    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md antialiased">
            <Header />
            <main className="flex-1 p-sm md:p-md flex flex-col items-center">
                <ScannerTool />
            </main>
            <Footer />
        </div>
    );
};

export default ScannerPage;
