import { describe, expect, it } from 'vitest';

import { buildAntoniaGraphFromDocuments, buildEdgesFromAuthoredRelations } from './adapter';
import type { SldbDocument } from '@/features/graph-editor/lib/data-provider';

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

  // RELATION_MODEL_LAYER_SPEC: authored relations (RelationDoc) drive edges,
  // equivalent to kgdb's assemble_authored_graph. UI == CLI.
  it('builds edges from authored RelationDoc instances (not text fields)', async () => {
    const content: SldbDocument[] = ['step-1', 'step-2', 'step-3'].map((id) => ({
      id,
      model_name: 'ConversationStep',
      path: `atoms/${id}.md`,
      semantic_tags: ['type.content'],
      payload: { title: id },
    }));
    const relations: SldbDocument[] = [
      {
        id: 'e1',
        model_name: 'RelationDoc',
        path: 'atoms/e1.md',
        semantic_tags: ['layer.topology', 'type.relation.instance'],
        payload: { source_id: 'step-1', target_id: 'step-2', relation_type: 'flows_to' },
      },
      {
        id: 'e2',
        model_name: 'RelationDoc',
        path: 'atoms/e2.md',
        semantic_tags: ['layer.topology', 'type.relation.instance'],
        payload: { source_id: 'step-2', target_id: 'step-3', relation_type: 'flows_to' },
      },
    ];

    const graph = await buildAntoniaGraphFromDocuments([...content, ...relations]);
    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges.map((e) => [e.source, e.target, e.data?.relationType])).toEqual([
      ['step-1', 'step-2', 'flows_to'],
      ['step-2', 'step-3', 'flows_to'],
    ]);
  });

  it('drops orphan authored relations (referential integrity)', () => {
    const nodeIds = new Set(['step-1', 'step-2']);
    const { edges, dropped } = buildEdgesFromAuthoredRelations(
      [
        {
          id: 'ok',
          model_name: 'RelationDoc',
          path: 'atoms/ok.md',
          semantic_tags: ['type.relation.instance'],
          payload: { source_id: 'step-1', target_id: 'step-2', relation_type: 'flows_to' },
        },
        {
          id: 'bad',
          model_name: 'RelationDoc',
          path: 'atoms/bad.md',
          semantic_tags: ['type.relation.instance'],
          payload: { source_id: 'step-1', target_id: 'ghost', relation_type: 'flows_to' },
        },
      ],
      nodeIds,
    );
    expect(edges).toHaveLength(1);
    expect(dropped).toEqual(['bad']);
  });
});
