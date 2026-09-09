"""Compile a declarative mindmap JSON document into an SLDB store.

The JSON is the authoring format.  SLDB remains the runtime format: models are
Python ``StructuredNLDoc`` classes, documents are validated Markdown files and
the store indexes are rebuilt by the native SLDB operations.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Any

from sldb.cli.commands.doc import DocCLI
from sldb.cli.commands.model import ModelCLI
from sldb.cli.model_utils import registered_model
from sldb.cli.store_context import get_store_context
from sldb.runtime.validation import render_model_markdown, validate_model_input_roundtrip
from sldb.store.io import load_store_index
from sldb.store.query import load_runtime_documents
from sldb.store.resolver import find_local_store


IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
TYPE_EXPR = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(?:\[[A-Za-z0-9_, |.]+\])?(?: \| None)?$")


class CompileError(ValueError):
    """Input cannot be compiled without losing data or validity."""


def _ensure_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise CompileError(f"{label} debe ser un objeto JSON.")
    return value


def _identifier(value: Any, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        raise CompileError(f"{label} debe ser un identificador Python válido.")
    return value


def _type_expr(value: Any) -> str:
    value = value or "str"
    if not isinstance(value, str) or not TYPE_EXPR.fullmatch(value) or "__" in value:
        raise CompileError(f"Tipo de campo inválido: {value!r}.")
    return value


def _field_source(field: dict[str, Any]) -> str:
    name = _identifier(field.get("name"), "El nombre del campo")
    description = field.get("description", name)
    if not isinstance(description, str):
        raise CompileError(f"Descripción inválida para {name}.")
    type_expr = _type_expr(field.get("type"))
    required = field.get("required", "default" not in field)
    if required and "default" not in field:
        return f"    {name}: {type_expr} = Field(description={description!r})"
    default = field.get("default")
    return f"    {name}: {type_expr} = Field(default={default!r}, description={description!r})"


def generate_models_module(spec: dict[str, Any], destination: Path) -> list[str]:
    """Generate Python model classes for JSON models without a ``ref``."""
    models = spec.get("models", [])
    if not isinstance(models, list):
        raise CompileError("models debe ser una lista.")
    generated: list[str] = []
    lines = ["from typing import Any", "", "from pydantic import Field", "", "from sldb import StructuredNLDoc", ""]
    for raw in models:
        model = _ensure_object(raw, "Cada model")
        if model.get("ref"):
            continue
        name = _identifier(model.get("name"), "El nombre del modelo")
        fields = model.get("fields", [])
        if not isinstance(fields, list) or not fields:
            raise CompileError(f"El modelo {name} debe declarar fields o ref.")
        lines.append(f"class {name}(StructuredNLDoc):")
        if "family" in model:
            lines.append(f"    __family__ = {model['family']!r}")
        if "semantics" in model:
            lines.append(f"    __semantics__ = {model['semantics']!r}")
        fields_by_name = [_identifier(_ensure_object(item, f"Campo de {name}").get("name"), "El nombre del campo") for item in fields]
        default_template = "---\n" + "\n".join(
            f"{field}: ⸢rev•{field}⸥" for field in fields_by_name if field != "title"
        ) + "\n---\n" + (
            "# ⸢rev•title⸥" if "title" in fields_by_name else "\n".join(f"## {field}\n⸢rev•{field}⸥" for field in fields_by_name)
        )
        template = model.get("template", default_template)
        if not isinstance(template, str):
            raise CompileError(f"Template inválido para {name}.")
        lines.append(f"    __template__ = {template!r}")
        for raw_field in fields:
            lines.append(_field_source(_ensure_object(raw_field, f"Campo de {name}")))
        lines.append("")
        generated.append(name)
    if generated:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text("\n".join(lines), encoding="utf-8")
    return generated


def _store_exists(path: Path) -> bool:
    return (path / "core" / "store_index.yaml").exists()


def _init_store(path: Path) -> None:
    from sldb.cli.commands.store_init import _create_store
    _create_store(path)


def _model_ref(model: dict[str, Any], generated_module: str) -> str:
    ref = model.get("ref")
    if ref:
        if not isinstance(ref, str) or ":" not in ref:
            raise CompileError(f"Ref inválida para {model.get('name')!r}.")
        expected = str(model.get("name", ""))
        actual = ref.rsplit(":", 1)[1].split(".")[-1]
        if expected != actual:
            raise CompileError(f"El nombre {expected!r} no coincide con la clase de {ref!r}.")
        return ref
    return f"{generated_module}:{model['name']}"


def compile_json(source: str | Path | dict[str, Any], store: str | Path, *, module_path: str | Path | None = None) -> dict[str, Any]:
    """Compile *source* into *store* and return a machine-readable report."""
    spec = _ensure_object(json.loads(Path(source).read_text(encoding="utf-8")) if isinstance(source, (str, Path)) else source, "El documento raíz")
    models = spec.get("models", [])
    documents = spec.get("documents", [])
    if not isinstance(documents, list):
        raise CompileError("documents debe ser una lista.")
    store_path = Path(store).resolve()
    root = store_path.parent
    module_file = Path(module_path).resolve() if module_path else root / "_sldb_compiled_models.py"
    generated = generate_models_module(spec, module_file)
    pythonpath = str(module_file.parent)
    module_name = module_file.stem
    if not _store_exists(store_path):
        _init_store(store_path)
    # Register generated and referenced classes before validating documents.
    registered: dict[str, str] = {}
    existing_models = {m.name for m in load_store_index(store_path).models}
    for raw in models:
        model = _ensure_object(raw, "Cada model")
        name = _identifier(model.get("name"), "El nombre del modelo")
        ref = _model_ref(model, module_name)
        registered[name] = ref
        if name not in existing_models:
            ModelCLI().add(SimpleNamespace(model=ref, store=str(store_path), pythonpath=pythonpath, canonical=False))
            existing_models.add(name)

    existing = {d.name: d for d in load_runtime_documents(store_path, __import__("sldb.cli.model_utils", fromlist=["resolve_model_ref"]).resolve_model_ref, pythonpath)}
    prepared: list[tuple[dict[str, Any], str, str, dict[str, Any]]] = []
    seen: set[str] = set()
    for raw in documents:
        doc = _ensure_object(raw, "Cada document")
        name = doc.get("id", doc.get("name"))
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,159}", name) or name in seen:
            raise CompileError(f"ID de documento inválido o duplicado: {name!r}.")
        seen.add(name)
        model_name = doc.get("model")
        if model_name not in registered:
            raise CompileError(f"El documento {name} referencia un modelo desconocido: {model_name!r}.")
        payload = doc.get("payload", {})
        if not isinstance(payload, dict):
            raise CompileError(f"payload inválido en {name}.")
        payload = dict(payload)
        payload.setdefault("id", name)
        model, _, _ = registered_model(store_path, model_name, pythonpath)
        rendered = render_model_markdown(model, payload)
        valid, details = validate_model_input_roundtrip(model, rendered)
        if not valid:
            raise CompileError(f"{name}: payload no pasa el round-trip de SLDB: {details}")
        current = existing.get(name)
        if current and current.model_name != model_name:
            raise CompileError(f"{name} ya existe como {current.model_name}; no se cambia de clase automáticamente.")
        prepared.append((doc, name, model_name, payload))

    written: list[str] = []
    for doc, name, model_name, payload in prepared:
        if name in existing:
            DocCLI().update(SimpleNamespace(doc=name, payload=json.dumps(payload), store=str(store_path), pythonpath=pythonpath))
        else:
            output = root / "desk" / "mindmap" / model_name / f"{name}.md"
            DocCLI().add(SimpleNamespace(store=str(store_path), pythonpath=pythonpath, model=model_name,
                payload=json.dumps(payload), output=str(output), name=name))
        written.append(name)
    view = spec.get("view")
    if view is not None:
        if not isinstance(view, dict):
            raise CompileError("view debe ser un objeto.")
        runtime = store_path / "runtime"
        runtime.mkdir(parents=True, exist_ok=True)
        (runtime / "mindmap-view.json").write_text(json.dumps(view, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"ok": True, "store": str(store_path), "module": str(module_file), "models": list(registered), "generated_models": generated, "documents": written}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compila JSON declarativo a un store SLDB.")
    parser.add_argument("source", help="Archivo JSON de entrada")
    parser.add_argument("--store", required=True, help="Ruta al .sldb destino")
    parser.add_argument("--module", help="Ruta del módulo Python generado")
    args = parser.parse_args(argv)
    try:
        print(json.dumps(compile_json(args.source, args.store, module_path=args.module), ensure_ascii=False, indent=2))
    except (CompileError, OSError, SystemExit) as exc:
        print(f"compile error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
