#!/usr/bin/env python3
"""Serve the KB editor, SLDB proxy and validated persistence bridge.

Dos modos, elegidos por GRAPH_UI_BACKEND (default 'local'):

- local (intacto): EditorStore en proceso; depende de pron
  (AVISO-imports-rotos.md) y de los módulos models_service/compilation.
- remote: TODAS las lecturas que sldb serve expone hoy se sirven desde
  ahí (SLDB_URL): /api/schema, /api/graph, /api/edges*, /api/graph/*,
  /api/models, /api/models/detail, /api/lint, /api/health,
  /api/kgdb/snapshot y lecturas futuras (/document, /document/ir) sin
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
from urllib.parse import quote, urlparse
import errno
import hashlib
import json
import os
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
        if self.backend_mode == 'remote' and route.startswith('/api/'):
            if route == '/api/graph':
                self._remote_graph()
            else:
                self._remote_read(route)
            return
        if route == '/api/schema':
            self.json_response(self.editor_store.schema())
        elif route == '/api/graph':
            try:
                self.json_response(self.editor_store.graph())
            except Exception as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
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
                    from models_service import (detail as _detail, list_models as _list_models,
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
    from persistence import EditorStore, SaveError
    from compilation import CompilationService
    backend = EditorStore(store)
    return type('EditorHandler', (ProxyHandler,), {
        'editor_store': backend, 'compilation': CompilationService(backend.adapter),
        'backend_mode': 'local', 'save_error': SaveError})


def make_server(port=8088, store=None):
    if BACKEND_MODE == 'remote':
        handler = type('EditorHandler', (ProxyHandler,), {'backend_mode': 'remote'})
    else:
        handler = _build_local_handler(
            store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    return ThreadingHTTPServer(('127.0.0.1', port), handler)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
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
