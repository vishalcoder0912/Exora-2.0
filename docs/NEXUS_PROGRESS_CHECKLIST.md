# NEXUS — Development Progress Checklist

**Product:** NEXUS — *Your business. Connected. Intelligent. In motion.*

**Progress:** 0 / 19 phases completed

Use this checklist to verify real functionality, not just generated pages. Tick a box only after it has been checked in the running app.

---

## Progress tracker

| # | Phase | Status |
|---|-------|--------|
| 1 | Product foundation | Not started |
| 2 | Executive dashboard | Not started |
| 3 | AI intelligence workspace | Not started |
| 4 | AI tool system | Not started |
| 5 | HR & Recruitment | Not started |
| 6 | Finance | Not started |
| 7 | Sales & CRM | Not started |
| 8 | Operations | Not started |
| 9 | Marketing | Not started |
| 10 | My Tasks | Not started |
| 11 | Reports | Not started |
| 12 | Approval system | Not started |
| 13 | Activity & Audit | Not started |
| 14 | Settings | Not started |
| 15 | Global search & notifications | Not started |
| 16 | Data consistency | Not started |
| 17 | UI/UX quality | Not started |
| 18 | Technical quality | Not started |
| 19 | Demo readiness | Not started |

---

## 1. Product foundation

- [ ] Product name and branding are consistent (NEXUS).
- [ ] The application has a defined design system.
- [ ] Colors, typography, spacing, borders, and icons are consistent.
- [ ] Light theme looks professional.
- [ ] The layout works at desktop resolution.
- [ ] Tablet layout is usable.
- [ ] Mobile layout is usable.
- [ ] Sidebar navigation is functional.
- [ ] Sidebar can collapse and expand.
- [ ] Active navigation state is correct.
- [ ] Breadcrumbs or page headers update correctly.
- [ ] Top search opens and works.
- [ ] Notification panel opens.
- [ ] Profile dropdown works.
- [ ] Command palette works.
- [ ] No unnecessary placeholder pages.

**Gate:** It should already look like one consistent enterprise product, not a collection of unrelated templates.

---

## 2. Executive dashboard

- [ ] KPI cards display data.
- [ ] KPI numbers are consistent with mock data.
- [ ] Revenue chart renders.
- [ ] Expense chart renders.
- [ ] Charts have tooltips.
- [ ] Date filter changes displayed data.
- [ ] Department performance is visible.
- [ ] AI Business Brief is visible.
- [ ] Business Brief contains actual mock-data insights.
- [ ] Attention Required section is populated.
- [ ] Overdue tasks are shown.
- [ ] Pending approvals are shown.
- [ ] Stale leads are shown.
- [ ] Overdue invoices are shown.
- [ ] Recent activity displays.
- [ ] Clicking KPI cards navigates to the relevant module.
- [ ] Clicking attention items opens the correct record or page.
- [ ] Ask AI button opens the AI workspace.

**Gate:** Dashboard numbers must be sourced from shared data — not manually invented separately inside each card.

---

## 3. AI intelligence workspace

### Chat experience

- [ ] AI workspace opens correctly.
- [ ] Chat input works.
- [ ] Enter sends a message.
- [ ] Shift+Enter creates a new line.
- [ ] Send button works.
- [ ] Empty message cannot be submitted.
- [ ] Loading state appears.
- [ ] User messages are visible.
- [ ] AI messages are rendered properly.
- [ ] Conversation remains visible after multiple messages.
- [ ] New conversation works.
- [ ] Conversation history works.
- [ ] Previous conversation can be reopened.
- [ ] Conversation can be renamed.
- [ ] Conversation can be deleted.
- [ ] History persists after refresh.

### AI intelligence

