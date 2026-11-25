# result-summary: tester r2 de IR13 (deskops-t-f62fd3896e07, intento 1)

Tarea: task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
Cambio probado: working tree sin commitear sobre HEAD c3664af (graph_ui master).

## Veredicto: FAIL (una regresión causada por el diff; arreglarla es trivial)

`tests/test_ci_workflow.py::test_sibling_repos_come_from_git_main_branches_not_releases` falla con el diff y pasa en HEAD.
Comprueba que `.github/requirements-suite.txt` tenga exactamente 4 líneas sin comentar, todas `git+https://github.com/jpcosec/`.
El diff quita la línea de spec2viz (como pide el Scope (3)), así que quedan 3: `AssertionError: assert (3 == 4)`.
Esa prueba está fuera de la lista `files` de la tarea, pero la CI la corre (job mindmap, `pytest tests`), así que el commit dejaría la CI en rojo.
Arreglo: `len(lines) == 3` (y quizá ajustar el nombre o el docstring de la prueba). Lo decide quien implemente.

Todo lo demás del contrato se cumple: V1, V2, grep, specir (0 de graph_ui), pilotos byte a byte y atom.

## Comandos → resultado → exit

| Comando | Resultado | Exit |
|---|---|---|
| `python -c "import spec2viz"` (venv /dev/shm/venv-ir13-r2) | ModuleNotFoundError | 1 (esperado) |
| V1 `pytest -q -rs tests/test_projection_views.py tests/test_mindmap_notation.py tests/test_mindmap_skin.py` | 20 passed, 0 skipped | 0 |
| V2 `pytest -q -rs` de los 8 e2e del contrato | 21 passed, 0 skipped (5 min 05 s) | 0 |
| V3 `! grep -rnE '<patrón del contrato>' frontends tests pyproject.toml .github` | sin salida | grep 1 → `!` 0 |
| V4 `specir retirement check --path graph_ui=../UIs/graph_ui` (tal cual) | `Error: no path given for: deskops, pron, sldb, spec2viz/.sldb` | 2 |
| V4 con las 5 `--path` | 85 dependencias (IR 43, deskops 22, spec2viz/.sldb 19, sldb 1), **0 de graph_ui** (graph_ui solo sale en `audited repos`) | 1 (el gate global sigue abierto por otros repos) |
| Pilotos: `git hash-object` contra los blobs de spec2viz 2a218b1 | 10/10 OK. El README es la línea exacta del Scope. No hay .mmd ni .vega.json | n/a |
| `node --test tests/*.test.mjs` (paso de ci.yml) | 151 pass, 0 fail | 0 |
| `(cd ../../deskops && sldb stores build)`, `sldb stores build` | ok | 0 / 0 |
| `sldb stores build --check` | FAIL «the sources do not rebuild the store»: TaskCodeDoc y ReviewDoc del desk que otras sesiones crearon mientras corría (no es del diff) | 1 |
| Suite no-e2e por archivo (1 proceso, MemoryMax=3G) | 21/24 archivos OK, 0 skips; fallan 3 (ver abajo) | ver tabla |
| e2e fuera del contrato (14 archivos) | **NO CORRIDOS** (tuve que entregar antes) | — |
| Navegador headless (E) | **NO HECHO** (tuve que entregar antes) | — |

## Fallos de la suite no-e2e (suite-cur/summary.txt)

| Archivo | Resultado | Clasificación |
|---|---|---|
| tests/test_ci_workflow.py | 1 failed / 5 passed (`assert 3 == 4`) | **Causado por el diff.** En la copia de HEAD (venv con spec2viz): 6 passed, rc 0 (head-test_ci_workflow.out) |
| tests/test_desk_ui_routes.py | 5 failed / 8 passed, 11 min, maxrss 2.6 GB | Entorno, probable. 4× `TimeoutError: timed out` y 1× `DeskError: sldb serve no respondió`, todo en rutas de desk/deskops que el diff no toca. La comparación con HEAD quedó **cortada** al entregar, así que no está confirmado que sea preexistente |
| tests/test_mindmap_deskops.py | 4 failed / 3 passed, 5.5 min, maxrss 3.06 GB (justo en el tope de 3G) | Entorno, probable. Mismo patrón de timeouts de sldb serve y BrokenPipe, quizá apretado por el tope de memoria. Sin comparación en HEAD |

