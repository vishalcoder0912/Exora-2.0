"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Download,
  ListChecks,
  Mail,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { downloadCsv, formatDateTime, initials, relativeDate } from "@/lib/format";
import { useApp } from "@/store/app-store";
import type { AuditEvent } from "@/types";

const TYPE_ICONS: Record<AuditEvent["type"], LucideIcon> = {
  "AI action": Bot,
  "Employee update": UserRound,
  "Lead change": ListChecks,
  "Financial action": Wallet,
  "Task creation": ListChecks,
  "Email activity": Mail,
};

export function ActivityWorkspace() {
  const { state } = useApp();
  const events = state.data.auditEvents;
  const today = state.data.today;
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const stats = useMemo(() => {
    const ai = events.filter((event) => event.type === "AI action").length;
    const pending = events.filter((event) => event.status === "Pending").length;
    const success = events.filter((event) => event.status === "Success").length;
    return {
      total: events.length,
      ai,
      pending,
      successRate: events.length > 0 ? (success / events.length) * 100 : 0,
    };
  }, [events]);

  const columns = useMemo<DataTableColumn<AuditEvent>[]>(
    () => [
      {
        key: "activity",
        header: "Activity",
        sortValue: (row) => row.activity,
        cell: (row) => {
          const Icon = TYPE_ICONS[row.type];
          return (
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.activity}</p>
                <p className="text-[11px] text-muted-foreground">{row.type}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: "user",
        header: "User",
        sortValue: (row) => row.user,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                {row.user === "NEXUS Intelligence" ? (
                  <Bot className="size-3" />
                ) : (
                  initials(row.user)
                )}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-muted-foreground">{row.user}</span>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        sortValue: (row) => row.department,
        cell: (row) => <span className="text-muted-foreground">{row.department}</span>,
      },
      {
        key: "entity",
        header: "Entity",
        cell: (row) => (
          <span className="font-mono text-[11px] text-muted-foreground">{row.entity}</span>
        ),
      },
      {
        key: "timestamp",
        header: "Timestamp",
        sortValue: (row) => row.timestamp,
        cell: (row) => (
          <div>
            <p className="text-xs tabular-nums">{formatDateTime(row.timestamp)}</p>
            <p className="text-[11px] text-muted-foreground">
              {relativeDate(row.timestamp, today)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [today],
  );

  const filters = useMemo<DataTableFilter<AuditEvent>[]>(() => {
    const unique = (values: string[]) =>
      [...new Set(values)].map((value) => ({ label: value, value }));
    return [
      {
        key: "user",
        label: "users",
        options: unique(events.map((event) => event.user)),
        predicate: (row, value) => row.user === value,
      },
      {
        key: "department",
        label: "departments",
        options: unique(events.map((event) => event.department)),
        predicate: (row, value) => row.department === value,
      },
      {
        key: "type",
        label: "action types",
        options: unique(events.map((event) => event.type)),
        predicate: (row, value) => row.type === value,
      },
      {
        key: "status",
        label: "statuses",
        options: unique(events.map((event) => event.status)),
        predicate: (row, value) => row.status === value,
      },
      {
        key: "date",
        label: "dates",
        options: [
          { label: "Today", value: "today" },
          { label: "Last 7 days", value: "7d" },
          { label: "Last 30 days", value: "30d" },
        ],
        predicate: (row, value) => {
          const eventDate = row.timestamp.slice(0, 10);
          const difference = Math.max(
            0,
            Math.round(
              (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${eventDate}T00:00:00Z`)) /
                86_400_000,
            ),
          );
          if (value === "today") return difference === 0;
          if (value === "7d") return difference <= 7;
          return difference <= 30;
        },
      },
    ];
  }, [events, today]);

  function exportCsv() {
    downloadCsv("nexus-activity-2026-11-22.csv", [
      ...events.map((event) => ({
        id: event.id,
        activity: event.activity,
        type: event.type,
        user: event.user,
        department: event.department,
        entity: event.entity,
        timestamp: event.timestamp,
        status: event.status,
        requestedAction: event.metadata.requestedAction ?? "",
        approvalStatus: event.metadata.approvalStatus ?? "",
        executedTool: event.metadata.executedTool ?? "",
        result: event.metadata.result ?? "",
      })),
    ]);
    toast.success("Activity log exported", {
      description: `${events.length} audit events exported to CSV.`,
    });
  }

  const isAi = selected?.type === "AI action";

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Activity & audit"
        subtitle="A complete trail of AI actions, record changes, and operational events."
        badge={`${events.length} events`}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total events"
          value={String(stats.total)}
          note="Across all departments"
          icon={ShieldCheck}
          tone="primary"
        />
        <StatCard
          label="AI actions"
          value={String(stats.ai)}
          note="Agent activity logged"
          icon={Bot}
          tone="ai"
        />
        <StatCard
          label="Pending review"
          value={String(stats.pending)}
          note="Awaiting follow-up"
          icon={ListChecks}
          tone="warning"
        />
        <StatCard
          label="Success rate"
          value={`${stats.successRate.toFixed(0)}%`}
          note="Completed successfully"
          icon={ShieldCheck}
          tone="positive"
        />
      </div>

      <SectionCard
        title="Audit log"
        description="Filter by user, department, action type, status, or date. Select a row to inspect the event."
        action={<span className="text-[11px] text-muted-foreground">Newest first</span>}
      >
        <DataTable
          data={events}
          columns={columns}
          rowKey={(row) => row.id}
          searchText={(row) => [
            row.activity,
            row.type,
            row.user,
            row.department,
            row.entity,
            row.status,
            row.id,
          ]}
          filters={filters}
          searchPlaceholder="Search activity..."
          pageSize={10}
          onRowClick={setSelected}
          emptyMessage="No audit events match these filters."
        />
      </SectionCard>

      <DetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.activity ?? "Audit event"}
        description={selected ? `${selected.id} · ${selected.type}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} />
              <StatusBadge status={selected.department} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">User</p>
                <p className="mt-1 text-xs font-medium">{selected.user}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Department</p>
                <p className="mt-1 text-xs font-medium">{selected.department}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Entity</p>
                <p className="mt-1 break-all font-mono text-[11px]">{selected.entity}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Action type</p>
                <p className="mt-1 text-xs font-medium">{selected.type}</p>
              </div>
            </div>

            {isAi ? (
              <div className="space-y-3 rounded-lg border border-ai/25 bg-ai/5 p-4">
                <div className="flex items-center gap-2">
                  <Bot className="size-4 text-ai" />
                  <p className="text-xs font-semibold text-foreground">AI agent metadata</p>
                </div>
                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Requested action</dt>
                    <dd className="mt-0.5 font-medium">
                      {selected.metadata.requestedAction ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Approval status</dt>
                    <dd className="mt-0.5">
                      <StatusBadge status={selected.metadata.approvalStatus ?? "Pending"} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Executed tool</dt>
                    <dd className="mt-0.5 font-mono text-[11px]">
                      {selected.metadata.executedTool ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Result</dt>
                    <dd className="mt-0.5">{selected.metadata.result ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-foreground">Timestamp</dt>
                    <dd className="mt-0.5 tabular-nums">{formatDateTime(selected.timestamp)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Result
                </p>
                <p className="mt-1.5 text-xs leading-relaxed">
                  {selected.metadata.result ?? "Record updated successfully"}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-4 text-[11px] text-muted-foreground">
              Logged {formatDateTime(selected.timestamp)} ·{" "}
              {relativeDate(selected.timestamp, today)}
            </div>
          </div>
        )}
      </DetailSheet>
    </main>
  );
}
