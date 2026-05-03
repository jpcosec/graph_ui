import { z } from 'zod';

import type { NodeTypeRegistry } from '@/schema/registry';
import type { NodeTypeDefinition } from '@/schema/registry.types';
import type { ASTEdge, ASTNode } from '@/stores/types';

import { HumCard, HumDot, HumLabel } from '../renderers';
import { humBodyModel } from './mock-data';
import type { HumAstFile, HumBodyModel, HumRoutine, HumTrace, HumViewMode } from './types';

const humNodeKinds = ['hum-body', 'hum-organ', 'hum-capability', 'hum-artifact', 'hum-routine-step', 'hum-trace-event', 'hum-ast-file', 'hum-ast-form'] as const;
let humNodeTypesRegistered = false;

function propertyRecord(entries: Array<[string, string | number | undefined]>): Record<string, string> {
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
}

function makeNode(
  id: string,
  typeId: (typeof humNodeKinds)[number],
  label: string,
  position: { x: number; y: number },
  visualToken: string,
  properties: Record<string, string>,
  extra: Record<string, unknown> = {},
): ASTNode {
  return {
    id,
    type: 'default',
    position,
    data: {
      typeId,
      label,
      category: typeId.replace('hum-', ''),
      visualToken,
      properties,
      payload: {
        typeId,
        value: {
          title: label,
          ...extra,
        },
      },
    },
  };
}

function makeGroupNode(
  id: string,
  typeId: 'hum-ast-file',
  label: string,
  position: { x: number; y: number },
  visualToken: string,
  properties: Record<string, string>,
  size: { width: number; height: number },
  extra: Record<string, unknown> = {},
): ASTNode {
  return {
    id,
    type: 'group',
    position,
    style: {
      width: size.width,
      height: size.height,
    },
    data: {
      typeId,
      label,
      category: 'folder',
      visualToken,
      properties,
      payload: {
        typeId,
        value: {
          title: label,
          ...extra,
        },
      },
    },
  };
}

function edge(id: string, source: string, target: string, relationType: string): ASTEdge {
  return {
    id,
    source,
    target,
    type: 'floating',
    data: {
      relationType,
      properties: {},
    },
  };
}

function organVisualToken(organId: string): string {
  return {
    'organ-core': 'token-hum-core',
    'organ-system': 'token-hum-system',
    'organ-tools': 'token-hum-tools',
    'organ-energy': 'token-hum-energy',
    'organ-context': 'token-hum-context',
    'organ-thoughts': 'token-hum-thoughts',
    'organ-knowledge': 'token-hum-knowledge',
    'organ-stats': 'token-hum-stats',
  }[organId] ?? 'token-hum-system';
}

export function registerHumNodeTypes(targetRegistry: Pick<NodeTypeRegistry, 'register'>): void {
  if (humNodeTypesRegistered) {
    return;
  }

  const baseSchema = z.object({
    title: z.string().optional(),
    packageName: z.string().optional(),
    functionName: z.string().optional(),
    filePath: z.string().optional(),
    artifactPath: z.string().optional(),
    routineId: z.string().optional(),
    traceId: z.string().optional(),
    status: z.string().optional(),
    energyDelta: z.number().optional(),
    description: z.string().optional(),
  });

  const definitions: NodeTypeDefinition[] = [
    {
      typeId: 'hum-body',
      label: 'HUM Body',
      icon: 'bot',
      category: 'body',
      colorToken: 'token-hum-body',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 260, height: 86 },
      allowedConnections: ['hum-organ', 'hum-routine-step', 'hum-trace-event'],
    },
    {
      typeId: 'hum-organ',
      label: 'Organ',
      icon: 'brain',
      category: 'organ',
      colorToken: 'token-hum-core',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 220, height: 78 },
      allowedConnections: ['hum-capability', 'hum-artifact', 'hum-routine-step', 'hum-trace-event'],
    },
    {
      typeId: 'hum-capability',
      label: 'Capability',
      icon: 'wrench',
      category: 'capability',
      colorToken: 'token-hum-tools',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 230, height: 78 },
      allowedConnections: ['hum-capability', 'hum-artifact', 'hum-routine-step', 'hum-trace-event'],
    },
    {
      typeId: 'hum-artifact',
      label: 'Artifact',
      icon: 'file-code-2',
      category: 'artifact',
      colorToken: 'token-hum-memory',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 210, height: 72 },
      allowedConnections: ['hum-trace-event', 'hum-routine-step'],
    },
    {
      typeId: 'hum-routine-step',
      label: 'Routine Step',
      icon: 'activity',
      category: 'routine-step',
      colorToken: 'token-hum-routine',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 230, height: 72 },
      allowedConnections: ['hum-capability', 'hum-organ', 'hum-trace-event'],
    },
    {
      typeId: 'hum-trace-event',
      label: 'Trace Event',
      icon: 'gauge',
      category: 'trace-event',
      colorToken: 'token-hum-trace',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 240, height: 72 },
      allowedConnections: ['hum-capability', 'hum-artifact', 'hum-routine-step'],
    },
    {
      typeId: 'hum-ast-file',
      label: 'Lisp File',
      icon: 'folder-tree',
      category: 'folder',
      colorToken: 'token-hum-system',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 260, height: 120 },
      allowedConnections: ['hum-ast-form'],
    },
    {
      typeId: 'hum-ast-form',
      label: 'Lisp Form',
      icon: 'braces',
      category: 'concept',
      colorToken: 'token-hum-memory',
      payloadSchema: baseSchema,
      renderers: { dot: HumDot, label: HumLabel, detail: HumCard },
      defaultSize: { width: 220, height: 68 },
      allowedConnections: ['hum-ast-form', 'hum-routine-step', 'hum-trace-event'],
    },
  ];

  definitions.forEach((definition) => targetRegistry.register(definition));
  humNodeTypesRegistered = true;
}

