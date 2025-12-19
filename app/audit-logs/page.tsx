import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHero } from "@/components/dashboard/page-hero";
import { AuditLogsPanel } from "@/components/dashboard/audit/audit-logs-panel";

export default function AuditLogsPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Compliance"
        title="Audit logs"
        description="Investigate privileged events emitted by `/admin/audit-logs` before they become incidents."
      />
      <AuditLogsPanel />
    </DashboardShell>
  );
}
