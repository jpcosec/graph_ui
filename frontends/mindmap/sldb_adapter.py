"""Adaptador único para las operaciones de SLDB usadas por el Mindmap.

Por dentro delega en ``sldb.api`` — la única puerta a un store (ADR
``sldb/docs/architecture/pron-is-archived.md``) — en vez de reimplementar el CRUD/schema
contra las clases del CLI de SLDB a mano. ``resolve_ref``/``validate_ref`` resuelven un ref
arbitrario con un ``pythonpath`` arbitrario *antes* de que el modelo esté registrado en ningún
store.

Regla: ninguna regla de validación, hash, tracking o reindexación se duplica en
graph_ui; todo pasa por estas funciones.

Este módulo solo se usa en modo local; el modo remote de ``serve.py`` habla HTTP con
sldb serve.
"""
from __future__ import annotations

import hashlib
import json
import threading
from enum import Enum
from pathlib import Path
from typing import Any

from sldb.api import (add_model, create_document, describe_model_fields, load_registered_model,
                      load_runtime_documents, registered_models, save_document_payload, untrack_document)
from sldb.cli.model_utils import resolve_model_ref
from sldb.cli.serve.routes import serialize_document
from sldb.cli.store_context import get_store_context
from sldb.core.exceptions import SLDBError, SLDBStoreError  # re-exportada: el resto de mindmap no importa sldb
from sldb.store.io import load_store_index
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
    """Error del adaptador con código HTTP equivalente. ``estado`` es opcional: lo lleva solo un
    error con nombre propio en la respuesta (``store_no_preparado``, como en workspace_routes)."""

    def __init__(self, message: str, status: int = 400, completed: list[str] | None = None,
                 estado: str | None = None):
        super().__init__(message)
        self.status = status
        self.completed = completed or []
        self.estado = estado


class SldbAdapter:
    """Fachada de solo lectura y escritura sobre un store SLDB concreto."""

    def __init__(self, store: str | Path):
        self.store, self.root = get_store_context(str(store))
        self.pythonpath = str(self.root)
        self.view_path = self.store / "runtime" / VIEW_FILENAME
        self.lock = threading.RLock()

    def _path(self, pythonpath: str | None) -> str:
        """La mayoría de las llamadas usan el pythonpath del propio store; el
        compilador puede pedir uno distinto (módulos generados en otra carpeta)."""
        return pythonpath or self.pythonpath

    def _entries(self) -> list[Any]:
        """Los modelos registrados en el store, por nombre."""
        return registered_models(self.store)

    # ---------------------------------------------------------------- schema

    def schema(self) -> list[dict[str, Any]]:
        """Schema de SLDB enriquecido con el ``default`` real de cada campo.

        La forma base viene de ``describe_model_fields``; el default se lee por
        introspección del modelo para que la UI pueda aplicar defaults válidos
        sin duplicar reglas de SLDB.
        """
        with self.lock:
            out = []
            for entry in self._entries():
                try:
                    fields = [f.model_dump(exclude_none=True) for f in describe_model_fields(self.model_for(entry.name))]
                except Exception as exc:  # noqa: BLE001  (G1: el resto del schema sigue sirviendo)
                    # Un modelo que no se importa no tumba el schema: se informa con su error
                    # real para que la UI lo muestre en vez de "no hay specs".
                    out.append({"id": entry.name, "model_ref": entry.model_ref, "fields": [],
                                "import_error": f"{exc} ({exc.__cause__})" if exc.__cause__ else str(exc)})
                    continue
                model_dict = {"id": entry.name, "model_ref": entry.model_ref, "fields": fields}
                try:
                    model_type = self.model_for(entry.name)
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
        return load_runtime_documents(
            self.store, self._path(pythonpath),
            include_linked=bool(load_store_index(self.store).stores))

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
        return {m.name for m in self._entries()}

    def model_refs(self) -> dict[str, str]:
        """Mapa nombre -> ref de los modelos registrados en el store."""
        return {m.name: m.model_ref for m in self._entries()}

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
        return load_registered_model(self.store, model_name, self._path(pythonpath)).model_type

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
        """Local-only: crea vía ``sldb.api.create_document`` en el store local. En remote
        los creates van a ``POST /save``."""
        try:
            create_document(self.store, model_name, output, payload, name=name, pythonpath=self._path(pythonpath))
        except SLDBError as exc:
            raise AdapterError(str(exc)) from exc

    def update_document(self, runtime_doc: Any, payload: dict[str, Any],
                        pythonpath: str | None = None) -> None:
        """Local-only: replace vía ``sldb.api.save_document_payload``. En remote los updates
        van a ``POST /save`` (batch, con compare contra ``expected``)."""
        try:
            save_document_payload(self.store, runtime_doc.model_name, runtime_doc.name, payload,
                                  self._path(pythonpath))
        except SLDBError as exc:
            raise AdapterError(str(exc)) from exc

    def delete_document(self, name: str, pythonpath: str | None = None) -> None:
        """Local-only: destrackea en el store local (el Markdown queda en disco).
        En remote los deletes van a ``POST /save``."""
        try:
            if not any(d.name == name for d in self.documents(pythonpath)):
                raise AdapterError(f'El documento {name!r} no está trackeado.')
            untrack_document(self.store, name, self._path(pythonpath))
        except SLDBError as exc:
            raise AdapterError(str(exc)) from exc

    def default_document_path(self, model_name: str, name: str, pythonpath: str | None = None) -> Path:
        """Dónde debe vivir un documento nuevo de esta clase.

        Cada store decide su propio layout, no esta UI (somos el editor de
        cualquier store sldb, no solo de los que compilamos nosotros mismos):
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
        """Local-only: registra un modelo en el store local vía ``sldb.api.add_model``.
        El editor de clases en remote usa ``POST /models/*``."""
        try:
            add_model(self.store, model_ref, self._path(pythonpath))
        except SLDBError as exc:
            raise AdapterError(f"No se pudo registrar el modelo {model_ref!r}: {exc}") from exc

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
# el de este adaptador, así que estas funciones reciben el store. Se usa la API pública de sldb (sldb.api, sldb.api.graph).


def runtime_documents(store: str | Path, pythonpath: str | None = None) -> list[Any]:
    """Todos los documentos del store (``model_name``, ``name``, ``payload``).

    Cada lectura abre el store con la lectura pública ``sldb.api.read_store``: empieza una
    operación nueva y los cachés de sldb se revalidan contra el disco. Sin eso, un proceso de
    larga vida (el servidor, o un test) seguía sirviendo el roster de un modelo cacheado antes de
    que otro proceso escribiera en él (visto con ViewDoc desde sldb GO04 d7eefdeb).
    ``read_store`` no migra ni escribe el store: si su layout no es canónico lanza
    ``SLDBStoreError`` 'store not prepared: run `sldb stores update`' (views_routes lo responde 503).
    """
    from sldb.api import load_runtime_documents, read_store

    return load_runtime_documents(read_store(Path(store)).store_path, pythonpath)


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
