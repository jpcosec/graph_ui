#!/bin/bash
# Tester a2 IR13: pytest archivo por archivo, sin -n, MemoryMax=3G, TMPDIR=/dev/shm.
# Uso: run-por-archivo.sh <venv> <repo> <outdir> <basetemp> <archivos...>
VENV=$1; REPO=$2; OUT=$3; BT=$4; shift 4
mkdir -p "$OUT"; cd "$REPO" || exit 2
for f in "$@"; do
  n=0
  while :; do avail=$(free -g | awk '/^Mem:/{print $7}'); [ "$avail" -ge 8 ] && break; n=$((n+1)); [ $n -gt 240 ] && { echo "$f SKIP-RAM avail=${avail}G" >> "$OUT/summary.txt"; continue 2; }; sleep 15; done
  b=$(basename "$f" .py); t0=$(date +%s)
  systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-browsers /usr/bin/time -f 'maxrss_kb=%M' "$VENV/bin/python" -m pytest "$f" -q -rs -p no:cacheprovider --basetemp="$BT" > "$OUT/$b.out" 2>&1
  rc=$?; t1=$(date +%s)
  last=$(grep -E '(passed|failed|error|skipped|no tests ran)' "$OUT/$b.out" | tail -n 1)
  rss=$(grep -o 'maxrss_kb=[0-9]*' "$OUT/$b.out" | tail -n 1)
  echo "$f rc=$rc $((t1-t0))s avail_antes=${avail}G $rss | $last" >> "$OUT/summary.txt"
done
echo DONE >> "$OUT/summary.txt"
