# TAG FOREST YA KWANZA - Database Audit (Phase 0)

**Audit date:** 2026-11-12  
**Scope:** Workspace and locally accessible database signals only  
**Policy:** No credentials printed or exposed; no destructive actions; no schema/data changes performed

## 1. Database technology and version (verified status)
- **PostgreSQL tooling available on host:** `psql`, `pg_isready` detected.
- **Runtime signal:** `pg_isready -h localhost -p 5432` reports **accepting connections**.
- **Container signal:** `docker ps` shows PostgreSQL containers running on host (including an `airflow_postgres_1` service using `postgres:13` image; port mapping not externally exposed in container listing).
- **Verified DB version for TAG project:** **Not verified** (cannot query server version/catalog without authorized, non-interactive credentials).

## 2. Database connection status (no credentials exposed)
- **Workspace config files:** No `.env*`, `docker-compose*`, `schema.prisma`, or backend DB connection code found in `/home/karera/TAG PROJECT`.
- **Environment variable discovery:** No `DATABASE_URL`/DB connection variable definitions found in project files.
- **Connection attempt result:** `psql -h localhost -p 5432 -lqt` could not authenticate without supplied credentials (authentication required). **Inspection did not succeed beyond reachability check.**
- **Conclusion:** Database reachability is indicated, but **authorized access to inspect schemas/tables for this project is unavailable** from current workspace context.

## 3. Existing database names and schemas
- **Verified:** None for TAG project.
- **Unknown/unverified:** Names/schemas on the reachable PostgreSQL instance (listing requires authenticated access).

## 4. Existing tables and their purposes
- **Verified in workspace:** None (no DB schema/migrations/models in repo).
- **Verified on server:** Not inspectable without authorized connection.
- **Classification:** No confirmed existing TAG tables identified; potential server contents unknown.

## 5. Important columns and data types
- **Verified:** Not available (no accessible schema metadata).

## 6. Primary and foreign-key relationships
- **Verified:** Not available (no accessible schema metadata / no local schema definitions).

## 7. Existing indexes and constraints
- **Verified:** Not available.

## 8. Existing views and triggers
- **Verified:** Not available.

## 9. Existing migrations
- **Workspace migration history:** None found (`prisma/migrations`, migration files, or other migration artifacts not present).
- **Prisma schema files:** None found.
- **Server migration tables (e.g. `_prisma_migrations`):** Not verifiable without DB access.

## 10. Existing data that must be preserved
- **Verified project database data:** None identified/accessible.
- **Precaution:** Treat any unknown data on the reachable PostgreSQL instance as **must-preserve** until proven otherwise. No drops/resets/truncations permitted.

## 11. Missing database structures (target CMS/ChMS needs vs verified state)
Because no TAG-specific schema is verified, the following target domains appear **missing or unverified** and must be compared against the actual DB once access is granted:
- Auth/RBAC: users, roles, permissions, user_roles, role_permissions, user_scopes, refresh_tokens
- Membership: member_registrations, member_approvals, members, member_location_history, member_assignments
- Finance: canonical payments ledger, contribution_categories/campaigns, receipts, receipt_deliveries, pledges/allocations, expenses/approvals/categories, budgets, cash sessions/transactions, financial_adjustments, payment_methods
- Activities: departments, fellowships, meetings, attendance, followup_cases, tasks, task_assignments
- CMS: website_pages, page_sections, website_media, leadership_profiles, announcements, events, testimonials, sermons, website_settings, content_revisions
- System: notifications, audit_logs, system_settings

> Note: These are proposed logical entities for comparison, not a claim of existing implementation.

## 12. Proposed changes and reasons (high-level, pending real-schema comparison)
1. **Establish authorized, read-only DB discovery access** (via approved config/secret channel outside this audit) to enumerate actual DBs/schemas/tables/constraints/migrations. *Reason:* required before any model/migration work.
2. **Adopt PostgreSQL + Prisma (recommended)** with reviewed migrations if no conflicting verified architecture exists. *Reason:* aligns with target stack and maintainability.
3. **Design a canonical payment ledger** (single authoritative confirmed transaction) with linked receipts, delivery attempts, pledges/installment allocations, and reversal/adjustment records. *Reason:* financial integrity, idempotency, auditability.
4. **Separate `users` (auth) from `members` (church profile)** with explicit approval/activation linkage. *Reason:* prevents pending registrations becoming approved members/accounts implicitly.
5. **Implement RBAC with many-to-many roles + scoped/delegated permissions** enforced server-side. *Reason:* stated access model (multiple roles, scoped leaders, protected finance/CMS/member data).
6. **Add audit logging, revision history (CMS), and delivery tracking** as first-class records. *Reason:* traceability and operational reliability (including async WhatsApp/SMS delivery failures).

## 13. Database object classification (current)
| Object/domain | Classification | Notes |
|---|---|---|
| TAG project database/schema (identified in workspace/server) | **Not verified / not discoverable** | Reachable server detected, but no authorized inspection; do not assume empty or populated |
| Prisma schema / migration history in workspace | **Missing** | No `schema.prisma` or migration artifacts found |
| Backend DB connection/config in workspace | **Missing** | No `.env*` or DB connection code found |
| Proposed auth/membership/finance/CMS/activities/system tables | **Missing and requiring creation (proposed, pending comparison)** | Must be reconciled against actual DB before implementation |
| Any existing unknown objects on reachable DB instance | **Existing (status unknown) — must be preserved** | Classification pending authorized audit; no deletion/modification |

## 14. Audit limitations and required next steps
- **Limitation:** Cannot confirm database names, tables, columns, relations, indexes, views, triggers, or migration tables without credentials/access.
- **Limitation:** Cannot determine whether reachable PostgreSQL instance hosts TAG data or unrelated workloads.
- **Required before Phase 1+:**
  - Obtain/provide authorized DB connection configuration securely (not committed; not printed).
  - Run read-only schema discovery and update this document with factual inventory.
  - Produce schema comparison and migration plan with backup/rollback steps.
  - Mark proposed ERD entities as existing/reusable/modify/missing based on evidence.
