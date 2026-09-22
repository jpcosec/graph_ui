"""Tests HTTP reales de los endpoints del compilador (cierre del paso 8).

Levanta el servidor del editor de verdad con ``make_server`` en un hilo y lo
golpea con ``urllib``: nada de llamar a ``CompilationService`` directamente
(eso ya lo cubre ``test_mindmap_compiler.py``). Nunca escribe en el store real
``.sldb``: todos los casos usan stores temporales.
"""
import importlib.util
import json
import re
import shutil
import sys
import tempfile
import threading
import urllib.error
import urllib.request
from pathlib import Path

import pytest

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
sys.path.insert(0, str(MINDMAP))


def _load(name):
    spec = importlib.util.spec_from_file_location(name, MINDMAP / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _compile_fixture(store):
    compiler = _load("compiler")
    compiler.compile_json(
        json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8")), store)


def _request(port, path, payload=None, *, origin=None, raw=None, timeout=30):
    url = f"http://127.0.0.1:{port}{path}"
    headers = {"Content-Type": "application/json"}
    if origin:
        headers["Origin"] = origin
    data = raw if raw is not None else (json.dumps(payload).encode() if payload is not None else None)
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status, json.loads(res.read())
    except urllib.error.HTTPError as exc:
        body = exc.read()
        try:
            return exc.code, json.loads(body)
        except json.JSONDecodeError:
            return exc.code, {"raw": body.decode(errors="replace")}
    except (BrokenPipeError, urllib.error.URLError) as exc:
        # El servidor rechaza bodies >5MB cerrando la lectura temprano: el
        # cliente puede ver un pipe roto. Se verifica que el servidor sigue
        # vivo y se reporta el rechazo como 413.
        if isinstance(exc, urllib.error.URLError) and "Broken pipe" not in str(exc.reason):
            raise
        probe = urllib.request.urlopen(f"http://127.0.0.1:{port}/api/schema", timeout=10)
        assert probe.status == 200, "el servidor murió al rechazar el body"
        return 413, {"ok": False, "error": "Solicitud demasiado grande."}


class _Server:
    def __init__(self, store):
        serve = _load("serve")
        self.server = serve.make_server(port=0, store=store)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture(scope="module")
def compiled_env():
    """Store temporal con la KB pequeña compilada + servidor HTTP real."""
    tmp = Path(tempfile.mkdtemp(prefix="kb-endpoints-"))
    store = tmp / ".sldb"
    _compile_fixture(store)
    env = _Server(store)
    yield {"env": env, "store": store}
    env.stop()
    shutil.rmtree(tmp, ignore_errors=True)


SOURCE = json.loads((MINDMAP / "fixtures/kb-small.json").read_text(encoding="utf-8"))


# ---------------------------------------------------------------- validación

def test_validate_ok_and_contract_report(compiled_env):
    port = compiled_env["env"].port
    status, report = _request(port, "/api/validate", {"source": SOURCE})
    assert status == 200 and report["ok"] is True
    assert report["version"] == 1
    assert "main-board" in report["documents"]
    assert all(isinstance(m, str) for m in report["models"])


def test_validate_broken_contract_returns_422_without_traceback(compiled_env):
    port = compiled_env["env"].port
    status, body = _request(port, "/api/validate", {"source": {"version": 99}})
    assert status == 422 and body["ok"] is False and body["errors"]


# ------------------------------------------------------------------- plan

def test_plan_against_compiled_store_reports_no_conflicts(compiled_env):
    port, store = compiled_env["env"].port, compiled_env["store"]
    status, plan = _request(port, "/api/plan", {"source": SOURCE})
    assert status == 200
    # El store ya contiene exactamente el fixture: sin altas ni conflictos.
    ids = {d["id"] for d in SOURCE["documents"]}
    planned = {d if isinstance(d, str) else d["id"]
               for key in ("creates", "updates", "unchanged") for d in plan.get(key, [])}
    assert planned == ids, f"plan inesperado: {plan}"
    assert not plan.get("conflicts") and not plan.get("invalid_payloads")
    assert plan["applicable"] is True and plan["planToken"]


def test_plan_against_empty_store_reports_only_creates():
    tmp = Path(tempfile.mkdtemp(prefix="kb-plan-empty-"))
    try:
        env = _Server(tmp / ".sldb")
        try:
            status, plan = _request(env.port, "/api/plan", {"source": SOURCE})
            assert status == 200
            created = {d if isinstance(d, str) else d["id"] for d in plan.get("creates", [])}
            assert created == {d["id"] for d in SOURCE["documents"]}
            assert not plan.get("conflicts")
        finally:
            env.stop()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_plan_with_unknown_model_is_not_applicable():
    tmp = Path(tempfile.mkdtemp(prefix="kb-plan-bad-"))
    try:
        env = _Server(tmp / ".sldb")
        try:
            bad = {**SOURCE, "documents": [{**SOURCE["documents"][0], "model": "NoExiste"}]}
            status, plan = _request(env.port, "/api/plan", {"source": bad})
            assert status == 200
            assert plan["applicable"] is False and plan.get("unknown_models")
        finally:
            env.stop()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ---------------------------------------------------------------- compile

def test_compile_requires_plan_token_and_applies_with_it():
    """409 sin planToken; 200 con el token del plan; escritura real en store."""
    tmp = Path(tempfile.mkdtemp(prefix="kb-compile-"))
    try:
        env = _Server(tmp / ".sldb")
        try:
            # Sin planToken previo → 409 (la KB pudo cambiar fuera de sesión).
            status, body = _request(env.port, "/api/compile", {"source": SOURCE})
            assert status == 409 and body["ok"] is False

            _, plan = _request(env.port, "/api/plan", {"source": SOURCE})
            status, done = _request(
                env.port, "/api/compile", {"source": SOURCE, "planToken": plan["planToken"]})
            assert status == 200 and done.get("refresh_required") is True

            # Round-trip real: los documentos del fixture existen en el store.
            sldb_adapter = _load("sldb_adapter")
            adapter = sldb_adapter.SldbAdapter(tmp / ".sldb")
            ids = {d.name for d in adapter.documents()}
            assert {d.get("id", d.get("name")) for d in SOURCE["documents"]} <= ids
        finally:
            env.stop()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ----------------------------------------------------------------- export

def test_export_matches_fixture_and_round_trips(compiled_env):
    """Exportar, compilar en otra KB y reexportar conserva el estado completo."""
    port, store = compiled_env["env"].port, compiled_env["store"]
    status, exported = _request(port, "/api/export", {})
    assert status == 200 and exported["version"] == 1

    contract = _load("contract")
    contract.validate(exported)  # no debe lanzar ContractError

    ids = {d["id"] for d in exported["documents"]}
    assert "main-board" in ids

    tmp = Path(tempfile.mkdtemp(prefix="kb-roundtrip-"))
    try:
        env = _Server(tmp / ".sldb")
        try:
            _, plan = _request(env.port, "/api/plan", {"source": exported})
            planned = {d if isinstance(d, str) else d["id"] for d in plan.get("creates", [])}
            assert planned == ids, f"round-trip pierde documentos: {plan}"
            assert not plan.get("conflicts") and not plan.get("invalid_payloads")
            assert plan["applicable"] is True
            status, applied = _request(env.port, "/api/compile", {
                "source": exported, "planToken": plan["planToken"],
            })
            assert status == 200 and set(applied["documents"]) == ids
            status, restored = _request(env.port, "/api/export", {})
            assert status == 200
            assert restored == exported, "round-trip debe conservar modelos, payloads y layout"
        finally:
            env.stop()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_export_rejects_non_list_documents(compiled_env):
    status, body = _request(compiled_env["env"].port, "/api/export", {"documents": "no"})
    assert status == 400 and body["ok"] is False


# ------------------------------------------------------------ guardas HTTP

def test_cross_origin_write_is_rejected(compiled_env):
    status, body = _request(
        compiled_env["env"].port, "/api/validate", {"source": SOURCE},
        origin="http://evil.example")
    assert status == 403 and body["ok"] is False


def test_oversized_body_is_rejected_with_413(compiled_env):
    big = json.dumps({"source": SOURCE, "pad": "x" * (5_000_001)}).encode()
    status, body = _request(compiled_env["env"].port, "/api/validate", raw=big)
    assert status == 413 and body["ok"] is False


def test_malformed_json_is_rejected_with_400(compiled_env):
    status, body = _request(compiled_env["env"].port, "/api/validate", raw=b"{no-json")
    assert status == 400 and body["ok"] is False


def test_non_object_json_is_rejected_with_400(compiled_env):
    status, body = _request(compiled_env["env"].port, "/api/validate", payload=[1, 2])
    assert status == 400 and body["ok"] is False


def test_get_schema_and_graph_against_compiled_store(compiled_env):
    port = compiled_env["env"].port
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/schema", timeout=10) as res:
        schema = json.loads(res.read())
        assert res.status == 200 and schema.get("models")
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/graph", timeout=10) as res:
        graph = json.loads(res.read())
    assert graph["documents"] and {d["id"] for d in graph["documents"]} >= {"main-board"}


def test_get_document_with_ir_and_ir_alone(compiled_env):
    """/api/document sirve el documento con su IR (secciones reales,
    field_path y spans) usando el MISMO builder que sldb serve; /api/document/ir
    devuelve solo el IR. Doc inexistente → 404 (igual que sldb /document)."""
    port = compiled_env["env"].port
    with urllib.request.urlopen(
        f"http://127.0.0.1:{port}/api/document?id=task-onboarding", timeout=20) as res:
        doc = json.loads(res.read())
        assert res.status == 200
    assert set(doc) == {"id", "model_name", "path", "payload", "semantic_tags", "ir"}
    # Paridad de shape con sldb serve (verificado contra 8310 el 2026-09-22):
    # GET /document NO trae `version` (el `_flat` del server lo omite; la
    # clave `version` solo vive en /graph vía serialize_document). Local y
    # remote coinciden sin version — no se agrega localmente.
    assert "version" not in doc
    ir = doc["ir"]
    assert set(ir) == {"context", "structure", "nodes", "surface", "graph", "context_index"}
    # (a) secciones reales del documento, (b) direccionamiento por field_path,
    # (c) spans de línea — los tres salen del IR, no del payload plano.
    assert ir["structure"], "el IR debe traer las secciones reales del documento"
    field_paths = [n["field_path"] for n in ir["nodes"] if n["kind"] == "field"]
    assert "title" in field_paths and "status" in field_paths
    assert all(set(n) >= {"span"} for n in ir["nodes"])
    assert isinstance(ir["context_index"], list)
    with urllib.request.urlopen(
        f"http://127.0.0.1:{port}/api/document/ir?id=task-onboarding", timeout=20) as res:
        ir_alone = json.loads(res.read())
    assert ir_alone == ir
    # Doc inexistente: 404 con mensaje (espeja sldb serve).
    status, body = _request(port, "/api/document?id=no-existe")
    assert status == 404 and not body.get("ok", True)
    # id obligatorio.
    status, body = _request(port, "/api/document")
    assert status == 400


def test_document_shape_matches_sldb_serve_no_version(compiled_env):
    """Paridad de shape /document local ↔ sldb serve: ambos emiten exactamente
    {id, model_name, path, payload, semantic_tags, ir}. La clave `version` NO
    pertenece a /document (en sldb vive solo en /graph vía serialize_document,
    hash_d); verificada contra el 8310 real el 2026-09-22, así que local no la
    agrega — shapes coinciden sin ella."""
    port = compiled_env["env"].port
    with urllib.request.urlopen(
        f"http://127.0.0.1:{port}/api/document?id=main-board", timeout=20) as res:
        doc = json.loads(res.read())
    assert set(doc) == {"id", "model_name", "path", "payload", "semantic_tags", "ir"}
    assert "version" not in doc
    assert "ir" in doc and set(doc["ir"]) == {"context", "structure", "nodes", "surface", "graph", "context_index"}


# ------------------------------------------------------------- ruteo (fase D)

@pytest.mark.parametrize("route", ["/documents/map", "/models/diagram", "/draft/tree"])
def test_route_serves_app_shell(compiled_env, route):
    port = compiled_env["env"].port
    with urllib.request.urlopen(f"http://127.0.0.1:{port}{route}", timeout=10) as res:
        body = res.read().decode()
        assert res.status == 200
        assert "text/html" in res.headers.get("Content-Type", "")
    assert 'id="root"' in body


def test_get_root_serves_app_shell(compiled_env):
    port = compiled_env["env"].port
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=10) as res:
        body = res.read().decode()
        assert res.status == 200
        assert "text/html" in res.headers.get("Content-Type", "")
    assert 'id="root"' in body


def test_get_real_static_files_are_served_directly(compiled_env):
    port = compiled_env["env"].port
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/app.js", timeout=10) as res:
        assert res.status == 200
        assert "javascript" in res.headers.get("Content-Type", "")
    with urllib.request.urlopen(f"http://127.0.0.1:{port}/skins/light.css", timeout=10) as res:
        assert res.status == 200
        assert "text/css" in res.headers.get("Content-Type", "")


def test_get_missing_static_file_with_extension_is_404(compiled_env):
    port = compiled_env["env"].port
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/nope.js", timeout=10)
        raise AssertionError("se esperaba 404")
    except urllib.error.HTTPError as exc:
        assert exc.code == 404


def test_get_unknown_api_route_is_404_json(compiled_env):
    port = compiled_env["env"].port
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/api/nope", timeout=10)
        raise AssertionError("se esperaba 404")
    except urllib.error.HTTPError as exc:
        assert exc.code == 404
        body = json.loads(exc.read())
        assert body["ok"] is False


# ---------------------------------------------------- vistas como plugins

def _declared_view_styles():
    """Extrae los `styles: [...]` de cada descriptor de vista real
    (map-view.js, flow-view.js, tree-view.js, diagram-view.js), no un glob de
    disco: eso solo prueba que el archivo existe, no que el descriptor
    registrado en shell/registry.js lo declara — es el enlace
    descriptor -> archivo lo que este test verifica."""
    urls = []
    for path in (MINDMAP / "views").rglob("*-view.js"):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(r"styles\s*:\s*\[([^\]]*)\]", text):
            urls.extend(re.findall(r"['\"](/[^'\"]+\.css)['\"]", match.group(1)))
    return urls


def test_every_declared_view_style_resolves(compiled_env):
    port = compiled_env["env"].port
    urls = _declared_view_styles()
    assert len(urls) >= 4, f"se esperaban al menos 4 hojas de vista declaradas: {urls}"
    assert len(urls) == len(set(urls)), f"hrefs de vista duplicados: {urls}"
    for url in urls:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}{url}", timeout=10) as res:
            assert res.status == 200, f"{url} no resolvió 200"
            assert "text/css" in res.headers.get("Content-Type", ""), f"{url} no es text/css"


