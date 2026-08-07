import { create } from "zustand";

interface UIState {
  drawerOpen: boolean;
  authOpen: boolean;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  openAuth: () => void;
  closeAuth: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  authOpen: false,

  toggleDrawer: () => {
    set((state) => ({
      drawerOpen: !state.drawerOpen,
    }));
  },

  setDrawerOpen: (open) => {
    set({ drawerOpen: open });
  },

  openAuth: () => {
    set({ authOpen: true });
  },

  closeAuth: () => {
    set({ authOpen: false });
  },
}));
