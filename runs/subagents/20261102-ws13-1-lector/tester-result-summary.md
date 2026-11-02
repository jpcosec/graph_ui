# Resultado del Tester independiente: WS13.1 lector

Bytes probados: `sha256sum -c entregable-executor.sha256` dio 7/7 OK antes y después de las pruebas.
Fixture propio en /tmp/t13 (repo git, store sldb real, servidor `frontends/mindmap/serve.py 8123` real; muerto al terminar, 8123 cerrado). 8090 respondió 200 después. Scripts y salidas en `tester/` (build_fixture.py, http_check.py/.out, pw3/pw5/pw6, pw*.out, caps/*.png, pytest.out).

## Tabla por punto de done_when

| Punto | Resultado | Evidencia observada |
|---|---|---|
| Fuente íntegra byte a byte, modelado | PASS | GET /source?id=TaskDoc:task-tarea-a: `text` == bytes del archivo, sha256(texto)==revision (51dc9e72...). En DOM: fuente 61 líneas == archivo, data-revision == sha256 del archivo. |
| Fuente íntegra, no modelado | PASS | guia.md y notes/otro.md: sha256(texto)==revision. Fuente en DOM literal, 0 enlaces `<a>` en la fuente (http_check.out, pw5.out). |
| UTF-8 inválido | PASS | invalido.md: 200, encoding `utf-8-replaced`, sha(texto)!=revision (no se promete identidad), etiqueta UTF-8-REPLACED visible en UI (caps/16-invalido.png). |
| Misma revisión de render y fuente | PASS | Un solo payload con `revision`; en DOM doc-revision y ctx-revision coinciden con la del archivo; igual tras alternar pestañas. |
| `id` y `path` juntos o ausentes = 400 | PASS | ambos, ninguno, `id=` vacío, `path=` vacío: 400 todos. /node?path= : 400. |
| Estados de guardia y códigos | PASS | data.txt y src/a.py no_markdown 415; oculto.md y .env protegido 403; .git/config protegido 403; escape.md (symlink) fuera_del_repo 403; grande.md demasiado_grande 413; d.md directorio 415; bin.md (byte nulo) binario 415; no-existe 404. Las respuestas llevan `{ok:false,error,estado}`. sin_repo_root/error_lectura no se provocaron: no verificado. |
| Path rastreado responde Model:name | PASS | /source?path=desk/tasks/task-tarea-a.md: identity.kind modeled, id TaskDoc:task-tarea-a, path como origen, texto idéntico al de id=. En UI la URL se queda con `path=` (sin redirección) y muestra TaskDoc:task-tarea-a. |
| Traversal `..` y ruta absoluta | PASS | `../fuera.md`, `..%2Ffuera.md`, `%2e%2e/fuera.md`, `notes/../../fuera.md`, `/etc/passwd`: 403 fuera_del_repo. `notes/../guia.md` normaliza dentro del repo y abre (200). |
| Sin mutación en lectura (sha256 .sldb y archivo leído antes/después de cada GET) | PASS | ~35 GET a /source, /node, /nodes: STORE_SAME en todos. También con documento modificado por fuera (ver hallazgo 2). |
| Contexto real | PASS | Modelado: identidad, path, revisión, 2 relaciones salientes (con campos) y 0 entrantes, coherente con el grafo; no modelado: id/modelo/estado "Ausente", relaciones "AUSENTES: documento no modelado", sin inventar. |
| Enlaces: resuelto, roto, ancla, dos puntos, local:, http://, .txt, hacia modelado | PASS | API y DOM: `notes/otro.md` ok, `notes/nada.md` roto (origen guia.md:3 y causa visibles en panel y title), `#Segunda parte` ok con anchor, `deskops:task-x` roto (nombre local literal, sin salto), `local:notes/otro.md` ok, `http://` externo sin href ni petición a example.com (ext_requests vacío, URL sin cambio, 1 sola pestaña), `data.txt` no_markdown con causa, enlace a modelado `id:TaskDoc:task-tarea-b`. |
| Seguir enlace y volver | PASS | clic navega a `path=notes/otro.md`, h2 "Otro"; `go_back` vuelve a guia.md. |
| Ancla -> foco de sección | PASS | `anchor=Segunda parte` abre otro.md con foco "sección Segunda parte (L5-L7)", 3 líneas de fuente marcadas. |
| Abrir modelado desde catálogo | PASS | selector "Seleccionar nodo activo" -> [TaskDoc] Tarea A: URL con id, h1 TaskDoc:task-tarea-a, 1 lector. |
| Abrir no modelado por URL y desde catálogo/enlace | PASS | `?path=guia.md` y por enlace; opción "[sin modelo] guia.md" en el selector. |
| Foco: sección, campo, referencia, arista | PASS | sección Goal (L33-L38, 6 líneas); campo depends_on; referencias files[0] src/a.py:5, files[1] src/b.py, references[0] src/b.py:2 (campo y posición, con `references` aparte de `files`); arista a->b enfoca depends_on e inherits_from en Documento. |
| Foco sobrevive al alternar Document/Graph/Code, misma URL id/path, misma revisión, un lector | PASS | Alternando 3 pestañas: id o path sin cambio (solo cambia `tab=`), data-revision igual, 1 lector en cada pestaña, foco-desc conservado. Modelado y no modelado. Refresco "Actualizar": sigue 1 lector. |
| Arista con varias procedencias sin elegir una | PASS | La arista a->b muestra "campo: depends_on, inherits_from" (dos procedencias en una arista, API: provenance de 2 entradas); al enfocarla, Documento marca ambos campos (Documento: 2). |
| Rango local de Code (clic y Mayúsculas+clic) | PASS | Vista de archivo completo 20 filas: clic L4 -> "L4"; Shift+clic L9 -> "L4-L9", 6 filas in-range; fragmento original conservado; URL sin cambio (no persiste). caps/15-code-rango.png. |
| Graph y Code de no modelado con estado explícito | PASS | "Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos." en ambas; foco de sección conservado (Grafo: sin grafo, Código: sin referencias). caps/08-nomodelado-*.png. |
| Sin texto vacío donde debe haber valor | PASS con reserva | Búsqueda DOM de nodos hoja visibles con texto vacío en las 3 pestañas, modelado y no modelado: solo líneas en blanco de la fuente/código (legítimas). Etiquetas de nodos del grafo y referencias con texto. Reserva: hallazgo 1 (valor transitorio). |
| Sin errores de consola ni pageerror | PASS | pageerror: 0. Consola: 0 en el flujo normal; los únicos `console.error` son "Failed to load resource 403/415/404" al provocar a propósito guardias desde la UI (pw3). |
| Solo GET | PASS | Todas las peticiones registradas (pw3.json, pw5-reqs.json): métodos {GET}; NON-GET vacío. |
| git diff no toca shell/api.js, persistence.py, frontends/workspace/ | PASS | `git status` y `git diff --stat` sobre esas rutas: vacío. Cambiados: workspace_routes.py, workspace-view.js, workspace.css, reader.mjs, tests. |
| 8090 responde | PASS | HTTP 200 al terminar. |
| pytest reader + e2e | PASS | `python -m pytest -q tests/test_mindmap_workspace_reader.py tests/e2e_mindmap_workspace.py`: 28 passed en 129 s (tester/pytest.out). |

## Hallazgos

1. (Menor, UX, no bloqueante) Valores engañosos durante la carga. Reproducción: abrir `/workspace/node?id=TaskDoc:task-tarea-a&tab=document` y leer `.workspace-identity-prop` antes de que llegue /api/workspace/node (visto a los 500 ms): "Estado: Sin estado", "Nodo Actual: Sin nodo", "Content Hash: —", aunque el documento es draft y tiene nodo. A los 3 s se corrigen (draft, ritual-execution, 3c769dc9...). Es un texto de ausencia que afirma algo falso mientras carga. Preexistente en el patrón (HEAD ya usaba 'Sin estado' como respaldo); no probé HEAD.
2. (Observación pedida) Con un documento modificado por fuera (apéndice a task-tarea-b.md), /source y /node reflejan los bytes nuevos (file_revision y revision = sha256 nuevo, texto con la línea añadida, spans recalculados 20-58), sin tocar .sldb (hash agregado igual antes y después). El `content_hash` (SLDB) de /node no es una revisión de archivo: /node no re-escribe el store. No es defecto.
3. (Informativo) Los logs del servidor durante pytest muestran BrokenPipeError y avisos "Template marker ... unknown field 'from_drawer'" al abrir el store; los tests pasaron. No analizados.

No hay FAIL.

## No verificado

- Estados sin_repo_root (503) y error_lectura (500), y ambiguous de doc_status (no hay forma pública sencilla de provocarlos).
- Doc modificado por fuera hacia estado degradado/IR roto.
- Comparación contra HEAD de la apariencia de la UI (hallazgo 1) y la suite completa (el encargo la excluye).
- Foco por clic en etiquetas del Graph de dos documentos distintos tras seguir enlace entre modelados, solo seguí enlaces entre no modelados y hacia modelado en API/DOM (no cliqueé el enlace hacia task-tarea-b).
- Otros navegadores/viewports (solo Chromium 1440x1000); lectura de píxeles limitada a las capturas leídas: 02, 04, 08-Cód, 12, 13, 15, 16.
- Demo 8092 y 8091 no tocadas.

RESULTADO: PASS
