"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { AdminUser, AuthTokens } from "@/types/api";

type AuthState = {
  user: AdminUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setCredentials: (payload: { user: AdminUser; tokens: AuthTokens }) => void;
  logout: () => void;
  rotateTokens: (tokens: AuthTokens) => void;
  setHydrated: (value: boolean) => void;
};

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage(() => localStorage);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,
      setCredentials: ({ user, tokens }) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        }),
      rotateTokens: (tokens) =>
        set((state) => {
          const previousTokens = state.tokens ?? {};
          const nextTokens = {
            ...previousTokens,
            ...tokens,
          } as AuthTokens;
          return {
            tokens: nextTokens,
            isAuthenticated:
              state.isAuthenticated || Boolean(nextTokens?.accessToken),
          };
        }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "electronics-admin-auth",
      storage,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

export const getAccessToken = () =>
  useAuthStore.getState().tokens?.accessToken ?? null;
