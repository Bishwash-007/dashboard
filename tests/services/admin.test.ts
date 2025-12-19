import { describe, it, expect, beforeEach, vi } from "vitest";

import { adminService } from "@/services/admin";
import { http } from "@/services/api-client";

type HttpMock = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

vi.mock("@/services/api-client", () => {
  return {
    http: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockedHttp = http as unknown as HttpMock;

describe("adminService", () => {
  beforeEach(() => {
    mockedHttp.get.mockReset();
    mockedHttp.post.mockReset();
    mockedHttp.put.mockReset();
    mockedHttp.patch.mockReset();
    mockedHttp.delete.mockReset();
  });

  it("fetches dashboard snapshot", async () => {
    mockedHttp.get.mockResolvedValueOnce({ message: "ok" });

    await adminService.getDashboard();

    expect(mockedHttp.get).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("fetches orders with query params", async () => {
    const params = { page: 2, limit: 25, status: "pending" as const };
    mockedHttp.get.mockResolvedValueOnce({ message: "ok" });

    await adminService.getOrders(params);

    expect(mockedHttp.get).toHaveBeenCalledWith("/admin/orders", { params });
  });

  it("updates order status", async () => {
    mockedHttp.patch.mockResolvedValueOnce({ message: "updated" });

    await adminService.updateOrderStatus("order-123", { status: "shipped" });

    expect(mockedHttp.patch).toHaveBeenCalledWith(
      "/admin/orders/order-123/status",
      { status: "shipped" }
    );
  });

  it("performs product CRUD operations", async () => {
    const payload = { name: "Phone" };
    mockedHttp.post.mockResolvedValueOnce({ message: "created" });
    mockedHttp.patch.mockResolvedValueOnce({ message: "updated" });
    mockedHttp.delete.mockResolvedValueOnce({ message: "deleted" });

    await adminService.createProduct(payload);
    await adminService.updateProduct("prod-1", payload);
    await adminService.deleteProduct("prod-1");

    expect(mockedHttp.post).toHaveBeenCalledWith("/products", payload);
    expect(mockedHttp.patch).toHaveBeenCalledWith("/products/prod-1", payload);
    expect(mockedHttp.delete).toHaveBeenCalledWith("/products/prod-1");
  });

  it("uploads product images via multipart form data", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    mockedHttp.post.mockResolvedValueOnce({ message: "uploaded" });

    await adminService.uploadProductImages([file]);

    expect(mockedHttp.post).toHaveBeenCalledTimes(1);
    const [, formData, config] = mockedHttp.post.mock.calls[0];
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).getAll("images")).toHaveLength(1);
    expect(config).toMatchObject({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  });

  it("manages site settings", async () => {
    const payload = {
      contact: { email: "support@example.com" },
    };
    mockedHttp.get.mockResolvedValueOnce({ data: null });
    mockedHttp.put.mockResolvedValueOnce({
      data: { contact: payload.contact },
    });

    await adminService.getSiteSettings();
    await adminService.updateSiteSettings(payload);

    expect(mockedHttp.get).toHaveBeenCalledWith("/admin/settings");
    expect(mockedHttp.put).toHaveBeenCalledWith("/admin/settings", payload);
  });
});
