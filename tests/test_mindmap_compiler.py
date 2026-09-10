import importlib.util
import json
from pathlib import Path

MODULE = Path(__file__).parents[1] / "frontends/mindmap/compiler.py"
_spec = importlib.util.spec_from_file_location("mindmap_compiler", MODULE)
compiler = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(compiler)
compile_json = compiler.compile_json
plan_source = compiler.plan_source
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
        compile_json({"models": [], "documents": [{"id": "x", "model": "Missing", "payload": {"title": "X"}}]}, tmp_path / ".sldb")
    except ValueError as exc:
        assert "modelo desconocido" in str(exc)
    else:
        raise AssertionError("expected compiler failure")


def test_plan_source_supports_nonexistent_store(tmp_path):
    """Dry-run sobre un store nuevo: todo altas, sin errores."""
    spec = {
        "models": [{"name": "Board", "fields": [{"name": "id", "type": "str"}, {"name": "title", "type": "str"}]}],
        "documents": [{"id": "b1", "model": "Board", "payload": {"title": "B"}}],
    }
    result = plan_source(spec, tmp_path / ".sldb")
    assert result["ok"] is True
    assert result["creates"] == ["b1"]
    assert result["updates"] == [] and result["conflicts"] == []
    assert result["new_models"] == ["Board"]
    assert not (tmp_path / ".sldb").exists()  # el dry-run no crea el store


def test_compile_json_invalid_payload_leaves_store_untouched(tmp_path):
    """Un payload inválido no registra modelos: el store queda intacto."""
    store = tmp_path / ".sldb"
    spec = {
        "models": [{
            "name": "Board",
            "fields": [
                {"name": "id", "type": "str"},
                {"name": "title", "type": "str"},
                {"name": "mode", "type": "str", "default": "a"},
            ],
        }],
        "documents": [
            {"id": "ok-doc", "model": "Board", "payload": {"title": "Válido"}},
            {"id": "bad-doc", "model": "Board", "payload": {"title": "Inválido", "mode": {"nested": "objeto"}}},
        ],
    }
    import importlib.util as iu
    mspec = iu.spec_from_file_location("mindmap_compiler", MODULE)
    module = iu.module_from_spec(mspec)
    mspec.loader.exec_module(module)
    try:
        module.compile_json(spec, store)
    except ValueError as exc:
        assert "bad-doc" in str(exc)
    else:
        raise AssertionError("expected compile failure")
    # El store no debe haberse creado ni inicializado a medias.
    assert not store.exists(), "el compilador no debe crear el store si la prevalidación falla"


def test_compile_json_valid_batch_still_registers_models(tmp_path):
    """Regresión: el reordenamiento no rompe el flujo válido."""
    store = tmp_path / ".sldb"
    spec = {
        "models": [{"name": "Board", "fields": [{"name": "id", "type": "str"}, {"name": "title", "type": "str"}]}],
        "documents": [{"id": "main-board", "model": "Board", "payload": {"title": "Main"}}],
    }
    compile_json(spec, store)
    docs = load_runtime_documents(store, resolve_model_ref, str(tmp_path))
    assert [d.model_name for d in docs] == ["Board"]


def test_plan_source_validates_payloads_and_reports_real_changes(tmp_path):
    """Dry-run valida payloads contra SLDB y distingue updates reales de no-op."""
    store = tmp_path / ".sldb"
    spec = {
        "models": [{"name": "Board", "fields": [{"name": "id", "type": "str"}, {"name": "title", "type": "str"}]}],
        "documents": [{"id": "b1", "model": "Board", "payload": {"title": "Primera"}}],
    }
    compile_json(spec, store)

    result = plan_source({
        "models": [],
        "documents": [
            {"id": "b1", "model": "Board", "payload": {"title": "Primera", "id": "b1"}},  # sin cambios reales
            {"id": "b2", "model": "Board", "payload": {"title": "Segunda"}},               # alta
            {"id": "b3", "model": "Board", "payload": {"title": 3}},                        # payload inválido
        ],
    }, store)
    assert result["ok"] is True
    assert result["creates"] == ["b2"]
    assert result["updates"] == []
    assert "b1" in result["unchanged"]
    assert [e["id"] for e in result["invalid_payloads"]] == ["b3"]
    assert result["unknown_models"] == [] and result["new_models"] == []


def test_plan_source_flags_class_conflict_and_unknown_model(tmp_path):
    store = tmp_path / ".sldb"
    spec = {
        "models": [
            {"name": "Board", "fields": [{"name": "id", "type": "str"}, {"name": "title", "type": "str"}]},
            {"name": "Other", "fields": [{"name": "id", "type": "str"}, {"name": "title", "type": "str"}]},
        ],
        "documents": [{"id": "b1", "model": "Board", "payload": {"title": "X"}}],
    }
    compile_json(spec, store)
    result = plan_source({
        "models": [],
        "documents": [
            {"id": "b1", "model": "Other", "payload": {"title": "X"}},
            {"id": "x9", "model": "Missing", "payload": {"title": "X"}},
        ],
    }, store)
    assert result["conflicts"] == [{"id": "b1", "reason": "ya existe como Board"}]
    assert result["unknown_models"] == ["x9"]
