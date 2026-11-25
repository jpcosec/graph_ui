REFORMULACION

Propósito: que las dos superficies de frontends/desk que dibujan gates (vista Tarea e inspector del Board) muestren los findings de las reglas, no solo cumple/pendiente. Resultado: `renderGateBoxes` (board.js) añade bajo la condición una `ul.gate-findings` con un `li` por finding: nivel como texto ('error', 'aviso' para warning, 'info'), `code` en `<code>` y `what` como texto (vía `h()`, nunca innerHTML); sin subject; sin lista si no hay findings; clases `.finding.is-error/.is-warning/.is-info` en styles.css; pruebas en e2e_desk_ui.py. Repo: frontends/desk + tests. El desk real es deskops. Límites: no tocar `frontends/desk/task.js` ni `app.js` (cambios locales de JP); no cambiar deskops ni su contrato; ReviewDoc fuera de alcance.

AMBIGUEDADES

1. "task.js línea ~71" y "board.js línea ~165": task.js no está en el input; obliga a inventar su estructura y a aceptar sin verificar que comparte renderGateBoxes.
2. "guardar runs/subagents/<run_dir del despacho>/gate-findings-task.png": el run_dir no viene dado; obliga a inventarlo.
3. "'error', 'aviso' o 'info'… (level warning)": no cubre otros niveles posibles; obliga a inventar mapeo.
4. "class='finding is-<level>'": no aclara si `<level>` es crudo (warning) o traducido (aviso); obliga a elegir.
5. "un gate sin findings no muestra lista": no define cómo se garantiza ese gate en el fixture (un gate que cumple ¿tiene findings vacíos o info?).
6. "tests/test_mindmap_deskops.py se corren solo como regresión": aparece en Validación pero no en Scope ni en files; obliga a decidir si se toca.
7. "el subject no se muestra (es la propia tarea)": suposición no verificada; si el subject difiere, se oculta información.

DRY-RUN

Lecturas: board.js (renderGateBoxes), styles.css, e2e_desk_ui.py; en ejecución, `deskops view task <id> --format json` para fijar la forma real de findings. Cambios previstos: ul/li de findings en renderGateBoxes; clases CSS; dos pruebas e2e; sin tocar task.js/app.js. Dependencias: deskops CLI y desk real, fixtures, playwright/chromium, run_dir. Validaciones futuras (no ejecutadas): pytest rutas+mindmap, pytest e2e, `git diff` task.js/app.js, capturas y timings.

FUTURO

El despacho entrega el run_dir; deskops provee la forma real de findings y el desk de prueba; JP o un commit resuelven task.js/app.js; el ritual testing valida y closeout hace el commit atómico; un humano revisa capturas.
