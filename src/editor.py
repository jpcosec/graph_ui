"""
Graph UI Editing Engine.
Responsible for applying validated edits to GraphData.
"""

try:
    from .contracts.graph_data import GraphData, UINode, UIEdge
    from .contracts.editing import NodeEdit, EdgeEdit, EditAction
except ImportError:
    from contracts.graph_data import GraphData, UINode, UIEdge
    from contracts.editing import NodeEdit, EdgeEdit, EditAction


class GraphEditorEngine:
    """Applies mutations to GraphData while preserving structural integrity."""

    def apply_node_edit(self, data: GraphData, edit: NodeEdit) -> GraphData:
        """Apply a CREATE, UPDATE, or DELETE operation to a node."""
        if edit.action == EditAction.CREATE:
            # Check for collision
            if any(n.id == edit.node_id for n in data.nodes):
                raise ValueError(f"Node collision: {edit.node_id} already exists.")
            
            new_node = UINode(
                id=edit.node_id,
                label=edit.data.get("label", edit.node_id),
                node_type=edit.node_type or "unknown",
                metadata=edit.data
            )
            data.nodes.append(new_node)
            
        elif edit.action == EditAction.UPDATE:
            node = next((n for n in data.nodes if n.id == edit.node_id), None)
            if not node:
                raise ValueError(f"Node not found: {edit.node_id}")
            
            # Update fields
            if "label" in edit.data:
                node.label = edit.data["label"]
            if "node_type" in edit.data:
                node.node_type = edit.data["node_type"]
            
            # Merge metadata
            node.metadata.update(edit.data)
            
        elif edit.action == EditAction.DELETE:
            data.nodes = [n for n in data.nodes if n.id != edit.node_id]
            # Cascade delete edges
            data.edges = [e for e in data.edges if e.source != edit.node_id and e.target != edit.node_id]
            
        return data

    def apply_edge_edit(self, data: GraphData, edit: EdgeEdit) -> GraphData:
        """Apply a CREATE or DELETE operation to an edge."""
        if edit.action == EditAction.CREATE:
            # Verify nodes exist
            node_ids = {n.id for n in data.nodes}
            if edit.source not in node_ids or edit.target not in node_ids:
                raise ValueError(f"Edge nodes not found: {edit.source} -> {edit.target}")
            
            new_edge = UIEdge(
                source=edit.source,
                target=edit.target,
                relation_type=edit.relation_type,
                metadata=edit.data
            )
            data.edges.append(new_edge)
            
        elif edit.action == EditAction.DELETE:
            data.edges = [
                e for e in data.edges 
                if not (e.source == edit.source and e.target == edit.target and e.relation_type == edit.relation_type)
            ]
            
        return data
