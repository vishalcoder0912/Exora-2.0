"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import type { Department, Employee, EmployeeStatus } from "@/types";

interface EmployeesTableProps {
  employees: Employee[];
  departments: Department[];
  onOpen: (id: string) => void;
}

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ["Active", "On leave", "Inactive"];

export function EmployeesTable({ employees, departments, onOpen }: EmployeesTableProps) {
  const columns: DataTableColumn<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      sortValue: (row) => row.name.toLowerCase(),
      cell: (row) => (
        <div className="flex min-w-[170px] items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
              {initials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "Employee ID",
      sortValue: (row) => row.employeeId,
      cell: (row) => (
        <span className="font-mono text-[11px] text-muted-foreground">{row.employeeId}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => row.department,
      cell: (row) => <span className="whitespace-nowrap">{row.department}</span>,
    },
    {
      key: "role",
      header: "Role",
      sortValue: (row) => row.role,
      cell: (row) => <span className="whitespace-nowrap">{row.role}</span>,
    },
    {
      key: "joiningDate",
      header: "Joining date",
      sortValue: (row) => row.joiningDate,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDate(row.joiningDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const filters: DataTableFilter<Employee>[] = [
    {
      key: "department",
      label: "departments",
      options: departments.map((department) => ({ label: department, value: department })),
      predicate: (row, value) => row.department === value,
    },
    {
      key: "status",
      label: "statuses",
      options: EMPLOYEE_STATUSES.map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
  ];

  return (
    <DataTable
      data={employees}
      columns={columns}
      rowKey={(row) => row.id}
      searchText={(row) => [
        row.name,
        row.employeeId,
        row.role,
        row.email,
        row.department,
        row.status,
      ]}
      filters={filters}
      searchPlaceholder="Search employees..."
      pageSize={8}
      onRowClick={(row) => onOpen(row.id)}
      emptyMessage="No employees match the current filters."
    />
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-xs text-foreground">{value}</p>
    </div>
  );
}

export function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {initials(employee.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{employee.name}</p>
          <p className="truncate text-xs text-muted-foreground">{employee.role}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <StatusBadge status={employee.status} />
            <span className="font-mono text-[10px] text-muted-foreground">
              {employee.employeeId}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <ProfileField label="Department" value={employee.department} />
        <ProfileField label="Location" value={employee.location || "Not recorded"} />
        <ProfileField label="Joining date" value={formatDate(employee.joiningDate)} />
        <ProfileField label="Manager" value={employee.manager || "Not assigned"} />
        <ProfileField
          label="Annual salary"
          value={employee.salary ? formatCurrency(employee.salary) : "Not recorded"}
        />
        <ProfileField label="Phone" value={employee.phone || "Not recorded"} />
        <div className="col-span-2">
          <ProfileField label="Work email" value={employee.email || "Not recorded"} />
        </div>
      </div>

      <p className="rounded-md border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
        Employee records in this prototype are sample data. New records created from the Add
        employee form appear at the top of the directory immediately.
      </p>
    </div>
  );
}
