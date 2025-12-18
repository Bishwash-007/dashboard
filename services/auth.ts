import { http } from "./api-client";

import type { AdminUser, AuthTokens } from "@/types/api";

interface LoginPayload {
  email: string;
  password: string;
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
};
