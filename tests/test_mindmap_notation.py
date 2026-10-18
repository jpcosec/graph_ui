"""Contrato de GET /api/notation/view: un SpecDoc dibujado según su NotationDoc.

graph_ui no interpreta la notación: la resuelve
``spec2viz.notation_view.resolve_view`` (spec2viz/docs/notation-contract.md)
y este endpoint solo la transporta. El store es real y temporal: se arma con
``spec2viz diagram sync`` sobre los pilotos del repo de spec2viz, sin tocar
ningún store existente.
"""
import importlib.util
import json
import shutil
import subprocess
import threading
import urllib.error
import urllib.request
from pathlib import Path

import pytest

spec2viz = pytest.importorskip("spec2viz")
from spec2viz.notation_view import resolve_view  # noqa: E402

MINDMAP = Path(__file__).resolve().parents[1] / "frontends/mindmap"
PILOTS = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz"
STATECHART = "state.diagram-sync-lifecycle"
CLASSES = "class.sldb-models"


def _load(name):
    spec = importlib.util.spec_from_file_location(name, MINDMAP / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    root = tmp_path_factory.mktemp("notation")
    pilots = [PILOTS / "state-diagram-sync-lifecycle.yml", PILOTS / "class-sldb-models.yml"]
    if not all(p.exists() for p in pilots) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    for pilot in pilots:
        shutil.copy(pilot, root / pilot.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *(p.name for p in pilots), "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


class _Server:
    def __init__(self, serve, store):
        self.server = serve.make_server(port=0, store=store)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def get(self, path):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=30) as res:
                return res.status, json.loads(res.read())
        except urllib.error.HTTPError as exc:
            return exc.code, json.loads(exc.read())

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture
def server(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "local")
    running = _Server(_load("serve"), store)
    yield running
    running.stop()


def test_view_is_resolve_view_verbatim(server, store):
    status, body = server.get(f"/api/notation/view?spec={STATECHART}")
    assert status == 200
    # graph_ui no reinterpreta: lo servido es exactamente lo que resuelve spec2viz.
    assert body == json.loads(json.dumps(resolve_view(str(store), f"SpecDoc:{STATECHART}", str(store.parent))))


def test_statechart_brings_nest_links_and_the_initial_marker(server):
    _, view = server.get(f"/api/notation/view?spec=SpecDoc:{STATECHART}")
    assert view["notation"] == "NotationDoc:statechart" and view["skipped"] == []
    ids = {n["doc"] for n in view["nodes"]}
    assert all(link["source"] in ids and link["target"] in ids for link in view["links"])
    nests = [link for link in view["links"] if link["draw"] == "nest"]
    assert len(nests) == 3 and all(link["doc"] is None for link in nests)
    assert {link["source"].rsplit(".", 1)[-1] for link in nests} == {"syncing"}
    marked = [n for n in view["nodes"] if n["markers"]]
    assert [m["id"] for n in marked for m in n["markers"]] == ["initial"]


def test_class_diagram_brings_compartments_and_terminals(server):
    _, view = server.get(f"/api/notation/view?spec={CLASSES}")
    assert view["layout"]["kind"] == "graph"
    assert any(c["items"] for n in view["nodes"] for c in n["compartments"])
    assert all(link["draw"] == "line" for link in view["links"])
    assert {link["target_end"] for link in view["links"]} - {"none", None}


def test_unknown_spec_is_404_and_missing_param_is_400(server):
    assert server.get("/api/notation/view?spec=no-existe")[0] == 404
    assert server.get("/api/notation/view")[0] == 400


def test_remote_backend_answers_501_without_proxying(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "remote")
    running = _Server(_load("serve"), store)
    try:
        status, body = running.get(f"/api/notation/view?spec={STATECHART}")
    finally:
        running.stop()
    assert status == 501 and "modo local" in body["error"]
