import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
  tone?: "primary" | "ai" | "positive" | "warning" | "critical";
  onClick?: () => void;
}

const toneStyles = {
  primary: "bg-primary/10 text-primary",
  ai: "bg-ai/10 text-ai",
  positive: "bg-positive/10 text-positive",
  warning: "bg-warning/10 text-warning",
  critical: "bg-critical/10 text-critical",
} as const;

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "primary",
  onClick,
}: StatCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-left transition-all",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            toneStyles[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {note && <p className="mt-3 text-[11px] text-muted-foreground">{note}</p>}
    </Wrapper>
  );
}
