"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

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
import { createId, useApp } from "@/store/app-store";
import type { Lead, LeadStage } from "@/types";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owners: string[];
  today: string;
  onCreated?: (lead: Lead) => void;
}

export function AddLeadDialog({
  open,
  onOpenChange,
  owners,
  today,
  onCreated,
}: AddLeadDialogProps) {
  const { dispatch } = useApp();
  const defaultOwner = owners[0] ?? "Alex Morgan";
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("Website");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<LeadStage>("New");
  const [owner, setOwner] = useState(defaultOwner);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState(today);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setCompany("");
    setSource("Website");
    setValue("");
    setStage("New");
    setOwner(defaultOwner);
    setEmail("");
    setPhone("");
    setNextFollowUp(today);
    setNotes("");
  }, [open, defaultOwner, today]);

  function submit() {
    const trimmedName = name.trim();
    const trimmedCompany = company.trim();
    const numericValue = Number(value);

    if (!trimmedName || !trimmedCompany) {
      toast.error("Add a contact name and company.");
      return;
    }
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      toast.error("Enter a valid deal value.");
      return;
    }

    const id = createId("LEAD");
    const lead: Lead = {
      id,
      name: trimmedName,
      company: trimmedCompany,
      source: source.trim() || "Website",
      value: Math.round(numericValue),
      stage,
      owner,
      lastContact: today,
      nextFollowUp: nextFollowUp || today,
      email: email.trim() || `${trimmedName.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      phone: phone.trim() || "Not provided",
      notes:
        notes.trim() ||
        `New lead added from the sales workspace on ${today}. Initial outreach pending.`,
    };

    dispatch({ type: "ADD_LEAD", payload: lead });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Lead ${lead.name} created`,
        user: "Alex Morgan",
        department: "Sales",
        entity: lead.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Lead change",
        metadata: { requestedAction: "Create lead", result: `Stage set to ${lead.stage}` },
      },
    });
    toast.success("Lead added", { description: `${lead.name} is now in ${lead.stage}.` });
    onOpenChange(false);
    onCreated?.(lead);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>Create a new opportunity in the sales pipeline.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact name">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Nirav Shah"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Company">
            <Input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. Acme Industries"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Deal value (₹)">
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="450000"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Source">
            <Input
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Stage">
            <Select value={stage} onValueChange={(next) => setStage(next as LeadStage)}>
              <SelectTrigger className="h-8 text-xs">
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
          </Field>
          <Field label="Owner">
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(owners.length > 0 ? owners : ["Alex Morgan"]).map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 98..."
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Next follow-up">
            <Input
              type="date"
              value={nextFollowUp}
              onChange={(event) => setNextFollowUp(event.target.value)}
              className="h-8 text-xs"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="text-xs"
                placeholder="Context from the first conversation..."
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Save lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
