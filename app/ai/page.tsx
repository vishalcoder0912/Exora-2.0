import { Suspense } from "react";

import { AiWorkspace } from "@/components/ai/ai-workspace";

export default function AiPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-muted-foreground">Loading AI workspace…</div>}
    >
      <AiWorkspace />
    </Suspense>
  );
}