- [ ] AI recognizes HR-related questions.
- [ ] AI recognizes Finance-related questions.
- [ ] AI recognizes Sales-related questions.
- [ ] AI recognizes Operations-related questions.
- [ ] AI recognizes Marketing-related questions.
- [ ] AI can recognize cross-department questions.
- [ ] AI selects relevant tools.
- [ ] AI doesn't call irrelevant tools.
- [ ] AI can call multiple tools for a single question.
- [ ] Tool execution states are visible.
- [ ] Tool input parameters are displayed.
- [ ] Tool results are displayed.
- [ ] AI uses retrieved data to calculate results.
- [ ] AI provides understandable explanations.
- [ ] AI offers contextual follow-up suggestions.
- [ ] AI handles invalid or unsupported questions gracefully.

### AI answer quality

- [ ] Answers aren't just generic paragraphs.
- [ ] KPIs are used where appropriate.
- [ ] Tables appear when useful.
- [ ] Charts appear when useful.
- [ ] Risks are highlighted.
- [ ] Recommendations are actionable.
- [ ] Results can link back to relevant records.
- [ ] The AI doesn't fabricate data when data is missing.
- [ ] The AI doesn't show fake "analysis" that has no underlying tool execution.

**Gate:** Ask the AI a question that requires data from two departments. You should be able to see both tools execute and the final answer correctly combine the results.

---

## 4. AI tool system

- [ ] A central tool registry exists.
- [ ] Tools are organized by department.
- [ ] Tools have defined names.
- [ ] Tools have defined input parameters.
- [ ] Tool inputs are validated.
- [ ] Tools return structured data.
- [ ] Tools return errors safely.
- [ ] Tools have execution status.
- [ ] Tools have execution duration.
- [ ] Tool outputs can be inspected.
- [ ] Tool execution is separated from UI components.
- [ ] Tool results are reused for AI responses.
- [ ] Tools can update application state where appropriate.

| Tool | Expected |
|------|----------|
| `getCompanyOverview` | Company metrics |
| `getHiringReport` | Recruitment summary |
| `getCandidateList` | Candidate records |
| `getPayrollSummary` | Payroll data |
| `getFinancialSummary` | Revenue and expense |
| `getSalesPipeline` | Pipeline metrics |
| `getSalesLeads` | Lead records |
| `getOverdueTasks` | Overdue tasks |
| `getProjectStatus` | Project health |
| `getDepartmentWorkload` | Team capacity |
| `getCampaignPerformance` | Marketing results |
| `createTask` | Create tasks |
| `draftEmail` | Draft email |
| `sendEmail` | Simulated send |
| `updateLeadStatus` | Change lead stage |

**Gate:** If the AI can answer questions but the tool registry is not genuinely connected to its simulated data functions, the AI phase is not complete.

---

## 5. HR & Recruitment

- [ ] HR overview loads.
- [ ] Employee KPI cards work.
- [ ] Recruitment funnel works.
- [ ] Hiring trend chart works.
- [ ] Employee list loads.
- [ ] Employee search works.
- [ ] Employee filtering works.
- [ ] Employee details open.
- [ ] Add employee works.
- [ ] Candidate list loads.
- [ ] Candidate search works.
- [ ] Candidate filtering works.
- [ ] Candidate details open.
- [ ] Candidate stages can be updated.
- [ ] Interviews page works.
- [ ] Interview scheduling UI works.
- [ ] Offers page works.
- [ ] Offer status can be updated.
- [ ] Salary/package data is visible.
- [ ] Follow-up status is visible.
- [ ] Candidate communication history works.
- [ ] Candidate-related AI questions return correct data.

**Gate:** Add a candidate, change their stage, and verify that HR metrics and AI responses reflect that change.

---

## 6. Finance

- [ ] Finance overview loads.
- [ ] Revenue KPI is correct.
- [ ] Expenses KPI is correct.
- [ ] Net profit calculation is correct.
- [ ] Margin calculation is correct.
- [ ] Revenue vs expenses chart works.
- [ ] Cash flow chart works.
- [ ] Expense category chart works.
- [ ] Transactions table works.
- [ ] Transaction search works.
- [ ] Transaction filtering works.
- [ ] Add transaction works.
- [ ] Invoice list loads.
- [ ] Invoice statuses display correctly.
- [ ] Invoice details open.
- [ ] Create invoice works.
- [ ] Invoice status can be updated.
- [ ] Overdue invoices are highlighted.
- [ ] Finance data is available to AI.

