import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  userName: string | null;
  token: string | null;
  /** True when the server rejected the stored token; the login page explains why the user is back there. */
  sessionExpired: boolean;
  login: (id: number, name: string, token: string) => void;
  logout: () => void;
  expireSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      userName: null,
      token: null,
      sessionExpired: false,
      login: (id, name, token) => set({ isAuthenticated: true, userId: id, userName: name, token, sessionExpired: false }),
      logout: () => set({ isAuthenticated: false, userId: null, userName: null, token: null, sessionExpired: false }),
      expireSession: () => set({ isAuthenticated: false, userId: null, userName: null, token: null, sessionExpired: true }),
    }),
    {
      name: 'qcaps-auth-storage',
    }
  )
);
