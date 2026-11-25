## REFORMULACION
Propósito: eliminar del job mindmap la primera prueba CI que depende de internet sin timeout ni integridad. Resultado: en `tests/mindmap-workspace-reader.test.mjs`, el hook `load` usa `fetch(url, {signal: AbortSignal.timeout(20000)})`, registra/verifica un sha256 fijado para cada módulo de esm.sh (`markdown-it@14.1.0` y dependencias relativas) y falla nombrando URL y causa ante timeout o hash distinto; incluye comentario de regeneración. Repo: `SLDB_1/UIs/graph_ui`; superficies: ese test y, como lectura, `frontends/mindmap/index.html`. Límites: no vendorizar, no cambiar import map/código de producción/CI ni otras pruebas.

## AMBIGUEDADES
1. “sus dependencias relativas de esm.sh; la lista sale de registrar las URLs en una corrida con red”: no se entrega la lista ni hashes; obliga a inventar el cierre exacto de dependencias y asumir que esm.sh devuelve hoy las mismas URLs.
2. “simularlo apuntando MD_URL a un puerto local que no responde, en una copia del test en /dev/shm”: `MD_URL` es una constante derivada del import map, no configurable; obliga a inventar el mecanismo de override y la ruta/nombre de la copia.
3. “cada módulo que trae de esm.sh se compara contra un sha256 fijado en el propio test”: no aclara si la clave es la URL solicitada o `res.url` tras redirecciones, ni si se excluyen otros `https://`; obliga a inventar la semántica de la tabla.
4. “La evidencia de los tres casos queda en el run_dir”: no define formato, nombres ni contenido; obliga a inventar artefactos de evidencia.

## DRY-RUN
Lecturas: TaskDoc, rituales execution/testing/closeout, pill, test actual, import map de `index.html`, resumen del tester y commit `9bc308b` si están disponibles. Cambios previstos: importar/calcular sha256 dentro del módulo loader, añadir tabla `EXPECTED_SHA256`, timeout, traducción de error a `GET <url> -> timeout 20 s`, comparación con error `sha256 <obtenido> != <esperado>`, comentario de regeneración. Dependencias: una corrida con red para enumerar URLs/hashes reales; Node con `AbortSignal.timeout` y `node:crypto`; listener/proxy local para el caso colgado. Validaciones futuras: ejecutar los tres comandos indicados y los tres escenarios del “Done When”, sin ejecutarlos ahora.

## FUTURO
Otro nodo ejecutor hará la enumeración con red y aplicará el cambio; testing/CI validará; un humano decidirá si acepta el conjunto de hashes y el mecanismo de simulación de red colgada; closeout actualizará Board y commit atómico.
