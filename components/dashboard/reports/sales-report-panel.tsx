"use client";

import { useMemo, useState } from "react";

import { RefreshCcw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

import { useSalesReport } from "@/hooks/use-sales-report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 30 days", value: "30d", days: 30 },
  { label: "Last 90 days", value: "90d", days: 90 },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--secondary-foreground))",
  },
} satisfies ChartConfig;

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "--";

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString() : "--";

const getRangeConfig = (value: RangeValue) =>
  RANGE_OPTIONS.find((option) => option.value === value) ?? RANGE_OPTIONS[1];

export function SalesReportPanel() {
  const [range, setRange] = useState<RangeValue>("30d");

  const dateParams = useMemo(() => {
    const config = getRangeConfig(range);
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - (config.days - 1));

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [range]);

  const { report, isPending, isFetching, refetch } = useSalesReport(dateParams);

  const salesData = report?.salesData ?? [];
  const totals = useMemo(() => {
    if (report?.totals) {
      return report.totals;
    }
    if (!salesData.length) {
      return { revenue: 0, orders: 0, averageOrderValue: 0 };
    }
    const revenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
    const orders = salesData.reduce((sum, day) => sum + day.orders, 0);
    return {
      revenue,
      orders,
      averageOrderValue: orders ? revenue / orders : 0,
    };
  }, [report?.totals, salesData]);

  const chartData = salesData.map((day) => ({
    date: day.date,
    revenue: day.revenue,
    orders: day.orders,
  }));

  const topProducts = report?.topProducts ?? [];

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80 shadow-black/5">
        <CardHeader className="gap-4 pb-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Sales report
              </CardTitle>
              <CardDescription className="text-base">
                Query for report sales for the selected window.
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Select
                value={range}
                onValueChange={(value) => setRange(value as RangeValue)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh"
              >
                <RefreshCcw className="size-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(totals?.revenue)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-semibold">
                {formatNumber(totals?.orders)}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">Avg. order value</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(totals?.averageOrderValue)}
              </p>
            </div>
          </div>
          <div className="border border-border/60 bg-background/60 p-4">
            {isPending ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="fillRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-revenue)"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis yAxisId="revenue" hide domain={[0, "auto"]} />
                  <YAxis yAxisId="orders" hide domain={[0, "auto"]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value as string).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )
                        }
                        formatter={(val, name) => {
                          if (name === "revenue") {
                            return [formatCurrency(val as number), "Revenue"];
                          }
                          return [
                            `${Math.round(val as number).toLocaleString()}`,
                            "Orders",
                          ];
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="url(#fillRevenue)"
                    strokeWidth={2}
                    yAxisId="revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders, hsl(var(--secondary-foreground)))"
                    strokeWidth={2}
                    dot={false}
                    yAxisId="orders"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card/80 shadow-black/5">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-semibold">Top products</CardTitle>
          <CardDescription>Sorted by captured revenue.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isPending ? (
            <Skeleton className="h-48 w-full" />
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No products in this window.
            </div>
          ) : (
            <div className="border border-border/60 bg-background/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.units?.toLocaleString() ?? "--"}
                      </TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
