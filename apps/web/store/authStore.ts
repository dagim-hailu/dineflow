import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apolloClient } from '@/lib/apollo-client';
import { LOGIN, REGISTER, LOGOUT, GET_CURRENT_USER } from '../lib/graphql/auth';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  profileImageUrl?: string;
  preferences?: any;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apolloClient.mutate({
            mutation: LOGIN,
            variables: {
              input: { email, password },
            },
          });

          set({
            user: data.login.user,
            accessToken: data.login.accessToken,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apolloClient.mutate({
            mutation: REGISTER,
            variables: { input },
          });

          set({
            user: data.register.user,
            accessToken: data.register.accessToken,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apolloClient.mutate({
            mutation: LOGOUT,
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const { data } = await apolloClient.query({
            query: GET_CURRENT_USER,
            fetchPolicy: 'network-only',
          });

          if (data.me) {
            set({
              user: data.me,
              isAuthenticated: true,
              error: null,
            });
          }
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null, // Don't show error for auto-fetch
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'dineflow-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
