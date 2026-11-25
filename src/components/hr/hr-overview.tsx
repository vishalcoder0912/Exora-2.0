"use client";

import { ArrowUpRight, Briefcase, CalendarDays, Clock, UserCheck, Users } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { HiringTrendChart } from "@/components/hr/hr-trend-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatNumber, formatShortDate, initials, relativeDate } from "@/lib/format";
import type { SeedData } from "@/types";

interface HrOverviewProps {
  data: SeedData;
  onNavigate: (tab: string) => void;
  onCandidateOpen: (id: string) => void;
}

const FUNNEL_STAGES = ["Applied", "Screening", "Interview", "Selected", "Offer", "Hired"] as const;
const FUNNEL_COLORS = [
  "bg-primary/60",
  "bg-primary/80",
  "bg-ai/80",
  "bg-warning/80",
  "bg-warning",
  "bg-positive",
];

export function HrOverview({ data, onNavigate, onCandidateOpen }: HrOverviewProps) {
  const { candidates, interviews, offers, metrics, today } = data;

  const funnel = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: candidates.filter((candidate) => candidate.stage === stage).length,
  }));
  const funnelMax = Math.max(1, ...funnel.map((item) => item.count));

  const scheduled = interviews.filter((item) => item.status === "Scheduled").length;
  const inInterview = candidates.filter((item) => item.stage === "Interview").length;

  const recentCandidates = [...candidates]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);

  const upcomingInterviews = interviews
    .filter((item) => item.status !== "Cancelled" && item.date >= today)
    .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total employees"
          value={formatNumber(metrics.totalEmployees)}
          note={`${metrics.newEmployeesThisMonth} joined this month`}
          icon={Users}
          tone="primary"
          onClick={() => onNavigate("employees")}
        />
        <StatCard
          label="Open positions"
          value={formatNumber(metrics.openPositions)}
          note="Approved roles in the hiring plan"
          icon={Briefcase}
          tone="warning"
        />
        <StatCard
          label="Active candidates"
          value={formatNumber(candidates.length)}
          note={`${inInterview} currently in interviews`}
          icon={UserCheck}
          tone="ai"
          onClick={() => onNavigate("candidates")}
        />
        <StatCard
          label="Interviews this week"
          value={formatNumber(interviews.length)}
          note={`${scheduled} scheduled · ${interviews.length - scheduled} completed`}
          icon={CalendarDays}
          tone="positive"
          onClick={() => onNavigate("interviews")}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <SectionCard
          title="Recruitment funnel"
          description="Candidates at each pipeline stage"
          className="lg:col-span-2"
        >
          <div className="space-y-3.5">
            {funnel.map((item, index) => (
              <div key={item.stage}>
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">{item.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${FUNNEL_COLORS[index] ?? "bg-primary"}`}
                    style={{ width: `${Math.max(3, (item.count / funnelMax) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {formatNumber(candidates.length)} candidates tracked · {offers.length} offers on record
          </p>
        </SectionCard>

        <SectionCard
          title="Hiring trend"
          description="Cumulative pipeline activity over the last 21 days"
          className="lg:col-span-3"
        >
          <HiringTrendChart candidates={candidates} offers={offers} today={today} />
        </SectionCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard
          title="Recent candidates"
          description="Latest pipeline updates"
          action={
            <button
              type="button"
              onClick={() => onNavigate("candidates")}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="size-3" />
            </button>
          }
          contentClassName="p-0"
        >
          <div className="divide-y divide-border">
            {recentCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onCandidateOpen(candidate.id)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {initials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{candidate.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{candidate.position}</p>
                </div>
                <StatusBadge status={candidate.stage} />
                <span className="hidden w-16 shrink-0 text-right text-[10px] text-muted-foreground sm:block">
                  {relativeDate(candidate.updatedAt, today)}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming interviews"
          description="Next scheduled conversations"
          action={
            <button
              type="button"
              onClick={() => onNavigate("interviews")}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              View all <ArrowUpRight className="size-3" />
            </button>
          }
          contentClassName="p-0"
        >
          <div className="divide-y divide-border">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-muted">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    {formatShortDate(interview.date).split(" ")[1]}
                  </span>
                  <span className="text-xs font-semibold leading-tight text-foreground">
                    {formatShortDate(interview.date).split(" ")[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {interview.candidateName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {interview.type} · {interview.interviewer}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted-foreground">
                  <Clock className="size-3" />
                  {interview.time}
                </span>
                <StatusBadge status={interview.status} />
              </div>
            ))}
            {upcomingInterviews.length === 0 && (
              <p className="px-5 py-8 text-center text-xs text-muted-foreground">
                No interviews scheduled after {formatDate(today)}.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
