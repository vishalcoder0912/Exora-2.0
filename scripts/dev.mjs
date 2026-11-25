import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);

const portFlagIndex = args.findIndex((arg) => arg === "-p" || arg === "--port");
const equalsPort = args
  .filter((arg) => arg.startsWith("--port="))
  .map((arg) => arg.slice("--port=".length))[0];
const port =
  equalsPort ?? (portFlagIndex >= 0 ? args[portFlagIndex + 1] : process.env.PORT) ?? "3000";

const routes = [
  ["/", "Redirects to the executive dashboard"],
  ["/dashboard", "Executive dashboard and KPI overview"],
  ["/ai", "AI Intelligence workspace with simulated tools"],
  ["/hr", "Employees, candidates, interviews, and offers"],
  ["/finance", "Transactions, invoices, budgets, and reports"],
  ["/sales", "Leads, deals, pipeline, and customers"],
  ["/operations", "Projects and operational tasks"],
  ["/marketing", "Campaigns, channels, and performance"],
  ["/tasks", "Personal and generated task queue"],
  ["/reports", "Report library and scheduled reports"],
  ["/activity", "Audit trail and system activity"],
  ["/settings", "Workspace, notifications, and AI settings"],
];

console.log("\nNEXUS ERP — application routes");
console.log(`Base URL: http://localhost:${port}\n`);
for (const [path, description] of routes) {
  console.log(`  ${path.padEnd(12)} ${description}`);
}
console.log("\nStarting Next.js development server...\n");

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
if (!existsSync(nextBin)) {
  console.error("Next.js is not installed. Run `npm install` first.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev", ...args], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (error) => {
  console.error("Failed to start Next.js:", error);
  process.exit(1);
});
