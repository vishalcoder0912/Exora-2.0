import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format";
import type {
  ActionProposal,
  ChartPoint,
  InsightItem,
  KpiBlockItem,
  ResponseBlock,
  RiskItem,
  TableColumn,
} from "@/types";
import type { ToolContext, ToolDataMap, ToolInvocation, ToolResult } from "@/services/tools";
import type { ToolName } from "@/services/tools";

export type ScenarioId =
  | "companyHealth"
  | "hiring"
  | "finance"
  | "sales"
  | "operations"
  | "marketing"
  | "salaryProjection"
  | "general";

export interface AgentResponse {
  scenario: ScenarioId;
  title: string;
  text: string;
  blocks: ResponseBlock[];
  actions: ActionProposal[];
  followUps: string[];
}

export interface AgentPlan {
  scenario: ScenarioId;
  title: string;
  tools: ToolInvocation[];
  build: (
    results: Partial<Record<ToolName, ToolResult<never>>>,
    context: ToolContext,
  ) => AgentResponse;
}

type AnyResults = Record<string, ToolResult<unknown>>;

function result<T>(results: AnyResults, name: ToolName): T {
  return results[name]?.data as T;
}

function kpi(
  label: string,
  value: string,
  note: string,
  tone: KpiBlockItem["tone"] = "info",
): KpiBlockItem {
  return { label, value, note, tone };
}

function table(
  title: string,
  columns: string[],
  rows: Record<string, string>[],
  highlight?: (row: Record<string, string>) => boolean,
): ResponseBlock {
  const mappedColumns: TableColumn[] = columns.map((label, index) => ({ key: `c${index}`, label }));
  return { type: "table", table: { title, columns: mappedColumns, rows, highlight } };
}

function actionId(index: number): string {
  return `ACT-${Date.now().toString(36).toUpperCase()}-${index}`;
}

const keywordSets: { id: ScenarioId; keywords: string[] }[] = [
  {
    id: "salaryProjection",
    keywords: [
      "payroll",
      "salary projection",
      "pending offer",
      "offers accepted",
      "projected payroll",
      "current payroll",
      "commitment",
    ],
  },
  {
    id: "hiring",
    keywords: [
      "candidate",
      "hired",
      "hiring",
      "recruit",
      "offer",
      "package",
      "follow-up",
      "interview",
      "recruiter",
    ],
  },
  {
    id: "finance",
    keywords: [
      "revenue",
      "expense",
      "spend",
      "spending",
      "profit",
      "margin",
      "financial",
      "invoice",
      "cost",
    ],
  },
  { id: "sales", keywords: ["lead", "pipeline", "deal", "sales", "contacted", "follow up"] },
  {
    id: "operations",
    keywords: [
      "project",
      "delayed",
      "overdue",
      "task",
      "prioritize",
      "workload",
      "operations",
      "deadline",
    ],
  },
  {
    id: "marketing",
    keywords: ["campaign", "marketing", "conversion", "cost per lead", "acquisition", "channel"],
  },
  {
    id: "companyHealth",
    keywords: [
      "company",
      "overall",
      "health",
      "business",
      "organization",
      "biggest problem",
      "today",
      "summary",
      "report",
    ],
  },
];

