import { getSession, logout } from '@/actions/auth';
import { create } from 'zustand';

import { User } from '@/types/api';

interface AuthStore {
  session: User | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  isAuthenticated: () => boolean;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  isLoading: true,
  error: null,
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: async () => {
    try {
      set({ isLoading: true });
      set({ session: null, error: null });
      await logout();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to logout',
        isLoading: false,
      });
    }
  },
  isAuthenticated: () => {
    return !!get().session;
  },
  refresh: async () => {
    try {
      set({ isLoading: true, error: null });
      const session = await getSession();
      set({ session, isLoading: false });
    } catch (error) {
      console.error(error);
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh session',
        isLoading: false,
      });
    }
  },
}));
