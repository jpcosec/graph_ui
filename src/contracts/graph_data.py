"""
Graph UI data contracts for React/D3-style visualization.
This module defines the canonical graph-shaped data the UI consumes.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class Position(BaseModel):
    """3D coordinates for a node in the graph visualization."""

    x: float = Field(description="Horizontal position coordinate.")
    y: float = Field(description="Vertical position coordinate.")
    z: Optional[float] = Field(
        default=0.0, description="Depth position coordinate (optional for 3D layouts)."
    )


class UINode(BaseModel):
    """
    Representation of a node optimized for the Graph UI.
    Includes visual positioning and semantic signals.
    """

    id: str = Field(description="Unique identifier for the node (matches node_id in kgdb).")
    label: str = Field(description="Display label for the node.")
    node_type: str = Field(description="The semantic type of the node (e.g., 'file', 'concept').")
    
    position: Position = Field(
        default_factory=lambda: Position(x=0.0, y=0.0, z=0.0),
        description="The spatial coordinates of the node in the visualization."
    )
    
    compliance_status: Optional[str] = Field(
        default=None,
        description="Current compliance state (e.g., 'valid', 'failing', 'pending')."
    )
    
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Arbitrary metadata used for tooltips, sidebars, and custom styling."
    )


class UIEdge(BaseModel):
    """
    Representation of a directed edge between two nodes in the Graph UI.
    """

    source: str = Field(description="The ID of the source node.")
    target: str = Field(description="The ID of the target node.")
    relation_type: str = Field(description="The type of relationship (e.g., 'contains', 'depends_on').")
    
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional edge data for visual markers or tooltips."
    )


class GraphData(BaseModel):
    """
    The top-level container for a graph slice to be rendered by the UI.
    """

    nodes: list[UINode] = Field(
        default_factory=list,
        description="A list of nodes to be displayed in the graph."
    )
    edges: list[UIEdge] = Field(
        default_factory=list,
        description="A list of edges connecting the nodes."
    )
    
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Global metadata for the graph view (e.g., layout algorithm, bounds)."
    )
