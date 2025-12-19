import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHero } from "@/components/dashboard/page-hero";
import { SalesReportPanel } from "@/components/dashboard/reports/sales-report-panel";

export default function ReportsPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Revenue"
        title="Sales report"
        description="Slice `/admin/reports/sales` by rolling date windows to monitor run-rate in real time."
      />
      <SalesReportPanel />
    </DashboardShell>
  );
}
