"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List } from "lucide-react";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
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
import { formatCompactCurrency, formatDate, initials } from "@/lib/format";
import type { Interview, Offer, OfferStatus } from "@/types";

const INTERVIEW_TYPES: Interview["type"][] = ["Technical", "Cultural", "Managerial", "Screening"];
const INTERVIEW_STATUSES: Interview["status"][] = ["Scheduled", "Completed", "Cancelled"];
const OFFER_STATUSES: OfferStatus[] = [
  "Draft",
  "Awaiting approval",
  "Sent",
  "Accepted",
  "Declined",
];

interface InterviewsPanelProps {
  interviews: Interview[];
  onCandidateOpen: (id: string) => void;
}

export function InterviewsPanel({ interviews, onCandidateOpen }: InterviewsPanelProps) {
  const [view, setView] = useState<"list" | "agenda">("list");

  const columns: DataTableColumn<Interview>[] = [
    {
      key: "candidateName",
      header: "Candidate",
      sortValue: (row) => row.candidateName.toLowerCase(),
      cell: (row) => (
        <div className="flex min-w-[150px] items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
              {initials(row.candidateName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium text-foreground">{row.candidateName}</span>
        </div>
      ),
    },
    {
      key: "interviewer",
      header: "Interviewer",
      sortValue: (row) => row.interviewer,
      cell: (row) => <span className="whitespace-nowrap">{row.interviewer}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortValue: (row) => row.date,
      cell: (row) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.date)}</span>,
    },
    {
      key: "time",
      header: "Time",
      sortValue: (row) => row.time,
      cell: (row) => <span className="tabular-nums">{row.time}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortValue: (row) => row.type,
      cell: (row) => <span className="whitespace-nowrap">{row.type}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const filters: DataTableFilter<Interview>[] = [
    {
      key: "type",
      label: "types",
      options: INTERVIEW_TYPES.map((type) => ({ label: type, value: type })),
      predicate: (row, value) => row.type === value,
    },
    {
      key: "status",
      label: "statuses",
      options: INTERVIEW_STATUSES.map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
  ];

  const grouped = useMemo(() => {
    const groups = new Map<string, Interview[]>();
    for (const interview of [...interviews].sort((left, right) =>
      `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`),
    )) {
      const existing = groups.get(interview.date) ?? [];
      existing.push(interview);
      groups.set(interview.date, existing);
    }
    return Array.from(groups.entries());
  }, [interviews]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {interviews.length} interviews · {view === "list" ? "table view" : "date agenda"}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
          <Button
            type="button"
            size="sm"
            variant={view === "list" ? "secondary" : "ghost"}
            className="h-7 gap-1.5 px-2.5 text-[11px]"
            onClick={() => setView("list")}
          >
            <List className="size-3.5" /> List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "agenda" ? "secondary" : "ghost"}
            className="h-7 gap-1.5 px-2.5 text-[11px]"
            onClick={() => setView("agenda")}
          >
            <CalendarDays className="size-3.5" /> Calendar
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <DataTable
          data={interviews}
          columns={columns}
          rowKey={(row) => row.id}
          searchText={(row) => [row.candidateName, row.interviewer, row.type, row.status, row.date]}
          filters={filters}
          searchPlaceholder="Search interviews..."
          pageSize={8}
          onRowClick={(row) => onCandidateOpen(row.candidateId)}
          emptyMessage="No interviews match the current filters."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {grouped.map(([date, items]) => (
            <div key={date} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-foreground">{formatDate(date)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-IN", {
                      weekday: "long",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {items.length}
                </span>
              </div>
              <div className="divide-y divide-border">
                {items.map((interview) => (
                  <div key={interview.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onCandidateOpen(interview.candidateId)}
                        className="truncate text-left text-xs font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {interview.candidateName}
                      </button>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {interview.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {interview.type} · {interview.interviewer}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={interview.status} className="text-[10px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface OffersTableProps {
  offers: Offer[];
  statusOverrides: Record<string, OfferStatus>;
  onStatusChange: (id: string, status: OfferStatus) => void;
}

export function OffersTable({ offers, statusOverrides, onStatusChange }: OffersTableProps) {
  const rows = offers.map((offer) => ({
    ...offer,
    status: statusOverrides[offer.id] ?? offer.status,
  }));
  const accepted = rows.filter((offer) => offer.status === "Accepted").length;
  const totalValue = rows.reduce((sum, offer) => sum + offer.package, 0);

  const columns: DataTableColumn<Offer>[] = [
    {
      key: "candidateName",
      header: "Candidate",
      sortValue: (row) => row.candidateName.toLowerCase(),
      cell: (row) => (
        <div className="flex min-w-[150px] items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-positive/10 text-[10px] font-semibold text-positive">
              {initials(row.candidateName)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium text-foreground">{row.candidateName}</span>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      sortValue: (row) => row.position,
      cell: (row) => <span className="whitespace-nowrap">{row.position}</span>,
    },
    {
      key: "package",
      header: "Package",
      sortValue: (row) => row.package,
      cell: (row) => (
        <span className="whitespace-nowrap font-medium tabular-nums text-foreground">
          {formatCompactCurrency(row.package)}
        </span>
      ),
    },
    {
      key: "offerDate",
      header: "Offer date",
      sortValue: (row) => row.offerDate,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDate(row.offerDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => statusOverrides[row.id] ?? row.status,
      cell: (row) => (
        <Select
          value={row.status}
          onValueChange={(value) => onStatusChange(row.id, value as OfferStatus)}
        >
          <SelectTrigger className="h-7 w-[150px] border-transparent bg-transparent p-0 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OFFER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "recruiter",
      header: "Recruiter",
      sortValue: (row) => row.recruiter,
      cell: (row) => <span className="whitespace-nowrap">{row.recruiter}</span>,
    },
  ];

  const filters: DataTableFilter<Offer>[] = [
    {
      key: "status",
      label: "statuses",
      options: OFFER_STATUSES.map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
    {
      key: "recruiter",
      label: "recruiters",
      options: Array.from(new Set(offers.map((offer) => offer.recruiter)))
        .sort()
        .map((recruiter) => ({ label: recruiter, value: recruiter })),
      predicate: (row, value) => row.recruiter === value,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          {rows.length} offers ·{" "}
          <strong className="font-semibold text-positive">{accepted} accepted</strong>
        </span>
        <span>
          Total offered value:{" "}
          <strong className="font-semibold text-foreground">
            {formatCompactCurrency(totalValue)}
          </strong>
        </span>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        searchText={(row) => [row.candidateName, row.position, row.recruiter, row.status]}
        filters={filters}
        searchPlaceholder="Search offers..."
        pageSize={8}
        emptyMessage="No offers match the current filters."
      />
    </div>
  );
}
