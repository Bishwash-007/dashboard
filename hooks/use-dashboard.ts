"use client";

import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/services/admin";
import type { ApiEnvelope, DashboardSnapshot } from "@/types/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export function useDashboardSnapshot() {
  return useQuery<ApiEnvelope<DashboardSnapshot>>({
    queryKey: dashboardKeys.all,
    queryFn: adminService.getDashboard,
    staleTime: 60_000,
  });
}
