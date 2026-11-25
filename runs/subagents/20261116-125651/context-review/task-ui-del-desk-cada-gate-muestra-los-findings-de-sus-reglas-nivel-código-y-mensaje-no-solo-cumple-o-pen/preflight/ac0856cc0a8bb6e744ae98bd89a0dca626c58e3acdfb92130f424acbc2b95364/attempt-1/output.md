## REFORMULACION

Encargo ejecutable (`task.code`) en el repo graph_ui, workspace `desk`: ampliar la UI del desk (frontends/desk) para que cada gate renderizado por `renderGateBoxes` en `board.js` muestre los findings de sus reglas —nivel como texto ('error'/'aviso'/'info'), `code` en `<code>` y `what` completo como nodo de texto vía `h()`—, en la vista Tarea y en el inspector del Board. Añadir estilos `.finding.is-error/is-warning/is-info` en `styles.css` y pruebas en `tests/e2e_desk_ui.py` (gate con finding y gate sin findings). Resultado observable: capturas `gate-findings-task.png`, `gate-findings-board.png` y `timings.txt` en el run_dir, pruebas en verde. Límites: no tocar `task.js` ni `app.js` (cambios locales de JP); no cambiar deskops ni su contrato; no incluir ReviewDoc.

## AMBIGUEDADES

1. "task-advance-y-closeout-no-derraman-reglas-de-activacion-ni-runtimes-centrales-sin-trackear-en-el-desk-co" — el id parece truncado; obligaría a inventar el id real o a resolverlo por prefijo.
2. "junto a test_task_page_sections_inheritance_and_advance" — no consta que esa prueba exista; obligaría a inventar su ubicación/forma.
3. "si el fixture de desk de ese archivo no produce findings, se crea la tarea retenida en el fixture del propio test" — no define cómo detectar esa condición ni dónde está el fixture; obligaría a inventar el criterio.
4. "3 cargas por pantalla" — no aclara si son mediciones separadas ni qué se promedia en `timings.txt`.
5. "nivel como texto visible ('error', 'aviso' o 'info')" frente a level `warning`: el mapeo se deduce, pero el valor literal de `level` en JSON no se cita.
6. "runs/subagents/<run_dir del despacho>" — el run_dir no viene dado; obligaría a inventarlo.

## DRY-RUN

Lecturas: `deskops view task <id> --format json` para fijar la forma del finding; `board.js` (`renderGateBoxes`), `styles.css`, `index.html`, `tests/e2e_desk_ui.py` y README. Cambios previstos: `board.js` (ul/li con level, code, what), `styles.css`, `tests/e2e_desk_ui.py`. Dependencias: CLI deskops y desk real, chromium/playwright, `serve.py`. Validaciones futuras: los dos pytest y `git diff --quiet` sobre `task.js`/`app.js`; capturas y timings.

## FUTURO

El despachador aporta el run_dir; deskops confirma el contrato de findings; un humano revisa capturas y decide sobre los cambios locales de JP si el diff falla.
