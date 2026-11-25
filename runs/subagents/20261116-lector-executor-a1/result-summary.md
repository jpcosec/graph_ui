# Ejecutor: lector del workspace con markdown-it (intento 1)

Tarea: task-lector-del-workspace-render-markdown-legible-citas-énfasis-código-inline-enlaces-estándar-con-un-mot
Identidad: deskops-e-98abeab5b1c6 (deskops-executor). No hice commits, add, stash ni checkout. No toqué desk/ ni .sldb/.

## Cambios

- `frontends/mindmap/index.html`: entrada `"markdown-it": "https://esm.sh/markdown-it@14.1.0"` en el import map.
- `frontends/mindmap/views/workspace/node/reader.mjs`:
  - nuevos `MARKDOWN_OPTIONS` (`{html:false, linkify:false}`) y `createMarkdown(MarkdownIt)`;
  - `renderBlocks(text, md)` reescrita sobre `md.parse`. El frontmatter se separa antes de parsear, como hasta ahora. Cada bloque guarda `line_start = map[0]+1+offset` y `line_end = map[1]+offset`. Bloques: heading, paragraph (con `tight` en listas compactas), code, quote (recursivo), list (ordenada o no, items con sus bloques), hr y raw. raw muestra literal la fuente de los bloques sin render propio, por ejemplo las tablas, que quedan fuera de alcance; así no se pierde contenido;
  - nuevas `inlineNodes(children)`, que pasa los tokens inline a nodos de datos (text, softbreak, hardbreak, em, strong, code, std_link, span), e `inlineText(nodes)`.
  - `splitInline` no cambia. reader.mjs sigue sin imports: el motor entra por parámetro, porque tests/test_mindmap_workspace_reader.py lo ejecuta en node sin import map.
- `frontends/mindmap/views/workspace/node/workspace-view.js`: `import MarkdownIt from 'markdown-it'` y `const markdown = createMarkdown(MarkdownIt)`.
  - Nuevo `InlineNodes`: los nodos text van por `InlineText`, así que los [[…]] se resuelven por raw como antes. em pasa a `<em>`, strong a `<strong>` y code a `<code className="workspace-render-code-inline">`. std_link pasa a `<span className="workspace-link-unresolved" data-testid="doc-link" data-status="no_clasificado" title={href}>texto</span>`.
  - Nuevo `RenderedBlock`, recursivo: quote pasa a `<blockquote className="workspace-render-quote">`.
  - `RenderedDocument` usa los dos y mantiene `data-line-start` y el foco por sección.
  - No se usa innerHTML ni dangerouslySetInnerHTML.
- `frontends/mindmap/views/workspace/node/workspace.css`: `.workspace-render-quote` con borde izquierdo de 3px `var(--border)` y sangría, `.workspace-render-code-inline` monoespaciada con fondo `var(--surface-sunken)`, y `ol` en el bloque de márgenes. Solo tokens del skin, sin hex.
- `tests/mindmap-workspace-reader.test.mjs`: 7 pruebas nuevas con el motor real. La URL sale del import map de index.html y se carga desde esm.sh con un hook `module.register` que hace fetch de https; no hay copia local. Cubren el pin y las opciones, line_start/line_end con frontmatter, la cita con em y [[…]], strong, code_inline con [[…]] literal, el enlace estándar, el HTML como texto, [[…]] dentro de em con su estado, [pred:: [[…]]] en una lista y el HTML de bloque como texto.
- `tests/e2e_mindmap_workspace.py`, 3 pruebas nuevas:
  - `test_reader_renders_real_markdown_of_the_repo[README.md|docs/workspace-ui.md]`: servidor real sobre el `.sldb` y el árbol del repo. Comprueba blockquote, code inline, strong y el span no_clasificado con title igual al destino, todo sacado del propio archivo. Comprueba también que no hay `<a>` navegable y que RawSource coincide byte a byte con `read_bytes()`.
  - `test_reader_document_html_is_text_and_sldb_links_keep_state`: el fixture docs/peligro.md lo crea el test en el store temporal. Comprueba que `<script>` e `<img onerror>` se ven como texto y no se ejecutan (`window.__pwned` queda undefined y no hay elementos script ni img). En `<em>` hay un [[…]] ok; en la cita, uno roto; en `<code>`, [[…]] queda literal. El enlace estándar no es navegable y la fuente coincide byte a byte.

## Validación (exit codes)

