#!/usr/bin/env python3
"""Parallel standalone server for the Knowledge Workspace (KIMUN / SLDB UI).

Runs independently and in parallel to `frontends/mindmap/serve.py` (default port 8090).
Strictly read-only over the real `.sldb` store, `deskops`, and git repository.
"""
from __future__ import annotations

import errno
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any
from urllib.parse import parse_qs, urlparse


BACKEND_MODE = os.environ.get('GRAPH_UI_BACKEND', 'local')
WORKSPACE_DIR = Path(__file__).resolve().parent

CATEGORY_BY_MODEL = {
    'TaskDoc': 'tasks',
    'BoardDoc': 'tasks',
    'SpecDoc': 'documents',
    'ExplanationDoc': 'documents',
    'ReadmeDoc': 'documents',
    'DeskSpecDoc': 'documents',
    'DeskStandardsDoc': 'documents',
    'CrossroadDoc': 'documents',
    'ProjectionDoc': 'documents',
    'NotationDoc': 'documents',
    'PillDoc': 'documents',
    'InboxNoteDoc': 'documents',
    'AtomDoc': 'atoms',
    'MaterializationContractDoc': 'atoms',
    'AnchorDoc': 'atoms',
    'PythonSymbolDoc': 'code',
    'SurfaceDoc': 'code',
    'CliCommandDoc': 'code',
    'RepositoryDoc': 'code',
    'SpecNodeDoc': 'graph',
    'RelationDoc': 'graph',
    'RelationTypeDoc': 'graph',
    'LinkDoc': 'graph',
    'MoveDoc': 'graph',
    'GlyphDoc': 'graph',
    'RunDoc': 'runs',
    'RitualDoc': 'runs',
    'RoleDoc': 'agents',
    'RuntimeProfileDoc': 'agents',
}

PROSE_FIELD_ORDER = [
    ('summary', 'Summary'),
    ('why', 'Rationale / Why'),
    ('goal', 'Goal'),
    ('scope', 'Scope'),
    ('implementation_path', 'Implementation Path'),
    ('validation', 'Validation'),
    ('done_when', 'Done When'),
    ('answer', 'Answer'),
    ('what', 'What'),
    ('when', 'When'),
    ('where', 'Where'),
    ('how', 'How'),
    ('how_not', 'How Not'),
    ('description', 'Description'),
    ('purpose', 'Purpose'),
    ('synopsis', 'Synopsis'),
    ('how_it_works', 'How It Works'),
    ('docstring', 'Docstring'),
    ('signature', 'Signature'),
    ('usage', 'Usage'),
    ('commands', 'Commands'),
]


def classify_model_category(model_name: str) -> str:
    return CATEGORY_BY_MODEL.get(model_name, 'documents')


def _strip_template_hint(text: str) -> str:
    """Removes leading italic template prompt lines such as `_Explain why..._`."""
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        s = line.strip()
        if s.startswith('_') and s.endswith('_') and len(s) > 4 and '_' not in s[1:-1]:
            continue
        cleaned.append(line)
    return '\n'.join(cleaned).strip()


