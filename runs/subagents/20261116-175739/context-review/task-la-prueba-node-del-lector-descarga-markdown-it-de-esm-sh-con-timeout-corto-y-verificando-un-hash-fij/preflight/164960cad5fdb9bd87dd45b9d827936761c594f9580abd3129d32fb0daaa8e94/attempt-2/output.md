## REFORMULACION

**Propósito:** eliminar la dependencia frágil de internet en la primera prueba del job mindmap: hoy el hook de `load` descarga markdown-it de esm.sh sin timeout ni verificación de integridad.

**Resultado:** `tests/mindmap-workspace-reader.test.mjs` con `fetch(url, {signal: AbortSignal.timeout(20000)})` en `HTTPS_HOOKS`, un objeto `EXPECTED_SHA256` indexado por URL pedida, cálculo de sha256 (node:crypto, UTF-8) y errores que nombran URL y causa; más un comentario de regeneración de la tabla.

**Repo:** graph_ui (`/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`).

**Límites:** solo ese test; no vendorizar, no tocar import map ni producción ni `ci.yml` ni otras pruebas; copias de casos (b)/(c) en `/dev/shm` no se commitean.

## AMBIGUEDADES

1. «Las URLs y sus hashes los obtiene el ejecutor en una corrida con red» — no se entregan hashes; obliga a inventarlos si la corrida con red falla o cambia el contenido remoto.
2. «en HTTPS_HOOKS» / «con la constante MD_URL reemplazada» — el input no reproduce el test; si esos identificadores no existen o difieren, obliga a decidir renombrados o a adaptar la estrategia.
3. «un listener TCP local que acepta y no responde (más esa URL agregada a la tabla)» — no se fija puerto ni implementación; obliga a elegir ambos.
4. «un error de timeout se relanza como Error('GET <url> -> timeout 20 s')» — no distingue timeout de otros fallos (DNS, TLS, HTTP no-200); obliga a decidir si todos comparten mensaje.
5. «guardar la salida de cada uno en el run_dir» — ruta no definida; obliga a inferirla del contexto de ejecución.

## DRY-RUN

**Lecturas:** task file, `tests/mindmap-workspace-reader.test.mjs`, import map en `frontends/mindmap/index.html`, `result-summary.md` y la pill de guardrail.

**Cambios previstos:** señal de timeout y mensaje en `HTTPS_HOOKS`; `EXPECTED_SHA256`; comprobación sha256; comentario de regeneración.

**Dependencias:** red hacia esm.sh, node v22, `node:crypto`; listener TCP local para el caso colgado.

**Validaciones futuras:** `node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs`; `node --test tests/*.test.mjs`; tres casos con log, comando, salida y exit code; duración <30 s en el colgado.

## FUTURO

El ejecutor produce la tabla de hashes y los logs; el entorno aporta la red; un humano o la CI decide aceptar el commit. Nada de esto es ambigüedad del encargo.
