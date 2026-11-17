#!/bin/bash
# usage: run.sh <repo_dir> <logfile> <test files...>
dir=$1; log=$2; shift 2
cd "$dir" || exit 2
rm -rf /dev/shm/viewsave-e1/bt
echo "\$ (cwd=$dir) python -m pytest -q -rs $*" > "$log"
timeout 1500 systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm PATH=/dev/shm/viewsave-e1/venv/bin:$PATH PYTHONPATH=$dir/frontends PLAYWRIGHT_BROWSERS_PATH=/dev/shm/viewsave-e1/pw /dev/shm/viewsave-e1/venv/bin/python -m pytest -q -rs -p no:cacheprovider --basetemp=/dev/shm/viewsave-e1/bt "$@" >> "$log" 2>&1
rc=$?; echo "rc=$rc" >> "$log"; tail -3 "$log"
