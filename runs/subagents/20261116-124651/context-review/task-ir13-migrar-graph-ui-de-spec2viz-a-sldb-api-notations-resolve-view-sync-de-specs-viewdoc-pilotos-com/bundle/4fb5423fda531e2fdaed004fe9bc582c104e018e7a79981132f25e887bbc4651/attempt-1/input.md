FILE:desk/tasks/task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com.md
---
sldb:
  by: agent
  at: '2026-11-16T12:43:48Z'
  authority: generated
  via: save_document_payload
id: task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-testing
history:
- task_activates
references:
- desk/inbox/20261115-224814-suggestion-ir13-pide-migrar-graph-ui-de-spec2viz-a-sldb-resolve-view-sync-de-specs-viewdoc-pilotos.md
- ../../IR/docs/spec2viz/matriz-de-cobertura.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/sldb_adapter.py
- frontends/mindmap/views_routes.py
- frontends/mindmap/projection_views.py
- frontends/mindmap/persistence.py
- frontends/mindmap/serve.py
- frontends/mindmap/views/specs/notation/
- pyproject.toml
- .github/requirements-suite.txt
- tests/fixtures/notation-pilots/
- tests/test_projection_views.py
- tests/test_mindmap_notation.py
- tests/test_mindmap_skin.py
- tests/e2e_notation_class.py
- tests/e2e_notation_sequence.py
- tests/e2e_notation_deployment.py
- tests/e2e_notation_activity.py
- tests/e2e_notation_style.py
- tests/e2e_notation_legibility.py
- tests/e2e_mindmap_notation.py
- tests/e2e_review_workbench_views.py
- desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
- atom-cómo-corre-la-ci-de-graph-ui
---

# IR13: migrar graph_ui de spec2viz a sldb.api.notations (resolve_view, sync de specs, ViewDoc, pilotos como fixtures)

## Rationale

_Explain why this task exists or the business driver behind it._

IR13 (gate de retiro de spec2viz en el repo IR, gate G4) exige que ningún consumidor dependa de spec2viz antes de retirarlo. `specir retirement check` encontró 34 dependencias en graph_ui (nota del inbox 20261115-224814 de IR). sldb ya trae todo lo equivalente: `sldb.api.notations` (resolve_view, resolve_documents, ViewError), `sldb notations sync --spec` y `sldb.models.notation.view_doc.ViewDoc` (filas SV-H03, SV-E01 y SV-A17 de IR/docs/spec2viz/matriz-de-cobertura.md).

## Goal

_Describe the concrete result this task must produce._

graph_ui deja de importar, instalar o invocar spec2viz: el código de producción usa `sldb.api.notations`, el store registra el ViewDoc de sldb, las pruebas sincronizan specs con `sldb notations sync --spec ... --store .sldb` sobre pilotos copiados como fixtures propios de graph_ui, y `specir retirement check` no lista nada de graph_ui.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/mindmap/sldb_adapter.py (líneas ~239-247 y ~435-437), views_routes.py (VIEW_MODEL_REF = 'spec2viz.sldb_models:ViewDoc' pasa a 'sldb.models.notation.view_doc:ViewDoc'), projection_views.py, persistence.py y serve.py (imports y docstrings que nombran spec2viz como el que resuelve). (2) pyproject.toml: quitar el extra 'notation' y 'spec2viz>=0.1.0' del extra 'test'. (3) .github/requirements-suite.txt: quitar la línea '-e git+https://github.com/jpcosec/spec2viz@master#egg=spec2viz' y su comentario de tres líneas. (4) Crear tests/fixtures/notation-pilots/ con exactamente estos 10 archivos, copiados byte a byte de spec2viz en el commit 2a218b1 (2026-11-15): de spec2viz/docs/architecture/spec2viz/ activity-render-error-handling.yml, class-sldb-models.yml, component-architecture.yml, component-exception-hierarchy.yml, component-type-system.yml, matrix-pipeline-coverage.yml, sequence-render-pipeline.yml, sequence-sync-pipeline.yml y state-diagram-sync-lifecycle.yml; de spec2viz/tests/fixtures/ matrix.quotation-view.yml. Sin los .mmd ni .vega.json generados. Más un README.md de una línea: 'Copiados de jpcosec/spec2viz en 2a218b1 (IR13); se mantienen aquí, spec2viz se retira.' Los demás fixtures (tests/fixtures/notation-activity, -class, -deployment, -legibility, -sequence, -style) ya son de graph_ui y no se tocan. (5) Pruebas: tests/test_projection_views.py, tests/test_mindmap_notation.py, tests/test_mindmap_skin.py (solo el comentario de la línea 62), tests/e2e_notation_{class,sequence,deployment,activity,style,legibility}.py, tests/e2e_mindmap_notation.py y tests/e2e_review_workbench_views.py: PILOTS y MATRIX pasan a tests/fixtures/notation-pilots/; importorskip('spec2viz') y shutil.which('spec2viz') se quitan (sldb es dependencia obligatoria); cada 'spec2viz diagram sync A.yml B.yml [--notation N.yml] --store .sldb' pasa a 'sldb notations sync --spec A.yml --spec B.yml [--notation N.yml] --store .sldb' (mismo cwd); 'spec2viz.sldb_models.ViewDoc' pasa a 'sldb.models.notation.view_doc.ViewDoc'. Ninguna prueba se salta por falta de spec2viz. (6) Textos visibles y comentarios que atribuyen la resolución a spec2viz (notation-view.js, notation.mjs, notation-style.mjs, notation-swimlanes.mjs) pasan a decir sldb. (7) Actualizar el atom atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz con 'deskops edit atom' para que diga sldb.api.notations y sldb/src/sldb/notations/builtin/. NO ENTRA: dibujar paquetes UML (otra tarea), cambiar el layout o el estilo de la vista, tocar los repos spec2viz, sldb o IR, y los cambios sin commitear de JP en frontends/desk/app.js y frontends/desk/task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Correr 'grep -rn spec2viz frontends tests pyproject.toml .github' para fijar la lista real. 2) Reemplazar los imports por 'from sldb.api.notations import ViewError, resolve_view, resolve_documents'. Las firmas son las mismas que las de spec2viz: resolve_view(store, spec_ref, pythonpath=None) -> dict y resolve_documents(store, notation_ref, doc_refs, *, relation_refs=None, spec_style=None, pythonpath=None, docs=None) -> dict; ViewError es subclase de ValueError en ambos. Se cambia el import, no se envuelve. El 501 por 'spec2viz no está instalado' desaparece: sldb siempre está. 3) VIEW_MODEL_REF = 'sldb.models.notation.view_doc:ViewDoc'. El .sldb de graph_ui no registra ViewDoc (grep ViewDoc .sldb/store.yaml no devuelve nada): ensure_model de views_routes.py lo registra a pedido en el store servido, así que no hay registro que migrar. 4) Copiar los 10 pilotos del alcance con 'git -C ../../spec2viz show 2a218b1:<ruta>' a tests/fixtures/notation-pilots/ y apuntar PILOTS y MATRIX ahí. 5) Cambiar las llamadas de sync en las pruebas como dice el alcance. 6) Quitar spec2viz de pyproject.toml y .github/requirements-suite.txt; reinstalar el entorno de pruebas sin spec2viz ('pip uninstall -y spec2viz') para validar. 7) Correr la validación, commitear y responder a IR con 'deskops message send --to IR' con el sha del commit para IR/docs/spec2viz/acta-de-retiro.md.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py
- python -m pytest -q -rs tests/e2e_notation_class.py tests/e2e_notation_sequence.py tests/e2e_notation_deployment.py tests/e2e_notation_activity.py tests/e2e_notation_style.py tests/e2e_notation_legibility.py tests/e2e_mindmap_notation.py tests/e2e_review_workbench_views.py
- ! grep -rnE 'from spec2viz|import spec2viz|importorskip\("spec2viz"\)|which\("spec2viz"\)|spec2viz\.sldb_models|spec2viz>=|spec2viz@' frontends tests pyproject.toml .github
- cd ../../IR && .venv/bin/specir retirement check --path graph_ui=../UIs/graph_ui

## Done When

_Name the observable condition that makes the task complete._

En un entorno sin spec2viz instalado (`python -c "import spec2viz"` falla), la validación pasa sin skips por spec2viz; el grep de la validación no devuelve nada; `specir retirement check` no lista ninguna dependencia de graph_ui; IR recibió por inbox el sha del commit.

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

FILE:desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
---
sldb:
  by: agent
  at: '2026-11-16T05:08:10Z'
  authority: generated
  via: save_document_payload
id: atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
title: La vista Specs dibuja lo que resuelve sldb.api.notations
five_wh_one_plus: how
tags:
- system:graph_ui
- system:sldb
- topic:notation
provenance: frontends/mindmap/views/specs/notation/notation.mjs
---

# La vista Specs dibuja lo que resuelve sldb.api.notations

## Answer

La vista Specs (/specs/notation) no interpreta notaciones: GET /api/notation/view devuelve tal cual sldb.api.notations.resolve_view, y la vista solo dibuja forma, compartimentos, marcas, terminales y rótulos. Las notaciones de fábrica viven en sldb/src/sldb/notations/builtin/ (activity, component, deployment, statechart, uml-class, uml-sequence…); graph_ui no importa ni invoca spec2viz (IR13). layout graph/tree va con dagre (draw nest como contención), lanes como carriles (un carril por nodo en orden, mensajes por order, fragmentos como marcos) y grid como una tabla por data.view, con filas components anidadas y celdas draw cell. Lo no soportado (axis, draw lane) se dibuja como grafo/línea con aviso. El contrato está en sldb/docs/architecture/notations-and-views.md.

FILE:desk/atoms/atom-cómo-corre-la-ci-de-graph-ui.md
---
id: atom-cómo-corre-la-ci-de-graph-ui
title: Cómo corre la CI de graph_ui
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:ci
---

# Cómo corre la CI de graph_ui

## Answer

