# SYSTEM ADMIN — Audit and Improvement Plan

Date: 2026-11-15
Scope: SYSTEM_ADMIN church-wide oversight, reporting and professional admin experience.
Status: **audit complete; implementation not started pending approval.**

---

## 1. Constraints

- Do not rebuild the system from scratch.
- Preserve existing database records and relationships.
- Use additive schema changes only; no reset, no truncation.
- Keep role separation: SYSTEM_ADMIN oversees and reports; FINANCE_ADMIN, CHURCH_SECRETARY and WEBSITE_ADMIN keep their operational write powers.
- No mock, sample, placeholder or hardcoded statistics.
- Distinguish **zero** from **unavailable**. Never render an unavailable metric as `0`.
- Wait for approval before each major implementation stage.

Current account: `sospeter@gmail.com` — sole `SYSTEM_ADMIN` (37 permissions). Password is seeded from `BOOTSTRAP_ADMIN_PASSWORD`, not documented here. Pre-cleanup backup: `/tmp/tag_before_cleanup_20261115-013830.dump`.

---

## 2. What already works

| Area | Current capability | Evidence |
|---|---|---|
| Authentication | Login, refresh rotation, session revocation, suspension, throttling | `backend/src/auth/*`; login verified after reset |
| RBAC | 81 permissions, 9 roles, multi-role users, DB-validated guards | `backend/src/rbac/*`; backend e2e 42/42 |
| User administration | List/search users, create/edit, assign roles, reset password, suspend, revoke sessions | `/api/admin/users*`, `/admin/access/UserManagement.tsx` |
| Role/permission administration | Role CRUD, status, permission grants, assignment history | `/api/admin/roles*`, `/api/admin/permissions*` |
| Audit and sessions | Audit log list, active sessions, revoke | `/api/admin/audit-logs`, `/api/admin/sessions` |
| System controls | Health, backup listing/creation, settings, notifications | `/api/admin/system/*`, `/api/admin/settings` |
| Read-only oversight APIs | Membership, finance, departments, fellowships, meetings, attendance, follow-ups, tasks, projects, CMS, participation | `/api/admin/oversight/*`; 12 endpoints verified 200 for SYSADMIN |
| Membership workflow | Public registration, secretary approval/rejection, member numbering, temporary password | `/api/members/*` |
| Finance recording | Contributions, pledges, expenses, receipts (FINANCE_ADMIN) | `/api/finance/*` |
| CMS | Pages, announcements, events, sermons, leadership, ministries, media (WEBSITE_ADMIN writes; SYSADMIN reads) | `/api/cms/*` |
| Role separation | SYSADMIN write attempts on finance/CMS/members/operations are denied | 403 verification during Phase 1 |

---

## 3. What is partial

| Area | Current state | Why it falls short |
|---|---|---|
| Dashboard | `/admin/dashboard` shows users, roles, audit, technical health and a few oversight numbers | Technical-first, not church-first; no required 9-section layout; no clickable stat cards; weak zero/unavailable handling |
| Membership | `GET /members` returns **APPROVED only**; secretary UI has approve/reject | SYSADMIN has no member directory route; no status filters, search, pagination or counts; no member 360° detail |
| Reports | Generic table shell over oversight endpoints; membership and finance pages are minimal | No date range, filters, sorting, pagination, export/print, charts or consistent error/empty states |
| Organization | Lists for departments/fellowships and raw records for meetings/attendance/follow-ups/tasks | No detail pages; no member/task/attendance/finance breakdowns because relationships do not exist |
| Finance oversight | Aggregate totals and grouped categories | No transaction-level reporting, filters or audit trail; expense approval status is not modeled; "paid expenses" is actually the sum of all expenses; `pendingFinancialApprovals` is hardcoded `0` |
| Navigation | 11 technical groups plus legacy groups | Duplicated/overlapping entries; not the requested information architecture; some routes still role-only rather than permission-based |
| Website oversight | CMS counts report exists | No dedicated website overview or website reports section |
| Page shell | Existing AccessUI is functional | Inconsistent page headers, breadcrumbs, density and responsive behavior across legacy and new pages |

---

## 4. What is missing