# -------------------------------------------------------- modelos (paso 7)

def test_models_list(compiled_env):
    port = compiled_env["env"].port
    status, result = _request(port, "/api/models/list", {})
    assert status == 200 and "models" in result
    models = {m["name"] for m in result["models"]}
    assert "BoardDoc" in models and "TaskDoc" in models


def test_models_detail(compiled_env):
    port = compiled_env["env"].port
    status, result = _request(port, "/api/models/detail", {"model": "BoardDoc"})
    assert status == 200
    # Shape estructurado (model_dump) desde vuelta 5: igual en local y en
    # sldb serve (GET /models/detail?model=…). El yaml quedó fuera.
    assert result.get("ok") is True
    assert "text" not in result, "el detail local ya no emite yaml"
    model = result.get("model") or {}
    assert model.get("name") == "BoardDoc"
    assert set(model) >= {"model_ref", "path", "version", "canonical", "family",
                          "semantics", "base_models", "fields", "documents"}
    assert model["fields"][0]["name"] and "annotation" in model["fields"][0]
    docs = model.get("documents") or []
    assert any(d.get("name") == "main-board" for d in docs), f"docs trackeados: {docs}"

def test_models_validate(compiled_env):
    port = compiled_env["env"].port
    status, result = _request(port, "/api/models/validate", {"model": "BoardDoc"})
    assert status == 200
    assert result.get("valid") is True or result.get("valid") in ("true", True)


