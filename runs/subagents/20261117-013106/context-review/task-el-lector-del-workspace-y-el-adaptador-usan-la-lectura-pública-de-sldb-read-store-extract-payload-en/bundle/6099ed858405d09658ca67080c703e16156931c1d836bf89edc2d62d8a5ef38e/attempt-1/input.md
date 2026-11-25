FILE:desk/tasks/task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en.md
---
sldb:
  by: agent
  at: '2026-11-17T01:28:40Z'
  authority: generated
  via: save_document_payload
id: task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- desk/inbox/20261116-073057-suggestion-sldb-api-read-store-store-is-prepared-y-extract-payload-lectura-p-blica-sin-migrar.md
- ../../sldb/src/sldb/api/stores/read_store.py
- ../../sldb/src/sldb/api/documents/extract_payload.py
- ../../sldb/docs/architecture/store-declaration.md
depends_on:
- task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/persistence.py
- tests/deskops_viewdocs.py
- tests/test_mindmap_workspace_explorer.py
- pyproject.toml
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# El lector del workspace y el adaptador usan la lectura pública de sldb (read_store, extract_payload) en vez de módulos internos

## Rationale

_Explain why this task exists or the business driver behind it._

sldb publicó en sldb.api (commits f515d91c y 336cde87 de sldb main; nota del inbox de graph_ui 20261116-073057) una lectura pública que no migra: read_store(store) -> StoreLocation abre una operación fresca de solo lectura (re-barre la caché runtime y el hash de documentos, así ve altas y bajas de otros procesos) y lanza SLDBStoreError 'store not prepared: run `sldb stores update`' si el layout no es canónico; store_is_prepared(store) -> bool; extract_payload(model_type, markdown) -> dict. graph_ui todavía importa internos de sldb para lo mismo: sldb.store.runtime_cache_signature.new_operation (frontends/mindmap/sldb_adapter.py, método refresh_for_concurrent_sessions) y sldb.runtime.validation.extract_model_data (frontends/mindmap/workspace_routes.py, método _extract_payload, y tests/deskops_viewdocs.py). Esos módulos no son contrato y pueden cambiar sin aviso.

## Goal

_Describe the concrete result this task must produce._

Ningún archivo .py bajo frontends/ ni tests/deskops_viewdocs.py importa sldb.store.runtime_cache_signature ni el nombre extract_model_data (el único import restante de sldb.runtime.validation es render_model_markdown/validate_model_input_roundtrip en sldb_adapter.py, sin equivalente público); las lecturas usan sldb.api.read_store y sldb.api.extract_payload, y un listado GET del workspace sobre un store sin preparar responde 503 con el texto de sldb ('store not prepared: run `sldb stores update`') en vez de migrar el store.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py, método refresh_for_concurrent_sessions (línea ~371): 'from sldb.store.runtime_cache_signature import new_operation; new_operation(self.store)' pasa a 'from sldb.api import read_store; read_store(self.store)' (read_store hace ese new_operation y además el de documents_hash). (2) frontends/mindmap/workspace_routes.py: (a) _extract_payload (línea ~183) usa sldb.api.extract_payload(model_type, text) en lugar de sldb.runtime.validation.extract_model_data, mismo valor devuelto; (b) _fresh_listing (línea ~164), el único punto del módulo que abre el store en un GET (open_store(self.store_path, mode='readonly')), pasa a read_store(self.store_path); su docstring se reescribe: read_store no migra. Si read_store lanza SLDBStoreError con 'store not prepared', _fresh_listing la convierte en WorkspaceError(<mensaje de sldb>, 503, 'store_no_preparado') (WorkspaceError(mensaje, status, código) ya existe en el módulo; el 503 es el mismo estado que hoy da 'El store no está disponible.'). Las escrituras no cambian. (3) frontends/mindmap/persistence.py: solo el comentario de la línea ~74 que cita new_operation pasa a citar read_store. (4) docstrings y comentarios de workspace_routes.py que citan extract_model_data u open_store en la lectura pasan a citar extract_payload y read_store. (4b) tests/deskops_viewdocs.py línea 14 y 27: extract_model_data -> sldb.api.extract_payload. (5) tests/test_mindmap_workspace_explorer.py: una prueba nueva junto a test_refresh_path_has_no_sldb_store_import que recorre con ast (imports estáticos, como la existente) todos los .py de frontends/ y falla si alguno importa sldb.store.runtime_cache_signature o el nombre extract_model_data de sldb.runtime.validation; y una prueba de que GET /api/workspace/nodes sobre un store con layout no canónico responde 503 con 'store not prepared' y no cambia ningún archivo del store. (6) pyproject.toml: no cambia (sldb sigue en 0.1.13 en su pyproject; no hay versión nueva que exigir). NO ENTRA: el import de render_model_markdown y validate_model_input_roundtrip desde sldb.runtime.validation en frontends/mindmap/sldb_adapter.py línea 31 (sldb.api no tiene equivalente público; se pidió a sldb por inbox y queda para otra tarea); cambiar sldb; frontends/desk; las rutas de escritura.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) grep -rnE 'runtime_cache_signature|runtime\.validation|extract_model_data|open_store' frontends tests/deskops_viewdocs.py para fijar la lista real. 2) Reemplazar los imports como dice el alcance (import directo desde sldb.api, sin envolver). 3) Para (4), revisar las rutas GET de workspace_routes.py que abren el store; read_store acepta la misma ruta .sldb. 4) Agregar la prueba de (5) con ast, igual que la existente. 5) Correr la validación. Requisito previo: el sldb instalado debe contener f515d91c (python -c 'from sldb.api import read_store, extract_payload, store_is_prepared'); la CI instala sldb@main de GitHub, así que el push necesita f515d91c en origin/main de sldb (git -C ../../sldb branch -r --contains f515d91c).

## Validation

_List the checks required before this task can close._

- python -c "from sldb.api import read_store, extract_payload, store_is_prepared"
- ! grep -rnE "runtime_cache_signature|extract_model_data" frontends tests/deskops_viewdocs.py --include=*.py
- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py tests/test_desk_ui_routes.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py
- git -C ../../sldb branch -r --contains f515d91c

## Done When

_Name the observable condition that makes the task complete._

El grep de la validación no devuelve nada; las pruebas de la validación pasan, incluidas las dos nuevas (imports por ast en frontends/ y el 503 'store not prepared' sin escrituras); el sldb instalado contiene f515d91c. Para el push, f515d91c debe estar en origin/main de sldb (la CI instala sldb@main): si no lo está, el commit queda local y el coordinador avisa.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
---
# pill-xxx
id: pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:runtime
---

# Guardrail: no mocks, no stubs, no fake data in deliverables

## What

_Define the context or guardrail this pill carries._

A hard prohibition on mock/stub/fake/placeholder implementations in any code an executor delivers. This includes: returning hardcoded fake values instead of real computation, leaving TODO/FIXME stubs in place of logic, fabricated sample data standing in for real data flow, no-op functions pretending to work, commented-out real logic replaced by a shortcut, or tests that assert against invented data instead of the real contract.

## Why

_Explain why this context matters for safe execution._

This ecosystem treats deliverables as production truth. A mock silently breaks the nucleus tesis (real typed data flowing sldb -> sldb.api.graph -> overlay). Mocks pass shallow checks while leaving the contract unimplemented, causing false-green closeouts and drift that surfaces much later. Real wiring is the only acceptable evidence a task is done.

## When

_Describe when an agent should apply this pill._

Applied to every executor and tester dispatch, at all times, for every task. There is no exception where a mock is acceptable as a final deliverable. If real data or a real dependency is genuinely unavailable, the executor must STOP and report the blocker, not paper over it with a mock.

## Where

_Name the files, surfaces, or scope this pill applies to._

All implementation code under apps/, scripts/, src/, and any generated artifacts. Applies to graph_ui and every downstream instance.

## How

_Describe the correct way to apply this guidance._

Wire the real dependency. Derive values from the real source (real model descriptor, real store, real generator output). If a build artifact is needed, generate it with the real generator and commit the real output. Tests must validate the real contract against real generated output, not against inlined fixtures that duplicate the expected answer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not stub a function to return a constant. Do not inline fake node-type definitions to make a test pass. Do not write a test whose expected value is a copy-paste of a hardcoded literal that bypasses the generator. Do not leave TODO placeholders where logic belongs. Do not fabricate data to simulate a data source.

FILE:frontends/mindmap/sldb_adapter.py
"""Adaptador único para las operaciones de SLDB usadas por el Mindmap.

Por dentro delega en ``pron.world.store.Store`` — "la única puerta a sldb" (pron
spec 12 §4) — en vez de reimplementar el CRUD/schema contra las clases del CLI de
SLDB a mano. Se mantienen dos excepciones deliberadas, documentadas donde ocurren:
``serialize()`` (función pura sobre objetos que ``Store.docs()`` ya devolvió, no es
acceso a store) y ``resolve_ref``/``validate_ref`` (resuelven un ref arbitrario con
un ``pythonpath`` arbitrario *antes* de que el modelo esté registrado en ningún
store; ``pron.Store`` no tiene equivalente porque siempre resuelve a través de un
modelo ya registrado).

Regla: ninguna regla de validación, hash, tracking o reindexación se duplica en
graph_ui; todo pasa por estas funciones.

Los imports de pron son perezosos (dentro de ``__init__``): este módulo solo se usa
en modo local; el modo remote de ``serve.py`` habla HTTP con sldb serve y no debe
tocar pron.
"""
from __future__ import annotations

