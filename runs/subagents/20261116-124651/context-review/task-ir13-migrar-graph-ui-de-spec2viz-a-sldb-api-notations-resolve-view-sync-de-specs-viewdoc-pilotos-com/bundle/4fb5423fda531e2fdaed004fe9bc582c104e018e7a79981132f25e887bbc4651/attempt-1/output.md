**REFORMULACION**

Propósito: retirar spec2viz de graph_ui para que IR13 (gate G4) pueda retirarlo. Resultado: producción, tests, fixtures, dependencias y textos migrados a `sldb.api.notations`, `sldb notations sync --spec` y `sldb.models.notation.view_doc.ViewDoc`, con cero skips por spec2viz, grep limpio y `specir retirement check` sin dependencias de graph_ui. Repo: graph_ui (`UIs/graph_ui`). Límites: no dibujar paquetes UML, no cambiar layout/estilo, no tocar repos spec2viz/sldb/IR, no tocar los cambios sin commitear de JP en `frontends/desk/app.js` y `task.js`. Es un nodo ejecutable (`task.code`), enrutado a `ritual-testing`.

**AMBIGUEDADES**

1. "quitar el extra 'notation'": el `pyproject.toml` aportado no tiene extra `notation` (solo `deskops` y `test`); obligaría a inventar cuál eliminar.
2. "VIEW_MODEL_REF = 'spec2viz.sldb_models:ViewDoc' pasa a…": el archivo aportado ya contiene `VIEW_MODEL_REF = 'sldb.models.notation.view_doc:ViewDoc'`; obligaría a inventar si el estado de partida es el del input o el de la prosa.
3. ".github/requirements-suite.txt: quitar la línea … y su comentario de tres líneas": el archivo no menciona spec2viz; obligaría a inventar el contenido a borrar.
4. "sldb_adapter.py (líneas ~239-247 y ~435-437)": esas zonas ya importan `sldb.api.notations`; obligaría a inventar el cambio pendiente.
5. "Actualizar el atom … para que diga sldb.api.notations": el átomo aportado ya lo dice; obligaría a inventar qué editar.
6. "notation-view.js, notation.mjs, notation-style.mjs, notation-swimlanes.mjs": no aportados ni listados en `files:`; obligaría a inventar ubicación y textos.
7. "solo el comentario de la línea 62": obligaría a inventar cuál si la línea desfasa.
8. `pip uninstall -y spec2viz`: no dice qué entorno; obligaría a inventar el venv.

**DRY-RUN**

Lecturas: `grep -rn spec2viz frontends tests pyproject.toml .github`, `git -C ../../spec2viz show 2a218b1:<ruta>` ×10, `grep ViewDoc .sldb/store.yaml`. Cambios: imports→`sldb.api.notations`; `VIEW_MODEL_REF`; 10 fixtures + README de una línea en `tests/fixtures/notation-pilots/`; PILOTS/MATRIX y comandos `sldb notations sync` en 8 tests; quitar spec2viz de pyproject y requirements-suite; textos JS; átomo; commit y `deskops message send --to IR`. Dependencias: sldb y sldb CLI instalados, repo spec2viz con ese commit, playwright/node para e2e, red nueva para el entorno. Validaciones futuras: los dos `pytest`, grep negativo y `specir retirement check`.

**FUTURO**

El Board decide pasar de testing a closeout; IR recibe el sha y decide el acta de retiro; JP decide sobre sus cambios sin commitear; un humano confirma que el commit 2a218b1 es el correcto.
