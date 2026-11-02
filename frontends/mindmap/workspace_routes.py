"""Multi-projection workspace routes: document IR, neighborhood graph, and referenced code.

Strictly read-only: ninguna ruta GET reconstruye indices (load_edge_index, nunca document_edges ni rebuild_edges;
un store desactualizado responde store_no_preparado). Riesgo declarado: open_store, dentro de load_edge_index y
doc_status, migra un layout no canonico y no hay consulta publica previa. Adheres to SLDB contracts, safe repo-bounded file inspection,
and zero top-level SLDB imports to support remote/headless modes without regressions.
"""
from __future__ import annotations

import hashlib
from http.server import BaseHTTPRequestHandler
import json
import os
from pathlib import Path
import re
import subprocess
from typing import Any
from urllib.parse import parse_qs, urlparse


MAX_CODE_BYTES = 256 * 1024  # 256 KB max for source previews
TEXT_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript',
    '.mjs': 'javascript',
    '.ts': 'typescript',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.txt': 'text',
    '.sh': 'shell',
    '.bash': 'shell',
    '.toml': 'toml',
    '.sql': 'sql',
    '.xml': 'xml',
}


class WorkspaceError(Exception):
    def __init__(self, message: str, status: int = 400, estado: str | None = None):
        super().__init__(message)
        self.status = status
        self.estado = estado


# Estado de guardia de lectura de archivo -> estado HTTP (navegacion §3.3, WS13.1).
SOURCE_STATE_HTTP = {
    'no_existe': 404,
    'fuera_del_repo': 403,
    'protegido': 403,
    'binario': 415,
    'directorio': 415,
    'no_markdown': 415,
    'demasiado_grande': 413,
    'sin_repo_root': 503,
    'error_lectura': 500,
    'ambiguous': 409,
}
STORE_NO_PREPARADO = 'store_no_preparado'
MODELO_NO_CARGA = 'modelo_no_carga'
EXPLORER_DEFAULT_ROOTS = ('desk', 'docs')
EXPLORER_MAX_FILES = 5000
EXPLORER_MAX_CANDIDATES = 20000
EXPLORER_SKIP_PARTS = ('__pycache__', 'node_modules')
ANCLA_INEXISTENTE = 'ancla_inexistente'
_EXTERNAL_PREFIXES = ('http://', 'https://')
_COLON_PREFIX = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._-]*:')


class ResolvedNodeDoc:
    """Representación canónica unificada de un nodo resuelto en el store."""
    def __init__(
        self,
        model_name: str,
        name: str,
        path: str = '',
        payload: dict[str, Any] | None = None,
        semantic_tags: list[str] | None = None,
        is_degraded: bool = False,
        degraded_reason: str | None = None
    ):
        self.model_name = model_name
        self.name = name
        self.path = path
        self.payload = payload or {}
        self.semantic_tags = semantic_tags or []
        self.is_degraded = is_degraded
        self.degraded_reason = degraded_reason
        # Lectura única del documento autorizado (None si no se leyó ninguna fuente).
        self.data: bytes | None = None
        self.text: str | None = None
        self.replaced = False
        self.template: str | None = None
        self.extract_error: str | None = None
        self.store_path: Any = None  # para doc_version (hash de campos del índice)


