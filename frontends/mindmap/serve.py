#!/usr/bin/env python3
"""Serve the KB editor, SLDB proxy and validated persistence bridge."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import json
import os
import sys
import urllib.error
import urllib.request
from persistence import EditorStore, SaveError
from compilation import CompilationService
from models_service import detail as _detail, list_models as _list_models, template_edit as _template_edit, fields_add as _fields_add, fields_remove as _fields_remove, validate as _validate, promote as _promote

SLDB_UPSTREAM = os.environ.get('SLDB_URL', 'http://127.0.0.1:8787')
MINDMAP_DIR = Path(__file__).resolve().parent


class ProxyHandler(SimpleHTTPRequestHandler):
    editor_store = None

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

    def do_GET(self):
        route = urlparse(self.path).path
        if route == '/api/schema':
            self.json_response(self.editor_store.schema())
        elif route == '/api/graph':
            try:
                self.json_response(self.editor_store.graph())
            except Exception as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
        elif route.startswith('/sldb/'):
            self._proxy_request('GET')
        else:
            if route in ('/flow', '/mindmap'):
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        route = urlparse(self.path).path
        if route in ('/api/save', '/api/validate', '/api/plan', '/api/compile', '/api/export') or route.startswith('/api/models/'):
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
                    action = route.rsplit('/', 1)[-1]
                    store = self.editor_store.store
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
            except SaveError as exc:
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


def make_server(port=8088, store=None):
    backend = EditorStore(store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    handler = type('EditorHandler', (ProxyHandler,), {
        'editor_store': backend, 'compilation': CompilationService(backend.adapter)})
    return ThreadingHTTPServer(('127.0.0.1', port), handler)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    server = make_server(port)
    print(f'KB Mindmap: http://127.0.0.1:{port}/', flush=True)
    server.serve_forever()
