import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CircleHelp,
  FileBarChart,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Settings2,
  Sparkles,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
}

export const mainNavigation: NavigationItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, keywords: "home kpi metrics" },
  { label: "AI Intelligence", href: "/ai", icon: Sparkles, keywords: "assistant agent chat" },
  { label: "My Tasks", href: "/tasks", icon: ListTodo, keywords: "todo work" },
  { label: "Reports", href: "/reports", icon: FileBarChart, keywords: "analytics documents" },
];

export const departmentNavigation: NavigationItem[] = [
  {
    label: "HR & Recruitment",
    href: "/hr",
    icon: Users,
    keywords: "people candidates hiring employees offers",
  },
  {
    label: "Finance",
    href: "/finance",
    icon: Wallet,
    keywords: "invoices revenue expenses transactions",
  },
  {
    label: "Sales & CRM",
    href: "/sales",
    icon: BriefcaseBusiness,
    keywords: "leads pipeline customers deals",
  },
  { label: "Operations", href: "/operations", icon: Workflow, keywords: "projects tasks delivery" },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    keywords: "campaigns acquisition ads",
  },
];

export const workspaceNavigation: NavigationItem[] = [
  {
    label: "Activity & Audit",
    href: "/activity",
    icon: Activity,
    keywords: "logs history approvals",
  },
  { label: "Settings", href: "/settings", icon: Settings2, keywords: "preferences company roles" },
];

export const allNavigation = [...mainNavigation, ...departmentNavigation, ...workspaceNavigation];

export const supportNavigation: NavigationItem[] = [
  { label: "Help & documentation", href: "/settings", icon: CircleHelp },
  { label: "Insights", href: "/reports", icon: BarChart3 },
];
