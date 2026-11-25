# TAG Project (TAG Forest Ya Kwanza)

Full-stack church management + public website platform.

## Structure

- `frontend/` - React + Vite + TypeScript + Tailwind + shadcn UI
- `backend/` - NestJS + Prisma + PostgreSQL
- `docs/` - project/design docs

## VPS Hosting (recommended)

### 1) Prerequisites
- Ubuntu VPS
- Node.js 20+
- PostgreSQL 14+
- Nginx
- PM2 (`npm i -g pm2`)
- Domain/DNS pointed to VPS

### 2) Clone
```bash
git clone https://github.com/Elikanah890/TAG-project.git
cd TAG-project
```

### 3) Backend setup
```bash
cd backend
cp .env.example .env
# edit .env
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 start dist/src/main.js --name tag-backend
pm2 save
```

Backend env (`backend/.env`):
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/tag_church_db?schema=public"
JWT_SECRET="strong_secret_here"
PORT=5000
CORS_ORIGINS="https://your-frontend-domain.com"
UPLOADS_DIR="/var/www/tag/uploads"
```

### 4) Frontend setup
```bash
cd ../frontend
cp .env.example .env
# edit .env
npm ci
npm run build
```

Frontend env (`frontend/.env`):
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

Serve `frontend/dist` with Nginx (or any static host).

### 5) Nginx (example)
- `api.your-domain.com` -> proxy to `http://127.0.0.1:5000`
- `your-domain.com` -> serve frontend `dist`

### 6) Post-deploy checks
- `GET /api/health` returns 200
- Login works for all roles
- Public pages load (`/`, `/ministries`, `/sermons`, etc.)
- CMS updates reflect on public site
- File uploads/media resolve correctly

## Development

Backend:
```bash
cd backend
npm ci
npm run start:dev
```

Frontend:
```bash
cd frontend
npm ci
npm run dev
```

## Notes
- Do not commit `.env` files or secrets.
- Prisma migrations are in `backend/prisma/migrations`.
