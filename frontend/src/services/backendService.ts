// src/services/backendService.ts
// Integration layer communicating with Vishnu Priya's Analytics Backend (Python FastAPI)
// Location: Q-CAPS-vishnu-priya-backend/backend/main.py (Port 8000)

import { useAuthStore } from '../features/auth/authStore';
import { handleUnauthorized } from '../features/auth/session';
import type { ScanAsset, ScanLogSummary, TrackedFinding } from '../features/scanner/types';

import { API_BASE_URL } from './apiConfig';

/** Kept for existing importers; the value comes from apiConfig.ts. */
export const BACKEND_BASE_URL = API_BASE_URL;

/** A failed API request: the HTTP status (0 when the server was unreachable) and the server's message. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${BACKEND_BASE_URL}${url}`, init);
  } catch {
    throw new ApiError(0, 'The server could not be reached.');
  }
}

async function failure(res: Response): Promise<ApiError> {
  if (res.status === 401) handleUnauthorized();
  return new ApiError(res.status, await errorMessage(res, `Request failed (HTTP ${res.status}).`));
}

export const api = {
  get: async (url: string) => {
    const { token } = useAuthStore.getState();
    const res = await send(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!res.ok) throw await failure(res);
    const data = await res.json();
    return { data };
  },
  post: async (url: string, body: unknown) => {
    const { token } = useAuthStore.getState();
    const res = await send(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw await failure(res);
    const data = await res.json();
    return { data };
  }
};

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  /** null = no graded quiz evidence yet (unknown, not 0). */
  readiness_score: number | null;
  xp: number;
  global_rank: number;
  unlocked_badges?: string[];
  recommended_next_module?: string;
  progress_data?: string;
}

/** One optimized remediation path from the exposure graph (backend graph/optimizer.py). */
export interface GraphPath {
  finding_id: string;
  asset_id: string;
  competency_id: string;
  finding_title?: string | null;
  finding_type?: string | null;
  minimum_score?: number;
  actual_score?: number | null;
  risk_score: number;
  competency_deficit: number;
  time_cost_hours: number;
  proposed_intervention_type: 'LAB_REMEDIATION' | 'THEORY_MODULE';
}

/** One structured factor behind a recommendation (see docs/architecture/RECOMMENDATIONS.md for the types). */
export interface RecommendationReason {
  type: string;
  [key: string]: unknown;
}

/** One ranked recommendation of the gap engine. */
export interface RecommendationItem {
  module_id: string | null;
  title: string | null;
  code: string | null;
  action: 'assess' | 'learn' | 'practice' | 'none';
  practical: { kind: string; id: string; title: string | null; depth: string; module_id: string | null } | null;
  competencies: string[];
  priority: string;
  scanner_risk: string | null;
  topic: string | null;
  reasons: RecommendationReason[];
}

export interface UserRecommendation {
  course_id: string | null;
  title: string | null;
  topic: string | null;
  priority: string;
  reason: string;
  quiz_score: number | null;
  scanner_risk: string | null;
  status: string;
  engine?: 'gap' | 'score' | 'none' | null;
  reasons?: RecommendationReason[];
  recommendations?: RecommendationItem[];
  /** @deprecated always empty since T1.7 (one recommendation engine) */
  graph_paths?: GraphPath[];
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  xp: number;
  rank: number;
}

export interface QuizAttemptQuestion {
  item_id: string;
  prompt: string;
  options: string[]; // already in the order shown; the server holds the answer key
  domain?: string | null; // reporting group of a diagnostic item
}

export interface QuizAttempt {
  attempt_id: string;
  module_id: string;
  title: string;
  passing_score_percent: number;
  total_questions: number;
  issued_at: string;
  expires_at: string;
  questions: QuizAttemptQuestion[];
  kind?: string | null; // "diagnostic" for the baseline/reassessment instrument
  attempt_purpose?: 'diagnostic_pre' | 'diagnostic_post' | null;
}

export interface QuizAnswerFeedback {
  item_id: string;
  recorded: boolean;
  correct: boolean | null; // null when a module withholds feedback until grading
  correct_position: number | null;
  explanation: string | null;
}

export interface QuizAttemptResult {
  attempt_id: string;
  module_id: string;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  passed: boolean;
  passing_score_percent: number;
  xp_awarded: number;
  graded_at: string;
}

export class QuizApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface ScannerLogPayload {
  user_id: number;
  endpoint: string;
  status: string;
  /** Signed by the scanner over `details`; the backend rejects logs without it. */
  receipt?: string;
  details: string;
}

export async function syncProgressData(progressData: Record<string, unknown>) {
  const { userId, token } = useAuthStore.getState();
  if (!userId || !token) return null;

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/users/${userId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ progress_data: JSON.stringify(progressData) }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to sync progress on backend:', error);
    return null;
  }
}

/**
 * Check if the Analytics Backend is online
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Register a new user
 */
/** Turn a FastAPI error body ({detail: string} or a 422 list of {msg}) into a sentence for the UI. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((d: { loc?: unknown[]; msg?: string }) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : '';
          return `${field ? `${String(field)}: ` : ''}${(d.msg || '').replace(/^Value error, /, '')}`;
        })
        .join('; ');
    }
  } catch {
    /* non-JSON body */
  }
  return fallback;
}

export async function registerUser(name: string, password: string) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    if (!res.ok) throw new Error(await errorMessage(res, `Registration failed (HTTP ${res.status}).`));
    return await res.json(); // schemas.UserOut
  } catch (error) {
    console.warn('Failed to register user:', error);
    throw error;
  }
}

/**
 * Login a user
 */
