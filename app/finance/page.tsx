import { Suspense } from "react";

import { FinanceWorkspace } from "@/components/finance/finance-workspace";

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 text-sm text-muted-foreground lg:px-8">
          Loading finance workspace…
        </div>
      }
    >
      <FinanceWorkspace />
    </Suspense>
  );
}
