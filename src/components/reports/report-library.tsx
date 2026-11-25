import {
  BriefcaseBusiness,
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { daysWaiting, formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import type { SeedData } from "@/types";

export type ReportId = "executive" | "hr" | "financial" | "sales" | "operations" | "marketing";

export interface ReportTemplate {
  id: ReportId;
  title: string;
  description: string;
  department: string;
  cadence: string;
  icon: LucideIcon;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "executive",
    title: "Executive Business Review",
    description: "Company-wide KPIs, growth signals and the risks that need leadership attention.",
    department: "Executive",
    cadence: "Monthly",
    icon: LayoutDashboard,
  },
  {
    id: "hr",
    title: "Workforce & Hiring Report",
    description:
      "Headcount, recruitment funnel, open roles and offer approvals across departments.",
    department: "Human Resources",
    cadence: "Weekly",
    icon: Users,
  },
  {
    id: "financial",
    title: "Financial Performance Report",
    description: "Revenue, expenses, net margin and invoice collection health.",
    department: "Finance",
    cadence: "Monthly",
    icon: Wallet,
  },
  {
    id: "sales",
    title: "Sales Pipeline Report",
    description: "Pipeline value, deal stages and accounts that need a follow-up.",
    department: "Sales",
    cadence: "Weekly",
    icon: BriefcaseBusiness,
  },
  {
    id: "operations",
    title: "Operations Delivery Report",
    description: "Project progress, delivery risk and overdue operational work.",
    department: "Operations",
    cadence: "Weekly",
    icon: Workflow,
  },
  {
    id: "marketing",
    title: "Marketing Effectiveness Report",
    description: "Campaign spend, lead generation and conversion efficiency by channel.",
    department: "Marketing",
    cadence: "Monthly",
    icon: Megaphone,
  },
];

export interface ReportSection {
  heading: string;
  body: string;
  bullets?: string[];
  metrics?: { label: string; value: string }[];
}

interface ReportFacts {
  latestMonth: string;
  revenue: number;
  expenses: number;
  net: number;
  margin: number;
  growth: number;
  overdueTasks: number;
  highPriority: number;
  pendingOffers: number;
  staleLeads: number;
  overdueInvoices: number;
  overdueInvoiceValue: number;
  activeProjects: number;
  delayedProjects: number;
  atRiskProjects: number;
  completedProjects: number;
  averageProgress: number;
  campaignSpend: number;
  campaignLeads: number;
  campaignConversions: number;
}

function computeFacts(data: SeedData): ReportFacts {
  const latest = data.monthlyFinance[data.monthlyFinance.length - 1];
  const previous = data.monthlyFinance[data.monthlyFinance.length - 2];
  const revenue = latest?.revenue ?? data.metrics.monthlyRevenue;
  const expenses = latest?.expenses ?? 0;
  const net = revenue - expenses;
  const margin = revenue > 0 ? Math.round((net / revenue) * 100) : 0;
  const growth =
    previous && previous.revenue > 0
      ? ((revenue - previous.revenue) / previous.revenue) * 100
      : data.metrics.revenueGrowth;

  const overdue = data.tasks.filter(
    (task) => task.status !== "Completed" && daysWaiting(task.dueDate, data.today) > 0,
  );
  const stale = data.leads.filter(
    (lead) =>
      lead.stage !== "Won" &&
      lead.stage !== "Lost" &&
      daysWaiting(lead.lastContact, data.today) >= 5,
  );
  const overdueInvoices = data.invoices.filter((invoice) => invoice.status === "Overdue");
  const activeProjects = data.projects.filter((project) => project.status !== "Completed");
  const averageProgress = activeProjects.length
    ? Math.round(
        activeProjects.reduce((sum, project) => sum + project.progress, 0) / activeProjects.length,
      )
    : 0;

  return {
    latestMonth: latest?.month ?? "Nov",
    revenue,
    expenses,
    net,
    margin,
    growth,
    overdueTasks: overdue.length,
    highPriority: overdue.filter((task) => task.priority === "High").length,
    pendingOffers: data.offers.filter((offer) => offer.status === "Awaiting approval").length,
    staleLeads: stale.length,
    overdueInvoices: overdueInvoices.length,
    overdueInvoiceValue: overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    activeProjects: activeProjects.length,
    delayedProjects: data.projects.filter((project) => project.status === "Delayed").length,
    atRiskProjects: data.projects.filter((project) => project.status === "At risk").length,
    completedProjects: data.projects.filter((project) => project.status === "Completed").length,
    averageProgress,
    campaignSpend: data.campaigns.reduce((sum, campaign) => sum + campaign.spend, 0),
    campaignLeads: data.campaigns.reduce((sum, campaign) => sum + campaign.leads, 0),
    campaignConversions: data.campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0),
  };
}

