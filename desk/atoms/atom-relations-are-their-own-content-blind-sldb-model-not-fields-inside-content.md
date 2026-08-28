---
id: atom-relations-are-their-own-content-blind-sldb-model-not-fields-inside-content
title: Relations are their own content-blind sldb model, not fields inside content
five_wh_one_plus: how
tags:
- system:sldb
- topic:projection
- layer:document-model
provenance: null
---

# Relations are their own content-blind sldb model, not fields inside content

## Answer

A relation is not a text field hidden inside content (e.g. allowed_transitions: booking, onboarding). It becomes its own StructuredNLDoc: a RelationType spec (endpoints, direction, cardinality -- content, authored in sldb) and Relation instances (source_id, target_id, relation_type -- content-blind edges). kgdb drops from materializer to pure assembler: node docs union edge docs = GraphSnapshot. This decouples topology from content (reconnect without editing atoms), resolves the guardrail tension (vocabulary lives in its own sldb model), and makes kgdb code-wiki node facets (ast/git/test_map) inert. Open cost: referential integrity of dangling edges.
