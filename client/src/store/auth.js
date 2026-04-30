import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken } from "@/lib/axios";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hydrated: false,

      setAuth: ({ user, accessToken }) => {
        setAccessToken(accessToken);
        set({ user, accessToken, isAuthenticated: Boolean(user && accessToken) });
      },
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        setAccessToken(token);
        set({ accessToken: token, isAuthenticated: Boolean(token) });
      },
      clearAuth: () => {
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "ttm-auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAccessToken(state.accessToken);
        state?.markHydrated();
      },
    }
  )
);
