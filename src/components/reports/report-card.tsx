"use client";

import type { KeyboardEvent } from "react";
import { Download, Eye, Loader2, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReportTemplate } from "./report-library";

interface ReportCardProps {
  template: ReportTemplate;
  lastGenerated: string;
  generating: boolean;
  onPreview: () => void;
  onGenerate: () => void;
  onExport: () => void;
}

export function ReportCard({
  template,
  lastGenerated,
  generating,
  onPreview,
  onGenerate,
  onExport,
}: ReportCardProps) {
  const Icon = template.icon;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPreview();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Preview ${template.title}`}
      onClick={onPreview}
      onKeyDown={onKeyDown}
      className="group flex cursor-pointer flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <Badge variant="secondary" className="text-[10px] font-medium">
          {template.cadence}
        </Badge>
      </div>

      <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
        {template.title}
      </h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
        {template.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-medium">
          {template.department}
        </span>
        <span>Last generated {lastGenerated}</span>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Button
          size="sm"
          className="h-7 px-2 text-[11px]"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          {generating ? "Generating" : "Generate"}
        </Button>
        <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]" onClick={onPreview}>
          <Eye className="size-3" />
          Preview
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onExport}>
          <Download className="size-3" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}
