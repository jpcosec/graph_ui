# Tester (deskops-tester, intento 1): findings de reglas en cada gate

Tarea: task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen
Cambio verificado: `git diff HEAD -- frontends/desk/board.js frontends/desk/styles.css tests/e2e_desk_ui.py` del árbol de trabajo de graph_ui (graph_ui HEAD b868673, deskops HEAD 4e3f657d).

## Veredicto: PASS

En condiciones equivalentes a la CI (deskops y graph_ui como hermanos, sin sldb/spec2viz/pron/scion al lado), los tres archivos de la Validación pasan enteros con el cambio y en HEAD, y los 2 tests nuevos pasan. Una mutación en cada test nuevo lo hace fallar. task.js y app.js no cambiaron. En el desk real de deskops, la vista Tarea y el inspector del Board muestran el finding completo, sin errores de consola, y un gate sin findings no tiene lista.

## Entorno reproducido (como la CI)

- `/dev/shm/gt1-ci/{deskops,UIs/graph_ui}` sale de `git archive HEAD` de cada repo, con los 3 archivos del cambio copiados encima. `/dev/shm/gt1-ci-head` es igual pero sin el cambio. `cmp` confirmó que los 3 archivos difieren entre las dos copias.
- Venv `uv venv /dev/shm/venv-gt1` con `-e ../../sldb -e ../../pron -e ../../spec2viz -e /dev/shm/gt1-ci/deskops -e /dev/shm/gt1-ci/UIs/graph_ui[test]`. spec2viz hizo falta porque graph_ui[test] depende de `spec2viz>=0.1.0`, y la CI también lo instala editable fuera del árbol. Playwright chromium está en /dev/shm/pw-gt1.
- `sldb stores build` en deskops y después en graph_ui, en las dos copias: rc 0. Los avisos link-missing de spec2viz/pron/scion son los esperados.
- Stores federados (`federated_stores(<path>, True)`, en federated-stores.txt):

| Store | Federa |
|---|---|
| /dev/shm/gt1-ci/UIs/graph_ui/.sldb | él mismo + /dev/shm/gt1-ci/deskops/.sldb |
| /dev/shm/gt1-ci-head/UIs/graph_ui/.sldb | él mismo + /dev/shm/gt1-ci-head/deskops/.sldb |
| /dev/shm/gt1-ci/deskops/.sldb | solo él mismo |
| desk de prueba (init_local_store + seed_desk, como el fixture) | él mismo + /dev/shm/gt1-ci/deskops/.sldb |
| /mnt/ssd/proyectos/SLDB_1/deskops/.sldb (real, para el paso de navegador) | él mismo + sldb, spec2viz, pron, scion y /mnt/ssd/herramientas/{deskops,sldb}/.sldb |

Ninguna copia federa stores de /mnt/ssd/proyectos/SLDB_1. Con este entorno, el problema de `sldb serve` de los fixtures desaparece: no hubo ningún timeout.

## Comandos → resultado → exit (HEAD contra cambio)

Cada pytest se corrió así: `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm /dev/shm/venv-gt1/bin/python -m pytest <archivo> -q -rs -p no:cacheprovider --basetemp=/dev/shm/gt1-bt`, de a uno, sin -n y con `free -g` antes (available ≥ 11 GB en todos). El runner está en gt1-run.sh y los logs en `HEAD-*.log` y `CHG-*.log`.

| Comando | HEAD | Cambio |
|---|---|---|
| pytest tests/e2e_desk_ui.py | 6 passed, rc 0 (167 s) | 8 passed, rc 0 (210 s): incluye test_task_gate_shows_its_rule_findings y test_task_gate_without_findings_has_no_list |
| pytest tests/test_desk_ui_routes.py | 13 passed, rc 0 (313 s) | 13 passed, rc 0 (341 s) |
| pytest tests/test_mindmap_deskops.py | 7 passed, rc 0 (119 s) | 7 passed, rc 0 (117 s) |
| `git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js` (repo real) | — | rc 0 |
| `node --check frontends/desk/board.js` (repo real) | — | rc 0 |

Ningún test que pasa en HEAD falla con el cambio.

## Los tests nuevos son reales (mutaciones, en copias de /dev/shm)

| Mutación de board.js (mut1.diff, mut2.diff) | Test | Resultado |
|---|---|---|
| Quitar `renderGateFindings(gate, task)` de renderGateBoxes | `-k test_task_gate_shows_its_rule_findings` | 1 failed, rc 1: `Locator expected to have count '1'` sobre `inspector-gate.first.get_by_test_id("gate-finding")` |
| Quitar `if (!findings.length) return null;`, de modo que siempre se dibuja la `ul` | `-k test_task_gate_without_findings_has_no_list` | 1 failed, rc 1: `locator("ul.gate-findings") expected to have count '0'` |

