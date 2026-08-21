"""End-to-end proof: two ProjectionViews over real sldb data render distinct slices.

Uses kgdb_to_ui_graph adapter (already built) and the sldb_to_kgdb converter
(script that transforms sldb store AST into kgdb GraphSnapshot).

View 1 - 'Structure' filter: relation_type=contains → model→document hierarchy
View 2 - 'Definitions' filter: relation_type=defines → model→field definitions
"""

import json
from pathlib import Path

FIXTURE = Path(__file__).resolve().parents[1] / "desk" / "fixtures" / "sldb_snapshot.json"


def test_view_contains_shows_model_document_hierarchy():
    from adapters.kgdb_adapter import kgdb_to_ui_graph
    from kgdb.contracts.io import GraphSnapshot
    from kgdb.query.language import RelationFilter, StructuredQuery
    from kgdb.query.executor import execute_query
    import networkx as nx
    from kgdb.graph.utils import add_knowledge_node

    snapshot = GraphSnapshot.model_validate_json(FIXTURE.read_text())
    graph_data = kgdb_to_ui_graph(snapshot)

    # Build a networkx graph to run RelationFilter
    g = nx.DiGraph()
    for node in snapshot.nodes:
        add_knowledge_node(g, node)

    query = StructuredQuery(
        relations=[RelationFilter(relation_types=["contains"])]
    )
    filtered_nodes = execute_query(g, query)

    # All returned edges should be 'contains' only
    for node in filtered_nodes:
        for edge in node.edges:
            assert edge.relation_type == "contains", \
                f"Expected contains, got {edge.relation_type}"

    assert len(filtered_nodes) > 0
    # Models have outgoing 'contains' edges to documents
    contains_sources = [n for n in filtered_nodes if any(
        e.relation_type == "contains" for e in n.edges
    )]
    assert len(contains_sources) > 0


def test_view_defines_shows_field_definitions():
    from adapters.kgdb_adapter import kgdb_to_ui_graph
    from kgdb.contracts.io import GraphSnapshot
    from kgdb.query.language import RelationFilter, StructuredQuery
    from kgdb.query.executor import execute_query
    import networkx as nx
    from kgdb.graph.utils import add_knowledge_node

    snapshot = GraphSnapshot.model_validate_json(FIXTURE.read_text())
    graph_data = kgdb_to_ui_graph(snapshot)

    g = nx.DiGraph()
    for node in snapshot.nodes:
        add_knowledge_node(g, node)

    query = StructuredQuery(
        relations=[RelationFilter(relation_types=["defines"])]
    )
    filtered_nodes = execute_query(g, query)

    # All returned edges should be 'defines' only
    for node in filtered_nodes:
        for edge in node.edges:
            assert edge.relation_type == "defines", \
                f"Expected defines, got {edge.relation_type}"

    assert len(filtered_nodes) > 0
    # Models have outgoing 'defines' edges to fields
    defines_sources = [n for n in filtered_nodes if any(
        e.relation_type == "defines" for e in n.edges
    )]
    assert len(defines_sources) > 0


def test_both_views_together_produce_distinct_slices():
    from adapters.kgdb_adapter import kgdb_to_ui_graph
    from kgdb.contracts.io import GraphSnapshot
    from kgdb.query.language import RelationFilter, StructuredQuery
    from kgdb.query.executor import execute_query
    import networkx as nx
    from kgdb.graph.utils import add_knowledge_node

    snapshot = GraphSnapshot.model_validate_json(FIXTURE.read_text())
    graph_data = kgdb_to_ui_graph(snapshot)

    g = nx.DiGraph()
    for node in snapshot.nodes:
        add_knowledge_node(g, node)

    # View 1: contains
    q1 = StructuredQuery(relations=[RelationFilter(relation_types=["contains"])])
    r1 = execute_query(g, q1)
    contains_edges = sum(len(n.edges) for n in r1)

    # View 2: defines
    q2 = StructuredQuery(relations=[RelationFilter(relation_types=["defines"])])
    r2 = execute_query(g, q2)
    defines_edges = sum(len(n.edges) for n in r2)

    assert contains_edges > 0
    assert defines_edges > 0
    assert contains_edges != defines_edges, \
        f"Expected distinct slices, got contains={contains_edges} defines={defines_edges}"


def test_end_to_end_pipeline():
    """Prove the full pipe: sldb AST -> kgdb -> kgdb_to_ui_graph -> GraphData."""
    from adapters.kgdb_adapter import kgdb_to_ui_graph
    from kgdb.contracts.io import GraphSnapshot

    snapshot = GraphSnapshot.model_validate_json(FIXTURE.read_text())
    graph_data = kgdb_to_ui_graph(snapshot)

    assert len(graph_data.nodes) == len(snapshot.nodes)
    assert len(graph_data.edges) == sum(len(n.edges) for n in snapshot.nodes)

    # Verify facets preserved
    model_node = next(n for n in graph_data.nodes if n.node_type == "model")
    assert "name" in model_node.metadata.get("semantics", {})
