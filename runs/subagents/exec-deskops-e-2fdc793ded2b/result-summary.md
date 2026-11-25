# Result
- shell/api.js: createRequest(baseUrl) + joinUrl; `request = createRequest('')`.
- New shell/view-context.js: ViewContext {baseUrl, request, resolveUrl}, useViewContext().
- app.js provides the context (base from #root data-base-url, default ''), resolves view style hrefs against base, passes request to SourceProvider.
- workspace-view, notation-view, document-ficha, deskops-view, flow-view, shell.js, workers-panel.js take request from useViewContext; no view imports shell/api.js.
- Validation: see validation.log. node reader test fails identically on main (network/esm.sh).
- Not done: index.html /skins links and descriptor `styles` stay root-absolute strings (resolved at link time); mount() out of scope.
Files: frontends/mindmap/{app.js,shell/api.js,shell/view-context.js,shell/shell.js,shell/workers-panel.js,views/documents/flow/flow-view.js,views/documents/map/document-ficha.js,views/specs/notation/notation-view.js,views/workflow/deskops/deskops-view.js,views/workspace/node/workspace-view.js}
