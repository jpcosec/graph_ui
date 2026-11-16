---
sldb:
  by: agent
  at: '2026-11-16T17:25:20Z'
  authority: generated
  via: save_document_payload
id: task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261116-lector-tester-a1/result-summary.md
- 9bc308b
- frontends/mindmap/index.html
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- tests/mindmap-workspace-reader.test.mjs
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# La prueba node del lector descarga markdown-it de esm.sh con timeout corto y verificando un hash fijado

## Rationale

_Explain why this task exists or the business driver behind it._

Al cerrar el lector Markdown del workspace (86ebce3, código 9bc308b), el tester independiente (runs/subagents/20261116-lector-tester-a1/result-summary.md, punto 4) encontró que tests/mindmap-workspace-reader.test.mjs es la primera prueba del job mindmap de la CI que necesita internet: un hook de load (líneas ~114-126) hace fetch(url) de los módulos https de esm.sh que nombra el import map de frontends/mindmap/index.html (markdown-it@14.1.0) sin timeout y sin verificar integridad. Sin red falla limpio en 0,34 s, pero con la red colgada (proxy que acepta y no responde) tarda 5 min en fallar, y el contenido descargado se ejecuta sin comprobar que es el esperado.

## Goal

_Describe the concrete result this task must produce._

El fetch del hook de load de tests/mindmap-workspace-reader.test.mjs usa un timeout de 20 s (AbortSignal.timeout(20000)) y cada módulo que trae de esm.sh se compara contra un sha256 fijado en el propio test; un contenido distinto o un timeout hacen fallar la prueba con un mensaje que nombra la URL y la causa.

## Scope

_State what is in scope and what is out of scope._

ENTRA (todo en graph_ui, /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui): (1) tests/mindmap-workspace-reader.test.mjs: en HTTPS_HOOKS, fetch(url, {signal: AbortSignal.timeout(20000)}); un error de timeout se relanza como Error('GET <url> -> timeout 20 s'). (2) Un objeto EXPECTED_SHA256 {<url pedida>: <hex>} en el test. La clave es la URL que recibe load() (la pedida, antes de redirecciones); una URL https que no está en la tabla hace fallar la prueba. El hook calcula el sha256 del texto descargado (node:crypto, UTF-8) y, si no coincide, lanza Error('GET <url> -> sha256 <obtenido> != <esperado>'). Las URLs y sus hashes los obtiene el ejecutor en una corrida con red (la máquina tiene red a esm.sh; node v22). (3) Un comentario que diga cómo regenerar la tabla al cambiar la versión del import map. NO ENTRA: vendorizar markdown-it, cambiar el import map o el código de producción, cambiar .github/workflows/ci.yml, tocar otras pruebas.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Correr una vez node --test tests/mindmap-workspace-reader.test.mjs con un console.error temporal en load() que imprima cada URL y su sha256; con eso se escribe EXPECTED_SHA256 y se quita el log. 2) Implementar el timeout y el control de hash en HTTPS_HOOKS. 3) Probar tres casos y guardar la salida de cada uno en el run_dir como case-red.log, case-hash.log y case-colgado.log (comando, salida y exit code, y la duración en el caso colgado): (a) con red pasa; (b) en una copia del test en /dev/shm con un hash de la tabla alterado, falla con el mensaje de sha256; (c) en otra copia del test en /dev/shm, con la constante MD_URL reemplazada por https://127.0.0.1:<puerto> de un listener TCP local que acepta y no responde (más esa URL agregada a la tabla), falla en menos de 30 s con el mensaje de timeout. Las copias de (b) y (c) no se commitean.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-workspace-reader.test.mjs tests/mindmap-workspace.test.mjs
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

Con red, `node --test tests/*.test.mjs` pasa entero; con la tabla alterada la prueba falla nombrando la URL y el sha256; con la red colgada falla en menos de 30 s con el mensaje de timeout. La evidencia de los tres casos queda en el run_dir.
