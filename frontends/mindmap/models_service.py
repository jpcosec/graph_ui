"""Gateway al editor de clases de pron.Store (paso 7, migrado a pron).

Cada operación llama directo a ``pron.Store`` en el mismo proceso — sin subprocess,
sin importar SLDB aquí. Es edición del contrato de un modelo, no de un documento: la
misma puerta y la misma legitimidad que el resto de ``sldb_adapter.py`` (pron spec
12 §4, 10 §3). El ``try/except StoreError`` vive en cada función, no en el llamador:
así una promoción sin draft se reporta como ``{"ok": False, ...}`` a HTTP 200, nunca
como un 500.
"""
from __future__ import annotations

from typing import Any

import yaml

from pron.store import Store, StoreError


def detail(store: Store, model: str) -> dict[str, Any]:
    try:
        payload = store.model_detail(model)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": yaml.safe_dump(payload, sort_keys=False, allow_unicode=True)}


def list_models(store: Store) -> list[dict[str, Any]]:
    try:
        return store.model_catalog()
    except StoreError:
        return []


def template_edit(store: Store, model: str, content: str) -> dict[str, Any]:
    try:
        draft = store.model_template_edit(model, content)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Wrote draft template for '{model}' to {draft}"}


def fields_add(store: Store, model: str, field_name: str, field_type: str = "str",
               description: str = "", default: str = "") -> dict[str, Any]:
    """Añade un campo al draft. ``default`` vacío se trata como "sin default"."""
    try:
        draft = store.model_fields_add(model, field_name, field_type, description, default or None)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Added field draft '{field_name}' for '{model}' in {draft}"}


def fields_remove(store: Store, model: str, field_name: str) -> dict[str, Any]:
    try:
        draft = store.model_fields_remove(model, field_name)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Removed field draft '{field_name}' for '{model}' in {draft}"}


def validate(store: Store, model: str) -> dict[str, Any]:
    try:
        return store.model_validate_draft(model)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}


def promote(store: Store, model: str) -> dict[str, Any]:
    try:
        return store.model_promote(model)
    except StoreError as exc:
        return {"ok": False, "error": str(exc)}
