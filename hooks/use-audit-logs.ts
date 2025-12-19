"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { adminService, type AuditLogsQuery } from "@/services/admin";
import { useAuthStore } from "@/stores/auth-store";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (params: AuditLogsQuery) => ["audit-logs", params] as const,
};

export function useAuditLogs(params: AuditLogsQuery) {
  const authState = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isHydrated: state.isHydrated,
    }))
  );

  const query = useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => adminService.getAuditLogs(params),
    enabled: authState.isAuthenticated && authState.isHydrated,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    logs: query.data?.data ?? [],
    pagination: query.data?.pagination,
  };
}