.github/workflows/ci.yml corre en cada push a master y en cada PR, con tres jobs. mindmap: pytest sobre tests/ sin los e2e_* y node --test tests/*.test.mjs. review-workbench: npm ci en apps/review-workbench, luego tsc -p tsconfig.app.json --noEmit, vitest run y scripts/lint-architecture.mjs (los mismos comandos que tests/test_review_workbench.py, que localmente se salta sin node_modules). e2e: Playwright con chromium (playwright install --with-deps chromium) y pytest tests/e2e_*.py. Los repos hermanos (structuredLanguageDB, pron, deskops, spec2viz) se instalan desde sus ramas principales en git según .github/requirements-suite.txt, porque no hay releases hasta que la suite completa esté lista; spec2viz va editable y clonado fuera del checkout (--src) porque los tests de notación leen sus pilotos en docs/. tests/test_ci_workflow.py fija esa forma.

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

FILE:frontends/mindmap/projection_views.py
"""Projection views: which slice of a store to look at, evaluated with sldb's API only.

A view is a ``ViewDoc`` of the store (its model lives in sldb, next to ``NotationDoc``;
desk/drawer/PROJECTION_GRAMMAR_SPEC.md §3). It names models, ``where`` predicates and relation
types, never node ids or a store path, so the same view evaluates against any store:

- nodes: the documents of each ``nodes`` entry's ``model`` whose payload satisfies its ``where``
  (``sldb.api.where.where_matches``), united; no entries means every document;
- edges: the edges ``sldb.api.graph.execute_query`` keeps for ``RelationFilter(relations,
  direction)``, between two documents of that node set;
- layout: the view's ``layout``, else its notation's ``layout`` (``NotationDoc.layout``);
- notation: with a ``notation``, ``sldb.api.notations.resolve_documents`` applies it to the view's documents:
  each node's glyph, shape and resolved style (fill and stroke per theme, icon), each edge's colour,
  line and arrowhead (its ``LinkDoc``), the legend and the palette's ink per theme. With a
  notation that does not resolve, the view still evaluates and ``notation.error`` says why.

graph_ui only evaluates; drawing rules stay in sldb. The sldb calls live in
``mindmap.sldb_adapter`` (the one module of the mindmap that imports sldb).
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from mindmap.sldb_adapter import notation_documents, relation_edges, runtime_documents, where_holds

VIEW_MODEL = 'ViewDoc'
DIRECTIONS = ('both', 'outgoing', 'incoming')
DOCUMENT_PREFIX = 'sldb://document/'


class ViewError(ValueError):
    """The view is malformed (bad direction, non-list fields, a where that does not parse)."""


def node_id(model: str, name: str) -> str:
    """The edge-index id of a document: ``sldb://document/<Model>:<name>``."""
    return f'{DOCUMENT_PREFIX}{model}:{name}'


def _entries(view: dict[str, Any]) -> list[dict[str, str]]:
    entries = view.get('nodes') or []
    if not isinstance(entries, list) or not all(isinstance(e, dict) and e.get('model') for e in entries):
        raise ViewError('nodes must be a list of {model, where}')
    return [{'model': str(e['model']), 'where': str(e.get('where') or '')} for e in entries]


def _selected(doc: Any, entries: list[dict[str, str]]) -> bool:
    if not entries:
        return True
    try:
        return any(e['model'] == doc.model_name and where_holds(e['where'], doc.payload) for e in entries)
    except Exception as exc:  # WherePredicateError and friends: the view is wrong, not the store
        raise ViewError(f'where does not parse: {exc}') from exc


def _relation_filter(view: dict[str, Any]) -> tuple[list[str], str]:
    relations = view.get('relations') or []
    direction = view.get('direction') or 'both'
    if not isinstance(relations, list) or direction not in DIRECTIONS:
        raise ViewError(f'relations must be a list and direction one of {", ".join(DIRECTIONS)}')
    return [str(r) for r in relations], direction


def _title(doc: Any) -> str:
    payload = doc.payload or {}
    return str(payload.get('title') or payload.get('name') or doc.name)


def _layout(view: dict[str, Any], documents: list[Any]) -> dict[str, Any]:
    if view.get('layout'):
        return dict(view['layout'])
    notation = str(view.get('notation') or '').split(':', 1)[-1]
    found = next((d for d in documents if d.model_name == 'NotationDoc' and d.name == notation), None)
    return dict((found.payload or {}).get('layout') or {}) if found else {}


def _ink(documents: list[Any], palette: str) -> dict[str, str] | None:
    name = str(palette or '').split(':', 1)[-1]
    found = next((d for d in documents if d.model_name == 'PaletteDoc' and d.name == name), None)
    ink = (found.payload or {}).get('ink') if found else None
    return {'light': ink, 'dark': ink} if isinstance(ink, str) else ink


def _notation(store: Path, view: dict[str, Any], nodes: list[dict[str, Any]], edges: list[dict[str, Any]],
              documents: list[Any], pythonpath: str | None) -> dict[str, Any]:
    """The view's notation over its nodes and edges, as sldb resolves it (graph_ui only maps it back)."""
    try:
        resolved = notation_documents(store, str(view['notation']), [f"{n['model']}:{n['name']}" for n in nodes], pythonpath)
    except ValueError as exc:
        return {'error': str(exc)}
    by_doc = {n['doc']: n for n in resolved['nodes']}
    keys = ('glyph', 'shape', 'function', 'keyword', 'label', 'style')
    styled = {n['id']: {k: by_doc[ref].get(k) for k in keys}
              for n in nodes if (ref := f"{n['model']}:{n['name']}") in by_doc}
    links = {(l['source'], l['target'], l['relation']): l for l in resolved['links']}
    plain = lambda ref: ref[len(DOCUMENT_PREFIX):] if ref.startswith(DOCUMENT_PREFIX) else ref  # noqa: E731
    keys = ('link', 'draw', 'line', 'color', 'source_end', 'target_end', 'label')
    edge_styles = [{k: link.get(k) for k in keys} if (link := links.get((plain(e['source']), plain(e['target']), e['relation_type']))) else None
                   for e in edges]
    return {'notation': resolved['notation'], 'palette': resolved.get('palette') or '', 'ink': _ink(documents, resolved.get('palette')),
            'nodes': styled, 'edges': edge_styles, 'legend': resolved['legend'], 'skipped': resolved.get('skipped') or []}


def evaluate_view(store: str | Path, view: dict[str, Any], pythonpath: str | None = None) -> dict[str, Any]:
    """The view's nodes, edges and layout over ``store`` (a ``.sldb`` directory)."""
    store = Path(store)
    entries, (relations, direction) = _entries(view), _relation_filter(view)
    documents = runtime_documents(store, pythonpath)
    selected = {node_id(d.model_name, d.name): d for d in documents if _selected(d, entries)}
    seen = {(source, target, relation) for node, source, target, relation in relation_edges(store, relations, direction)
            if node in selected and source in selected and target in selected}
    result = {
        'view': view,
        'nodes': [{'id': key, 'model': d.model_name, 'name': d.name, 'title': _title(d), 'payload': d.payload}
                  for key, d in sorted(selected.items())],
        'edges': [{'source': s, 'target': t, 'relation_type': r} for s, t, r in sorted(seen)],
        'layout': _layout(view, documents),
    }
    if view.get('notation'):
        result['notation'] = _notation(store, view, result['nodes'], result['edges'], documents, pythonpath)
    return result


def list_views(store: str | Path, pythonpath: str | None = None) -> list[dict[str, Any]]:
    """The store's ``ViewDoc``s, as ``{ref, payload}``."""
    documents = runtime_documents(store, pythonpath)
    return [{'ref': f'{VIEW_MODEL}:{d.name}', 'payload': d.payload}
            for d in sorted(documents, key=lambda d: d.name) if d.model_name == VIEW_MODEL]


def find_view(store: str | Path, ref: str, pythonpath: str | None = None) -> dict[str, Any] | None:
    """One ``ViewDoc``'s payload by ``ViewDoc:<name>`` (or bare name); None when missing."""
    name = ref.split(':', 1)[-1]
    return next((v['payload'] for v in list_views(store, pythonpath) if v['ref'].split(':', 1)[1] == name), None)

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

FILE:frontends/mindmap/serve.py
#!/usr/bin/env python3
"""Serve the KB editor, SLDB proxy and validated persistence bridge.

Dos modos, elegidos por GRAPH_UI_BACKEND (default 'local'):

- local (intacto): EditorStore en proceso; depende de pron
  (AVISO-imports-rotos.md) y de los módulos models_service/compilation.
- remote: TODAS las lecturas que sldb serve expone hoy se sirven desde
  ahí (SLDB_URL): /api/schema, /api/graph, /api/edges*, /api/graph/*,
  /api/models, /api/models/detail, /api/lint, /api/health,
  /api/semantic-export y lecturas futuras (/document, /document/ir) sin
  tocar código. Las ESCRITURAS con equivalente en sldb serve también se
  migran: /api/save (los 'changes' viajan a POST /save; la view, estado
  de presentación, se persiste LOCAL en runtime/mindmap-view.json solo si
  el guardado remoto fue exitoso) y /api/models/{fields-add, fields-remove,
  template-edit, validate, promote} → POST homólogo. Los POST
  /api/models/list y /api/models/detail (lecturas) se traducen al GET
  homólogo. La COMPILACIÓN (/api/validate, /api/plan, /api/compile,
  /api/export) NO tiene equivalente en sldb serve y sigue en el proceso
  local incluso en modo remote: responde 501 explícito. Las rutas /sldb/*
  son un proxy pasante en ambos modos.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse
import errno
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

SLDB_UPSTREAM = os.environ.get('SLDB_URL', 'http://127.0.0.1:8787')
BACKEND_MODE = os.environ.get('GRAPH_UI_BACKEND', 'local')
MINDMAP_DIR = Path(__file__).resolve().parent
VIEW_FILENAME = 'mindmap-view.json'


def view_file():
    """Archivo de vista del editor (presentación; NUNCA va a sldb).

    Misma ubicación que el modo local (SldbAdapter):
    <store>/runtime/mindmap-view.json. En modo remote el store local se
    toma de SLDB_STORE; default: el .sldb de graph_ui.
    """
    store = Path(os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    return store / 'runtime' / VIEW_FILENAME


def local_view():
    """Vista local actual + su revision (sha256 del archivo), como en local."""
    path = view_file()
    raw = path.read_bytes() if path.exists() else b'{}'
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f'El archivo de vista está corrupto: {exc}') from exc
    if not isinstance(parsed, dict):
        raise ValueError('El archivo de vista no contiene un objeto JSON.')
    return {'view': parsed, 'revision': hashlib.sha256(raw).hexdigest()}


def write_local_view(view):
    """Persistencia atómica de la vista local (tmp + replace), como SldbAdapter."""
    path = view_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(view, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)


class ProxyHandler(SimpleHTTPRequestHandler):
    editor_store = None
    compilation = None
    workspace_routes = None
    backend_mode = BACKEND_MODE
    # Modo local: se reemplaza por persistence.SaveError al construir el handler.
    save_error = Exception

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(MINDMAP_DIR), **kwargs)

    def json_response(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _proxy_request(self, method):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))) if method == 'POST' else None
        req = urllib.request.Request(SLDB_UPSTREAM + self.path[len('/sldb'):], data=body,
            headers={'Content-Type': 'application/json'}, method=method)
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                self.json_response(json.loads(response.read()), response.status)
        except urllib.error.HTTPError as exc:
            self.json_response(json.loads(exc.read()), exc.code)
        except (urllib.error.URLError, TimeoutError) as exc:
            self.json_response({'ok': False, 'error': f'SLDB no responde: {exc}'}, 502)

    def _remote_get(self, path):
        """GET a sldb serve y reenvía el JSON tal cual (proxy transparente)."""
        req = urllib.request.Request(SLDB_UPSTREAM + path, method='GET')
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                return json.loads(response.read()), response.status
        except urllib.error.HTTPError as exc:
            return json.loads(exc.read()), exc.code
        except (urllib.error.URLError, TimeoutError) as exc:
            return {'ok': False, 'error': f'SLDB no responde: {exc}'}, 502

    def _remote_post(self, route, body):
        """POST a sldb serve y reenvía el JSON tal cual (proxy transparente)."""
        data = json.dumps(body).encode()
        req = urllib.request.Request(SLDB_UPSTREAM + route, data=data,
            headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return json.loads(response.read()), response.status
        except urllib.error.HTTPError as exc:
            return json.loads(exc.read()), exc.code
        except (urllib.error.URLError, TimeoutError) as exc:
            return {'ok': False, 'error': f'SLDB no responde: {exc}'}, 502

    def _api_notation_view(self):
        """GET /api/notation/view?spec=<SpecDoc>: el spec dibujado según su notación.

        Lo resuelve sldb (``sldb.api.notations.resolve_view``) sobre el store local; sldb serve
        no tiene equivalente, así que en remote responde 501 explícito.
        """
        if self.backend_mode == 'remote':
            return self.json_response({'ok': False, 'error': 'La vista de notación solo existe en modo local: resolve_view necesita el store en disco.'}, 501)
        spec = (parse_qs(urlparse(self.path).query).get('spec') or [None])[0]
        if not spec:
            return self.json_response({'ok': False, 'error': 'spec es obligatorio'}, 400)
        try:
            self.json_response(self.editor_store.notation_view(spec))
        except self.save_error as exc:
            self.json_response({'ok': False, 'error': str(exc)}, getattr(exc, 'status', 500))

    def _api_views(self, method, body):
        """/api/views*: projection views (mindmap.views_routes), local mode only like notation."""
        if self.backend_mode == 'remote':
            return self.json_response({'ok': False, 'error': 'Las vistas solo existen en modo local: se evalúan sobre un store en disco.'}, 501)
        from mindmap.views_routes import dispatch
        url = urlparse(self.path)
        payload, status = dispatch(method, url.path, parse_qs(url.query), body, self.editor_store.store)
        self.json_response(payload, status)

    def _api_workers(self):
        """GET /api/workers: agentes vivos, via `deskops runtime workers`.

        El estado de workers NO vive en sldb, asi que esta ruta se resuelve
        siempre localmente, antes del proxy remote de /api/*.

        Se delega en deskops (no en `herdr` directo) porque ahi vive el
        contrato: HerdrProvider.list_agents() ya valida la respuesta de Herdr
        y trata un `agents` ausente como cambio de contrato, no como flota
        vacia. Este handler solo transporta ese JSON al navegador.

        Si deskops falta o falla, se responde 200 con lista vacia y error: la
        GUI debe seguir viva sin el runtime (nunca 500).
        """
        binary = shutil.which('deskops')
        if not binary:
            return self.json_response({'workers': [], 'error': 'deskops no esta instalado.'})
        command = [binary, 'runtime', 'workers', '--format', 'json']
        try:
            proc = subprocess.run(command, capture_output=True, timeout=10)
        except subprocess.TimeoutExpired:
            return self.json_response({'workers': [], 'error': 'deskops runtime workers excedio el timeout de 10s.'})
        except OSError as exc:
            return self.json_response({'workers': [], 'error': f'No se pudo ejecutar deskops: {exc}'})
        if proc.returncode != 0:
            # deskops imprime 'Error: <msg>' en stdout y sale con 1.
            detail = (proc.stdout or proc.stderr).decode(errors='replace').strip()
            return self.json_response({'workers': [], 'error': detail or f'deskops fallo (exit {proc.returncode}).'})
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:
            return self.json_response({'workers': [], 'error': f'deskops devolvio JSON invalido: {exc}'})
        # Sin default: un 'workers' AUSENTE es un cambio de contrato de
        # deskops, no una flota vacia. Degradar en silencio dejaria la GUI
        # mostrando cero workers como si todo estuviera bien.
        workers = payload.get('workers') if isinstance(payload, dict) else None
        if not isinstance(workers, list):
            return self.json_response({'workers': [], 'error': 'deskops devolvio una estructura inesperada.'})
        # Se reenvia el payload completo, no solo 'workers': deskops tambien
        # emite 'spaces' (agrupado por space, con label y orden de Herdr) y
        # reconstruir el dict aqui lo descartaba, dejando al panel en su
        # fallback de agrupar por id crudo. Validamos 'workers' y dejamos
        # pasar el resto para no tener que editar este handler cada vez que
        # deskops agrega una clave.
        self.json_response(payload)

    def _remote_graph(self):
        """GET /api/graph en modo remote: documentos de sldb + vista local.

        La vista (positions/collapsed/viewRevision) es estado de presentación
        del editor: vive en runtime/mindmap-view.json del lado local (§3 del
        doc de migración), nunca en el store. La revision real del archivo se
        sirve para que el guard guard-guard de viewRevision funcione igual que
        en modo local.
        """
        payload, status = self._remote_get('/graph')
        if status != 200 or not isinstance(payload, dict):
            return self.json_response(payload, status)
        try:
            payload = {'documents': payload.get('documents', []), **local_view()}
        except (ValueError, OSError) as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, 500)
        self.json_response(payload, 200)

    def _remote_graph_payload(self):
        """Grafo remoto + vista local, para el contrato {documents, view, revision}.

        Se mezcla en las respuestas de /api/save (éxito y error): el frontend
        usa documents/revision para refrescar la baseline tras guardar o
        tras un 409, igual que en modo local. None si sldb no responde.
        """
        documents, status = self._remote_get('/graph')
        if status != 200 or not isinstance(documents, dict):
            return None
        try:
            return {'documents': documents.get('documents', []), **local_view()}
        except (ValueError, OSError):
            return None

    def _remote_read(self, route):
        """GET /api/* en modo remote: traduce la ruta a la lectura homóloga de
        sldb serve y reenvía el JSON tal cual, incluido el status 404 cuando
        sldb no implementa la ruta.

        Mapeo 1:1: /api/schema -> /schema, /api/edges/node -> /edges/node,
        /api/graph/neighborhood -> /graph/neighborhood, /api/lint -> /lint, ...
        La query string se preserva. Cubre automáticamente cualquier lectura
        futura (/document, /document/ir) sin cambios aquí.
        """
        upstream = route[len('/api'):]
        if not upstream:
            return self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
        query = urlparse(self.path).query
        payload, status = self._remote_get(upstream + (f'?{query}' if query else ''))
        self.json_response(payload, status)

    def _read_remote_body(self):
        """Body JSON de un POST en modo remote; mismos guards que modo local.

        En error envía la respuesta (413/400) y devuelve None.
        """
        try:
            size = int(self.headers.get('Content-Length', 0))
            if size < 0:
                raise ValueError('Content-Length inválido.')
            if size > 5_000_000:
                self.json_response({'ok': False, 'error': 'Solicitud demasiado grande.'}, 413)
                return None
            request = json.loads(self.rfile.read(size))
            if not isinstance(request, dict):
                raise ValueError('Solicitud inválida.')
            return request
        except (ValueError, json.JSONDecodeError) as exc:
            self.json_response({'ok': False, 'error': str(exc)}, 400)
            return None

    def _remote_save(self, request):
        """POST /api/save en modo remote: changes → sldb /save; vista → local.

        Se parte la transacción como en modo local (EditorStore.save): los
        'changes' (semántica) viajan al store en POST /save batch; la 'view'
        (presentación) se valida contra la revision local y se persiste en
        runtime/mindmap-view.json SOLO si el guardado remoto fue exitoso. Si
        POST /save falla, la vista NO se escribe.

        Los códigos de sldb se reenvían tal cual (409 conflicto por expected
        stale / doc existente, 422 payload inválido, 500 fallo parcial con
        completed) y el body lleva el grafo refrescado, igual que local.
        """
        changes = request.get('changes')
        view = request.get('view', {})
        if not isinstance(changes, list) or len(changes) > 500:
            return self.json_response({'ok': False, 'error': 'Lista de cambios inválida.'}, 400)
        if not isinstance(view, dict):
            return self.json_response({'ok': False, 'error': 'Vista inválida.'}, 400)
        try:
            current = local_view()
        except (ValueError, OSError) as exc:
            return self.json_response({'ok': False, 'error': str(exc)}, 500)
        if request.get('viewRevision') != current['revision']:
            # Conflicto de revisión de la vista (otra sesión la cambió):
            # igual que local, se responde 409 con el grafo refrescado.
            return self.json_response({'ok': False,
                'error': 'El mapa cambió en otra sesión. Recarga antes de guardar.',
                **(self._remote_graph_payload() or {})}, 409)
        payload, status = self._remote_post('/save', {'changes': changes})
        if status != 200:
            # El guardado remoto falló: NO se escribe la vista. Se reenvía el
            # error de sldb (409/422/500+) con grafo refrescado en el body.
            return self.json_response({**payload, **(self._remote_graph_payload() or {})}, status)
        try:
            write_local_view(view)
        except OSError as exc:
            return self.json_response({'ok': False, 'error': f'No se pudo guardar la vista: {exc}'}, 500)
        merged = self._remote_graph_payload()
        if merged:
            payload.update(merged)
        # {ok, saved, documents, view, revision}: contrato idéntico al local.
        self.json_response(payload, 200)

    def do_GET(self):
        route = urlparse(self.path).path
        if route.startswith('/api/desk/'):
            return self.desk_routes.dispatch(self, 'GET')
        if route.startswith('/api/workspace/'):
            if self.backend_mode == 'remote':
                return self.json_response({'ok': False, 'error': 'Workspace multi-proyección no disponible en modo remote.'}, 501)
            return self.workspace_routes.dispatch(self, 'GET')
        if route == '/api/workers':
            # Se resuelve ANTES del proxy remote: el estado de workers no
            # vive en sldb y no debe reenviarse.
            self._api_workers()
            return
        if route == '/api/notation/view':
            self._api_notation_view()
            return
        if route == '/api/views' or route.startswith('/api/views/'):
            self._api_views('GET', None)
            return
        if self.backend_mode == 'remote' and route.startswith('/api/'):
            if route == '/api/graph':
                self._remote_graph()
            else:
                self._remote_read(route)
            return
        if route == '/api/schema':
            try:
                self.json_response(self.editor_store.schema())
            except Exception as exc:  # noqa: BLE001  never drop the connection: say what failed
                self.json_response({'ok': False, 'error': f'No se pudo leer el schema del store: {exc}'}, 500)
        elif route == '/api/graph':
            try:
                self.json_response(self.editor_store.graph())
            except Exception as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
        elif route in ('/api/document', '/api/document/ir'):
            # Lectura con IR: misma forma que GET /document de sldb serve
            # ({id, model_name, path, payload, semantic_tags, ir}). En modo
            # remote lo sirve _remote_read; aquí es el equivalente local.
            name = (parse_qs(urlparse(self.path).query).get('id') or [None])[0]
            if not name:
                return self.json_response({'ok': False, 'error': 'id es obligatorio'}, 400)
            try:
                doc = self.editor_store.document_ir(name)
            except self.save_error as exc:
                return self.json_response({'ok': False, 'error': str(exc)}, exc.status)
            body = doc['ir'] if route == '/api/document/ir' else doc
            self.json_response(body)
        elif route.startswith('/api/'):
            self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
        elif route.startswith('/sldb/'):
            self._proxy_request('GET')
        else:
            # SPA fallback: a client-side route (/documents/map, /draft/tree,
            # /models/diagram, ...) has no file on disk and its last segment
            # has no extension, so serve the app shell and let router.js
            # resolve it from location.pathname.
            static_path = Path(self.translate_path(route))
            if route != '/' and not static_path.exists() and '.' not in static_path.name:
                self.path = '/index.html'
            super().do_GET()

    def do_POST(self):
        route = urlparse(self.path).path
        if route.startswith('/api/desk/'):
            return self.desk_routes.dispatch(self, 'POST')
        if route.startswith('/api/views/'):
            origin = self.headers.get('Origin')
            if origin and urlparse(origin).netloc != self.headers.get('Host'):
                return self.json_response({'ok': False, 'error': 'Origen no permitido.'}, 403)
            request = self._read_remote_body()
            if request is not None:
                self._api_views('POST', request)
            return
        if route in ('/api/save', '/api/validate', '/api/plan', '/api/compile', '/api/export') or route.startswith('/api/models/'):
            if self.backend_mode == 'remote':
                # ── /api/save: changes → POST /save de sldb; vista → local (§3) ──
                if route == '/api/save':
                    request = self._read_remote_body()
                    if request is not None:
                        self._remote_save(request)
                    return
                # ── editor de clases: lecturas traducidas al GET homólogo ──
                if route in ('/api/models/list', '/api/models/detail'):
                    request = self._read_remote_body()
                    if request is None:
                        return
                    if route == '/api/models/list':
                        payload, status = self._remote_get('/models')
                    else:
                        model = request.get('model')
                        if not model:
                            return self.json_response({'ok': False, 'error': 'model es obligatorio'}, 400)
                        payload, status = self._remote_get('/models/detail?model=' + quote(str(model)))
                    self.json_response(payload, status)
                    return
                # ── editor de clases: escrituras → POST homólogo de sldb ──
                if route.startswith('/api/models/'):
                    action = route.rsplit('/', 1)[-1]
                    if action not in ('fields-add', 'fields-remove', 'template-edit', 'validate', 'promote'):
                        return self.json_response({'ok': False, 'error': f'Acción desconocida: {action}'}, 400)
                    request = self._read_remote_body()
                    if request is not None:
                        # El class-dialog.js manda las mismas claves que sldb
                        # (model, field_name, field_type, description, default,
                        # content): reenvío 1:1, respuesta tal cual.
                        payload, status = self._remote_post('/models/' + action, request)
                        self.json_response(payload, status)
                    return
                # ── compilación: sin equivalente en sldb, sigue local-only ──
                # (compilation.py + compiler.py + contract.py; §2.3 del doc.)
                if route in ('/api/validate', '/api/plan', '/api/compile', '/api/export'):
                    return self.json_response({'ok': False,
                        'error': f'Modo remote: {route} no tiene equivalente en sldb serve y sigue en el proceso local (no migrado). Arranca en modo local para usarlo.'}, 501)
                return self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)
            # A local write endpoint must not accept cross-origin browser writes.
            origin = self.headers.get('Origin')
            if origin and urlparse(origin).netloc != self.headers.get('Host'):
                return self.json_response({'ok': False, 'error': 'Origen no permitido.'}, 403)
            try:
                size = int(self.headers.get('Content-Length', 0))
                if size < 0:
                    raise ValueError('Content-Length inválido.')
                if size > 5_000_000:
                    return self.json_response({'ok': False, 'error': 'Solicitud demasiado grande.'}, 413)
                request = json.loads(self.rfile.read(size))
                if not isinstance(request, dict):
                    raise ValueError('Solicitud inválida.')
                if route == '/api/save':
                    self.json_response(self.editor_store.save(request))
                    return
                if route.startswith('/api/models/'):
                    from mindmap.models_service import (detail as _detail, list_models as _list_models,
                        template_edit as _template_edit, fields_add as _fields_add,
                        fields_remove as _fields_remove, validate as _validate, promote as _promote)
                    action = route.rsplit('/', 1)[-1]
                    store = self.editor_store.pron_store
                    if action == 'detail':
                        self.json_response(_detail(store, request['model']))
                    elif action == 'list':
                        self.json_response({'models': _list_models(store)})
                    elif action == 'template-edit':
                        self.json_response(_template_edit(store, request['model'], request['content']))
                    elif action in ('fields-add', 'fields-remove') and not str(request.get('field_name') or '').strip():
                        self.json_response({'ok': False, 'error': 'field_name es obligatorio'}, 400)
                    elif action == 'fields-add':
                        self.json_response(_fields_add(store, request['model'], request['field_name'],
                            request.get('field_type', 'str'), request.get('description', ''), request.get('default', '')))
                    elif action == 'fields-remove':
                        self.json_response(_fields_remove(store, request['model'], request['field_name']))
                    elif action == 'validate':
                        self.json_response(_validate(store, request['model']))
                    elif action == 'promote':
                        self.json_response(_promote(store, request['model']))
                    else:
                        self.json_response({'ok': False, 'error': f'Acción desconocida: {action}'}, 400)
                    return
                else:
                    report, status = self.compilation.run(route.rsplit('/', 1)[1], request)
                    self.json_response(report, status)
            except self.save_error as exc:
                self.json_response({'ok': False, 'error': str(exc), 'completed': exc.completed,
                    **self.editor_store.graph()}, exc.status)
            except (ValueError, KeyError, TypeError) as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 400)
            except (Exception, SystemExit) as exc:
                self.json_response({'ok': False, 'error': str(exc)}, 500)
        elif route.startswith('/sldb/'):
            self._proxy_request('POST')
        else:
            self.json_response({'ok': False, 'error': 'Ruta desconocida.'}, 404)


def _build_local_handler(store):
    """Arranque de siempre: EditorStore en proceso + compilador.

    Imports diferidos a propósito: dependen de pron (AVISO-imports-rotos.md) y
    solo deben cargarse en modo local; en modo remote el servidor arranca sin
    pron. Si la dependencia falta, falla con el mismo ModuleNotFoundError de
    siempre.
    """
    from mindmap.persistence import EditorStore, SaveError
    from mindmap.compilation import CompilationService
    backend = EditorStore(store)
    return type('EditorHandler', (ProxyHandler,), {
        'editor_store': backend, 'compilation': CompilationService(backend.adapter),
        'backend_mode': 'local', 'save_error': SaveError})


def make_server(port=8088, store=None):
    from mindmap.deskops_routes import configured_routes
    selected_store = store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb'))
    if BACKEND_MODE == 'remote':
        handler = type('EditorHandler', (ProxyHandler,), {'backend_mode': 'remote'})
    else:
        handler = _build_local_handler(
            store or os.environ.get('SLDB_STORE', str(MINDMAP_DIR.parent.parent / '.sldb')))
    handler.desk_routes = configured_routes(selected_store, BACKEND_MODE, os.environ.get('DESKOPS_ROOT'))
    from mindmap.workspace_routes import configured_workspace_routes
    handler.workspace_routes = configured_workspace_routes(selected_store, getattr(handler, 'editor_store', None))
    return ThreadingHTTPServer(('127.0.0.1', port), handler)


def import_roots(argv, environ=os.environ):
    """(--pythonpath dirs + SLDB_PYTHONPATH entries, rest of argv): where the store's model
    modules import from when they do not live in an installed package (G1)."""
    roots, rest, args = [], [], list(argv)
    while args:
        arg = args.pop(0)
        if arg == '--pythonpath' and args:
            roots.append(args.pop(0))
        elif arg.startswith('--pythonpath='):
            roots.append(arg.split('=', 1)[1])
        else:
            rest.append(arg)
    roots += [p for p in environ.get('SLDB_PYTHONPATH', '').split(os.pathsep) if p]
    return [str(Path(r).expanduser().resolve()) for r in roots], rest


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    roots, argv = import_roots(argv)
    for root in reversed(roots):
        if root not in sys.path:
            sys.path.insert(0, root)
    port = int(argv[0]) if argv else 8088
    try:
        server = make_server(port)
    except OSError as exc:
        if exc.errno != errno.EADDRINUSE:
            raise
        print(f'El puerto {port} ya está en uso (¿otro serve.py corriendo?). '
              f'Elige otro: python3 frontends/mindmap/serve.py {port + 1}', file=sys.stderr)
        raise SystemExit(2)
    if BACKEND_MODE == 'remote':
        print(f'KB Mindmap (remote): http://127.0.0.1:{port}/ · sldb: {SLDB_UPSTREAM}', flush=True)
    else:
        print(f'KB Mindmap: http://127.0.0.1:{port}/ · store: {server.RequestHandlerClass.editor_store.store}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()

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

FILE:.github/requirements-suite.txt
# Sibling repos of the SLDB_1 suite, installed from their main branches: there are no
# releases or tags until the whole suite is ready (owner's rule), and deskops already
# needs structuredLanguageDB>=0.1.13, which is not on PyPI.
structuredLanguageDB @ git+https://github.com/jpcosec/sldb@main
pron @ git+https://github.com/jpcosec/pron@master
deskops @ git+https://github.com/jpcosec/opsys@main

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

FILE:tests/test_mindmap_notation.py
"""Contrato de GET /api/notation/view: un SpecDoc dibujado según su NotationDoc.

graph_ui no interpreta la notación: la resuelve
``sldb.api.notations.resolve_view`` (sldb/docs/architecture/notations-and-views.md)
y este endpoint solo la transporta. El store es real y temporal: se arma con
``sldb notations sync --spec`` sobre los pilotos de tests/fixtures/notation-pilots,
sin tocar ningún store existente.
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

from sldb.api.notations import resolve_view

MINDMAP = Path(__file__).resolve().parents[1] / "frontends/mindmap"
PILOTS = Path(__file__).resolve().parent / "fixtures/notation-pilots"
STATECHART = "state.diagram-sync-lifecycle"
CLASSES = "class.sldb-models"


def _load(name):
    spec = importlib.util.spec_from_file_location(name, MINDMAP / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    root = tmp_path_factory.mktemp("notation")
    pilots = [PILOTS / "state-diagram-sync-lifecycle.yml", PILOTS / "class-sldb-models.yml"]
    for pilot in pilots:
        shutil.copy(pilot, root / pilot.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for p in pilots for a in ("--spec", p.name)], "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


class _Server:
    def __init__(self, serve, store):
        self.server = serve.make_server(port=0, store=store)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def get(self, path):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=30) as res:
                return res.status, json.loads(res.read())
        except urllib.error.HTTPError as exc:
            return exc.code, json.loads(exc.read())

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture
def server(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "local")
    running = _Server(_load("serve"), store)
    yield running
    running.stop()


def test_view_is_resolve_view_verbatim(server, store):
    status, body = server.get(f"/api/notation/view?spec={STATECHART}")
    assert status == 200
    # graph_ui no reinterpreta: lo servido es exactamente lo que resuelve sldb.
    assert body == json.loads(json.dumps(resolve_view(str(store), f"SpecDoc:{STATECHART}", str(store.parent))))


def test_statechart_brings_nest_links_and_the_initial_marker(server):
    _, view = server.get(f"/api/notation/view?spec=SpecDoc:{STATECHART}")
    assert view["notation"] == "NotationDoc:statechart" and view["skipped"] == []
    ids = {n["doc"] for n in view["nodes"]}
    assert all(link["source"] in ids and link["target"] in ids for link in view["links"])
    nests = [link for link in view["links"] if link["draw"] == "nest"]
    assert len(nests) == 3 and all(link["doc"] is None for link in nests)
    assert {link["source"].rsplit(".", 1)[-1] for link in nests} == {"syncing"}
    marked = [n for n in view["nodes"] if n["markers"]]
    assert [m["id"] for n in marked for m in n["markers"]] == ["initial"]


def test_class_diagram_brings_compartments_and_terminals(server):
    _, view = server.get(f"/api/notation/view?spec={CLASSES}")
    assert view["layout"]["kind"] == "graph"
    assert any(c["items"] for n in view["nodes"] for c in n["compartments"])
    assert all(link["draw"] == "line" for link in view["links"])
    assert {link["target_end"] for link in view["links"]} - {"none", None}


def test_unknown_spec_is_404_and_missing_param_is_400(server):
    assert server.get("/api/notation/view?spec=no-existe")[0] == 404
    assert server.get("/api/notation/view")[0] == 400


def test_remote_backend_answers_501_without_proxying(store, monkeypatch):
    monkeypatch.setenv("GRAPH_UI_BACKEND", "remote")
    running = _Server(_load("serve"), store)
    try:
        status, body = running.get(f"/api/notation/view?spec={STATECHART}")
    finally:
        running.stop()
    assert status == 501 and "modo local" in body["error"]

FILE:tests/test_mindmap_skin.py
"""Skin layer: theme tokens as CSS custom properties, class identity as
stable slots. Real files on disk, no mocks — this is the acceptance check
for Phase A of the skin refactor.
"""
import re
from pathlib import Path

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
SKINS_DIR = MINDMAP / "skins"

HEX_RE = re.compile(r'#[0-9a-fA-F]{3,8}')
VAR_DEF_RE = re.compile(r'--[a-zA-Z0-9-]+(?=\s*:)')
VAR_USE_RE = re.compile(r'var\(\s*(--[a-zA-Z0-9-]+)')


def _source_files():
    files = []
    for pattern in ("*.js", "*.mjs"):
        files.extend(MINDMAP.glob(pattern))
        files.extend((MINDMAP / "shell").glob(pattern))
        files.extend((MINDMAP / "shared").glob(pattern))
    # CSS now lives split across styles/ and views/**/*.css (Phase E), not
    # just the top-level file — scan the whole mindmap tree for it.
    files.extend(MINDMAP.rglob("*.css"))
    return files


