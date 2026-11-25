# T.A.G Forest Ya Kwanza — Church Website

Official website for T.A.G Forest Ya Kwanza, a church near Mahakama Kuu, Mbeya City, Tanzania.

**Tagline:** A Place of Worship, Fellowship & Transformation

## Tech Stack

- Vite 7 + React 18 + TypeScript
- Tailwind CSS 3 + shadcn/ui (Radix UI)
- react-router-dom v7, TanStack Query
- framer-motion, Swiper, lucide-react
- i18next (English / Kiswahili)
- Vitest + Testing Library

## Getting Started

```sh
npm install
npm run dev      # dev server on port 8080
npm run build    # production build to dist/
npm run preview  # preview production build
npm test         # run tests
npm run lint     # lint
```

## Project Structure

- `src/pages/` — route pages (Index, About, Leadership, Ministries, Schedule, News, Giving, Contact, Testimonials)
- `src/components/layout/` — Navbar, Footer, Layout
- `src/components/ui/` — shadcn/ui components
- `src/lib/churchData.ts` — church config, service schedule, events (edit content here)
- `src/lib/i18n.ts` — EN/SW translations
- `public/logos/`, `public/sermons/` — static assets

## Deployment

Configured for Vercel (`vercel.json` rewrites all routes to `index.html` for SPA routing).
