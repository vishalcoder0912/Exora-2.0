"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCompactCurrency } from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { Lead } from "@/types";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: Lead[];
  onConverted?: (lead: Lead) => void;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  leads,
  onConverted,
}: AddCustomerDialogProps) {
  const { dispatch } = useApp();
  const eligible = leads.filter((lead) => lead.stage !== "Won" && lead.stage !== "Lost");
  const [selectedId, setSelectedId] = useState("");
  const firstEligibleId = eligible[0]?.id ?? "";

  useEffect(() => {
    if (!open) return;
    setSelectedId(firstEligibleId);
  }, [open, firstEligibleId]);

  const selected = eligible.find((lead) => lead.id === selectedId) ?? eligible[0];

  function convert() {
    if (!selected) {
      toast.error("No eligible lead is available to convert.");
      return;
    }

    dispatch({ type: "UPDATE_LEAD_STAGE", id: selected.id, stage: "Won" });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Customer onboarding started for ${selected.company}`,
        user: "Alex Morgan",
        department: "Sales",
        entity: selected.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Lead change",
        metadata: {
          requestedAction: "Add customer from won opportunity",
          result: `${selected.name} moved to Won`,
        },
      },
    });
    toast.success("Customer onboarding started", {
      description: `${selected.company} was moved to Won.`,
    });
    onOpenChange(false);
    onConverted?.(selected);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>
            Customer records are provisioned from closed-won opportunities. Choose an active lead to
            mark as Won and hand over to onboarding.
          </DialogDescription>
        </DialogHeader>

        {eligible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Every lead is already won or lost. Add a new lead to create a customer.
          </p>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Opportunity</Label>
            <Select value={selected?.id ?? ""} onValueChange={setSelectedId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eligible.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id} className="text-xs">
                    {lead.name} — {lead.company} ({formatCompactCurrency(lead.value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <p className="rounded-md bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
                Owner: {selected.owner} · Current stage: {selected.stage}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!selected} onClick={convert}>
            Mark as Won
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
