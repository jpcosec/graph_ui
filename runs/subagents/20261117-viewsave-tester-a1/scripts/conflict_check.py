import json, os, socket, subprocess, sys, time, urllib.request, urllib.error, shutil
from pathlib import Path
GUI, PY, WORK = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3])
env = {**os.environ, "TMPDIR": "/dev/shm", "GRAPH_UI_BACKEND": "local"}
SLDB = Path(PY).parent / "sldb"
if WORK.exists(): shutil.rmtree(WORK)
WORK.mkdir(parents=True)
shutil.copy(GUI / "tests/fixtures/notation-pilots/component-type-system.yml", WORK)
subprocess.run([str(SLDB), "stores", "init", "--path", str(WORK)], check=True, capture_output=True, env=env)
subprocess.run([str(SLDB), "notations", "sync", "--spec", "component-type-system.yml", "--store", ".sldb"], cwd=WORK, check=True, capture_output=True, env=env)
def call(port, route, body=None):
    req = urllib.request.Request(f"http://127.0.0.1:{port}{route}", data=json.dumps(body).encode() if body is not None else None, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read())
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
proc = subprocess.Popen([PY, str(GUI / "frontends/mindmap/serve.py"), str(port)], cwd=GUI, env={**env, "SLDB_STORE": str(WORK / ".sldb")}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("serve pid", proc.pid)
try:
    for _ in range(120):
        try:
            if call(port, "/api/graph")[0] == 200: break
        except Exception: pass
        time.sleep(0.5)
    st, g = call(port, "/api/graph"); doc = g["documents"][0]
    for label, body in (("stale viewRevision", {"changes": [], "view": g["view"], "viewRevision": "x"}),
                        ("stale expected", {"changes": [{"action": "update", "id": doc["id"], "model": doc["model_name"], "expected": {"x": 1}, "payload": doc["payload"]}], "view": g["view"], "viewRevision": g["revision"]}),
                        ("invalid op", {"changes": [{"action": "zap", "id": "a"}], "view": g["view"], "viewRevision": g["revision"]})):
        st, r = call(port, "/api/save", body)
        print(label, st, {k: (v if k in ("ok", "error", "completed", "estado") else type(v).__name__) for k, v in r.items()})
finally:
    proc.terminate(); proc.wait(10); print("exit", proc.returncode)
