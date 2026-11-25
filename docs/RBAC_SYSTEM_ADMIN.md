# Database-Driven RBAC — Phase 1: SYSTEM ADMINISTRATOR

Status: **implemented and verified** (backend + frontend). No database reset; existing church functionality preserved. A one-off account cleanup was performed afterwards (see §9).

Workspace: `/home/karera/TAG PROJECT`

---

## 1. What was built

A real database-driven authorization layer, not a UI-only role label:

- Users can hold **multiple roles** (`UserRole`).
- Roles carry **granular permissions** (`RolePermission` → `Permission`).
- The backend resolves **effective permissions from the database on every request**.
- Role names in the JWT are ignored for authorization; the database is the source of truth.
- Account suspension and role revocation take effect **immediately** (no re-issue of tokens required).
- System Administrator controls users, roles, permissions, sessions, audit and configuration centrally.
- System Administrator does **not** automatically receive operational powers (finance writes, CMS publishing, membership approval). Those remain separated.

---

## 2. Database changes (additive only)

Applied with `prisma db push` against the existing `tag_church_db`. No tables were dropped, recreated or truncated.

### Extended models

`Role`
- `isSystem Boolean @default(false)` — protected system roles.
- `isActive Boolean @default(true)` — deactivating a role removes its access.
- relation `assignments RoleAssignmentHistory[]`.

`Permission`
- `module String?`, `action String?` — grouping for the permission catalogue.
- `isSystem Boolean @default(false)` — system permissions cannot be edited/deleted.
- index on `module`.

`RefreshToken`
- `revokedBy`, `lastUsedAt`, `userAgent`, `ip`, index on `revokedAt` — session management and rotation.

`User`
- relations `scopes UserScope[]`, `roleAssignments RoleAssignmentHistory[]`, `roleAssignmentsMade RoleAssignmentHistory[]`.

### New models

`RoleAssignmentHistory`
- `actorId`, `userId`, `roleId`, `roleName`, `action` (`ASSIGN` / `REVOKE`), `reason`, `createdAt`.
- indexes on user, actor and time.

`UserScope`
- `userId`, `scopeType` (`DEPARTMENT` / `FELLOWSHIP`), `scopeId`, `createdBy`.
- unique `(userId, scopeType, scopeId)`.
- Prepared for scoped roles (department/fellowship leaders) in the next phases.

### Seeded RBAC data

Idempotent seed: `npm run prisma:seed:rbac` (also called by the normal seed).

- **81 permissions** across 16 modules.
- **5 roles** (primary):
  - `SYSTEM_ADMIN`, `FINANCE_ADMIN`, `WEBSITE_ADMIN`, `CHURCH_SECRETARY`, `CHURCH_MEMBER`
- The seed only **adds** missing baseline grants. It never deletes administrator changes, users or roles.

---

## 3. Permission model

Permission codes follow `module.action`, for example:

- Users: `users.view`, `users.create`, `users.edit`, `users.suspend`, `users.assign_roles`, `users.reset_password`, `users.sessions_revoke`
- Roles: `roles.view`, `roles.create`, `roles.edit`, `roles.delete`, `roles.assign_permissions`, `roles.assign_system`
- Permissions: `permissions.view`, `permissions.manage`
- Membership: `members.view`, `members.approve`, `members.reject`, `members.review`, `members.export`, …
- Finance: `finance.contributions.create`, `finance.contributions.reverse`, `finance.expenses.approve`, `finance.reports.view`, …
- CMS: `cms.view`, `cms.create`, `cms.edit`, `cms.publish`, `cms.delete`, `cms.media.manage`
- Departments / fellowships / attendance / meetings / follow-up / tasks / reports / system / member self-service.

**System Administrator baseline (37 permissions)** includes users/roles/permissions/audit, session management, system settings/health/backup, read-only oversight (`members.view`, `members.export`, report permissions, `departments.view`, `attendance.view`, etc.).

It does **not** include operational write permissions such as:
`finance.contributions.create`, `finance.expenses.approve`, `cms.publish`, `members.approve`, `departments.edit`, `attendance.record`.

Those must be granted explicitly by policy.

---

## 4. Backend enforcement

New files:

