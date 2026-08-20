from datetime import datetime, timezone

from kgdb.contracts.base import Edge, SystemIdentity
from kgdb.contracts.io import GraphSnapshot
from kgdb.contracts.node import KnowledgeNode

from adapters.kgdb_adapter import kgdb_to_ui_graph
from contracts.graph_data import GraphData


def test_kgdb_to_ui_graph_adapts_snapshot_without_contract_changes():
    snapshot = GraphSnapshot(
        version="1.0",
        created_at=datetime(2026, 8, 20, 12, 0, tzinfo=timezone.utc),
        metadata={"source": "unit-test"},
        nodes=[
            KnowledgeNode(
                identity=SystemIdentity(node_id="node-a", node_type="module"),
                edges=[
                    Edge(
                        target_id="node-b",
                        relation_type="depends_on",
                        metadata={"weight": 2},
                    )
                ],
                semantics={"name": "Alpha Module", "domain": "core"},
                compliance={"status": "valid", "owner": "team-alpha"},
                source={"origin": "fixture"},
            ),
            KnowledgeNode(
                identity=SystemIdentity(node_id="node-b", node_type="document"),
                edges=[Edge(target_id="node-c", relation_type="references")],
                semantics={"title": "Beta Document"},
                ast={"language": "markdown"},
                io_ports=[{"name": "input", "direction": "incoming"}],
            ),
            KnowledgeNode(
                identity=SystemIdentity(node_id="node-c", node_type="concept"),
                semantics={"summary": "No display label facet"},
            ),
        ],
    )

    graph = kgdb_to_ui_graph(snapshot)

    assert isinstance(graph, GraphData)
    assert [node.id for node in graph.nodes] == ["node-a", "node-b", "node-c"]
    assert [(edge.source, edge.target, edge.relation_type) for edge in graph.edges] == [
        ("node-a", "node-b", "depends_on"),
        ("node-b", "node-c", "references"),
    ]

    node_a = next(node for node in graph.nodes if node.id == "node-a")
    assert node_a.label == "Alpha Module"
    assert node_a.node_type == "module"
    assert node_a.compliance_status == "valid"
    assert node_a.metadata["semantics"] == {"name": "Alpha Module", "domain": "core"}
    assert node_a.metadata["compliance"] == {"status": "valid", "owner": "team-alpha"}
    assert node_a.metadata["source"] == {"origin": "fixture"}

    node_b = next(node for node in graph.nodes if node.id == "node-b")
    assert node_b.label == "Beta Document"
    assert node_b.metadata["ast"] == {"language": "markdown"}
    assert node_b.metadata["io_ports"] == [{"name": "input", "direction": "incoming"}]

    node_c = next(node for node in graph.nodes if node.id == "node-c")
    assert node_c.label == "node-c"
    assert node_c.metadata["semantics"] == {"summary": "No display label facet"}

    first_edge = graph.edges[0]
    assert first_edge.metadata == {"weight": 2}

    assert graph.metadata == {
        "source": "unit-test",
        "snapshot_version": "1.0",
        "snapshot_created_at": "2026-08-20T12:00:00+00:00",
    }
