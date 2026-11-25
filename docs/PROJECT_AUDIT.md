# TAG FOREST YA KWANZA - Project Audit (Phase 0)

**Audit date:** 2026-11-12  
**Workspace audited:** `/home/karera/TAG PROJECT`  
**Audit type:** Non-destructive inspection (no source rewrites, no migrations, no data changes)

## 1. Executive summary
- The workspace contains an existing **frontend-only SPA** for TAG Forest ya Kwanza under `frontend/`.
- The `backend/` directory exists but is **empty** (no source, config, or dependency files found).
- No project-level git repository detected at workspace root.
- No existing Prisma schema, migration history, `.env*`, docker-compose files, or API integration references were found in the workspace.
- A PostgreSQL-compatible service appears to be listening on `localhost:5432`, but **database inspection could not be completed** with available unauthenticated access (see `docs/DATABASE_AUDIT.md`). No credentials were discovered and none were used/printed.
- Existing public website and visual assets should be preserved as the foundation for the expanded Church Management System.

## 2. Repository/workspace structure (observed)
Top-level:
- `frontend/` — React/Vite/TypeScript web app (active codebase)
- `backend/` — empty placeholder directory
- `hero/` — 7 image assets
- `leader/` — 6 image assets
- `.playwright-mcp/` — Playwright MCP logs/screenshots/yaml artifacts (tooling artifacts, not app source)
- Documentation/media files: `TAG FOREST  YA  KWANZA.docx`, `mikopo_doc.html`, `Mikopo na Hisa System Documentation.pdf`, `sadak acc.jpeg`
- Temporary lock file: `.~lock.TAG FOREST  YA  KWANZA.docx#`
- `docs/` — created during this audit

## 3. Existing frontend audit

### 3.1 Stack (from `frontend/package.json`)
- **Runtime/build:** Vite 7, React 18, TypeScript 5
- **Routing:** `react-router-dom` v7 (`BrowserRouter`/`Routes`)
- **Styling:** Tailwind CSS 3, `tailwindcss-animate`, `tailwind-merge`, `clsx`
- **UI system:** shadcn/ui conventions (`components.json`) + Radix UI primitives
- **Data/forms/validation:** TanStack React Query, React Hook Form, Zod, Yup, `@hookform/resolvers`
- **i18n:** `i18next`, `react-i18next`
- **Charts/content/UI extras:** Recharts, Framer Motion, Swiper, Embla Carousel, Sonner/Toast, `typewriter-effect`, `lucide-react`, `date-fns`
- **Testing:** Vitest, Testing Library, jsdom
- **Linting:** ESLint 9 + TypeScript ESLint
- **Deployment hint:** `frontend/vercel.json` present (SPA rewrite-style deployment likely)

### 3.2 Frontend structure (key paths)
- `frontend/src/App.tsx` — app providers and route map
- `frontend/src/pages/` — route-level pages (10 files)
- `frontend/src/components/layout/` — `Layout`, `Navbar`, `Footer`, `PageHeader`
- `frontend/src/components/home/` — homepage sections (`HeroSection`, previews, banners, etc.)
- `frontend/src/components/ui/` — shadcn/Radix-based UI primitives
- `frontend/src/components/` — shared components (e.g. `LeaderCard`, `NavLink`)
- `frontend/src/lib/` — `churchData.ts` (church config/content data), `i18n.ts`, `utils.ts`
- `frontend/src/hooks/` — `use-mobile`, `use-toast`
- `frontend/src/assets/` — in-bundle assets (images/pdf)
- `frontend/public/` — static assets (`hero/`, `leaders/`, `logos/`, `sermons/`)
- `frontend/dist/` and `frontend/node_modules/` — build artifacts/dependencies present in workspace

### 3.3 Public pages/routes (existing, to preserve)
Defined in `frontend/src/App.tsx` and present in `frontend/src/pages/`:
1. `/` → `Index`
2. `/about` → `About`
3. `/leadership` → `Leadership`
4. `/ministries` → `Ministries`
5. `/schedule` → `Schedule`
6. `/news` → `News`
7. `/giving` → `Giving`
8. `/contact` → `Contact`
9. `/testimonials` → `Testimonials`
10. `*` → `NotFound`

### 3.4 Content/design source observations
- Church/site content and service schedule are currently maintained in code/data files (e.g. `frontend/src/lib/churchData.ts`) rather than a CMS/database.
- Visual identity is implemented via Tailwind theme/config and component library (`frontend/tailwind.config.ts`, `frontend/src/index.css`, layout/home/ui components).
- No frontend API client/base URL/env usage detected by static scan (no `fetch`/`axios`/`/api`/`VITE_`/supabase references found in `frontend/src`).

## 4. Existing backend audit

### 4.1 Backend directory state
- `backend/` exists but contains **no files** (empty directory at audit time).
- No `package.json`, NestJS/Express source, Prisma schema, migrations, seed scripts, tests, or `.env.example` found in backend.

### 4.2 Existing integrations
- No verified backend modules, endpoints, auth implementation, payment/receipt logic, CMS services, or background jobs found in workspace.

## 5. Database/config discovery (workspace-level)
- No `.env*`, `docker-compose*`, `compose*.yml/yaml`, `schema.prisma`, or migration files found in workspace search.
- No `DATABASE_URL`, `POSTGRES`, `PRISMA`, `DB_`, or `SUPABASE` references found in tracked/project files by static search.
- Tooling present on machine: `psql`, `docker`, `docker-compose`, `pg_isready`.
- `localhost:5432` is accepting connections; `docker ps` shows Postgres-related containers running on host, but accessible DB names/schemas/tables could not be enumerated without credentials (details in `docs/DATABASE_AUDIT.md`).

## 6. Reusable assets and constraints for implementation
**Reusable/preserve:**
- Existing public pages, routes, layout, and component/design system in `frontend/`
- Static media in `frontend/public/*`, `frontend/src/assets/*`, and root `hero/`/`leader/` collections
- Current content structures in `frontend/src/lib/churchData.ts` and i18n setup as reference for CMS migration

**Key constraints/gaps identified:**
- No backend foundation yet (must be built in `backend/` without breaking frontend)
- No verified database schema/migrations in workspace; DB state remains unverified
- No auth/RBAC, membership, finance, receipts, notifications, or CMS persistence implemented
- `docs/` governance artifacts were missing prior to audit (now created)

## 7. Risks and assumptions
- **Assumption (unverified):** Postgres on `localhost:5432` may belong to local/containerized services unrelated to this project; target TAG database may not exist yet.
- **Risk:** Creating schema blindly could duplicate/conflict with an existing but inaccessible database; all DB changes must follow audited comparison and reviewed migrations.
- **Risk:** `frontend/dist` and `node_modules` are present in workspace; care needed to avoid committing/build confusion during future work.
- **Risk:** Church/member/financial data handling will require strict security, auditability, and secret management once backend is introduced.

## 8. Phase 0 conclusion
Phase 0 inspection is complete for workspace files and accessible local signals. **No production data changes were made.**  
Before structural database/backend changes: complete database access verification (authorized connection/config), produce/confirm ERD against actual schema, and prepare a reviewed migration plan (see `docs/DATABASE_AUDIT.md`, `docs/ERD.md`, `docs/IMPLEMENTATION_PLAN.md`).
