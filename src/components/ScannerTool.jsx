// src/components/ScannerTool.jsx
import React, { useState } from 'react';
import { scanEndpoint } from '../services/scannerService';

const ScannerTool = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url) return;
        
        setIsScanning(true);
        setScanResult(null);
        
        try {
            const result = await scanEndpoint(url);
            setScanResult(result);
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="bg-cyber-gray border border-neon-blue/30 p-8 rounded-xl shadow-neon-blue max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-neon-blue border-b border-neon-blue/30 pb-2">Target Acquisition</h2>
            
            <form onSubmit={handleScan} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label htmlFor="url" className="block text-gray-400 font-mono mb-2 text-sm">INITIALIZE_TARGET_URL:</label>
                        <input 
                            type="text" 
                            id="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="example.com"
                            className="w-full bg-black border border-gray-700 text-neon-green rounded px-4 py-3 font-mono focus:outline-none focus:border-neon-green focus:shadow-neon-green transition-all"
                            required
                            disabled={isScanning}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isScanning || !url}
                        className={`w-full md:w-auto py-3 px-8 rounded font-black tracking-widest text-cyber-black transition-all ${
                            isScanning ? 'bg-gray-600 cursor-not-allowed' : 'bg-neon-green hover:bg-white shadow-neon-green'
                        }`}
                    >
                        {isScanning ? 'INITIALIZING...' : 'EXECUTE SCAN'}
                    </button>
                </div>
            </form>

            {isScanning && (
                <div className="mb-8 p-6 border border-neon-purple/50 rounded bg-neon-purple/10 font-mono animate-pulse">
                    <p className="text-neon-purple font-bold flex items-center text-lg">
                        <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-neon-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        [EXECUTING] DEEP PACKET INSPECTION & WHOIS RECONNAISSANCE...
                    </p>
                </div>
            )}

            {scanResult && (
                <div className="animate-fade-in-up">
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
                        OSINT Report: <span className="text-neon-green font-mono">{scanResult.target_url}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: OSINT Data */}
                        <div className="bg-black/40 border border-gray-700 rounded-lg p-5">
                            <h4 className="text-neon-blue font-bold mb-4 font-mono">>&gt; DOMAIN_RECON</h4>
                            <div className="space-y-3 font-mono text-sm text-gray-300">
                                <p><span className="text-gray-500">OWNER_ORG:</span> {scanResult.osint.owner_organization}</p>
                                <p><span className="text-gray-500">REGISTRAR:</span> {scanResult.osint.registrar}</p>
                                <p><span className="text-gray-500">CREATED:</span> {scanResult.osint.creation_date.split('T')[0]}</p>
                                <p><span className="text-gray-500">EXPIRES:</span> {scanResult.osint.expiration_date.split('T')[0]}</p>
                            </div>
                        </div>

                        {/* Column 2: Crypto Analysis */}
                        <div className="bg-black/40 border border-gray-700 rounded-lg p-5">
                            <h4 className="text-neon-purple font-bold mb-4 font-mono">>&gt; CRYPTO_ANALYSIS</h4>
                            
                            <div className="mb-4">
                                <span className="text-gray-500 font-mono text-sm">ENCRYPTION: </span>
                                <span className="font-bold text-white">{scanResult.crypto.encryption_detected}</span>
                            </div>

                            <div className="mb-4">
                                <span className="text-gray-500 font-mono text-sm">STATUS: </span>
                                {scanResult.crypto.is_quantum_safe ? (
                                    <span className="px-3 py-1 bg-neon-green/20 text-neon-green border border-neon-green rounded font-bold text-sm">QUANTUM SECURE</span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500 rounded font-bold text-sm animate-pulse">VULNERABLE</span>
                                )}
                            </div>

                            {!scanResult.crypto.is_quantum_safe && (
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded">
                                    <p className="text-red-400 font-mono text-xs font-bold mb-1">WARNING_LOG:</p>
                                    <ul className="list-disc list-inside text-red-300 text-sm">
                                        {scanResult.crypto.vulnerabilities_found.map((v, i) => <li key={i}>{v}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-6 text-right">
                                <span className="text-neon-green font-black text-xl">+{scanResult.crypto.mission_xp_awarded} XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerTool;

