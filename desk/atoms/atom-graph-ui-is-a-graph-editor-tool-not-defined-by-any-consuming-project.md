---
# atom-xxx, unique identifier
id: atom-graph-ui-is-a-graph-editor-tool-not-defined-by-any-consuming-project
# Short, descriptive title
title: graph_ui is a graph editor tool, not defined by any consuming project
# what | why | how | how_not | when | where | for_whom
five_wh_one_plus: what
# e.g., system:deskops, topic:templates
tags:
- system:graph_ui
- topic:architecture
- topic:identity
# Optional URL or path to the authoritative source of this knowledge
provenance: null
---

# graph_ui is a graph editor tool, not defined by any consuming project

## Answer

_Answer the selected 5WH1+ question as one stable knowledge unit._

graph_ui is a reusable, domain-agnostic visual editor for graph-shaped data: nodes, edges, typed attributes. Its identity is the editing tool itself, not any product that embeds it. Consumers (such as a review workbench) are downstream users, never part of graph_ui's definition. Earlier docs conflated the two by calling it 'domain-agnostic' and 'the PhD 2.0 review workbench editor' in the same breath; that contradiction is retired. Relationship to the rest of the ecosystem is minimal and one-directional: graph_ui consumes graph data (target: kgdb) and edits it; spec2viz is a separate, non-overlapping tool that renders architecture from specs. graph_ui edits instances; spec2viz renders specs.
