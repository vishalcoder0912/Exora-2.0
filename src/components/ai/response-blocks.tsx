"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  Info,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ResponseBlock } from "@/types";

const toneStyles = {
  positive: {
    icon: TrendingUp,
    className: "border-positive/25 bg-positive/[0.06]",
    text: "text-positive",
  },
  warning: {
    icon: CircleAlert,
    className: "border-warning/30 bg-warning/[0.07]",
    text: "text-warning",
  },
  critical: {
    icon: AlertTriangle,
    className: "border-critical/25 bg-critical/[0.06]",
    text: "text-critical",
  },
  info: { icon: Info, className: "border-primary/20 bg-primary/[0.05]", text: "text-primary" },
} as const;

const severityStyles = {
  High: "border-critical/25 bg-critical/10 text-critical",
  Medium: "border-warning/30 bg-warning/10 text-warning",
  Low: "border-primary/20 bg-primary/10 text-primary",
} as const;

function KpiBlock({ block }: { block: Extract<ResponseBlock, { type: "kpis" }> }) {
  return (
    <div className="my-4">
      {block.title && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {block.title}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {block.items.map((item, index) => {
          const style = toneStyles[item.tone] ?? toneStyles.info;
          const Icon = style.icon;
          return (
            <div
              key={`${item.label}-${index}`}
              className={cn("rounded-lg border p-3", style.className)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
                <Icon className={cn("size-3.5 shrink-0", style.text)} aria-hidden="true" />
              </div>
              <p
                className={cn("mt-2 text-lg font-semibold tracking-tight tabular-nums", style.text)}
              >
                {item.value}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{item.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableBlockView({ block }: { block: Extract<ResponseBlock, { type: "table" }> }) {
  const { table } = block;
  return (
    <div className="my-4">
      {table.title && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {table.title}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {table.columns.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap text-[11px] font-semibold">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(table.highlight?.(row) && "bg-warning/[0.06]")}
              >
                {table.columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className="whitespace-nowrap text-[11px] text-foreground/80"
                  >
                    {row[column.label] ?? row[column.key] ?? "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {table.rows.length > 8 && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Showing the first {table.rows.length} matching records.
        </p>
      )}
    </div>
  );
}

function ChartBlockView({ block }: { block: Extract<ResponseBlock, { type: "chart" }> }) {
  const data = useMemo(
    () =>
      block.points.map((point) => ({
        label: point.label,
        ...Object.fromEntries(
          block.series.map((series) => [series, Math.round(point.values[series] ?? 0)]),
        ),
      })),
    [block.points, block.series],
  );

  const colors = ["var(--chart-1)", "var(--chart-4)", "var(--chart-3)"];

  return (
    <div className="my-4 rounded-lg border border-border bg-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="size-3.5 text-muted-foreground" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {block.title}
        </p>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) =>
                value >= 10_000_000
                  ? `${(value / 10_000_000).toFixed(1)}Cr`
                  : value >= 100_000
                    ? `${(value / 100_000).toFixed(0)}L`
                    : String(value)
              }
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 11,
                background: "var(--card)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {block.series.map((series, index) => (
              <Bar
                key={series}
                dataKey={series}
                fill={colors[index % colors.length]}
                radius={[3, 3, 0, 0]}
                maxBarSize={36}
              >
                {index === 0 &&
                  data.map((entry, entryIndex) => <Cell key={entryIndex} fillOpacity={0.9} />)}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InsightsBlock({ block }: { block: Extract<ResponseBlock, { type: "insights" }> }) {
  return (
    <div className="my-4">
      {block.title && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {block.title}
        </p>
      )}
      <div className="space-y-2">
        {block.items.map((item, index) => {
          const style = toneStyles[item.tone] ?? toneStyles.info;
          const Icon = style.icon;
          return (
            <div
              key={`${item.label}-${index}`}
              className={cn("flex gap-2.5 rounded-lg border p-3", style.className)}
            >
              <Icon className={cn("mt-0.5 size-3.5 shrink-0", style.text)} />
              <p className="text-xs leading-relaxed text-foreground/80">
                <span className={cn("mr-1.5 font-semibold", style.text)}>{item.label}.</span>
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RisksBlock({ block }: { block: Extract<ResponseBlock, { type: "risks" }> }) {
  return (
    <div className="my-4">
      {block.title && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {block.title}
        </p>
      )}
      <div className="space-y-2">
        {block.items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px]", severityStyles[item.severity])}>
                {item.severity} severity
              </Badge>
              <span className="text-xs font-semibold">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">· {item.department}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsBlock({
  block,
}: {
  block: Extract<ResponseBlock, { type: "recommendations" }>;
}) {
  return (
    <div className="my-4 rounded-lg border border-ai/20 bg-ai/[0.04] p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ai">
        <Lightbulb className="size-3.5" />
        {block.title ?? "Recommendations"}
      </p>
      <ol className="space-y-1.5">
        {block.items.map((item, index) => (
          <li key={index} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-ai/10 text-[9px] font-semibold text-ai">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReportBlock({ block }: { block: Extract<ResponseBlock, { type: "report" }> }) {
  return (
    <div className="my-4 rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold">{block.title}</p>
      <div className="mt-3 space-y-3">
        {block.sections.map((section, index) => (
          <div key={index}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {section.heading}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResponseBlocks({ blocks }: { blocks: ResponseBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <div className="w-full">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "kpis":
            return <KpiBlock key={index} block={block} />;
          case "table":
            return <TableBlockView key={index} block={block} />;
          case "chart":
            return <ChartBlockView key={index} block={block} />;
          case "insights":
            return <InsightsBlock key={index} block={block} />;
          case "risks":
            return <RisksBlock key={index} block={block} />;
          case "recommendations":
            return <RecommendationsBlock key={index} block={block} />;
          case "report":
            return <ReportBlock key={index} block={block} />;
          case "text":
            return (
              <p key={index} className="my-2 text-xs leading-relaxed">
                {block.text}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export function ToolStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="size-3.5 text-positive" />;
  if (status === "running")
    return (
      <span className="size-2.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    );
  if (status === "failed") return <CircleAlert className="size-3.5 text-critical" />;
  if (status === "pending")
    return <span className="size-2.5 rounded-full border border-muted-foreground/60" />;
  return <ArrowUpRight className="size-3.5 text-muted-foreground" />;
}

export function DeltaBadge({
  positive,
  children,
}: {
  positive: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        positive ? "text-positive" : "text-critical",
      )}
    >
      {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {children}
    </span>
  );
}
