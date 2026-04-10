import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store for user state and JWT token
 * @type {import('zustand').UseBoundStore}
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * Login user with token
       * @param {Object} userData - User data from backend
       * @param {string} token - JWT token
       */
      login: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
        }),

      /**
       * Logout and clear auth state
       */
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      /**
       * Update user profile
       * @param {Object} userData - Updated user data
       */
      updateUser: userData =>
        set(state => ({
          user: { ...state.user, ...userData },
        })),

      /**
       * Check if user is authenticated
       * @returns {boolean}
       */
      getIsAuthenticated: () => get().isAuthenticated,

      /**
       * Get auth token
       * @returns {string|null}
       */
      getToken: () => get().token,

      /**
       * Initialize from localStorage
       */
      initialize: () => {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state && parsed.state.token) {
            set({
              user: parsed.state.user,
              token: parsed.state.token,
              isAuthenticated: true,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
