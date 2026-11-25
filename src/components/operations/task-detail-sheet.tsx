"use client";

import { Building2, CalendarDays, CheckCircle2, User } from "lucide-react";

import { DetailSheet } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, relativeDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/types";

interface TaskDetailSheetProps {
  task: Task | null;
  today: string;
  onClose: () => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TASK_STATUSES: TaskStatus[] = ["Open", "In progress", "Completed"];

export function TaskDetailSheet({ task, today, onClose, onStatusChange }: TaskDetailSheetProps) {
  return (
    <DetailSheet
      open={Boolean(task)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={task?.title ?? "Task details"}
      description={task ? `${task.id} · ${task.projectName}` : undefined}
    >
      {task && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.priority} />
            <StatusBadge status={task.status} />
            <span
              className={
                task.dueDate < today && task.status !== "Completed"
                  ? "text-xs font-medium text-critical"
                  : "text-xs text-muted-foreground"
              }
            >
              Due {formatDate(task.dueDate)}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{task.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <User className="size-3" /> Assignee
              </p>
              <p className="mt-1 truncate text-xs font-medium">{task.assignee}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <Building2 className="size-3" /> Department
              </p>
              <p className="mt-1 truncate text-xs font-medium">{task.department}</p>
            </div>
            <div className="col-span-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-3" /> Timeline
              </p>
              <p className="mt-1 text-xs font-medium">
                {formatDate(task.dueDate)} · {relativeDate(task.dueDate, today)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Task status</Label>
            <Select
              value={task.status}
              onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {task.status !== "Completed" && (
            <Button size="sm" className="w-full" onClick={() => onStatusChange(task, "Completed")}>
              <CheckCircle2 className="size-3.5" />
              Mark as completed
            </Button>
          )}
        </div>
      )}
    </DetailSheet>
  );
}
