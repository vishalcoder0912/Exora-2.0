"use client";

import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app-store";
import type { SettingsState } from "@/types";

type GeneralField = "companyName" | "companyEmail" | "timezone" | "currency";

const FIELDS: { key: GeneralField; label: string; placeholder: string }[] = [
  { key: "companyName", label: "Company name", placeholder: "Aether Technologies" },
  { key: "companyEmail", label: "Company email", placeholder: "contact@company.in" },
  { key: "timezone", label: "Timezone", placeholder: "Asia/Kolkata (IST)" },
  { key: "currency", label: "Reporting currency", placeholder: "INR (₹)" },
];

function payloadFor(field: GeneralField, value: string): Partial<SettingsState> {
  switch (field) {
    case "companyName":
      return { companyName: value };
    case "companyEmail":
      return { companyEmail: value };
    case "timezone":
      return { timezone: value };
    case "currency":
      return { currency: value };
  }
}

export function GeneralSettings() {
  const { state, dispatch } = useApp();
  const { settings } = state;
  const [draft, setDraft] = useState({
    companyName: settings.companyName,
    companyEmail: settings.companyEmail,
    timezone: settings.timezone,
    currency: settings.currency,
  });

  useEffect(() => {
    setDraft({
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      timezone: settings.timezone,
      currency: settings.currency,
    });
  }, [settings.companyName, settings.companyEmail, settings.timezone, settings.currency]);

  function saveField(field: GeneralField) {
    const value = draft[field].trim();
    if (!value) return;
    if (value === settings[field]) return;
    dispatch({ type: "UPDATE_SETTINGS", payload: payloadFor(field, value) });
    toast.success("Saved", {
      description: `${FIELDS.find((item) => item.key === field)?.label} updated.`,
    });
  }

  function saveAll() {
    const payload = {
      companyName: draft.companyName.trim() || settings.companyName,
      companyEmail: draft.companyEmail.trim() || settings.companyEmail,
      timezone: draft.timezone.trim() || settings.timezone,
      currency: draft.currency.trim() || settings.currency,
    };
    dispatch({ type: "UPDATE_SETTINGS", payload });
    setDraft(payload);
    toast.success("Saved", { description: "Company profile updated." });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <SectionCard
        title="Company profile"
        description="These details are used across reports, exports, and workspace headings."
        action={
          <Button size="sm" onClick={saveAll}>
            <Save /> Save changes
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`settings-${field.key}`}>{field.label}</Label>
              <Input
                id={`settings-${field.key}`}
                value={draft[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                }
                onBlur={() => saveField(field.key)}
              />
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Changes save automatically when a field loses focus, or use Save changes.
        </p>
      </SectionCard>

      <SectionCard title="Workspace" description="Current configuration snapshot">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{settings.companyName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{settings.companyEmail}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Timezone</span>
              <span className="font-medium">{settings.timezone}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{settings.currency}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Employees in workspace</span>
              <span className="font-medium tabular-nums">{state.data.employees.length}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
