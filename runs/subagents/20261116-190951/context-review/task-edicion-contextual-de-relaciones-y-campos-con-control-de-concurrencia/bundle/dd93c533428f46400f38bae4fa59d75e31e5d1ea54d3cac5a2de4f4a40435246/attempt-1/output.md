**REFORMULACION**
Propósito: habilitar edición contextual de campos y relaciones de la KB SLDB desde el workspace, con control de concurrencia. Resultado: endpoints de mutación en `frontends/mindmap` que usen `pron.Store`/`sldb`, exijan revisión previa, devuelvan 409 ante escritura obsoleta; controles en Context/Document; documentación y pruebas reales. Repo operativo: `graph_ui` (`frontends/mindmap`, `tests`, `docs`), con `softfactory_spec/SPEC.md` como referencia. Límites: no editar código ni anclajes (T4 opción A), no escribir fuera de `pron.Store`/`sldb`, no tocar cambios de JP en `frontends/desk/app.js` y `task.js`, sin mocks/stubs. Es una tarea `task.code` ejecutable, no un agregado.

**AMBIGUEDADES**
1. “panel Context y en la proyección Document del workspace”: el input también documenta dos workspaces (Mindmap `/workspace/node` y standalone `8090`). Obliga a inventar cuál es la superficie objetivo.
2. “exigiendo el hash de revisión previo” y “reutilizando el mecanismo de revisión y 409 que ya usa persistence.py para guardar el mapa”: el mecanismo citado gobierna la vista (`viewRevision`), no campos/relaciones de documento. Obliga a inventar el token, la ruta y el contrato exacto de revisión.
3. “relaciones válidas según el modelo”: no se enumera qué relaciones, dirección o cardinalidad admite el modelo. Obliga a inventar las reglas de validación.
4. “sin perder estado local” tras 409: no se define si se conserva el formulario, se reintenta o se fusiona. Obliga a inventar el comportamiento UI.

**DRY-RUN**
Un ejecutor futuro leería `frontends/mindmap/serve.py`, `persistence.py`, `workspace_routes.py`, `views/workspace/`, la API de mutación de `pron.Store`/`sldb`, `tests/test_mindmap_workspace_edit.py` y `docs/workspace-ui.md`. Cambiaría rutas de mutación, controles Context/Document, docs y pruebas. Dependería del lock/revisión real de `sldb`, del 409 existente y del guardrail sin mocks. Validaría con `pytest -q tests/test_mindmap_workspace_edit.py`, persistencia real tras recarga y rechazo 409 sin pérdida local. No se ejecuta nada.

**FUTURO**
El ritual `testing` ejecutará la validación; `closeout` reconciliará el Board y producirá el commit atómico. Un humano confirma que la tarea sigue activa y que T4 opción A se mantiene.
