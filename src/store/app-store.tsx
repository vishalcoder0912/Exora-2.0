"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

import { seedData, TODAY } from "@/data/seed";
import type {
  AppNotification,
  AuditEvent,
  Campaign,
  Candidate,
  CandidateStage,
  ChatMessage,
  Conversation,
  Employee,
  Invoice,
  InvoiceStatus,
  Lead,
  LeadStage,
  Project,
  SeedData,
  SettingsState,
  Task,
  TaskStatus,
  Transaction,
} from "@/types";

const STORAGE_KEY = "nexus-prototype-state-v1";

export interface AppState {
  data: SeedData;
  conversations: Conversation[];
  notifications: AppNotification[];
  settings: SettingsState;
}

export type AppAction =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "RESET_DEMO" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<SettingsState> }
  | { type: "ADD_EMPLOYEE"; payload: Employee }
  | { type: "ADD_CANDIDATE"; payload: Candidate }
  | { type: "UPDATE_CANDIDATE_STAGE"; id: string; stage: CandidateStage }
  | { type: "ADD_LEAD"; payload: Lead }
  | { type: "UPDATE_LEAD_STAGE"; id: string; stage: LeadStage }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "UPDATE_INVOICE_STATUS"; id: string; status: InvoiceStatus }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK_STATUS"; id: string; status: TaskStatus }
  | { type: "ADD_CAMPAIGN"; payload: Campaign }
  | { type: "ADD_AUDIT_EVENT"; payload: AuditEvent }
  | { type: "NEW_CONVERSATION"; payload: Conversation }
  | { type: "RENAME_CONVERSATION"; id: string; title: string }
  | { type: "DELETE_CONVERSATION"; id: string }
  | { type: "ADD_MESSAGE"; conversationId: string; message: ChatMessage }
  | { type: "UPDATE_MESSAGE"; conversationId: string; messageId: string; message: ChatMessage }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" };

const defaultSettings: SettingsState = {
  companyName: "Aether Technologies",
  companyEmail: "contact@aethertech.in",
  timezone: "Asia/Kolkata (IST)",
  currency: "INR (₹)",
  aiEnabled: true,
  modelLabel: "NEXUS Intelligence · local model",
  responseStyle: "Balanced",
  dataScope: "All departments",
  requireApproval: true,
  showToolActivity: true,
};

const initialNotifications: AppNotification[] = [
  {
    id: "NOT-1",
    title: "4 tasks are overdue",
    description: "High-priority work needs attention today.",
    read: false,
    createdAt: `${TODAY}T08:10:00.000Z`,
    href: "/tasks",
  },
  {
    id: "NOT-2",
    title: "3 offers awaiting approval",
    description: "Review candidate offer packages.",
    read: false,
    createdAt: `${TODAY}T07:45:00.000Z`,
    href: "/hr",
  },
  {
    id: "NOT-3",
    title: "Invoice INV-2026-081 is overdue",
    description: "Follow up with the client about payment.",
    read: false,
    createdAt: `${TODAY}T06:30:00.000Z`,
    href: "/finance",
  },
  {
    id: "NOT-4",
    title: "New high-value lead assigned",
    description: "A qualified lead was assigned to your team.",
    read: true,
    createdAt: `${TODAY}T05:15:00.000Z`,
    href: "/sales",
  },
  {
    id: "NOT-5",
    title: "Project deadline approaching",
    description: "ERP platform rollout milestone is due soon.",
    read: true,
    createdAt: `${TODAY}T04:00:00.000Z`,
    href: "/operations",
  },
];

