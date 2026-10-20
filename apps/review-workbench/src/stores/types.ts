/** Graph store type definitions */
export type NodePayload = {
  typeId?: string;
  value?: unknown;
};

export type NodeData = {
  typeId?: string;
  payload?: NodePayload;
  properties?: Record<string, string>;
  visualToken?: string;
  label?: string;
  name?: string;
  /** Group category ('document', 'section', 'folder'); picks the group's border colour. */
  category?: string;
  /** Free text a node can show instead of its payload (e.g. an unknown node type's notice). */
  message?: string;
  /** Ids of contained nodes, when the node is a container. */
  childIds?: string[];
  /** How a view's notation draws this node (glyph, shape, resolved style); see views-provider. */
  notation?: import('@/features/graph-editor/lib/views-provider').NodeNotation;
  /** The notation's ink per theme: the text colour over a declared fill. */
  ink?: import('@/features/graph-editor/lib/views-provider').Themed | null;
};

export interface ASTNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  parentId?: string;
  extent?: 'parent' | string;
  style?: React.CSSProperties;
  selected?: boolean;
  hidden?: boolean;
}

export interface ASTEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data?: {
    relationType: string;
    properties?: Record<string, string>;
    _originalSource?: string;
    _originalTarget?: string;
    _originalRelationType?: string;
    /** How a view's notation draws this edge (line, colour, arrowhead). */
    notation?: import('@/features/graph-editor/lib/views-provider').EdgeNotation | null;
  };
  selected?: boolean;
  hidden?: boolean;
}

export interface SemanticAction {
  type: 'CREATE_ELEMENTS' | 'DELETE_ELEMENTS' | 'UPDATE_NODE' | 'UPDATE_EDGE';
  payload: unknown;
  timestamp: number;
  actor?: string;
  affectedIds: string[];
}

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidatedAST {
  nodes: ASTNode[];
  edges: ASTEdge[];
  errors: ValidationError[];
}
