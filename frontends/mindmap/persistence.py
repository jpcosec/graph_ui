"""SLDB-backed editor writes. Thin batch logic over the shared SldbAdapter.

All store operations, validation and index updates live in ``sldb_adapter``;
this module only orchestrates a batch: prevalidates everything, rejects stale
concurrent edits and writes in create→update→delete order.
"""
from __future__ import annotations

import re

from sldb_adapter import AdapterError, SldbAdapter

SaveError = AdapterError


class EditorStore:
    def __init__(self, store):
        self.adapter = SldbAdapter(store)
        self.view_path = self.adapter.view_path
        self.store = self.adapter.store
        self.root = self.adapter.root
        self.pythonpath = self.adapter.pythonpath

    def schema(self):
        return {'models': self.adapter.schema()}

    def documents(self):
        return self.adapter.documents()

    def view(self):
        return self.adapter.view()

    def graph(self):
        return self.adapter.graph()

    def save(self, request):
        """Prevalidate the entire batch; never acknowledge partial writes as success.

        A mid-write failure returns the refreshed graph so clients can retry only
        the outstanding changes. Optimistic comparisons reject stale documents.
        Deletions untrack documents, preserving their Markdown on disk.
        """
        adapter = self.adapter
        with adapter.lock:
            changes = request.get('changes', [])
            if not isinstance(changes, list) or len(changes) > 500:
                raise SaveError('Lista de cambios inválida.')
            view = request.get('view', {})
            if not isinstance(view, dict):
                raise SaveError('Vista inválida.')
            if request.get('viewRevision') != adapter.view()['revision']:
                raise SaveError('El mapa cambió en otra sesión. Recarga antes de guardar.', 409)
            existing = {d.name: d for d in adapter.documents()}
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
                        valid, details = adapter.validate_payload(model_name, payload)
                        if not valid:
                            raise ValueError(str(details))
                    except (Exception, SystemExit) as exc:
                        raise SaveError(f'{name}: {exc}', 422) from exc
                    path = adapter.root / 'desk' / 'mindmap' / model_name / f'{name}.md'
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
                        adapter.create_document(name, change['model'], change['payload'], path)
                    elif action == 'update':
                        adapter.update_document(current, change['payload'])
                    else:
                        adapter.delete_document(name)
                    completed.append(name)
                adapter.write_view(view)
            except (Exception, SystemExit) as exc:
                raise SaveError(f'No se completó el guardado: {exc}', 500, completed) from exc
            return {'ok': True, 'saved': completed, **adapter.graph()}