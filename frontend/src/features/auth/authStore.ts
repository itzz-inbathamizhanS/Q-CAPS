import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  userName: string | null;
  token: string | null;
  login: (id: number, name: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      userName: null,
      token: null,
      login: (id, name, token) => set({ isAuthenticated: true, userId: id, userName: name, token }),
      logout: () => set({ isAuthenticated: false, userId: null, userName: null, token: null }),
    }),
    {
      name: 'qcaps-auth-storage',
    }
  )
);
