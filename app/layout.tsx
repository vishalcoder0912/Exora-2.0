import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/store/app-store";
import "@/styles.css";

export const metadata: Metadata = {
  title: {
    default: "NEXUS — Intelligent Enterprise",
    template: "%s | NEXUS",
  },
  description: "Your business. Connected. Intelligent. In motion.",
  openGraph: {
    title: "NEXUS — Intelligent Enterprise",
    description:
      "One workspace to understand your business, connect your teams, and move work forward with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" richColors closeButton />
        </AppProvider>
      </body>
    </html>
  );
}
