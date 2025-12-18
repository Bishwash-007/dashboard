"use client";

import { useMemo, useState } from "react";

import { Download } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = [
  {
    id: "CUS-4812",
    name: "Mara Ellison",
    email: "mara@auroradev.io",
    segment: "vip",
    location: "Austin, USA",
    lifetimeValue: 18620,
    monthlySpend: 1280,
    orders: 32,
    lastActive: "2025-12-17T10:32:00.000Z",
    health: "Healthy",
  },
  {
    id: "CUS-4718",
    name: "Dev Patel",
    email: "dev@orbitlabs.co",
    segment: "growth",
    location: "Toronto, CA",
    lifetimeValue: 9320,
    monthlySpend: 540,
    orders: 18,
    lastActive: "2025-12-12T15:21:00.000Z",
    health: "Healthy",
  },
  {
    id: "CUS-4690",
    name: "Lina Paredes",
    email: "lina@stellarwave.com",
    segment: "active",
    location: "Madrid, ES",
    lifetimeValue: 4210,
    monthlySpend: 320,
    orders: 10,
    lastActive: "2025-12-13T09:10:00.000Z",
    health: "Nurture",
  },
  {
    id: "CUS-4581",
    name: "Jonah Reese",
    email: "jonah@circuitnorth.io",
    segment: "churn-risk",
    location: "Portland, USA",
    lifetimeValue: 2880,
    monthlySpend: 140,
    orders: 6,
    lastActive: "2025-11-28T19:45:00.000Z",
    health: "At Risk",
  },
  {
    id: "CUS-4524",
    name: "Emi Nakano",
    email: "emi@lumenlabs.jp",
    segment: "growth",
    location: "Osaka, JP",
    lifetimeValue: 7640,
    monthlySpend: 610,
    orders: 15,
    lastActive: "2025-12-10T08:14:00.000Z",
    health: "Healthy",
  },
  {
    id: "CUS-4491",
    name: "Noah Bishop",
    email: "noah@phasevolt.com",
    segment: "active",
    location: "Manchester, UK",
    lifetimeValue: 3890,
    monthlySpend: 290,
    orders: 11,
    lastActive: "2025-12-14T17:20:00.000Z",
    health: "Nurture",
  },
] as const;

type CustomerSegment = "all" | "vip" | "growth" | "active" | "churn-risk";

const segmentFilters: { label: string; value: CustomerSegment }[] = [
  { label: "All segments", value: "all" },
  { label: "VIP", value: "vip" },
  { label: "Growth", value: "growth" },
  { label: "Active", value: "active" },
  { label: "Churn risk", value: "churn-risk" },
];

const isCustomerSegment = (value: string): value is CustomerSegment =>
  segmentFilters.some((filter) => filter.value === value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function CustomersPanel() {
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSegment = segment === "all" || customer.segment === segment;
      const matchesQuery =
        query.length === 0 ||
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase());
      return matchesSegment && matchesQuery;
    });
  }, [segment, query]);

  return (
    <section className="space-y-6">
      <Card className="border border-border/60 bg-card/80  shadow-black/5">
        <CardHeader className="gap-6 pb-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Customers
              </CardTitle>
              <CardDescription className="text-base">
                Segment high-value buyers, watch retention risk, and export
                ready-made lists.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search name or email"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-72 text-base"
              />
              <Select
                value={segment}
                onValueChange={(value) => {
                  if (!isCustomerSegment(value)) return;
                  setSegment(value);
                }}
              >
                <SelectTrigger className="h-11 w-48 text-base">
                  <SelectValue placeholder="Segment" />
                </SelectTrigger>
                <SelectContent>
                  {segmentFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <TableHead>Segment</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead>Monthly spend</TableHead>
                  <TableHead>Last active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {customer.segment.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>
                      {formatCurrency(customer.lifetimeValue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(customer.monthlySpend)}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          customer.health === "Healthy"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : customer.health === "At Risk"
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-amber-200 bg-amber-50 text-amber-600"
                        }
                      >
                        {customer.health}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="text-base text-muted-foreground">
            {filteredCustomers.length} customers · {customers.length} in view
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
