"use client";

import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronRight,
  CircleAlert,
  FileWarning,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionTone } from "./dashboard-metrics";

const toneStyles: Record<AttentionTone, string> = {
  critical: "bg-critical/10 text-critical",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
};

const icons: Record<AttentionItem["icon"], LucideIcon> = {
  task: CircleAlert,
  users: UsersRound,
  sales: BriefcaseBusiness,
  finance: FileWarning,
};

export function AttentionList({ items }: { items: AttentionItem[] }) {
  const router = useRouter();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <SectionCard
      title="Attention Required"
      description="Items that need a decision today"
      action={
        <span className="rounded-md bg-critical/10 px-2 py-1 text-[11px] font-semibold text-critical tabular-nums">
          {total} open
        </span>
      }
      contentClassName="divide-y divide-border pb-2"
    >
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(item.href)}
            className="group flex w-full items-center gap-3 py-3 text-left transition-colors first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md",
                toneStyles[item.tone],
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-foreground group-hover:text-primary">
                {item.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {item.detail}
              </span>
            </span>
            <span className="shrink-0 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-semibold tabular-nums text-foreground">
              {item.count}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        );
      })}
    </SectionCard>
  );
}
