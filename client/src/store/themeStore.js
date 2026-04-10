import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store for dark/light mode toggle
 * @type {import('zustand').UseBoundStore}
 */
export const useThemeStore = create(
  persist(
    set => ({
      isDark: true,
      toggle: () => set(state => ({ isDark: !state.isDark })),
      setDark: isDark => set({ isDark }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