class WorkspaceService:
    """Enriches WorkspaceRoutes with section prose extraction, store overview, and Merkle/git impact."""

    def __init__(self, store_path: Path | str | None, workspace_routes: Any = None, desk_routes: Any = None):
        self.store_path = Path(store_path).resolve() if store_path else None
        self.repo_root = self.store_path.parent if self.store_path else None
        self.workspace_routes = workspace_routes
        self.desk_routes = desk_routes

    def catalog(self) -> dict[str, Any]:
        base = self.workspace_routes.workspace_nodes()
        nodes = base.get('nodes', [])
        counts = {
            'all': len(nodes),
            'tasks': 0,
            'documents': 0,
            'atoms': 0,
            'code': 0,
            'graph': 0,
            'runs': 0,
            'agents': 0,
        }
        model_counts: dict[str, int] = {}
        for node in nodes:
            m = node.get('model_name', '')
            cat = classify_model_category(m)
            node['category'] = cat
            counts[cat] = counts.get(cat, 0) + 1
            model_counts[m] = model_counts.get(m, 0) + 1

        return {
            'ok': True,
            'nodes': nodes,
            'category_counts': counts,
            'model_counts': model_counts,
        }

    def node_detail(self, ident: str, depth: int = 1) -> dict[str, Any]:
        data = self.workspace_routes.workspace_node(ident, depth)
        node_info = data.get('node', {})
        doc_proj = data.get('projections', {}).get('document', {})
        code_proj = data.get('projections', {}).get('code', {})
        graph_proj = data.get('projections', {}).get('graph', {})
        payload = doc_proj.get('payload') or {}

        # 1. Enrich Document projection with readable sections prose from disk or payload
        doc_proj['sections_prose'] = self._extract_sections_prose(
            node_info.get('path', ''),
            doc_proj.get('ir'),
            payload,
        )

        # 2. Enrich Code projection with additional structural file references (spec_path, target_identity, source_path, node path)
        extra_refs = []
        for field in ('spec_path', 'target_identity', 'source_path'):
            val = payload.get(field)
            if isinstance(val, str) and val.strip():
                span = payload.get('source_span')
                if field == 'source_path' and isinstance(span, str) and ':' in span:
                    first_line = span.split(':', 1)[0].strip()
                    if first_line.isdigit():
                        extra_refs.append(f"{val.strip()}:{first_line}")
                extra_refs.append(val.strip())

        node_path = node_info.get('path', '')
        if isinstance(node_path, str) and node_path.strip():
            extra_refs.append(node_path.strip())

        if code_proj.get('ok') and isinstance(code_proj.get('files'), list):
            existing_refs = {f.get('reference') for f in code_proj['files']}
            for ref in extra_refs:
                if ref not in existing_refs:
                    inspected = self.workspace_routes._inspect_file_reference(ref)
                    inspected['is_implicit_source'] = (ref == node_path)
                    code_proj['files'].append(inspected)
                    existing_refs.add(ref)
            code_proj['total'] = len(code_proj['files'])

        # 3. Build Changes (Merkle / staleness / 1-2 hop impact) projection
        data['projections']['changes'] = self._build_changes_projection(
            node_info,
            data.get('context', {}),
            graph_proj,
            code_proj,
        )
        return data

    def _extract_sections_prose(self, rel_path: str, ir: dict[str, Any] | None, payload: dict[str, Any]) -> list[dict[str, Any]]:
        file_lines: list[str] = []
        if self.repo_root and rel_path:
            try:
                candidate = (self.repo_root / rel_path.lstrip('/')).resolve()
                if candidate.is_relative_to(self.repo_root) and candidate.is_file():
                    is_ign, _ = self.workspace_routes._is_gitignored(candidate)
                    if not is_ign and '.git' not in candidate.parts:
                        file_lines = candidate.read_text(encoding='utf-8', errors='replace').splitlines()
            except Exception:
                file_lines = []

        sections: list[dict[str, Any]] = []
        structure = (ir or {}).get('structure') if isinstance(ir, dict) else None
        if isinstance(structure, list) and structure and file_lines:
            def visit(nodes_list: list[dict[str, Any]], depth_level: int = 1) -> None:
                for sec in nodes_list:
                    span = sec.get('span') or {}
                    start = span.get('line_start')
                    end = span.get('line_end')
                    children = sec.get('children') or []
                    prose = ''
                    if isinstance(start, int) and isinstance(end, int) and 1 <= start <= len(file_lines):
                        # If section has children, take lines up to first child's line_start - 1
                        first_child_start = None
                        for ch in children:
                            ch_start = (ch.get('span') or {}).get('line_start')
                            if isinstance(ch_start, int):
                                first_child_start = ch_start if first_child_start is None else min(first_child_start, ch_start)
                        slice_end = (first_child_start - 1) if (first_child_start and first_child_start > start) else end
                        # Skip heading line itself (start is 1-based index of heading line)
                        raw_slice = '\n'.join(file_lines[start:min(slice_end, len(file_lines))]).strip()
                        prose = _strip_template_hint(raw_slice)
                    if prose or not children:
                        sections.append({
                            'title': sec.get('title') or sec.get('name') or 'Section',
                            'level': (sec.get('metadata') or {}).get('level', depth_level),
                            'span': [start, end] if (start and end) else None,
                            'body': prose,
                        })
                    if children:
                        visit(children, depth_level + 1)

            visit(structure, 1)

        # Fallback or supplement from structured payload fields if sections have no body
        non_empty_sections = [s for s in sections if s.get('body')]
        if not non_empty_sections and isinstance(payload, dict):
            for key, label in PROSE_FIELD_ORDER:
                val = payload.get(key)
                if val is None or val == '' or val == [] or val == 'Not documented.' or val == 'Not applicable.':
                    continue
                if isinstance(val, list):
                    body_str = '\n'.join(f"- {item}" for item in val)
                elif isinstance(val, dict):
                    body_str = json.dumps(val, indent=2, ensure_ascii=False)
                else:
                    body_str = str(val).strip()
                if body_str:
                    sections.append({
                        'title': label,
                        'level': 2,
                        'span': None,
                        'body': body_str,
                        'field': key,
                    })

        return sections

    def _git_status_map(self) -> dict[str, str]:
        if not self.repo_root or not (self.repo_root / '.git').exists():
            return {}
        try:
            proc = subprocess.run(
                ['git', '-C', str(self.repo_root), 'status', '--porcelain'],
                capture_output=True,
                text=True,
                timeout=3,
            )
            if proc.returncode != 0:
                return {}
            result: dict[str, str] = {}
            for line in proc.stdout.splitlines():
                if len(line) < 4:
                    continue
                status_code = line[:2].strip() or 'M'
                path_part = line[3:].strip()
                if ' -> ' in path_part:
                    path_part = path_part.split(' -> ', 1)[1].strip()
                result[path_part] = status_code
            return result
        except Exception:
            return {}

    def _build_changes_projection(
        self,
        node_info: dict[str, Any],
        context: dict[str, Any],
        graph_proj: dict[str, Any],
        code_proj: dict[str, Any],
    ) -> dict[str, Any]:
        git_map = self._git_status_map()
        node_path = node_info.get('path') or ''
        node_git_status = git_map.get(node_path, 'clean') if node_path else 'no_file'

        file_statuses = []
        for f in code_proj.get('files') or []:
            fpath = f.get('path') or f.get('reference') or ''
            g_stat = git_map.get(fpath, 'clean') if f.get('status') == 'ok' else f.get('status', 'unknown')
            file_statuses.append({
                'reference': f.get('reference', ''),
                'path': fpath,
                'status': f.get('status', ''),
                'git_status': g_stat,
            })

        root_id = node_info.get('id', '')
        edges = graph_proj.get('edges') or []
        nodes_by_id = {n['id']: n for n in (graph_proj.get('nodes') or [])}

        # Determine 1-hop and 2-hop impact items
        impact_items = []
        for nid, n_obj in nodes_by_id.items():
            if nid == root_id:
                continue
            hop = n_obj.get('depth', 1)
            connecting = [
                e for e in edges
                if (e['source'] == nid and e['target'] == root_id)
                or (e['target'] == nid and e['source'] == root_id)
                or (hop == 2 and (e['source'] == nid or e['target'] == nid))
            ]
            rel_types = sorted({e.get('type', 'related') for e in connecting})
            direction = 'incoming' if any(e['target'] == root_id and e['source'] == nid for e in edges) else (
                'outgoing' if any(e['source'] == root_id and e['target'] == nid for e in edges) else '2-hop'
            )
            impact_items.append({
                'id': nid,
                'name': n_obj.get('name', nid),
                'model_name': n_obj.get('model_name', ''),
                'title': n_obj.get('title') or n_obj.get('name') or nid,
                'status': n_obj.get('status') or 'tracked',
                'hop': hop,
                'direction': direction,
                'relation_types': rel_types,
            })

        impact_items.sort(key=lambda x: (x['hop'], x['direction'], x['id']))
        problems_report = context.get('problems_report') or {'ok': True, 'problems': [], 'store_problems_count': 0}

        return {
            'ok': True,
            'node_id': root_id,
            'content_hash': node_info.get('content_hash'),
            'file_revision': node_info.get('file_revision'),
            'is_degraded': bool(node_info.get('is_degraded')),
            'git_status': node_git_status,
            'files': file_statuses,
            'impact_nodes': impact_items,
            'problems_report': problems_report,
        }

    def overview(self) -> dict[str, Any]:
        cat_data = self.catalog()
        nodes = cat_data['nodes']
        path_to_node = {n['path']: n for n in nodes if n.get('path')}

        # Edge index stats & problems
        total_edges = 0
        problems: list[str] = []
        if self.store_path and self.store_path.exists():
            try:
                from sldb.api.edges.edge_reading import load_edge_index
                idx = load_edge_index(self.store_path, include_linked=False)
                total_edges = len(getattr(idx, 'edges', []) or [])
                problems = [str(p) for p in (getattr(idx, 'problems', []) or [])]
            except Exception as exc:
                problems = [f'Error leyendo edge index: {exc}']

        # Desk board
        board_data = {'tasks': [], 'errors': []}
        if self.desk_routes:
            try:
                b = self.desk_routes.board()
                board_data = {
                    'tasks': b.get('tasks', []),
                    'errors': b.get('errors', []),
                }
            except Exception as exc:
                board_data = {'tasks': [], 'errors': [{'reference': 'Board.md', 'error': str(exc)}]}

        # Live workers via deskops runtime workers
        workers_data = self._read_workers()

        # Subagent runs from runs/subagents/index.jsonl
        runs_list = self._read_subagent_runs()

        # Git working tree changes & recent commits
        git_map = self._git_status_map()
        modified_entries = []
        for rel_path, code in sorted(git_map.items()):
            matched_node = path_to_node.get(rel_path)
            modified_entries.append({
                'path': rel_path,
                'git_status': code,
                'node_id': matched_node['id'] if matched_node else None,
                'node_title': matched_node['title'] if matched_node else None,
                'model_name': matched_node['model_name'] if matched_node else None,
            })

        history_commits = self._read_git_history()

        return {
            'ok': True,
            'store': {
                'path': str(self.store_path) if self.store_path else '',
                'repo_name': self.repo_root.name if self.repo_root else 'workspace',
                'total_nodes': len(nodes),
                'total_edges': total_edges,
                'problems_count': len(problems),
                'problems': problems[:50],
                'category_counts': cat_data['category_counts'],
                'model_counts': cat_data['model_counts'],
                'head_short': history_commits[0]['short_hash'] if history_commits else '',
            },
            'board': board_data,
            'workers': workers_data,
            'runs': runs_list,
            'changes': {
                'modified_files': modified_entries,
                'modified_count': len(modified_entries),
                'problems_count': len(problems),
                'problems': problems[:50],
            },
            'history': history_commits,
        }

    def _read_workers(self) -> dict[str, Any]:
        binary = shutil.which('deskops')
        if not binary:
            return {'workers': [], 'error': 'deskops no está instalado.'}
        try:
            proc = subprocess.run(
                [binary, 'runtime', 'workers', '--format', 'json'],
                capture_output=True,
                timeout=8,
            )
            if proc.returncode != 0:
                detail = (proc.stdout or proc.stderr).decode(errors='replace').strip()
                return {'workers': [], 'error': detail or f'deskops exit {proc.returncode}'}
            payload = json.loads(proc.stdout)
            if not isinstance(payload, dict) or not isinstance(payload.get('workers'), list):
                return {'workers': [], 'error': 'deskops devolvió estructura inesperada.'}
            return payload
        except Exception as exc:
            return {'workers': [], 'error': str(exc)}

    def _read_subagent_runs(self) -> list[dict[str, Any]]:
        if not self.repo_root:
            return []
        idx_file = self.repo_root / 'runs' / 'subagents' / 'index.jsonl'
        if not idx_file.is_file():
            return []
        entries = []
        try:
            lines = idx_file.read_text(encoding='utf-8', errors='replace').splitlines()
            for idx, line in enumerate(reversed(lines[-40:])):
                line = line.strip()
                if not line:
                    continue
                try:
                    item = json.loads(line)
                    if isinstance(item, dict):
                        entries.append({
                            'index': idx,
                            'task_id': item.get('task_id') or '',
                            'run_id': item.get('run_id'),
                            'run_dir': item.get('run_dir'),
                            'commit': item.get('commit'),
                            'mode': item.get('mode') or ('subagent' if item.get('run_dir') else 'manual'),
                        })
                except json.JSONDecodeError:
                    continue
        except OSError:
            return []
        return entries

    def _read_git_history(self, limit: int = 25) -> list[dict[str, Any]]:
        if not self.repo_root or not (self.repo_root / '.git').exists():
            return []
        try:
            proc = subprocess.run(
                [
                    'git', '-C', str(self.repo_root),
                    'log', f'-n{limit}',
                    '--pretty=format:%H%x1f%h%x1f%an%x1f%ad%x1f%s',
                    '--date=short',
                ],
                capture_output=True,
                text=True,
                timeout=3,
            )
            if proc.returncode != 0:
                return []
            commits = []
            for line in proc.stdout.splitlines():
                parts = line.split('\x1f')
                if len(parts) == 5:
                    commits.append({
                        'hash': parts[0],
                        'short_hash': parts[1],
                        'author': parts[2],
                        'date': parts[3],
                        'subject': parts[4],
                    })
            return commits
        except Exception:
            return []


