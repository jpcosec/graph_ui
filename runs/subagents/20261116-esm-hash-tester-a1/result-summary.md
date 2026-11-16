# Tester a1: timeout y sha256 en el hook de esm.sh (tests/mindmap-workspace-reader.test.mjs)

Veredicto: **PASS** (hay una observación no bloqueante sobre el comentario de regeneración, en el punto 1)

Entorno: node v22.23.4, rama master de graph_ui, cambio sin commitear. Todas las copias y servidores estuvieron en /dev/shm/esm-t1/. Los servidores se terminaron por su PID y /dev/shm quedó limpio al final.

## 1. Diff
- `git status`/`git diff HEAD --stat`: aparte de runs/, el único archivo modificado es `tests/mindmap-workspace-reader.test.mjs` (+57 −3).
- Contra el Scope:
  - `fetch(url, {signal: AbortSignal.timeout(20000)})` con `TimeoutError`/`AbortError` relanzado como `'GET <url> -> timeout 20 s'`: OK.
  - `EXPECTED_SHA256` usa como clave la URL que recibe `load()`: OK.
  - Una URL https fuera de la tabla lanza `'GET <url> -> sin sha256 esperado en EXPECTED_SHA256'`: OK.
  - El sha256 se calcula con node:crypto sobre el texto UTF-8 y un desajuste da `'GET <url> -> sha256 <got> != <expected>'`: OK.
  - El comentario para regenerar la tabla está: OK.
  - Los errores de DNS, TLS y HTTP distinto de 200 conservan su error, como pide preflight-3: OK.
- Corrección 1 (`UND_ERR_CONNECT_TIMEOUT` → `'GET <url> -> connect timeout'`): **me parece correcta y dentro del Goal**. El Goal pide que "un timeout ... falle con un mensaje que nombra la URL y la causa". Con el escenario exacto del Implementation Path (un listener TCP que acepta y no responde), el connect timeout de undici (10 s) siempre gana al AbortSignal de 20 s. Sin el mapeo, la prueba falla con `TypeError: fetch failed` sin nombrar la URL, y el Done When (c) no se cumpliría. El mensaje es fiel a la causa real. Los demás errores siguen pasando sin tocar.
- **Observación (no bloqueante) sobre el comentario de regeneración:** dice que hay que agregar el `console.error` en `load()` "tras descargar". Pero el `throw` por URL ausente ocurre *antes* del fetch. Si cambia la versión del import map, que es justo el caso que el comentario cubre, aparecen URLs nuevas y la primera falla con "sin sha256 esperado" sin imprimir su hash. Siguiendo el procedimiento al pie de la letra no se puede regenerar la tabla. Hay un rodeo: agregar la URL con un hash falso, y el mensaje de desajuste imprime el hash obtenido. Recomiendo que el comentario diga también "comentar temporalmente el throw de URL ausente".

## 2. Tabla de hashes (descarga independiente; table-verify.txt)
Escribí mi propio script (`fetch` de node, el mismo User-Agent que el hook), que leyó la tabla del archivo y descargó cada URL:
- **15/15 coinciden** (status 200, sin redirección, `bad=0`).
- Instrumenté una copia del test para registrar cada URL que pide `load()`: el conjunto pedido es **idéntico** a las claves de la tabla (`pedidas no en tabla: []`, `en tabla no pedidas: []`).
- Con curl, usando su UA por defecto y `-A node`, obtuve los mismos hashes en las 3 URLs que muestreé. El contenido no depende del UA para estas URLs.
- **Rangos `^`: son 6 entradas en 5 paquetes, no 4.**
  - `entities@^4.4.0`
  - `punycode.js@^2.3.1`
  - `linkify-it@^5.0.0`
  - `mdurl@^2.0.0`
  - `uc.micro@^2.1.0`
  - `uc.micro@^2.0.0`

  Todas llevan `?target=es2022`. Las dos de uc.micro comparten hash.
- **Riesgo de deriva:**
  - Las URLs `^` responden `cache-control: public, max-age=600, stale-while-revalidate=86400` (mdurl, verificado). esm.sh resuelve el rango a la última versión publicada. Si sale, por ejemplo, mdurl 2.1.1 o entities 4.5.1, cambian el stub y la URL concreta que importa, y la prueba falla por sha256 o por URL ausente sin que el repo haya cambiado. El riesgo es real y depende de terceros. Hoy esas dependencias tienen poca actividad, pero no hay garantía.
  - Las URLs versionadas exactas (`markdown-it@14.1.0`, `.../es2022/*.mjs`) responden `max-age=31536000, immutable`. Solo cambiarían si esm.sh recompila con otra versión de su build, lo que también ha pasado históricamente: el riesgo es bajo pero no nulo.
  - La prueba falla limpio y nombra la URL, que es el comportamiento buscado. Lo anoto como costo de mantenimiento.

## 3. Casos del Done When (copias propias en /dev/shm; reader.mjs e index.html apuntados con file:// absolutos)

