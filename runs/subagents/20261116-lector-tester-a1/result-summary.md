# Tester: lector del workspace con markdown-it (intento 1)

Tarea: task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot
Rol: deskops-tester, intento 1. Solo verifiqué y no toqué código, desk/ ni .sldb/. No hice commit, add, stash, checkout ni worktree.
Objeto: el cambio sin commitear sobre HEAD b777ef3, en estos 6 archivos: index.html, reader.mjs, workspace-view.js, workspace.css, tests/mindmap-workspace-reader.test.mjs y tests/e2e_mindmap_workspace.py.

## Veredicto: PASS

Se cumplen la Validación y el Done When del contrato. El primer e2e completo falló en 1 de 22 tests, en un test del explorador que este cambio no toca (detalle abajo). La segunda pasada completa dio 22/22 y el test aislado pasó 2 de 2 veces. El punto 4 queda como observación, no bloquea.

## Comandos

Todos los pytest se corrieron con `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm <venv>/bin/python -m pytest <archivo> -q -rs -p no:cacheprovider --basetemp=/dev/shm/lector-t1-bt`, sin -n. El script es run-pytest.sh. Antes de cada corrida medí `free -g`, y la memoria disponible siempre estuvo en 8 GB o más; no hubo esperas (memwait.log). La lectura inicial, 7 GB, fue antes de los node --test, que son livianos.

| Comando | Resultado | exit | Log |
|---|---|---|---|
| `node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs` | 23/23 pass, 2,5 s | 0 | node-contract.log |
| `node --test tests/*.test.mjs` (regresión, igual que el job mindmap de la CI) | 158/158 pass | 0 | node-all.log |
| pytest tests/test_mindmap_workspace_reader.py | 31 passed, 262 s | 0 | pytest-reader.log |
| pytest tests/e2e_mindmap_workspace.py, 1.ª pasada | 21 passed, 1 failed, 554 s | 1 | pytest-e2e.log |
| pytest del test que falló, aislado, 2 veces | 1 passed y 1 passed | 0 y 0 | pytest-e2e-explorer-rerun{1,2}.log |
| pytest tests/e2e_mindmap_workspace.py, 2.ª pasada completa | 22 passed, 506 s | 0 | pytest-e2e-rerun.log |
| pytest tests/e2e_mindmap_workspace.py sobre la copia de HEAD (`git archive HEAD`) | 19 passed, 427 s | 0 | pytest-e2e-HEAD.log |
| pytest tests/test_mindmap_workspace.py (regresión) | 17 passed | 0 | pytest-workspace.log |
| pytest tests/test_mindmap_workspace_explorer.py (regresión) | 40 passed | 0 | pytest-explorer.log |
| node --test del reader con el proxy inválido `NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9` (sin red) | 9 pass, 1 fail con "fetch failed", 0,34 s | 1 | node-sin-red-proxy-invalido.log |
| node --test del reader con un proxy que acepta la conexión y nunca responde (red colgada) | 9 pass, 1 fail con "fetch failed", 5 min 2 s | 1 | node-red-colgada.log |

El fallo de la 1.ª pasada fue `test_explorer_does_not_claim_model_loaded_while_nodes_is_held_then_updates`. Tras liberar la ruta retenida de /api/workspace/nodes, `data-estado` siguió en `modelo_sin_confirmar` más allá del timeout de 5 s del expect. Es lógica del explorador, que este cambio no modifica. Ocurrió con 11 GB disponibles y otros agentes en la máquina. Lo leo como sensibilidad del test a la carga y no como una regresión: pasó 2 de 2 veces aislado y en la pasada completa siguiente (22/22), y en HEAD pasa. Lo dejo como observación.

## Navegador sobre el store real del repo

Levanté `frontends/mindmap/serve.py 18741` bajo systemd-run con MemoryMax=3G y DESKOPS_ROOT apuntando al repo; PID 2157396, detenido con kill PID. Cada carga usa un contexto nuevo y se mide desde goto hasta el primer `[data-testid=doc-render] [data-line-start]`. Script: verify_browser.py. Resultado: browser-real.json.

| Pantalla | Cargas (ms) | Consola / pageerror / requestfailed | DOM |
|---|---|---|---|
| /workspace/node?path=README.md | 4148, 2504, 2823 | 0 / 0 / 0 | blockquote 1, code inline 36, strong 9, em 0 (el archivo no tiene `*x*` ni `_x_`), no_clasificado 7, `<a>` 0, script/img/iframe 0; 6 headings, 6 con botón de foco |
| /workspace/node?path=docs/workspace-ui.md | 2716, 2809, 2680 | 0 / 0 / 0 | blockquote 0 (el archivo no tiene citas), code inline 116, strong 16, em 6, no_clasificado 5, `<a>` 0; 5 headings, 5 con botón |

