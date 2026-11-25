"use client";

import { AlertTriangle, ListTodo } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { initials } from "@/lib/format";
import type { Employee, Task } from "@/types";

interface TeamWorkloadProps {
  employees: Employee[];
  tasks: Task[];
  today: string;
}

export function TeamWorkload({ employees, tasks, today }: TeamWorkloadProps) {
  const rows = employees
    .map((employee) => {
      const assigned = tasks.filter((task) => task.assignee === employee.name);
      const active = assigned.filter((task) => task.status !== "Completed");
      const overdue = active.filter((task) => task.dueDate < today);
      const load = Math.min(100, active.length * 12);
      const label = load >= 80 ? "Near capacity" : load >= 40 ? "Balanced" : "Available";
      return { employee, active: active.length, overdue: overdue.length, load, label };
    })
    .sort((a, b) => b.active - a.active || a.employee.name.localeCompare(b.employee.name));

  const activeEmployees = employees.filter((employee) => employee.status === "Active").length;
  const totalActiveTasks = tasks.filter((task) => task.status !== "Completed").length;

  return (
    <SectionCard
      title="Team workload"
      description={`Active task load across ${activeEmployees} employees · ${totalActiveTasks} open tasks`}
      action={<ListTodo className="size-4 text-muted-foreground" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-muted-foreground">
              <th className="pb-2 pr-4 font-semibold">Employee</th>
              <th className="pb-2 pr-4 font-semibold">Department</th>
              <th className="pb-2 pr-4 font-semibold">Utilization</th>
              <th className="pb-2 pr-4 text-right font-semibold">Active</th>
              <th className="pb-2 text-right font-semibold">Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ employee, active, overdue, load, label }) => (
              <tr key={employee.id} className="transition-colors hover:bg-muted/40">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {initials(employee.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{employee.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">{employee.department}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${load >= 80 ? "bg-critical" : load >= 40 ? "bg-primary" : "bg-positive"}`}
                        style={{ width: `${load}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                      {label} · {load}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-right font-medium tabular-nums">{active}</td>
                <td className="py-2.5 text-right">
                  {overdue > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-critical">
                      <AlertTriangle className="size-3" />
                      {overdue}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>Bar width is capped at 100% and scales with active assignments.</span>
        <StatusBadge status="Active" className="ml-auto" />
      </div>
    </SectionCard>
  );
}
