// Client for the Q-CAPS scanner API (backend/scanner_api, Flask) and the scan-logging endpoints of the main API.
// VITE_SCANNER_API_URL controls the scanner address (default http://127.0.0.1:5000).

import { logScannerResult } from '../../services/backendService';
import { useAuthStore } from '../auth/authStore';
import { handleUnauthorized, SESSION_EXPIRED_MESSAGE } from '../auth/session';
import type { SaveOutcome, ScanMode, ScanResultV2, VerificationInfo } from './types';

// A production build never falls back to localhost: a visitor's own machine is not the scanner. Without a configured
// address the scanner is simply unavailable in that deployment.
const SCANNER_API_BASE: string = import.meta.env.VITE_SCANNER_API_URL || (import.meta.env.PROD ? '' : 'http://127.0.0.1:5000');

export class ScannerApiError extends Error {
  status: number;
  /** Present when a full scan was refused because the domain is not verified yet. */
  verification?: VerificationInfo;
  constructor(status: number, message: string, verification?: VerificationInfo) {
    super(message);
    this.status = status;
    this.verification = verification;
  }
}

async function scannerRequest<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const { token } = useAuthStore.getState();
  if (!SCANNER_API_BASE) throw new ScannerApiError(0, 'The scanner is not available in this deployment.');
  let response: Response;
  try {
    response = await fetch(`${SCANNER_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ScannerApiError(0, 'The scanner service is not reachable. Check that it is running and try again.');
  }
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new ScannerApiError(401, SESSION_EXPIRED_MESSAGE);
    }
    // The scanner explains refusals in its JSON body (bad hostname, rate limit, busy, verification needed).
    let data: Record<string, unknown> = {};
    try {
      data = await response.json();
    } catch {
      /* non-JSON error body */
    }
    const verification = response.status === 403 && typeof data.record_name === 'string' ? (data as unknown as VerificationInfo) : undefined;
    throw new ScannerApiError(response.status, typeof data.error === 'string' ? data.error : `Scanner request failed (HTTP ${response.status}).`, verification);
  }
  return (await response.json()) as T;
}

export const runScan = (target: string, mode: ScanMode, signal?: AbortSignal) =>
  scannerRequest<ScanResultV2>('/api/scan', { url: target, mode }, signal);

/** Which DNS record proves ownership of `hostname`, and whether it is currently published. */
export const checkDomainVerification = (hostname: string) =>
  scannerRequest<VerificationInfo>('/api/domain-verification', { hostname });

/** Record a scan in the user's history. The backend verifies the scanner's receipt and decides the XP. */
export async function saveScan(result: ScanResultV2): Promise<SaveOutcome> {
  try {
    const saved = await logScannerResult({
      endpoint: result.target_url,
      status: 'success',
      receipt: result.receipt,
      details: JSON.stringify(result),
    });
    return { ok: true, logId: saved.id, xpAwarded: saved.xp_awarded ?? 0 };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'The result could not be saved.' };
  }
}

/** The scan result without the signing receipt, for export. */
export function exportable(result: ScanResultV2): Omit<ScanResultV2, 'receipt'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { receipt, ...rest } = result;
  return rest;
}
