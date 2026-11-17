"""Arranca make_server real sobre stores reales, los des-prepara y registra las respuestas 503."""
import json, shutil, subprocess, sys, tempfile, threading, urllib.request, urllib.error, importlib.util, os
from pathlib import Path
REPO = Path(sys.argv[1]); os.environ["GRAPH_UI_BACKEND"] = "local"
MM = REPO / "frontends/mindmap"
def load(n):
    s = importlib.util.spec_from_file_location(n, MM / f"{n}.py"); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
from sldb.store.io import load_semantic_index
from sldb.store.io.utils import yaml_dump
from sldb.store.layout import semantic_index_path
def unprepare(store):
    semantic_index_path(store).write_text(yaml_dump(load_semantic_index(store).model_dump(mode="json")), encoding="utf-8")
def call(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read())
def serve(store):
    h = load("serve").make_server(port=0, store=store); threading.Thread(target=h.serve_forever, daemon=True).start()
    return h, f"http://127.0.0.1:{h.server_address[1]}"
tmp = Path(tempfile.mkdtemp(dir="/dev/shm/viewsave-e1"))
# vistas
root = tmp / "views"; root.mkdir()
shutil.copy(REPO / "tests/fixtures/notation-pilots/component-exception-hierarchy.yml", root)
subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
subprocess.run(["sldb", "notations", "sync", "--spec", "component-exception-hierarchy.yml", "--store", ".sldb"], cwd=root, check=True, capture_output=True)
h, url = serve(root / ".sldb"); unprepare(root / ".sldb")
INH = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}
for m, r, b in (("GET", "/api/views", None), ("GET", "/api/views/evaluate?view=ViewDoc:herencia", None), ("POST", "/api/views/evaluate", {"view": INH})):
    s, d = call(url + r, b); print(f"{m} {r} -> {s} {json.dumps(d, ensure_ascii=False)}")
h.shutdown(); h.server_close()
# save
store = tmp / "save" / ".sldb"; load("compiler").compile_json(json.loads((MM / "fixtures/kb-small.json").read_text()), store)
h, url = serve(store); _, g = call(url + "/api/graph"); unprepare(store)
s, d = call(url + "/api/save", {"changes": [], "view": g["view"], "viewRevision": g["revision"]})
print(f"POST /api/save -> {s} {json.dumps(d, ensure_ascii=False)}")
h.shutdown(); h.server_close(); shutil.rmtree(tmp)
