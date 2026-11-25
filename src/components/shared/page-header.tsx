import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  badge?: string;
}

export function PageHeader({ title, subtitle, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          {badge && (
            <Badge variant="secondary" className="font-medium">
              {badge}
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