Corrida inicial con `-n 4`: el coordinador la mató por orden de JP (sldb serve de 2.3 a 4.8 GB cada uno). Su salida está en suite-unit-interrumpida.out y suite-unit.out. Después corrí solo por archivo, como se ordenó.

## C: diff contra el Scope

- Producción, empaquetado, pruebas, textos de la vista: coinciden con el Scope (diff-code.patch). El 501 «spec2viz no está instalado» desaparece. VIEW_MODEL_REF = `sldb.models.notation.view_doc:ViewDoc`.
- Atom (7): ya commiteado en c3664af. Dice `sldb.api.notations` y nombra `sldb/src/sldb/notations/builtin/`.
- Fuera de `files`:
  - README.md y frontends/mindmap/README.md: coherentes. Quitan el extra `.[notation]` (que ya no existe) y `--src` para el clon de spec2viz. Es documentación que si no quedaría falsa.
  - notation.css y notation-deployment.mjs: solo comentarios, en el directorio de la vista, que sí está en el Scope.
  - Archivo que **faltó** tocar: tests/test_ci_workflow.py (la regresión).
  - .sldb/store.yaml, store_index.yaml y ReviewDoc.yaml aparecen modificados por las reviews de deskops (preflight-3), no por el ejecutor.
- `grep -rn spec2viz frontends tests pyproject.toml .github`, sin contar los pilotos: 14 líneas, ninguna es import, llamada ni dependencia.
  - tests/mindmap-notation.test.mjs:2-8 y tests/mindmap-notation-style.test.mjs:1: comentarios de procedencia.
  - tests/fixtures/notation-view-{sequence,fragments,class}.json: datos (rótulos).
  - Cabeceras de tests/fixtures/notation-{activity,style,deployment}/*.yml: fixtures que el Scope dice que no se tocan.
  - Los 8 pilotos contienen «spec2viz» en su contenido, que es lo esperado al ser copia byte a byte.
- Queda en .github/workflows/ci.yml el `--src "$RUNNER_TEMP/suite-src"`: inofensivo, pero ya sin motivo.

## E: navegador

No completado. Preparé el script `ui_timing.py` (modo `synced`) y una copia del árbol con 4 pilotos sincronizados (sync-pilots-copia.txt: class, sequence, state y matrix, exit 0; el .sldb real no recibió SpecDocs). No llegué a medir. La pregunta del tester a1 (documents-map y documents-flow sin dibujar en 60 s) sigue abierta.

## Observaciones de entorno

- `python3 -m venv` falla en la máquina (sin ensurepip / python3.12-venv); usé `uv venv`.
- Chromium 1255 lo instalé en /dev/shm/pw-r2 (en ~/.cache solo había 1248 y 1254).
- `npm ci` en apps/review-workbench dejó node_modules en el repo.
- Otras sesiones escribían en desk/reviews y .sldb de graph_ui mientras probaba (ReviewDoc y TaskCodeDoc de lector, ui-del-desk, ir13 bundle-2).
- La copia de HEAD necesitó un layout /dev/shm/gu-lay/{UIs/graph_ui,deskops→symlink} por `../../deskops/.sldb`. Su `stores build` da rc 1 porque el store.yaml commiteado en HEAD apunta a runs/subagents/*/run.md sin trackear.
- Limpieza: borré venvs, copias, caches y chromium de /dev/shm. Maté mis PIDs de la comparación con HEAD (kill por PID).
