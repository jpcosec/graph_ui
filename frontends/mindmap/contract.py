"""Contrato de intercambio JSON del Mindmap (versión 1).

El JSON es declarativo: sirve para importar, exportar y probar el mapa, pero
nunca es un segundo almacén. Toda la semántica vive en SLDB:

- identidad: ``documents[].id`` (y ``payload.id`` por defecto);
- título: ``payload.title``;
- contención y relaciones: campos de referencia del payload (simples, listas
  o inversas declaradas por el modelo); no hay sección ``edges`` propia;
- vista: ``positions`` y ``collapsed`` son metadatos de presentación.

Este módulo solo valida la forma del documento; la validación semántica
(round-trip de payload contra el modelo) pertenece a SLDB y se hace en el
adaptador.
"""
from __future__ import annotations

import re
from typing import Any

CONTRACT_VERSION = 1

DOC_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,159}")
IDENTIFIER = re.compile(r"[A-Za-z_][A-Za-z0-9_]*$")
TYPE_EXPR = re.compile(r"[A-Za-z][A-Za-z0-9_]*(?:\[[A-Za-z0-9_, |.]+\])?(?: \| None)?$")
REF_EXPR = re.compile(r"[A-Za-z_][A-Za-z0-9_.]*:[A-Za-z_][A-Za-z0-9_.]*$")


class ContractError(ValueError):
    """El documento JSON no cumple el contrato."""


class Reference:
    """Noción de referencia del contrato: simple, lista o inversa.

    Una referencia simple o de lista vive en el payload del documento origen
    (``"tasks": ["doc-a", "doc-b"]``). Una referencia inversa se declara en el
    modelo destino como ``"~field"`` y se materializa en el payload del
    documento origen correspondiente al resolver la relación.
    """

    def __init__(self, field: str, kind: str, target_model: str | None = None):
        if kind not in ("simple", "list", "inverse"):
            raise ContractError(f"Tipo de referencia inválido: {kind!r}.")
        self.field, self.kind, self.target_model = field, kind, target_model


def _object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{label} debe ser un objeto JSON.")
    return value


def _list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        raise ContractError(f"{label} debe ser una lista JSON.")
    return value


def validate(spec: Any) -> dict[str, Any]:
    """Valida un documento de intercambio completo. Devuelve el spec normalizado.

    No escribe ni consulta SLDB: es la puerta de entrada de ``validate`` del
    compilador y de cualquier importador.
    """
    spec = _object(spec, "El documento raíz")
    if spec.get("version", CONTRACT_VERSION) != CONTRACT_VERSION:
        raise ContractError(f"Versión de contrato no soportada: {spec.get('version')!r}; se espera {CONTRACT_VERSION}.")

    models = spec.get("models", [])
    registered: dict[str, dict[str, Any]] = {}
    for raw in _list(models, "models"):
        model = _object(raw, "Cada model")
        name = model.get("name")
        if not isinstance(name, str) or not IDENTIFIER.fullmatch(name):
            raise ContractError(f"Nombre de modelo inválido: {name!r}.")
        if name in registered:
            raise ContractError(f"Modelo duplicado: {name}.")
        if "ref" in model:
            ref = model["ref"]
            if not isinstance(ref, str) or not REF_EXPR.fullmatch(ref):
                raise ContractError(f"Ref inválida para {name}: {ref!r}.")
            if ref.rsplit(":", 1)[1].split(".")[-1] != name:
                raise ContractError(f"El nombre {name!r} no coincide con la clase de {ref!r}.")
        else:
            _validate_fields(model.get("fields", []), name)
        template = model.get("template")
        if template is not None and not isinstance(template, str):
            raise ContractError(f"Template inválido para {name}.")
        if "containment" in model:
            _validate_containment(model["containment"], name, model.get("fields"), registered)
        if "references" in model:
            _validate_references(model["references"], name, model.get("fields"), registered)
        registered[name] = model

    _cross_check_references(spec.get("models", []), registered)

    documents = spec.get("documents", [])
    seen: set[str] = set()
    for raw in _list(documents, "documents"):
        doc = _object(raw, "Cada document")
        doc_id = doc.get("id", doc.get("name"))
        if not isinstance(doc_id, str) or not DOC_ID.fullmatch(doc_id):
            raise ContractError(f"ID de documento inválido: {doc_id!r}.")
        if doc_id in seen:
            raise ContractError(f"ID de documento duplicado: {doc_id}.")
        seen.add(doc_id)
        model_name = doc.get("model")
        if not isinstance(model_name, str) or not IDENTIFIER.fullmatch(model_name):
            raise ContractError(f"Modelo inválido en {doc_id}: {model_name!r}.")
        payload = doc.get("payload", {})
        _object(payload, f"payload de {doc_id}")
        if "title" not in payload:
            raise ContractError(f"Falta title en el payload de {doc_id}.")
        for key in ("contained_in", "contains"):
            if key in doc:
                refs = doc[key]
                for ref in (_list(refs, f"{doc_id}.{key}") if key == "contains" else [refs]):
                    if not isinstance(ref, str) or not DOC_ID.fullmatch(ref):
                        raise ContractError(f"Referencia inválida en {doc_id}.{key}: {ref!r}.")

    view = spec.get("view", {})
    _validate_view(view)
    return spec


