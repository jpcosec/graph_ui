import pytest
from auditor import StructuralAuditor
from provider import GraphProvider
from contracts.graph_data import GraphData

def test_structural_audit_signals():
    """Verify that the auditor surfaces structural signals."""
    provider = GraphProvider()
    data = provider.get_ecosystem_slice()
    
    auditor = StructuralAuditor()
    audited_data = auditor.audit(data)
    
    # In ecosystem_slice.json, sldb is a sink (no outgoing edges)
    sldb_node = next(n for n in audited_data.nodes if n.id == "sldb")
    assert sldb_node.compliance_status == "pending"
    assert "Terminal node" in sldb_node.metadata["signal"]
    
    # repopackage has outgoing edges
    repo_node = next(n for n in audited_data.nodes if n.id == "repopackage")
    assert repo_node.compliance_status == "valid"

def test_orphan_signal():
    """Verify orphan detection."""
    from contracts.graph_data import UINode
    data = GraphData(
        nodes=[UINode(id="orphan", label="Orphan", node_type="test")],
        edges=[]
    )
    
    auditor = StructuralAuditor()
    audited_data = auditor.audit(data)
    
    assert audited_data.nodes[0].compliance_status == "error"
    assert "Orphan" in audited_data.nodes[0].metadata["signal"]
