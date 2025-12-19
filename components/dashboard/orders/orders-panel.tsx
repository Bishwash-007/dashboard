"use client";

import { useMemo, useState } from "react";

import { FilterIcon, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useOrders, useOrderStatusMutation } from "@/hooks/use-orders";
import type { OrderStatus } from "@/types/api";

import { OrderStatusBadge } from "./order-status-badge";

const statusFilters = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const satisfies ReadonlyArray<{
  value: OrderStatus | "all";
  label: string;
}>;

type OrderFilterValue = (typeof statusFilters)[number]["value"];

const isOrderFilterValue = (value: string): value is OrderFilterValue =>
  statusFilters.some((filter) => filter.value === value);

const actionableStatusFilters = statusFilters.filter(
  (filter): filter is (typeof statusFilters)[number] & { value: OrderStatus } =>
    filter.value !== "all"
);

export function OrdersPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderFilterValue>("all");
  const [page, setPage] = useState(1);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, OrderStatus>
  >({});

  const queryParams = useMemo(
    () => ({
      page,
      limit: 8,
      search: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, search, status]
  );

  const { orders, pagination, isPending, refetch } = useOrders(queryParams);
  const { mutateAsync: updateStatus } = useOrderStatusMutation();

  const handleStatusChange = async (
    orderId: string,
    nextStatus: OrderStatus
  ) => {
    setUpdatingOrder(orderId);
    setOptimisticStatuses((prev) => ({ ...prev, [orderId]: nextStatus }));
    try {
      await updateStatus({ orderId, status: nextStatus });
    } finally {
      setUpdatingOrder(null);
      setOptimisticStatuses((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  };

  const isEmpty = !isPending && orders.length === 0;

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80  shadow-black/5">
        <CardHeader className="gap-6 pb-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Orders</CardTitle>
              <CardDescription className="text-base">
                Track fulfillment progress and update shipping states.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 items-start">
              <Input
                placeholder="Search orders, customers, emails..."
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                className="h-11 w-72 text-base"
              />
              <Select
                value={status}
                onValueChange={(value) => {
                  if (!isOrderFilterValue(value)) return;
                  setStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-52 text-base">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={() => refetch()}
                disabled={isPending}
              >
                <RefreshCw className="size-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-border/60 bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending &&
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 6 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {isEmpty && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <FilterIcon className="size-5" />
                        No orders match your filters.
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isPending &&
                  orders.map((order: (typeof orders)[number]) => (
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
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={optimisticStatuses[order._id] ?? order.status}
                          onValueChange={(value: OrderStatus) =>
                            handleStatusChange(order._id, value)
                          }
                          disabled={updatingOrder === order._id}
                        >
                          <SelectTrigger className="ml-auto w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end">
                            {actionableStatusFilters.map((filter) => (
                              <SelectItem
                                key={filter.value}
                                value={filter.value}
                              >
                                {filter.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 text-base text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <span>
              Showing{" "}
              {((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 8) +
                orders.length}{" "}
              of {pagination?.total ?? orders.length} orders
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={(pagination?.page ?? 1) <= 1}
                onClick={() => setPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={pagination?.pages ? page >= pagination.pages : true}
                onClick={() => setPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
