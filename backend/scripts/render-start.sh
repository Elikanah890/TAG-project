#!/usr/bin/env bash
set -euo pipefail

resolve_failed_migrations() {
  # If a previous attempt failed mid-migration (P3009/P3018), mark failed rows rolled back
  # so deploy can retry. This is safe for initial hosting; for production with data, handle manually.
  local failed
  failed=$(node -e "require('dotenv/config'); const {PrismaClient}=require('@prisma/client'); const {PrismaPg}=require('@prisma/adapter-pg'); const {Pool}=require('pg'); (async()=>{const pool=new Pool({connectionString:process.env.DATABASE_URL}); const p=new PrismaClient({adapter:new PrismaPg(pool)}); try{const rows=await p.\$queryRawUnsafe(\"SELECT migration_name FROM \\\"_prisma_migrations\\\" WHERE finished_at IS NULL AND rolled_back_at IS NULL\"); console.log(rows.map(r=>r.migration_name).join('\\n'));}catch(e){ } finally{await p.\$disconnect(); await pool.end();}})().catch(()=>{});" 2>/dev/null || true)
  if [ -n "$failed" ]; then
    while IFS= read -r mig; do
      [ -z "$mig" ] && continue
      echo "[render-start] resolving failed migration as rolled-back: $mig"
      npx prisma migrate resolve --rolled-back "$mig" || true
    done <<< "$failed"
  fi
}

echo "[render-start] migrate deploy"
if ! npx prisma migrate deploy; then
  echo "[render-start] migrate deploy failed, resolving failed migrations and retrying once"
  resolve_failed_migrations
  npx prisma migrate deploy
fi

echo "[render-start] seed demo users/rbac"
npm run prisma:seed:demo

echo "[render-start] start server"
node dist/src/main.js
