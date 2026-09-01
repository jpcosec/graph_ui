# Code Context

Recon of sldb worktree `/home/jp/proyectos/hum-ecosystem/tools/iso-lab/worktrees/sldb`.
Goal: how to add a NEW content-blind `Relation` StructuredNLDoc model + a `RelationType` spec model.

> Key fact: sldb is **content-blind**. The store treats `model_type` as opaque; a model is
> just a `StructuredNLDoc` subclass discovered via `module:ClassName` refs. There is NO central
> hard-coded registry to edit. You author a model class, then register it into a store with
> `sldb models add <module:ClassName>`. `RelationType` (a "spec model") is just another
> `StructuredNLDoc` subclass — sldb has no separate "spec model" concept; you model it the same way.

## Files Retrieved
1. `src/sldb/models/structured_doc.py` (lines 1-45) — base class `StructuredNLDoc`, `__template__`, `__compositions__`, subclass validation.
2. `src/sldb/__init__.py` (lines 1-18) — public re-exports (`StructuredNLDoc`).
3. `src/sldb/cli/model_utils.py` (lines 1-52) — `resolve_model_ref` and `registered_model` (discovery).
4. `src/sldb/runtime/validation.py` (lines 1-60) — `Validator`, `extract_model_data`, roundtrip validation, rendering.
5. `src/sldb/store/codec.py` (lines 1-14) + `src/sldb/store/runtime_codec.py` (lines 1-10) — `StoreCodec` protocol / `RuntimeCodec` default.
6. `src/sldb/store/semantic_tags.py` (lines 1-25) — `flatten_model_semantics` (turns `__semantics__` into tag list).
7. `src/sldb/cli/serve/routes.py` (lines 1-110) — `/health`, `/schema`, `/graph`, `/save`, `/kgdb/snapshot` dispatch.
8. `src/sldb/cli/serve/schema.py` (lines 1-70) — `schema_models` builds `/schema` from store model entries + `model_fields`.
9. `src/sldb/store/query.py` (lines 21-42) — `load_runtime_documents` / `_load_doc` (feeds `/graph`).
10. `src/sldb/cli/commands/model_add.py` (lines 1-70) — `sldb models add` registration flow.
11. `src/sldb/store/models/model_entry.py` (lines 1-10) — `ModelEntry` schema (has `family`, `semantics`).
12. `src/sldb/cli/commands/models_create.py` (lines 1-60) — code generator for new models (`__family__`, `__semantics__`, `__template__`).
13. `desk/models.py` (lines 1-130) — real multi-model example file (`DeskStandardsDoc`, `DeskSpecDoc`, `InboxNoteDoc`).
14. `src/sldb/examples/reference_bundle/guide_model.py` (lines 1-96) — canonical marker reference model.
15. `tests/test_standalone.py` (lines 26-130) — model-definition test patterns.
16. `tests/store/test_cli_store.py` (lines 14-49) — `SimpleBook` model + `_init/_model_add/_doc_track` helpers.
17. `tests/test_serve.py` (lines 16-80) — serve endpoint test using a real store.

## Key Code

### Base class — `src/sldb/models/structured_doc.py`
```python
class StructuredNLDoc(BaseModel):
    __template__: str = ""
    __compositions__: dict[str, dict[str, Any]] = {}

    @classmethod
    def __pydantic_init_subclass__(cls, **kwargs):
        super().__pydantic_init_subclass__(**kwargs)
        if cls is StructuredNLDoc: return
        # HARD RULE: every pydantic field MUST have a non-empty description
        missing = sorted(n for n, i in cls.model_fields.items()
                         if not i.description or not i.description.strip())
        if missing: raise TypeError(f"{cls.__name__} fields must define a non-empty description: ...")
```
- `__template__` is the reversible-markdown template using markers `⸢rev•field⸥`, `⸢rev,list•field⸥`,
  `⸢rev,dict•field⸥`, `⸢rev,table[cols]•field⸥`, `⸢optrev•field⸥`, `⸢render•field⸥`, `⸢py•expr⸥`, `{{ jinja }}`.
