import { mockClient } from '@/mock/client';

import type { DomainData } from './types';

interface SchemaAttribute {
  type: string;
  required: boolean;
}

interface SchemaNodeType {
  id: string;
  display_name: string;
  visual: {
    color_token: string;
    icon: string;
  };
  attributes: Record<string, SchemaAttribute>;
  allowed_connections?: string[];
}

export interface GraphSchema {
  node_types: SchemaNodeType[];
}

export interface SldbFieldDescriptor {
  name: string;
  kind: string;
  required: boolean;
  enum?: Array<string | number>;
}

export interface SldbModelSchema {
  id: string;
  model_ref: string;
  fields: SldbFieldDescriptor[];
}

export interface SldbSchema {
  models: SldbModelSchema[];
}

export interface SldbDocument {
  id: string;
  model_name: string;
  path: string;
  payload: Record<string, unknown>;
  semantic_tags: string[];
}

export interface SldbGraph {
  documents: SldbDocument[];
}

export interface GraphDataProvider {
  getSchema: () => Promise<GraphSchema | SldbSchema>;
  getGraph: () => Promise<unknown>;
  saveGraph: (payload: DomainData) => Promise<{ ok: true }>;
  saveDoc?: (docId: string, payload: Record<string, unknown>) => Promise<{ ok: true; doc: string }>;
}

const mockSchema: GraphSchema = {
  node_types: [
    {
      id: 'entity',
      display_name: 'Entity',
      visual: {
        color_token: 'surface-primary',
        icon: 'circle',
      },
      attributes: {
        name: { type: 'string', required: true },
      },
    },
  ],
};

export const graphDataProvider: GraphDataProvider = {
  async getSchema() {
    return mockSchema;
  },
  async getGraph() {
    return mockClient.getGraph();
  },
  async saveGraph(_payload) {
    return { ok: true };
  },
};
