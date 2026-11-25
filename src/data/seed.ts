import type {
  AuditEvent,
  Campaign,
  Candidate,
  CandidateStage,
  CompanyMetrics,
  Customer,
  Department,
  Employee,
  Interview,
  Invoice,
  Lead,
  LeadStage,
  MonthlyFinance,
  Offer,
  Project,
  SeedData,
  Task,
  Transaction,
} from "@/types";

export const TODAY = "2026-11-22";

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261122);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!;
}

function between(min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function distributeExact(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  const values = weights
    .slice(0, -1)
    .map((weight) => Math.round(((weight / sum) * total) / 1000) * 1000);
  values.push(total - values.reduce((acc, value) => acc + value, 0));
  return values;
}

const BASE_DATE = new Date(`${TODAY}T00:00:00.000Z`);

function shiftDate(days: number): string {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateWithOffset(days: number): string {
  return shiftDate(days);
}

const departments: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

const employeeNames = [
  "Aarav Sharma",
  "Diya Nair",
  "Rohan Mehta",
  "Isha Kapoor",
  "Aditya Verma",
  "Meera Iyer",
  "Kabir Malhotra",
  "Ananya Rao",
  "Vikram Singh",
  "Sneha Kulkarni",
  "Arjun Nair",
  "Riya Banerjee",
  "Dev Patel",
  "Naomi Fernandes",
  "Karan Bhatia",
  "Tara Deshmukh",
  "Siddharth Jain",
  "Pooja Reddy",
  "Manav Chaudhary",
  "Zoya Ansari",
  "Rehan Khan",
  "Sanya Gupta",
  "Nikhil Pillai",
  "Ira Sethi",
  "Rajat Bansal",
  "Nisha Vyas",
  "Amanbir Kaur",
  "Vivaan Joshi",
  "Lakshmi Menon",
  "Sahil Arora",
  "Priya Sharma",
  "Rahul Menon",
  "Ananya Iyer",
  "Vikram Rao",
  "Neha Aggarwal",
  "Gaurav Saxena",
  "Shruti Pandey",
  "Arnav Bose",
  "Kavya Shetty",
  "Ritwik Ghosh",
];

const candidateNames = [
  "Aditi Rane",
  "Sahil Bansal",
  "Nandini Kulkarni",
  "Rohit Pawar",
  "Sana Qureshi",
  "Vineet Agarwal",
  "Meghna Desai",
  "Arjit Soni",
  "Prachi Dutta",
  "Naveen Kumar",
  "Faiza Shaikh",
  "Rakesh Jha",
  "Shreya Tandon",
  "Abhinav Dubey",
  "Ritika Sinha",
  "Mohit Goyal",
  "Ankita Bhosale",
  "Saurabh Thakur",
  "Deepika Nair",
  "Kunal Shah",
  "Pallavi Kulkarni",
  "Yashaswini Rao",
  "Tejas Patel",
  "Swati Mishra",
  "Vinayaka Rao",
  "Harshita Jain",
  "Omkar Deshpande",
  "Neelam Yadav",
  "Sameer Khan",
  "Bhavana Reddy",
  "Gaurangi Joshi",
  "Manish Tiwari",
  "Rhea Castelino",
  "Aakash Chauhan",
  "Simran Kaur",
  "Lokesh Nambiar",
  "Disha Malhotra",
  "Pratik Gadgil",
  "Ishita Basu",
  "Reva Menon",
  "Niraj Sinha",
  "Vidya Iyer",
  "Parth Shah",
  "Madhuri Wagh",
  "Ayan Mukherjee",
];

const companyNames = [
  "Razorpay",
  "Freshworks",
  "Zoho Corp",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Paytm",
  "Myntra",
  "HCL Technologies",
  "Wipro",
  "Infosys",
  "TCS",
  "Kotak Mahindra",
  "ICICI Bank",
  "Bajaj Finserv",
  "Mahindra & Mahindra",
  "Godrej Industries",
  "Larsen & Toubro",
  "Asian Paints",
  "Cipla",
  "Sun Pharmaceutical",
  "Marico",
  "Dabur India",
  "Titan Company",
  "Aditya Birla Group",
  "Reliance Retail",
  "Ola Cabs",
  "Uber India",
  "Carseatlane",
  "Urban Company",
  "Zepto",
  "Blinkit",
];

const rolesByDepartment: Record<Department, string[]> = {
  Engineering: [
    "Frontend Engineer",
    "Backend Engineer",
    "Platform Engineer",
    "Engineering Manager",
    "QA Engineer",
    "Data Engineer",
  ],
  Sales: [
    "Account Executive",
    "Sales Manager",
    "Solutions Consultant",
    "Business Development Lead",
    "Sales Analyst",
  ],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager", "Treasury Analyst", "FP&A Lead"],
  "Human Resources": [
    "Talent Partner",
    "HR Business Partner",
    "Recruiter",
    "People Ops Lead",
    "HR Generalist",
  ],
  Operations: [
    "Operations Manager",
    "Project Manager",
    "Program Lead",
    "Delivery Associate",
    "Process Analyst",
  ],
  Marketing: [
    "Growth Manager",
    "Content Strategist",
    "Performance Marketer",
    "Brand Lead",
    "Marketing Analyst",
  ],
};

const locations = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi NCR", "Chennai", "Remote"];

const candidates: Candidate[] = candidateNames.slice(0, 40).map((name, index) => {
  let stage: CandidateStage;
  if (index < 11) stage = "Hired";
  else if (index < 15) stage = "Offer";
  else if (index < 20) stage = "Selected";
  else if (index < 27) stage = "Interview";
  else if (index < 33) stage = "Screening";
  else if (index < 37) stage = "Applied";
  else stage = "Rejected";

  const stale = index >= 15 && index < 21;
  const daysAgo = stale ? between(6, 12) : between(0, 5);
  const department = pick(departments);

  return {
    id: `CAN-${1001 + index}`,
    name,
    position: pick(rolesByDepartment[department]),
    department,
    stage,
    source: pick([
      "LinkedIn",
      "Employee referral",
      "Careers page",
      "Naukri",
      "Instahyre",
      "Campus hiring",
    ]),
    recruiter: pick(["Priya Sharma", "Rahul Menon", "Ananya Iyer", "Vikram Rao"]),
    lastContact: shiftDate(-daysAgo),
    updatedAt: shiftDate(-Math.max(0, daysAgo - 1)),
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    phone: `+91 9${between(1000, 9999)} ${between(100000, 999999)}`,
    expectedPackage: between(800000, 2400000),
    communication: [
      { date: shiftDate(-daysAgo), channel: "Email", subject: `Discussion round — ${stage}` },
      { date: shiftDate(-(daysAgo + 7)), channel: "Call", subject: "Initial screening call" },
    ],
  };
});

const employees: Employee[] = employeeNames.slice(0, 30).map((name, index) => {
  const department = departments[index % departments.length]!;
  const joinedThisMonth = index < 3;
  return {
    id: `EMP-${2026}-${100 + index}`,
    name,
    employeeId: `AE${String(1042 + index).padStart(4, "0")}`,
    department,
    role: pick(rolesByDepartment[department]),
    joiningDate: joinedThisMonth ? shiftDate(-between(1, 18)) : shiftDate(-between(40, 1400)),
    status: index === 27 ? "On leave" : index === 28 ? "Inactive" : "Active",
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@aethertech.in`,
    phone: `+91 9${between(1000, 9999)} ${between(100000, 999999)}`,
    manager: index < 5 ? "Alex Morgan" : employeeNames[index % 5]!,
    salary: between(650000, 2600000),
    location: pick(locations),
  };
});

const offerStatuses: Offer["status"][] = [
  "Awaiting approval",
  "Awaiting approval",
  "Awaiting approval",
  "Accepted",
  "Accepted",
  "Accepted",
  "Accepted",
  "Accepted",
  "Accepted",
  "Sent",
  "Sent",
  "Draft",
];

const offers: Offer[] = offerStatuses.map((status, index) => {
  const candidate = candidates[index]!;
  return {
    id: `OFF-${200 + index}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    position: candidate.position,
    package: between(1100000, 2800000),
    offerDate: shiftDate(-between(2, 20)),
    status,
    recruiter: candidate.recruiter,
  };
});

const interviews: Interview[] = Array.from({ length: 15 }, (_, index) => {
  const candidate = candidates[20 + (index % 16)]!;
  return {
    id: `INT-${300 + index}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    interviewer: pick(["Priya Sharma", "Rahul Menon", "Ananya Iyer", "Vikram Rao", "Alex Morgan"]),
    date: shiftDate(between(1, 9)),
    time: pick(["10:00", "11:30", "14:00", "15:30", "17:00"]),
    type: pick(["Technical", "Cultural", "Managerial", "Screening"] as const),
    status: index < 13 ? "Scheduled" : "Completed",
  };
});

const rawLeadValues = Array.from({ length: 30 }, () => between(120000, 900000));
const leadValues = distributeExact(12_400_000, rawLeadValues);

const leadStages: LeadStage[] = [
  ...Array<LeadStage>(6).fill("Proposal"),
  ...Array<LeadStage>(6).fill("Qualified"),
  ...Array<LeadStage>(5).fill("Contacted"),
  ...Array<LeadStage>(5).fill("New"),
  ...Array<LeadStage>(4).fill("Negotiation"),
  ...Array<LeadStage>(2).fill("Won"),
  ...Array<LeadStage>(2).fill("Lost"),
];

const leads: Lead[] = leadValues.map((value, index) => {
  const stale = index < 6;
  const daysAgo = stale ? between(6, 14) : between(0, 4);
  const name = candidateNames[40 + index] ?? employeeNames[index]!;
  return {
    id: `LEAD-${400 + index}`,
    name,
    company: companyNames[index % companyNames.length]!,
    source: pick(["Website", "Referral", "LinkedIn", "Conference", "Outbound", "Partner"]),
    value,
    stage: leadStages[index]!,
    owner: pick(["Rahul Menon", "Vikram Rao", "Sneha Kulkarni", "Arjun Nair", "Meera Iyer"]),
    lastContact: shiftDate(-daysAgo),
    nextFollowUp: shiftDate(daysAgo > 5 ? 0 : between(1, 6)),
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    phone: `+91 9${between(1000, 9999)} ${between(100000, 999999)}`,
    notes: stale
      ? "No response after last proposal. Needs a follow-up."
      : "Active conversation in progress.",
  };
});

const customers: Customer[] = Array.from({ length: 12 }, (_, index) => ({
  id: `CUS-${500 + index}`,
  company: companyNames[index]!,
  contactName: employeeNames[index + 5]!,
  industry: pick([
    "Financial services",
    "SaaS",
    "E-commerce",
    "Healthcare",
    "Manufacturing",
    "Media",
  ]),
  value: between(1200000, 9500000),
  since: shiftDate(-between(200, 1800)),
  owner: pick(["Rahul Menon", "Vikram Rao", "Sneha Kulkarni"]),
  status: index === 9 ? "At risk" : index === 10 ? "Churned" : "Active",
}));

const incomeCategories = [
  "Product sales",
  "Subscription",
  "Implementation",
  "Renewal",
  "Consulting",
];
const expenseCategories = [
  "Payroll",
  "Cloud infrastructure",
  "Paid media",
  "Software licences",
  "Travel",
  "Office expenses",
  "Professional fees",
];
const incomeValues = distributeExact(
  4_280_000,
  Array.from({ length: 18 }, () => between(60, 140)),
);
const expenseValues = distributeExact(
  2_610_000,
  Array.from({ length: 32 }, () => between(40, 160)),
);

const transactions: Transaction[] = [
  ...incomeValues.map((amount, index) => ({
    id: `TXN-${600 + index}`,
    date: shiftDate(-(index % 21)),
    description: `${pick(incomeCategories)} — ${pick(companyNames)}`,
    category: pick(incomeCategories),
    department: "Sales" as Department,
    amount,
    type: "Income" as const,
    status: index === 17 ? ("Pending" as const) : ("Completed" as const),
    reference: `INV-${2026001 + index}`,
  })),
  ...expenseValues.map((amount, index) => ({
    id: `TXN-${700 + index}`,
    date: shiftDate(-(index % 21)),
    description: `${pick(expenseCategories)} — November 2026`,
    category: pick(expenseCategories),
    department: pick(departments),
    amount,
    type: "Expense" as const,
    status: index === 30 ? ("Failed" as const) : ("Completed" as const),
    reference: `EXP-2026-${800 + index}`,
  })),
];

const invoiceStatuses: Invoice["status"][] = [
  "Paid",
  "Paid",
  "Paid",
  "Paid",
  "Paid",
  "Paid",
  "Sent",
  "Sent",
  "Sent",
  "Sent",
  "Sent",
  "Overdue",
  "Overdue",
  "Draft",
  "Draft",
];

const invoices: Invoice[] = invoiceStatuses.map((status, index) => ({
  id: `INV-REC-${index}`,
  number: `INV-2026-${String(81 + index).padStart(3, "0")}`,
  client: companyNames[(index + 3) % companyNames.length]!,
  amount: between(85000, 640000),
  issueDate: shiftDate(-between(8, 45)),
  dueDate: status === "Overdue" ? shiftDate(-between(1, 12)) : shiftDate(between(2, 30)),
  status,
  department: "Finance",
}));

const projectSeeds: {
  name: string;
  status: Project["status"];
  progress: number;
  department: Department;
}[] = [
  { name: "ERP platform rollout", status: "On track", progress: 72, department: "Engineering" },
  { name: "Q4 revenue operations", status: "At risk", progress: 48, department: "Finance" },
  { name: "Website redesign", status: "Delayed", progress: 35, department: "Marketing" },
  { name: "Enterprise onboarding v2", status: "On track", progress: 64, department: "Operations" },
  {
    name: "Candidate portal launch",
    status: "Delayed",
    progress: 41,
    department: "Human Resources",
  },
  { name: "Data warehouse migration", status: "At risk", progress: 55, department: "Engineering" },
  { name: "Partner channel expansion", status: "On track", progress: 80, department: "Sales" },
  { name: "Mobile app beta", status: "On track", progress: 68, department: "Engineering" },
  { name: "Vendor consolidation", status: "Completed", progress: 100, department: "Operations" },
  { name: "Brand refresh", status: "Completed", progress: 100, department: "Marketing" },
];

const projects: Project[] = projectSeeds.map((project, index) => ({
  id: `PRJ-${800 + index}`,
  name: project.name,
  owner: employeeNames[index % employeeNames.length]!,
  team: [
    employeeNames[(index + 1) % 20]!,
    employeeNames[(index + 2) % 20]!,
    employeeNames[(index + 3) % 20]!,
  ],
  progress: project.progress,
  deadline: shiftDate(project.status === "Delayed" ? -between(2, 10) : between(3, 45)),
  status: project.status,
  department: project.department,
  budget: between(800000, 5000000),
  description: `${project.name} — tracked across ${project.department} with weekly check-ins.`,
}));

const taskTitles = [
  "Close November books",
  "Review interview feedback",
  "Send Atlas proposal",
  "Refresh Q4 forecast",
  "Fix payroll approval queue",
  "Update vendor contracts",
  "Publish campaign retrospective",
  "Reconcile outstanding invoices",
  "Onboard new engineering hires",
  "Finalise security review",
  "Prepare board deck",
  "Follow up with stale leads",
  "Update product roadmap",
  "Approve office budget",
  "Run candidate satisfaction survey",
  "Migrate legacy CRM data",
  "Draft partnership agreement",
  "Review design system tokens",
  "Schedule performance reviews",
  "Audit access permissions",
  "Optimise landing page funnel",
  "Resolve overdue invoices",
  "Plan team offsite",
  "Update SOP document",
  "Analyse campaign CAC",
  "Prepare payroll run",
  "Review support tickets",
  "Renew software licences",
  "Send offer letters",
  "Validate financial model",
  "Create onboarding checklist",
  "Track project milestones",
  "Update lead scoring rules",
  "Approve travel expenses",
  "Publish monthly newsletter",
  "Clean up duplicate candidates",
  "Review retention risk",
  "Finalise hiring plan",
  "Update budget forecast",
  "Reconcile bank statements",
  "Prepare investor update",
  "Check project dependencies",
  "Archive completed contracts",
  "Review marketing spend",
  "Confirm interview panels",
  "Update employee directory",
  "Run retrospective workshop",
  "Approve leave requests",
  "Verify invoice approvals",
  "Confirm project handover",
];

const tasks: Task[] = taskTitles.map((title, index) => {
  const overdue = index < 12;
  const project = projects[index % projects.length]!;
  return {
    id: `TSK-${900 + index}`,
    title,
    projectId: project.id,
    projectName: project.name,
    assignee: employeeNames[index % employeeNames.length]!,
    priority: overdue
      ? index < 4
        ? "High"
        : index < 8
          ? "Medium"
          : "Low"
      : index % 3 === 0
        ? "High"
        : index % 3 === 1
          ? "Medium"
          : "Low",
    status: overdue
      ? index % 2 === 0
        ? "Open"
        : "In progress"
      : index % 7 === 0
        ? "Completed"
        : "Open",
    dueDate: overdue ? shiftDate(-between(1, 9)) : shiftDate(between(0, 24)),
    department: project.department,
    description: `${title} — tracked as part of ${project.name}.`,
  };
});

const campaignSeeds: {
  name: string;
  channel: string;
  budget: number;
  spend: number;
  leads: number;
  conversions: number;
  status: Campaign["status"];
}[] = [
  {
    name: "Enterprise inbound Q4",
    channel: "Google Ads",
    budget: 900000,
    spend: 842000,
    leads: 186,
    conversions: 34,
    status: "Active",
  },
  {
    name: "LinkedIn ABM — BFSI",
    channel: "LinkedIn",
    budget: 750000,
    spend: 718000,
    leads: 112,
    conversions: 29,
    status: "Active",
  },
  {
    name: "Product launch webinar",
    channel: "Webinar",
    budget: 350000,
    spend: 312000,
    leads: 241,
    conversions: 21,
    status: "Completed",
  },
  {
    name: "Retargeting — pricing page",
    channel: "Display",
    budget: 420000,
    spend: 388000,
    leads: 154,
    conversions: 18,
    status: "Active",
  },
  {
    name: "Content SEO sprint",
    channel: "Organic",
    budget: 280000,
    spend: 246000,
    leads: 320,
    conversions: 26,
    status: "Active",
  },
  {
    name: "Referral programme",
    channel: "Referral",
    budget: 200000,
    spend: 164000,
    leads: 98,
    conversions: 19,
    status: "Active",
  },
  {
    name: "Diwali seasonal offer",
    channel: "Email",
    budget: 180000,
    spend: 176000,
    leads: 210,
    conversions: 12,
    status: "Paused",
  },
  {
    name: "Partner co-marketing",
    channel: "Partner",
    budget: 300000,
    spend: 224000,
    leads: 74,
    conversions: 14,
    status: "Completed",
  },
];

const campaigns: Campaign[] = campaignSeeds.map((campaign, index) => ({
  id: `CAM-${1000 + index}`,
  name: campaign.name,
  channel: campaign.channel,
  budget: campaign.budget,
  spend: campaign.spend,
  leads: campaign.leads,
  conversions: campaign.conversions,
  status: campaign.status,
  startDate: shiftDate(-between(20, 70)),
  endDate: shiftDate(between(5, 45)),
  owner: pick(["Meera Iyer", "Zoya Ansari", "Sneha Kulkarni"]),
}));

const auditTypes: AuditEvent["type"][] = [
  "AI action",
  "Employee update",
  "Lead change",
  "Financial action",
  "Task creation",
  "Email activity",
];

const auditEvents: AuditEvent[] = Array.from({ length: 20 }, (_, index) => {
  const type = auditTypes[index % auditTypes.length]!;
  const isAi = type === "AI action";
  return {
    id: `AUD-${1100 + index}`,
    activity: {
      "AI action": "AI agent analysed company health",
      "Employee update": "Employee profile updated",
      "Lead change": "Lead stage moved to Qualified",
      "Financial action": "Invoice approved",
      "Task creation": "Follow-up task created",
      "Email activity": "Follow-up email sent",
    }[type]!,
    user: isAi ? "NEXUS Intelligence" : pick(employeeNames.slice(0, 10)),
    department: isAi ? "AI" : pick(departments),
    entity: pick(["Company", "EMP-2026-104", "LEAD-402", "INV-2026-081", "TSK-904", "CAN-1004"]),
    timestamp: new Date(BASE_DATE.getTime() - index * 3 * 3600_000).toISOString(),
    status: isAi ? "Success" : index % 9 === 0 ? "Pending" : "Success",
    type,
    metadata: isAi
      ? {
          requestedAction: "Analyse cross-department performance",
          approvalStatus: "Approved",
          executedTool: "getCompanyOverview",
          result: "Report generated with 4 KPIs and 3 risks",
        }
      : { result: "Record updated successfully" },
  };
});

const monthlyFinance: MonthlyFinance[] = [
  { month: "Jun", revenue: 3_210_000, expenses: 2_180_000 },
  { month: "Jul", revenue: 3_480_000, expenses: 2_240_000 },
  { month: "Aug", revenue: 3_360_000, expenses: 2_310_000 },
  { month: "Sep", revenue: 3_720_000, expenses: 2_390_000 },
  { month: "Oct", revenue: 3_948_000, expenses: 2_505_000 },
  { month: "Nov", revenue: 4_280_000, expenses: 2_610_000 },
];

const metrics: CompanyMetrics = {
  totalEmployees: 248,
  newEmployeesThisMonth: 12,
  monthlyRevenue: 4_280_000,
  revenueGrowth: 8.4,
  activeDeals: 86,
  pipelineValue: 12_400_000,
  openPositions: 18,
  pipelineCandidates: 40,
  overdueTasks: 12,
  highPriorityOverdue: 4,
};

const departmentPerformance = [
  { department: "Human Resources" as Department, score: 92 },
  { department: "Sales" as Department, score: 84 },
  { department: "Finance" as Department, score: 96 },
  { department: "Operations" as Department, score: 78 },
  { department: "Marketing" as Department, score: 88 },
];

export const seedData: SeedData = {
  today: TODAY,
  employees,
  candidates,
  interviews,
  offers,
  leads,
  customers,
  transactions,
  invoices,
  projects,
  tasks,
  campaigns,
  auditEvents,
  monthlyFinance,
  metrics,
  departmentPerformance,
};

export { dateWithOffset };
