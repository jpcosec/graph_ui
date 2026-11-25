---
sldb:
  by: agent
  at: '2026-11-25T15:53:31Z'
  authority: generated
  via: create_document
id: atom-las-vistas-de-mindmap-reciben-request-y-la-url-base-en-vez-de-importar-shell-api-js
title: Las vistas de mindmap reciben request y la URL base en vez de importar shell/api.js
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:request-inyectado
---

# Las vistas de mindmap reciben request y la URL base en vez de importar shell/api.js

## Answer

shell/api.js exporta createRequest(baseUrl); las vistas toman request del contexto de la app y resuelven css y skins contra la base; en graph_ui todo se comporta igual.
