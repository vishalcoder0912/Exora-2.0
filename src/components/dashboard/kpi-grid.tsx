"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "positive" | "warning" | "critical" | "ai";

export interface KpiSparkCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: KpiTone;
  spark: number[];
  onClick: () => void;
  noteTone?: "muted" | "positive" | "warning" | "critical";
}

const iconTones: Record<KpiTone, string> = {
  primary: "bg-primary/10 text-primary",
  positive: "bg-positive/10 text-positive",
  warning: "bg-warning/10 text-warning",
  critical: "bg-critical/10 text-critical",
  ai: "bg-ai/10 text-ai",
};

const lineTones: Record<KpiTone, string> = {
  primary: "text-primary",
  positive: "text-positive",
  warning: "text-warning",
  critical: "text-critical",
  ai: "text-ai",
};

const noteTones: Record<NonNullable<KpiSparkCardProps["noteTone"]>, string> = {
  muted: "text-muted-foreground",
  positive: "text-positive",
  warning: "text-warning",
  critical: "text-critical",
};

function KpiSparkCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  spark,
  onClick,
  noteTone = "muted",
}: KpiSparkCardProps) {
  const gradientId = `kpi-spark-${useId().replace(/:/g, "")}`;
  const points = spark.length > 1 ? spark : [spark[0] ?? 0, spark[0] ?? 0];
  const data = points.map((point, index) => ({ index, value: point }));

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[152px] flex-col rounded-lg border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            iconTones[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className={cn("mt-2.5 text-[11px] font-medium", noteTones[noteTone])}>{note}</p>
      <div className={cn("mt-auto h-9 w-full pt-2", lineTones[tone])} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={1.8}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  );
}

export function KpiGrid({ cards }: { cards: KpiSparkCardProps[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <KpiSparkCard key={card.label} {...card} />
      ))}
    </div>
  );
}
