# WS13.2: resultado del Tester independiente, segunda ronda

Mi informe anterior (FAIL por H1) quedó archivado en `renovacion-1/`. Esta ronda repite los ocho puntos sobre los bytes nuevos: `sha256sum -c entregable-executor.sha256` dio OK en los 10 archivos, antes y después de mis ejecuciones. No edité producto ni tests, no hice commits, no toqué el Board. Todo corrió con repos y stores reales bajo `/tmp/ws132t/`, `serve.py` en puertos libres y Chromium real, sin mocks. Scripts y capturas en `tester/scripts/` y `tester/capturas/`.

## Tabla por punto

| # | Punto | Resultado | Evidencia observada |
|---|---|---|---|
| 1 | Permitidos y `roots_invalid` | PASS | Se repitió igual que en la primera ronda: sin variable `[desk, docs]`; con `desk/notas` solo esa; con la lista mixta, `/etc` y `C:\x` ruta_absoluta, `../x`, `desk/notas/..` y `desk/notas/../../docs` contiene_.., `enlaceraiz` symlink; `nope` omitido; coma vacía sin entrada; `''` da roots `[]`. `?root=/etc`, `?path=..`, `?root=fuera&path=../..`, `?roots=`, `?id=`, `?limit=` devuelven una respuesta idéntica a la base (6 de 6). |
| 2 | Exclusiones | PASS | Mismas exclusiones (dir symlink que sale, archivo symlink que escapa, punto, `.env.md`, `__pycache__`, `node_modules`, gitignorados, `.txt`, fuera de permitidos); espacios, unicode y salto de línea íntegros. Symlink interno: `desk/interno.md` ya NO se lista y el destino `docs/faq.md` / `docs/guia.md` sí (en dos repos). Sin git: `sin_git` true. 5100 archivos: `truncado` true, 5000. PATH sin git: `ignorados_error`, 0 no modelados, falla cerrado. |
| 3 | Sin abrir ni mutar | PASS | Audit hook en un proceso real de `serve.py`: el primer GET `/explorer` abre solo 25 `.sldb/core/documents/*.yaml`, 0 `.md`; los GET siguientes sin cambios, 0 aperturas. Hashes de todos los archivos (menos `.git`), git status y HEAD iguales antes y después de cada GET a `/explorer`, `/nodes`, `/source`, `/node`. Con `.sldb` borrado y el servidor vivo: 503 en los cuatro y no se crea nada. El hook también registra aperturas de escritura y `remove/rename/mkdir/rmtree`: 0 durante todo el recorrido de refrescos. El hook no ve llamadas a función: que el listado no llama `open_store` lo concluyo de `grep open_store` (solo aparece en un comentario) y de que `_fresh_listing` usa `new_operation` (invalida cachés en memoria, vi su código). Observación previa: el arranque de `serve.py` crea un `.sldb` mínimo si falta; no es el GET. |
| 4 | Refresco en vivo (H1) | PASS | Con `serve.py` vivo y cachés calientes (explorer, nodes, node y source ya pedidos), por otro proceso: alta de un TaskDoc con `create_task_bundle`, alta de un `Nota` con `create_document`, baja con `delete_document`, `untrack_document` y `track_document_file` sobre un `.md` ya existente. Por JSON, cada cambio se ve en `/explorer.modeled` y `/nodes` en la siguiente llamada; el altas no salen duplicadas como no modelado; el untrack pasa a no modelado y el track vuelve a modelado sin duplicarse; un `.md` nuevo y su baja se reflejan. En Chromium, sin refrescar no aparece; tras pulsar «Refrescar catálogo» (pide `/nodes` y `/explorer`) aparece como modelado y se abre y se lee su fuente; baja, untrack y track se reflejan sin duplicar. Solo GET, 0 pageerror (`capturas/a-alta.png`, `b-untrack.png`, `c-track.png`). Aperturas de archivos prohibidos (`.env.md`, ignorado, symlink que escapa, destino fuera del repo) durante todo el recorrido, incluido `/nodes`: ninguna. |
| 5 | Navegación en Chromium | PASS | Mismo guion que antes: abrir no modelado y modelado desde el explorador sin conocer ID; URL del lector WS13.1 (`path=` y `id=`), un solo `document-reader`, fuente literal, pestañas con `path` intacto y el foco «sección Libre (L1-L5)» sigue; filtro y «Sin coincidencias»; solo GET; 0 pageerror ni errores de consola. Capturas revisadas: nada vacío donde debía haber valor. |
| 6 | Modelo no importable (H2) | PASS | `Diario` (módulo fuera del path) y `Cuaderno` (lanza al importar), junto a modelos sanos. `/nodes` 200, 28 nodos, `modelo_no_carga` con la causa recibida, el resto `ok`; `/explorer` 200; `/source` 200 degradado con texto, secciones y `degraded_reason`. `/node` 200 con `node.is_degraded` true, `context.is_degraded` true y `context.degraded_reason` = «Fallo al validar documento en disco (Failed to import module 'tst_diario'.)» (idem con `boom-en-import-cuaderno`); un TaskDoc sano sigue en false. Efecto colateral declarado: `projections.code` de ese documento queda `ok:false`, `error: "Código no disponible: Fallo al validar documento en disco (…)"`; en Chromium la pestaña Código muestra ese texto (`capturas/e-roto-codigo.png`). Documento corrupto bajo modelo sano: `modelo_no_carga` con la causa YAML, fuente legible; un binario da `binario`/415 sin tumbar el catálogo. Insignia `MODELO_NO_CARGA` visible en el explorador, causa en el `title`. |
| 7 | Aviso de relaciones | PASS | Visible en Grafo y en el contexto para modelados, sin textos de «al día» ni similares. Con un shard de aristas borrado sigue saliendo `store_no_preparado` (alerta y relaciones) junto al aviso, hash igual, solo GET. |
| 8 | Alcance y validación | PASS | `git diff --name-only` sin `shell/api.js`, `persistence.py` ni `frontends/workspace/`; 8090 responde 200 (solo GET). `pytest explorer+reader`: 50 passed. `pytest e2e`: 15 passed. `node --test`: 7 pass, 0 fail. |

