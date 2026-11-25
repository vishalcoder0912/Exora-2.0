"use client";

import { useState } from "react";

import { AiPreferences } from "@/components/settings/ai-preferences";
import { DepartmentsSettings } from "@/components/settings/departments-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { UsersRoles } from "@/components/settings/users-roles";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/store/app-store";

const TABS = [
  { value: "general", label: "General" },
  { value: "users", label: "Users & Roles" },
  { value: "departments", label: "Departments" },
  { value: "ai", label: "AI Preferences" },
  { value: "notifications", label: "Notifications" },
];

export function SettingsWorkspace() {
  const { state } = useApp();
  const [tab, setTab] = useState("general");
  const unread = state.notifications.filter((notification) => !notification.read).length;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        subtitle="Manage company details, access, AI behaviour, and workspace data."
        badge={state.settings.companyName}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
          {TABS.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="relative rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {item.label}
              {item.value === "notifications" && unread > 0 && (
                <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                  {unread}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersRoles />
        </TabsContent>
        <TabsContent value="departments" className="mt-4">
          <DepartmentsSettings />
        </TabsContent>
        <TabsContent value="ai" className="mt-4">
          <AiPreferences />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </main>
  );
}
