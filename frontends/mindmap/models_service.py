"""Gateway a la CLI pública de SLDB para el ciclo de modelos (paso 7).

Cada operación delega en ``python -m sldb models <comando>`` contra el store
local. El frontend nunca importa módulos internos de SLDB.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


def _cli(store: str | Path, *args: str, with_json: bool = False, pythonpath: str | None = None) -> dict[str, Any]:
    cmd = [sys.executable, "-m", "sldb", "models", *args, "--store", str(store)]
    if pythonpath:
        cmd.extend(["--pythonpath", pythonpath])
    if with_json:
        cmd.extend(["--format", "json"])
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        return {"ok": False, "error": result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}"}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": True, "text": result.stdout.strip()}


def detail(store: str | Path, model: str) -> dict[str, Any]:
    """Detalle de un modelo registrado. Incluye --pythonpath para modelos compilados."""
    return _cli(store, "show", model, pythonpath=str(Path(store).parent))


def list_models(store: str | Path) -> list[dict[str, Any]]:
    result = _cli(store, "list", with_json=True)
    if result.get("ok") is False:
        return []
    return result.get("models", [])


def template_edit(store: str | Path, model: str, content: str) -> dict[str, Any]:
    tmp = Path(tempfile.mkdtemp(prefix="kb-ms-"))
    input_path = tmp / "template.md"
    input_path.write_text(content, encoding="utf-8")
    try:
        return _cli(store, "template", "edit", model, "--input", str(input_path))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def fields_add(store: str | Path, model: str, field_name: str, field_type: str = "string", description: str = "", default: str = "") -> dict[str, Any]:
    """Añade un campo al draft. CLI requiere --type y --description."""
    cmd = ["fields", "add", model, field_name, "--type", field_type, "--description", description]
    if default:
        cmd.extend(["--default", str(default)])
    return _cli(store, *cmd)


def fields_remove(store: str | Path, model: str, field_name: str) -> dict[str, Any]:
    return _cli(store, "fields", "remove", model, field_name)


def validate(store: str | Path, model: str) -> dict[str, Any]:
    return _cli(store, "validate", model, with_json=True)


def promote(store: str | Path, model: str) -> dict[str, Any]:
    return _cli(store, "validate", "--promote", model, with_json=True)