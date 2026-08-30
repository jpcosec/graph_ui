#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

const appRoot = process.cwd();
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const outputDir = path.join(appRoot, 'auto_user_test', 'antonia_flow');

fs.mkdirSync(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = path.join(outputDir, `antonia-flow-${timestamp}.png`);
const reportPath = path.join(outputDir, `antonia-flow-${timestamp}.json`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const report = {
  baseUrl,
  screenshotPath,
  success: false,
  checks: [],
};

function pushCheck(message) {
  report.checks.push(message);
  console.log(message);
}

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByTestId('app-view-antonia').click();

  await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 15000 });

  const nodeCount = await page.locator('.react-flow__node').count();
  if (nodeCount !== 12) {
    throw new Error(`Expected 12 react-flow nodes, got ${nodeCount}`);
  }
  pushCheck(`PASS node count = ${nodeCount}`);

  const antoniaText = page.getByText(/Saludo inicial|obtencion_datos/i).first();
  await antoniaText.waitFor({ state: 'visible', timeout: 15000 });
  pushCheck('PASS real Antonia text is visible');

  const saludoNode = page.getByTestId('node-step-antonia-saludo');
  await saludoNode.dblclick();

  await page.getByText('Edit Node', { exact: true }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByText('conversation-step', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  await page.locator("input[value='instructions'], input[value='kind']").first().waitFor({ state: 'visible', timeout: 10000 });
  pushCheck('PASS typed node inspector shows conversation-step fields');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  pushCheck(`PASS screenshot saved to ${screenshotPath}`);

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
  throw new Error(report.error ?? 'Antonia flow check failed');
}
