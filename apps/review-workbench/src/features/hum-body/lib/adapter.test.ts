import { describe, expect, it, vi } from 'vitest';

import type { SldbDocument } from '@/features/graph-editor/lib/data-provider';

import {
  buildHumModelFromDocuments,
  buildHumViewGraph,
  registerHumNodeTypes,
  summarizeHumSelection,
} from './adapter';

const liveDocuments: SldbDocument[] = [
  {
    id: 'organ-tools',
    model_name: 'OrganDoc',
    path: 'hum/organs/tools.md',
    semantic_tags: [],
    payload: {
      title: 'Tools',
      package_name: ':hum.tools',
      file_path: 'hum/execution/tools.lisp',
      position: { x: 930, y: 120 },
      color_token: 'token-hum-tools',
    },
  },
  {
    id: 'tool-inspect',
    model_name: 'CapabilityDoc',
    path: 'hum/capabilities/inspect.md',
    semantic_tags: [],
    payload: {
      title: 'inspect',
      organ_id: 'organ-tools',
      function_name: 'inspect',
      role: 'self-inspection',
      kind: 'tool',
    },
  },
  {
    id: 'artifact-journal',
    model_name: 'ArtifactDoc',
    path: 'hum/artifacts/journal.md',
    semantic_tags: [],
    payload: {
      title: 'journal.lisp',
      owner_id: 'organ-tools',
      artifact_path: 'hum/journal.lisp',
    },
  },
  {
    id: 'ast-agent-core',
    model_name: 'AstFileDoc',
    path: 'hum/files/agent-core.md',
    semantic_tags: [],
    payload: {
      title: 'agent/core.lisp',
      file_path: 'hum/agent/core.lisp',
      size: { width: 372, height: 220 },
    },
  },
  {
    id: 'ast-agent-core-form-agent',
    model_name: 'AstFormDoc',
    path: 'hum/forms/agent.md',
    semantic_tags: [],
    payload: {
      title: '(defun agent ...)',
      file_id: 'ast-agent-core',
      form_type: 'defun',
      position: { x: 18, y: 74 },
    },
  },
  {
    id: 'task-execution',
    model_name: 'RoutineDoc',
    path: 'hum/routines/task-execution.md',
    semantic_tags: [],
    payload: {
      title: 'Task Execution',
      steps: [{
        id: 'execute',
        label: 'Execute',
        target_id: 'tool-inspect',
        description: 'Inspect the running body.',
        status: 'critical',
      }],
    },
  },
  {
    id: 'trace-inspection',
    model_name: 'TraceDoc',
    path: 'hum/traces/inspection.md',
    semantic_tags: [],
    payload: {
      title: 'Inspection Trace',
      routine_id: 'task-execution',
      events: [{
        id: 'inspect-event',
        label: 'Inspect',
        target_id: 'tool-inspect',
        outcome: 'looping',
        mirrors_step_id: 'execute',
      }],
    },
  },
];

describe('HUM body adapter', () => {
  it('registers all HUM node kinds into the registry writer', () => {
    const register = vi.fn();

    registerHumNodeTypes({ register });

    expect(register).toHaveBeenCalledTimes(7);
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ typeId: 'hum-organ' }));
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ typeId: 'hum-trace-event' }));
  });

  it('builds its model from live SLDB documents and ignores unrelated model names', () => {
    const model = buildHumModelFromDocuments([
      ...liveDocuments,
      {
        id: 'platform-doc',
        model_name: 'PlatformDoc',
        path: 'docs/platform.md',
        semantic_tags: [],
        payload: { title: 'Platform' },
      },
    ]);

    expect(model.organs.map((organ) => organ.label)).toEqual(['Tools']);
    expect(model.capabilities[0]).toMatchObject({ organId: 'organ-tools', functionName: 'inspect' });
    expect(model.astFiles).toHaveLength(1);
    expect(model.astForms).toHaveLength(1);
    expect(model.routines[0]?.steps[0]).toMatchObject({ id: 'execute', targetId: 'tool-inspect' });
    expect(model.traces[0]).toMatchObject({ routineId: 'task-execution' });
  });

  it('builds anatomy and structure views without fixture-only or dangling edges', () => {
    const model = buildHumModelFromDocuments(liveDocuments);
    const body = buildHumViewGraph('body', 'task-execution', 'trace-inspection', model);
    const structure = buildHumViewGraph('structure', '', '', model);

    expect(body.nodes.map((node) => node.id)).toEqual(expect.arrayContaining([
      'organ-tools',
      'tool-inspect',
      'artifact-journal',
    ]));
    expect(body.edges.every((candidate) =>
      body.nodes.some((node) => node.id === candidate.source)
      && body.nodes.some((node) => node.id === candidate.target))).toBe(true);

    const fileNode = structure.nodes.find((node) => node.id === 'ast-agent-core');
    const formNode = structure.nodes.find((node) => node.id === 'ast-agent-core-form-agent');
    expect(fileNode?.type).toBe('group');
    expect(formNode).toMatchObject({ parentId: 'ast-agent-core', hidden: true });
  });

  it('renders routine and trace independently and links both in compare mode', () => {
    const model = buildHumModelFromDocuments(liveDocuments);
    const routineOnlyModel = { ...model, traces: [] };
    const routine = buildHumViewGraph('routine', 'task-execution', '', routineOnlyModel);
    const compare = buildHumViewGraph('compare', 'task-execution', 'trace-inspection', model);

    expect(routine.nodes.some((node) => node.id === 'routine-task-execution-execute')).toBe(true);
    expect(compare.nodes.some((node) => node.id === 'trace-trace-inspection-inspect-event')).toBe(true);
    expect(compare.edges).toContainEqual(expect.objectContaining({
      id: 'trace-mirrors-trace-inspection-inspect-event',
      data: expect.objectContaining({ relationType: 'deviates-from' }),
    }));
  });

  it('summarizes the current live selection', () => {
    const model = buildHumModelFromDocuments(liveDocuments);
    const summary = summarizeHumSelection('compare', 'task-execution', 'trace-inspection', model);

    expect(summary).toMatchObject({
      mode: 'compare',
      astFiles: 1,
      astForms: 1,
      organs: 1,
      capabilities: 1,
      routineSteps: 1,
      traceEvents: 1,
      routineLabel: 'Task Execution',
      traceLabel: 'Inspection Trace',
    });
  });
});
