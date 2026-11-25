"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeDate } from "@/lib/format";
import { useApp } from "@/store/app-store";

export function NotificationSettings() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const notifications = state.notifications;
  const unread = notifications.filter((notification) => !notification.read).length;

  function markRead(id: string) {
    dispatch({ type: "MARK_NOTIFICATION_READ", id });
    toast.success("Notification marked as read");
  }

  function markAllRead() {
    dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" });
    toast.success("All notifications marked as read");
  }

  function resetDemo() {
    dispatch({ type: "RESET_DEMO" });
    window.dispatchEvent(new Event("nexus-reset-demo"));
    setResetOpen(false);
    toast.success("Demo data reset", { description: "The workspace is back to its seeded state." });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <SectionCard
        title="Notifications"
        description="Workspace alerts and upcoming deadlines."
        action={
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck /> Mark all as read
          </Button>
        }
      >
        <div className="divide-y divide-border rounded-lg border border-border">
          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
              No notifications.
            </p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="flex flex-wrap items-start gap-3 p-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                  <Bell className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-xs font-semibold ${notification.read ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <Badge
                        variant="outline"
                        className="border-primary/25 bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {relativeDate(notification.createdAt, state.data.today)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => router.push(notification.href)}
                  >
                    View
                  </Button>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[11px]"
                      onClick={() => markRead(notification.id)}
                    >
                      <Check /> Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Workspace data" description="Prototype controls">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold">Unread alerts</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{unread}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {unread === 0 ? "You are all caught up." : "Alerts need your attention."}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold">Reset demo data</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Restore all sample records, conversations, preferences, and notifications to their
              original state.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => setResetOpen(true)}
            >
              <RotateCcw /> Reset demo data
            </Button>
          </div>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data?"
        description="This clears local edits from this prototype and restores the original seeded workspace."
        confirmLabel="Reset workspace"
        destructive
        onConfirm={resetDemo}
      />
    </div>
  );
}