En los dos archivos, RawSource coincide byte a byte con el archivo. Capturas: tester-README.md.png (/workspace con README.md abierto), tester-render-README.md.png, tester-docs-workspace-ui.md.png y tester-render-docs-workspace-ui.md.png.

`.sldb/` del repo: guardé la lista de 420 entradas con tamaño y mtime antes de todo, después del serve.py real y al final, y las tres son idénticas (sldb-before.tsv, sldb-after-serve.tsv, sldb-after.tsv; sldb-diff.txt está vacío).

## Punto 1: seguridad

- Revisión estática: en index.html, reader.mjs y workspace-view.js no hay innerHTML, dangerouslySetInnerHTML, insertAdjacentHTML, outerHTML ni document.write. El único resultado de la búsqueda es el comentario "Nunca innerHTML". El motor se instancia con `{html:false, linkify:false}` congelado en `MARKDOWN_OPTIONS`, y la prueba node verifica las opciones.
- Prueba propia con hostil.md en una copia del store en /dev/shm. Copié .sldb de graph_ui y de deskops; serve.py corrió en el puerto 18742 con SLDB_STORE y DESKOPS_ROOT apuntando a la copia, y lo detuve con kill PID. El documento lleva `<script>` de bloque, `<img onerror>` de bloque e inline, `<b onmouseover>`, `[js](javascript:…)`, `[data](data:text/html,<script>…)`, `[vb](vbscript:…)`, `<https://…>`, `<javascript:alert(1)>`, `<a@b.co>`, `![img](javascript:…)`, una referencia `[x][ref]` a javascript:, y `[[…]]` dentro de em, strong, cita y code. Resultado (browser-hostil.json):
  - script, img, b e iframe: 0 elementos. 0 elementos con atributos on*. `window.__pwned` quedó undefined, incluso después de hover y clic sobre todos los spans y el texto HTML. 0 diálogos, 0 errores, sin peticiones a example.com y la URL no cambió.
  - Todo el HTML se ve literal como texto.
  - Los enlaces javascript:, data: y vbscript:, la imagen con src javascript: y la referencia a javascript: los rechaza el validateLink de markdown-it, así que quedan como texto literal y ni siquiera llegan a span.
  - Los autolinks `<https://example.com/auto>` y `<a@b.co>` llegan como `<span data-status="no_clasificado">` con title igual al destino (mailto:a@b.co en el segundo).
  - Hay 2 `<a>` en el DOM y los dos son enlaces SLDB ok con `href="#"`, el mismo comportamiento que en HEAD. No hay ningún `a[href]` navegable.

## Punto 2: enlaces estándar y [[…]]

- Los enlaces estándar siempre son `<span class="workspace-link-unresolved" data-testid="doc-link" data-status="no_clasificado" title=destino>`. No hay `<a>` navegable en README, docs/workspace-ui.md ni hostil.md.
- `[[README.md]]` dentro de `<em>` queda como `a.workspace-doc-link[data-status=ok]`.
- `[[no-existe.md]]` dentro de `<strong>` y `[[roto.md]]` dentro de `<blockquote>` quedan con `data-status=roto`.
- `_[[README.md]]_` dentro de la cita queda ok.
- `` `code [[README.md]]` `` queda literal: 0 doc-link dentro del code.

## Punto 3: data-line-start y foco por sección

- Sonda node (probe-lines.mjs) sobre README.md, docs/workspace-ui.md y el propio .md de la tarea, que tiene 35 líneas de frontmatter:
  - 0 bloques con una marca que no corresponde a la línea real del archivo;
  - 0 líneas no vacías de nivel superior fuera de algún bloque.
  - Headings: en README, las líneas [1,11,38,66,77,87], las mismas que da `grep -n '^#'`. En docs/workspace-ui.md, el frontmatter ocupa [1,5] y los headings [7,31,56,67,75]. Las líneas 19 y 22 empiezan con `#` pero están dentro de un fence, así que se excluyen bien.
- En el navegador, cada `[data-line-start]` cae en la línea real con la marca de su tipo: 0 discrepancias en 86 elementos de docs/workspace-ui.md. En README, 1 de 32 elementos aparece como "falso", pero es un defecto de mi script: le quité los `_` a la línea al comparar `graph_ui`. La línea 1 es en efecto `# graph_ui …`.
- Las secciones del backend empiezan todas en una línea `#` del archivo, y todos los headings tienen botón de foco, porque `line_start` del render y el del backend coinciden también con el desplazamiento por frontmatter.
- Probé el clic de foco en 3 secciones por archivo, entre ellas "Vistas" (38–65), "Identidades retiradas" (87–95), "2. Seguridad" (56–66) y "4. Pruebas" (75–84). Los bloques resaltados son exactamente los de nivel superior dentro del rango.

