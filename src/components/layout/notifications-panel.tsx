"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export function NotificationsPanel() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const unread = state.notifications.filter((notification) => !notification.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-critical text-[9px] font-semibold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted-foreground">{unread} unread</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {state.notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={cn(
                "flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent/60",
                !notification.read && "bg-primary/[0.03]",
              )}
              onClick={() => {
                dispatch({ type: "MARK_NOTIFICATION_READ", id: notification.id });
                router.push(notification.href);
              }}
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  notification.read ? "bg-border" : "bg-primary",
                )}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium">{notification.title}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {notification.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
