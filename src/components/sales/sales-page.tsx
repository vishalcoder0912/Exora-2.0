"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AddCustomerDialog } from "@/components/sales/add-customer-dialog";
import { AddLeadDialog } from "@/components/sales/add-lead-dialog";
import { CustomersTable } from "@/components/sales/customers-table";
import { LeadDetailSheet } from "@/components/sales/lead-detail-sheet";
import { LeadKanban, LEAD_STAGES } from "@/components/sales/lead-kanban";
import { SalesOverview } from "@/components/sales/sales-overview";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadCsv,
  formatCompactCurrency,
  formatDate,
  initials,
  relativeDate,
} from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { Lead, LeadStage, Task } from "@/types";

type SalesTab = "overview" | "leads" | "pipeline" | "customers";

export function SalesPage() {
  const { state, dispatch, hydrated } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openParam = searchParams.get("open");
  const openedRef = useRef<string | null>(null);

  const [tab, setTab] = useState<SalesTab>("overview");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const { leads, customers, projects, metrics, today } = state.data;
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;
  const owners = [...new Set(leads.map((lead) => lead.owner))].sort();
  const sources = [...new Set(leads.map((lead) => lead.source))].sort();

  useEffect(() => {
    if (!openParam) {
      openedRef.current = null;
      return;
    }
    if (!hydrated || openedRef.current === openParam) return;
    const match = leads.find((lead) => lead.id.toLowerCase() === openParam.toLowerCase());
    if (!match) return;
    openedRef.current = openParam;
    setSelectedLeadId(match.id);
    setTab("leads");
  }, [openParam, hydrated, leads]);

  function closeLead() {
    setSelectedLeadId(null);
    if (openParam) router.replace("/sales", { scroll: false });
  }

  function openLead(lead: Lead) {
    setSelectedLeadId(lead.id);
  }

  function changeStage(lead: Lead, stage: LeadStage) {
    if (lead.stage === stage) return;
    dispatch({ type: "UPDATE_LEAD_STAGE", id: lead.id, stage });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `${lead.name} moved from ${lead.stage} to ${stage}`,
        user: "Alex Morgan",
        department: "Sales",
        entity: lead.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Lead change",
        metadata: { requestedAction: "Update lead stage", result: `Stage set to ${stage}` },
      },
    });
    toast.success("Stage updated", { description: `${lead.name} is now ${stage}.` });
  }

  function createFollowUp(lead: Lead) {
    const salesProject = projects.find((project) => project.department === "Sales") ?? projects[0];
    const task: Task = {
      id: createId("TSK"),
      title: `Follow up with ${lead.name} — ${lead.company}`,
      projectId: salesProject?.id ?? "",
      projectName: salesProject?.name ?? "Sales operations",
      assignee: lead.owner,
      priority: "High",
      status: "Open",
      dueDate: lead.nextFollowUp || today,
      department: "Sales",
      description: `Follow-up for ${lead.company} (${lead.id}). ${lead.notes}`,
    };
    dispatch({ type: "ADD_TASK", payload: task });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Follow-up task created for ${lead.name}`,
        user: "Alex Morgan",
        department: "Sales",
        entity: lead.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Task creation",
        metadata: { requestedAction: "Create follow-up", result: `Due ${task.dueDate}` },
      },
    });
    toast.success("Follow-up task created", {
      description: `Assigned to ${lead.owner}, due ${formatDate(task.dueDate)}.`,
    });
  }

  function exportLeads() {
    downloadCsv(
      `nexus-sales-leads-${today}.csv`,
      leads.map((lead) => ({
        ID: lead.id,
        Name: lead.name,
        Company: lead.company,
        Source: lead.source,
        Value: lead.value,
        Stage: lead.stage,
        Owner: lead.owner,
        "Last contact": lead.lastContact,
        "Next follow-up": lead.nextFollowUp,
        Email: lead.email,
        Phone: lead.phone,
        Notes: lead.notes,
      })),
    );
    toast.success("Export ready", { description: `${leads.length} leads written to CSV.` });
  }

  const leadColumns: DataTableColumn<Lead>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      sortValue: (row) => row.company,
      cell: (row) => <span className="text-foreground">{row.company}</span>,
    },
    {
      key: "source",
      header: "Source",
      sortValue: (row) => row.source,
      cell: (row) => <span className="text-muted-foreground">{row.source}</span>,
    },
    {
      key: "value",
      header: "Value",
      sortValue: (row) => row.value,
      className: "text-right",
      cell: (row) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatCompactCurrency(row.value)}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortValue: (row) => row.stage,
      cell: (row) => <StatusBadge status={row.stage} />,
    },
    {
      key: "owner",
      header: "Owner",
      sortValue: (row) => row.owner,
      cell: (row) => <span className="text-muted-foreground">{row.owner}</span>,
    },
    {
      key: "lastContact",
      header: "Last contact",
      sortValue: (row) => row.lastContact,
      cell: (row) => (
        <span className="text-muted-foreground">{relativeDate(row.lastContact, today)}</span>
      ),
    },
    {
      key: "nextFollowUp",
      header: "Follow-up",
      sortValue: (row) => row.nextFollowUp,
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.nextFollowUp)}</span>,
    },
  ];

  const leadFilters: DataTableFilter<Lead>[] = [
    {
      key: "stage",
      label: "stages",
      options: LEAD_STAGES.map((stage) => ({ label: stage, value: stage })),
      predicate: (row, value) => row.stage === value,
    },
    {
      key: "owner",
      label: "owners",
      options: owners.map((owner) => ({ label: owner, value: owner })),
      predicate: (row, value) => row.owner === value,
    },
    {
      key: "source",
      label: "sources",
      options: sources.map((source) => ({ label: source, value: source })),
      predicate: (row, value) => row.source === value,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Sales & CRM"
        subtitle="Track opportunities, manage relationships, and accelerate growth."
        badge={`${metrics.activeDeals} active deals`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddCustomerOpen(true)}>
              <UserPlus className="size-3.5" />
              Add customer
            </Button>
            <Button variant="outline" size="sm" onClick={exportLeads}>
              <Download className="size-3.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => setAddLeadOpen(true)}>
              <Plus className="size-3.5" />
              Add lead
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as SalesTab)}>
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="px-4 text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="leads" className="px-4 text-xs">
            Leads
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="px-4 text-xs">
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="customers" className="px-4 text-xs">
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <SalesOverview
            leads={leads}
            pipelineValue={metrics.pipelineValue}
            today={today}
            onOpenLead={openLead}
          />
        </TabsContent>

        <TabsContent value="leads" className="mt-5">
          <SectionCard
            title="All leads"
            description="Search, filter, and open any opportunity in the CRM"
          >
            <DataTable
              data={leads}
              columns={leadColumns}
              rowKey={(row) => row.id}
              searchText={(row) => [
                row.name,
                row.company,
                row.email,
                row.owner,
                row.source,
                row.stage,
              ]}
              searchPlaceholder="Search leads, companies, owners..."
              filters={leadFilters}
              pageSize={10}
              onRowClick={openLead}
              emptyMessage="No leads match your filters."
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="pipeline" className="mt-5">
          <SectionCard
            title="Pipeline board"
            description="Move opportunities between stages using the selector on each card"
            action={
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {formatCompactCurrency(metrics.pipelineValue)} total pipeline
              </span>
            }
          >
            <LeadKanban
              leads={leads}
              today={today}
              onOpenLead={openLead}
              onStageChange={changeStage}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="customers" className="mt-5">
          <CustomersTable customers={customers} />
        </TabsContent>
      </Tabs>

      <AddLeadDialog
        open={addLeadOpen}
        onOpenChange={setAddLeadOpen}
        owners={owners}
        today={today}
        onCreated={(lead) => {
          setTab("leads");
          setSelectedLeadId(lead.id);
        }}
      />
      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        leads={leads}
        onConverted={() => setTab("pipeline")}
      />
      <LeadDetailSheet
        lead={selectedLead}
        today={today}
        onClose={closeLead}
        onStageChange={changeStage}
        onCreateFollowUp={createFollowUp}
      />
    </div>
  );
}
