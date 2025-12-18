import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHero } from "@/components/dashboard/page-hero";
import { ProductsPanel } from "@/components/dashboard/products/products-panel";

export default function ProductsPage() {
  return (
    <DashboardShell>
      <PageHero
        eyebrow="Catalog"
        title="Products"
        description="Manage active listings, pricing, and stock from a single workspace."
      />
      <ProductsPanel />
    </DashboardShell>
  );
}