## Navegador sobre el desk real de deskops (sin copiar)

- `sldb serve --port 18891 --store ../../deskops/.sldb` bajo `systemd-run --user --scope -p MemoryMax=3G`. La única petición de calentamiento a /views/board dio 200 en 1,46 s, porque el caché ya estaba caliente, y el RSS quedó en 130 MB (warmup.txt). Después: `frontends/desk/serve.py 8091 --root ../../deskops --sldb-url http://127.0.0.1:18891` desde el repo real, con un RSS final de 170 MB. Sirve el board.js con `gate-findings`. Los dos servidores se mataron por PID (1945452 y 1946884).
- Lo esperado sale de `deskops view task task-advance-y-closeout-no-derraman-reglas-de-activacion-ni-runtimes-centrales-sin-trackear-en-el-desk-co --root . --format json` (rc 0): gate task_activates→ritual-testing con 1 finding de level error y code rules/rule-activation-task-code; el subject es la propia tarea.
- El script es gt1_browser.py: chromium headless, sin intercepción, un contexto nuevo por carga. Cada carga cuenta los ms desde goto (en el Board también el clic en la tarjeta) hasta que el li del finding es visible.

| Pantalla | Carga 1 | Carga 2 | Carga 3 |
|---|---|---|---|
| Vista Tarea | 9057 ms | 4576 ms | 6721 ms |
| Inspector del Board | 5931 ms | 6376 ms | 7369 ms |

- En las 6 cargas: clase `finding is-error`, etiqueta visible `error`, `<code>` igual a `rules/rule-activation-task-code`, el what completo contenido en el li y 0 `.finding-subject`. Hubo 0 mensajes de consola de tipo error o warning y 0 pageerror (browser-report.json).
- Gate sin findings, elegido de forma independiente con `deskops view board` (51 tareas, 36 con findings): task-closeout-verify-anticipa-la-evidencia-de-run-dir-que-exige-closeout-commit, distinta de la que usó el ejecutor. Tanto en la vista Tarea como en el inspector tiene 1 gate, 0 `ul.gate-findings`, 0 `gate-finding` y la consola limpia.
- Capturas: gate-findings-task.png, gate-findings-board.png (la caja del gate en el inspector), gate-nofindings-task.png y board-full.png (página completa).
- Revisión de código: el what entra como hijo de `h()` (app.js:41-53), que lo agrega con `document.createTextNode(String(child))`. board.js, task.js y app.js no usan innerHTML, insertAdjacentHTML ni outerHTML (grep). El level solo llega a `className` y al texto de la etiqueta.

## Observaciones

- El informe del ejecutor decía que los pytest no podían quedar en verde por `sldb serve`. Era un problema de entorno: en el layout de la CI, HEAD y el cambio pasan enteros (6/6 → 8/8, 13/13, 7/7). Sus resultados de navegador coinciden con los míos: los mismos checks y tiempos del mismo orden (los míos, 4,6-9,1 s, son algo más altos porque la máquina estaba más cargada; available bajó a 11 GB por otros procesos).
- Esto no es un defecto del cambio, sino un dato de deskops: el gate de la tarea real aparece como `holds: true` («CUMPLE») y a la vez trae un finding de nivel error de la regla de activación. La UI muestra fielmente lo que entrega `deskops view`. Quizá valga la pena preguntarle a deskops si debe ser así.
- Contrato y preflight-2/bundle-2: el nivel crudo va en la clase y traducido en la etiqueta; un nivel desconocido se muestra tal cual (`FINDING_LEVEL_LABELS[f.level] || String(f.level)`); el subject se omite solo cuando es la propia tarea; task.js y app.js no se tocaron; test_desk_ui_routes.py no se tocó. Se cumple.
- Limpieza: borré /dev/shm/gt1-*, /dev/shm/venv-gt1, /dev/shm/pw-gt1 y el caché de uv /mnt/ssd/.uv-cache-gt1. No quedó ningún proceso mío vivo.

TESTER PASS: findings (nivel, code, what; sin subject propio) en vista Tarea e inspector del Board; e2e_desk_ui 8/8, test_desk_ui_routes 13/13, test_mindmap_deskops 7/7 en layout CI sin regresiones contra HEAD; mutaciones detectadas; navegador sobre el desk real OK. Informe: /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-gate-findings-tester-a1/result-summary.md
