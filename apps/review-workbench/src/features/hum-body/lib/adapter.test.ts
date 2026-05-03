import { describe, expect, it, vi } from 'vitest';

import { buildHumViewGraph, registerHumNodeTypes, summarizeHumSelection } from './adapter';

describe('HUM body adapter', () => {
  it('registers all HUM node kinds into the registry writer', () => {
    const register = vi.fn();

    registerHumNodeTypes({ register });

    expect(register).toHaveBeenCalledTimes(8);
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({ typeId: 'hum-body' }),
    );
    expect(register).toHaveBeenCalledWith(
      expect.objectContaining({ typeId: 'hum-trace-event' }),
    );
  });

  it('builds the anatomy view with HUM root, organs, capabilities, and artifacts', () => {
    const graph = buildHumViewGraph('body', 'task-execution', 'trace-inspection-loop');

    expect(graph.nodes.some((node) => node.id === 'hum-body')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'organ-tools')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'tool-inspeccionar-self')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'artifact-journal')).toBe(true);
    expect(graph.edges.some((edge) => edge.data?.relationType === 'contains')).toBe(true);
  });

  it('builds a collapsible Lisp structure view with AST file groups and forms', () => {
    const graph = buildHumViewGraph('structure', 'task-execution', 'trace-inspection-loop');

    const fileNode = graph.nodes.find((node) => node.id === 'ast-agent-core');
    const formNode = graph.nodes.find((node) => node.id.includes('ast-agent-core-form-agente-'));

    expect(fileNode?.type).toBe('group');
    expect(formNode?.parentId).toBe('ast-agent-core');
    expect(graph.edges.some((edge) => edge.data?.relationType === 'declares')).toBe(true);
    expect(graph.edges.some((edge) => edge.data?.relationType === 'calls')).toBe(true);
  });

  it('adds routine and trace overlays in compare mode', () => {
    const graph = buildHumViewGraph('compare', 'task-execution', 'trace-inspection-loop');

    expect(graph.nodes.some((node) => node.id === 'routine-task-execution-rt-execute')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'trace-trace-inspection-loop-te-loop')).toBe(true);
    expect(
      graph.edges.some(
        (edge) => edge.id === 'trace-mirrors-trace-inspection-loop-te-loop' && edge.data?.relationType === 'deviates-from',
      ),
    ).toBe(true);
  });

  it('summarizes the current view selection for the operator panel', () => {
    const summary = summarizeHumSelection('compare', 'task-execution', 'trace-inspection-loop');

    expect(summary.mode).toBe('compare');
    expect(summary.astFiles).toBeGreaterThanOrEqual(10);
    expect(summary.astForms).toBeGreaterThanOrEqual(30);
    expect(summary.organs).toBeGreaterThanOrEqual(7);
    expect(summary.capabilities).toBeGreaterThanOrEqual(10);
    expect(summary.routineLabel).toBe('Task Execution');
    expect(summary.traceLabel).toBe('Inspection Loop');
  });
});
