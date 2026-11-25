"use client";

import { Pencil } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, initials, relativeDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/types";

const COLUMNS: { status: TaskStatus; hint: string }[] = [
  { status: "Open", hint: "Not started" },
  { status: "In progress", hint: "Being worked on" },
  { status: "Completed", hint: "Done" },
];

const STATUSES: TaskStatus[] = ["Open", "In progress", "Completed"];

interface TaskKanbanProps {
  tasks: Task[];
  today: string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
}

export function TaskKanban({ tasks, today, onStatusChange, onSelect, onEdit }: TaskKanbanProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((column) => {
        const items = tasks.filter((task) => task.status === column.status);
        return (
          <section
            key={column.status}
            className="min-w-0 rounded-lg border border-border bg-muted/20 p-3"
          >
            <header className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <h3 className="text-xs font-semibold text-foreground">{column.status}</h3>
                <p className="text-[11px] text-muted-foreground">{column.hint}</p>
              </div>
              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                {items.length}
              </span>
            </header>

            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                  No tasks in this stage.
                </p>
              ) : (
                items.map((task) => {
                  const overdue = task.dueDate < today && task.status !== "Completed";
                  return (
                    <article
                      key={task.id}
                      className="cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30"
                      onClick={() => onSelect(task)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug text-foreground">
                          {task.title}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="-mr-1 -mt-1 size-6 shrink-0"
                          aria-label={`Edit ${task.title}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(task);
                          }}
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{task.projectName}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={task.priority} />
                        <span className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {task.department}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                              {initials(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {task.assignee}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] tabular-nums ${overdue ? "text-critical" : "text-muted-foreground"}`}
                        >
                          {relativeDate(task.dueDate, today)} · {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                        <Select
                          value={task.status}
                          onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
                        >
                          <SelectTrigger className="h-7 w-full text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status} className="text-xs">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
