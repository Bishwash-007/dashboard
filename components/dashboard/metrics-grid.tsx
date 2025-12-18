"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDashboardSnapshot } from "@/hooks/use-dashboard";

const metricConfig = [
  {
    key: "totalRevenue" as const,
    label: "Total Revenue",
    suffix: "$",
    trend: +4.7,
  },
  {
    key: "totalOrders" as const,
    label: "Orders",
    trend: +2.1,
  },
  {
    key: "totalProducts" as const,
    label: "Products",
    trend: -1.4,
  },
  {
    key: "totalUsers" as const,
    label: "Customers",
    trend: +6.2,
  },
];

export function MetricsGrid() {
  const { data, isPending } = useDashboardSnapshot();
  const snapshot = data?.data;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {metricConfig.map((metric) => {
        const value = snapshot?.[metric.key];
        const formattedValue =
          metric.key === "totalRevenue" && typeof value === "number"
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(value)
            : value?.toLocaleString();

        const isPositive = metric.trend >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card
            key={metric.key}
            className="border border-border/50 bg-card/80 py-8 "
          >
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isPending ? (
                <Skeleton className="h-12 w-2/3" />
              ) : (
                <p className="text-4xl font-semibold tracking-tight">
                  {formattedValue ?? "--"}
                </p>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-base font-medium",
                  isPositive ? "text-emerald-600" : "text-rose-500"
                )}
              >
                <TrendIcon className="size-5" />
                {metric.trend > 0 ? "+" : ""}
                {metric.trend}%
                <span className="text-muted-foreground font-normal">
                  vs last period
                </span>
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
