"use client";

import { useMemo, useState } from "react";

import { Plus, RefreshCcw } from "lucide-react";

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
import { useProducts } from "@/hooks/use-products";
import { useUiStore } from "@/stores/ui-store";
import type { Product } from "@/types/api";

import { ProductDrawer } from "./product-drawer";

const statusFilters = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
] as const;

type ProductFilterStatus = (typeof statusFilters)[number]["value"];

const isProductFilterStatus = (value: string): value is ProductFilterStatus =>
  statusFilters.some((filter) => filter.value === value);

export function ProductsPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductFilterStatus>("all");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 6,
      search: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, search, status]
  );

  const { products, pagination, isPending, refetch } = useProducts(params);
  const openProductDrawer = useUiStore((state) => state.openProductDrawer);

  const isEmpty = !isPending && products.length === 0;

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80  shadow-black/5">
        <CardHeader className="flex flex-col gap-6 pb-0 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">Products</CardTitle>
            <CardDescription className="text-base">
              Manage catalog inventory, pricing, and stock levels.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search products"
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
                if (!isProductFilterStatus(value)) return;
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-48 text-base">
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
              <RefreshCcw className="size-5" />
            </Button>
            <Button size="lg" onClick={() => openProductDrawer()}>
              <Plus className="mr-2 size-5" />
              Add product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border border-border/60 bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Last update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending &&
                  Array.from({ length: 5 }).map((_, index) => (
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
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No products found. Adjust your filters or create a new
                      item.
                    </TableCell>
                  </TableRow>
                )}
                {!isPending &&
                  products.map((product: Product) => {
                    const variants = product.variants ?? [];
                    const totalStock = variants.reduce(
                      (acc, variant) => acc + (variant.stock ?? 0),
                      0
                    );
                    const variantCount = variants.length;
                    return (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.brand ?? "--"}</TableCell>
                        <TableCell>{variantCount}</TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell>
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString()
                            : "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openProductDrawer({ product })}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 text-base text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
            <span>
              {products.length} items on this page ·{" "}
              {pagination?.total ?? products.length} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={(pagination?.page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={pagination?.pages ? page >= pagination.pages : true}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ProductDrawer />
    </section>
  );
}
