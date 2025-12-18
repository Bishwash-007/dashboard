"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService, type OrdersQuery } from "@/services/admin";
import type { HttpError } from "@/services/api-client";
import type { OrderStatus } from "@/types/api";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: OrdersQuery) => ["orders", params] as const,
};

export function useOrders(params: OrdersQuery) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const canQuery = isHydrated && isAuthenticated;

  const query = useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => adminService.getOrders(params),
    enabled: canQuery,
  });

  const orders = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return {
    ...query,
    orders,
    pagination,
  };
}

export function useOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: OrderStatus;
      notes?: string;
    }) => adminService.updateOrderStatus(orderId, { status, notes }),
    onSuccess: () => {
      notify.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error: HttpError) => {
      notify.error(error.message);
    },
  });
}
