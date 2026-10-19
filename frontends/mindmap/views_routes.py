"""HTTP surface of projection views on the graph_ui server (local mode, store on disk).

- ``GET /api/views[?store=]``: the store's ``ViewDoc``s.
- ``GET /api/views/evaluate?view=ViewDoc:<name>[&store=]``: a saved view, evaluated.
- ``POST /api/views/evaluate`` ``{view: {...} | ref, store?}``: an unsaved view (the sidebar's
  current filters), evaluated.
- ``POST /api/views/save`` ``{name, view: {...}, store?}``: writes the ``ViewDoc`` through sldb.

``store`` names any ``.sldb`` directory on this machine; a view is portable across stores, so the
same ref or payload can be pointed at another one. Default: the server's store.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from mindmap.projection_views import VIEW_MODEL, ViewError, evaluate_view, find_view, list_views
from mindmap.sldb_adapter import ensure_model, write_document

VIEW_MODEL_REF = 'spec2viz.sldb_models:ViewDoc'


class RouteError(Exception):
    def __init__(self, message: str, status: int):
        super().__init__(message)
        self.status = status


def _store(default: str | Path, requested: str | None) -> Path:
    store = Path(requested).expanduser() if requested else Path(default)
    if not (store / 'core' / 'store_index.yaml').exists():
        raise RouteError(f'{store} is not an sldb store', 404)
    return store


def _view_payload(store: Path, body: dict[str, Any]) -> dict[str, Any]:
    view = body.get('view')
    if isinstance(view, dict):
        return view
    if isinstance(view, str) and view:
        found = find_view(store, view)
        if found is None:
            raise RouteError(f'{view} is not in {store}', 404)
        return found
    raise RouteError('view is required: a ViewDoc ref or a view payload', 400)


def _ensure_view_model(store: Path) -> None:
    """Register spec2viz's ``ViewDoc`` in a store that has none yet (spec2viz must be installed)."""
    try:
        ensure_model(store, VIEW_MODEL, VIEW_MODEL_REF)
    except Exception as exc:
        raise RouteError(f'{VIEW_MODEL_REF} is not available: {exc}', 501) from exc


def save_view(store: Path, body: dict[str, Any]) -> dict[str, Any]:
    name, view = str(body.get('name') or '').strip(), body.get('view')
    if not name or not isinstance(view, dict):
        raise RouteError('name and a view payload are required', 400)
    evaluate_view(store, view)  # a view that does not evaluate is not saved
    fields = ('nodes', 'relations', 'direction', 'notation', 'layout', 'description')
    payload = {**{k: view[k] for k in fields if k in view}, 'id': name, 'name': name, 'title': view.get('title') or name}
    _ensure_view_model(store)
    path = store.parent / 'sldb' / 'views' / f'{name}.md'
    write_document(store, VIEW_MODEL, name, path, payload, exists=find_view(store, name) is not None)
    return {'ok': True, 'ref': f'{VIEW_MODEL}:{name}', 'view': payload}


def dispatch(method: str, route: str, query: dict[str, list[str]], body: dict[str, Any] | None,
             default_store: str | Path) -> tuple[dict[str, Any], int]:
    """(payload, status) for one /api/views* request."""
    params = {k: v[0] for k, v in query.items() if v}
    body = body or {}
    try:
        store = _store(default_store, body.get('store') or params.get('store'))
        if method == 'GET' and route == '/api/views':
            return {'views': list_views(store)}, 200
        if route == '/api/views/evaluate':
            view = _view_payload(store, body if method == 'POST' else {'view': params.get('view')})
            return {'ok': True, 'store': str(store), **evaluate_view(store, view)}, 200
        if method == 'POST' and route == '/api/views/save':
            return save_view(store, body), 200
        return {'ok': False, 'error': 'Ruta desconocida.'}, 404
    except RouteError as exc:
        return {'ok': False, 'error': str(exc)}, exc.status
    except ViewError as exc:
        return {'ok': False, 'error': str(exc)}, 422
