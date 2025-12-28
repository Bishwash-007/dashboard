import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosHeaderValue,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { getAccessToken, useAuthStore } from "@/stores/auth-store";
import type { AuthTokens } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://kush-server-o5cd.onrender.com";

type RequestConfig = AxiosRequestConfig & { suppressAuth?: boolean };
type RetriableRequestConfig = RequestConfig & { _retry?: boolean };

interface RefreshResponse {
  message: string;
  tokens: AuthTokens;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

export interface HttpError {
  message: string;
  status?: number;
  details?: Array<{ field?: string; message: string }>;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20_000,
});

apiClient.interceptors.request.use((config) => {
  if ((config as RequestConfig).suppressAuth) {
    return config;
  }

  const token = getAccessToken();
  if (token) {
    const headers = ensureAxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isAuthSuppressed = (originalRequest as RequestConfig)?.suppressAuth;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthSuppressed
    ) {
      originalRequest._retry = true;
      const tokens = await queueTokenRefresh();

      if (tokens?.accessToken) {
        const headers = ensureAxiosHeaders(originalRequest.headers);

        headers.set("Authorization", `Bearer ${tokens.accessToken}`);
        originalRequest.headers = headers;

        return apiClient.request(originalRequest);
      }
    }

    if (error.response?.status === 401 && !isAuthSuppressed) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(normalizeHttpError(error));
  }
);

export function normalizeHttpError(error: unknown): HttpError {
  if (error && (error as AxiosError).isAxiosError) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: HttpError["details"];
    }>;
    return {
      message:
        axiosError.response?.data?.message ??
        axiosError.message ??
        "An unexpected error occurred",
      status: axiosError.response?.status,
      details: axiosError.response?.data?.errors,
    };
  }

  return {
    message: (error as Error)?.message ?? "An unexpected error occurred",
  };
}

async function request<T>(config: RequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.request<T>(config);
  return response.data;
}

export const http = {
  get: async <T>(url: string, config?: RequestConfig) =>
    request<T>({ ...config, method: "GET", url }),
  post: async <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    request<T>({ ...config, method: "POST", url, data }),
  put: async <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    request<T>({ ...config, method: "PUT", url, data }),
  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ) => request<T>({ ...config, method: "PATCH", url, data }),
  delete: async <T>(url: string, config?: RequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};

function ensureAxiosHeaders(
  headers?: AxiosRequestConfig["headers"]
): AxiosHeaders {
  if (headers instanceof AxiosHeaders) {
    return headers;
  }

  return AxiosHeaders.from((headers ?? {}) as Record<string, AxiosHeaderValue>);
}

function queueTokenRefresh() {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function performTokenRefresh(): Promise<AuthTokens | null> {
  const authState = useAuthStore.getState();
  const refreshToken = authState.tokens?.refreshToken;

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await request<RefreshResponse>({
      method: "POST",
      url: "/auth/refresh",
      data: { refreshToken },
      suppressAuth: true,
    });

    const tokens = response.tokens;

    if (!tokens?.accessToken) {
      return null;
    }

    authState.rotateTokens?.(tokens);

    return tokens;
  } catch {
    authState.logout();
    return null;
  }
}
