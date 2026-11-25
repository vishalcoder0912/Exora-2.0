import { Suspense } from "react";

import { TasksWorkspace } from "@/components/tasks/tasks-workspace";

export const metadata = {
  title: "My tasks",
};

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading tasks…</div>}>
      <TasksWorkspace />
    </Suspense>
  );
}
