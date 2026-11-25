"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  departmentNavigation,
  mainNavigation,
  workspaceNavigation,
  type NavigationItem,
} from "@/components/layout/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

function NavigationGroup({
  title,
  items,
  collapsed,
  pathname,
  onNavigate,
}: {
  title: string;
  items: NavigationItem[];
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-6 first:mt-0">
      {!collapsed && (
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          {title}
        </p>
      )}
      <nav className={cn("mt-2 space-y-0.5", collapsed && "mt-0")} aria-label={title}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold tracking-tight text-primary-foreground">
          N
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-none tracking-tight text-foreground">
              NEXUS
            </p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              Intelligent Enterprise
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavigationGroup
          title="Main"
          items={mainNavigation}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <NavigationGroup
          title="Departments"
          items={departmentNavigation}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <NavigationGroup
          title="Workspace"
          items={workspaceNavigation}
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </div>

      <div className="border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-accent",
                collapsed && "justify-center",
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  AM
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">Alex Morgan</span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      Executive Administrator
                    </span>
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate}>
                <UserRound className="size-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate}>
                <Settings2 className="size-4" /> Preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => toast.info("Sign out is disabled in this demo workspace.")}
              className="text-critical"
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={onToggle}
          >
            <ChevronsLeft className="size-4" /> Collapse sidebar
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-2 w-full"
            onClick={onToggle}
            title="Expand sidebar"
          >
            <ChevronsRight className="size-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
