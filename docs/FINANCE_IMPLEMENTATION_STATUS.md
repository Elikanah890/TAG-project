# Finance Implementation Status

Last updated: 2026-11-15
Database: `tag_church_db` (PostgreSQL 16.16)
ORM: Prisma 7.10.1

## Status summary

| Area | Status |
| --- | --- |
| Finance Database Foundation | **COMPLETED** |
| Finance Dashboard and Navigation | **COMPLETED** (reporting endpoint and finance UI) |
| Finance Admin account & Stage 3 write workflows | **COMPLETED** (verified 2026-11-15) |

This document records the finance foundation, dashboard/navigation, Finance Admin account, and invoice/payment write workflows. Stages 1-3 are implemented and verified; remaining finance hardening items are listed below.

## Completed: Finance Database Foundation

### Schema additions

Added to `backend/prisma/schema.prisma`:

- Enums: `InvoiceStatus`, `FinancialAccountType`, `ExpenseStatus`, `ExpenseApprovalAction`, `WhatsAppMessageType`, `WhatsAppMessageStatus`.
- Models: `Campaign`, `Invoice`, `InvoiceItem`, `FinancialAccount`, `ExpenseApprovalHistory`, `WhatsAppMessageLog`.
- `Contribution`: `invoiceId`, `campaignId`, `financialAccountId`.
- `Expense`: `status`, `reviewedById`, `reviewedAt`, `reviewNote`, `financialAccountId`.
- `Budget`: optional `campaignId`.
- User and Member relations for the new finance records.

Existing models were preserved. No new `Receipt` model was introduced; receipts remain attached to `Contribution.receiptNo`. Existing `Project` remains in place; `Campaign` is additive.

### Migration

Applied migration:

`backend/prisma/migrations/20261115024500_finance_stage2_foundation/migration.sql`

Default financial accounts inserted with zero opening balances:

| Name | ID | Type |
| --- | --- | --- |
| Cash | `acct_cash_default` | `CASH` |
| Bank | `acct_bank_default` | `BANK` |
| M-Pesa | `acct_mpesa_default` | `MOBILE_MONEY` |

The migration is additive: it creates tables, columns, indexes, and foreign keys but does not delete existing records.

### Verification evidence

- `prisma format` and `prisma validate` passed.
- `prisma migrate deploy` applied both project migrations.
- `prisma generate` succeeded.
- `prisma migrate status` reports the database is up to date.
- `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` reports no schema difference.
- `npm run build` in `backend/` passed.
- Pre-existing record counts were preserved:
  - users: 1
  - members: 0
  - contributions: 0
  - pledges: 0
  - expenses: 0
  - budgets: 0
  - projects: 0
- Six new finance tables exist, and the three default accounts are present.

### Migration tooling constraint

The local database role does not have `CREATEDB`, so `prisma migrate dev` fails with `P3014` while creating its shadow database. The reviewed workflow for this environment is:

1. Generate SQL with `prisma migrate diff`.
2. Review the SQL.
3. Apply with `prisma migrate deploy`.

Do not bypass the review step just to make `migrate dev` work.

## Review findings

These are implementation facts to account for in the next stage.

1. `Invoice` to `InvoiceItem` is one-to-many with cascade delete from the invoice.
2. Invoice payments are represented by multiple `Contribution` rows sharing `invoiceId`. Paid and outstanding amounts must be derived; there is no stored paid total.
3. Invoice write workflows and numbering are implemented: `FinanceService` generates `INV-YYYY-####` with a transaction-scoped PostgreSQL advisory lock; create/list/detail/payment/PDF endpoints and UI are in place.
4. Receipts remain `Contribution.receiptNo`. Receipt numbering was race-prone because it used `count + 1`; it has been hardened with a transaction-scoped PostgreSQL advisory lock in `backend/src/finance/finance.service.ts`. Endpoint verification is still required.
5. `FinancialAccount` classifies inbound contributions and expenses but has no transfer or double-entry ledger table. Account balances are derived from opening balance plus recorded movements.
6. `ExpenseApprovalHistory` relations are valid, but `createExpense()` does not yet write a `SUBMITTED` history row.
7. `WhatsAppMessageLog` supports `PENDING`, `OPENED`, `SENT`, `DELIVERED`, `READ`, and `FAILED`.
8. Monetary columns use `Decimal(12,2)` for invoices, invoice items, contributions, and expenses; account opening balances use `Decimal(14,2)`.
9. Foreign keys generally use `ON DELETE SET NULL`; `InvoiceItem` and `ExpenseApprovalHistory` cascade from their parent records.
10. `Campaign` supports Ujenzi tracking. Where no campaign is linked, reporting can fall back to `Contribution.category = 'UJENZI'`.

