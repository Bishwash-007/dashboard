"use client";

import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { adminService, type SalesReportQuery } from "@/services/admin";
import { useAuthStore } from "@/stores/auth-store";

export const salesReportKeys = {
  all: ["sales-report"] as const,
  range: (params: SalesReportQuery) => ["sales-report", params] as const,
};

export function useSalesReport(params: SalesReportQuery) {
  const authState = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isHydrated: state.isHydrated,
    }))
  );

  const query = useQuery({
    queryKey: salesReportKeys.range(params),
    queryFn: () => adminService.getSalesReport(params),
    enabled: authState.isAuthenticated && authState.isHydrated,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    report: query.data?.data,
  };
}
