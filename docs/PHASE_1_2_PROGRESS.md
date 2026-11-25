# Phase 1–2 Progress (Backend foundation, DB, Auth)

**Date:** 2026-11-12  
**Scope executed:** Database connection verification, initial Prisma schema/migration, seed, NestJS bootstrap, JWT auth API. No frontend rewrite; existing public site preserved.

## 1. Database connection (verified)
- `backend/.env` created with provided `DATABASE_URL`, `JWT_SECRET`, `PORT=5000` (kept local; not printed in docs).
- Connection verified against `tag_church_db` on `localhost:5432` via Prisma/psql.
- Initial state (before this run): `tag_church_db` had no application tables (verified by empty introspection earlier).
- Current state: application tables created in schema `public` (see below).

## 2. Prisma / schema / migration
- Stack: **NestJS (TypeScript) + Prisma ORM 7 + PostgreSQL** in `backend/`.
- Prisma config: `backend/prisma.config.ts` (and `prisma7.config.ts`), datasource from `DATABASE_URL`.
- Schema: `backend/prisma/schema.prisma` (generator `prisma-client-js`).
- **Models implemented (as requested):** `User`, `Member`, `SiteSetting`, `Page`, `Event`, `Contribution`, `AuditLog`  
  **Supporting auth/RBAC models added:** `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken` (foundation for Phase 2+).
- **Indexes added on frequently searched fields:** `User.email`, `User.phone`, `Member.memberNo`, `Member.phone`, `Member.email`, `Member.membershipStatus`, `SiteSetting.key`, `Page.slug/status`, `Event.startAt/status`, `Contribution.memberId/category/contributedAt/status`, `AuditLog` actor/entity/time indexes.
- Migration: `backend/prisma/migrations/0_init/migration.sql` generated via `prisma migrate diff --from-empty --to-schema` and applied to `tag_church_db`; recorded as applied (`_prisma_migrations`).  
  *Note:* `prisma migrate dev` could not create a shadow DB due DB user permissions; non-destructive SQL apply + migration resolve was used instead.

## 3. Tables created (verified)
`AuditLog`, `Contribution`, `Event`, `Member`, `Page`, `Permission`, `RefreshToken`, `Role`, `RolePermission`, `SiteSetting`, `User`, `UserRole`, `_prisma_migrations`

## 4. Seed
- `backend/prisma/seed.ts` (run via `tsx`) seeds:
  - Role: `SYSTEM_ADMIN`
  - User: `admin@tagchurch.org` (bcrypt hash, status ACTIVE); credential managed via `BOOTSTRAP_ADMIN_PASSWORD`, never documented
  - `UserRole` link and `AuditLog` entry `SEED_SYSTEM_ADMIN`
- Verified: seeded admin exists in DB.

## 5. Backend API (working)
- Base: `http://localhost:5000/api` (NestJS, CORS enabled, global validation pipe)
- **Auth implemented (JWT, email+password):**
  - `POST /api/auth/login` → returns `accessToken` (JWT) + user (id/email/status/roles/member)
  - `GET /api/auth/me` (Bearer token) → returns current user profile/roles
- Auth uses Passport JWT strategy, bcrypt password verification, Prisma user lookup, and login audit logging.
- Build verified: `npm run build` (tsc). Runtime verified with live login + `/me` calls against `tag_church_db`.

## 6. How to run (backend)
```bash
cd backend
cp .env.example .env # if needed; configure DATABASE_URL/JWT_SECRET/PORT
npm install
npx prisma generate
npx prisma migrate deploy   # for existing DB with migration history
npm run prisma:seed         # idempotent upserts for admin role/user
npm run start:dev           # or npm run build && npm start
```

## 7. Remaining work (not yet completed)
This is a foundation increment; full end-to-end CMS/ChMS scope from the master prompt remains pending:
- Complete RBAC (all primary roles/permissions/scopes/guards/policies, delegated responsibilities), refresh-token/session flows, account lifecycle.
- Membership domain (public registration, secretary review, pastor approval, member numbers/activation, profiles, location history/assignments, member portal).
- Finance domain (canonical payment ledger, configurable categories/campaigns/methods, cashier sessions, atomic payment+receipt PDF, verification codes, idempotency, pledges/installments/allocations, expenses/approvals/budgets, reversals/adjustments, reconciliation, reports).
- Async notifications/delivery (WhatsApp/SMS/email jobs, receipt deliveries, retries/status tracking).
- Website CMS (DB-backed pages/sections/media/settings/profiles/announcements/events/testimonials/sermons/revisions) preserving existing design; admin UI without unsafe HTML/CSS/JS injection.
- Church activities (departments/fellowships/meetings/attendance/follow-up/tasks) with scoped access.
- Dashboards, comprehensive audit coverage, API docs, tests (unit/integration/migration/security/e2e), frontend integration, production hardening, backups/deployment docs.

## 8. Security notes
- Credentials must remain in environment/secret storage only; do not commit `.env`.
- Authorization must be enforced server-side for all future modules/endpoints.
- `admin@tagchurch.org` seed password is for initial bootstrap; rotate/change per deployment policy.
