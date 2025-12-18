import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrdersPanel } from "@/components/dashboard/orders/orders-panel";
import { PageHero } from "@/components/dashboard/page-hero";

export default function OrdersPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Fulfillment"
        title="Orders"
        description="Resolve exceptions, update shipment states, and monitor high-value purchases."
      />
      <OrdersPanel />
    </DashboardShell>
  );
}