1. Church-wide dashboard with the nine required blocks, real values, explicit metric states and clickable cards.
2. SYSADMIN member directory, filters, status counts and member detail with the 10 required sections.
3. Department/fellowship detail views with tabs and comparisons.
4. Finance oversight pages for contributions, expenses, budgets and pledges with filters and transaction detail.
5. Expense approval/reversal reporting and true pending-approval counts.
6. Date-range, category, collector, department and status filters across reports.
7. Permission-aware CSV/print export.
8. Website overview and website reports pages.
9. Backups as a first-class navigation item.
10. Standard loading, empty, error and partial-data states.
11. Permission-based route gating for legacy pages that still use role-only guards.
12. Additive schema relationships needed to report by department/fellowship.

---

## 5. Data-model blockers (critical)

| Requirement | Current model | Blocker |
|---|---|---|
| Members by department | `Member.preferredDepartment String?` | Free text, no FK; cannot join or count reliably |
| Members by fellowship | none | No relation at all |
| Department performance | `Department` has `name`, `description`, `headName`, `status` | No member, task, project, meeting or finance relations |
| Fellowship participation | `Fellowship` has `name`, `description`, `leaderName`, `schedule`, `status` | No member, meeting or attendance relations |
| Finance by department | `Contribution`, `Expense`, `Budget` | No `departmentId` |
| Expense approval | `Expense` has no status/approval fields | Cannot report approved, pending or rejected expenses |
| Expense recorder | `Expense.recordedById String?` without a Prisma relation | Cannot safely display recorder identity |
| Pledge recorder | `Pledge.recordedById String?` without a Prisma relation | Same |
| Project ownership | `Project` has no department relation | No department project reporting |
| Task ownership | `Task.assignedTo String?` only | No user/department reliability |
| Meeting ownership | `Meeting` has no department/fellowship relation | No scoped attendance reporting |

### Recommended additive schema (Option A — recommended)

Nullable columns and relations only; no existing column removed or renamed. Backfill only exact, unambiguous name matches; never invent assignments.

- `Member`: `departmentId String?`, `fellowshipId String?` (+ relations, indexes).
- `Department`: `leaderUserId String?` (+ relation); keep `headName` for compatibility.
- `Fellowship`: `leaderUserId String?` (+ relation); keep `leaderName`.
- `Contribution`: `departmentId String?`, `reversedAt DateTime?`, `reversedById String?`, `reversalReason String?`.
- `Expense`: `status ExpenseStatus @default(APPROVED)`, `approvedById String?`, `approvedAt DateTime?`, `reversedAt DateTime?`, `reversalReason String?`, `departmentId String?`, `projectId String?`, plus `recordedBy`/`approvedBy` relations.
- `Pledge`: `departmentId String?`, plus a `recordedBy` relation.
- `Budget`: `departmentId String?`.
- `Project`: `departmentId String?`.
- `Task`: `departmentId String?`, `assignedToUserId String?` (+ relation); keep `assignedTo`.
- `Meeting`: `departmentId String?`, `fellowshipId String?`.
- `ExpenseStatus`: `PENDING`, `APPROVED`, `REJECTED`, `REVERSED`. Existing expenses backfill to `APPROVED` only if that matches the real prior workflow; otherwise use `PENDING` and state it.

### Option B (no schema change)

Ship read-only pages that use only existing fields and explicitly label department/fellowship finance, expense approvals, recorder identity and task ownership as **not tracked**. This is faster but does not meet the full reporting specification.

**Decision requested before Stage 3.**

---

## 6. Proposed navigation

```
CHURCH OVERVIEW
  Church Dashboard
  Church Insights

MEMBERSHIP
  Member Directory
  Pending Registrations
  Membership Reports

CHURCH ORGANIZATION
  Departments
  Fellowships
  Attendance
  Meetings
  Follow-Up
  Tasks & Performance
  Projects

FINANCIAL OVERSIGHT
  Finance Overview
  Contributions
  Expenses
  Budgets & Pledges
  Finance Reports

SYSTEM ADMINISTRATION
  Users
  Roles & Permissions
  Role Assignments
  User Activity
  Audit Logs
  System Health
  Backups

SYSTEM
  Settings
  Notifications
  Sessions

PUBLIC WEBSITE
  Website Overview
  Pages & Content
  Announcements & Events
  Sermons & Media

PUBLIC WEBSITE REPORTS
  Website Reports
```

