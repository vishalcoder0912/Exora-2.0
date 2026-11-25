"use client";

import { Building2 } from "lucide-react";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCompactCurrency, formatDate, initials } from "@/lib/format";
import type { Customer } from "@/types";

interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const columns: DataTableColumn<Customer>[] = [
    {
      key: "company",
      header: "Company",
      sortValue: (row) => row.company,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
            {initials(row.company)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.company}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              Since {formatDate(row.since)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortValue: (row) => row.contactName,
      cell: (row) => <span className="text-foreground">{row.contactName}</span>,
    },
    {
      key: "industry",
      header: "Industry",
      sortValue: (row) => row.industry,
      cell: (row) => <span className="text-muted-foreground">{row.industry}</span>,
    },
    {
      key: "value",
      header: "Account value",
      sortValue: (row) => row.value,
      className: "text-right",
      cell: (row) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatCompactCurrency(row.value)}
        </span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      sortValue: (row) => row.owner,
      cell: (row) => <span className="text-muted-foreground">{row.owner}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const filters: DataTableFilter<Customer>[] = [
    {
      key: "status",
      label: "statuses",
      options: ["Active", "At risk", "Churned"].map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
    {
      key: "owner",
      label: "owners",
      options: [...new Set(customers.map((customer) => customer.owner))].map((owner) => ({
        label: owner,
        value: owner,
      })),
      predicate: (row, value) => row.owner === value,
    },
  ];

  return (
    <SectionCard
      title="Customer accounts"
      description={`${customers.length} accounts in the customer book`}
      action={<Building2 className="size-4 text-muted-foreground" />}
    >
      <DataTable
        data={customers}
        columns={columns}
        rowKey={(row) => row.id}
        searchText={(row) => [row.company, row.contactName, row.industry, row.owner, row.status]}
        searchPlaceholder="Search customers..."
        filters={filters}
        pageSize={8}
        emptyMessage="No customers match your filters."
      />
    </SectionCard>
  );
}
