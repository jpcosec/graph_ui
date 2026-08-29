import type { DomainData } from './types';
import type { SldbGraph, SldbSchema } from './data-provider';

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  return data;
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;

    try {
      const errorData = (await response.json()) as { error?: string };
      if (typeof errorData.error === 'string' && errorData.error.trim().length > 0) {
        message = errorData.error;
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text.trim().length > 0) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return readJson<T>(response);
}

export interface SldbDataProvider {
  getSchema: () => Promise<SldbSchema>;
  getGraph: () => Promise<SldbGraph>;
  saveGraph: (payload: DomainData) => Promise<{ ok: true }>;
  saveDoc: (docId: string, payload: Record<string, unknown>) => Promise<{ ok: true; doc: string }>;
}

let schemaRequest: Promise<SldbSchema> | null = null;
let graphRequest: Promise<SldbGraph> | null = null;

function getSchemaOnce(): Promise<SldbSchema> {
  if (!schemaRequest) {
    schemaRequest = requestJson<SldbSchema>('/sldb/schema').finally(() => {
      schemaRequest = null;
    });
  }

  return schemaRequest;
}

function getGraphOnce(): Promise<SldbGraph> {
  if (!graphRequest) {
    graphRequest = requestJson<SldbGraph>('/sldb/graph').finally(() => {
      graphRequest = null;
    });
  }

  return graphRequest;
}

export const sldbProvider: SldbDataProvider = {
  async getSchema() {
    return getSchemaOnce();
  },
  async getGraph() {
    return getGraphOnce();
  },
  async saveGraph(_payload: DomainData) {
    return { ok: true };
  },
  async saveDoc(docId, payload) {
    return requestJson<{ ok: true; doc: string }>('/sldb/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doc: docId, payload }),
    });
  },
};