- `__semantics__` and `__family__` are **NOT declared on the base class** — they are optional class
  attributes read via `getattr(...)`. `__semantics__` is consumed by `flatten_model_semantics`
  (`store/semantic_tags.py`); `__family__` maps to `ModelEntry.family` (grouping). Neither is required.
- `__compositions__` = optional feature to inline-render referenced child docs; ignore for Relation/RelationType.

### `__semantics__` → tags — `src/sldb/store/semantic_tags.py`
```python
def flatten_model_semantics(model_type: type) -> list[str]:
    tags = []
    for k, v in (getattr(model_type, "__semantics__", {}) or {}).items():
        if isinstance(v, str): tags.append(f"{k}.{v}")
        elif isinstance(v, (list, tuple)): tags.extend([".".join([k, *map(str, v)])] if v else [])
        elif isinstance(v, dict): ...
    return sorted(set(t for t in tags if t))
```
Shape used in real models (`desk/models.py`): `__semantics__ = {"type": ["desk","spec"], "workspace": ["desk","governance"]}`.

### Discovery / registry — `src/sldb/cli/model_utils.py`
```python
def resolve_model_ref(model_ref: str, pythonpath: str | None = None) -> type[StructuredNLDoc]:
    if ":" not in model_ref: raise SLDBModelError("Model reference must use the form 'module:ClassName'.")
    _setup_sys_path(pythonpath)
    module_name, attr_path = model_ref.split(":", 1)
    obj = _import_module_attr(module_name, attr_path)
    if not isinstance(obj, type) or not issubclass(obj, StructuredNLDoc):
        raise SLDBModelError(f"'{model_ref}' is not a StructuredNLDoc subclass.")
    return obj

def registered_model(store_path, model_name, pythonpath):
    idx = load_store_index(store_path)
    entry = next((m for m in idx.models if m.name == model_name), None)
    if entry: return resolve_model_ref(entry.model_ref, pythonpath), entry, idx
    ... # federated fallback
```
There is **no hardcoded model list**. "Registration" = an entry in the store index (`load_store_index(...).models`),
added by `sldb models add`. Each entry is a `ModelEntry`.

### Store registration — `src/sldb/cli/commands/model_add.py` + `store/models/model_entry.py`
```python
class ModelEntry(BaseModel):
    name: str; model_ref: str; path: str; models_index: str
    version: int = 1; canonical: bool = False
    family: str | None = None
    semantics: list[str] = Field(default_factory=list)
```
`add_model(args)`: resolves the ref, checks not already registered, writes a `ModelsIndex` +
empty `DocumentsIndex`, appends a `ModelEntry`, rebuilds semantic indexes, cascades hashes.
CLI: `sldb models add <module:ClassName> --store <path> --pythonpath <src>`.

### Extraction / codec — `runtime/validation.py`, `store/codec.py`, `store/runtime_codec.py`
```python
def extract_model_data(m, md) -> dict: return Validator(m).extract(md)
# Validator.extract: AST split -> template recipes -> DataExtractor.extract_values -> model_type(**data).model_dump
```
```python
class RuntimeCodec:  # default_codec
    def extract(self, model_type, markdown_text) -> dict:
        from sldb.runtime.validation import extract_model_data
        return extract_model_data(model_type, markdown_text)
```
A new model needs no codec changes — the default codec works for any `StructuredNLDoc`.

### `sldb serve` — `src/sldb/cli/serve/routes.py`
```python
handlers = {
  "/health": health_payload,
  "/schema": lambda *_: {"models": schema_models(store_path, pythonpath)},
  "/graph":  lambda *_: {"documents": graph_documents(store_path, pythonpath)},
  "/kgdb/snapshot": lambda *_: export_kgdb_semantic_payload(...),
}
# POST /save -> save_document -> save_payload(runtime_doc, payload, ...)
```
- `/schema` (`serve/schema.py::schema_models`) iterates `load_store_index(store_path).models`,
  resolves each ref, emits `{id, model_ref, fields:[{name,kind,required,enum?}]}` from `model_type.model_fields`.
