# result-summary: tester IR13, intento 2 (deskops-t-f62fd3896e07-a2)

Tarea: task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
Cambio probado: working tree sin commitear sobre HEAD b868673 (graph_ui master), incluido el arreglo de tests/test_ci_workflow.py del ejecutor 2.
Entorno con el diff: uv venv /dev/shm/venv-ir13-t2 (sldb, pron, deskops y `.[test]` en editable; sin spec2viz).
Copia de HEAD: `git archive HEAD` en /dev/shm/gu-lay/UIs/graph_ui, con enlaces simbólicos a los repos hermanos y su propio venv /dev/shm/venv-gu-head, que sí instala spec2viz.
Cada pytest corrió sin `-n`, de a un archivo, bajo `systemd-run --user --scope -p MemoryMax=3G` con TMPDIR=/dev/shm y `--basetemp` propio.

## Veredicto: PASS

Se cumplen las 4 validaciones del contrato y el Done When (salvo el sha a IR, que es un paso del coordinador). test_ci_workflow ya pasa.
Ningún fallo de la suite, de los e2e ni del navegador lo causa el diff: todos se repiten igual en la copia de HEAD o son de entorno.

## Comando → resultado → exit

| Comando | Resultado | Exit |
|---|---|---|
| `python -c "import spec2viz"` (venv con el diff) | ModuleNotFoundError (import-spec2viz.txt) | 1 (esperado) |
| V1 `pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py` | 20 passed, 0 skipped (v1-unit.out) | 0 |
| V2 `pytest -q -rs` de los 8 e2e del contrato | 21 passed, 0 skipped, 254 s, maxrss 1.38 GB (v2-e2e.out) | 0 |
| V3 `! grep -rnE '<patrón>' frontends tests pyproject.toml .github` | sin salida (v3-grep.txt) | 0 |
| V4 `specir retirement check --path graph_ui=../UIs/graph_ui`, tal cual | `Error: no path given for: deskops, pron, sldb, spec2viz/.sldb` (v4-specir-tal-cual.txt) | 2 |
| V4 con las 5 `--path` | 85 dependencias, **0 de graph_ui**: graph_ui solo aparece en la línea `audited repos` (v4-specir-5paths.txt) | 1 (gate global abierto por otros repos) |
| Pilotos: `git hash-object` contra los blobs de spec2viz 2a218b1 | 10/10 OK, README exacto, sin .mmd ni .vega.json (pilots-bytes.txt) | n/a |
| B `pytest tests/test_ci_workflow.py` | 6 passed | 0 |
| C `node --test tests/*.test.mjs` | 151 pass, 0 fail; HEAD igual (node-test.out, node-test-head.out) | 0 |
| C suite unitaria, 24 archivos de a uno (suite-cur/summary.txt) | 22 archivos OK, 0 skips; fallan 2, los dos de sldb serve | ver abajo |
| D otros 14 e2e de a uno (e2e-cur/summary.txt) | 10 OK; 4 con fallos, ver abajo | ver abajo |
| E navegador (ui/, api/) | 3 de 5 pantallas dibujan; documents-map y documents-flow no dibujan, igual que en HEAD | ver abajo |

## Fallos clasificados

Las listas de pruebas fallidas se compararon contra la copia de HEAD (head/, head-retry/).

| Archivo | Con el diff | En HEAD | Clasificación |
|---|---|---|---|
| tests/test_desk_ui_routes.py | 5 failed / 8 passed (4× TimeoutError, sldb serve), maxrss 2.4 GB | los mismos 5 fallan, maxrss 2.9 GB | preexistente (sldb serve, hallazgo conocido) |
| tests/test_mindmap_deskops.py | 4 failed / 3 passed (4× TimeoutError), maxrss 2.7 GB | 1ª corrida: OOM-kill por el tope de 3G (rc 143). Reintento: los mismos 4 fallan, maxrss 2.78 GB | preexistente (sldb serve) |
| tests/e2e_desk_ui.py | 6 failed | los mismos 6 fallan | preexistente. Además, otra sesión editaba tests/e2e_desk_ui.py, frontends/desk/board.js y styles.css mientras yo probaba. Esos archivos no son del IR13 |
| tests/e2e_mindmap_deskops.py | 1 failed (`test_workflow_board_context_filters_advance_and_real_empty_error`) | el mismo falla | preexistente (sldb serve) |
| tests/e2e_mindmap_document_dialog.py | 1 failed: no aparece `.document-node` en 15 s | el mismo falla | preexistente: es el mismo error de JS de documents-map (ver E) |
| tests/e2e_mindmap_workspace.py | 1ª corrida: rc 137. A las 11:38, con las mediciones de navegador en paralelo, systemd-oomd mató el scope por presión de memoria del sistema | HEAD: 19 passed | **entorno**. Reintento con el diff: **19 passed**, rc 0, maxrss 0.6 GB |

## E: navegador headless (Chromium 1255 vía Playwright)

Script: ui_timing.py (el del tester r2, recortado a las 5 pantallas pedidas); el servidor lo levanta y lo para ui-run.sh.
Cada pantalla se cargó 3 veces en un contexto nuevo cada vez.
Los ms van desde `goto` hasta que el selector de contenido es visible, más 2 rAF.

### Store real del repo (.sldb de graph_ui), sin scope