**Gate:** Add a transaction and verify that financial KPIs/charts update appropriately, as applicable.

---

## 7. Sales & CRM

- [ ] Sales overview loads.
- [ ] Total leads metric is correct.
- [ ] Qualified leads metric is correct.
- [ ] Pipeline value is correct.
- [ ] Conversion rate is correct.
- [ ] Pipeline board loads.
- [ ] All pipeline stages are present.
- [ ] Lead cards display correct data.
- [ ] Lead stage can be changed.
- [ ] Stage changes persist.
- [ ] Leads table loads.
- [ ] Search works.
- [ ] Filters work.
- [ ] Add lead works.
- [ ] Edit lead works.
- [ ] Lead details open.
- [ ] Customer page works.
- [ ] Follow-up dates are visible.
- [ ] Stale leads are highlighted.
- [ ] AI can analyze pipeline.
- [ ] AI identifies leads that need attention.

**Gate:** Change a lead from Qualified to Proposal and verify the change is reflected everywhere the lead appears.

---

## 8. Operations

- [ ] Operations overview loads.
- [ ] Active projects metric works.
- [ ] Completed tasks metric works.
- [ ] Overdue tasks metric works.
- [ ] Team capacity metric works.
- [ ] Projects page loads.
- [ ] Project progress displays correctly.
- [ ] Project deadlines are visible.
- [ ] Project status is correct.
- [ ] Project details open.
- [ ] Create project works.
- [ ] Task list loads.
- [ ] Task search works.
- [ ] Task filters work.
- [ ] Create task works.
- [ ] Edit task works.
- [ ] Task priority can be changed.
- [ ] Task status can be changed.
- [ ] Task can be completed.
- [ ] Team workload page works.
- [ ] Overdue items are highlighted.
- [ ] AI can identify delayed projects.
- [ ] AI can recommend task priorities.

**Gate:** Create a task, assign it, change its status, and check that the workload and overdue summaries remain consistent.

---

## 9. Marketing

- [ ] Marketing overview loads.
- [ ] Total marketing spend is correct.
- [ ] Lead generation metric is correct.
- [ ] Conversion metric is correct.
- [ ] Cost per lead is calculated correctly.
- [ ] Campaign chart works.
- [ ] Channel chart works.
- [ ] Campaign table loads.
- [ ] Search works.
- [ ] Filtering works.
- [ ] Campaign details open.
- [ ] Create campaign works.
- [ ] Campaign status can be changed.
- [ ] AI can analyze campaigns.
- [ ] AI identifies best-performing campaigns.
- [ ] AI can compare marketing spend and outcomes.

**Gate:** Create a campaign and ensure its new record appears in the list and any relevant totals.

---

## 10. My Tasks

- [ ] All tasks display.
- [ ] Today's tasks display.
- [ ] Upcoming tasks display.
- [ ] Overdue tasks display.
- [ ] Completed tasks display.
- [ ] Task search works.
- [ ] Priority filtering works.
- [ ] Department filtering works.
- [ ] List view works.
- [ ] Kanban view works.
- [ ] Create task works.
- [ ] Edit task works.
- [ ] Mark completed works.
- [ ] Task changes persist.
- [ ] AI-created tasks appear here.
- [ ] Tasks created through the AI have correct assignees and deadlines.

**Gate:** A task created through the AI must appear in My Tasks, Operations, and relevant activity history.

---

## 11. Reports

- [ ] Reports page loads.
- [ ] Report categories are present.
- [ ] Executive reports display.
- [ ] HR reports display.
- [ ] Finance reports display.
- [ ] Sales reports display.
- [ ] Operations reports display.
- [ ] Marketing reports display.
- [ ] Report details open.
- [ ] Generate report works.
- [ ] Report generation loading state works.
- [ ] Report preview looks professional.
- [ ] Report data is consistent with modules.
- [ ] AI report generation works.
- [ ] Report export works.
- [ ] CSV export produces valid data.
- [ ] PDF export works if implemented.

**Gate:** Generate a report and confirm it uses the application's mock data rather than static hardcoded paragraphs.

