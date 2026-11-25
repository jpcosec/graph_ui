FILE:desk/tasks/task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia.md
---
sldb:
  by: agent
  at: '2026-11-16T12:43:45Z'
  authority: generated
  via: save_document_payload
id: task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- /home/jp/proyectos/softfactory_spec/SPEC.md
- f16fcd1
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
- frontends/mindmap/persistence.py
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/serve.py
- frontends/mindmap/views/workspace/
- tests/test_mindmap_workspace_edit.py
- docs/workspace-ui.md
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
closeout_evidence:
- tests
- commit
- atom
---

# Edicion contextual de relaciones y campos con control de concurrencia

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K06, K11, K13, K15) el usuario edita campos y agrega o quita relaciones desde el workspace sin saber en qué archivo se persisten, y las ediciones concurrentes de agentes o del CLI no se pisan en silencio. Editar la KB SLDB es la función propia de graph_ui (JP, 2026-11-16: graph_ui y la UI de deskops son productos distintos), así que esta tarea sigue en graph_ui. La decisión de T4 (opción A, por ahora) limita solo el código: aquí se editan documentos y relaciones, nunca código.

## Goal

_Describe the concrete result this task must produce._

Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.

## Scope

_State what is in scope and what is out of scope._

ENTRA: endpoints de mutación de campos y relaciones en frontends/mindmap con verificación de revisión previa (before-image), reutilizando el mecanismo de revisión y 409 que ya usa persistence.py para guardar el mapa (no uno nuevo); controles de edición en el panel Context y en la proyección Document del workspace; docs/workspace-ui.md; pruebas reales de persistencia y de conflicto 409. NO ENTRA: editar código o anclajes de código (T4, opción A), escribir en el store por fuera de pron.Store/sldb, y los cambios sin commitear de JP en frontends/desk/app.js y task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

Integrar las acciones + Add relation / Remove relation y guardado de campos del workspace con las mutaciones reales de pron.Store bajo el lock/revisión del servidor, devolviendo 409 ante revisiones obsoletas.

## Validation

_List the checks required before this task can close._

- pytest -q tests/test_mindmap_workspace_edit.py

## Done When

_Name the observable condition that makes the task complete._

Agregar o eliminar una relacion y editar un campo desde el workspace persiste en el store real bajo lock de servidor, sobrevive a recargar y rechaza con 409 una escritura con revision obsoleta sin perder estado local, con pruebas pytest en verde.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
---
# pill-xxx
id: pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:runtime
---

# Guardrail: no mocks, no stubs, no fake data in deliverables

## What

_Define the context or guardrail this pill carries._

A hard prohibition on mock/stub/fake/placeholder implementations in any code an executor delivers. This includes: returning hardcoded fake values instead of real computation, leaving TODO/FIXME stubs in place of logic, fabricated sample data standing in for real data flow, no-op functions pretending to work, commented-out real logic replaced by a shortcut, or tests that assert against invented data instead of the real contract.

## Why

_Explain why this context matters for safe execution._

This ecosystem treats deliverables as production truth. A mock silently breaks the nucleus tesis (real typed data flowing sldb -> sldb.api.graph -> overlay). Mocks pass shallow checks while leaving the contract unimplemented, causing false-green closeouts and drift that surfaces much later. Real wiring is the only acceptable evidence a task is done.

## When

_Describe when an agent should apply this pill._

Applied to every executor and tester dispatch, at all times, for every task. There is no exception where a mock is acceptable as a final deliverable. If real data or a real dependency is genuinely unavailable, the executor must STOP and report the blocker, not paper over it with a mock.

## Where

_Name the files, surfaces, or scope this pill applies to._

All implementation code under apps/, scripts/, src/, and any generated artifacts. Applies to graph_ui and every downstream instance.

## How

_Describe the correct way to apply this guidance._

Wire the real dependency. Derive values from the real source (real model descriptor, real store, real generator output). If a build artifact is needed, generate it with the real generator and commit the real output. Tests must validate the real contract against real generated output, not against inlined fixtures that duplicate the expected answer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not stub a function to return a constant. Do not inline fake node-type definitions to make a test pass. Do not write a test whose expected value is a copy-paste of a hardcoded literal that bypasses the generator. Do not leave TODO placeholders where logic belongs. Do not fabricate data to simulate a data source.

FILE:desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md
---
id: atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
title: Workspace presents document, graph, code, and changes as projections of the
  same node
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:workspace
---

# Workspace presents document, graph, code, and changes as projections of the same node

