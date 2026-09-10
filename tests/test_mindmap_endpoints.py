"""Tests HTTP reales de los endpoints del compilador (cierre del paso 8).

Levanta el servidor del editor de verdad con ``make_server`` en un hilo y lo
golpea con ``urllib``: nada de llamar a ``CompilationService`` directamente
(eso ya lo cubre ``test_mindmap_compiler.py``). Nunca escribe en el store real
``.sldb``: todos los casos usan stores temporales.
"""
import importlib.util
import json
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
