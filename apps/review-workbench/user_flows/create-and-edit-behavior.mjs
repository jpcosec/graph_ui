/**
 * Behavior test: a user creates a node from scratch, then loads/edits it.
 * Captures console errors, page errors, and render sanity (node counts,
 * overlaps, missing labels). Writes artifacts to auto_user_test/create-and-edit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';
const OUT = path.resolve('auto_user_test/create-and-edit');
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
const steps = [];

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  steps.push(line);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  fs.writeFileSync(path.join(OUT, `${name}.html`), await page.content(), 'utf8');
}

// Detect visually broken rendering. Overlap is measured only among sibling
// nodes (same parent group), because a child node visually sitting inside its
// parent group is expected, not a bug. Empty-label counting respects level of
// detail: at low zoom nodes intentionally render as dots with no text, so we
// only flag empty labels among nodes that are large enough on screen to be in
// the label/detail tier.
async function renderAudit(page, label) {
  const audit = await page.evaluate(() => {
    const nodeEls = Array.from(document.querySelectorAll('.react-flow__node'));
    const nodes = nodeEls.map((n) => {
      const r = n.getBoundingClientRect();
      const id = n.getAttribute('data-id');
      const isGroup = n.classList.contains('react-flow__node-group');
      return { el: n, x: r.x, y: r.y, w: r.width, h: r.height, id, isGroup };
    });

    // Sibling overlap: only compare non-group nodes that are NOT nested inside
    // one another in the DOM. Child-in-parent containment is expected.
    const contained = (a, b) =>
      a.x >= b.x - 2 && a.y >= b.y - 2 && a.x + a.w <= b.x + b.w + 2 && a.y + a.h <= b.y + b.h + 2;
    let overlaps = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (a.isGroup || b.isGroup) continue; // group boxes legitimately contain children
        if (contained(a, b) || contained(b, a)) continue;
        const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        if (ox > 5 && oy > 5) overlaps++;
      }
    }

    const zeroSize = nodes.filter((r) => r.w < 4 || r.h < 4).length;
    const edges = document.querySelectorAll('.react-flow__edge').length;
    // Only nodes rendered at >= ~40px wide are in label/detail tier; smaller are dots.
    const labelTier = nodes.filter((r) => !r.isGroup && r.w >= 40);
    const emptyLabels = labelTier.filter((r) => (r.el.textContent || '').trim().length === 0).length;
    return { nodeCount: nodes.length, edges, overlaps, zeroSize, emptyLabels, labelTierCount: labelTier.length };
  });
  log(`RENDER AUDIT [${label}]: ${JSON.stringify(audit)}`);
  return audit;
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push('PAGEERROR: ' + (e.stack || e.message)));

  // 1. Open app
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '01_open');
  const initial = await renderAudit(page, 'initial-load');

  // 2. Create a node from scratch via CreationSection "Add Node +".
  // The Creation panel lives in an accordion; expand it if collapsed.
  log('Creating a node from scratch');
  const creationHeader = page.getByRole('button', { name: /^Creation$/i });
  if (await creationHeader.isVisible().catch(() => false)) {
    const expanded = await creationHeader.getAttribute('aria-expanded');
    if (expanded === 'false') {
      await creationHeader.click();
      await page.waitForTimeout(300);
    }
  }
  const addBtn = page.getByRole('button', { name: /Add Node/i });
  await addBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addBtn.scrollIntoViewIfNeeded();
  await addBtn.click();
  await page.waitForTimeout(400);
  await shot(page, '02_add_node_popover');

  // pick first node type in the popover
  const firstType = page.locator('[cmdk-item]').first();
  await firstType.waitFor({ state: 'visible', timeout: 5000 });
  const typeLabel = (await firstType.textContent())?.trim();
  log(`Picking node type: ${typeLabel}`);
  await firstType.click();
  await page.waitForTimeout(800);
  await shot(page, '03_after_create');
  const afterCreate = await renderAudit(page, 'after-create');

  if (afterCreate.nodeCount <= initial.nodeCount) {
    log(`FAIL-SIGNAL: node count did not increase after create (${initial.nodeCount} -> ${afterCreate.nodeCount})`);
  }

  // 3. Load/select the created node and edit it (double-click to open inspector)
  log('Selecting the newly created node to edit');
  const lastNode = page.locator('.react-flow__node').last();
  await lastNode.dblclick({ force: true });
  await page.waitForTimeout(600);
  await shot(page, '04_inspector_open');

  const nameInput = page.getByTestId('node-name-input');
  const inspectorVisible = await nameInput.isVisible().catch(() => false);
  if (!inspectorVisible) {
    log('FAIL-SIGNAL: node inspector did not open / node-name-input not visible');
  } else {
    await nameInput.fill('Renamed By Test');
    await page.getByTestId('node-inspector-save').click();
    await page.waitForTimeout(500);
    log('Edited node name and saved');
    await shot(page, '05_after_edit');
  }

  // 4. Save graph + reload to check persistence of edit
  log('Saving graph and reloading');
  const saveBtn = page.getByTestId('sidebar-save');
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(400);
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '06_after_reload');
  const afterReload = await renderAudit(page, 'after-reload');

  // Persistence check reads the actual persisted state (localStorage drafts),
  // NOT the DOM: at low zoom nodes render as dots with no text, so a DOM text
  // search would be a false negative regardless of real persistence.
  const persistedState = await page.evaluate(() => {
    try {
      const raw = window.localStorage.getItem('hum-body-view-drafts');
      if (!raw) return { found: false, reason: 'no drafts key' };
      const drafts = JSON.parse(raw);
      const hay = JSON.stringify(drafts).includes('Renamed By Test');
      return { found: hay, keys: Object.keys(drafts) };
    } catch (e) {
      return { found: false, reason: String(e) };
    }
  });
  log(`Persisted-state check: ${JSON.stringify(persistedState)}`);
  if (!persistedState.found) {
    log('FAIL-SIGNAL: edited node name "Renamed By Test" not found in persisted drafts after reload');
  } else {
    log('Edit persisted across reload');
  }

  await browser.close();

  const signals = steps.filter((s) => s.includes('FAIL-SIGNAL'));
  const report = {
    name: 'Create and Edit Behavior',
    success: signals.length === 0 && consoleErrors.length === 0 && pageErrors.length === 0,
    consoleErrors,
    pageErrors,
    audits: { initial, afterCreate, afterReload },
    steps,
    signals,
  };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

  console.log('\n===== SUMMARY =====');
  console.log('console errors:', consoleErrors.length);
  console.log('page errors:', pageErrors.length);
  console.log('fail signals:', signals.length);
  signals.forEach((s) => console.log('  -', s.replace(/^\[.*?\]\s*/, '')));
  console.log('audits:', JSON.stringify(report.audits, null, 2));
  if (consoleErrors.length) { console.log('--- console errors ---'); consoleErrors.slice(0, 15).forEach((e) => console.log('  ', e)); }
  if (pageErrors.length) { console.log('--- page errors ---'); pageErrors.slice(0, 10).forEach((e) => console.log('  ', e)); }
}

run().catch((e) => { console.error('RUNNER CRASH:', e); process.exit(2); });
