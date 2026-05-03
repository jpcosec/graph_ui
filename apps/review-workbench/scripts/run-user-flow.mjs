#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

import {
  loadFlowDefinition,
  makeFlowArtifactPaths,
  resolveFlowFiles,
} from '../src/testing/userFlowRunnerCore.js';

const appRoot = process.cwd();
const flowsDir = path.join(appRoot, 'user_flows');
const outputRoot = path.join(appRoot, 'auto_user_test');

function parseArgs(argv) {
  const args = { runAll: false, flowFile: '', headed: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--all') args.runAll = true;
    if (token === '--headed') args.headed = true;
    if (token === '--flow') args.flowFile = argv[index + 1] || '';
    if (token === '--flow') index += 1;
  }
  return args;
}

async function captureArtifacts(page, dir, prefix) {
  const screenshotPath = path.join(dir, `${prefix}.png`);
  const htmlPath = path.join(dir, `${prefix}.html`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  fs.writeFileSync(htmlPath, await page.content(), 'utf8');
}

async function runStep(page, flow, step) {
  const force = Boolean(step.force);
  if (step.hoverSelector) {
    await page.locator(step.hoverSelector).hover({ force: true });
    if (step.hoverWaitMs) {
      await page.waitForTimeout(Number(step.hoverWaitMs));
    }
  }
  switch (step.action) {
    case 'goto':
      await page.goto(flow.baseUrl + step.url);
      return;
    case 'click':
      await page.locator(step.selector).click({ force });
      return;
    case 'dispatch_click':
      await page.locator(step.selector).dispatchEvent('click');
      return;
    case 'dblclick':
      await page.locator(step.selector).dblclick({ force });
      return;
    case 'hover':
      await page.locator(step.selector).hover({ force });
      return;
    case 'fill':
      await page.locator(step.selector).fill(String(step.value ?? ''));
      return;
    case 'press':
      await page.keyboard.press(String(step.value));
      return;
    case 'wait':
      await page.locator(step.selector).waitFor({ state: 'visible', timeout: 15000 });
      return;
    case 'wait_hidden':
      await page.locator(step.selector).waitFor({ state: 'hidden', timeout: 15000 });
      return;
    case 'wait_text':
      await page.getByText(String(step.value), { exact: false }).waitFor({ state: 'visible', timeout: 15000 });
      return;
    case 'wait_url':
      await page.waitForURL(String(step.value), { timeout: 15000 });
      return;
    case 'wait_fixed':
      await page.waitForTimeout(Number(step.value ?? 0));
      return;
    case 'drag': {
      const locator = page.locator(step.selector);
      const box = await locator.boundingBox();
      if (!box) throw new Error(`Could not resolve bounding box for ${step.selector}`);
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      const dx = Number(step.dx ?? 0);
      const dy = Number(step.dy ?? 0);
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + dx, startY + dy, { steps: 12 });
      await page.mouse.up();
      return;
    }
    case 'reload':
      await page.reload();
      return;
    case 'assert_text':
      await page.getByText(String(step.value), { exact: false }).waitFor({ state: 'visible', timeout: 5000 });
      return;
    case 'assert_value': {
      const value = await page.locator(step.selector).inputValue();
      if (value !== String(step.value)) {
        throw new Error(`Expected value ${step.value} but got ${value}`);
      }
      return;
    }
    case 'assert_enabled': {
      const disabled = await page.locator(step.selector).isDisabled();
      if (disabled) throw new Error(`Expected ${step.selector} to be enabled`);
      return;
    }
    case 'assert_disabled': {
      const disabled = await page.locator(step.selector).isDisabled();
      if (!disabled) throw new Error(`Expected ${step.selector} to be disabled`);
      return;
    }
    case 'assert_count_at_least': {
      const count = await page.locator(step.selector).count();
      const min = Number(step.value ?? 0);
      if (count < min) {
        throw new Error(`Expected at least ${min} matches for ${step.selector}, got ${count}`);
      }
      return;
    }
    case 'assert_count_equals': {
      const count = await page.locator(step.selector).count();
      const expected = Number(step.value ?? 0);
      if (count !== expected) {
        throw new Error(`Expected exactly ${expected} matches for ${step.selector}, got ${count}`);
      }
      return;
    }
    default:
      throw new Error(`Unsupported action: ${step.action}`);
  }
}

async function runFlow(flowFile, headed) {
  const flow = loadFlowDefinition(flowFile);
  const artifacts = makeFlowArtifactPaths(outputRoot, flow.name);
  fs.mkdirSync(artifacts.dir, { recursive: true });

  const logs = [];
  const log = (message) => {
    const line = `[${new Date().toISOString()}] ${message}`;
    logs.push(line);
    console.log(line);
  };

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();
  const report = {
    name: flow.name,
    source: flowFile,
    success: false,
    startTime: new Date().toISOString(),
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    steps: [],
  };

  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    log(`[BROWSER CONSOLE] ${text}`);
    if (msg.type() === 'error') report.consoleErrors.push(text);
    if (msg.type() === 'warning') report.consoleWarnings.push(text);
  });
  page.on('pageerror', (err) => {
    const text = err.message;
    log(`[BROWSER ERROR] ${text}`);
    report.pageErrors.push(text);
  });

  try {
    for (let index = 0; index < flow.steps.length; index += 1) {
      const step = flow.steps[index];
      const prefix = `${String(index + 1).padStart(2, '0')}_${step.id}`;
      const stepReport = {
        ...step,
        startTime: new Date().toISOString(),
        success: false,
      };

      log(`Step ${prefix}: ${step.description} (${step.action})`);

      try {
        await runStep(page, flow, step);
        await page.waitForTimeout(300);
        stepReport.success = true;
      } catch (error) {
        stepReport.error = error instanceof Error ? error.message : String(error);
        log(`ERROR in ${prefix}: ${stepReport.error}`);
        throw error;
      } finally {
        stepReport.url = page.url();
        stepReport.endTime = new Date().toISOString();
        await captureArtifacts(page, artifacts.dir, prefix);
        report.steps.push(stepReport);
      }
    }

    if (report.pageErrors.length > 0) {
      throw new Error(`Flow completed but page errors were recorded: ${report.pageErrors[0]}`);
    }

    if (report.consoleWarnings.length > 0) {
      throw new Error(`Flow completed but console warnings were recorded: ${report.consoleWarnings[0]}`);
    }

    report.success = true;
    log('Flow completed successfully');
  } catch (error) {
    report.success = false;
    report.error = error instanceof Error ? error.message : String(error);
    log(`Flow failed: ${report.error}`);
  } finally {
    report.endTime = new Date().toISOString();
    fs.writeFileSync(artifacts.log, `${logs.join('\n')}\n`, 'utf8');
    fs.writeFileSync(artifacts.report, JSON.stringify(report, null, 2), 'utf8');
    await browser.close();
  }

  if (!report.success) {
    throw new Error(report.error || `Flow failed: ${flow.name}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const flowFiles = resolveFlowFiles({
    flowFile: args.flowFile,
    flowsDir,
    runAll: args.runAll,
  });

  for (const flowFile of flowFiles) {
    await runFlow(flowFile, args.headed);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
