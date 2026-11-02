#!/bin/bash
# asrv.sh <repo> <port> <log> [pythonpath-models]
cd /tmp; : > $3
env -u DESKOPS_ROOT SLDB_STORE=$1/.sldb SLDB_PYTHONPATH=$4 PYTHONPATH=/home/jp/proyectos/SLDB_1/UIs/graph_ui/frontends python /home/jp/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261102-ws13-1-correccion/tester/audit_launch.py $3 /home/jp/proyectos/SLDB_1/UIs/graph_ui/frontends/mindmap/serve.py $2
