"""Board-scoped workflow projection; persistence and gates belong to Deskops/SLDB."""
from dataclasses import asdict
import hashlib
import json
from pathlib import Path
import re
from threading import RLock
from urllib.parse import parse_qs, urlparse


class DeskError(Exception):
    def __init__(self, message, status=503):
        super().__init__(message)
        self.status = status


class DeskRoutes:
    def __init__(self, root=None, error=None):
        self.root = root
        self.error = error
        self.lock = RLock()

    def operations(self):
        if self.error:
            raise DeskError(self.error)
        if not self.root or not (self.root / 'desk/tasks/Board.md').is_file():
            raise DeskError(f'No existe desk/tasks/Board.md en {self.root}. Configure DESKOPS_ROOT con un desk real.')
        from deskops.operations import DeskopsOperations
        return DeskopsOperations(self.root)

    def board(self):
        from deskops.models import BoardDoc, TaskDoc
        ops = self.operations()
        board = ops._read_doc(self.root / 'desk/tasks/Board.md', BoardDoc)
        entries, errors = [], []
        for ref in board.get('tasks') or []:
            try:
                path = (self.root / ref).resolve()
                if not path.is_relative_to(self.root) or not path.is_relative_to((self.root / 'desk/tasks').resolve()) or path.suffix != '.md' or path.name == 'Board.md':
                    raise ValueError('Referencia fuera del directorio de tareas.')
                payload = ops._read_doc(path, TaskDoc)
                ident = payload.get('id')
                if not isinstance(ident, str) or not re.fullmatch(r'[\w-]+', ident):
                    raise ValueError('Identidad de tarea inválida.')
                # Use the same selector as Deskops, and prove it selects this exact route.
                if ops._resolve_glob(ops.desk_root / 'tasks', ident).resolve() != path:
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
        from deskops import lifecycle
        from deskops.models import TaskDoc
        board = self.board()
        entry = next((entry for entry in board['tasks'] if entry['id'] == ident), None)
        if entry is None:
            raise DeskError('La tarea no está enrutada de forma válida en este Board.', 404)
        ops = self.operations()
        path = self.root / entry['path']
        payload = ops._read_doc(path, TaskDoc)
        task, gates = ops.show_task(ident)
        if task is None:
            raise DeskError('No se pudo resolver la tarea.', 404)
        # show_task suppresses graph errors. Check empty nonterminal gates, without
        # rebuilding the graph twice for a successful evaluation.
        node = payload.get('current_node')
        if not gates and node != lifecycle.COMPLETE:
            if not node:
                raise DeskError('La tarea no declara current_node; gates no disponibles.')
            lifecycle.transitions_from(self.root, node)
            raise DeskError(f"Gates no disponibles: el lifecycle no cubre {node}.")
        revision = hashlib.sha256((self.root / 'desk/tasks/Board.md').read_bytes() + b'\0' + path.read_bytes()).hexdigest()
        return {'task': entry, 'payload': payload, 'gates': gates,
                'next': ops.next_action_report(ident), 'revision': revision}

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