def test_no_hardcoded_hex_outside_skins():
    offenders = {}
    for path in _source_files():
        if SKINS_DIR in path.parents:
            continue
        hits = HEX_RE.findall(path.read_text(encoding="utf-8"))
        if hits:
            offenders[str(path)] = hits
    assert not offenders, f"hex literals leaked outside skins/: {offenders}"


def test_light_and_dark_skins_define_the_same_tokens():
    light = VAR_DEF_RE.findall((SKINS_DIR / "light.css").read_text(encoding="utf-8"))
    dark = VAR_DEF_RE.findall((SKINS_DIR / "dark.css").read_text(encoding="utf-8"))
    light_set, dark_set = set(light), set(dark)
    assert light_set == dark_set, (
        f"only in light: {light_set - dark_set}; only in dark: {dark_set - light_set}"
    )
    for n in range(1, 24):
        assert f"--class-color-{n}" in light_set, f"missing --class-color-{n}"
    # no duplicated definitions inside a single skin
    assert len(light) == len(light_set), "duplicate token definitions in light.css"
    assert len(dark) == len(dark_set), "duplicate token definitions in dark.css"


def test_every_var_reference_is_defined_in_the_skins():
    light_tokens = set(VAR_DEF_RE.findall((SKINS_DIR / "light.css").read_text(encoding="utf-8")))
    missing = {}
    for path in _source_files():
        if SKINS_DIR in path.parents:
            continue
        text = path.read_text(encoding="utf-8")
        used = set(VAR_USE_RE.findall(text))
        # --class-color and --idea-color are set inline (per-element style), not skin tokens; so are
        # --glyph-* (the style sldb resolves for each glyph of the Specs view, always with a fallback)
        # and --inner-* (the inner area of an outline shape, from notation-style.mjs).
        used = {u for u in used if not u.startswith(("--class-color", "--glyph-", "--inner-")) and u != "--idea-color"}
        gap = used - light_tokens
        if gap:
            missing[str(path)] = gap
    assert not missing, f"var(--x) referenced but not defined by the skins: {missing}"


def test_class_slots_and_fallback_slots_are_in_range():
    text = (MINDMAP / "shared" / "classes.mjs").read_text(encoding="utf-8")
    slots = [int(n) for n in re.findall(r'slot\s*:\s*(\d+)', text)]
    assert slots, "no se encontraron slots en shared/classes.mjs"
    for s in slots:
        assert 1 <= s <= 23, f"slot fuera de rango: {s}"
    fallback_match = re.search(r'FALLBACK_SLOTS\s*=\s*\[([^\]]+)\]', text)
    assert fallback_match, "FALLBACK_SLOTS no encontrado"
    fallback_slots = [int(n) for n in re.findall(r'\d+', fallback_match.group(1))]
    assert fallback_slots, "FALLBACK_SLOTS está vacío"
    for s in fallback_slots:
        assert 1 <= s <= 23, f"slot de fallback fuera de rango: {s}"

