"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Download,
  ListTodo,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadCsv, formatCompactCurrency, formatNumber } from "@/lib/format";
import { useApp } from "@/store/app-store";
import { AiBrief } from "./ai-brief";
import { AttentionList } from "./attention-list";
import { getDashboardMetrics, kpiExportRows } from "./dashboard-metrics";
import { DepartmentPerformance } from "./department-performance";
import { KpiGrid, type KpiSparkCardProps } from "./kpi-grid";
import { RecentActivity } from "./recent-activity";
import { RevenueOverview, type DashboardPeriod } from "./revenue-chart";

const HEALTH_PROMPT =
  "Give me an overall health report of the company and identify the biggest problems.";

export function DashboardView() {
  const router = useRouter();
  const { state } = useApp();
  const data = state.data;
  const [period, setPeriod] = useState<DashboardPeriod>("6m");
  const metrics = getDashboardMetrics(data);

  const kpiCards: KpiSparkCardProps[] = [
    {
      label: "Total Employees",
      value: formatNumber(data.metrics.totalEmployees),
      note: `+${data.metrics.newEmployeesThisMonth} this month`,
      icon: Users,
      tone: "primary",
      noteTone: "positive",
      spark: metrics.sparklines.employees,
      onClick: () => router.push("/hr"),
    },
    {
      label: "Monthly Revenue",
      value: formatCompactCurrency(data.metrics.monthlyRevenue),
      note: `+${data.metrics.revenueGrowth}% vs last month`,
      icon: Wallet,
      tone: "positive",
      noteTone: "positive",
      spark: metrics.sparklines.revenue,
      onClick: () => router.push("/finance"),
    },
    {
      label: "Active Deals",
      value: formatNumber(data.metrics.activeDeals),
      note: `${formatCompactCurrency(data.metrics.pipelineValue)} pipeline`,
      icon: BriefcaseBusiness,
      tone: "primary",
      spark: metrics.sparklines.deals,
      onClick: () => router.push("/sales"),
    },
    {
      label: "Open Positions",
      value: formatNumber(data.metrics.openPositions),
      note: `${data.metrics.pipelineCandidates} candidates in pipeline`,
      icon: UserPlus,
      tone: "ai",
      spark: metrics.sparklines.positions,
      onClick: () => router.push("/hr"),
    },
    {
      label: "Overdue Tasks",
      value: formatNumber(data.metrics.overdueTasks),
      note: `${data.metrics.highPriorityOverdue} high priority`,
      icon: ListTodo,
      tone: "critical",
      noteTone: "critical",
      spark: metrics.sparklines.tasks,
      onClick: () => router.push("/tasks"),
    },
  ];

  function exportReport() {
    downloadCsv(`nexus-kpi-snapshot-${data.today}.csv`, kpiExportRows(data, metrics));
    toast.success("KPI snapshot exported", {
      description: "A CSV of the current company KPIs was downloaded.",
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Good morning, Alex"
        subtitle="Here's what's happening across your organization today."
        actions={
          <>
            <Select value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
              <SelectTrigger className="h-9 w-[152px] text-xs" aria-label="Chart date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="1m">This month</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9" onClick={exportReport}>
              <Download className="size-3.5" />
              Export report
            </Button>
            <Button
              size="sm"
              className="h-9 bg-ai text-white hover:bg-ai/90"
              onClick={() => router.push(`/ai?prompt=${encodeURIComponent(HEALTH_PROMPT)}`)}
            >
              <Sparkles className="size-3.5" />
              Ask AI
            </Button>
          </>
        }
      />

      <KpiGrid cards={kpiCards} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <RevenueOverview data={data.monthlyFinance} period={period} />
          <DepartmentPerformance entries={data.departmentPerformance} />
          <AttentionList items={metrics.attention} />
        </div>
        <div className="min-w-0 space-y-5">
          <AiBrief
            revenueGrowth={data.metrics.revenueGrowth}
            overdueTasks={metrics.overdueTasks}
            highPriorityOverdue={metrics.highPriorityOverdue}
            staleLeads={metrics.staleLeads}
          />
          <RecentActivity events={data.auditEvents} today={data.today} />
        </div>
      </div>
    </div>
  );
}
