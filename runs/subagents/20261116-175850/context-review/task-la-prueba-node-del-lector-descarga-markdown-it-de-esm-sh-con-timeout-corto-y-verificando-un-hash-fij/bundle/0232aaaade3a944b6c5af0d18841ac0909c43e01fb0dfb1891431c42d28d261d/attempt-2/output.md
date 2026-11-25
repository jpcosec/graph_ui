## REFORMULACION

Nodo ejecutable individual (`task.code`), no agregado. Propósito: que la prueba del job mindmap que depende de red falle rápido y verifique integridad. Resultado: en `tests/mindmap-workspace-reader.test.mjs`, el hook de `load` usa `fetch(url,{signal: AbortSignal.timeout(20000)})` y compara el sha256 del texto de cada URL de esm.sh contra `EXPECTED_SHA256`, con mensajes que nombran URL y causa, más un comentario de regeneración. Repo: graph_ui (`/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`). Límites: solo ese test; nada de vendorizar, import map, producción, `ci.yml` ni otras pruebas; sin mocks (pill).

## AMBIGUEDADES

1. "con un console.error temporal en load() que imprima cada URL y su sha256; con eso se escribe EXPECTED_SHA256" choca con "una URL https que no está en la tabla hace fallar la prueba": no se dice cómo corre la pasada de descubrimiento sin tabla poblada; obliga a inventar un modo de verificación desactivado.
2. "con la constante MD_URL reemplazada por https://127.0.0.1:<puerto>" no advierte que el test existente asserta `MD_URL === 'https://esm.sh/markdown-it@14.1.0'`; obliga a inventar si se altera también esa aserción, o el caso (c) falla por aserción y no por timeout.
3. "un error de timeout se relanza como Error('GET <url> -> timeout 20 s')" no dice cómo separar `TimeoutError` de otros rechazos (DNS, red caída); obliga a inventar la clasificación.
4. "un hash de la tabla alterado" (caso b) no indica cuál entrada ni valor sustituto; obliga a elegir entrada y valor, y a decidir si esa copia conserva la aserción del import map.
5. "falla en menos de 30 s" frente a "timeout de 20 s": no se define si el presupuesto es por petición o del proceso completo (arranque incluido).

## DRY-RUN

Lecturas: TaskDoc, rituales execution/testing/closeout, pill, `frontends/mindmap/index.html` (import map), `reader.mjs`, el test. Cambios previstos: únicamente el test — `EXPECTED_SHA256`, timeout y relanzado en `HTTPS_HOOKS`, comentario de regeneración. Dependencias: red a esm.sh en la corrida de descubrimiento, node v22 (`node:test`, `node:crypto`, `AbortSignal.timeout`), puerto libre y `/dev/shm` escribible para (b)/(c), existencia de `tests/mindmap-workspace.test.mjs`. Validaciones futuras: los dos comandos de Validation y `case-red.log`/`case-hash.log`/`case-colgado.log` con comando, salida, exit code y duración, en el run_dir.

## FUTURO

Otro nodo captura los hashes reales en corrida con red; el tester valida la evidencia; el humano/closeout decide commit atómico y reconciliación del Board; cualquier decisión de vendorizar o de mantener la dependencia de red queda fuera.