FILE:tests/e2e_notation_class.py
"""E2E: class specs in the Specs view, in Chromium.

- R9: tests/fixtures/notation-class/class-records.yml has associations with multiplicities at both ends,
  several converging on one class. Every multiplicity sits next to its own edge's end (within 24 px of
  it), outside every class box, and clear of edge labels and other multiplicities.
- R10: tests/fixtures/notation-class/class-large.yml has 26 records, only 8 of them related (15
  associations). With «Ver todo» it reads at >= 10 px: the 18 unrelated ones go in a grid (more than one
  row and one column) beside or below the related ones, and every class is inside the canvas.
- Framing: opening a spec straight away (as a reload with it chosen does), the automatic framing and
  «Ver todo» keep every class box, with all its compartments, inside the canvas with >= 8 px of margin.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import FRAMED, _measure, _round_two, _serve, assert_nodes_framed, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-class"
RECORDS, LARGE = "class.records-multiplicities", "class.large-schema"
UNRELATED = 18

ENDS = r"""() => {
  const r = (e) => e.getBoundingClientRect();
  const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const boxes = [...document.querySelectorAll('.notation-canvas .glyph:not(.is-container)')].map(r);
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(r);
  const ends = [...document.querySelectorAll('.notation-canvas .notation-end-label')];
  const toRect = (p, b) => Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
  return ends.map((l, i) => {
    const b = r(l), path = l.dataset.edge ? document.getElementById(l.dataset.edge) : null;
    let distance = Infinity;  // sin su arista no se puede ubicar: cuenta como lejos
    if (path) {
      const ctm = path.getScreenCTM(), total = path.getTotalLength();
      const at = (s) => { const p = path.getPointAtLength(s); return {x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}; };
      distance = +toRect(l.dataset.end === 'source' ? at(0) : at(total), b).toFixed(1);
    }
    return {text: l.textContent, end: l.dataset.end, distance,
            onBox: boxes.some((x) => overlap(x, b)), onLabel: labels.some((x) => overlap(x, b)),
            onEnd: ends.some((o, j) => j !== i && overlap(r(o), b))};
  });
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("class")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for s in specs for a in ("--spec", s.name)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_r9_multiplicities_sit_at_their_edge_end_outside_the_boxes(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, RECORDS)
            assert result["minTextPx"] >= 10 and result["labelOverlaps"] == 0 and result["spills"] == 0, result
            _round_two(result)
            ends = page.evaluate(ENDS)
            assert len(ends) == 18, ends
            bad = [e for e in ends if e["onBox"] or e["onLabel"] or e["onEnd"] or e["distance"] > 24]
            assert not bad, bad
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_r10_unrelated_classes_go_in_a_grid_and_the_whole_reads(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LARGE)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            grid = page.evaluate("""() => {
              const c = document.querySelector('.notation-canvas').getBoundingClientRect();
              const linked = new Set([...document.querySelectorAll('.notation-canvas .notation-edge-ends')].flatMap(g => [g.dataset.source, g.dataset.target]));
              const nodes = [...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => ({id: n.dataset.id, r: n.getBoundingClientRect()}));
              const loose = nodes.filter(n => !linked.has(n.id));
              return {loose: loose.length, rows: new Set(loose.map(n => Math.round(n.r.top))).size, cols: new Set(loose.map(n => Math.round(n.r.left + n.r.width / 2))).size,
                      outside: nodes.filter(n => n.r.left < c.left || n.r.right > c.right || n.r.top < c.top || n.r.bottom > c.bottom).length};
            }""")
            assert grid["loose"] == UNRELATED and grid["rows"] > 1 and grid["cols"] > 1 and grid["outside"] == 0, grid
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_opening_a_spec_frames_every_box_with_its_compartments(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            for spec in (RECORDS, LARGE):
                page.goto(f"{base}/specs/notation")
                page.wait_for_selector(".notation-catalog button", timeout=30000)
                page.evaluate("id => localStorage.setItem('kb-notation-spec', id)", spec)
                page.goto(f"{base}/specs/notation")
                page.wait_for_function("s => [...document.querySelectorAll('.notation-canvas .react-flow__node')].some(n => n.dataset.id.includes(s + '.'))",
                                       arg=spec, timeout=60000)
                page.wait_for_timeout(2500)
                assert page.evaluate(FRAMED) >= 8, spec
                assert_nodes_framed(page)
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:tests/e2e_notation_sequence.py
"""E2E: sequence specs in the Specs view, in Chromium.

tests/fixtures/notation-sequence/sequence-wide.yml has eleven participants (an actor, a boundary and
nine components), more than fit across the canvas at 100 %, grouped messages, self calls and replies.

- R12: every sample of the notation's legend stays in its own row: inside the row's box, clear of the
  legend's title, and the actor figure no taller than its sample.
- R11: «Ver todo» frames every participant across the canvas at >= 10 px. A sequence that fits whole
  at that size shows every message without scrolling (sequence-short.yml); a longer one stays at the
  legible scale and scrolls down to its last message, with the participants fixed on top. Nothing
  overlaps: message labels, participant heads and fragment tabs keep clear of each other, and labels
  carry a halo so lifelines crossing behind them do not strike the text.
- R14: a participant head holds its whole text — icon, keyword and every line of its name — inside its
  box, in the label's weight; a name wider than a lane wraps, a single word wider than a lane widens the
  head (sequence-styled.yml: icons and fills by kind).
- each link's sample in the legend draws the same arrowheads and dash as a real message of that link
  (synchronous: filled arrow; asynchronous: open arrow; return: dashed, open arrow).
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-sequence"
SPEC, SHORT, STYLED = "sequence.wide-request", "sequence.short-request", "sequence.styled-heads"

# Lo que se ve de una secuencia en el lienzo: escala, tamaño efectivo del texto, participantes dentro
# del lienzo, mensajes visibles y encimados entre rótulos, cabeceras y pestañas de fragmento.
LANES = r"""() => {
  const canvas = document.querySelector('.notation-canvas').getBoundingClientRect();
  const scroll = document.querySelector('.notation-scroll');
  const fit = document.querySelector('.notation-lanes-fit'), scale = Number(fit.dataset.scale);
  const rect = (el) => el.getBoundingClientRect();
  const within = (r) => r.left >= canvas.left - 0.5 && r.right <= canvas.right + 0.5 && r.top >= canvas.top - 0.5 && r.bottom <= canvas.bottom + 0.5;
  const overlap = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const band = document.querySelector('.lane-heads-band');
  const heads = [...band.querySelectorAll('.lane-head')].map(rect);
  const labels = [...document.querySelectorAll('.notation-lanes:not(.lane-heads-band *) .message-label')];
  const tabs = [...document.querySelectorAll('.lane-frame .frame-label')].map(rect);
  const texts = [...labels, ...document.querySelectorAll('.lane-frame .frame-label'), ...band.querySelectorAll('.glyph-label')];
  const minTextPx = Math.min(...texts.map((t) => parseFloat(getComputedStyle(t).fontSize) * scale));
  const boxes = labels.map(rect);
  let labelOverlaps = 0, onHeads = 0, onTabs = 0;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) if (overlap(boxes[i], boxes[j])) labelOverlaps++;
    if (heads.some((h) => overlap(h, boxes[i])) && boxes[i].top > rect(band).bottom) onHeads++;
    if (tabs.some((t) => overlap(t, boxes[i]))) onTabs++;
  }
  const visible = boxes.filter((b) => within(b) && b.top >= rect(band).bottom - 1).length;
  return {scale, minTextPx, participants: heads.length, headsInside: heads.every(within), labels: boxes.length, visible,
    scrolls: scroll.scrollHeight > scroll.clientHeight + 1, labelOverlaps, onHeads, onTabs,
    halo: labels.every((t) => getComputedStyle(t).paintOrder.startsWith('stroke'))};
}"""

# Muestra de cada link de la leyenda contra una arista real de ese link (mensaje de secuencia o arista
# del grafo): misma punta en cada extremo y mismo trazo. Las muestras sin arista en el diagrama no cuentan.
LEGEND_LINKS = r"""() => {
  const norm = (v) => (v || '').replace(/["']/g, '');
  const read = (el) => ({start: norm(el.getAttribute('marker-start')), end: norm(el.getAttribute('marker-end')),
                         dash: getComputedStyle(el).strokeDasharray});
  return [...document.querySelectorAll('.notation-legend .legend-link')].map((li) => {
    const link = li.dataset.link;
    const message = document.querySelector(`.lane-message[data-link="${link}"] .message-line`);
    const ends = document.querySelector(`.notation-edge-ends[data-link="${link}"]`);
    const real = message || (ends && ends.parentElement.querySelector('.react-flow__edge-path'));
    return {link, sample: read(li.querySelector('line')), real: real ? read(real) : null};
  });
}"""


def assert_legend_links_match(page, at_least):
    links = page.evaluate(LEGEND_LINKS)
    compared = [l for l in links if l["real"]]
    assert len(compared) >= at_least, links
    assert all(l["sample"] == l["real"] for l in compared), [l for l in compared if l["sample"] != l["real"]]
    return compared


LEGEND = r"""() => {
  const legend = document.querySelector('.notation-legend'), title = legend.querySelector('h3').getBoundingClientRect();
  return [...legend.querySelectorAll('li')].map((li) => {
    const row = li.getBoundingClientRect(), swatch = li.querySelector('.legend-swatch');
    const s = (swatch || li).getBoundingClientRect(), before = swatch ? getComputedStyle(swatch, '::before') : null;
    return {item: li.innerText.replace(/\s+/g, ' ').trim(), shape: li.dataset.shape || null,
            inside: s.top >= row.top - 0.5 && s.bottom <= row.bottom + 0.5 && s.left >= row.left - 0.5 && s.right <= row.right + 0.5,
            clearOfTitle: s.top >= title.bottom - 0.5,
            clipped: swatch ? getComputedStyle(swatch).overflow === 'hidden' : true,
            figure: before && before.content !== 'none' ? parseFloat(before.fontSize) <= s.height + 0.5 : true};
  });
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("sequence")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for s in specs for a in ("--spec", s.name)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _open(page, base, spec=SPEC):
    page.goto(f"{base}/specs/notation")
    page.wait_for_selector(".notation-catalog button", timeout=30000)
    page.click(f'[data-spec="{spec}"]')
    page.wait_for_selector(f'.lane-head[data-lane^="SpecNodeDoc:{spec}."]', timeout=30000)
    page.wait_for_timeout(600)


def test_r12_legend_samples_stay_in_their_rows(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            _open(page, base)
            rows = page.evaluate(LEGEND)
            assert any(r["shape"] == "stick-figure" for r in rows), rows
            bad = [r for r in rows if not (r["inside"] and r["clearOfTitle"] and r["clipped"] and r["figure"])]
            assert not bad, bad
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_legend_link_samples_draw_the_same_heads_and_dash_as_the_messages(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            _open(page, base)
            compared = {l["link"].split(".")[-1]: l["sample"] for l in assert_legend_links_match(page, 3)}
            assert compared["sync"]["end"] == "url(#nv-filled-arrow)" and compared["async"]["end"] == "url(#nv-open-arrow)", compared
            assert compared["return"]["end"] == "url(#nv-open-arrow)" and compared["return"]["dash"] not in ("none", ""), compared
            assert compared["sync"]["dash"] in ("none", "") and compared["async"]["dash"] in ("none", ""), compared
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_r11_view_all_frames_every_participant_legibly_and_scrolls_to_the_last_message(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            # Corta: entra entera, sin scroll.
            _open(page, base, SHORT)
            short = page.evaluate(LANES)
            assert short["participants"] == 4 and short["headsInside"] and not short["scrolls"], short
            assert short["visible"] == short["labels"] == 6 and short["minTextPx"] >= 10, short
            from e2e_notation_legibility import assert_nodes_framed
            assert_nodes_framed(page)  # entera: participantes y mensajes con margen
            # Ancha: «Ver todo» (también tras «100 %») encuadra a los 11 participantes a >= 10 px.
            _open(page, base)
            page.click(".notation-actual-size")
            page.get_by_role("button", name="⛶ Ver todo").click()
            page.wait_for_timeout(300)
            wide = page.evaluate(LANES)
            assert wide["participants"] == 11 and wide["headsInside"] and wide["minTextPx"] >= 10, wide
            assert wide["labels"] == 24 and wide["halo"], wide
            assert wide["labelOverlaps"] == 0 and wide["onHeads"] == 0 and wide["onTabs"] == 0, wide
            if wide["scrolls"]:
                # Bajando se llega al último mensaje y los participantes siguen a la vista.
                page.evaluate("() => { const s = document.querySelector('.notation-scroll'); s.scrollTop = s.scrollHeight; }")
                page.wait_for_timeout(300)
                bottom = page.evaluate(LANES)
                last = page.evaluate("() => { const ls = [...document.querySelectorAll('.lane-message')]; return ls[ls.length - 1].dataset.order; }")
                assert bottom["headsInside"], bottom
                inside = page.evaluate("""(order) => { const c = document.querySelector('.notation-canvas').getBoundingClientRect();
                  const r = document.querySelector(`.lane-message[data-order="${order}"] .message-label`).getBoundingClientRect();
                  return r.top >= c.top && r.bottom <= c.bottom; }""", last)
                assert inside, last
            else:
                assert wide["visible"] == wide["labels"], wide
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


# R14: el texto de cada cabecera (ícono, keyword y cada renglón del nombre) dentro de su caja, sin el borde.
HEADS = r"""() => [...document.querySelectorAll('.lane-head .glyph')].map(g => {
  const box = g.getBoundingClientRect(), b = parseFloat(getComputedStyle(g).borderLeftWidth) || 0;
  const parts = [...g.querySelectorAll('.glyph-line, .glyph-icon, .glyph-keyword, .glyph-label')].map(e => e.getBoundingClientRect()).filter(r => r.width > 0);
  const range = document.createRange(); range.selectNodeContents(g.querySelector('.glyph-label'));
  const text = range.getBoundingClientRect();
  const out = [...parts, text].reduce((m, r) => Math.max(m, box.left + b - r.left, r.right - (box.right - b), box.top + b - r.top, r.bottom - (box.bottom - b)), -Infinity);
  return {label: g.querySelector('.glyph-label').innerText, shape: [...g.classList].find(c => c.startsWith('shape-')), icon: Boolean(g.querySelector('svg.glyph-icon')),
          out: +out.toFixed(2), lines: g.querySelectorAll('.glyph-line').length, width: box.width};
})"""


def test_r14_participant_heads_hold_their_whole_text(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            _open(page, base, STYLED)
            page.wait_for_selector(".lane-head .glyph-icon", timeout=30000)
            page.click(".notation-actual-size")
            page.wait_for_timeout(1500)  # lucide carga aparte: el ícono pasa de hueco a SVG
            heads = [h for h in page.evaluate(HEADS) if h["shape"] != "shape-stick-figure"]
            assert len(heads) == 6 and all(h["out"] <= 0 for h in heads), [h for h in heads if h["out"] > 0]
            assert all(h["icon"] for h in heads), heads
            widest = next(h for h in heads if h["label"].startswith("Notification"))
            assert widest["width"] > 184, widest  # una palabra más ancha que un carril ensancha la cabecera
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:tests/e2e_notation_deployment.py
"""E2E: deployment specs in the Specs view (notation contract §14), in Chromium.

tests/fixtures/notation-deployment/deployment-nested-paths.yml nests nodes four levels deep (account >
network > cluster > service > artifact), joins nodes by communication paths with a label and a
protocol, and has a «deploy» (artifact -> node) and a «manifest» (artifact -> artifact). It checks:

- each element is drawn inside the box of the node that contains it, at every level;
- each communication path is a solid line between its two nodes, labelled with its label and protocol,
  the label nearer its own edge than any other;
- «deploy» and «manifest» are dashed lines with an arrowhead, labelled with their stereotype;
- the flow reads from the outside in: the client, the registry and the chart (sources of the paths,
  the deploy and the manifest) are left of the account, so no edge has to come back around it;
- the usual legibility rules hold after «Ver todo».

tests/fixtures/notation-deployment/deployment-large.yml is too wide for ELK to read at >= 10 px (issue
R8): it gets the own deployment layout (data-layout="deployment") and must read at >= 10 px after «Ver
todo», with every element inside its container, the client left of the account (outside in), no edge
label over a node or a container title, and the usual legibility rules.

Small deployments must not get worse: this fixture and the dense one of the legibility e2e
(tests/fixtures/notation-legibility/deployment-dense.yml) keep the ELK layout and at least the zoom
they read at before the deployment layout existed (BASELINE). In every deployment, no container
title touches its container's border (>= 8 px to each side, >= 4 px to the top).
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _measure, _round_two, _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-deployment"
DENSE = ROOT / "tests" / "fixtures" / "notation-legibility" / "deployment-dense.yml"
SPEC = "deployment.nested-paths"
# Antes del layout propio de despliegues (commit 5576e23): motor y zoom tras «Ver todo» a 1800x1200.
BASELINE = {"deployment.nested-paths": ("elk", 1.09), "deployment.legibility-dense": ("elk", 1.0)}

LARGE = "deployment.large-nested"
LARGE_CONTAINS = {"vpc": "account", "idp": "account", "queue_host": "account", "storage_host": "account", "model_host": "account",
                  "lb": "vpc", "cluster": "vpc", "db_host": "vpc", "svc_edge": "cluster", "svc_jobs": "cluster", "svc_gateway": "cluster",
                  "img_edge": "svc_edge", "img_tunnel": "svc_jobs", "img_gateway": "svc_gateway", "db_vault": "db_host", "model": "model_host",
                  "browsers": "internet"}

# Rótulos de arista encima de un nodo o del título de un contenedor (tapan texto).
COVERED = r"""() => { const r = e => e.getBoundingClientRect();
  const boxes = [...document.querySelectorAll('.notation-canvas .glyph:not(.is-container), .notation-canvas .glyph.is-container > .glyph-head')].map(r);
  return [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(l => { const a = r(l);
    return boxes.some(b => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1); }).map(l => l.innerText); }"""

# Cada título de contenedor queda dentro de su caja, con margen (no toca el borde).
TITLES = r"""() => [...document.querySelectorAll('.notation-canvas .glyph.is-container')].map(g => {
  const box = g.getBoundingClientRect(), head = g.querySelector(':scope > .glyph-head');
  const texts = [...head.querySelectorAll('.glyph-keyword, .glyph-label, svg.glyph-icon')].map(t => t.getBoundingClientRect());
  const side = Math.min(...texts.map(t => Math.min(t.left - box.left, box.right - t.right)));
  const top = Math.min(...texts.map(t => t.top - box.top));
  return {title: head.innerText.replace(/\s+/g, ' ').trim(), side: +side.toFixed(1), top: +top.toFixed(1)};
})"""
CONTAINS = {"network": "account", "cluster": "network", "db_host": "network", "api_node": "cluster", "worker_node": "cluster",
            "api_container": "api_node", "worker_container": "worker_node", "orders_db": "db_host", "api_image": "registry"}

DEPLOYMENT = r"""() => {
  const rect = el => el.getBoundingClientRect();
  const boxes = {};
  for (const n of document.querySelectorAll('.notation-canvas .react-flow__node')) {
    const r = rect(n.querySelector('.glyph')); boxes[n.dataset.id.split('.').pop()] = {left: r.left, right: r.right, top: r.top, bottom: r.bottom};
  }
  const labels = new Map([...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(l => [l.dataset.edge, l]));
  const edges = [...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => {
    const path = e.querySelector('.react-flow__edge-path'), ends = e.querySelector('.notation-edge-ends');
    const label = labels.get(path.id);
    return {source: ends.dataset.source.split('.').pop(), target: ends.dataset.target.split('.').pop(),
            dash: getComputedStyle(path).strokeDasharray || '', marker: path.getAttribute('marker-end') || '',
            label: label ? label.innerText.replace(/\s+/g, ' ').trim() : ''};
  });
  return {boxes, edges};
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("deployment")
    specs = [*sorted(FIXTURES.glob("*.yml")), DENSE]
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for s in specs for a in ("--spec", s.name)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_nested_nodes_paths_deploy_and_manifest(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, SPEC)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            drawn = page.evaluate(DEPLOYMENT)
            boxes = drawn["boxes"]
            # Anidado a cualquier profundidad: cada elemento dentro de la caja de su contenedor.
            for child, parent in CONTAINS.items():
                c, p = boxes[child], boxes[parent]
                assert p["left"] - 1 <= c["left"] and c["right"] <= p["right"] + 1 and p["top"] - 1 <= c["top"] and c["bottom"] <= p["bottom"] + 1, (child, parent)
            edges = {(e["source"], e["target"]): e for e in drawn["edges"]}
            # Communication paths de nodo a nodo: línea sólida con su rótulo (label y protocolo).
            for (source, target), text in {("users", "api_node"): "public API HTTPS", ("api_node", "worker_node"): "jobs AMQP",
                                           ("api_node", "db_host"): "queries :5432", ("worker_node", "db_host"): ":5432"}.items():
                edge = edges[(source, target)]
                assert edge["dash"] in ("", "none") and edge["label"] == text, edge
            # «deploy» y «manifest»: punteadas, con punta y su estereotipo.
            for (source, target), stereotype in {("api_image", "api_node"): "«deploy»", ("api_chart", "api_container"): "«manifest»"}.items():
                edge = edges[(source, target)]
                assert edge["dash"] not in ("", "none") and edge["marker"] and edge["label"] == stereotype, edge
            # De afuera hacia adentro: las fuentes externas a la izquierda de la cuenta.
            for outside in ("users", "registry", "api_chart"):
                assert boxes[outside]["right"] <= boxes["account"]["left"], (outside, boxes[outside], boxes["account"])
            page.screenshot(path=str(store.parent / "deployment.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_small_deployments_do_not_get_worse_and_titles_stay_inside(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            for spec, (engine, zoom) in BASELINE.items():
                result = _measure(page, spec)
                assert page.get_attribute(".notation-canvas", "data-layout") == engine, spec
                assert result["zoom"] >= zoom and result["minTextPx"] >= 10, (spec, result)
                titles = page.evaluate(TITLES)
                assert titles and all(t["side"] >= 8 and t["top"] >= 4 for t in titles), (spec, [t for t in titles if t["side"] < 8 or t["top"] < 4])
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_a_large_nested_deployment_reads_whole_with_its_own_layout(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LARGE)
            assert page.get_attribute(".notation-canvas", "data-layout") == "deployment"
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            assert page.evaluate(COVERED) == []
            titles = page.evaluate(TITLES)
            assert all(t["side"] >= 8 and t["top"] >= 4 for t in titles), [t for t in titles if t["side"] < 8 or t["top"] < 4]
            boxes = page.evaluate(DEPLOYMENT)["boxes"]
            for child, parent in LARGE_CONTAINS.items():
                c, p = boxes[child], boxes[parent]
                assert p["left"] - 1 <= c["left"] and c["right"] <= p["right"] + 1 and p["top"] - 1 <= c["top"] and c["bottom"] <= p["bottom"] + 1, (child, parent)
            assert boxes["internet"]["right"] <= boxes["account"]["left"], (boxes["internet"], boxes["account"])
            page.screenshot(path=str(store.parent / "deployment-large.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:tests/e2e_notation_activity.py
"""E2E: activity specs in the Specs view (notation contract §14), in Chromium.

tests/fixtures/notation-activity/activity-lanes.yml has partitions: UML swimlanes, one column per
partition in order of first appearance, with the flow going down. It checks that every step sits in
its partition's column, that the lanes are side by side in that order, that each forward step is
below the one before, that notes sit beside their step in the same lane, and the legibility rules
(including R6: each guard closer to its own branch), and that edges keep apart: no two edges run
parallel closer than 12 px on a shared stretch, arrowheads reaching the same node are >= 12 px apart
or come from different sides, and every label sits on a stretch that is only its edge's.

tests/fixtures/notation-activity/activity-notes-merge.yml has no partition, so it keeps the ELK
layout path (no regression). It checks:

- each UML note (`data.notes`) is a note glyph with that text, joined to its own step by a dotted
  line with no arrowhead;
- the merge (`kind: merge`) is a diamond with no label, where the two branches arrive and one flow
  leaves;
- no lane is drawn, and the usual legibility rules hold after «Ver todo»: text >= 10 px, no label
  overlaps or spills, no edge through a node, edge ends on their nodes, labels next to their edge.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _measure, _round_two, _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-activity"
NOTES, LANES = "activity.notes-merge", "activity.lanes-notes-merge"
# Partition of each step of activity-lanes.yml (the fixture's own data).
PARTITION = {"write": "Author", "push": "Author", "build": "Build server", "green": "Build server", "fix": "Author",
             "review": "Reviewer", "verdict": "Reviewer", "merge_now": "Reviewer", "queue": "Reviewer", "announce": "Author"}

SWIMLANES = r"""() => {
  const rect = el => el.getBoundingClientRect();
  const lanes = [...document.querySelectorAll('.notation-canvas .glyph.shape-partition')].map(g => {
    const r = rect(g); return {name: g.querySelector('.glyph-head').innerText.trim(), left: r.left, right: r.right, top: r.top, bottom: r.bottom};
  }).sort((a, b) => a.left - b.left);
  const steps = {};
  for (const n of document.querySelectorAll('.notation-canvas .react-flow__node')) {
    const g = n.querySelector('.glyph'); if (!g || g.classList.contains('shape-partition')) continue;
    const r = rect(g); steps[n.dataset.id.split('.').pop()] = {left: r.left, right: r.right, top: r.top, bottom: r.bottom, cy: (r.top + r.bottom) / 2};
  }
  return {lanes, steps};
}"""

ACTIVITY = r"""() => {
  const glyph = id => document.querySelector(`.notation-canvas .react-flow__node[data-id="${CSS.escape(id)}"] .glyph`);
  const edges = [...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => {
    const path = e.querySelector('.react-flow__edge-path'), ends = e.querySelector('.notation-edge-ends');
    return {source: ends?.dataset.source, target: ends?.dataset.target, dash: path?.getAttribute('stroke-dasharray') || getComputedStyle(path).strokeDasharray,
            marker: path?.getAttribute('marker-end') || ''};
  });
  const notes = [...document.querySelectorAll('.notation-canvas .glyph[data-function="note"]')].map(g => {
    const id = g.closest('.react-flow__node').dataset.id;
    const link = edges.find(e => e.target === id);
    return {id, text: g.querySelector('.glyph-label').innerText.replace(/\s+/g, ' ').trim(), shape: [...g.classList].find(c => c.startsWith('shape-')),
            step: link?.source || null, dash: link?.dash || null, marker: link?.marker || null};
  });
  const merges = [...document.querySelectorAll('.notation-canvas .glyph.shape-diamond[data-function="merge"]')].map(g => {
    const id = g.closest('.react-flow__node').dataset.id;
    return {id, label: g.querySelector('.glyph-diamond-label')?.textContent || '',
            incoming: edges.filter(e => e.target === id).length, outgoing: edges.filter(e => e.source === id).length};
  });
  return {notes, merges, lanes: document.querySelectorAll('.notation-canvas .glyph.is-container').length};
}"""


# Geometry of every edge in screen px: no two edges run parallel closer than 12 px on a shared stretch;
# arrowheads reaching the same node are >= 12 px apart or arrive from different sides; and every label
# is nearer its own edge than any other by >= 8 px (it sits on a stretch that is only its own).
SEPARATION = r"""() => {
  const edges = [...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => {
    const path = e.querySelector('.react-flow__edge-path'), ends = e.querySelector('.notation-edge-ends');
    const ctm = path.getScreenCTM();
    const pts = [...path.getAttribute('d').matchAll(/[ML]\s*([-\d.]+)[ ,]([-\d.]+)/g)]
      .map(m => new DOMPoint(Number(m[1]), Number(m[2])).matrixTransform(ctm)).map(p => ({x: p.x, y: p.y}));
    return {id: path.id, target: ends?.dataset.target, pts};
  });
  const segs = e => e.pts.slice(1).map((b, i) => [e.pts[i], b]);
  const close = [];
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    for (const [a, b] of segs(edges[i])) for (const [c, d] of segs(edges[j])) {
      const hz = Math.abs(a.y - b.y) < 0.5 && Math.abs(c.y - d.y) < 0.5, vt = Math.abs(a.x - b.x) < 0.5 && Math.abs(c.x - d.x) < 0.5;
      if (!hz && !vt) continue;
      const [p0, p1, q0, q1, gap] = hz ? [Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(c.x, d.x), Math.max(c.x, d.x), Math.abs(a.y - c.y)]
                                        : [Math.min(a.y, b.y), Math.max(a.y, b.y), Math.min(c.y, d.y), Math.max(c.y, d.y), Math.abs(a.x - c.x)];
      const shared = Math.min(p1, q1) - Math.max(p0, q0);
      if (shared > 1 && gap < 12) close.push({a: edges[i].id.split('.').pop(), b: edges[j].id.split('.').pop(), gap: +gap.toFixed(1), shared: +shared.toFixed(1)});
    }
  }
  const heads = [];
  const byTarget = new Map();
  for (const e of edges) { const n = e.pts.length; if (n < 2) continue;
    const p = e.pts[n - 1], q = e.pts[n - 2], dir = Math.abs(p.x - q.x) > Math.abs(p.y - q.y) ? (p.x > q.x ? 'E' : 'W') : (p.y > q.y ? 'S' : 'N');
    byTarget.set(e.target, [...(byTarget.get(e.target) || []), {id: e.id, p, dir}]); }
  for (const [target, list] of byTarget) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j], dist = Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y);
    if (a.dir === b.dir && dist < 12) heads.push({target: target.split('.').pop(), a: a.id.split('.').pop(), b: b.id.split('.').pop(), dist: +dist.toFixed(1)});
  }
  const toSeg = (r, [a, b]) => { const cx = Math.max(r.left, Math.min((a.x + b.x) / 2, r.right)), cy = Math.max(r.top, Math.min((a.y + b.y) / 2, r.bottom));
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / l)) : 0;
    const px = a.x + t * dx, py = a.y + t * dy; return Math.hypot(px - Math.max(r.left, Math.min(px, r.right)), py - Math.max(r.top, Math.min(py, r.bottom))); };
  const byPath = new Map(edges.map(e => [e.id, e]));
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].map(l => {
    const r = l.getBoundingClientRect(), own = byPath.get(l.dataset.edge);
    const mine = Math.min(...segs(own).map(s => toSeg(r, s)));
    const other = Math.min(Infinity, ...edges.filter(e => e !== own).flatMap(e => segs(e).map(s => toSeg(r, s))));
    return {label: l.innerText.trim(), margin: +(other - mine).toFixed(1)};
  });
  return {close, heads, labels};
}"""


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("activity")
    specs = sorted(FIXTURES.glob("*.yml"))
    for spec in specs:
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for s in specs for a in ("--spec", s.name)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def test_notes_and_merge_without_partitions_keep_the_elk_path(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, NOTES)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            activity = page.evaluate(ACTIVITY)
            assert activity["lanes"] == 0, activity
            notes = {n["step"].split(".")[-1]: n for n in activity["notes"]}
            assert set(notes) == {"push", "review"}, activity["notes"]
            assert notes["push"]["text"] == "Never push straight to the main branch."
            assert notes["review"]["text"] == "A review looks at intent, not only at style."
            for note in notes.values():
                assert note["shape"] == "shape-note" and note["dash"] not in (None, "", "none") and not note["marker"], note
            assert len(activity["merges"]) == 1, activity["merges"]
            merge = activity["merges"][0]
            assert merge["label"] == "" and merge["incoming"] == 2 and merge["outgoing"] == 1, merge
            page.screenshot(path=str(store.parent / "notes-merge.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()


def test_partitions_are_uml_swimlanes(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            result = _measure(page, LANES)
            assert result["minTextPx"] >= 10, result
            assert result["labelOverlaps"] == 0 and result["spills"] == 0 and result["crossings"] == 0, result
            _round_two(result)
            assert result["guards"] >= 4 and result["minGuardMargin"] >= 8, result
            lanes = page.evaluate(SWIMLANES)
            # Una columna por partición, en orden de aparición, lado a lado y de la misma altura.
            assert [l["name"] for l in lanes["lanes"]] == ["Author", "Build server", "Reviewer"], lanes["lanes"]
            for a, b in zip(lanes["lanes"], lanes["lanes"][1:]):
                assert a["right"] <= b["left"] + 1 and abs(a["top"] - b["top"]) < 1 and abs(a["bottom"] - b["bottom"]) < 1, (a, b)
            column = {l["name"]: l for l in lanes["lanes"]}
            steps = lanes["steps"]
            for step, partition in PARTITION.items():
                box, lane = steps[step], column[partition]
                assert lane["left"] - 1 <= box["left"] and box["right"] <= lane["right"] + 1, (step, partition, box, lane)
            # El flujo baja: cada paso hacia adelante, más abajo que el anterior.
            for a, b in [("write", "push"), ("push", "build"), ("build", "green"), ("green", "review"), ("review", "verdict"),
                         ("verdict", "merge_now"), ("verdict", "queue"), ("merge_now", "join"), ("join", "announce"), ("announce", "end")]:
                assert steps[b]["top"] >= steps[a]["bottom"], (a, b)
            # Cada nota al lado de su paso, en su misma fila y carril.
            activity = page.evaluate(ACTIVITY)
            for note in activity["notes"]:
                step = note["step"].split(".")[-1]
                nb, sb, lane = steps[note["id"].split(".")[-1]], steps[step], column[PARTITION[step]]
                assert nb["left"] >= sb["right"] and abs(nb["cy"] - sb["cy"]) < 2 and nb["right"] <= lane["right"] + 1, (note, nb, sb)
                assert note["dash"] not in (None, "", "none") and not note["marker"], note
            assert [m["label"] for m in activity["merges"]] == [""], activity["merges"]
            # Ningún pasillo compartido, puntas separadas y cada rótulo sobre un tramo solo suyo.
            separation = page.evaluate(SEPARATION)
            assert not separation["close"], separation["close"]
            assert not separation["heads"], separation["heads"]
            assert separation["labels"] and all(l["margin"] >= 8 for l in separation["labels"]), separation["labels"]
            page.screenshot(path=str(store.parent / "lanes.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:tests/e2e_notation_style.py
"""E2E: the Specs view draws the style sldb resolves (contract §13) — colours, icons, shapes, legend.

A real temporary store gets tests/fixtures/notation-style/component-infra.yml synced against the
notation tests/fixtures/notation-style/infra.yml (palette `default`). In Chromium:

- each styled glyph is painted with its resolved fill and stroke, in the light and the dark theme,
  with its label at WCAG AA contrast against that fill (a literal light fill keeps dark text in the
  dark theme), and the three precedence layers show: glyph style (hot), spec style.kinds (backend), palette kind;
- each glyph with an icon draws that lucide icon next to its label;
- cylinder, queue, cloud, package and note are drawn as an outline, and their keyword, icon and label
  sit in the outline's inner area: every text corner is inside the drawn fill and no point of the
  outline (rims, caps, lobes, tab, folded corner) falls on the text;
- every edge that meets one of those shapes, or a diamond, ends on the drawn outline (<= 2 px), not on
  the shape's box;
- a link with `color` draws its line in that colour;
- the legend lists every glyph, kind and link of the view, with the same fill, shape, icon and colour,
  and does not cover the diagram.
"""
import shutil
import subprocess
from pathlib import Path

import pytest

from e2e_notation_legibility import _serve, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures" / "notation-style"
SPEC = "component.style-infra"

COLOURS = r"""() => {
  const node = id => document.querySelector(`.notation-canvas .react-flow__node[data-id$=".${id}"] .glyph`);
  const paint = g => {
    const outline = g.querySelector(':scope > .glyph-outline path');
    const cs = getComputedStyle(outline || g);
    return {fill: outline ? cs.fill : cs.backgroundColor, stroke: outline ? cs.stroke : cs.borderTopColor,
            shape: [...g.classList].find(c => c.startsWith('shape-')), icon: g.querySelector('svg.glyph-icon')?.dataset.icon || null,
            iconDrawn: (g.querySelector('svg.glyph-icon')?.children.length || 0) > 0, outline: Boolean(outline),
            ink: getComputedStyle(g.querySelector('.glyph-label')).color};
  };
  const ids = ['api', 'db', 'jobs', 'payments', 'mail', 'shared', 'memo', 'checkout', 'web'];
  const glyphs = Object.fromEntries(ids.map(id => [id, node(id) && paint(node(id))]));
  const rect = el => el.getBoundingClientRect();
  let spills = 0;
  for (const id of ids) { const g = node(id), l = g && g.querySelector('.glyph-label'); if (!l) continue;
    const a = rect(l), b = rect(g); if (a.left < b.left - 1 || a.right > b.right + 1 || a.top < b.top - 1 || a.bottom > b.bottom + 1) spills++; }
  const reads = [...document.querySelectorAll('.notation-canvas .react-flow__edge')]
    .find(e => (e.querySelector('.notation-edge-ends')?.dataset.target || '').endsWith('.db'));
  const legend = document.querySelector('.notation-legend');
  const canvas = rect(document.querySelector('.notation-canvas'));
  const lr = legend && rect(legend);
  return {glyphs, spills, readsStroke: reads && getComputedStyle(reads.querySelector('.react-flow__edge-path')).stroke,
    legend: legend && {
      glyphs: [...legend.querySelectorAll('.legend-glyph')].map(li => ({glyph: li.dataset.glyph, shape: li.dataset.shape, fill: li.dataset.fill || null,
        icon: li.dataset.icon || null, iconDrawn: (li.querySelector('svg.glyph-icon')?.children.length || 0) > 0})),
      kinds: [...legend.querySelectorAll('.legend-kind')].map(li => ({kind: li.dataset.kind, fill: li.dataset.fill || null})),
      links: [...legend.querySelectorAll('.legend-link')].map(li => ({link: li.dataset.link, color: li.dataset.color || null,
        stroke: li.querySelector('line') && getComputedStyle(li.querySelector('line')).stroke})),
      overlapsCanvas: !(lr.right <= canvas.left || lr.left >= canvas.right)}};
}"""


# Text inside each outline shape, against the drawn geometry (not against the layout's numbers): every
# corner of the keyword, icon and label is inside the outline's fill, and no point of the outline (its
# rims, caps, lobes, tab or folded corner included) falls inside any of them.
INSIDE = r"""() => [...document.querySelectorAll('.notation-canvas .glyph')].filter(g => g.querySelector(':scope > .glyph-outline')).map(g => {
  const path = g.querySelector(':scope > .glyph-outline path');
  const ctm = path.getScreenCTM(), inv = ctm.inverse();
  const parts = [...g.querySelectorAll('.glyph-keyword, .glyph-label, svg.glyph-icon')].map(el => ({part: el.getAttribute('class'), r: el.getBoundingClientRect()}));
  const toUser = (x, y) => new DOMPoint(x, y).matrixTransform(inv);
  const corners = parts.flatMap(({part, r}) => [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]]
    .filter(([x, y]) => !path.isPointInFill(toUser(x, y))).map(([x, y]) => ({part, x: Math.round(x), y: Math.round(y)})));
  const total = path.getTotalLength();
  let touches = 0;
  for (let s = 0; s <= total; s += 0.25) {
    const p = path.getPointAtLength(s), q = new DOMPoint(p.x, p.y).matrixTransform(ctm);
    if (parts.some(({r}) => q.x > r.left + 0.5 && q.x < r.right - 0.5 && q.y > r.top + 0.5 && q.y < r.bottom - 0.5)) touches++;
  }
  return {id: g.closest('.react-flow__node').dataset.id.split('.').pop(), shape: [...g.classList].find(c => c.startsWith('shape-')),
          parts: parts.length, outside: corners, touches};
})"""


# Each end of an edge that meets a shape which is not a box touches the drawn outline (not its box):
# distance from the end point to the outline's stroke (SVG path of cylinder, queue, cloud, package,
# note; the four sides of the diamond), in screen px.
ENDS = r"""() => {
  const glyphOf = id => document.querySelector(`.notation-canvas .react-flow__node[data-id="${CSS.escape(id)}"] .glyph`);
  const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy;
    const t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l)) : 0; return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  const toOutline = (g, p) => {
    const path = g.querySelector(':scope > .glyph-outline path');
    if (path) { const ctm = path.getScreenCTM(), total = path.getTotalLength(); let best = Infinity;
      for (let s = 0; s <= total; s += 0.2) { const q = new DOMPoint(path.getPointAtLength(s).x, path.getPointAtLength(s).y).matrixTransform(ctm); best = Math.min(best, Math.hypot(q.x - p.x, q.y - p.y)); }
      return best; }
    const r = g.getBoundingClientRect(), cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const v = [{x: cx, y: r.top}, {x: r.right, y: cy}, {x: cx, y: r.bottom}, {x: r.left, y: cy}];
    return Math.min(...v.map((a, i) => segDist(p, a, v[(i + 1) % 4])));
  };
  const out = [];
  for (const edge of document.querySelectorAll('.notation-canvas .react-flow__edge')) {
    const path = edge.querySelector('.react-flow__edge-path'), ends = edge.querySelector('.notation-edge-ends');
    if (!path || !ends) continue;
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    const at = s => { const p = path.getPointAtLength(s); return new DOMPoint(p.x, p.y).matrixTransform(ctm); };
    for (const [end, id, p] of [['target', ends.dataset.target, at(total)], ['source', ends.dataset.source, at(0)]]) {
      const g = glyphOf(id), shape = g && [...g.classList].find(c => c.startsWith('shape-'));
      if (!['shape-cylinder', 'shape-queue', 'shape-cloud', 'shape-package', 'shape-note', 'shape-diamond'].includes(shape)) continue;
      out.push({edge: id.split('.').pop(), end, shape, distance: +toOutline(g, p).toFixed(2)});
    }
  }
  return out;
}"""


def _contrast(a, b):
    """WCAG contrast of two computed `rgb(r, g, b)` colours."""
    def lum(colour):
        r, g, b = (int(x) / 255 for x in colour[colour.index("(") + 1:colour.index(")")].split(",")[:3])
        return sum(w * (c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4) for w, c in zip((0.2126, 0.7152, 0.0722), (r, g, b)))
    hi, lo = sorted((lum(a), lum(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def _legible(glyphs):
    """Every glyph with a declared fill keeps its label at WCAG AA contrast against that fill."""
    for id_, g in glyphs.items():
        if g["fill"].startswith("rgb("):
            assert _contrast(g["fill"], g["ink"]) >= 4.5, (id_, g)


def _rgb(hex_colour):
    h = hex_colour.lstrip("#")
    return "rgb({}, {}, {})".format(*(int(h[i:i + 2], 16) for i in (0, 2, 4)))


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("style")
    for spec in FIXTURES.glob("*.yml"):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", "--spec", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _view(base):
    import json
    import urllib.request
    with urllib.request.urlopen(f"{base}/api/notation/view?spec={SPEC}") as response:
        return json.load(response)


def _open(page, base):
    page.goto(f"{base}/specs/notation")
    page.wait_for_function("() => document.querySelectorAll('.notation-canvas .react-flow__node').length >= 10"
                           " && document.querySelectorAll('.notation-canvas svg.glyph-icon').length >= 7", timeout=60000)
    page.wait_for_timeout(800)
    return page.evaluate(COLOURS)


def test_glyphs_wear_the_resolved_style_and_the_legend_explains_it(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.add_init_script("localStorage.setItem('kb-skin', 'light')")
            light = _open(page, base)
            glyphs = light["glyphs"]
            # Precedencia: glifo (hot) > style.kinds del spec (backend) > kind de la paleta (database...).
            assert glyphs["checkout"]["fill"] == _rgb("#fff1c2") and glyphs["checkout"]["stroke"] == _rgb("#b35900"), glyphs["checkout"]
            assert glyphs["checkout"]["icon"] == "workflow" and glyphs["checkout"]["iconDrawn"]
            assert glyphs["api"]["fill"] == _rgb("#e8f4e8") and glyphs["api"]["stroke"] == _rgb("#2e7d32"), glyphs["api"]
            assert glyphs["api"]["icon"] == "cpu" and glyphs["api"]["iconDrawn"]
            assert glyphs["db"]["icon"] == "database" and glyphs["db"]["fill"] not in ("rgba(0, 0, 0, 0)", "none"), glyphs["db"]
            # Formas: contorno SVG con el rótulo dentro.
            for id_, shape in (("db", "cylinder"), ("jobs", "queue"), ("payments", "cloud"), ("shared", "package"), ("memo", "note")):
                assert glyphs[id_]["shape"] == f"shape-{shape}" and glyphs[id_]["outline"], (id_, glyphs[id_])
            assert light["spills"] == 0, light
            _legible(glyphs)
            # Texto dentro del área interior de cada forma de contorno (las 5), contra la geometría dibujada.
            inside = page.evaluate(INSIDE)
            assert {g["shape"] for g in inside} == {f"shape-{s}" for s in ("cylinder", "queue", "cloud", "package", "note")}, inside
            for g in inside:
                assert g["parts"] >= 1 and not g["outside"] and g["touches"] == 0, g
            # Cada extremo de arista en una forma que no es caja toca su contorno dibujado (≤ 2 px).
            ends = page.evaluate(ENDS)
            shapes = {f"shape-{s}" for s in ("cylinder", "queue", "cloud", "package", "note", "diamond")}
            assert {e["shape"] for e in ends if e["end"] == "target"} == shapes, ends
            assert all(e["distance"] <= 2 for e in ends), [e for e in ends if e["distance"] > 2]
            # Color de relación.
            assert light["readsStroke"] == _rgb("#0072b2"), light["readsStroke"]
            # Leyenda: todo glifo, kind y link de la vista, con el mismo estilo; no tapa el diagrama.
            legend = light["legend"]
            assert legend and not legend["overlapsCanvas"], legend
            expected = _view(base)["legend"]
            assert len(legend["glyphs"]) == len(expected["glyphs"]) == 8, legend["glyphs"]
            assert len(legend["kinds"]) == len(expected["kinds"]) == 2, legend["kinds"]
            assert len(legend["links"]) == len(expected["links"]) == 3, legend["links"]
            hot = next(g for g in legend["glyphs"] if g["glyph"].endswith("hot"))
            assert hot["fill"] == "#fff1c2" and hot["icon"] == "workflow" and hot["iconDrawn"], hot
            assert {g["shape"] for g in legend["glyphs"]} >= {"cylinder", "queue", "cloud", "package", "note", "box"}
            assert {k["kind"]: k["fill"] for k in legend["kinds"]}["backend"] == "#e8f4e8"
            reads = next(link for link in legend["links"] if link["link"].endswith("reads"))
            assert reads["color"] == "#0072b2" and reads["stroke"] == _rgb("#0072b2"), reads
            # «Ver todo» encuadra cada nodo completo (formas de contorno incluidas) con margen.
            from e2e_notation_legibility import assert_nodes_framed
            assert_nodes_framed(page)
            # R13: en una ventana más baja que la leyenda, la leyenda hace scroll en su panel y el lienzo
            # no se estira con ella: «Ver todo» sigue dejando cada nodo dentro de la ventana, con margen.
            page.set_viewport_size({"width": 1800, "height": 340})
            page.wait_for_timeout(300)
            panel = page.evaluate("() => { const n = document.querySelector('.notation-catalog'), r = n.getBoundingClientRect();"
                                  " return {scrolls: n.scrollHeight > n.clientHeight + 1, bottom: r.bottom, inner: window.innerHeight}; }")
            assert panel["scrolls"] and panel["bottom"] <= panel["inner"] + 0.5, panel
            assert_nodes_framed(page)
            page.set_viewport_size({"width": 1800, "height": 1200})
            page.wait_for_timeout(300)
            # La muestra de cada link dibuja la misma punta y el mismo trazo que una arista real de ese link.
            from e2e_notation_sequence import assert_legend_links_match
            assert_legend_links_match(page, 2)
            page.screenshot(path=str(store.parent / "style-light.png"))

            # Tema oscuro: cada color resuelto por tema cambia con el tema.
            page.click(".skin-toggle")
            page.wait_for_timeout(600)
            dark = page.evaluate(COLOURS)
            assert dark["glyphs"]["db"]["fill"] != glyphs["db"]["fill"], (dark["glyphs"]["db"], glyphs["db"])
            assert dark["glyphs"]["db"]["icon"] == "database"
            # Un relleno literal (#fff1c2, igual en los dos temas) conserva su texto oscuro en el tema oscuro.
            assert dark["glyphs"]["checkout"]["fill"] == _rgb("#fff1c2")
            _legible(dark["glyphs"])
            page.screenshot(path=str(store.parent / "style-dark.png"))
            assert not errors, errors
            browser.close()
    finally:
        process.terminate()
        process.wait()

FILE:tests/e2e_notation_legibility.py
"""E2E: the Specs view reads whole, at 1800x1200 after «Ver todo» (issues G1-G6).

A real temporary store gets two specs: tests/fixtures/notation-legibility/component-containers.yml
(two containers with long titles, nine unlinked children in one, labelled edges between
containers) and the activity pilot of tests/fixtures/notation-pilots (decisions and a loop back). In Chromium, for each:

- every diagram text renders at >= 10 px at the zoom «Ver todo» leaves;
- no two edge/pseudostate labels overlap, no node label spills out of its box;
- a container's title sits above its children (G2), and the nine children use more than one row (G3);
- a decision's label is inside its diamond (G6);
- no edge passes through a node other than its two ends (G5, G6);
- round 2: the initial node is above its first step (R1); every edge starts and ends on its source
  and target (R2); every edge label is within 20 px of its edge (R3); with the minimap shown, it
  covers no node after «Ver todo» (R4); no edge crosses a container's title (R5);
- round 3: every guard (label of a branch leaving a decision) is at least 8 px closer to its own
  branch than to any other edge, so parallel branches cannot swap their guards (R6); hovering an
  edge's label highlights that edge and dims the others, to follow one line in a bundle (R7).

G1: with a model whose module does not import, the shell names the model and its error and the
catalog still lists the specs; started with --pythonpath, the error is gone.
"""
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import pytest

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

ROOT = Path(__file__).resolve().parents[1]
MINDMAP = ROOT / "frontends" / "mindmap"
FIXTURES = ROOT / "tests" / "fixtures" / "notation-legibility"
FIXTURE, DENSE = FIXTURES / "component-containers.yml", FIXTURES / "deployment-dense.yml"
ACTIVITY = ROOT / "tests" / "fixtures" / "notation-pilots" / "activity-render-error-handling.yml"
COMPONENT, FLOW, DEPLOYMENT = "component.legibility-containers", "activity.render-error-handling", "deployment.legibility-dense"

# R13: lo que se ve del lienzo es su caja recortada por la ventana; un lienzo más alto que la ventana
# (estirado por la leyenda) deja fuera lo que pasa de window.innerHeight aunque «quepa» en el lienzo.
VISIBLE_CANVAS = r"""const visibleCanvas = () => { const c = document.querySelector('.notation-canvas').getBoundingClientRect();
    return {left: Math.max(c.left, 0), top: Math.max(c.top, 0), right: Math.min(c.right, window.innerWidth), bottom: Math.min(c.bottom, window.innerHeight)}; };"""

MEASURE = r"""() => {
  """ + VISIBLE_CANVAS + r"""
  const vp = document.querySelector('.react-flow__viewport');
  const zoom = Number((/scale\(([\d.]+)\)/.exec(vp.style.transform) || [0, 1])[1]);
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const rect = el => el.getBoundingClientRect();
  const overlap = (a, b, m = 0) => !(a.right <= b.left + m || b.right <= a.left + m || a.bottom <= b.top + m || b.bottom <= a.top + m);
  const texts = [...document.querySelectorAll('.notation-canvas .glyph-label, .notation-canvas .glyph-point-label, .notation-canvas .glyph-diamond-label, .notation-canvas .notation-edge-label, .notation-canvas .glyph-keyword, .notation-canvas .glyph-compartment li')].filter(visible);
  const minTextPx = Math.min(...texts.map(el => parseFloat(getComputedStyle(el).fontSize) * zoom));
  const labels = [...document.querySelectorAll('.notation-canvas .notation-edge-label, .notation-canvas .glyph-point-label')].filter(visible).map(rect);
  let labelOverlaps = 0;
  for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (overlap(labels[i], labels[j], 1)) labelOverlaps++;
  const leaves = [...document.querySelectorAll('.notation-canvas .react-flow__node')].filter(n => !n.querySelector('.glyph.is-container'));
  let spills = 0;
  for (const n of leaves) { const g = n.querySelector('.glyph'), l = n.querySelector('.glyph-label, .glyph-diamond-label');
    if (l && g) { const a = rect(l), b = rect(g); if (a.left < b.left - 1 || a.right > b.right + 1 || a.top < b.top - 1 || a.bottom > b.bottom + 1) spills++; } }
  const containers = [...document.querySelectorAll('.notation-canvas .react-flow__node')].filter(n => n.querySelector(':scope > .glyph.is-container')).map(n => {
    const id = n.dataset.id, head = rect(n.querySelector('.glyph-head')), box = rect(n);
    // Hijos directos: nodos hoja dentro de la caja del contenedor (React Flow no expone el padre en el DOM).
    const kids = leaves.filter(k => { const r = rect(k); return r.left >= box.left - 1 && r.right <= box.right + 1 && r.top >= box.top - 1 && r.bottom <= box.bottom + 1; });
    return {id, headBottom: head.bottom, kidsTop: Math.min(...kids.map(k => rect(k).top)), rows: new Set(kids.map(k => Math.round(rect(k).top))).size, kids: kids.length};
  });
  const diamonds = [...document.querySelectorAll('.notation-canvas .glyph.shape-diamond')].map(g => {
    const b = rect(g), l = rect(g.querySelector('.glyph-diamond-label'));
    const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2, a = b.width / 2, h = b.height / 2;
    const inside = (x, y) => Math.abs(x - cx) / a + Math.abs(y - cy) / h <= 1.001;
    return inside(l.left, l.top) && inside(l.right, l.top) && inside(l.left, l.bottom) && inside(l.right, l.bottom);
  });
  const nodeRects = leaves.map(n => ({id: n.dataset.id, r: rect(n)}));
  const allNodes = new Map([...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => [n.dataset.id, rect(n)]));
  const heads = [...document.querySelectorAll('.notation-canvas .glyph.is-container > .glyph-head')].filter(visible).map(rect);
  const onBorder = (p, r) => r && p.x >= r.left - 2 && p.x <= r.right + 2 && p.y >= r.top - 2 && p.y <= r.bottom + 2
    && Math.min(Math.abs(p.x - r.left), Math.abs(p.x - r.right), Math.abs(p.y - r.top), Math.abs(p.y - r.bottom)) <= 2;
  const toRect = (p, r) => Math.hypot(Math.max(r.left - p.x, 0, p.x - r.right), Math.max(r.top - p.y, 0, p.y - r.bottom));
  let crossings = 0, looseEnds = 0, headerCrossings = 0;
  const samples = new Map();
  for (const edge of document.querySelectorAll('.notation-canvas .react-flow__edge')) {
    const path = edge.querySelector('.react-flow__edge-path'), ends = edge.querySelector('.notation-edge-ends'); if (!path || !ends) continue;
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    const at = s => { const p = path.getPointAtLength(s); return {x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}; };
    const {source, target} = ends.dataset;
    const pts = []; for (let s = 0; s <= total; s += 3) pts.push(at(s)); pts.push(at(total));
    samples.set(edge.dataset.id || path.id, pts);
    if (!onBorder(pts[0], allNodes.get(source)) || !onBorder(pts[pts.length - 1], allNodes.get(target))) looseEnds++;
    const inner = pts.slice(2, -2);
    if (inner.some(p => nodeRects.some(({id, r}) => id !== source && id !== target && p.x > r.left + 2 && p.x < r.right - 2 && p.y > r.top + 2 && p.y < r.bottom - 2))) crossings++;
    if (inner.some(p => heads.some(h => p.x > h.left + 1 && p.x < h.right - 1 && p.y > h.top + 1 && p.y < h.bottom - 1))) headerCrossings++;
  }
  // Cada rótulo contra el recorrido de SU arista (data-edge = id de la arista).
  const pathById = new Map([...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => [e.querySelector('.react-flow__edge-path')?.id, e.querySelector('.react-flow__edge-path')]));
  const distanceToPath = (path, r) => {
    const ctm = path.getScreenCTM(), total = path.getTotalLength();
    let best = Infinity; for (let s = 0; s <= total; s += 2) { const p = path.getPointAtLength(s); best = Math.min(best, toRect({x: p.x * ctm.a + ctm.e, y: p.y * ctm.d + ctm.f}, r)); }
    return best;
  };
  const labelDistances = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(visible).map(l => {
    const path = pathById.get(l.dataset.edge); return path ? distanceToPath(path, rect(l)) : Infinity;
  });
  // R6: guardas = rótulos de aristas que salen de un rombo; margen = (otra arista más cercana) - (la propia).
  const diamondIds = new Set([...document.querySelectorAll('.notation-canvas .glyph.shape-diamond')].map(g => g.closest('.react-flow__node').dataset.id));
  const sourceOf = new Map([...document.querySelectorAll('.notation-canvas .react-flow__edge')].map(e => [e.querySelector('.react-flow__edge-path')?.id, e.querySelector('.notation-edge-ends')?.dataset.source]));
  const guardMargins = [...document.querySelectorAll('.notation-canvas .notation-edge-label')].filter(visible)
    .filter(l => diamondIds.has(sourceOf.get(l.dataset.edge))).map(l => {
      const r = rect(l), own = distanceToPath(pathById.get(l.dataset.edge), r);
      const other = Math.min(Infinity, ...[...pathById.entries()].filter(([id]) => id !== l.dataset.edge).map(([, path]) => distanceToPath(path, r)));
      return other - own;
    });
  const initial = document.querySelector('.notation-canvas .glyph.shape-filled-circle');
  let initialAbove = null;
  if (initial) {
    const id = initial.closest('.react-flow__node').dataset.id;
    const first = [...document.querySelectorAll('.notation-canvas .notation-edge-ends')].find(g => g.dataset.source === id);
    const a = rect(initial), b = first && allNodes.get(first.dataset.target);
    initialAbove = Boolean(b) && (a.top + a.bottom) / 2 < (b.top + b.bottom) / 2;
  }
  // Encuadre: cada nodo (su caja y lo que dibuja dentro) completo en el lienzo, con margen.
  const canvas = visibleCanvas();
  const minMargin = Math.min(...[...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => {
    const boxes = [rect(n), ...[...n.querySelectorAll('.glyph, .glyph > *')].map(rect)];
    return Math.min(...boxes.map(b => Math.min(b.left - canvas.left, canvas.right - b.right, b.top - canvas.top, canvas.bottom - b.bottom)));
  }));
  const minimap = document.querySelector('.notation-canvas .react-flow__minimap');
  const minimapCovers = minimap ? [...allNodes.values()].filter(r => overlap(r, rect(minimap))).length : null;
  return {zoom, minTextPx, texts: texts.length, labelOverlaps, spills, containers, diamonds, crossings, looseEnds, headerCrossings,
          maxLabelDistance: labelDistances.length ? Math.max(...labelDistances) : 0, labels: labelDistances.length, initialAbove, minimapCovers,
          guards: guardMargins.length, minGuardMargin: guardMargins.length ? Math.min(...guardMargins) : null, minMargin};
}"""


def _free_port():
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _serve(store, *args, pythonpath=None):
    port = _free_port()
    env = {**os.environ, "GRAPH_UI_BACKEND": "local", "SLDB_STORE": str(store)}
    env.pop("SLDB_PYTHONPATH", None)
    if pythonpath is None:
        env.pop("PYTHONPATH", None)
    process = subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), *args, str(port)], env=env,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/graph", timeout=2)
            return process, f"http://127.0.0.1:{port}"
        except Exception:
            time.sleep(0.2)
    process.terminate()
    raise RuntimeError("graph-ui did not start")


@pytest.fixture(scope="module")
def store(tmp_path_factory):
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    root = tmp_path_factory.mktemp("legibility")
    for spec in (FIXTURE, DENSE, ACTIVITY):
        shutil.copy(spec, root / spec.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", "--spec", FIXTURE.name, "--spec", DENSE.name, "--spec", ACTIVITY.name, "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _round_two(result):
    """R2, R3, R5 on any graph spec: ends on their nodes, labels on their edge, titles uncrossed; and after
    «Ver todo» every node, with everything it draws inside, fully in the canvas with >= 8 px of margin."""
    assert result["texts"] > 0, result  # something was drawn and measured
    assert result["minMargin"] >= 8, result
    assert result["looseEnds"] == 0, result
    assert result["maxLabelDistance"] <= 20, result
    assert result["headerCrossings"] == 0, result


FRAMED = r"""() => {
  """ + VISIBLE_CANVAS + r"""
  const rect = (e) => e.getBoundingClientRect(), canvas = visibleCanvas();
  const nodes = [...document.querySelectorAll('.notation-canvas .react-flow__node, .notation-canvas .lane-head, .notation-canvas .lane-message')];
  return nodes.length ? Math.min(...nodes.map((n) => [rect(n), ...[...n.querySelectorAll('.glyph, .glyph > *, .message-label')].map(rect)]
    .reduce((m, b) => Math.min(m, b.left - canvas.left, canvas.right - b.right, b.top - canvas.top, canvas.bottom - b.bottom), Infinity))) : null;
}"""


def assert_nodes_framed(page, margin=8):
    """Every node (and what it draws inside) fully in the visible canvas — the canvas clipped by the window —
    with >= `margin` px: as the view stands (its automatic framing) and again after «Ver todo». The canvas
    itself ends inside the window (R13)."""
    canvas_bottom = page.evaluate("() => document.querySelector('.notation-canvas').getBoundingClientRect().bottom - window.innerHeight")
    assert canvas_bottom <= 0.5, canvas_bottom
    before = page.evaluate(FRAMED)
    page.get_by_role("button", name="⛶ Ver todo").click()
    page.wait_for_timeout(500)
    least = page.evaluate(FRAMED)
    assert before is not None and before >= margin and least >= margin, (before, least)
    return least


def _measure(page, spec):
    page.click(f'[data-spec="{spec}"]')
    # Wait for THIS spec's diagram: the previous one stays on screen while the new layout runs.
    page.wait_for_function("spec => { const ids = [...document.querySelectorAll('.notation-canvas .react-flow__node')].map(n => n.dataset.id);"
                           " return ids.length > 0 && ids.every(id => id.includes(spec + '.') || id.includes(spec + '#'))"
                           " && document.querySelectorAll('.notation-canvas .react-flow__edge-path').length > 0; }", arg=spec, timeout=60000)
    page.wait_for_timeout(600)
    page.click(".notation-bar button")
    page.wait_for_timeout(500)
    return page.evaluate(MEASURE)


def test_specs_read_whole_after_fit(store):
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            errors = []
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)

            component = _measure(page, COMPONENT)
            assert component["minTextPx"] >= 10, component
            assert component["labelOverlaps"] == 0 and component["spills"] == 0, component
            assert component["crossings"] == 0, component
            assert len(component["containers"]) == 2, component["containers"]
            for container in component["containers"]:
                assert container["headBottom"] <= container["kidsTop"] + 0.5, container
            assert all(c["kids"] > 0 for c in component["containers"]), component["containers"]
            kit = max(component["containers"], key=lambda c: c["kids"])
            assert kit["kids"] == 9 and kit["rows"] >= 2, kit
            _round_two(component)

            flow = _measure(page, FLOW)
            assert flow["minTextPx"] >= 10, flow
            assert flow["labelOverlaps"] == 0 and flow["spills"] == 0, flow
            assert flow["diamonds"] and all(flow["diamonds"]), flow["diamonds"]
            assert flow["crossings"] == 0, flow
            _round_two(flow)
            assert flow["labels"] >= 4 and flow["initialAbove"] is True, flow
            # R6: every guard reads as its own branch's.
            assert flow["guards"] >= 4 and flow["minGuardMargin"] >= 8, flow

            # R7: hovering a label highlights its own edge and dims the rest.
            label = page.locator(".notation-canvas .notation-edge-label").first
            edge_id = label.get_attribute("data-edge")
            label.hover()
            page.wait_for_selector(".notation-canvas .notation-edge-label.is-hovered")
            styles = page.evaluate('''id => [...document.querySelectorAll('.notation-canvas .react-flow__edge-path')]
                .map(p => [p.id === id, Number(getComputedStyle(p).opacity), parseFloat(getComputedStyle(p).strokeWidth)])''', edge_id)
            mine = [s for s in styles if s[0]]
            others = [s for s in styles if not s[0]]
            assert mine and mine[0][1] == 1 and mine[0][2] > 2, styles
            assert others and all(o[1] < 0.5 for o in others), styles
            page.mouse.move(5, 5)
            page.wait_for_function("() => !document.querySelector('.notation-canvas .notation-edge-label.is-hovered')")

            # Dense deployment (13 nodes, 18 artifacts, 21 labelled connections between nodes): with the
            # workers panel collapsed, as the Specs view starts, it still reads at >= 10 px.
            assert page.locator(".workers-panel.is-collapsed").count() == 1
            dense = _measure(page, DEPLOYMENT)
            assert dense["minTextPx"] >= 10, dense
            assert dense["labelOverlaps"] == 0 and dense["spills"] == 0, dense
            assert len(dense["containers"]) == 13 and all(c["headBottom"] <= c["kidsTop"] + 0.5 for c in dense["containers"]), dense["containers"]
            _round_two(dense)

            # R4: the minimap starts hidden; shown, «Ver todo» frames the diagram clear of it.
            assert dense["minimapCovers"] is None
            page.click(".notation-minimap-toggle")
            page.wait_for_selector(".notation-canvas .react-flow__minimap")
            for spec in (DEPLOYMENT, COMPONENT, FLOW):
                shown = _measure(page, spec)
                assert shown["minimapCovers"] == 0, (spec, shown["minimapCovers"])
            page.click(".notation-minimap-toggle")
            assert errors == []
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)


def test_an_unimportable_model_is_named_and_pythonpath_fixes_it(store, tmp_path):
    from sldb.api import add_model

    package = tmp_path / "legibility_models"
    package.mkdir()
    (package / "__init__.py").write_text("")
    (package / "models.py").write_text(
        "from pydantic import Field\nfrom sldb.models import StructuredNLDoc\n\n"
        "class LegibilityNoteDoc(StructuredNLDoc):\n"
        "    __template__ = '---\\nid: ⸢rev•id⸥\\n---\\n'\n"
        "    id: str = Field(description='Note id.')\n", encoding="utf-8")
    add_model(store, "legibility_models.models:LegibilityNoteDoc", pythonpath=str(tmp_path))

    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            banner = page.locator(".error-banner").inner_text()
            assert "LegibilityNoteDoc" in banner and "legibility_models" in banner and "--pythonpath" in banner, banner
            assert page.locator(f'[data-spec="{COMPONENT}"]').count() == 1
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)

    process, base = _serve(store, "--pythonpath", str(tmp_path))
    try:
        schema = urllib.request.urlopen(f"{base}/api/schema", timeout=30).read().decode()
        assert "import_error" not in schema
    finally:
        process.terminate()
        process.wait(timeout=10)


def test_the_workers_panel_folds_per_view_and_remembers(store):
    """The Specs view starts with the workers panel collapsed (the diagram gets the whole width);
    a visible control unfolds it; the choice is remembered per view and the KB view keeps its own."""
    process, base = _serve(store)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1800, "height": 1200})
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 1
            canvas_folded = page.locator(".notation-canvas").bounding_box()["width"]

            page.get_by_role("button", name="Mostrar workers").click()
            page.wait_for_selector(".workers-panel:not(.is-collapsed) .workers-panel-head")
            assert page.locator(".notation-canvas").bounding_box()["width"] < canvas_folded - 200

            page.reload()
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 0

            page.goto(f"{base}/documents/map")
            page.wait_for_selector(".workers-panel-head", timeout=30000)
            page.get_by_role("button", name="Plegar workers").click()
            page.wait_for_selector(".workers-panel.is-collapsed")
            page.goto(f"{base}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=30000)
            assert page.locator(".workers-panel.is-collapsed").count() == 0
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=10)

FILE:tests/e2e_mindmap_notation.py
"""E2E de la vista Specs: un spec del store dibujado según su notación.

1. Store temporal real: `sldb notations sync --spec` de dos pilotos de
   tests/fixtures/notation-pilots (statechart con estado compuesto y diagrama de clases UML).
2. La pestaña Specs lista los SpecDoc agrupados por `category` (vacía aquí).
3. El statechart se dibuja con los subestados DENTRO del compuesto (nest como
   contención de React Flow, no como arista), la marca `initial` y la
   transición que sale del compuesto.
4. El diagrama de clases muestra compartimentos con los atributos reales y
   terminales propias (triángulo hueco de la herencia).
5. Una secuencia se dibuja en carriles (mensajes bajando por `order`, la
   autollamada como bucle) y una matriz en grilla (celda en la intersección
   fila × columna, filas indentadas por anidado).
"""
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import pytest

MINDMAP = Path(__file__).parents[1] / "frontends" / "mindmap"
PILOTS = Path(__file__).resolve().parent / "fixtures" / "notation-pilots"
MATRIX = PILOTS / "matrix.quotation-view.yml"

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

PORT = 8157
LANES_PORT = 8159


def _store(pilots=None):
    pilots = pilots or [PILOTS / "state-diagram-sync-lifecycle.yml", PILOTS / "class-sldb-models.yml"]
    root = Path(tempfile.mkdtemp(prefix="kb-e2e-notation-"))
    for pilot in pilots:
        shutil.copy(pilot, root / pilot.name)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for p in pilots for a in ("--spec", p.name)], "--store", ".sldb"],
                   cwd=root, check=True, capture_output=True)
    return root / ".sldb"


def _start_server(store, port=PORT):
    server = subprocess.Popen(
        [sys.executable, str(MINDMAP / "serve.py"), str(port)],
        cwd=str(MINDMAP), env={**os.environ, "SLDB_STORE": str(store), "GRAPH_UI_BACKEND": "local"},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(60):
        time.sleep(0.25)
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/api/graph", timeout=1)
            return server
        except Exception:
            continue
    server.terminate()
    raise AssertionError("el servidor del editor nunca respondió")


def test_specs_view_draws_nest_markers_compartments_and_terminals():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    server = _start_server(_store())
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{PORT}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=15000)
            # Las categorías del catálogo (la leyenda de la notación va aparte, al pie).
            headings = page.locator(".notation-catalog section:not(.notation-legend) > h3").all_inner_texts()
            # `diagram sync` no escribe `category` (lo hace `catalog sync`): sin categoría.
            assert [h.lower() for h in headings] == ["sin categoría"], headings
            assert page.locator(".notation-catalog button").count() == 2

            page.click('[data-spec="state.diagram-sync-lifecycle"]')
            page.wait_for_selector(".notation-canvas .glyph", timeout=15000)
            page.wait_for_timeout(700)  # fitView anima el zoom: medir cajas a mitad mezcla escalas
            assert page.locator(".notation-canvas .glyph").count() == 7
            # Los subestados son hijos del compuesto en React Flow (parentId).
            for child in ("validating", "writing", "indexing"):
                node = page.locator(f'.react-flow__node[data-id="SpecNodeDoc:state.diagram-sync-lifecycle.{child}"]')
                assert node.count() == 1
            container = page.locator('[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.syncing"]')
            assert "is-container" in container.get_attribute("class")
            cbox = container.bounding_box()
            for child in ("validating", "writing", "indexing"):
                box = page.locator(f'[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.{child}"]').bounding_box()
                assert cbox["x"] <= box["x"] and box["x"] + box["width"] <= cbox["x"] + cbox["width"] + 1, child
                assert cbox["y"] <= box["y"] and box["y"] + box["height"] <= cbox["y"] + cbox["height"] + 1, child
            assert page.locator('[data-doc="SpecNodeDoc:state.diagram-sync-lifecycle.idle"] [data-marker="initial"]').count() == 1
            # 11 links: 3 nest se vuelven contención, 8 transiciones se dibujan.
            assert page.locator(".react-flow__edge").count() == 8
            assert page.locator(".notation-notices").count() == 0
            from e2e_notation_legibility import assert_nodes_framed
            assert_nodes_framed(page)  # «Ver todo»: cada nodo completo en el lienzo, con margen

            page.click('[data-spec="class.sldb-models"]')
            page.wait_for_selector('[data-doc="SpecNodeDoc:class.sldb-models.SpecDoc"]', timeout=15000)
            page.wait_for_timeout(700)
            assert_nodes_framed(page)
            attrs = page.locator('[data-doc="SpecNodeDoc:class.sldb-models.SpecDoc"] .glyph-compartment li').all_inner_texts()
            assert "id: str" in attrs and any(a.startswith("nodes:") for a in attrs), attrs
            assert page.locator('.react-flow__edge path[marker-end*="nv-hollow-triangle"]').count() >= 1
            # Rótulos de extremo (§8d): las multiplicidades de la agregación y las composiciones.
            ends = page.locator(".notation-end-label")
            texts = ends.all_inner_texts()
            assert {"1", "*", "1..*"} <= set(texts), texts
            assert page.locator('.notation-end-label[data-end="source"]').count() >= 1
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)


def test_specs_view_draws_sequences_in_lanes_and_matrices_in_a_grid():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    server = _start_server(_store([PILOTS / "sequence-render-pipeline.yml", PILOTS / "sequence-sync-pipeline.yml",
                                   MATRIX, PILOTS / "matrix-pipeline-coverage.yml"]), LANES_PORT)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1400, "height": 900})
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.goto(f"http://127.0.0.1:{LANES_PORT}/specs/notation")
            page.wait_for_selector(".notation-catalog button", timeout=15000)

            page.click('[data-spec="sequence.render-pipeline"]')
            # Wait for this spec's own lanes: the spec drawn before the click also has
            # .lane-message, and reading the heads then races the swap.
            page.wait_for_selector('.lane-head[data-lane^="SpecNodeDoc:sequence.render-pipeline."]', timeout=15000)
            assert page.locator(".notation-notices").count() == 0
            heads = page.locator(".lane-head").evaluate_all("els => els.map(e => [e.dataset.lane.split('.').pop(), e.getBoundingClientRect().x])")
            assert [h[0] for h in heads] == ["User", "CLI", "Facade", "Loader", "Validator", "Compiler", "Renderer", "Disk"]
            assert all(heads[i][1] < heads[i + 1][1] for i in range(len(heads) - 1))
            messages = page.locator(".lane-message").evaluate_all(
                "els => els.map(e => [Number(e.dataset.order), e.getBoundingClientRect().y, e.dataset.from === e.dataset.to])")
            assert [m[0] for m in messages] == list(range(1, 15))
            assert all(messages[i][1] < messages[i + 1][1] for i in range(len(messages) - 1)), "el tiempo baja"
            assert [m[0] for m in messages if m[2]] == [4], "la autollamada del Loader es el mensaje 4"
            ret = page.locator('.lane-message[data-order="5"] .message-line')
            assert ret.get_attribute("stroke-dasharray") == "6 4" and "nv-open-arrow" in ret.get_attribute("marker-end")
            assert page.locator(".lane-frame").count() == 0, "render-pipeline no tiene fragmentos"

            # Fragmentos (§8c/§11): pestaña con el operador, condición al lado, marco
            # de la primera a la última fila y sobre las líneas de vida que tocan.
            page.click('[data-spec="sequence.sync-pipeline"]')
            page.wait_for_selector('.lane-head[data-lane^="SpecNodeDoc:sequence.sync-pipeline."]', timeout=15000)
            page.wait_for_selector(".lane-frame", timeout=15000)
            frames = page.locator(".lane-frame")
            assert frames.count() == 3
            svg_text = "els => els.map(e => e.textContent)"  # <text> de SVG no tiene innerText
            assert page.locator(".lane-frame .frame-label").evaluate_all(svg_text) == ["loop", "alt", "loop"]
            assert page.locator(".lane-frame .frame-guard").evaluate_all(svg_text) == [
                "[for each spec]", "[the diagram type has a notation]", "[for each spec]"]
            box = frames.nth(0).locator(".frame-box").bounding_box()
            lanes = dict(page.locator(".lane-head").evaluate_all(
                "els => els.map(e => [e.dataset.lane.split('.').pop(), e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2])"))
            for p in ("CLI", "SpecSync", "Loader"):
                assert box["x"] < lanes[p] < box["x"] + box["width"], p
            assert lanes["User"] < box["x"]
            rows = page.locator(".lane-message").evaluate_all(
                "els => Object.fromEntries(els.map(e => [e.dataset.order, e.getBoundingClientRect().y]))")
            assert box["y"] < rows["2"] and rows["4"] < box["y"] + box["height"]
            assert not (box["y"] < rows["5"] < box["y"] + box["height"]), "el mensaje 5 ya es del alt"

            page.click('[data-spec="matrix.quotation-view"]')
            page.wait_for_selector(".notation-grid", timeout=15000)
            assert page.locator(".notation-notices").count() == 0
            assert page.locator(".notation-grid caption").inner_text() == "Quotation View"
            cols = page.locator(".notation-grid thead th[data-col]").all_inner_texts()
            assert [c.strip() for c in cols] == ["browse", "client", "basket", "validation", "completed"]
            depths = page.locator(".notation-grid tbody th").evaluate_all("els => els.map(e => [e.textContent, Number(e.dataset.depth)])")
            assert depths == [["QuotationFlow", 0], ["Store", 1], ["Basket", 1], ["BasketItem", 2]]
            # La celda marcada está en la columna de su stage y la fila de su componente.
            row = page.locator('.notation-grid tr[data-row$=".BasketItem"]')
            filled = row.locator("td").evaluate_all("tds => tds.map(td => td.classList.contains('is-filled'))")
            assert filled == [False, False, True, True, False]
            cell = row.locator("td.is-filled").first.bounding_box()
            head = page.locator('.notation-grid thead th[data-col$=".quotation__basket"]').bounding_box()
            assert abs((cell["x"] + cell["width"] / 2) - (head["x"] + head["width"] / 2)) < 2
            assert page.locator("td.is-filled").count() == 12

            # Piloto real de dos vistas: una tabla por vista, las filas vacías no se omiten.
            page.click('[data-spec="matrix.pipeline-coverage"]')
            page.wait_for_selector(".notation-grid caption >> text=Store sync", timeout=15000)
            assert page.locator(".notation-grid caption").all_inner_texts() == ["Render pipeline", "Store sync"]
            assert page.locator(".notation-grid").nth(0).locator("tbody tr").count() == 12
            assert page.locator(".notation-grid").nth(1).locator("tbody tr").count() == 12
            assert page.locator("td.is-filled").count() == 30
            # G7: a filled cell is a mark, not the view's name; the detail stays in its title.
            marks = page.locator("td.is-filled").evaluate_all("tds => tds.map(td => [td.textContent, Boolean(td.title)])")
            assert all(text == "●" and titled for text, titled in marks), marks[:3]
            assert page.locator(".notation-notices").count() == 0
            assert not errors, errors
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)

FILE:tests/e2e_review_workbench_views.py
"""E2E: projection views in review-workbench, against real servers and a real store.

A temporary store is built from the pilots of tests/fixtures/notation-pilots (``SpecNodeDoc`` documents joined by
``uses``/``inherits``/``reads``). Three real processes serve it: ``sldb serve`` (what
AntoniaFlowPage reads through ``/sldb``), the graph_ui server (``/api/views*``) and a production
build of review-workbench under ``vite preview``, whose proxy forwards both. In Chromium:

1. the sidebar's view query (model + where, relation types) redraws the canvas with exactly the
   nodes and edges ``evaluate_view`` computes on the server;
2. saving writes a ``ViewDoc`` to the store; after a reload, choosing it in "Saved views" redraws
   the same slice;
3. the same view pointed at a second store draws that store's slice;
4. a view's layout style places the nodes: ``rings`` by a payload field (every node of a ring at
   that ring's radius, inner ring first), ``layered`` top to bottom along the relations;
5. (also: every default node is only its NodeShell body, and a group's wrapper (measured on a probe
   with React Flow's classes, since no data path renders groups today) adds no frame either, RW1)
   a view with a ``notation`` (a third store, synced from tests/fixtures/notation-style with a
   styled notation) draws each node with its glyph's resolved style: the fill, stroke and icon the
   server resolved with sldb's ``resolve_documents``, painted on the node; each edge with its
   link's colour and dash; and the notation's legend in a canvas panel that covers no node.
"""
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

import pytest

try:
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sync_playwright = None

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "review-workbench"
MINDMAP = ROOT / "frontends" / "mindmap"
PILOTS = ROOT / "tests" / "fixtures" / "notation-pilots"
HERE = ["component-exception-hierarchy.yml", "component-type-system.yml"]
THERE = ["component-architecture.yml"]
STYLE = ROOT / "tests" / "fixtures" / "notation-style"
INFRA = {"nodes": [{"model": "SpecNodeDoc", "where": 'spec = "SpecDoc:component.style-infra"'}],
         "relations": ["reads", "calls", "publishes", "charges", "uses"], "direction": "both", "notation": "infra"}


def _free_port() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _wait(url: str, process=None, timeout=60) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if process is not None and process.poll() is not None:
            raise RuntimeError(f"{url}: the process exited ({process.returncode})")
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except Exception:
            time.sleep(0.3)
    raise RuntimeError(f"{url} did not answer")


def _store(root: Path, pilots: list[str]) -> Path:
    for pilot in pilots:
        shutil.copy(PILOTS / pilot, root / pilot)
    subprocess.run(["sldb", "stores", "init", "--path", str(root)], check=True, capture_output=True)
    subprocess.run(["sldb", "notations", "sync", *[a for p in pilots for a in ("--spec", p)], "--store", ".sldb"], cwd=root, check=True, capture_output=True)
    return root / ".sldb"


@pytest.fixture(scope="module")
def stack():
    if sync_playwright is None:
        pytest.skip("playwright no está instalado")
    if not (shutil.which("npx") and (APP / "node_modules").is_dir()):
        pytest.skip("review-workbench needs node and `npm ci` in apps/review-workbench")
    work = Path(tempfile.mkdtemp(prefix="rw-views-"))
    processes = []
    try:
        (work / "here").mkdir(), (work / "there").mkdir(), (work / "styled").mkdir()
        store, other = _store(work / "here", HERE), _store(work / "there", THERE)
        for spec in STYLE.glob("*.yml"):
            shutil.copy(spec, work / "styled" / spec.name)
        subprocess.run(["sldb", "stores", "init", "--path", str(work / "styled")], check=True, capture_output=True)
        subprocess.run(["sldb", "notations", "sync", "--spec", "component-infra.yml", "--notation", "infra.yml", "--store", ".sldb"],
                       cwd=work / "styled", check=True, capture_output=True)
        styled = work / "styled" / ".sldb"
        sldb_port, ui_port, app_port = _free_port(), _free_port(), _free_port()
        env = {**os.environ, "GRAPH_UI_BACKEND": "local", "SLDB_STORE": str(store)}
        processes.append(subprocess.Popen(["sldb", "serve", "--store", str(store), "--port", str(sldb_port)],
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        processes.append(subprocess.Popen([sys.executable, str(MINDMAP / "serve.py"), str(ui_port)], env=env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{sldb_port}/health", processes[0])
        _wait(f"http://127.0.0.1:{ui_port}/api/views", processes[1])
        dist = work / "dist"
        subprocess.run(["npx", "vite", "build", "--outDir", str(dist), "--emptyOutDir"], cwd=APP, check=True,
                       capture_output=True, timeout=300)
        app_env = {**os.environ, "VITE_SLDB_URL": f"http://127.0.0.1:{sldb_port}", "VITE_GRAPH_UI_URL": f"http://127.0.0.1:{ui_port}"}
        processes.append(subprocess.Popen(["npx", "vite", "preview", "--outDir", str(dist), "--port", str(app_port), "--strictPort",
                                           "--host", "127.0.0.1"], cwd=APP, env=app_env,
                                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
        _wait(f"http://127.0.0.1:{app_port}/", processes[2])
        yield {"store": store, "other": other, "styled": styled, "app": f"http://127.0.0.1:{app_port}", "ui": f"http://127.0.0.1:{ui_port}"}
    finally:
        for process in processes:
            process.terminate()
        for process in processes:
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        shutil.rmtree(work, ignore_errors=True)


def _expected(store: Path, view: dict) -> tuple[int, int]:
    from mindmap.projection_views import evaluate_view

    result = evaluate_view(store, view)
    return len(result["nodes"]), len(result["edges"])


def _apply(page, model: str, where: str, relations: str) -> None:
    if not page.locator("[data-testid='view-query']").is_visible():
        page.get_by_role("button", name="Filters").click()
    page.wait_for_selector("[data-testid='view-query']")
    if page.locator("[data-testid='view-model-0']").count() == 0:
        page.click("[data-testid='view-add-model']")
    page.fill("[data-testid='view-model-0']", model)
    page.fill("[data-testid='view-where-0']", where)
    page.fill("[data-testid='view-relations']", relations)
    page.locator("[data-testid='view-relations']").blur()
    page.click("[data-testid='view-apply']")


def _drawn(page, nodes: int, edges: int) -> None:
    page.wait_for_function(
        "([n, e]) => document.querySelectorAll('.react-flow__node').length === n"
        " && document.querySelectorAll('.react-flow__edge').length === e",
        arg=[nodes, edges], timeout=20000)


def test_views_query_save_reload_and_point_at_another_store(stack):
    inherits = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"]}
    boundary = {"nodes": [{"model": "SpecNodeDoc", "where": 'kind = "boundary"'}], "relations": []}
    n_inherits, e_inherits = _expected(stack["store"], inherits)
    n_boundary, e_boundary = _expected(stack["store"], boundary)
    n_there, e_there = _expected(stack["other"], {**inherits, "relations": []})
    assert e_inherits > 0 and 0 < n_boundary < n_inherits and n_there > 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='views-section']", timeout=30000)

        _apply(page, "SpecNodeDoc", "", "inherits")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-name']", "Herencia")
        page.click("[data-testid='view-save']")
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=15000)
        from mindmap.projection_views import find_view
        assert find_view(stack["store"], "ViewDoc:herencia")["relations"] == ["inherits"]

        _apply(page, "SpecNodeDoc", 'kind = "boundary"', "")
        _drawn(page, n_boundary, e_boundary)

        page.reload()
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:herencia']", state="attached", timeout=30000)
        page.select_option("[data-testid='saved-view-select']", "ViewDoc:herencia")
        _drawn(page, n_inherits, e_inherits)

        page.fill("[data-testid='view-store-path']", str(stack["other"]))
        _apply(page, "SpecNodeDoc", "", "")
        _drawn(page, n_there, e_there)
        assert errors == []
        browser.close()


def _save(ui: str, name: str, view: dict) -> None:
    request = urllib.request.Request(f"{ui}/api/views/save", data=json.dumps({"name": name, "view": view}).encode(),
                                     headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        assert response.status == 200


CENTERS = """() => Object.fromEntries([...document.querySelectorAll('.react-flow__node')].map((el) => {
  const m = /translate\\(([-\\d.]+)px,\\s*([-\\d.]+)px\\)/.exec(el.style.transform);
  return [el.dataset.id, [Number(m[1]) + el.offsetWidth / 2, Number(m[2]) + el.offsetHeight / 2]];
}))"""


def _laid_out(page, ref: str, nodes: int, edges: int) -> dict:
    page.select_option("[data-testid='saved-view-select']", ref)
    _drawn(page, nodes, edges)
    page.wait_for_function("() => [...document.querySelectorAll('.react-flow__node')].some((el) => !/translate\\(0px, 0px\\)/.test(el.style.transform))", timeout=20000)
    page.wait_for_timeout(500)
    return page.evaluate(CENTERS)


def test_layout_style_rings_by_field_and_layered_by_relation(stack):
    from mindmap.projection_views import evaluate_view

    rings = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"],
             "layout": {"kind": "graph", "style": "rings", "ring_field": "kind", "rings": ["core", "boundary"]}}
    layered = {"nodes": [{"model": "SpecNodeDoc", "where": ""}], "relations": ["inherits"],
               "layout": {"kind": "graph", "style": "layered", "direction": "TB"}}
    _save(stack["ui"], "anillos", rings)
    _save(stack["ui"], "capas", layered)
    result = evaluate_view(stack["store"], rings)
    kind = {n["id"].split("/", 3)[-1]: n["payload"]["kind"] for n in result["nodes"]}
    n, e = len(result["nodes"]), len(result["edges"])

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:anillos']", state="attached", timeout=30000)

        centers = _laid_out(page, "ViewDoc:anillos", n, e)
        radius = {node: (x * x + y * y) ** 0.5 for node, (x, y) in centers.items()}
        core = [r for node, r in radius.items() if kind[node] == "core"]
        boundary = [r for node, r in radius.items() if kind[node] == "boundary"]
        assert core and boundary
        assert max(core) - min(core) < 2 and max(boundary) - min(boundary) < 2
        assert max(core) < min(boundary)

        centers = _laid_out(page, "ViewDoc:capas", n, e)
        for edge in result["edges"]:
            source, target = (edge[k].split("/", 3)[-1] for k in ("source", "target"))
            assert centers[source][1] < centers[target][1], (source, target)
        browser.close()


NOTATION = r"""() => {
  const nodes = [...document.querySelectorAll('.react-flow__node')].map((el) => {
    const shell = el.querySelector('[data-testid^="node-"]'), body = el.querySelector('[data-notation-body]');
    return {id: el.dataset.id, glyph: shell?.dataset.glyph || null, fill: shell?.dataset.fill || null, stroke: shell?.dataset.stroke || null,
            icon: shell?.dataset.icon || null, iconDrawn: Boolean(el.querySelector('[data-notation-icon] path, [data-notation-icon] rect, [data-notation-icon] circle')),
            background: body ? getComputedStyle(body).backgroundColor : null, border: body ? getComputedStyle(body).borderTopColor : null};
  });
  const edges = [...document.querySelectorAll('.react-flow__edge')].map((el) => {
    const path = el.querySelector('.react-flow__edge-path'); const cs = getComputedStyle(path);
    return {id: el.dataset.id || path.id, stroke: cs.stroke, dash: cs.strokeDasharray};
  });
  const legend = document.querySelector('[data-testid="view-legend"]');
  const lr = legend && legend.getBoundingClientRect();
  const covers = lr ? [...document.querySelectorAll('.react-flow__node')].filter((n) => { const r = n.getBoundingClientRect();
    return r.left < lr.right && lr.left < r.right && r.top < lr.bottom && lr.top < r.bottom; }).length : null;
  return {nodes, edges, covers, legend: legend && {
    notation: legend.dataset.notation,
    glyphs: [...legend.querySelectorAll('.legend-glyph')].map((li) => ({glyph: li.dataset.glyph, fill: li.dataset.fill, icon: li.dataset.icon})),
    kinds: legend.querySelectorAll('.legend-kind').length,
    links: [...legend.querySelectorAll('.legend-link')].map((li) => ({link: li.dataset.link, color: li.dataset.color}))}};
}"""


# RW1: un nodo por defecto es solo su cuerpo (NodeShell); el contenedor de React Flow no agrega borde,
# sombra ni relleno, y su caja coincide con la del cuerpo.
FRAMES = r"""() => [...document.querySelectorAll('.react-flow__node-default')].map((el) => {
  const cs = getComputedStyle(el);
  const a = el.getBoundingClientRect(), b = (el.querySelector('.rounded-lg.border') || el).getBoundingClientRect();
  const border = ['Top', 'Right', 'Bottom', 'Left'].reduce((s, k) => s + parseFloat(cs[`border${k}Width`]), 0);
  return {id: el.dataset.id, border, shadow: cs.boxShadow, padding: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingTop),
          offset: Math.max(Math.abs(a.left - b.left), Math.abs(a.right - b.right), Math.abs(a.top - b.top), Math.abs(a.bottom - b.bottom))};
})"""


# Los grupos (GroupShell, que también dibuja su marco) no los produce hoy ningún camino de datos de la
# app: el marco del contenedor sale solo del CSS, así que se mide en una sonda con las mismas clases
# que React Flow le pone al contenedor de un nodo de tipo group, dentro del lienzo real.
GROUP_FRAME = r"""() => {
  const probe = document.createElement('div');
  probe.className = 'react-flow__node react-flow__node-group selectable';
  probe.dataset.type = 'group';
  probe.style.cssText = 'position:absolute;left:0;top:0;width:240px;height:160px;visibility:hidden';
  const inner = document.createElement('div'); inner.style.cssText = 'width:100%;height:100%'; probe.appendChild(inner);
  document.querySelector('.react-flow__nodes').appendChild(probe);
  const read = () => { const cs = getComputedStyle(probe), a = probe.getBoundingClientRect(), b = inner.getBoundingClientRect();
    return {border: ['Top', 'Right', 'Bottom', 'Left'].reduce((s, k) => s + parseFloat(cs[`border${k}Width`]), 0),
            padding: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingTop), shadow: cs.boxShadow, background: cs.backgroundImage,
            offset: Math.max(Math.abs(a.left - b.left), Math.abs(a.right - b.right), Math.abs(a.top - b.top), Math.abs(a.bottom - b.bottom))}; };
  const plain = read(); probe.classList.add('selected'); const selected = read(); probe.remove();
  return [plain, selected];
}"""


def _no_foreign_group_frame(page) -> None:
    for frame in page.evaluate(GROUP_FRAME):
        assert frame["border"] == 0 and frame["padding"] == 0 and frame["shadow"] == "none" and frame["background"] == "none" \
            and frame["offset"] <= 1, frame


def _no_foreign_frames(page) -> None:
    frames = page.evaluate(FRAMES)
    assert frames and all(f["border"] == 0 and f["shadow"] == "none" and f["padding"] == 0 and f["offset"] <= 1 for f in frames), \
        [f for f in frames if f["border"] or f["shadow"] != "none" or f["padding"] or f["offset"] > 1][:3]


def _rgb(hex_colour: str) -> str:
    h = hex_colour.lstrip("#")
    return "rgb({}, {}, {})".format(*(int(h[i:i + 2], 16) for i in (0, 2, 4)))


def test_a_view_with_a_notation_draws_glyph_styles_link_colours_and_the_legend(stack, tmp_path):
    from mindmap.projection_views import evaluate_view

    request = urllib.request.Request(f"{stack['ui']}/api/views/save", headers={"Content-Type": "application/json"},
                                     data=json.dumps({"name": "infra", "view": INFRA, "store": str(stack["styled"])}).encode())
    with urllib.request.urlopen(request, timeout=60) as response:
        assert response.status == 200
    expected = evaluate_view(stack["styled"], INFRA)
    styles = {key.removeprefix("sldb://document/"): value for key, value in expected["notation"]["nodes"].items()}
    dark = lambda themed: themed and (themed.get("dark") or themed.get("light"))  # noqa: E731  (review-workbench es oscuro)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto(stack["app"])
        page.wait_for_selector("[data-testid='views-section']", timeout=30000)
        page.fill("[data-testid='view-store-path']", str(stack["styled"]))
        page.locator("[data-testid='view-store-path']").blur()
        page.wait_for_selector("[data-testid='saved-view-select'] option[value='ViewDoc:infra']", state="attached", timeout=30000)
        _laid_out(page, "ViewDoc:infra", len(expected["nodes"]), len(expected["edges"]))
        page.wait_for_function("() => document.querySelectorAll('[data-notation-icon]').length >= 5", timeout=20000)
        page.wait_for_timeout(500)
        drawn = page.evaluate(NOTATION)

        # Cada nodo con el glifo y el estilo que resolvió el servidor, pintado en el nodo.
        nodes = {n["id"]: n for n in drawn["nodes"]}
        assert set(nodes) == set(styles)
        for ref, style in styles.items():
            node, fill, stroke, icon = nodes[ref], dark(style["style"].get("fill")), dark(style["style"].get("stroke")), style["style"].get("icon")
            assert node["glyph"] == style["glyph"], (ref, node)
            assert node["fill"] == fill and node["stroke"] == stroke and node["icon"] == icon, (ref, node, style)
            if fill:
                assert node["background"] == _rgb(fill), (ref, node)
            if stroke:
                assert node["border"] == _rgb(stroke), (ref, node)
            if icon:
                assert node["iconDrawn"], (ref, node)
        assert nodes["SpecNodeDoc:component.style-infra.checkout"]["fill"] == "#fff1c2"

        # Cada arista con el color y el trazo de su link: reads es punteada y azul.
        links = expected["notation"]["edges"]
        reads = [i for i, e in enumerate(expected["edges"]) if e["relation_type"] == "reads"]
        assert reads and all(links[i]["line"] == "dashed" for i in reads)
        dashed = [e for e in drawn["edges"] if e["dash"] not in ("none", "")]
        assert len(dashed) == len(reads) and all(e["stroke"] == _rgb("#0072b2") for e in dashed), drawn["edges"]

        # La leyenda de la notación, en un panel que no tapa nodos.
        legend = drawn["legend"]
        assert legend and legend["notation"] == "NotationDoc:infra", drawn
        assert len(legend["glyphs"]) == len(expected["notation"]["legend"]["glyphs"])
        assert len(legend["links"]) == len(expected["notation"]["legend"]["links"])
        assert legend["kinds"] == len(expected["notation"]["legend"]["kinds"])
        hot = next(g for g in legend["glyphs"] if g["glyph"] == "GlyphDoc:infra.hot")
        assert hot["fill"] == "#fff1c2" and hot["icon"] == "workflow"
        assert next(l for l in legend["links"] if l["link"] == "LinkDoc:infra.reads")["color"] == "#0072b2"
        assert drawn["covers"] == 0, drawn["covers"]
        _no_foreign_frames(page)
        page.click(".react-flow__node-default >> nth=0")
        _no_foreign_frames(page)  # también seleccionado
        _no_foreign_group_frame(page)
        page.click(".react-flow__controls-fitview")
        page.locator("[data-testid='view-legend']").scroll_into_view_if_needed()
        page.wait_for_timeout(600)
        page.screenshot(path=str(tmp_path / "view-notation.png"))
        assert errors == []
        browser.close()

FILE:desk/atoms/atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz.md
---
sldb:
  by: agent
  at: '2026-11-16T05:08:10Z'
  authority: generated
  via: save_document_payload
id: atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
title: La vista Specs dibuja lo que resuelve sldb.api.notations
five_wh_one_plus: how
tags:
- system:graph_ui
- system:sldb
- topic:notation
provenance: frontends/mindmap/views/specs/notation/notation.mjs
---

# La vista Specs dibuja lo que resuelve sldb.api.notations

## Answer

La vista Specs (/specs/notation) no interpreta notaciones: GET /api/notation/view devuelve tal cual sldb.api.notations.resolve_view, y la vista solo dibuja forma, compartimentos, marcas, terminales y rótulos. Las notaciones de fábrica viven en sldb/src/sldb/notations/builtin/ (activity, component, deployment, statechart, uml-class, uml-sequence…); graph_ui no importa ni invoca spec2viz (IR13). layout graph/tree va con dagre (draw nest como contención), lanes como carriles (un carril por nodo en orden, mensajes por order, fragmentos como marcos) y grid como una tabla por data.view, con filas components anidadas y celdas draw cell. Lo no soportado (axis, draw lane) se dibuja como grafo/línea con aviso. El contrato está en sldb/docs/architecture/notations-and-views.md.

FILE:instruccion
Cold-bundle de la tarea task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- python -m pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py
- python -m pytest -q -rs tests/e2e_notation_class.py tests/e2e_notation_sequence.py tests/e2e_notation_deployment.py tests/e2e_notation_activity.py tests/e2e_notation_style.py tests/e2e_notation_legibility.py tests/e2e_mindmap_notation.py tests/e2e_review_workbench_views.py
- ! grep -rnE 'from spec2viz|import spec2viz|importorskip\("spec2viz"\)|which\("spec2viz"\)|spec2viz\.sldb_models|spec2viz>=|spec2viz@' frontends tests pyproject.toml .github
- cd ../../IR && .venv/bin/specir retirement check --path graph_ui=../UIs/graph_ui