def test_models_template_edit(compiled_env):
    port, store = compiled_env["env"].port, compiled_env["store"]
    status, result = _request(port, "/api/models/template-edit", {"model": "BoardDoc", "content": "# Draft template\n\nNew content."})
    assert status == 200 and result.get("ok") is not False
    # El archivo .py.temp se escribe al lado del .py compilado (store.parent)
    drafts = list(Path(store).parent.glob("*.py.temp"))
    assert drafts, f"no se creó archivo .py.temp en {store.parent}"


def test_models_unknown_action(compiled_env):
    port = compiled_env["env"].port
    status, body = _request(port, "/api/models/nonesuch", {})
    assert status == 400 and "desconocida" in body.get("error", "")


def test_models_fields_add_and_remove(compiled_env):
    port, store = compiled_env["env"].port, compiled_env["store"]
    status, result = _request(port, "/api/models/fields-add", {
        "model": "BoardDoc", "field_name": "priority",
        "field_type": "int", "description": "Prioridad 1-5"})
    assert status == 200 and result.get("ok") is not False, f"fields-add falló: {result}"
    # El campo se escribe en el draft .py.temp (show muestra el modelo activo)
    drafts = list(Path(store).parent.glob("*.py.temp"))
    assert drafts and any("priority" in d.read_text() for d in drafts), "draft no contiene el campo"
    # Quitarlo del draft
    status, result = _request(port, "/api/models/fields-remove", {
        "model": "BoardDoc", "field_name": "priority"})
    assert status == 200 and result.get("ok") is not False, f"fields-remove falló: {result}"


