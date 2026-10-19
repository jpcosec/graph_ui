"""E2E: projection views in review-workbench, against real servers and a real store.

A temporary store is built from spec2viz's pilots (``SpecNodeDoc`` documents joined by
``uses``/``inherits``/``reads``). Three real processes serve it: ``sldb serve`` (what
AntoniaFlowPage reads through ``/sldb``), the graph_ui server (``/api/views*``) and a production
build of review-workbench under ``vite preview``, whose proxy forwards both. In Chromium:

1. the sidebar's view query (model + where, relation types) redraws the canvas with exactly the
   nodes and edges ``evaluate_view`` computes on the server;
2. saving writes a ``ViewDoc`` to the store; after a reload, choosing it in "Saved views" redraws
   the same slice;
3. the same view pointed at a second store draws that store's slice.
"""
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path

import pytest

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

spec2viz = pytest.importorskip("spec2viz")

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "review-workbench"
MINDMAP = ROOT / "frontends" / "mindmap"
PILOTS = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz"
HERE = ["component-exception-hierarchy.yml", "component-type-system.yml"]
THERE = ["component-architecture.yml"]


def _free_port() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _wait(url: str, process=None, timeout=60) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if process is not None and process.poll() is not None:
            raise RuntimeError(f"{url}: the process exited ({process.returncode})")
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError(f"{url} did not answer")


def _store(root: Path, pilots: list[str]) -> Path:
    for pilot in pilots:
        shutil.copy(PILOTS / pilot, root / pilot)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *pilots, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


@pytest.fixture(scope="module")
def stack():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not (shutil.which("npx") and (APP / "node_modules").is_dir()):
        pytest.skip("review-workbench needs node and `npm ci` in apps/review-workbench")
    if not all((PILOTS / p).exists() for p in HERE + THERE) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    work = Path(tempfile.mkdtemp(prefix="rw-views-"))
    processes = []
    try:
        (work / "here").mkdir(), (work / "there").mkdir()
        store, other = _store(work / "here", HERE), _store(work / "there", THERE)
        sldb_port, ui_port, app_port = _free_port(), _free_port(), _free_port()
        env = {**os.environ, "GRAPH_UI_BACKEND": "local", "SLDB_STORE": str(store)}
        processes.append(subprocess.Popen(["sldb", "serve", "--store", str(store), "--port", str(sldb_port)],
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        processes.append(subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), str(ui_port)], env=env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{sldb_port}/health", processes[0])
        _wait(f"http://127.0.0.1:{ui_port}/api/views", processes[1])
        dist = work / "dist"
        subprocess.run(["npx", "vite", "build", "--outDir", str(dist), "--emptyOutDir"], cwd=APP, check=True,
                       capture_output=True, timeout=300)
        app_env = {**os.environ, "VITE_SLDB_URL": f"http://127.0.0.1:{sldb_port}", "VITE_GRAPH_UI_URL": f"http://127.0.0.1:{ui_port}"}
        processes.append(subprocess.Popen(["npx", "vite", "preview", "--outDir", str(dist), "--port", str(app_port), "--strictPort",
                                           "--host", "127.0.0.1"], cwd=APP, env=app_env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{app_port}/", processes[2])
        yield {"store": store, "other": other, "app": f"http://127.0.0.1:{app_port}"}
    finally:
        for process in processes:
            process.terminate()
        for process in processes:
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        shutil.rmtree(work, ignore_errors=True)


def _expected(store: Path, view: dict) -> tuple[int, int]:
    from mindmap.projection_views import evaluate_view

    result = evaluate_view(store, view)
    return len(result["nodes"]), len(result["edges"])


def _apply(page, model: str, where: str, relations: str) -> None:
    if not page.locator("[data-testid='view-query']").is_visible():
        page.get_by_role("button", name="Filters").click()
    page.wait_for_selector("[data-testid='view-query']")
    if page.locator("[data-testid='view-model-0']").count() == 0:
        page.click("[data-testid='view-add-model']")
    page.fill("[data-testid='view-model-0']", model)
    page.fill("[data-testid='view-where-0']", where)
    page.fill("[data-testid='view-relations']", relations)
    page.locator("[data-testid='view-relations']").blur()
    page.click("[data-testid='view-apply']")


def _drawn(page, nodes: int, edges: int) -> None:
    page.wait_for_function(
        "([n, e]) => document.querySelectorAll('.react-flow__node').length === n"
        " && document.querySelectorAll('.react-flow__edge').length === e",
        arg=[nodes, edges], timeout=20000)


def test_views_query_save_reload_and_point_at_another_store(stack):
    inherits = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}
    boundary = {"nodes": [{"model": "SpecNodeDoc", "where": 'kind = "boundary"'}], "relations": []}
    n_inherits, e_inherits = _expected(stack["store"], inherits)
    n_boundary, e_boundary = _expected(stack["store"], boundary)
    n_there, e_there = _expected(stack["other"], {**inherits, "relations": []})
    assert e_inherits > 0 and 0 < n_boundary < n_inherits and n_there > 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='views-section']", timeout=30000)

        _apply(page, "SpecNodeDoc", "", "inherits")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-name']", "Herencia")
        page.click("[data-testid='view-save']")
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=15000)
        from mindmap.projection_views import find_view
        assert find_view(stack["store"], "ViewDoc:herencia")["relations"] == ["inherits"]

        _apply(page, "SpecNodeDoc", 'kind = "boundary"', "")
        _drawn(page, n_boundary, e_boundary)

        page.reload()
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=30000)
        page.select_option("[data-testid='saved-view-select']", "ViewDoc:herencia")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-store-path']", str(stack["other"]))
        _apply(page, "SpecNodeDoc", "", "")
        _drawn(page, n_there, e_there)
        assert errors == []
        browser.close()
