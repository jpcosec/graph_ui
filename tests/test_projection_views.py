"""Projection views evaluated with sldb's API over real, temporary stores.

The stores are built with ``spec2viz diagram sync`` from spec2viz's own pilots: ``SpecNodeDoc``
documents joined by typed relations (``uses``, ``inherits``, ``reads``). A view names models,
``where`` predicates and relation types, so the same view runs against a second store too.
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

from mindmap.projection_views import ViewError, evaluate_view  # noqa: E402

MINDMAP = Path(__file__).resolve().parents[1] / "frontends/mindmap"
PILOTS = Path(spec2viz.__file__).resolve().parents[1] / "docs/architecture/spec2viz"
INHERITS = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}


def _store(root: Path, pilots: list[str]) -> Path:
    if not all((PILOTS / p).exists() for p in pilots) or not shutil.which("spec2viz"):
        pytest.skip("sin los pilotos o el CLI de spec2viz")
    for pilot in pilots:
        shutil.copy(PILOTS / pilot, root / pilot)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["spec2viz", "diagram", "sync", *pilots, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    return _store(tmp_path_factory.mktemp("views"), ["component-exception-hierarchy.yml", "component-type-system.yml"])


@pytest.fixture(scope="module")
def other_store(tmp_path_factory):
    return _store(tmp_path_factory.mktemp("views-other"), ["component-architecture.yml"])


def test_nodes_by_model_and_edges_by_relation_type(store):
    result = evaluate_view(store, INHERITS)
    ids = {n["id"] for n in result["nodes"]}
    assert ids and all(n["model"] == "SpecNodeDoc" for n in result["nodes"])
    assert result["edges"] and {e["relation_type"] for e in result["edges"]} == {"inherits"}
    assert all(e["source"] in ids and e["target"] in ids for e in result["edges"])


def test_where_narrows_the_nodes_and_drops_edges_that_leave_them(store):
    everything = evaluate_view(store, {**INHERITS, "relations": []})
    boundary = evaluate_view(store, {"nodes": [{"model": "SpecNodeDoc", "where": 'kind = "boundary"'}], "relations": []})
    assert 0 < len(boundary["nodes"]) < len(everything["nodes"])
    assert all(n["payload"]["kind"] == "boundary" for n in boundary["nodes"])
    kept = {n["id"] for n in boundary["nodes"]}
    assert all(e["source"] in kept and e["target"] in kept for e in boundary["edges"])
    assert len({e["relation_type"] for e in everything["edges"]}) > 1


def test_layout_comes_from_the_notation_unless_the_view_overrides_it(store):
    from_notation = evaluate_view(store, {**INHERITS, "notation": "NotationDoc:component"})
    assert from_notation["layout"]["kind"] == "graph"
    overridden = evaluate_view(store, {**INHERITS, "notation": "NotationDoc:component", "layout": {"kind": "graph", "style": "rings"}})
    assert overridden["layout"] == {"kind": "graph", "style": "rings"}


def test_malformed_views_are_rejected(store):
    with pytest.raises(ViewError):
        evaluate_view(store, {**INHERITS, "direction": "sideways"})
    with pytest.raises(ViewError):
        evaluate_view(store, {"nodes": [{"model": "SpecNodeDoc", "where": "kind ==="}]})


def _load_serve():
    spec = importlib.util.spec_from_file_location("serve", MINDMAP / "serve.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def server(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "local")
    httpd = _load_serve().make_server(port=0, store=store)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{httpd.server_address[1]}"
    httpd.shutdown()
    httpd.server_close()


def _call(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read())


def test_http_evaluates_an_unsaved_view_and_points_it_at_another_store(server, other_store):
    status, here = _call(f"{server}/api/views/evaluate", {"view": INHERITS})
    assert status == 200 and here["edges"]
    status, there = _call(f"{server}/api/views/evaluate", {"view": {**INHERITS, "relations": []}, "store": str(other_store)})
    assert status == 200 and there["store"] == str(other_store) and there["nodes"]
    assert {n["id"] for n in there["nodes"]}.isdisjoint({n["id"] for n in here["nodes"]})


def test_http_errors_say_what_is_wrong(server, tmp_path):
    assert _call(f"{server}/api/views/evaluate?view=ViewDoc:no-such-view")[0] == 404
    assert _call(f"{server}/api/views/evaluate", {"view": {**INHERITS, "direction": "up"}})[0] == 422
    assert _call(f"{server}/api/views/evaluate", {"view": INHERITS, "store": str(tmp_path)})[0] == 404
    assert _call(f"{server}/api/views", None)[1] == {"views": []}


def test_a_saved_view_is_a_viewdoc_of_the_store_and_evaluates_by_ref(server, store):
    pytest.importorskip("spec2viz.sldb_models").ViewDoc  # task a: the model lives in spec2viz
    view = {**INHERITS, "title": "Herencia", "notation": "NotationDoc:component", "layout": {"kind": "graph", "style": "layered"}}
    status, saved = _call(f"{server}/api/views/save", {"name": "herencia", "view": view})
    assert status == 200 and saved["ref"] == "ViewDoc:herencia"
    _, listed = _call(f"{server}/api/views")
    assert [v["ref"] for v in listed["views"]] == ["ViewDoc:herencia"]
    status, by_ref = _call(f"{server}/api/views/evaluate?view=ViewDoc:herencia")
    assert status == 200 and by_ref["layout"]["style"] == "layered"
    assert by_ref["edges"] == evaluate_view(store, view)["edges"]
    resaved = _call(f"{server}/api/views/save", {"name": "herencia", "view": {**view, "relations": ["uses"]}})[1]
    assert resaved["view"]["relations"] == ["uses"]
    assert _call(f"{server}/api/views/save", {"name": "rota", "view": {**view, "direction": "up"}})[0] == 422
