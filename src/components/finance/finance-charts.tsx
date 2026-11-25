"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactCurrency, formatNumber } from "@/lib/format";
import type { MonthlyFinance, Transaction } from "@/types";

const CHART_TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 11,
  boxShadow: "0 8px 24px rgb(0 0 0 / 0.08)",
} as const;

export function RevenueExpenseChart({ data }: { data: MonthlyFinance[] }) {
  const points = data.map((month) => ({
    month: month.month,
    Revenue: month.revenue,
    Expenses: month.expenses,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            width={58}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value, name) => [formatCompactCurrency(Number(value)), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} iconSize={8} />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Expenses"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashFlowChart({ data }: { data: MonthlyFinance[] }) {
  const points = data.map((month) => ({
    month: month.month,
    net: month.revenue - month.expenses,
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            width={58}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value) => [formatCompactCurrency(Number(value)), "Net cash flow"]}
            cursor={{ fill: "var(--muted)" }}
          />
          <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={42}>
            {points.map((point) => (
              <Cell
                key={point.month}
                fill={point.net >= 0 ? "var(--positive)" : "var(--critical)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const CATEGORY_COLORS = [
  "bg-primary",
  "bg-ai",
  "bg-positive",
  "bg-warning",
  "bg-critical",
  "bg-primary/60",
  "bg-muted-foreground/60",
];

export function ExpenseBreakdown({ transactions }: { transactions: Transaction[] }) {
  const { categories, total } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const transaction of transactions) {
      if (transaction.type !== "Expense") continue;
      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + transaction.amount,
      );
    }
    const rows = Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 6);
    return {
      categories: rows,
      total: Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0),
    };
  }, [transactions]);

  return (
    <div className="space-y-3.5">
      {categories.map((category, index) => {
        const share = total > 0 ? (category.amount / total) * 100 : 0;
        return (
          <div key={category.category}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[11px]">
              <span className="truncate font-medium text-foreground">{category.category}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatCompactCurrency(category.amount)} · {share.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${CATEGORY_COLORS[index] ?? "bg-primary"}`}
                style={{ width: `${Math.max(2, share)}%` }}
              />
            </div>
          </div>
        );
      })}
      {categories.length === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No expense transactions yet.
        </p>
      )}
      <p className="border-t border-border pt-3 text-[10px] text-muted-foreground">
        Based on {formatNumber(transactions.filter((item) => item.type === "Expense").length)}{" "}
        expense transactions
      </p>
    </div>
  );
}
