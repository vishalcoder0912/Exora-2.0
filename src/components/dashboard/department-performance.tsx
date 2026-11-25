import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";

interface DepartmentPerformanceProps {
  entries: { department: Department; score: number }[];
}

function performanceTone(score: number) {
  if (score >= 90) {
    return {
      label: "Strong",
      text: "text-positive",
      dot: "bg-positive",
      bar: "[&>div]:bg-positive",
    };
  }
  if (score >= 80) {
    return {
      label: "On track",
      text: "text-primary",
      dot: "bg-primary",
      bar: "[&>div]:bg-primary",
    };
  }
  return {
    label: "Needs attention",
    text: "text-warning",
    dot: "bg-warning",
    bar: "[&>div]:bg-warning",
  };
}

export function DepartmentPerformance({ entries }: DepartmentPerformanceProps) {
  const average = entries.length
    ? Math.round(entries.reduce((total, entry) => total + entry.score, 0) / entries.length)
    : 0;

  return (
    <SectionCard
      title="Department Performance"
      description="Efficiency scores across key functions"
      action={
        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[11px]">
          <Link href="/reports">
            View reports
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      }
      contentClassName="space-y-4 pb-5"
    >
      {entries.map((entry) => {
        const tone = performanceTone(entry.score);
        return (
          <div key={entry.department} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                <span className={cn("size-1.5 shrink-0 rounded-full", tone.dot)} />
                <span className="truncate">{entry.department}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2.5">
                <span className={cn("text-[11px] font-medium", tone.text)}>{tone.label}</span>
                <span className="w-8 text-right font-semibold tabular-nums text-foreground">
                  {entry.score}%
                </span>
              </span>
            </div>
            <Progress
              value={entry.score}
              className={cn("h-1.5 bg-muted", tone.bar)}
              aria-label={`${entry.department} performance`}
            />
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span>Average efficiency score</span>
        <span className="font-semibold tabular-nums text-foreground">{average}%</span>
      </div>
    </SectionCard>
  );
}
