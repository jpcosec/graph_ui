FILE:desk/tasks/task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon.md
---
sldb:
  by: agent
  at: '2026-11-17T03:16:39Z'
  authority: generated
  via: save_document_payload
id: task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261116-read-store-tester-a1/result-summary.md
- runs/subagents/20261116-read-store-tester-a1/closeout-notes.md
- 1479e24
- frontends/mindmap/projection_views.py
depends_on: []
pills: []
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views_routes.py
- frontends/mindmap/persistence.py
- tests/test_mindmap_persistence.py
- tests/test_projection_views.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Las vistas de proyección leen sin migrar (read_store) y el guardado sobre un store sin preparar responde 503, no 500

## Rationale

_Explain why this task exists or the business driver behind it._

Al cerrar read_store (código 1479e24, closeout d7beba4) quedaron dos huecos fuera de su alcance. (a) runtime_documents en frontends/mindmap/sldb_adapter.py:403-413 abre el store con sldb.api.open_store, que migra un layout no canónico al leer. Lo llaman evaluate_view y list_views de frontends/mindmap/projection_views.py:109 y :127, que sirven GET de views_routes.py, así que un GET de vistas puede reescribir el store, justo lo que read_store evita en el workspace. (b) El tester independiente (runs/subagents/20261116-read-store-tester-a1/result-summary.md, hallazgo F2) vio que POST /api/save sobre un store des-preparado con el servidor ya arrancado pasó de 409 a 500 'store not prepared'. La causa es que persistence.py:77 llama a adapter.refresh_for_concurrent_sessions(), que ahora usa read_store y lanza SLDBStoreError, y save no la traduce a SaveError. No escribe nada, pero el cliente recibe un 500 genérico.

## Goal

_Describe the concrete result this task must produce._

Ningún GET de frontends/mindmap migra el store. runtime_documents usa sldb.api.read_store en vez de open_store, y sobre un store sin preparar los GET de vistas responden 503 con el texto de sldb ('store not prepared'). POST /api/save sobre un store des-preparado responde 503 con ese texto y estado 'store_no_preparado', como el workspace, sin escribir nada.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py runtime_documents: open_store(Path(store)) pasa a read_store(Path(store)); el docstring dice que no migra y que lanza 'store not prepared'. (2) frontends/mindmap/views_routes.py: un SLDBStoreError con 'store not prepared' que llegue desde evaluate_view o list_views se responde 503 con str(exc) y estado 'store_no_preparado'. Reusa la forma de respuesta de error que ya tenga ese módulo. (3) frontends/mindmap/persistence.py save: si refresh_for_concurrent_sessions lanza SLDBStoreError con 'store not prepared', se convierte en SaveError(str(exc), 503). SaveError ya acepta status. Si su respuesta no lleva campo de estado, se agrega 'store_no_preparado' solo en este caso. (4) Pruebas: - En tests/test_mindmap_persistence.py, un POST /api/save sobre un store des-preparado con el servidor
  ya arrancado da 503 'store not prepared' y no cambia ningún archivo de .sldb (sha256 y mtime).
- En tests/test_projection_views.py,
  un GET de vistas sobre un store des-preparado da 503 y no cambia nada.
- El store no canónico se fabrica como en
  tests/test_mindmap_workspace_explorer.py::test_listing_get_on_unprepared_store_is_503_and_writes_nothing.
NO ENTRA: - el arranque del servidor (make_server), que sigue preparando el store con open_store; - el import de render_model_markdown/validate_model_input_roundtrip (sldb_adapter.py:31; pedido a sldb,
  nota 20261116-222854);
- cambiar sldb; frontends/desk.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) grep -rn 'open_store\|runtime_documents(' frontends --include=*.py para fijar los puntos. 2) Cambiar runtime_documents. 3) Ubicar en views_routes.py dónde se atrapan ViewError y otros errores, y agregar el caso de SLDBStoreError (importada de sldb.core.exceptions, como en workspace_routes.py). 4) En persistence.save, envolver la llamada a refresh_for_concurrent_sessions. 5) Escribir las pruebas copiando la fabricación del store no canónico de la prueba existente. 6) Antes de cambiar nada, correr la validación y guardar la línea base.

## Validation

_List the checks required before this task can close._

- ! grep -rn open_store frontends/mindmap/sldb_adapter.py frontends/mindmap/projection_views.py frontends/mindmap/views_routes.py
- python -m pytest -q -rs tests/test_mindmap_persistence.py tests/test_projection_views.py tests/test_mindmap_workspace_explorer.py tests/test_mindmap_adapter.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py tests/e2e_review_workbench_views.py

