import { useAuthStore } from '@/features/auth/authStore';
import type { CheckpointResult, LessonModule, ModuleProgress, TrackSummary } from './lessonTypes';

import { API_BASE_URL as BASE_URL } from '@/services/apiConfig';

export class LessonApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new LessonApiError('Could not reach the server.', 0);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      if (typeof body?.detail === 'string') detail = body.detail;
    } catch {
      // non-JSON error body: fall through to the generic message
    }
    throw new LessonApiError(detail || `Request failed (${res.status}).`, res.status);
  }
  return (await res.json()) as T;
}

// Small in-memory cache so Overview -> Section navigation does not refetch the module.
// Failed requests are evicted so "Retry" really retries.
const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let p = cache.get(key) as Promise<T> | undefined;
  if (!p) {
    p = load().catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, p);
  }
  return p;
}

export function fetchModule(slug: string): Promise<LessonModule> {
  return cached(`module:${slug}`, () =>
    request<LessonModule>(`/content/modules/${encodeURIComponent(slug)}`),
  );
}

export function fetchTracks(): Promise<TrackSummary[]> {
  return cached('tracks', async () => (await request<{ tracks: TrackSummary[] }>('/content/tracks')).tracks);
}

export function clearLessonCache(): void {
  cache.clear();
}

/** The backend grades the answer; the client never sees the key. */
export function checkCheckpoint(
  sectionId: number,
  blockId: string,
  selectedIndex: number,
): Promise<CheckpointResult> {
  const { token } = useAuthStore.getState();
  return request<CheckpointResult>(
    `/content/sections/${sectionId}/checkpoints/${encodeURIComponent(blockId)}/check`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ selected_index: selectedIndex }),
    },
  );
}

function authHeaders(): Record<string, string> {
  const { token } = useAuthStore.getState();
  return { Authorization: `Bearer ${token}` };
}

/** The caller's own progress, always read fresh from the server (never cached). */
export function fetchProgress(slug: string): Promise<ModuleProgress> {
  return request<ModuleProgress>(`/content/modules/${encodeURIComponent(slug)}/progress`, { headers: authHeaders() });
}

/** Mark a section without checkpoints as complete. The server refuses it otherwise. */
export function completeSection(sectionId: number): Promise<{ completed: boolean }> {
  return request<{ completed: boolean }>(`/content/sections/${sectionId}/complete`, {
    method: 'POST',
    headers: authHeaders(),
  });
}