import hashlib
import json
import threading
from enum import Enum
from pathlib import Path
from typing import Any

from sldb.cli.model_utils import resolve_model_ref
from sldb.cli.serve.routes import serialize_document
from sldb.cli.store_context import get_store_context
from sldb.runtime.validation import render_model_markdown, validate_model_input_roundtrip

VIEW_FILENAME = "mindmap-view.json"
QUICK_CAPTURE_TITLE = "Captura rápida"


def id_prefix_candidate(model_name: str) -> str:
    """Prefijo de id que se prueba cuando un modelo rechaza el id sin prefijo.

    Convención de los modelos de deskops (``AtomDoc`` -> ``atom-``, ``CrossroadDoc`` ->
    ``crossroad-``). Es solo un candidato: el validador real del modelo decide si vale.
    """
    base = model_name[:-3] if model_name.endswith("Doc") else model_name
    return f"{base.lower()}-"


def quick_payload(fields: list[dict[str, Any]], id_prefix: str = "") -> dict[str, Any]:
    """Espejo de ``defaultsFor``/``quickPayload`` (shared/documents.mjs): título + defaults."""
    payload: dict[str, Any] = {}
    for field in fields:
        name, kind = field.get("name", field.get("id")), field.get("kind")
        if "default" in field:
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
    names = {f.get("name") for f in fields}
    payload["name" if "name" in names and "title" not in names else "title"] = QUICK_CAPTURE_TITLE
    payload["id"] = f"{id_prefix}captura-rapida"
    return payload


class AdapterError(Exception):
    """Error del adaptador con código HTTP equivalente."""

    def __init__(self, message: str, status: int = 400, completed: list[str] | None = None):
        super().__init__(message)
        self.status = status
        self.completed = completed or []


