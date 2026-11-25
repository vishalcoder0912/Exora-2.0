"use client";

import { ArrowDownRight, FileText, TrendingUp, Wallet } from "lucide-react";

import {
  CashFlowChart,
  ExpenseBreakdown,
  RevenueExpenseChart,
} from "@/components/finance/finance-charts";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import type { SeedData } from "@/types";

interface FinanceOverviewProps {
  data: SeedData;
  onNavigate: (tab: string) => void;
}

export function FinanceOverview({ data, onNavigate }: FinanceOverviewProps) {
  const { transactions, invoices, monthlyFinance } = data;

  const revenue = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const profit = revenue - expenses;
  const outstanding = invoices
    .filter((item) => item.status === "Sent" || item.status === "Overdue")
    .reduce((sum, item) => sum + item.amount, 0);
  const overdueCount = invoices.filter((item) => item.status === "Overdue").length;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCompactCurrency(revenue)}
          note="Income recorded in the current period"
          icon={TrendingUp}
          tone="positive"
          onClick={() => onNavigate("transactions")}
        />
        <StatCard
          label="Expenses"
          value={formatCompactCurrency(expenses)}
          note="Expenses recorded in the current period"
          icon={ArrowDownRight}
          tone="warning"
          onClick={() => onNavigate("transactions")}
        />
        <StatCard
          label="Net profit"
          value={formatCompactCurrency(profit)}
          note={`${formatCurrency(profit)} · revenue minus expenses`}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label="Outstanding receivables"
          value={formatCompactCurrency(outstanding)}
          note={`${formatNumber(overdueCount)} overdue invoices`}
          icon={FileText}
          tone="critical"
          onClick={() => onNavigate("invoices")}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard
          title="Revenue vs expenses"
          description="Monthly performance from the finance ledger"
          className="xl:col-span-2"
        >
          <RevenueExpenseChart data={monthlyFinance} />
        </SectionCard>
        <SectionCard title="Expense categories" description="Where spend is concentrated">
          <ExpenseBreakdown transactions={transactions} />
        </SectionCard>
      </div>

      <SectionCard
        title="Monthly cash flow"
        description="Net revenue after expenses for each month"
      >
        <CashFlowChart data={monthlyFinance} />
      </SectionCard>
    </div>
  );
}
