"""Tests del adaptador único de SLDB (paso 2 del plan de finalización)."""
import importlib.util
import json
import re
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"

_spec = importlib.util.spec_from_file_location("sldb_adapter", MINDMAP / "sldb_adapter.py")
adapter_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(adapter_mod)
SldbAdapter = adapter_mod.SldbAdapter

FIXTURE = json.loads((MINDMAP / "fixtures" / "kb-small.json").read_text(encoding="utf-8"))


def _compile(store, tmp_path):
    import importlib.util as iu
    cspec = iu.spec_from_file_location("mindmap_compiler", MINDMAP / "compiler.py")
    compiler = iu.module_from_spec(cspec)
    cspec.loader.exec_module(compiler)
    return compiler.compile_json(FIXTURE, store)


def test_adapter_reads_schema_graph_and_view(tmp_path):
    store = tmp_path / ".sldb"
    _compile(store, tmp_path)
    adapter = SldbAdapter(store)

    models = adapter.schema()
    assert {m["id"] for m in models} >= {"BoardDoc", "TaskDoc"}

    graph = adapter.graph()
    assert {d["id"] for d in graph["documents"]} == {"main-board", "task-onboarding", "task-review"}
    assert graph["view"]["positions"]["main-board"]["x"] == 40
    assert graph["revision"]

    found = adapter.find("task-review")
    assert found.payload["status"] == "done"


def test_adapter_validate_payload_roundtrip(tmp_path):
    store = tmp_path / ".sldb"
    _compile(store, tmp_path)
    adapter = SldbAdapter(store)

    valid, _ = adapter.validate_payload("TaskDoc", {"id": "new", "title": "N", "status": "open", "blocks": []})
    assert valid

    # El round-trip de SLDB debe fallar para un payload que viola el modelo.
    try:
        adapter.validate_payload("MissingModel", {"title": "x"})
    except Exception:
        pass
    else:
        raise AssertionError("expected unknown-model failure")


def test_adapter_create_update_delete_cycle(tmp_path):
    store = tmp_path / ".sldb"
    _compile(store, tmp_path)
    adapter = SldbAdapter(store)

    output = adapter.root / "desk" / "mindmap" / "TaskDoc" / "cycle-doc.md"
    adapter.create_document("cycle-doc", "TaskDoc", {"id": "cycle-doc", "title": "Ciclo", "status": "open", "blocks": []}, output)
    doc = adapter.find("cycle-doc")
    assert doc.payload["title"] == "Ciclo"

    adapter.update_document(doc, {**doc.payload, "status": "done"})
    assert adapter.find("cycle-doc").payload["status"] == "done"

    adapter.delete_document("cycle-doc")
    assert adapter.find("cycle-doc") is None
    assert output.exists()  # el Markdown se conserva


def test_adapter_view_revision_changes_on_write(tmp_path):
    store = tmp_path / ".sldb"
    _compile(store, tmp_path)
    adapter = SldbAdapter(store)
    before = adapter.view()["revision"]
    adapter.write_view({"positions": {"main-board": {"x": 1, "y": 2}}})
    after = adapter.view()
    assert after["revision"] != before
    assert after["view"]["positions"]["main-board"]["x"] == 1


def test_no_duplicate_sldb_imports_outside_adapter():
    """Regla del plan: solo el adaptador importa internos de SLDB (el resto,
    incluido el editor de clases, pasa por pron.Store). Recorre todo
    frontends/mindmap/*.py en vez de una lista fija, para no dejar huecos
    cuando se agregue un módulo nuevo."""
    allowed = "sldb_adapter.py"
    checked = [p for p in MINDMAP.glob("*.py") if p.name != allowed]
    assert checked, "no se encontraron módulos para revisar"
    for path in checked:
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith(("import sldb", "from sldb.")) or line == "from sldb import":
                raise AssertionError(f"{path.name} importa sldb directamente: {line.strip()}")
    assert (MINDMAP / allowed).exists()

def test_an_unimportable_model_is_reported_not_fatal(tmp_path):
    """G1: a model whose module does not import (its package is not on the path) used to make
    /api/schema drop the connection, and the Specs view said the store had no specs. The schema
    keeps the other models and carries the real error for the broken one."""
    store = tmp_path / ".sldb"
    _compile(store, tmp_path)
    index = store / "core" / "store_index.yaml"
    text = index.read_text(encoding="utf-8")
    broken = re.sub(r"model_ref: \S+:TaskDoc", "model_ref: nowhere_pkg.models:TaskDoc", text)
    assert broken != text
    index.write_text(broken, encoding="utf-8")

    models = {m["id"]: m for m in SldbAdapter(store).schema()}
    assert "nowhere_pkg" in models["TaskDoc"]["import_error"]
    assert models["TaskDoc"]["fields"] == []
    assert "import_error" not in models["BoardDoc"] and models["BoardDoc"]["fields"]


def test_graph_ui_takes_pythonpath_from_the_cli_and_the_environment(tmp_path):
    spec = importlib.util.spec_from_file_location("serve_for_roots", MINDMAP / "serve.py")
    serve = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(serve)
    roots, rest = serve.import_roots(["--pythonpath", str(tmp_path / "a"), "8090", f"--pythonpath={tmp_path / 'b'}"],
                                     {"SLDB_PYTHONPATH": str(tmp_path / "c")})
    assert roots == [str((tmp_path / d).resolve()) for d in ("a", "b", "c")]
    assert rest == ["8090"]
    assert serve.import_roots(["8088"], {}) == ([], ["8088"])