class SldbAdapter:
    """Fachada de solo lectura y escritura sobre un store SLDB concreto."""

    def __init__(self, store: str | Path):
        from pron.world.store import Store
        from pron.world.store_error import StoreError

        self._store_error = StoreError
        self.store, self.root = get_store_context(str(store))
        self.pythonpath = str(self.root)
        self.view_path = self.store / "runtime" / VIEW_FILENAME
        self.lock = threading.RLock()
        self.pron = Store(root=self.root, pythonpath=self.pythonpath)

    def _pron_for(self, pythonpath: str | None) -> Store:
        """La mayoría de las llamadas usan el pythonpath del propio store; el
        compilador puede pedir uno distinto (módulos generados en otra carpeta)."""
        if pythonpath and pythonpath != self.pythonpath:
            return type(self.pron)(root=self.root, pythonpath=pythonpath)
        return self.pron

    # ---------------------------------------------------------------- schema

    def schema(self) -> list[dict[str, Any]]:
        """Schema de SLDB enriquecido con el ``default`` real de cada campo.

        La forma base viene de ``pron.Store.schema``; el default se lee por
        introspección del modelo para que la UI pueda aplicar defaults válidos
        sin duplicar reglas de SLDB.
        """
        with self.lock:
            out = []
            for entry in self.pron.store_index().models:
                try:
                    fields = self.pron.schema(entry.name)
                except Exception as exc:  # noqa: BLE001  (G1: el resto del schema sigue sirviendo)
                    # Un modelo que no se importa no tumba el schema: se informa con su error
                    # real para que la UI lo muestre en vez de "no hay specs".
                    out.append({"id": entry.name, "model_ref": entry.model_ref, "fields": [],
                                "import_error": f"{exc} ({exc.__cause__})" if exc.__cause__ else str(exc)})
                    continue
                model_dict = {"id": entry.name, "model_ref": entry.model_ref, "fields": fields}
                try:
                    model_type = self.pron.model_type(entry.name)
                except Exception:  # noqa: BLE001  (modelo no importable: schema base igual sirve)
                    out.append(model_dict)
                    continue
                # Metadatos de grafo declarados por el modelo (una sola fuente).
                model_dict["containment"] = dict(getattr(model_type, "__containment__", {}) or {})
                model_dict["references"] = list(getattr(model_type, "__references__", []) or [])
                for descriptor, (name, field) in zip(fields, model_type.model_fields.items()):
                    descriptor.setdefault("name", name)
                    if field.is_required() or descriptor.get("kind") == "enum":
                        continue
                    try:
                        default = field.get_default(call_default_factory=True)
                        descriptor["default"] = default.value if isinstance(default, Enum) else default
                    except Exception:  # noqa: BLE001
                        pass
                # La UI no ve validadores (patrones, no-vacío): se le dice si un
                # payload de solo título pasa el round-trip real, para no ofrecer
                # una captura rápida que acabaría en 422 al guardar.
                # Un modelo puede exigir un prefijo en el id (deskops: ``atom-<slug>``); si el id
                # sin prefijo no pasa, se prueba el candidato y, si el modelo lo acepta, la UI
                # recibe ``id_prefix`` para construir ids que validen.
                model_dict["quick_capture"] = False
                for prefix in ("", id_prefix_candidate(entry.name)):
                    try:
                        valid = bool(self.validate_payload(entry.name, quick_payload(fields, prefix))[0])
                    except Exception:  # noqa: BLE001
                        valid = False
                    if valid:
                        model_dict["quick_capture"] = True
                        if prefix:
                            model_dict["id_prefix"] = prefix
                        break
                out.append(model_dict)
            return out

    # ---------------------------------------------------------------- lectura

    def documents(self, pythonpath: str | None = None) -> list[Any]:
        return self._pron_for(pythonpath).docs()

    def graph(self) -> dict[str, Any]:
        with self.lock:
            if not self._initialized:
                return {"documents": [], **self.view()}
            return {"documents": [self.serialize(d) for d in self.documents()], **self.view()}

    @property
    def _initialized(self) -> bool:
        """Un store sin ``core/store_index.yaml`` todavía no tiene KB: es el
        estado inicial válido que muestra la UI como 'Tu KB está vacía'."""
        return (Path(self.store) / "core" / "store_index.yaml").exists()

    @staticmethod
    def serialize(doc: Any) -> dict[str, Any]:
        return serialize_document(doc)

    def find(self, name: str, pythonpath: str | None = None) -> Any | None:
        return next((d for d in self.documents(pythonpath) if d.name == name), None)

    def model_names(self) -> set[str]:
        return set(self.pron.model_names())

    def model_refs(self) -> dict[str, str]:
        """Mapa nombre -> ref de los modelos registrados en el store."""
        return {m.name: m.model_ref for m in self.pron.store_index().models}

    def export_models(self) -> list[dict[str, Any]]:
        """Preserve inline declarations; external classes keep their import refs."""
        result = []
        for name, ref in self.model_refs().items():
            model = self.model_for(name)
            declaration = getattr(model, '__mindmap_spec__', None)
            result.append(declaration or {'name': name, 'ref': ref})
        return result

    def document_ir(self, name: str) -> dict[str, Any]:
        """Un documento con su IR de lectura, mismo shape que ``GET /document`` de
        sldb serve: ``{id, model_name, path, payload, semantic_tags, ir}``.

        El IR se construye con el MISMO builder de sldb (``sldb.api.build_document_ir_json``,
        el de ``sldb sections show`` y del endpoint /document remoto): graph_ui no
        reimplementa el parsing de markdown. En el IR viven las secciones reales
        (``structure``), el direccionamiento de campos (``nodes[].field_path``) y
        los spans de línea (``node.span.line_start/line_end``).

        Errores espejando sldb serve: doc inexistente → 404; IR no construible
        (modelo no resoluble, roundtrip roto) → 422.
        """
        # Local-only (imports diferidos): el modo remote ya sirve /document vía
        # proxy HTTP y no debe cargar esto.
        from sldb.api import build_document_ir_json
        from sldb.api.records.resolve import resolve_runtime_doc

        with self.lock:
            try:
                runtime_doc = resolve_runtime_doc(str(self.store), name, self.pythonpath)
            except Exception as exc:  # noqa: BLE001  (ValueError: doc inexistente/ambiguo)
                raise AdapterError(str(exc), 404) from exc
            try:
                markdown = Path(runtime_doc['absolute_path']).read_text(encoding='utf-8')
                ir = build_document_ir_json(runtime_doc, markdown, runtime_doc.get('template'))
            except Exception as exc:  # noqa: BLE001  (modelo no resoluble, roundtrip roto)
                raise AdapterError(str(exc), 422) from exc
            return {
                'id': runtime_doc['name'],
                'model_name': runtime_doc['model'],
                'path': runtime_doc['path'],
                'payload': runtime_doc['payload'],
                'semantic_tags': runtime_doc.get('semantic_tags', []),
                'ir': ir,
            }

    def notation_view(self, spec_ref: str) -> dict[str, Any]:
        """Vista resuelta de un ``SpecDoc`` según su ``NotationDoc``.

        El contrato de notación tiene un único intérprete,
        ``sldb.api.notations.resolve_view``: graph_ui no casa glifos ni evalúa
        ``where``, solo dibuja lo que devuelve.
        Errores: spec inexistente → 404; datos de notación incoherentes → 422.
        """
        from sldb.api.notations import ViewError, resolve_view

        ref = spec_ref if ":" in spec_ref else f"SpecDoc:{spec_ref}"
        with self.lock:
            try:
                return resolve_view(str(self.store), ref, self.pythonpath)
            except ViewError as exc:
                missing = str(exc).startswith(f"{ref} is not in the store")
                raise AdapterError(str(exc), 404 if missing else 422) from exc

    def model_for(self, model_name: str, pythonpath: str | None = None):
        return self._pron_for(pythonpath).model_type(model_name)

    # ------------------------------------------------------------- validación

    def validate_payload(self, model_name: str, payload: dict[str, Any], pythonpath: str | None = None) -> tuple[bool, Any]:
        """Valida un payload contra el modelo real (round-trip de SLDB). No escribe."""
        model = self.model_for(model_name, pythonpath)
        rendered = render_model_markdown(model, payload)
        return validate_model_input_roundtrip(model, rendered)

    @staticmethod
    def resolve_ref(ref: str, pythonpath: str | None = None):
        """Resolve a model reference without opening or changing a store."""
        try:
            return resolve_model_ref(ref, pythonpath)
        except Exception as exc:  # noqa: BLE001  (SLDBModelError, ImportError…)
            raise AdapterError(f"No se pudo resolver el modelo {ref!r}: {exc}") from exc

    @staticmethod
    def validate_ref(ref: str, payload: dict[str, Any], pythonpath: str | None = None) -> tuple[bool, Any]:
        """Valida un payload resolviendo el modelo por ref, sin store.

        Permite prevalidar contratos completos antes de registrar cualquier
        modelo: la garantía de "un error de validación no confirma cambios
        parciales" exige resolver y validar sin escribir. Un ref imposible de
        importar lanza ``AdapterError``; un payload inválido se reporta como
        ``(False, detalles)``.
        """
        model = SldbAdapter.resolve_ref(ref, pythonpath)
        try:
            rendered = render_model_markdown(model, payload)
        except Exception as exc:  # noqa: BLE001  (pydantic ValidationError: es un problema del payload)
            return False, exc
        return validate_model_input_roundtrip(model, rendered)

    # --------------------------------------------------------------- escritura

    def create_document(self, name: str, model_name: str, payload: dict[str, Any],
                        output: Path, pythonpath: str | None = None) -> None:
        """Local-only: crea vía pron (sldb api) en el store local. No tiene
        equivalente en sldb serve (en remote los creates van a ``POST /save``)."""
        # pron migró create() a DocId: `Store.create(doc_id, payload, path)`.
        from pron.world.doc_id import DocId

        try:
            self._pron_for(pythonpath).create(DocId.of(model_name, name), payload, output)
        except self._store_error as exc:
            raise AdapterError(str(exc)) from exc

    def update_document(self, runtime_doc: Any, payload: dict[str, Any],
                        pythonpath: str | None = None) -> None:
        """Local-only: replace vía pron en el store local. En remote los updates
        van a ``POST /save`` (batch, con compare contra ``expected``)."""
        # pron migró replace() a DocId: `Store.replace(doc_id, payload)`.
        from pron.world.doc_id import DocId

        try:
            self._pron_for(pythonpath).replace(
                DocId.of(runtime_doc.model_name, runtime_doc.name), payload)
        except self._store_error as exc:
            raise AdapterError(str(exc)) from exc

    def delete_document(self, name: str, pythonpath: str | None = None) -> None:
        """Local-only: destrackea en el store local (el Markdown queda en disco).
        En remote los deletes van a ``POST /save``."""
        # pron migró untrack() a DocId (necesita el modelo); se resuelve con el
        # runtime doc, que es la misma fuente que usaba el untrack por nombre.
        from pron.world.doc_id import DocId

        try:
            doc = next((d for d in self.documents(pythonpath) if d.name == name), None)
            if doc is None:
                raise self._store_error(f'El documento {name!r} no está trackeado.')
            self._pron_for(pythonpath).untrack(DocId.of(doc.model_name, doc.name))
        except self._store_error as exc:
            raise AdapterError(str(exc)) from exc

    def default_document_path(self, model_name: str, name: str, pythonpath: str | None = None) -> Path:
        """Dónde debe vivir un documento nuevo de esta clase.

        Cada store decide su propio layout, no esta UI (somos el editor de
        cualquier store pron, no solo de los que compilamos nosotros mismos):
        se reutiliza el directorio de un documento existente de la misma
        clase si ya hay uno. Una clase sin documentos todavía cae en
        ``<root>/<Clase>/``.
        """
        existing = None
        if self._initialized:
            existing = next((d for d in self.documents(pythonpath) if d.model_name == model_name), None)
        directory = self.root / Path(existing.path).parent if existing is not None else self.root / model_name
        return directory / f"{name}.md"

    def add_model(self, model_ref: str, pythonpath: str | None = None) -> None:
        """Local-only: registra un modelo en el store local vía pron. No tiene
        equivalente en sldb serve; el editor de clases en remote usa
        ``POST /models/*``."""
        if not self._pron_for(pythonpath).register_model(model_ref):
            raise AdapterError(f"No se pudo registrar el modelo {model_ref!r}.")

    def init_store(self) -> None:
        """Local-only: crea el store si no existe (KB vacía). En remote el store
        lo administra sldb serve (``/stores*``)."""
        if not (self.store / "core" / "store_index.yaml").exists():            # sldb movió la creación de store: `_create_store` en
            # `cli.commands.store_init` dejó de existir el 2026-09-20; la puerta
            # es `sldb.api.stores.init_store` (recibe la raíz del proyecto).
            from sldb.api.stores.init_store import init_store
            init_store(self.root)

    def refresh_for_concurrent_sessions(self) -> None:
        """Inicio de operación top-level sobre el store local (sldb PLAN 15
        capa 6): fuerza el re-sweep de hojas de la cache runtime del proceso
        para que el compare contra ``expected`` vea escrituras de OTROS
        procesos (sesiones concurrentes). Sin esto, una sesión concurrente
        no se detecta y el guardado pisa el cambio ajeno (vuelta 4;
        MIGRACION §2.6). Además del guard-write del store, la signature del
        adapter se re-sweipea en la próxima lectura.
        """
        from sldb.store.runtime_cache_signature import new_operation
        new_operation(self.store)

    # ------------------------------------------------------------------- vista

    def view(self) -> dict[str, Any]:
        raw = self.view_path.read_bytes() if self.view_path.exists() else b"{}"
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise AdapterError(f"El archivo de vista está corrupto: {exc}", 500) from exc
        if not isinstance(parsed, dict):
            raise AdapterError("El archivo de vista no contiene un objeto JSON.", 500)
        return {"view": parsed, "revision": hashlib.sha256(raw).hexdigest()}

    def write_view(self, view: dict[str, Any]) -> None:
        self.view_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.view_path.with_suffix(".tmp")
        temporary.write_text(json.dumps(view, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(self.view_path)


# ------------------------------------------------- vistas de proyección (cualquier store)
#
# Las vistas (mindmap.projection_views) se evalúan sobre el store que el operador elija, no solo
# el de este adaptador, así que estas funciones reciben el store. Excepción deliberada al "todo
# por pron.Store": pron no expone el índice de aristas filtrado por RelationFilter ni `where`
# sobre un payload suelto; aquí se usa la API pública de sldb (sldb.api, sldb.api.graph).


def runtime_documents(store: str | Path, pythonpath: str | None = None) -> list[Any]:
    """Todos los documentos del store (``model_name``, ``name``, ``payload``).

    Cada lectura abre el store con ``open_store``, como toda operación de sldb: empieza una
    operación nueva y los cachés de sldb se revalidan contra el disco. Sin eso, un proceso de
    larga vida (el servidor, o un test) seguía sirviendo el roster de un modelo cacheado antes de
    que otro proceso escribiera en él (visto con ViewDoc desde sldb GO04 d7eefdeb).
    """
    from sldb.api import load_runtime_documents, open_store

    return load_runtime_documents(open_store(Path(store)).store_path, pythonpath)


def where_holds(expression: str, payload: dict[str, Any]) -> bool:
    """Si un predicado ``--where`` de sldb vale sobre ``payload`` (lanza si no parsea)."""
    from sldb.api.where import where_matches

    return where_matches(expression, payload)


def relation_edges(store: str | Path, relation_types: list[str], direction: str) -> list[tuple[str, str, str, str]]:
    """(nodo, source, target, relación) de cada arista que deja pasar el RelationFilter."""
    from sldb.api.graph import RelationFilter, StructuredQuery, execute_query

    query = StructuredQuery(relations=[RelationFilter(relation_types=relation_types, direction=direction)])
    return [(n.id, e.source, e.target, e.relation)
            for n in execute_query(Path(store), query, include_linked=False) for e in n.edges]


def notation_documents(store: str | Path, notation: str, doc_refs: list[str], pythonpath: str | None = None) -> dict[str, Any]:
    """La notación de una vista aplicada a sus documentos (``Model:name``), con el único intérprete
    del contrato: ``sldb.api.notations.resolve_documents`` (glifo, forma y estilo de cada nodo,
    links y leyenda). Notación incoherente: ValueError."""
    from sldb.api.notations import ViewError, resolve_documents

    try:
        return resolve_documents(Path(store), notation, doc_refs, pythonpath=pythonpath)
    except ViewError as exc:
        raise ValueError(str(exc)) from exc


def ensure_model(store: str | Path, model: str, model_ref: str) -> None:
    """Registra ``model_ref`` en el store si ``model`` no está registrado."""
    from sldb.api import add_model, is_model_registered

    if not is_model_registered(Path(store), model):
        add_model(Path(store), model_ref)


def write_document(store: str | Path, model: str, name: str, path: Path, payload: dict[str, Any], exists: bool) -> None:
    """Crea (en ``path``) o reemplaza el documento ``model:name`` desde ``payload``."""
    from sldb.api import create_document, save_document_payload

    if exists:
        save_document_payload(Path(store), model, name, payload)
    else:
        create_document(Path(store), model, path, payload, name=name)

FILE:frontends/mindmap/persistence.py
"""SLDB-backed editor writes. Thin batch logic over the shared SldbAdapter.

All store operations, validation and index updates live in ``sldb_adapter``;
this module only orchestrates a batch: prevalidates everything, rejects stale
concurrent edits and writes in create→update→delete order.

ESTE MÓDULO ES EL MOTOR LOCAL. En modo remote (GRAPH_UI_BACKEND=remote) no se
importa: las escrituras van por HTTP a sldb serve (``serve.py``, ``_remote_save``)
y no debe quedar ningún camino que escriba semántica en el proceso local.
La ``view`` (positions/collapsed) sí es local en ambos modos: es presentación.
"""
from __future__ import annotations

import os
import re

from mindmap.sldb_adapter import AdapterError, SldbAdapter

SaveError = AdapterError


class EditorStore:
    def __init__(self, store):
        if os.environ.get('GRAPH_UI_BACKEND') == 'remote':
            raise RuntimeError(
                'EditorStore es el motor LOCAL; en modo remote las escrituras de '
                'semántica van por HTTP a sldb serve (POST /save, /models/*). '
                'Úsalo solo con GRAPH_UI_BACKEND=local.')
        self.adapter = SldbAdapter(store)
        # Una KB recién creada (sin core/store_index.yaml) se inicializa vacía:
        # la UI la muestra como 'Tu KB está vacía' y permite importar un mapa.
        self.adapter.init_store()
        self.view_path = self.adapter.view_path
        self.store = self.adapter.store
        self.root = self.adapter.root
        self.pythonpath = self.adapter.pythonpath
        # Expuesto solo para el editor de clases (serve.py); el resto de este
        # módulo sigue pasando por self.adapter.
        self.pron_store = self.adapter.pron

    def schema(self):
        return {'models': self.adapter.schema()}

    def documents(self):
        return self.adapter.documents()

    def view(self):
        return self.adapter.view()

    def graph(self):
        return self.adapter.graph()

    def document_ir(self, name):
        """Lectura con IR (secciones, field_path, spans) del store local.
        Mismo shape que ``GET /document`` de sldb serve (ver sldb_adapter)."""
        return self.adapter.document_ir(name)

    def notation_view(self, spec_ref):
        """Vista de notación de un SpecDoc, resuelta por sldb.api.notations (ver sldb_adapter)."""
        return self.adapter.notation_view(spec_ref)

    def save(self, request):
        """Prevalidate the entire batch; never acknowledge partial writes as success.

        A mid-write failure returns the refreshed graph so clients can retry only
        the outstanding changes. Optimistic comparisons reject stale documents.
        Deletions untrack documents, preserving their Markdown on disk.
        """
        adapter = self.adapter
        with adapter.lock:
            # Sesiones concurrentes: el proceso lleva cacheado el store desde el
            # arranque; una escritura de otro proceso (otra sesión, otro server)
            # NO se ve hasta que forzamos el re-sweep de hojas (sldb PLAN 15
            # capa 6, ``new_operation`` — expuesto por el adaptador). Sin esto,
            # el compare contra ``expected`` compararía contra un payload viejo
            # y pisotearía el cambio ajeno (ver MIGRACION §2.6).
            adapter.refresh_for_concurrent_sessions()
            changes = request.get('changes', [])
            if not isinstance(changes, list) or len(changes) > 500:
                raise SaveError('Lista de cambios inválida.')
            view = request.get('view', {})
            if not isinstance(view, dict):
                raise SaveError('Vista inválida.')
            if request.get('viewRevision') != adapter.view()['revision']:
                raise SaveError('El mapa cambió en otra sesión. Recarga antes de guardar.', 409)
            existing = {d.name: d for d in adapter.documents()}
            seen, prepared = set(), []
            for change in changes:
                name, action = change.get('id'), change.get('action')
                if not isinstance(name, str) or name in seen:
                    raise SaveError('Identificador duplicado o inválido.')
                seen.add(name)
                current = existing.get(name)
                if action not in ('create', 'update', 'delete'):
                    raise SaveError('Operación inválida.')
                if action == 'create':
                    if current:
                        raise SaveError(f'Ya existe el documento {name}.', 409)
                    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9_-]{0,159}', name):
                        raise SaveError('El ID nuevo solo admite letras, números, guiones y guiones bajos.')
                elif not current or current.payload != change.get('expected'):
                    raise SaveError(f'{name} cambió en SLDB. Recarga para evitar sobrescribirlo.', 409)
                if action != 'delete':
                    model_name = change.get('model')
                    if current and model_name != current.model_name:
                        raise SaveError('No se puede cambiar la clase de un documento existente.')
                    payload = change.get('payload')
                    if not isinstance(payload, dict):
                        raise SaveError(f'Contenido inválido: {name}.')
                    try:
                        valid, details = adapter.validate_payload(model_name, payload)
                        if not valid:
                            raise ValueError(str(details))
                    except (Exception, SystemExit) as exc:
                        raise SaveError(f'{name}: {exc}', 422) from exc
                    path = adapter.default_document_path(model_name, name)
                    if action == 'create' and path.exists():
                        raise SaveError(f'El archivo de {name} ya existe; elige otro ID.', 409)
                else:
                    path = None
                prepared.append((change, current, path))
            completed = []
            try:
                # ── semántica → store (create → update → delete; untrack al final) ──
                order = {'create': 0, 'update': 1, 'delete': 2}
                for change, current, path in sorted(prepared, key=lambda item: order[item[0]['action']]):
                    name, action = change['id'], change['action']
                    if action == 'create':
                        adapter.create_document(name, change['model'], change['payload'], path)
                    elif action == 'update':
                        adapter.update_document(current, change['payload'])
                    else:
                        adapter.delete_document(name)
                    completed.append(name)
                # ── presentación → archivo local de vista (nunca al store) ──
                adapter.write_view(view)
            except (Exception, SystemExit) as exc:
                raise SaveError(f'No se completó el guardado: {exc}', 500, completed) from exc
            return {'ok': True, 'saved': completed, **adapter.graph()}

FILE:tests/deskops_viewdocs.py
"""The deskops ViewDocs in a temporary desk's own store (deskops CC34).

A real desk reaches deskops' seed ViewDocs (`deskops/data/views/`) through its store's link
to the deskops store; sldb's `run_view` does not resolve a ViewDoc of a linked store yet
(sldb H9), so a test desk tracks a copy of each seed in its own store, under `views/`,
written through sldb (`add_model` + `create_document`), never by hand.
"""
from importlib.resources import files
from pathlib import Path

from sldb import api
from sldb.core.exceptions import SLDBModelError
from sldb.models.notation.view_doc import ViewDoc
from sldb.runtime.validation import extract_model_data


def install_views(root):
    root = Path(root)
    store = root / '.sldb'
    try:
        api.add_model(store, 'sldb.models.notation_models:ViewDoc', '')
    except SLDBModelError:  # already registered
        pass
    (root / 'views').mkdir(exist_ok=True)
    names = []
    for seed in sorted(p for p in files('deskops').joinpath('data', 'views').iterdir() if p.name.endswith('.md')):
        payload = ViewDoc.model_validate(extract_model_data(ViewDoc, seed.read_text(encoding='utf-8'))).model_dump()
        api.create_document(store, 'ViewDoc', root / 'views' / seed.name, payload, payload['name'], '')
        names.append(payload['name'])
    return names

FILE:tests/test_mindmap_workspace_explorer.py
"""WS13.2: explorador de documentos modelados y no modelados, y catalogo degradado.

Sin mocks ni stubs: repos git, stores sldb, desks y servidores HTTP reales en directorios
temporales. Los stores se preparan fuera del request. El modelo no importable es real: su
modulo vive en un directorio que el servidor no tiene en su ruta de importacion.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)
for _mod in list(sys.modules):
    if _mod == 'mindmap' or _mod.startswith('mindmap.'):
        del sys.modules[_mod]

import pytest
from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.operations import DeskopsOperations
from deskops.workspace import seed_desk
from mindmap import serve
from sldb.api.records.extract import extract_sections

BAD_MODEL_SRC = '''from __future__ import annotations
from pydantic import Field
from sldb.models.structured_doc import StructuredNLDoc


class Bitacora(StructuredNLDoc):
    __semantics__ = {"type": ["log"], "layer": ["notes"]}
    __template__ = """---
id: ⸢rev•id⸥
---

# ⸢rev•title⸥

## Entrada

⸢rev•entry⸥
""".strip()

    id: str = Field(description="Id.")
    title: str = Field(description="Titulo.")
    entry: str = Field(description="Entrada.")
'''

# Se ejecuta en un proceso aparte: el modulo del modelo solo existe en ese proceso.
PREPARE_SCRIPT = '''
import sys
from pathlib import Path
from sldb.api.model_registry.add_model import add_model
from sldb.api.documents.create_document import create_document
root, models = Path(sys.argv[1]), sys.argv[2]
add_model(root / '.sldb', 'ws132_bitacora:Bitacora', pythonpath=models)
create_document(root / '.sldb', 'Bitacora', 'bitacoras/b1.md',
                {'id': 'b1', 'title': 'Bitacora uno', 'entry': 'Texto de la entrada.'}, pythonpath=models)
'''


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_init(root: Path) -> None:
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)


def prepare_store(root: Path) -> DeskopsOperations:
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    return DeskopsOperations(root)


def add_bad_model(root: Path, tmp_path: Path) -> None:
    models = tmp_path / 'modelos'
    models.mkdir()
    (models / 'ws132_bitacora.py').write_text(BAD_MODEL_SRC, encoding='utf-8')
    res = subprocess.run([sys.executable, '-c', PREPARE_SCRIPT, str(root), str(models)], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    # Comprobacion de que de verdad no es importable desde este proceso ni desde el servidor.
    probe = subprocess.run([sys.executable, '-c', 'import ws132_bitacora'], capture_output=True, text=True)
    assert probe.returncode != 0 and 'ws132_bitacora' in probe.stderr


def write(root: Path, rel: str, text: str = '# t\n') -> None:
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')


@pytest.fixture
def env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    monkeypatch.delenv('SLDB_PYTHONPATH', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    git_init(root)
    (root / '.gitignore').write_text('desk/privado/\nignorado.md\n', encoding='utf-8')
    ops = prepare_store(root)
    task = ops.create_task_bundle(dict(
        title='Tarea sana', goal='Meta', scope='Desk temporal', implementation_path='P',
        validation=['pytest'], done_when='listo',
    )).task_id
    add_bad_model(root, tmp_path)

    write(root, 'desk/notas/uno.md', '# Uno\n\nTexto uno.\n')
    write(root, 'desk/notas/sub/dos.md', '# Dos\n')
    write(root, 'desk/notas/solo.txt', 'no es markdown\n')
    write(root, 'docs/faq.md', '# FAQ\n\n## Pregunta\n\nRespuesta.\n')
    write(root, 'fuera/otro.md', '# Fuera de las rutas permitidas\n')
    write(root, 'desk/.oculto/x.md')
    write(root, 'desk/__pycache__/y.md')
    write(root, 'desk/node_modules/z.md')
    write(root, 'desk/privado/ign.md', '# ignorado por git\n')
    write(root, 'desk/ignorado.md', '# ignorado por git\n')
    write(root, 'desk/.punto.md')
    (root / 'desk' / 'enlace-dir').symlink_to(root / 'desk' / 'notas', target_is_directory=True)
    outside = tmp_path / 'exterior.md'
    outside.write_text('# exterior\n', encoding='utf-8')
    (root / 'desk' / 'escape.md').symlink_to(outside)
    (root / 'desk' / 'interno.md').symlink_to(root / 'docs' / 'faq.md')
    return root, task


def commit_all(root: Path) -> None:
    subprocess.run(['git', '-C', str(root), 'add', '-A'], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'commit', '-q', '-m', 'base'], check=True, capture_output=True)


class Srv:
    def __init__(self, root: Path):
        self.instance = serve.make_server(0, root / '.sldb')
        self.thread = threading.Thread(target=self.instance.serve_forever, daemon=True)
        self.thread.start()
        self.url = 'http://127.0.0.1:' + str(self.instance.server_port)

    def close(self):
        self.instance.shutdown()
        self.instance.server_close()
        self.thread.join()


@pytest.fixture
def server(env):
    srv = Srv(env[0])
    yield srv.url
    srv.close()


def request(server, path, method='GET'):
    try:
        response = urlopen(Request(server + path, method=method, data=b'{}' if method != 'GET' else None), timeout=60)
    except HTTPError as exc:
        response = exc
    with response:
        body = response.read()
        try:
            return response.status, json.loads(body)
        except ValueError:
            return response.status, {'raw': body.decode('utf-8', errors='replace')}


def get(server, path):
    return request(server, path)


def _is_cache(path) -> bool:
    """`.sldb_cache/` es cache derivada (H11 la escribe en lecturas), no estado del store ni de los documentos."""
    return '.sldb_cache' in Path(str(path)).parts


def full_state(root: Path) -> dict:
    store, docs = {}, {}
    for p in sorted((root / '.sldb').rglob('*')):
        if p.is_file() and not _is_cache(p.relative_to(root)):
            store[str(p.relative_to(root))] = sha(p.read_bytes())
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] in ('.git', '.sldb') or _is_cache(rel) or p.is_dir() or p.is_symlink():
            continue
        docs[str(rel)] = sha(p.read_bytes())
    git = None
    if (root / '.git').exists():
        porcelain = subprocess.run(['git', '-C', str(root), 'status', '--porcelain'], capture_output=True, text=True).stdout
        head = subprocess.run(['git', '-C', str(root), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
        git = (porcelain, head)
    return {'store': store, 'docs': docs, 'git': git}


def paths(data):
    return [e['path'] for e in data['unmodeled']]


# ---------------------------------------------------------------- listado

def test_explorer_lists_modeled_and_unmodeled_without_knowing_ids(env, server):
    root, task = env
    status, data = get(server, '/api/workspace/explorer')
    assert status == 200 and data['ok'] is True
    assert data['repo'] == 'local' and data['roots'] == ['desk', 'docs']
    assert data['roots_invalid'] == [] and data['sin_git'] is False and data['truncado'] is False
    modeled = {m['id']: m for m in data['modeled']}
    assert modeled[f'TaskCodeDoc:{task}']['path'] == f'desk/tasks/{task}.md'
    assert modeled[f'TaskCodeDoc:{task}']['estado'] == 'ok'
    # los modelados salen de los indices aunque esten fuera de las rutas permitidas
    assert modeled['Bitacora:b1']['path'] == 'bitacoras/b1.md' and modeled['Bitacora:b1']['model_name'] == 'Bitacora'
    # orden: modelo y nombre
    assert [m['id'] for m in data['modeled']] == sorted(modeled, key=lambda i: (i.split(':')[0], i.split(':')[1]))
    got = paths(data)
    assert got == sorted(got)
    assert {'desk/notas/uno.md', 'desk/notas/sub/dos.md', 'docs/faq.md'} <= set(got)
    # un archivo rastreado no se repite como no modelado (Model:name prevalece)
    assert f'desk/tasks/{task}.md' not in got
    for e in data['unmodeled']:
        assert set(e) == {'path', 'name'}


def test_explorer_open_results_with_the_reader(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    entry = next(e for e in data['unmodeled'] if e['path'] == 'docs/faq.md')
    status, src = get(server, f'/api/workspace/source?path={quote(entry["path"])}')
    assert status == 200 and src['identity']['kind'] == 'unmodeled'
    assert src['text'].encode() == (root / 'docs/faq.md').read_bytes()
    mod = next(m for m in data['modeled'] if m['id'] == f'TaskCodeDoc:{task}')
    status, src = get(server, f'/api/workspace/source?id={quote(mod["id"])}')
    assert status == 200 and src['identity']['kind'] == 'modeled'


def test_explorer_filters_hidden_ignored_symlinks_and_extensions(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    got = set(paths(data))
    for excluded in (
        'desk/.oculto/x.md', 'desk/__pycache__/y.md', 'desk/node_modules/z.md', 'desk/.punto.md',
        'desk/privado/ign.md', 'desk/ignorado.md', 'desk/notas/solo.txt',
        'desk/escape.md',                      # symlink de archivo que resuelve fuera de la raiz
        'desk/enlace-dir/uno.md',              # los directorios symlink no se siguen
        'fuera/otro.md',                       # fuera de las rutas permitidas
    ):
        assert excluded not in got, excluded
    assert not any(p.startswith('desk/enlace-dir') for p in got)
    # symlink de archivo, aunque resuelva dentro de la raiz: no se lista (una identidad por archivo)
    assert 'desk/interno.md' not in got and 'docs/faq.md' in got
    # y el guardia de ruta del lector sigue rechazando lo que no se lista
    status, src = get(server, f'/api/workspace/source?path={quote("desk/escape.md")}')
    assert status == 403 and src['estado'] == 'fuera_del_repo'
    status, src = get(server, f'/api/workspace/source?path={quote("desk/ignorado.md")}')
    assert status == 403 and src['estado'] == 'protegido'


def test_explorer_ignores_client_parameters(env, server):
    _, base = get(server, '/api/workspace/explorer')
    for q in ('?path=/etc', '?root=fuera', '?path=../x&roots=fuera', '?id=TaskDoc:x'):
        status, data = get(server, '/api/workspace/explorer' + q)
        assert status == 200 and data == base


def test_explorer_rejects_non_get_methods(env, server):
    root, task = env
    before = full_state(root)
    for method in ('POST', 'PUT', 'DELETE', 'PATCH'):
        status, data = request(server, '/api/workspace/explorer', method)
        assert status in (404, 405, 501), (method, status)  # el servidor no enruta no-GET al workspace
    assert full_state(root) == before


def test_allowlist_env_invalid_entries_are_reported_and_missing_ones_omitted(env, tmp_path, monkeypatch):
    root, task = env
    (root / 'enlace-raiz').symlink_to(root / 'docs', target_is_directory=True)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', f'fuera, /etc ,../exterior, enlace-raiz,desk/../docs,noexiste,desk/notas, ,{root}')
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == ['fuera', 'desk/notas']
    invalid = {e['entry']: e['reason'] for e in data['roots_invalid']}
    assert invalid == {
        '/etc': 'ruta_absoluta', '../exterior': 'contiene_..', 'enlace-raiz': 'symlink',
        'desk/../docs': 'contiene_..', str(root): 'ruta_absoluta',
    }
    assert 'noexiste' not in invalid
    assert set(paths(data)) == {'fuera/otro.md', 'desk/notas/uno.md', 'desk/notas/sub/dos.md'}


def test_allowlist_defaults_omit_absent_desk_and_docs(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'repo'
    root.mkdir()
    git_init(root)
    prepare_store(root)
    import shutil
    shutil.rmtree(root / 'desk')
    write(root, 'otra/n.md')
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200 and data['roots'] == [] and data['roots_invalid'] == [] and data['unmodeled'] == []


def test_refresh_shows_new_modeled_and_unmodeled_without_restart(env, server, tmp_path):
    root, task = env
    _, before = get(server, '/api/workspace/explorer')
    ops = DeskopsOperations(root)
    new_task = ops.create_task_bundle(dict(
        title='Tarea nueva', goal='Meta', scope='S', implementation_path='P', validation=['pytest'], done_when='ok',
    )).task_id
    write(root, 'docs/nuevo.md', '# Nuevo\n')
    _, after = get(server, '/api/workspace/explorer')
    assert f'TaskCodeDoc:{new_task}' not in {m['id'] for m in before['modeled']}
    assert f'TaskCodeDoc:{new_task}' in {m['id'] for m in after['modeled']}
    assert 'docs/nuevo.md' not in paths(before) and 'docs/nuevo.md' in paths(after)
    assert f'desk/tasks/{new_task}.md' not in paths(after)
    # y el catalogo /nodes tambien
    _, nodes = get(server, '/api/workspace/nodes')
    assert f'TaskCodeDoc:{new_task}' in {n['id'] for n in nodes['nodes']}


def test_without_git_repo_reports_sin_git_and_lists(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'sin-git'
    root.mkdir()
    prepare_store(root)
    write(root, 'docs/a.md')
    write(root, 'desk/ignorado.md')
    assert not (root / '.git').exists()
    srv = Srv(root)
    try:
        before = full_state(root)
        status, data = get(srv.url, '/api/workspace/explorer')
        assert full_state(root) == before
    finally:
        srv.close()
    assert status == 200 and data['sin_git'] is True and data['ignorados_error'] is None
    assert {'docs/a.md', 'desk/ignorado.md'} <= set(paths(data))


def test_failed_ignore_check_fails_closed(tmp_path, monkeypatch):
    """Un .git que existe pero no es un repo valido: git check-ignore falla de verdad."""
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    root = tmp_path / 'roto'
    root.mkdir()
    prepare_store(root)
    write(root, 'docs/a.md')
    (root / '.git').mkdir()
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200 and data['ignorados_error']
    assert data['unmodeled'] == []
    assert data['modeled'] and all(m['estado'] == 'protegido' for m in data['modeled'])


def test_truncation_flag_at_the_limit(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', 'docs')
    root = tmp_path / 'grande'
    root.mkdir()
    git_init(root)
    prepare_store(root)
    for i in range(5000):
        write(root, f'docs/d{i // 500}/f{i:05d}.md', '#\n')
    srv = Srv(root)
    try:
        _, exact = get(srv.url, '/api/workspace/explorer')
        write(root, 'docs/extra.md')
        _, over = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert len(exact['unmodeled']) == 5000 and exact['truncado'] is False and exact['limite'] == 5000
    assert len(over['unmodeled']) == 5000 and over['truncado'] is True


# ---------------------------------------------------------------- inmutabilidad

def test_every_get_leaves_store_documents_and_git_unchanged(env, server):
    root, task = env
    commit_all(root)
    write(root, 'docs/sin-rastrear.md', '# sin rastrear\n')
    urls = [
        '/api/workspace/explorer', '/api/workspace/nodes',
        f'/api/workspace/source?id=TaskDoc:{task}', '/api/workspace/source?id=Bitacora:b1',
        '/api/workspace/source?path=docs/faq.md', '/api/workspace/source?path=desk/escape.md',
        f'/api/workspace/node?id=TaskDoc:{task}&depth=2', '/api/workspace/node?id=Bitacora:b1&depth=1',
    ]
    for url in urls:
        before = full_state(root)
        get(server, url)
        assert full_state(root) == before, f'GET modifico store, documentos o git: {url}'


# ---------------------------------------------------------------- catalogo degradado

def test_unimportable_model_does_not_take_down_the_catalog(env, server):
    root, task = env
    status, nodes = get(server, '/api/workspace/nodes')
    assert status == 200 and nodes['ok'] is True
    by_id = {n['id']: n for n in nodes['nodes']}
    bad = by_id['Bitacora:b1']
    assert bad['estado'] == 'modelo_no_carga' and bad['path'] == 'bitacoras/b1.md'
    assert bad['model_name'] == 'Bitacora' and bad['name'] == 'b1'
    # la causa recibida, tal cual: texto de la excepcion, no una etiqueta inventada
    assert 'ws132_bitacora' in bad['causa']
    good = by_id[f'TaskCodeDoc:{task}']
    assert good['estado'] == 'ok' and good['title'] == 'Tarea sana' and 'causa' not in good


def test_unimportable_model_source_is_safe_with_cause_and_sections(env, server):
    root, task = env
    status, src = get(server, '/api/workspace/source?id=Bitacora:b1')
    assert status == 200 and src['ok'] is True
    raw = (root / 'bitacoras/b1.md').read_bytes()
    assert src['text'].encode() == raw and src['revision'] == sha(raw)
    assert src['identity']['kind'] == 'modeled' and src['identity']['id'] == 'Bitacora:b1'
    assert src['degraded'] is True and 'ws132_bitacora' in src['degraded_reason']
    assert src['ir'] is None and 'ws132_bitacora' in src['ir_error']
    expected = [(s.title, s.level, s.line_start, s.line_end) for s in extract_sections(src['text'])]
    assert [(s['title'], s['level'], s['line_start'], s['line_end']) for s in src['sections']] == expected
    assert src['fields'] == [] and src['descriptor'] is None
    # el sano sigue entero
    status, ok = get(server, f'/api/workspace/source?id=TaskDoc:{task}')
    assert status == 200 and ok['degraded'] is False and ok['ir'] is not None
    # por ruta, el rastreado se abre igual de degradado
    status, by_path = get(server, '/api/workspace/source?path=bitacoras/b1.md')
    assert status == 200 and by_path['degraded'] is True and by_path['identity']['id'] == 'Bitacora:b1'


def test_unimportable_model_node_is_200_degraded_not_500(env, server):
    status, node = get(server, '/api/workspace/node?id=Bitacora:b1&depth=1')
    assert status == 200 and node['ok'] is True
    assert node['node']['is_degraded'] is True
    assert node['context']['is_degraded'] is True
    assert 'ws132_bitacora' in node['context']['degraded_reason']
    assert 'ws132_bitacora' in node['projections']['document']['error']
    # sano: no degradado
    healthy = get(server, f'/api/workspace/node?id=TaskDoc:{env[1]}&depth=1')[1]
    assert healthy['node']['is_degraded'] is False and healthy['context']['degraded_reason'] is None
    assert node['context']['id'] == 'Bitacora:b1'


def test_explorer_lists_unimportable_model_document_with_its_guard_state(env, server):
    status, data = get(server, '/api/workspace/explorer')
    assert status == 200
    m = next(m for m in data['modeled'] if m['id'] == 'Bitacora:b1')
    assert m['estado'] == 'ok' and m['path'] == 'bitacoras/b1.md'


def test_missing_store_gives_error_and_creates_nothing(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'nada'
    root.mkdir()
    srv = Srv(root)  # arrancar el servidor es del operador y crea el directorio del store
    import shutil
    shutil.rmtree(root / '.sldb')
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
        status_nodes, _ = get(srv.url, '/api/workspace/nodes')
    finally:
        srv.close()
    assert status == 503 and data['ok'] is False and status_nodes == 503
    assert not (root / '.sldb').exists()


# ---------------------------------------------------------------- otro proceso, servidor vivo

OTHER_PROCESS = '''
import sys, json
from pathlib import Path
root, action, arg = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
if action == 'create':
    from deskops.operations import DeskopsOperations
    r = DeskopsOperations(root).create_task_bundle(dict(
        title=arg, goal='Meta', scope='S', implementation_path='P', validation=['pytest'], done_when='ok'))
    print(r.task_id)
elif action == 'untrack':
    from sldb.api import untrack_document
    untrack_document(root / '.sldb', arg)
elif action == 'track':
    from sldb.api import track_document_file
    track_document_file(root / '.sldb', 'TaskCodeDoc', arg)
elif action == 'delete':
    from sldb.api import delete_document
    delete_document(root / '.sldb', arg)
'''


def other_process(root: Path, action: str, arg: str) -> str:
    res = subprocess.run([sys.executable, '-c', OTHER_PROCESS, str(root), action, arg], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    return res.stdout.strip().splitlines()[-1] if res.stdout.strip() else ''


def test_modeled_created_and_removed_by_another_process_show_after_refresh(env, server):
    """Un operador da de alta y de baja documentos desde OTRO proceso con el servidor vivo."""
    root, task = env
    # el servidor ya sirvio un listado: sus caches estan calientes
    _, warm = get(server, '/api/workspace/explorer')
    get(server, '/api/workspace/nodes')
    new_id = other_process(root, 'create', 'Alta externa')
    ident, rel = f'TaskCodeDoc:{new_id}', f'desk/tasks/{new_id}.md'

    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident in {m['id'] for m in exp['modeled']}
    assert ident in {n['id'] for n in nodes['nodes']}
    assert rel not in paths(exp), 'el rastreado no se repite como no modelado'

    # destrackear (el archivo queda): pasa a no modelado
    other_process(root, 'untrack', new_id)
    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident not in {m['id'] for m in exp['modeled']} and ident not in {n['id'] for n in nodes['nodes']}
    assert rel in paths(exp)

    # volver a rastrearlo: modelado otra vez, sin duplicar
    other_process(root, 'track', rel)
    _, exp = get(server, '/api/workspace/explorer')
    assert ident in {m['id'] for m in exp['modeled']} and rel not in paths(exp)

    # baja con borrado
    other_process(root, 'delete', new_id)
    _, exp = get(server, '/api/workspace/explorer')
    _, nodes = get(server, '/api/workspace/nodes')
    assert ident not in {m['id'] for m in exp['modeled']} and ident not in {n['id'] for n in nodes['nodes']}
    assert rel not in paths(exp) and not (root / rel).exists()


def test_internal_file_symlink_is_not_listed_as_unmodeled(env, server):
    root, task = env
    _, data = get(server, '/api/workspace/explorer')
    got = paths(data)
    assert 'docs/faq.md' in got                      # el destino real si
    assert 'desk/interno.md' not in got              # su symlink no: una sola identidad por archivo
    assert not any((root / p).is_symlink() for p in got)


# ---------------------------------------------------------------- frontera API (punto 1 de la correccion)
#
# Proceso REAL de serve.py con sys.addaudithook. El hook registra efectos (escrituras, borrados,
# renombres, mkdir...) y las aperturas de .md; no ve llamadas a funciones, solo efectos. Su
# calibracion positiva se hace en el mismo proceso, fuera de los GET, con escrituras conocidas.

HOOK_LAUNCHER = r'''
import os, sys, json, threading, time, shutil
from pathlib import Path

LOG = os.environ['HOOK_LOG']
REPO = os.environ['HOOK_REPO']
fd = os.open(LOG, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND
EVENTS = {'os.remove', 'os.rename', 'os.mkdir', 'os.rmdir', 'os.truncate', 'os.chmod', 'os.utime', 'os.link',
          'os.symlink', 'os.chown', 'shutil.copyfile', 'shutil.copymode', 'shutil.copystat', 'shutil.copytree',
          'shutil.move', 'shutil.rmtree', 'shutil.make_archive', 'shutil.unpack_archive'}

def emit(kind, detail):
    os.write(fd, (json.dumps({'k': kind, 'd': detail}, default=str) + '\n').encode())

def hook(event, args):
    if event == 'open':
        path, mode, flags = args
        m = mode or ''
        is_write = any(c in m for c in 'wax+') or (isinstance(flags, int) and flags & WRITE_FLAGS)
        if is_write and isinstance(path, int):
            try:
                target = os.readlink('/proc/self/fd/%d' % path)
            except OSError:
                target = '?'
            emit('open_write_pipe' if target.startswith('pipe:') else 'open_write', [str(path), m, flags, target])
        elif is_write:
            emit('open_write', [str(path), m, flags])
        elif isinstance(path, (str, bytes, os.PathLike)) and str(path).endswith('.md'):
            emit('open_read_md', str(path))
    elif event in EVENTS:
        emit(event, [str(a) for a in args])

sys.addaudithook(hook)

def control():
    trig, sandbox = Path(os.environ['CONTROL_TRIGGER']), Path(os.environ['CONTROL_DIR'])
    while True:
        if trig.exists():
            os.remove(trig)
            emit('CONTROL_BEGIN', '')
            sandbox.mkdir(exist_ok=True)
            with open(sandbox / 'a.txt', 'w') as f:
                f.write('x')
            os.rename(sandbox / 'a.txt', sandbox / 'b.txt')
            shutil.copyfile(sandbox / 'b.txt', sandbox / 'c.txt')
            os.remove(sandbox / 'b.txt')
            os.remove(sandbox / 'c.txt')
            os.rmdir(sandbox)
            emit('CONTROL_END', '')
        time.sleep(0.05)

threading.Thread(target=control, daemon=True).start()
sys.path.insert(0, os.environ['HOOK_FRONTENDS'])
from mindmap import serve
emit('SERVER_START', '')
serve.main([sys.argv[1]])
'''


class RealServer:
    """serve.py real en un proceso aparte, con el hook de auditoria. Puerto libre propio."""

    def __init__(self, root: Path, tmp: Path, extra_env: dict | None = None):
        import socket
        import time
        self.root, self.tmp = root, tmp
        s = socket.socket()
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
        s.close()
        assert port not in (8090, 8091, 8092)
        self.log = tmp / 'hook.jsonl'
        self.log.write_text('')
        self.trigger = tmp / 'control.trigger'
        launcher = tmp / 'hook_serve.py'
        launcher.write_text(HOOK_LAUNCHER, encoding='utf-8')
        env = dict(os.environ, HOOK_LOG=str(self.log), HOOK_REPO=str(root), HOOK_FRONTENDS=_frontends_dir,
                   CONTROL_TRIGGER=str(self.trigger), CONTROL_DIR=str(tmp / 'control'), SLDB_STORE=str(root / '.sldb'))
        env.pop('DESKOPS_ROOT', None)
        env.update(extra_env or {})
        self.proc = subprocess.Popen([sys.executable, str(launcher), str(port)], env=env, cwd=str(tmp),
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.url = f'http://127.0.0.1:{port}'
        for _ in range(150):
            if any(e['k'] == 'SERVER_START' for e in self.events()):
                try:
                    urlopen(self.url + '/', timeout=5).read()
                    break
                except Exception:
                    pass
            time.sleep(0.2)
        else:
            raise AssertionError('serve.py no arranco')

    def events(self) -> list:
        return [json.loads(line) for line in self.log.read_text().splitlines() if line]

    def get_observed(self, path: str):
        """(status, json, eventos registrados durante ese GET). Peticiones en serie."""
        n0 = len(self.events())
        status, body = get(self.url, path)
        return status, body, self.events()[n0:]

    def control(self) -> list:
        import time
        n0 = len(self.events())
        self.trigger.write_text('1')
        for _ in range(100):
            if any(e['k'] == 'CONTROL_END' for e in self.events()[n0:]):
                break
            time.sleep(0.05)
        return [e for e in self.events()[n0:] if e['k'] not in ('CONTROL_BEGIN', 'CONTROL_END')]

    def close(self):
        self.proc.terminate()
        self.proc.wait(timeout=20)


def file_effects(events: list) -> list:
    """Efectos sobre archivos y directorios; los pipes a subprocesos (git) no lo son."""
    ignore = {'open_write_pipe', 'open_read_md', 'SERVER_START', 'CONTROL_BEGIN', 'CONTROL_END'}
    def in_cache(e):
        d = e['d'] if isinstance(e['d'], list) else [e['d']]
        return any(_is_cache(x) for x in d if isinstance(x, str))
    return [e for e in events if e['k'] not in ignore and not in_cache(e)]


def mtime_state(root: Path) -> dict:
    """sha256 y mtime_ns de todo archivo (salvo .git), mas directorios y estado git."""
    state = {}
    for p in sorted(root.rglob('*')):
        rel = p.relative_to(root)
        if rel.parts[0] == '.git' or _is_cache(rel) or p.is_symlink():
            continue
        state[str(rel)] = 'dir' if p.is_dir() else (sha(p.read_bytes()), p.stat().st_mtime_ns)
    return state


def test_refresh_path_has_no_sldb_store_import():
    """El camino del refresco usa la API publica: ningun import de sldb.store en el modulo."""
    import ast
    src = (Path(_frontends_dir) / 'mindmap' / 'workspace_routes.py').read_text(encoding='utf-8')
    mods = []
    for node in ast.walk(ast.parse(src)):
        if isinstance(node, ast.ImportFrom) and node.module:
            mods.append(node.module)
        elif isinstance(node, ast.Import):
            mods += [a.name for a in node.names]
    assert not [m for m in mods if m == 'sldb.store' or m.startswith('sldb.store.')], mods
    assert 'sldb.api' in mods  # open_store llega por sldb.api


def test_real_process_listing_get_writes_nothing_and_sees_other_process_changes(env, tmp_path):
    root, task = env
    commit_all(root)
    work = tmp_path / 'work'
    work.mkdir()
    srv = RealServer(root, work)
    try:
        # calibracion positiva: el hook de ESTE proceso detecta escrituras conocidas hechas fuera de un GET
        control = srv.control()
        kinds = {e['k'] for e in control}
        assert {'os.mkdir', 'open_write', 'os.rename', 'shutil.copyfile', 'os.remove', 'os.rmdir'} <= kinds, control

        urls = ['/api/workspace/explorer', '/api/workspace/nodes', f'/api/workspace/node?id=TaskDoc:{task}',
                '/api/workspace/source?path=docs/faq.md', '/api/workspace/explorer', '/api/workspace/nodes']
        for url in urls:
            before = mtime_state(root)
            status, _, events = srv.get_observed(url)
            assert status == 200, url
            assert file_effects(events) == [], (url, file_effects(events))
            assert mtime_state(root) == before, f'GET {url} cambio archivos, mtimes o directorios'

        # otro proceso, servidor vivo y caches calientes: alta, untrack, track y baja
        def seen():
            before = mtime_state(root)
            _, exp, ev1 = srv.get_observed('/api/workspace/explorer')
            _, nodes, ev2 = srv.get_observed('/api/workspace/nodes')
            assert file_effects(ev1 + ev2) == [] and mtime_state(root) == before
            return {m['id'] for m in exp['modeled']}, set(paths(exp)), {n['id'] for n in nodes['nodes']}

        new_id = other_process(root, 'create', 'Alta entre procesos')
        ident, rel = f'TaskCodeDoc:{new_id}', f'desk/tasks/{new_id}.md'
        m, u, n = seen()
        assert ident in m and ident in n and rel not in u
        other_process(root, 'untrack', new_id)
        m, u, n = seen()
        assert ident not in m and ident not in n and rel in u
        other_process(root, 'track', rel)
        m, u, n = seen()
        assert ident in m and ident in n and rel not in u
        other_process(root, 'delete', new_id)
        m, u, n = seen()
        assert ident not in m and ident not in n and rel not in u
    finally:
        srv.close()


# ---------------------------------------------------------------- raices prohibidas (punto 2)

FORBIDDEN_DIRECT = ['.git', 'desk/.hidden', 'desk/__pycache__', 'node_modules']
FORBIDDEN_NESTED = ['.git/hooks', 'desk/.hidden/sub', 'desk/node_modules/pkg/lib', 'docs/__pycache__/x', 'desk/notas/.cache/deep']


def forbidden_entries(with_git: bool) -> list:
    # Sin git no hay .git: un directorio .git inventado seria un repo roto (git fallaria, y cerraria).
    return [e for e in FORBIDDEN_DIRECT + FORBIDDEN_NESTED if with_git or not e.startswith('.git')]


def forbidden_repo(tmp_path: Path, with_git: bool) -> Path:
    root = tmp_path / ('con-git' if with_git else 'sin-git')
    root.mkdir()
    if with_git:
        git_init(root)   # sin .gitignore: git no oculta ningun centinela
    prepare_store(root)
    for rel in forbidden_entries(with_git):
        write(root, f'{rel}/CENTINELA.md', f'# centinela {rel}\n')
    write(root, 'desk/notas/uno.md', '# Uno\n')
    write(root, 'docs/faq.md', '# FAQ\n')
    write(root, 'desk/mis notas/ñandú día.md', '# Ñandú\n')
    write(root, 'docs/ñandú/guía rápida.md', '# Guía\n')
    return root


def sentinel_paths(data) -> list:
    return [p for p in paths(data) if 'CENTINELA' in p]


@pytest.mark.parametrize('with_git, entry', [(g, e) for g in (True, False) for e in forbidden_entries(g)],
                         ids=lambda v: str(v))
def test_forbidden_root_is_rejected_before_listing_direct_and_nested(tmp_path_factory, monkeypatch, entry, with_git):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = forbidden_repo(tmp_path_factory.mktemp('r'), with_git)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', entry)
    srv = Srv(root)
    try:
        status, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == [] and data['unmodeled'] == []
    assert data['roots_invalid'] == [{'entry': entry, 'reason': 'componente_prohibido'}]
    assert sentinel_paths(data) == []


@pytest.mark.parametrize('with_git', [True, False], ids=['con-git', 'sin-git'])
def test_mixed_roots_keep_valid_diagnose_forbidden_and_never_open_sentinels(tmp_path_factory, with_git):
    root = forbidden_repo(tmp_path_factory.mktemp('r'), with_git)
    work = tmp_path_factory.mktemp('w')
    forbidden = forbidden_entries(with_git)
    entries = ['desk/notas'] + forbidden + ['docs', 'desk/mis notas', 'docs/ñandú']
    srv = RealServer(root, work, {'WORKSPACE_EXPLORER_ROOTS': ','.join(entries)})
    try:
        status, data, events = srv.get_observed('/api/workspace/explorer')
        _, _, events_nodes = srv.get_observed('/api/workspace/nodes')
        opened = [e['d'] for e in srv.events() if e['k'] == 'open_read_md' and e['d'].startswith(str(root))]
    finally:
        srv.close()
    assert status == 200
    assert data['roots'] == ['desk/notas', 'docs', 'desk/mis notas', 'docs/ñandú']
    assert {(e['entry'], e['reason']) for e in data['roots_invalid']} == {(f, 'componente_prohibido') for f in forbidden}
    assert sentinel_paths(data) == []
    got = set(paths(data))
    assert {'desk/notas/uno.md', 'docs/faq.md', 'desk/mis notas/ñandú día.md', 'docs/ñandú/guía rápida.md'} <= got
    assert not [p for p in opened if 'CENTINELA' in p], 'el servidor abrio un centinela'
    assert file_effects(events + events_nodes) == []
    # ningun metadato del listado sale de los arboles prohibidos
    blob = json.dumps({k: data[k] for k in ('roots', 'modeled', 'unmodeled')}, ensure_ascii=False)
    assert 'CENTINELA' not in blob and '.hidden' not in blob and '__pycache__' not in blob and 'node_modules' not in blob


def test_legit_roots_with_spaces_and_unicode_are_preserved(tmp_path_factory, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = forbidden_repo(tmp_path_factory.mktemp('r'), True)
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', 'desk/mis notas, docs/ñandú')
    srv = Srv(root)
    try:
        _, data = get(srv.url, '/api/workspace/explorer')
    finally:
        srv.close()
    assert data['roots'] == ['desk/mis notas', 'docs/ñandú'] and data['roots_invalid'] == []
    assert set(paths(data)) == {'desk/mis notas/ñandú día.md', 'docs/ñandú/guía rápida.md'}

FILE:pyproject.toml
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "graph-ui"
version = "0.1.0"
description = "Editor visual de una KB SLDB: el mindmap (frontends/mindmap) como paquete `mindmap`."
requires-python = ">=3.12"
dependencies = [
    "structuredLanguageDB>=0.1.11",
    "pron>=1.0.0",
]

[project.optional-dependencies]
# Vista workflow/deskops: operaciones reales de workflow.
deskops = ["deskops>=0.1.0"]
test = [
    "pytest>=8",
    "playwright>=1.40",
    "deskops>=0.1.0",
]

[project.scripts]
graph-ui = "mindmap.serve:main"

[tool.setuptools]
package-dir = { "mindmap" = "frontends/mindmap" }
packages = ["mindmap"]

[tool.setuptools.package-data]
# La UI no tiene build: el servidor sirve estos archivos desde el paquete.
mindmap = [
    "index.html",
    "*.js",
    "**/*.js",
    "**/*.mjs",
    "**/*.css",
    "fixtures/*.json",
]

[tool.pytest.ini_options]
pythonpath = ["src"]
asyncio_default_fixture_loop_scope = "function"
python_files = ["test_*.py", "e2e_*.py"]

FILE:instruccion
Cold-bundle de la tarea task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- python -c "from sldb.api import read_store, extract_payload, store_is_prepared"
- ! grep -rnE "runtime_cache_signature|extract_model_data" frontends tests/deskops_viewdocs.py --include=*.py
- python -m pytest -q -rs tests/test_mindmap_workspace_explorer.py tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py tests/test_mindmap_adapter.py tests/test_mindmap_persistence.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py tests/test_desk_ui_routes.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py
- git -C ../../sldb branch -r --contains f515d91c