- `src/rbac/permission-catalog.ts` — canonical permission catalogue and role matrix.
- `src/rbac/permissions.service.ts` — resolves effective access from DB (active user + active roles).
- `src/rbac/permissions.guard.ts` — enforces `@RequirePermissions(...)` / `@RequireAnyPermission(...)`.
- `src/rbac/require-permissions.decorator.ts`.
- `src/rbac/rbac.module.ts` (global).
- `src/admin/access-management.service.ts` — user, role, permission, session and history operations with transaction-safe auditing.
- `src/auth/login-throttle.service.ts` — login throttling.

Changed:

- `src/auth/jwt.strategy.ts` — validates the user against the DB on every request; rejects suspended/deleted users; loads roles from the database (revocation is immediate).
- `src/auth/auth.service.ts` — 15-minute access tokens, rotating refresh tokens (7 days), logout, sessions, effective permissions/dashboards in login and `/auth/me`, login success/failure auditing.
- `src/auth/auth.controller.ts` — `/login`, `/refresh`, `/logout`, `/me`, `/sessions`, `/sessions/:id`, `/sessions/revoke-all`.
- `src/auth/auth.module.ts` — JWT TTL `15m`, throttle provider.
- `src/admin/admin.controller.ts` — every endpoint now permission-guarded (no role-only access).
- `src/admin/admin.module.ts` — registers `AccessManagementService`.
- `src/admin/aliases.controller.ts` and `src/admin/oversight.controller.ts` — role + permission guards.
- `src/main.ts` — CORS allowlist (`CORS_ORIGINS`), security headers, validation pipe.

### API endpoints (System Administrator)

Users:
- `GET /api/admin/users` — pagination, search (`q`), status, role, date filters, status counts.
- `GET /api/admin/users/:id` — details, roles, scopes, effective permissions, sessions, role history, activity.
- `GET /api/admin/users/:id/activity`
- `GET /api/admin/users/:id/permissions`
- `POST /api/admin/users`
- `PATCH|PUT /api/admin/users/:id`
- `PATCH /api/admin/users/:id/roles` — `{ assign: [], revoke: [], reason }`
- `POST /api/admin/users/:id/reset-password` — returns one-time temporary password, revokes sessions.
- `POST /api/admin/users/:id/suspend`
- `POST /api/admin/users/:id/activate`
- `POST /api/admin/users/:id/sessions/revoke-all`

Roles and permissions:
- `GET /api/admin/roles`
- `GET /api/admin/roles/:id/users`
- `POST /api/admin/roles`
- `PATCH|PUT /api/admin/roles/:id`
- `PATCH /api/admin/roles/:id/status`
- `DELETE /api/admin/roles/:id`
- `PUT /api/admin/roles/:id/permissions`
- `GET /api/admin/permissions` — catalogue + grouped by module
- `POST /api/admin/permissions`
- `PATCH|PUT /api/admin/permissions/:id`
- `DELETE /api/admin/permissions/:id`

Governance:
- `GET /api/admin/role-assignments`
- `GET /api/admin/sessions`
- `DELETE /api/admin/sessions/:id`
- `GET /api/admin/audit-logs`
- `GET /api/admin/settings`, `PUT /api/admin/settings`
- `GET /api/admin/system/health`, `POST /api/admin/system/backup`, `GET /api/admin/system/backups`

Auth:
- `POST /api/auth/login` — returns access token, refresh token, user, permissions, scopes, dashboards, default dashboard.
- `POST /api/auth/refresh` — rotates refresh tokens.
- `POST /api/auth/logout` — revokes refresh token.
- `GET /api/auth/me` — trusted session snapshot.
- `GET /api/auth/sessions`, `DELETE /api/auth/sessions/:id`, `POST /api/auth/sessions/revoke-all`.

### Safety protections

- Cannot revoke/suspend the **last active System Administrator**.
- Cannot assign the `SYSTEM_ADMIN` role without `roles.assign_system`.
- Cannot grant yourself additional roles.
- System roles cannot be renamed or deleted.
- The `SYSTEM_ADMIN` role cannot be deactivated.
- Core System Administrator permissions cannot be removed from its own role (lockout prevention).
- Custom roles with assigned users cannot be deleted.
- Account suspension and role revocation revoke active refresh sessions.
- Password policy: minimum 8 characters with upper, lower and a number (when supplied by an administrator).
- Every sensitive operation writes an `AuditLog` entry; role changes also write `RoleAssignmentHistory`.
- Login throttling: 10 attempts per account+IP and 50 per IP per 15 minutes.

---

## 5. Frontend implementation

New shared components:

