export interface RawNode {
  id: string;
  type: string;
  name: string;
  properties: Record<string, string>;
  children?: RawNode[];
}

export interface RawEdge {
  id: string;
  source: string;
  target: string;
  relationType: string;
  properties?: Record<string, string>;
}

export interface RawData {
  nodes: RawNode[];
  edges: RawEdge[];
}

export type {
  ASTEdge,
  ASTNode,
  NodePayload,
  ValidationError,
  ValidatedAST,
} from '@/stores/types';
