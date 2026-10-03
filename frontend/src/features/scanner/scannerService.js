// src/features/scanner/scannerService.js
// Calls the Python OSINT & Cryptographic scanner API (Q-CAPS-feature-scanner-backend/backend/api.py)
// API URL is controlled via VITE_SCANNER_API_URL environment variable (default: http://127.0.0.1:5000)

const SCANNER_API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SCANNER_API_URL
    ? import.meta.env.VITE_SCANNER_API_URL
    : 'http://127.0.0.1:5000';

import { logScannerResult } from '../../services/backendService';
import { useAuthStore } from '../auth/authStore';
import { handleUnauthorized, SESSION_EXPIRED_MESSAGE } from '../auth/session';

export const scanEndpoint = async (url) => {
    try {
        const response = await fetch(`${SCANNER_API_BASE}/api/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${useAuthStore.getState().token}`,
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleUnauthorized();
                throw new Error(SESSION_EXPIRED_MESSAGE);
            }
            // The scanner explains refusals in its JSON body (bad hostname, rate limit, busy).
            let reason = '';
            try { reason = (await response.json())?.error || ''; } catch { /* non-JSON error body */ }
            throw new Error(reason || `Scanner request failed (HTTP ${response.status}).`);
        }

        const results = await response.json();

        // Send to analytics backend
        // The backend verifies the scanner's receipt over these exact results and counts the findings
        // itself, so nothing here can change what is recorded or how much XP it earns.
        const logResponse = await logScannerResult({
            endpoint: url,
            status: results.error ? 'failed' : 'success',
            receipt: results.receipt,
            details: JSON.stringify(results)
        }).catch(console.error);

        if (logResponse && logResponse.id) {
            results.logId = logResponse.id;
            results.xpAwarded = logResponse.xp_awarded ?? null;
        }

        return results;
    } catch (error) {
        console.error('Failed to connect to Python Scanner API:', error);
        throw error;
    }
};
