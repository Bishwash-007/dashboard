import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { RecentOrdersCard } from "@/components/dashboard/orders/recent-orders-card";
import { PageHeader } from "@/components/dashboard/page-header";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PageHeader />
      <MetricsGrid />
      <RecentOrdersCard />
    </DashboardShell>
  );
}
