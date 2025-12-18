import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CustomersPanel } from "@/components/dashboard/customers/customers-panel";
import { PageHero } from "@/components/dashboard/page-hero";

export default function CustomersPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Retention"
        title="Customers"
        description="Surface loyalty signals, identify churn risk, and export segmented outreach lists."
      />
      <CustomersPanel />
    </DashboardShell>
  );
}
