import { daysWaiting, formatCompactCurrency } from "@/lib/format";
import type { Department, SeedData } from "@/types";

export interface ToolContext {
  data: SeedData;
  today: string;
}

export interface ToolResult<T = unknown> {
  name: string;
  department: Department | "System";
  durationMs: number;
  summary: string;
  data: T;
}

export interface ToolInvocation {
  name: ToolName;
  args: Record<string, string | number | boolean>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function complete<T>(
  name: string,
  department: Department | "System",
  durationMs: number,
  summary: string,
  data: T,
): Promise<ToolResult<T>> {
  await delay(durationMs);
  return { name, department, durationMs, summary, data };
}

export interface HiringReport {
  applied: number;
  interviewed: number;
  selected: number;
  offersSent: number;
  hired: number;
  averageOffer: number;
  totalOfferCommitment: number;
  highestOffer: number;
  pendingOffers: number;
  followUps: {
    id: string;
    name: string;
    position: string;
    stage: string;
    lastContact: string;
    waiting: number;
    recruiter: string;
  }[];
}

export interface PayrollSummary {
  monthlyPayroll: number;
  annualPayroll: number;
  employeeCount: number;
  pendingCommitment: number;
  pendingOfferCount: number;
  projectedMonthlyPayroll: number;
}

export interface ExpenseBreakdown {
  category: string;
  amount: number;
  share: number;
}

export interface StaleLead {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  owner: string;
  lastContact: string;
  nextFollowUp: string;
  waiting: number;
}

export type ToolDataMap = {
  getCompanyOverview: { data: SeedData };
  getHiringReport: HiringReport;
  getCandidateList: SeedData["candidates"];
  getPayrollSummary: PayrollSummary;
  getFinancialSummary: {
    revenue: number;
    expenses: number;
    netProfit: number;
    margin: number;
    trend: SeedData["monthlyFinance"];
  };
  getExpenseReport: ExpenseBreakdown[];
  getSalesPipeline: {
    stages: { stage: string; count: number; value: number }[];
    openValue: number;
    totalValue: number;
  };
  getSalesLeads: StaleLead[];
  getOverdueTasks: SeedData["tasks"];
  getProjectStatus: SeedData["projects"];
  getDepartmentWorkload: { department: Department; activeTasks: number; capacity: number }[];
  getCampaignPerformance: SeedData["campaigns"];
  getPendingOffers: SeedData["offers"];
  createTask: { created: number };
  draftEmail: { subject: string; body: string };
  sendEmail: { sent: number };
  updateLeadStatus: { updated: number };
};

export type ToolName = keyof ToolDataMap;

export async function executeTool<K extends ToolName>(
  name: K,
  args: Record<string, string | number | boolean>,
  context: ToolContext,
): Promise<ToolResult<ToolDataMap[K]>> {
  const { data, today } = context;

  switch (name) {
    case "getCompanyOverview":
      return complete(
        name,
        "System",
        260,
        `Company metrics and ${data.departmentPerformance.length} department scores loaded`,
        { data },
      ) as Promise<ToolResult<ToolDataMap[K]>>;

    case "getHiringReport": {
      const offersSent = data.offers.length;
      const accepted = data.offers.filter((offer) => offer.status === "Accepted").length;
      const packages = data.offers.map((offer) => offer.package);
      const averageOffer = Math.round(
        packages.reduce((sum, value) => sum + value, 0) / Math.max(1, packages.length),
      );
      const followUps = data.candidates
        .filter((candidate) => candidate.stage !== "Hired" && candidate.stage !== "Rejected")
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          position: candidate.position,
          stage: candidate.stage,
          lastContact: candidate.lastContact,
          waiting: daysWaiting(candidate.lastContact, today),
          recruiter: candidate.recruiter,
        }))
        .sort((a, b) => b.waiting - a.waiting);
      const report: HiringReport = {
        applied: data.candidates.filter((candidate) => candidate.stage === "Applied").length,
        interviewed:
          data.candidates.filter((candidate) => candidate.stage === "Interview").length +
          data.interviews.length,
        selected: data.candidates.filter((candidate) => candidate.stage === "Selected").length,
        offersSent,
        hired: accepted,
        averageOffer,
        totalOfferCommitment: packages.reduce((sum, value) => sum + value, 0),
        highestOffer: Math.max(...packages),
        pendingOffers: data.offers.filter((offer) => offer.status === "Awaiting approval").length,
        followUps: followUps.slice(0, 10),
      };
      return complete(
        name,
        "Human Resources",
        320,
        `${report.hired} hires, ${report.offersSent} offers and ${report.followUps.length} follow-up candidates found`,
        report,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getCandidateList": {
      const stage = String(args["stage"] ?? "all");
      const rows =
        stage === "all"
          ? data.candidates
          : data.candidates.filter((candidate) => candidate.stage === stage);
      return complete(
        name,
        "Human Resources",
        210,
        `${rows.length} candidate records retrieved`,
        rows,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getPayrollSummary": {
      const annualPayroll = data.employees.reduce((sum, employee) => sum + employee.salary, 0);
      const monthlyPayroll = Math.round(annualPayroll / 12);
      const pending = data.offers.filter((offer) =>
        ["Awaiting approval", "Sent", "Draft"].includes(offer.status),
      );
      const pendingCommitment = Math.round(
        pending.reduce((sum, offer) => sum + offer.package, 0) / 12,
      );
      const summary: PayrollSummary = {
        monthlyPayroll,
        annualPayroll,
        employeeCount: data.employees.length,
        pendingCommitment,
        pendingOfferCount: pending.length,
        projectedMonthlyPayroll: monthlyPayroll + pendingCommitment,
      };
      return complete(
        name,
        "Finance",
        280,
        `Payroll ${formatCompactCurrency(monthlyPayroll)}/mo across ${summary.employeeCount} sampled employees`,
        summary,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getFinancialSummary": {
      const revenue = data.transactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const expenses = data.transactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const netProfit = revenue - expenses;
      const summary = {
        revenue,
        expenses,
        netProfit,
        margin: Math.round((netProfit / revenue) * 1000) / 10,
        trend: data.monthlyFinance,
      };
      return complete(
        name,
        "Finance",
        300,
        `Revenue ${formatCompactCurrency(revenue)}, expenses ${formatCompactCurrency(expenses)}, margin ${summary.margin}%`,
        summary,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getExpenseReport": {
      const totals = new Map<string, number>();
      data.transactions
        .filter((transaction) => transaction.type === "Expense")
        .forEach((transaction) =>
          totals.set(
            transaction.category,
            (totals.get(transaction.category) ?? 0) + transaction.amount,
          ),
        );
      const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
      const breakdown = [...totals.entries()]
        .map(([category, amount]) => ({
          category,
          amount,
          share: Math.round((amount / total) * 1000) / 10,
        }))
        .sort((a, b) => b.amount - a.amount);
      return complete(
        name,
        "Finance",
        240,
        `${breakdown.length} expense categories totalling ${formatCompactCurrency(total)}`,
        breakdown,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getSalesPipeline": {
      const stageNames = [
        "New",
        "Contacted",
        "Qualified",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ];
      const stages = stageNames.map((stage) => {
        const leads = data.leads.filter((lead) => lead.stage === stage);
        return {
          stage,
          count: leads.length,
          value: leads.reduce((sum, lead) => sum + lead.value, 0),
        };
      });
      const openValue = stages
        .filter((item) => !["Won", "Lost"].includes(item.stage))
        .reduce((sum, item) => sum + item.value, 0);
      return complete(
        name,
        "Sales",
        220,
        `Pipeline ${formatCompactCurrency(openValue)} across ${stageNames.length - 2} open stages`,
        { stages, openValue, totalValue: data.metrics.pipelineValue },
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getSalesLeads": {
      const stale = data.leads
        .filter((lead) => !["Won", "Lost"].includes(lead.stage))
        .map((lead) => ({
          id: lead.id,
          name: lead.name,
          company: lead.company,
          value: lead.value,
          stage: lead.stage,
          owner: lead.owner,
          lastContact: lead.lastContact,
          nextFollowUp: lead.nextFollowUp,
          waiting: daysWaiting(lead.lastContact, today),
        }))
        .filter((lead) => lead.waiting >= 5)
        .sort((a, b) => b.value - a.value);
      return complete(
        name,
        "Sales",
        250,
        `${stale.length} leads without follow-up for 5+ days`,
        stale,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getOverdueTasks": {
      const overdue = data.tasks.filter(
        (task) => task.status !== "Completed" && task.dueDate < today,
      );
      return complete(
        name,
        "Operations",
        190,
        `${overdue.length} overdue tasks, ${overdue.filter((task) => task.priority === "High").length} high priority`,
        overdue,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getProjectStatus": {
      const delayed = data.projects.filter((project) =>
        ["Delayed", "At risk"].includes(project.status),
      );
      return complete(
        name,
        "Operations",
        230,
        `${delayed.length} projects delayed or at risk`,
        data.projects,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getDepartmentWorkload": {
      const workload = [...new Set(data.tasks.map((task) => task.department))].map(
        (department) => ({
          department,
          activeTasks: data.tasks.filter(
            (task) => task.department === department && task.status !== "Completed",
          ).length,
          capacity: 100,
        }),
      );
      return complete(
        name,
        "Operations",
        200,
        `${workload.length} departments with active task loads`,
        workload,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "getCampaignPerformance":
      return complete(
        name,
        "Marketing",
        210,
        `${data.campaigns.length} campaigns with spend, leads and conversions`,
        data.campaigns,
      ) as Promise<ToolResult<ToolDataMap[K]>>;

    case "getPendingOffers": {
      const pending = data.offers.filter((offer) => offer.status === "Awaiting approval");
      return complete(
        name,
        "Human Resources",
        180,
        `${pending.length} offers awaiting approval`,
        pending,
      ) as Promise<ToolResult<ToolDataMap[K]>>;
    }

    case "createTask":
      return complete(
        name,
        "Operations",
        160,
        `Prepared ${Number(args["count"] ?? 0)} task drafts for approval`,
        { created: Number(args["count"] ?? 0) },
      ) as Promise<ToolResult<ToolDataMap[K]>>;

    case "draftEmail":
      return complete(name, "System", 150, "Email draft generated for review", {
        subject: String(args["subject"] ?? "Following up"),
        body: String(args["body"] ?? ""),
      }) as Promise<ToolResult<ToolDataMap[K]>>;

    case "sendEmail":
      return complete(
        name,
        "System",
        220,
        `${Number(args["count"] ?? 0)} emails queued for simulated delivery`,
        { sent: Number(args["count"] ?? 0) },
      ) as Promise<ToolResult<ToolDataMap[K]>>;

    case "updateLeadStatus":
      return complete(name, "Sales", 160, `${Number(args["count"] ?? 0)} lead stages updated`, {
        updated: Number(args["count"] ?? 0),
      }) as Promise<ToolResult<ToolDataMap[K]>>;

    default:
      return complete(
        name,
        "System",
        100,
        "Tool completed",
        undefined as unknown as ToolDataMap[K],
      ) as Promise<ToolResult<ToolDataMap[K]>>;
  }
}

export const toolCatalog: {
  name: ToolName;
  department: Department | "System";
  description: string;
}[] = [
  {
    name: "getCompanyOverview",
    department: "System",
    description: "Company-wide metrics and department scores",
  },
  {
    name: "getHiringReport",
    department: "Human Resources",
    description: "Recruitment funnel and offer analytics",
  },
  {
    name: "getCandidateList",
    department: "Human Resources",
    description: "Candidate records by stage",
  },
  {
    name: "getPayrollSummary",
    department: "Finance",
    description: "Current and projected payroll",
  },
  {
    name: "getFinancialSummary",
    department: "Finance",
    description: "Revenue, expenses and margin",
  },
  { name: "getExpenseReport", department: "Finance", description: "Spend by category" },
  { name: "getSalesPipeline", department: "Sales", description: "Deal stages and pipeline value" },
  { name: "getSalesLeads", department: "Sales", description: "Stale high-value leads" },
  { name: "getOverdueTasks", department: "Operations", description: "Overdue work by priority" },
  {
    name: "getProjectStatus",
    department: "Operations",
    description: "Delayed and at-risk projects",
  },
  {
    name: "getDepartmentWorkload",
    department: "Operations",
    description: "Active tasks by department",
  },
  {
    name: "getCampaignPerformance",
    department: "Marketing",
    description: "Campaign spend, leads and conversions",
  },
  {
    name: "getPendingOffers",
    department: "Human Resources",
    description: "Offers awaiting approval",
  },
  { name: "createTask", department: "Operations", description: "Create follow-up tasks" },
  { name: "draftEmail", department: "System", description: "Draft personalised emails" },
  { name: "sendEmail", department: "System", description: "Send approved emails" },
  { name: "updateLeadStatus", department: "Sales", description: "Update lead stages" },
];
