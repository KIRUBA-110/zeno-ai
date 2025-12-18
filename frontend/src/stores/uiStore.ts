/**
 * UI Store - Zustand state for UI elements
 */
import { create } from 'zustand';

interface UIState {
    // Sidebar
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Theme
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Sidebar state
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

    // Theme state
    theme: 'dark',
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
    }))
}));
