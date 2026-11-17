"""Real-process check: serve.py on a /dev/shm store copy, unprepare from another process."""
import hashlib, json, os, shutil, socket, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

GUI = Path(sys.argv[1]); PY = sys.argv[2]; WORK = Path(sys.argv[3]); MODE = sys.argv[4]  # unprepare|delete
SLDB = Path(PY).parent / "sldb"
INHERITS = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}
env = {**os.environ, "TMPDIR": "/dev/shm", "GRAPH_UI_BACKEND": "local"}

def log(*a): print(*a, flush=True)

def call(port, route, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"http://127.0.0.1:{port}{route}", data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        raw = e.read()
        try: return e.code, json.loads(raw)
        except Exception: return e.code, raw.decode(errors="replace")[:300]

def tree(*roots):
    return {str(p): (hashlib.sha256(p.read_bytes()).hexdigest(), p.stat().st_mtime_ns)
            for r in roots if r.exists() for p in sorted(r.rglob("*")) if p.is_file()}

def short(d):
    if isinstance(d, dict):
        return {k: (v if k in ("ok", "error", "estado", "completed", "saved", "status") else f"<{type(v).__name__}>") for k, v in d.items()}
    return d

if WORK.exists(): shutil.rmtree(WORK)
WORK.mkdir(parents=True)
for p in ("component-exception-hierarchy.yml", "component-type-system.yml"):
    shutil.copy(GUI / "tests/fixtures/notation-pilots" / p, WORK / p)
subprocess.run([str(SLDB), "stores", "init", "--path", str(WORK)], check=True, capture_output=True, env=env)
subprocess.run([str(SLDB), "notations", "sync", "--spec", "component-exception-hierarchy.yml", "--spec", "component-type-system.yml", "--store", ".sldb"], cwd=WORK, check=True, capture_output=True, env=env)
store = WORK / ".sldb"; cache = WORK / ".sldb_cache"
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
proc = subprocess.Popen([PY, str(GUI / "frontends/mindmap/serve.py"), str(port)], cwd=GUI, env={**env, "SLDB_STORE": str(store)},
                        stdout=open(WORK / "serve.log", "w"), stderr=subprocess.STDOUT)
log("serve.py pid", proc.pid, "port", port)
try:
    for _ in range(120):
        try:
            if call(port, "/api/graph")[0] == 200: break
        except Exception: pass
        time.sleep(0.5)
    prep = subprocess.run([PY, "-c", "import sys;from sldb.api import store_is_prepared;print(store_is_prepared(sys.argv[1]))", str(store)], capture_output=True, text=True, env=env).stdout.strip()
    log("prepared at start:", prep)
    st, g = call(port, "/api/graph")
    log("GET /api/graph", st, len(g.get("documents", [])), "docs")
    st, v = call(port, "/api/views"); log("PREPARED GET /api/views", st, short(v))
    st, v = call(port, "/api/views/evaluate", {"view": INHERITS}); log("PREPARED POST /api/views/evaluate", st, "edges", len(v.get("edges", [])) if isinstance(v, dict) else v)
    doc = g["documents"][0]
    payload = {**doc["payload"], "title": "Titulo cambiado por tester"}
    body = {"changes": [{"action": "update", "id": doc["id"], "model": doc["model_name"], "expected": doc["payload"], "payload": payload}],
            "view": g["view"], "viewRevision": g["revision"]}
    before = tree(store)
    st, r = call(port, "/api/save", body); log("PREPARED POST /api/save", st, short(r))
    after = tree(store)
    changed = [k for k in set(before) | set(after) if before.get(k) != after.get(k)]
    log("PREPARED save changed files:", len(changed), [Path(c).name for c in changed][:5])
    st, g = call(port, "/api/graph")
    log("title persisted:", any(d["id"] == doc["id"] and d["payload"].get("title") == "Titulo cambiado por tester" for d in g["documents"]))
    # second save body for the unprepared phase
    doc = next(d for d in g["documents"] if d["id"] == doc["id"])
    body = {"changes": [{"action": "update", "id": doc["id"], "model": doc["model_name"], "expected": doc["payload"],
             "payload": {**doc["payload"], "title": "No debe escribirse"}}], "view": g["view"], "viewRevision": g["revision"]}
    if MODE == "unprepare":
        script = ("import sys;from pathlib import Path;from sldb.store.io import load_semantic_index;from sldb.store.io.utils import yaml_dump;"
                  "from sldb.store.layout import semantic_index_path;s=Path(sys.argv[1]);l=semantic_index_path(s);assert not l.exists();"
                  "l.write_text(yaml_dump(load_semantic_index(s).model_dump(mode='json')),encoding='utf-8');"
                  "from sldb.api import store_is_prepared;print('unprepared by pid', __import__('os').getpid(), 'prepared=', store_is_prepared(s))")
        log(subprocess.run([PY, "-c", script, str(store)], capture_output=True, text=True, env=env).stdout.strip())
    else:
        shutil.rmtree(store); log(".sldb deleted from test process")
    shot0 = tree(store, cache)
    results = {}
    for method, route, b in (("GET", "/api/views", None), ("GET", "/api/views/evaluate?view=ViewDoc:herencia", None),
                             ("POST", "/api/views/evaluate", {"view": INHERITS}), ("POST", "/api/views/save", {"name": "t", "view": INHERITS}),
                             ("POST", "/api/save", body)):
        st, r = call(port, route, b)
        results[f"{method} {route}"] = (st, short(r))
        log(f"{MODE.upper()} {method} {route}", st, short(r))
    shot1 = tree(store, cache)
    log("files hashed:", len(shot0), "identical before/after:", shot0 == shot1)
    if MODE == "unprepare":
        prep = subprocess.run([PY, "-c", "import sys;from sldb.api import store_is_prepared;print(store_is_prepared(sys.argv[1]))", str(store)], capture_output=True, text=True, env=env).stdout.strip()
        log("still unprepared (prepared=)", prep)
    log("serve alive:", proc.poll() is None)
finally:
    proc.terminate()
    try: proc.wait(10)
    except subprocess.TimeoutExpired: proc.kill(); proc.wait()
    log("serve.py exit", proc.returncode)