export async function loginUser(name: string, password: string) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    if (!res.ok) throw new Error(await errorMessage(res, `Sign-in failed (HTTP ${res.status}).`));
    const data = await res.json();
    return data; // { access_token, user_id, user_name }
  } catch (error) {
    console.warn('Failed to login user:', error);
    throw error;
  }
}

/**
 * Fetch global leaderboard data
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const token = useAuthStore.getState().token;
  const response = await send('/leaderboard', { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
  if (!response.ok) throw await failure(response);
  return response.json();
}

export async function downloadScannerReport(logId: number): Promise<void> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Authentication required");

  const response = await fetch(`${BACKEND_BASE_URL}/scanner/logs/${logId}/report`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to download PDF report');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `threat_report_${logId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Fetch common user profile (matching shared_data_schema.md)
 */
export async function fetchUserProfile(userId?: number): Promise<UserProfile | null> {
  const { userId: stateId, token } = useAuthStore.getState();
  const idToUse = userId ?? stateId;
  if (!idToUse || !token) return null; // not signed in: there is no profile to load
  return (await api.get(`/users/${idToUse}/profile`)).data as UserProfile; // throws on failure
}

/** The signed-in learner's recommendation. Throws on failure so callers can tell an error from "no recommendation". */
export async function getMyRecommendation(): Promise<UserRecommendation> {
  const { userId } = useAuthStore.getState();
  return (await api.get(`/users/${userId}/recommendation`)).data as UserRecommendation;
}



async function quizRequest<T>(path: string, body: unknown = {}): Promise<T> {
  const { token } = useAuthStore.getState();
  if (!token) throw new QuizApiError(401, 'Sign in to take graded quizzes.');
  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `Request failed (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') detail = data.detail;
    } catch {
      /* keep the generic message */
    }
    throw new QuizApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

/** Ask the server for a shuffled quiz form (no answer keys). */
export const startQuizAttempt = (moduleId: string) =>
  quizRequest<QuizAttempt>(`/quizzes/${encodeURIComponent(moduleId)}/attempts`);

/** Record and lock one answer; the server returns feedback. */
export const answerQuizQuestion = (attemptId: string, itemId: string, selectedPosition: number) =>
  quizRequest<QuizAnswerFeedback>(`/quizzes/attempts/${attemptId}/answers`, {
    item_id: itemId,
    selected_position: selectedPosition,
  });

/** Finalise the attempt; the score is computed by the server. */
export const finishQuizAttempt = (attemptId: string) =>
  quizRequest<QuizAttemptResult>(`/quizzes/attempts/${attemptId}/submit`, { answers: [] });

/** Submit every answer at once (the diagnostic lets learners review before submitting); graded by the server. */
export const submitQuizAnswers = (attemptId: string, answers: Array<{ item_id: string; selected_position: number }>) =>
  quizRequest<QuizAttemptResult>(`/quizzes/attempts/${attemptId}/submit`, { answers });

export interface DiagnosticDomainResult {
  domain: string;
  total_questions: number;
  correct_count: number;
  percentage: number;
}

/** Row of GET /diagnostic/results: one graded diagnostic attempt of the signed-in learner. */
export interface DiagnosticResult {
  attempt_id: string;
  module_id: string;
  attempt_purpose: 'diagnostic_pre' | 'diagnostic_post' | null;
  graded_at: string;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  domains: DiagnosticDomainResult[];
}

/** The learner's graded diagnostics, newest first. Throws on failure so callers can tell an error from "none yet". */
export async function fetchDiagnosticResults(): Promise<DiagnosticResult[]> {
  return (await api.get('/diagnostic/results')).data as DiagnosticResult[];
}

/** Row returned by POST /scanner/log. */
export interface ScannerLogRecord {
  id: number;
  endpoint: string;
  status: string;
  vulnerabilities_found: number;
  details: string | null;
  created_at: string;
  xp_awarded: number | null;
}

async function errorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
  } catch {
    /* keep the fallback */
  }
  return fallback;
}

/**
 * Record a scan in the backend (history, XP, recommendation evidence). Throws with the server's reason
 * when the scan was not recorded, so the UI can say so instead of silently showing an unsaved result.
 */
export async function logScannerResult(payload: Omit<ScannerLogPayload, 'user_id'>): Promise<ScannerLogRecord> {
  const { userId, token } = useAuthStore.getState();
  if (!userId || !token) throw new Error('Sign in to save scan results.');

  let res: Response;
  try {
    res = await fetch(`${BACKEND_BASE_URL}/scanner/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...payload, user_id: userId }),
    });
  } catch {
    throw new Error('The Q-CAPS server is not reachable.');
  }
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    throw new Error(await errorDetail(res, `The server rejected the scan (HTTP ${res.status}).`));
  }
  return res.json();
}

/** The current user's recent scans, newest first. */
export async function fetchScanLogs(limit = 20): Promise<ScanLogSummary[]> {
  const { data } = await api.get(`/scanner/logs?limit=${limit}`);
  return data as ScanLogSummary[];
}

/** One stored scan (its `details` is the scanner JSON result). */
export async function fetchScanLog(logId: number): Promise<ScannerLogRecord> {
  const { data } = await api.get(`/scanner/logs/${logId}`);
  return data as ScannerLogRecord;
}

/** Domains the user has scanned with verified ownership. */
export async function fetchScanAssets(): Promise<ScanAsset[]> {
  const { data } = await api.get('/scanner/assets');
  return data as ScanAsset[];
}

/** Findings tracked for one verified domain, open ones first. */
export async function fetchAssetFindings(assetId: number): Promise<TrackedFinding[]> {
  const { data } = await api.get(`/scanner/assets/${assetId}/findings`);
  return data as TrackedFinding[];
}