## Lo que antes quedó sin ver

- Truncado, `sin_git` e `ignorados_error` en Chromium: el indicador de truncado se ve como banner («Listado truncado en 5000 archivos no modelados: hay más que no se muestran.») con la sección «Markdown sin modelo (5000)»; `sin_git` («Sin repositorio git: no se puede comprobar qué archivos están ignorados.») y el error de ignorados se ven como texto en el panel (`capturas/d-truncado.png`, `d-sin_git.png`, `d-ignorados_error.png`).
- «Deben fallar contra la base»: arranqué los bytes de `HEAD` (`git archive HEAD frontends` en `/tmp/basecopy`, con `PYTHONPATH`) sobre mi repo con modelo no importable: `/explorer` da 404, `/nodes` da 500 («Error al cargar documentos del store: boom-en-import-cuaderno»), y `/source` da `degraded_reason: null`. Con los bytes nuevos: 200, `modelo_no_carga` y causa. Además, `evidencia-base/base_results.log` (del Executor) muestra 15 failed, 3 passed sobre la base; solo leí ese log, no repetí esos tests contra la base.

## Hallazgos

Ninguno abierto. H1, H2 y el symlink interno quedan corregidos. Observaciones menores que siguen:
- `/explorer.modeled[].estado` de un modelo que no carga es `ok` en el JSON; `modelo_no_carga` y la causa los aporta `/nodes`, que la UI combina.
- Una entrada vacía en `WORKSPACE_EXPLORER_ROOTS` no se informa en `roots_invalid`.
- La corrección de H1 depende de funciones internas de sldb (`sldb.store.runtime_cache_signature.new_operation` y `sldb.store.documents_hash.new_operation`), no de API pública documentada; lo señalo, no lo juzgo.

## Qué no verifiqué

- La suite general (`python -m pytest -q tests`, 218 previas): no la corrí, por instrucción.
- Que el listado no migre un store con layout no canónico: no ensayado (sin API pública previa, como en la aceptación de WS13.1); mi evidencia es el código, hashes y el hook sobre un store canónico.
- La prueba de «escrituras» depende de mi audit hook: no vi eventos de escritura, pero el hook no se ejercitó con una escritura positiva conocida.
- Los tests contra la base: solo los tres comportamientos HTTP anteriores, no los tests del Executor.
- G_HUMAN_READ y WS16: fuera de mi alcance.
- Procesos: dejé 0 servidores propios vivos; 8088 y 8092 no son míos, 8090 sigue en pie.

RESULTADO: PASS
