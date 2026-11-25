"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Menu, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { allNavigation } from "@/components/layout/navigation";

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenMobileNav: () => void;
}

export function Topbar({ onOpenSearch, onOpenMobileNav }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const current = allNavigation.find((item) => item.href === pathname);
  const label = current?.label ?? "Workspace";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link
          href="/dashboard"
          className="hidden text-muted-foreground hover:text-foreground sm:inline"
        >
          Workspace
        </Link>
        <ChevronRight className="hidden size-3.5 text-muted-foreground/60 sm:inline" />
        <span className="truncate font-medium">{label}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden h-8 w-52 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent md:flex lg:w-64"
        >
          <Search className="size-3.5" />
          <span className="truncate">Search anything...</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>
        <NotificationsPanel />
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-ai/20 bg-ai/[0.04] px-2.5 text-ai hover:bg-ai/10 hover:text-ai"
          onClick={() => router.push("/ai")}
        >
          <Sparkles className="size-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </div>
    </header>
  );
}
