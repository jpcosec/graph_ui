#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.cwd();
const srcRoot = path.join(appRoot, 'src');

const PROD_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$/;
const L2_ENTRYPOINTS = new Set(['features/graph-editor/L2-canvas/GraphEditor', 'features/graph-editor/L2-canvas', 'features/graph-editor/L2-canvas/index']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(next));
      continue;
    }
    if (!PROD_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }
    if (TEST_FILE_RE.test(entry.name)) {
      continue;
    }
    files.push(next);
  }
  return files;
}

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function classify(file) {
  const rel = normalize(path.relative(srcRoot, file));
  // L1 is the page App.tsx mounts (AntoniaFlowPage): it loads the graph and mounts L2.
  if (rel.startsWith('features/antonia-flow/')) return 'L1';
  if (rel.startsWith('features/graph-editor/L2-canvas/')) return 'L2';
  if (rel.startsWith('components/content/')) return 'L3';
  return 'OTHER';
}

function extractImports(source) {
  const imports = [];
  const importRe = /import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRe.exec(source)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function resolveSpecifier(fromFile, specifier) {
  if (specifier.startsWith('@/')) {
    return normalize(specifier.slice(2));
  }
  if (specifier.startsWith('.')) {
    const abs = path.resolve(path.dirname(fromFile), specifier);
    const rel = normalize(path.relative(srcRoot, abs));
    return rel;
  }
  return specifier;
}

function includesAny(text, needles) {
  return needles.filter((needle) => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text));
}

const files = walk(srcRoot);
const violations = [];

for (const file of files) {
  const rel = normalize(path.relative(srcRoot, file));
  const zone = classify(file);
  const source = fs.readFileSync(file, 'utf8');
  const imports = extractImports(source).map((specifier) => ({ raw: specifier, resolved: resolveSpecifier(file, specifier) }));

  for (const entry of imports) {
    if (zone === 'L1' && entry.resolved.startsWith('features/graph-editor/L2-canvas/') && !L2_ENTRYPOINTS.has(entry.resolved)) {
      violations.push(`${rel}: L1 may only import the L2 public entrypoints (GraphEditor, the L2-canvas index), found ${entry.raw}`);
    }

    if (zone === 'L2' && entry.resolved.startsWith('features/antonia-flow/')) {
      violations.push(`${rel}: L2 must stay domain-agnostic, found ${entry.raw}`);
    }

    if (zone === 'L3') {
      if (entry.raw === '@xyflow/react' || entry.resolved.startsWith('stores/') || entry.resolved.startsWith('features/antonia-flow/') || entry.resolved.startsWith('features/graph-editor/L2-canvas/')) {
        violations.push(`${rel}: L3 content components cannot depend on editor/runtime internals, found ${entry.raw}`);
      }
    }

  }

  if (zone === 'L2' && (rel.endsWith('GraphEditor.tsx') || rel.endsWith('CanvasSidebar.tsx'))) {
    const forbiddenTerms = includesAny(source, [
      'structure',
      'routine',
      'compare',
      'trace',
      'hum-mode-',
      'Topological lens',
      'Anatomical lens',
      'Forensic lens',
      'Deviation lens',
    ]);
    if (forbiddenTerms.length > 0) {
      violations.push(`${rel}: L2 contains mode/domain-specific terms: ${forbiddenTerms.join(', ')}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Architecture lint failed:\n');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Architecture lint passed for ${files.length} production source files.`);
