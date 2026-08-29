import { useEffect } from 'react';

import { GraphEditor } from '@/features/graph-editor/L2-canvas/GraphEditor';
import { registerDefaultNodeTypes } from '@/schema/register-defaults';
import { useGraphStore } from '@/stores/graph-store';

import { buildAntoniaGraph } from './lib/adapter';

export function AntoniaFlowPage() {
  useEffect(() => {
    registerDefaultNodeTypes();

    let cancelled = false;

    const load = async () => {
      const graph = await buildAntoniaGraph();
      if (cancelled) {
        return;
      }

      useGraphStore.getState().loadGraph(graph.nodes, graph.edges);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GraphEditor
      initialNodes={[]}
      initialEdges={[]}
      onSave={() => {}}
      hero={{
        eyebrow: 'Conversation Flow',
        title: 'Antonia — real ConversationStep atoms',
        description: '12 steps + 20 transitions projected from the sldb model',
      }}
      workspace={{
        label: 'Typed canvas',
        title: 'Antonia flow',
        description: 'Schema-driven rendering of the real conversation model',
      }}
    />
  );
}