## Punto 4: la prueba node descarga markdown-it de esm.sh. Observación, no bloqueante

- La versión está fijada. La prueba lee la URL del propio import map, así que es idéntica por construcción, y además afirma `MD_URL === 'https://esm.sh/markdown-it@14.1.0'`. El import map tiene `"markdown-it":"https://esm.sh/markdown-it@14.1.0"`.
- Sin red falla limpio: rc=1 en 0,34 s. Siguen pasando los 9 tests previos del archivo, y el archivo entero sale como `not ok` con "fetch failed". El mensaje confunde un poco: el runner dice "asynchronous activity after the test ended" y los 7 tests nuevos ni se registran. Aun así, es un fallo duro y no un pase falso.
- Con la red colgada, es decir, un proxy que acepta la conexión TCP y nunca responde, no se cuelga para siempre: el fetch de undici se corta por su timeout por defecto, de unos 300 s, y el archivo falla con rc=1 a los 5 min 2 s. `node --test` no tiene timeout por archivo, y el `load` del hook usa `fetch` sin AbortSignal. En el peor caso, el job mindmap se alarga unos 5 minutos antes de fallar.
- Es la primera prueba del job mindmap (`node --test tests/*.test.mjs`) que necesita red externa. Las demás .test.mjs no usan red. El job e2e ya dependía de esm.sh desde el navegador. La CI de GitHub tiene salida a internet, así que en condiciones normales pasa. El riesgo real es una caída o lentitud de esm.sh: haría fallar el job mindmap, que hasta ahora era independiente de la red. Además, el contenido servido por esm.sh no tiene hash de integridad.
- Recomendación, para el coordinador y no para esta tarea: un `AbortSignal.timeout(30000)` en el fetch del hook, o una copia local verificada por hash. No es bloqueante, porque no deja la CI colgada ni da pases falsos.

## Punto 5: desvíos que declara el ejecutor

1. Que `renderBlocks(text, md)` reciba el motor por parámetro no contradice el contrato. El contrato pide markdown-it 14.1.0 del import map, instanciado con `{html:false, linkify:false}`, y que renderBlocks use `md.parse`. Eso se cumple: la instancia sale del import map en workspace-view.js vía `createMarkdown`. reader.mjs queda sin imports y sigue siendo ejecutable en node.
2. Que `line_end` de una lista incluya la línea en blanco que la cierra es la aplicación literal de `line_end = map[1]` del contrato. No rompe el foco: la línea en blanco es anterior al siguiente heading, y el foco de "Vistas" (38–65) y de las demás secciones resalta exactamente sus bloques.

## Observaciones

- **Tablas.** Las tablas, como la de "Documentación" en README, salen como `<pre>` raw con su fuente literal. Está fuera de alcance según el contrato y no se pierde contenido. Los enlaces e inline code dentro de la tabla quedan literales.
- **Enlace dentro de un heading.** Si el heading tiene sección, sus nodos inline van dentro del `<button>` de foco. Un `[[…]]` en un heading quedaría como `<a>` dentro de `<button>`, que es contenido interactivo anidado: el clic dispara el foco y además abre el enlace. Ningún heading de los archivos probados tiene `[[…]]`. Es menor.
- **Captura de README.** El h2 largo aparece cortado arriba en la columna de render. El ejecutor ya lo observó; es previo al cambio.
- **Test del explorador.** `test_explorer_does_not_claim_model_loaded_while_nodes_is_held_then_updates` puede fallar bajo carga, porque espera solo 5 s a que la respuesta real de /nodes actualice el estado. No tiene relación con este cambio.
- **Informe del ejecutor.** Las cifras del ejecutor (23/23, 31 passed, 22 passed, los conteos del DOM) coinciden con las mías. Los tiempos de carga son del mismo orden: 2,5 a 4,1 s.

## Limpieza

- Los serve.py 2157396 (store real) y el de la copia (puerto 18742) están detenidos con kill PID. El listener de la simulación de red colgada también está detenido. No usé pkill, pgrep ni killall.
- Borré de /dev/shm todo lo mío: venv-lector-t1, pw-lector-t1, lector-t1-copy, lector-t1-head, lector-t1-bt y lector-t1-bt-head.

TESTER PASS: lector con markdown-it 14.1.0. node 23/23 (regresión 158/158), test_mindmap_workspace_reader 31 passed, e2e 22 passed (1.ª pasada 21/22, con un fallo del explorador que pasó al repetirlo aislado y en la pasada completa siguiente; HEAD 19/19), workspace 17 y explorer 40 passed. Sin HTML inyectado, sin `<a>` navegables, líneas y foco correctos, `.sldb` intacto. Punto 4 como observación: falla limpio sin red y tarda hasta unos 5 min con la red colgada.
Informe: runs/subagents/20261116-lector-tester-a1/result-summary.md
