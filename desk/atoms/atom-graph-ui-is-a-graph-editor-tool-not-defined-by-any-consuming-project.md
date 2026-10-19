---
id: atom-graph-ui-is-a-graph-editor-tool-not-defined-by-any-consuming-project
title: graph_ui is a graph editor tool, not defined by any consuming project
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:architecture
- topic:identity
---

# graph_ui is a graph editor tool, not defined by any consuming project

## Answer

graph_ui is the visual editor of an SLDB knowledge base: the active development is frontends/mindmap (stdlib Python server plus React/htm UI), which reads and writes a real .sldb store, and apps/review-workbench (React/Vite) is the earlier generic graph editor that is still maintained. Its identity is the editing tool, not any product that embeds it; consumers are downstream users, never part of its definition. Relationship to the ecosystem is minimal and one-directional: graph_ui consumes graph data (sldb documents and sldb.api.graph over the SLDB store) and edits it; spec2viz is a separate, non-overlapping tool that renders architecture from specs (the Specs view only draws what spec2viz resolves). graph_ui edits instances; spec2viz renders specs.