| pantalla | diff: corridas ms | diff: dibuja | HEAD: corridas ms | HEAD: dibuja | errores consola | 5xx |
|---|---|---|---|---|---|---|
| documents-map | 60015 / 60028 / 60112 (timeout) | NO | 60061 / 60033 / 60029 | NO | 2 en ambos | 0 |
| documents-flow | 60038 / 60018 / 60022 (timeout) | NO | 60016 / 60022 / 60017 | NO | 2 en ambos | 0 |
| draft-tree | 1428 / 1358 / 1389 | sí | 1458 / 1404 / 1407 | sí | 0 | 0 |
| models-diagram | 44240 / 12197 / 14869 | sí | 42410 / 11835 / 11064 | sí | 0 | 0 |
| specs-notation | 1547 / 1377 / 1587 (estado vacío) | sí | 1381 / 1389 / 1390 | sí | 0 | 0 |

- **documents-map y documents-flow no dibujan, ni con el diff ni en HEAD: es preexistente.** El error es `TypeError: Cannot read properties of undefined (reading 'has') at isReferenceField (source/graph.mjs:83)`, que `relationships()` llama en graph.mjs:89.
  - `maps.references[modelName]` es `undefined` para algún modelo del store real, y la página queda en blanco.
  - source/graph.mjs no está en el diff.
  - Este es el error que dejó abierto el tester a1, y es la misma causa de e2e_mindmap_document_dialog.
- Store real, specs-notation: no hay specs, así que se ve el estado vacío.
  - Con el diff dice «Sincroniza uno con `sldb notations sync --spec spec.yml --store .sldb`», sin mencionar spec2viz.
  - En HEAD dice «Este store no tiene specs de spec2viz».
- RSS máximo del servidor: 384 MB (VmHWM 419 MB) con el diff y 411 MB (VmHWM 438 MB) en HEAD.
- Mis corridas no escribieron nada en el .sldb del repo: el log no tiene POST y no hay archivos de .sldb más nuevos que la marca.

### Copia del store en /dev/shm con los 10 pilotos sincronizados (`sldb notations sync --spec ×10`, exit 0), servidor bajo `systemd-run MemoryMax=3G`

| pantalla | diff: corridas ms | HEAD: corridas ms | dibuja (diff / HEAD) |
|---|---|---|---|
| documents-map | 60026 / 60011 / 60011 | 60019 / 60011 / 60010 | NO / NO (mismo error de graph.mjs) |
| documents-flow | 60013 / 60012 / 60021 | 60014 / 60058 / 60026 | NO / NO |
| draft-tree | 1913 / 1453 / 1594 | 3080 / 2619 / 2984 | sí / sí |
| models-diagram | 37297 / 11482 / 12250 | 53008 / 19269 / 22423 | sí / sí |
| specs-notation | 11588 / 12200 / 11671 (9 glifos) | 19929 / 23359 / 17128 | sí / sí |

- Errores de consola: 0, salvo en documents-map y documents-flow. HTTP 5xx: 0 en todas.
- RSS máximo del servidor bajo el tope de 3G: 448 MB (VmHWM 475 MB) con el diff y 388 MB (VmHWM 404 MB) en HEAD. Recorriendo los pilotos uno por uno: 469 MB (VmHWM 482 MB).
- Estas corridas compartieron la máquina con la suite, así que los tiempos absolutos llevan ruido. Aun así, el diff no es más lento que HEAD en ninguna pantalla.

Pilotos uno por uno (modo `pilots`, ui/pilots-diff-scope/):
- Los 10 pilotos sincronizados dibujan con el diff, en 10 a 23 s. La matriz se dibuja como grilla y las secuencias con carriles.
- El catálogo además lista 18 specs del store enlazado de deskops (spec-01 a spec-14 y 09a, state.diagram-type-lifecycle, sequence.build-pipeline). Para esos, `/api/notation/view` responde 404 «SpecDoc:… is not in the store», así que no dibujan.
- Lo comparé por API, con curl contra el mismo store copiado (api/diff/results.txt y api/head/results.txt). HEAD da los mismos 404 y los mismos 200 con la misma carga útil, y cada respuesta tarda unos ms.
- Es decir, es preexistente: el catálogo muestra specs de los stores enlazados que resolve_view no ve.

## Observaciones

- El comando de specir del contrato, tal cual, sale con rc 2: exige `--path` para todo el inventario. Con las 5 rutas, graph_ui tiene 0 dependencias. El gate global sigue en rc 1 por IR, deskops, el store de spec2viz y sldb.
- `sldb notations sync` de los 10 pilotos sobre una copia del store real tardó cerca de 9 min y llegó a 1.3 GB de RSS. Sin embargo, `/api/notation/view` responde en ms; la lentitud de la vista specs, unos 11 s, viene de otras llamadas, y en HEAD es igual o peor.
- Otra sesión modificó frontends/desk/board.js, frontends/desk/styles.css y tests/e2e_desk_ui.py mientras yo probaba (git-status-post.txt frente a git-status-pre.txt). Los archivos del IR13 no cambiaron.
- No hice commit, add, stash ni checkout. No toqué desk/ ni el .sldb del repo.
- Limpieza:
  - Borré de /dev/shm todo lo mío: venvs, copias, chromium y basetemps.
  - Todos los servidores de navegador y de API se mataron por PID y comprobé que no quedó ninguno vivo.
  - Los pytest corrieron en scopes de systemd que terminan con su comando.

TESTER PASS: IR13 cumple el contrato sin spec2viz instalado: V1 20 passed y V2 21 passed (0 skips), grep vacío, specir con 0 dependencias de graph_ui y test_ci_workflow 6 passed. Ningún fallo de la suite, de los e2e ni del navegador lo causa el diff (todos se repiten en HEAD o son de entorno). Informe: /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui/runs/subagents/20261116-ir13-tester-a2/result-summary.md
