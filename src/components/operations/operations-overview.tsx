"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, FolderKanban, Users } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, relativeDate } from "@/lib/format";
import type { CompanyMetrics, Employee, Project, Task } from "@/types";

interface OperationsOverviewProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  metrics: CompanyMetrics;
  today: string;
  onOpenProject: (project: Project) => void;
  onOpenTask: (task: Task) => void;
  onTabChange: (tab: "projects" | "tasks" | "team") => void;
}

export function OperationsOverview({
  projects,
  tasks,
  employees,
  metrics,
  today,
  onOpenProject,
  onOpenTask,
  onTabChange,
}: OperationsOverviewProps) {
  const activeProjects = projects.filter((project) => project.status !== "Completed");
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const openTasks = tasks.filter((task) => task.status !== "Completed").length;
  const activeEmployees = employees.filter((employee) => employee.status === "Active").length;

  const progressData = activeProjects.map((project) => ({
    name: project.name.length > 20 ? `${project.name.slice(0, 19)}…` : project.name,
    progress: project.progress,
  }));

  const priorityTasks = tasks
    .filter((task) => task.priority === "High" && task.status !== "Completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const attentionProjects = projects
    .filter((project) => project.status === "Delayed" || project.status === "At risk")
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active projects"
          value={String(activeProjects.length)}
          note={`${projects.length - activeProjects.length} completed projects`}
          icon={FolderKanban}
          tone="primary"
          onClick={() => onTabChange("projects")}
        />
        <StatCard
          label="Completed tasks"
          value={String(completedTasks)}
          note={`${tasks.length} tasks tracked overall`}
          icon={CheckCircle2}
          tone="positive"
          onClick={() => onTabChange("tasks")}
        />
        <StatCard
          label="Overdue tasks"
          value={String(metrics.overdueTasks)}
          note={`${metrics.highPriorityOverdue} high priority`}
          icon={AlertTriangle}
          tone="critical"
          onClick={() => onTabChange("tasks")}
        />
        <StatCard
          label="Team capacity"
          value={`${activeEmployees} people`}
          note={`${openTasks} open tasks across ${activeProjects.length} projects`}
          icon={Users}
          tone="ai"
          onClick={() => onTabChange("team")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          title="Project progress"
          description="Completion percentage across active projects"
          className="lg:col-span-3"
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={progressData}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="progress" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Priority tasks"
            description="High-priority work due soonest"
            action={<AlertTriangle className="size-4 text-critical" />}
          >
            <div className="divide-y divide-border">
              {priorityTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onOpenTask(task)}
                  className="flex w-full cursor-pointer items-start justify-between gap-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{task.title}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{task.projectName}</p>
                  </div>
                  <span className="shrink-0 text-right text-[10px] text-muted-foreground">
                    {relativeDate(task.dueDate, today)}
                  </span>
                </button>
              ))}
              {priorityTasks.length === 0 && (
                <p className="py-5 text-center text-xs text-muted-foreground">
                  No open high-priority tasks.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Projects needing attention"
            description="Delayed or at-risk delivery"
            action={
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {attentionProjects.length}
              </span>
            }
          >
            <div className="divide-y divide-border">
              {attentionProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{project.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {project.progress}%
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                </button>
              ))}
              {attentionProjects.length === 0 && (
                <p className="py-5 text-center text-xs text-muted-foreground">
                  Every project is on track.
                </p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
