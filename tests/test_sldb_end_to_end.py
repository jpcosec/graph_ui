"""End-to-end proof: two ProjectionViews over real sldb data render distinct slices.

The portable graph snapshot is generated from the repository's own `.sldb`
store with ``sldb.api.graph.snapshot_save`` (read-only), read back with
``snapshot_load`` and adapted with ``snapshot_to_ui_graph``. Queries run on
sldb's own graph layer (the former kgdb, merged into sldb in 6deb222).

View 1 - 'Structure' filter: relation has_document → model→document hierarchy
View 2 - 'Sections' filter: relation has_section → document→section breakdown
"""

from pathlib import Path

import pytest
from sldb.api.graph import RelationFilter, StructuredQuery, index_from_snapshot, snapshot_load, snapshot_save
# PENDIENTE (pedido a sldb-04): sldb.api.graph.execute_query solo acepta un
# store; ejecutar sobre un snapshot en memoria todavía no tiene ruta pública.
from sldb.store.graph.executor import execute_query

from adapters.snapshot_adapter import snapshot_to_ui_graph

STORE = Path(__file__).resolve().parents[1] / ".sldb"


@pytest.fixture(scope="module")
def snapshot(tmp_path_factory):
    path = tmp_path_factory.mktemp("snapshot") / "graph.json"
    snapshot_save(str(STORE), path)
    return snapshot_load(path)


def _query(snapshot, relation):
    query = StructuredQuery(relations=[RelationFilter(relation_types=[relation])])
    return execute_query(index_from_snapshot(snapshot), query)


def _assert_only(nodes, relation):
    assert nodes
    for node in nodes:
        for edge in node.edges:
            assert edge.relation == relation, f"Expected {relation}, got {edge.relation}"
    assert any(node.edges for node in nodes)


def test_view_structure_shows_model_document_hierarchy(snapshot):
    nodes = _query(snapshot, "has_document")
    _assert_only(nodes, "has_document")
    # Los modelos son el origen de has_document.
    assert any(n.node_type == "sldb_model" and n.edges for n in nodes)


def test_view_sections_shows_document_sections(snapshot):
    nodes = _query(snapshot, "has_section")
    _assert_only(nodes, "has_section")
    assert any(n.node_type == "sldb_document" and n.edges for n in nodes)


def test_both_views_together_produce_distinct_slices(snapshot):
    structure = sum(len(n.edges) for n in _query(snapshot, "has_document"))
    sections = sum(len(n.edges) for n in _query(snapshot, "has_section"))

    assert structure > 0
    assert sections > 0
    assert structure != sections, f"Expected distinct slices, got has_document={structure} has_section={sections}"


def test_end_to_end_pipeline(snapshot):
    """Prove the full pipe: sldb store -> snapshot -> snapshot_to_ui_graph -> GraphData."""
    graph_data = snapshot_to_ui_graph(snapshot)

    assert len(graph_data.nodes) == len(snapshot.nodes)
    assert len(graph_data.edges) == sum(len(n.edges) for n in snapshot.nodes)

    # Verify facets preserved
    model_node = next(n for n in graph_data.nodes if n.node_type == "sldb_model")
    assert "name" in model_node.metadata.get("semantics", {})
