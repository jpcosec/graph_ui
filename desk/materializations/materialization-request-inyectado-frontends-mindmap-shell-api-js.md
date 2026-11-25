---
sldb:
  by: agent
  at: '2026-11-25T15:54:01Z'
  authority: generated
  via: create_document
id: materialization-request-inyectado-frontends-mindmap-shell-api-js
title: request-inyectado frontends-mindmap-shell-api-js
source_atoms:
- atom-las-vistas-de-mindmap-reciben-request-y-la-url-base-en-vez-de-importar-shell-api-js
target_kind: code
target_identity: frontends/mindmap/shell/api.js
validation:
- node --test tests/*.test.mjs
tags:
- system:graph_ui
- topic:request-inyectado
---

# request-inyectado frontends-mindmap-shell-api-js

## Intent

materializa en frontends/mindmap/shell/api.js el atom atom-las-vistas-de-mindmap-reciben-request-y-la-url-base-en-vez-de-importar-shell-api-js
