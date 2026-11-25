#!/usr/bin/env bash
#
# Production startup for Render.
# Safe by design:
#   - Never resets, drops, or truncates the database.
#   - Never marks an unknown migration as applied.
#   - Only marks a known-bad migration as rolled back (Prisma's documented
#     recovery path) and then retries the deploy once.
#   - Aborts startup if migrations cannot be applied.
set -euo pipefail

# Migrations that are allowed to be auto-marked as rolled back. Each entry must
# be a migration that has never been successfully applied anywhere, so retrying
# it is a forward-only operation.
KNOWN_FAILED_MIGRATIONS="20261115024500_finance_stage2_foundation"

list_failed_migrations() {
  node -e '
    require("dotenv/config");
    const { PrismaClient } = require("@prisma/client");
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    (async () => {
      const url = new URL(process.env.DATABASE_URL);
      const schema = url.searchParams.get("schema") || "public";
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
        throw new Error("invalid schema name in DATABASE_URL");
      }
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
      try {
        const rows = await prisma.$queryRawUnsafe(
          `SELECT migration_name FROM "${schema}"."_prisma_migrations" WHERE finished_at IS NULL AND rolled_back_at IS NULL`
        );
        for (const row of rows) console.log(row.migration_name);
      } catch (error) {
        // Missing _prisma_migrations means a fresh database; nothing to resolve.
      } finally {
        await prisma.$disconnect();
        await pool.end();
      }
    })().catch(() => process.exit(0));
  '
}

echo "[render-start] applying database migrations"
if ! npx prisma migrate deploy; then
  echo "[render-start] migrate deploy failed; checking for failed migrations"
  failed_migrations="$(list_failed_migrations)"

  if [ -z "$failed_migrations" ]; then
    echo "[render-start] no failed migrations detected; aborting (no destructive action taken)"
    exit 1
  fi

  while IFS= read -r migration; do
    [ -z "$migration" ] && continue
    case " $KNOWN_FAILED_MIGRATIONS " in
      *" $migration "*)
        echo "[render-start] marking known failed migration as rolled back: $migration"
        npx prisma migrate resolve --rolled-back "$migration"
        ;;
      *)
        echo "[render-start] unexpected failed migration: $migration"
        echo "[render-start] refusing to modify migration history automatically; aborting"
        exit 1
        ;;
    esac
  done <<< "$failed_migrations"

  echo "[render-start] retrying migrations after rollback"
  if ! npx prisma migrate deploy; then
    echo "[render-start] migrations still failing; aborting (database was not reset)"
    exit 1
  fi
fi

echo "[render-start] migrations applied successfully"

echo "[render-start] ensuring demo accounts exist (create-only; existing passwords are never overwritten)"
npm run prisma:seed:demo

echo "[render-start] starting backend"
node dist/src/main.js
