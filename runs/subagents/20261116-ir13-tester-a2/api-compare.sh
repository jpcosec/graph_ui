#!/bin/bash
# Uso: api-compare.sh <tag> <venv> <codedir> <store> <port>; curl /api/notation/view por spec, status+tiempo+error
TAG=$1; V=$2; CODE=$3; STORE=$4; PORT=$5
E=/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-ir13-tester-a2; O=$E/api/$TAG; mkdir -p $O
cd $CODE; env TMPDIR=/dev/shm SLDB_STORE=$STORE $V/bin/python frontends/mindmap/serve.py $PORT > $O/server.log 2>&1 & SP=$!; echo $SP > $O/server.pid
for i in $(seq 1 120); do curl -s -o /dev/null http://127.0.0.1:$PORT/ && break; sleep 0.5; done
for s in activity.render-error-handling class.sldb-models component.spec2viz-architecture component.exception-hierarchy component.type-system matrix.pipeline-coverage matrix.quotation-view sequence.render-pipeline sequence.sync-pipeline state.diagram-sync-lifecycle state.diagram-type-lifecycle sequence.build-pipeline spec-01 spec-09a spec-14; do
  r=$(curl -s -o $O/$s.json -w '%{http_code} %{time_total}' "http://127.0.0.1:$PORT/api/notation/view?spec=$s")
  echo "$s $r $(head -c 200 $O/$s.json | tr '\n' ' ')" >> $O/results.txt
done
grep VmHWM /proc/$SP/status >> $O/results.txt; kill $SP; wait $SP 2>/dev/null
