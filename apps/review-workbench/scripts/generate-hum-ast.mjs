import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, '..', '..', '..');
const humRoot = path.join(repoRoot, 'hum');
const outputPath = path.join(appRoot, 'src', 'features', 'hum-body', 'lib', 'generated-hum-ast.ts');

const FILE_ORDER = [
  'main.lisp',
  'agent/packages.lisp',
  'agent/core.lisp',
  'execution/system.lisp',
  'execution/tools.lisp',
  'agent/context.lisp',
  'agent/thoughts.lisp',
  'agent/knowledge.lisp',
  'energy/core.lisp',
  'energy/stats.lisp',
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function listLispFiles(root) {
  return FILE_ORDER.filter((relativePath) => fs.existsSync(path.join(root, relativePath)));
}

function extractTopLevelForms(source) {
  const forms = [];
  const lines = source.split(/\r?\n/);
  let current = [];

  for (const line of lines) {
    const isTopLevelForm = line.startsWith('(');

    if (isTopLevelForm && current.length > 0) {
      forms.push(current.join('\n').trim());
      current = [];
    }

    if (isTopLevelForm || current.length > 0) {
      current.push(line);
    }
  }

  if (current.length > 0) {
    forms.push(current.join('\n').trim());
  }

  return forms;
}

function cleanWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function readHead(formText) {
  const compact = cleanWhitespace(formText);
  const match = compact.match(/^\(([^(\s)]+)(?:\s+([^\s()]+))?/);
  const formType = match?.[1] ?? 'form';
  const name = match?.[2] ?? '';
  return { compact, formType, name };
}

function labelForForm(formType, name, compact) {
  if (name) {
    return `(${formType} ${name} ...)`;
  }
  const trimmed = compact.length > 72 ? `${compact.slice(0, 69)}...` : compact;
  return trimmed;
}

function descriptionForForm(formType, name, filePath) {
  const defaultName = name || filePath;
  switch (formType) {
    case 'defpackage':
      return `Declares package ${defaultName}.`;
    case 'in-package':
      return `Switches the reader into package ${defaultName}.`;
    case 'defun':
      return `Defines function ${defaultName}.`;
    case 'defmacro':
      return `Defines macro ${defaultName}.`;
    case 'defvar':
    case 'defparameter':
      return `Defines variable ${defaultName}.`;
    case 'setf':
      return `Mutates runtime state through ${defaultName}.`;
    case 'unless':
    case 'when':
    case 'if':
      return `Conditional top-level form in ${filePath}.`;
    default:
      return `Top-level ${formType} form in ${filePath}.`;
  }
}

function buildAstFiles(relativePaths) {
  const columns = 3;
  const columnWidth = 430;
  const rowHeight = 760;

  return relativePaths.map((relativePath, index) => {
    const source = fs.readFileSync(path.join(humRoot, relativePath), 'utf8');
    const forms = extractTopLevelForms(source);
    const row = Math.floor(index / columns);
    const column = index % columns;
    const height = Math.max(180, 100 + forms.length * 72);

    return {
      id: `ast-${slugify(relativePath.replace(/\.lisp$/, ''))}`,
      label: relativePath,
      filePath: `hum/${relativePath}`,
      description: `${forms.length} top-level forms parsed from ${relativePath}.`,
      position: { x: 48 + column * columnWidth, y: 220 + row * rowHeight },
      size: { width: 340, height },
      formCount: forms.length,
      forms,
    };
  });
}

function buildAstForms(files) {
  return files.flatMap((file) =>
    file.forms.map((formText, index) => {
      const { compact, formType, name } = readHead(formText);
      const baseName = name && !name.startsWith(':') ? name : `${formType}-${index + 1}`;
      return {
        id: `${file.id}-form-${slugify(baseName)}-${index + 1}`,
        fileId: file.id,
        label: labelForForm(formType, name, compact),
        formType,
        description: descriptionForForm(formType, name, file.filePath),
        position: { x: 24, y: 36 + index * 68 },
      };
    }),
  );
}

const astFiles = buildAstFiles(listLispFiles(humRoot));
const astForms = buildAstForms(astFiles);

const output = `import type { HumAstFile, HumAstForm } from './types';

export const generatedHumAstFiles: HumAstFile[] = ${JSON.stringify(
  astFiles.map(({ formCount: _count, forms: _forms, ...file }) => file),
  null,
  2,
)};

export const generatedHumAstForms: HumAstForm[] = ${JSON.stringify(astForms, null, 2)};
`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote HUM AST fixtures to ${path.relative(appRoot, outputPath)}`);
