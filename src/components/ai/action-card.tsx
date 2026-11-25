"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Clock3, Mail, Play, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ActionProposal, EmailAction } from "@/types";

interface ActionCardProps {
  action: ActionProposal;
  requireApproval: boolean;
  onApprove: (action: ActionProposal) => void;
  onReject: (action: ActionProposal) => void;
  onExecute: (action: ActionProposal, editedEmail?: EmailAction) => void;
}

const statusStyles: Record<ActionProposal["status"], string> = {
  pending: "border-warning/30 bg-warning/10 text-warning",
  approved: "border-primary/20 bg-primary/10 text-primary",
  rejected: "border-border bg-muted text-muted-foreground",
  executed: "border-positive/25 bg-positive/10 text-positive",
};

const statusLabels: Record<ActionProposal["status"], string> = {
  pending: "Needs approval",
  approved: "Approved",
  rejected: "Rejected",
  executed: "Executed",
};

export function ActionCard({
  action,
  requireApproval,
  onApprove,
  onReject,
  onExecute,
}: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editedSubject, setEditedSubject] = useState(
    action.type === "email" ? action.payload.subject : "",
  );
  const [editedBody, setEditedBody] = useState(action.type === "email" ? action.payload.body : "");

  const emailPayload = action.type === "email" ? action.payload : null;
  const taskPayload = action.type === "task" ? action.payload : null;
  const isEmail = action.type === "email";

  const execute = () => {
    if (isEmail && emailPayload) {
      const edited: EmailAction = {
        ...emailPayload,
        subject: editedSubject,
        body: editedBody,
      };
      onExecute({ ...action, payload: edited }, edited);
      return;
    }
    onExecute(action);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-start gap-3 p-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            isEmail ? "bg-primary/10 text-primary" : "bg-ai/10 text-ai",
          )}
        >
          {isEmail ? <Mail className="size-4" /> : <ShieldCheck className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold">{action.title}</p>
            <Badge
              variant="outline"
              className={cn("text-[9px] font-medium", statusStyles[action.status])}
            >
              {statusLabels[action.status]}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {action.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-center gap-1 border-t border-border bg-muted/30 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/60"
      >
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {expanded ? "Hide details" : "Review details"}
      </button>

      {expanded && (
        <div className="border-t border-border p-3">
          {isEmail ? (
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recipients ({emailPayload?.recipients.length ?? 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {(emailPayload?.recipients ?? []).map((recipient) => (
                    <Badge
                      key={recipient.email}
                      variant="secondary"
                      className="text-[10px] font-normal"
                    >
                      {recipient.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Subject
                </p>
                <Textarea
                  value={editedSubject}
                  onChange={(event) => setEditedSubject(event.target.value)}
                  rows={1}
                  className="h-8 min-h-8 resize-none text-xs"
                  disabled={action.status === "executed"}
                />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </p>
                <Textarea
                  value={editedBody}
                  onChange={(event) => setEditedBody(event.target.value)}
                  rows={5}
                  className="resize-y text-xs"
                  disabled={action.status === "executed"}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {(taskPayload?.tasks ?? []).map((task, index) => (
                <div key={index} className="rounded-md border border-border bg-muted/30 p-2.5">
                  <p className="text-xs font-medium">{task.title}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {task.assignee} · {task.priority} priority · Due {task.dueDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {action.status !== "executed" && action.status !== "rejected" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-3 py-2">
          {action.status === "pending" && (
            <>
              <Button
                size="sm"
                className="h-7 gap-1.5 text-[11px]"
                onClick={() => {
                  if (!requireApproval) {
                    execute();
                    return;
                  }
                  onApprove(action);
                  toast.success("Action approved", {
                    description: "Review the details and execute when ready.",
                  });
                }}
              >
                <Check className="size-3.5" />
                {requireApproval ? "Approve" : "Execute now"}
              </Button>
              {requireApproval && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-[11px] text-muted-foreground"
                  onClick={() => {
                    onReject(action);
                    toast.info("Action rejected", { description: "No changes were made." });
                  }}
                >
                  <X className="size-3.5" /> Reject
                </Button>
              )}
            </>
          )}
          {action.status === "approved" && (
            <>
              <Button
                size="sm"
                className="h-7 gap-1.5 bg-positive text-white hover:bg-positive/90"
                onClick={() => {
                  if (isEmail && editedSubject !== (emailPayload?.subject ?? "")) {
                    toast.info("Using your edited subject line.");
                  }
                  execute();
                }}
              >
                <Play className="size-3.5" /> Execute action
              </Button>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock3 className="size-3" /> Waiting to execute
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
