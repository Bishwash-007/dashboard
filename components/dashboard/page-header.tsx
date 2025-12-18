"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSnapshot } from "@/hooks/use-dashboard";

export function PageHeader() {
  const { data, isFetching, refetch } = useDashboardSnapshot();

  const lastUpdatedLabel = data?.data?.recentOrders?.[0]?.updatedAt
    ? new Date(data.data.recentOrders[0].updatedAt).toLocaleString()
    : "Awaiting data";

  return (
    <div className="border border-border/60 bg-card/80 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Electronics Command Center
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground">
            <span className="font-medium text-foreground">Last sync:</span>
            {isFetching ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span className="font-medium text-foreground">
                {lastUpdatedLabel}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="self-start border border-border/70 px-6 py-5 text-base font-semibold"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className="mr-2 size-5" />
          Refresh data
        </Button>
      </div>
    </div>
  );
}