## Done When

_Name the observable condition that makes the task complete._

El grep no devuelve nada. Las pruebas pasan, incluidas las nuevas: 503 en save y en el GET de vistas sobre un store des-preparado, sin cambios en .sldb. Sobre el código anterior esas pruebas nuevas fallan.

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
        adapter se re-sweipea en la próxima lectura. Usa la lectura pública
        ``sldb.api.read_store``: abre la operación nueva de la cache runtime y
        la del hash de documentos, sin migrar el store.
        """
        from sldb.api import read_store
        read_store(self.store)

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

FILE:frontends/mindmap/views_routes.py
"""HTTP surface of projection views on the graph_ui server (local mode, store on disk).

- ``GET /api/views[?store=]``: the store's ``ViewDoc``s.
- ``GET /api/views/evaluate?view=ViewDoc:<name>[&store=]``: a saved view, evaluated.
- ``POST /api/views/evaluate`` ``{view: {...} | ref, store?}``: an unsaved view (the sidebar's
  current filters), evaluated.
- ``POST /api/views/save`` ``{name, view: {...}, store?}``: writes the ``ViewDoc`` through sldb.

``store`` names any ``.sldb`` directory on this machine; a view is portable across stores, so the
same ref or payload can be pointed at another one. Default: the server's store.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from mindmap.projection_views import VIEW_MODEL, ViewError, evaluate_view, find_view, list_views
from mindmap.sldb_adapter import ensure_model, write_document

VIEW_MODEL_REF = 'sldb.models.notation.view_doc:ViewDoc'


class RouteError(Exception):
    def __init__(self, message: str, status: int):
        super().__init__(message)
        self.status = status


def _store(default: str | Path, requested: str | None) -> Path:
    store = Path(requested).expanduser() if requested else Path(default)
    if not (store / 'core' / 'store_index.yaml').exists():
        raise RouteError(f'{store} is not an sldb store', 404)
    return store


def _view_payload(store: Path, body: dict[str, Any]) -> dict[str, Any]:
    view = body.get('view')
    if isinstance(view, dict):
        return view
    if isinstance(view, str) and view:
        found = find_view(store, view)
        if found is None:
            raise RouteError(f'{view} is not in {store}', 404)
        return found
    raise RouteError('view is required: a ViewDoc ref or a view payload', 400)


def _ensure_view_model(store: Path) -> None:
    """Register sldb's ``ViewDoc`` in a store that has none yet."""
    try:
        ensure_model(store, VIEW_MODEL, VIEW_MODEL_REF)
    except Exception as exc:
        raise RouteError(f'{VIEW_MODEL_REF} is not available: {exc}', 501) from exc


def save_view(store: Path, body: dict[str, Any]) -> dict[str, Any]:
    name, view = str(body.get('name') or '').strip(), body.get('view')
    if not name or not isinstance(view, dict):
        raise RouteError('name and a view payload are required', 400)
    evaluate_view(store, view)  # a view that does not evaluate is not saved
    fields = ('nodes', 'relations', 'direction', 'notation', 'layout', 'description')
    payload = {**{k: view[k] for k in fields if k in view}, 'id': name, 'name': name, 'title': view.get('title') or name}
    _ensure_view_model(store)
    path = store.parent / 'sldb' / 'views' / f'{name}.md'
    write_document(store, VIEW_MODEL, name, path, payload, exists=find_view(store, name) is not None)
    return {'ok': True, 'ref': f'{VIEW_MODEL}:{name}', 'view': payload}


def dispatch(method: str, route: str, query: dict[str, list[str]], body: dict[str, Any] | None,
             default_store: str | Path) -> tuple[dict[str, Any], int]:
    """(payload, status) for one /api/views* request."""
    params = {k: v[0] for k, v in query.items() if v}
    body = body or {}
    try:
        store = _store(default_store, body.get('store') or params.get('store'))
        if method == 'GET' and route == '/api/views':
            return {'views': list_views(store)}, 200
        if route == '/api/views/evaluate':
            view = _view_payload(store, body if method == 'POST' else {'view': params.get('view')})
            return {'ok': True, 'store': str(store), **evaluate_view(store, view)}, 200
        if method == 'POST' and route == '/api/views/save':
            return save_view(store, body), 200
        return {'ok': False, 'error': 'Ruta desconocida.'}, 404
    except RouteError as exc:
        return {'ok': False, 'error': str(exc)}, exc.status
    except ViewError as exc:
        return {'ok': False, 'error': str(exc)}, 422

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
            # capa 6, ``sldb.api.read_store`` — expuesto por el adaptador). Sin esto,
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

