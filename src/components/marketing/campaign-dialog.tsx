"use client";

import { useEffect, useState, type FormEvent } from "react";

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
import { createId } from "@/store/app-store";
import type { Campaign, CampaignStatus } from "@/types";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
  onCreate: (campaign: Campaign) => void;
}

const CHANNELS = [
  "Google Ads",
  "LinkedIn",
  "Webinar",
  "Display",
  "Organic",
  "Referral",
  "Email",
  "Partner",
];

const OWNERS = ["Meera Iyer", "Zoya Ansari", "Sneha Kulkarni", "Rahul Menon", "Alex Morgan"];

function nextDate(today: string, days: number): string {
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function CampaignDialog({ open, onOpenChange, today, onCreate }: CampaignDialogProps) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]!);
  const [budget, setBudget] = useState("250000");
  const [spend, setSpend] = useState("0");
  const [leads, setLeads] = useState("0");
  const [conversions, setConversions] = useState("0");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => nextDate(today, 30));
  const [owner, setOwner] = useState(OWNERS[0]!);
  const [status, setStatus] = useState<CampaignStatus>("Active");

  useEffect(() => {
    if (!open) return;
    setName("");
    setChannel(CHANNELS[0]!);
    setBudget("250000");
    setSpend("0");
    setLeads("0");
    setConversions("0");
    setStartDate(today);
    setEndDate(nextDate(today, 30));
    setOwner(OWNERS[0]!);
    setStatus("Active");
  }, [open, today]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: createId("CAM"),
      name: name.trim(),
      channel,
      budget: Math.max(0, Number(budget) || 0),
      spend: Math.max(0, Number(spend) || 0),
      leads: Math.max(0, Math.round(Number(leads) || 0)),
      conversions: Math.max(0, Math.round(Number(conversions) || 0)),
      status,
      startDate,
      endDate,
      owner,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create campaign</DialogTitle>
          <DialogDescription>
            Add a campaign to the marketing workspace. Figures are tracked in INR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Enterprise inbound Q4"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNERS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-budget">Budget (₹)</Label>
              <Input
                id="campaign-budget"
                type="number"
                min="0"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-spend">Spend to date (₹)</Label>
              <Input
                id="campaign-spend"
                type="number"
                min="0"
                value={spend}
                onChange={(event) => setSpend(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-leads">Leads generated</Label>
              <Input
                id="campaign-leads"
                type="number"
                min="0"
                value={leads}
                onChange={(event) => setLeads(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-conversions">Conversions</Label>
              <Input
                id="campaign-conversions"
                type="number"
                min="0"
                value={conversions}
                onChange={(event) => setConversions(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="campaign-start">Start date</Label>
              <Input
                id="campaign-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-end">End date</Label>
              <Input
                id="campaign-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as CampaignStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
