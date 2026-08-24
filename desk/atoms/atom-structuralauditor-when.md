---
id: atom-structuralauditor-when
title: StructuralAuditor
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:auditing
provenance: docs/specs/component.graph-ui.yml
---

# StructuralAuditor

## Answer

It applies after graph data exists and needs structural inspection. In practice that means after a graph has been loaded or adapted and before a consumer wants compliance cues on nodes. It is not the step that creates fixtures or transforms kgdb snapshots into the UI contract.
