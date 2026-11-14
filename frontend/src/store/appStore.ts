import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: next };
        }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'toc-app-store',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
