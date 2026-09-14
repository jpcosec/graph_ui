"""¿Dibuja la vista KB de graph_ui una referencia entre documentos que están en contenedores distintos?

Compila un store real con dos BoardDoc (cada uno contiene una TaskDoc) y una referencia `blocks` de la tarea
del primero a la del segundo, levanta serve.py y abre /documents/map en Chromium. Informa las aristas que
React Flow dibujó con el interruptor «Referencias» activado, y guarda una captura.

Con --control, las dos tareas quedan en el mismo board (la referencia no cruza contenedores).

Uso: python3 arista-entre-contenedores-graph-ui.py <puerto> <captura.png> [--control]   (desde la raíz de graph_ui)
"""
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

MINDMAP = Path("frontends/mindmap").resolve()
PORT, SHOT = int(sys.argv[1]), Path(sys.argv[2]).resolve()
source = json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8"))
control = "--control" in sys.argv
source["documents"] = [
    {"id": "board-a", "model": "BoardDoc", "payload": {"title": "Board A", "tasks": ["task-a", "task-b"] if control else ["task-a"]}},
    {"id": "board-b", "model": "BoardDoc", "payload": {"title": "Board B", "tasks": [] if control else ["task-b"]}},
    {"id": "task-a", "model": "TaskDoc", "payload": {"title": "Task A", "blocks": ["task-b"]}},
    {"id": "task-b", "model": "TaskDoc", "payload": {"title": "Task B"}},
]
source["view"] = {"positions": {}, "collapsed": []}
spec = importlib.util.spec_from_file_location("compiler", MINDMAP / "compiler.py")
compiler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)
tmp = Path(tempfile.mkdtemp(prefix="kb-cruce-"))
store = tmp / ".sldb"
compiler.compile_json(source, store)
server = subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), str(PORT)], cwd=str(MINDMAP),
                          env={**os.environ, "SLDB_STORE": str(store)}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(40):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{PORT}/api/graph", timeout=1)
            break
        except Exception:
            continue
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 800})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{PORT}/documents/map")
        page.wait_for_selector(".document-node", timeout=10000)
        page.get_by_label("Referencias").check()  # las referencias vienen ocultas por defecto
        edges = 0
        for _ in range(40):  # hasta 10 s: React Flow dibuja las aristas después de medir los nodos
            page.wait_for_timeout(250)
            edges = page.locator(".react-flow__edge").count()
            if edges:
                break
        labels = page.locator(".react-flow__edge").all_text_contents()
        nodes = page.locator(".react-flow__node").evaluate_all("els => els.map(e => e.getAttribute('data-id'))")
        page.screenshot(path=str(SHOT))
        browser.close()
    print("escenario:", "control (mismo contenedor)" if control else "cruce de contenedores")
    print("errores JS:", errors)
    print("nodos:", nodes)
    print("aristas dibujadas:", edges, labels)
finally:
    server.terminate()
    server.wait(timeout=5)
    shutil.rmtree(tmp, ignore_errors=True)
