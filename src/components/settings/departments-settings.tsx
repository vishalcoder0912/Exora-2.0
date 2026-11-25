"use client";

import { useMemo } from "react";
import { UsersRound } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/store/app-store";
import type { Department } from "@/types";

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

export function DepartmentsSettings() {
  const { state } = useApp();
  const employees = state.data.employees;

  const departments = useMemo(
    () =>
      DEPARTMENTS.map((department) => {
        const members = employees.filter((employee) => employee.department === department);
        const active = members.filter((employee) => employee.status === "Active").length;
        return {
          department,
          headcount: members.length,
          active,
          roles: [...new Set(members.map((member) => member.role))].slice(0, 3),
        };
      }),
    [employees],
  );

  const total = employees.length;

  return (
    <SectionCard
      title="Departments"
      description="Headcount and active employees by department, calculated from the current workspace data."
      action={
        <span className="text-[11px] text-muted-foreground">
          {departments.length} departments · {total} employees
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((item) => (
          <div
            key={item.department}
            className="space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.department}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.roles.length > 0 ? item.roles.join(" · ") : "No roles assigned"}
                </p>
              </div>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UsersRound className="size-4" />
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xl font-semibold tabular-nums">{item.headcount}</p>
                <p className="text-[11px] text-muted-foreground">employees</p>
              </div>
              <p className="text-[11px] tabular-nums text-muted-foreground">{item.active} active</p>
            </div>
            <Progress value={total > 0 ? (item.headcount / total) * 100 : 0} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">
              {total > 0 ? ((item.headcount / total) * 100).toFixed(1) : "0.0"}% of total workforce
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
