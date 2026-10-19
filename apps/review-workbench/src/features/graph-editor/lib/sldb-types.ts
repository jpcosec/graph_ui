/** The shapes `sldb serve` returns (`/sldb/schema`, `/sldb/graph`), as sldbProvider reads them. */

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
