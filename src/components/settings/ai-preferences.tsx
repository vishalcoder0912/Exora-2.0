"use client";

import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/store/app-store";
import type { SettingsState } from "@/types";

const RESPONSE_STYLES: SettingsState["responseStyle"][] = ["Concise", "Balanced", "Detailed"];
const DATA_SCOPES: SettingsState["dataScope"][] = [
  "All departments",
  "My department",
  "Executive only",
];

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}

export function AiPreferences() {
  const { state, dispatch } = useApp();
  const { settings } = state;

  function update(payload: Partial<SettingsState>, description: string) {
    dispatch({ type: "UPDATE_SETTINGS", payload });
    toast.success("AI preferences saved", { description });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <SectionCard
          title="AI behaviour"
          description="Control how NEXUS responds and what it is allowed to do."
          action={<StatusBadge status={settings.aiEnabled ? "Active" : "Paused"} />}
        >
          <div className="space-y-3">
            <ToggleRow
              label="Enable NEXUS Intelligence"
              description="Allow AI-assisted analysis and answers across the workspace."
              checked={settings.aiEnabled}
              onCheckedChange={(checked) =>
                update({ aiEnabled: checked }, `AI assistant ${checked ? "enabled" : "disabled"}.`)
              }
            />
            <ToggleRow
              label="Require approval for actions"
              description="Ask for confirmation before AI can send emails or create tasks."
              checked={settings.requireApproval}
              onCheckedChange={(checked) =>
                update(
                  { requireApproval: checked },
                  `Action approval ${checked ? "required" : "turned off"}.`,
                )
              }
            />
            <ToggleRow
              label="Show tool activity"
              description="Display the tools and data sources used for each AI response."
              checked={settings.showToolActivity}
              onCheckedChange={(checked) =>
                update(
                  { showToolActivity: checked },
                  `Tool activity ${checked ? "visible" : "hidden"}.`,
                )
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Response & data settings"
          description="Set the default answer style and the data available to the assistant."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium">Response style</p>
              <Select
                value={settings.responseStyle}
                onValueChange={(value) =>
                  update(
                    { responseStyle: value as SettingsState["responseStyle"] },
                    `Response style set to ${value}.`,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSE_STYLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium">Data scope</p>
              <Select
                value={settings.dataScope}
                onValueChange={(value) =>
                  update(
                    { dataScope: value as SettingsState["dataScope"] },
                    `Data scope set to ${value}.`,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SCOPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="Active model" description="Provisioned for this workspace">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-ai/25 bg-ai/5 p-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-ai/10 text-ai">
                <Bot className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{settings.modelLabel}</p>
                <p className="text-[11px] text-muted-foreground">
                  Managed locally · no external API key
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ai" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                AI answers are generated from the same sample data shown throughout this prototype.
                Approval and tool-activity preferences apply to every new session.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
