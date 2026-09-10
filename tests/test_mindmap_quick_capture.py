"""La captura rápida debe producir payloads válidos para SLDB.

Espejo Python de ``defaultsFor``/``quickPayload`` del frontend: con los defaults
reales que expone el adaptador, cualquier modelo del store debe aceptar un
payload con solo título. Si un modelo requiriera algo más, el usuario vería el
error 422 al guardar: este test lo detecta antes.
"""
import importlib.util
import re
import sys
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
sys.path.insert(0, str(MINDMAP))

_spec = importlib.util.spec_from_file_location("sldb_adapter", MINDMAP / "sldb_adapter.py")
adapter_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(adapter_mod)
SldbAdapter = adapter_mod.SldbAdapter

DEV_STORE = Path(__file__).parents[1] / ".sldb"


def slugify(value):
    return re.sub(r"[^-a-z0-9]+", "-", value.lower()).strip("-") or "nuevo-documento"


def quick_payload(descriptor, title, doc_id):
    payload = {}
    for field in descriptor["fields"]:
        name, kind = field.get("name", field.get("id")), field["kind"]
        if name == "id":
            payload[name] = doc_id
        elif "default" in field:
            payload[name] = field["default"]
        elif kind == "enum":
            payload[name] = (field.get("enum") or [""])[0]
        elif kind in ("stringlist", "list", "enumlist"):
            payload[name] = []
        elif kind == "boolean":
            payload[name] = False
        elif kind == "object":
            payload[name] = {}

        else:
            payload[name] = ""
    title_field = "name" if any(f.get("name") == "name" for f in descriptor["fields"]) else "title"
    payload[title_field] = title
    if "title" not in payload and "name" not in payload:
        payload["title"] = title
    return payload


def test_quick_capture_payload_passes_sldb_roundtrip():
    if not DEV_STORE.exists():
        import pytest
        pytest.skip("no dev store available")
    adapter = SldbAdapter(DEV_STORE)
    failures = []
    for descriptor in adapter.schema():
        doc_id = "qc-" + slugify(descriptor["id"]).lower()
        payload = quick_payload(descriptor, "Captura rápida de prueba", doc_id)
        valid, details = adapter.validate_payload(descriptor["id"], payload)
        if not valid:
            failures.append((descriptor["id"], str(details)[:120]))
    assert not failures, f"Modelos que rechazan la captura rápida: {failures}"