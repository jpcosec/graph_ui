import importlib.util
import json
from pathlib import Path

MODULE = Path(__file__).parents[1] / "frontends/mindmap/compiler.py"
_spec = importlib.util.spec_from_file_location("mindmap_compiler", MODULE)
compiler = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(compiler)
compile_json = compiler.compile_json
from sldb.store.query import load_runtime_documents
from sldb.cli.model_utils import resolve_model_ref


def test_compile_json_generates_models_and_documents(tmp_path):
    store = tmp_path / ".sldb"
    spec = {
        "models": [{"name": "Board", "fields": [
            {"name": "id", "type": "str", "description": "Identifier"},
            {"name": "title", "type": "str", "description": "Title"},
            {"name": "tasks", "type": "list[str]", "description": "Children", "default": []},
        ]}],
        "documents": [{"id": "main-board", "model": "Board", "payload": {"title": "Main", "tasks": []}}],
        "view": {"positions": {"main-board": {"x": 10, "y": 20}}},
    }
    result = compile_json(spec, store)
    assert result["generated_models"] == ["Board"]
    docs = load_runtime_documents(store, resolve_model_ref, str(tmp_path))
    assert [(d.name, d.model_name, d.payload["title"]) for d in docs] == [("main-board", "Board", "Main")]
    assert json.loads((store / "runtime" / "mindmap-view.json").read_text())["positions"]["main-board"]["x"] == 10


def test_compile_json_rejects_unknown_model(tmp_path):
    try:
        compile_json({"models": [], "documents": [{"id": "x", "model": "Missing", "payload": {}}]}, tmp_path / ".sldb")
    except ValueError as exc:
        assert "modelo desconocido" in str(exc)
    else:
        raise AssertionError("expected compiler failure")