export function detectScenario(prompt: string, previousPrompt = ""): ScenarioId {
  const text = `${previousPrompt} ${prompt}`.toLowerCase();
  let best: ScenarioId = "general";
  let bestScore = 0;

  for (const entry of keywordSets) {
    const score = entry.keywords.reduce(
      (total, keyword) => total + (text.includes(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = entry.id;
    }
  }

  if (/\b(compare revenue|revenue and expenses|where.*spending)\b/.test(text)) return "finance";
  if (/\b(health report|overall health|biggest problems)\b/.test(text)) return "companyHealth";
  if (/\b(payroll|salary)\b/.test(text) && /\b(pending|project|accept|offer)\b/.test(text))
    return "salaryProjection";

  return best;
}

const monthArgs = { month: "November 2026" };

export function planFor(scenario: ScenarioId): AgentPlan {
  switch (scenario) {
    case "companyHealth":
      return {
        scenario,
        title: "Company health report",
        tools: [
          { name: "getCompanyOverview", args: monthArgs },
          { name: "getFinancialSummary", args: monthArgs },
          { name: "getSalesPipeline", args: monthArgs },
          { name: "getOverdueTasks", args: monthArgs },
          { name: "getProjectStatus", args: monthArgs },
          { name: "getHiringReport", args: monthArgs },
        ],
        build: (raw, context) => {
          const overview = result<{ data: ToolContext["data"] }>(
            raw as AnyResults,
            "getCompanyOverview",
          );
          const finance = result<{
            revenue: number;
            expenses: number;
            netProfit: number;
            margin: number;
          }>(raw as AnyResults, "getFinancialSummary");
          const leads = result<{ openValue: number }>(raw as AnyResults, "getSalesPipeline");
          const overdue = result<ToolDataMap["getOverdueTasks"]>(
            raw as AnyResults,
            "getOverdueTasks",
          );
          const projects = result<ToolDataMap["getProjectStatus"]>(
            raw as AnyResults,
            "getProjectStatus",
          );
          const hiring = result<ToolDataMap["getHiringReport"]>(
            raw as AnyResults,
            "getHiringReport",
          );
          const company = overview?.data ?? context.data;
          const delayed = (projects ?? []).filter((project) =>
            ["Delayed", "At risk"].includes(project.status),
          );
          const highPriority = (overdue ?? []).filter((task) => task.priority === "High").length;
          const staleLeads = (company.leads ?? []).filter((lead) => {
            const days = Math.max(
              0,
              (new Date(context.today).getTime() - new Date(lead.lastContact).getTime()) /
                86_400_000,
            );
            return days >= 5 && !["Won", "Lost"].includes(lead.stage);
          }).length;

          const insights: InsightItem[] = [
            {
              tone: "positive",
              label: "Positive",
              text: `Revenue is ${formatCompactCurrency(finance?.revenue ?? company.metrics.monthlyRevenue)}, up ${company.metrics.revenueGrowth}% compared with last month.`,
            },
            {
              tone: "warning",
              label: "Attention",
              text: `${overdue?.length ?? 12} operational tasks are overdue, including ${highPriority} high-priority tasks.`,
            },
            {
              tone: "info",
              label: "Opportunity",
              text: `${staleLeads} high-value sales leads haven't received follow-up in 5+ days.`,
            },
          ];

          const risks: RiskItem[] = [
            {
              severity: "High",
              title: "Operational delivery",
              reason: `${overdue?.length ?? 12} tasks are overdue, ${highPriority} of them high priority.`,
              department: "Operations",
            },
            {
              severity: "Medium",
              title: "Project timelines",
              reason: `${delayed.length} projects are delayed or at risk, including ${delayed.filter((p) => p.status === "Delayed").length} already behind schedule.`,
              department: "Operations",
            },
            {
              severity: "Medium",
              title: "Pipeline hygiene",
              reason: `${staleLeads} leads have not been contacted in 5+ days.`,
              department: "Sales",
            },
          ];

          return {
            scenario,
            title: "Company health report",
            text: `Here's the current read on Aether Technologies. Monthly revenue is ${formatCompactCurrency(finance?.revenue ?? company.metrics.monthlyRevenue)} with a ${finance?.margin ?? 39}% margin, and the sales pipeline stands at ${formatCompactCurrency(company.metrics.pipelineValue)}. Hiring is steady at ${hiring?.hired ?? 11} hires this month. The clearest drag is operational execution: ${overdue?.length ?? 12} overdue tasks and ${delayed.length} projects needing attention.`,
            blocks: [
              {
                type: "kpis",
                title: "Overall health: Needs attention",
                items: [
                  kpi(
                    "Revenue",
                    formatCompactCurrency(finance?.revenue ?? 0),
                    `+${company.metrics.revenueGrowth}% vs last month`,
                    "positive",
                  ),
                  kpi(
                    "Employees",
                    String(company.metrics.totalEmployees),
                    `+${company.metrics.newEmployeesThisMonth} this month`,
                  ),
                  kpi(
                    "Pipeline",
                    formatCompactCurrency(leads?.openValue ?? company.metrics.pipelineValue),
                    `${company.metrics.activeDeals} active deals`,
                  ),
                  kpi(
                    "Overdue tasks",
                    String(overdue?.length ?? 0),
                    `${highPriority} high priority`,
                    "critical",
                  ),
                ],
              },
              { type: "insights", title: "Key findings", items: insights },
              { type: "risks", title: "Top 3 risks", items: risks },
              {
                type: "recommendations",
                title: "Recommended priorities",
                items: [
                  `Clear the ${highPriority} high-priority overdue tasks first, then reassess the remaining ${Math.max(0, (overdue?.length ?? 0) - highPriority)}.`,
                  `Review the ${delayed.length} delayed or at-risk projects and reset milestones with their owners.`,
                  `Trigger follow-up on the ${staleLeads} stale high-value leads before the week ends.`,
                ],
              },
            ],
            actions: [
              {
                id: actionId(1),
                type: "task",
                title: "Create 3 follow-up tasks for the Operations team",
                description: "Assign owners and due dates for the highest-priority overdue work.",
                status: "pending",
                payload: {
                  kind: "task",
                  tasks: (overdue ?? [])
                    .filter((task) => task.priority === "High")
                    .slice(0, 3)
                    .map((task) => ({
                      title: `Follow up: ${task.title}`,
                      assignee: task.assignee,
                      priority: "High" as const,
                      dueDate: context.today,
                    })),
                },
              },
            ],
            followUps: [
              "Generate an executive report from this analysis",
              "Which projects are at risk?",
              "Compare revenue and expenses",
            ],
          };
        },
      };

    case "hiring":
      return {
        scenario,
        title: "Recruitment analysis",
        tools: [
          { name: "getHiringReport", args: monthArgs },
          { name: "getCandidateList", args: monthArgs },
          { name: "getPayrollSummary", args: monthArgs },
        ],
        build: (raw, context) => {
          const report = result<ToolDataMap["getHiringReport"]>(
            raw as AnyResults,
            "getHiringReport",
          );
          const payroll = result<ToolDataMap["getPayrollSummary"]>(
            raw as AnyResults,
            "getPayrollSummary",
          );
          const followUps = report?.followUps ?? [];
          const rows = followUps.map((candidate) => ({
            Candidate: candidate.name,
            Position: candidate.position,
            Stage: candidate.stage,
            "Last contact": formatDate(candidate.lastContact),
            "Days waiting": String(candidate.waiting),
            "HR owner": candidate.recruiter,
          }));
          return {
            scenario,
            title: "November recruitment analysis",
            text: `This month the team recorded ${report?.applied ?? 0} new applications, ${report?.interviewed ?? 0} interviews, ${report?.selected ?? 0} selected candidates, ${report?.offersSent ?? 0} offers and ${report?.hired ?? 0} hires. The average offer package is ${formatCompactCurrency(report?.averageOffer ?? 0)}, with ${report?.pendingOffers ?? 0} offers still awaiting approval. ${followUps.filter((item) => item.waiting >= 5).length} candidates need a follow-up.`,
            blocks: [
              {
                type: "kpis",
                title: "Recruitment summary",
                items: [
                  kpi("Applied", String(report?.applied ?? 0), "This month"),
                  kpi(
                    "Interviewed",
                    String(report?.interviewed ?? 0),
                    "Including scheduled rounds",
                  ),
                  kpi("Selected", String(report?.selected ?? 0), "Ready for offer"),
                  kpi(
                    "Offers sent",
                    String(report?.offersSent ?? 0),
                    `${report?.pendingOffers ?? 0} awaiting approval`,
                    "warning",
                  ),
                  kpi("Hired", String(report?.hired ?? 0), "Accepted offers", "positive"),
                ],
              },
              {
                type: "kpis",
                title: "Offer package analytics",
                items: [
                  kpi(
                    "Average offer",
                    formatCompactCurrency(report?.averageOffer ?? 0),
                    "Annual CTC",
                  ),
                  kpi(
                    "Total commitment",
                    formatCompactCurrency(report?.totalOfferCommitment ?? 0),
                    "Annual CTC",
                    "warning",
                  ),
                  kpi(
                    "Highest offer",
                    formatCompactCurrency(report?.highestOffer ?? 0),
                    "Annual CTC",
                  ),
                  kpi(
                    "Monthly payroll",
                    formatCompactCurrency(payroll?.monthlyPayroll ?? 0),
                    `${payroll?.employeeCount ?? 0} sampled employees`,
                  ),
                ],
              },
              table(
                "Candidates needing follow-up",
                ["Candidate", "Position", "Stage", "Last contact", "Days waiting", "HR owner"],
                rows,
                (row) => Number(row["Days waiting"]) >= 5,
              ),
            ],
            actions: [
              {
                id: actionId(1),
                type: "email",
                title: `Send follow-up emails to ${Math.min(6, followUps.length)} candidates`,
                description: "Personalised check-in notes for candidates waiting on a response.",
                status: "pending",
                payload: {
                  kind: "email",
                  recipients: followUps.slice(0, 6).map((candidate) => ({
                    name: candidate.name,
                    email: `${candidate.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
                  })),
                  subject: "Following up on your application at Aether Technologies",
                  body: "Hi {name},\n\nThank you for your patience. We're reviewing your application for the {position} role and would love to schedule the next step.\n\nCould you share a convenient time in the next few days?\n\nBest regards,\nAether Technologies Talent Team",
                },
              },
              {
                id: actionId(2),
                type: "task",
                title: "Create 3 follow-up tasks for the HR team",
                description:
                  "Tasks assigned to the recruiters owning the oldest candidate threads.",
                status: "pending",
                payload: {
                  kind: "task",
                  tasks: followUps.slice(0, 3).map((candidate) => ({
                    title: `Follow up with ${candidate.name}`,
                    assignee: candidate.recruiter,
                    priority: candidate.waiting >= 7 ? ("High" as const) : ("Medium" as const),
                    dueDate: context.today,
                  })),
                },
              },
            ],
            followUps: [
              "What will payroll be if all pending offers are accepted?",
              "Show me all candidates in Interview stage",
              "Which offers are awaiting approval?",
            ],
          };
        },
      };

    case "finance":
      return {
        scenario,
        title: "Financial analysis",
        tools: [
          { name: "getFinancialSummary", args: monthArgs },
          { name: "getExpenseReport", args: monthArgs },
        ],
        build: (raw, context) => {
          const finance = result<{
            revenue: number;
            expenses: number;
            netProfit: number;
            margin: number;
            trend: ToolContext["data"]["monthlyFinance"];
          }>(raw as AnyResults, "getFinancialSummary");
          const expenses = result<ToolDataMap["getExpenseReport"]>(
            raw as AnyResults,
            "getExpenseReport",
          );
          const points: ChartPoint[] = (finance?.trend ?? []).map((month) => ({
            label: month.month,
            values: { Revenue: month.revenue, Expenses: month.expenses },
          }));
          const top = (expenses ?? [])[0];
          const october = finance?.trend.find((item) => item.month === "Oct");
          const november = finance?.trend.find((item) => item.month === "Nov");
          const growth =
            october && november
              ? Math.round(((november.revenue - october.revenue) / october.revenue) * 1000) / 10
              : 0;
          return {
            scenario,
            title: "Finance analysis",
            text: `November closed with ${formatCurrency(finance?.revenue ?? 0)} in revenue and ${formatCurrency(finance?.expenses ?? 0)} in expenses, leaving a net profit of ${formatCurrency(finance?.netProfit ?? 0)} at a ${finance?.margin ?? 0}% margin. Revenue grew ${growth}% month over month. Your largest spending category is ${top?.category ?? "Payroll"} at ${formatCompactCurrency(top?.amount ?? 0)} (${top?.share ?? 0}% of total spend).`,
            blocks: [
              {
                type: "kpis",
                items: [
                  kpi(
                    "Total revenue",
                    formatCompactCurrency(finance?.revenue ?? 0),
                    "+8.4% vs October",
                    "positive",
                  ),
                  kpi(
                    "Total expenses",
                    formatCompactCurrency(finance?.expenses ?? 0),
                    "Across all departments",
                    "warning",
                  ),
                  kpi(
                    "Net profit",
                    formatCompactCurrency(finance?.netProfit ?? 0),
                    "Revenue less expenses",
                    "positive",
                  ),
                  kpi("Margin", `${finance?.margin ?? 0}%`, "Healthy range"),
                ],
              },
              {
                type: "chart",
                title: "Revenue vs expenses — 6 months",
                points,
                series: ["Revenue", "Expenses"],
              },
              table(
                "Largest spending categories",
                ["Category", "Amount", "Share of spend"],
                (expenses ?? []).slice(0, 6).map((item) => ({
                  Category: item.category,
                  Amount: formatCurrency(item.amount),
                  "Share of spend": `${item.share}%`,
                })),
              ),
              {
                type: "insights",
                items: [
                  {
                    tone: "info",
                    label: "Month over month",
                    text: `Revenue moved from ${formatCompactCurrency(october?.revenue ?? 0)} in October to ${formatCompactCurrency(november?.revenue ?? 0)} in November (${growth > 0 ? "+" : ""}${growth}%).`,
                  },
                  {
                    tone: "warning",
                    label: "Watch",
                    text: `${top?.category ?? "Payroll"} accounts for ${top?.share ?? 0}% of spend. Review before the next budget cycle.`,
                  },
                ],
              },
            ],
            actions: [],
            followUps: [
              "View financial details",
              "Which departments spend the most?",
              "How much is our current payroll?",
            ],
          };
        },
      };

    case "sales":
      return {
        scenario,
        title: "Sales intelligence",
        tools: [
          { name: "getSalesPipeline", args: monthArgs },
          { name: "getSalesLeads", args: monthArgs },
        ],
        build: (raw, context) => {
          const pipeline = result<{
            stages: { stage: string; count: number; value: number }[];
            openValue: number;
          }>(raw as AnyResults, "getSalesPipeline");
          const stale = result<ToolDataMap["getSalesLeads"]>(raw as AnyResults, "getSalesLeads");
          const valueAtRisk = (stale ?? []).reduce((sum, lead) => sum + lead.value, 0);
          return {
            scenario,
            title: "Sales pipeline risks",
            text: `There are ${stale?.length ?? 0} high-value leads that haven't been contacted in 5 or more days, representing ${formatCompactCurrency(valueAtRisk)} at risk. Your open pipeline is ${formatCompactCurrency(pipeline?.openValue ?? 0)}. A quick round of follow-ups is the highest-leverage action this week.`,
            blocks: [
              {
                type: "kpis",
                items: [
                  kpi(
                    "Open pipeline",
                    formatCompactCurrency(pipeline?.openValue ?? 0),
                    "Excluding won and lost",
                  ),
                  kpi(
                    "Stale leads",
                    String(stale?.length ?? 0),
                    "5+ days without contact",
                    "critical",
                  ),
                  kpi(
                    "Value at risk",
                    formatCompactCurrency(valueAtRisk),
                    "Across stale leads",
                    "warning",
                  ),
                ],
              },
              table(
                "Leads needing follow-up",
                [
                  "Lead",
                  "Company",
                  "Deal value",
                  "Stage",
                  "Owner",
                  "Last contact",
                  "Next follow-up",
                ],
                (stale ?? []).map((lead) => ({
                  Lead: lead.name,
                  Company: lead.company,
                  "Deal value": formatCompactCurrency(lead.value),
                  Stage: lead.stage,
                  Owner: lead.owner,
                  "Last contact": `${lead.waiting} days ago`,
                  "Next follow-up": formatDate(lead.nextFollowUp),
                })),
                (row) => Number((row["Last contact"] ?? "0").split(" ")[0]) >= 7,
              ),
            ],
            actions: [
              {
                id: actionId(1),
                type: "email",
                title: `Send follow-up emails to ${Math.min(6, stale?.length ?? 0)} leads`,
                description: "Re-engage the highest-value stale opportunities.",
                status: "pending",
                payload: {
                  kind: "email",
                  recipients: (stale ?? []).slice(0, 6).map((lead) => ({
                    name: lead.name,
                    email: `${lead.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
                  })),
                  subject: "Checking in on our next steps",
                  body: "Hi {name},\n\nI wanted to follow up on our conversation and see where things stand. We'd be glad to share an updated proposal or answer any open questions.\n\nWould a short call this week work?\n\nBest regards,\nAether Technologies Sales Team",
                },
              },
              {
                id: actionId(2),
                type: "task",
                title: "Create 3 sales follow-up tasks",
                description: "Assign the largest stale deals back to their owners.",
                status: "pending",
                payload: {
                  kind: "task",
                  tasks: (stale ?? []).slice(0, 3).map((lead) => ({
                    title: `Follow up with ${lead.company}`,
                    assignee: lead.owner,
                    priority: "High" as const,
                    dueDate: context.today,
                  })),
                },
              },
            ],
            followUps: [
              "Which deals are in Negotiation?",
              "Show me the full sales pipeline",
              "Draft a follow-up email for the top lead",
            ],
          };
        },
      };

    case "operations":
      return {
        scenario,
        title: "Operations review",
        tools: [
          { name: "getProjectStatus", args: monthArgs },
          { name: "getOverdueTasks", args: monthArgs },
          { name: "getDepartmentWorkload", args: monthArgs },
        ],
        build: (raw, context) => {
          const projects = result<ToolDataMap["getProjectStatus"]>(
            raw as AnyResults,
            "getProjectStatus",
          );
          const overdue = result<ToolDataMap["getOverdueTasks"]>(
            raw as AnyResults,
            "getOverdueTasks",
          );
          const workload = result<ToolDataMap["getDepartmentWorkload"]>(
            raw as AnyResults,
            "getDepartmentWorkload",
          );
          const delayed = (projects ?? []).filter((project) =>
            ["Delayed", "At risk"].includes(project.status),
          );
          const high = (overdue ?? []).filter((task) => task.priority === "High");
          const points: ChartPoint[] = (workload ?? []).map((item) => ({
            label: item.department,
            values: { "Active tasks": item.activeTasks },
          }));
          return {
            scenario,
            title: "Overdue operations review",
            text: `${delayed.length} projects are delayed or at risk and ${overdue?.length ?? 0} tasks are overdue. Start with the ${high.length} high-priority items, then rebalance work in the busiest departments. The heaviest load is ${[...(workload ?? [])].sort((a, b) => b.activeTasks - a.activeTasks)[0]?.department ?? "Operations"}.`,
            blocks: [
              {
                type: "kpis",
                items: [
                  kpi("Delayed projects", String(delayed.length), "Including at-risk", "critical"),
                  kpi(
                    "Overdue tasks",
                    String(overdue?.length ?? 0),
                    `${high.length} high priority`,
                    "critical",
                  ),
                  kpi(
                    "Active projects",
                    String(
                      (projects ?? []).filter((project) => project.status !== "Completed").length,
                    ),
                    "Across all departments",
                  ),
                ],
              },
              table(
                "Delayed and at-risk projects",
                ["Project", "Owner", "Progress", "Deadline", "Status"],
                delayed.map((project) => ({
                  Project: project.name,
                  Owner: project.owner,
                  Progress: `${project.progress}%`,
                  Deadline: formatDate(project.deadline),
                  Status: project.status,
                })),
                (row) => row["Status"] === "Delayed",
              ),
              table(
                "Priority tasks",
                ["Task", "Project", "Assignee", "Priority", "Due"],
                high.slice(0, 8).map((task) => ({
                  Task: task.title,
                  Project: task.projectName,
                  Assignee: task.assignee,
                  Priority: task.priority,
                  Due: formatDate(task.dueDate),
                })),
                () => true,
              ),
              {
                type: "chart",
                title: "Active tasks by department",
                points,
                series: ["Active tasks"],
              },
            ],
            actions: [
              {
                id: actionId(1),
                type: "task",
                title: "Create tasks for the highest-priority work",
                description: "Assign clear owners and today's due date to the critical items.",
                status: "pending",
                payload: {
                  kind: "task",
                  tasks: high.slice(0, 3).map((task) => ({
                    title: `Escalate: ${task.title}`,
                    assignee: task.assignee,
                    priority: "High" as const,
                    dueDate: context.today,
                  })),
                },
              },
            ],
            followUps: [
              "Show me team workload",
              "Which tasks are due today?",
              "Create tasks for these projects",
            ],
          };
        },
      };

    case "marketing":
      return {
        scenario,
        title: "Marketing performance",
        tools: [{ name: "getCampaignPerformance", args: monthArgs }],
        build: (raw) => {
          const campaigns = result<ToolDataMap["getCampaignPerformance"]>(
            raw as AnyResults,
            "getCampaignPerformance",
          );
          const spend = (campaigns ?? []).reduce((sum, campaign) => sum + campaign.spend, 0);
          const leads = (campaigns ?? []).reduce((sum, campaign) => sum + campaign.leads, 0);
          const conversions = (campaigns ?? []).reduce(
            (sum, campaign) => sum + campaign.conversions,
            0,
          );
          const best = [...(campaigns ?? [])].sort(
            (a, b) => b.conversions / Math.max(1, b.spend) - a.conversions / Math.max(1, a.spend),
          )[0];
          const cheapest = [...(campaigns ?? [])].sort(
            (a, b) => a.spend / Math.max(1, a.leads) - b.spend / Math.max(1, b.leads),
          )[0];
          const points: ChartPoint[] = (campaigns ?? []).map((campaign) => ({
            label: campaign.name.split(" ").slice(0, 2).join(" "),
            values: { Spend: campaign.spend, Conversions: campaign.conversions },
          }));
          return {
            scenario,
            title: "Marketing performance",
            text: `Campaigns have spent ${formatCompactCurrency(spend)} to generate ${leads} leads and ${conversions} conversions — an average cost per lead of ${formatCompactCurrency(Math.round(spend / Math.max(1, leads)))}. The best return comes from ${best?.name ?? "Enterprise inbound Q4"}, while ${cheapest?.name ?? "Content SEO sprint"} has the lowest cost per lead.`,
            blocks: [
              {
                type: "kpis",
                items: [
                  kpi("Total spend", formatCompactCurrency(spend), "Across 8 campaigns", "warning"),
                  kpi("Leads generated", String(leads), "Attributed to campaigns"),
                  kpi(
                    "Conversions",
                    String(conversions),
                    `${Math.round((conversions / Math.max(1, leads)) * 1000) / 10}% conversion rate`,
                    "positive",
                  ),
                  kpi(
                    "Avg cost per lead",
                    formatCompactCurrency(Math.round(spend / Math.max(1, leads))),
                    "Blended across channels",
                  ),
                ],
              },
              {
                type: "chart",
                title: "Spend and conversions by campaign",
                points,
                series: ["Spend", "Conversions"],
              },
              table(
                "Campaign performance",
                ["Campaign", "Channel", "Spend", "Leads", "Conversions", "Cost per lead"],
                (campaigns ?? []).map((campaign) => ({
                  Campaign: campaign.name,
                  Channel: campaign.channel,
                  Spend: formatCompactCurrency(campaign.spend),
                  Leads: String(campaign.leads),
                  Conversions: String(campaign.conversions),
                  "Cost per lead": formatCompactCurrency(
                    Math.round(campaign.spend / Math.max(1, campaign.leads)),
                  ),
                })),
              ),
              {
                type: "insights",
                items: [
                  {
                    tone: "positive",
                    label: "Best performing",
                    text: `${best?.name ?? "Enterprise inbound Q4"} delivers the strongest conversions per rupee of spend.`,
                  },
                ],
              },
            ],
            actions: [],
            followUps: [
              "Which campaigns have the lowest cost per lead?",
              "Show me leads by channel",
              "Compare this month with last month",
            ],
          };
        },
      };

    case "salaryProjection":
      return {
        scenario,
        title: "Salary projection",
        tools: [
          { name: "getPayrollSummary", args: monthArgs },
          { name: "getPendingOffers", args: monthArgs },
        ],
        build: (raw) => {
          const payroll = result<ToolDataMap["getPayrollSummary"]>(
            raw as AnyResults,
            "getPayrollSummary",
          );
          const pending = result<ToolDataMap["getPendingOffers"]>(
            raw as AnyResults,
            "getPendingOffers",
          );
          const points: ChartPoint[] = [
            { label: "Current", values: { "Monthly payroll": payroll?.monthlyPayroll ?? 0 } },
            {
              label: "Projected",
              values: { "Monthly payroll": payroll?.projectedMonthlyPayroll ?? 0 },
            },
          ];
          return {
            scenario,
            title: "Salary projection",
            text: `Current monthly payroll is ${formatCurrency(payroll?.monthlyPayroll ?? 0)} across ${payroll?.employeeCount ?? 0} sampled employees. There are ${pending?.length ?? 0} offers worth ${formatCompactCurrency(payroll?.pendingCommitment ?? 0)} per month still outstanding. If every pending offer is accepted, monthly payroll becomes ${formatCurrency(payroll?.projectedMonthlyPayroll ?? 0)} — an increase of ${formatCompactCurrency(payroll?.pendingCommitment ?? 0)} per month. This assumes all outstanding offers are accepted at the quoted package and no other changes occur.`,
            blocks: [
              {
                type: "kpis",
                items: [
                  kpi(
                    "Current monthly payroll",
                    formatCompactCurrency(payroll?.monthlyPayroll ?? 0),
                    "Sampled workforce",
                  ),
                  kpi(
                    "Pending offer commitment",
                    formatCompactCurrency(payroll?.pendingCommitment ?? 0),
                    `${payroll?.pendingOfferCount ?? 0} outstanding offers`,
                    "warning",
                  ),
                  kpi("Outstanding offers", String(pending?.length ?? 0), "Awaiting approval"),
                  kpi(
                    "Projected monthly payroll",
                    formatCompactCurrency(payroll?.projectedMonthlyPayroll ?? 0),
                    "If all offers accepted",
                    "positive",
                  ),
                ],
              },
              {
                type: "chart",
                title: "Current vs projected monthly payroll",
                points,
                series: ["Monthly payroll"],
              },
              {
                type: "insights",
                items: [
                  {
                    tone: "info",
                    label: "Assumption",
                    text: "Projection includes Draft, Sent and Awaiting-approval offers at their full quoted annual package, divided by 12.",
                  },
                  {
                    tone: "warning",
                    label: "Note",
                    text: "Figures are based on the 30 detailed employee records in this demo workspace, not the full 248-person headcount.",
                  },
                ],
              },
            ],
            actions: [],
            followUps: [
              "Show me recruitment performance",
              "Which offers are awaiting approval?",
              "Compare payroll with revenue",
            ],
          };
        },
      };

    case "general":
    default:
      return {
        scenario,
        title: "AI Intelligence",
        tools: [{ name: "getCompanyOverview", args: monthArgs }],
        build: (raw) => {
          const overview = result<{ data: ToolContext["data"] }>(
            raw as AnyResults,
            "getCompanyOverview",
          );
          const metrics = overview?.data?.metrics;
          return {
            scenario,
            title: "AI Intelligence",
            text: `I'm connected to HR, Finance, Sales, Operations and Marketing data for Aether Technologies. Right now the workspace shows ${formatCompactCurrency(metrics?.monthlyRevenue ?? 0)} in monthly revenue, ${metrics?.totalEmployees ?? 248} employees and ${metrics?.overdueTasks ?? 12} overdue tasks. Ask me about any department, or try one of the suggested questions.`,
            blocks: [],
            actions: [],
            followUps: [
              "Give me an overall health report of the company",
              "Summarize recruitment performance this month",
              "Which projects are at risk?",
            ],
          };
        },
      };
  }
}

export const suggestedPrompts = [
  { category: "Company Intelligence", prompt: "Give me a company health report.", icon: "company" },
  { category: "HR", prompt: "Summarize recruitment performance this month.", icon: "hr" },
  { category: "Finance", prompt: "Compare revenue and expenses.", icon: "finance" },
  { category: "Sales", prompt: "Which leads need my attention?", icon: "sales" },
  { category: "Operations", prompt: "Which projects are at risk?", icon: "operations" },
  { category: "Marketing", prompt: "Which campaigns are performing best?", icon: "marketing" },
] as const;