- `/graph` (`serve/routes.py::graph_documents` -> `store/query.py::load_runtime_documents`) loads each
  registered model's docs, decoding with `default_codec`, returns `{id, model_name, path, payload, semantic_tags}`.
- A NEW model surfaces automatically once `sldb models add` registers it — no serve code changes needed.
  `field_kind` in `schema.py` maps types: str→string, bool→boolean, int→integer, list[str]→stringlist,
  Enum→enum, list[Enum]→enumlist, dict→object. (Relevant if Relation fields use enums/lists.)

### Data flow (graph)
`serve GET /graph` → `load_runtime_documents(store_path, resolve_model_ref, pythonpath)` →
for each `ModelEntry` in store index: `resolve_model_ref` → load its `documents_index` →
`_load_doc` → `codec.extract(model_type, text)` = `extract_model_data` → `RuntimeDocument.payload`.

## Best copy templates

### Multi-model file (recommended layout) — `desk/models.py`
Contains 3 models in one module. Copy `DeskSpecDoc` for `RelationType` (spec) and a small one for `Relation`:
```python
from pydantic import Field
from sldb import StructuredNLDoc

class DeskSpecDoc(StructuredNLDoc):
    __semantics__ = {"type": ["desk","spec"], "workspace": ["desk","governance"]}
    __template__ = """# ⸢rev•title⸥

## Product Goal

⸢rev,markdown•product_goal⸥
...
"""
    title: str = Field(description="Spec title shown as the H1 heading.")
    product_goal: str = Field(description="Markdown section stating the product or delivery goal.")
    ...
```
`InboxNoteDoc` (same file) shows frontmatter + `Literal[...]` enum fields + `rev,markdown` body:
```python
    __template__ = """---
kind: ⸢rev•kind⸥
status: ⸢rev•status⸥
---

# ⸢rev•title⸥

⸢rev,markdown•body⸥
"""
    kind: Literal["unclear","suggestion"] = Field(description="...")
    status: Literal["open","closed"] = Field(description="...")
    title: str = Field(description="...")
    body: str = Field(description="...")
```

### Simplest possible — `tests/store/test_cli_store.py`
```python
class SimpleBook(StructuredNLDoc):
    __template__ = "# ⸢rev•title⸥"
    title: str = Field(description="Book title.")
```

**Content-blind note:** "content-blind" for a `Relation` means the template should carry structural fields
(e.g. `subject`, `predicate`/`relation_type`, `object`, maybe `notes`) via `⸢rev•...⸥` markers without
depending on any specific domain content. Use scalar `rev•` markers for the ref fields and optionally a
frontmatter block. `RelationType` (spec) can carry `name`, `description`, `domain`, `range`, `cardinality`,
etc. Both are just `StructuredNLDoc` subclasses; no special base class exists.

## Tests

Test files live in `tests/` (models/validation) and `tests/store/` (store/CLI). Relevant:
- `tests/test_standalone.py` — defines inline `StructuredNLDoc` subclasses and asserts extraction/render roundtrip; use for pure model tests (`extract_model_data`, `render_model_markdown`, `validate_model_input_roundtrip`).
- `tests/store/test_cli_store.py` — `_init/_model_add/_doc_track` helpers + `SimpleBook`; pattern for registering a model into a store and tracking a doc.
- `tests/test_serve.py` — spins a real store + `ThreadingHTTPServer`, asserts `/schema`, `/graph`, `/save` payloads. Copy `test_serve_endpoints_use_real_store` to assert your new model surfaces in `/schema` and `/graph`.

