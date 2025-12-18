import { describe, it, expect, afterEach, vi } from "vitest";
import type { AxiosError, AxiosResponse } from "axios";

import { apiClient, http, normalizeHttpError } from "@/services/api-client";

describe("http helper", () => {
  const requestSpy = vi.spyOn(apiClient, "request");

  afterEach(() => {
    requestSpy.mockReset();
  });

  it("performs GET requests", async () => {
    requestSpy.mockResolvedValueOnce({ data: { ok: true } } as AxiosResponse);

    await expect(http.get("/path", { params: { page: 1 } })).resolves.toEqual({
      ok: true,
    });

    expect(requestSpy).toHaveBeenCalledWith({
      method: "GET",
      url: "/path",
      params: { page: 1 },
    });
  });

  it("performs POST requests", async () => {
    requestSpy.mockResolvedValueOnce({ data: { id: 1 } } as AxiosResponse);

    await expect(http.post("/path", { name: "A" })).resolves.toEqual({
      id: 1,
    });

    expect(requestSpy).toHaveBeenCalledWith({
      method: "POST",
      url: "/path",
      data: { name: "A" },
    });
  });

  it("performs PATCH requests", async () => {
    requestSpy.mockResolvedValueOnce({
      data: { updated: true },
    } as AxiosResponse);

    await expect(http.patch("/path", { done: true })).resolves.toEqual({
      updated: true,
    });

    expect(requestSpy).toHaveBeenCalledWith({
      method: "PATCH",
      url: "/path",
      data: { done: true },
    });
  });

  it("performs DELETE requests", async () => {
    requestSpy.mockResolvedValueOnce({
      data: { removed: true },
    } as AxiosResponse);

    await expect(http.delete("/path")).resolves.toEqual({ removed: true });

    expect(requestSpy).toHaveBeenCalledWith({
      method: "DELETE",
      url: "/path",
    });
  });
});

describe("normalizeHttpError", () => {
  it("extracts message and details from Axios errors", () => {
    const axiosError = {
      isAxiosError: true,
      message: "Request failed",
      response: {
        status: 422,
        data: {
          message: "Validation failed",
          errors: [{ field: "email", message: "Invalid" }],
        },
      },
    } as AxiosError;

    const normalized = normalizeHttpError(axiosError);

    expect(normalized).toEqual({
      message: "Validation failed",
      status: 422,
      details: [{ field: "email", message: "Invalid" }],
    });
  });

  it("falls back to generic error shape", () => {
    const error = new Error("Boom");

    expect(normalizeHttpError(error)).toEqual({ message: "Boom" });
  });
});