- `src/components/auth/PermissionGuard.tsx` — role and permission guards for routes.
- `src/pages/AccessDenied.tsx` — branded 403 page with required permission.
- `src/components/admin/RoleSwitcher.tsx` — workspace switcher for multi-role users.
- `src/components/admin/access/AccessUI.tsx` — page headers, stat cards, status badges, loading/empty/error states, pagination, date formatting.
- `src/lib/access.ts` — pure permission/dashboard helpers (unit-tested).

Updated:

- `src/lib/api.ts` — short-lived access token + automatic refresh-token rotation with single-flight refresh, retry once, and clean logout on failure.
- `src/contexts/AuthContext.tsx` — permissions, dashboards, scopes, active workspace, role switching re-validated against `/auth/me`.
- `src/pages/Login.tsx` — redirects by the backend-provided `defaultDashboard`.
- `src/components/admin/AdminLayout.tsx` — new 11-section System Administrator sidebar, permission-aware, with role switcher.
- `src/components/admin/MemberLayout.tsx` — role switcher added so multi-role users can return to staff workspaces.
- `src/App.tsx` — centralized permission-guarded routes and redirects from legacy paths.

New System Administrator pages (`src/pages/admin/access/`):

1. `SystemOverview.tsx` — live system overview.
2. `UserManagement.tsx` — professional user table, filters, create/edit, role assignment, password reset, suspension, session revocation, detail drawer with activity.
3. `RoleManagement.tsx` — role table, custom role creation, permission matrix, status, user list, protected system roles.
4. `PermissionManagement.tsx` — permission catalogue grouped by module with usage by role.
5. `RoleAssignment.tsx` — assign/revoke with reason + assignment history.
6. `AccountManagement.tsx` — active/suspended/pending accounts with quick actions.
7. `SessionManagement.tsx` — active sessions across users with revocation.
8. `AuditLogs.tsx` — filterable audit trail.
9. `SystemConfiguration.tsx` — database-backed configuration.
10. `ChurchWideReports.tsx` — read-only reporting hub.
11. `SystemHealth.tsx` — health, backups and security signals.

Sidebar (exact 11 sections):

1. System Overview
2. User Management
3. Role Management
4. Permission Management
5. Role Assignment
6. Account Management
7. Session Management
8. System Audit Logs
9. System Configuration
10. Church-Wide Reports
11. System Health

---

## 6. Verification evidence

### Backend authorization suite

Command:

```bash
cd backend
npm run test:rbac
```

Latest result: **42 passed, 0 failed** (re-run after the account cleanup).

The suite logs in as `sospeter@gmail.com` using `BOOTSTRAP_ADMIN_PASSWORD` and creates its own temporary `FINANCE_ADMIN`, `CHURCH_SECRETARY`, `WEBSITE_ADMIN` and `CHURCH_MEMBER` fixtures, which it deletes afterwards. It does not depend on the removed demo accounts.

Covers:
- Admin login and effective permissions/dashboards.
- User list/detail/create/role assign/role revoke/reset/suspend/activate/session revoke.
- Suspended account cannot log in.
- Self-privilege escalation blocked.
- Last System Administrator protections.
- `FINANCE_ADMIN`, `CHURCH_SECRETARY`, `WEBSITE_ADMIN`, `CHURCH_MEMBER` denied user management (403).
- System Administrator denied finance and CMS writes (403).
- Refresh-token rotation and reuse rejection.
- Custom role create/permissions/deactivate/delete.

### Frontend tests

Command:

```bash
cd frontend
npm test
```

Latest result: **3 test files, 10 tests passed**.
- Permission/dashboard helper logic.
- `PermissionGuard` allow / deny / redirect / loading behavior.

### Builds

- `backend npm run build` — passed.
- `frontend npm run build` — passed (chunk-size warning only).

### Live browser verification (Playwright MCP)

- Admin login lands on `/admin/dashboard`.
- 11-section sidebar renders.
- User Management, Roles, Permission dialog, Role Assignment, Account Status, Sessions, System Configuration, System Health, Reports Hub render with live data.
- Finance Admin visiting `/admin/users` sees the branded **403 Access Denied** page and only the Finance Operations sidebar.
- Multi-role user (`CHURCH_MEMBER` + `FINANCE_ADMIN`) receives two dashboards and can switch Finance ↔ Member.
- Revoking `FINANCE_ADMIN` immediately removes access to the finance workspace (403 on next navigation).

