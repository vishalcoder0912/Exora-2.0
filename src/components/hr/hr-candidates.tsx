"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANDIDATE_STAGES } from "@/components/hr/hr-dialogs";
import { formatCurrency, formatDate, formatShortDate, initials, relativeDate } from "@/lib/format";
import type { Candidate, CandidateStage, Department } from "@/types";

interface CandidatesTableProps {
  candidates: Candidate[];
  departments: Department[];
  today: string;
  onOpen: (id: string) => void;
}

export function CandidatesTable({ candidates, departments, today, onOpen }: CandidatesTableProps) {
  const sources = Array.from(new Set(candidates.map((candidate) => candidate.source))).sort();

  const columns: DataTableColumn<Candidate>[] = [
    {
      key: "name",
      header: "Candidate",
      sortValue: (row) => row.name.toLowerCase(),
      cell: (row) => (
        <div className="flex min-w-[160px] items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-ai/10 text-[10px] font-semibold text-ai">
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
      key: "position",
      header: "Position",
      sortValue: (row) => row.position,
      cell: (row) => (
        <div className="min-w-[150px]">
          <p className="whitespace-nowrap">{row.position}</p>
          <p className="truncate text-[10px] text-muted-foreground">{row.department}</p>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortValue: (row) => row.stage,
      cell: (row) => <StatusBadge status={row.stage} />,
    },
    {
      key: "source",
      header: "Source",
      sortValue: (row) => row.source,
      cell: (row) => <span className="whitespace-nowrap">{row.source}</span>,
    },
    {
      key: "recruiter",
      header: "Recruiter",
      sortValue: (row) => row.recruiter,
      cell: (row) => <span className="whitespace-nowrap">{row.recruiter}</span>,
    },
    {
      key: "lastContact",
      header: "Last contact",
      sortValue: (row) => row.lastContact,
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {relativeDate(row.lastContact, today)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortValue: (row) => row.updatedAt,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatShortDate(row.updatedAt)}</span>
      ),
    },
  ];

  const filters: DataTableFilter<Candidate>[] = [
    {
      key: "stage",
      label: "stages",
      options: CANDIDATE_STAGES.map((stage) => ({ label: stage, value: stage })),
      predicate: (row, value) => row.stage === value,
    },
    {
      key: "source",
      label: "sources",
      options: sources.map((source) => ({ label: source, value: source })),
      predicate: (row, value) => row.source === value,
    },
    {
      key: "department",
      label: "departments",
      options: departments.map((department) => ({ label: department, value: department })),
      predicate: (row, value) => row.department === value,
    },
  ];

  return (
    <DataTable
      data={candidates}
      columns={columns}
      rowKey={(row) => row.id}
      searchText={(row) => [
        row.name,
        row.position,
        row.email,
        row.recruiter,
        row.source,
        row.stage,
      ]}
      filters={filters}
      searchPlaceholder="Search candidates..."
      pageSize={8}
      onRowClick={(row) => onOpen(row.id)}
      emptyMessage="No candidates match the current filters."
    />
  );
}

interface CandidateProfileProps {
  candidate: Candidate;
  today: string;
  onStageChange: (id: string, stage: CandidateStage) => void;
}

export function CandidateProfile({ candidate, today, onStageChange }: CandidateProfileProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarFallback className="bg-ai/10 text-sm font-semibold text-ai">
            {initials(candidate.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{candidate.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {candidate.position} · {candidate.department}
          </p>
          <div className="mt-1.5">
            <StatusBadge status={candidate.stage} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
        <label
          htmlFor="candidate-stage"
          className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          Pipeline stage
        </label>
        <Select
          value={candidate.stage}
          onValueChange={(value) => onStageChange(candidate.id, value as CandidateStage)}
        >
          <SelectTrigger id="candidate-stage" className="h-8 bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CANDIDATE_STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="pt-1 text-[10px] text-muted-foreground">
          Last updated {relativeDate(candidate.updatedAt, today)} · Last contact{" "}
          {relativeDate(candidate.lastContact, today)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg border border-border p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </p>
          <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-foreground">
            <Mail className="size-3 shrink-0 text-muted-foreground" />
            {candidate.email || "Not recorded"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Phone
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground">
            <Phone className="size-3 shrink-0 text-muted-foreground" />
            {candidate.phone || "Not recorded"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Source
          </p>
          <p className="mt-1 text-xs text-foreground">{candidate.source}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Recruiter
          </p>
          <p className="mt-1 text-xs text-foreground">{candidate.recruiter}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Expected package
          </p>
          <p className="mt-1 text-xs text-foreground">
            {candidate.expectedPackage
              ? formatCurrency(candidate.expectedPackage)
              : "Not specified"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MessageCircle className="size-3.5 text-muted-foreground" />
          Communication history
        </p>
        <div className="space-y-3">
          {candidate.communication.map((entry, index) => (
            <div key={`${entry.date}-${index}`} className="relative border-l border-border pl-4">
              <span className="absolute -left-[3px] top-1 size-1.5 rounded-full bg-primary" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-foreground">{entry.subject}</p>
                <StatusBadge status={entry.channel} className="text-[9px]" />
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(entry.date)}</p>
            </div>
          ))}
          {candidate.communication.length === 0 && (
            <p className="text-xs text-muted-foreground">No communication logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
