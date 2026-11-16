#!/bin/bash
# Uso: ui-run.sh <etiqueta> <venv> <repo_code_dir> <store> <port> <modo ui_timing> <scope:0|1>
# Levanta serve.py (PID guardado), muestrea RSS, corre ui_timing.py y mata solo ese PID.
TAG=$1; V=$2; CODE=$3; STORE=$4; PORT=$5; MODE=$6; SCOPE=$7
E=/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-ir13-tester-a2; O=$E/ui/$TAG; mkdir -p $O
cd $CODE
free -g > $O/free.txt
if [ "$SCOPE" = 1 ]; then
  systemd-run --user --scope -q -p MemoryMax=3G -- env TMPDIR=/dev/shm SLDB_STORE=$STORE $V/bin/python frontends/mindmap/serve.py $PORT > $O/server.log 2>&1 &
else
  env TMPDIR=/dev/shm SLDB_STORE=$STORE $V/bin/python frontends/mindmap/serve.py $PORT > $O/server.log 2>&1 &
fi
SP=$!; echo $SP > $O/server.pid
for i in $(seq 1 120); do curl -s -o /dev/null http://127.0.0.1:$PORT/ && break; sleep 0.5; done
# PID real del python (bajo scope, systemd-run hace exec, así que es el mismo PID)
PY=$SP; echo "python_pid=$PY $(tr '\0' ' ' < /proc/$PY/cmdline)" >> $O/server.pid
( while kill -0 $PY 2>/dev/null; do grep -E 'VmRSS|VmHWM' /proc/$PY/status | tr '\n' ' '; echo; sleep 0.5; done ) > $O/rss-samples.txt &
MON=$!
env PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-browsers $V/bin/python $E/ui_timing.py http://127.0.0.1:$PORT $O $MODE 3 > $O/ui_timing.log 2>&1; echo "ui_timing_exit=$?" >> $O/ui_timing.log
grep VmHWM /proc/$PY/status > $O/vmhwm.txt
kill $PY; wait $SP 2>/dev/null; kill $MON 2>/dev/null
awk '{for(i=1;i<=NF;i++) if($i=="VmRSS:") print $(i+1)}' $O/rss-samples.txt | sort -n | tail -1 | sed 's/^/max_VmRSS_kB=/' >> $O/vmhwm.txt
cat $O/vmhwm.txt
