---
id: atom-projection-is-layered-sldb-is-content-kgdb-is-graph-overlay-is-view
title: 'Projection is layered: sldb is content, kgdb is graph, overlay is view'
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:projection
- layer:document-model
provenance: null
---

# Projection is layered: sldb is content, kgdb is graph, overlay is view

## Answer

Projection splits into four ignorant layers. sldb-content = typed data (what it is). sldb-relation = topology (what connects to what), content-blind. kgdb = assembles nodes union edges into a GraphSnapshot (how it connects). The projection overlay (graph_ui/spec2viz) maps the snapshot to lenses of filter/encoding/layout (how it looks). Each layer ignores the interior of the next; that deliberate ignorance is what enables reuse. gemini_test today violates this with three hardcoded server-side lenses (taxonomy by tags, viz by embeddings+PCA, flow by transitions).
