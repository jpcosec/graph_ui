---
# atom-xxx, unique identifier
id: atom-how-graph-ui-loads-data-today-static-hum-ast-fixture-baked-into-the-bundle
# Short, descriptive title
title: 'How graph_ui loads data today: static hum-ast fixture baked into the bundle'
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: how
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- topic:data-loading
- topic:current-state
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# How graph_ui loads data today: static hum-ast fixture baked into the bundle

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

The app's default mounted page is HumBodyPage (apps/review-workbench/src/App.tsx). Data flow at runtime: HumBodyPage -> buildHumViewGraph() in features/hum-body/lib/adapter.ts -> humBodyModel in lib/mock-data.ts -> generated-hum-ast.ts, a static TypeScript array compiled into the bundle. The npm 'hum:sync' step (scripts/generate-hum-ast.mjs) is supposed to regenerate generated-hum-ast.ts from a hum source tree, but its repoRoot path resolves to apps/../../../hum which does not exist; the real source is one level up. So hum:sync silently falls back to 'keeping existing HUM AST fixture' and the app renders frozen data. A second, unmounted path exists for a generic editor: GraphEditorPage -> graphDataProvider.getGraph() (lib/data-provider.ts) -> mockClient -> src/mock/fixtures/graph_data.json. graphDataProvider.saveGraph() is a no-op returning {ok:true}, so nothing persists. Net: today graph_ui neither reads live data nor writes edits back.
