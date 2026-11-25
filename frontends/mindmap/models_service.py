"""Gateway al editor de clases: llama a ``sldb.api`` en el mismo proceso.

Son las mismas funciones públicas que usan las rutas ``POST /models*`` de
``sldb serve`` (``sldb/cli/serve/models_*_routes.py``); aquí solo se les pasa el store del
adaptador. Es edición del contrato de un modelo, no de un documento. Cada operación atrapa
``SLDBError`` y lo reporta como ``{"ok": False, ...}`` a HTTP 200, nunca como un 500.

Imports perezosos (dentro de cada función): este módulo solo se usa en modo local; el modo
remote no debe cargar sldb. ``store`` es el ``SldbAdapter`` (lleva ``store`` y ``pythonpath``).

``detail`` emite el MISMO shape que sldb serve ``GET /models/detail``
(``{"ok": True, "model": <ModelDescription>}``).
"""
from __future__ import annotations

from typing import Any


def detail(store, model: str) -> dict[str, Any]:
    from sldb.api import describe_model
    from sldb.core.exceptions import SLDBError

    try:
        description = describe_model(store.store, model, store.pythonpath)
    except SLDBError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "model": description.model_dump(mode="json")}


def list_models(store) -> list[dict[str, Any]]:
    from sldb.cli.serve.models_routes import catalog_payload
    from sldb.core.exceptions import SLDBError

    try:
        return catalog_payload(None, store.store, store.root, store.pythonpath)[0]["models"]
    except SLDBError:
        return []


def template_edit(store, model: str, content: str) -> dict[str, Any]:
    from sldb.api import edit_model_template
    from sldb.cli.serve.models_route_support import run_draft_op

    return run_draft_op(store.store, store.pythonpath,
                        lambda: edit_model_template(store.store, model, content, store.pythonpath),
                        {"model": model})[0]


def fields_add(store, model: str, field_name: str, field_type: str = "str",
               description: str = "", default: str = "") -> dict[str, Any]:
    """Añade un campo al draft. ``default`` vacío se trata como "sin default"."""
    from sldb.api import add_model_field
    from sldb.cli.serve.models_route_support import run_draft_op

    return run_draft_op(
        store.store, store.pythonpath,
        lambda: add_model_field(store.store, model, field_name, field_type or "str", str(description or ""),
                                default or None, store.pythonpath),
        {"model": model, "field_name": field_name})[0]


def fields_remove(store, model: str, field_name: str) -> dict[str, Any]:
    from sldb.api import remove_model_field
    from sldb.cli.serve.models_route_support import run_draft_op

    return run_draft_op(store.store, store.pythonpath,
                        lambda: remove_model_field(store.store, model, field_name, store.pythonpath),
                        {"model": model, "field_name": field_name})[0]


def validate(store, model: str) -> dict[str, Any]:
    from sldb.api import validate_model_draft
    from sldb.cli.serve.models_route_support import run_report_op

    return run_report_op(store.store, store.pythonpath,
                         lambda: validate_model_draft(store.store, model, store.pythonpath))[0]


def promote(store, model: str) -> dict[str, Any]:
    from sldb.api import promote_model_draft
    from sldb.cli.serve.models_route_support import run_report_op

    return run_report_op(store.store, store.pythonpath,
                         lambda: promote_model_draft(store.store, model, store.pythonpath))[0]
