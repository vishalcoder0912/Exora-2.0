"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ListTodo } from "lucide-react";
import { toast } from "sonner";

import { OperationsOverview } from "@/components/operations/operations-overview";
import { ProjectDetailSheet } from "@/components/operations/project-detail-sheet";
import { ProjectDialog } from "@/components/operations/project-dialog";
import { ProjectsPanel } from "@/components/operations/projects-panel";
import { TaskDetailSheet } from "@/components/operations/task-detail-sheet";
import { TaskDialog } from "@/components/operations/task-dialog";
import { TeamWorkload } from "@/components/operations/team-workload";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
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
import type { Project, Task, TaskStatus } from "@/types";

type OperationsTab = "overview" | "projects" | "tasks" | "team";
const TASK_STATUSES: TaskStatus[] = ["Open", "In progress", "Completed"];
const PRIORITIES = ["High", "Medium", "Low"] as const;

export function OperationsPage() {
  const { state, dispatch, hydrated } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openParam = searchParams.get("open");
  const openedRef = useRef<string | null>(null);

  const [tab, setTab] = useState<OperationsTab>("overview");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskDefaultProjectId, setTaskDefaultProjectId] = useState<string | null>(null);

  const { projects, tasks, employees, metrics, today } = state.data;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const employeeNames = employees.map((employee) => employee.name);
  const departments = [...new Set(tasks.map((task) => task.department))].sort();
  const assignees = [...new Set(tasks.map((task) => task.assignee))].sort();

  useEffect(() => {
    if (!openParam) {
      openedRef.current = null;
      return;
    }
    if (!hydrated || openedRef.current === openParam) return;
    const task = tasks.find((item) => item.id.toLowerCase() === openParam.toLowerCase());
    if (task) {
      openedRef.current = openParam;
      setSelectedTaskId(task.id);
      setTab("tasks");
      return;
    }
    const project = projects.find((item) => item.id.toLowerCase() === openParam.toLowerCase());
    if (project) {
      openedRef.current = openParam;
      setSelectedProjectId(project.id);
      setTab("projects");
    }
  }, [openParam, hydrated, tasks, projects]);

  function clearOpenParam() {
    if (openParam) router.replace("/operations", { scroll: false });
  }

  function openProject(project: Project) {
    setSelectedProjectId(project.id);
  }

  function openTask(task: Task) {
    setSelectedTaskId(task.id);
  }

  function changeTaskStatus(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    dispatch({ type: "UPDATE_TASK_STATUS", id: task.id, status });
    dispatch({
      type: "ADD_AUDIT_EVENT",
      payload: {
        id: createId("AUD"),
        activity: `Task status changed to ${status}: ${task.title}`,
        user: "Alex Morgan",
        department: task.department,
        entity: task.id,
        timestamp: new Date().toISOString(),
        status: "Success",
        type: "Task creation",
        metadata: {
          requestedAction: "Update task status",
          result: `${task.status} → ${status}`,
        },
      },
    });
    toast.success("Task status updated", { description: `${task.title} is now ${status}.` });
  }

  const taskColumns: DataTableColumn<Task>[] = [
    {
      key: "title",
      header: "Task",
      sortValue: (row) => row.title,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-semibold text-primary">
            {initials(row.title)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.title}</p>
            <p className="truncate text-[10px] text-muted-foreground">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "projectName",
      header: "Project",
      sortValue: (row) => row.projectName,
      cell: (row) => <span className="text-muted-foreground">{row.projectName}</span>,
    },
    {
      key: "assignee",
      header: "Assigned to",
      sortValue: (row) => row.assignee,
      cell: (row) => <span className="text-foreground">{row.assignee}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      sortValue: (row) => row.priority,
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
          <StatusBadge status={row.status} />
          <Select
            value={row.status}
            onValueChange={(value) => changeTaskStatus(row, value as TaskStatus)}
          >
            <SelectTrigger
              aria-label={`Change status for ${row.title}`}
              className="h-7 w-28 px-2 text-[10px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((status) => (
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
      key: "dueDate",
      header: "Due date",
      sortValue: (row) => row.dueDate,
      cell: (row) => (
        <div>
          <p
            className={
              row.dueDate < today && row.status !== "Completed"
                ? "font-medium text-critical"
                : "text-muted-foreground"
            }
          >
            {formatDate(row.dueDate)}
          </p>
          <p className="text-[10px] text-muted-foreground">{relativeDate(row.dueDate, today)}</p>
        </div>
      ),
    },
  ];

  const taskFilters: DataTableFilter<Task>[] = [
    {
      key: "status",
      label: "statuses",
      options: TASK_STATUSES.map((status) => ({ label: status, value: status })),
      predicate: (row, value) => row.status === value,
    },
    {
      key: "priority",
      label: "priorities",
      options: PRIORITIES.map((priority) => ({ label: priority, value: priority })),
      predicate: (row, value) => row.priority === value,
    },
    {
      key: "assignee",
      label: "assignees",
      options: assignees.map((assignee) => ({ label: assignee, value: assignee })),
      predicate: (row, value) => row.assignee === value,
    },
    {
      key: "department",
      label: "departments",
      options: departments.map((department) => ({ label: department, value: department })),
      predicate: (row, value) => row.department === value,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 lg:px-8">
      <PageHeader
        title="Operations"
        subtitle="Projects, tasks, deadlines, and team execution."
        badge={`${metrics.overdueTasks} overdue`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTaskDefaultProjectId(null);
                setTaskDialogOpen(true);
              }}
            >
              <ListTodo className="size-3.5" />
              Create task
            </Button>
            <Button size="sm" onClick={() => setProjectDialogOpen(true)}>
              <Plus className="size-3.5" />
              Create project
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as OperationsTab)}>
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="px-4 text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="px-4 text-xs">
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks" className="px-4 text-xs">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team" className="px-4 text-xs">
            Team workload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <OperationsOverview
            projects={projects}
            tasks={tasks}
            employees={employees}
            metrics={metrics}
            today={today}
            onOpenProject={openProject}
            onOpenTask={openTask}
            onTabChange={(next) => setTab(next)}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-5">
          <ProjectsPanel
            projects={projects}
            tasks={tasks}
            today={today}
            onOpenProject={openProject}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-5">
          <SectionCard
            title="All tasks"
            description="Update status inline or open a task for full details"
          >
            <DataTable
              data={tasks}
              columns={taskColumns}
              rowKey={(row) => row.id}
              searchText={(row) => [
                row.title,
                row.projectName,
                row.assignee,
                row.department,
                row.description,
                row.priority,
                row.status,
              ]}
              searchPlaceholder="Search tasks, projects, people..."
              filters={taskFilters}
              pageSize={10}
              onRowClick={openTask}
              emptyMessage="No tasks match your filters."
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="team" className="mt-5">
          <TeamWorkload employees={employees} tasks={tasks} today={today} />
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        employeeNames={employeeNames}
        today={today}
        onCreated={(project) => {
          setTab("projects");
          setSelectedProjectId(project.id);
        }}
      />
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        projects={projects}
        employees={employees}
        today={today}
        defaultProjectId={taskDefaultProjectId}
        onCreated={(task) => {
          setTab("tasks");
          setSelectedTaskId(task.id);
        }}
      />
      <ProjectDetailSheet
        project={selectedProject}
        tasks={tasks}
        today={today}
        onClose={() => {
          setSelectedProjectId(null);
          clearOpenParam();
        }}
        onCreateTask={(project) => {
          setSelectedProjectId(null);
          setTaskDefaultProjectId(project.id);
          setTaskDialogOpen(true);
        }}
        onOpenTask={(task) => {
          setSelectedProjectId(null);
          openTask(task);
        }}
      />
      <TaskDetailSheet
        task={selectedTask}
        today={today}
        onClose={() => {
          setSelectedTaskId(null);
          clearOpenParam();
        }}
        onStatusChange={changeTaskStatus}
      />
    </div>
  );
}
