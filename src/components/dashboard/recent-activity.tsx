"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  ListTodo,
  Mail,
  Sparkles,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { formatDateTime, relativeDate } from "@/lib/format";
import type { AuditEvent } from "@/types";

const eventIcons: Record<AuditEvent["type"], LucideIcon> = {
  "AI action": Sparkles,
  "Employee update": UserCog,
  "Lead change": BriefcaseBusiness,
  "Financial action": Wallet,
  "Task creation": ListTodo,
  "Email activity": Mail,
};

export function RecentActivity({ events, today }: { events: AuditEvent[]; today: string }) {
  const router = useRouter();
  const recent = events.slice(0, 5);

  return (
    <SectionCard
      title="Recent Activity"
      description="The latest recorded actions in your workspace"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={() => router.push("/activity")}
        >
          View all
          <ArrowUpRight className="size-3" />
        </Button>
      }
      contentClassName="pb-2"
    >
      <div className="relative space-y-0">
        {recent.map((event, index) => {
          const Icon = eventIcons[event.type] ?? Activity;
          const time = formatDateTime(event.timestamp).split(" · ")[1] ?? "";
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => router.push("/activity")}
              className="relative flex w-full gap-3 pb-4 text-left last:pb-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {index < recent.length - 1 && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-border"
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card ${
                  event.type === "AI action" ? "border-ai/30 text-ai" : "border-border text-primary"
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-xs font-medium leading-snug text-foreground">{event.activity}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                  {event.user} · {event.department}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {relativeDate(event.timestamp.slice(0, 10), today)} · {time}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => router.push("/activity")}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Open activity log
        <ArrowUpRight className="size-3" />
      </button>
    </SectionCard>
  );
}
