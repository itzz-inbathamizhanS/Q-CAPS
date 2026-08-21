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
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Cryptographic Scan Configuration</h2>
            <form onSubmit={handleScan} className="mb-8">
                <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label htmlFor="url" className="block text-gray-700 font-semibold mb-2">Target Endpoint / URL</label>
                        <input 
                            type="text" 
                            id="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="form-input block w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isScanning}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isScanning || !url}
                        className={`py-2 px-6 rounded font-semibold text-white ${
                            isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {isScanning ? 'Scanning...' : 'Launch Scan'}
                    </button>
                </div>
            </form>

            {isScanning && (
                <div className="mb-6 p-4 border border-blue-200 rounded bg-blue-50">
                    <p className="text-blue-800 font-semibold flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing cryptographic handshake and identifying algorithms...
                    </p>
                </div>
            )}

            {scanResult && (
                <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-800">Scan Results for: <span className="text-blue-600 font-normal">{scanResult.endpoint}</span></h3>
                    <p className={`font-semibold mb-4 ${scanResult.vulnerabilitiesFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Status: {scanResult.status}
                    </p>
                    
                    <div className="space-y-4">
                        {scanResult.details.map((detail) => (
                            <div key={detail.id} className="p-3 rounded bg-gray-50 border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-800">{detail.type}</h4>
                                    <span className={`px-2 py-1 text-xs font-bold rounded text-white ${
                                        detail.threatLevel.includes('High') || detail.threatLevel.includes('Critical') ? 'bg-red-500' : 'bg-green-500'
                                    }`}>
                                        {detail.threatLevel}
                                    </span>
                                </div>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">Algorithm Detected:</span> {detail.algorithmDetected}</p>
                                <p className="text-sm text-gray-600"><span className="font-semibold text-gray-700">Recommendation:</span> {detail.recommendation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerTool;
