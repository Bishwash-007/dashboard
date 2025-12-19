"use client";

import { useMemo, useState } from "react";

import { Download, RefreshCcw } from "lucide-react";

import { useAdminUsers } from "@/hooks/use-admin-users";
import type { AdminUserInsights } from "@/types/api";
import { Badge } from "@/components/ui/badge";
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

type RoleFilterValue = "all" | "user" | "staff" | "admin";

const roleFilters: { label: string; value: RoleFilterValue }[] = [
  { label: "All roles", value: "all" },
  { label: "Customers", value: "user" },
  { label: "Staff", value: "staff" },
  { label: "Admins", value: "admin" },
];

const isRoleFilterValue = (value: string): value is RoleFilterValue =>
  roleFilters.some((filter) => filter.value === value);

const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "--";

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "--";

const statusTone = (status?: string) => {
  switch (status) {
    case "healthy":
    case "Healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "at-risk":
    case "At Risk":
      return "border-rose-200 bg-rose-50 text-rose-600";
    case "nurture":
    case "Nurture":
      return "border-amber-200 bg-amber-50 text-amber-600";
    default:
      return "border-border/60 text-foreground";
  }
};

export function CustomersPanel() {
  const [role, setRole] = useState<RoleFilterValue>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 8,
      search: query || undefined,
      role: role === "all" ? undefined : role,
    }),
    [page, query, role]
  );

  const { users, pagination, isPending, isFetching, refetch } =
    useAdminUsers(params);

  const isEmpty = !isPending && users.length === 0;

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80 shadow-black/5">
        <CardHeader className="gap-6 pb-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Customers
              </CardTitle>
              <CardDescription className="text-base">
                Pull the live CRM roster directly from `/admin/users` and keep
                segments current.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search name or email"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-64 text-base"
              />
              <Select
                value={role}
                onValueChange={(value) => {
                  if (!isRoleFilterValue(value)) return;
                  setRole(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-48 text-base">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleFilters.map((filter) => (
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
                disabled={isFetching}
                title="Refresh"
              >
                <RefreshCcw className="size-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 size-5" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-border/60 bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead>Monthly spend</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending &&
                  Array.from({ length: 6 }).map((_, rowIndex) => (
                    <TableRow key={`customer-skeleton-${rowIndex}`}>
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {isEmpty && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No customers match the current filters.
                    </TableCell>
                  </TableRow>
                )}

                {!isPending &&
                  users.map((customer: AdminUserInsights) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {customer.name ?? customer.email ?? "--"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {customer.email ?? "--"}
                            {customer.location
                              ? ` • ${customer.location}`
                              : null}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">
                          {customer.role ?? "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.totalOrders?.toLocaleString() ?? "--"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.lifetimeValue)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(customer.monthlySpend)}
                      </TableCell>
                      <TableCell>{formatDate(customer.lastActive)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusTone(customer.status)}
                        >
                          {customer.status ?? "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 text-base text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <span>
              Showing {users.length} of {pagination?.total ?? users.length}{" "}
              customers
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={(pagination?.page ?? 1) <= 1 || isPending}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={
                  pagination?.pages
                    ? page >= pagination.pages
                    : users.length === 0
                }
                onClick={() => setPage((current) => current + 1)}
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
