import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const positive = new Set([
  "Active",
  "Completed",
  "Paid",
  "Accepted",
  "Hired",
  "Won",
  "On track",
  "Success",
  "Approved",
  "Executed",
]);
const warning = new Set([
  "Pending",
  "Sent",
  "On leave",
  "Offer",
  "Selected",
  "Awaiting approval",
  "At risk",
  "In progress",
  "Paused",
]);
const critical = new Set([
  "Overdue",
  "Failed",
  "Rejected",
  "Delayed",
  "Inactive",
  "Lost",
  "Draft",
  "High",
]);
const info = new Set([
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Applied",
  "Screening",
  "Interview",
  "Scheduled",
  "Medium",
  "Low",
  "Open",
]);

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = positive.has(status)
    ? "border-positive/25 bg-positive/10 text-positive"
    : warning.has(status)
      ? "border-warning/30 bg-warning/10 text-warning"
      : critical.has(status)
        ? "border-critical/25 bg-critical/10 text-critical"
        : info.has(status)
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", tone, className)}>
      {status}
    </Badge>
  );
}