function exampleConversations(): Conversation[] {
  const examples = [
    [
      "Company health report",
      "Give me an overall health report of the company and identify the biggest problems.",
    ],
    [
      "November recruitment analysis",
      "How many candidates have been hired this month, how many offers were sent, and what packages were offered?",
    ],
    ["Sales pipeline risks", "Show me the high-value leads that haven't been contacted recently."],
    ["Marketing performance", "Which campaigns are giving us the best return?"],
    [
      "Overdue operations review",
      "Which projects are delayed, and what tasks should we prioritize today?",
    ],
    [
      "Salary projection",
      "How much is our current payroll and what will it become if all pending offers are accepted?",
    ],
  ] as const;

  return examples.map(([title, prompt], index) => ({
    id: `CONV-EXAMPLE-${index + 1}`,
    title,
    createdAt: `${TODAY}T0${index + 1}:00:00.000Z`,
    updatedAt: `${TODAY}T0${index + 1}:30:00.000Z`,
    messages: [
      {
        id: `MSG-EXAMPLE-${index + 1}`,
        role: "user" as const,
        text: prompt,
        createdAt: `${TODAY}T0${index + 1}:00:00.000Z`,
        blocks: [],
        toolCalls: [],
        actions: [],
        followUps: [],
      },
      {
        id: `MSG-EXAMPLE-A-${index + 1}`,
        role: "assistant" as const,
        text: "This is a saved example conversation from the demo workspace. Ask a question to generate a fresh, data-backed analysis.",
        createdAt: `${TODAY}T0${index + 1}:01:00:00.000Z`,
        blocks: [],
        toolCalls: [],
        actions: [],
        followUps: [],
      },
    ],
  }));
}

function createInitialState(): AppState {
  return {
    data: structuredClone(seedData),
    conversations: exampleConversations(),
    notifications: structuredClone(initialNotifications),
    settings: { ...defaultSettings },
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "RESET_DEMO":
      return createInitialState();
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "ADD_EMPLOYEE":
      return {
        ...state,
        data: { ...state.data, employees: [action.payload, ...state.data.employees] },
      };
    case "ADD_CANDIDATE":
      return {
        ...state,
        data: { ...state.data, candidates: [action.payload, ...state.data.candidates] },
      };
    case "UPDATE_CANDIDATE_STAGE":
      return {
        ...state,
        data: {
          ...state.data,
          candidates: state.data.candidates.map((candidate) =>
            candidate.id === action.id
              ? { ...candidate, stage: action.stage, updatedAt: TODAY }
              : candidate,
          ),
        },
      };
    case "ADD_LEAD":
      return { ...state, data: { ...state.data, leads: [action.payload, ...state.data.leads] } };
    case "UPDATE_LEAD_STAGE":
      return {
        ...state,
        data: {
          ...state.data,
          leads: state.data.leads.map((lead) =>
            lead.id === action.id ? { ...lead, stage: action.stage, lastContact: TODAY } : lead,
          ),
        },
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        data: { ...state.data, transactions: [action.payload, ...state.data.transactions] },
      };
    case "ADD_INVOICE":
      return {
        ...state,
        data: { ...state.data, invoices: [action.payload, ...state.data.invoices] },
      };
    case "UPDATE_INVOICE_STATUS":
      return {
        ...state,
        data: {
          ...state.data,
          invoices: state.data.invoices.map((invoice) =>
            invoice.id === action.id ? { ...invoice, status: action.status } : invoice,
          ),
        },
      };
    case "ADD_PROJECT":
      return {
        ...state,
        data: { ...state.data, projects: [action.payload, ...state.data.projects] },
      };
    case "ADD_TASK":
      return { ...state, data: { ...state.data, tasks: [action.payload, ...state.data.tasks] } };
    case "UPDATE_TASK_STATUS":
      return {
        ...state,
        data: {
          ...state.data,
          tasks: state.data.tasks.map((task) =>
            task.id === action.id ? { ...task, status: action.status } : task,
          ),
        },
      };
    case "ADD_CAMPAIGN":
      return {
        ...state,
        data: { ...state.data, campaigns: [action.payload, ...state.data.campaigns] },
      };
    case "ADD_AUDIT_EVENT":
      return {
        ...state,
        data: { ...state.data, auditEvents: [action.payload, ...state.data.auditEvents] },
      };
    case "NEW_CONVERSATION":
      return { ...state, conversations: [action.payload, ...state.conversations] };
    case "RENAME_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.id ? { ...conversation, title: action.title } : conversation,
        ),
      };
    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter((conversation) => conversation.id !== action.id),
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, action.message],
                updatedAt: action.message.createdAt,
              }
            : conversation,
        ),
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === action.messageId ? action.message : message,
                ),
              }
            : conversation,
        ),
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.id ? { ...notification, read: true } : notification,
        ),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  hydrated: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && parsed.data && parsed.settings)
          dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {
      // Ignore corrupted or unavailable local storage and keep the seeded workspace.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable in private browsing; the prototype still works in memory.
    }
  }, [state, hydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>{children}</AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}
