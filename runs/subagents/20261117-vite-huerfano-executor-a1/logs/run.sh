#!/bin/bash
# usage: run.sh <tag> <rootdir> <files...>
B=/dev/shm/vite-e1; tag=$1; root=$2; shift 2
cd "$root"
ps -eo pid,lstart,cmd | grep rw-views- | grep -v grep > $B/logs/ps-antes-$tag.txt
PATH=$B/venv/bin:$PATH PLAYWRIGHT_BROWSERS_PATH=$B/pw systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm $B/venv/bin/python -m pytest -q -rs -p no:cacheprovider --basetemp=$B/bt "$@" > $B/logs/$tag.log 2>&1
echo "rc=$?" >> $B/logs/$tag.log
sleep 2
ps -eo pid,lstart,cmd | grep rw-views- | grep -v grep > $B/logs/ps-despues-$tag.txt
tail -3 $B/logs/$tag.log; echo "--- antes"; cat $B/logs/ps-antes-$tag.txt; echo "--- despues"; cat $B/logs/ps-despues-$tag.txt
