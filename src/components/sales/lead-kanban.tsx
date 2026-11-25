"use client";

import { CalendarDays } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactCurrency, initials, relativeDate } from "@/lib/format";
import type { Lead, LeadStage } from "@/types";

export const LEAD_STAGES: LeadStage[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

interface LeadKanbanProps {
  leads: Lead[];
  today: string;
  onOpenLead: (lead: Lead) => void;
  onStageChange: (lead: Lead, stage: LeadStage) => void;
}

export function LeadKanban({ leads, today, onOpenLead, onStageChange }: LeadKanbanProps) {
  return (
    <div className="overflow-x-auto pb-3">
      <div className="grid min-w-[1190px] grid-cols-7 gap-3">
        {LEAD_STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);
          const stageValue = stageLeads.reduce((total, lead) => total + lead.value, 0);

          return (
            <section
              key={stage}
              className="flex min-h-[420px] flex-col rounded-xl border border-border bg-muted/40"
            >
              <header className="space-y-1.5 border-b border-border px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={stage} />
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatCompactCurrency(stageValue)} in stage
                </p>
              </header>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {stageLeads.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-[11px] text-muted-foreground">
                    No leads here
                  </p>
                ) : (
                  stageLeads.map((lead) => (
                    <article
                      key={lead.id}
                      className="rounded-lg border border-border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => onOpenLead(lead)}
                        className="w-full cursor-pointer space-y-2 text-left"
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {initials(lead.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {lead.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {lead.company}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCompactCurrency(lead.value)}
                        </p>
                        <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                          <span className="truncate">{lead.owner}</span>
                          <span className="flex shrink-0 items-center gap-1">
                            <CalendarDays className="size-3" />
                            {relativeDate(lead.nextFollowUp, today)}
                          </span>
                        </div>
                      </button>

                      <div className="mt-2 border-t border-border pt-2">
                        <Select
                          value={lead.stage}
                          onValueChange={(value) => onStageChange(lead, value as LeadStage)}
                        >
                          <SelectTrigger
                            aria-label={`Change stage for ${lead.name}`}
                            className="h-7 w-full px-2 text-[10px] font-medium"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STAGES.map((option) => (
                              <SelectItem key={option} value={option} className="text-xs">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
