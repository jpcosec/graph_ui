import pytest
from provider import GraphProvider
from contracts.graph_data import GraphData

def test_load_ecosystem_slice():
    """Verify that the ecosystem_slice.json fixture loads and validates correctly."""
    provider = GraphProvider()
    data = provider.get_ecosystem_slice()
    
    assert isinstance(data, GraphData)
    assert len(data.nodes) == 5
    assert len(data.edges) == 5
    
    # Verify specific nodes
    node_ids = [n.id for n in data.nodes]
    assert "repopackage" in node_ids
    assert "kgdb" in node_ids
    
    # Verify first node structure
    rp_node = next(n for n in data.nodes if n.id == "repopackage")
    assert rp_node.node_type == "module"
    assert rp_node.compliance_status == "valid"
    assert rp_node.metadata["layer"] == "Control Plane"

def test_fixture_not_found():
    """Verify error handling for missing fixtures."""
    provider = GraphProvider()
    with pytest.raises(FileNotFoundError):
        provider.load_fixture("non_existent_fixture")
