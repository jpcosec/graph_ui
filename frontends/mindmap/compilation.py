"""Compiler operations for the local editor, sharing its store and write lock."""
import hashlib
import json
import threading
from pathlib import Path

from compiler import CompileError, compile_json, plan_source, validate_source
from contract import validate

# Model imports used by the compiler have process-global caches.
COMPILER_LOCK = threading.RLock()


class CompilationService:
    def __init__(self, adapter):
        self.adapter = adapter

    def _token(self, source):
        # Un store sin inicializar es un caso válido de planificación: se
        # tokeniza como KB vacía (mismo criterio que plan_source).
        if (Path(self.adapter.store) / 'core' / 'store_index.yaml').exists():
            snapshot = {'source': source, 'graph': self.adapter.graph(),
                        'models': self.adapter.export_models()}
        else:
            snapshot = {'source': source, 'graph': {'documents': [], 'view': {}}, 'models': []}
        return hashlib.sha256(json.dumps(snapshot, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

    def run(self, action, request):
        with COMPILER_LOCK, self.adapter.lock:
            if action == 'export':
                graph = self.adapter.graph()
                documents = request.get('documents', graph['documents'])
                if not isinstance(documents, list):
                    raise ValueError('documents debe ser una lista.')
                source = {'version': 1, 'models': self.adapter.export_models(),
                          'documents': [{'id': d['id'], 'model': d['model_name'], 'payload': d['payload']}
                                        for d in documents],
                          'view': request.get('view', graph['view'])}
                validate(source)
                return source, 200

            source = request.get('source')
            if not isinstance(source, dict):
                raise ValueError('source debe ser un objeto JSON de intercambio.')
            if action == 'validate':
                report = validate_source(source)
                return report, 200 if report['ok'] else 422

            token = self._token(source)
            if action == 'compile' and request.get('planToken') != token:
                return {'ok': False, 'error': 'El JSON o la KB cambiaron. Calcula el plan nuevamente.'}, 409
            plan = plan_source(source, self.adapter.store)
            applicable = not any(plan.get(k) for k in (
                'conflicts', 'invalid_payloads', 'unknown_models', 'model_conflicts', 'invalid_models'))
            plan.update(applicable=applicable, planToken=token)
            if action == 'plan':
                return plan, 200
            if not applicable:
                return {'ok': False, 'error': 'Resuelve los problemas del plan antes de aplicar.', 'plan': plan}, 422
            try:
                return {**compile_json(source, self.adapter.store), 'refresh_required': True}, 200
            except CompileError as exc:
                return {'ok': False, 'error': str(exc), 'completed': exc.completed,
                        'models_added': exc.models_added, 'refresh_required': True,
                        'recovery': 'Recarga la KB y calcula otro plan antes de reintentar. No hubo rollback.'}, 500
