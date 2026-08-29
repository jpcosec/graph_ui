import { z } from 'zod';

import type { SldbSchema } from '@/features/graph-editor/lib/data-provider';
import { registry } from '@/schema/registry';
import { detailRendererFor, PlaceholderDot, PlaceholderLabel } from '@/schema/renderer-helpers';
import type { NodeTypeDefinition } from '@/schema/registry.types';

function slugifyModelId(modelId: string): string {
  return modelId
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function resolveTypeId(modelId: string): string {
  if (modelId === 'ConversationStep' && registry.get('conversation-step')) {
    return 'conversation-step';
  }

  const slug = slugifyModelId(modelId);
  if (registry.get(slug)) {
    return slug;
  }

  return slug;
}

function createDefinition(typeId: string, modelId: string, fields: NodeTypeDefinition['fields']): NodeTypeDefinition {
  return {
    typeId,
    label: modelId,
    icon: 'circle',
    category: 'entity',
    colorToken: `token-${typeId}`,
    payloadSchema: z.object({}).passthrough(),
    fields,
    renderers: {
      dot: PlaceholderDot,
      label: PlaceholderLabel,
      detail: detailRendererFor(modelId, `token-${typeId}`),
    },
    defaultSize: { width: 220, height: 100 },
    allowedConnections: [],
  };
}

export function registerModelsFromSchema(schema: SldbSchema): void {
  schema.models.forEach((model) => {
    const typeId = resolveTypeId(model.id);
    const existing = registry.get(typeId);

    if (existing) {
      registry.register({
        ...existing,
        payloadSchema: z.object({}).passthrough(),
        fields: model.fields,
      });
      return;
    }

    registry.register(createDefinition(typeId, model.id, model.fields));
  });
}
