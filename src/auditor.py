"""
Graph UI Structural Auditor.
Performs lightweight audits on GraphData to generate visual signals.
"""

try:
    from .contracts.graph_data import GraphData, UINode
except ImportError:
    from contracts.graph_data import GraphData, UINode


class StructuralAuditor:
    """Performs structural analysis on a graph to identify anomalies."""

    def audit(self, data: GraphData) -> GraphData:
        """Analyze the graph and decorate nodes with compliance signals."""
        
        # Build adjacency maps
        outgoing = {node.id: 0 for node in data.nodes}
        incoming = {node.id: 0 for node in data.nodes}
        
        for edge in data.edges:
            if edge.source in outgoing:
                outgoing[edge.source] += 1
            if edge.target in incoming:
                incoming[edge.target] += 1
                
        # Apply signals
        for node in data.nodes:
            self._decorate_node(node, incoming[node.id], outgoing[node.id])
            
        return data

    def _decorate_node(self, node: UINode, in_degree: int, out_degree: int):
        """Apply compliance status based on degrees."""
        if in_degree == 0 and out_degree == 0:
            node.compliance_status = "error"
            node.metadata["signal"] = "Orphan node: no connections."
        elif out_degree == 0:
            # In our ecosystem core, sinks are common (e.g., sldb), 
            # but we can flag them as 'pending' or 'terminal' for demo purposes.
            node.compliance_status = "pending"
            node.metadata["signal"] = "Terminal node: no outgoing relationships."
        else:
            node.compliance_status = "valid"
