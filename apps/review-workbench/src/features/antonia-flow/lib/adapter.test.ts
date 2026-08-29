import { describe, expect, it } from 'vitest';

import { buildAntoniaGraphFromDocuments } from './adapter';

describe('buildAntoniaGraphFromDocuments', () => {
  it('builds conversation-step nodes and edges from live documents', async () => {
    const graph = await buildAntoniaGraphFromDocuments([
      {
        id: 'step-antonia-saludo',
        model_name: 'ConversationStep',
        path: 'atoms/saludo.md',
        semantic_tags: [],
        payload: {
          id: 'conversation:steps.saludo',
          title: 'Saludo',
          kind: 'interaccion_simple',
          instructions: 'Hola',
          allowed_transitions: 'conversation:steps.onboarding',
          tags: ['conversation:steps.saludo'],
        },
      },
      {
        id: 'step-antonia-onboarding',
        model_name: 'ConversationStep',
        path: 'atoms/onboarding.md',
        semantic_tags: [],
        payload: {
          id: 'conversation:steps.onboarding',
          title: 'Onboarding',
          kind: 'obtencion_datos',
          instructions: 'Continuar',
          allowed_transitions: 'ninguna (paso terminal)',
          tags: ['conversation:steps.onboarding'],
        },
      },
    ]);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toEqual([
      expect.objectContaining({
        source: 'step-antonia-saludo',
        target: 'step-antonia-onboarding',
      }),
    ]);
    expect(graph.nodes[0]?.data.payload?.value).toMatchObject({
      title: expect.any(String),
    });
  });
});