FILE:tests/test_mindmap_persistence.py
"""Real SLDB round trips in isolated stores; no writes to the user's KB."""
import importlib.util
from pathlib import Path
import pytest
from sldb.cli import main as cli

MODULE = Path(__file__).parents[1] / 'frontends/mindmap/persistence.py'
spec = importlib.util.spec_from_file_location('mindmap_persistence', MODULE)
persistence = importlib.util.module_from_spec(spec)
spec.loader.exec_module(persistence)


@pytest.fixture
def store(tmp_path):
    assert cli(['stores', 'init', '--path', str(tmp_path)]) == 0
    for model in ('board:BoardDoc', 'task:TaskDoc', 'ritual:RitualDoc', 'step:StepDoc'):
        assert cli(['models', 'add', 'deskops.models.' + model, '--store', str(tmp_path / '.sldb')]) == 0
    return persistence.EditorStore(tmp_path / '.sldb')


def create(name, model, **payload):
    return {'action': 'create', 'id': name, 'model': model, 'payload': {'id': name, **payload}}


def save(store, changes, view=None):
    return store.save({'changes': changes, 'view': view or {}, 'viewRevision': store.view()['revision']})


def test_create_update_containment_and_reload_from_disk(store):
    result = save(store, [
        create('child', 'StepDoc', title='Child', action='Run it', outcome='Done'),
        create('parent', 'RitualDoc', title='Parent', purpose='Group', trigger='Always', completion='All steps', steps=['child']),
        create('board', 'BoardDoc', title='Board', scope='UI', purpose='Organize'),
    ], {'collapsed': ['parent']})
    assert len(result['documents']) == 3
    child = next(d for d in result['documents'] if d['id'] == 'child')
    save(store, [{'action': 'update', 'id': 'child', 'model': 'StepDoc',
                  'expected': child['payload'], 'payload': {**child['payload'], 'title': 'Changed'}}])
    reopened = persistence.EditorStore(store.store).graph()
    assert next(d for d in reopened['documents'] if d['id'] == 'child')['payload']['title'] == 'Changed'
    assert next(d for d in reopened['documents'] if d['id'] == 'parent')['payload']['steps'] == ['child']
    assert 'Changed' in (store.root / child['path']).read_text()


def test_invalid_batch_writes_nothing(store):
    with pytest.raises(persistence.SaveError) as error:
        save(store, [create('valid', 'StepDoc', title='Valid', action='x', outcome='y'),
                     create('invalid', 'BoardDoc', title='Missing scope and purpose')])
    assert error.value.status == 422
    assert store.graph()['documents'] == []
    assert not (store.root / 'StepDoc/valid.md').exists()


def test_conflict_and_untrack_preserves_file(store):
    result = save(store, [create('step', 'StepDoc', title='Step', action='x', outcome='y')])
    doc = result['documents'][0]
    with pytest.raises(persistence.SaveError) as error:
        save(store, [{'action': 'update', 'id': doc['id'], 'model': doc['model_name'],
                      'expected': {}, 'payload': doc['payload']}])
    assert error.value.status == 409
    result = save(store, [{'action': 'delete', 'id': doc['id'], 'expected': doc['payload']}])
    assert result['documents'] == []
    assert (store.root / doc['path']).exists()


def test_view_conflict_and_path_traversal_rejected(store):
    revision = store.view()['revision']
    save(store, [], {'collapsed': ['a']})
    with pytest.raises(persistence.SaveError) as error:
        store.save({'changes': [], 'view': {}, 'viewRevision': revision})
    assert error.value.status == 409
    with pytest.raises(persistence.SaveError):
        save(store, [create('../escape', 'StepDoc', title='Bad', action='x', outcome='y')])

FILE:tests/test_projection_views.py
"""Projection views evaluated with sldb's API over real, temporary stores.

The stores are built with ``sldb notations sync --spec`` from tests/fixtures/notation-pilots: ``SpecNodeDoc``
documents joined by typed relations (``uses``, ``inherits``, ``reads``). A view names models,
``where`` predicates and relation types, so the same view runs against a second store too.
"""
import importlib.util
import json
import shutil
import subprocess
import threading
import urllib.error
import urllib.request
from pathlib import Path

import pytest

from mindmap.projection_views import ViewError, evaluate_view

MINDMAP = Path(__file__).resolve().parents[1] / "frontends/mindmap"
PILOTS = Path(__file__).resolve().parent / "fixtures/notation-pilots"
INHERITS = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}


