"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  width?: string;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "sm:max-w-lg",
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`w-full overflow-y-auto p-0 sm:max-w-lg ${width}`}>
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-6 py-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