| Comando | Antes | Después |
|---|---|---|
| `node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs` | rc=0, 16/16 | rc=0, 23/23 |
| `pytest -q -rs tests/test_mindmap_workspace_reader.py` | no corrida aparte | rc=0, 31 passed (393 s) |
| `pytest -q -rs tests/e2e_mindmap_workspace.py` | rc=0, 19 passed (483 s) | rc=0, 22 passed (487 s) |

Cada pytest se corrió con `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm ... -p no:cacheprovider --basetemp=/dev/shm/lector-e1-bt`, sin -n, y con `free -g` antes de cada corrida. Logs: baseline-*.log, after-*.log y validation.log.

La línea base del e2e se corrió sobre una copia `git archive HEAD` en /dev/shm. Mi primer intento sobre el árbol quedó contaminado porque edité durante la corrida; lo aborté parando mi propio scope (log `baseline-e2e-aborted-contaminated.log`). Mientras trabajaba, otro agente commiteó b9aface, que solo toca frontends/desk, así que no afecta la comparación.

`.sldb/` quedó con mtime y tamaño idénticos antes y después del e2e y del serve.py manual.

## Verificación manual (serve.py real, puerto 18731, PID 2039380, MemoryMax=3G; detenido con kill PID)

Cada carga se midió en un contexto de navegador nuevo, desde goto hasta el primer `[data-testid=doc-render] [data-line-start]`. Detalle en timings.json; script en verify_reader.py.

| Pantalla | Cargas (ms) | Errores de consola o página | DOM |
|---|---|---|---|
| /workspace/node?path=README.md | 3507, 2555, 2846 | 0 / 0 | blockquote 1, code inline 36, strong 9, em 0, spans no_clasificado 7, `<a>` 0 |
| /workspace/node?path=docs/workspace-ui.md | 2945, 3032, 2756 | 0 / 0 | blockquote 0, code inline 116, strong 16, em 6, spans no_clasificado 5, `<a>` 0 |

README.md no tiene énfasis simple (`*x*` o `_x_`), así que `em` 0 es correcto; tiene `**…**`, que se ve como `<strong>`. docs/workspace-ui.md no tiene citas.

Capturas: reader.png (README.md abierto en /workspace), reader-render-README.png, reader-render-workspace-ui.png y las del e2e (reader-render-README.md.png y reader-render-docs-workspace-ui.md.png).

Red: esm.sh respondió (HTTP 200). Tanto el navegador como la prueba node cargan markdown-it de esm.sh.

## Desvíos e interpretaciones

1. `renderBlocks(text, md)` recibe el motor por parámetro en vez de importarlo. reader.mjs se ejecuta en node desde tests/test_mindmap_workspace_reader.py, sin import map. La instancia sale del import map en workspace-view.js con `createMarkdown`, que fija `{html:false, linkify:false}`.
2. La prueba node necesita red hacia esm.sh, porque carga el mismo módulo del import map con un hook de carga https dentro del archivo de test. No hay package.json ni copia local.
3. El map de markdown-it en listas incluye la línea en blanco que las cierra: la lista de las líneas 12 y 13 queda con line_end=14. Se sigue la convención del contrato (`line_end = map[1]`) y la prueba lo documenta.
4. Fuera de alcance, pero con alguna salida visible:
   - tablas y otros bloques sin render propio: raw, su fuente literal en `<pre>`;
   - imágenes `![alt](src)`: el mismo span no_clasificado con el alt, sin cargar nada;
   - tachado y otras marcas inline: `<span>` sin estilo;
   - autolinks `<https://…>`: span no_clasificado.
5. Observación previa al cambio, no corregida: en reader.png, el h2 largo del render se corta en el ancho de la columna (button sin wrap).

EXECUTOR DONE: lector con markdown-it 14.1.0 (import map, tokens con htm), cita/énfasis/negrita/código inline/enlace estándar no_clasificado; node 23/23, test_mindmap_workspace_reader 31 passed, e2e 22 passed (base 19).
Archivos tocados:
- frontends/mindmap/index.html
- frontends/mindmap/views/workspace/node/reader.mjs
- frontends/mindmap/views/workspace/node/workspace-view.js
- frontends/mindmap/views/workspace/node/workspace.css
- tests/mindmap-workspace-reader.test.mjs
- tests/e2e_mindmap_workspace.py
- runs/subagents/20261116-lector-executor-a1/ (evidencia)
