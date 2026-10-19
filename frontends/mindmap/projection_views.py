"""Projection views: which slice of a store to look at, evaluated with sldb's API only.

A view is a ``ViewDoc`` of the store (its model lives in spec2viz, next to ``NotationDoc``;
desk/drawer/PROJECTION_GRAMMAR_SPEC.md §3). It names models, ``where`` predicates and relation
types, never node ids or a store path, so the same view evaluates against any store:

- nodes: the documents of each ``nodes`` entry's ``model`` whose payload satisfies its ``where``
  (``sldb.api.where.where_matches``), united; no entries means every document;
- edges: the edges ``sldb.api.graph.execute_query`` keeps for ``RelationFilter(relations,
  direction)``, between two documents of that node set;
- layout: the view's ``layout``, else its notation's ``layout`` (``NotationDoc.layout``).

graph_ui only evaluates; drawing rules stay in spec2viz. The sldb calls live in
``mindmap.sldb_adapter`` (the one module of the mindmap that imports sldb).
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from mindmap.sldb_adapter import relation_edges, runtime_documents, where_holds

VIEW_MODEL = 'ViewDoc'
DIRECTIONS = ('both', 'outgoing', 'incoming')
DOCUMENT_PREFIX = 'sldb://document/'


class ViewError(ValueError):
    """The view is malformed (bad direction, non-list fields, a where that does not parse)."""


def node_id(model: str, name: str) -> str:
    """The edge-index id of a document: ``sldb://document/<Model>:<name>``."""
    return f'{DOCUMENT_PREFIX}{model}:{name}'


def _entries(view: dict[str, Any]) -> list[dict[str, str]]:
    entries = view.get('nodes') or []
    if not isinstance(entries, list) or not all(isinstance(e, dict) and e.get('model') for e in entries):
        raise ViewError('nodes must be a list of {model, where}')
    return [{'model': str(e['model']), 'where': str(e.get('where') or '')} for e in entries]


def _selected(doc: Any, entries: list[dict[str, str]]) -> bool:
    if not entries:
        return True
    try:
        return any(e['model'] == doc.model_name and where_holds(e['where'], doc.payload) for e in entries)
    except Exception as exc:  # WherePredicateError and friends: the view is wrong, not the store
        raise ViewError(f'where does not parse: {exc}') from exc


def _relation_filter(view: dict[str, Any]) -> tuple[list[str], str]:
    relations = view.get('relations') or []
    direction = view.get('direction') or 'both'
    if not isinstance(relations, list) or direction not in DIRECTIONS:
        raise ViewError(f'relations must be a list and direction one of {", ".join(DIRECTIONS)}')
    return [str(r) for r in relations], direction


def _title(doc: Any) -> str:
    payload = doc.payload or {}
    return str(payload.get('title') or payload.get('name') or doc.name)


def _layout(view: dict[str, Any], documents: list[Any]) -> dict[str, Any]:
    if view.get('layout'):
        return dict(view['layout'])
    notation = str(view.get('notation') or '').split(':', 1)[-1]
    found = next((d for d in documents if d.model_name == 'NotationDoc' and d.name == notation), None)
    return dict((found.payload or {}).get('layout') or {}) if found else {}


def evaluate_view(store: str | Path, view: dict[str, Any], pythonpath: str | None = None) -> dict[str, Any]:
    """The view's nodes, edges and layout over ``store`` (a ``.sldb`` directory)."""
    store = Path(store)
    entries, (relations, direction) = _entries(view), _relation_filter(view)
    documents = runtime_documents(store, pythonpath)
    selected = {node_id(d.model_name, d.name): d for d in documents if _selected(d, entries)}
    seen = {(source, target, relation) for node, source, target, relation in relation_edges(store, relations, direction)
            if node in selected and source in selected and target in selected}
    return {
        'view': view,
        'nodes': [{'id': key, 'model': d.model_name, 'name': d.name, 'title': _title(d), 'payload': d.payload}
                  for key, d in sorted(selected.items())],
        'edges': [{'source': s, 'target': t, 'relation_type': r} for s, t, r in sorted(seen)],
        'layout': _layout(view, documents),
    }


def list_views(store: str | Path, pythonpath: str | None = None) -> list[dict[str, Any]]:
    """The store's ``ViewDoc``s, as ``{ref, payload}``."""
    documents = runtime_documents(store, pythonpath)
    return [{'ref': f'{VIEW_MODEL}:{d.name}', 'payload': d.payload}
            for d in sorted(documents, key=lambda d: d.name) if d.model_name == VIEW_MODEL]


def find_view(store: str | Path, ref: str, pythonpath: str | None = None) -> dict[str, Any] | None:
    """One ``ViewDoc``'s payload by ``ViewDoc:<name>`` (or bare name); None when missing."""
    name = ref.split(':', 1)[-1]
    return next((v['payload'] for v in list_views(store, pythonpath) if v['ref'].split(':', 1)[1] == name), None)