def _store(root: Path, pilots: list[str]) -> Path:
    for pilot in pilots:
        shutil.copy(PILOTS / pilot, root / pilot)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for p in pilots for a in ("--spec", p)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    return _store(tmp_path_factory.mktemp("views"), ["component-exception-hierarchy.yml", "component-type-system.yml"])


@pytest.fixture(scope="module")
def other_store(tmp_path_factory):
    return _store(tmp_path_factory.mktemp("views-other"), ["component-architecture.yml"])


def test_nodes_by_model_and_edges_by_relation_type(store):
    result = evaluate_view(store, INHERITS)
    ids = {n["id"] for n in result["nodes"]}
    assert ids and all(n["model"] == "SpecNodeDoc" for n in result["nodes"])
    assert result["edges"] and {e["relation_type"] for e in result["edges"]} == {"inherits"}
    assert all(e["source"] in ids and e["target"] in ids for e in result["edges"])


def test_where_narrows_the_nodes_and_drops_edges_that_leave_them(store):
    everything = evaluate_view(store, {**INHERITS, "relations": []})
    boundary = evaluate_view(store, {"nodes": [{"model": "SpecNodeDoc", "where": 'kind = "boundary"'}], "relations": []})
    assert 0 < len(boundary["nodes"]) < len(everything["nodes"])
    assert all(n["payload"]["kind"] == "boundary" for n in boundary["nodes"])
    kept = {n["id"] for n in boundary["nodes"]}
    assert all(e["source"] in kept and e["target"] in kept for e in boundary["edges"])
    assert len({e["relation_type"] for e in everything["edges"]}) > 1


def test_layout_comes_from_the_notation_unless_the_view_overrides_it(store):
    from_notation = evaluate_view(store, {**INHERITS, "notation": "NotationDoc:component"})
    assert from_notation["layout"]["kind"] == "graph"
    overridden = evaluate_view(store, {**INHERITS, "notation": "NotationDoc:component", "layout": {"kind": "graph", "style": "rings"}})
    assert overridden["layout"] == {"kind": "graph", "style": "rings"}


STYLE = Path(__file__).resolve().parent / "fixtures" / "notation-style"


@pytest.fixture(scope="module")
def styled_store(tmp_path_factory):
    """A store with the styled notation of the Specs view's style e2e (infra: palette, glyph and link colours)."""
    root = tmp_path_factory.mktemp("views-styled")
    for spec in STYLE.glob("*.yml"):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", "--spec", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


INFRA = {"nodes": [{"model": "SpecNodeDoc", "where": 'spec = "SpecDoc:component.style-infra"'}],
         "relations": ["reads", "calls"], "notation": "infra"}


def test_a_view_with_a_notation_carries_each_node_style_each_edge_link_and_the_legend(styled_store):
    result = evaluate_view(styled_store, INFRA)
    notation = result["notation"]
    assert "error" not in notation and notation["notation"] == "NotationDoc:infra"
    assert notation["ink"]["light"] and notation["ink"]["dark"]
    by_name = {key.rsplit(".", 1)[-1]: value for key, value in notation["nodes"].items()}
    assert set(by_name) == {n["name"].rsplit(".", 1)[-1] for n in result["nodes"]}
    # El glifo con estilo propio gana; la base de datos es un cilindro con el ícono de su glifo.
    assert by_name["checkout"]["glyph"] == "GlyphDoc:infra.hot" and by_name["checkout"]["style"]["fill"]["light"] == "#fff1c2"
    assert by_name["db"]["shape"] == "cylinder" and by_name["db"]["style"]["icon"] == "database"
    # Una arista por posición, con el LinkDoc de su relación (reads: punteada y azul).
    assert len(notation["edges"]) == len(result["edges"])
    reads = [s for e, s in zip(result["edges"], notation["edges"]) if e["relation_type"] == "reads"]
    assert reads and all(s["line"] == "dashed" and s["color"]["light"] == "#0072b2" for s in reads)
    assert {len(notation["legend"][k]) for k in ("glyphs", "links")} and notation["legend"]["glyphs"]


def test_a_notation_that_does_not_resolve_is_reported_not_raised(styled_store):
    result = evaluate_view(styled_store, {**INFRA, "notation": "nonexistent"})
    assert result["nodes"] and "nonexistent" in result["notation"]["error"]


def test_a_view_without_notation_has_no_notation_block(styled_store):
    assert "notation" not in evaluate_view(styled_store, {**INFRA, "notation": ""})