Rules:
- One canonical route per item; legacy duplicates redirect.
- Every item is permission-gated; hidden when the permission is absent.
- SYSADMIN finance/member/website pages are read-only and hide operational buttons.
- Breadcrumbs and page titles follow the group name.

---

## 7. Staged implementation

### Stage 1 — Shell, navigation and church dashboard

- Rebuild the SYSADMIN shell around the navigation above; remove the "Church-Wide Reports" duplicate group.
- Standardize page header, breadcrumbs, cards, stat blocks, loading, empty and error states.
- Replace the technical-first dashboard with nine sections:
  1. Church summary (members, new members, attendance, departments, fellowships, projects).
  2. Membership overview (pending, approved, rejected, inactive, new this month).
  3. Church organization (departments/fellowships, leaders, meetings).
  4. Financial oversight (contributions, expenses, net recorded movement, pledges, budgets).
  5. Attendance (recent meetings, attendance rate where the denominator exists).
  6. Follow-up and pastoral care (open cases, due, overdue; no sensitive notes).
  7. Tasks and projects (open, overdue, active projects, budget usage).
  8. Website and communication (published pages, announcements, events, sermons).
  9. System administration (users, roles, sessions, audit events, database/backup status).
- Each metric returns `{ value, state: 'ok' | 'zero' | 'unavailable' | 'error', asOf, source }`.
- Stat cards link to the filtered destination.
- Affected: `frontend/src/components/admin/AdminLayout.tsx`, `AccessUI.tsx`, `SystemOverview.tsx` (becomes Church Dashboard), `App.tsx`, `frontend/src/index.css`; `backend/src/admin/oversight.{controller,service}.ts` or a dedicated dashboard service.

**Acceptance:** Sospeter logs in and sees a church-first dashboard; every number is live or explicitly unavailable; all cards navigate; no console errors; empty database renders honest zero states.

### Stage 2 — Membership oversight

- Backend: `GET /admin/members` with `status`, `q`, `gender`, `department`, `from`, `to`, `page`, `pageSize`; status counts; `GET /admin/members/:id/oversight` with safe user fields, contributions, attendance, follow-ups (notes redacted), audit history and registration data; permission-aware CSV.
- Frontend: `Member Directory`, `Pending Registrations`, `Membership Reports`; member detail with the 10 required sections.
- Keep approve/reject/reset buttons visible only with `members.approve` / `members.reject` / `members.reset_password`; SYSADMIN has read-only by default.
- Affected: `backend/src/members/{members.controller,members.service}.ts` or new `admin/members` module; `frontend/src/pages/admin/members/*`, `MembersDirectory.tsx`, `AdminRegistrations.tsx`, `App.tsx`.

**Acceptance:** filters and counts match the database; no `passwordHash`; denied users cannot read; read-only SYSADMIN sees no mutating controls.

### Stage 3 — Church organization

- Backend: paginated department/fellowship/meeting/attendance/follow-up/task/project oversight endpoints with filters and detail aggregation.
- Frontend: list + detail tabs:
  - Departments: overview, members, attendance, finance, meetings, tasks, projects.
  - Fellowships: overview, members, attendance, meetings.
  - Attendance/meetings/follow-ups/tasks/projects: consistent tables and detail.
- Apply Option A schema if approved; otherwise show "not tracked" for unsupported panels.
- Affected: `backend/src/operations/*`, `backend/src/admin/oversight.*`, `backend/prisma/schema.prisma`; `frontend/src/pages/admin/operations/*`, `org/*`, `App.tsx`.

**Acceptance:** only real relations are shown; unavailable panels are labeled, never zero-filled.

### Stage 4 — Financial oversight

