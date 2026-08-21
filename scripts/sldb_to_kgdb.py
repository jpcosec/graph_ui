"""Export sldb store/document AST to kgdb GraphSnapshot format.

Usage:
    python -m sldb ast show --store .sldb --format json | python sldb_to_kgdb.py > graph_snapshot.json

Produces a kgdb GraphSnapshot with KnowledgeNode[] where each node carries
its outgoing edges (Edge[]), as kgdb's model expects.
graph_ui can then load it via kgdb_to_ui_graph adapter.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from typing import Any


def build_snapshot(sldb_ast: dict[str, Any]) -> dict[str, Any]:
    """Convert sldb store AST into a kgdb GraphSnapshot.

    Each node carries its own outgoing edges (Edge list). The fixed schema
    does not have a top-level edges field — edges are nested within nodes.
    """
    node_map: dict[str, dict[str, Any]] = {}
    edges_by_source: dict[str, list[dict[str, Any]]] = {}
    store = sldb_ast.get("store", {})

    def ensure_node(
        node_id: str, node_type: str, semantics: dict[str, Any]
    ) -> None:
        if node_id not in node_map:
            node_map[node_id] = _knowledge_node(node_id, node_type, semantics)
            edges_by_source[node_id] = []

    def add_edge(
        source: str, target: str, relation_type: str
    ) -> None:
        edges_by_source.setdefault(source, []).append(
            {"target_id": target, "relation_type": relation_type, "metadata": {}}
        )

    for model in store.get("models", []):
        model_id = f"model:{model['name']}"
        ensure_node(
            model_id,
            "model",
            {"name": model["name"], "model_ref": model["model_ref"]},
        )

        for field in model.get("fields", []):
            field_id = f"field:{model['name']}:{field['name']}"
            ensure_node(
                field_id,
                "field",
                {"name": field["name"], "annotation": field.get("annotation", "")},
            )
            add_edge(model_id, field_id, "defines")

        for doc in model.get("documents", []):
            doc_id = f"doc:{doc['name']}"
            ensure_node(doc_id, "document", doc)
            add_edge(model_id, doc_id, "contains")

    # Attach outgoing edges to each node
    for node_id in node_map:
        node_map[node_id]["edges"] = edges_by_source.get(node_id, [])

    nodes = list(node_map.values())

    return {
        "version": "1.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "source": "sldb",
            "store_path": str(store.get("path", "")),
            "model_count": len(store.get("models", [])),
            "node_count": len(nodes),
            "total_edges": sum(len(edges_by_source[nid]) for nid in edges_by_source),
        },
        "nodes": nodes,
    }


def _knowledge_node(
    node_id: str, node_type: str, semantics: dict[str, Any]
) -> dict[str, Any]:
    return {
        "identity": {"node_id": node_id, "node_type": node_type},
        "semantics": {"name": semantics.get("name", node_id)},
        "edges": [],
    }


def main() -> None:
    sldb_json = json.load(sys.stdin)
    snapshot = build_snapshot(sldb_json)
    json.dump(snapshot, sys.stdout, indent=2)


if __name__ == "__main__":
    main()