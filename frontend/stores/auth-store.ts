import { create } from 'zustand';

import { getSession, login, logout, register } from '@/actions/auth';
import { AuthResponse, ErrorResponse, User } from '@/types/api';
import { UserLogin, UserRegister } from '@/types/auth';

interface AuthStore {
  session: User | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  isAuthenticated: () => boolean;
  refresh: () => Promise<void>;
  reset: () => Promise<void>;
  register: (data: UserRegister) => Promise<AuthResponse | ErrorResponse>;
  login: (data: UserLogin) => Promise<AuthResponse | ErrorResponse>;
  logout: () => Promise<void>;
  reAuth: (data: UserLogin) => Promise<AuthResponse | ErrorResponse>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  isLoading: true,
  error: null,
  setSession: (session) => set({ session }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  isAuthenticated: () => {
    return !!get().session;
  },
  refresh: async () => {
    try {
      set({ isLoading: true, error: null });
      const session = await getSession();
      if (session) {
        set({ session, isLoading: false, error: null });
      } else {
        set({ session: null, isLoading: false, error: 'Failed to refresh session' });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh session',
        isLoading: false,
      });
    }
  },
  reset: async () => {
    set({ session: null, isLoading: false, error: null });
  },
  register: async (data: UserRegister) => {
    try {
      const response = await register(data);
      return response;
    } catch (error) {
      return error as ErrorResponse;
    }
  },
  login: async (data: UserLogin) => {
    try {
      const response = await login(data);
      return response;
    } catch (error) {
      return error as ErrorResponse;
    }
  },
  logout: async () => {
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
  reAuth: async (data: UserLogin) => {
    try {
      const response = await login(data);
      get().refresh();
      return response;
    } catch (error) {
      return error as ErrorResponse;
    }
  },
}));
