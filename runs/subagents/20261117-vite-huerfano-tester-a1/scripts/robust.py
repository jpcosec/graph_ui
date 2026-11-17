import importlib.util, sys, time, os, subprocess
spec = importlib.util.spec_from_file_location("e2e", sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
res = {}
def case(name, cmd, pre=None, markers=()):
    p = m._spawn(cmd)
    time.sleep(1.0)
    if pre: pre(p)
    before = {mk: m._holding(mk) for mk in markers}
    t = time.time(); exc = None
    try: m._stop([p])
    except Exception as e: exc = repr(e)
    dt = time.time() - t
    time.sleep(0.3)
    after = {mk: m._holding(mk) for mk in markers}
    for pids in after.values():
        for pid in pids:
            try: os.kill(pid, 9)
            except ProcessLookupError: pass
    print(f"{name}: stop={dt:.2f}s rc={p.returncode} exc={exc} before={before} after={after}", flush=True)
case("ignora-TERM", ["bash", "-c", 'trap "" TERM; sleep 30011 & wait'], markers=["30011"])
case("ya-muerto-zombie", ["bash", "-c", "exit 3"])
case("ya-muerto-reapeado", ["bash", "-c", "exit 3"], pre=lambda p: p.wait())
case("nietos", ["bash", "-c", "sleep 30021 & bash -c 'sleep 30022 & bash -c \"sleep 30023\" & wait' & wait"], markers=["30021", "30022", "30023"])
case("nieto-huerfano-lider-muerto", ["bash", "-c", "(sleep 30031 &); exit 0"], markers=["30031"])
case("nieto-ignora-TERM-lider-muerto", ["bash", "-c", "trap '' TERM; (sleep 30041 &); exit 0"], markers=["30041"])
case("nieto-setsid-escapa", ["bash", "-c", "setsid sleep 30051 & wait"], markers=["30051"])
# varios grupos, uno terco: ¿el plazo es compartido?
ps = [m._spawn(["bash", "-c", 'trap "" TERM; sleep 30061 & wait']), m._spawn(["bash", "-c", 'trap "" TERM; sleep 30062 & wait']), m._spawn(["sleep", "30063"])]
time.sleep(1); t = time.time(); m._stop(ps); dt = time.time() - t; time.sleep(0.3)
print(f"tres-grupos-dos-tercos: stop={dt:.2f}s left={[m._holding(x) for x in ('30061','30062','30063')]}")
