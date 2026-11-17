import subprocess, sys, time, os
from pathlib import Path
app, out = sys.argv[1], sys.argv[2]
try:
    subprocess.run(["npx", "vite", "build", "--outDir", out, "--emptyOutDir"], cwd=app, check=True, capture_output=True, timeout=4)
    print("build terminó antes del timeout")
except subprocess.TimeoutExpired:
    print("TimeoutExpired")
time.sleep(1)
left = []
for c in Path("/proc").glob("[0-9]*/cmdline"):
    try:
        if out.encode() in c.read_bytes(): left.append(int(c.parent.name))
    except OSError: pass
print("vivos tras timeout:", left)
for pid in left:
    print(open(f"/proc/{pid}/cmdline","rb").read().replace(b"\0",b" ").decode()[:160])
    os.kill(pid, 9)
