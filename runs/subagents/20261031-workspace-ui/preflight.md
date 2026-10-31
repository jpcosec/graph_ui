# Preflight: Workspace multiproyección (documento, grafo local, código y contexto)

Fuente exclusiva:
- `desk/tasks/task-workspace-multiproyeccion-documento-grafo-local-codigo-y-contexto.md`
- `desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md`

---

## 1. Objetivo concreto del Workspace multi-proyección (`/workspace/node`)

El objetivo es entregar en `frontends/mindmap` la vista unificada e interactiva `/workspace/node`, centrada en el objeto lógico seleccionado (documento, átomo, tarea, etc.), permitiendo alternar fluidamente entre tres proyecciones complementarias (**Document**, **Graph** a 1-2 hops y **Code**) mientras se preserva un panel lateral persistente de identidad y relaciones (**Context**).

Este workspace materializa los principios de `softfactory_spec` (K07, K10, K13), donde documento, grafo, código, tarea y decisión arquitectónica no son entidades aisladas sino proyecciones navegables del mismo nodo lógico subyacente. Supera las vistas globales dispersas por faceta de Mindmap, unificándolas en una estación de trabajo centrada en el nodo.

---

## 2. Detalle de las 3 proyecciones requeridas y el panel lateral Context

### A. Proyección Document
- **Propósito**: Presentar el contenido estructurado y legible del documento o artefacto asociado al nodo seleccionado (documento, átomo, tarea).
- **Características**: Renderizado de campos, secciones, metadatos y cuerpo documental provisto por `sldb` / `deskops`.

### B. Proyección Graph (vecindad a 1-2 hops)
- **Propósito**: Visualizar la topología relacional local inmediata centrada en el nodo activo.
- **Características**:
  - Exploración de la vecindad a 1 o 2 saltos (hops) a partir del grafo del store, sin nodos ni aristas duplicadas.
  - Filtros interactivos por tipo/modelo de nodo y relación.
  - Navegación interactiva que permite centrar el workspace en cualquier nodo de la vecindad.

### C. Proyección Code
- **Propósito**: Proyectar el archivo fuente o fragmento de código referenciado directamente por el nodo.
- **Características**:
  - Lectura acotada y segura de archivos o fragmentos bajo el repositorio.
  - Visualización contextual de la implementación vinculada a la especificación, átomo o tarea.

### D. Panel lateral Context
- **Propósito**: Mantener la referencia viva de identidad, estado y relaciones durante toda la navegación y cambio de pestañas.
- **Contenido y comportamiento**:
  - **Identidad**: Identificador canónico y tipo/modelo del nodo.
  - **Integridad y Estado**: `content_hash` (hash de contenido real del store) y estado operativo (`status`).
  - **Relaciones**: Listado bidireccional estructurado de relaciones entrantes y salientes.
  - **Navegabilidad interactiva**: Cada nodo relacionado es interactivo (clicable), permitiendo reenfocar inmediatamente el workspace en dicho nodo.

---

## 3. Guardarraíles obligatorios

### A. Prohibición estricta de mocks, stubs y datos falsos (Pill de deliverables)
- **Cero mocks/stubs**: Prohibido el uso de mocks, stubs, funciones no-op o placeholders `TODO`/`FIXME` en cualquier entregable de código o pruebas.
- **Cero datos falsos**: Prohibido retornar valores inventados o hardcodeados para simular el flujo de datos.
- **Cables reales (Real wiring)**: Todos los componentes deben conectarse a dependencias y flujos reales (`sldb -> sldb.api.graph -> overlay`). Los valores deben derivarse de fuentes de verdad reales (descriptores de modelos, stores reales).
- **Pruebas contra contratos reales**: Los tests deben ejecutarse contra un store temporal real y validar el contrato real, nunca contra fixtures inline que dupliquen la respuesta esperada.
- **Detención ante bloqueos**: Si una dependencia o dato real no está disponible, el ejecutor debe detenerse y reportar el bloqueo en lugar de ocultarlo con un mock.

### B. Fronteras de filesystem y seguridad (Repo-bounded)
- **Acotación estricta al repositorio**: Las rutas de lectura de código y nodos deben estar confinadas bajo la raíz del repositorio de trabajo (`graph_ui`).
- **Prevención de traversal y symlinks**: Resolución canónica estricta para evitar escapes fuera del árbol del repositorio mediante rutas relativas maliciosas o enlaces simbólicos.
- **Respeto a `.gitignore` y exclusiones**: Rechazo automático de accesos a `.git/`, archivos ignorados por git (vía `git check-ignore`), directorios, archivos binarios o archivos que excedan límites razonables de tamaño.

### C. Aislamiento de fallos entre proyecciones (Fault Isolation)
- La falla o invalidación de una proyección específica (por ejemplo, error en la generación del IR del documento o ausencia de archivo de código) no debe colapsar la respuesta global del endpoint ni bloquear la interfaz.
- Las proyecciones restantes y el panel lateral Context deben degradarse elegantemente, manteniéndose funcionales y accesibles.

### D. Sin parsers propios redundantes y reutilización arquitectural
- Prohibido crear parsers ad-hoc propios fuera de los provistos por `sldb` y `deskops`.
- Reutilización estricta del shell, router, registro y skins existentes en Mindmap.

---

## 4. Entregables exactos y criterios de validación

### A. Entregables exactos (Files declarados en la tarea)
1. `frontends/mindmap/serve.py`: Servidor y montaje de rutas de la API del workspace.
2. `frontends/mindmap/workspace_routes.py`: Rutas y endpoints para proyección de nodo, vecindad 1-2 hops y lectura acotada de código.
3. `frontends/mindmap/shell/registry.js`: Registro de la vista `/workspace/node` en el registro del shell de Mindmap.
4. `frontends/mindmap/views/workspace/`: Implementación frontend de la vista de workspace (pestañas Document, Graph, Code y sidebar lateral Context).
5. `tests/test_mindmap_workspace.py`: Suite de pruebas unitarias/integración backend con pytest sobre store temporal real.
6. `tests/mindmap-workspace.test.mjs`: Pruebas de componentes y lógica frontend ejecutadas con `node --test`.
7. `tests/e2e_mindmap_workspace.py`: Suite de pruebas end-to-end con Playwright y pytest sobre store temporal real.
8. `docs/workspace-ui.md`: Documentación técnica de la arquitectura, contratos y uso del workspace.

### B. Criterios de validación (Validation commands)
La tarea requiere la ejecución satisfactoria de:
- `pytest -q tests/test_mindmap_workspace.py`
- `node --test tests/mindmap-workspace.test.mjs`
- `pytest -q tests/e2e_mindmap_workspace.py`

### C. Condición de finalización ("Done When")
- Seleccionar un documento, átomo o tarea en `/workspace/node` permite alternar fluidamente entre Document, Graph (vecindad de 1-2 hops con filtros por tipo) y Code.
- El usuario puede inspeccionar la identidad, `content_hash` y relaciones en el panel lateral Context.
- Es posible navegar interactivamente a cualquier nodo vinculado haciendo clic en él.
- Todas las suites de pruebas (`pytest`, `node --test` y `e2e_mindmap_workspace.py`) pasan en verde sobre datos reales sin mocks.
- Se entregan las evidencias de cierre requeridas: `tests`, `commit`, `atom` (`atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node`) y `document` (`docs/workspace-ui.md`).
