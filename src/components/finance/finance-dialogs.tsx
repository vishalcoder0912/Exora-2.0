"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TODAY } from "@/data/seed";
import { createId, useApp } from "@/store/app-store";
import type { Department, Invoice, InvoiceStatus, Transaction, TransactionType } from "@/types";

export const FINANCE_DEPARTMENTS: Department[] = [
  "Engineering",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Marketing",
];

const INVOICE_STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Paid", "Overdue"];
const TRANSACTION_TYPES: TransactionType[] = ["Income", "Expense"];

function shiftDate(iso: string, days: number): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (label: string) => void;
}

export function AddTransactionDialog({ open, onOpenChange, onCreated }: DialogProps) {
  const { state, dispatch } = useApp();
  const categories = useMemo(
    () => Array.from(new Set(state.data.transactions.map((item) => item.category))).sort(),
    [state.data.transactions],
  );
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "Product sales");
  const [department, setDepartment] = useState<Department>("Finance");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("Expense");

  function reset() {
    setDescription("");
    setCategory(categories[0] ?? "Product sales");
    setDepartment("Finance");
    setAmount("");
    setType("Expense");
  }

  function changeOpen(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedDescription = description.trim();
    const value = Number(amount);
    if (!trimmedDescription) {
      toast.error("Enter a transaction description.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }

    const transaction: Transaction = {
      id: createId("TXN"),
      date: TODAY,
      description: trimmedDescription,
      category,
      department,
      amount: value,
      type,
      status: "Completed",
      reference: createId("REF"),
    };

    dispatch({ type: "ADD_TRANSACTION", payload: transaction });
    toast.success(`${type} of ₹${value.toLocaleString("en-IN")} recorded`);
    onCreated?.(trimmedDescription);
    changeOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>
            Record an income or expense entry dated today ({TODAY}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="transaction-description">Description</Label>
            <Input
              id="transaction-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Cloud infrastructure — November 2026"
            />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transaction-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="transaction-category" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transaction-department">Department</Label>
              <Select
                value={department}
                onValueChange={(value) => setDepartment(value as Department)}
              >
                <SelectTrigger id="transaction-department" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FINANCE_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="transaction-amount">Amount (₹)</Label>
              <Input
                id="transaction-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="150000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transaction-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                <SelectTrigger id="transaction-type" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateInvoiceDialog({ open, onOpenChange, onCreated }: DialogProps) {
  const { state, dispatch } = useApp();
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [department, setDepartment] = useState<Department>("Finance");
  const [status, setStatus] = useState<InvoiceStatus>("Draft");
  const [issueDate, setIssueDate] = useState(TODAY);
  const [dueDate, setDueDate] = useState(shiftDate(TODAY, 14));

  function reset() {
    setClient("");
    setAmount("");
    setDepartment("Finance");
    setStatus("Draft");
    setIssueDate(TODAY);
    setDueDate(shiftDate(TODAY, 14));
  }

  function changeOpen(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedClient = client.trim();
    const value = Number(amount);
    if (!trimmedClient) {
      toast.error("Enter a client name.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an invoice amount greater than zero.");
      return;
    }
    if (!issueDate || !dueDate) {
      toast.error("Choose both an issue date and a due date.");
      return;
    }

    const nextNumber =
      Math.max(
        80,
        ...state.data.invoices.map((invoice) => Number(invoice.number.split("-").at(-1)) || 0),
      ) + 1;

    const invoice: Invoice = {
      id: createId("INV-REC"),
      number: `INV-2026-${String(nextNumber).padStart(3, "0")}`,
      client: trimmedClient,
      amount: value,
      issueDate,
      dueDate,
      status,
      department,
    };

    dispatch({ type: "ADD_INVOICE", payload: invoice });
    toast.success(`Invoice ${invoice.number} created for ${trimmedClient}`);
    onCreated?.(invoice.number);
    changeOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>
            Invoice numbers are generated from the existing sequence.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-client">Client</Label>
              <Input
                id="invoice-client"
                value={client}
                onChange={(event) => setClient(event.target.value)}
                placeholder="e.g. Razorpay"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-amount">Amount (₹)</Label>
              <Input
                id="invoice-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="250000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-department">Department</Label>
              <Select
                value={department}
                onValueChange={(value) => setDepartment(value as Department)}
              >
                <SelectTrigger id="invoice-department" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FINANCE_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
                <SelectTrigger id="invoice-status" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-issue-date">Issue date</Label>
              <Input
                id="invoice-issue-date"
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoice-due-date">Due date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => changeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
