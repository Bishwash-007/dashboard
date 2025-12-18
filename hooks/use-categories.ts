"use client";

import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/admin";
import type { CategoriesQuery } from "@/services/admin";

const DEFAULT_PARAMS: CategoriesQuery = {
  limit: 100,
  includeInactive: false,
};

export const categoryKeys = {
  list: (paramsKey = "default") => ["categories", paramsKey] as const,
};

export function useCategories(params?: CategoriesQuery) {
  const queryParams = { ...DEFAULT_PARAMS, ...params };
  const paramsKey = JSON.stringify(queryParams);

  return useQuery({
    queryKey: categoryKeys.list(paramsKey),
    queryFn: async () => {
      return adminService.getCategories(queryParams);
    },
    staleTime: 5 * 60 * 1000,
  });
}
