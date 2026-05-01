"""
Graph UI editing contracts.
This module defines the models for mutating the graph state.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class EditAction(str, Enum):
    """Supported edit operations on graph elements."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


class EditMetadata(BaseModel):
    """Audit metadata for tracking who made changes and when."""
    
    author: str = Field(
        description="The identifier (user or agent) performing the edit."
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="The UTC timestamp of the edit operation."
    )
    reason: Optional[str] = Field(
        default=None,
        description="Human-readable context or reason for the change."
    )


class GraphEdit(BaseModel):
    """
    Base model for all graph edit operations.
    Encapsulates the action and the common metadata.
    """
    
    action: EditAction = Field(description="The type of mutation being performed.")
    metadata: EditMetadata = Field(description="Audit data for the edit operation.")


class NodeEdit(GraphEdit):
    """
    Represents an edit operation on a single node.
    """

    node_id: str = Field(description="The unique identifier of the target node.")
    node_type: Optional[str] = Field(
        default=None, 
        description="The semantic type of the node (required for CREATE)."
    )
    data: dict[str, Any] = Field(
        default_factory=dict,
        description="New or updated attributes for the node."
    )


class EdgeEdit(GraphEdit):
    """
    Represents an edit operation on a directed edge.
    """

    source: str = Field(description="The ID of the source node.")
    target: str = Field(description="The ID of the target node.")
    relation_type: str = Field(description="The semantic type of the relationship.")
    data: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata or properties for the edge."
    )
