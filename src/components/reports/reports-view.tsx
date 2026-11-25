"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { downloadCsv } from "@/lib/format";
import { useApp } from "@/store/app-store";
import { ReportCard } from "./report-card";
import { ReportDocument } from "./report-document";
import {
  buildReportSections,
  getReportRows,
  REPORT_TEMPLATES,
  type ReportId,
  type ReportSection,
  type ReportTemplate,
} from "./report-library";

const DEFAULT_LAST_GENERATED: Record<ReportId, string> = {
  executive: "18 Nov 2026",
  hr: "20 Nov 2026",
  financial: "21 Nov 2026",
  sales: "19 Nov 2026",
  operations: "17 Nov 2026",
  marketing: "15 Nov 2026",
};

interface GeneratedReport {
  title: string;
  prompt: string;
  sections: ReportSection[];
}

export function ReportsView() {
  const { state } = useApp();
  const { data, settings } = state;
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatingId, setGeneratingId] = useState<ReportId | null>(null);
  const [generated, setGenerated] = useState<GeneratedReport | null>(null);
  const [lastGenerated, setLastGenerated] =
    useState<Record<ReportId, string>>(DEFAULT_LAST_GENERATED);
  const [preview, setPreview] = useState<ReportTemplate | null>(null);
  const [previewFresh, setPreviewFresh] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function generateCustom() {
    const request = prompt.trim();
    if (!request || generating || generatingId) return;
    setGenerating(true);
    timer.current = setTimeout(() => {
      setGenerated({
        title: "Custom AI Analysis",
        prompt: request,
        sections: buildReportSections("custom", data, settings.companyName, request),
      });
      setGenerating(false);
      toast.success("Report generated", { description: "Your custom analysis is ready below." });
    }, 850);
  }

  function generateTemplate(template: ReportTemplate) {
    if (generating || generatingId) return;
    setGeneratingId(template.id);
    timer.current = setTimeout(() => {
      setLastGenerated((current) => ({ ...current, [template.id]: "Just now" }));
      setGeneratingId(null);
      setPreview(template);
      setPreviewFresh(true);
      toast.success(`${template.title} generated`, { description: "A fresh preview is open." });
    }, 700);
  }

  function openPreview(template: ReportTemplate) {
    setPreview(template);
    setPreviewFresh(false);
  }

  function exportTemplate(template: ReportTemplate) {
    downloadCsv(`${template.id}-report-${data.today}.csv`, getReportRows(template.id, data));
    toast.success("CSV exported", { description: `${template.title} data was downloaded.` });
  }

  function exportCustom() {
    downloadCsv(`custom-analysis-${data.today}.csv`, getReportRows("custom", data));
    toast.success("CSV exported", { description: "The custom analysis data was downloaded." });
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Reports"
        subtitle="Generate, review and export data-backed reports across every department."
        badge={`${REPORT_TEMPLATES.length} templates`}
      />

      <SectionCard
        title="Generate a report with AI"
        description="Describe what you want to understand. NEXUS builds the document from live workspace data."
        contentClassName="pb-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generateCustom();
            }}
            placeholder="e.g. Compare revenue growth with hiring costs and highlight the biggest operational risks..."
            className="min-h-[84px] flex-1 resize-none border-ai/20 bg-ai/[0.03] text-sm focus-visible:ring-ai/40"
            aria-label="Report request"
          />
          <Button
            className="h-10 shrink-0 bg-ai text-white hover:bg-ai/90"
            onClick={generateCustom}
            disabled={!prompt.trim() || generating || generatingId !== null}
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Use ⌘ / Ctrl + Enter to generate.</span>
          <span>Grounded in revenue, hiring, sales and project records.</span>
        </div>
      </SectionCard>

      {generated && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{generated.title}</h2>
              <p className="mt-0.5 text-[11px] text-positive">
                Generated just now · {settings.modelLabel}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={exportCustom}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>
          <ReportDocument
            title={generated.title}
            kicker="Custom analysis · all departments"
            companyName={settings.companyName}
            sections={generated.sections}
            data={data}
            prompt={generated.prompt}
          />
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Report library</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ready-made reports you can generate, preview and export at any time.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {REPORT_TEMPLATES.map((template) => (
            <ReportCard
              key={template.id}
              template={template}
              lastGenerated={lastGenerated[template.id]}
              generating={generatingId === template.id}
              onPreview={() => openPreview(template)}
              onGenerate={() => generateTemplate(template)}
              onExport={() => exportTemplate(template)}
            />
          ))}
        </div>
      </section>

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="sr-only">
            <DialogTitle>{preview?.title ?? "Report preview"}</DialogTitle>
            <DialogDescription>
              {preview ? `Report preview for ${preview.department}.` : "Report preview."}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <>
              <ReportDocument
                title={preview.title}
                kicker={`${preview.department} · ${preview.cadence} report`}
                companyName={settings.companyName}
                sections={buildReportSections(preview.id, data, settings.companyName)}
                data={data}
                generatedLabel={
                  previewFresh
                    ? "Generated just now"
                    : `Last generated ${lastGenerated[preview.id]}`
                }
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => exportTemplate(preview)}>
                  <Download className="size-3.5" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  onClick={() => generateTemplate(preview)}
                  disabled={generating || generatingId !== null}
                >
                  {generatingId === preview.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Regenerate
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
