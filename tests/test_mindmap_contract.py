import importlib.util
import json
import sys
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
sys.path.insert(0, str(MINDMAP))

_spec = importlib.util.spec_from_file_location("kb_contract", MINDMAP / "contract.py")
contract = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(contract)

FIXTURE = MINDMAP / "fixtures" / "kb-small.json"


def _validate(spec):
    return contract.validate(spec)


def test_fixture_represents_small_kb_without_ambiguity():
    spec = json.loads(FIXTURE.read_text(encoding="utf-8"))
    assert _validate(spec) is spec
    assert spec["version"] == 1


def test_rejects_unsupported_version():
    try:
        _validate({"version": 99})
    except ValueError as exc:
        assert "Versión" in str(exc)
    else:
        raise AssertionError("expected version rejection")


def test_rejects_duplicated_doc_id():
    try:
        _validate({"documents": [
            {"id": "a", "model": "M", "payload": {"title": "x"}},
            {"id": "a", "model": "M", "payload": {"title": "y"}},
        ]})
    except ValueError as exc:
        assert "duplicado" in str(exc)
    else:
        raise AssertionError("expected duplicate rejection")


def test_rejects_document_without_title():
    try:
        _validate({"documents": [{"id": "a", "model": "M", "payload": {}}]})
    except ValueError as exc:
        assert "title" in str(exc)
    else:
        raise AssertionError("expected title rejection")


def test_rejects_bad_view_positions():
    try:
        _validate({"view": {"positions": {"a": {"x": "left"}}}})
    except ValueError as exc:
        assert "numérico" in str(exc)
    else:
        raise AssertionError("expected position rejection")


def test_rejects_ref_class_name_mismatch():
    try:
        _validate({"models": [{"name": "Board", "ref": "some.module:Other"}]})
    except ValueError as exc:
        assert "no coincide" in str(exc)
    else:
        raise AssertionError("expected ref mismatch rejection")


def test_rejects_unknown_reference_kind():
    try:
        _validate({"models": [{"name": "Board", "fields": [{"name": "title", "type": "str"}],
                               "references": [{"field": "r", "kind": "weird"}]}]})
    except ValueError as exc:
        assert "referencia" in str(exc).lower()
    else:
        raise AssertionError("expected reference kind rejection")


def test_model_requires_fields_or_ref():
    try:
        _validate({"models": [{"name": "Board"}]})
    except ValueError as exc:
        assert "fields" in str(exc)
    else:
        raise AssertionError("expected fields requirement")

def test_rejects_reference_with_empty_field_and_bad_kind():
    base = {"models": [{"name": "Board", "fields": [{"name": "title", "type": "str"}]}]}
    try:
        _validate({**base, "models": [{**base["models"][0], "references": [{"field": "", "kind": "list"}]}]})
    except ValueError as exc:
        assert "campo inválido" in str(exc)
    else:
        raise AssertionError("expected empty-field rejection")
    try:
        _validate({**base, "models": [{**base["models"][0], "references": [{"field": "x", "kind": "weird"}]}]})
    except ValueError as exc:
        assert "inválido" in str(exc)
    else:
        raise AssertionError("expected kind rejection")


def test_rejects_reference_to_undeclared_field_and_model():
    model = {"name": "Board", "fields": [{"name": "title", "type": "str"}]}
    try:
        _validate({"models": [{**model, "references": [{"field": "missing", "kind": "list"}]}]})
    except ValueError as exc:
        assert "no declarado" in str(exc)
    else:
        raise AssertionError("expected undeclared field rejection")
    try:
        _validate({"models": [{**model, "references": [{"field": "title", "kind": "list", "target_model": "Nowhere"}]}]})
    except ValueError as exc:
        assert "no declarado" in str(exc)
    else:
        raise AssertionError("expected undeclared target model rejection")
