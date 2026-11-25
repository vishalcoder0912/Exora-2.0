"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Megaphone, Plus, Target, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { CampaignDialog } from "@/components/marketing/campaign-dialog";
import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadCsv,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatNumber,
  initials,
} from "@/lib/format";
import { useApp } from "@/store/app-store";
import type { Campaign } from "@/types";

const MONTH_LABELS = [
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

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 11,
  boxShadow: "0 8px 24px rgb(0 0 0 / 0.08)",
};

const axisStyle = { fill: "var(--muted-foreground)", fontSize: 10 };

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function shortName(name: string): string {
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

export function MarketingWorkspace() {
  const { state, dispatch } = useApp();
  const { campaigns, leads: crmLeads } = state.data;
  const [tab, setTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);

  const totalSpend = useMemo(() => sum(campaigns.map((item) => item.spend)), [campaigns]);
  const totalBudget = useMemo(() => sum(campaigns.map((item) => item.budget)), [campaigns]);
  const totalLeads = useMemo(() => sum(campaigns.map((item) => item.leads)), [campaigns]);
  const totalConversions = useMemo(
    () => sum(campaigns.map((item) => item.conversions)),
    [campaigns],
  );
  const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

  const monthly = useMemo(() => {
    const grouped = new Map<string, Campaign[]>();
    for (const campaign of campaigns) {
      const key = campaign.startDate.slice(0, 7);
      grouped.set(key, [...(grouped.get(key) ?? []), campaign]);
    }
    return [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-6)
      .map(([key, items]) => {
        const [year, month] = key.split("-");
        return {
          month: `${MONTH_LABELS[Number(month) - 1] ?? month} ${year?.slice(2) ?? ""}`.trim(),
          leads: sum(items.map((item) => item.leads)),
          conversions: sum(items.map((item) => item.conversions)),
          spend: sum(items.map((item) => item.spend)),
        };
      });
  }, [campaigns]);

  const channelPerformance = useMemo(() => {
    const grouped = new Map<string, Campaign[]>();
    for (const campaign of campaigns) {
      grouped.set(campaign.channel, [...(grouped.get(campaign.channel) ?? []), campaign]);
    }
    return [...grouped.entries()]
      .map(([channel, items]) => ({
        channel,
        count: items.length,
        spend: sum(items.map((item) => item.spend)),
        leads: sum(items.map((item) => item.leads)),
        conversions: sum(items.map((item) => item.conversions)),
      }))
      .sort((left, right) => right.spend - left.spend);
  }, [campaigns]);

  const conversionSeries = useMemo(
    () =>
      campaigns.map((campaign) => ({
        name: shortName(campaign.name),
        conversions: campaign.conversions,
        rate:
          campaign.leads > 0
            ? Number(((campaign.conversions / campaign.leads) * 100).toFixed(1))
            : 0,
      })),
    [campaigns],
  );

  const spendSeries = useMemo(
    () =>
      [...campaigns]
        .sort((left, right) => right.spend - left.spend)
        .map((campaign) => ({ name: shortName(campaign.name), spend: campaign.spend })),
    [campaigns],
  );

  const channelOptions = useMemo(
    () =>
      [...new Set(campaigns.map((campaign) => campaign.channel))].map((value) => ({
        label: value,
        value,
      })),
    [campaigns],
  );

  const statusOptions = useMemo(
    () =>
      [...new Set(campaigns.map((campaign) => campaign.status))].map((value) => ({
        label: value,
        value,
      })),
    [campaigns],
  );

  const columns = useMemo<DataTableColumn<Campaign>[]>(
    () => [
      {
        key: "name",
        header: "Campaign",
        sortValue: (row) => row.name,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.name}</p>
            <p className="text-[11px] text-muted-foreground">{row.id}</p>
          </div>
        ),
      },
      {
        key: "channel",
        header: "Channel",
        sortValue: (row) => row.channel,
        cell: (row) => <span className="text-muted-foreground">{row.channel}</span>,
      },
      {
        key: "budget",
        header: "Budget",
        sortValue: (row) => row.budget,
        cell: (row) => <span className="tabular-nums">{formatCompactCurrency(row.budget)}</span>,
      },
      {
        key: "spend",
        header: "Spend",
        sortValue: (row) => row.spend,
        cell: (row) => (
          <span className="font-medium tabular-nums">{formatCompactCurrency(row.spend)}</span>
        ),
      },
      {
        key: "leads",
        header: "Leads",
        sortValue: (row) => row.leads,
        cell: (row) => <span className="tabular-nums">{formatNumber(row.leads)}</span>,
      },
      {
        key: "conversions",
        header: "Conversions",
        sortValue: (row) => row.conversions,
        cell: (row) => <span className="tabular-nums">{formatNumber(row.conversions)}</span>,
      },
      {
        key: "cpl",
        header: "Cost / lead",
        sortValue: (row) => (row.leads > 0 ? row.spend / row.leads : 0),
        cell: (row) => (
          <span className="tabular-nums">
            {row.leads > 0 ? formatCurrency(Math.round(row.spend / row.leads)) : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [],
  );

  const filters = useMemo<DataTableFilter<Campaign>[]>(
    () => [
      {
        key: "channel",
        label: "channels",
        options: channelOptions,
        predicate: (row, value) => row.channel === value,
      },
      {
        key: "status",
        label: "statuses",
        options: statusOptions,
        predicate: (row, value) => row.status === value,
      },
    ],
    [channelOptions, statusOptions],
  );

  function exportCsv() {
    downloadCsv("nexus-campaigns-2026-11-22.csv", [
      ...campaigns.map((campaign) => ({
        id: campaign.id,
        campaign: campaign.name,
        channel: campaign.channel,
        budget: campaign.budget,
        spend: campaign.spend,
        leads: campaign.leads,
        conversions: campaign.conversions,
        costPerLead: campaign.leads > 0 ? Math.round(campaign.spend / campaign.leads) : 0,
        conversionRate:
          campaign.leads > 0
            ? Number(((campaign.conversions / campaign.leads) * 100).toFixed(1))
            : 0,
        status: campaign.status,
        owner: campaign.owner,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      })),
    ]);
    toast.success("Campaign export downloaded", {
      description: `${campaigns.length} campaigns exported to CSV.`,
    });
  }

  function handleCreate(campaign: Campaign) {
    dispatch({ type: "ADD_CAMPAIGN", payload: campaign });
    toast.success("Campaign created", {
      description: `${campaign.name} is now in your campaign register.`,
    });
  }

  const selectedUtilisation =
    selected && selected.budget > 0 ? (selected.spend / selected.budget) * 100 : 0;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Marketing"
        subtitle="Measure campaigns, understand acquisition, and improve performance."
        badge={`${campaigns.length} campaigns`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus /> Create campaign
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total spend"
          value={formatCompactCurrency(totalSpend)}
          note={`${formatCompactCurrency(totalBudget)} allocated across ${campaigns.length} campaigns`}
          icon={Megaphone}
          tone="primary"
        />
        <StatCard
          label="Leads generated"
          value={formatNumber(totalLeads)}
          note={`${formatNumber(crmLeads.length)} leads currently tracked in CRM`}
          icon={Users}
          tone="ai"
        />
        <StatCard
          label="Conversions"
          value={formatNumber(totalConversions)}
          note={`${conversionRate.toFixed(1)}% lead-to-conversion rate`}
          icon={Target}
          tone="positive"
        />
        <StatCard
          label="Avg. cost per lead"
          value={formatCurrency(Math.round(costPerLead))}
          note="Blended spend divided by campaign leads"
          icon={TrendingUp}
          tone="warning"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Leads by month"
              description="Leads attributed to campaigns by their start month"
              action={
                <span className="text-[11px] text-muted-foreground">
                  Last {monthly.length} months
                </span>
              }
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#leadsFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard
              title="Campaign spend"
              description="Spend to date by campaign"
              action={<span className="text-[11px] text-muted-foreground">INR</span>}
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendSeries} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={axisStyle}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={58}
                    />
                    <YAxis
                      tick={axisStyle}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => formatCompactCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatCompactCurrency(Number(value))}
                    />
                    <Bar dataKey="spend" name="Spend" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Channel mix" description="Where the marketing budget is going">
              <div className="space-y-3">
                {channelPerformance.map((channel) => (
                  <div key={channel.channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{channel.channel}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatCompactCurrency(channel.spend)} · {formatNumber(channel.leads)} leads
                      </span>
                    </div>
                    <Progress
                      value={totalSpend > 0 ? (channel.spend / totalSpend) * 100 : 0}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Efficiency snapshot" description="Blended acquisition metrics">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Budget utilisation</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : "0.0"}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Conversion rate</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Active campaigns</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {campaigns.filter((campaign) => campaign.status === "Active").length}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Channels in use</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {channelPerformance.length}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <SectionCard
            title="Campaign register"
            description="Search, filter, and open a campaign for performance details."
            action={
              <span className="text-[11px] text-muted-foreground">Click a row for details</span>
            }
          >
            <DataTable
              data={campaigns}
              columns={columns}
              rowKey={(row) => row.id}
              searchText={(row) => [row.name, row.channel, row.status, row.owner, row.id]}
              filters={filters}
              searchPlaceholder="Search campaigns..."
              pageSize={8}
              onRowClick={setSelected}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <SectionCard
            title="Conversion performance"
            description="Conversions by campaign with lead-to-conversion rate"
            action={<span className="text-[11px] text-muted-foreground">Rate shown as %</span>}
          >
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={conversionSeries}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={axisStyle}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={58}
                  />
                  <YAxis yAxisId="left" tick={axisStyle} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={axisStyle}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) =>
                      name === "Conversion rate" ? `${value}%` : formatNumber(Number(value))
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="conversions"
                    name="Conversions"
                    fill="var(--chart-3)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    name="Conversion rate"
                    stroke="var(--chart-5)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Channel economics"
            description="Spend, lead volume, and cost per lead by channel"
          >
            <div className="overflow-x-auto rounded-lg border border-border">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-border bg-muted/40 px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                  <span>Channel</span>
                  <span className="text-right">Campaigns</span>
                  <span className="text-right">Spend</span>
                  <span className="text-right">Leads</span>
                  <span className="text-right">Cost / lead</span>
                </div>
                {channelPerformance.map((channel) => (
                  <div
                    key={channel.channel}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr] border-b border-border px-3 py-2 text-xs last:border-b-0"
                  >
                    <span className="font-medium">{channel.channel}</span>
                    <span className="text-right tabular-nums">{channel.count}</span>
                    <span className="text-right tabular-nums">
                      {formatCompactCurrency(channel.spend)}
                    </span>
                    <span className="text-right tabular-nums">{formatNumber(channel.leads)}</span>
                    <span className="text-right tabular-nums">
                      {channel.leads > 0
                        ? formatCurrency(Math.round(channel.spend / channel.leads))
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <CampaignDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        today={state.data.today}
        onCreate={handleCreate}
      />

      <DetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name ?? "Campaign"}
        description={selected ? `${selected.id} · ${selected.channel}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} />
              <span className="text-xs text-muted-foreground">
                {formatDate(selected.startDate)} — {formatDate(selected.endDate)}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-[11px] text-primary">
                  {initials(selected.owner)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium">{selected.owner}</p>
                <p className="text-[11px] text-muted-foreground">Campaign owner</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Budget</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(selected.budget)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Spend</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatCurrency(selected.spend)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Leads</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatNumber(selected.leads)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Conversions</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {formatNumber(selected.conversions)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Budget utilisation</span>
                <span className="tabular-nums text-muted-foreground">
                  {selectedUtilisation.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(100, selectedUtilisation)} />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="text-[11px] text-muted-foreground">Cost per lead</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {selected.leads > 0
                    ? formatCurrency(Math.round(selected.spend / selected.leads))
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Conversion rate</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {selected.leads > 0
                    ? `${((selected.conversions / selected.leads) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </DetailSheet>
    </main>
  );
}
