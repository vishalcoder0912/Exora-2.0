import { describe, expect, it } from "vitest";

import { seedData } from "@/data/seed";

describe("NEXUS seed data", () => {
  it("contains the specified record counts", () => {
    expect(seedData.employees).toHaveLength(30);
    expect(seedData.candidates).toHaveLength(40);
    expect(seedData.interviews).toHaveLength(15);
    expect(seedData.offers).toHaveLength(12);
    expect(seedData.leads).toHaveLength(30);
    expect(seedData.customers).toHaveLength(12);
    expect(seedData.transactions).toHaveLength(50);
    expect(seedData.invoices).toHaveLength(15);
    expect(seedData.projects).toHaveLength(10);
    expect(seedData.tasks).toHaveLength(50);
    expect(seedData.campaigns).toHaveLength(8);
    expect(seedData.auditEvents).toHaveLength(20);
  });

  it("keeps headline figures consistent across the workspace", () => {
    expect(seedData.metrics.totalEmployees).toBe(248);
    expect(seedData.metrics.monthlyRevenue).toBe(4_280_000);
    expect(seedData.metrics.pipelineValue).toBe(12_400_000);
    expect(seedData.metrics.overdueTasks).toBe(12);

    const income = seedData.transactions
      .filter((transaction) => transaction.type === "Income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = seedData.transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    expect(income).toBe(seedData.metrics.monthlyRevenue);
    expect(expense).toBe(2_610_000);
    expect(seedData.leads.reduce((sum, lead) => sum + lead.value, 0)).toBe(
      seedData.metrics.pipelineValue,
    );
  });

  it("matches the attention-list counts", () => {
    expect(seedData.candidates.filter((candidate) => candidate.stage === "Hired")).toHaveLength(11);
    expect(seedData.offers.filter((offer) => offer.status === "Awaiting approval")).toHaveLength(3);
    expect(seedData.invoices.filter((invoice) => invoice.status === "Overdue")).toHaveLength(2);
    expect(
      seedData.tasks.filter(
        (task) =>
          task.status !== "Completed" && task.dueDate < seedData.today && task.priority === "High",
      ),
    ).toHaveLength(4);
  });
});
