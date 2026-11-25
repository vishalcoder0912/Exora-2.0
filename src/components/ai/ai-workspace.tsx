"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Check,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  LayoutDashboard,
  Megaphone,
  MessageSquarePlus,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ActionCard } from "@/components/ai/action-card";
import { ResponseBlocks, ToolStatusIcon } from "@/components/ai/response-blocks";
import { ToolInspector } from "@/components/ai/tool-inspector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createId, useApp } from "@/store/app-store";
import { planFor, detectScenario, suggestedPrompts } from "@/services/agent";
import { executeTool, toolCatalog } from "@/services/tools";
import type {
  ActionProposal,
  AuditEvent,
  ChatMessage,
  Conversation,
  EmailAction,
  Task,
  ToolCallRecord,
} from "@/types";

const scenarioIcons: Record<string, LucideIcon> = {
  company: LayoutDashboard,
  hr: Users,
  finance: Wallet,
  sales: BriefcaseBusiness,
  operations: Workflow,
  marketing: Megaphone,
};

function timeLabel(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortTime(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function AiWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch, hydrated } = useApp();
  const { conversations, settings, data } = state;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [liveTools, setLiveTools] = useState<ToolCallRecord[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [conversationSearch, setConversationSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations],
  );

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeId) ??
      sortedConversations[0] ??
      null,
    [conversations, activeId, sortedConversations],
  );

  const lastAssistant = useMemo(() => {
    if (!activeConversation) return null;
    return (
      [...activeConversation.messages].reverse().find((message) => message.role === "assistant") ??
      null
    );
  }, [activeConversation]);

  const visibleToolCalls = liveTools.length > 0 ? liveTools : (lastAssistant?.toolCalls ?? []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages.length, busy, liveTools.length]);

  const sendMessage = useCallback(
    async (rawPrompt: string) => {
      const prompt = rawPrompt.trim();
      if (!prompt || busy || !settings.aiEnabled) return;

      let conversationId = activeConversation?.id;
      if (!conversationId) {
        const created: Conversation = {
          id: createId("CONV"),
          title: prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        dispatch({ type: "NEW_CONVERSATION", payload: created });
        conversationId = created.id;
        setActiveId(created.id);
      }

      const currentConversation = conversations.find((item) => item.id === conversationId);
      const isFirstMessage = (currentConversation?.messages.length ?? 0) === 0;
      if (isFirstMessage) {
        dispatch({
          type: "RENAME_CONVERSATION",
          id: conversationId,
          title: prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt,
        });
      }

      const previousUserPrompt =
        [...(currentConversation?.messages ?? [])]
          .reverse()
          .find((message) => message.role === "user")?.text ?? "";

      const userMessage: ChatMessage = {
        id: createId("MSG"),
        role: "user",
        text: prompt,
        createdAt: new Date().toISOString(),
        blocks: [],
        toolCalls: [],
        actions: [],
        followUps: [],
      };
      dispatch({ type: "ADD_MESSAGE", conversationId, message: userMessage });

      const scenario = detectScenario(prompt, previousUserPrompt);
      const plan = planFor(scenario);

      let assistant: ChatMessage = {
        id: createId("MSG"),
        role: "assistant",
        text: "Working on your request…",
        createdAt: new Date().toISOString(),
        blocks: [],
        toolCalls: [],
        actions: [],
        followUps: [],
        scenario,
      };
      dispatch({ type: "ADD_MESSAGE", conversationId, message: assistant });

      setInput("");
      setBusy(true);
      setLiveTools([]);

      const patch = (partial: Partial<ChatMessage>) => {
        assistant = { ...assistant, ...partial };
        dispatch({
          type: "UPDATE_MESSAGE",
          conversationId,
          messageId: assistant.id,
          message: assistant,
        });
        setLiveTools([...assistant.toolCalls]);
      };

      const results: Record<string, unknown> = {};
      const toolRecords: ToolCallRecord[] = [];

      for (const invocation of plan.tools) {
        const catalogItem = toolCatalog.find((item) => item.name === invocation.name);
        const record: ToolCallRecord = {
          id: createId("TOOL"),
          name: invocation.name,
          department: catalogItem?.department ?? "System",
          status: "running",
          args: invocation.args,
          durationMs: 0,
          result: "",
        };
        toolRecords.push(record);
        patch({ toolCalls: [...toolRecords] });

        try {
          const toolResult = await executeTool(invocation.name, invocation.args, {
            data,
            today: data.today,
          });
          results[invocation.name] = toolResult;
          record.status = "completed";
          record.durationMs = toolResult.durationMs;
          record.result = toolResult.summary;
        } catch {
          record.status = "failed";
          record.result = "Tool execution failed";
        }
        patch({ toolCalls: [...toolRecords] });
      }

      const response = plan.build(results as never, { data, today: data.today });
      patch({
        text: response.text,
        blocks: response.blocks,
        actions: response.actions,
        followUps: response.followUps,
        scenario: response.scenario,
      });

      setBusy(false);
      setLiveTools([]);
    },
    [activeConversation, conversations, busy, data, dispatch, settings.aiEnabled],
  );

  const initialPrompt = searchParams.get("prompt");
  useEffect(() => {
    if (!initialPrompt || seededRef.current || !hydrated) return;
    seededRef.current = true;
    void sendMessage(initialPrompt);
    router.replace("/ai");
  }, [initialPrompt, router, sendMessage, hydrated]);

  const setActionStatus = useCallback(
    (actionId: string, status: ActionProposal["status"]) => {
      if (!activeConversation) return;
      for (const message of activeConversation.messages) {
        if (!message.actions.some((action) => action.id === actionId)) continue;
        const updated: ChatMessage = {
          ...message,
          actions: message.actions.map((action) =>
            action.id === actionId ? { ...action, status } : action,
          ),
        };
        dispatch({
          type: "UPDATE_MESSAGE",
          conversationId: activeConversation.id,
          messageId: message.id,
          message: updated,
        });
        return;
      }
    },
    [activeConversation, dispatch],
  );

  const executeAction = useCallback(
    (action: ActionProposal, editedEmail?: EmailAction) => {
      if (!settings.requireApproval) setActionStatus(action.id, "approved");

      if (action.type === "task") {
        const created: Task[] = action.payload.tasks.map((item, index) => ({
          id: createId("TSK"),
          title: item.title,
          projectId: "AI-FOLLOWUP",
          projectName: "AI-generated follow-up",
          assignee: item.assignee,
          priority: item.priority,
          status: "Open",
          dueDate: item.dueDate,
          department: "Operations",
          description:
            `Created by NEXUS Intelligence from an AI recommendation. ${index > 0 ? "" : ""}`.trim(),
        }));
        created.forEach((task) => dispatch({ type: "ADD_TASK", payload: task }));

        const audit: AuditEvent = {
          id: createId("AUD"),
          activity: `AI executed task creation: ${created.length} task${created.length === 1 ? "" : "s"}`,
          user: "NEXUS Intelligence",
          department: "AI",
          entity: created.map((task) => task.id).join(", "),
          timestamp: new Date().toISOString(),
          status: "Success",
          type: "Task creation",
          metadata: {
            requestedAction: action.title,
            approvalStatus: settings.requireApproval ? "Approved" : "Auto-approved",
            executedTool: "createTask",
            result: `${created.length} tasks added to the workspace`,
          },
        };
        dispatch({ type: "ADD_AUDIT_EVENT", payload: audit });
        setActionStatus(action.id, "executed");
        toast.success(`${created.length} task${created.length === 1 ? "" : "s"} created`, {
          description: "Assigned owners and due dates are visible in My Tasks and Operations.",
          action: { label: "View tasks", onClick: () => router.push("/tasks") },
        });
      } else {
        const recipients = action.payload.recipients.length;
        const audit: AuditEvent = {
          id: createId("AUD"),
          activity: `AI sent ${recipients} follow-up email${recipients === 1 ? "" : "s"}`,
          user: "NEXUS Intelligence",
          department: "AI",
          entity: `${editedEmail?.subject ?? action.payload.subject} (${recipients} recipients)`,
          timestamp: new Date().toISOString(),
          status: "Success",
          type: "Email activity",
          metadata: {
            requestedAction: action.title,
            approvalStatus: settings.requireApproval ? "Approved" : "Auto-approved",
            executedTool: "sendEmail",
            result: `${recipients} emails simulated — no real messages were sent`,
          },
        };
        dispatch({ type: "ADD_AUDIT_EVENT", payload: audit });
        setActionStatus(action.id, "executed");
        toast.success(`${recipients} email${recipients === 1 ? "" : "s"} queued`, {
          description: "Simulated only — no real emails were sent.",
          action: { label: "View audit log", onClick: () => router.push("/activity") },
        });
      }
    },
    [dispatch, router, setActionStatus, settings.requireApproval],
  );

  const handleNewConversation = () => {
    const created: Conversation = {
      id: createId("CONV"),
      title: "New conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    dispatch({ type: "NEW_CONVERSATION", payload: created });
    setActiveId(created.id);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_CONVERSATION", id });
    if (activeId === id) setActiveId(null);
    toast.success("Conversation deleted");
  };

  const handleRename = (conversation: Conversation) => {
    const title = renameValue.trim();
    if (title) {
      dispatch({ type: "RENAME_CONVERSATION", id: conversation.id, title });
      toast.success("Conversation renamed");
    }
    setRenamingId(null);
  };

  const filteredConversations = sortedConversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(conversationSearch.toLowerCase()),
  );

  const sources = [
    { label: "Employees", icon: UserRound, count: data.employees.length, href: "/hr" },
    { label: "Candidates", icon: Users, count: data.candidates.length, href: "/hr" },
    { label: "Leads", icon: BriefcaseBusiness, count: data.leads.length, href: "/sales" },
    { label: "Transactions", icon: Wallet, count: data.transactions.length, href: "/finance" },
    { label: "Projects", icon: Workflow, count: data.projects.length, href: "/operations" },
    { label: "Campaigns", icon: Megaphone, count: data.campaigns.length, href: "/marketing" },
  ];

  const messages = activeConversation?.messages ?? [];

  return (
    <div className="flex h-full min-h-0">
      {/* Conversation list */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-3">
          <Button className="w-full justify-start gap-2" onClick={handleNewConversation}>
            <MessageSquarePlus className="size-4" /> New conversation
          </Button>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Search conversations"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {filteredConversations.length === 0 && (
            <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
              No conversations found.
            </p>
          )}
          {filteredConversations.map((conversation) => {
            const active = activeConversation?.id === conversation.id;
            return (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-2 transition-colors",
                  active ? "bg-ai/10" : "hover:bg-accent/70",
                )}
              >
                {renamingId === conversation.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => handleRename(conversation)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleRename(conversation);
                      if (event.key === "Escape") setRenamingId(null);
                    }}
                    className="h-7 text-xs"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span
                      className={cn(
                        "block truncate text-xs font-medium",
                        active ? "text-ai" : "text-foreground",
                      )}
                    >
                      {conversation.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {shortTime(conversation.updatedAt)} · {conversation.messages.length} messages
                    </span>
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        setRenamingId(conversation.id);
                        setRenameValue(conversation.title);
                      }}
                    >
                      <Pencil className="size-3.5" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-critical"
                      onSelect={() => handleDelete(conversation.id)}
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-3">
          <div className="rounded-md bg-ai/[0.06] p-2.5">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-ai">
              <Sparkles className="size-3" /> Local intelligence
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              {settings.modelLabel}. No external API calls are made.
            </p>
          </div>
        </div>
      </aside>

      {/* Chat */}
      <section className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/70 px-4">
          <div className="flex size-7 items-center justify-center rounded-md bg-ai/10 text-ai">
            <Sparkles className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Intelligence</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {activeConversation?.title ?? "New conversation"} · {settings.dataScope}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {busy && (
              <Badge
                variant="outline"
                className="h-5 gap-1 border-ai/25 bg-ai/10 text-[10px] text-ai"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-ai" /> Working
              </Badge>
            )}
            {!settings.aiEnabled && (
              <Badge
                variant="outline"
                className="border-warning/30 bg-warning/10 text-[10px] text-warning"
              >
                AI disabled
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setInspectorOpen((value) => !value)}
              title={inspectorOpen ? "Hide context panel" : "Show context panel"}
            >
              {inspectorOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-5 py-10">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-ai/10 text-ai">
                  <Sparkles className="size-6" />
                </div>
                <h1 className="mt-4 text-xl font-semibold tracking-tight">
                  Ask anything about your business
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  NEXUS connects HR, Finance, Sales, Operations and Marketing data to answer
                  questions, surface risks and prepare actions for your approval.
                </p>
              </div>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {suggestedPrompts.map((item) => {
                  const Icon = scenarioIcons[item.icon] ?? Bot;
                  return (
                    <button
                      key={item.prompt}
                      type="button"
                      onClick={() => void sendMessage(item.prompt)}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-ai/30 hover:bg-ai/[0.03]"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-ai/10 group-hover:text-ai">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-snug">
                          {item.prompt}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <CircleHelp className="size-3" /> Demo workspace · All insights are generated from
                local sample data.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 lg:px-6">
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <div key={message.id} className={cn("flex gap-3", isUser && "justify-end")}>
                    {!isUser && (
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-ai/10 text-ai">
                        <Sparkles className="size-3.5" />
                      </span>
                    )}
                    <div
                      className={cn("min-w-0 max-w-[calc(100%-2.5rem)]", isUser && "max-w-[85%]")}
                    >
                      <div className="mb-1.5 flex items-center gap-2">
                        {!isUser && (
                          <span className="text-[11px] font-semibold">NEXUS Intelligence</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {timeLabel(message.createdAt)}
                        </span>
                        {!isUser && message.scenario && message.scenario !== "general" && (
                          <Badge
                            variant="secondary"
                            className="h-4 px-1.5 text-[9px] font-normal capitalize"
                          >
                            {message.scenario.replace(/([A-Z])/g, " $1")}
                          </Badge>
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed",
                          isUser
                            ? "border-primary/15 bg-primary/[0.07] text-foreground"
                            : "border-border bg-card text-foreground/85",
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                              {message.text}
                            </p>
                            {(message.toolCalls.length > 0 ||
                              (busy && index === messages.length - 1)) && (
                              <ToolInspector
                                toolCalls={
                                  message.toolCalls.length > 0 ? message.toolCalls : liveTools
                                }
                              />
                            )}
                            <ResponseBlocks blocks={message.blocks} />
                            {message.actions.length > 0 && (
                              <div className="mt-4 border-t border-border pt-3">
                                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground">
                                  <Check className="size-3.5 text-ai" /> Proposed actions
                                </p>
                                {message.actions.map((action) => (
                                  <ActionCard
                                    key={action.id}
                                    action={action}
                                    requireApproval={settings.requireApproval}
                                    onApprove={(item) => setActionStatus(item.id, "approved")}
                                    onReject={(item) => setActionStatus(item.id, "rejected")}
                                    onExecute={executeAction}
                                  />
                                ))}
                              </div>
                            )}
                            {message.followUps.length > 0 && (
                              <div className="mt-4 border-t border-border pt-3">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Continue exploring
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {message.followUps.map((followUp) => (
                                    <button
                                      key={followUp}
                                      type="button"
                                      disabled={busy || !settings.aiEnabled}
                                      onClick={() => void sendMessage(followUp)}
                                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-ai/30 hover:bg-ai/[0.05] hover:text-ai disabled:opacity-50"
                                    >
                                      {followUp}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <UserRound className="size-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
              {busy && messages.at(-1)?.role === "user" && (
                <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
                  <span className="size-2 animate-pulse rounded-full bg-ai" /> NEXUS is preparing
                  your analysis…
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-card/70 px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-border bg-card shadow-sm transition-colors focus-within:border-ai/40">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder={
                  settings.aiEnabled
                    ? "Ask about revenue, hiring, pipeline, projects…"
                    : "AI is disabled in Settings"
                }
                disabled={busy || !settings.aiEnabled}
                rows={2}
                className="max-h-32 min-h-[52px] resize-none border-0 bg-transparent px-3.5 py-3 text-xs shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center gap-2 border-t border-border px-2.5 py-2">
                <span className="text-[10px] text-muted-foreground">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-sans">
                    Enter
                  </kbd>{" "}
                  to send ·{" "}
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-sans">
                    Shift+Enter
                  </kbd>{" "}
                  for new line
                </span>
                <Button
                  size="sm"
                  className="ml-auto h-7 gap-1.5 bg-ai text-white hover:bg-ai/90"
                  disabled={!input.trim() || busy || !settings.aiEnabled}
                  onClick={() => void sendMessage(input)}
                >
                  {busy ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <ArrowUp className="size-3.5" />
                  )}
                  Ask NEXUS
                </Button>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              NEXUS can make mistakes. Review proposed actions before execution. All data is local
              sample data.
            </p>
          </div>
        </div>
      </section>

      {/* Context / tool inspector */}
      {inspectorOpen && (
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card xl:flex">
          <div className="border-b border-border p-4">
            <p className="text-xs font-semibold">AI Context</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">What NEXUS can see and do</p>
          </div>

          <div className="space-y-5 p-4">
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock3 className="size-3" /> Live execution
              </p>
              {visibleToolCalls.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-3 text-[10px] leading-relaxed text-muted-foreground">
                  Tool calls will appear here while NEXUS answers your question.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {visibleToolCalls.map((call) => (
                    <div
                      key={call.id}
                      className="rounded-md border border-border bg-background px-2.5 py-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <ToolStatusIcon status={call.status} />
                        <span className="font-mono text-[10px] font-medium">{call.name}</span>
                      </div>
                      <p className="mt-1 pl-5 text-[9px] leading-snug text-muted-foreground">
                        {call.result || `${call.department} · starting…`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Database className="size-3" /> Connected data
              </p>
              <div className="space-y-1">
                {sources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <Link
                      key={source.label}
                      href={source.href}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors hover:bg-accent"
                    >
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span className="text-foreground/80">{source.label}</span>
                      <Badge
                        variant="secondary"
                        className="ml-auto h-4 px-1 text-[9px] tabular-nums"
                      >
                        {source.count}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3" /> Available tools
              </p>
              <div className="space-y-1">
                {toolCatalog.slice(0, 10).map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-md border border-border/70 bg-background px-2 py-1.5"
                  >
                    <p className="font-mono text-[10px] font-medium">{tool.name}</p>
                    <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                ))}
                <p className="pt-1 text-center text-[9px] text-muted-foreground">
                  + {toolCatalog.length - 10} more tools
                </p>
              </div>
            </section>

            <section className="rounded-md border border-border bg-muted/30 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                <BarChart3 className="size-3 text-primary" /> Response style
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                {settings.responseStyle} · {settings.dataScope} · Approval{" "}
                {settings.requireApproval ? "required" : "automatic"}
              </p>
              <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-[10px]" asChild>
                <Link href="/settings">Change in Settings</Link>
              </Button>
            </section>
          </div>
        </aside>
      )}
    </div>
  );
}
