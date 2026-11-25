"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "@/components/shared/section-card";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { MonthlyFinance } from "@/types";

export type DashboardPeriod = "6m" | "3m" | "1m";

const PERIOD_MONTHS: Record<DashboardPeriod, number> = {
  "6m": 6,
  "3m": 3,
  "1m": 1,
};

export function RevenueOverview({
  data,
  period,
}: {
  data: MonthlyFinance[];
  period: DashboardPeriod;
}) {
  const visible = data.slice(-PERIOD_MONTHS[period]);
  const revenue = visible.reduce((total, item) => total + item.revenue, 0);
  const expenses = visible.reduce((total, item) => total + item.expenses, 0);
  const net = revenue - expenses;
  const margin = revenue > 0 ? Math.round((net / revenue) * 100) : 0;
  const showDots = visible.length === 1;

  return (
    <SectionCard
      title="Revenue Overview"
      description="Monthly revenue and expenses"
      action={
        <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground">
          {visible.length === 1 ? "This month" : `Last ${visible.length} months`}
        </span>
      }
      contentClassName="pb-4"
    >
      <div className="h-[268px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visible} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={62}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                boxShadow: "none",
                fontSize: 12,
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "var(--muted-foreground)" }}
            />
            <Line
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={showDots ? { r: 4 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Line
              name="Expenses"
              type="monotone"
              dataKey="expenses"
              stroke="var(--warning)"
              strokeWidth={2.5}
              dot={showDots ? { r: 4 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Revenue
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
            {formatCompactCurrency(revenue)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Expenses
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
            {formatCompactCurrency(expenses)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Net margin
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-positive">{margin}%</p>
        </div>
      </div>
    </SectionCard>
  );
}
