#!/usr/bin/env bash
set -euo pipefail

echo "[render-start] migrate deploy"
npx prisma migrate deploy || {
  status=$?
  echo "[render-start] migrate deploy failed ($status), attempting resolve for known failed migration"
  npx prisma migrate resolve --rolled-back 20261115024500_finance_stage2_foundation || true
  npx prisma migrate deploy
}

echo "[render-start] seed demo users/rbac"
npm run prisma:seed:demo

echo "[render-start] start server"
node dist/src/main.js
