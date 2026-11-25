PASA

# Verificación: task-las-vistas-de-mindmap-reciben-request-y-la-url-base-del-servidor-en-vez-de-importar-shell-api-js-con

Commit del ejecutor: `56ac386` — `feat: mindmap views get request/base URL via ViewContext`.

## Qué se comprobó

- Ninguna vista de `frontends/mindmap/views` importa `request` de `shell/api.js`; todas usan
  `useViewContext()` (`workspace`, `notation`, `document-ficha`, `deskops`, `flow`).
- `shell/api.js` expone `joinUrl(baseUrl, path)`, `createRequest(baseUrl)` y conserva
  `request = createRequest('')`. Comprobación directa con Node: `''`, `/prefix`, `http://host/app/`,
  rutas relativas, URLs con esquema y protocol-relative se resuelven como se espera.
- `app.js` toma `data-base-url` del host, provee `ViewContext`/`request` y resuelve los
  `styles` de las vistas con `viewContext.resolveUrl()`.
- `shell.js` y `workers-panel.js` también dejaron de importar `request` directamente.

## Tests ejecutados

Todos con `TMPDIR=/tmp` y `PYTEST_ADDOPTS=--basetemp=/tmp/pytest-deskops-t-b8095eb6eabd...`.

- `node --test tests/*.test.mjs`: **161 passed, 0 failed**.
- `tests/e2e_mindmap_notation.py`: **2 passed**.
- `tests/e2e_notation_activity.py`: **2 passed**.
- Tests adicionales de las vistas tocadas:
  - `tests/e2e_mindmap_workspace.py`: **22 passed**.
  - `tests/e2e_mindmap_deskops.py`: **1 passed**.
  - `tests/e2e_mindmap_flow.py`: **2 passed**.
  - `tests/test_mindmap_workers.py`: **10 passed**.
  - `tests/test_mindmap_workspace.py`: **17 passed**.
  - `tests/test_mindmap_deskops.py`: **7 passed**.
  - `tests/test_mindmap_notation.py`: **5 passed**.

## Observación no atribuible al commit

`tests/e2e_mindmap_document_dialog.py` falla esperando `.document-node` con un `pageerror`
`Cannot read properties of undefined (reading 'has')` en `source/graph.mjs:83` (`isReferenceField`).
Se reprodujo igual en el commit padre `d249e7c`, y el commit no toca `source/graph.mjs` ni el
diálogo de documentos, por lo que es un fallo preexistente/de entorno y no una regresión de este
cambio. No afecta a la validación pedida para la tarea.
