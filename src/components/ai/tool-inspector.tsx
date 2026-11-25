"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ToolStatusIcon } from "@/components/ai/response-blocks";
import type { ToolCallRecord } from "@/types";

interface ToolInspectorProps {
  toolCalls: ToolCallRecord[];
  defaultOpen?: boolean;
}

export function ToolInspector({ toolCalls, defaultOpen = false }: ToolInspectorProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completed = toolCalls.filter((call) => call.status === "completed").length;
  const totalMs = toolCalls.reduce((sum, call) => sum + call.durationMs, 0);

  if (toolCalls.length === 0) return null;

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-muted/25">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/50"
      >
        <Terminal className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-foreground">Tool activity</span>
        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-medium tabular-nums">
          {completed}/{toolCalls.length}
        </Badge>
        <span className="text-[10px] text-muted-foreground">· {totalMs}ms total</span>
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border bg-card/60 px-2 py-1.5">
          {toolCalls.map((call, index) => (
            <div key={call.id}>
              <button
                type="button"
                onClick={() => setExpandedId((current) => (current === call.id ? null : call.id))}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
              >
                <ToolStatusIcon status={call.status} />
                <span className="font-mono text-[10px] font-medium text-foreground">
                  {call.name}
                </span>
                <span className="hidden text-[10px] text-muted-foreground sm:inline">
                  · {call.department}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground">
                  {call.status === "completed" ? `${call.durationMs}ms` : call.status}
                </span>
                {expandedId === call.id ? (
                  <ChevronDown className="size-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3 text-muted-foreground" />
                )}
              </button>
              {expandedId === call.id && (
                <div className="mx-2 mb-2 rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[10px] leading-relaxed">
                  <p className="text-muted-foreground">
                    <span className="text-primary">args</span> {JSON.stringify(call.args)}
                  </p>
                  <p className="mt-1.5 text-foreground/80">
                    <span className="text-ai">result</span> {call.result || "Awaiting response…"}
                  </p>
                </div>
              )}
              {index < toolCalls.length - 1 && <div className="ml-[15px] h-2 w-px bg-border" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
