import { http } from "./api-client";

import type {
  ApiEnvelope,
  Category,
  DashboardSnapshot,
  Order,
  OrderStatus,
  PaginatedEnvelope,
  Product,
  ProductUploadResult,
} from "@/types/api";

export interface CategoriesQuery {
  search?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export type ProductStatusFilter = "active" | "draft" | "archived";

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatusFilter;
}

export const adminService = {
  getDashboard: () =>
    http.get<ApiEnvelope<DashboardSnapshot>>("/admin/dashboard"),

  getOrders: (params: OrdersQuery = {}) =>
    http.get<PaginatedEnvelope<Order>>("/admin/orders", {
      params,
    }),

  updateOrderStatus: (
    orderId: string,
    payload: { status: OrderStatus; notes?: string }
  ) =>
    http.patch<ApiEnvelope<Order>>(`/admin/orders/${orderId}/status`, payload),

  getProducts: (params: ProductsQuery = {}) =>
    http.get<PaginatedEnvelope<Product>>("/products", { params }),

  createProduct: (payload: Partial<Product>) =>
    http.post<ApiEnvelope<Product>>("/products", payload),

  updateProduct: (productId: string, payload: Partial<Product>) =>
    http.patch<ApiEnvelope<Product>>(`/products/${productId}`, payload),

  deleteProduct: (productId: string) =>
    http.delete<ApiEnvelope<{ _id: string }>>(`/products/${productId}`),

  getCategories: (params: CategoriesQuery = {}) =>
    http.get<PaginatedEnvelope<Category>>(`/categories`, {
      params,
    }),

  uploadProductImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return http.post<ApiEnvelope<ProductUploadResult>, FormData>(
      "/products/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
