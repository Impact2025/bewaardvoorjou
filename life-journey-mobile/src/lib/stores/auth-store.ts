import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthSession } from '@/lib/types';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '@/lib/api/auth';

const STORAGE_KEY = 'auth_token';
const SESSION_KEY = 'auth_session';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (session: AuthSession) => Promise<void>;
  clearSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    country: string;
    locale: string;
    birthYear?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

/**
 * Auth store with SecureStore for token persistence
 * IMPORTANT: Tokens are stored securely (encrypted) using Expo SecureStore
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,

  setSession: async (session: AuthSession) => {
    try {
      // Save token securely
      await SecureStore.setItemAsync(STORAGE_KEY, session.token);

      // Save session data (non-sensitive) for quick access
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));

      set({ session, error: null });
    } catch (error) {
      console.error('Failed to save session:', error);
      set({ error: 'Failed to save login session' });
    }
  },

  clearSession: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      await SecureStore.deleteItemAsync(SESSION_KEY);
      set({ session: null, error: null });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiLogin(email, password);
      await get().setSession(session);
    } catch (error: any) {
      console.error('Login failed:', error);
      set({
        error: error.message || 'Login mislukt. Controleer je gegevens en probeer opnieuw.',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiRegister(data);
      await get().setSession(session);
    } catch (error: any) {
      console.error('Registration failed:', error);
      set({
        error: error.message || 'Registratie mislukt. Probeer het opnieuw.',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
      await get().clearSession();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear session anyway
      await get().clearSession();
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Try to restore session from SecureStore
      const token = await SecureStore.getItemAsync(STORAGE_KEY);

      if (token) {
        // Validate token by fetching current user
        const session = await getCurrentUser(token);
        set({ session, isLoading: false });
      } else {
        set({ session: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Invalid token, clear it
      await get().clearSession();
      set({ session: null, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
