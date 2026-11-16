#!/bin/bash
# usage: gt1-run.sh <label> <copydir> <testfile>
EXTRA=(${@:4}); label=$1; dir=$2; tf=$3
free -g | head -2
avail=$(free -g | awk '/Mem:/{print $7}')
if [ "$avail" -lt 8 ]; then echo "LOW MEM $avail"; exit 99; fi
cd $dir/UIs/graph_ui
rm -rf /dev/shm/gt1-bt
start=$(date +%s)
PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-gt1 PATH=/dev/shm/venv-gt1/bin:$PATH systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm /dev/shm/venv-gt1/bin/python -m pytest $tf -q -rs "${EXTRA[@]}" -p no:cacheprovider --basetemp=/dev/shm/gt1-bt > /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-gate-findings-tester-a1/$label.log 2>&1
rc=$?
echo "$label $tf rc=$rc secs=$(($(date +%s)-start))" | tee -a /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-gate-findings-tester-a1/rcs.txt
tail -15 /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-gate-findings-tester-a1/$label.log
