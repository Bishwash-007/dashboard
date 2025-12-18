import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";

import { renderHookWithClient } from "../test-utils";
import { useDashboardSnapshot } from "@/hooks/use-dashboard";
import {
  orderKeys,
  useOrderStatusMutation,
  useOrders,
} from "@/hooks/use-orders";
import {
  productKeys,
  useProductMutations,
  useProducts,
} from "@/hooks/use-products";
import { useAuthStore } from "@/stores/auth-store";
import { adminService } from "@/services/admin";
import type {
  AdminUser,
  AuthTokens,
  DashboardSnapshot,
  Order,
  Product,
} from "@/types/api";
import type { OrdersQuery, ProductsQuery } from "@/services/admin";

vi.mock("@/services/admin", () => ({
  adminService: {
    getDashboard: vi.fn(),
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    uploadProductImages: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

type AdminMock = {
  [K in keyof typeof adminService]: ReturnType<typeof vi.fn>;
};

const mockedAdmin = adminService as unknown as AdminMock;

const initialAuthState = useAuthStore.getState();

const resetAuthStore = () => {
  useAuthStore.setState({
    ...initialAuthState,
    user: null,
    tokens: null,
    isAuthenticated: false,
    isHydrated: false,
  });
};

const demoUser: AdminUser = {
  _id: "admin",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
};

const demoTokens: AuthTokens = {
  accessToken: "token",
  refreshToken: "refresh",
};

const hydrateAuthStore = async () => {
  await act(async () => {
    useAuthStore
      .getState()
      .setCredentials({ user: demoUser, tokens: demoTokens });
    useAuthStore.getState().setHydrated(true);
  });
};

const renderOrdersHook = (params: OrdersQuery) =>
  renderHookWithClient(
    ({ params: hookParams }: { params: OrdersQuery }) => useOrders(hookParams),
    {
      initialProps: { params },
    }
  );

const renderProductsHook = (params: ProductsQuery) =>
  renderHookWithClient(
    ({ params: hookParams }: { params: ProductsQuery }) =>
      useProducts(hookParams),
    {
      initialProps: { params },
    }
  );

describe("react-query hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthStore();
    localStorage.clear();
  });

  it("returns dashboard snapshot data", async () => {
    const snapshot: DashboardSnapshot = {
      totalOrders: 10,
      totalRevenue: 2000,
      totalProducts: 5,
      totalUsers: 3,
      recentOrders: [],
      ordersByStatus: [],
    };
    mockedAdmin.getDashboard.mockResolvedValueOnce({
      message: "ok",
      data: snapshot,
    });

    const { result } = renderHookWithClient(() => useDashboardSnapshot());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(snapshot);
  });

  it("does not fetch orders until auth store is hydrated", async () => {
    renderOrdersHook({ page: 1 });

    expect(mockedAdmin.getOrders).not.toHaveBeenCalled();
  });

  it("fetches orders when authenticated", async () => {
    const order: Order = {
      _id: "1",
      orderNumber: "1001",
      status: "pending",
      totalAmount: 99,
      items: [],
      customerName: "A",
      customerEmail: "a@example.com",
      createdAt: new Date().toISOString(),
    };

    mockedAdmin.getOrders.mockResolvedValue({
      message: "ok",
      data: [order],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    await hydrateAuthStore();

    const { result } = renderOrdersHook({ page: 1 });

    await waitFor(() => expect(result.current.orders).toHaveLength(1));
    expect(mockedAdmin.getOrders).toHaveBeenCalledWith({ page: 1 });
    expect(result.current.pagination).toMatchObject({ total: 1 });
  });

  it("updates order status and invalidates cache", async () => {
    mockedAdmin.updateOrderStatus.mockResolvedValueOnce({ message: "ok" });

    const { result, client } = renderHookWithClient(() =>
      useOrderStatusMutation()
    );
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    await act(async () => {
      await result.current.mutateAsync({ orderId: "1", status: "shipped" });
    });

    expect(mockedAdmin.updateOrderStatus).toHaveBeenCalledWith("1", {
      status: "shipped",
      notes: undefined,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.all });
  });

  it("does not fetch products until auth store is ready", async () => {
    renderProductsHook({ page: 1 });
    expect(mockedAdmin.getProducts).not.toHaveBeenCalled();
  });

  it("fetches products when authenticated", async () => {
    const product: Product = {
      _id: "p1",
      name: "Device",
      variants: [{ price: 10, stock: 5 }],
    };
    mockedAdmin.getProducts.mockResolvedValue({
      message: "ok",
      data: [product],
      pagination: { page: 1, limit: 6, total: 1, pages: 1 },
    });

    await hydrateAuthStore();

    const { result } = renderProductsHook({ page: 1 });

    await waitFor(() => expect(result.current.products).toHaveLength(1));
    expect(mockedAdmin.getProducts).toHaveBeenCalledWith({ page: 1 });
  });

  it("runs product mutations and invalidates queries", async () => {
    mockedAdmin.createProduct.mockResolvedValueOnce({ message: "created" });
    mockedAdmin.updateProduct.mockResolvedValueOnce({ message: "updated" });
    mockedAdmin.deleteProduct.mockResolvedValueOnce({ message: "deleted" });

    const { result, client } = renderHookWithClient(() =>
      useProductMutations()
    );
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    await act(async () => {
      await result.current.createMutation.mutateAsync({ name: "Phone" });
      await result.current.updateMutation.mutateAsync({
        productId: "p1",
        data: { name: "New" },
      });
      await result.current.deleteMutation.mutateAsync("p1");
    });

    expect(mockedAdmin.createProduct).toHaveBeenCalledWith({ name: "Phone" });
    expect(mockedAdmin.updateProduct).toHaveBeenCalledWith("p1", {
      name: "New",
    });
    expect(mockedAdmin.deleteProduct).toHaveBeenCalledWith("p1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: productKeys.all });
  });
});
