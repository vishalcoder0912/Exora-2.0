"use client";

import { CalendarDays, ListTodo, Plus, Wallet } from "lucide-react";

import { DetailSheet } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatCompactCurrency, formatDate, initials, relativeDate } from "@/lib/format";
import type { Project, Task } from "@/types";

interface ProjectDetailSheetProps {
  project: Project | null;
  tasks: Task[];
  today: string;
  onClose: () => void;
  onCreateTask: (project: Project) => void;
  onOpenTask: (task: Task) => void;
}

export function ProjectDetailSheet({
  project,
  tasks,
  today,
  onClose,
  onCreateTask,
  onOpenTask,
}: ProjectDetailSheetProps) {
  const projectTasks = project ? tasks.filter((task) => task.projectId === project.id) : [];
  const completed = projectTasks.filter((task) => task.status === "Completed").length;

  return (
    <DetailSheet
      open={Boolean(project)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={project?.name ?? "Project details"}
      description={project ? `${project.id} · ${project.department}` : undefined}
    >
      {project && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            <span className="text-xs text-muted-foreground">{project.department}</span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{project.description}</p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="font-semibold tabular-nums text-foreground">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Owner</p>
              <p className="mt-1 truncate text-xs font-medium">{project.owner}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Budget</p>
              <p className="mt-1 text-xs font-medium tabular-nums">
                {formatCompactCurrency(project.budget)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Deadline</p>
              <p className="mt-1 text-xs font-medium">{formatDate(project.deadline)}</p>
              <p className="text-[10px] text-muted-foreground">
                {relativeDate(project.deadline, today)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tasks</p>
              <p className="mt-1 text-xs font-medium tabular-nums">
                {completed}/{projectTasks.length} complete
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Team
            </p>
            <div className="flex flex-wrap gap-2">
              {project.team.map((member) => (
                <span
                  key={member}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-2.5 text-[11px] font-medium"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[9px] text-primary">
                    {initials(member)}
                  </span>
                  {member}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Linked tasks
              </p>
              <Button size="sm" variant="outline" onClick={() => onCreateTask(project)}>
                <Plus className="size-3.5" />
                New task
              </Button>
            </div>
            <div className="divide-y divide-border rounded-lg border border-border">
              {projectTasks.slice(0, 8).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onOpenTask(task)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0 truncate text-xs font-medium">{task.title}</span>
                  <StatusBadge status={task.status} />
                </button>
              ))}
              {projectTasks.length === 0 && (
                <p className="px-3 py-5 text-center text-xs text-muted-foreground">
                  No tasks linked to this project yet.
                </p>
              )}
            </div>
            {projectTasks.length > 8 && (
              <p className="text-[10px] text-muted-foreground">
                Showing 8 of {projectTasks.length} linked tasks.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {formatDate(project.deadline)}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-3.5" /> {formatCompactCurrency(project.budget)}
            </span>
            <span className="flex items-center gap-1">
              <ListTodo className="size-3.5" /> {projectTasks.length} tasks
            </span>
          </div>
        </div>
      )}
    </DetailSheet>
  );
}