## Completed: Finance Dashboard and Navigation

Implemented in this stage:

- `GET /api/dashboard/finance` extended with finance statistics, monthly cash-flow trend, contribution composition, expense and approval summaries, invoice paid/outstanding overview, pledge summaries, Ujenzi overview, recent transactions, and account metadata. Backward-compatible aggregate fields were retained.
- Finance dashboard UI at `frontend/src/pages/admin/FinanceDashboard.tsx` using real backend data only, with empty states for missing records.
- Finance Admin navigation regrouped into Finance Overview, Income & Receipts, and Expenses & Reports.
- Routes and read-only finance pages wired for Finance Admin: contribution history, receipts, and financial reports.
- Record Payment form categories updated to include `UJENZI` and `GENERAL_DONATION`.

Completed since initial Stage 2 scope (Stage 3, verified 2026-11-15):

- Finance Admin account created and verified: `andrewmbughi@gmail.com` (`cmwh2ukg90000peio6ks73vd3`, `ACTIVE`, `FINANCE_ADMIN`, `mustChangePassword` enforced then changed on first login; `USER_CREATED` / `USER_MUST_CHANGE_PASSWORD_ENFORCED` audited). Initial temporary password was issued once at creation and rotated during E2E verification; current credential must be shared/managed securely outside this document.
- Invoice write workflows: `POST /api/finance/invoices` (line items, due date, category, member/external recipients, `INV-YYYY-####` with advisory lock), `GET /api/finance/invoices`, `GET /api/finance/invoices/:id`, `POST /api/finance/invoices/:id/payments` (partial/full, auto receipt `RCT-YYYY-####`, status recalculation to `PARTIALLY_PAID`/`PAID`/`OVERDUE`), `GET /api/finance/invoices/:id/pdf`.
- Frontend: `/admin/finance/invoices` (list + create with line items) and `/admin/finance/invoices/:id` (detail, PDF download, record payment, receipt download, WhatsApp link when phone available).
- Direct contribution recording re-enabled: `/admin/finance/record` (`POST /api/finance/payments`) with categories including `ZAKA`, `FUNGU_LA_KUMI`, `SADAKA`, `UJENZI`, `GENERAL_DONATION`, `PROJECT`, `SPECIAL` and downloadable PDF receipt.
- API E2E evidence (real test data in `tag_church_db`): member `Test Ujenzi Member` (`cmwh357hb000041iogzzmp7x3`), invoice `INV-2026-0001` (`cmwh35f6v000241io80g9jf96`, `UJENZI`, total `500000`) created by Finance Admin; partial payment `200000 CASH` recorded -> receipt `RCT-2026-0001`, invoice `PARTIALLY_PAID`, `paidAmount=200000`, `outstandingAmount=300000`; invoice and receipt PDFs returned `200 application/pdf`.

Remaining out of scope / follow-up:

- Expense approval write actions beyond existing System Admin exception, campaign management UI, and WhatsApp provider/API send integration (manual/log-oriented UI exists).
- End-to-end browser UI verification (API-level verification completed).
- Receipt numbering endpoint-level/idempotency verification under concurrent load beyond advisory-lock implementation.

## Guardrails for the next stage

- Do not create fake financial figures or sample transactions presented as real data.
- Do not create the Finance Admin account until explicitly approved.
- Reuse existing finance models and services; do not duplicate a model that already provides the required function.
- Create only reporting endpoints that are missing; preserve existing finance write APIs and RBAC.
- Keep `SYSTEM_ADMIN` read-only for finance records. Expense approval remains the sole exception, and only for approve/reject.
- Report every modified file and test result before committing.

## Backup

A pre-migration custom-format backup is preserved locally at:

`backend/backups/finance-stage2/tag_before_finance_stage2_20261115-024426.dump`

SHA-256:

`f8c9447f2a85941e5eb98dc5f94e9c37d09d4e1396449dea8cd9cafe18c45530`

The adjacent `.sha256` file allows verification with:

```bash
cd backend/backups/finance-stage2
sha256sum -c tag_before_finance_stage2_20261115-024426.dump.sha256
```

`backend/.gitignore` ignores `backups/`, so this dump is local and must not be committed. Copy it to approved encrypted storage for production use. See `docs/FINANCE_BACKUP_RESTORE.md`.