| Caso | Qué | Resultado | Exit | Duración (proceso) | Log |
|---|---|---|---|---|---|
| (a) | `node --test tests/mindmap-workspace-reader.test.mjs` en el repo | 16/16 pass | 0 | 2,78 s | case-a-red.log |
| (a') | igual, sobre la copia en /dev/shm (para validar las copias) | 16/16 pass | 0 | 3,29 s | case-a-red-copia.log |
| (b) | copia con la entrada `markdown-it@14.1.0/es2022/markdown-it.mjs` alterada (último dígito …558→…559; elegí otra entrada que el ejecutor) | `GET https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs -> sha256 82ffca…e558 != 82ffca…e559` (9 pass, 1 fail) | 1 | 3,84 s | case-b-hash.log |
| (c) TCP | `net.createServer` en 127.0.0.1:44689 que acepta y no responde; MD_URL reemplazada, URL agregada a la tabla y aserción de esm.sh quitada | `GET https://127.0.0.1:44689 -> connect timeout` | 1 | 12,08 s (< 30 s) | case-c-colgado-tcp.log |
| (c) TLS | `tls.createServer` con certificado propio (SAN IP:127.0.0.1, `NODE_EXTRA_CA_CERTS`) que completa el handshake y no responde | `GET https://127.0.0.1:35501 -> timeout 20 s` | 1 | 22,15 s (< 30 s) | case-c-colgado-tls.log |
| (c) cuerpo (extra) | servidor HTTPS que manda cabeceras 200 + 18 de 1000 bytes y se cuelga (el timeout cubre `res.text()`) | `GET https://127.0.0.1:42243 -> timeout 20 s` | 1 | 22,16 s (< 30 s) | case-c-colgado-cuerpo.log |
| (d) | copia sin la entrada `linkify-it@5.0.2/es2022/linkify-it.mjs` | `GET https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs -> sin sha256 esperado en EXPECTED_SHA256` (9 pass, 1 fail) | 1 | 3,70 s | case-d-fuera-de-tabla.log |

Notas:
- En todos los fallos, el runner de node informa el error como "A resource generated asynchronous activity after the test ended ... created the error "Error: GET …"". Es la forma en que node --test reporta un rechazo del top-level await del módulo de prueba. El mensaje del hook aparece completo y el exit es 1.
- Una primera corrida del caso "cuerpo" dio `fetch failed` en 1,7 s. Fue un error de mi arnés: el puerto se leyó vacío antes de que el servidor escribiera, así que la URL era `https://127.0.0.1:`. La repetí con el puerto correcto y el log guardado es el de esa repetición.

## 4. Validación del contrato

| Comando | Resultado | Exit | Duración |
|---|---|---|---|
| `node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs` | 23/23 pass | 0 | 3,9 s |
| `node --test tests/*.test.mjs` (14 archivos) | 158/158 pass | 0 | 3,8 s |
| `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm /dev/shm/venv-esm-t1/bin/python -m pytest -q -p no:cacheprovider tests/test_mindmap_workspace_reader.py` (venv uv: -e ../../sldb ../../pron ../../deskops ".[test]"; sin -n) | 31 passed, 1 warning (PytestConfigWarning asyncio_default_fixture_loop_scope) | 0 | 304 s |

Logs: validation-node.log, validation-pytest.log.

## Archivos
runs/subagents/20261116-esm-hash-tester-a1/{result-summary.md, table-verify.txt, case-a-red.log, case-a-red-copia.log, case-b-hash.log, case-c-colgado-tcp.log, case-c-colgado-tls.log, case-c-colgado-cuerpo.log, case-d-fuera-de-tabla.log, validation-node.log, validation-pytest.log}. No toqué el repo fuera de este run dir, ni desk/ ni .sldb/.

TESTER PASS: (a) 16/16, (b) falla nombrando URL y sha256, (c) TCP connect timeout 12,1 s / TLS timeout 20 s 22,1 s, (d) URL fuera de tabla falla; tabla 15/15 verificada; node 23/23 y 158/158, pytest 31/31. Observación: el comentario de regeneración no funciona tal cual ante URLs nuevas. Informe: runs/subagents/20261116-esm-hash-tester-a1/result-summary.md

## Re-test 2 (tras la Corrección 2 del ejecutor: solo cambia el comentario de regeneración)

Veredicto: **PASS**. La observación del intento 1 queda resuelta.

| Verificación | Resultado | Exit | Duración | Log |
|---|---|---|---|---|
| (1) Solo cambió el comentario | Comparé las líneas +/- del diff sin las líneas `//` con el diff de la Corrección 1 que probé en el intento 1: **idénticas** (53 líneas). El primer hunk pasa de +48 a +51 líneas (el comentario pasó de 7 a 10 líneas); el segundo es el mismo (+22), corrido 3 líneas. La lógica del hook no cambió. | — | — | retest-diff.log |
| (2) Seguir el procedimiento del comentario tal cual | En una copia en /dev/shm quité las **dos entradas de mdurl** (`mdurl@^2.0.0?target=es2022` y `mdurl@2.1.0/es2022/mdurl.mjs`; el ejecutor había usado linkify-it). Hicieron falta 5 corridas: una URL nueva da 'sin sha256 esperado'; la agregué con 64 ceros; el error 'sha256 <obtenido> != 0…0' dio el hash; lo copié. mdurl.mjs apareció recién al cargar el stub, como anticipa el comentario. La quinta corrida pasó 16/16. **Los hashes recuperados coinciden con la tabla:** 0432b261…bdda3 y 487149fd…1627d. | 1,1,1,1,0 | ≈1,7–2,4 s por corrida | retest-regeneracion.log |
| (3) `node --test tests/*.test.mjs` | 158/158 pass | 0 | 2,78 s | retest-validation-node.log |

Nota: el último paso del comentario ("borrar las entradas de URLs que ya no se piden") es manual. Una entrada sobrante no hace fallar la prueba, así que nada avisa de ella. Esto no bloquea.

No repetí pytest porque la lógica es idéntica a la del intento 1 (31/31). /dev/shm/esm-t2 está borrado, no levanté ningún servidor y no hubo commit ni git add.

TESTER PASS: re-test 2. Solo cambió el comentario (la lógica es idéntica a la del intento 1). Seguí el procedimiento de regeneración con las dos entradas de mdurl quitadas: pasa en 5 corridas y recupera hashes iguales a los de la tabla. node --test tests/*.test.mjs da 158/158 con exit 0. Informe: runs/subagents/20261116-esm-hash-tester-a1/result-summary.md
