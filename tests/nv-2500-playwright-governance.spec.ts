import { expect, test } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(resolve(root, 'tests/playwright-complete-validation.manifest.json'), 'utf8'));
const runtimePolicy = JSON.parse(readFileSync(resolve(root, 'tests/runtime-event-policy.json'), 'utf8'));

test('NV-2500 manifest owns every canonical suite without duplicate files', () => {
  const configs = manifest.suites.map((suite: any) => suite.config);
  const specs = manifest.suites.map((suite: any) => suite.specification);
  expect(new Set(configs).size).toBe(configs.length);
  expect(new Set(specs).size).toBe(specs.length);
  for (const suite of manifest.suites) {
    expect(existsSync(resolve(root, suite.config)), `${suite.id} config`).toBe(true);
    expect(existsSync(resolve(root, suite.specification)), `${suite.id} specification`).toBe(true);
    expect(suite.required).toBe(true);
    expect(suite.expectedProjects).toBe(1);
    expect(suite.currentExpectedTests).toBeGreaterThan(0);
  }
});

test('NV-2500 classifies every tests/playwright config', () => {
  const discovered = readdirSync(resolve(root, 'tests')).filter(file => /^playwright.*\.config\.ts$/.test(file)).map(file => `tests/${file}`);
  const classified = new Set([...manifest.suites.map((suite: any) => suite.config), ...manifest.excludedConfigs.map((entry: any) => entry.config), 'tests/playwright.complete-validation.config.ts']);
  expect(discovered.sort()).toEqual([...classified].sort());
});

test('NV-2500 canonical contracts contain no only, skip, or fixme marker', () => {
  const forbidden = /\b(?:test|describe)\.(?:only|skip|fixme)\b/;
  for (const suite of manifest.suites) {
    const source = readFileSync(resolve(root, suite.specification), 'utf8');
    expect(forbidden.test(source), suite.id).toBe(false);
  }
});

test('NV-2500 canonical specifications use the shared runtime fixture and policy has no unsafe rule', () => {
  for (const suite of manifest.suites) {
    const source = readFileSync(resolve(root, suite.specification), 'utf8');
    expect(source).toContain("./fixtures/playwright-runtime-observability");
    expect(source).not.toContain("from '@playwright/test'");
  }
  for (const rule of runtimePolicy.rules) {
    expect(rule.owner).toBeTruthy();
    expect(rule.reason).toBeTruthy();
    expect(rule.reviewAfter).toBeTruthy();
    expect(rule.pattern).not.toBe('.*');
  }
});