- Backend: transaction-level reports for contributions, expenses, pledges and budgets; filters for date, category, status, collector/recorder, department, project; pagination; summary with explicit "net recorded movement" (not "available balance"); expense approval/reversal states; receipt links.
- Frontend: `Finance Overview`, `Contributions`, `Expenses`, `Budgets & Pledges`, `Finance Reports`; read-only for SYSADMIN.
- Do not invent a bank balance. If reconciliation data does not exist, return `unavailable`.
- Affected: `backend/src/finance/*`, `backend/src/admin/oversight.*`, `backend/prisma/schema.prisma`; `frontend/src/pages/admin/finance/*`, `reports/FinanceReport.tsx`, `App.tsx`.

**Acceptance:** totals reconcile to the transaction tables; pending approvals are computed; no write controls for SYSADMIN.

### Stage 5 — Website and reports

- Website overview: published/draft pages, announcements, events, sermons, media.
- Website reports: content counts, recent activity, publication status.
- Standard report shell: date range, filters, sorting, pagination, CSV/print behind `reports.*`/`members.export`.
- Affected: `backend/src/cms/*`, `backend/src/admin/oversight.*`; `frontend/src/pages/admin/cms/*`, `reports/*`, `App.tsx`.

**Acceptance:** exports match the on-screen filters; no fake content activity.

### Stage 6 — Administration polish

- Improve user/role/permission screens: clearer role assignment, permission diff preview, assignment history, confirmation dialogs, session detail, audit filters.
- Add Backups, Notifications and Settings under the requested groups.
- Affected: `frontend/src/pages/admin/access/*`, `App.tsx`, `AdminLayout.tsx`.

**Acceptance:** all destructive actions require confirmation; errors are actionable; permission changes are auditable.

### Stage 7 — Verification and documentation

- Backend e2e: member oversight access, no hash leak, finance filter math, expense status counts, unauthorized 403s.
- Frontend tests: route visibility, dashboard states, member filters, empty states.
- Browser checks at desktop and mobile widths.
- Update this document and `docs/RBAC_SYSTEM_ADMIN.md` with final behavior.

---

## 8. Correctness and security fixes

### Fixed

- `members.service.ts` member detail and reset-password paths no longer load the full `user` record. Verified: probe response contained no `passwordHash`; probe rows deleted.
- Account cleanup completed with backup and post-reset verification.

### Queued

- Remove/replace hardcoded `pendingFinancialApprovals: 0`.
- Rename `paidExpenses` to reflect what it actually measures, or compute it correctly after expense status exists.
- Stop treating `findAll()` (approved only) as "all members".
- Replace `?? '—'` fallbacks that hide zero vs unavailable.
- Migrate legacy role-only routes to permission guards.
- Ensure no page renders totals without a source timestamp.

---

## 9. Decisions required before implementation

1. **Approve Option A additive schema** (recommended) or choose Option B read-only limits.
2. **Department/fellowship assignment ownership:** who assigns members — secretary, leaders, or SYSADMIN? Backfill exact `preferredDepartment` matches only?
3. **Expense workflow:** confirm FINANCE_ADMIN approves, SYSADMIN only views. Define allowed transitions (PENDING → APPROVED/REJECTED; APPROVED → REVERSED).
4. **"Available balance":** add reconciliation data, or show "net recorded movement" only? Recommendation: net recorded movement until reconciliation exists.
5. **Reporting period:** calendar year vs fiscal year; timezone `Africa/Dar_es_Salaam`.
6. **Pastoral privacy:** keep follow-up note content hidden from SYSADMIN. Confirm.
7. **Export permissions:** `members.export`, `finance.reports.export`, `reports.*.export`? Recommendation: reuse existing view permissions plus explicit export.
8. **Bootstrap password:** change `sospeter@2026` through the admin password flow before production (it bypasses the upper/lower/number policy because it was seeded directly).

---

## 10. Verification plan

- `cd backend && npm run test:rbac` — existing 42 checks stay green.
- New backend e2e for every new endpoint: allowed, denied, filtered, empty and no-secret assertions.
- `cd backend && npm run build`.
- `cd frontend && npm test` and `npm run build`.
- Browser: Sospeter login → each nav item → empty states → filters → detail pages → 403 route checks.
- Database assertions after each stage: record counts unchanged except explicitly created test fixtures, which are removed.

No implementation stage starts until the corresponding decisions above are approved.
