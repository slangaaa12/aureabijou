"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "aurea-favorites" }
  )
);

interface RecentState {
  ids: string[];
  add: (id: string) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) =>
        set((s) => ({
          ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 8),
        })),
    }),
    { name: "aurea-recent" }
  )
);

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  setTheme: (t: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "aurea-theme" }
  )
);

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    setTimeout(() => set({ message: null }), 2200);
  },
  hide: () => set({ message: null }),
}));