---

## 12. Approval system

- [ ] AI can propose an action.
- [ ] Action card clearly describes what will happen.
- [ ] Sensitive actions require approval.
- [ ] Review action opens a detailed preview.
- [ ] Preview displays correct recipients/records.
- [ ] Action can be edited before approval.
- [ ] Action can be rejected.
- [ ] Approval confirmation works.
- [ ] Approved action executes.
- [ ] Execution success is displayed.
- [ ] Execution failure state exists.
- [ ] Rejected actions do not execute.
- [ ] Action status updates.
- [ ] Audit entry is generated.
- [ ] Duplicate action execution is prevented where appropriate.

- [ ] AI drafts an email.
- [ ] Email can be edited.
- [ ] Recipient can be removed.
- [ ] Email send requires approval.
- [ ] Send simulation updates communication history.
- [ ] AI proposes follow-up tasks.
- [ ] Tasks can be reviewed before creation.
- [ ] Approved tasks are actually created.
- [ ] AI proposes lead status update.
- [ ] User can approve/reject status update.

**Gate:** You must be able to trace any AI action from its proposal through approval to its final result.

---

## 13. Activity & Audit Log

- [ ] Activity page loads.
- [ ] Activities display.
- [ ] Timestamps are readable.
- [ ] Users are shown.
- [ ] Department is shown.
- [ ] Entity/record is shown.
- [ ] Action status is shown.
- [ ] Filters work.
- [ ] Search works.
- [ ] Activity details open.
- [ ] AI actions appear in the log.
- [ ] Approval status appears.
- [ ] Executed tool name appears.
- [ ] Failed actions are recorded.
- [ ] Rejected actions are recorded.
- [ ] Newly created records generate activity entries.

**Gate:** If you approve an AI action, you should be able to find that action in the audit log afterward.

---

## 14. Settings

- [ ] Settings page loads.
- [ ] General settings are editable.
- [ ] Company details can be updated.
- [ ] Users & Roles page works.
- [ ] Role labels are visible.
- [ ] Department management page works.
- [ ] AI Preferences page works.
- [ ] AI enabled/disabled setting works.
- [ ] Model label is displayed.
- [ ] Response style setting works.
- [ ] Data access scope is visible.
- [ ] Approval requirement setting works.
- [ ] Tool activity visibility setting works.
- [ ] Notifications settings work.
- [ ] Changes persist after refresh.

**Gate:** Settings must change application behavior or state — not just change the visual appearance of a toggle.

---

## 15. Global search & notifications

### Global search

- [ ] Search opens.
- [ ] Keyboard shortcut works.
- [ ] Search employees.
- [ ] Search candidates.
- [ ] Search leads.
- [ ] Search tasks.
- [ ] Search projects.
- [ ] Search invoices.
- [ ] Search campaigns.
- [ ] Results are categorized.
- [ ] Selecting a result opens the correct record.

### Notifications

- [ ] Notification badge count is correct.
- [ ] Notification panel opens.
- [ ] Notifications display.
- [ ] Mark as read works.
- [ ] Mark all as read works.
- [ ] Clicking a notification navigates correctly.
- [ ] Notifications update after actions.

**Gate:** Global search should help a user find an actual record in the application, not just match a few hardcoded names.

---

## 16. Data consistency

- [ ] Mock data is centralized.
- [ ] Employees use consistent IDs.
- [ ] Candidates use consistent IDs.
- [ ] Leads use consistent IDs.
- [ ] Tasks reference the correct employees.
- [ ] Projects reference the correct tasks.
- [ ] Offers reference the correct candidates.
- [ ] Transactions use consistent categories.
- [ ] Invoices use consistent customer records.
- [ ] Charts are calculated from data.
- [ ] KPI cards are calculated from data.
- [ ] AI answers use the same datasets.
- [ ] Search uses the same datasets.
- [ ] Newly created records are shared across modules.
- [ ] Updated records are reflected in every relevant view.
- [ ] Delete/update operations don't leave stale UI data.
- [ ] Totals don't contradict each other.
- [ ] Currency is consistent (₹ INR).
- [ ] Dates are consistent.
- [ ] Empty datasets are handled.

