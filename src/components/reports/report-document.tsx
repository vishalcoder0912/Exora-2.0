import { formatDate } from "@/lib/format";
import type { SeedData } from "@/types";

import type { ReportSection } from "./report-library";

interface ReportDocumentProps {
  title: string;
  kicker: string;
  companyName: string;
  sections: ReportSection[];
  data: SeedData;
  prompt?: string;
  generatedLabel?: string;
}

export function ReportDocument({
  title,
  kicker,
  companyName,
  sections,
  data,
  prompt,
  generatedLabel = "Generated just now",
}: ReportDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-3xl rounded-md border border-border bg-card px-6 py-7 text-foreground shadow-sm sm:px-10 sm:py-9">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            NEXUS · Intelligence report
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight">{title}</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">{kicker}</p>
        </div>
        <div className="text-right text-[10px] uppercase tracking-wide text-muted-foreground">
          <p className="font-semibold text-foreground">{companyName}</p>
          <p className="mt-1 text-positive">{generatedLabel}</p>
          <p className="mt-1">Confidential</p>
        </div>
      </header>

      {prompt && (
        <div className="mt-5 rounded-md border border-ai/20 bg-ai/[0.06] px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ai">
            Analysis request
          </p>
          <p className="mt-1 text-xs leading-relaxed text-foreground">{prompt}</p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-semibold tracking-tight">{section.heading}</h3>
              <span className="ml-auto h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <div className="mt-2 border-l border-border pl-4">
              <p className="text-xs leading-relaxed text-muted-foreground">{section.body}</p>
              {section.metrics && section.metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {section.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-md border border-border bg-background/60 px-2.5 py-2"
                    >
                      <p className="truncate text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[10px] text-muted-foreground">
        <span>Prepared from live NEXUS workspace data · {formatDate(data.today)}</span>
        <span>Internal use only</span>
      </footer>
    </article>
  );
}
