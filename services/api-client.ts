import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { getAccessToken, useAuthStore } from "@/stores/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type RequestConfig = AxiosRequestConfig & { suppressAuth?: boolean };

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
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
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
  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ) => request<T>({ ...config, method: "PATCH", url, data }),
  delete: async <T>(url: string, config?: RequestConfig) =>
    request<T>({ ...config, method: "DELETE", url }),
};
