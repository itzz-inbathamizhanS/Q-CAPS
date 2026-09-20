// src/services/backendService.ts
// Integration layer communicating with Vishnu Priya's Analytics Backend (Python FastAPI)
// Location: Q-CAPS-vishnu-priya-backend/backend/main.py (Port 8000)

import { useAuthStore } from '../features/auth/authStore';

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  readiness_score: number;
  xp: number;
  global_rank: number;
  unlocked_badges?: string[];
  recommended_next_module?: string;
  progress_data?: string;
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
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  xp: number;
  rank: number;
}

export interface QuizSubmissionPayload {
  user_id: number;
  topic: string;
  correct_answers: number;
  total_questions: number;
}

export interface ScannerLogPayload {
  user_id: number;
  endpoint: string;
  status: string;
  vulnerabilities_found: number;
  details?: string;
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
export async function registerUser(name: string, password?: string) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password: password || 'default' }),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json(); // schemas.UserOut
  } catch (error) {
    console.warn('Failed to register user:', error);
    throw error;
  }
}

/**
 * Login a user
 */
export async function loginUser(name: string, password?: string) {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password: password || 'default' }),
    });
    if (!res.ok) throw new Error(await res.text());
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
  const response = await fetch(`${BACKEND_BASE_URL}/leaderboard`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
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
  if (!idToUse || !token) return null;

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/users/${idToUse}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.debug('Backend offline or unavailable, falling back to local data.', error);
    return null;
  }
}

/**
 * Fetch personalized recommendation generated by the recommendation algorithm
 */
export async function fetchUserRecommendation(userId?: number): Promise<UserRecommendation | null> {
  const { userId: stateId, token } = useAuthStore.getState();
  const idToUse = userId ?? stateId;
  if (!idToUse || !token) return null;

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/users/${idToUse}/recommendation`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.debug('Failed to fetch recommendation from backend:', error);
    return null;
  }
}


/**
 * Submit quiz score to calculate XP and update user skill gap model
 */
export async function submitQuizScore(payload: Omit<QuizSubmissionPayload, 'user_id'>) {
  const { userId, token } = useAuthStore.getState();
  if (!userId || !token) return null;

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/quizzes/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...payload, user_id: userId }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to submit quiz score to backend:', error);
    return null;
  }
}

/**
 * Record a scan log into the backend database to feed the recommendation engine
 */
export async function logScannerResult(payload: Omit<ScannerLogPayload, 'user_id'>) {
  const { userId, token } = useAuthStore.getState();
  if (!userId || !token) return null;

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/scanner/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...payload, user_id: userId }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to log scanner finding to backend:', error);
    return null;
  }
}
