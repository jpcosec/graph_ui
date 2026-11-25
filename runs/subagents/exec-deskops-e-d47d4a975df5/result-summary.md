# Resultado
run_id: exec-deskops-e-d47d4a975df5 (sin sesion de hijo propia)
session: n/a
session_sha256: n/a

Commit en rama deskops/deskops-e-d47d4a975df5. Archivos:
- frontends/mindmap/views/specs/notation/notation-layout.mjs: bestIn devuelve el primer candidato sin problemas y con zoom legible; allIn(stopAtGood) y la etapa sin reservar rotulos paran en el primero bueno y no prueban la otra direccion si ya hay uno.
- frontends/mindmap/views/specs/notation/notation-view.js: ELK via elk-api con workerFactory (Blob que hace importScripts de elk-worker.min.js en jsdelivr); sondeo previo y fallback al hilo principal si el worker no carga.
- frontends/mindmap/index.html: entrada importmap elkjs/lib/elk-api.js.
- tests/mindmap-notation-layout.test.mjs: spec de actividad (vista sintetica de 11 pasos + inicio/fin, 17 aristas) con ELK real contado, tope 60 (antes 99, ahora 56); y prueba de 1 sola corrida con primer candidato bueno.

# Revisar
- NO llega al tope de ~30 del encargo: en esa spec ningun candidato de la primera direccion es limpio y legible (los limpios dan zoom 0.6 < 0.8), asi que los 24 + los de la otra direccion se siguen probando; el corte solo ayuda en la 2a direccion y en la etapa sin rotulos. Bajar mas exigiria saltar la direccion girada, cambiando el resultado de otras specs.
- El fixture usado es sintetico (el yml requiere resolver via sldb); medir con la spec real en Chrome.
- Worker servido desde CDN (jsdelivr) y no desde graph_ui (elkjs no esta vendorizado; hoy todo viene de esm.sh).
- e2e Playwright no se pudo correr (falta Chromium); ver validation.log.
- Cambio de comportamiento: specs con varios candidatos limpios y legibles ahora devuelven el primero, no el de mas zoom.