const focusLines: Record<ReportId | "custom", string> = {
  executive:
    "This review covers the full operating picture: financial performance, hiring, sales, delivery and marketing.",
  hr: "This report focuses on workforce composition, the recruitment funnel and pending hiring decisions.",
  financial: "This report focuses on revenue, cost structure and collections health.",
  sales: "This report focuses on pipeline quality, deal stages and sales follow-up discipline.",
  operations:
    "This report focuses on project delivery, delivery risk and overdue operational work.",
  marketing: "This report focuses on campaign efficiency, lead volume and conversion rates.",
  custom: "This analysis was assembled from live workspace records across every department.",
};

export function buildReportSections(
  id: ReportId | "custom",
  data: SeedData,
  companyName: string,
  prompt?: string,
): ReportSection[] {
  const facts = computeFacts(data);
  const { metrics } = data;
  const hired = data.candidates.filter((candidate) => candidate.stage === "Hired").length;
  const offerStage = data.candidates.filter((candidate) => candidate.stage === "Offer").length;
  const scheduledInterviews = data.interviews.filter(
    (interview) => interview.status === "Scheduled",
  ).length;
  const wonLeads = data.leads.filter((lead) => lead.stage === "Won");
  const topLead = data.leads.slice().sort((left, right) => right.value - left.value)[0];
  const conversionRate =
    facts.campaignLeads > 0
      ? ((facts.campaignConversions / facts.campaignLeads) * 100).toFixed(1)
      : "0.0";
  const costPerLead =
    facts.campaignLeads > 0 ? Math.round(facts.campaignSpend / facts.campaignLeads) : 0;

  const summary: ReportSection = {
    heading: "Executive summary",
    body: `${companyName} closed ${facts.latestMonth} with revenue of ${formatCurrency(facts.revenue)} against expenses of ${formatCurrency(facts.expenses)}, producing a net surplus of ${formatCurrency(facts.net)} and a ${facts.margin}% margin. ${focusLines[id]} ${
      prompt ? `The request for this analysis was: "${prompt}"` : ""
    }`.trim(),
    metrics: [
      { label: "Monthly revenue", value: formatCompactCurrency(facts.revenue) },
      { label: "Net margin", value: `${facts.margin}%` },
      { label: "Active deals", value: formatNumber(metrics.activeDeals) },
      { label: "Overdue tasks", value: formatNumber(facts.overdueTasks) },
    ],
  };

  const financial: ReportSection = {
    heading: "Financial performance",
    body: `Revenue grew ${facts.growth.toFixed(1)}% from the previous month to ${formatCurrency(facts.revenue)}, while expenses moved to ${formatCurrency(facts.expenses)}. Across the ${data.monthlyFinance.length} months on record, revenue has moved from ${formatCompactCurrency(data.monthlyFinance[0]?.revenue ?? 0)} to ${formatCompactCurrency(facts.revenue)}. ${facts.overdueInvoices} invoices are overdue, representing ${formatCompactCurrency(facts.overdueInvoiceValue)} of expected collections.`,
    bullets: [
      `${data.transactions.filter((item) => item.type === "Income").length} income transactions and ${data.transactions.filter((item) => item.type === "Expense").length} expense transactions recorded in the ledger.`,
      `Current pipeline value stands at ${formatCompactCurrency(metrics.pipelineValue)} across ${metrics.activeDeals} active deals.`,
      `Net operating surplus for the latest month: ${formatCurrency(facts.net)}.`,
    ],
    metrics: [
      { label: "Revenue", value: formatCompactCurrency(facts.revenue) },
      { label: "Expenses", value: formatCompactCurrency(facts.expenses) },
      { label: "Net surplus", value: formatCompactCurrency(facts.net) },
      { label: "Growth", value: `+${facts.growth.toFixed(1)}%` },
    ],
  };

  const people: ReportSection = {
    heading: "People & hiring",
    body: `Headcount stands at ${metrics.totalEmployees} employees, including ${metrics.newEmployeesThisMonth} new joiners this month. There are ${metrics.openPositions} open positions and ${metrics.pipelineCandidates} candidates in the pipeline, with ${hired} hires recorded and ${offerStage} candidates at offer stage. ${facts.pendingOffers} offers are awaiting approval and ${scheduledInterviews} interviews are scheduled.`,
    bullets: [
      `${data.employees.filter((employee) => employee.status === "Active").length} of ${data.employees.length} sample employee records are active.`,
      `Human Resources efficiency score is ${data.departmentPerformance.find((entry) => entry.department === "Human Resources")?.score ?? "n/a"}%.`,
      `${facts.pendingOffers} offer approvals are blocking candidate next steps.`,
    ],
    metrics: [
      { label: "Employees", value: formatNumber(metrics.totalEmployees) },
      { label: "New this month", value: `+${metrics.newEmployeesThisMonth}` },
      { label: "Open roles", value: formatNumber(metrics.openPositions) },
      { label: "In pipeline", value: formatNumber(metrics.pipelineCandidates) },
    ],
  };

  const sales: ReportSection = {
    heading: "Sales & pipeline",
    body: `The active pipeline carries ${metrics.activeDeals} deals worth ${formatCompactCurrency(metrics.pipelineValue)}. ${wonLeads.length} leads have been won in the current workspace and ${facts.staleLeads} active leads have not been contacted in at least five days. The largest opportunity on record is ${topLead?.company ?? "n/a"} at ${formatCompactCurrency(topLead?.value ?? 0)}.`,
    bullets: [
      `${data.leads.filter((lead) => lead.stage === "Negotiation").length} deals are in negotiation and ${data.leads.filter((lead) => lead.stage === "Proposal").length} are at proposal stage.`,
      `${data.customers.filter((customer) => customer.status === "Active").length} active accounts, ${data.customers.filter((customer) => customer.status === "At risk").length} at risk.`,
      `Follow-up is overdue for ${facts.staleLeads} leads, the clearest near-term revenue risk.`,
    ],
    metrics: [
      { label: "Active deals", value: formatNumber(metrics.activeDeals) },
      { label: "Pipeline value", value: formatCompactCurrency(metrics.pipelineValue) },
      { label: "Won leads", value: formatNumber(wonLeads.length) },
      { label: "No follow-up", value: formatNumber(facts.staleLeads) },
    ],
  };

  const operations: ReportSection = {
    heading: "Delivery & operations",
    body: `There are ${data.projects.length} tracked projects: ${facts.activeProjects} active, ${facts.delayedProjects} delayed, ${facts.atRiskProjects} at risk and ${facts.completedProjects} completed. Active projects average ${facts.averageProgress}% completion. ${facts.overdueTasks} tasks are overdue, of which ${facts.highPriority} are high priority.`,
    bullets: data.projects
      .filter((project) => project.status === "Delayed" || project.status === "At risk")
      .slice(0, 3)
      .map((project) => `${project.name} — ${project.status} at ${project.progress}% complete.`),
    metrics: [
      { label: "Projects", value: formatNumber(data.projects.length) },
      { label: "Active", value: formatNumber(facts.activeProjects) },
      { label: "At risk / delayed", value: `${facts.atRiskProjects} / ${facts.delayedProjects}` },
      { label: "Avg. progress", value: `${facts.averageProgress}%` },
    ],
  };

  const marketing: ReportSection = {
    heading: "Marketing performance",
    body: `${data.campaigns.length} campaigns have spent ${formatCurrency(facts.campaignSpend)} to generate ${formatNumber(facts.campaignLeads)} leads and ${formatNumber(facts.campaignConversions)} conversions, an overall conversion rate of ${conversionRate}%. The blended cost per lead is ${formatCurrency(costPerLead)}.`,
    bullets: data.campaigns
      .slice()
      .sort((left, right) => right.conversions - left.conversions)
      .slice(0, 3)
      .map(
        (campaign) =>
          `${campaign.name} — ${campaign.conversions} conversions on ${campaign.channel}.`,
      ),
    metrics: [
      { label: "Campaigns", value: formatNumber(data.campaigns.length) },
      { label: "Spend", value: formatCompactCurrency(facts.campaignSpend) },
      { label: "Leads", value: formatNumber(facts.campaignLeads) },
      { label: "Conversion", value: `${conversionRate}%` },
    ],
  };

  const recommendations: ReportSection = {
    heading: "Recommended focus",
    body: "The following actions are ranked by their impact on revenue, delivery and risk over the next two weeks.",
    bullets: [
      `Follow up with the ${facts.staleLeads} active leads that have been silent for 5+ days.`,
      `Close the ${facts.highPriority} high-priority overdue tasks and re-plan the remaining ${facts.overdueTasks} overdue items.`,
      `Approve the ${facts.pendingOffers} candidate offers currently waiting on managers.`,
      `Collect the ${facts.overdueInvoices} overdue invoices worth ${formatCompactCurrency(facts.overdueInvoiceValue)}.`,
      `Unblock the ${facts.delayedProjects} delayed projects before their next milestone review.`,
    ],
  };

  const all = [summary, financial, people, sales, operations, marketing, recommendations];
  if (id === "executive" || id === "custom") return all;

  const focusSection: Record<Exclude<ReportId, "executive">, ReportSection> = {
    hr: people,
    financial,
    sales,
    operations,
    marketing,
  };
  return [summary, focusSection[id], recommendations];
}

