import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";

import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { AdminUser, AuthTokens } from "@/types/api";

const user: AdminUser = {
  _id: "1",
  name: "Test User",
  email: "test@example.com",
  role: "admin",
};

const tokens: AuthTokens = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isHydrated: false,
  });
  localStorage.clear();
});

describe("useAuthStore", () => {
  it("stores credentials and toggles authentication", () => {
    act(() => useAuthStore.getState().setCredentials({ user, tokens }));

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.tokens).toEqual(tokens);
    expect(state.isAuthenticated).toBe(true);
    expect(getAccessToken()).toBe(tokens.accessToken);
  });

  it("clears credentials on logout", () => {
    act(() => useAuthStore.getState().setCredentials({ user, tokens }));

    act(() => useAuthStore.getState().logout());

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tokens).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("tracks hydration status", () => {
    expect(useAuthStore.getState().isHydrated).toBe(false);

    act(() => useAuthStore.getState().setHydrated(true));

    expect(useAuthStore.getState().isHydrated).toBe(true);
  });

  it("rotates tokens while preserving refresh token", () => {
    act(() => useAuthStore.getState().setCredentials({ user, tokens }));

    act(() =>
      useAuthStore.getState().rotateTokens({ accessToken: "next-token" })
    );

    const state = useAuthStore.getState();
    expect(state.tokens).toEqual({
      accessToken: "next-token",
      refreshToken: tokens.refreshToken,
    });
    expect(state.isAuthenticated).toBe(true);
  });
});
