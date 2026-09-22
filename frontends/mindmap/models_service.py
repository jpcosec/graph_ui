"""Gateway al editor de clases de pron.Store (paso 7, migrado a pron).

Cada operación llama directo a ``pron.world.store.Store`` en el mismo proceso — sin
subprocess, sin importar SLDB aquí. Es edición del contrato de un modelo, no de un
documento: la misma puerta y la misma legitimidad que el resto de
``sldb_adapter.py`` (pron spec 12 §4, 10 §3). El ``try/except StoreError`` vive en
cada función, no en el llamador: así una promoción sin draft se reporta como
``{"ok": False, ...}`` a HTTP 200, nunca como un 500.

Import perezoso de pron a propósito: este módulo solo se usa en modo local (lo
importa ``serve.py`` dentro del branch local); el modo remote no debe cargar pron.

``detail`` emite el MISMO shape estructurado que sldb serve  ``GET /models/detail``
(``{"ok": True, "model": <ModelDescription>}``): pron ya devuelve ese dict, solo se
recorta el envoltorio. El dialog de clases consume ese shape (vuelta 5); el yaml
quedó fuera del contrato.
"""
from __future__ import annotations

from typing import Any


def _store_error():
    """Tipo de error de pron, importado perezoso: el módulo debe ser importable
    sin pron (modo remote / colección de la suite). Con ``from __future__ import
    annotations`` las anotaciones ``Store`` del archivo nunca se evalúan."""
    from pron.world.store_error import StoreError

    return StoreError


def detail(store: Store, model: str) -> dict[str, Any]:
    try:
        payload = store.model_detail(model)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}
    # pron ya devuelve el dict estructurado; emitir solo el envoltorio iguala
    # el shape de sldb serve /models/detail (name, model_ref, path, version,
    # canonical, family, semantics, base_models, fields, documents).
    return {"ok": True, "model": payload.get("model", payload)}


def list_models(store: Store) -> list[dict[str, Any]]:
    try:
        return store.model_catalog()
    except _store_error():
        return []


def template_edit(store: Store, model: str, content: str) -> dict[str, Any]:
    try:
        draft = store.model_template_edit(model, content)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Wrote draft template for '{model}' to {draft}"}


def fields_add(store: Store, model: str, field_name: str, field_type: str = "str",
               description: str = "", default: str = "") -> dict[str, Any]:
    """Añade un campo al draft. ``default`` vacío se trata como "sin default"."""
    try:
        draft = store.model_fields_add(model, field_name, field_type, description, default or None)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Added field draft '{field_name}' for '{model}' in {draft}"}


def fields_remove(store: Store, model: str, field_name: str) -> dict[str, Any]:
    try:
        draft = store.model_fields_remove(model, field_name)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}
    return {"ok": True, "text": f"Removed field draft '{field_name}' for '{model}' in {draft}"}


def validate(store: Store, model: str) -> dict[str, Any]:
    try:
        return store.model_validate_draft(model)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}


def promote(store: Store, model: str) -> dict[str, Any]:
    try:
        return store.model_promote(model)
    except _store_error() as exc:
        return {"ok": False, "error": str(exc)}
