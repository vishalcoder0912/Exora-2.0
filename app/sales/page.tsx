import { Suspense } from "react";

import { SalesPage } from "@/components/sales/sales-page";

export default function SalesRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-10 text-sm text-muted-foreground">Loading sales workspace…</div>
      }
    >
      <SalesPage />
    </Suspense>
  );
}
