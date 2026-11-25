# TAG FOREST YA KWANZA - Implementation Plan (Phase 0 Output)

**Date:** 2026-11-12  
**Based on:** `docs/PROJECT_AUDIT.md`, `docs/DATABASE_AUDIT.md`, `docs/ERD.md`  
**Status:** Planning only (no destructive migrations, no frontend rewrite, no production data changes)

## 0. Preconditions and guardrails (must hold before structural changes)
- **Preserve existing public website/design:** keep current routes, visual identity, and content behavior intact while extending system.
- **Database-first truth:** do not create/modify schema until actual DB state is inspected and compared (authorized access required).
- **Security/secrets:** never print or commit credentials/tokens; never expose secrets to frontend.
- **Data safety:** no production DB reset/drop/destructive sync; reviewed migrations only, with backup and rollback/recovery plan.
- **Authorization:** backend-enforced RBAC/scopes for all protected operations (frontend checks are not sufficient).

## 1. Phase 0 completion status and immediate next actions

### Completed in this audit (non-destructive)
- Inspected workspace structure, frontend stack/pages/components, backend directory state, and local DB signals.
- Created Phase 0 documents: `PROJECT_AUDIT.md`, `DATABASE_AUDIT.md`, `ERD.md`, `IMPLEMENTATION_PLAN.md`.
- Confirmed: `backend/` empty; no in-repo DB schema/migrations/config; DB reachability detected but schema inspection unauthenticated/unverified.

### Immediate next actions (blocking for DB implementation)
1. **Obtain authorized DB access securely** (approved secret/config path) for read-only discovery of target environment(s).
2. **Run factual DB inventory**: DB names/schemas, tables, columns/types, PK/FK/unique/indexes, views/functions/triggers, migration history, seed scripts.
3. **Update `docs/DATABASE_AUDIT.md` and `docs/ERD.md`** with verified objects classified as existing/reusable, modify, missing, or deprecated-with-migration-plan.
4. **Produce schema comparison + migration strategy** (including data preservation, backup verification, rollback/recovery) before any migration execution.
5. **Decide backend bootstrap approach** in empty `backend/` (recommended NestJS + TypeScript + Prisma + PostgreSQL) aligned with verified architecture.

## 2. Phased implementation roadmap

### Phase 1 - Database architecture (after verified audit)
**Goals:** align target model to reality, establish safe persistence foundation.
- Finalize canonical data model (esp. payments/receipts/pledges/adjustments, users-vs-members separation).
- Create/extend Prisma schema and reviewed migrations for **missing** structures only after comparison.
- Define constraints/indexes for integrity and performance (FKs, uniques like member/receipt numbers, lookup indexes).
- Implement seed/config strategy for required reference data (e.g. roles/permissions/categories) without hardcoding secrets.
- Validate in development/staging with migration tests and existing-functionality checks.

**Deliverables:** migration plan, ERD updates (actual vs proposed), Prisma schema/migrations (if adopted), DB verification report.

### Phase 2 - Authentication and roles
- Implement auth (login/logout, JWT access/refresh, secure session handling) and user management foundations.
- Implement RBAC: 5 primary roles, multiple roles per user, delegated/scoped permissions, backend guards/policies.
- Add audit logging for role/permission changes and sensitive auth events.
- Prepare protected API patterns and authorization tests.

### Phase 3 - Membership
- Public registration flow -> secretary review -> pastor/admin approval workflow (no auto-approval).
- Member profile creation/linking to activated user account, unique member numbers, profile/location history/assignments.
- Member portal (own records only) with strict access controls.
- Preserve and migrate existing static/content representations where appropriate (without breaking public site).

### Phase 4 - Finance
- Canonical payments ledger, configurable contribution categories/campaigns/methods, cashier sessions, reconciliation primitives.
- Atomic confirmed-payment + official-receipt generation (PDF, verification code/QR metadata) with idempotency.
- Async receipt/notification delivery jobs and delivery-attempt tracking (WhatsApp/SMS/email as configured); manual retry support.
- Pledges with installment allocations and balance/status calculations; expenses/budgets/approvals; reversals/adjustments (no silent deletes).
- Financial reports/statements and audit trails.

### Phase 5 - Website CMS (preserve design)
- Backend-driven CMS for existing public pages/sections/media/settings with draft/preview/publish/unpublish and revisions.
- Predefined reusable section components mapped to current design system (no arbitrary HTML/CSS/JS injection).
- Admin UI integrated with same visual identity; migrate hardcoded content (`churchData`, static assets references) progressively.
- Ensure Website Admin cannot access finance/member-private data or technical styling/source editing.

### Phase 6 - Church activities
- Departments/fellowships, leader assignments/scopes, meetings, attendance, follow-up cases, tasks/assignments/progress.
- Reports and permissioned access (including additional controls for sensitive pastoral notes).

### Phase 7 - Dashboards and notifications
- Role-specific dashboards (admin/finance/secretary/member/website) with relevant summaries and alerts.
- In-app notifications and integration tracking for external channels; operational views for delivery/audit status.

### Phase 8 - Testing, hardening, and deployment
- Unit/integration/e2e coverage (frontend + backend), DB migration tests, security/authorization tests, idempotency and financial workflow tests.
- Performance/reliability checks for async jobs and reporting queries.
- Production build verification (frontend/backend), backup verification, deployment/runbook documentation, monitoring/logging readiness.

## 3. Cross-cutting workstreams (run throughout)
- **Design system extraction/reuse:** formalize shared tokens/components from current frontend for public/admin/member surfaces.
- **API/contracts:** typed REST + OpenAPI/Swagger, validation (DTO/Zod as applicable), consistent error/audit handling.
- **Security:** least privilege, secure file/media handling, rate/abuse considerations, input validation, auditability.
- **Observability/ops:** structured logs (no secrets), job monitoring, delivery/retry visibility, backup/restore procedures.
- **Documentation:** keep audits, ERD, migration notes, and operational docs updated per phase.

## 4. Verification gates (no phase marked complete without evidence)
- **Database gate:** real connection inspected, schema comparison documented, backup/migration/rollback plan reviewed, migrations tested.
- **Auth/RBAC gate:** backend authorization tests prove role/scope restrictions and multi-role behavior.
- **Membership gate:** registration->review->approval->activation flow tested; no pending auto-approval/member-account conflation.
- **Finance gate:** atomic payment+receipt, idempotent retries, pledge allocation correctness, reversals/adjustments audited, delivery retries tracked.
- **CMS gate:** content edits/publish/revisions work without breaking existing pages/design or allowing unsafe content injection.
- **Release gate:** builds/tests pass, security checks completed, backup verified, deployment docs current.

## 5. Key risks to manage
- **Unverified existing DB contents** on reachable server could conflict with proposed schema/names.
- **Financial correctness/auditability** (duplicates, pledge/payment confusion, receipt validity) requires strict transactional/idempotent design.
- **Permission complexity** (multiple roles + scoped access + sensitive pastoral/finance/member data).
- **Migration from static frontend content to CMS** without regressions to public UX/design.
- **Async delivery reliability** (provider failures, retries, idempotency, observability).

## 6. Recommended initial implementation sequence (once DB access is available)
1. Secure read-only DB discovery + update audit/ERD with facts.
2. Bootstrap `backend/` foundation (NestJS modules skeleton, config management, Prisma integration, health checks, OpenAPI).
3. Implement schema comparison and first reviewed migrations in dev environment.
4. Build auth/RBAC + audit primitives before domain modules depend on them.
5. Deliver membership and finance vertical slices with end-to-end tests and auditability.
6. Layer CMS migration and remaining modules, preserving existing public site throughout.
