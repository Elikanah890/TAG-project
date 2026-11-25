#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-5000}"
PID_FILE="$ROOT/.backend.pid"

is_backend_command() {
  local pid="$1"
  local cmd
  cmd="$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null || true)"
  [[ "$cmd" == node\ * || "$cmd" == */node\ * ]] || return 1
  [[ "$cmd" == *"$ROOT/dist/src/main.js"* \
    || "$cmd" == "node dist/src/main.js"* \
    || "$cmd" == "node dist/main.js"* \
    || "$cmd" == *"$ROOT/dist/main.js"* \
    || "$cmd" == *"$ROOT/node_modules/.bin/ts-node-dev"* \
    || "$cmd" == *"$ROOT/node_modules/ts-node-dev/lib/wrap.js"* \
    || "$cmd" == *"$ROOT/src/main.ts"* ]]
}

stop_pid() {
  local pid="$1"
  local required="${2:-optional}"
  [[ "$pid" =~ ^[0-9]+$ ]] || return 0
  kill -0 "$pid" 2>/dev/null || return 0
  if ! is_backend_command "$pid"; then
    if [[ "$required" == "required" ]]; then
      echo "Refusing to stop PID $pid: it is not this backend." >&2
      return 1
    fi
    return 0
  fi
  echo "Stopping backend PID $pid..."
  kill -TERM "$pid" 2>/dev/null || true
  for _ in $(seq 1 40); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.25
  done
  echo "Backend PID $pid did not exit; sending SIGKILL." >&2
  kill -KILL "$pid" 2>/dev/null || true
}

stop_all_backend_processes() {
  local pid
  local -a pids=()
  while read -r pid; do
    [[ -n "$pid" ]] || continue
    pids+=("$pid")
  done < <(
    ps -eo pid=,args= \
      | awk -v root="$ROOT" '
          index($0, root "/dist/src/main.js") ||
          index($0, root "/dist/main.js") ||
          index($0, root "/node_modules/.bin/ts-node-dev") ||
          index($0, root "/node_modules/ts-node-dev/lib/wrap.js")
          { print $1 }
        ' \
      | sort -u
  )

  for pid in "${pids[@]:-}"; do
    [[ -n "$pid" ]] || continue
    stop_pid "$pid" optional || exit 1
  done
}

if [[ -f "$PID_FILE" ]]; then
  stop_pid "$(cat "$PID_FILE" 2>/dev/null || true)" required || exit 1
  rm -f "$PID_FILE"
fi

mapfile -t LISTENERS < <(
  ss -ltnpH "sport = :$PORT" 2>/dev/null \
    | grep -o 'pid=[0-9]*' \
    | cut -d= -f2 \
    | sort -u
)
for pid in "${LISTENERS[@]:-}"; do
  [[ -n "$pid" ]] || continue
  stop_pid "$pid" required || exit 1
done

# ts-node-dev can leave a respawning parent behind even when its child is not
# currently listening. Kill those parents too, or they will reclaim the port later.
stop_all_backend_processes

for _ in $(seq 1 40); do
  if ! ss -ltnH "sport = :$PORT" 2>/dev/null | grep -q .; then
    exit 0
  fi
  sleep 0.25
done

echo "Port $PORT is still in use by an unrelated process. Refusing to continue." >&2
exit 1
