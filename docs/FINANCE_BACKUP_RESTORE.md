# Finance Stage 2 Backup and Restore Procedure

Last updated: 2026-11-15

## Backup artifact

| Item | Value |
| --- | --- |
| Format | PostgreSQL custom dump |
| Path | `backend/backups/finance-stage2/tag_before_finance_stage2_20261115-024426.dump` |
| Size | 74 KB |
| SHA-256 | `f8c9447f2a85941e5eb98dc5f94e9c37d09d4e1396449dea8cd9cafe18c45530` |
| Checksum file | `backend/backups/finance-stage2/tag_before_finance_stage2_20261115-024426.dump.sha256` |

The dump was taken immediately before applying the Finance Stage 2 migration. It contains the pre-migration database state and must be handled as sensitive data.

`backend/.gitignore` excludes `backups/`. Do not commit the dump or copy it into an unencrypted shared location.

## Verify the archive

```bash
cd backend/backups/finance-stage2
sha256sum -c tag_before_finance_stage2_20261115-024426.dump.sha256
pg_restore --list tag_before_finance_stage2_20261115-024426.dump | sed -n '1,40p'
```

The checksum command must print `OK`. `pg_restore --list` must list the expected database objects without an archive error.

## Restore rules

1. Restore into a separate, empty database first. Never test a restore over the live database.
2. The local application role does not have `CREATEDB`, so a database owner or DBA must create the target database.
3. Do not use `--clean` for a verification restore. Restoring into an empty database makes destructive cleanup unnecessary.
4. Do not run a production restore without a maintenance window, an application stop, and explicit approval.
5. After a successful verification, delete only the dedicated verification database.

## Verification restore

Set the connection details without committing values to the repository:

```bash
export DB_URL="${DATABASE_URL%%\?*}"
export RESTORE_DB="tag_church_restore_20261115"
export RESTORE_URL="postgresql://USER:PASSWORD@HOST:PORT/${RESTORE_DB}"
```

Create the empty database as an owner or DBA:

```bash
createdb "$RESTORE_DB"
```

Restore with object ownership left to the restoring role:

```bash
pg_restore \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  --dbname="$RESTORE_URL" \
  backend/backups/finance-stage2/tag_before_finance_stage2_20261115-024426.dump
```

If `pg_restore` reports a permission problem, stop. Do not retry with broader privileges without approval.

## Verify restored data

```bash
psql "$RESTORE_URL" -c '\dt'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS users FROM "User";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS members FROM "Member";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS contributions FROM "Contribution";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS pledges FROM "Pledge";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS expenses FROM "Expense";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS budgets FROM "Budget";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS projects FROM "Project";'
psql "$RESTORE_URL" -c 'SELECT COUNT(*) AS applied_migrations FROM "_prisma_migrations";'
```

The pre-migration figures recorded before the Stage 2 migration were:

| Table | Rows |
| --- | --- |
| `User` | 1 |
| `Member` | 0 |
| `Contribution` | 0 |
| `Pledge` | 0 |
| `Expense` | 0 |
| `Budget` | 0 |
| `Project` | 0 |

An empty finance table in this backup is expected: the backup is the state before the new finance tables were created.

## Restore to the live database

Only after the verification restore passes:

1. Announce a maintenance window.
2. Stop the backend and any process writing to the database.
3. Take a fresh backup of the current live database.
4. Confirm the restore target is the correct database.
5. Restore with `--exit-on-error` and without `--clean`.
6. Run the verification counts and check application health.
7. Restart the backend and run a login plus finance read smoke test.

A live restore replaces or conflicts with existing objects. It is a recovery operation, not a routine migration step.
