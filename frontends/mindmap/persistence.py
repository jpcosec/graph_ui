"""SLDB-backed editor writes. Uses SLDB validation, document operations and indexes."""
from __future__ import annotations
import hashlib
import json
import re
import threading
from pathlib import Path
from types import SimpleNamespace

from sldb.cli.commands.doc import DocCLI
from sldb.cli.commands.fields_save import save_payload
from sldb.cli.model_utils import registered_model, resolve_model_ref
from sldb.cli.serve.routes import serialize_document
from sldb.cli.store_context import get_store_context
from sldb.runtime.validation import render_model_markdown, validate_model_input_roundtrip
from sldb.store.query import load_runtime_documents


class SaveError(Exception):
    def __init__(self, message, status=400, completed=None):
        super().__init__(message)
        self.status = status
        self.completed = completed or []


class EditorStore:
    def __init__(self, store):
        self.store, self.root = get_store_context(str(store))
        self.pythonpath = str(self.root)
        self.view_path = self.store / 'runtime' / 'mindmap-view.json'
        self.lock = threading.RLock()

    def documents(self):
        return load_runtime_documents(self.store, resolve_model_ref, self.pythonpath)

    def view(self):
        raw = self.view_path.read_bytes() if self.view_path.exists() else b'{}'
        return {'view': json.loads(raw), 'revision': hashlib.sha256(raw).hexdigest()}

    def graph(self):
        with self.lock:
            return {'documents': [serialize_document(d) for d in self.documents()], **self.view()}

    def save(self, request):
        """Prevalidate the entire batch; never acknowledge partial writes as success.

        A mid-write failure returns the refreshed graph so clients can retry only
        the outstanding changes. Optimistic comparisons reject stale documents.
        Deletions untrack documents, preserving their Markdown on disk.
        """
        with self.lock:
            changes = request.get('changes', [])
            if not isinstance(changes, list) or len(changes) > 500:
                raise SaveError('Lista de cambios inválida.')
            view = request.get('view', {})
            if not isinstance(view, dict):
                raise SaveError('Vista inválida.')
            if request.get('viewRevision') != self.view()['revision']:
                raise SaveError('El mapa cambió en otra sesión. Recarga antes de guardar.', 409)
            existing = {d.name: d for d in self.documents()}
            seen, prepared = set(), []
            for change in changes:
                name, action = change.get('id'), change.get('action')
                if not isinstance(name, str) or name in seen:
                    raise SaveError('Identificador duplicado o inválido.')
                seen.add(name)
                current = existing.get(name)
                if action not in ('create', 'update', 'delete'):
                    raise SaveError('Operación inválida.')
                if action == 'create':
                    if current:
                        raise SaveError(f'Ya existe el documento {name}.', 409)
                    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}', name):
                        raise SaveError('El ID nuevo solo admite letras, números, guiones y guiones bajos.')
                elif not current or current.payload != change.get('expected'):
                    raise SaveError(f'{name} cambió en SLDB. Recarga para evitar sobrescribirlo.', 409)
                if action != 'delete':
                    model_name = change.get('model')
                    if current and model_name != current.model_name:
                        raise SaveError('No se puede cambiar la clase de un documento existente.')
                    payload = change.get('payload')
                    if not isinstance(payload, dict):
                        raise SaveError(f'Contenido inválido: {name}.')
                    try:
                        model, _, _ = registered_model(self.store, model_name, self.pythonpath)
                        rendered = render_model_markdown(model, payload)
                        valid, details = validate_model_input_roundtrip(model, rendered)
                        if not valid:
                            raise ValueError(str(details))
                    except (Exception, SystemExit) as exc:
                        raise SaveError(f'{name}: {exc}', 422) from exc
                    path = self.root / 'desk' / 'mindmap' / model_name / f'{name}.md'
                    if action == 'create' and path.exists():
                        raise SaveError(f'El archivo de {name} ya existe; elige otro ID.', 409)
                else:
                    path = None
                prepared.append((change, current, path))
            completed = []
            try:
                # Create endpoints before writing references to them. Untrack last.
                order = {'create': 0, 'update': 1, 'delete': 2}
                for change, current, path in sorted(prepared, key=lambda item: order[item[0]['action']]):
                    name, action = change['id'], change['action']
                    if action == 'create':
                        DocCLI().add(SimpleNamespace(store=str(self.store), pythonpath=self.pythonpath,
                            model=change['model'], payload=json.dumps(change['payload']),
                            output=str(path), name=name))
                    elif action == 'update':
                        save_payload(current, change['payload'], str(self.store), self.pythonpath)
                    else:
                        DocCLI().untrack(SimpleNamespace(store=str(self.store), pythonpath=self.pythonpath, doc=name))
                    completed.append(name)
                self.view_path.parent.mkdir(parents=True, exist_ok=True)
                temporary = self.view_path.with_suffix('.tmp')
                temporary.write_text(json.dumps(view, ensure_ascii=False, indent=2), encoding='utf-8')
                temporary.replace(self.view_path)
            except (Exception, SystemExit) as exc:
                raise SaveError(f'No se completó el guardado: {exc}', 500, completed) from exc
            return {'ok': True, 'saved': completed, **self.graph()}
