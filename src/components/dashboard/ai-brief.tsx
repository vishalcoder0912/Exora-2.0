"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CircleCheck, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiBriefProps {
  revenueGrowth: number;
  overdueTasks: number;
  highPriorityOverdue: number;
  staleLeads: number;
}

const AI_HEALTH_PROMPT =
  "Give me an overall health report of the company and identify the biggest problems.";

export function AiBrief({
  revenueGrowth,
  overdueTasks,
  highPriorityOverdue,
  staleLeads,
}: AiBriefProps) {
  const router = useRouter();

  const insights = [
    {
      label: "Positive",
      icon: CircleCheck,
      tone: "text-positive bg-positive/10",
      text: `Revenue increased ${revenueGrowth}% compared with last month.`,
    },
    {
      label: "Needs attention",
      icon: AlertTriangle,
      tone: "text-warning bg-warning/10",
      text: `${overdueTasks} operational tasks are overdue, including ${highPriorityOverdue} high-priority tasks.`,
    },
    {
      label: "Opportunity",
      icon: Target,
      tone: "text-ai bg-ai/10",
      text: `${staleLeads} high-value sales leads haven't received follow-up in 5+ days.`,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-xl border border-ai/20 bg-card shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-ai/10 blur-3xl" />
      <div className="relative border-b border-ai/15 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-ai/10 text-ai">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Business Brief</h2>
              <p className="text-[11px] text-ai">Updated just now</p>
            </div>
          </div>
          <span className="rounded-full border border-ai/20 bg-ai/5 px-2 py-0.5 text-[10px] font-medium text-ai">
            Live
          </span>
        </div>
      </div>

      <div className="relative px-5 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your business is growing steadily. Revenue is trending up and hiring is active, while
          overdue work and stale sales follow-ups remain the clearest short-term risks.
        </p>

        <div className="mt-4 space-y-3">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.label}
                className="flex gap-3 rounded-lg border border-border bg-background/70 p-3"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md",
                    insight.tone,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {insight.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{insight.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="mt-4 w-full bg-ai text-white hover:bg-ai/90"
          size="sm"
          onClick={() => router.push(`/ai?prompt=${encodeURIComponent(AI_HEALTH_PROMPT)}`)}
        >
          Explore with AI
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </section>
  );
}
