"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, CalendarClock, Target, TrendingUp } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { LEAD_STAGES } from "@/components/sales/lead-kanban";
import { formatCompactCurrency, initials, relativeDate } from "@/lib/format";
import type { Lead, LeadStage } from "@/types";

interface SalesOverviewProps {
  leads: Lead[];
  pipelineValue: number;
  today: string;
  onOpenLead: (lead: Lead) => void;
}

const STAGE_COLORS = [
  "var(--chart-5)",
  "var(--informational)",
  "var(--chart-1)",
  "var(--ai)",
  "var(--chart-4)",
  "var(--positive)",
  "var(--critical)",
];

export function SalesOverview({ leads, pipelineValue, today, onOpenLead }: SalesOverviewProps) {
  const qualifiedCount = leads.filter((lead) =>
    (["Qualified", "Proposal", "Negotiation", "Won"] as LeadStage[]).includes(lead.stage),
  ).length;
  const wonCount = leads.filter((lead) => lead.stage === "Won").length;
  const conversionRate = leads.length === 0 ? 0 : (wonCount / leads.length) * 100;
  const activeLeads = leads.filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost");

  const funnelData = LEAD_STAGES.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stage === stage).length,
    value: leads.filter((lead) => lead.stage === stage).reduce((sum, lead) => sum + lead.value, 0),
  }));

  const upcoming = [...activeLeads]
    .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total leads"
          value={String(leads.length)}
          note={`${activeLeads.length} active opportunities`}
          icon={Target}
          tone="primary"
        />
        <StatCard
          label="Qualified leads"
          value={String(qualifiedCount)}
          note={`${Math.round((qualifiedCount / Math.max(leads.length, 1)) * 100)}% of the database`}
          icon={TrendingUp}
          tone="ai"
        />
        <StatCard
          label="Open pipeline value"
          value={formatCompactCurrency(pipelineValue)}
          note="Across all active stages"
          icon={ArrowUpRight}
          tone="warning"
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate.toFixed(1)}%`}
          note={`${wonCount} of ${leads.length} leads won`}
          icon={Target}
          tone="positive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          title="Pipeline by stage"
          description="Lead volume across the sales funnel"
          className="lg:col-span-3"
          action={
            <StatusBadge status="Live" className="border-primary/20 bg-primary/10 text-primary" />
          }
        >
          <div className="h-[224px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(value, name) =>
                    name === "value"
                      ? [formatCompactCurrency(Number(value)), "Value"]
                      : [value, "Leads"]
                  }
                />
                <Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={28}>
                  {funnelData.map((entry, index) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {funnelData.slice(0, 4).map((entry) => (
              <div key={entry.stage} className="rounded-md bg-muted/60 px-2.5 py-2">
                <p className="text-[10px] font-medium text-muted-foreground">{entry.stage}</p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums">
                  {formatCompactCurrency(entry.value)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming follow-ups"
          description="Next touchpoints across active leads"
          className="lg:col-span-2"
          action={<CalendarClock className="size-4 text-muted-foreground" />}
        >
          <div className="divide-y divide-border">
            {upcoming.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onOpenLead(lead)}
                className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                  {initials(lead.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{lead.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{lead.company}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-medium tabular-nums">
                    {relativeDate(lead.nextFollowUp, today)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatCompactCurrency(lead.value)}
                  </p>
                </div>
              </button>
            ))}
            {upcoming.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No follow-ups scheduled.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
