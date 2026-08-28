import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

export interface LayoutOptions {
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  nodeSpacing?: number;
  rankSpacing?: number;
  rootId?: string;
  interfacesOnly?: boolean;
  interfaceRelationTypes?: string[];
  center?: { x: number; y: number };
  ringSpacing?: number;
}

export type LayoutNode = {
  id: string;
  width?: number;
  height?: number;
};

export type LayoutEdge = {
  id: string;
  source: string;
  target: string;
  data?: {
    relationType?: string;
  };
};

export type LayoutResult = Array<{ id: string; position: { x: number; y: number } }>;

export interface LayoutStrategy {
  computeLayout: (nodes: LayoutNode[], edges: LayoutEdge[], config?: LayoutOptions) => Promise<LayoutResult>;
}

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;
const DEFAULT_RING_SPACING = 240;
const DEFAULT_LAYOUT_STRATEGY_NAME = 'elk-layered';
const DEFAULT_INTERFACE_RELATION_TYPES = ['inherited'];

function resolveNodeSize(node: LayoutNode) {
  return {
    width: node.width ?? DEFAULT_NODE_WIDTH,
    height: node.height ?? DEFAULT_NODE_HEIGHT,
  };
}

const ELK_DIRECTION: Record<NonNullable<LayoutOptions['direction']>, string> = {
  LR: 'RIGHT',
  RL: 'LEFT',
  TB: 'DOWN',
  BT: 'UP',
};

export async function computeElkLayeredLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions = {},
): Promise<LayoutResult> {
  if (nodes.length === 0) {
    return [];
  }

  const direction = options.direction ?? 'LR';

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': ELK_DIRECTION[direction],
      'elk.spacing.nodeNode': String(options.nodeSpacing ?? 50),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(options.rankSpacing ?? 100),
    },
    children: nodes.map((node) => {
      const { width, height } = resolveNodeSize(node);
      return { id: node.id, width, height };
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const laidOut = await elk.layout(graph);
  const positions = new Map<string, { x: number; y: number }>();
  for (const child of laidOut.children ?? []) {
    positions.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  return nodes
    .map((node) => {
      const position = positions.get(node.id);
      if (!position) {
        return null;
      }
      return { id: node.id, position };
    })
    .filter((item): item is LayoutResult[number] => item !== null);
}

function chooseRootId(nodes: LayoutNode[], edges: LayoutEdge[], requestedRootId?: string): string | undefined {
  if (requestedRootId && nodes.some((node) => node.id === requestedRootId)) {
    return requestedRootId;
  }

  if (nodes.length === 0) {
    return undefined;
  }

  const incomingCounts = new Map(nodes.map((node) => [node.id, 0]));
  for (const edge of edges) {
    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
  }

  const zeroIncomingNode = nodes.find((node) => (incomingCounts.get(node.id) ?? 0) === 0);
  return zeroIncomingNode?.id ?? nodes[0]?.id;
}

function getEligibleEdges(edges: LayoutEdge[], options: LayoutOptions): LayoutEdge[] {
  if (!options.interfacesOnly) {
    return edges;
  }

  const interfaceRelationTypes = new Set(options.interfaceRelationTypes ?? DEFAULT_INTERFACE_RELATION_TYPES);
  return edges.filter((edge) => {
    const relationType = edge.data?.relationType;
    return typeof relationType === 'string' && interfaceRelationTypes.has(relationType);
  });
}

function computeBreadthFirstDepths(nodes: LayoutNode[], edges: LayoutEdge[], options: LayoutOptions): Map<string, number> {
  const rootId = chooseRootId(nodes, edges, options.rootId);
  const eligibleEdges = getEligibleEdges(edges, options);
  const adjacency = new Map<string, string[]>(nodes.map((node) => [node.id, []]));

  for (const edge of eligibleEdges) {
    adjacency.get(edge.source)?.push(edge.target);
    adjacency.get(edge.target)?.push(edge.source);
  }

  const visited = new Set<string>();
  const depths = new Map<string, number>();
  const rootQueue = rootId ? [rootId] : [];
  let componentOffset = 0;

  const visitComponent = (startId: string, startDepth: number) => {
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: startDepth }];
    visited.add(startId);
    depths.set(startId, startDepth);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      const neighbors = adjacency.get(current.id) ?? [];
      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) {
          continue;
        }

        visited.add(neighborId);
        depths.set(neighborId, current.depth + 1);
        queue.push({ id: neighborId, depth: current.depth + 1 });
      }
    }
  };

  for (const nextRootId of rootQueue) {
    visitComponent(nextRootId, componentOffset);
    componentOffset = Math.max(...depths.values(), componentOffset) + 1;
  }

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue;
    }

    visitComponent(node.id, componentOffset);
    componentOffset = Math.max(...depths.values(), componentOffset) + 1;
  }

  return depths;
}

export function computeElkRingsLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions = {},
): LayoutResult {
  if (nodes.length === 0) {
    return [];
  }

  const center = options.center ?? { x: 0, y: 0 };
  const ringSpacing = options.ringSpacing ?? DEFAULT_RING_SPACING;
  const depths = computeBreadthFirstDepths(nodes, edges, options);
  const levels = new Map<number, LayoutNode[]>();

  for (const node of nodes) {
    const depth = depths.get(node.id) ?? 0;
    const group = levels.get(depth) ?? [];
    group.push(node);
    levels.set(depth, group);
  }

  const orderedDepths = [...levels.keys()].sort((a, b) => a - b);
  const result: LayoutResult = [];

  for (const depth of orderedDepths) {
    const levelNodes = levels.get(depth) ?? [];
    if (levelNodes.length === 0) {
      continue;
    }

    if (depth === 0) {
      const rootNode = levelNodes[0];
      const { width, height } = resolveNodeSize(rootNode);
      result.push({
        id: rootNode.id,
        position: {
          x: center.x - width / 2,
          y: center.y - height / 2,
        },
      });

      for (let index = 1; index < levelNodes.length; index += 1) {
        const node = levelNodes[index];
        const { width: nodeWidth, height: nodeHeight } = resolveNodeSize(node);
        const x = center.x + ringSpacing * Math.cos((2 * Math.PI * index) / levelNodes.length);
        const y = center.y + ringSpacing * Math.sin((2 * Math.PI * index) / levelNodes.length);
        result.push({
          id: node.id,
          position: {
            x: x - nodeWidth / 2,
            y: y - nodeHeight / 2,
          },
        });
      }

      continue;
    }

    const radius = depth * ringSpacing;
    const angleStep = (2 * Math.PI) / levelNodes.length;

    levelNodes.forEach((node, index) => {
      const { width, height } = resolveNodeSize(node);
      const angle = angleStep * index;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      result.push({
        id: node.id,
        position: {
          x: x - width / 2,
          y: y - height / 2,
        },
      });
    });
  }

  return result;
}

export const LAYOUT_STRATEGIES: Record<string, LayoutStrategy> = {
  'elk-layered': {
    async computeLayout(nodes, edges, config) {
      return computeElkLayeredLayout(nodes, edges, config);
    },
  },
  'elk-rings': {
    async computeLayout(nodes, edges, config) {
      return computeElkRingsLayout(nodes, edges, config);
    },
  },
};

export function getLayoutStrategy(strategyName?: string): LayoutStrategy {
  return LAYOUT_STRATEGIES[strategyName ?? DEFAULT_LAYOUT_STRATEGY_NAME] ?? LAYOUT_STRATEGIES[DEFAULT_LAYOUT_STRATEGY_NAME];
}

export { DEFAULT_LAYOUT_STRATEGY_NAME };