class WorkspaceHTTPHandler(SimpleHTTPRequestHandler):
    backend_mode = BACKEND_MODE
    workspace_routes = None
    workspace_service = None
    desk_routes = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WORKSPACE_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def json_response(self, data: Any, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        route = parsed.path
        query = parse_qs(parsed.query)

        if route.startswith('/api/'):
            if self.backend_mode == 'remote':
                return self.json_response(
                    {'ok': False, 'error': 'Knowledge Workspace paralelo requiere un store local (.sldb).'},
                    501,
                )
            from mindmap.workspace_routes import WorkspaceError
            try:
                if route == '/api/workspace/overview':
                    return self.json_response(self.workspace_service.overview())
                if route == '/api/workspace/nodes':
                    return self.json_response(self.workspace_service.catalog())
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
                    return self.json_response(self.workspace_service.node_detail(ident, depth))
                if route.startswith('/api/desk/'):
                    return self.desk_routes.dispatch(self, 'GET')
                if route == '/api/workers':
                    return self.json_response(self.workspace_service._read_workers())
                return self.json_response({'ok': False, 'error': f'Ruta desconocida: {route}'}, 404)
            except WorkspaceError as exc:
                return self.json_response({'ok': False, 'error': str(exc)}, exc.status)
            except Exception as exc:
                return self.json_response({'ok': False, 'error': str(exc)}, 500)

        static_path = Path(self.translate_path(route))
        if route != '/' and not static_path.exists() and '.' not in static_path.name:
            self.path = '/index.html'
        return super().do_GET()


def make_server(port: int = 8090, store: Path | str | None = None) -> ThreadingHTTPServer:
    from mindmap.deskops_routes import configured_routes
    from mindmap.workspace_routes import configured_workspace_routes

    selected_store = store or os.environ.get('SLDB_STORE', str(WORKSPACE_DIR.parent.parent / '.sldb'))
    if BACKEND_MODE == 'remote':
        handler = type('ParallelWorkspaceHandler', (WorkspaceHTTPHandler,), {'backend_mode': 'remote'})
        return ThreadingHTTPServer(('127.0.0.1', port), handler)

    from mindmap.persistence import EditorStore
    editor_store = EditorStore(selected_store)
    ws_routes = configured_workspace_routes(selected_store, editor_store)
    d_routes = configured_routes(selected_store, BACKEND_MODE, os.environ.get('DESKOPS_ROOT'))
    ws_service = WorkspaceService(selected_store, ws_routes, d_routes)

    handler = type(
        'ParallelWorkspaceHandler',
        (WorkspaceHTTPHandler,),
        {
            'backend_mode': 'local',
            'editor_store': editor_store,
            'workspace_routes': ws_routes,
            'desk_routes': d_routes,
            'workspace_service': ws_service,
        },
    )
    return ThreadingHTTPServer(('127.0.0.1', port), handler)


def main(argv: list[str] | None = None) -> None:
    from mindmap.serve import import_roots

    argv = sys.argv[1:] if argv is None else argv
    roots, argv = import_roots(argv)
    for root in reversed(roots):
        if root not in sys.path:
            sys.path.insert(0, root)
    port = int(argv[0]) if argv else 8090
    try:
        server = make_server(port)
    except OSError as exc:
        if exc.errno != errno.EADDRINUSE:
            raise
        print(
            f'El puerto {port} ya está en uso. Elige otro: python3 frontends/workspace/serve.py {port + 1}',
            file=sys.stderr,
        )
        raise SystemExit(2)
    store_info = getattr(server.RequestHandlerClass, 'editor_store', None)
    store_str = store_info.store if store_info else 'remote'
    print(f'Knowledge Workspace: http://127.0.0.1:{port}/ · store: {store_str}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
