"""Adapters for converting kgdb graph snapshots into Graph UI data."""

from __future__ import annotations

from typing import Any

from kgdb.contracts.io import GraphSnapshot
from kgdb.contracts.node import KnowledgeNode

from contracts.graph_data import GraphData, UIEdge, UINode


def kgdb_to_ui_graph(snapshot: GraphSnapshot) -> GraphData:
    """Convert a kgdb graph snapshot into the Graph UI contract."""

    return GraphData(
        nodes=[_knowledge_node_to_ui_node(node) for node in snapshot.nodes],
        edges=[
            UIEdge(
                source=node.identity.node_id,
                target=edge.target_id,
                relation_type=edge.relation_type,
                metadata=dict(edge.metadata),
            )
            for node in snapshot.nodes
            for edge in node.edges
        ],
        metadata={
            **snapshot.metadata,
            "snapshot_version": snapshot.version,
            "snapshot_created_at": snapshot.created_at.isoformat(),
        },
    )


def _knowledge_node_to_ui_node(node: KnowledgeNode) -> UINode:
    return UINode(
        id=node.identity.node_id,
        label=_node_label(node),
        node_type=node.identity.node_type,
        compliance_status=_compliance_status(node),
        metadata=_node_metadata(node),
    )


def _node_label(node: KnowledgeNode) -> str:
    semantics = _facet_dict(node.semantics)
    ast = _facet_dict(node.ast)

    for key in ("label", "title", "name"):
        value = semantics.get(key) or ast.get(key)
        if isinstance(value, str) and value:
            return value

    return node.identity.node_id


def _compliance_status(node: KnowledgeNode) -> str | None:
    compliance = _facet_dict(node.compliance)
    status = compliance.get("status")
    return status if isinstance(status, str) and status else None


def _node_metadata(node: KnowledgeNode) -> dict[str, Any]:
    return {
        "semantics": _facet_dict(node.semantics),
        "ast": _facet_dict(node.ast),
        "io_ports": [_facet_dict(port) for port in node.io_ports],
        "compliance": _facet_dict(node.compliance),
        "adr": _facet_dict(node.adr),
        "test_map": _facet_dict(node.test_map),
        "git": _facet_dict(node.git),
        "source": _facet_dict(node.source),
    }


def _facet_dict(facet: Any) -> dict[str, Any]:
    if facet is None:
        return {}
    if hasattr(facet, "model_dump"):
        return facet.model_dump(exclude_none=True)
    if isinstance(facet, dict):
        return {key: value for key, value in facet.items() if value is not None}
    return {}
