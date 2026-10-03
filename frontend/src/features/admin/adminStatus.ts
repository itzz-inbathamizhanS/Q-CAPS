import { create } from 'zustand';
import { adminApi } from './adminApi';

// The role comes from the server (GET /auth/me) and is never persisted or taken from the
// client. It only decides whether to show the admin link: the backend still checks the
// role on every admin request.
type Role = 'unknown' | 'learner' | 'admin';

interface AdminStatusState {
  role: Role;
  forUser: number | null;
  load: (userId: number | null) => Promise<void>;
  reset: () => void;
}

export const useAdminStatus = create<AdminStatusState>((set, get) => ({
  role: 'unknown',
  forUser: null,
  load: async (userId) => {
    if (userId === null) return;
    if (get().forUser === userId && get().role !== 'unknown') return;
    set({ role: 'unknown', forUser: userId });
    try {
      const me = await adminApi.me();
      if (get().forUser === userId) set({ role: me.role === 'admin' ? 'admin' : 'learner' });
    } catch {
      if (get().forUser === userId) set({ role: 'learner' });
    }
  },
  reset: () => set({ role: 'unknown', forUser: null }),
}));
