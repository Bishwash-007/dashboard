"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService, type ProductsQuery } from "@/services/admin";
import type { Product } from "@/types/api";
import type { HttpError } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsQuery) => ["products", params] as const,
};

export function useProducts(params: ProductsQuery) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const canQuery = isHydrated && isAuthenticated;

  const query = useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => adminService.getProducts(params),
    enabled: canQuery,
  });

  const products = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return {
    ...query,
    products,
    pagination,
  };
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const handleError = (error: HttpError) => {
    notify.error(error.message);
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: productKeys.all });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Product>) =>
      adminService.createProduct(payload),
    onSuccess: () => {
      notify.success("Product created");
      invalidate();
    },
    onError: handleError,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: Partial<Product>;
    }) => adminService.updateProduct(productId, data),
    onSuccess: () => {
      notify.success("Product updated");
      invalidate();
    },
    onError: handleError,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => adminService.deleteProduct(productId),
    onSuccess: () => {
      notify.success("Product deleted");
      invalidate();
    },
    onError: handleError,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