function anatomyNodes(model: HumBodyModel): ASTNode[] {
  const nodes: ASTNode[] = [
    makeNode(
      'hum-body',
      'hum-body',
      'HUM',
      { x: 670, y: 0 },
      'token-hum-body',
      propertyRecord([
        ['view', 'Embodied shell'],
        ['scope', 'Packages, tools, routines, traces'],
      ]),
      {
        description: 'Hum visualized as a body whose packages are organs and whose routines/traces are motion through that body.',
      },
    ),
  ];

  for (const organ of model.organs) {
    nodes.push(
      makeNode(
        organ.id,
        'hum-organ',
        organ.label,
        organ.position,
        organ.colorToken,
        propertyRecord([
          ['package', organ.packageName],
          ['file', organ.filePath],
        ]),
        {
          packageName: organ.packageName,
          filePath: organ.filePath,
          description: organ.description,
          badges: ['organ'],
        },
      ),
    );
  }

  for (const capability of model.capabilities) {
    const typeId = capability.kind === 'tool' ? 'hum-capability' : 'hum-capability';
    nodes.push(
      makeNode(
        capability.id,
        typeId,
        capability.label,
        capability.position,
        organVisualToken(capability.organId),
        propertyRecord([
          ['function', capability.functionName],
          ['role', capability.role],
        ]),
        {
          functionName: capability.functionName,
          filePath: capability.filePath,
          description: capability.description,
          badges: [capability.kind === 'tool' ? 'tool' : 'capability', capability.role],
        },
      ),
    );
  }

  for (const artifact of model.artifacts) {
    nodes.push(
      makeNode(
        artifact.id,
        'hum-artifact',
        artifact.label,
        artifact.position,
        'token-hum-memory',
        propertyRecord([
          ['path', artifact.artifactPath],
          ['owner', artifact.ownerId],
        ]),
        {
          artifactPath: artifact.artifactPath,
          description: artifact.description,
          badges: ['artifact'],
        },
      ),
    );
  }

  return nodes;
}

function structureNodes(model: HumBodyModel): ASTNode[] {
  const nodes: ASTNode[] = [];

  for (const file of model.astFiles) {
    nodes.push(
      makeGroupNode(
        file.id,
        'hum-ast-file',
        file.label,
        file.position,
        'token-hum-system',
        propertyRecord([
          ['path', file.filePath],
          ['layer', 'lisp-ast'],
          ['formCount', model.astForms.filter((form) => form.fileId === file.id).length],
        ]),
        file.size,
        {
          filePath: file.filePath,
          description: file.description,
          badges: ['file', 'ast'],
        },
      ),
    );
  }

  for (const form of model.astForms) {
    const parent = model.astFiles.find((candidate) => candidate.id === form.fileId);
    nodes.push({
      ...makeNode(
        form.id,
        'hum-ast-form',
        form.label,
        form.position,
        'token-hum-memory',
        propertyRecord([
          ['form', form.formType],
          ['file', parent?.label],
        ]),
        {
          filePath: parent?.filePath,
          description: form.description,
          badges: ['form', form.formType],
        },
      ),
      parentId: form.fileId,
      extent: 'parent',
    });
  }

  return nodes;
}

