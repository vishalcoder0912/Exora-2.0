import { Suspense } from "react";

import { HrWorkspace } from "@/components/hr/hr-workspace";

export default function HrPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1440px] px-4 py-8 text-sm text-muted-foreground lg:px-8">
          Loading HR workspace…
        </div>
      }
    >
      <HrWorkspace />
    </Suspense>
  );
}
