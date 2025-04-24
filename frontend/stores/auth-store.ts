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
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
  register: (data: UserRegister) => Promise<AuthResponse | ErrorResponse>;
  login: (data: UserLogin) => Promise<AuthResponse | ErrorResponse>;
  reAuth: (data: UserLogin) => Promise<AuthResponse | ErrorResponse>;
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
