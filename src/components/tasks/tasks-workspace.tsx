"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, LayoutGrid, List, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskKanban } from "@/components/tasks/task-kanban";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, initials, relativeDate } from "@/lib/format";
import { createId, useApp } from "@/store/app-store";
import type { Department, Task, TaskPriority, TaskStatus } from "@/types";

const TASK_EDITS_KEY = "nexus-task-edits-v1";
const STATUSES: TaskStatus[] = ["Open", "In progress", "Completed"];
const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];
const DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

type TaskTab = "all" | "today" | "upcoming" | "overdue" | "completed";

export function TasksWorkspace() {
  const { state, dispatch } = useApp();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");
  const today = state.data.today;

  const [edits, setEdits] = useState<Record<string, Partial<Task>>>({});
  const [tab, setTab] = useState<TaskTab>("all");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openedRef = useRef<string | null>(null);

  // Local overrides keep edited task detail fields visible without changing shared store types.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TASK_EDITS_KEY);
      if (raw) setEdits(JSON.parse(raw) as Record<string, Partial<Task>>);
    } catch {
      // Ignore unavailable or corrupted local storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_EDITS_KEY, JSON.stringify(edits));
    } catch {
      // Storage is optional for the prototype.
    }
  }, [edits]);

  useEffect(() => {
    function clearLocalEdits() {
      setEdits({});
      try {
        window.localStorage.removeItem(TASK_EDITS_KEY);
      } catch {
        // Storage is optional for the prototype.
      }
    }
    window.addEventListener("nexus-reset-demo", clearLocalEdits);
    return () => window.removeEventListener("nexus-reset-demo", clearLocalEdits);
  }, []);

  const tasks = useMemo(
    () => state.data.tasks.map((task) => ({ ...task, ...(edits[task.id] ?? {}) })),
    [state.data.tasks, edits],
  );

  const counts = useMemo(
    () => ({
      all: tasks.length,
      today: tasks.filter((task) => task.dueDate === today && task.status !== "Completed").length,
      upcoming: tasks.filter((task) => task.dueDate > today && task.status !== "Completed").length,
      overdue: tasks.filter((task) => task.dueDate < today && task.status !== "Completed").length,
      completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks, today],
  );

  const visibleTasks = useMemo(() => {
    switch (tab) {
      case "today":
        return tasks.filter((task) => task.dueDate === today && task.status !== "Completed");
      case "upcoming":
        return tasks.filter((task) => task.dueDate > today && task.status !== "Completed");
      case "overdue":
        return tasks.filter((task) => task.dueDate < today && task.status !== "Completed");
      case "completed":
        return tasks.filter((task) => task.status === "Completed");
      default:
        return tasks;
    }
  }, [tasks, tab, today]);

  const selected = tasks.find((task) => task.id === selectedId) ?? null;

  // Support deep links such as /tasks?open=TSK-903.
  useEffect(() => {
    if (!openId || openId === openedRef.current) return;
    if (!tasks.some((task) => task.id === openId)) return;
    openedRef.current = openId;
    setSelectedId(openId);
    setTab("all");
  }, [openId, tasks]);

  const columns = useMemo<DataTableColumn<Task>[]>(
    () => [
      {
        key: "title",
        header: "Task",
        sortValue: (row) => row.title,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.title}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {row.id} · {row.projectName}
            </p>
          </div>
        ),
      },
      {
        key: "priority",
        header: "Priority",
        sortValue: (row) => PRIORITIES.indexOf(row.priority),
        cell: (row) => <StatusBadge status={row.priority} />,
      },
      {
        key: "dueDate",
        header: "Due",
        sortValue: (row) => row.dueDate,
        cell: (row) => (
          <div>
            <p
              className={`text-xs tabular-nums ${row.dueDate < today && row.status !== "Completed" ? "text-critical" : ""}`}
            >
              {formatDate(row.dueDate)}
            </p>
            <p className="text-[11px] text-muted-foreground">{relativeDate(row.dueDate, today)}</p>
          </div>
        ),
      },
      {
        key: "assignee",
        header: "Assignee",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                {initials(row.assignee)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-muted-foreground">{row.assignee}</span>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        cell: (row) => <span className="text-muted-foreground">{row.department}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <div onClick={(event) => event.stopPropagation()}>
            <Select
              value={row.status}
              onValueChange={(value) => changeStatus(row, value as TaskStatus)}
            >
              <SelectTrigger
                className="h-8 w-[130px] text-xs"
                aria-label={`Status for ${row.title}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={`Edit ${row.title}`}
              onClick={() => openEdit(row)}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today],
  );

  const filters = useMemo<DataTableFilter<Task>[]>(
    () => [
      {
        key: "priority",
        label: "priorities",
        options: PRIORITIES.map((value) => ({ label: value, value })),
        predicate: (row, value) => row.priority === value,
      },
      {
        key: "department",
        label: "departments",
        options: DEPARTMENTS.map((value) => ({ label: value, value })),
        predicate: (row, value) => row.department === value,
      },
    ],
    [],
  );

  function changeStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    dispatch({ type: "UPDATE_TASK_STATUS", id: task.id, status });
    toast.success("Task status updated", { description: `${task.title} → ${status}` });
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  function handleSave(task: Task, isEdit: boolean) {
    if (isEdit) {
      const previous = editing;
      setEdits((current) => ({
        ...current,
        [task.id]: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          department: task.department,
          assignee: task.assignee,
          projectId: task.projectId,
          projectName: task.projectName,
        },
      }));
      if (previous && previous.status !== task.status) {
        dispatch({ type: "UPDATE_TASK_STATUS", id: task.id, status: task.status });
      }
      toast.success("Task updated", { description: `${task.title} has been saved.` });
    } else {
      dispatch({ type: "ADD_TASK", payload: task });
      dispatch({
        type: "ADD_AUDIT_EVENT",
        payload: {
          id: createId("AUD"),
          activity: `Task created: ${task.title}`,
          user: "Alex Morgan",
          department: task.department,
          entity: task.id,
          timestamp: new Date().toISOString(),
          status: "Success",
          type: "Task creation",
          metadata: { result: `Assigned to ${task.assignee}, due ${formatDate(task.dueDate)}` },
        },
      });
      toast.success("Task created", { description: `${task.title} added to the workspace.` });
    }
    setDialogOpen(false);
    setEditing(null);
  }

  const tabItems: { value: TaskTab; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "today", label: "Today", count: counts.today },
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "overdue", label: "Overdue", count: counts.overdue },
    { value: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="My tasks"
        subtitle="Track priorities, deadlines, and delivery across every department."
        badge={`${counts.today} due today`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus /> New task
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as TaskTab)}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0 sm:w-auto">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {item.label}
                <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {item.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mb-2 flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-[11px]"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              <List className="size-3.5" /> List
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "kanban" ? "secondary" : "ghost"}
              className="h-7 px-2.5 text-[11px]"
              onClick={() => setView("kanban")}
              aria-pressed={view === "kanban"}
            >
              <LayoutGrid className="size-3.5" /> Kanban
            </Button>
          </div>
        </div>

        {tabItems.map((item) => (
          <TabsContent key={item.value} value={item.value} className="mt-4">
            {view === "list" ? (
              <DataTable
                data={visibleTasks}
                columns={columns}
                rowKey={(row) => row.id}
                searchText={(row) => [
                  row.title,
                  row.id,
                  row.projectName,
                  row.assignee,
                  row.department,
                  row.status,
                ]}
                filters={filters}
                searchPlaceholder="Search tasks..."
                pageSize={8}
                onRowClick={(row) => setSelectedId(row.id)}
                emptyMessage={`No ${item.label.toLowerCase()} tasks found.`}
              />
            ) : (
              <TaskKanban
                tasks={visibleTasks}
                today={today}
                onStatusChange={changeStatus}
                onSelect={(task) => setSelectedId(task.id)}
                onEdit={openEdit}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        today={today}
        projects={state.data.projects}
        employees={state.data.employees}
        onSave={handleSave}
      />

      <DetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        title={selected?.title ?? "Task"}
        description={selected ? `${selected.id} · ${selected.projectName}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.priority} />
              <StatusBadge status={selected.status} />
              {selected.dueDate < today && selected.status !== "Completed" && (
                <StatusBadge status="Overdue" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <Select
                value={selected.status}
                onValueChange={(value) => changeStatus(selected, value as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              {selected.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Assignee</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                      {initials(selected.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs font-medium">{selected.assignee}</span>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Due date</p>
                <p className="mt-1.5 text-xs font-medium tabular-nums">
                  {formatDate(selected.dueDate)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {relativeDate(selected.dueDate, today)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Department</p>
                <p className="mt-1.5 text-xs font-medium">{selected.department}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Project</p>
                <p className="mt-1.5 text-xs font-medium">{selected.projectName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>
                <Pencil /> Edit task
              </Button>
              {selected.status !== "Completed" && (
                <Button size="sm" onClick={() => changeStatus(selected, "Completed")}>
                  <Check /> Mark completed
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailSheet>
    </main>
  );
}
