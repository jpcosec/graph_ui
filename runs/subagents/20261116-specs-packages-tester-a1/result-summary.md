# Tester intento 1: paquetes UML como contenedores en la vista Specs

**Veredicto: PASS**

Qué se probó: el árbol de trabajo sin commitear sobre HEAD 0e666e7. Hay 3 archivos modificados en `frontends/mindmap/views/specs/notation/` (notation-style.mjs, notation-view.js y notation.css), además de tests/e2e_notation_class.py. Hay 2 archivos nuevos: tests/notation-packages.test.mjs y tests/fixtures/notation-packages/class.packages.yml. No hay cambios en desk/ ni en .sldb/.

## Entorno
- El venv es `/dev/shm/venv-pkg-t1` (Python 3.12). Tiene instalados en modo editable `../../sldb`, `../../pron`, `../../deskops` y `-e ".[test]"`. Chromium está en `PLAYWRIGHT_BROWSERS_PATH=/dev/shm/pw-pkg-t1`. El venv va en `PATH` para que los tests encuentren el CLI `sldb`. El checkout de `../../sldb` está en e138ff19 y su origin/main es d118e53a.
- **Copia de HEAD:** se armó con `git archive HEAD | tar -x -C /dev/shm/pkg-t1-head`, más SOLO e2e_notation_class.py, notation-packages.test.mjs y el fixture del árbol de trabajo. Usa el mismo venv. `_serve` lanza `ROOT/frontends/mindmap/serve.py` desde el archivo del test, así que la copia sirve su propio frontend y no hizo falta PYTHONPATH. El `diff -rq` de `frontends/` contra el árbol de trabajo solo muestra los 3 archivos del cambio.
- Cada pytest corrió con `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm <venv>/bin/python -m pytest <archivo> -q -rs -p no:cacheprovider --basetemp=/dev/shm/pkg-t1-bt`, sin -n. Antes de cada paso la memoria disponible estuvo entre 18 y 20 GB.

## Comandos
| comando | resultado | exit | tiempo |
|---|---|---|---|
| `pytest -q -rs tests/e2e_notation_class.py` (árbol de trabajo) | 4 passed, 0 skipped | 0 | 52.1 s |
| `node --test tests/*.test.mjs` (árbol de trabajo) | 161 pass, 0 fail, 0 skipped | 0 | 4.8 s |
| `pytest tests/e2e_notation_legibility.py` | 3 passed | 0 | 49.7 s |
| `pytest tests/e2e_mindmap_notation.py` | 2 passed | 0 | 26.7 s |
| `pytest tests/e2e_notation_deployment.py` (el ejecutor no lo corrió) | 3 passed | 0 | 40.9 s |
| copia de HEAD: `pytest tests/e2e_notation_class.py -k packages` | 1 failed: `assert first >= folder["bodyTop"] - 0.5` en core (448.9 >= 466.1 - 0.5) | 1 | 11.1 s |
| copia de HEAD: e2e sin el bloque de geometría de la carpeta, solo (a)-(e) del contrato (`e2e_contract_only.py`) | 1 passed | 0 | ~11 s |
| copia de HEAD: `node --test tests/notation-packages.test.mjs` | SyntaxError: no existe el export `containerOutline` | 1 | — |
| mutante `containerOutline` que devuelve null: node test | test 3 (containerOutline) not ok; 2 pass, 1 fail | 1 | — |
| mutante con `containerOutline` borrado: node test | SyntaxError del import; 0 pass, 1 fail | 1 | — |
| mutante `containerOutline` que devuelve null: e2e packages | falla en `first >= folder["bodyTop"]` | 1 | 10.8 s |
| hash del fixture (ver punto 4) | los tres hashes coinciden | 0 | — |
| navegador sobre una copia del .sldb del repo + `sldb notations sync --spec class.packages.yml` | sync rc 0; 3 cargas sin errores | 0 | ver Tiempos |

Logs en este directorio: wt-*.log, head-*.log, mut-*.log, fixture-hash.txt, resolved-fills.txt, real-sync.log, real-serve.log, browser-verify.json y packages.png.

## Los 5 puntos
1. **Criterio extra de G2 y la línea base que da el ejecutor.**
   - (a) **El criterio está dentro del Goal.** El Goal pide "forma package (carpeta con pestaña UML y su título)". El Scope dice textualmente que lo que falta es "que un glifo package que además es contenedor dibuje ese contorno alrededor de toda la caja del contenedor, con el título en la pestaña o en una cabecera bajo la pestaña". Las aserciones nuevas miden justo eso: la carpeta envuelve la caja (±2 px), la pestaña sobresale, el título va en la pestaña o bajo ella, y los hijos empiezan en el cuerpo. Con (a)-(e) tal cual, el Goal no quedaba verificado.
   - (b) **La línea base es cierta.** En la copia de HEAD, el e2e con solo (a)-(e) pasa (rc 0). El e2e endurecido falla en core con los mismos números que da el ejecutor: 448.9 contra 466.1. Es decir, el cuerpo de la carpeta estirada empieza unos 17 px por debajo del primer hijo. El node test falla en HEAD porque `containerOutline` no existe.
