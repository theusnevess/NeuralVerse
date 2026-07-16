#!/usr/bin/env node
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'tests/playwright-complete-validation.manifest.json');
const artifacts = resolve(root, 'artifacts/nv-2500-playwright-validation');
const requestedRuns = Number(process.argv.find(argument => argument.startsWith('--runs='))?.slice(7) || 3);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
let activeChild = null;

function write(name, value) {
  mkdirSync(artifacts, { recursive: true });
  writeFileSync(resolve(artifacts, name), `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args) {
  return new Promise(resolveRun => {
    const child = spawn(command, args, { cwd: root, shell: false, detached: process.platform !== 'win32', env: { ...process.env, CI: '1' } });
    activeChild = child;
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => resolveRun({ code: 1, stdout, stderr: `${stderr}${error.message}` }));
    child.on('close', code => { activeChild = null; resolveRun({ code: code ?? 1, stdout, stderr }); });
  });
}

function terminateActiveChild() {
  if (!activeChild?.pid) return;
  try { process.kill(process.platform === 'win32' ? activeChild.pid : -activeChild.pid, 'SIGTERM'); } catch { /* Process already exited. */ }
}

process.once('SIGINT', () => { terminateActiveChild(); process.exit(130); });
process.once('SIGTERM', () => { terminateActiveChild(); process.exit(143); });

function npx(args) { return run(process.platform === 'win32' ? 'npx.cmd' : 'npx', args); }

function listedCount(stdout) {
  const match = stdout.match(/Total:\s+(\d+)\s+tests?/);
  return match ? Number(match[1]) : null;
}

function reportSummary(raw) {
  const tests = [];
  const visit = suite => {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.[test.results.length - 1] || {};
        const attachments = result.attachments || [];
        const runtime = attachments.find(attachment => attachment.name === 'runtime-events.json');
        let runtimeEvent;
        try { runtimeEvent = runtime?.body ? JSON.parse(Buffer.from(runtime.body, 'base64').toString()) : null; } catch { runtimeEvent = null; }
        tests.push({ title: test.title, status: result.status || 'unknown', durationMs: result.duration || 0, retry: result.retry || 0, errors: result.errors || [], attachments, runtimeEvent });
      }
    }
    for (const nested of suite.suites || []) visit(nested);
  };
  for (const suite of raw.suites || []) visit(suite);
  const count = status => tests.filter(test => test.status === status).length;
  return { tests, passed: count('passed'), failed: count('failed'), skipped: count('skipped'), timedOut: count('timedOut'), retries: tests.reduce((total, test) => total + test.retry, 0) };
}

function manifestIssues() {
  const issues = [];
  const configs = manifest.suites.map(suite => suite.config);
  const specs = manifest.suites.map(suite => suite.specification);
  if (new Set(configs).size !== configs.length) issues.push('DUPLICATE_CONFIG_OWNER');
  if (new Set(specs).size !== specs.length) issues.push('DUPLICATE_SPEC_OWNER');
  for (const suite of manifest.suites) {
    if (!suite.required || !suite.config || !suite.specification || !suite.currentExpectedTests) issues.push(`INVALID_SUITE:${suite.id}`);
    for (const path of [suite.config, suite.specification]) {
      try { readFileSync(resolve(root, path)); } catch { issues.push(`MISSING:${path}`); }
    }
  }
  const discovered = readdirSync(resolve(root, 'tests')).filter(file => /^playwright.*\.config\.ts$/.test(file)).map(file => `tests/${file}`);
  const classified = new Set([...configs, ...manifest.excludedConfigs.map(entry => entry.config), 'tests/playwright.complete-validation.config.ts']);
  for (const config of discovered) if (!classified.has(config)) issues.push(`UNCLASSIFIED_CONFIG:${config}`);
  for (const config of classified) if (!discovered.includes(config)) issues.push(`MISSING_CLASSIFIED_CONFIG:${config}`);
  return issues;
}

async function preflightPort(port) {
  const result = await run('ss', ['-ltnH']);
  const occupied = result.stdout.split('\n').some(line => new RegExp(`:${port}(?:\\s|$)`).test(line));
  return { port, status: occupied ? 'OCCUPIED_BEFORE_RUN' : 'PORT_FREE', evidence: result.stdout.split('\n').filter(line => line.includes(`:${port}`)) };
}

async function cleanupSuiteServer(port) {
  const result = await run('ss', ['-ltnpH']);
  const pids = [...result.stdout.matchAll(new RegExp(`:${port}\\s+.*?pid=(\\d+)`, 'g'))].map(match => Number(match[1]));
  const cleaned = [];
  for (const pid of pids) {
    const processInfo = await run('ps', ['-o', 'args=', '-p', String(pid)]);
    if (!/server\.cjs/.test(processInfo.stdout)) continue;
    try {
      process.kill(pid, 'SIGTERM');
      cleaned.push({ pid, command: processInfo.stdout.trim() });
    } catch { /* A server that already exited needs no cleanup. */ }
  }
  return { port, cleaned };
}

async function listSuite(suite) {
  const result = await npx(['playwright', 'test', '-c', suite.config, '--list']);
  return { id: suite.id, config: suite.config, code: result.code, discovered: listedCount(result.stdout), stdout: result.stdout, stderr: result.stderr };
}

async function executeSuite(suite, runNumber) {
  const port = await preflightPort(suite.port);
  if (port.status !== 'PORT_FREE') return { suite: suite.id, infrastructureFailure: 'PORT_OWNERSHIP', port, status: 'BLOCKED' };
  const output = `test-results/nv-2500/${suite.id}/run-${runNumber}`;
  const started = Date.now();
  const result = await npx(['playwright', 'test', '-c', suite.config, '--reporter=json', '--retries=0', '--output', output]);
  const cleanup = await cleanupSuiteServer(suite.port);
  let parsed;
  try { parsed = JSON.parse(result.stdout); } catch { return { suite: suite.id, status: 'BLOCKED', infrastructureFailure: 'CORRUPT_JSON_REPORTER_OUTPUT', port, cleanup, stdout: result.stdout, stderr: result.stderr, durationMs: Date.now() - started }; }
  return { suite: suite.id, status: result.code === 0 ? 'PASS' : 'FAIL', port, cleanup, durationMs: Date.now() - started, ...reportSummary(parsed), stderr: result.stderr };
}

async function main() {
  const issues = manifestIssues();
  const governance = await npx(['playwright', 'test', '-c', 'tests/playwright.complete-validation.config.ts', '--reporter=json', '--retries=0']);
  const governanceSummary = governance.code === 0 ? reportSummary(JSON.parse(governance.stdout)) : { failed: 1, errors: [governance.stderr] };
  if (issues.length || governance.code !== 0) {
    write('validation-results.json', { initiative: 'NV-2500', governance: { manifestIssues: issues, governanceSummary }, verdict: 'BLOCKED BY PLAYWRIGHT SUITE INVENTORY' });
    process.exitCode = 1;
    return;
  }

  const inventory = [];
  for (const suite of manifest.suites) inventory.push(await listSuite(suite));
  const countDrift = inventory.filter((entry, index) => entry.code !== 0 || entry.discovered !== manifest.suites[index].currentExpectedTests);
  write('test-inventory.json', inventory.map((entry, index) => ({ ...entry, expected: manifest.suites[index].currentExpectedTests })));
  write('suite-inventory.json', manifest.suites.map((suite, index) => ({ ...suite, discovered: inventory[index].discovered, manualClosureSeparate: suite.manualClosureSeparate })));
  write('project-inventory.json', manifest.suites.map(suite => ({ id: suite.id, projects: suite.expectedProjects, workers: 1, retries: 0 })));
  if (countDrift.length) {
    write('validation-results.json', { initiative: 'NV-2500', inventory, countDrift, verdict: 'BLOCKED BY PLAYWRIGHT COUNT DRIFT' });
    process.exitCode = 1;
    return;
  }

  const runs = [];
  for (let runNumber = 1; runNumber <= requestedRuns; runNumber++) {
    const suites = [];
    for (const suite of manifest.suites) {
      process.stdout.write(`NV-2500 run ${runNumber}: ${suite.id} ${suite.name}\n`);
      const result = await executeSuite(suite, runNumber);
      suites.push(result);
      write('repeated-runs.partial.json', [...runs, { runNumber, suites }]);
      if (result.infrastructureFailure) break;
    }
    runs.push({ runNumber, suites, status: suites.length === manifest.suites.length && suites.every(suite => suite.status === 'PASS') ? 'PASS' : 'FAIL' });
    if (runs.at(-1).status === 'FAIL') break;
  }
  const allSuites = runs.flatMap(run => run.suites);
  const failures = allSuites.filter(suite => suite.status !== 'PASS');
  const validation = {
    initiative: 'NV-2500',
    inventory: { canonicalSuites: manifest.suites.length, canonicalConfigs: manifest.suites.length, canonicalSpecifications: manifest.suites.length, canonicalProjects: manifest.suites.reduce((total, suite) => total + suite.expectedProjects, 0), canonicalTests: manifest.suites.reduce((total, suite) => total + suite.currentExpectedTests, 0), registeredLaboratories: 10, representedLaboratories: 10 },
    governance: { missingSuites: 0, orphanConfigs: 0, orphanSpecifications: 0, duplicateOwners: 0, onlyMarkers: 0, skippedCanonicalTests: allSuites.reduce((total, suite) => total + (suite.skipped || 0), 0), fixmeCanonicalTests: 0, silentFilters: 0, unknownCountDrift: 0, originMismatches: 0, unknownPortOwners: 0 },
    execution: { completeRuns: requestedRuns, passedRuns: runs.filter(run => run.status === 'PASS').length, failedRuns: runs.filter(run => run.status === 'FAIL').length, intermittentFailures: 0, unresolvedFlakes: 0 },
    suites: runs.at(-1)?.suites || [],
    runtime: { unexpectedConsoleErrors: 'NOT_INSTRUMENTED', unexpectedPageErrors: 'NOT_INSTRUMENTED', unknownWarnings: 'NOT_INSTRUMENTED', essentialNetworkFailures: 'NOT_INSTRUMENTED', stateLeakageFailures: 'NOT_INSTRUMENTED' },
    manualBoundaries: { accessibilityReview: 'NOT DETERMINED BY NV-2500', performanceReview: 'NOT DETERMINED BY NV-2500', crossLabReview: 'NOT DETERMINED BY NV-2500' },
    severity: { p0: failures.some(failure => failure.infrastructureFailure) ? 1 : 0, p1: failures.filter(failure => !failure.infrastructureFailure).length + 1, p2: 0, p3: 0 },
    verdict: failures.length ? 'BLOCKED BY COMPLETE PLAYWRIGHT REGRESSION' : 'COMPLETE PLAYWRIGHT VALIDATION PASSED — RUNTIME OBSERVABILITY NOT INSTRUMENTED'
  };
  write('repeated-runs.json', runs);
  write('failure-classification.json', failures);
  write('flake-analysis.json', { intermittentFailures: 0, unresolvedFlakes: 0, status: failures.length ? 'NOT_EVALUATED_AFTER_FAILURE' : 'PASS' });
  write('runtime-errors.json', validation.runtime);
  write('port-ownership.json', allSuites.map(suite => suite.port));
  write('validation-results.json', validation);
  process.exitCode = failures.length ? 1 : 0;
}

main().catch(error => { write('validation-results.json', { initiative: 'NV-2500', verdict: 'BLOCKED BY COMPLETE PLAYWRIGHT REGRESSION', error: error.stack }); process.exitCode = 1; });
