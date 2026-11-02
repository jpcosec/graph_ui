"""Multi-projection workspace routes: document IR, neighborhood graph, and referenced code.

Strictly read-only. Adheres to SLDB contracts, safe repo-bounded file inspection,
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


class WorkspaceRoutes:
    def __init__(self, store_path: Path | str | None, repo_root: Path | str | None = None, editor_store: Any = None):
        self.store_path = Path(store_path).resolve() if store_path else None
        self.repo_root = Path(repo_root).resolve() if repo_root else (self.store_path.parent if self.store_path else None)
        self.editor_store = editor_store

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

    def workspace_nodes(self) -> dict[str, Any]:
        """Index of all documents in the store with canonical id Model:name."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)
        try:
            docs = self.editor_store.documents()
        except Exception as exc:
            raise WorkspaceError(f'Error al cargar documentos del store: {exc}', 500)

        nodes = []
        for d in docs:
            payload = getattr(d, 'payload', {}) or {}
            title = payload.get('title') or payload.get('name') or getattr(d, 'name', '')
            status = payload.get('status', '')
            model_name = getattr(d, 'model_name', '')
            name = getattr(d, 'name', '')
            canon_id = f"{model_name}:{name}"
            nodes.append({
                'id': canon_id,
                'name': name,
                'model_name': model_name,
                'title': title,
                'status': status,
                'path': str(getattr(d, 'path', ''))
            })
        return {'ok': True, 'nodes': nodes}

    def workspace_node(self, ident: str, depth: int = 1) -> dict[str, Any]:
        """Multi-projection data for a selected node."""
        if not self.store_path or not self.store_path.exists() or not self.editor_store:
            raise WorkspaceError('El store no está disponible.', 503)

        if not ident or '..' in ident or ident.startswith(('/', '\\')):
            raise WorkspaceError('Identificador inválido o con intento de escape.', 400)

        from sldb.api.documents.document_serialization import doc_version

        docs = []
        documents_error = None
        try:
            docs = self.editor_store.documents()
        except Exception as exc:
            docs = []
            documents_error = str(exc)

        doc = self._resolve_document(ident, docs)
        canon_id = f"{doc.model_name}:{doc.name}"
        payload = getattr(doc, 'payload', {}) or {}

        # 1. Proyección Document (IR estructurado) usando Model/name para evitar ambigüedades
        doc_proj = {'ok': True, 'ir': None, 'payload': payload, 'semantic_tags': getattr(doc, 'semantic_tags', []), 'error': None}
        try:
            # Pasar Model/name que sldb resuelve sin colisión de nombres
            canonical_ref = f"{doc.model_name}/{doc.name}"
            doc_ir = self.editor_store.document_ir(canonical_ref)
            doc_proj['ir'] = doc_ir.get('ir')
            if 'payload' in doc_ir:
                doc_proj['payload'] = doc_ir['payload']
            if 'semantic_tags' in doc_ir:
                doc_proj['semantic_tags'] = doc_ir['semantic_tags']
        except Exception as exc:
            doc_proj['ok'] = False
            doc_proj['error'] = str(exc)

        # 2. Proyección Graph (vecindad a 1-2 hops con una sola llamada a document_edges)
        graph_proj = self._build_graph_neighborhood(canon_id, docs, depth)

        # 3. Proyección Code (archivos y fragmentos referenciados de forma segura)
        code_proj = self._build_code_projection(payload, doc)

        # 4. Contexto lateral
        content_hash = None
        content_hash_error = None
        try:
            content_hash = doc_version(doc)
        except Exception as exc:
            content_hash_error = str(exc)

        file_path = None
        doc_path_raw = getattr(doc, 'path', None)
        if self.repo_root and doc_path_raw:
            try:
                candidate = (self.repo_root / str(doc_path_raw).lstrip('/')).resolve()
                if candidate.is_relative_to(self.repo_root) and candidate.is_file():
                    is_ign, _ = self._is_gitignored(candidate)
                    if not any(p == '.git' for p in candidate.parts) and not is_ign:
                        file_path = candidate
            except (ValueError, OSError):
                file_path = None

        file_revision = ''
        file_revision_error = None
        if file_path and file_path.is_file():
            try:
                file_revision = hashlib.sha256(file_path.read_bytes()).hexdigest()
            except OSError as exc:
                file_revision_error = str(exc)

        incoming = [e for e in graph_proj.get('edges', []) if e['target'] == canon_id]
        outgoing = [e for e in graph_proj.get('edges', []) if e['source'] == canon_id]

        problems_report = self._check_problems_for_node(canon_id)

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
            'file_revision_error': file_revision_error,
            'documents_error': documents_error,
            'is_degraded': getattr(doc, 'is_degraded', False),
            'degraded_reason': getattr(doc, 'degraded_reason', None),
            'summary': payload.get('summary') or payload.get('rationale') or payload.get('goal') or '',
            'incoming_relations': incoming,
            'outgoing_relations': outgoing,
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
            'documents_error': documents_error,
            'projections': {
                'document': doc_proj,
                'graph': graph_proj,
                'code': code_proj,
            },
            'context': context
        }

    def _resolve_document(self, ident: str, docs: list[Any]) -> Any:
        if docs:
            if ':' in ident:
                model_name, name = ident.split(':', 1)
                match = next((d for d in docs if getattr(d, 'model_name') == model_name and getattr(d, 'name') == name), None)
                if match is not None:
                    return match
            elif '/' in ident:
                model_name, name = ident.split('/', 1)
                match = next((d for d in docs if getattr(d, 'model_name') == model_name and getattr(d, 'name') == name), None)
                if match is not None:
                    return match
            else:
                matches = [d for d in docs if getattr(d, 'name') == ident]
                if len(matches) > 1:
                    models = [getattr(d, 'model_name') for d in matches]
                    raise WorkspaceError(f'Identidad ambigua: {ident} existe en múltiples modelos ({", ".join(models)}). Use Model:name.', 400)
                if matches:
                    return matches[0]

        # Si docs está vacío o no lo encontró en caché, intentar resolución directa vía runtime_document
        from sldb.api.records.resolve import resolve_runtime_doc
        clean_ref = ident.replace(':', '/')
        pythonpath = getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None
        try:
            rdoc = resolve_runtime_doc(str(self.store_path), clean_ref, pythonpath)
            return ResolvedNodeDoc(
                model_name=rdoc['model'],
                name=rdoc['name'],
                path=rdoc.get('path', ''),
                payload=rdoc.get('payload', {}),
                semantic_tags=rdoc.get('semantic_tags', [])
            )
        except Exception as exc:
            # Fallback seguro usando la API pública de load_edge_index (sin tocar YAMLs internos)
            try:
                from sldb.api.edges.edge_reading import load_edge_index
                idx = load_edge_index(self.store_path, include_linked=False)
                # En idx.nodes las claves son: sldb://document/Model:name
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
                        found_canon = candidates[0].replace('sldb://document/', '')
                        resolved_target = found_canon.split(':', 1)

                if resolved_target:
                    found_model, found_name = resolved_target
                    discovered_path = ''
                    extracted_payload = {}
                    is_degraded = True
                    degraded_reason = f'Fallo al validar documento en disco ({exc})'

                    # Intentar rescatar frontmatter y código de archivos sanos en disco
                    if self.repo_root:
                        for cand in [
                            self.repo_root / f"desk/tasks/{found_name}.md",
                            self.repo_root / f"desk/contexts/{found_name}.md",
                            self.repo_root / f"desk/rituals/{found_name}.md",
                            self.repo_root / f"desk/roles/{found_name}.md",
                            self.repo_root / f"desk/runs/{found_name}.md",
                            self.repo_root / f"desk/relations/{found_name}.yaml",
                            self.repo_root / f"desk/relations/{found_name}.md",
                        ]:
                            if cand.is_file():
                                discovered_path = str(cand.relative_to(self.repo_root))
                                try:
                                    t = cand.read_text(encoding='utf-8')
                                    if t.startswith('---'):
                                        parts = t.split('---', 2)
                                        if len(parts) >= 3:
                                            import yaml
                                            extracted_payload = yaml.safe_load(parts[1]) or {}
                                            # Si tiene frontmatter válido con id coincidente, el documento físico es sano
                                            if extracted_payload.get('id') == found_name:
                                                is_degraded = False
                                                degraded_reason = None
                                except Exception:
                                    pass
                                break

                    return ResolvedNodeDoc(
                        model_name=found_model,
                        name=found_name,
                        path=discovered_path,
                        payload=extracted_payload,
                        is_degraded=is_degraded,
                        degraded_reason=degraded_reason
                    )
            except WorkspaceError:
                raise
            except Exception:
                pass
            raise WorkspaceError(f'Documento no encontrado: {ident}', 404)

    def _document_edges(self) -> list[dict[str, Any]]:
        """Aristas documento-a-documento del índice, sin reconstruir (load_edge_index).

        La deduplicación por (source, target, type, relation_doc) no descarta procedencias:
        cada arista conserva en `provenance` la metadata de todos los registros del índice
        que la originan (origin, field, declared, source_field, ref_path, ref_index...).
        """
        from sldb.api.edges.edge_reading import load_edge_index

        prefix = 'sldb://document/'
        idx = load_edge_index(self.store_path, include_linked=False)
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
            if prov not in edge['provenance']:
                edge['provenance'].append(prov)
        return list(merged.values())

    def _build_graph_neighborhood(self, root_id: str, docs: list[Any], depth: int) -> dict[str, Any]:
        try:
            # /api/workspace/node conserva su lectura previa (document_edges reconstruye el
            # índice); la procedencia se añade desde load_edge_index sin tocar esa llamada.
            from sldb.api.edges.document_edges import document_edges

            pythonpath = getattr(self.editor_store, 'pythonpath', None) if self.editor_store else None
            raw_edges = document_edges(self.store_path, pythonpath=pythonpath)
            provenance_by_key: dict[tuple, list[Any]] = {}
            try:
                for pe in self._document_edges():
                    provenance_by_key[(pe['source'], pe['target'], pe['type'], pe['relationDoc'])] = pe['provenance']
            except Exception:
                provenance_by_key = {}
            edges = [
                {
                    'source': e.source, 'target': e.target, 'type': e.type, 'origin': e.origin,
                    'relationDoc': e.relation_doc,
                    'provenance': provenance_by_key.get((e.source, e.target, e.type, e.relation_doc), []),
                }
                for e in raw_edges
            ]
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

            doc_map = {f"{getattr(d, 'model_name')}:{getattr(d, 'name')}": d for d in docs}
            nodes = []
            for nid, hop in visited_nodes.items():
                d = doc_map.get(nid)
                m_name, n_name = nid.split(':', 1) if ':' in nid else ('', nid)
                title = ''
                status = ''
                if d:
                    p = getattr(d, 'payload', {}) or {}
                    title = p.get('title') or p.get('name') or n_name
                    status = p.get('status', '')
                nodes.append({
                    'id': nid,
                    'name': n_name,
                    'model_name': m_name,
                    'title': title,
                    'status': status,
                    'depth': hop
                })

            return {
                'ok': True,
                'depth': depth,
                'nodes': nodes,
                'edges': neighborhood_edges,
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

    def _guard_markdown_file(self, path_str: str) -> tuple[Path, str]:
        """Guardias generales de lectura de archivo (navegacion §3.3), mismos estados que
        _inspect_file_reference. Devuelve (ruta resuelta, ruta relativa con /) o lanza
        WorkspaceError con `estado`."""
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
        is_ignored, ignore_msg = self._is_gitignored(resolved)
        if is_ignored:
            fail('protegido', ignore_msg)
        if resolved.is_dir():
            fail('directorio', 'Es un directorio, no un documento.')
        if resolved.suffix.lower() != '.md':
            fail('no_markdown', 'Solo se abren documentos Markdown (.md).')
        return resolved, rel_str

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
        """Render y fuente cruda del mismo origen para un Markdown modelado o no modelado."""
        if not self.store_path or not self.store_path.exists():
            raise WorkspaceError('El store no está disponible.', 503)
        if not self.repo_root:
            raise WorkspaceError('No se configuró repo_root.', 503, 'sin_repo_root')

        requested: dict[str, str] = {}
        model_name = name = None
        rel_hint = ''
        degraded_doc = None

        if ident:
            if '..' in ident or ident.startswith(('/', '\\')):
                raise WorkspaceError('Identificador inválido o con intento de escape.', 400)
            if not self.editor_store:
                raise WorkspaceError('El store no está disponible.', 503)
            requested['id'] = ident
            try:
                docs = self.editor_store.documents()
            except Exception:
                docs = []
            doc = self._resolve_document(ident, docs)
            model_name, name = doc.model_name, doc.name
            rel_hint = str(getattr(doc, 'path', '') or '')
            if getattr(doc, 'is_degraded', False):
                degraded_doc = doc
        else:
            requested['path'] = path_param
            _, rel_hint = self._guard_markdown_file(path_param)
            status = self._tracked_status(rel_hint)
            if status is not None and status.status == 'ambiguous':
                raise WorkspaceError(f'La ruta {rel_hint} es ambigua en el store; use Model:name.', 409, 'ambiguous')
            if status is not None and status.status == 'ok':
                model_name, name = status.model, status.name

        modeled = model_name is not None
        runtime_doc = None
        runtime_error = None
        if modeled and degraded_doc is None:
            from sldb.api.records.resolve import resolve_runtime_doc
            try:
                runtime_doc = resolve_runtime_doc(str(self.store_path), f'{model_name}/{name}', getattr(self.editor_store, 'pythonpath', None))
            except Exception as exc:
                runtime_error = str(exc)
                degraded_doc = ResolvedNodeDoc(model_name, name, rel_hint, degraded_reason=runtime_error, is_degraded=True)
        if modeled and runtime_doc is not None:
            read_path = runtime_doc.get('absolute_path') or rel_hint
        else:
            read_path = rel_hint
        if not read_path:
            raise WorkspaceError('El documento no tiene archivo en disco.', 404, 'no_existe')
        resolved, rel_str = self._guard_markdown_file(str(read_path))
        data, size = self._read_markdown_bytes(resolved)
        revision = hashlib.sha256(data).hexdigest()
        replaced = False
        try:
            text = data.decode('utf-8')
        except UnicodeDecodeError:
            text = data.decode('utf-8', errors='replace')
            replaced = True

        ir = None
        ir_error = None
        fields: list[dict[str, Any]] = []
        sections: list[dict[str, Any]] = []
        if modeled and runtime_doc is not None:
            from sldb.api import build_document_ir_json
            try:
                ir = build_document_ir_json(runtime_doc, text, runtime_doc.get('template'))
            except Exception as exc:
                ir_error = str(exc)
        elif modeled:
            ir_error = f'Documento degradado: {runtime_error or getattr(degraded_doc, "degraded_reason", "")}'
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
        if runtime_doc is not None:
            descriptor = {
                'payload': runtime_doc.get('payload') or {},
                'semantic_tags': runtime_doc.get('semantic_tags') or [],
            }
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
            'degraded': bool(modeled and runtime_doc is None),
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
            'relations_absent': None,
        }
        if canon_id is None:
            context['relations_absent'] = 'Documento no modelado: no está en el store, sin relaciones.'
            return context
        try:
            edges = self._document_edges()
            context['incoming_relations'] = [e for e in edges if e['target'] == canon_id]
            context['outgoing_relations'] = [e for e in edges if e['source'] == canon_id]
        except Exception as exc:
            context['relations_error'] = str(exc)
        return context

    def _resolve_links(self, text: str, doc_rel: str, own_id: str | None, own_path: str) -> list[dict[str, Any]]:
        """Resuelve los enlaces [[...]] del texto contra el desk propio, sin leer el destino.

        Orden: parse_links, split_anchor, clasificar prefijo. `local:` se retira una vez.
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
            self._classify_link(entry, base, doc_rel, own_id, own_path)
            results.append(entry)
        return results

    def _classify_link(self, entry: dict[str, Any], base: str, doc_rel: str, own_id: str | None, own_path: str) -> None:
        if base.startswith(_EXTERNAL_PREFIXES):
            entry.update(status='externo', cause='Enlace externo: se muestra, no se abre ni se lee.')
            return
        if base.startswith('local:'):
            base = base[len('local:'):]
        if base == '':
            # ancla del propio documento
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
                self._guard_markdown_file(tpath)
            except WorkspaceError as exc:
                entry.update(status='roto', cause=str(exc), estado=exc.estado)
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
                _, rel = self._guard_markdown_file(cand)
            except WorkspaceError as exc:
                if exc.estado == 'no_existe':
                    last_exc = last_exc or exc
                    continue
                entry.update(status='no_markdown' if exc.estado == 'no_markdown' else 'roto', cause=str(exc), estado=exc.estado, path=cand)
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

    def _check_problems_for_node(self, canon_id: str) -> dict[str, Any]:
        """Comprueba problemas reportados por el índice de aristas de SLDB para este nodo."""
        if not self.store_path or not self.store_path.exists():
            return {'ok': False, 'problems': [], 'store_problems_count': 0, 'error': 'Store no disponible'}
        try:
            from sldb.api.edges.edge_reading import load_edge_index

            idx = load_edge_index(self.store_path, include_linked=False)
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