2. **(a)-(e) con aserciones reales.**
   - (a) `_inside` compara la caja de cada hijo con la de su paquete, para los 4 paquetes, e incluye core ⊃ billing/identity. Hay además una aserción de que las clases no son contenedores.
   - (b) G2: el borde de abajo de la cabecera y del título queda sobre el primer hijo, el título está visible (`elementFromPoint`) y se mide la geometría de la carpeta.
   - (c) R13: `WHOLE_IN_WINDOW` no usa margen (±0.5 px) y cubre nodos, aristas y rótulos.
   - (d) `MIN_TEXT` exige al menos 10 px, calculado como fontSize × zoom.
   - (e) El fill no es tautológico.
     - El valor esperado sale de la vista que resuelve sldb (`source.fill == "spec"`) y se compara con el fill computado del `path` del contorno en el DOM.
     - Para billing también se compara con el literal light del fixture, `#fff1c2`.
     - Para identity, `sldb notations view` resuelve de verdad a `{"light": "#dbebf4", "dark": "#092c42"}` (resolved-fills.txt). El e2e no fija el literal `#dbebf4`: depende de lo que resuelva sldb. Es aceptable, porque la fuente de verdad es sldb.
     - Las clases de adentro no tienen ese fill, ni en el fondo ni en el contorno.
     - Que core y shared no tengan fill lo cubre el node test, no el e2e.
3. **Sin data.packages no cambia nada.** Los 3 e2e de clase existentes (R9, R10, encuadre), legibility, mindmap_notation y deployment están en verde en el árbol de trabajo. Como no hubo fallos, no hizo falta compararlos con HEAD. En el código, `containerOutline` devuelve null salvo para `shape === 'package'` con cabecera, y el CSS nuevo solo aplica a `.glyph.shape-package.is-container`. Ninguna de las dos líneas nuevas de notation.css lleva colores hex.
4. **Fixture idéntico a sldb.** sldb origin/main da e6b4535a1162fe42b36f6c84547d93163f36509a. El fixture del repo da e6b4535a1162fe42b36f6c84547d93163f36509a. El worktree de sldb da el mismo valor.
5. **La prueba node es real.** Con `containerOutline` devolviendo null, falla el test 3. Con la función borrada, falla el import. El e2e también falla con el mutante null.

## Navegador (store real copiado a /dev/shm)
- El sync dio rc 0 con un aviso que viene de antes: `spec-sync/edge-error` porque la relación `has_field` no está inicializada en el store del repo. No tiene que ver con la tarea; el ejecutor ya lo había anotado.
- serve.py corrió bajo systemd-run con MemoryMax=3G (PID 2952722) y se terminó por PID.
- **Tiempos de las 3 cargas:** 3.914 s, 4.051 s y 3.850 s. Cada carga va desde goto en un contexto nuevo hasta que el diagrama del spec queda dibujado, incluido el clic en el catálogo. El ejecutor midió 1.0 a 1.8 s, pero con otro método.
- No hubo errores de consola ni pageerror. Hay 8 nodos y 4 `.is-container-outline`.
- **Captura (packages.png):** cada paquete se ve como carpeta UML, con la pestaña arriba a la izquierda y el título dentro: Core, Billing (amarillo), Identity (azul) y Shared. Billing e Identity están dentro de Core; Payment e Invoice dentro de Billing; User dentro de Identity; AuditLog dentro de Shared. Las clases van en blanco y no se tapa ningún texto.

## Observaciones (no bloquean)
- La arista de dependencia AuditLog → User da un rodeo largo hacia abajo y pasa por encima del borde derecho de Core. No tapa texto. Es ruteo de ELK y queda fuera del alcance; el ejecutor ya lo anotó.
- `tests/notation-packages.test.mjs` necesita el CLI `sldb` en PATH. Sin él falla con un mensaje claro, no hace skip. Es coherente con la regla de no usar mocks.
- Para identity, el e2e no fija el literal `#dbebf4`; aquí se verificó aparte (ver el punto 2).
- El pytest del venv avisa `Unknown config option: asyncio_default_fixture_loop_scope`; no afecta a la prueba.
- Al terminar se borró todo lo de /dev/shm/*pkg-t1*. No se hizo commit ni se tocó git.

TESTER PASS: el cambio cumple (a)-(e) y la forma de carpeta UML del Goal. La línea base que da el ejecutor se reproduce: (a)-(e) solos pasan en HEAD y la geometría de la carpeta falla en HEAD. No hay regresiones en los e2e de clase, legibility, mindmap_notation ni deployment. El fixture es byte a byte igual al de sldb y la prueba node detecta los mutantes. Informe: runs/subagents/20261116-specs-packages-tester-a1/result-summary.md
