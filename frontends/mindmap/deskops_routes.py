"""Board-scoped workflow projection; persistence and gates belong to Deskops/SLDB.

The task view (gates and its revision, the advance guard) is the deskops `task` ViewDoc
read from `sldb serve` (`GET /views/task?id=...`, with ETag) and projected to the
deskops contract by `deskops.cli.commands.view.project` in process (deskops CC34);
the actions still go through deskops in process.
"""
import atexit
from dataclasses import asdict
import json
from pathlib import Path
import re
import socket
import subprocess
import sys
import time
from threading import RLock
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


class DeskError(Exception):
    def __init__(self, message, status=503):
        super().__init__(message)
        self.status = status


class SldbServes:
    """One `sldb serve` per desk store, bound to 127.0.0.1 and started on first use.

    `urls` maps a desk root to an already running `sldb serve` for its store; any other desk
    gets its own process (`python -m sldb serve --store <root>/.sldb`), stopped by `close`.
    Each GET carries the last ETag of the same request; a 304 answers with the kept body."""

    def __init__(self, urls=None, startup_timeout=60.0):
        self.urls = {Path(root).resolve(): url.rstrip('/') for root, url in (urls or {}).items()}
        self.startup_timeout = startup_timeout
        self.processes = {}
        self.cache = {}
        self.lock = RLock()

    def url(self, root):
        root = Path(root).resolve()
        with self.lock:
            if root not in self.urls:
                self.urls[root] = self._start(root)
            return self.urls[root]

    def _start(self, root):
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', 0))
            port = probe.getsockname()[1]
        process = subprocess.Popen(
            [sys.executable, '-m', 'sldb', 'serve', '--host', '127.0.0.1', '--port', str(port), '--store', str(root / '.sldb')],
            cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self.processes[root] = process
        url = f'http://127.0.0.1:{port}'
        deadline = time.monotonic() + self.startup_timeout
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise DeskError(f'sldb serve no arrancó para {root}: {process.stderr.read().decode(errors="replace").strip()}', 502)
            try:
                with urlopen(f'{url}/views', timeout=5):
                    return url
            except (URLError, OSError):
                time.sleep(0.2)
        raise DeskError(f'sldb serve no respondió en {url} para {root}.', 502)

    def view(self, root, name, params=None):
        """The `run_view` result `GET /views/<name>` answers for the desk at `root`."""
        query = urlencode(sorted((params or {}).items()))
        target = f'{self.url(root)}/views/{name}' + (f'?{query}' if query else '')
        key = (Path(root).resolve(), target)
        cached = self.cache.get(key)
        headers = {'If-None-Match': cached[0]} if cached else {}
        try:
            with urlopen(Request(target, headers=headers), timeout=120) as resp:
                result = json.loads(resp.read())
                self.cache[key] = (resp.headers.get('ETag'), result)
                return result
        except HTTPError as exc:
            if exc.code == 304 and cached:
                return cached[1]
            try:
                message = json.loads(exc.read()).get('error') or str(exc)
            except ValueError:
                message = str(exc)
            raise DeskError(f'sldb serve /views/{name}: {message}', 502)
        except (URLError, OSError) as exc:
            raise DeskError(f'sldb serve no responde ({target}): {exc}', 502)

    def close(self):
        with self.lock:
            for process in self.processes.values():
                process.terminate()
            for process in self.processes.values():
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
            for root in self.processes:
                self.urls.pop(root, None)
            self.processes.clear()


class DeskopsViews:
    """The deskops views of a desk: `board`/`task` from `sldb serve` projected by deskops."""

    def __init__(self, serves=None):
        self.serves = serves or SldbServes()

    def view(self, root, name, params=None):
        from deskops.cli.commands.view import ViewError, project
        result = self.serves.view(root, name, params)
        try:
            return project(name, result, root)
        except ViewError as exc:
            # The store does not track the Board or the task yet: the desk is not ready.
            raise DeskError(str(exc), 503)

    def task(self, root, selector):
        from deskops.cli.commands.view import ViewError, task_params
        try:
            params = task_params(root, selector)
        except ViewError as exc:
            raise DeskError(str(exc), 404)
        return self.view(root, 'task', params)


DEFAULT_VIEWS = DeskopsViews()
atexit.register(DEFAULT_VIEWS.serves.close)


class DeskRoutes:
    def __init__(self, root=None, error=None, views=None):
        self.root = root
        self.error = error
        self.views = views or DEFAULT_VIEWS
        self.lock = RLock()

    def operations(self):
        if self.error:
            raise DeskError(self.error)
        if not self.root or not (self.root / 'desk/tasks/Board.md').is_file():
            raise DeskError(f'No existe desk/tasks/Board.md en {self.root}. Configure DESKOPS_ROOT con un desk real.')
        from deskops.operations import DeskopsOperations
        return DeskopsOperations(self.root)

    def board(self):
        from deskops import doc_access
        from deskops.models import BoardDoc, TaskDoc
        ops = self.operations()
        board = doc_access.read_doc(self.root / 'desk/tasks/Board.md', BoardDoc)
        entries, errors = [], []
        for ref in board.get('tasks') or []:
            try:
                path = (self.root / ref).resolve()
                if not path.is_relative_to(self.root) or not path.is_relative_to((self.root / 'desk/tasks').resolve()) or path.suffix != '.md' or path.name == 'Board.md':
                    raise ValueError('Referencia fuera del directorio de tareas.')
                payload = doc_access.read_doc(path, TaskDoc)
                ident = payload.get('id')
                if not isinstance(ident, str) or not re.fullmatch(r'[\w-]+', ident):
                    raise ValueError('Identidad de tarea inválida.')
                # Use the same selector as Deskops, and prove it selects this exact route.
                if doc_access.resolve_glob(ops.root, ops.desk_root / 'tasks', ident).resolve() != path:
                    raise ValueError('Identidad ambigua o distinta de la referencia del Board.')
                entries.append({'id': ident, 'path': str(path.relative_to(self.root)),
                                **{key: payload.get(key, '') for key in ('title', 'status', 'current_node', 'goal')}})
            except Exception as exc:
                errors.append({'reference': str(ref), 'error': str(exc)})
        duplicate = {entry['id'] for entry in entries if sum(e['id'] == entry['id'] for e in entries) > 1}
        if duplicate:
            errors.extend({'reference': entry['path'], 'error': 'Identidad repetida en el Board.'} for entry in entries if entry['id'] in duplicate)
            entries = [entry for entry in entries if entry['id'] not in duplicate]
        return {'root': str(self.root), 'board': board, 'tasks': entries, 'errors': errors}

    def detail(self, ident):
        from deskops import doc_access, lifecycle
        from deskops.models import TaskDoc
        board = self.board()
        entry = next((entry for entry in board['tasks'] if entry['id'] == ident), None)
        if entry is None:
            raise DeskError('La tarea no está enrutada de forma válida en este Board.', 404)
        ops = self.operations()
        path = self.root / entry['path']
        payload = doc_access.read_doc(path, TaskDoc)
        view = self.views.task(self.root, ident)
        gates = view['task']['gates']
        # The view lists no gate out of a non-final node when the graph does not cover it;
        # say why instead of offering an advance with no condition.
        node = payload.get('current_node')
        if not gates and node != lifecycle.COMPLETE:
            if not node:
                raise DeskError('La tarea no declara current_node; gates no disponibles.')
            lifecycle.transitions_from(self.root, node)
            raise DeskError(f"Gates no disponibles: el lifecycle no cubre {node}.")
        # The revision is the ETag of the deskops task view (GD25): the advance guard.
        return {'task': entry, 'payload': payload, 'gates': gates,
                'next': ops.next_action_report(ident), 'revision': view['revision']}

    def dispatch(self, handler, method):
        route = urlparse(handler.path).path
        try:
            with self.lock:
                if method == 'GET' and route == '/api/desk/board':
                    return handler.json_response(self.board())
                if method == 'GET' and route == '/api/desk/task':
                    ids = parse_qs(urlparse(handler.path).query).get('id', [])
                    if len(ids) != 1 or not ids[0]:
                        raise DeskError('Se requiere un id de tarea.', 400)
                    return handler.json_response(self.detail(ids[0]))
                if method != 'POST' or route != '/api/desk/advance':
                    raise DeskError('Ruta de Deskops desconocida.', 404)
                origin = handler.headers.get('Origin')
                if origin is not None and origin != 'http://' + handler.headers.get('Host', ''):
                    raise DeskError('Origen no permitido.', 403)
                try:
                    length = int(handler.headers.get('Content-Length', '0'))
                except ValueError:
                    raise DeskError('Content-Length inválido.', 400)
                if length <= 0 or length > 8192:
                    raise DeskError('El cuerpo debe contener entre 1 y 8192 bytes.', 413)
                if handler.headers.get_content_type() != 'application/json':
                    raise DeskError('Se requiere application/json.', 415)
                try:
                    body = json.loads(handler.rfile.read(length))
                except (ValueError, UnicodeDecodeError):
                    raise DeskError('JSON inválido.', 400)
                if not isinstance(body, dict) or set(body) != {'id', 'revision'} or not all(isinstance(body[k], str) and body[k] for k in body):
                    raise DeskError('Se requieren únicamente id y revision de tipo texto.', 400)
                before = self.detail(body['id'])
                if before['revision'] != body['revision']:
                    raise DeskError('La tarea o el Board cambió. Actualiza antes de avanzar.', 409)
                _, result = self.operations().advance_task(body['id'])
                if result is None:
                    raise DeskError('No se pudo avanzar la tarea.', 409)
                after = self.detail(body['id'])
                after['transition'] = asdict(result)
                if not result.progressed:
                    after.update(ok=False, error=result.message)
                    return handler.json_response(after, 409)
                return handler.json_response(after)
        except Exception as exc:
            return handler.json_response({'ok': False, 'error': str(exc)}, getattr(exc, 'status', 503))


def configured_routes(store, backend, configured_root):
    if configured_root:
        root = Path(configured_root).expanduser()
        if not root.is_absolute():
            return DeskRoutes(error='DESKOPS_ROOT debe ser una ruta absoluta.')
        return DeskRoutes(root.resolve())
    if backend == 'remote':
        return DeskRoutes(error='Modo remote: configure DESKOPS_ROOT absoluto para usar Deskops.')
    return DeskRoutes(Path(store).expanduser().resolve().parent)