def _validate_fields(fields: Any, model_name: str) -> None:
    if not isinstance(fields, list) or not fields:
        raise ContractError(f"El modelo {model_name} debe declarar fields o ref.")
    names: set[str] = set()
    for raw in _list(fields, f"fields de {model_name}"):
        field = _object(raw, f"Campo de {model_name}")
        name = field.get("name")
        if not isinstance(name, str) or not IDENTIFIER.fullmatch(name):
            raise ContractError(f"Nombre de campo inválido en {model_name}: {name!r}.")
        if name in names:
            raise ContractError(f"Campo duplicado en {model_name}: {name}.")
        names.add(name)
        type_expr = field.get("type", "str")
        if not isinstance(type_expr, str) or not TYPE_EXPR.fullmatch(type_expr) or "__" in type_expr:
            raise ContractError(f"Tipo inválido para {model_name}.{name}: {type_expr!r}.")
        description = field.get("description", name)
        if not isinstance(description, str):
            raise ContractError(f"Descripción inválida para {model_name}.{name}.")
        if "required" in field and not isinstance(field["required"], bool):
            raise ContractError(f"required debe ser booleano en {model_name}.{name}.")


def _validate_containment(containment: Any, model_name: str, fields: Any, registered: dict[str, Any]) -> None:
    """La contención declarada: campo -> [modelos destino] con cross-check."""
    if not isinstance(containment, dict) or not containment:
        raise ContractError(f"containment de {model_name} debe ser un objeto no vacío.")
    field_names = {f["name"] for f in fields} if isinstance(fields, list) else None
    for field, targets in containment.items():
        if not isinstance(field, str) or not IDENTIFIER.fullmatch(field):
            raise ContractError(f"Campo de contención inválido en {model_name}: {field!r}.")
        if not isinstance(targets, list) or not targets or not all(isinstance(t, str) and IDENTIFIER.fullmatch(t) for t in targets):
            raise ContractError(f"containment[{field!r}] en {model_name} debe ser una lista de modelos.")
        if field_names is not None and field not in field_names:
            raise ContractError(f"La contención {model_name}.{field} apunta a un campo no declarado.")


def _validate_references(references: Any, model_name: str, fields: Any, registered: dict[str, Any]) -> None:
    if not isinstance(references, list):
        raise ContractError(f"references de {model_name} debe ser una lista.")
    field_names = {f["name"] for f in fields} if isinstance(fields, list) else None
    for raw in references:
        ref = _object(raw, f"Entrada de references de {model_name}")
        field = ref.get("field")
        if not isinstance(field, str) or not IDENTIFIER.fullmatch(field):
            raise ContractError(f"Referencia con campo inválido en {model_name}: {field!r}.")
        kind = ref.get("kind")
        if kind not in ("simple", "list", "inverse"):
            raise ContractError(f"Tipo de referencia inválido en {model_name}.{field}: {kind!r}.")
        target_model = ref.get("target_model")
        if target_model is not None and (not isinstance(target_model, str) or not IDENTIFIER.fullmatch(target_model)):
            raise ContractError(f"Modelo destino inválido en {model_name}.{field}: {target_model!r}.")
        # El campo debe existir en el propio modelo cuando este declara fields.
        if field_names is not None and field not in field_names:
            raise ContractError(f"La referencia {model_name}.{field} apunta a un campo no declarado.")


def _cross_check_references(models: Any, registered: dict[str, Any]) -> None:
    """Toda referencia o contención con target debe apuntar a un modelo declarado."""
    for raw in models:
        model = _object(raw, "Cada model")
        for ref in model.get("references", []) or []:
            target = _object(ref, "Referencia").get("target_model")
            if target is not None and target not in registered:
                raise ContractError(
                    f"La referencia {model.get('name')}.{ref.get('field')} apunta al modelo "
                    f"no declarado {target!r}."
                )
        for field, targets in (model.get("containment") or {}).items():
            for target in targets:
                if target not in registered:
                    raise ContractError(
                        f"La contención {model.get('name')}.{field} apunta al modelo "
                        f"no declarado {target!r}."
                    )


def _validate_view(view: Any) -> None:
    view = _object(view, "view")
    positions = view.get("positions", {})
    _object(positions, "view.positions")
    for doc_id, position in positions.items():
        if not isinstance(doc_id, str) or not DOC_ID.fullmatch(doc_id):
            raise ContractError(f"Clave de posición inválida: {doc_id!r}.")
        pos = _object(position, f"view.positions[{doc_id}]")
        for axis in ("x", "y"):
            value = pos.get(axis, 0)
            if not isinstance(value, (int, float)):
                raise ContractError(f"view.positions[{doc_id}].{axis} debe ser numérico.")
    for doc_id in _list(view.get("collapsed", []), "view.collapsed"):
        if not isinstance(doc_id, str) or not DOC_ID.fullmatch(doc_id):
            raise ContractError(f"ID plegado inválido: {doc_id!r}.")