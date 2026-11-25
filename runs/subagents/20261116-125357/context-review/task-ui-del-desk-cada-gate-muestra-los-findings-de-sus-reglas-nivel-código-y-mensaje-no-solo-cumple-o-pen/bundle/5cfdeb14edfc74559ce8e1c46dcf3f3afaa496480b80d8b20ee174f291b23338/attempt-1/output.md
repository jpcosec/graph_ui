## REFORMULACION
Propósito: que la UI del desk muestre, por gate, los findings de sus reglas (nivel, código, mensaje), no solo cumple/pendiente. Resultado: en `frontends/desk/board.js`, `renderGateBoxes` añade bajo la condición una lista `data-testid="gate-finding"` con un ítem por finding (nivel como texto visible, `code` en `<code>`, `what` como texto sin `innerHTML`); `styles.css` estiliza el nivel sin depender solo del color; pruebas cubren gate con y sin findings; gate sin findings no muestra lista. Repo: graph_ui (`frontends/desk`, `tests`). Límites: no tocar `task.js` ni `app.js` (si hiciera falta, parar y reportar); no cambiar deskops ni el contrato de `deskops view`; no mostrar ReviewDoc.

## AMBIGUEDADES
1. «En la vista Tarea y en el inspector del Board» frente a «NO ENTRA: frontends/desk/task.js y frontends/desk/app.js»: no consta que la vista Tarea reuse `renderGateBoxes`; obligaría a inventar si `task.js` importa `board.js` o si la vista Tarea queda fuera.
2. «reutilizando las clases de estado que ya existen (is-holds, is-pending) o una clase is-error/is-warning nueva»: `error/warning/info` no mapean a esas clases (no hay clase para `info`); obliga a inventar la correspondencia.
3. «tests/test_desk_ui_routes.py o tests/e2e_desk_ui.py (el que ya cubra la vista Tarea)»: ambos podrían; la aserción de render vive en e2e. Obliga a elegir e inventar criterio.
4. «con datos del desk real de deskops vía tests/deskops_viewdocs.py o el fixture que ya use la prueba elegida»: el fixture no provoca findings de gate claramente; obliga a inventar cómo generarlos.
5. «capturas y tiempos quedan en el run_dir»: `run_dir` no se define en el input; obliga a inventar la ruta.
6. Validación ejecuta `tests/test_mindmap_deskops.py`, pero Scope dice «tests/mindmap-deskops.test.mjs no aplica»: son archivos distintos; obliga a inventar si es relevante.
7. La forma real del finding incluye `subject`, que el Goal omite («el nivel… el código… y el mensaje (what) completo»); obliga a inventar si se muestra.

## DRY-RUN
Lecturas: `renderGateBoxes`, `styles.css` (clases de estado), test elegido y su fixture, `serve.py`, salida real de `deskops view task <id> --format json`. Cambios previstos: lista de findings y CSS en `board.js`/`styles.css`; caso de prueba con gate con finding y sin él. Dependencias: `deskops view` ya entrega `findings`; playwright/chromium. Validaciones futuras (sin ejecutar): los dos `pytest`, `git diff --quiet` sobre `task.js`/`app.js`, y comprobación headless con capturas y tiempos.

## FUTURO
El nodo de ejecución implementa y entrega diff y pruebas; el ritual de testing valida; closeout registra el commit atómico. Un humano resuelve el mapeo de clases de nivel y la ruta `run_dir`.