class WorkspaceRoutes:
    def __init__(self, store_path: Path | str | None, repo_root: Path | str | None = None, editor_store: Any = None):
        self.store_path = Path(store_path).resolve() if store_path else None
        self.repo_root = Path(repo_root).resolve() if repo_root else (self.store_path.parent if self.store_path else None)
        self.editor_store = editor_store
        # Lista de permitidos del explorador (H-02): configuracion confiable del operador, leida una vez.
        raw = os.environ.get('WORKSPACE_EXPLORER_ROOTS')
        if raw is None:
            self.explorer_entries = list(EXPLORER_DEFAULT_ROOTS)
        else:
            self.explorer_entries = [e.strip() for e in raw.split(',') if e.strip()]

    def dispatch(self, handler: BaseHTTPRequestHandler, method: str) -> None:
        if method != 'GET':
            return handler.json_response({'ok': False, 'error': f'Método {method} no permitido.'}, 405)

        route = urlparse(handler.path).path
        query = parse_qs(urlparse(handler.path).query)

        try:
            if route == '/api/workspace/node':
                ident = (query.get('id') or [None])[0]
                depth_str = (query.get('depth') or ['1'])[0]
                if not ident:
                    raise WorkspaceError('Parámetro id es obligatorio.', 400)
                try:
                    depth = int(depth_str)
                    if depth not in (1, 2):
                        raise ValueError()
                except ValueError:
                    raise WorkspaceError('depth debe ser 1 o 2.', 400)
                return handler.json_response(self.workspace_node(ident, depth))
            elif route == '/api/workspace/nodes':
                return handler.json_response(self.workspace_nodes())
            elif route == '/api/workspace/explorer':
                return handler.json_response(self.workspace_explorer())
            elif route == '/api/workspace/source':
                ident = (query.get('id') or [''])[0]
                path_param = (query.get('path') or [''])[0]
                if bool(ident) == bool(path_param):
                    raise WorkspaceError('Se requiere exactamente uno de id o path.', 400, 'seleccion_invalida')
                return handler.json_response(self.workspace_source(ident, path_param))
            else:
                raise WorkspaceError(f'Ruta desconocida: {route}', 404)
        except WorkspaceError as exc:
            body = {'ok': False, 'error': str(exc)}
            if exc.estado:
                body['estado'] = exc.estado
            return handler.json_response(body, exc.status)
        except Exception as exc:
            return handler.json_response({'ok': False, 'error': str(exc)}, 500)

    # ------------------------------------------------------------------
    # Lectura sin mutación y guardias previas (WS13.1 corrección).
    # Identidad y ruta salen de indexed_documents (solo índices); ninguna fuente se abre
    # antes de pasar las guardias de §3.3, y solo se leen fuentes autorizadas, una a una.
    # ------------------------------------------------------------------

    def _indexed(self) -> list[dict[str, str]]:
        from sldb.api.stores.indexed_documents import indexed_documents
        return indexed_documents(self.store_path)

    def _fresh_listing(self) -> None:
        """Inicio de operacion para un listado: el catalogo ve altas y bajas hechas por otros
        procesos. `new_operation` y `new_documents_hash_operation` solo invalidan caches en
        memoria (no escriben, no migran); no se llama open_store, que puede migrar."""
        from sldb.store.documents_hash import new_operation as new_documents_hash_operation
        from sldb.store.runtime_cache_signature import new_operation
        new_operation(self.store_path)
        new_documents_hash_operation(self.store_path)

    def _pythonpath(self) -> str | None:
        return getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None

    @staticmethod
    def _decode(data: bytes) -> tuple[str, bool]:
        try:
            return data.decode('utf-8'), False
        except UnicodeDecodeError:
            return data.decode('utf-8', errors='replace'), True

    def _extract_payload(self, model_name: str, text: str, models: dict[str, Any] | None = None) -> tuple[dict[str, Any], str | None]:
        """Payload del texto ya leído con la API pública (modelo registrado + extract_model_data).

        Devuelve (payload, plantilla del modelo). No abre ningún otro documento."""
        from sldb.api import load_registered_model
        from sldb.runtime.validation import extract_model_data

        cache = models if models is not None else {}
        model_type = cache.get(model_name)
        if model_type is None:
            model_type = load_registered_model(self.store_path, model_name, self._pythonpath()).model_type
            cache[model_name] = model_type
        return extract_model_data(model_type, text), getattr(model_type, '__template__', None)

    def workspace_nodes(self) -> dict[str, Any]:
        """Index of all documents in the store with canonical id Model:name.

        Identidad y ruta salen de los índices. Cada documento pasa las guardias de ruta antes
        de leerse; uno no autorizado aparece con su estado de guardia y su name como título,
        y nunca se abre."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)
        self._fresh_listing()
        try:
            entries = self._indexed()
        except Exception as exc:
            raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)

        nodes = []
        models: dict[str, Any] = {}
        for e in entries:
            model_name, name, path = e['model'], e['name'], e['path']
            node = {
                'id': f'{model_name}:{name}', 'name': name, 'model_name': model_name,
                'title': name, 'status': '', 'path': path, 'estado': 'ok',
            }
            try:
                _, _, data = self._read_authorized(path, markdown_only=False)
            except WorkspaceError as exc:
                node['estado'] = exc.estado or 'error_lectura'
                nodes.append(node)
                continue
            text, _ = self._decode(data)
            try:
                payload, _ = self._extract_payload(model_name, text, models)
            except Exception as exc:
                # El modelo de un documento autorizado no carga (load_registered_model o
                # extract_model_data, sin distinguirlos): conserva identidad y ruta, causa = str(exc).
                node['estado'] = MODELO_NO_CARGA
                node['causa'] = str(exc)
                nodes.append(node)
                continue
            node['title'] = payload.get('title') or payload.get('name') or name
            node['status'] = payload.get('status', '')
            nodes.append(node)
        return {'ok': True, 'nodes': nodes}

    # ------------------------------------------------------------------
    # WS13.2: explorador (GET /api/workspace/explorer). Solo lectura, sin cache, sin parametros
    # de ruta del cliente, sin abrir archivos para listar.
    # ------------------------------------------------------------------

    def _explorer_roots(self) -> tuple[list[str], list[dict[str, str]]]:
        """(raices validas y existentes, raices invalidas) de la configuracion del operador.

        Invalida: absoluta, con .., con un componente symlink o que no resuelve dentro de la
        raiz. Valida pero inexistente: se omite sin error."""
        valid: list[str] = []
        invalid: list[dict[str, str]] = []
        for entry in self.explorer_entries:
            def bad(reason: str, entry: str = entry) -> None:
                invalid.append({'entry': entry, 'reason': reason})
            if entry.startswith(('/', '\\')) or Path(entry).is_absolute() or re.match(r'^[A-Za-z]:', entry):
                bad('ruta_absoluta')
                continue
            parts = [p for p in re.split(r'[\\/]+', entry) if p not in ('', '.')]
            if not parts:
                bad('vacia')
                continue
            if '..' in parts or '\x00' in entry:
                bad('contiene_..')
                continue
            cur = self.repo_root
            symlink = False
            for part in parts:
                cur = cur / part
                if cur.is_symlink():
                    symlink = True
                    break
            if symlink:
                bad('symlink')
                continue
            if not cur.resolve().is_relative_to(self.repo_root):
                bad('fuera_del_repo')
                continue
            rel = '/'.join(parts)
            if cur.is_dir() and rel not in valid:
                valid.append(rel)
        return valid, invalid

    def _check_ignore_batch(self, rels: list[str]) -> tuple[set[str], str | None]:
        """Una sola invocacion `git check-ignore --stdin -z` (argv fijo, sin shell, cwd en la raiz).

        Devuelve (ignorados, error). Con error, el llamador falla cerrado. Sin repo git no hay
        comprobacion: (vacio, None)."""
        if not rels:
            return set(), None
        try:
            res = subprocess.run(
                ['git', 'check-ignore', '--stdin', '-z'],
                input=b'\x00'.join(r.encode('utf-8') for r in rels) + b'\x00',
                capture_output=True, timeout=30, cwd=str(self.repo_root),
            )
        except Exception as exc:
            return set(), f'error al ejecutar git check-ignore ({exc})'
        if res.returncode not in (0, 1):
            return set(), f'verificacion git fallo (codigo {res.returncode})'
        return {p.decode('utf-8', errors='replace') for p in res.stdout.split(b'\x00') if p}, None

    def _walk_candidates(self, roots: list[str]) -> tuple[list[tuple[str, str]], bool]:
        """(ruta, ruta resuelta) de los .md que pasan los filtros estaticos; tope duro de candidatos."""
        out: list[tuple[str, str]] = []
        seen: set[str] = set()
        capped = False
        for root_rel in roots:
            for dirpath, dirnames, filenames in os.walk(self.repo_root / root_rel, followlinks=False):
                dirnames[:] = sorted(
                    d for d in dirnames
                    if not d.startswith('.') and d not in EXPLORER_SKIP_PARTS and not (Path(dirpath) / d).is_symlink()
                )
                for fname in sorted(filenames):
                    if fname.startswith('.') or not fname.lower().endswith('.md'):
                        continue
                    full = Path(dirpath) / fname
                    rel = full.relative_to(self.repo_root).as_posix()
                    if rel in seen:
                        continue
                    if full.is_symlink():
                        # Un archivo symlink daria una segunda identidad al mismo archivo (§2.2):
                        # solo se lista el destino real, por su propia ruta.
                        continue
                    seen.add(rel)
                    out.append((rel, rel))
                    if len(out) >= EXPLORER_MAX_CANDIDATES:
                        return out, True
        return out, capped

    def workspace_explorer(self) -> dict[str, Any]:
        """Catalogo de documentos modelados (todos, desde los indices) y Markdown no modelado de
        las rutas permitidas. Sin parametros del cliente, sin cache, sin abrir ningun archivo."""
        if not self.store_path or not self.store_path.exists():
            raise WorkspaceError('El store no está disponible.', 503)
        if not self.repo_root:
            raise WorkspaceError('No se configuró repo_root.', 503, 'sin_repo_root')
        self._fresh_listing()
        try:
            entries = self._indexed()
        except Exception as exc:
            raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)

        sin_git = not (self.repo_root / '.git').exists()
        roots, roots_invalid = self._explorer_roots()
        candidates, capped = self._walk_candidates(roots)

        # Rutas resueltas de los modelados: un archivo rastreado no se repite como no modelado (§2.2).
        tracked: set[str] = set()
        modeled_rels: list[tuple[dict[str, str], str]] = []
        for e in entries:
            resolved = (self.repo_root / e['path']).resolve()
            tracked.add(resolved.as_posix())
            rel = resolved.relative_to(self.repo_root).as_posix() if resolved.is_relative_to(self.repo_root) else ''
            modeled_rels.append((e, rel))
        candidates = [(r, rr) for r, rr in candidates if (self.repo_root / rr).resolve().as_posix() not in tracked]

        ignored_set: set[str] = set()
        ignore_error: str | None = None
        if not sin_git:
            to_check = sorted({rr for _, rr in candidates} | {rel for _, rel in modeled_rels if rel})
            ignored_set, ignore_error = self._check_ignore_batch(to_check)
        batch = (ignored_set, ignore_error) if not sin_git else (set(), None)

        modeled = []
        for e, _ in sorted(modeled_rels, key=lambda item: (item[0]['model'], item[0]['name'])):
            estado = 'ok'
            try:
                self._guard_path(e['path'], markdown_only=False, ignored=batch)
            except WorkspaceError as exc:
                estado = exc.estado or 'error_lectura'
            modeled.append({
                'id': f"{e['model']}:{e['name']}", 'name': e['name'], 'model_name': e['model'],
                'title': e['name'], 'path': e['path'], 'estado': estado,
            })

        unmodeled = []
        truncado = capped
        if ignore_error is None:
            for rel, rr in sorted(candidates, key=lambda c: c[0]):
                if rr in ignored_set:
                    continue
                if len(unmodeled) >= EXPLORER_MAX_FILES:
                    truncado = True
                    break
                unmodeled.append({'path': rel, 'name': rel.rsplit('/', 1)[-1]})

        return {
            'ok': True,
            'repo': 'local',
            'roots': roots,
            'roots_invalid': roots_invalid,
            'sin_git': sin_git,
            'truncado': truncado,
            'limite': EXPLORER_MAX_FILES,
            'ignorados_error': ignore_error,
            'modeled': modeled,
            'unmodeled': unmodeled,
        }

    def workspace_node(self, ident: str, depth: int = 1) -> dict[str, Any]:
        """Multi-projection data for a selected node."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)

        if not ident or '..' in ident or ident.startswith(('/', '\\')):
            raise WorkspaceError('Identificador inválido o con intento de escape.', 400)

        from sldb.api.documents.document_serialization import doc_version

        doc = self._resolve_document(ident, markdown_only=False)
        canon_id = f"{doc.model_name}:{doc.name}"
        payload = getattr(doc, 'payload', {}) or {}

        # 1. Proyección Document (IR estructurado) desde la lectura única del documento autorizado
        doc_proj = {'ok': True, 'ir': None, 'payload': payload, 'semantic_tags': getattr(doc, 'semantic_tags', []), 'error': None}
        if doc.extract_error is not None:
            doc_proj['ok'] = False
            doc_proj['error'] = doc.extract_error
        else:
            try:
                doc_proj['ir'] = self._build_ir(doc)
            except Exception as exc:
                doc_proj['ok'] = False
                doc_proj['error'] = str(exc)

        # 2. Proyección Graph: load_edge_index sin reconstruir; store no preparado => ok false
        idx, idx_error = self._load_index()
        graph_proj = self._build_graph_neighborhood(canon_id, idx, idx_error, depth)

        # 3. Proyección Code (archivos y fragmentos referenciados de forma segura)
        code_proj = self._build_code_projection(payload, doc)

        # 4. Contexto lateral
        content_hash = None
        content_hash_error = None
        try:
            content_hash = doc_version(doc)
        except Exception as exc:
            content_hash_error = str(exc)

        file_revision = hashlib.sha256(doc.data).hexdigest() if doc.data is not None else ''

        relations = self._relations_state(idx, idx_error)
        if relations['ok']:
            edges_all = graph_proj.get('edges', [])
            incoming = [e for e in edges_all if e['target'] == canon_id]
            outgoing = [e for e in edges_all if e['source'] == canon_id]
        else:
            incoming = outgoing = None

        problems_report = self._check_problems_for_node(canon_id, idx, idx_error)

        context = {
            'id': canon_id,
            'name': doc.name,
            'model_name': doc.model_name,
            'path': str(getattr(doc, 'path', '')),
            'status': payload.get('status', ''),
            'current_node': payload.get('current_node', ''),
            'content_hash': content_hash,
            'content_hash_error': content_hash_error,
            'file_revision': file_revision,
            'file_revision_error': None,
            'documents_error': None,
            'is_degraded': getattr(doc, 'is_degraded', False),
            'degraded_reason': getattr(doc, 'degraded_reason', None),
            'summary': payload.get('summary') or payload.get('rationale') or payload.get('goal') or '',
            'incoming_relations': incoming,
            'outgoing_relations': outgoing,
            'relations_state': relations,
            'problems_report': problems_report,
            'metadata': {
                'tags': getattr(doc, 'semantic_tags', []),
                'pills': payload.get('pills', []),
                'atoms': payload.get('atoms', []),
                'depends_on': payload.get('depends_on', [])
            }
        }

        return {
            'ok': True,
            'node': {
                'id': canon_id,
                'name': doc.name,
                'model_name': doc.model_name,
                'path': str(getattr(doc, 'path', '')),
                'content_hash': content_hash,
                'file_revision': file_revision,
                'is_degraded': getattr(doc, 'is_degraded', False),
            },
            'documents_error': None,
            'projections': {
                'document': doc_proj,
                'graph': graph_proj,
                'code': code_proj,
            },
            'context': context
        }

    def _build_ir(self, doc: Any) -> dict[str, Any]:
        """IR del builder público sobre el texto ya leído de un documento autorizado."""
        from sldb.api import build_document_ir_json

        runtime = {
            'store': 'local', 'model': doc.model_name, 'name': doc.name, 'path': doc.path,
            'payload': doc.payload, 'semantic_tags': doc.semantic_tags,
        }
        return build_document_ir_json(runtime, doc.text, doc.template)

    @staticmethod
    def _frontmatter_payload(text: str, name: str) -> tuple[dict[str, Any], bool]:
        """(payload del frontmatter, degradado). Sano si el frontmatter lleva id == name."""
        extracted: dict[str, Any] = {}
        degraded = True
        if text.startswith('---'):
            parts = text.split('---', 2)
            if len(parts) >= 3:
                try:
                    import yaml
                    extracted = yaml.safe_load(parts[1]) or {}
                    if isinstance(extracted, dict) and extracted.get('id') == name:
                        degraded = False
                except Exception:
                    extracted = {}
        return (extracted if isinstance(extracted, dict) else {}), degraded

    def _materialize(self, model_name: str, name: str, rel: str, data: bytes, models: dict[str, Any] | None = None) -> ResolvedNodeDoc:
        """Documento indexado a partir de sus bytes ya leídos (autorizados)."""
        text, replaced = self._decode(data)
        doc = ResolvedNodeDoc(model_name=model_name, name=name, path=rel)
        doc.store_path = self.store_path
        doc.data, doc.text, doc.replaced = data, text, replaced
        try:
            doc.payload, doc.template = self._extract_payload(model_name, text, models)
        except Exception as exc:
            doc.extract_error = str(exc)
            doc.payload, fm_degraded = self._frontmatter_payload(text, name)
            # El modelo no carga o no valida: el documento esta degradado aunque el frontmatter
            # rescate un payload. La causa es la recibida (str de la excepcion), sin renombrarla.
            doc.is_degraded = True
            doc.degraded_reason = f'Fallo al validar documento en disco ({exc})'
        return doc

    def _match_indexed(self, ident: str, entries: list[dict[str, str]]) -> dict[str, str] | None:
        if ':' in ident:
            model_name, name = ident.split(':', 1)
            return next((e for e in entries if e['model'] == model_name and e['name'] == name), None)
        if '/' in ident:
            model_name, name = ident.split('/', 1)
            return next((e for e in entries if e['model'] == model_name and e['name'] == name), None)
        matches = [e for e in entries if e['name'] == ident]
        if len(matches) > 1:
            models = [e['model'] for e in matches]
            raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
        return matches[0] if matches else None

    def _resolve_document(self, ident: str, markdown_only: bool = False) -> ResolvedNodeDoc:
        """Resuelve la identidad por índices y lee solo el documento pedido, tras las guardias."""
        try:
            entries = self._indexed()
        except Exception:
            entries = []
        entry = self._match_indexed(ident, entries)
        if entry is not None:
            _, rel, data = self._read_authorized(entry['path'], markdown_only)
            return self._materialize(entry['model'], entry['name'], rel, data)
        return self._resolve_document_fallback(ident, markdown_only)

    def _resolve_document_fallback(self, ident: str, markdown_only: bool) -> ResolvedNodeDoc:
        """Documento que los índices no listan: lo busca en el índice de aristas y rescata el
        frontmatter de los candidatos fijos, cada uno tras las guardias de ruta."""
        try:
            from sldb.api.edges.edge_reading import load_edge_index
            idx = load_edge_index(self.store_path, include_linked=False)
            target_key = f"sldb://document/{ident}" if ':' in ident else None
            m_name, d_name = ident.split(':', 1) if ':' in ident else (None, ident)

            resolved_target = None
            if target_key and target_key in idx.nodes:
                resolved_target = (m_name, d_name)
            elif not m_name:
                candidates = [k for k in idx.nodes if k.startswith('sldb://document/') and k.endswith(f":{d_name}")]
                if len(candidates) > 1:
                    models = [c.replace('sldb://document/', '').split(':', 1)[0] for c in candidates]
                    raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
                elif len(candidates) == 1:
                    resolved_target = candidates[0].replace('sldb://document/', '').split(':', 1)

            if resolved_target:
                found_model, found_name = resolved_target
                doc = ResolvedNodeDoc(
                    model_name=found_model, name=found_name, path='', payload={},
                    is_degraded=True, degraded_reason='Documento no listado en los índices del store.',
                )
                doc.extract_error = doc.degraded_reason
                doc.store_path = self.store_path
                for rel in (
                    f"desk/tasks/{found_name}.md",
                    f"desk/contexts/{found_name}.md",
                    f"desk/rituals/{found_name}.md",
                    f"desk/roles/{found_name}.md",
                    f"desk/runs/{found_name}.md",
                    f"desk/relations/{found_name}.yaml",
                    f"desk/relations/{found_name}.md",
                ):
                    try:
                        _, crel, data = self._read_authorized(rel, markdown_only=False)
                    except WorkspaceError as exc:
                        if exc.estado == 'no_existe':
                            continue
                        raise
                    text, replaced = self._decode(data)
                    doc.path, doc.data, doc.text, doc.replaced = crel, data, text, replaced
                    doc.payload, doc.is_degraded = self._frontmatter_payload(text, found_name)
                    doc.degraded_reason = None if not doc.is_degraded else doc.degraded_reason
                    if markdown_only and not crel.endswith('.md'):
                        raise WorkspaceError('Solo se abren documentos Markdown (.md).', SOURCE_STATE_HTTP['no_markdown'], 'no_markdown')
                    return doc
                return doc
        except WorkspaceError:
            raise
        except Exception:
            pass
        raise WorkspaceError(f'Documento no encontrado: {ident}', 404)

    def _load_index(self) -> tuple[Any, str | None]:
        """Índice de aristas sin reconstruir (load_edge_index, include_linked=False)."""
        try:
            from sldb.api.edges.edge_reading import load_edge_index
            return load_edge_index(self.store_path, include_linked=False), None
        except Exception as exc:
            return None, str(exc)

    @staticmethod
    def _relations_state(idx: Any, idx_error: str | None) -> dict[str, Any]:
        """Estado de las relaciones: ok, o store_no_preparado con la lista stale, o error."""
        if idx is None:
            return {'ok': False, 'estado': 'error_indice', 'stale': [], 'error': idx_error}
        stale = list(getattr(idx, 'stale', []) or [])
        if stale:
            return {
                'ok': False, 'estado': STORE_NO_PREPARADO, 'stale': stale,
                'error': 'El store no está preparado: el índice de aristas está desactualizado. '
                         'La preparación (rebuild_edges) es explícita y externa a la petición.',
            }
        return {'ok': True, 'estado': 'ok', 'stale': [], 'error': None}

    @staticmethod
    def _document_edges(idx: Any) -> list[dict[str, Any]]:
        """Aristas documento-a-documento del índice, sin reconstruir.

        La deduplicación por (source, target, type, relation_doc) no descarta procedencias:
        cada arista conserva en `provenance` la metadata de todos los registros del índice
        que la originan. Cada procedencia lleva `owner`: el documento cuyo campo la declara
        (el source del registro, para origen schema); relation_doc y structural no tienen
        campo ni dueño (`owner` None).
        """
        prefix = 'sldb://document/'
        merged: dict[tuple, dict[str, Any]] = {}
        for rec in idx.edges:
            if not (rec.source.startswith(prefix) and rec.target.startswith(prefix)):
                continue
            meta = dict(rec.metadata or {})
            relation_doc = meta.get('relation_doc')
            source, target = rec.source[len(prefix):], rec.target[len(prefix):]
            key = (source, target, rec.relation, relation_doc)
            edge = merged.get(key)
            if edge is None:
                edge = {
                    'source': source,
                    'target': target,
                    'type': rec.relation,
                    'origin': str(meta.get('origin', '')),
                    'relationDoc': relation_doc,
                    'provenance': [],
                }
                merged[key] = edge
            prov = {k: v for k, v in meta.items() if k != 'relation_doc'}
            prov['owner'] = source if (meta.get('origin') == 'schema' and meta.get('field')) else None
            if prov not in edge['provenance']:
                edge['provenance'].append(prov)
        return list(merged.values())

    def _node_label(self, entry: dict[str, str] | None, fallback_name: str, models: dict[str, Any]) -> tuple[str, str, str]:
        """(título, status, estado) de un vecino; lee solo si pasa las guardias de ruta."""
        if entry is None:
            return fallback_name, '', 'no_listado'
        try:
            _, _, data = self._read_authorized(entry['path'], markdown_only=False)
        except WorkspaceError as exc:
            return fallback_name, '', exc.estado or 'error_lectura'
        text, _ = self._decode(data)
        try:
            payload, _ = self._extract_payload(entry['model'], text, models)
        except Exception:
            return fallback_name, '', 'error_lectura'
        return payload.get('title') or payload.get('name') or fallback_name, payload.get('status', ''), 'ok'

    def _build_graph_neighborhood(self, root_id: str, idx: Any, idx_error: str | None, depth: int) -> dict[str, Any]:
        state = self._relations_state(idx, idx_error)
        if not state['ok']:
            return {
                'ok': False, 'depth': depth, 'nodes': [], 'edges': [],
                'estado': state['estado'], 'stale': state['stale'], 'error': state['error'],
            }
        try:
            edges = self._document_edges(idx)
            adj: dict[str, list[Any]] = {}
            for edge in edges:
                adj.setdefault(edge['source'], []).append(edge)
                adj.setdefault(edge['target'], []).append(edge)

            visited_nodes: dict[str, int] = {root_id: 0}
            current_level = {root_id}

            for current_depth in range(1, depth + 1):
                next_level = set()
                for nid in current_level:
                    for edge in adj.get(nid, []):
                        neighbor = edge['target'] if edge['source'] == nid else edge['source']
                        if neighbor not in visited_nodes:
                            visited_nodes[neighbor] = current_depth
                            next_level.add(neighbor)
                current_level = next_level

            # Filtrar aristas cuyos dos extremos estén en visited_nodes
            seen_edges = set()
            neighborhood_edges = []
            for nid in visited_nodes:
                for edge in adj.get(nid, []):
                    if edge['source'] in visited_nodes and edge['target'] in visited_nodes:
                        edge_key = (edge['source'], edge['target'], edge['type'], edge['relationDoc'])
                        if edge_key not in seen_edges:
                            seen_edges.add(edge_key)
                            neighborhood_edges.append(edge)

            by_id = {f"{e['model']}:{e['name']}": e for e in self._indexed()}
            models: dict[str, Any] = {}
            nodes = []
            for nid, hop in visited_nodes.items():
                m_name, n_name = nid.split(':', 1) if ':' in nid else ('', nid)
                title, status, estado = self._node_label(by_id.get(nid), n_name, models)
                nodes.append({
                    'id': nid,
                    'name': n_name,
                    'model_name': m_name,
                    'title': title,
                    'status': status,
                    'estado': estado,
                    'depth': hop
                })

            return {
                'ok': True,
                'depth': depth,
                'nodes': nodes,
                'edges': neighborhood_edges,
                'estado': 'ok',
                'stale': [],
                'error': None
            }
        except Exception as exc:
            return {
                'ok': False,
                'depth': depth,
                'nodes': [],
                'edges': [],
                'error': str(exc)
            }

    def _build_code_projection(self, payload: dict[str, Any], doc: Any = None) -> dict[str, Any]:
        if getattr(doc, 'is_degraded', False):
            reason = getattr(doc, 'degraded_reason', None) or 'Documento corrupto en disco (payload no disponible).'
            return {
                'ok': False,
                'files': [],
                'total': 0,
                'error': f'Código no disponible: {reason}'
            }

        # Cada referencia conserva campo y posición 0-based en la lista original del campo
        # (contando los elementos omitidos) antes de concatenar files y references.
        doc_id = f"{getattr(doc, 'model_name', '')}:{getattr(doc, 'name', '')}" if doc is not None else ''
        inspected = []
        for field in ('files', 'references'):
            values = payload.get(field)
            if not isinstance(values, list):
                continue
            for position, ref in enumerate(values):
                if not isinstance(ref, str) or not ref.strip():
                    continue
                item = self._inspect_file_reference(ref.strip())
                item.update({'doc': doc_id, 'field': field, 'position': position, 'value': ref})
                inspected.append(item)

        return {
            'ok': True,
            'files': inspected,
            'total': len(inspected),
            'error': None
        }

    def _is_gitignored(self, resolved: Path) -> tuple[bool, str]:
        """Verifica si un archivo está ignorado por git, distinguiendo repositorios válidos y fallando cerrado."""
        if not self.repo_root:
            return False, ""
        dot_git = self.repo_root / '.git'
        if not dot_git.exists():
            return False, ""  # No es un repo git: no hay .gitignore que evaluar
        try:
            res = subprocess.run(
                ['git', '-C', str(self.repo_root), 'check-ignore', '-q', str(resolved)],
                capture_output=True,
                timeout=2
            )
            if res.returncode == 0:
                return True, "Archivo ignorado por .gitignore."
            if res.returncode == 1:
                return False, ""
            return True, f"Acceso restringido: verificación git falló (código {res.returncode})."
        except Exception as exc:
            return True, f"Acceso restringido: error al ejecutar git check-ignore ({exc})."

    def _inspect_file_reference(self, ref: str) -> dict[str, Any]:
        """Clasifica una referencia a archivo sin filtrar en silencio y protegiendo fronteras."""
        # Detectar URLs externas o identificadores de modelo/lógicos explícitos
        if ref.startswith(('http://', 'https://')):
            return {'reference': ref, 'status': 'no_es_ruta', 'message': 'URL externa.'}

        # Desglosar posible fragmento de línea `:123`
        fragment_line = None
        path_str = ref
        m = re.match(r'^(.*):(\d+)$', ref)
        if m:
            path_str = m.group(1)
            fragment_line = int(m.group(2))

        candidate = Path(path_str)

        # Si no parece ruta y no existe en disco, clasificar como no_es_ruta
        if not self.repo_root:
            return {'reference': ref, 'status': 'sin_repo_root', 'message': 'No se configuró repo_root.'}

        if candidate.is_absolute():
            resolved = candidate.resolve()
        else:
            resolved = (self.repo_root / candidate).resolve()

        # Si no existe en disco ni como ruta relativa ni absoluta, verificar si parece ruta
        if not resolved.exists():
            # Si contiene / o tiene extension comun, es una ruta inexistente
            if '/' in path_str or candidate.suffix in TEXT_EXTENSIONS or '.' in candidate.name:
                # Comprobar seguridad de frontera aun si no existe
                if not resolved.is_relative_to(self.repo_root):
                    return {'reference': ref, 'path': str(candidate), 'status': 'fuera_del_repo', 'message': 'La ruta escapa del repositorio.'}
                return {'reference': ref, 'path': str(candidate), 'status': 'no_existe', 'message': 'El archivo o directorio no existe.'}
            return {'reference': ref, 'status': 'no_es_ruta', 'message': 'Referencia lógica o de modelo.'}

        # Comprobar si escapa del repositorio (symlink hacia afuera o ruta absoluta externa)
        if not resolved.is_relative_to(self.repo_root):
            return {'reference': ref, 'path': str(candidate), 'status': 'fuera_del_repo', 'message': 'La ruta o enlace simbólico escapa del repositorio.'}

        # Comprobar archivos protegidos (.git o gitignored)
        rel_path = resolved.relative_to(self.repo_root)
        rel_parts = rel_path.parts
        if '.git' in rel_parts:
            return {'reference': ref, 'path': str(rel_path), 'status': 'protegido', 'message': 'Ruta interna de control de versiones .git.'}

        # Comprobar git check-ignore con política segura
        is_ignored, ignore_msg = self._is_gitignored(resolved)
        if is_ignored:
            return {'reference': ref, 'path': str(rel_path), 'status': 'protegido', 'message': ignore_msg}

        if resolved.is_dir():
            return {'reference': ref, 'path': str(rel_path), 'status': 'directorio', 'message': 'Es un directorio, no un archivo de código.'}

        try:
            stat = resolved.stat()
            if stat.st_size > MAX_CODE_BYTES:
                return {'reference': ref, 'path': str(rel_path), 'size': stat.st_size, 'status': 'demasiado_grande', 'message': f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.'}

            content_bytes = resolved.read_bytes()
            if b'\x00' in content_bytes:
                return {'reference': ref, 'path': str(rel_path), 'status': 'binario', 'message': 'Archivo binario no visualizable como texto.'}

            # Detección de encoding limpio
            has_replacement = False
            try:
                text = content_bytes.decode('utf-8')
            except UnicodeDecodeError:
                text = content_bytes.decode('utf-8', errors='replace')
                has_replacement = True

            lines = text.splitlines()
            suffix = resolved.suffix.lower()
            language = TEXT_EXTENSIONS.get(suffix, 'text')

            res_dict = {
                'reference': ref,
                'path': str(rel_path),
                'status': 'ok',
                'language': language,
                'content': text,
                'line_count': len(lines),
                'size': stat.st_size,
                'encoding': 'utf-8' if not has_replacement else 'utf-8-replaced'
            }
            if fragment_line is not None:
                res_dict['fragment_line'] = fragment_line
                # Extraer fragmento alrededor de la línea solicitada (+/- 5 líneas)
                start_l = max(1, fragment_line - 5)
                end_l = min(len(lines), fragment_line + 5)
                res_dict['fragment_content'] = '\n'.join(lines[start_l - 1:end_l])
                res_dict['fragment_span'] = [start_l, end_l]

            return res_dict
        except Exception as exc:
            return {'reference': ref, 'status': 'error_lectura', 'message': str(exc)}

    # ------------------------------------------------------------------
    # WS13.1: lector de fuente (GET /api/workspace/source). Solo lectura.
    # ------------------------------------------------------------------

    def _guard_path(self, path_str: str, markdown_only: bool = True, ignored: tuple[set[str], str | None] | None = None) -> tuple[Path, str]:
        """Guardias generales de lectura de archivo (navegacion §3.3), mismos estados que
        _inspect_file_reference. Devuelve (ruta resuelta, ruta relativa con /) o lanza
        WorkspaceError con `estado`. No abre el archivo. `markdown_only` es el criterio de
        /source y de los destinos de enlace; no se aplica a la identidad de /node ni /nodes."""
        def fail(estado: str, message: str):
            raise WorkspaceError(message, SOURCE_STATE_HTTP[estado], estado)

        if not self.repo_root:
            fail('sin_repo_root', 'No se configuró repo_root.')
        if not path_str or '\x00' in path_str:
            raise WorkspaceError('Ruta inválida.', 400, 'ruta_invalida')
        candidate = Path(path_str)
        resolved = candidate.resolve() if candidate.is_absolute() else (self.repo_root / candidate).resolve()
        if not resolved.is_relative_to(self.repo_root):
            fail('fuera_del_repo', 'La ruta o enlace simbólico escapa del repositorio.')
        rel = resolved.relative_to(self.repo_root)
        rel_str = rel.as_posix()
        if '.git' in rel.parts:
            fail('protegido', 'Ruta interna de control de versiones .git.')
        if not resolved.exists():
            fail('no_existe', 'El archivo no existe.')
        if ignored is None:
            is_ignored, ignore_msg = self._is_gitignored(resolved)
        else:
            # Resultado de la unica invocacion de check-ignore del listado (fallo cerrado).
            ignored_set, ignore_error = ignored
            is_ignored = ignore_error is not None or rel_str in ignored_set
            ignore_msg = f'Acceso restringido: {ignore_error}' if ignore_error else 'Archivo ignorado por .gitignore.'
        if is_ignored:
            fail('protegido', ignore_msg)
        if resolved.is_dir():
            fail('directorio', 'Es un directorio, no un documento.')
        if markdown_only and resolved.suffix.lower() != '.md':
            fail('no_markdown', 'Solo se abren documentos Markdown (.md).')
        return resolved, rel_str

    def _guard_markdown_file(self, path_str: str) -> tuple[Path, str]:
        return self._guard_path(path_str, True)

    def _read_authorized(self, path_str: str, markdown_only: bool = True) -> tuple[Path, str, bytes]:
        """Guardias de ruta y solo después la lectura única de los bytes."""
        resolved, rel = self._guard_path(path_str, markdown_only)
        data, _ = self._read_markdown_bytes(resolved)
        return resolved, rel, data

    def _read_markdown_bytes(self, resolved: Path) -> tuple[bytes, int]:
        """Lee los bytes una sola vez, con tope y rechazo de binarios."""
        try:
            size = resolved.stat().st_size
            if size > MAX_CODE_BYTES:
                raise WorkspaceError(f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.', 413, 'demasiado_grande')
            data = resolved.read_bytes()
        except WorkspaceError:
            raise
        except OSError as exc:
            raise WorkspaceError(f'Fallo de lectura: {exc}', 500, 'error_lectura')
        if len(data) > MAX_CODE_BYTES:
            raise WorkspaceError(f'Excede el límite de {MAX_CODE_BYTES // 1024} KB.', 413, 'demasiado_grande')
        if b'\x00' in data:
            raise WorkspaceError('Archivo binario no visualizable como texto.', 415, 'binario')
        return data, len(data)

    def _tracked_status(self, rel_or_ref: str):
        """doc_status del store para 'local:'+ref. None si la consulta falla (no rastreado)."""
        from sldb.api.stores.doc_status import doc_status
        try:
            return doc_status(self.store_path, 'local:' + rel_or_ref)
        except Exception:
            return None

    def workspace_source(self, ident: str, path_param: str) -> dict[str, Any]:
        """Render y fuente cruda del mismo origen para un Markdown modelado o no modelado.

        Orden: identidad desde índices, guardias de ruta, y solo entonces la lectura única de
        los bytes del documento autorizado. No se abre ningún otro documento indexado."""
        if not self.store_path or not self.store_path.exists():
            raise WorkspaceError('El store no está disponible.', 503)
        if not self.repo_root:
            raise WorkspaceError('No se configuró repo_root.', 503, 'sin_repo_root')

        requested: dict[str, str] = {}
        doc: ResolvedNodeDoc | None = None
        model_name = name = None

        if ident:
            if '..' in ident or ident.startswith(('/', '\\')):
                raise WorkspaceError('Identificador inválido o con intento de escape.', 400)
            if not self.editor_store:
                raise WorkspaceError('El store no está disponible.', 503)
            requested['id'] = ident
            doc = self._resolve_document(ident, markdown_only=True)
            if doc.data is None or not doc.path:
                raise WorkspaceError('El documento no tiene archivo en disco.', 404, 'no_existe')
            model_name, name = doc.model_name, doc.name
            rel_str, data = doc.path, doc.data
        else:
            requested['path'] = path_param
            resolved, rel_str = self._guard_markdown_file(path_param)
            status = self._tracked_status(rel_str)
            if status is not None and status.status == 'ambiguous':
                raise WorkspaceError(f'La ruta {rel_str} es ambigua en el store; use Model:name.', 409, 'ambiguous')
            data, _ = self._read_markdown_bytes(resolved)
            if status is not None and status.status == 'ok':
                model_name, name = status.model, status.name
                doc = self._materialize(model_name, name, rel_str, data)

        modeled = model_name is not None
        size = len(data)
        revision = hashlib.sha256(data).hexdigest()
        text, replaced = self._decode(data)

        ir = None
        ir_error = None
        fields: list[dict[str, Any]] = []
        sections: list[dict[str, Any]] = []
        extracted = doc is not None and doc.extract_error is None
        if extracted:
            try:
                ir = self._build_ir(doc)
            except Exception as exc:
                ir_error = str(exc)
        elif modeled:
            ir_error = f'Documento degradado: {doc.extract_error}'
        if ir is not None:
            sections = self._sections_from_ir(ir.get('structure') or [])
            for node in ir.get('nodes') or []:
                if node.get('kind') == 'field':
                    span = node.get('span') or {}
                    has_span = span.get('line_start') is not None or span.get('line_end') is not None
                    fields.append({
                        'field_path': node.get('field_path') or node.get('name'),
                        'value': node.get('value'),
                        'span': {'line_start': span.get('line_start'), 'line_end': span.get('line_end')} if has_span else None,
                    })
        else:
            sections = self._sections_from_text(text)

        canon_id = f'{model_name}:{name}' if modeled else None
        links = self._resolve_links(text, rel_str, canon_id, rel_str)
        context = self._source_context(canon_id, model_name, name, rel_str, revision)

        descriptor = None
        if extracted:
            descriptor = {'payload': doc.payload or {}, 'semantic_tags': doc.semantic_tags or []}
        return {
            'ok': True,
            'identity': {
                'kind': 'modeled' if modeled else 'unmodeled',
                'id': canon_id,
                'model_name': model_name,
                'name': name,
                'repo': 'local',
                'path': rel_str,
                'requested': requested,
            },
            'revision': revision,
            'size': size,
            'encoding': 'utf-8-replaced' if replaced else 'utf-8',
            'line_count': len(text.splitlines()),
            'text': text,
            'sections': sections,
            'fields': fields,
            'ir': ir,
            'ir_error': ir_error,
            'descriptor': descriptor,
            'degraded': bool(modeled and not extracted),
            'degraded_reason': doc.extract_error if (modeled and not extracted) else None,
            'links': links,
            'context': context,
        }

    @staticmethod
    def _sections_from_ir(structure: list[dict[str, Any]]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []

        def walk(items: list[dict[str, Any]]) -> None:
            for item in items:
                meta = item.get('metadata') or {}
                span = item.get('span') or {}
                out.append({
                    'title': item.get('title') or item.get('name') or '',
                    'slug': meta.get('slug') or '',
                    'level': meta.get('level'),
                    'path': item.get('name') or '',
                    'line_start': span.get('line_start'),
                    'line_end': span.get('line_end'),
                })
                walk(item.get('children') or [])
        walk(structure)
        return out

    @staticmethod
    def _sections_from_text(text: str) -> list[dict[str, Any]]:
        """Secciones de un Markdown no modelado con extract_sections de sldb, sobre la misma lectura."""
        from sldb.api.records.extract import extract_sections
        return [
            {'title': s.title, 'slug': s.slug, 'level': s.level, 'path': s.path,
             'line_start': s.line_start, 'line_end': s.line_end}
            for s in extract_sections(text)
        ]

    def _source_context(self, canon_id: str | None, model_name: str | None, name: str | None, rel: str, revision: str) -> dict[str, Any]:
        context: dict[str, Any] = {
            'id': canon_id, 'name': name, 'model_name': model_name, 'repo': 'local',
            'path': rel, 'revision': revision,
            'incoming_relations': None, 'outgoing_relations': None, 'relations_error': None,
            'relations_absent': None, 'relations_state': None,
        }
        if canon_id is None:
            context['relations_absent'] = 'Documento no modelado: no está en el store, sin relaciones.'
            return context
        idx, idx_error = self._load_index()
        state = self._relations_state(idx, idx_error)
        context['relations_state'] = state
        if not state['ok']:
            context['relations_error'] = state['error']
            return context
        try:
            edges = self._document_edges(idx)
            context['incoming_relations'] = [e for e in edges if e['target'] == canon_id]
            context['outgoing_relations'] = [e for e in edges if e['source'] == canon_id]
        except Exception as exc:
            context['relations_error'] = str(exc)
        return context

    def _resolve_links(self, text: str, doc_rel: str, own_id: str | None, own_path: str) -> list[dict[str, Any]]:
        """Resuelve los enlaces [[...]] del texto contra el desk propio.

        Orden: parse_links, split_anchor, clasificar prefijo. `local:` se retira una vez. Un
        destino con ancla se lee solo tras las guardias de su ruta (lectura autorizada) para
        comprobar la sección con extract_section; el propio documento usa el texto ya leído.
        """
        from sldb.links import parse_links
        from sldb.links.sections import split_anchor

        lines = text.splitlines()
        results: list[dict[str, Any]] = []
        seen: set[str] = set()
        for pl in parse_links(text):
            if pl.raw in seen:
                continue
            seen.add(pl.raw)
            line = next((i + 1 for i, l in enumerate(lines) if pl.raw in l), None)
            entry = {
                'raw': pl.raw, 'target': pl.target, 'kind': pl.kind, 'predicate': pl.predicate,
                'line': line, 'anchor': None, 'status': 'roto', 'cause': '', 'open': None,
                'origin': {'doc': own_id or own_path, 'path': doc_rel, 'line': line},
            }
            base, anchor = split_anchor(pl.target)
            entry['anchor'] = anchor
            self._classify_link(entry, base, doc_rel, own_id, own_path, text)
            results.append(entry)
        return results

    def _check_anchor(self, entry: dict[str, Any], markdown: str | None, where: str) -> bool:
        """Falso (y marca la referencia rota) si la sección no existe en el destino."""
        from sldb.links.sections import extract_section

        anchor = entry.get('anchor')
        if anchor is None:
            return True
        if markdown is not None and extract_section(markdown, anchor) is not None:
            return True
        entry.update(
            status='roto', estado=ANCLA_INEXISTENTE, open=None,
            cause=f'La sección «{anchor}» no existe en {where}.',
        )
        return False

    def _classify_link(self, entry: dict[str, Any], base: str, doc_rel: str, own_id: str | None, own_path: str, own_text: str = '') -> None:
        if base.startswith(_EXTERNAL_PREFIXES):
            entry.update(status='externo', cause='Enlace externo: se muestra, no se abre ni se lee.')
            return
        if base.startswith('local:'):
            base = base[len('local:'):]
        if base == '':
            # ancla del propio documento: se comprueba sobre el texto ya leído
            if not self._check_anchor(entry, own_text, 'el propio documento'):
                return
            entry['status'] = 'ok'
            entry['open'] = {'id': own_id} if own_id else {'path': own_path}
            return
        tracked = self._tracked_status(base)
        if tracked is not None and tracked.status == 'ambiguous':
            entry.update(status='roto', cause='Destino ambiguo en el store; use Model/name.', estado='ambiguous')
            return
        if tracked is not None and tracked.status == 'ok':
            tpath = tracked.path or ''
            try:
                _, _, tdata = self._read_destination(tpath, entry)
            except WorkspaceError as exc:
                entry.update(status='roto', cause=str(exc), estado=exc.estado)
                return
            if not self._check_anchor(entry, tdata, tpath):
                return
            entry['status'] = 'ok'
            entry['open'] = {'id': f'{tracked.model}:{tracked.name}'}
            entry['path'] = tpath
            return
        # No modelado: relativo al directorio del documento y luego al root del repo.
        doc_dir = Path(doc_rel).parent.as_posix()
        candidates = []
        if doc_dir not in ('', '.'):
            candidates.append(f'{doc_dir}/{base}')
        candidates.append(base)
        last_exc: WorkspaceError | None = None
        for cand in candidates:
            try:
                _, rel, tdata = self._read_destination(cand, entry)
            except WorkspaceError as exc:
                if exc.estado == 'no_existe':
                    last_exc = last_exc or exc
                    continue
                entry.update(status='no_markdown' if exc.estado == 'no_markdown' else 'roto', cause=str(exc), estado=exc.estado, path=cand)
                return
            if not self._check_anchor(entry, tdata, rel):
                entry['path'] = rel
                return
            again = self._tracked_status(rel)
            if again is not None and again.status == 'ok':
                entry['open'] = {'id': f'{again.model}:{again.name}'}
            else:
                entry['open'] = {'path': rel}
            entry['status'] = 'ok'
            entry['path'] = rel
            return
        entry.update(status='roto', cause='El destino no existe en el desk.', estado='no_existe')

    def _read_destination(self, path_str: str, entry: dict[str, Any]) -> tuple[Path, str, str | None]:
        """Guardias del destino y, solo si el enlace lleva ancla, su lectura autorizada.

        Sin ancla no se abre el destino (devuelve texto None). Con ancla, el texto decodificado
        de la lectura protegida."""
        resolved, rel = self._guard_markdown_file(path_str)
        if entry.get('anchor') is None:
            return resolved, rel, None
        data, _ = self._read_markdown_bytes(resolved)
        text, _ = self._decode(data)
        return resolved, rel, text

    def _check_problems_for_node(self, canon_id: str, idx: Any = None, idx_error: str | None = None) -> dict[str, Any]:
        """Comprueba problemas reportados por el índice de aristas de SLDB para este nodo."""
        if not self.store_path or not self.store_path.exists():
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': 'Store no disponible'}
        if idx is None:
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': idx_error or 'Índice de aristas no disponible'}
        try:
            raw_problems = list(getattr(idx, 'problems', []) or [])
            node_name = canon_id.split(':', 1)[1] if ':' in canon_id else canon_id

            matched_problems = []
            for prob in raw_problems:
                if not isinstance(prob, str):
                    continue
                # El formato de sldb para aristas rechazadas es:
                # relation '<rel>': <source|target> '<Model:name>' is not a tracked document
                if (
                    f"'{canon_id}'" in prob
                    or f"'{node_name}'" in prob
                    or prob.startswith(f"relation '{node_name}':")
                    or prob.startswith(f"relation '{canon_id}':")
                ):
                    matched_problems.append(prob)

            return {
                'ok': len(matched_problems) == 0,
                'problems': matched_problems,
                'store_problems_count': len(raw_problems),
                'error': None
            }
        except Exception as exc:
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': str(exc)}


def configured_workspace_routes(store_path: Path | str | None, editor_store: Any = None) -> WorkspaceRoutes:
    if not store_path:
        return WorkspaceRoutes(None, None, editor_store)
    store = Path(store_path).resolve()
    repo_root = store.parent
    return WorkspaceRoutes(store, repo_root, editor_store)
