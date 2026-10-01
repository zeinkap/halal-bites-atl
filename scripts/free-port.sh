#!/usr/bin/env bash
# Frees a TCP port by stopping whatever is listening on it (default 3000).
#
# Usage: scripts/free-port.sh [port]
#
# Playwright is configured to never reuse an existing dev server (it could be connected to a
# different database than the one the DB guard checked), so a leftover `next dev` on the port
# makes the run fail. This stops it: SIGTERM first, SIGKILL after 5s. It prints the pid and
# command name of what it stops (never the full command line, which can contain secrets).
# Exit 0: the port is free (or was already). Exit 1: something still listens on it.
set -uo pipefail

port="${1:-3000}"

listener_pids() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null
  elif command -v fuser >/dev/null 2>&1; then
    fuser -n tcp "$port" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$'
  elif command -v ss >/dev/null 2>&1; then
    ss -ltnpH "sport = :$port" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2
  fi
}

pids="$(listener_pids | sort -u)"
if [[ -z "$pids" ]]; then
  echo "port $port is free"
  exit 0
fi

for pid in $pids; do
  echo "port $port in use by pid $pid ($(ps -p "$pid" -o comm= 2>/dev/null | tr -d ' ')); stopping it"
  kill "$pid" 2>/dev/null
done

for _ in 1 2 3 4 5 6 7 8 9 10; do
  [[ -z "$(listener_pids)" ]] && { echo "port $port is free"; exit 0; }
  sleep 0.5
done

for pid in $(listener_pids | sort -u); do
  echo "pid $pid ignored SIGTERM; killing it"
  kill -9 "$pid" 2>/dev/null
done
sleep 1

if [[ -z "$(listener_pids)" ]]; then
  echo "port $port is free"
  exit 0
fi
echo "port $port is still in use; could not free it" >&2
exit 1
