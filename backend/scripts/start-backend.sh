#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-5000}"
cd "$ROOT"

bash "$ROOT/scripts/stop-backend.sh"

if [[ ! -f "$ROOT/dist/src/main.js" ]]; then
  echo "Build output not found. Run: npm run build" >&2
  exit 1
fi

echo "$$" > "$ROOT/.backend.pid"
trap 'rm -f "$ROOT/.backend.pid"' EXIT
echo "Starting backend on port $PORT..."
exec node "$ROOT/dist/src/main.js"
