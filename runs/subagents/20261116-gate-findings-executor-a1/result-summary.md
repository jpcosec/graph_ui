# Ejecutor (deskops-e-89b778c6deb5, intento 1): findings de reglas en cada gate

Tarea: task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen

## Cambios

- `frontends/desk/board.js`
  - Nuevo `FINDING_LEVEL_LABELS` (error→'error', warning→'aviso', info→'info'; un nivel desconocido se muestra tal cual).
  - Nueva `findingSubjectIsTask(subject, task)`: el subject (`<Model>:<id>`, con `doc:` y `@sha256:` opcionales) se omite solo si nombra la tarea del gate; si no, se muestra en `<span class="finding-subject"><code>`.
  - Nueva `renderGateFindings(gate, task)`: `<ul class="gate-findings">` con un `<li data-testid="gate-finding" class="finding is-<level crudo>">` por finding: `<span class="finding-level">` con la etiqueta, el code en `<code>` y el what como nodo de texto (todo con `h()`, sin innerHTML). Si el gate no tiene findings (`deskops view` omite la clave), devuelve null: no hay lista.
  - `renderGateBoxes(task)`: añade `renderGateFindings(gate, task)` bajo la línea de condición. task.js la llama tal cual, así que la vista Tarea queda cubierta sin tocar task.js.
- `frontends/desk/styles.css`: `.box ul.gate-findings`, `.finding`, `.finding-level` y `.finding.is-error|is-warning|is-info` (borde izquierdo y color de la etiqueta con los tokens --danger, --warning y --reference). El nivel siempre va también como texto.
- `tests/e2e_desk_ui.py`, junto a test_task_page_sections_inheritance_and_advance:
  - `_expect_gate_findings`: cada gate muestra exactamente los findings de `deskops_view.task_view`, en orden (clase, etiqueta, code y what completo).
  - `test_task_gate_shows_its_rule_findings`: crea en el desk del fixture una task.code sin recibos (deskops real produce `rules/rule-activation-task-code`), lo comprueba contra deskops view, y verifica la vista Tarea (sin `.finding-subject`, porque el subject es la propia tarea) y el inspector del Board.
  - `test_task_gate_without_findings_has_no_list`: la tarea `first` del fixture (con recibos aceptados, gate sin findings según deskops view) no tiene `ul.gate-findings`.
- tests/test_desk_ui_routes.py no se tocó.

## Verificación en navegador sobre el desk real de deskops (evidencia principal)

- `deskops view task task-advance-y-closeout-no-derraman-reglas-de-activacion-ni-runtimes-centrales-sin-trackear-en-el-desk-co --root ../../deskops --format json` → rc 0; gate task_activates→ritual-testing (holds true) con 1 finding: level error, code rules/rule-activation-task-code, subject TaskCodeDoc:<la propia tarea>, what "Una tarea task.code se activa con recibos preflight y bundle ... (seen: {})".
- `sldb serve --port 18791 --store ../../deskops/.sldb` (MemoryMax=3G) y luego una petición a /views/board → 200 en 0.7 s; después `frontends/desk/serve.py 8091 --root ../../deskops --sldb-url http://127.0.0.1:18791`. Ambos se mataron por PID (1396894, 1397410).
- Playwright con chromium headless (script en el scratchpad, sin intercepción): 3 cargas en contexto nuevo por pantalla. En las 6 se comprobó clase `finding is-error`, etiqueta visible 'error', `<code>` = rules/rule-activation-task-code, what completo y sin `.finding-subject`. 0 errores ni avisos de consola y 0 pageerror (browser-report.json).
- Gate sin findings en el desk real: task-readme-y-docs-dejan-de-nombrar-spec-artifacts-spec-fields-y-specregistry-borrados-en-cc30 (1 gate). En la vista Tarea y en el inspector del Board, `ul.gate-findings` cuenta 0.
- timings.txt (ms desde goto hasta que el finding del gate es visible; en el Board incluye el clic en la tarjeta):
  - task: 4010 / 4412 / 3908
  - board: 4274 / 4231 / 4764
- Capturas: gate-findings-task.png (sección "Gates y evidencia" de la vista Tarea) y gate-findings-board.png (inspector con la tarea seleccionada).

## Validación (comandos y exit codes)

