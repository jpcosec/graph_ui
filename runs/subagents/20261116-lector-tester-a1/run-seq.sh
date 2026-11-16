#!/bin/bash
R=/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-lector-tester-a1
waitmem() { for i in $(seq 1 20); do a=$(free -g | awk '/Mem:/{print $7}'); [ "$a" -ge 8 ] && return; echo "$(date +%T) available=${a}G < 8, espero" >> $R/memwait.log; sleep 60; done; echo "$(date +%T) tope 20 min, sigo" >> $R/memwait.log; }
waitmem; $R/run-pytest.sh tests/test_mindmap_workspace.py $R/pytest-workspace.log
waitmem; $R/run-pytest.sh tests/test_mindmap_workspace_explorer.py $R/pytest-explorer.log
waitmem; $R/run-pytest.sh tests/e2e_mindmap_workspace.py $R/pytest-e2e-rerun.log
# HEAD: misma prueba sobre la copia git archive (frontends de HEAD por sys.path del test)
waitmem; cd /dev/shm/lector-t1-head && { free -g | sed -n 2p; s=$(date +%s); systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-lector-t1 /dev/shm/venv-lector-t1/bin/python -m pytest tests/e2e_mindmap_workspace.py -q -rs -p no:cacheprovider --basetemp=/dev/shm/lector-t1-bt-head; echo "EXIT=$? SECONDS=$(( $(date +%s) - s ))"; } > $R/pytest-e2e-HEAD.log 2>&1
echo ALLDONE >> $R/memwait.log
