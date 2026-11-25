"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import type { Department, Project } from "@/types";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeNames: string[];
  today: string;
  onCreated?: (project: Project) => void;
}

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];
const STATUSES = ["On track", "At risk", "Delayed", "Completed"] as const;

export function ProjectDialog({
  open,
  onOpenChange,
  employeeNames,
  today,
  onCreated,
}: ProjectDialogProps) {
  const { dispatch } = useApp();
  const defaultOwner = employeeNames[0] ?? "Alex Morgan";
  const [name, setName] = useState("");
  const [owner, setOwner] = useState(defaultOwner);
  const [team, setTeam] = useState("");
  const [department, setDepartment] = useState<Department>("Operations");
  const [status, setStatus] = useState<Project["status"]>("On track");
  const [progress, setProgress] = useState("0");
  const [deadline, setDeadline] = useState(today);
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setOwner(defaultOwner);
    setTeam("");
    setDepartment("Operations");
    setStatus("On track");
    setProgress("0");
    setDeadline(today);
    setBudget("");
    setDescription("");
  }, [open, defaultOwner, today]);

  function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Enter a project name.");
      return;
    }
    const numericProgress = Number(progress);
    if (!Number.isFinite(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      toast.error("Progress must be between 0 and 100.");
      return;
    }
    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget) || numericBudget < 0) {
      toast.error("Enter a valid budget.");
      return;
    }

    const project: Project = {
      id: createId("PRJ"),
      name: trimmedName,
      owner,
      team: team
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean)
        .slice(0, 8),
      progress: Math.round(numericProgress),
      deadline: deadline || today,
      status,
      department,
      budget: Math.round(numericBudget),
      description:
        description.trim() ||
        `${trimmedName} — new project tracked by ${department} with weekly check-ins.`,
    };

    dispatch({ type: "ADD_PROJECT", payload: project });
    toast.success("Project created", { description: `${project.name} added to the portfolio.` });
    onOpenChange(false);
    onCreated?.(project);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Add a new initiative to the operations portfolio.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Project name">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Customer portal rollout"
                className="h-8 text-xs"
              />
            </Field>
          </div>
          <Field label="Owner">
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(employeeNames.length > 0 ? employeeNames : ["Alex Morgan"]).map((member) => (
                  <SelectItem key={member} value={member} className="text-xs">
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Department">
            <Select
              value={department}
              onValueChange={(value) => setDepartment(value as Department)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Team (comma-separated names)">
            <Input
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              placeholder="Aarav Sharma, Diya Nair"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={(value) => setStatus(value as Project["status"])}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Progress (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Budget (₹)">
            <Input
              type="number"
              min={0}
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="1500000"
              className="h-8 text-xs"
            />
          </Field>
          <Field label="Deadline">
            <Input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="h-8 text-xs"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="text-xs"
                placeholder="Scope, outcomes, and key milestones..."
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Create project
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
