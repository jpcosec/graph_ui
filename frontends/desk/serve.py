#!/usr/bin/env python3
"""deskops UI server: the work surface of the factory, on 127.0.0.1 only.

Serves the shell (index.html, app.js, styles.css) and the read-only views that
deskops itself composes (``deskops.services.desk_view.DeskView``, the same data as
``deskops view ... --format json``). The only write is ``POST /api/desk/advance``,
delegated to graph_ui's ``DeskRoutes`` with its revision guard.

Usage:
  python frontends/desk/serve.py [port] --root <repo with desk/> [--registry <repo>] [--pythonpath <dir>]

``--root`` is the default desk. ``--registry`` is the repo whose
``desk/registry/repo-*.md`` lists the desks the selector offers (default: ``--root``);
only entries whose path has a ``desk/tasks/Board.md`` are offered. ``--pythonpath``
puts a directory first on ``sys.path`` (e.g. a deskops checkout that carries
``deskops view``).
"""
from __future__ import annotations

import contextlib
import errno
import hashlib
import io
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import sys
from threading import RLock
from typing import Any
from urllib.parse import parse_qs, urlparse

DESK_DIR = Path(__file__).resolve().parent
FRONTENDS_DIR = DESK_DIR.parent
DEFAULT_PORT = 8091
HOST = '127.0.0.1'
VIEWS = ('board', 'task', 'drawer', 'inbox', 'agents')
STATIC_SUFFIXES = {'.html', '.js', '.css'}
INBOX_ACTIONS = {'/api/inbox/ack': 'ack', '/api/inbox/promote': 'promote'}
MAX_BODY = 8192


class DeskUIError(Exception):
    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def _ensure_frontends_on_path() -> None:
    if str(FRONTENDS_DIR) not in sys.path:
        sys.path.insert(0, str(FRONTENDS_DIR))


class DeskCatalog:
    """The desks this server may show: the default root plus registered repos with a desk."""

    def __init__(self, root: Path, registry: Path | None = None):
        self.root = Path(root).expanduser().resolve()
        self.registry = Path(registry).expanduser().resolve() if registry else self.root

    def desks(self) -> dict[str, Any]:
        errors: list[dict[str, str]] = []
        desks: list[dict[str, Any]] = []
        default_id = None
        try:
            from deskops import doc_access
            from deskops.operations import DeskopsOperations

            ops = DeskopsOperations(self.registry)
            repositories = doc_access.registered_repositories(ops.root)
        except Exception as exc:
            repositories = []
            errors.append({'reference': str(self.registry / 'desk/registry'), 'cause': f'Registry unreadable: {exc}'})
        for repository in repositories:
            try:
                path = doc_access.repository_root(ops.root, repository)
            except Exception as exc:
                errors.append({'reference': str(repository.get('id')), 'cause': f'Repository path does not resolve: {exc}'})
                continue
            if not (path / 'desk/tasks/Board.md').is_file():
                continue
            ident = str(repository.get('id') or path.name)
            desks.append({'id': ident, 'path': str(path)})
            if path == self.root:
                default_id = ident
        if default_id is None:
            default_id = self.root.name
            desks.insert(0, {'id': default_id, 'path': str(self.root)})
        for desk in desks:
            desk['default'] = desk['id'] == default_id
        return {'desks': desks, 'default': default_id, 'registry': str(self.registry), 'errors': errors}

    def resolve(self, desk_id: str | None) -> Path:
        if not desk_id:
            return self.root
        for desk in self.desks()['desks']:
            if desk['id'] == desk_id:
                return Path(desk['path'])
        raise DeskUIError(f"Desk '{desk_id}' is not in the registry of {self.registry} (or has no desk/).", 404)