Screenshots captured during verification: `admin-dashboard.png`, `admin-create-user.png`, `admin-roles.png`, `admin-role-permissions.png`, `admin-role-assignment.png`, `admin-permissions.png`, `admin-system-config.png`, `admin-system-health.png`, `admin-reports-hub.png`, `role-switcher.png`.

---

## 7. How to run

```bash
# database is additive; do not reset
cd backend
npx prisma db push          # applies the RBAC additions
npx prisma generate
npm run prisma:seed:rbac    # idempotent permissions/roles
npm run build
node dist/src/main.js       # API on :5000

cd ../frontend
npm run dev                 # UI on :5173
```

The bootstrap account is created from environment variables, never from a hardcoded credential:

```env
BOOTSTRAP_ADMIN_EMAIL=sospeter@gmail.com
BOOTSTRAP_ADMIN_PASSWORD=<set locally in backend/.env>
```

- Current account: `sospeter@gmail.com` — `SYSTEM_ADMIN` (sole admin).
- `npm run prisma:seed` throws if either variable is missing.
- Do not commit the password or reuse it outside development.

---

## 8. Known limits and next phases

Phase 1 intentionally focused on SYSTEM_ADMIN. The following remain:

1. **Finance Administrator phase** — move finance endpoints to permission guards (`finance.*`), build `/finance/dashboard` modules (contributions, zaka, fungu la kumi, sadaka, pledges, expenses, budgets, receipts, reports, reconciliation) and enforce `FINANCE_ADMIN` scope.
2. **Website Administrator phase** — `/website/dashboard` modules and `cms.*` permission enforcement.
3. **Church Secretary phase** — `/secretary/dashboard`, registration review vs approval separation, attendance/follow-up modules.
4. **Church Member phase** — `/member/dashboard` modules and strict ownership checks on every member-scoped endpoint.
5. **Scoped/resource-level access (if needed later)** — department/fellowship resource scoping via `UserScope` can be introduced as a future enhancement; delegated/scoped role types (`FINANCE_COLLECTOR`, `DEPARTMENT_LEADER`, `FELLOWSHIP_LEADER`, `ATTENDANCE_OFFICER`) were removed from the system to keep RBAC clean (System Admin can assign/grant permissions to Church Secretary and other primary roles instead).
6. **Production hardening** — rotate JWT secret and default credentials, remove test data, use a shared rate-limit store (Redis) and managed secrets, enforce HTTPS/HSTS, add database-level audit immutability and restore-tested backups.
7. **Existing operational controllers** (`finance`, `cms`, `members`, `operations`) still use role guards during the transition; they will be migrated to permission guards in their respective phases. System Administrator write attempts are already denied by role separation and verified (403).

No fake statistics are used: every number shown comes from a live API backed by the database, or is explicitly reported as not configured.

---

## 9. Bootstrap account and one-off reset (2026-11-15)

The development database was deliberately cleaned so the church starts with one real administrator instead of test accounts.

**Pre-reset backup:** `/tmp/tag_before_cleanup_20261115-013830.dump` (80 KB, `pg_dump` format). Restore with `pg_restore` if the old data is ever needed.

**Removed in one transaction:** 6 test users, 2 test members, 2 contributions, 3 expenses, 1 pledge, 1 meeting, 28 refresh tokens, 190 audit logs and dependent rows.

**Created:** `sospeter@gmail.com` with role `SYSTEM_ADMIN`, status ACTIVE. Password is bcrypt-hashed from `BOOTSTRAP_ADMIN_PASSWORD`; it is not stored in documentation. The direct bootstrap hash is intentionally allowed to bypass the administrator-set password policy (which requires upper/lower/number). Change it through the normal admin password flow before production.

**Post-reset state:** 1 user, 0 members, 0 contributions, 0 expenses, 0 pledges, 0 meetings, 9 roles, 81 permissions. Verified: Sospeter login succeeds and lands on `/admin/dashboard`; the removed `admin@tagchurch.org` now returns 401.

**Security fix applied during the audit:** `members.service.ts` previously loaded the full linked `user` record for member detail and password-reset paths, exposing `passwordHash` in API responses. Both paths now select only safe fields (`id`, `email`, `phone`, `status`, `lastLoginAt`, `createdAt`). Verified against a temporary linked member: response keys contained no `passwordHash`; the probe data was then deleted, returning the database to 1 user / 0 members.
