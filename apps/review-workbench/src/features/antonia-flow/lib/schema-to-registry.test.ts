import { describe, expect, it } from 'vitest';

import { registerDefaultNodeTypes } from '@/schema/register-defaults';
import { registry } from '@/schema/registry';

import { registerModelsFromSchema } from './schema-to-registry';

describe('registerModelsFromSchema', () => {
  it('merges live field descriptors into the existing conversation-step definition', () => {
    registerDefaultNodeTypes();

    registerModelsFromSchema({
      models: [
        {
          id: 'ConversationStep',
          model_ref: 'conversation.step',
          fields: [
            { name: 'id', kind: 'string', required: true },
            { name: 'kind', kind: 'enum', required: true, enum: ['interaccion_simple', 'obtencion_datos'] },
          ],
        },
      ],
    });

    const definition = registry.get('conversation-step');

    expect(definition?.fields).toEqual([
      { name: 'id', kind: 'string', required: true },
      { name: 'kind', kind: 'enum', required: true, enum: ['interaccion_simple', 'obtencion_datos'] },
    ]);
    expect(definition?.category).toBe('conversation');
  });
});
