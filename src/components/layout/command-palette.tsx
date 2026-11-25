"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Megaphone,
  Search,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  Workflow,
  ListTodo,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { allNavigation } from "@/components/layout/navigation";
import { useApp } from "@/store/app-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { state } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function go(href: string, id?: string) {
    router.push(id ? `${href}?open=${encodeURIComponent(id)}` : href);
    onOpenChange(false);
  }

  const data = state.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Search NEXUS</DialogTitle>
        <Command
          label="Global search"
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search employees, leads, tasks, invoices..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages">
              {allNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.keywords ?? ""}`}
                    onSelect={() => go(item.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Page</span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            <Command.Group heading="Employees">
              {data.employees.map((employee) => (
                <Command.Item
                  key={employee.id}
                  value={`${employee.name} ${employee.role} ${employee.department}`}
                  onSelect={() => go("/hr", employee.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <UserRound className="size-4 text-muted-foreground" />
                  <span>{employee.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{employee.role}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Candidates">
              {data.candidates.map((candidate) => (
                <Command.Item
                  key={candidate.id}
                  value={`${candidate.name} ${candidate.position} ${candidate.stage}`}
                  onSelect={() => go("/hr", candidate.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <Users className="size-4 text-muted-foreground" />
                  <span>{candidate.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{candidate.stage}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Leads">
              {data.leads.map((lead) => (
                <Command.Item
                  key={lead.id}
                  value={`${lead.name} ${lead.company} ${lead.stage}`}
                  onSelect={() => go("/sales", lead.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <BriefcaseBusiness className="size-4 text-muted-foreground" />
                  <span>{lead.company}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{lead.stage}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Tasks">
              {data.tasks.map((task) => (
                <Command.Item
                  key={task.id}
                  value={`${task.title} ${task.projectName} ${task.department}`}
                  onSelect={() => go("/tasks", task.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <ListTodo className="size-4 text-muted-foreground" />
                  <span>{task.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{task.assignee}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Projects">
              {data.projects.map((project) => (
                <Command.Item
                  key={project.id}
                  value={`${project.name} ${project.department} ${project.status}`}
                  onSelect={() => go("/operations", project.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <Workflow className="size-4 text-muted-foreground" />
                  <span>{project.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{project.status}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Invoices">
              {data.invoices.map((invoice) => (
                <Command.Item
                  key={invoice.id}
                  value={`${invoice.number} ${invoice.client} ${invoice.status}`}
                  onSelect={() => go("/finance", invoice.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <Wallet className="size-4 text-muted-foreground" />
                  <span>{invoice.number}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{invoice.client}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Campaigns">
              {data.campaigns.map((campaign) => (
                <Command.Item
                  key={campaign.id}
                  value={`${campaign.name} ${campaign.channel}`}
                  onSelect={() => go("/marketing", campaign.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <Megaphone className="size-4 text-muted-foreground" />
                  <span>{campaign.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{campaign.channel}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="AI">
              <Command.Item
                value="ask ai intelligence agent assistant"
                onSelect={() => go("/ai")}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <Sparkles className="size-4 text-ai" />
                <span>Open AI Intelligence</span>
              </Command.Item>
              <Command.Item
                value="reports generate ai report"
                onSelect={() => go("/reports")}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <FileText className="size-4 text-muted-foreground" />
                <span>Generate a report</span>
              </Command.Item>
              <Command.Item
                value="dashboard overview"
                onSelect={() => go("/dashboard")}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <LayoutDashboard className="size-4 text-muted-foreground" />
                <span>Company overview</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
