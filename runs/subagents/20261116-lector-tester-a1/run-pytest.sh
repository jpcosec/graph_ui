#!/bin/bash
# uso: run-pytest.sh <archivo> <log>
cd /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui
free -g | sed -n 2p > "$2"
start=$(date +%s)
PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-lector-t1 systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-lector-t1 /dev/shm/venv-lector-t1/bin/python -m pytest "$1" -q -rs -p no:cacheprovider --basetemp=/dev/shm/lector-t1-bt >> "$2" 2>&1
rc=$?
echo "EXIT=$rc SECONDS=$(( $(date +%s) - start ))" >> "$2"
