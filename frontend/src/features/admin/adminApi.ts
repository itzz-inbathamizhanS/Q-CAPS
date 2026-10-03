import { useAuthStore } from '@/features/auth/authStore';
import { handleUnauthorized, SESSION_EXPIRED_MESSAGE } from '@/features/auth/session';
import type {
  AdminModule,
  AdminOverview,
  AdminSection,
  AdminBlock,
  ChecklistItem,
  ContentStatus,
  ModuleInput,
  TrackInput,
  AdminTrack,
  AuditEntry,
  SectionUpdateBody,
} from './adminTypes';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface FieldIssue {
  loc: (string | number)[];
  msg: string;
}

export class AdminApiError extends Error {
  status: number;
  issues: FieldIssue[];
  checklist: ChecklistItem[];
  constructor(message: string, status: number, issues: FieldIssue[] = [], checklist: ChecklistItem[] = []) {
    super(message);
    this.status = status;
    this.issues = issues;
    this.checklist = checklist;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { token } = useAuthStore.getState();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdminApiError('Could not reach the server.', 0);
  }
  if (res.status === 204) return undefined as T;
  if (res.status === 401) {
    handleUnauthorized();
    throw new AdminApiError(SESSION_EXPIRED_MESSAGE, 401);
  }
  if (!res.ok) {
    let detail: unknown;
    try {
      detail = (await res.json())?.detail;
    } catch {
      // non-JSON error body
    }
    if (Array.isArray(detail)) {
      const issues = detail.map((d) => ({
        loc: (Array.isArray(d.loc) ? d.loc : []).slice(1),
        msg: String(d.msg ?? 'Invalid value').replace(/^Value error, /, ''),
      }));
      throw new AdminApiError('Some fields are invalid.', res.status, issues);
    }
    if (detail && typeof detail === 'object') {
      const d = detail as { message?: string; checklist?: ChecklistItem[] };
      throw new AdminApiError(d.message ?? 'Request refused.', res.status, [], d.checklist ?? []);
    }
    throw new AdminApiError(typeof detail === 'string' ? detail : `Request failed (${res.status}).`, res.status);
  }
  return (await res.json()) as T;
}

const ADMIN = '/admin/content';

export const adminApi = {
  me: () => request<{ id: number; name: string; role: 'learner' | 'admin' }>('GET', '/auth/me'),
  overview: () => request<AdminOverview>('GET', `${ADMIN}/tracks`),
  getModule: (id: number) => request<AdminModule>('GET', `${ADMIN}/modules/${id}`),

  createTrack: (body: TrackInput) => request<AdminTrack>('POST', `${ADMIN}/tracks`, body),
  updateTrack: (id: number, body: Partial<TrackInput>) => request<AdminTrack>('PATCH', `${ADMIN}/tracks/${id}`, body),
  deleteTrack: (id: number) => request<void>('DELETE', `${ADMIN}/tracks/${id}`),
  reorderTracks: (ids: number[]) => request<{ ids: number[] }>('PUT', `${ADMIN}/tracks/reorder`, { ids }),

  createModule: (body: ModuleInput) => request<AdminModule>('POST', `${ADMIN}/modules`, body),
  updateModule: (id: number, body: Partial<ModuleInput>) => request<AdminModule>('PATCH', `${ADMIN}/modules/${id}`, body),
  deleteModule: (id: number) => request<void>('DELETE', `${ADMIN}/modules/${id}`),
  reorderModules: (trackId: number, ids: number[]) =>
    request<{ ids: number[] }>('PUT', `${ADMIN}/tracks/${trackId}/modules/reorder`, { ids }),

  createSection: (body: { module_id: number; slug: string; title: string; blocks?: AdminBlock[]; status?: ContentStatus }) =>
    request<AdminSection>('POST', `${ADMIN}/sections`, body),
  updateSection: (id: number, body: SectionUpdateBody) => request<AdminSection>('PATCH', `${ADMIN}/sections/${id}`, body),
  checklist: (title: string, blocks: AdminBlock[]) =>
    request<{ checklist: ChecklistItem[] }>('POST', `${ADMIN}/sections/checklist`, { title, blocks }),
  auditLog: (params: { limit: number; offset: number; entityType?: string }) =>
    request<{ total: number; items: AuditEntry[] }>(
      'GET',
      `${ADMIN}/audit-log?limit=${params.limit}&offset=${params.offset}${params.entityType ? `&entity_type=${params.entityType}` : ''}`,
    ),
  deleteSection: (id: number) => request<void>('DELETE', `${ADMIN}/sections/${id}`),
  reorderSections: (moduleId: number, ids: number[]) =>
    request<{ ids: number[] }>('PUT', `${ADMIN}/modules/${moduleId}/sections/reorder`, { ids }),
};

/** Readable one-line description of an API failure, for toasts and banners. */
export function describeError(err: unknown): string {
  if (err instanceof AdminApiError) {
    if (err.status === 403) return 'You do not have permission to do that.';
    if (err.status === 401) return 'Your session has expired. Sign in again.';
    if (err.status === 409) return err.message;
    return err.message;
  }
  return 'Something went wrong.';
}
