import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const modelsRoot = path.join(appRoot, 'src', 'schema', 'models');
const outputPath = path.join(appRoot, 'src', 'schema', 'generated-node-types.ts');

function listModelFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root)
    .filter((entry) => entry.endsWith('.model.json'))
    .sort()
    .map((entry) => path.join(root, entry));
}

function schemaForField(field) {
  switch (field.kind) {
    case 'string':
      return field.required ? 'z.string().min(1)' : 'z.string().optional()';
    case 'enum': {
      const base = `z.enum(${JSON.stringify(field.values)})`;
      return field.default ? `${base}.default(${JSON.stringify(field.default)})` : `${base}.optional()`;
    }
    case 'stringlist':
      return field.required ? 'z.array(z.string())' : 'z.array(z.string()).optional()';
    default:
      throw new Error(`Unsupported field kind: ${field.kind}`);
  }
}

function buildDefinition(model) {
  const payloadFields = model.fields
    .map((field) => `      ${JSON.stringify(field.name)}: ${schemaForField(field)}`)
    .join(',\n');

  const allowedConnections = JSON.stringify(
    [...new Set(model.fields.filter((field) => field.projectsAs).map(() => model.typeId))],
    null,
    2,
  );

  return `  {
    typeId: ${JSON.stringify(model.typeId)},
    label: ${JSON.stringify(model.label)},
    icon: ${JSON.stringify(model.icon)},
    category: ${JSON.stringify(model.family)},
    colorToken: ${JSON.stringify(`token-${model.family}`)},
    payloadSchema: z.object({
${payloadFields}
    }),
    renderers: {
      dot: PlaceholderDot,
      label: PlaceholderLabel,
      detail: detailRendererFor(${JSON.stringify(model.label)}, ${JSON.stringify(`token-${model.family}`)}),
    },
    defaultSize: { width: 220, height: 100 },
    allowedConnections: ${allowedConnections},
  }`;
}

const modelFiles = listModelFiles(modelsRoot);
const models = modelFiles.map((filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8')));
const definitions = models.map(buildDefinition).join(',\n');

const output = `import { z } from 'zod';

import { detailRendererFor, PlaceholderDot, PlaceholderLabel } from './renderer-helpers';
import type { NodeTypeDefinition } from './registry.types';

export const generatedNodeTypes: NodeTypeDefinition[] = [
${definitions}
];
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote generated node types to ${path.relative(appRoot, outputPath)}`);