function countBy<T>(items: T[], keyOf: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = keyOf(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

export function getReportRows(
  id: ReportId | "custom",
  data: SeedData,
): Record<string, string | number>[] {
  const facts = computeFacts(data);
  const { metrics } = data;

  if (id === "hr") {
    const byDepartment = countBy(data.employees, (employee) => employee.department);
    const byStage = countBy(data.candidates, (candidate) => candidate.stage);
    return [
      ...Object.entries(byDepartment).map(([department, employees]) => ({
        Category: "Headcount",
        Name: department,
        Value: employees,
        Detail: "Employees on record",
      })),
      ...Object.entries(byStage).map(([stage, candidates]) => ({
        Category: "Pipeline",
        Name: stage,
        Value: candidates,
        Detail: "Candidates at stage",
      })),
      {
        Category: "Hiring",
        Name: "Open positions",
        Value: metrics.openPositions,
        Detail: "Approved roles",
      },
      {
        Category: "Hiring",
        Name: "Offers awaiting approval",
        Value: facts.pendingOffers,
        Detail: "Pending decisions",
      },
    ];
  }

  if (id === "financial") {
    return data.monthlyFinance.map((entry) => ({
      Month: entry.month,
      Revenue: entry.revenue,
      Expenses: entry.expenses,
      "Net surplus": entry.revenue - entry.expenses,
      "Margin %":
        entry.revenue > 0
          ? Math.round(((entry.revenue - entry.expenses) / entry.revenue) * 100)
          : 0,
    }));
  }

  if (id === "sales") {
    return data.leads.map((lead) => ({
      Lead: lead.name,
      Company: lead.company,
      Stage: lead.stage,
      Value: lead.value,
      "Last contact": lead.lastContact,
      "Days waiting": daysWaiting(lead.lastContact, data.today),
    }));
  }

  if (id === "operations") {
    return data.projects.map((project) => ({
      Project: project.name,
      Department: project.department,
      Status: project.status,
      "Progress %": project.progress,
      Deadline: project.deadline,
      Owner: project.owner,
    }));
  }

  if (id === "marketing") {
    return data.campaigns.map((campaign) => ({
      Campaign: campaign.name,
      Channel: campaign.channel,
      Budget: campaign.budget,
      Spend: campaign.spend,
      Leads: campaign.leads,
      Conversions: campaign.conversions,
      "Cost per lead": campaign.leads > 0 ? Math.round(campaign.spend / campaign.leads) : 0,
    }));
  }

  return [
    {
      Metric: "Total Employees",
      Value: metrics.totalEmployees,
      Note: `${metrics.newEmployeesThisMonth} new this month`,
    },
    {
      Metric: "Monthly Revenue",
      Value: metrics.monthlyRevenue,
      Note: `${facts.latestMonth} actuals`,
    },
    {
      Metric: "Net Margin",
      Value: `${facts.margin}%`,
      Note: `Revenue ${formatCurrency(facts.revenue)}`,
    },
    {
      Metric: "Active Deals",
      Value: metrics.activeDeals,
      Note: formatCompactCurrency(metrics.pipelineValue),
    },
    {
      Metric: "Open Positions",
      Value: metrics.openPositions,
      Note: `${metrics.pipelineCandidates} candidates`,
    },
    {
      Metric: "Overdue Tasks",
      Value: facts.overdueTasks,
      Note: `${facts.highPriority} high priority`,
    },
    { Metric: "Leads Without Follow-up", Value: facts.staleLeads, Note: "5+ days since contact" },
    {
      Metric: "Overdue Invoices",
      Value: facts.overdueInvoices,
      Note: formatCompactCurrency(facts.overdueInvoiceValue),
    },
  ];
}
