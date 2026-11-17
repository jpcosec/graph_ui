#!/bin/bash
# usage: run.sh <label> <cwd> <pytest args...>
B=/dev/shm/vite-t1; label=$1; cwd=$2; shift 2
export PLAYWRIGHT_BROWSERS_PATH=$B/pw PATH=$B/venv/bin:$PATH PYTHONPATH=$cwd/frontends
cd $cwd
ps -eo pid,ppid,pgid,cmd > $B/logs/$label.ps-antes.txt
( while sleep 1; do ps -eo pid,ppid,pgid,cmd | grep -E 'vite|rw-views|sldb serve|serve.py' | grep -v grep; echo ---; done ) > $B/logs/$label.ps-durante.txt &
mon=$!
rm -rf $B/bt
timeout 900 systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm $B/venv/bin/python -m pytest -q -rs -p no:cacheprovider --basetemp=$B/bt "$@" > $B/logs/$label.pytest.log 2>&1
echo "rc=$?" >> $B/logs/$label.pytest.log
kill $mon
sleep 1
ps -eo pid,ppid,pgid,cmd > $B/logs/$label.ps-despues.txt
tail -15 $B/logs/$label.pytest.log