Pattern to add a model test (standalone):
```python
class RelationDoc(StructuredNLDoc):
    __template__ = "# ⸢rev•title⸥\n\n⸢rev•subject⸥ ⸢rev•relation_type⸥ ⸢rev•object⸥"
    title: str = Field(description="...")
    subject: str = Field(description="...")
    relation_type: str = Field(description="...")
    object: str = Field(description="...")

def test_relation_roundtrip():
    md = render_model_markdown(RelationDoc, {...})
    assert extract_model_data(RelationDoc, md) == {...}
    ok, _ = validate_model_input_roundtrip(RelationDoc, md)
    assert ok
```

## Architecture
Models are plain Pydantic `StructuredNLDoc` subclasses with a `__template__` reversible-markdown string and
optional `__semantics__`/`__family__` class attrs. They live in any importable module (project convention:
`docs/models.py`, `desk/models.py`, `examples/*/`). The CLI never hardcodes model identities; it resolves
`module:ClassName` refs via `resolve_model_ref`. A store gains a model through `sldb models add`, which writes
a `ModelEntry` into the store index and a per-model `ModelsIndex`/`DocumentsIndex`. Extraction is done by the
content-blind `default_codec` (`RuntimeCodec` → `extract_model_data` → `Validator`). `sldb serve` reads the
store index at request time, so `/schema` and `/graph` reflect any registered model automatically; `/save`
re-renders payload back to markdown via `save_payload`. No dispatcher/registry file must be edited to add a model.

## Start Here
Open `desk/models.py` — it is the closest real template (multiple `StructuredNLDoc` models, `__semantics__`,
frontmatter, `Literal` enums, `rev,markdown` fields) to copy `Relation` and `RelationType` from. Then define the
two classes in a new/existing models module and register with `sldb models add <module:Relation>` /
`<module:RelationType>`. Cross-check field-shape rules in `src/sldb/models/structured_doc.py` (every field needs a
non-empty description) and marker syntax in `src/sldb/examples/reference_bundle/guide_model.py`.

## Supervisor coordination
Not blocked; no decision needed. Read-only recon complete — nothing written to the sldb repo.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Reported concrete file paths and line ranges for base class (src/sldb/models/structured_doc.py), discovery (src/sldb/cli/model_utils.py resolve_model_ref), registration (src/sldb/cli/commands/model_add.py, store/models/model_entry.py), serve endpoints (src/sldb/cli/serve/routes.py + schema.py), extraction/codec (runtime/validation.py, store/codec.py, store/runtime_codec.py), copy templates (desk/models.py, tests/store/test_cli_store.py), and test patterns (tests/test_standalone.py, tests/test_serve.py)."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [],
  "validationOutput": [
    "Read-only recon; no commands executed against the sldb repo."
  ],
  "residualRisks": [
    "sldb has no separate 'spec model' concept: RelationType is modeled as a plain StructuredNLDoc subclass; if a distinct spec semantics/family is desired, it must be expressed via __semantics__/__family__ conventions.",
    "'content-blind' Relation must express structural ref fields via rev markers; ensuring extraction roundtrip for non-scalar (list/dict/table) fields needs test coverage.",
    "Every pydantic field requires a non-empty description or subclass construction raises TypeError (enforced in __pydantic_init_subclass__).",
    "Registration is per-store via `sldb models add`; the model surfaces in /schema and /graph only after registration, not merely by defining the class."
  ],
  "noStagedFiles": true,
  "diffSummary": "No repo changes; wrote recon findings to desk/drawer/recon-sldb-relation.md only.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "No central model registry exists to edit. To add Relation/RelationType: (1) author two StructuredNLDoc subclasses in an importable module (copy desk/models.py shape), (2) give every field a non-empty Field(description=...), (3) run `sldb models add <module:Relation>` and `<module:RelationType>` with --store/--pythonpath, (4) they auto-surface in serve /schema and /graph. Optional code-gen: `sldb models create` (src/sldb/cli/commands/models_create.py) can scaffold from a template+fields YAML."
}
```
