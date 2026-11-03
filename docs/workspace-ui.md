---
title: Workspace Multi-proyección y Servidor Paralelo (Knowledge Workspace)
source_atoms:
  - atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
---

# Workspace Multi-proyección y Servidor Paralelo (Knowledge Workspace)

`graph_ui` ofrece dos puntos de entrada complementarios y **paralelos** sobre el mismo store `.sldb`, `deskops` y repositorio Git:

1. **Servidor paralelo standalone — Knowledge Workspace IDE (`frontends/workspace/serve.py`, puerto por defecto `8090`)**:
   Interfaz dedicada de 3 columnas (`◈ KIMUN · Knowledge Workspace`) alineada con `softfactory_spec/mockup.html`.
2. **Pestaña integrada en Mindmap (`frontends/mindmap/serve.py`, puerto por defecto `8088`, ruta `/workspace/node`)**:
   Vista multiproyección integrada como 7ª pestaña dentro del shell clásico de Mindmap.

Ambos servidores pueden ejecutarse simultáneamente sin colisión de estado (lectura estricta sobre `.sldb`):

```sh
# 1. UI clásica de Mindmap (puerto 8088)
PYTHONPATH=$PWD/frontends python frontends/mindmap/serve.py 8088

# 2. Visor paralelo Knowledge Workspace IDE (puerto 8090)
PYTHONPATH=$PWD/frontends python frontends/workspace/serve.py 8090
```

- **Knowledge Workspace IDE:** `http://127.0.0.1:8090/` (o `http://127.0.0.1:8090/?id=TaskDoc:mi-tarea`)
- **Mindmap `/workspace/node`:** `http://127.0.0.1:8088/workspace/node?id=TaskDoc:mi-tarea&depth=1&tab=document`

---

## 1. Arquitectura del Servidor Paralelo (`frontends/workspace/`)

El servidor paralelo vive en `frontends/workspace/` y reutiliza los adaptadores reales de `frontends/mindmap/` (`EditorStore`, `WorkspaceRoutes` y `DeskRoutes`) a través de `WorkspaceService`:

- [`frontends/workspace/serve.py`](../frontends/workspace/serve.py):
  - `WorkspaceService`: Enriquecimiento sin mocks sobre `WorkspaceRoutes` y `DeskRoutes`:
    - Extrae la prosa real por sección (`sections_prose`) desde el archivo Markdown en disco usando los rangos `span.line_start`–`span.line_end` del IR de SLDB, o desde los campos semánticos del payload (`why`, `goal`, `scope`, `implementation_path`, `validation`, `done_when`, `answer`, `what`, `how`, etc.).
    - Inspecciona referencias implícitas adicionales de código (`spec_path`, `target_identity`, `source_path` con `:line` desde `source_span`, y el propio archivo fuente del nodo).
    - Construye la proyección `changes` cruzando `content_hash` (`doc_version`), `file_revision` (SHA-256 en disco), `git status --porcelain` y la vecindad a 1–2 saltos.
    - Expone `/api/workspace/overview` con métricas reales del store (`total_nodes`, `total_edges`, `problems` de `load_edge_index`), tareas activas del `Board.md`, agentes vivos (`deskops runtime workers`), historial de ejecuciones (`runs/subagents/index.jsonl`) e historial Git (`git log`).
- [`frontends/workspace/index.html`](../frontends/workspace/index.html), [`frontends/workspace/app.js`](../frontends/workspace/app.js), [`frontends/workspace/styles.css`](../frontends/workspace/styles.css):
  - **Columna Izquierda (`aside.sidebar-left`)**:
    - *Workspace*: `⌂ Overview`, `✓ Tasks`, `▤ Documents`, `◇ Atoms / Contracts`, `⌘ Code / Symbols`, `⌬ Graph / Schema` con contadores reales y lista filtrable en vivo.
    - *Runtime*: `◎ Agents` (workers de `deskops`/`herdr`), `▶ Runs` (`runs/subagents/index.jsonl`).
    - *Knowledge*: `⇄ Changes` (archivos modificados en Git + problemas del store), `◷ History` (commits recientes).
  - **Columna Central (`section.workspace`) — 4 Proyecciones del Nodo**:
    1. **Document**: Prosa real por sección con chips interactivos `@mention` (que navegan a otros nodos del store) y chips `<code>` (que abren el archivo referido en la pestaña Code), además del árbol formal SLDB IR plegable.
    2. **Graph**: Subgrafo visual 2D en canvas/SVG (`.graph-box`) con el nodo seleccionado al centro y anillos concéntricos a `1 hop` y `2 hops`, chips de filtro por modelo y por tipo de relación, y navegación directa al hacer clic en cualquier nodo vecino.
    3. **Code**: Visor de código con selector de archivos referenciados, numeración de líneas y resaltado automático de fragmentos `:line`.
    4. **Changes (Merkle)**: Comparación de hashes (`doc_version` vs `file_sha256` vs `git status`), análisis de impacto en nodos conectados a 1–2 saltos y estado del working tree.
  - **Columna Derecha (`section.context`)**:
    - Identidad canónica (`Model:name`), tabla de metadatos y hashes, aristas entrantes (`←`) y salientes (`→`) clicables, referencias semánticas (`atoms`, `depends_on`, `pills`) y estado de integridad (`problems_report`).

---

## 2. Seguridad y Confinamiento

Tanto `frontends/mindmap/workspace_routes.py` como `frontends/workspace/serve.py` aplican confinamiento estricto:

- **Confinamiento en Repositorio**: Solo se leen archivos dentro de `repo_root`. Cualquier intento de *path traversal* (`..`, rutas absolutas externas) devuelve HTTP 400 o estado `fuera_del_repo`.
- **Protección ante Symlinks**: Enlaces simbólicos que resuelvan fuera de `repo_root` se bloquean como `fuera_del_repo`.
- **Archivos Ignorados por Git**: Cualquier ruta en `.git` o ignorada por `.gitignore` (`git check-ignore`) se clasifica como `protegido` (política *fail-closed*) y nunca expone su contenido.
- **Resiliencia ante Documentos Degradados**: Si un documento en disco falla validación de modelo, el nodo se resuelve de forma segura mediante el índice público de aristas (`load_edge_index`), marcando `is_degraded: true` y manteniendo operativas las proyecciones de Grafo y Contexto.

---

## 3. Contrato de API

- `GET /api/workspace/overview` *(servidor paralelo `8090`)*: Resumen global del store, board, workers, runs, git changes e historial.
- `GET /api/workspace/nodes`: Catálogo de nodos del store (`{ ok: true, nodes: [...] }`, más `category_counts` y `model_counts` en `8090`).
- `GET /api/workspace/node?id=<Model:name>&depth=1|2`: Proyecciones `document`, `graph`, `code` (y `changes` + `sections_prose` en `8090`) junto con `context`.

---

## 4. Pruebas

```sh
pytest -q tests/test_mindmap_workspace.py tests/test_parallel_workspace_serve.py
node --test tests/mindmap-workspace.test.mjs
pytest -q tests/e2e_mindmap_workspace.py
```

Esta implementación materializa el átomo:
[`atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node`](../desk/atoms/atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node.md).
