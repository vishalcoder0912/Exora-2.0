"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface DataTableFilter<T> {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, value: string) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  searchText: (row: T) => string[];
  filters?: DataTableFilter<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchText,
  filters = [],
  searchPlaceholder = "Search records...",
  pageSize = 8,
  onRowClick,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const processed = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let rows = data.filter((row) =>
      needle === "" ? true : searchText(row).some((value) => value.toLowerCase().includes(needle)),
    );

    for (const filter of filters) {
      const value = filterValues[filter.key];
      if (value && value !== "all") rows = rows.filter((row) => filter.predicate(row, value));
    }

    if (sort) {
      const column = columns.find((item) => item.key === sort.key);
      const valueOf = column?.sortValue;
      if (valueOf) {
        rows = [...rows].sort((a, b) => {
          const left = valueOf(a);
          const right = valueOf(b);
          const comparison =
            typeof left === "number" && typeof right === "number"
              ? left - right
              : String(left).localeCompare(String(right));
          return sort.direction === "asc" ? comparison : -comparison;
        });
      }
    }

    return rows;
  }, [data, filters, filterValues, columns, query, searchText, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: string) {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
    setPage(1);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 text-xs"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] ?? "all"}
            onValueChange={(value) => {
              setFilterValues((current) => ({ ...current, [filter.key]: value }));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
              <SlidersHorizontal className="mr-1 size-3.5 text-muted-foreground" />
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn("whitespace-nowrap text-[11px] font-semibold", column.className)}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      {column.header}
                      <span className="text-[9px] text-muted-foreground">
                        {sort?.key === column.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cn("text-xs", column.className)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Showing {processed.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, processed.length)} of {processed.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="tabular-nums">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
