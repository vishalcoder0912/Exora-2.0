"use client";

import { useMemo } from "react";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, initials } from "@/lib/format";
import { useApp } from "@/store/app-store";
import type { Department, Employee } from "@/types";

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

function accessLevel(employee: Employee): "Admin" | "Manager" | "Member" {
  const role = employee.role.toLowerCase();
  if (role.includes("manager") || role.includes("lead")) return "Manager";
  if (employee.department === "Finance" || employee.department === "Human Resources")
    return "Admin";
  return "Member";
}

function permissionsFor(level: ReturnType<typeof accessLevel>): string[] {
  if (level === "Admin") return ["Full access", "Approvals", "Manage users"];
  if (level === "Manager") return ["Team access", "Approvals", "Reports"];
  return ["Own records", "Reports"];
}

export function UsersRoles() {
  const { state } = useApp();
  const employees = state.data.employees;

  const columns = useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        key: "employee",
        header: "Employee",
        sortValue: (row) => row.name,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                {initials(row.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{row.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortValue: (row) => row.role,
        cell: (row) => (
          <div className="space-y-1">
            <p className="text-xs">{row.role}</p>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 px-1.5 py-0 text-[10px] text-primary"
            >
              {accessLevel(row)}
            </Badge>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        cell: (row) => <span className="text-muted-foreground">{row.department}</span>,
      },
      {
        key: "permissions",
        header: "Permissions",
        cell: (row) => (
          <div className="flex flex-wrap gap-1">
            {permissionsFor(accessLevel(row)).map((permission) => (
              <Badge
                key={permission}
                variant="secondary"
                className="px-1.5 py-0 text-[10px] font-normal"
              >
                {permission}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: "joiningDate",
        header: "Joined",
        sortValue: (row) => row.joiningDate,
        cell: (row) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatDate(row.joiningDate)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [],
  );

  const filters = useMemo<DataTableFilter<Employee>[]>(
    () => [
      {
        key: "department",
        label: "departments",
        options: DEPARTMENTS.map((value) => ({ label: value, value })),
        predicate: (row, value) => row.department === value,
      },
      {
        key: "status",
        label: "statuses",
        options: [
          { label: "Active", value: "Active" },
          { label: "On leave", value: "On leave" },
          { label: "Inactive", value: "Inactive" },
        ],
        predicate: (row, value) => row.status === value,
      },
      {
        key: "access",
        label: "access levels",
        options: [
          { label: "Admin", value: "Admin" },
          { label: "Manager", value: "Manager" },
          { label: "Member", value: "Member" },
        ],
        predicate: (row, value) => accessLevel(row) === value,
      },
    ],
    [],
  );

  return (
    <SectionCard
      title="Users & roles"
      description={`${employees.length} employees with workspace access. Access levels are derived from role and department.`}
    >
      <DataTable
        data={employees}
        columns={columns}
        rowKey={(row) => row.id}
        searchText={(row) => [row.name, row.email, row.role, row.department, row.employeeId]}
        filters={filters}
        searchPlaceholder="Search users..."
        pageSize={8}
      />
    </SectionCard>
  );
}
