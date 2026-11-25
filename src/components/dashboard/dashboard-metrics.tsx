import { daysWaiting, formatCompactCurrency, formatNumber } from "@/lib/format";
import type { SeedData } from "@/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type AttentionIcon = "task" | "users" | "sales" | "finance";
export type AttentionTone = "critical" | "warning" | "primary";

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  count: number;
  href: string;
  icon: AttentionIcon;
  tone: AttentionTone;
}

export interface DashboardMetrics {
  overdueTasks: number;
  highPriorityOverdue: number;
  offersAwaitingApproval: number;
  staleLeads: number;
  overdueInvoices: number;
  attention: AttentionItem[];
  sparklines: {
    employees: number[];
    revenue: number[];
    deals: number[];
    positions: number[];
    tasks: number[];
  };
}

function monthKeys(data: SeedData): string[] {
  const year = data.today.slice(0, 4);
  return data.monthlyFinance.map((entry) => {
    const monthIndex = MONTH_NAMES.indexOf(entry.month) + 1;
    return `${year}-${String(monthIndex).padStart(2, "0")}`;
  });
}

function countsByMonth(dates: string[], keys: string[]): number[] {
  const allowed = new Set(keys);
  const counts = new Map(keys.map((key) => [key, 0]));
  for (const date of dates) {
    const key = date.slice(0, 7);
    if (allowed.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return keys.map((key) => counts.get(key) ?? 0);
}

function cumulative(values: number[]): number[] {
  let total = 0;
  return values.map((value) => (total += value));
}

export function getDashboardMetrics(data: SeedData): DashboardMetrics {
  const { today } = data;
  const isOverdue = (date: string) => daysWaiting(date, today) > 0;

  const overdueTasks = data.tasks.filter(
    (task) => task.status !== "Completed" && isOverdue(task.dueDate),
  );
  const highPriority = overdueTasks.filter((task) => task.priority === "High");
  const pendingOffers = data.offers.filter((offer) => offer.status === "Awaiting approval");
  const staleLeads = data.leads.filter(
    (lead) =>
      lead.stage !== "Won" && lead.stage !== "Lost" && daysWaiting(lead.lastContact, today) >= 5,
  );
  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === "Overdue");
  const keys = monthKeys(data);

  return {
    overdueTasks: overdueTasks.length,
    highPriorityOverdue: highPriority.length,
    offersAwaitingApproval: pendingOffers.length,
    staleLeads: staleLeads.length,
    overdueInvoices: overdueInvoices.length,
    attention: [
      {
        id: "tasks",
        title: "Overdue high-priority tasks",
        detail: `${overdueTasks.length} overdue tasks in total · review critical work`,
        count: highPriority.length,
        href: highPriority[0] ? `/tasks?open=${highPriority[0].id}` : "/tasks",
        icon: "task",
        tone: "critical",
      },
      {
        id: "offers",
        title: "Candidate offers awaiting approval",
        detail: "Hiring approvals pending from managers",
        count: pendingOffers.length,
        href: pendingOffers[0] ? `/hr?open=${pendingOffers[0].id}` : "/hr",
        icon: "users",
        tone: "warning",
      },
      {
        id: "leads",
        title: "Sales leads without follow-up",
        detail: "5+ days since the last contact",
        count: staleLeads.length,
        href: staleLeads[0] ? `/sales?open=${staleLeads[0].id}` : "/sales",
        icon: "sales",
        tone: "primary",
      },
      {
        id: "invoices",
        title: "Invoices overdue",
        detail: "Payments past their due date",
        count: overdueInvoices.length,
        href: overdueInvoices[0] ? `/finance?open=${overdueInvoices[0].id}` : "/finance",
        icon: "finance",
        tone: "critical",
      },
    ],
    sparklines: {
      employees: cumulative(
        countsByMonth(
          data.employees.map((employee) => employee.joiningDate),
          keys,
        ),
      ),
      revenue: data.monthlyFinance.map((entry) => entry.revenue),
      deals: data.leads.slice(0, 6).map((lead) => lead.value),
      positions: data.candidates
        .filter((candidate) => candidate.stage !== "Hired" && candidate.stage !== "Rejected")
        .slice(0, 6)
        .map((candidate) => candidate.expectedPackage),
      tasks: data.tasks.slice(0, 6).map((task) => daysWaiting(task.dueDate, today)),
    },
  };
}

export function kpiExportRows(
  data: SeedData,
  metrics: DashboardMetrics,
): Record<string, string | number>[] {
  return [
    {
      Metric: "Total Employees",
      Value: data.metrics.totalEmployees,
      Note: `+${data.metrics.newEmployeesThisMonth} this month`,
    },
    {
      Metric: "Monthly Revenue",
      Value: data.metrics.monthlyRevenue,
      Note: `${formatCompactCurrency(data.metrics.monthlyRevenue)} · +${data.metrics.revenueGrowth}% vs last month`,
    },
    {
      Metric: "Active Deals",
      Value: data.metrics.activeDeals,
      Note: `${formatCompactCurrency(data.metrics.pipelineValue)} pipeline`,
    },
    {
      Metric: "Open Positions",
      Value: data.metrics.openPositions,
      Note: `${data.metrics.pipelineCandidates} candidates in pipeline`,
    },
    {
      Metric: "Overdue Tasks",
      Value: data.metrics.overdueTasks,
      Note: `${metrics.highPriorityOverdue} high priority`,
    },
    {
      Metric: "Offers Awaiting Approval",
      Value: metrics.offersAwaitingApproval,
      Note: "Hiring approvals pending",
    },
    {
      Metric: "Leads Without Follow-up",
      Value: metrics.staleLeads,
      Note: "5+ days since last contact",
    },
    { Metric: "Overdue Invoices", Value: metrics.overdueInvoices, Note: "Payments past due date" },
    {
      Metric: "Report Date",
      Value: data.today,
      Note: `${formatNumber(data.monthlyFinance.length)} months of finance history`,
    },
  ];
}
