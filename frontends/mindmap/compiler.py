"""Compile a declarative mindmap JSON document into an SLDB store.

The JSON is the authoring format.  SLDB remains the runtime format: models are
Python ``StructuredNLDoc`` classes, documents are validated Markdown files and
the store indexes are rebuilt by the native SLDB operations.

Entry points:

- ``compile_json`` writes and returns a report (legacy apply-everything mode);
- ``validate_source`` checks the frozen contract without touching the store;
- ``plan_source`` is the dry-run: computes creates, changes and conflicts.

All store operations go through the shared ``sldb_adapter``.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
from pathlib import Path
from typing import Any

# Módulos hermanos: garantiza carga aislada (tests, CLI desde otro cwd).
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

import contract as kb_contract
from sldb_adapter import AdapterError, SldbAdapter


IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


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
    if not isinstance(value, str) or not kb_contract.TYPE_EXPR.fullmatch(value) or "__" in value:
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
        # Metadatos de grafo del contrato: referencias y contención declaradas.
        reference_names = [r.get("field") for r in model.get("references", []) or [] if isinstance(r, dict)]
        if reference_names:
            lines.append(f"    __references__ = {reference_names!r}")
        containment = model.get("containment")
        if containment:
            if not isinstance(containment, dict) or not all(
                isinstance(k, str) and isinstance(v, list) and all(isinstance(t, str) for t in v)
                for k, v in containment.items()
            ):
                raise CompileError(f"containment inválido para {name}: debe ser campo -> [modelos].")
            lines.append(f"    __containment__ = {containment!r}")
        for raw_field in fields:
            lines.append(_field_source(_ensure_object(raw_field, f"Campo de {name}")))
        lines.append("")
        generated.append(name)
    if generated:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text("\n".join(lines), encoding="utf-8")
    return generated


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


def validate_source(source: str | Path | dict[str, Any]) -> dict[str, Any]:
    """Modo ``validate``: valida el contrato congelado sin tocar el store."""
    spec = _ensure_object(json.loads(Path(source).read_text(encoding="utf-8")) if isinstance(source, (str, Path)) else source, "El documento raíz")
    try:
        kb_contract.validate(spec)
    except kb_contract.ContractError as exc:
        return {"ok": False, "errors": [str(exc)]}
    return {"ok": True, "version": kb_contract.CONTRACT_VERSION,
            "models": [m.get("name") for m in spec.get("models", [])],
            "documents": [d.get("id", d.get("name")) for d in spec.get("documents", [])]}


def plan_source(source: str | Path | dict[str, Any], store: str | Path) -> dict[str, Any]:
    """Modo ``dry-run``: calcula altas, cambios, conflictos e impacto sin escribir.

    Un store inexistente es un caso válido de planificación: todo son altas y
    modelos nuevos, sin conflictos. Cada payload se valida contra SLDB (por
    ref, sin registrar nada) y los ``updates`` solo incluyen documentos cuyo
    contenido realmente cambia.
    """
    spec = _ensure_object(json.loads(Path(source).read_text(encoding="utf-8")) if isinstance(source, (str, Path)) else source, "El documento raíz")
    kb_contract.validate(spec)
    store_path = Path(store).resolve()
    if (store_path / "core" / "store_index.yaml").exists():
        adapter = SldbAdapter(store_path)
        existing = {d.name: d for d in adapter.documents()}
        registered_models = adapter.model_refs()
    else:
        existing, registered_models = {}, {}

    # Resolución de refs: modelos registrados del store o declarados en el spec.
    # Los modelos inline (fields sin ref) se validan en un módulo temporal.
    spec_models = {m.get("name"): m for m in spec.get("models", [])}
    refs = dict(registered_models)
    generated_names = []
    temp_dir = None
    try:
        for name, model in spec_models.items():
            if name in refs:
                continue
            if model.get("ref"):
                refs[name] = model["ref"]
            elif not generated_names:
                temp_dir = tempfile.mkdtemp(prefix="kb-plan-")
                # El nombre de módulo se reusa entre dry-runs del mismo proceso:
                # sin esto, un segundo dry-run con schemas inline distintos
                # resolvería las clases viejas desde sys.modules.
                sys.modules.pop("_plan_models", None)
                generated_names = generate_models_module(spec, Path(temp_dir) / "_plan_models.py")
                for generated in generated_names:
                    refs[generated] = f"_plan_models:{generated}"

        creates, updates, unchanged, conflicts, invalid, unknown_models = [], [], [], [], [], []
        for raw in spec.get("documents", []):
            doc = _ensure_object(raw, "Cada document")
            name, model_name = doc.get("id", doc.get("name")), doc.get("model")
            if model_name not in refs and model_name not in spec_models:
                unknown_models.append(name)
                continue
            payload = dict(doc.get("payload") or {})
            payload.setdefault("id", name)
            # Validación real contra SLDB: por ref si ya está resuelta.
            if model_name in refs:
                try:
                    valid, details = SldbAdapter.validate_ref(refs[model_name], payload, str(Path(temp_dir)) if temp_dir else None)
                except AdapterError as exc:
                    invalid.append({"id": name, "error": str(exc)})
                    continue
                if not valid:
                    invalid.append({"id": name, "error": f"payload no pasa el round-trip: {details}"})
                    continue
            current = existing.get(name)
            if current is None:
                creates.append(name)
            elif current.model_name != model_name:
                conflicts.append({"id": name, "reason": f"ya existe como {current.model_name}"})
            elif current.payload != payload:
                updates.append(name)
            else:
                unchanged.append(name)
        return {"ok": True, "creates": creates, "updates": updates, "unchanged": unchanged,
                "conflicts": conflicts, "invalid_payloads": invalid,
                "unknown_models": unknown_models,
                "new_models": [n for n in spec_models if n not in registered_models]}
    finally:
        if temp_dir:
            sys.modules.pop("_plan_models", None)
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)


def compile_json(source: str | Path | dict[str, Any], store: str | Path, *, module_path: str | Path | None = None) -> dict[str, Any]:
    """Compile *source* into *store* and return a machine-readable report.

    Aplicación segura: contrato, modelos y TODOS los payloads se validan antes
    de registrar modelos o escribir documentos. Un error de validación deja el
    store intacto (ningún modelo registrado a medias).
    """
    spec = _ensure_object(json.loads(Path(source).read_text(encoding="utf-8")) if isinstance(source, (str, Path)) else source, "El documento raíz")
    kb_contract.validate(spec)
    models = spec.get("models", [])
    documents = spec.get("documents", [])
    store_path = Path(store).resolve()
    root = store_path.parent
    module_file = Path(module_path).resolve() if module_path else root / "_sldb_compiled_models.py"
    generated = generate_models_module(spec, module_file)
    pythonpath = str(module_file.parent)
    module_name = module_file.stem
    # El mismo nombre de módulo se reusa entre compilaciones (p.ej. en tests o
    # sucesivos applies); sin esto resolve_model_ref devolvería la versión vieja.
    sys.modules.pop(module_name, None)

    # ---- Fase 1: resolver refs y prevalidar TODO sin tocar el store. ----
    registered: dict[str, str] = {}
    for raw in models:
        model = _ensure_object(raw, "Cada model")
        name = _identifier(model.get("name"), "El nombre del modelo")
        if name in registered:
            raise CompileError(f"Modelo duplicado: {name}.")
        registered[name] = _model_ref(model, module_name)

    existing = {}
    store_existed = (store_path / "core" / "store_index.yaml").exists()
    if store_existed:
        existing = {d.name: d for d in SldbAdapter(store_path).documents(pythonpath)}

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
        # Validación por ref: no requiere que el modelo esté registrado en el store.
        try:
            valid, details = SldbAdapter.validate_ref(registered[model_name], payload, pythonpath)
        except AdapterError as exc:
            raise CompileError(f"{name}: {exc}") from exc
        if not valid:
            raise CompileError(f"{name}: payload no pasa el round-trip de SLDB: {details}")
        current = existing.get(name)
        if current and current.model_name != model_name:
            raise CompileError(f"{name} ya existe como {current.model_name}; no se cambia de clase automáticamente.")
        prepared.append((doc, name, model_name, payload))

    # ---- Fase 2: todo validado; registrar modelos y escribir documentos. ----
    adapter = SldbAdapter(store_path)
    adapter.init_store()
    existing_models = adapter.model_names()
    for name, ref in registered.items():
        if name not in existing_models:
            adapter.add_model(ref, pythonpath=pythonpath)

    written: list[str] = []
    for doc, name, model_name, payload in prepared:
        if name in existing:
            adapter.update_document(existing[name], payload, pythonpath)
        else:
            output = root / "desk" / "mindmap" / model_name / f"{name}.md"
            adapter.create_document(name, model_name, payload, output, pythonpath)
        written.append(name)
    view = spec.get("view")
    if view is not None:
        kb_contract.validate({"version": 1, "view": view})
        adapter.write_view(view)
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
