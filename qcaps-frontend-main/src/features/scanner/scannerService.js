// src/features/scanner/scannerService.js
// Calls the Python OSINT & Cryptographic scanner API (Q-CAPS-feature-scanner-backend/backend/api.py)
// API URL is controlled via VITE_SCANNER_API_URL environment variable (default: http://127.0.0.1:5000)

const SCANNER_API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCANNER_API_URL
    ? import.meta.env.VITE_SCANNER_API_URL
    : 'http://127.0.0.1:5000';

export const scanEndpoint = async (url) => {
    try {
        const response = await fetch(`${SCANNER_API_BASE}/api/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const results = await response.json();

        // Add XP to user score if the scan was successful
        if (results && results.crypto && results.crypto.mission_xp_awarded) {
            const storedScores = JSON.parse(localStorage.getItem('qcapsScores')) || {};
            storedScores['practical_security'] = (storedScores['practical_security'] || 0) + results.crypto.mission_xp_awarded;

            const totalTopics = Object.keys(storedScores).length || 1;
            const overall = Math.round(Object.values(storedScores).reduce((a, b) => a + b, 0) / totalTopics);

            localStorage.setItem('qcapsScores', JSON.stringify(storedScores));
            localStorage.setItem('qcapsOverallScore', overall);
        }

        return results;
    } catch (error) {
        console.error('Failed to connect to Python Scanner API:', error);
        throw error;
    }
};
