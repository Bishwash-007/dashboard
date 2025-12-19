import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHero } from "@/components/dashboard/page-hero";
import { SiteSettingsPanel } from "@/components/dashboard/settings/site-settings-panel";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Content"
        title="Site Settings"
        description="Update support details, HQ addresses, social handles, and storefront policies without touching the database."
      />
      <SiteSettingsPanel />
    </DashboardShell>
  );
}
