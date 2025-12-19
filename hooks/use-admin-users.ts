"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { adminService, type AdminUsersQuery } from "@/services/admin";
import { useAuthStore } from "@/stores/auth-store";

export const adminUsersKeys = {
  all: ["admin-users"] as const,
  list: (params: AdminUsersQuery) => ["admin-users", params] as const,
};

export function useAdminUsers(params: AdminUsersQuery) {
  const authState = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isHydrated: state.isHydrated,
    }))
  );

  const query = useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: () => adminService.getAdminUsers(params),
    enabled: authState.isAuthenticated && authState.isHydrated,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    users: query.data?.data ?? [],
    pagination: query.data?.pagination,
  };
}
