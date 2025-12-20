"use client";

import { useMemo, useState } from "react";

import { RefreshCcw } from "lucide-react";

import { useAuditLogs } from "@/hooks/use-audit-logs";
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
import type { AuditLogEntry } from "@/types/api";

const actionFilters = [
  { label: "All actions", value: "all" },
  { label: "Order updates", value: "order.status.updated" },
  { label: "Product changes", value: "product.updated" },
  { label: "Security", value: "auth.event" },
] as const;

type ActionFilterValue = (typeof actionFilters)[number]["value"];

const isActionFilterValue = (value: string): value is ActionFilterValue =>
  actionFilters.some((filter) => filter.value === value);

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AuditLogsPanel() {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilterValue>("all");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: query || undefined,
      action: actionFilter === "all" ? undefined : actionFilter,
    }),
    [page, query, actionFilter]
  );

  const { logs, pagination, isPending, isFetching, refetch } =
    useAuditLogs(params);

  const isEmpty = !isPending && logs.length === 0;

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80 shadow-black/5">
        <CardHeader className="gap-4 pb-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Audit logs
              </CardTitle>
              <CardDescription className="text-base">
                Every sensitive change from audit logs captured with
                actor context.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search actor, action, or context"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                className="h-11 w-72 text-base"
              />
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  if (!isActionFilterValue(value)) return;
                  setActionFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-48 text-base">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {actionFilters.map((filter) => (
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-border/60 bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending &&
                  Array.from({ length: 6 }).map((_, rowIndex) => (
                    <TableRow key={`log-skeleton-${rowIndex}`}>
                      {Array.from({ length: 4 }).map((__, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {isEmpty && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No audit activity for this filter.
                    </TableCell>
                  </TableRow>
                )}

                {!isPending &&
                  logs.map((log: AuditLogEntry) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">
                            {log.action.replace(/\./g, " ")}
                          </span>
                          {log.description && (
                            <span className="text-xs text-muted-foreground">
                              {log.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof log.actor === "string" || !log.actor ? (
                          <Badge variant="outline">
                            {log.actor ?? "System"}
                          </Badge>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {log.actor.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.actor.email}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.context ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {log.context}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 text-base text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <span>
              Showing {logs.length} of {pagination?.total ?? logs.length} events
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
                    : logs.length === 0
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
