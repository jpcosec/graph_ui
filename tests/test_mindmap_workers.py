"""Contrato de GET /api/workers: estado vivo de agentes, via deskops.

Los workers NO viven en sldb. Por eso esta ruta debe resolverse localmente
en AMBOS modos de backend (local y remote) y nunca reenviarse al upstream.

La fuente es `deskops runtime workers --format json`, no `herdr` directo:
el contrato con Herdr (validar la respuesta, tratar un `agents` ausente como
cambio de contrato) vive en deskops.runtime.herdr.HerdrProvider.list_agents().
Estos tests mutan `shutil.which` y `subprocess.run` del modulo serve para no
depender de un deskops instalado ni del estado real de la maquina.
"""
import importlib.util
import json
import subprocess
import threading
import urllib.request
from pathlib import Path

import pytest

MINDMAP = Path(__file__).resolve().parents[1] / "frontends/mindmap"


def _load(name):
    spec = importlib.util.spec_from_file_location(name, MINDMAP / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Forma exacta que emite `deskops runtime workers --format json`
# (verificado contra el CLI real: claves pane/kind/name/status/cwd/title/
# workspace/seq/focused, con name y title nulos cuando Herdr los omite).
DESKOPS_JSON = {
    "workers": [
        {
            "pane": "w-1:p-1",
            "kind": "pi",
            "name": "executor",
            "status": "working",
            "cwd": "/repo",
            "title": "pi - repo",
            "workspace": "w-1",
            "seq": 7,
            "focused": True,
        },
        {
            "pane": "w-2:p-3",
            "kind": "claude",
            "name": None,
            "status": "idle",
            "cwd": "/otro",
            "title": None,
            "workspace": "w-2",
            "seq": 2,
            "focused": False,
        },
    ]
}


class _Server:
    """Servidor real sobre un store vacio: /api/workers no toca el store."""

    def __init__(self, serve, store):
        self.server = serve.make_server(port=0, store=store)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


def _get(port, path):
    url = f"http://127.0.0.1:{port}{path}"
    with urllib.request.urlopen(url, timeout=10) as res:
        return res.status, json.loads(res.read())


def _completed(stdout, returncode=0, stderr=b""):
    command = ["deskops", "runtime", "workers", "--format", "json"]
    return subprocess.CompletedProcess(
        args=command, returncode=returncode, stdout=stdout, stderr=stderr
    )


@pytest.fixture
def server(tmp_path, monkeypatch):
    """serve.py cargado con deskops simulado; backend parametrizable."""
    created = []

    def factory(backend="local", which="/usr/bin/deskops", run=None):
        monkeypatch.setenv("GRAPH_UI_BACKEND", backend)
        serve = _load("serve")
        monkeypatch.setattr(serve.shutil, "which", lambda _: which)
        if run is not None:
            monkeypatch.setattr(serve.subprocess, "run", run)
        instance = _Server(serve, tmp_path / ".sldb")
        created.append(instance)
        return instance

    yield factory
    for instance in created:
        instance.stop()


# ------------------------------------------------------------------ contrato


@pytest.mark.parametrize("backend", ["local", "remote"])
def test_workers_resolves_locally_in_both_backends(server, backend):
    """La regresion que importa: en modo remote la ruta NO va a sldb.

    Sin el early-return en do_GET, el proxy remote intercepta todo /api/* y
    esta llamada devuelve 502 'SLDB no responde'.
    """
    srv = server(
        backend=backend,
        run=lambda *a, **k: _completed(json.dumps(DESKOPS_JSON).encode()),
    )
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert "error" not in body
    assert [w["pane"] for w in body["workers"]] == ["w-1:p-1", "w-2:p-3"]


def test_workers_passes_deskops_payload_through_unchanged(server):
    """El handler transporta; no reinterpreta el contrato de deskops."""
    srv = server(run=lambda *a, **k: _completed(json.dumps(DESKOPS_JSON).encode()))
    _, body = _get(srv.port, "/api/workers")
    assert body["workers"] == DESKOPS_JSON["workers"]
    second = body["workers"][1]
    assert "name" in second and second["name"] is None


def test_workers_delegates_to_deskops_not_herdr(server):
    """La fuente debe ser deskops: ahi vive la validacion del contrato Herdr."""
    seen = {}

    def spy(args, **kwargs):
        seen["args"] = args
        seen["kwargs"] = kwargs
        return _completed(json.dumps(DESKOPS_JSON).encode())

    srv = server(run=spy)
    _get(srv.port, "/api/workers")
    assert isinstance(seen["args"], list), "shell=True sobre datos externos es inyeccion"
    assert seen["args"][1:] == ["runtime", "workers", "--format", "json"]
    assert "herdr" not in seen["args"][0]
    assert seen["kwargs"].get("shell") is not True
    assert seen["kwargs"].get("timeout") == 10


# -------------------------------------------------------------- degradacion


def test_missing_deskops_binary_degrades_with_200(server):
    """La GUI debe seguir viva sin el runtime: nunca 500."""
    srv = server(which=None)
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "error" in body


def test_timeout_degrades_with_200(server):
    def boom(*a, **k):
        raise subprocess.TimeoutExpired(cmd="deskops", timeout=10)

    srv = server(run=boom)
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "timeout" in body["error"].lower()


def test_nonzero_exit_surfaces_the_deskops_error_message(server):
    """deskops imprime 'Error: <msg>' en stdout y sale 1; hay que mostrarlo."""
    srv = server(
        run=lambda *a, **k: _completed(
            b"Error: Herdr executable not found: /bin/noexiste\n", returncode=1
        )
    )
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "Herdr executable not found" in body["error"]


def test_invalid_json_degrades_with_200(server):
    srv = server(run=lambda *a, **k: _completed(b"no-json"))
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "error" in body


def test_missing_workers_key_is_an_error_not_an_empty_fleet(server):
    """Un 'workers' ausente es cambio de contrato, no flota vacia."""
    srv = server(run=lambda *a, **k: _completed(json.dumps({"other": 1}).encode()))
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "error" in body


def test_empty_fleet_is_not_an_error(server):
    """Cero workers con la clave presente es un estado valido, sin error."""
    srv = server(run=lambda *a, **k: _completed(json.dumps({"workers": []}).encode()))
    status, body = _get(srv.port, "/api/workers")
    assert status == 200
    assert body["workers"] == []
    assert "error" not in body
