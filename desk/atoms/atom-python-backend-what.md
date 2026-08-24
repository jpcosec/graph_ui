---
id: atom-python-backend-what
title: Python Backend
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The Python Backend is the `src/` package of graph_ui that owns the canonical graph data contract and the pure logic that operates on it. It comprises five units: the `GraphData`/`UINode`/`UIEdge` Pydantic contract (`contracts/graph_data.py`), the `GraphEditorEngine` (`editor.py`), the `StructuralAuditor` (`auditor.py`), the `GraphProvider` (`provider.py`), and the `kgdb_to_ui_graph` adapter (`adapters/kgdb_adapter.py`). It is a headless, framework-agnostic layer with no rendering or HTTP concerns.