function structureEdges(model: HumBodyModel): ASTEdge[] {
  const edges: ASTEdge[] = [];

  const findFormId = (matcher: (label: string) => boolean) => model.astForms.find((form) => matcher(form.label))?.id;

  for (const organ of model.organs) {
    const pkgFormId = findFormId((label) => label.includes(organ.packageName));
    if (pkgFormId) {
      edges.push(edge(`ast-package-${pkgFormId}-${organ.id}`, pkgFormId, organ.id, 'declares'));
    }
  }

  const callMap: Array<[string | undefined, string | undefined, string]> = [
    [findFormId((label) => label.includes('consulta-llm')), findFormId((label) => label.includes('run-system-command')), 'calls'],
    [findFormId((label) => label.includes('consulta-llm')), findFormId((label) => label.includes('calculate-systemic-energy')), 'reads'],
    [findFormId((label) => label.includes('ejecutar-accion')), findFormId((label) => label.includes('call-tool')), 'calls'],
    [findFormId((label) => label.includes('agente')), findFormId((label) => label.includes('save-context')), 'writes'],
    [findFormId((label) => label.includes('agente')), findFormId((label) => label.includes('save-thoughts')), 'writes'],
    [findFormId((label) => label.includes('agente')), findFormId((label) => label.includes('save-stats')), 'writes'],
    [findFormId((label) => label.includes('agente')), findFormId((label) => label.includes('dump-raw-log')), 'writes'],
    [findFormId((label) => label.includes('loop-autopoyetico')), findFormId((label) => label.includes('commit-state')), 'commits'],
    [findFormId((label) => label.includes('inspeccionar-self')), findFormId((label) => label.includes('run-system-command')), 'calls'],
    [findFormId((label) => label.includes('ejecuta-shell')), findFormId((label) => label.includes('run-system-command')), 'calls'],
  ];

  for (const [source, target, relation] of callMap) {
    if (!source || !target) {
      continue;
    }
    edges.push(edge(`ast-${source}-${target}`, source, target, relation));
  }

  return edges;
}

function anatomyEdges(model: HumBodyModel): ASTEdge[] {
  const edges: ASTEdge[] = [];

  for (const organ of model.organs) {
    edges.push(edge(`contains-${organ.id}`, 'hum-body', organ.id, 'contains'));
  }

  for (const capability of model.capabilities) {
    edges.push(edge(`contains-${capability.organId}-${capability.id}`, capability.organId, capability.id, 'contains'));
  }

  for (const artifact of model.artifacts) {
    edges.push(edge(`writes-${artifact.ownerId}-${artifact.id}`, artifact.ownerId, artifact.id, 'writes'));
  }

  edges.push(edge('calls-core-system', 'cap-consulta-llm', 'cap-run-system-command', 'calls'));
  edges.push(edge('calls-core-confirm', 'cap-consulta-llm', 'cap-pedir-confirmacion', 'flows-to'));
  edges.push(edge('calls-confirm-execute', 'cap-pedir-confirmacion', 'cap-ejecutar-accion', 'flows-to'));
  edges.push(edge('calls-execute-tools', 'cap-ejecutar-accion', 'tool-ejecuta-shell', 'calls'));
  edges.push(edge('calls-execute-self', 'cap-ejecutar-accion', 'tool-inspeccionar-self', 'calls'));
  edges.push(edge('calls-core-energy', 'cap-consulta-llm', 'cap-calculate-energy', 'reads'));
  edges.push(edge('calls-close-commit', 'cap-loop-autopoietico', 'cap-commit-state', 'commits'));
  edges.push(edge('reads-env', 'cap-consulta-llm', 'artifact-env', 'reads'));
  edges.push(edge('writes-journal', 'cap-dump-raw-log', 'artifact-session-log', 'writes'));

  return edges;
}

