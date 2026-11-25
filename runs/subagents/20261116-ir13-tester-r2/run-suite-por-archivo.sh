#!/bin/bash
# Tester r2: suite no-e2e de graph_ui archivo por archivo, un proceso, MemoryMax=3G (orden del coordinador).
# Uso: run-suite-por-archivo.sh <venv> <repo> <outdir> <archivos...>
VENV=$1; REPO=$2; OUT=$3; shift 3
mkdir -p "$OUT"; cd "$REPO" || exit 2
for f in "$@"; do
  n=0
  while :; do avail=$(free -g | awk '/^Mem:/{print $7}'); [ "$avail" -ge 8 ] && break; n=$((n+1)); [ $n -gt 120 ] && { echo "$f SKIP-RAM avail=${avail}G" >> "$OUT/summary.txt"; continue 2; }; sleep 15; done
  b=$(basename "$f" .py); t0=$(date +%s)
  systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-r2 /usr/bin/time -f 'maxrss_kb=%M' "$VENV/bin/python" -m pytest "$f" -q -rs -p no:cacheprovider > "$OUT/$b.out" 2>&1
  rc=$?; t1=$(date +%s)
  last=$(grep -E '(passed|failed|error|skipped|no tests ran)' "$OUT/$b.out" | tail -n 1)
  rss=$(grep -o 'maxrss_kb=[0-9]*' "$OUT/$b.out" | tail -n 1)
  echo "$f rc=$rc $((t1-t0))s avail_antes=${avail}G $rss | $last" >> "$OUT/summary.txt"
done
echo DONE >> "$OUT/summary.txt"
