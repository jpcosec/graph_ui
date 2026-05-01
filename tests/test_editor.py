import pytest
from datetime import datetime
from editor import GraphEditorEngine
from provider import GraphProvider
from contracts.editing import NodeEdit, EditAction, EditMetadata

def test_safe_node_update_flow():
    """Verify a safe edit flow: updating node metadata."""
    provider = GraphProvider()
    data = provider.get_ecosystem_slice()
    
    engine = GraphEditorEngine()
    
    # Create an update edit
    edit = NodeEdit(
        action=EditAction.UPDATE,
        metadata=EditMetadata(author="operator-01", timestamp=datetime.utcnow(), reason="Update description"),
        node_id="kgdb",
        data={"description": "Updated central graph engine description."}
    )
    
    updated_data = engine.apply_node_edit(data, edit)
    
    # Verify change
    kgdb_node = next(n for n in updated_data.nodes if n.id == "kgdb")
    assert kgdb_node.metadata["description"] == "Updated central graph engine description."
    # Ensure other metadata is preserved
    assert kgdb_node.metadata["layer"] == "Graph Hub"

def test_node_deletion_cascade():
    """Verify that deleting a node cascades to its edges."""
    provider = GraphProvider()
    data = provider.get_ecosystem_slice()
    initial_edge_count = len(data.edges)
    
    engine = GraphEditorEngine()
    
    # Delete 'kgdb' (central hub)
    edit = NodeEdit(
        action=EditAction.DELETE,
        metadata=EditMetadata(author="operator-01", timestamp=datetime.utcnow(), reason="Simulate catastrophe"),
        node_id="kgdb"
    )
    
    updated_data = engine.apply_node_edit(data, edit)
    
    # kgdb had 4 edges connected in the slice (orchestrates, persists_to, audits, visualizes)
    assert len(updated_data.nodes) == 4
    assert len(updated_data.edges) == initial_edge_count - 4
    assert not any(e.source == "kgdb" or e.target == "kgdb" for e in updated_data.edges)