function routineOverlay(routine: HumRoutine): { nodes: ASTNode[]; edges: ASTEdge[] } {
  const nodes: ASTNode[] = [];
  const edges: ASTEdge[] = [];
  const startX = 1360;
  const stepY = 90;

  routine.steps.forEach((step, index) => {
    const id = `routine-${routine.id}-${step.id}`;
    nodes.push(
      makeNode(
        id,
        'hum-routine-step',
        step.label,
        { x: startX, y: 90 + index * stepY },
        'token-hum-routine',
        propertyRecord([
          ['routine', routine.label],
          ['status', step.status ?? 'expected'],
        ]),
        {
          routineId: routine.id,
          status: step.status ?? 'expected',
          description: step.description,
          badges: [routine.id, step.status ?? 'expected'],
        },
      ),
    );

    if (index > 0) {
      edges.push(edge(`routine-flow-${routine.id}-${index}`, `routine-${routine.id}-${routine.steps[index - 1]?.id}`, id, 'flows-to'));
    }

    edges.push(edge(`routine-call-${routine.id}-${step.id}`, id, step.targetId, 'calls'));
  });

  return { nodes, edges };
}

function traceOverlay(trace: HumTrace, includeRoutineLinks: boolean): { nodes: ASTNode[]; edges: ASTEdge[] } {
  const nodes: ASTNode[] = [];
  const edges: ASTEdge[] = [];
  const startX = 1660;
  const stepY = 90;

  trace.events.forEach((event, index) => {
    const id = `trace-${trace.id}-${event.id}`;
    nodes.push(
      makeNode(
        id,
        'hum-trace-event',
        event.label,
        { x: startX, y: 90 + index * stepY },
        'token-hum-trace',
        propertyRecord([
          ['trace', trace.label],
          ['outcome', event.outcome],
          ['energy', event.energyDelta],
        ]),
        {
          traceId: trace.id,
          status: event.outcome,
          energyDelta: event.energyDelta,
          description: event.description,
          badges: [trace.id, event.outcome],
        },
      ),
    );

    if (index > 0) {
      edges.push(edge(`trace-flow-${trace.id}-${index}`, `trace-${trace.id}-${trace.events[index - 1]?.id}`, id, 'flows-to'));
    }

    edges.push(edge(`trace-instantiates-${trace.id}-${event.id}`, id, event.targetId, 'instantiates'));

    if (includeRoutineLinks && event.mirrorsStepId) {
      edges.push(
        edge(
          `trace-mirrors-${trace.id}-${event.id}`,
          id,
          `routine-${trace.routineId}-${event.mirrorsStepId}`,
          event.outcome === 'failed' || event.outcome === 'looping' ? 'deviates-from' : 'mirrors',
        ),
      );
    }
  });

  return { nodes, edges };
}

export function buildHumViewGraph(
  mode: HumViewMode,
  routineId: string,
  traceId: string,
  model: HumBodyModel = humBodyModel,
): { nodes: ASTNode[]; edges: ASTEdge[] } {
  if (mode === 'structure') {
    return {
      nodes: structureNodes(model),
      edges: structureEdges(model),
    };
  }

  const nodes = anatomyNodes(model);
  const edges = anatomyEdges(model);

  const routine = model.routines.find((candidate) => candidate.id === routineId) ?? model.routines[0];
  const trace = model.traces.find((candidate) => candidate.id === traceId) ?? model.traces[0];

  if (!routine || !trace) {
    return { nodes, edges };
  }

  const includeRoutineOverlay = mode === 'routine' || mode === 'compare';
  const includeTraceOverlay = mode === 'trace' || mode === 'compare';

  if (includeRoutineOverlay) {
    const overlay = routineOverlay(routine);
    nodes.push(...overlay.nodes);
    edges.push(...overlay.edges);
  }

  if (includeTraceOverlay) {
    const overlay = traceOverlay(trace, includeRoutineOverlay && trace.routineId === routine.id);
    nodes.push(...overlay.nodes);
    edges.push(...overlay.edges);
  }

  return { nodes, edges };
}

export function summarizeHumSelection(mode: HumViewMode, routineId: string, traceId: string, model: HumBodyModel = humBodyModel) {
  const routine = model.routines.find((candidate) => candidate.id === routineId) ?? model.routines[0];
  const trace = model.traces.find((candidate) => candidate.id === traceId) ?? model.traces[0];

  return {
    astFiles: model.astFiles.length,
    astForms: model.astForms.length,
    organs: model.organs.length,
    capabilities: model.capabilities.length,
    artifacts: model.artifacts.length,
    routineSteps: routine?.steps.length ?? 0,
    traceEvents: trace?.events.length ?? 0,
    mode,
    routineLabel: routine?.label ?? 'Unknown routine',
    traceLabel: trace?.label ?? 'Unknown trace',
  };
}
