"use client";

import { useState } from "react";
import { CalendarDays, ListTodo, Search, Wallet } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactCurrency, formatDate, initials, relativeDate } from "@/lib/format";
import type { Project, Task } from "@/types";

interface ProjectsPanelProps {
  projects: Project[];
  tasks: Task[];
  today: string;
  onOpenProject: (project: Project) => void;
}

const PROJECT_STATUSES = ["On track", "At risk", "Delayed", "Completed"] as const;

export function ProjectsPanel({ projects, tasks, today, onOpenProject }: ProjectsPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const needle = query.trim().toLowerCase();
  const visible = projects.filter((project) => {
    const matchesQuery =
      needle === "" ||
      [project.name, project.owner, project.department, ...project.team]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    return matchesQuery && (status === "all" || project.status === status);
  });

  return (
    <SectionCard
      title="Projects"
      description={`${visible.length} of ${projects.length} projects shown`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All statuses
              </SelectItem>
              {PROJECT_STATUSES.map((option) => (
                <SelectItem key={option} value={option} className="text-xs">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No projects match your filters.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => {
            const openTaskCount = tasks.filter(
              (task) => task.projectId === project.id && task.status !== "Completed",
            ).length;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenProject(project)}
                className="flex w-full cursor-pointer flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {project.department} · {project.owner}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {project.description}
                </p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="flex items-center">
                    {project.team.slice(0, 3).map((member) => (
                      <span
                        key={member}
                        title={member}
                        className="-ml-1.5 flex size-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[9px] font-semibold text-secondary-foreground first:ml-0"
                      >
                        {initials(member)}
                      </span>
                    ))}
                    {project.team.length > 3 && (
                      <span className="-ml-1.5 flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium text-muted-foreground">
                        +{project.team.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ListTodo className="size-3" />
                    {openTaskCount} open
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1" title={formatDate(project.deadline)}>
                    <CalendarDays className="size-3" />
                    {relativeDate(project.deadline, today)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="size-3" />
                    {formatCompactCurrency(project.budget)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
