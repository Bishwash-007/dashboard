import { http } from "./api-client";

import type { AdminUser, AuthTokens } from "@/types/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface PasswordResetRequestPayload {
  email: string;
}

interface PasswordResetConfirmPayload {
  email: string;
  token: string;
  password: string;
}

interface PasswordResetResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  user: AdminUser;
  tokens: AuthTokens;
}

export const authService = {
  login: (payload: LoginPayload) =>
    http.post<LoginResponse, LoginPayload>("/auth/login", payload, {
      suppressAuth: true,
    }),
  requestAdminPasswordReset: (payload: PasswordResetRequestPayload) =>
    http.post<PasswordResetResponse, PasswordResetRequestPayload>(
      "/auth/admin/password/reset/request",
      payload,
      {
        suppressAuth: true,
      }
    ),
  confirmAdminPasswordReset: (payload: PasswordResetConfirmPayload) =>
    http.post<PasswordResetResponse, PasswordResetConfirmPayload>(
      "/auth/admin/password/reset/confirm",
      payload,
      {
        suppressAuth: true,
      }
    ),
};
