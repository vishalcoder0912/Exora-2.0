const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absolute >= 10_000_000) return `${sign}₹${(absolute / 10_000_000).toFixed(2)}Cr`;
  if (absolute >= 100_000) return `${sign}₹${(absolute / 100_000).toFixed(1)}L`;
  if (absolute >= 1_000) return `${sign}₹${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}₹${absolute.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function parseDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

export function formatDate(value: string): string {
  const date = parseDate(value);
  return `${String(date.getUTCDate()).padStart(2, "0")} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatShortDate(value: string): string {
  const date = parseDate(value);
  return `${String(date.getUTCDate()).padStart(2, "0")} ${MONTHS[date.getUTCMonth()]}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${formatDate(value)} · ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function daysBetween(from: string, to: string): number {
  const start = parseDate(from).getTime();
  const end = parseDate(to).getTime();
  return Math.round((start - end) / 86_400_000);
}

export function daysWaiting(since: string, today: string): number {
  return Math.max(0, daysBetween(today, since));
}

export function relativeDate(value: string, today: string): string {
  const difference = daysBetween(today, value);
  if (difference === 0) return "Today";
  if (difference === 1) return "Yesterday";
  if (difference < 0) return `In ${Math.abs(difference)} days`;
  if (difference < 7) return `${difference} days ago`;
  if (difference < 30) return `${Math.floor(difference / 7)}w ago`;
  return formatShortDate(value);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(",")),
  ].join("\n");
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
