# TAG FOREST YA KWANZA - ERD (Actual + Proposed)

**Date:** 2026-11-12  
**Status:** Phase 0 design artifact (no schema changes applied)

## 1. Basis of this ERD
- **Actual database state:** Not verifiable from workspace; reachable PostgreSQL service detected on `localhost:5432` but schema/table inspection requires authorized access not available during audit.
- **Actual workspace schema artifacts:** None found (no `schema.prisma`, no migrations, no backend models).
- Therefore, this document represents **(A) verified existing structures = none confirmed** plus **(B) proposed target entities/relationships** for comparison once real DB access is available.

## 2. Verified existing entities/relationships
| Entity | Status | Evidence |
|---|---|---|
| (None confirmed) | Existing/unverified | No accessible DB schema or in-repo data model found |

> All entities below are **PROPOSED (missing, pending comparison)** unless a future audit marks them existing/reusable/modifiable.

## 3. Proposed logical ERD (target model)

### 3.1 Authentication and authorization (PROPOSED)
- **users** `1..* — *..*` **roles** via **user_roles**
- **roles** `1..* — *..*` **permissions** via **role_permissions**
- **users** `1 — *` **user_scopes** (resource-level scope: department/fellowship/module/record constraints)
- **users** `1 — *` **refresh_tokens**
- **user_roles** / **role_permissions** / sensitive role changes linked to **audit_logs**

Key notes:
- Support multiple roles per user and delegated/scoped permissions.
- Enforce authorization in backend services/guards, not frontend only.
- Prefer immutable role-assignment history records (effective/ended timestamps, actor).

### 3.2 Membership (PROPOSED)
- **member_registrations** `1 — 0..*` **member_approvals** (review/decision history)
- **member_registrations** `0..1 — 0..1` **members** (approved member profile created/linked on approval; pending registration must not auto-create approved member)
- **users** `0..1 — 0..1` **members** (activated member account link; member profile separate from auth user)
- **members** `1 — *` **member_location_history** (current and original/past locations preserved)
- **members** `1 — *` **member_assignments** (department/fellowship/role assignments over time)

Key notes:
- Unique member number on approved `members`.
- Account suspension without deleting historical records.

### 3.3 Finance - canonical ledger and relationships (PROPOSED)
**Canonical design (recommended):** `payments` is the authoritative confirmed financial transaction.

- **members** `1 — *` **payments** (nullable payer linkage allowed for authorized non-member/other payer records if required by design)
- **contribution_categories** `1 — *` **payments** (configurable categories)
- **contribution_campaigns** `0..1 — *` **payments**
- **payments** `1 — 0..1` **receipts** (one official receipt per confirmed payment)
- **receipts** `1 — *` **receipt_deliveries** (delivery attempts independent from payment validity)
- **members** `1 — *` **pledges**
- **pledges** `1 — *` **pledge_payment_allocations** (or equivalent) `* — 1` **payments** (supports partial installments without duplicating transactions)
- **cash_sessions** `1 — *` **cash_session_transactions** `* — 1` **payments** (or linked financial events)
- **users (cashier/recorder)** `1 — *` **payments** / **cash_session_transactions**
- **expense_categories** `1 — *` **expenses**
- **expenses** `1 — *` **expense_approvals** (where required)
- **budgets** linked to categories/campaigns/periods as applicable
- **financial_adjustments** reference original **payments/expenses/transactions** (reversal/adjustment, never silent overwrite/delete)

Key notes:
- Pledge != confirmed payment.
- Confirmed payment creation + receipt issuance must be atomic; WhatsApp/SMS delivery async with retries/idempotency.
- Store receipt number/document ref/verification code/issue metadata; track delivery channel/status/failure/retries/provider refs.

### 3.4 Church activities (PROPOSED)
- **departments** `1 — *` **fellowships** (if hierarchical) or related via assignments
- **departments/fellowships** `1 — *` **meetings**
- **meetings** `1 — *` **attendance** `* — 1` **members**
- **members** `1 — *` **followup_cases** (sensitive pastoral notes require additional permissions/scoping)
- **followup_cases/tasks** relationships as needed for accountability
- **tasks** `1 — *` **task_assignments** `* — 1` **users/members/leaders**
- Leader access scoped to assigned departments/fellowships/records

### 3.5 Website CMS (PROPOSED)
- **website_pages** `1 — *` **page_sections** (reusable predefined section components)
- **page_sections/content entities** `* — *` **website_media** (as applicable)
- **website_pages/page_sections/entities** `1 — *` **content_revisions** (draft/publish/unpublish/restore history)
- Managed entities: **leadership_profiles**, **announcements**, **events**, **testimonials**, **sermons**, **website_settings**
- CMS permissions restricted to Website Administrator scope (no source-code/arbitrary HTML-CSS-JS injection)

### 3.6 System management (PROPOSED)
- **notifications** (in-app) with optional delivery records for WhatsApp/SMS/email
- **receipt_deliveries** (finance-specific delivery tracking; may relate to notifications/jobs)
- **audit_logs** records actor/action/entity/timestamp/reason/context for critical operations
- **system_settings** for configurable system behavior

## 4. Relationship/integrity rules to enforce in target design
- Pending registration must not automatically become approved member or activated account.
- One confirmed payment -> one official receipt (business rule; enforce with constraints/transaction logic).
- One receipt -> many delivery attempts; delivery failure does not invalidate payment.
- One pledge -> many installment allocations/payments; track original, paid, remaining, status.
- No silent delete/overwrite of confirmed payments; use reversals/adjustments with audit trail.
- Preserve member location history (do not overwrite single current-only field as sole history).
- Many-to-many user-role and role-permission relations; scoped access for leaders/resources.
- Configurable contribution categories (not hardcoded in frontend).

## 5. Mapping to "actual vs proposed" for next audit pass
When authorized DB access is available, update each proposed entity to one of:
- **Existing and reusable**
- **Existing but requiring modification**
- **Missing and requiring creation**
- **Deprecated and requiring a migration plan**

And attach evidence (table names, columns/types, PK/FK/unique/index constraints, views/triggers/functions, migration records).

## 6. ERD limitations
- This ERD is **not** a claim of implemented schema.
- Naming is logical; physical names/types/indexes must be finalized from real-schema comparison and migration design (Prisma/PostgreSQL) in a controlled environment.
- Any redesign of existing structures (if discovered later) must use staged, data-preserving migrations with rollback/recovery planning.
