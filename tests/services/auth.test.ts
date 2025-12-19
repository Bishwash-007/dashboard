import { describe, it, expect, beforeEach, vi } from "vitest";

import { authService } from "@/services/auth";
import { http } from "@/services/api-client";

type HttpMock = {
  post: ReturnType<typeof vi.fn>;
};

vi.mock("@/services/api-client", () => {
  return {
    http: {
      post: vi.fn(),
    },
  };
});

const mockedHttp = http as unknown as HttpMock;

describe("authService", () => {
  beforeEach(() => {
    mockedHttp.post.mockReset();
  });

  it("calls login endpoint with credentials", async () => {
    const payload = { email: "user@example.com", password: "secret123" };
    const response = {
      message: "ok",
      user: { _id: "1", name: "Test", email: payload.email, role: "admin" },
      tokens: { accessToken: "token", refreshToken: "refresh" },
    };

    mockedHttp.post.mockResolvedValueOnce(response);

    await expect(authService.login(payload)).resolves.toEqual(response);

    expect(mockedHttp.post).toHaveBeenCalledWith("/auth/login", payload, {
      suppressAuth: true,
    });
  });

  it("requests admin password reset tokens", async () => {
    const payload = { email: "admin@example.com" };
    const response = { message: "Reset email sent" };

    mockedHttp.post.mockResolvedValueOnce(response);

    await expect(
      authService.requestAdminPasswordReset(payload)
    ).resolves.toEqual(response);

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/auth/admin/password/reset/request",
      payload,
      { suppressAuth: true }
    );
  });

  it("confirms admin password reset", async () => {
    const payload = {
      email: "admin@example.com",
      token: "abcdef",
      password: "newpassword",
    };
    const response = { message: "Password updated" };

    mockedHttp.post.mockResolvedValueOnce(response);

    await expect(
      authService.confirmAdminPasswordReset(payload)
    ).resolves.toEqual(response);

    expect(mockedHttp.post).toHaveBeenCalledWith(
      "/auth/admin/password/reset/confirm",
      payload,
      { suppressAuth: true }
    );
  });
});
