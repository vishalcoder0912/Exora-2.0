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
import type { Department, Employee, Project, Task, TaskPriority, TaskStatus } from "@/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  employees: Employee[];
  today: string;
  defaultProjectId?: string | null;
  onCreated?: (task: Task) => void;
}

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];
const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];
const STATUSES: TaskStatus[] = ["Open", "In progress", "Completed"];

export function TaskDialog({
  open,
  onOpenChange,
  projects,
  employees,
  today,
  defaultProjectId,
  onCreated,
}: TaskDialogProps) {
  const { dispatch } = useApp();
  const firstProject = projects[0];
  const initialProjectId = defaultProjectId ?? firstProject?.id ?? "";
  const defaultAssignee = employees[0]?.name ?? "Alex Morgan";
  const initialDepartment =
    projects.find((project) => project.id === initialProjectId)?.department ?? "Operations";
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(initialProjectId);
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("Open");
  const [dueDate, setDueDate] = useState(today);
  const [department, setDepartment] = useState<Department>(initialDepartment);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setProjectId(initialProjectId);
    setAssignee(defaultAssignee);
    setPriority("Medium");
    setStatus("Open");
    setDueDate(today);
    setDepartment(initialDepartment);
    setDescription("");
  }, [open, initialProjectId, initialDepartment, defaultAssignee, today]);

  function submit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Enter a task title.");
      return;
    }
    const project = projects.find((item) => item.id === projectId) ?? firstProject;
    if (!project) {
      toast.error("Create a project before adding tasks.");
      return;
    }

    const task: Task = {
      id: createId("TSK"),
      title: trimmedTitle,
      projectId: project.id,
      projectName: project.name,
      assignee,
      priority,
      status,
      dueDate: dueDate || today,
      department,
      description: description.trim() || `${trimmedTitle} — tracked as part of ${project.name}.`,
    };

    dispatch({ type: "ADD_TASK", payload: task });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Task ${task.title} created`,
        user: "Alex Morgan",
        department,
        entity: task.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Task creation",
        metadata: { requestedAction: "Create task", result: `Assigned to ${task.assignee}` },
      },
    });
    toast.success("Task created", { description: `${task.title} assigned to ${task.assignee}.` });
    onOpenChange(false);
    onCreated?.(task);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Assign work to a project and keep delivery on track.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Task title">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Review rollout checklist"
                className="h-8 text-xs"
              />
            </Field>
          </div>
          <Field label="Project">
            <Select
              value={projectId}
              onValueChange={(value) => {
                setProjectId(value);
                const nextProject = projects.find((item) => item.id === value);
                if (nextProject) setDepartment(nextProject.department);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id} className="text-xs">
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Assigned to">
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(employees.length > 0
                  ? employees.map((employee) => employee.name)
                  : ["Alex Morgan"]
                ).map((member) => (
                  <SelectItem key={member} value={member} className="text-xs">
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
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
          <Field label="Due date">
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
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
                placeholder="What needs to be done?"
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={projects.length === 0}>
            Create task
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
