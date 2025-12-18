"use client";

import Link from "next/link";
import { ArrowUpRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardSnapshot } from "@/hooks/use-dashboard";

import { OrderStatusBadge } from "./order-status-badge";

export function RecentOrdersCard() {
  const { data, isPending, isFetching, refetch } = useDashboardSnapshot();
  const orders = data?.data?.recentOrders ?? [];
  const latestOrders = orders.slice(0, 6);
  const isEmpty = !isPending && latestOrders.length === 0;

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80  shadow-black/5">
        <CardHeader className="gap-4 pb-0 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold">
              Recent orders
            </CardTitle>
            <CardDescription className="text-base">
              Live snapshot of storefront purchases in the last few minutes.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className="mr-2 size-5" />
              Refresh
            </Button>
            <Button size="lg" asChild>
              <Link href="/orders">
                View all
                <ArrowUpRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-border/60 bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending &&
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`}>
                      {Array.from({ length: 5 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {isEmpty && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      All caught up. Recent orders will appear here as soon as
                      new payments are captured.
                    </TableCell>
                  </TableRow>
                )}
                {!isPending &&
                  latestOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.customerName ?? "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.customerEmail ?? "--"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(
                          order.updatedAt ?? order.createdAt
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