**Gate:** Change one record and check every location where that record or its metrics are used. No conflicting data should appear.

---

## 17. UI/UX quality

- [ ] No overflowing text.
- [ ] No overlapping components.
- [ ] No broken icons.
- [ ] No inconsistent spacing.
- [ ] No random font sizes.
- [ ] No excessive shadows.
- [ ] No unnecessary gradients.
- [ ] Tables are readable.
- [ ] Tables have empty states.
- [ ] Forms have validation.
- [ ] Dialogs are properly sized.
- [ ] Drawers work.
- [ ] Dropdowns work.
- [ ] Hover states are consistent.
- [ ] Buttons show loading states where needed.
- [ ] Buttons show success feedback.
- [ ] Skeleton loaders exist.
- [ ] Error states are handled.
- [ ] Toasts are used properly.
- [ ] No dead buttons.
- [ ] No broken navigation.
- [ ] No placeholder Lorem Ipsum.
- [ ] No fake charts with meaningless numbers.
- [ ] No unnecessary UI clutter.
- [ ] Mobile layout has been checked.

---

## 18. Technical quality

- [ ] No console errors.
- [ ] No React warnings.
- [ ] No broken routes.
- [ ] No missing imports.
- [ ] No TypeScript errors.
- [ ] No unnecessary duplicated components.
- [ ] Shared components are reusable.
- [ ] Services are separated from components.
- [ ] Mock data is separated from UI.
- [ ] State management is organized.
- [ ] Forms validate inputs.
- [ ] Loading states don't get stuck.
- [ ] Errors don't crash the entire application.
- [ ] Refreshing pages doesn't break routing.
- [ ] Local persistence works.
- [ ] No secret API keys are included.
- [ ] Performance is acceptable with tables and charts.

---

## 19. Final hackathon demo — the 7-minute NEXUS demo

1. [ ] **Executive overview** — open the dashboard and explain how the company is performing. Highlight revenue, operational risks, and AI-generated priorities.
2. [ ] **Ask the AI a complex question** — "Give me a company health report and tell me the three biggest problems we need to solve."
3. [ ] **Show its intelligence** — reveal tool activity. Show HR, Finance, Sales and Operations functions being called and the retrieved results.
4. [ ] **Investigate a department** — ask about pending offers, hiring numbers, salary commitments, or overdue follow-ups.
5. [ ] **Let AI take action** — ask it to draft follow-up emails or create tasks. Review the proposed action and approve it.
6. [ ] **Verify the action** — show the updated task or email history, then open the audit log to prove the action was recorded.
7. [ ] **Deliver the vision** — "Instead of navigating six different departments to understand a company, a manager can simply ask the company."

---

## The 5 things you should never compromise

1. **Real AI tool-calling simulation** — it must select and execute tools against shared data, not just produce text.
2. **Shared and consistent business data** — HR, Finance, Sales, and Operations must be connected by the same underlying records.
3. **Cross-department intelligence** — one question must be able to use data from multiple departments.
4. **Approval before execution** — AI proposes actions, users review, and approved actions change the data.
5. **Exceptional user experience** — every page should feel like part of the same polished, premium product.

---

## Phase review prompt

Paste this after every phase:

```text
Review the current NEXUS implementation against the project requirements and development checklist.

Do not add new features yet.
1. Inspect the existing implementation.
2. Identify incomplete, broken, placeholder, or nonfunctional features.
3. Test the existing interactions.
4. Check shared data consistency.
5. Check UI/UX quality and responsive behavior.
6. Identify errors, duplicated logic, and broken navigation.
7. List the issues grouped by severity: Critical, High, Medium, Low.
8. Fix the Critical and High issues first.
9. Do not redesign working pages unnecessarily.
10. At the end, provide a clear report of what is actually implemented, what was fixed, and what remains incomplete.

Do not claim something works unless it has actually been verified.
```

*Measure progress by how many boxes you can genuinely tick — not by how many pages were generated.*