## Answer

El Knowledge Workspace en Mindmap presenta documento, subgrafo local (1-2 hops), proyección de código e impacto de mutaciones (Changes/staleness) como vistas navegables del mismo objeto lógico del store, acompañadas de un panel lateral de contexto con su identidad, hash, relaciones y alertas de integridad.

FILE:frontends/mindmap/serve.py
#!/usr/bin/env python3
"""Serve the KB editor, SLDB proxy and validated persistence bridge.

Dos modos, elegidos por GRAPH_UI_BACKEND (default 'local'):

- local (intacto): EditorStore en proceso; depende de pron
  (AVISO-imports-rotos.md) y de los módulos models_service/compilation.
- remote: TODAS las lecturas que sldb serve expone hoy se sirven desde
  ahí (SLDB_URL): /api/schema, /api/graph, /api/edges*, /api/graph/*,
  /api/models, /api/models/detail, /api/lint, /api/health,
  /api/semantic-export y lecturas futuras (/document, /document/ir) sin
  tocar código. Las ESCRITURAS con equivalente en sldb serve también se
  migran: /api/save (los 'changes' viajan a POST /save; la view, estado
  de presentación, se persiste LOCAL en runtime/mindmap-view.json solo si
  el guardado remoto fue exitoso) y /api/models/{fields-add, fields-remove,
  template-edit, validate, promote} → POST homólogo. Los POST
  /api/models/list y /api/models/detail (lecturas) se traducen al GET
  homólogo. La COMPILACIÓN (/api/validate, /api/plan, /api/compile,
  /api/export) NO tiene equivalente en sldb serve y sigue en el proceso
  local incluso en modo remote: responde 501 explícito. Las rutas /sldb/*
  son un proxy pasante en ambos modos.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse
import errno
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

SLDB_UPSTREAM = os.environ.get('SLDB_URL', 'http://127.0.0.1:8787')
BACKEND_MODE = os.environ.get('GRAPH_UI_BACKEND', 'local')
MINDMAP_DIR = Path(__file__).resolve().parent
VIEW_FILENAME = 'mindmap-view.json'


def view_file():
    """Archivo de vista del editor (presentación; NUNCA va a sldb).

    Misma ubicación que el modo local (SldbAdapter):
    <store>/runtime/mindmap-view.json. En modo remote el store local se
    toma de SLDB_STORE; default: el .sldb de graph_ui.
    """
    store = Path(os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    return store / 'runtime' / VIEW_FILENAME


def local_view():
    """Vista local actual + su revision (sha256 del archivo), como en local."""
    path = view_file()
    raw = path.read_bytes() if path.exists() else b'{}'
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f'El archivo de vista está corrupto: {exc}') from exc
    if not isinstance(parsed, dict):
        raise ValueError('El archivo de vista no contiene un objeto JSON.')
    return {'view': parsed, 'revision': hashlib.sha256(raw).hexdigest()}


def write_local_view(view):
    """Persistencia atómica de la vista local (tmp + replace), como SldbAdapter."""
    path = view_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(view, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)


class ProxyHandler(SimpleHTTPRequestHandler):
    editor_store = None
    compilation = None
    workspace_routes = None
    backend_mode = BACKEND_MODE
    # Modo local: se reemplaza por persistence.SaveError al construir el handler.
    save_error = Exception

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(MINDMAP_DIR), **kwargs)

    def json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy_request(self, method):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))) if method == 'POST' else None
        req = urllib.request.Request(SLDB_UPSTREAM + self.path[len('/sldb'):], data=body,
            headers={'Content-Type': 'application/json'}, method=method)
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                self.json_response(json.loads(response.read()), response.status)
        except urllib.error.HTTPError as exc:
            self.json_response(json.loads(exc.read()), exc.code)
        except (urllib.error.URLError, TimeoutError) as exc:
            self.json_response({'ok': False, 'error': f'SLDB no responde: {exc}'}, 502)

    def _remote_get(self, path):
        """GET a sldb serve y reenvía el JSON tal cual (proxy transparente)."""
        req = urllib.request.Request(SLDB_UPSTREAM + path, method='GET')
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                return json.loads(response.read()), response.status
        except urllib.error.HTTPError as exc:
            return json.loads(exc.read()), exc.code
        except (urllib.error.URLError, TimeoutError) as exc:
            return {'ok': False, 'error': f'SLDB no responde: {exc}'}, 502

    def _remote_post(self, route, body):
        """POST a sldb serve y reenvía el JSON tal cual (proxy transparente)."""
        data = json.dumps(body).encode()
        req = urllib.request.Request(SLDB_UPSTREAM + route, data=data,
            headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read()), response.status
        except urllib.error.HTTPError as exc:
            return json.loads(exc.read()), exc.code
        except (urllib.error.URLError, TimeoutError) as exc:
            return {'ok': False, 'error': f'SLDB no responde: {exc}'}, 502

    def _api_notation_view(self):
        """GET /api/notation/view?spec=<SpecDoc>: el spec dibujado según su notación.

        Lo resuelve sldb (``sldb.api.notations.resolve_view``) sobre el store local; sldb serve
        no tiene equivalente, así que en remote responde 501 explícito.
        """
        if self.backend_mode == 'remote':
            return self.json_response({'ok': False, 'error': 'La vista de notación solo existe en modo local: resolve_view necesita el store en disco.'}, 501)
        spec = (parse_qs(urlparse(self.path).query).get('spec') or [None])[0]
        if not spec:
            return self.json_response({'ok': False, 'error': 'spec es obligatorio'}, 400)
        try:
            self.json_response(self.editor_store.notation_view(spec))
        except self.save_error as exc:
            self.json_response({'ok': False, 'error': str(exc)}, getattr(exc, 'status', 500))

    def _api_views(self, method, body):
        """/api/views*: projection views (mindmap.views_routes), local mode only like notation."""
        if self.backend_mode == 'remote':
            return self.json_response({'ok': False, 'error': 'Las vistas solo existen en modo local: se evalúan sobre un store en disco.'}, 501)
        from mindmap.views_routes import dispatch
        url = urlparse(self.path)
        payload, status = dispatch(method, url.path, parse_qs(url.query), body, self.editor_store.store)
        self.json_response(payload, status)

    def _api_workers(self):
        """GET /api/workers: agentes vivos, via `deskops runtime workers`.

        El estado de workers NO vive en sldb, asi que esta ruta se resuelve
        siempre localmente, antes del proxy remote de /api/*.

        Se delega en deskops (no en `herdr` directo) porque ahi vive el
        contrato: HerdrProvider.list_agents() ya valida la respuesta de Herdr
        y trata un `agents` ausente como cambio de contrato, no como flota
        vacia. Este handler solo transporta ese JSON al navegador.

        Si deskops falta o falla, se responde 200 con lista vacia y error: la
        GUI debe seguir viva sin el runtime (nunca 500).
        """
        binary = shutil.which('deskops')
        if not binary:
            return self.json_response({'workers': [], 'error': 'deskops no esta instalado.'})
        command = [binary, 'runtime', 'workers', '--format', 'json']
        try:
            proc = subprocess.run(command, capture_output=True, timeout=10)
        except subprocess.TimeoutExpired:
            return self.json_response({'workers': [], 'error': 'deskops runtime workers excedio el timeout de 10s.'})
        except OSError as exc:
            return self.json_response({'workers': [], 'error': f'No se pudo ejecutar deskops: {exc}'})
        if proc.returncode != 0:
            # deskops imprime 'Error: <msg>' en stdout y sale con 1.
            detail = (proc.stdout or proc.stderr).decode(errors='replace').strip()
            return self.json_response({'workers': [], 'error': detail or f'deskops fallo (exit {proc.returncode}).'})
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:
            return self.json_response({'workers': [], 'error': f'deskops devolvio JSON invalido: {exc}'})
        # Sin default: un 'workers' AUSENTE es un cambio de contrato de
        # deskops, no una flota vacia. Degradar en silencio dejaria la GUI
        # mostrando cero workers como si todo estuviera bien.
        workers = payload.get('workers') if isinstance(payload, dict) else None
        if not isinstance(workers, list):
            return self.json_response({'workers': [], 'error': 'deskops devolvio una estructura inesperada.'})
        # Se reenvia el payload completo, no solo 'workers': deskops tambien
        # emite 'spaces' (agrupado por space, con label y orden de Herdr) y
        # reconstruir el dict aqui lo descartaba, dejando al panel en su
        # fallback de agrupar por id crudo. Validamos 'workers' y dejamos
        # pasar el resto para no tener que editar este handler cada vez que
        # deskops agrega una clave.
        self.json_response(payload)

    def _remote_graph(self):
        """GET /api/graph en modo remote: documentos de sldb + vista local.

        La vista (positions/collapsed/viewRevision) es estado de presentación
        del editor: vive en runtime/mindmap-view.json del lado local (§3 del
        doc de migración), nunca en el store. La revision real del archivo se
        sirve para que el guard guard-guard de viewRevision funcione igual que
        en modo local.
        """
        payload, status = self._remote_get('/graph')
        if status != 200 or not isinstance(payload, dict):
            return self.json_response(payload, status)
        try:
            payload = {'documents': payload.get('documents', []), **local_view()}
        except (ValueError, OSError) as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, 500)
        self.json_response(payload, 200)

    def _remote_graph_payload(self):
        """Grafo remoto + vista local, para el contrato {documents, view, revision}.

        Se mezcla en las respuestas de /api/save (éxito y error): el frontend
        usa documents/revision para refrescar la baseline tras guardar o
        tras un 409, igual que en modo local. None si sldb no responde.
        """
        documents, status = self._remote_get('/graph')
        if status != 200 or not isinstance(documents, dict):
            return None
        try:
            return {'documents': documents.get('documents', []), **local_view()}
        except (ValueError, OSError):
            return None

    def _remote_read(self, route):
        """GET /api/* en modo remote: traduce la ruta a la lectura homóloga de
        sldb serve y reenvía el JSON tal cual, incluido el status 404 cuando
        sldb no implementa la ruta.

        Mapeo 1:1: /api/schema -> /schema, /api/edges/node -> /edges/node,
        /api/graph/neighborhood -> /graph/neighborhood, /api/lint -> /lint, ...
        La query string se preserva. Cubre automáticamente cualquier lectura
        futura (/document, /document/ir) sin cambios aquí.
        """
        upstream = route[len('/api'):]
        if not upstream:
            return self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
        query = urlparse(self.path).query
        payload, status = self._remote_get(upstream + (f'?{query}' if query else ''))
        self.json_response(payload, status)

    def _read_remote_body(self):
        """Body JSON de un POST en modo remote; mismos guards que modo local.

        En error envía la respuesta (413/400) y devuelve None.
        """
        try:
            size = int(self.headers.get('Content-Length', 0))
            if size < 0:
                raise ValueError('Content-Length inválido.')
            if size > 5_000_000:
                self.json_response({'ok': False, 'error': 'Solicitud demasiado grande.'}, 413)
                return None
            request = json.loads(self.rfile.read(size))
            if not isinstance(request, dict):
                raise ValueError('Solicitud inválida.')
            return request
        except (ValueError, json.JSONDecodeError) as exc:
            self.json_response({'ok': False, 'error': str(exc)}, 400)
            return None

    def _remote_save(self, request):
        """POST /api/save en modo remote: changes → sldb /save; vista → local.

        Se parte la transacción como en modo local (EditorStore.save): los
        'changes' (semántica) viajan al store en POST /save batch; la 'view'
        (presentación) se valida contra la revision local y se persiste en
        runtime/mindmap-view.json SOLO si el guardado remoto fue exitoso. Si
        POST /save falla, la vista NO se escribe.

        Los códigos de sldb se reenvían tal cual (409 conflicto por expected
        stale / doc existente, 422 payload inválido, 500 fallo parcial con
        completed) y el body lleva el grafo refrescado, igual que local.
        """
        changes = request.get('changes')
        view = request.get('view', {})
        if not isinstance(changes, list) or len(changes) > 500:
            return self.json_response({'ok': False, 'error': 'Lista de cambios inválida.'}, 400)
        if not isinstance(view, dict):
            return self.json_response({'ok': False, 'error': 'Vista inválida.'}, 400)
        try:
            current = local_view()
        except (ValueError, OSError) as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, 500)
        if request.get('viewRevision') != current['revision']:
            # Conflicto de revisión de la vista (otra sesión la cambió):
            # igual que local, se responde 409 con el grafo refrescado.
            return self.json_response({'ok': False,
                'error': 'El mapa cambió en otra sesión. Recarga antes de guardar.',
                **(self._remote_graph_payload() or {})}, 409)
        payload, status = self._remote_post('/save', {'changes': changes})
        if status != 200:
            # El guardado remoto falló: NO se escribe la vista. Se reenvía el
            # error de sldb (409/422/500+) con grafo refrescado en el body.
            return self.json_response({**payload, **(self._remote_graph_payload() or {})}, status)
        try:
            write_local_view(view)
        except OSError as exc:
            return self.json_response({'ok': False, 'error': f'No se pudo guardar la vista: {exc}'}, 500)
        merged = self._remote_graph_payload()
        if merged:
            payload.update(merged)
        # {ok, saved, documents, view, revision}: contrato idéntico al local.
        self.json_response(payload, 200)

    def do_GET(self):
        route = urlparse(self.path).path
        if route.startswith('/api/desk/'):
            return self.desk_routes.dispatch(self, 'GET')
        if route.startswith('/api/workspace/'):
            if self.backend_mode == 'remote':
                return self.json_response({'ok': False, 'error': 'Workspace multi-proyección no disponible en modo remote.'}, 501)
            return self.workspace_routes.dispatch(self, 'GET')
        if route == '/api/workers':
            # Se resuelve ANTES del proxy remote: el estado de workers no
            # vive en sldb y no debe reenviarse.
            self._api_workers()
            return
        if route == '/api/notation/view':
            self._api_notation_view()
            return
        if route == '/api/views' or route.startswith('/api/views/'):
            self._api_views('GET', None)
            return
        if self.backend_mode == 'remote' and route.startswith('/api/'):
            if route == '/api/graph':
                self._remote_graph()
            else:
                self._remote_read(route)
            return
        if route == '/api/schema':
            try:
                self.json_response(self.editor_store.schema())
            except Exception as exc:  # noqa: BLE001  never drop the connection: say what failed
                self.json_response({'ok': False, 'error': f'No se pudo leer el schema del store: {exc}'}, 500)
        elif route == '/api/graph':
            try:
                self.json_response(self.editor_store.graph())
            except Exception as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
        elif route in ('/api/document', '/api/document/ir'):
            # Lectura con IR: misma forma que GET /document de sldb serve
            # ({id, model_name, path, payload, semantic_tags, ir}). En modo
            # remote lo sirve _remote_read; aquí es el equivalente local.
            name = (parse_qs(urlparse(self.path).query).get('id') or [None])[0]
            if not name:
                return self.json_response({'ok': False, 'error': 'id es obligatorio'}, 400)
            try:
                doc = self.editor_store.document_ir(name)
            except self.save_error as exc:
                return self.json_response({'ok': False, 'error': str(exc)}, exc.status)
            body = doc['ir'] if route == '/api/document/ir' else doc
            self.json_response(body)
        elif route.startswith('/api/'):
            self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
        elif route.startswith('/sldb/'):
            self._proxy_request('GET')
        else:
            # SPA fallback: a client-side route (/documents/map, /draft/tree,
            # /models/diagram, ...) has no file on disk and its last segment
            # has no extension, so serve the app shell and let router.js
            # resolve it from location.pathname.
            static_path = Path(self.translate_path(route))
            if route != '/' and not static_path.exists() and '.' not in static_path.name:
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        route = urlparse(self.path).path
        if route.startswith('/api/desk/'):
            return self.desk_routes.dispatch(self, 'POST')
        if route.startswith('/api/views/'):
            origin = self.headers.get('Origin')
            if origin and urlparse(origin).netloc != self.headers.get('Host'):
                return self.json_response({'ok': False, 'error': 'Origen no permitido.'}, 403)
            request = self._read_remote_body()
            if request is not None:
                self._api_views('POST', request)
            return
        if route in ('/api/save', '/api/validate', '/api/plan', '/api/compile', '/api/export') or route.startswith('/api/models/'):
            if self.backend_mode == 'remote':
                # ── /api/save: changes → POST /save de sldb; vista → local (§3) ──
                if route == '/api/save':
                    request = self._read_remote_body()
                    if request is not None:
                        self._remote_save(request)
                    return
                # ── editor de clases: lecturas traducidas al GET homólogo ──
                if route in ('/api/models/list', '/api/models/detail'):
                    request = self._read_remote_body()
                    if request is None:
                        return
                    if route == '/api/models/list':
                        payload, status = self._remote_get('/models')
                    else:
                        model = request.get('model')
                        if not model:
                            return self.json_response({'ok': False, 'error': 'model es obligatorio'}, 400)
                        payload, status = self._remote_get('/models/detail?model=' + quote(str(model)))
                    self.json_response(payload, status)
                    return
                # ── editor de clases: escrituras → POST homólogo de sldb ──
                if route.startswith('/api/models/'):
                    action = route.rsplit('/', 1)[-1]
                    if action not in ('fields-add', 'fields-remove', 'template-edit', 'validate', 'promote'):
                        return self.json_response({'ok': False, 'error': f'Acción desconocida: {action}'}, 400)
                    request = self._read_remote_body()
                    if request is not None:
                        # El class-dialog.js manda las mismas claves que sldb
                        # (model, field_name, field_type, description, default,
                        # content): reenvío 1:1, respuesta tal cual.
                        payload, status = self._remote_post('/models/' + action, request)
                        self.json_response(payload, status)
                    return
                # ── compilación: sin equivalente en sldb, sigue local-only ──
                # (compilation.py + compiler.py + contract.py; §2.3 del doc.)
                if route in ('/api/validate', '/api/plan', '/api/compile', '/api/export'):
                    return self.json_response({'ok': False,
                        'error': f'Modo remote: {route} no tiene equivalente en sldb serve y sigue en el proceso local (no migrado). Arranca en modo local para usarlo.'}, 501)
                return self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
            # A local write endpoint must not accept cross-origin browser writes.
            origin = self.headers.get('Origin')
            if origin and urlparse(origin).netloc != self.headers.get('Host'):
                return self.json_response({'ok': False, 'error': 'Origen no permitido.'}, 403)
            try:
                size = int(self.headers.get('Content-Length', 0))
                if size < 0:
                    raise ValueError('Content-Length inválido.')
                if size > 5_000_000:
                    return self.json_response({'ok': False, 'error': 'Solicitud demasiado grande.'}, 413)
                request = json.loads(self.rfile.read(size))
                if not isinstance(request, dict):
                    raise ValueError('Solicitud inválida.')
                if route == '/api/save':
                    self.json_response(self.editor_store.save(request))
                    return
                if route.startswith('/api/models/'):
                    from mindmap.models_service import (detail as _detail, list_models as _list_models,
                        template_edit as _template_edit, fields_add as _fields_add,
                        fields_remove as _fields_remove, validate as _validate, promote as _promote)
                    action = route.rsplit('/', 1)[-1]
                    store = self.editor_store.pron_store
                    if action == 'detail':
                        self.json_response(_detail(store, request['model']))
                    elif action == 'list':
                        self.json_response({'models': _list_models(store)})
                    elif action == 'template-edit':
                        self.json_response(_template_edit(store, request['model'], request['content']))
                    elif action in ('fields-add', 'fields-remove') and not str(request.get('field_name') or '').strip():
                        self.json_response({'ok': False, 'error': 'field_name es obligatorio'}, 400)
                    elif action == 'fields-add':
                        self.json_response(_fields_add(store, request['model'], request['field_name'],
                            request.get('field_type', 'str'), request.get('description', ''), request.get('default', '')))
                    elif action == 'fields-remove':
                        self.json_response(_fields_remove(store, request['model'], request['field_name']))
                    elif action == 'validate':
                        self.json_response(_validate(store, request['model']))
                    elif action == 'promote':
                        self.json_response(_promote(store, request['model']))
                    else:
                        self.json_response({'ok': False, 'error': f'Acción desconocida: {action}'}, 400)
                    return
                else:
                    report, status = self.compilation.run(route.rsplit('/', 1)[1], request)
                    self.json_response(report, status)
            except self.save_error as exc:
                self.json_response({'ok': False, 'error': str(exc), 'completed': exc.completed,
                    **self.editor_store.graph()}, exc.status)
            except (ValueError, KeyError, TypeError) as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 400)
            except (Exception, SystemExit) as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
        elif route.startswith('/sldb/'):
            self._proxy_request('POST')
        else:
            self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)


def _build_local_handler(store):
    """Arranque de siempre: EditorStore en proceso + compilador.

    Imports diferidos a propósito: dependen de pron (AVISO-imports-rotos.md) y
    solo deben cargarse en modo local; en modo remote el servidor arranca sin
    pron. Si la dependencia falta, falla con el mismo ModuleNotFoundError de
    siempre.
    """
    from mindmap.persistence import EditorStore, SaveError
    from mindmap.compilation import CompilationService
    backend = EditorStore(store)
    return type('EditorHandler', (ProxyHandler,), {
        'editor_store': backend, 'compilation': CompilationService(backend.adapter),
        'backend_mode': 'local', 'save_error': SaveError})


def make_server(port=8088, store=None):
    from mindmap.deskops_routes import configured_routes
    selected_store = store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb'))
    if BACKEND_MODE == 'remote':
        handler = type('EditorHandler', (ProxyHandler,), {'backend_mode': 'remote'})
    else:
        handler = _build_local_handler(
            store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    handler.desk_routes = configured_routes(selected_store, BACKEND_MODE, os.environ.get('DESKOPS_ROOT'))
    from mindmap.workspace_routes import configured_workspace_routes
    handler.workspace_routes = configured_workspace_routes(selected_store, getattr(handler, 'editor_store', None))
    return ThreadingHTTPServer(('127.0.0.1', port), handler)


def import_roots(argv, environ=os.environ):
    """(--pythonpath dirs + SLDB_PYTHONPATH entries, rest of argv): where the store's model
    modules import from when they do not live in an installed package (G1)."""
    roots, rest, args = [], [], list(argv)
    while args:
        arg = args.pop(0)
        if arg == '--pythonpath' and args:
            roots.append(args.pop(0))
        elif arg.startswith('--pythonpath='):
            roots.append(arg.split('=', 1)[1])
        else:
            rest.append(arg)
    roots += [p for p in environ.get('SLDB_PYTHONPATH', '').split(os.pathsep) if p]
    return [str(Path(r).expanduser().resolve()) for r in roots], rest


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    roots, argv = import_roots(argv)
    for root in reversed(roots):
        if root not in sys.path:
            sys.path.insert(0, root)
    port = int(argv[0]) if argv else 8088
    try:
        server = make_server(port)
    except OSError as exc:
        if exc.errno != errno.EADDRINUSE:
            raise
        print(f'El puerto {port} ya está en uso (¿otro serve.py corriendo?). '
              f'Elige otro: python3 frontends/mindmap/serve.py {port + 1}', file=sys.stderr)
        raise SystemExit(2)
    if BACKEND_MODE == 'remote':
        print(f'KB Mindmap (remote): http://127.0.0.1:{port}/ · sldb: {SLDB_UPSTREAM}', flush=True)
    else:
        print(f'KB Mindmap: http://127.0.0.1:{port}/ · store: {server.RequestHandlerClass.editor_store.store}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()

FILE:docs/workspace-ui.md
---
title: Workspace Multi-proyección y Servidor Paralelo (Knowledge Workspace)
source_atoms:
  - atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
---

# Workspace Multi-proyección y Servidor Paralelo (Knowledge Workspace)

`graph_ui` ofrece dos puntos de entrada complementarios y **paralelos** sobre el mismo store `.sldb`, `deskops` y repositorio Git:

1. **Servidor paralelo standalone — Knowledge Workspace IDE (`frontends/workspace/serve.py`, puerto por defecto `8090`)**:
   Interfaz dedicada de 3 columnas (`◈ KIMUN · Knowledge Workspace`) alineada con `softfactory_spec/mockup.html`.
2. **Pestaña integrada en Mindmap (`frontends/mindmap/serve.py`, puerto por defecto `8088`, ruta `/workspace/node`)**:
   Vista multiproyección integrada como 7ª pestaña dentro del shell clásico de Mindmap.

Ambos servidores pueden ejecutarse simultáneamente sin colisión de estado (lectura estricta sobre `.sldb`):

```sh
# 1. UI clásica de Mindmap (puerto 8088)
PYTHONPATH=$PWD/frontends python frontends/mindmap/serve.py 8088

# 2. Visor paralelo Knowledge Workspace IDE (puerto 8090)
PYTHONPATH=$PWD/frontends python frontends/workspace/serve.py 8090
```

- **Knowledge Workspace IDE:** `http://127.0.0.1:8090/` (o `http://127.0.0.1:8090/?id=TaskDoc:mi-tarea`)
- **Mindmap `/workspace/node`:** `http://127.0.0.1:8088/workspace/node?id=TaskDoc:mi-tarea&depth=1&tab=document`

---

## 1. Arquitectura del Servidor Paralelo (`frontends/workspace/`)

El servidor paralelo vive en `frontends/workspace/` y reutiliza los adaptadores reales de `frontends/mindmap/` (`EditorStore`, `WorkspaceRoutes` y `DeskRoutes`) a través de `WorkspaceService`:

- [`frontends/workspace/serve.py`](../frontends/workspace/serve.py):
  - `WorkspaceService`: Enriquecimiento sin mocks sobre `WorkspaceRoutes` y `DeskRoutes`:
    - Extrae la prosa real por sección (`sections_prose`) desde el archivo Markdown en disco usando los rangos `span.line_start`–`span.line_end` del IR de SLDB, o desde los campos semánticos del payload (`why`, `goal`, `scope`, `implementation_path`, `validation`, `done_when`, `answer`, `what`, `how`, etc.).
    - Inspecciona referencias implícitas adicionales de código (`spec_path`, `target_identity`, `source_path` con `:line` desde `source_span`, y el propio archivo fuente del nodo).
    - Construye la proyección `changes` cruzando `content_hash` (`doc_version`), `file_revision` (SHA-256 en disco), `git status --porcelain` y la vecindad a 1–2 saltos.
    - Expone `/api/workspace/overview` con métricas reales del store (`total_nodes`, `total_edges`, `problems` de `load_edge_index`), tareas activas del `Board.md`, agentes vivos (`deskops runtime workers`), historial de ejecuciones (`runs/subagents/index.jsonl`) e historial Git (`git log`).
- [`frontends/workspace/index.html`](../frontends/workspace/index.html), [`frontends/workspace/app.js`](../frontends/workspace/app.js), [`frontends/workspace/styles.css`](../frontends/workspace/styles.css):
  - **Columna Izquierda (`aside.sidebar-left`)**:
    - *Workspace*: `⌂ Overview`, `✓ Tasks`, `▤ Documents`, `◇ Atoms / Contracts`, `⌘ Code / Symbols`, `⌬ Graph / Schema` con contadores reales y lista filtrable en vivo.
    - *Runtime*: `◎ Agents` (workers de `deskops`/`herdr`), `▶ Runs` (`runs/subagents/index.jsonl`).
    - *Knowledge*: `⇄ Changes` (archivos modificados en Git + problemas del store), `◷ History` (commits recientes).
  - **Columna Central (`section.workspace`) — 4 Proyecciones del Nodo**:
    1. **Document**: Prosa real por sección con chips interactivos `@mention` (que navegan a otros nodos del store) y chips `<code>` (que abren el archivo referido en la pestaña Code), además del árbol formal SLDB IR plegable.
    2. **Graph**: Subgrafo visual 2D en canvas/SVG (`.graph-box`) con el nodo seleccionado al centro y anillos concéntricos a `1 hop` y `2 hops`, chips de filtro por modelo y por tipo de relación, y navegación directa al hacer clic en cualquier nodo vecino.
    3. **Code**: Visor de código con selector de archivos referenciados, numeración de líneas y resaltado automático de fragmentos `:line`.
    4. **Changes (Merkle)**: Comparación de hashes (`doc_version` vs `file_sha256` vs `git status`), análisis de impacto en nodos conectados a 1–2 saltos y estado del working tree.
  - **Columna Derecha (`section.context`)**:
    - Identidad canónica (`Model:name`), tabla de metadatos y hashes, aristas entrantes (`←`) y salientes (`→`) clicables, referencias semánticas (`atoms`, `depends_on`, `pills`) y estado de integridad (`problems_report`).

---

## 2. Seguridad y Confinamiento

Tanto `frontends/mindmap/workspace_routes.py` como `frontends/workspace/serve.py` aplican confinamiento estricto:

- **Confinamiento en Repositorio**: Solo se leen archivos dentro de `repo_root`. Cualquier intento de *path traversal* (`..`, rutas absolutas externas) devuelve HTTP 400 o estado `fuera_del_repo`.
- **Protección ante Symlinks**: Enlaces simbólicos que resuelvan fuera de `repo_root` se bloquean como `fuera_del_repo`.
- **Archivos Ignorados por Git**: Cualquier ruta en `.git` o ignorada por `.gitignore` (`git check-ignore`) se clasifica como `protegido` (política *fail-closed*) y nunca expone su contenido.
- **Resiliencia ante Documentos Degradados**: Si un documento en disco falla validación de modelo, el nodo se resuelve de forma segura mediante el índice público de aristas (`load_edge_index`), marcando `is_degraded: true` y manteniendo operativas las proyecciones de Grafo y Contexto.

---

## 3. Contrato de API

- `GET /api/workspace/overview` *(servidor paralelo `8090`)*: Resumen global del store, board, workers, runs, git changes e historial.
- `GET /api/workspace/nodes`: Catálogo de nodos del store (`{ ok: true, nodes: [...] }`, más `category_counts` y `model_counts` en `8090`).
- `GET /api/workspace/node?id=<Model:name>&depth=1|2`: Proyecciones `document`, `graph`, `code` (y `changes` + `sections_prose` en `8090`) junto con `context`.

---

## 4. Pruebas

```sh
pytest -q tests/test_mindmap_workspace.py tests/test_parallel_workspace_serve.py
node --test tests/mindmap-workspace.test.mjs
pytest -q tests/e2e_mindmap_workspace.py
```

Esta implementación materializa el átomo:
[`atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node`](../desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md).

FILE:instruccion
Cold-bundle de la tarea task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- pytest -q tests/test_mindmap_workspace_edit.py