Todos los pytest se corrieron así: `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm /dev/shm/venv-gate-e1/bin/python -m pytest <archivo> -q -rfEs -p no:cacheprovider --basetemp=/dev/shm/gate-e1-bt`, de a un archivo y comprobando antes `free -g`. La línea base se corrió sobre un `git archive HEAD` en /dev/shm/gate-e1-head, sin checkout: el árbol de trabajo ya tenía mi board.js editado y los servidores leen los estáticos en vivo. El primer intento de línea base lo paré porque se solapaba con la edición y no cuenta.

| Comando | Línea base (HEAD) | Después |
|---|---|---|
| `git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js` | — | rc 0 |
| `node --check frontends/desk/board.js` | — | rc 0 |
| pytest tests/e2e_desk_ui.py | rc 1: 6 failed de 6 (los 6 tests existentes) | rc 1: 8 failed de 8 (los mismos 6 más mis 2 nuevos) |
| pytest tests/test_desk_ui_routes.py | rc 1: 5 failed, 8 passed | rc 1: los mismos 5 failed, 8 passed |
| pytest tests/test_mindmap_deskops.py | rc 143: el OOM killer del scope de 3G lo mató tras 5 de 7 tests (`.FFF.`; journal: run-u79234.scope 'oom-kill') | rc 1: 4 failed, 3 passed; los 4 por TimeoutError contra el sldb serve del fixture |
| `node --test tests/*.test.mjs` | — | rc 0: 151 pass, 0 fail |

Tests que fallan en tests/e2e_desk_ui.py (tanto en la línea base como después): test_board_columns_gates_advance_conflict_focus, test_task_page_sections_inheritance_and_advance, test_drawer_lists_disk_and_copies_the_exact_command, test_inbox_ack_promote_and_conflict, test_agents_without_herdr_shows_cause_and_runs_match_the_view y test_every_screen_loads_from_the_sidebar_with_visible_focus. Después fallan además los nuevos test_task_gate_shows_its_rule_findings y test_task_gate_without_findings_has_no_list. Los dos nuevos fallan en el primer paso, porque la página no llega a cargar la vista: `.doc-title` no aparece, y en el segundo caso cuenta 0 gates en lugar de 1. Es el mismo síntoma que los 6 de HEAD: la vista no llega desde el `sldb serve` del desk temporal. Ninguno falla en una aserción de findings.

Tests que fallan en tests/test_desk_ui_routes.py (antes y después, idénticos): test_each_view_route_returns_exactly_what_deskops_view_returns, test_desk_selector_lists_registry_desks_with_a_desk_and_routes_views, test_advance_delegates_to_desk_routes_with_revision_guard, test_board_comes_from_sldb_serve_and_projects_to_deskops_view y test_advance_with_the_etag_read_before_an_edit_is_409.

Tests que fallan en tests/test_mindmap_deskops.py después: test_real_advance_stale_origin_and_types, test_serialized_advances_and_board_revision, test_blocked_and_missing_lifecycle y test_terminal_cannot_close_and_path_escape, todos por TimeoutError. Mi cambio no toca frontends/mindmap.

Conclusión: no hay regresión atribuible a este cambio. Por el problema conocido de sldb, en esta máquina el bloque de Validación del contrato no queda en verde, y eso queda pendiente para cuando sldb lo resuelva. La condición de navegador del Done When sí se cumple sobre el desk real.

Logs: baseline.log y baseline-names.log (línea base), validation.log (después), full-*.log (salida completa), mindmap-deskops.log, node-tests.log, sldb-serve.log, desk-serve.log y browser-report.json.

## Desvíos e incidencias

- Ningún desvío del contrato. Detalle: el what va como nodo de texto directo dentro del `<li>`, sin envolverlo en un span. La etiqueta se muestra sin `text-transform`, para que el texto visible sea literalmente 'error', 'aviso' o 'info'.
- Al terminar quedó vivo un `sldb serve` huérfano de un fixture de la línea base (PID 1403572, store en /dev/shm/gate-e1-bt). Lo maté por PID.
- Lo que borré en /dev/shm: venv-gate-e1, pw-gate, gate-e1-bt, gate-e1-bt2, gate-e1-head, gate-e1-probe y los gate-e1-* sueltos.

EXECUTOR DONE: findings (nivel, code, what; subject solo si no es la propia tarea) en cada gate de la vista Tarea y del inspector del Board, verificados en navegador sobre el desk real de deskops; pytest bloqueado por el problema conocido de sldb serve, con los mismos fallos que HEAD.
Archivos tocados:
- frontends/desk/board.js
- frontends/desk/styles.css
- tests/e2e_desk_ui.py
