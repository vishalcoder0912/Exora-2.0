"use client";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  daysWaiting,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatShortDate,
} from "@/lib/format";
import type { Department, Invoice, InvoiceStatus, Project, Transaction } from "@/types";

const INVOICE_STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Overdue"];

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const categories = Array.from(new Set(transactions.map((item) => item.category))).sort();
  const departments = Array.from(new Set(transactions.map((item) => item.department))).sort();

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "date",
      header: "Date",
      sortValue: (row) => row.date,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatShortDate(row.date)}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortValue: (row) => row.description.toLowerCase(),
      cell: (row) => (
        <div className="min-w-[210px]">
          <p className="truncate font-medium text-foreground">{row.description}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{row.reference}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortValue: (row) => row.category,
      cell: (row) => <span className="whitespace-nowrap">{row.category}</span>,
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => row.department,
      cell: (row) => <span className="whitespace-nowrap">{row.department}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (row) => row.amount,
      cell: (row) => (
        <span
          className={cn(
            "whitespace-nowrap font-medium tabular-nums",
            row.type === "Income" ? "text-positive" : "text-foreground",
          )}
        >
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortValue: (row) => row.type,
      cell: (row) => (
        <span
          className={cn(
            "whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-medium",
            row.type === "Income"
              ? "border-positive/25 bg-positive/10 text-positive"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const filters: DataTableFilter<Transaction>[] = [
    {
      key: "dateRange",
      label: "dates",
      options: [
        { label: "1–7 Nov", value: "early" },
        { label: "8–14 Nov", value: "mid" },
        { label: "15–21 Nov", value: "late" },
      ],
      predicate: (row, value) => {
        const day = Number(row.date.slice(8, 10));
        if (value === "early") return day >= 1 && day <= 7;
        if (value === "mid") return day >= 8 && day <= 14;
        return day >= 15 && day <= 21;
      },
    },
    {
      key: "category",
      label: "categories",
      options: categories.map((category) => ({ label: category, value: category })),
      predicate: (row, value) => row.category === value,
    },
    {
      key: "department",
      label: "departments",
      options: departments.map((department) => ({ label: department, value: department })),
      predicate: (row, value) => row.department === value,
    },
    {
      key: "type",
      label: "types",
      options: [
        { label: "Income", value: "Income" },
        { label: "Expense", value: "Expense" },
      ],
      predicate: (row, value) => row.type === value,
    },
  ];

  return (
    <DataTable
      data={transactions}
      columns={columns}
      rowKey={(row) => row.id}
      searchText={(row) => [
        row.description,
        row.category,
        row.department,
        row.reference,
        row.status,
      ]}
      filters={filters}
      searchPlaceholder="Search transactions..."
      pageSize={10}
      emptyMessage="No transactions match the current filters."
    />
  );
}

interface InvoicesTableProps {
  invoices: Invoice[];
  today: string;
  onOpen: (id: string) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
}

export function InvoicesTable({ invoices, today, onOpen, onStatusChange }: InvoicesTableProps) {
  const columns: DataTableColumn<Invoice>[] = [
    {
      key: "number",
      header: "Invoice",
      sortValue: (row) => row.number,
      cell: (row) => (
        <span className="whitespace-nowrap font-mono text-[11px] font-medium text-foreground">
          {row.number}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      sortValue: (row) => row.client.toLowerCase(),
      cell: (row) => (
        <span className="whitespace-nowrap font-medium text-foreground">{row.client}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortValue: (row) => row.amount,
      cell: (row) => (
        <span className="whitespace-nowrap font-medium tabular-nums">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "issueDate",
      header: "Issue date",
      sortValue: (row) => row.issueDate,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDate(row.issueDate)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due date",
      sortValue: (row) => row.dueDate,
      cell: (row) => (
        <span
          className={cn(
            "whitespace-nowrap tabular-nums",
            row.status !== "Paid" && row.dueDate < today
              ? "text-critical"
              : "text-muted-foreground",
          )}
        >
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (
        <div onClick={(event) => event.stopPropagation()} className="w-[132px]">
          <Select
            value={row.status}
            onValueChange={(value) => onStatusChange(row.id, value as InvoiceStatus)}
          >
            <SelectTrigger className="h-7 border-transparent bg-transparent p-0 text-xs shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (row) => row.department,
      cell: (row) => <span className="whitespace-nowrap">{row.department}</span>,
    },
  ];

  const filters: DataTableFilter<Invoice>[] = [
    {
      key: "status",
      label: "statuses",
      options: INVOICE_STATUSES.map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
    {
      key: "department",
      label: "departments",
      options: Array.from(new Set(invoices.map((invoice) => invoice.department))).map(
        (department) => ({
          label: department,
          value: department,
        }),
      ),
      predicate: (row, value) => row.department === value,
    },
  ];

  return (
    <DataTable
      data={invoices}
      columns={columns}
      rowKey={(row) => row.id}
      searchText={(row) => [row.number, row.client, row.status, row.department]}
      filters={filters}
      searchPlaceholder="Search invoices..."
      pageSize={8}
      onRowClick={(row) => onOpen(row.id)}
      emptyMessage="No invoices match the current filters."
    />
  );
}

export function InvoiceProfile({ invoice, today }: { invoice: Invoice; today: string }) {
  const waiting = daysWaiting(invoice.dueDate, today);
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium text-primary">{invoice.number}</p>
          <p className="mt-1 text-base font-semibold text-foreground">{invoice.client}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Amount
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(invoice.amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Department
          </p>
          <p className="mt-1 text-xs text-foreground">{invoice.department}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Issue date
          </p>
          <p className="mt-1 text-xs tabular-nums text-foreground">
            {formatDate(invoice.issueDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Due date
          </p>
          <p className="mt-1 text-xs tabular-nums text-foreground">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      <p className="rounded-md border border-border bg-card p-3 text-[11px] text-muted-foreground">
        {invoice.status === "Paid"
          ? "This invoice has been marked as paid."
          : waiting > 0
            ? `Payment is ${waiting} day${waiting === 1 ? "" : "s"} past the due date.`
            : `Payment is due in ${Math.abs(waiting)} day${Math.abs(waiting) === 1 ? "" : "s"}.`}
      </p>
    </div>
  );
}

export interface BudgetRow {
  department: Department;
  spend: number;
  budget: number;
  utilization: number;
}

export function buildBudgetRows(transactions: Transaction[], projects: Project[]): BudgetRow[] {
  const departments = Array.from(
    new Set([
      ...transactions.map((item) => item.department),
      ...projects.map((item) => item.department),
    ]),
  ).sort();

  return departments
    .map((department) => {
      const spend = transactions
        .filter((item) => item.type === "Expense" && item.department === department)
        .reduce((sum, item) => sum + item.amount, 0);
      const budget = projects
        .filter((item) => item.department === department)
        .reduce((sum, item) => sum + item.budget, 0);
      return {
        department,
        spend,
        budget,
        utilization: budget > 0 ? (spend / budget) * 100 : 0,
      };
    })
    .filter((row) => row.spend > 0 || row.budget > 0)
    .sort((left, right) => right.spend - left.spend);
}

export function BudgetsTable({ rows }: { rows: BudgetRow[] }) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold">Department</TableHead>
              <TableHead className="text-right text-[11px] font-semibold">Expense spend</TableHead>
              <TableHead className="text-right text-[11px] font-semibold">Planned budget</TableHead>
              <TableHead className="min-w-[200px] text-[11px] font-semibold">Utilization</TableHead>
              <TableHead className="text-right text-[11px] font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.department} className="hover:bg-muted/40">
                <TableCell className="whitespace-nowrap text-xs font-medium text-foreground">
                  {row.department}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-xs tabular-nums">
                  {formatCompactCurrency(row.spend)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {formatCompactCurrency(row.budget)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 min-w-[100px] flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          row.utilization > 100
                            ? "bg-critical"
                            : row.utilization > 80
                              ? "bg-warning"
                              : "bg-primary",
                        )}
                        style={{ width: `${Math.min(100, row.utilization)}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                      {row.utilization.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <StatusBadge
                    status={
                      row.utilization > 100
                        ? "At risk"
                        : row.utilization > 80
                          ? "In progress"
                          : "On track"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Sample data: spend is the sum of expense transactions by department; planned budgets are
        derived from project budgets in the workspace. These are illustrative figures, not an
        approved budget plan.
      </p>
    </div>
  );
}
