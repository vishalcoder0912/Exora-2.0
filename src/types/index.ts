export type Department =
  "Engineering" | "Sales" | "Finance" | "Human Resources" | "Operations" | "Marketing";

export type EmployeeStatus = "Active" | "On leave" | "Inactive";

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: Department;
  role: string;
  joiningDate: string;
  status: EmployeeStatus;
  email: string;
  phone: string;
  manager: string;
  salary: number;
  location: string;
}

export type CandidateStage =
  "Applied" | "Screening" | "Interview" | "Selected" | "Offer" | "Hired" | "Rejected";

export interface CommunicationEntry {
  date: string;
  channel: "Email" | "Call" | "In-person";
  subject: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  department: Department;
  stage: CandidateStage;
  source: string;
  recruiter: string;
  lastContact: string;
  updatedAt: string;
  email: string;
  phone: string;
  expectedPackage: number;
  communication: CommunicationEntry[];
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewer: string;
  date: string;
  time: string;
  type: "Technical" | "Cultural" | "Managerial" | "Screening";
  status: "Scheduled" | "Completed" | "Cancelled";
}

export type OfferStatus = "Draft" | "Awaiting approval" | "Sent" | "Accepted" | "Declined";

export interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  package: number;
  offerDate: string;
  status: OfferStatus;
  recruiter: string;
}

export type LeadStage =
  "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

export interface Lead {
  id: string;
  name: string;
  company: string;
  source: string;
  value: number;
  stage: LeadStage;
  owner: string;
  lastContact: string;
  nextFollowUp: string;
  email: string;
  phone: string;
  notes: string;
}

export interface Customer {
  id: string;
  company: string;
  contactName: string;
  industry: string;
  value: number;
  since: string;
  owner: string;
  status: "Active" | "At risk" | "Churned";
}

export type TransactionType = "Income" | "Expense";
export type TransactionStatus = "Completed" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  department: Department;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
}

export type InvoiceStatus = "Paid" | "Sent" | "Overdue" | "Draft";

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  department: Department;
}

export type ProjectStatus = "On track" | "At risk" | "Delayed" | "Completed";

export interface Project {
  id: string;
  name: string;
  owner: string;
  team: string[];
  progress: number;
  deadline: string;
  status: ProjectStatus;
  department: Department;
  budget: number;
  description: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Open" | "In progress" | "Completed";

export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  department: Department;
  description: string;
}

export type CampaignStatus = "Active" | "Paused" | "Completed";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spend: number;
  leads: number;
  conversions: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  owner: string;
}

export interface AuditMetadata {
  requestedAction?: string;
  approvalStatus?: string;
  executedTool?: string;
  result?: string;
}

export interface AuditEvent {
  id: string;
  activity: string;
  user: string;
  department: Department | "AI";
  entity: string;
  timestamp: string;
  status: "Success" | "Pending" | "Rejected";
  type:
    | "AI action"
    | "Employee update"
    | "Lead change"
    | "Financial action"
    | "Task creation"
    | "Email activity";
  metadata: AuditMetadata;
}

export type KpiTone = "positive" | "warning" | "critical" | "info";

export interface KpiBlockItem {
  label: string;
  value: string;
  note: string;
  tone: KpiTone;
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableBlock {
  title?: string;
  columns: TableColumn[];
  rows: Record<string, string>[];
  highlight?: (row: Record<string, string>) => boolean;
}

export interface ChartPoint {
  label: string;
  values: Record<string, number>;
}

export interface InsightItem {
  tone: KpiTone;
  label: string;
  text: string;
}

export interface RiskItem {
  severity: "High" | "Medium" | "Low";
  title: string;
  reason: string;
  department: Department;
}

export type ResponseBlock =
  | { type: "text"; text: string }
  | { type: "kpis"; title?: string; items: KpiBlockItem[] }
  | { type: "table"; table: TableBlock }
  | { type: "chart"; title: string; points: ChartPoint[]; series: string[] }
  | { type: "insights"; title?: string; items: InsightItem[] }
  | { type: "risks"; title?: string; items: RiskItem[] }
  | { type: "recommendations"; title?: string; items: string[] }
  | { type: "report"; title: string; sections: { heading: string; body: string }[] };

export type ToolStatus = "pending" | "running" | "completed" | "failed";

export interface ToolCallRecord {
  id: string;
  name: string;
  department: Department | "System";
  status: ToolStatus;
  args: Record<string, string | number | boolean>;
  durationMs: number;
  result: string;
}

export interface EmailAction {
  kind: "email";
  recipients: { name: string; email: string }[];
  subject: string;
  body: string;
}

export interface TaskActionItem {
  title: string;
  assignee: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskAction {
  kind: "task";
  tasks: TaskActionItem[];
}

export type ActionProposal =
  | {
      id: string;
      type: "email";
      title: string;
      description: string;
      status: "pending" | "approved" | "rejected" | "executed";
      payload: EmailAction;
    }
  | {
      id: string;
      type: "task";
      title: string;
      description: string;
      status: "pending" | "approved" | "rejected" | "executed";
      payload: TaskAction;
    };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  blocks: ResponseBlock[];
  toolCalls: ToolCallRecord[];
  actions: ActionProposal[];
  followUps: string[];
  scenario?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  href: string;
}

export interface SettingsState {
  companyName: string;
  companyEmail: string;
  timezone: string;
  currency: string;
  aiEnabled: boolean;
  modelLabel: string;
  responseStyle: "Concise" | "Balanced" | "Detailed";
  dataScope: "All departments" | "My department" | "Executive only";
  requireApproval: boolean;
  showToolActivity: boolean;
}

export interface CompanyMetrics {
  totalEmployees: number;
  newEmployeesThisMonth: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeDeals: number;
  pipelineValue: number;
  openPositions: number;
  pipelineCandidates: number;
  overdueTasks: number;
  highPriorityOverdue: number;
}

export interface MonthlyFinance {
  month: string;
  revenue: number;
  expenses: number;
}

export interface SeedData {
  today: string;
  employees: Employee[];
  candidates: Candidate[];
  interviews: Interview[];
  offers: Offer[];
  leads: Lead[];
  customers: Customer[];
  transactions: Transaction[];
  invoices: Invoice[];
  projects: Project[];
  tasks: Task[];
  campaigns: Campaign[];
  auditEvents: AuditEvent[];
  monthlyFinance: MonthlyFinance[];
  metrics: CompanyMetrics;
  departmentPerformance: { department: Department; score: number }[];
}