class DeskUIHandler(SimpleHTTPRequestHandler):
    catalog: DeskCatalog
    herdr = 'herdr'
    advance_lock = RLock()
    server_version = 'deskops-ui'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DESK_DIR), **kwargs)

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        if os.environ.get('DESK_UI_LOG'):
            super().log_message(format, *args)

    def end_headers(self) -> None:
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def json_response(self, data: Any, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _reject(self) -> None:
        self.json_response({'ok': False, 'error': f'Método {self.command} no permitido en {urlparse(self.path).path}.'}, 405)

    do_PUT = do_PATCH = do_DELETE = _reject

    def do_HEAD(self) -> None:
        self._reject()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        query = parse_qs(parsed.query)
        if not route.startswith('/api/'):
            name = 'index.html' if route == '/' else route.lstrip('/')
            if '/' in name or Path(name).suffix not in STATIC_SUFFIXES or not (DESK_DIR / name).is_file():
                return self.json_response({'ok': False, 'error': f'No existe {route}.'}, 404)
            self.path = '/' + name
            return super().do_GET()
        try:
            if route == '/api/desks':
                return self.json_response(self.catalog.desks())
            if route.startswith('/api/view/'):
                view = route.removeprefix('/api/view/')
                if view not in VIEWS:
                    raise DeskUIError(f'Vista desconocida: {view}.', 404)
                root = self.catalog.resolve((query.get('desk') or [None])[0])
                return self.json_response(self.view(root, view, query))
            raise DeskUIError(f'Ruta desconocida: {route}.', 404)
        except Exception as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, getattr(exc, 'status', 503))

    def view(self, root: Path, view: str, query: dict[str, list[str]]) -> dict[str, Any]:
        try:
            from deskops.services.desk_view import DeskView, DeskViewError
        except ImportError as exc:
            raise DeskUIError(f'Esta instalación de deskops no trae deskops view ({exc}). Use --pythonpath con un deskops que lo tenga.', 503)
        try:
            desk = DeskView(root, herdr=self.herdr)
            if view == 'task':
                ids = query.get('id') or []
                if len(ids) != 1 or not ids[0]:
                    raise DeskUIError('Se requiere un id de tarea.', 400)
                return desk.task(ids[0])
            return getattr(desk, view)()
        except DeskViewError as exc:
            raise DeskUIError(str(exc), 404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path in INBOX_ACTIONS:
            try:
                root = self.catalog.resolve((parse_qs(parsed.query).get('desk') or [None])[0])
                with self.advance_lock:
                    return self.json_response(self.inbox_action(root, INBOX_ACTIONS[parsed.path]))
            except Exception as exc:
                return self.json_response({'ok': False, 'error': str(exc)}, getattr(exc, 'status', 503))
        if parsed.path != '/api/desk/advance':
            return self._reject()
        try:
            root = self.catalog.resolve((parse_qs(parsed.query).get('desk') or [None])[0])
        except DeskUIError as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, exc.status)
        from mindmap.deskops_routes import DeskRoutes

        with self.advance_lock:
            return DeskRoutes(root).dispatch(self, 'POST')


    # ------------------------------------------------------------ inbox actions (UI05)
    def _json_body(self, keys: set[str]) -> dict[str, str]:
        """Same request checks as DeskRoutes' advance: same origin, bounded JSON, exact keys."""
        origin = self.headers.get('Origin')
        if origin is not None and origin != 'http://' + self.headers.get('Host', ''):
            raise DeskUIError('Origen no permitido.', 403)
        try:
            length = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            raise DeskUIError('Content-Length inválido.', 400)
        if length <= 0 or length > MAX_BODY:
            raise DeskUIError(f'El cuerpo debe contener entre 1 y {MAX_BODY} bytes.', 413)
        if self.headers.get_content_type() != 'application/json':
            raise DeskUIError('Se requiere application/json.', 415)
        try:
            body = json.loads(self.rfile.read(length))
        except (ValueError, UnicodeDecodeError):
            raise DeskUIError('JSON inválido.', 400)
        if not isinstance(body, dict) or set(body) != keys or not all(isinstance(body[k], str) and body[k] for k in keys):
            raise DeskUIError('Se requieren únicamente ' + ' y '.join(sorted(keys)) + ' de tipo texto.', 400)
        return body

    def inbox_action(self, root: Path, action: str) -> dict[str, Any]:
        """Reconocer (``deskops message ack``) or Pasar al drawer (``deskops promote
        inbox-to-drawer-task``), run in process through the deskops CLI entry point after
        checking the note's revision (sha256 of its bytes). Nothing here writes a file."""
        body = self._json_body({'note', 'revision'})
        inbox = (root / 'desk' / 'inbox').resolve()
        path = (inbox / f"{body['note']}.md").resolve()
        if path.parent != inbox or not path.is_file():
            raise DeskUIError(f"La nota {body['note']} no está en desk/inbox.", 404)
        if hashlib.sha256(path.read_bytes()).hexdigest() != body['revision']:
            raise DeskUIError('La nota cambió desde que se leyó. Actualiza antes de actuar.', 409)
        argv = (['message', 'ack', path.stem, '--root', str(root), '--format', 'json'] if action == 'ack'
                else ['promote', 'inbox-to-drawer-task', path.name, '--root', str(root)])
        from deskops.cli.main import main as deskops_main

        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = deskops_main(argv)
        output = out.getvalue().strip()
        if code != 0:
            raise DeskUIError(f"deskops {' '.join(argv[:2])} falló: {output or err.getvalue().strip()}", 409)
        return {'ok': True, 'action': action, 'note': path.stem, 'command': 'deskops ' + ' '.join(argv), 'output': output}


def make_server(
    port: int = DEFAULT_PORT,
    root: Path | str | None = None,
    registry: Path | str | None = None,
    herdr: str | None = None,
) -> ThreadingHTTPServer:
    _ensure_frontends_on_path()
    if root is None:
        root = os.environ.get('DESKOPS_ROOT') or Path.cwd()
    catalog = DeskCatalog(Path(root), Path(registry) if registry else None)
    handler = type('BoundDeskUIHandler', (DeskUIHandler,), {'catalog': catalog, 'herdr': herdr or os.environ.get('DESK_UI_HERDR', 'herdr')})
    return ThreadingHTTPServer((HOST, port), handler)


def _parse(argv: list[str]) -> tuple[int, str | None, str | None, list[str]]:
    port, root, registry, paths = DEFAULT_PORT, None, None, []
    args = list(argv)
    while args:
        arg = args.pop(0)
        if arg in ('--root', '--registry', '--pythonpath') and args:
            value = args.pop(0)
        elif arg.startswith(('--root=', '--registry=', '--pythonpath=')):
            arg, value = arg.split('=', 1)
        elif arg.isdigit():
            port = int(arg)
            continue
        else:
            raise SystemExit(f'Argumento desconocido: {arg}\n{__doc__}')
        if arg == '--root':
            root = value
        elif arg == '--registry':
            registry = value
        else:
            paths.append(str(Path(value).expanduser().resolve()))
    return port, root, registry, paths


def main(argv: list[str] | None = None) -> None:
    port, root, registry, paths = _parse(sys.argv[1:] if argv is None else argv)
    for path in reversed(paths):
        if path not in sys.path:
            sys.path.insert(0, path)
    try:
        server = make_server(port, root, registry)
    except OSError as exc:
        if exc.errno != errno.EADDRINUSE:
            raise
        print(f'El puerto {port} ya está en uso. Elige otro: python3 frontends/desk/serve.py {port + 1}', file=sys.stderr)
        raise SystemExit(2)
    catalog = server.RequestHandlerClass.catalog
    print(f'deskops UI: http://{HOST}:{server.server_port}/ · desk: {catalog.root} · registro: {catalog.registry}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
