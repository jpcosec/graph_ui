#!/bin/bash
# srv.sh <repo> <port> : serve.py real
cd /tmp; env -u DESKOPS_ROOT SLDB_STORE=$1/.sldb PYTHONPATH=/home/jp/proyectos/SLDB_1/UIs/graph_ui/frontends python /home/jp/proyectos/SLDB_1/UIs/graph_ui/frontends/mindmap/serve.py $2
