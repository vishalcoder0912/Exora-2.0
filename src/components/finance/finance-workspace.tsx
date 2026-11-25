"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

import { CreateInvoiceDialog, AddTransactionDialog } from "@/components/finance/finance-dialogs";
import { FinanceOverview } from "@/components/finance/finance-overview";
import {
  buildBudgetRows,
  BudgetsTable,
  InvoiceProfile,
  InvoicesTable,
  TransactionsTable,
} from "@/components/finance/finance-tables";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCsv } from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { InvoiceStatus } from "@/types";

export function FinanceWorkspace() {
  const { state, dispatch } = useApp();
  const { data } = state;

  const [tab, setTab] = useState("overview");
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const selectedInvoice = data.invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;
  const budgetRows = useMemo(
    () => buildBudgetRows(data.transactions, data.projects),
    [data.transactions, data.projects],
  );

  function logAudit(activity: string, entity: string) {
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity,
        user: "Alex Morgan",
        department: "Finance",
        entity,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Financial action",
        metadata: {
          requestedAction: activity,
          approvalStatus: "Approved",
          executedTool: "Finance workspace",
          result: `${entity} updated in the demo workspace`,
        },
      },
    });
  }

  function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    const invoice = data.invoices.find((item) => item.id === id);
    dispatch({ type: "UPDATE_INVOICE_STATUS", id, status });
    toast.success(`${invoice?.number ?? "Invoice"} marked ${status}`);
    logAudit(`Invoice status updated to ${status}`, invoice?.number ?? id);
  }

  function exportCurrentTab() {
    const transactionRows = data.transactions.map((transaction) => ({
      ID: transaction.id,
      Date: transaction.date,
      Description: transaction.description,
      Category: transaction.category,
      Department: transaction.department,
      Amount: transaction.amount,
      Type: transaction.type,
      Status: transaction.status,
      Reference: transaction.reference,
    }));
    const invoiceRows = data.invoices.map((invoice) => ({
      Number: invoice.number,
      Client: invoice.client,
      Amount: invoice.amount,
      "Issue date": invoice.issueDate,
      "Due date": invoice.dueDate,
      Status: invoice.status,
      Department: invoice.department,
    }));
    const budgetExportRows = budgetRows.map((row) => ({
      Department: row.department,
      "Expense spend": row.spend,
      "Planned budget": row.budget,
      "Utilization %": Number(row.utilization.toFixed(1)),
    }));

    const rowsByTab: Record<string, Record<string, string | number>[]> = {
      overview: transactionRows,
      transactions: transactionRows,
      invoices: invoiceRows,
      budgets: budgetExportRows,
    };
    downloadCsv(`nexus-finance-${tab}.csv`, rowsByTab[tab] ?? transactionRows);
    toast.success(`Exported ${tab} data as CSV`);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-6 lg:px-8">
      <PageHeader
        title="Finance"
        subtitle="Monitor revenue, expenses, invoices, and financial health."
        badge="Finance"
        actions={
          <>
            <Button size="sm" onClick={() => setAddTransactionOpen(true)}>
              <Plus className="size-3.5" /> Add transaction
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreateInvoiceOpen(true)}>
              <Receipt className="size-3.5" /> Create invoice
            </Button>
            <Button size="sm" variant="outline" onClick={exportCurrentTab}>
              <Download className="size-3.5" /> Export
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-border bg-card p-1">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs">
            Invoices
          </TabsTrigger>
          <TabsTrigger value="budgets" className="text-xs">
            Budgets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <FinanceOverview data={data} onNavigate={setTab} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <SectionCard
            title="Transactions"
            description={`${data.transactions.length} ledger entries · use filters to narrow the view`}
          >
            <TransactionsTable transactions={data.transactions} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="invoices" className="mt-0">
          <SectionCard
            title="Invoices"
            description={`${data.invoices.length} invoices · change status inline or open a record for details`}
          >
            <InvoicesTable
              invoices={data.invoices}
              today={data.today}
              onOpen={setSelectedInvoiceId}
              onStatusChange={updateInvoiceStatus}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="budgets" className="mt-0">
          <SectionCard
            title="Department budgets"
            description="Spend against illustrative allocations derived from workspace records"
          >
            <BudgetsTable rows={budgetRows} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <AddTransactionDialog
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onCreated={(label) => logAudit("Transaction recorded", label)}
      />
      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        onCreated={(number) => logAudit("Invoice created", number)}
      />

      <DetailSheet
        open={Boolean(selectedInvoice)}
        onOpenChange={(open) => {
          if (!open) setSelectedInvoiceId(null);
        }}
        title="Invoice details"
        description={
          selectedInvoice ? `${selectedInvoice.number} · ${selectedInvoice.client}` : undefined
        }
      >
        {selectedInvoice && <InvoiceProfile invoice={selectedInvoice} today={data.today} />}
      </DetailSheet>
    </div>
  );
}