def test_models_fields_add_requires_name(compiled_env):
    port = compiled_env["env"].port
    status, result = _request(port, "/api/models/fields-add", {
        "model": "BoardDoc", "field_name": "", "field_type": "string"})
    assert status == 400 and result.get("ok") is False


@pytest.fixture
def fresh_env():
    """Store propio por test: promover muta el modelo y no debe filtrarse al store compartido."""
    tmp = Path(tempfile.mkdtemp(prefix="kb-promote-"))
    store = tmp / ".sldb"
    _compile_fixture(store)
    env = _Server(store)
    yield {"env": env, "store": store}
    env.stop()
    shutil.rmtree(tmp, ignore_errors=True)


def test_models_promote_without_draft_is_rejected(fresh_env):
    """Sin draft, SLDB valida el modelo activo y rechaza la promoción: nada cambia."""
    port = fresh_env["env"].port
    status, result = _request(port, "/api/models/promote", {"model": "TaskDoc"}, timeout=60)
    assert status == 200 and result.get("ok") is False, f"promote sin draft no fue rechazado: {result}"
    assert "draft" in result.get("error", "").lower()


def test_models_promote_installs_validated_draft(fresh_env):
    """fields-add → validate → promote: el modelo activo expone el campo y el draft desaparece."""
    port, store = fresh_env["env"].port, fresh_env["store"]
    status, result = _request(port, "/api/models/fields-add", {
        "model": "TaskDoc", "field_name": "priority", "field_type": "str",
        "description": "Prioridad", "default": '"normal"'})
    assert status == 200 and result.get("ok") is not False, f"fields-add falló: {result}"
    status, result = _request(port, "/api/models/validate", {"model": "TaskDoc"}, timeout=60)
    assert status == 200 and result.get("valid") is True and result.get("draft") is True, result
    status, result = _request(port, "/api/models/promote", {"model": "TaskDoc"}, timeout=60)
    assert status == 200 and result.get("promoted") is True, f"promote falló: {result}"
    assert not any("class TaskDoc" in d.read_text() for d in Path(store).parent.glob("*.py.temp")), \
        "el draft sobrevivió a la promoción"
    status, detail = _request(port, "/api/models/detail", {"model": "TaskDoc"})
    assert status == 200 and "priority" in str(detail)
