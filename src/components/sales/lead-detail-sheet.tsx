"use client";

import { useEffect, useState } from "react";
import { Building2, CalendarPlus, Clock, Mail, Send, User } from "lucide-react";
import { toast } from "sonner";

import { DetailSheet } from "@/components/shared/detail-sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { LEAD_STAGES } from "@/components/sales/lead-kanban";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCompactCurrency, formatCurrency, formatDate, relativeDate } from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { Lead, LeadStage } from "@/types";

interface LeadDetailSheetProps {
  lead: Lead | null;
  today: string;
  onClose: () => void;
  onStageChange: (lead: Lead, stage: LeadStage) => void;
  onCreateFollowUp: (lead: Lead) => void;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

export function LeadDetailSheet({
  lead,
  today,
  onClose,
  onStageChange,
  onCreateFollowUp,
}: LeadDetailSheetProps) {
  const { dispatch } = useApp();
  const [emailOpen, setEmailOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const leadId = lead?.id ?? "";
  const leadCompany = lead?.company ?? "";
  const leadName = lead?.name ?? "";

  useEffect(() => {
    if (!lead) return;
    setEmailOpen(false);
    setSubject(`Following up on the ${lead.company} opportunity`);
    setBody(
      `Hi ${lead.name},\n\nThank you for the conversation. I wanted to follow up on the next steps for ${lead.company}.\n\nBest regards,\nAlex Morgan`,
    );
  }, [leadId, leadCompany, leadName]);

  function sendEmail() {
    if (!lead) return;
    if (!subject.trim() || !body.trim()) {
      toast.error("Add a subject and message before sending.");
      return;
    }

    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Follow-up email sent to ${lead.name}`,
        user: "Alex Morgan",
        department: "Sales",
        entity: lead.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Email activity",
        metadata: {
          requestedAction: `Email ${lead.company}`,
          result: `Subject: ${subject.trim()}`,
        },
      },
    });
    toast.success("Email sent", { description: `Logged activity for ${lead.name}.` });
    setEmailOpen(false);
  }

  return (
    <>
      <DetailSheet
        open={Boolean(lead)}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={lead?.name ?? "Lead details"}
        description={lead ? `${lead.company} · ${lead.id}` : undefined}
      >
        {lead && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={lead.stage} />
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatCompactCurrency(lead.value)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {formatCurrency(lead.value)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetaItem label="Owner" value={lead.owner} />
              <MetaItem label="Source" value={lead.source} />
              <MetaItem label="Email" value={lead.email} />
              <MetaItem label="Phone" value={lead.phone} />
              <MetaItem label="Last contact" value={relativeDate(lead.lastContact, today)} />
              <MetaItem label="Follow-up" value={formatDate(lead.nextFollowUp)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-sheet-stage">Pipeline stage</Label>
              <Select
                value={lead.stage}
                onValueChange={(value) => onStageChange(lead, value as LeadStage)}
              >
                <SelectTrigger id="lead-sheet-stage" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage} className="text-xs">
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground">{lead.notes}</p>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" onClick={() => setEmailOpen(true)}>
                <Mail className="size-3.5" />
                Draft email
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCreateFollowUp(lead)}>
                <CalendarPlus className="size-3.5" />
                Create follow-up
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Building2 className="size-3.5" />
              <User className="size-3.5" />
              <Clock className="size-3.5" />
              <span>Activity and follow-ups are synced with the audit trail.</span>
            </div>
          </div>
        )}
      </DetailSheet>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Draft email</DialogTitle>
            <DialogDescription>
              Send a follow-up to {lead?.name ?? "this lead"} at {lead?.email ?? ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={7}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={sendEmail}>
              <Send className="size-3.5" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
