import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  userName: string | null;
  login: (id: number, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      userName: null,
      login: (id, name) => set({ isAuthenticated: true, userId: id, userName: name }),
      logout: () => set({ isAuthenticated: false, userId: null, userName: null }),
    }),
    {
      name: 'qcaps-auth-storage',
    }
  )
);
