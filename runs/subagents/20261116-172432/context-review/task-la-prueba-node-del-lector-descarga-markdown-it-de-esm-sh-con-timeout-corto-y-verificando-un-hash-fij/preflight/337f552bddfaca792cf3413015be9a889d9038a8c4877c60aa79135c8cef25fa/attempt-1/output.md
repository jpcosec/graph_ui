## REFORMULACION

Encargo: modificar `tests/mindmap-workspace-reader.test.mjs` para que su hook `load` (≈líneas 114-126), que descarga los módulos de esm.sh citados por el import map de `frontends/mindmap/index.html` (markdown-it@14.1.0 y dependencias), deje de ser una prueba dependiente de red sin control. Resultado esperado: todo `fetch` usa `AbortSignal.timeout(20000)`, los timeouts se relanzan como `Error('GET <url> -> timeout 20 s')`, existe un objeto `EXPECTED_SHA256 {url: hex}` con el sha256 del texto UTF-8 de cada URL, y el hook falla con `Error('GET <url> -> sha256 <obtenido> != <esperado>')` si el hash no coincide o la URL no está tabulada; más un comentario de regeneración. Repo: el que contiene `desk/`, `frontends/mindmap/` y `tests/`. Límites: no vendorizar, no tocar import map, producción, `ci.yml` ni otras pruebas. Evidencia de los tres casos en run_dir.

## AMBIGUEDADES

1. "sus dependencias relativas de esm.sh; la lista sale de registrar las URLs en una corrida con red" — obliga a inventar el conjunto exacto de URLs y sus hashes; sin red el ejecutor no puede derivarlos.
2. "simularlo apuntando MD_URL a un puerto local que no responde" — `MD_URL` no se define en el alcance; obligaría a inventar si es variable de entorno, constante del test o inexistente.
3. "node 22 respeta el proxy solo con NODE_USE_ENV_PROXY=1" — obliga a asumir versión de Node y si el entorno del ejecutor la cumple.
4. Rutas relativas (`desk/`, `tests/`, `frontends/`) sin raíz declarada; obliga a inventar el repo raíz respecto de `graph_ui`.

## DRY-RUN

Lecturas: test citado, import map, `runs/subagents/20261116-lector-tester-a1/result-summary.md`, commit `9bc308b`. Cambios previstos: sustituir el `fetch(url)` del hook, añadir tabla y verificación con `node:crypto`, comentario de regeneración. Dependencias: red disponible, proxy/entorno Node, `AbortSignal.timeout`. Validaciones futuras (no ejecutadas): corrida con red; hash alterado; proxy colgado <30 s; luego `node --test` de ambas pruebas y del glob completo, con evidencia en run_dir.

## FUTURO

Un humano/entorno debe proveer red y Node 22 con proxy para generar la tabla; otro nodo o revisor valida los hashes fijados y acepta la evidencia de los tres escenarios en run_dir.
