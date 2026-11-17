---
sldb:
  by: agent
  at: '2026-11-17T04:07:54Z'
  authority: generated
  via: save_document_payload
# review-<task>-<kind>-<n>
id: review-task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon-bundle-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: bundle
# kind evidence only: tests | commit | atom | materialization | document | external
fact: ''
# kind evidence only: what the producer verified, one item per line
value: ''
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon@sha256:38a5ee79c4318b7de5627bf2cfe00ededb7c2b03945e809e474d4d1d8ad05829
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: runtime-pi-deepseek-flash
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: runs/subagents/20261117-040638/context-review/task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon/bundle/21624f89c29561f8cc7bd1a9f9a73963bc304b0309b6bb4e7f343a618437e4ef/attempt-1
input_sha256: 21624f89c29561f8cc7bd1a9f9a73963bc304b0309b6bb4e7f343a618437e4ef
output_sha256: 839673a9ec2d565715f460d5e5f99356c8ccd0a8f7d8fd87208c638fb65346ec
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'Verdict accepted. El coordinador verificó contra el código y resuelve las
  ambigüedades:

  (1) Forma de la respuesta. views_routes.dispatch responde {''ok'': False, ''error'':
  str(exc)} con un status (views_routes.py:83-87). Se agrega la clave ''estado'':
  ''store_no_preparado'', la misma que usa workspace_routes.py (STORE_NO_PREPARADO,
  línea 63). En save, serve.py:144 responde el error de self.save_error con su status;
  se agrega ''estado'' solo en este caso.

  (2) Detección. isinstance de sldb.core.exceptions.SLDBStoreError y la substring
  ''store not prepared'' en str(exc), igual que workspace_routes.py:171-176. Cualquier
  otra SLDBStoreError se relanza sin cambios.

  (3) Store des-preparado con el servidor ya arrancado. Se arranca sobre un store
  preparado y la prueba lo deja no canónico después, igual que tests/test_mindmap_workspace_explorer.py::test_listing_get_on_unprepared_store_is_503_and_writes_nothing
  (escribe el índice semántico en el archivo único legado, que _already_canonical
  rechaza).

  (4) Snapshot. sha256 y mtime_ns recursivos de todos los archivos bajo .sldb, como
  store_state() de esa prueba.

  (5) El grep cuenta también comentarios y docstrings: el docstring de runtime_documents
  se reescribe sin nombrar open_store.

  (6) Ubicación de la prueba HTTP de /api/save. Si tests/test_mindmap_persistence.py
  no tiene servidor HTTP, la prueba va en tests/test_mindmap_endpoints.py o en tests/test_parallel_workspace_serve.py,
  que ya levantan el servidor. Ese archivo de prueba queda autorizado aunque no esté
  en files.

  El ejecutor no hace commit ni push.'
# ISO 8601 timestamp
created_at: '2026-11-17T04:07:14.509265+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-17T04:07:52.791470+00:00'
disposed_by: graph_ui
# e.g. workspace:desk
tags:
- workspace:desk
---

# Bundle review of task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon

## Summary

_Summarize what was reviewed and the evidence this receipt records._

bundle review; engine runtime-pi-deepseek-flash; evidence under runs/subagents/20261117-040638/context-review/task-las-vistas-de-proyección-leen-sin-migrar-read-store-y-el-guardado-sobre-un-store-sin-preparar-respon/bundle/21624f89c29561f8cc7bd1a9f9a73963bc304b0309b6bb4e7f343a618437e4ef/attempt-1.

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: Verdict accepted. El coordinador verificó contra el código y resuelve las ambigüedades:
(1) Forma de la respuesta. views_routes.dispatch responde {'ok': False, 'error': str(exc)} con un status (views_routes.py:83-87). Se agrega la clave 'estado': 'store_no_preparado', la misma que usa workspace_routes.py (STORE_NO_PREPARADO, línea 63). En save, serve.py:144 responde el error de self.save_error con su status; se agrega 'estado' solo en este caso.
(2) Detección. isinstance de sldb.core.exceptions.SLDBStoreError y la substring 'store not prepared' en str(exc), igual que workspace_routes.py:171-176. Cualquier otra SLDBStoreError se relanza sin cambios.
(3) Store des-preparado con el servidor ya arrancado. Se arranca sobre un store preparado y la prueba lo deja no canónico después, igual que tests/test_mindmap_workspace_explorer.py::test_listing_get_on_unprepared_store_is_503_and_writes_nothing (escribe el índice semántico en el archivo único legado, que _already_canonical rechaza).
(4) Snapshot. sha256 y mtime_ns recursivos de todos los archivos bajo .sldb, como store_state() de esa prueba.
(5) El grep cuenta también comentarios y docstrings: el docstring de runtime_documents se reescribe sin nombrar open_store.
(6) Ubicación de la prueba HTTP de /api/save. Si tests/test_mindmap_persistence.py no tiene servidor HTTP, la prueba va en tests/test_mindmap_endpoints.py o en tests/test_parallel_workspace_serve.py, que ya levantan el servidor. Ese archivo de prueba queda autorizado aunque no esté en files.
El ejecutor no hace commit ni push.
