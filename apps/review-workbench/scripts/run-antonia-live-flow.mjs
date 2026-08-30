#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const outputDir = path.resolve('auto_user_test/antonia_live');
fs.mkdirSync(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = path.join(outputDir, `antonia-live-${timestamp}.png`);
const reportPath = path.join(outputDir, `antonia-live-${timestamp}.json`);
const marker = ` [live-save-check ${timestamp}]`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await context.newPage();

const report = {
  baseUrl,
  marker,
  screenshotPath,
  success: false,
  checks: [],
  consoleErrors: [],
  pageErrors: [],
};

function pushCheck(message) {
  report.checks.push(message);
  console.log(message);
}

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    report.consoleErrors.push(msg.text());
  }
});
page.on('pageerror', (error) => {
  report.pageErrors.push(error.message);
});

try {
  await page.goto(`${baseUrl}/?view=antonia`, { waitUntil: 'networkidle' });
  await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 20000 });

  const nodeCount = await page.locator('.react-flow__node').count();
  if (nodeCount !== 12) {
    throw new Error(`Expected 12 react-flow nodes, got ${nodeCount}`);
  }
  pushCheck(`PASS node count = ${nodeCount}`);

  await page.locator('.react-flow__pane').hover();
  await page.mouse.wheel(0, -1200);
  await page.waitForTimeout(400);

  const targetNode = page.locator("[data-testid^='node-']").first();
  await targetNode.dispatchEvent('dblclick');

  const kindField = page.getByTestId('field-kind');
  await kindField.waitFor({ state: 'visible', timeout: 10000 });
  const instructionField = page.getByTestId('field-instructions');
  await instructionField.waitFor({ state: 'visible', timeout: 10000 });

  const kindOptions = await kindField.locator('option').allTextContents();
  const expectedKinds = ['interaccion_simple', 'obtencion_datos', 'handout', 'llamado_tool'];
  for (const kind of expectedKinds) {
    if (!kindOptions.includes(kind)) {
      throw new Error(`Missing StepKind option: ${kind}`);
    }
  }
  pushCheck(`PASS kind select options = ${expectedKinds.join(', ')}`);

  const originalInstructions = await instructionField.inputValue();
  const updatedInstructions = `${originalInstructions}${marker}`;
  await instructionField.fill(updatedInstructions);
  await page.getByTestId('node-inspector-save').click();
  await page.waitForTimeout(6000);

  const errorBannerCount = await page.getByText(/not reachable|error/i).count();
  if (errorBannerCount > 0) {
    throw new Error('Unexpected error text surfaced after save');
  }
  pushCheck('PASS save completed with no surfaced error');

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('.react-flow__pane').hover();
  await page.mouse.wheel(0, -1200);
  await page.waitForTimeout(400);
  await page.locator("[data-testid^='node-']").first().dispatchEvent('dblclick');
  await page.getByTestId('field-instructions').waitFor({ state: 'visible', timeout: 10000 });

  const reloadedInstructions = await page.getByTestId('field-instructions').inputValue();
  if (reloadedInstructions !== updatedInstructions) {
    throw new Error('Instructions did not persist after reload');
  }
  pushCheck('PASS instructions persisted after reload');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  pushCheck(`PASS screenshot saved to ${screenshotPath}`);

  if (report.consoleErrors.length > 0) {
    throw new Error(`Browser console errors detected: ${report.consoleErrors[0]}`);
  }
  if (report.pageErrors.length > 0) {
    throw new Error(`Browser page errors detected: ${report.pageErrors[0]}`);
  }

  report.success = true;
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  console.error(report.error);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  await browser.close();
}

if (!report.success) {
  throw new Error(report.error ?? 'Antonia live flow failed');
}
