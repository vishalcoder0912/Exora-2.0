import { Suspense } from "react";

import { OperationsPage } from "@/components/operations/operations-page";

export default function OperationsRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-10 text-sm text-muted-foreground">
          Loading operations workspace…
        </div>
      }
    >
      <OperationsPage />
    </Suspense>
  );
}
