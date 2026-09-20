// src/features/scanner/scannerService.js
// Calls the Python OSINT & Cryptographic scanner API (Q-CAPS-feature-scanner-backend/backend/api.py)
// API URL is controlled via VITE_SCANNER_API_URL environment variable (default: http://127.0.0.1:5000)

const SCANNER_API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCANNER_API_URL
    ? import.meta.env.VITE_SCANNER_API_URL
    : 'http://127.0.0.1:5000';

import { logScannerResult } from '../../services/backendService';

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

        // Send to analytics backend
        const logResponse = await logScannerResult({
            endpoint: url,
            status: results.error ? 'failed' : 'success',
            vulnerabilities_found: results.crypto?.vulnerabilities_found?.length || 0,
            details: JSON.stringify(results)
        }).catch(console.error);

        if (logResponse && logResponse.id) {
            results.logId = logResponse.id;
        }

        return results;
    } catch (error) {
        console.error('Failed to connect to Python Scanner API:', error);
        throw error;
    }
};
