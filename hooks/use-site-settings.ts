"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { adminService } from "@/services/admin";
import type { SiteSettingsPayload } from "@/types/api";
import type { HttpError } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { notify } from "@/lib/notify";

let siteSettingsPromise: ReturnType<
  typeof adminService.getSiteSettings
> | null = null;

export const resetSiteSettingsRequest = () => {
  siteSettingsPromise = null;
};

export const siteSettingsKeys = {
  all: ["site-settings"] as const,
};

const fetchSiteSettings = () => {
  if (!siteSettingsPromise) {
    siteSettingsPromise = adminService.getSiteSettings().catch((error) => {
      siteSettingsPromise = null;
      throw error;
    });
  }
  return siteSettingsPromise;
};

export function useSiteSettings() {
  const authState = useAuthStore(
    useShallow((state) => ({
      isAuthenticated: state.isAuthenticated,
      isHydrated: state.isHydrated,
    }))
  );
  const enabled = authState.isAuthenticated && authState.isHydrated;

  return useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: fetchSiteSettings,
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSiteSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SiteSettingsPayload) =>
      adminService.updateSiteSettings(payload),
    onSuccess: () => {
      notify.success("Site settings updated");
      resetSiteSettingsRequest();
      queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all });
    },
    onError: (error: HttpError) => {
      notify.error(error.message);
    },
  });
}