def test_malformed_views_are_rejected(store):
    with pytest.raises(ViewError):
        evaluate_view(store, {**INHERITS, "direction": "sideways"})
    with pytest.raises(ViewError):
        evaluate_view(store, {"nodes": [{"model": "SpecNodeDoc", "where": "kind ==="}]})


def _load_serve():
    spec = importlib.util.spec_from_file_location("serve", MINDMAP / "serve.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def server(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "local")
    httpd = _load_serve().make_server(port=0, store=store)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{httpd.server_address[1]}"
    httpd.shutdown()
    httpd.server_close()


def _call(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read())


def test_http_evaluates_an_unsaved_view_and_points_it_at_another_store(server, other_store):
    status, here = _call(f"{server}/api/views/evaluate", {"view": INHERITS})
    assert status == 200 and here["edges"]
    status, there = _call(f"{server}/api/views/evaluate", {"view": {**INHERITS, "relations": []}, "store": str(other_store)})
    assert status == 200 and there["store"] == str(other_store) and there["nodes"]
    assert {n["id"] for n in there["nodes"]}.isdisjoint({n["id"] for n in here["nodes"]})


def test_http_errors_say_what_is_wrong(server, tmp_path):
    assert _call(f"{server}/api/views/evaluate?view=ViewDoc:no-such-view")[0] == 404
    assert _call(f"{server}/api/views/evaluate", {"view": {**INHERITS, "direction": "up"}})[0] == 422
    assert _call(f"{server}/api/views/evaluate", {"view": INHERITS, "store": str(tmp_path)})[0] == 404
    assert _call(f"{server}/api/views", None)[1] == {"views": []}


def test_a_saved_view_is_a_viewdoc_of_the_store_and_evaluates_by_ref(server, store):
    from sldb.models.notation.view_doc import ViewDoc  # noqa: F401  (task a: the model lives in sldb)
    view = {**INHERITS, "title": "Herencia", "notation": "NotationDoc:component", "layout": {"kind": "graph", "style": "layered"}}
    status, saved = _call(f"{server}/api/views/save", {"name": "herencia", "view": view})
    assert status == 200 and saved["ref"] == "ViewDoc:herencia"
    _, listed = _call(f"{server}/api/views")
    assert [v["ref"] for v in listed["views"]] == ["ViewDoc:herencia"]
    status, by_ref = _call(f"{server}/api/views/evaluate?view=ViewDoc:herencia")
    assert status == 200 and by_ref["layout"]["style"] == "layered"
    assert by_ref["edges"] == evaluate_view(store, view)["edges"]
    resaved = _call(f"{server}/api/views/save", {"name": "herencia", "view": {**view, "relations": ["uses"]}})[1]
    assert resaved["view"]["relations"] == ["uses"]
    assert _call(f"{server}/api/views/save", {"name": "rota", "view": {**view, "direction": "up"}})[0] == 422


def test_a_view_another_process_saves_is_seen_by_the_next_read_of_this_one(tmp_path):
    """A long-lived reader (the server, a test) sees a ViewDoc another process wrote after its
    first read. Each read opens the store (``sldb.api.open_store``), as every sldb operation
    does; without it, the roster of ViewDoc cached by the first read (sldb GO04's
    ``live_stale`` composes every model's entries) hid the new document from this process."""
    import sys

    from mindmap.projection_views import find_view, list_views

    store = _store(tmp_path, ["component-exception-hierarchy.yml", "component-type-system.yml"])
    evaluate_view(store, INHERITS)
    assert list_views(store) == []

    writer = (
        "import sys; from pathlib import Path; "
        "from mindmap.views_routes import save_view; "
        "save_view(Path(sys.argv[1]), {'name': 'herencia', 'view': {'nodes': [{'model': 'SpecNodeDoc', 'where': ''}], 'relations': ['inherits']}})"
    )
    subprocess.run([sys.executable, "-c", writer, str(store)], check=True, capture_output=True,
                   cwd=MINDMAP.parent)
    assert find_view(store, "ViewDoc:herencia")["relations"] == ["inherits"]

FILE:instruccion
Cold-bundle de la tarea task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- ! grep -rn open_store frontends/mindmap/sldb_adapter.py frontends/mindmap/projection_views.py frontends/mindmap/views_routes.py
- python -m pytest -q -rs tests/test_mindmap_persistence.py tests/test_projection_views.py tests/test_mindmap_workspace_explorer.py tests/test_mindmap_adapter.py tests/test_parallel_workspace_serve.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_mindmap_workspace.py tests/e2e_review_workbench_views.py

