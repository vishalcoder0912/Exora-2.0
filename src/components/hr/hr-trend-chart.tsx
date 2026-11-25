"use client";

import { useMemo } from "react";
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

import { formatNumber, formatShortDate } from "@/lib/format";
import type { Candidate, Offer } from "@/types";

interface HiringTrendChartProps {
  candidates: Candidate[];
  offers: Offer[];
  today: string;
}

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function HiringTrendChart({ candidates, offers, today }: HiringTrendChartProps) {
  const points = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => {
        const date = shiftDate(today, index - 21);
        return {
          label: formatShortDate(date),
          Applicants: candidates.filter((item) => item.updatedAt.slice(0, 10) <= date).length,
          Hires: candidates.filter(
            (item) => item.stage === "Hired" && item.updatedAt.slice(0, 10) <= date,
          ).length,
          Offers: offers.filter((item) => item.offerDate.slice(0, 10) <= date).length,
        };
      }),
    [candidates, offers, today],
  );

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            interval={4}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatNumber(value)}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 11,
              boxShadow: "0 8px 24px rgb(0 0 0 / 0.08)",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value, name) => [formatNumber(Number(value)), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} iconSize={8} />
          <Line
            type="monotone"
            dataKey="Applicants"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Offers"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Hires"
            stroke="var(--positive)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
