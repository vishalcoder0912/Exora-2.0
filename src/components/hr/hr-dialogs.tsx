"use client";

import { useState, type FormEvent } from "react";
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
import { TODAY } from "@/data/seed";
import { createId, useApp } from "@/store/app-store";
import type { Candidate, CandidateStage, Department, Employee } from "@/types";

export const HR_DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

export const CANDIDATE_STAGES: CandidateStage[] = [
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Offer",
  "Hired",
  "Rejected",
];

const CANDIDATE_SOURCES = [
  "LinkedIn",
  "Employee referral",
  "Careers page",
  "Naukri",
  "Instahyre",
  "Campus hiring",
];

const RECRUITERS = ["Priya Sharma", "Rahul Menon", "Ananya Iyer", "Vikram Rao", "Alex Morgan"];

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (name: string) => void;
}

export function AddEmployeeDialog({ open, onOpenChange, onCreated }: DialogProps) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState<Department>("Engineering");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  function reset() {
    setName("");
    setDepartment("Engineering");
    setRole("");
    setEmail("");
  }

  function changeOpen(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = name.trim();
    const trimmedRole = role.trim();
    const trimmedEmail = email.trim();
    if (!fullName || !trimmedRole || !trimmedEmail) {
      toast.error("Enter a name, role, and email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }

    const nextNumber =
      Math.max(
        1000,
        ...state.data.employees.map(
          (employee) => Number.parseInt(employee.employeeId.replace(/\D/g, ""), 10) || 0,
        ),
      ) + 1;

    const employee: Employee = {
      id: createId("EMP"),
      name: fullName,
      employeeId: `AE${String(nextNumber).padStart(4, "0")}`,
      department,
      role: trimmedRole,
      joiningDate: TODAY,
      status: "Active",
      email: trimmedEmail,
      phone: "",
      manager: "Alex Morgan",
      salary: 0,
      location: "Bengaluru",
    };

    dispatch({ type: "ADD_EMPLOYEE", payload: employee });
    toast.success(`${fullName} added to the employee directory`);
    onCreated?.(fullName);
    changeOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>Create a new record in the employee directory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="employee-name">Full name</Label>
            <Input
              id="employee-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Ananya Rao"
              autoComplete="name"
            />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="employee-department">Department</Label>
              <Select
                value={department}
                onValueChange={(value) => setDepartment(value as Department)}
              >
                <SelectTrigger id="employee-department" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HR_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employee-role">Role</Label>
              <Input
                id="employee-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Product Designer"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employee-email">Work email</Label>
            <Input
              id="employee-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@aethertech.in"
              autoComplete="email"
            />
          </div>
          <p className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">
            New records start as Active, joining today ({TODAY}) with manager Alex Morgan.
          </p>
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddCandidateDialog({ open, onOpenChange, onCreated }: DialogProps) {
  const { dispatch } = useApp();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState<Department>("Engineering");
  const [source, setSource] = useState(CANDIDATE_SOURCES[0] ?? "LinkedIn");
  const [recruiter, setRecruiter] = useState(RECRUITERS[0] ?? "Priya Sharma");
  const [email, setEmail] = useState("");
  const [expectedPackage, setExpectedPackage] = useState("");

  function reset() {
    setName("");
    setPosition("");
    setDepartment("Engineering");
    setSource(CANDIDATE_SOURCES[0] ?? "LinkedIn");
    setRecruiter(RECRUITERS[0] ?? "Priya Sharma");
    setEmail("");
    setExpectedPackage("");
  }

  function changeOpen(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullName = name.trim();
    const trimmedPosition = position.trim();
    if (!fullName || !trimmedPosition) {
      toast.error("Enter a candidate name and position.");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address or leave it blank.");
      return;
    }
    const packageValue = Number(expectedPackage);
    if (expectedPackage && (!Number.isFinite(packageValue) || packageValue < 0)) {
      toast.error("Expected package must be a positive number.");
      return;
    }

    const candidate: Candidate = {
      id: createId("CAN"),
      name: fullName,
      position: trimmedPosition,
      department,
      stage: "Applied",
      source,
      recruiter,
      lastContact: TODAY,
      updatedAt: TODAY,
      email: email.trim() || `${fullName.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
      phone: "",
      expectedPackage: expectedPackage ? packageValue : 0,
      communication: [
        { date: TODAY, channel: "Email", subject: "Application received — pipeline entry created" },
      ],
    };

    dispatch({ type: "ADD_CANDIDATE", payload: candidate });
    toast.success(`${fullName} added to the recruitment pipeline`);
    onCreated?.(fullName);
    changeOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add candidate</DialogTitle>
          <DialogDescription>Track a new applicant through the hiring pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="candidate-name">Full name</Label>
              <Input
                id="candidate-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Aditi Rane"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="candidate-position">Position</Label>
              <Input
                id="candidate-position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                placeholder="e.g. Frontend Engineer"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="candidate-department">Department</Label>
              <Select
                value={department}
                onValueChange={(value) => setDepartment(value as Department)}
              >
                <SelectTrigger id="candidate-department" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HR_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="candidate-source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger id="candidate-source" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_SOURCES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="candidate-recruiter">Recruiter</Label>
              <Select value={recruiter} onValueChange={setRecruiter}>
                <SelectTrigger id="candidate-recruiter" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECRUITERS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="candidate-package">Expected package (₹, optional)</Label>
              <Input
                id="candidate-package"
                type="number"
                min={0}
                value={expectedPackage}
                onChange={(event) => setExpectedPackage(event.target.value)}
                placeholder="1200000"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="candidate-email">Email (optional)</Label>
            <Input
              id="candidate-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add candidate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
