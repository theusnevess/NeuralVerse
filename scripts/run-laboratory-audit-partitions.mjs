import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const suite = 'tests/nv-1000-labs-audit.spec.ts';
const artifactDir = join(root, 'artifacts/nv-1000-phase-12-5');
const inventoryPath = join(artifactDir, 'laboratory-audit-inventory.json');
const manifestPath = join(artifactDir, 'laboratory-audit-partition-manifest.json');
const resultsDir = join(artifactDir, 'audit-partitions');
const statusPath = join(artifactDir, 'laboratory-audit-execution-status.json');
const labs = ['gradient-descent', 'linear-regression', 'logistic-regression', 'kmeans-clustering', 'pca-projection', 'bayes-rule', 'embedding-similarity', 'cosine-similarity', 'precision-recall', 'transformer-attention'];

function command(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}
function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function gitDiff(paths) { return command('git', ['diff', '--', ...paths]); }
function fingerprint() {
  const data = {
    head: command('git', ['rev-parse', 'HEAD']).trim(),
    productionDiffHash: hash(gitDiff(['website/scripts/laboratory', 'website/data/laboratories'])),
    testDiffHash: hash(gitDiff(['tests/nv-1000-labs-audit.spec.ts'])),
    runnerDiffHash: hash(gitDiff(['scripts/run-laboratory-audit-partitions.mjs'])),
    styleDiffHash: hash(gitDiff(['website/styles'])),
    generatedAt: new Date().toISOString(),
  };
  data.combinedFingerprint = hash(JSON.stringify({
    head: data.head,
    productionDiffHash: data.productionDiffHash,
    testDiffHash: data.testDiffHash,
    runnerDiffHash: data.runnerDiffHash,
    styleDiffHash: data.styleDiffHash,
  }));
  return data;
}
function writeJsonAtomic(path, value) {
  mkdirSync(join(path, '..'), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, JSON.stringify(value, null, 2));
  JSON.parse(readFileSync(temporary, 'utf8'));
  renameSync(temporary, path);
}
function readJson(path) {
  if (!existsSync(path)) throw new Error(`Missing required file: ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function listTests() {
  const output = command('npx', ['playwright', 'test', suite, '--project=audit', '--list']);
  return output.split('\n').filter((line) => line.includes('›')).map((line) => {
    const title = line.slice(line.lastIndexOf('›') + 1).trim();
    return { stableId: title, historicalId: (title.match(/\b(?:L|XAI|RM)-[\w-]+-\d+\b/) || [])[0] || '', title };
  });
}
function currentFingerprint() { return fingerprint().combinedFingerprint; }
function inventory() {
  const worktree = fingerprint();
  const tests = listTests();
  writeJsonAtomic(join(artifactDir, 'audit-worktree-fingerprint.json'), worktree);
  writeJsonAtomic(inventoryPath, { worktreeFingerprint: worktree.combinedFingerprint, suite, discoveredTests: tests.length, tests });
  console.log(`Inventory: ${tests.length} tests; fingerprint ${worktree.combinedFingerprint}`);
}
function plan() {
  const source = readJson(inventoryPath);
  if (source.worktreeFingerprint !== currentFingerprint()) throw new Error('Inventory is stale; run inventory first.');
  const groups = new Map(labs.map((lab) => [lab, []]));
  const globals = [];
  for (const test of source.tests) {
    const lab = labs.find((slug) => test.stableId.includes(`L-${slug}-`) || test.stableId.includes(`XAI-${slug}`) || test.stableId.includes(`RM-${slug}`));
    (lab ? groups.get(lab) : globals).push(test.stableId);
  }
  // Global contracts are split by stable ID in deterministic title order.
  const partitions = [...groups].map(([partitionId, expectedTestIds]) => ({ partitionId, expectedTestIds, expectedCount: expectedTestIds.length }));
  for (let index = 0; index < globals.length; index += 45) {
    const expectedTestIds = globals.slice(index, index + 45);
    partitions.push({ partitionId: `global-contracts-${index / 45 + 1}`, expectedTestIds, expectedCount: expectedTestIds.length });
  }
  const assigned = partitions.flatMap((partition) => partition.expectedTestIds);
  const unassignedTestIds = source.tests.map((test) => test.stableId).filter((id) => !assigned.includes(id));
  const overlappingTestIds = assigned.filter((id, index) => assigned.indexOf(id) !== index);
  if (unassignedTestIds.length || overlappingTestIds.length) throw new Error('Partition plan is not exhaustive and disjoint.');
  for (const partition of partitions) {
    partition.grepPattern = `(${partition.expectedTestIds.map(escapeRegex).join('|')})$`;
    partition.maximumProcessDurationMs = 300000;
    partition.status = 'pending';
  }
  writeJsonAtomic(manifestPath, { worktreeFingerprint: source.worktreeFingerprint, inventoryCount: source.discoveredTests, partitionStrategy: 'stable-test-title', partitions, unassignedTestIds, overlappingTestIds, verdict: 'PASS' });
  console.log(`Plan: ${partitions.length} disjoint partitions for ${source.discoveredTests} tests.`);
}
function loadPlan() {
  const value = readJson(manifestPath);
  if (value.worktreeFingerprint !== currentFingerprint()) throw new Error('Partition manifest is stale; run inventory and plan again.');
  return value;
}
function resultFor(partitionId) {
  const path = join(resultsDir, `${partitionId}.json`);
  return existsSync(path) ? readJson(path) : null;
}
function execute(partitionId, force = false) {
  const manifest = loadPlan();
  const partition = manifest.partitions.find((item) => item.partitionId === partitionId);
  if (!partition) throw new Error(`Unknown partition: ${partitionId}`);
  const prior = resultFor(partitionId);
  if (!force && prior?.verdict === 'PASS' && prior.worktreeFingerprint === manifest.worktreeFingerprint) {
    console.log(`${partitionId} already passed for this fingerprint.`);
    return;
  }
  const selected = listTests().filter((test) => new RegExp(partition.grepPattern).test(test.stableId)).map((test) => test.stableId);
  if (selected.length !== partition.expectedCount || selected.some((id) => !partition.expectedTestIds.includes(id))) throw new Error(`Selection mismatch for ${partitionId}.`);
  const startedAt = new Date();
  let output = ''; let processFailed = false;
  try { output = command('npx', ['playwright', 'test', suite, '--project=audit', '--workers=1', '--reporter=json', '--grep', partition.grepPattern]); }
  catch (error) { output = error.stdout || ''; processFailed = true; }
  let report = null;
  try { report = JSON.parse(output); } catch { /* failed runner output is retained below */ }
  const specs = report ? (report.suites || []).flatMap(function flatten(node) { return [...(node.specs || []), ...(node.suites || []).flatMap(flatten)]; }) : [];
  const stats = report?.stats || {};
  const executedTestIds = specs.map((spec) => spec.title);
  const result = {
    partitionId, worktreeFingerprint: manifest.worktreeFingerprint, expectedTests: partition.expectedCount,
    selectedTests: selected.length, executedTests: executedTestIds.length, passedTests: stats.expected || 0,
    failedTests: stats.unexpected || (processFailed ? 1 : 0), skippedTests: stats.skipped || 0,
    timedOutTests: 0, runtimeErrors: 0, durationMs: Date.now() - startedAt.getTime(),
    executedTestIds, failures: processFailed ? [output] : [], startedAt: startedAt.toISOString(), completedAt: new Date().toISOString(),
    verdict: !processFailed && executedTestIds.length === partition.expectedCount && (stats.expected || 0) === partition.expectedCount && !stats.unexpected && !stats.skipped ? 'PASS' : 'FAILED',
  };
  writeJsonAtomic(join(resultsDir, `${partitionId}.json`), result);
  console.log(JSON.stringify({ partitionId, expected: result.expectedTests, executed: result.executedTests, passed: result.passedTests, failed: result.failedTests, durationMs: result.durationMs, resultPath: join(resultsDir, `${partitionId}.json`) }));
  if (result.verdict !== 'PASS') process.exitCode = 1;
}
function status() {
  const manifest = loadPlan();
  const states = { passedPartitions: [], failedPartitions: [], incompletePartitions: [], pendingPartitions: [], stalePartitions: [] };
  for (const partition of manifest.partitions) {
    const result = resultFor(partition.partitionId);
    if (!result) states.pendingPartitions.push(partition.partitionId);
    else if (result.worktreeFingerprint !== manifest.worktreeFingerprint) states.stalePartitions.push(partition.partitionId);
    else if (result.verdict === 'PASS') states.passedPartitions.push(partition.partitionId);
    else states.failedPartitions.push(partition.partitionId);
  }
  const executed = manifest.partitions.filter((partition) => states.passedPartitions.includes(partition.partitionId)).flatMap((partition) => resultFor(partition.partitionId).executedTestIds);
  const value = { worktreeFingerprint: manifest.worktreeFingerprint, totalPartitions: manifest.partitions.length, ...states, expectedTests: manifest.inventoryCount, executedUniqueTests: new Set(executed).size, remainingTests: manifest.inventoryCount - new Set(executed).size, readyToAggregate: !states.failedPartitions.length && !states.incompletePartitions.length && !states.pendingPartitions.length && !states.stalePartitions.length };
  writeJsonAtomic(statusPath, value); console.log(JSON.stringify(value, null, 2));
}
function aggregate() {
  const manifest = loadPlan();
  const results = manifest.partitions.map((partition) => resultFor(partition.partitionId));
  if (results.some((result) => !result || result.verdict !== 'PASS' || result.worktreeFingerprint !== manifest.worktreeFingerprint)) throw new Error('All current partitions must pass before aggregation.');
  const ids = results.flatMap((result) => result.executedTestIds);
  const inventoryIds = readJson(inventoryPath).tests.map((test) => test.stableId);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missing = inventoryIds.filter((id) => !ids.includes(id));
  const unexpected = ids.filter((id) => !inventoryIds.includes(id));
  const coverage = { suite, worktreeFingerprint: manifest.worktreeFingerprint, discoveredTests: inventoryIds.length, expectedTests: inventoryIds.length, executedTests: ids.length, uniqueExecutedTests: new Set(ids).size, passedTests: results.reduce((sum, result) => sum + result.passedTests, 0), failedTests: results.reduce((sum, result) => sum + result.failedTests, 0), skippedTests: results.reduce((sum, result) => sum + result.skippedTests, 0), timedOutTests: 0, runtimeErrors: 0, aggregateDurationMs: results.reduce((sum, result) => sum + result.durationMs, 0), partitions: results, missingTests: missing, duplicateExecutions: duplicates, unexpectedTests: unexpected, staleResults: [], verdict: !missing.length && !duplicates.length && !unexpected.length ? 'PASS' : 'FAIL' };
  writeJsonAtomic(join(artifactDir, 'full-regression-coverage.json'), coverage);
  if (coverage.verdict !== 'PASS') process.exitCode = 1;
}

const [action, flag, value, maybeForce] = process.argv.slice(2);
if (action === 'inventory') inventory();
else if (action === 'plan') plan();
else if (action === 'status') status();
else if (action === 'run') execute(value, maybeForce === '--force');
else if (action === 'run-next') { const manifest = loadPlan(); const next = manifest.partitions.find((partition) => resultFor(partition.partitionId)?.verdict !== 'PASS'); if (!next) throw new Error('No pending partition.'); execute(next.partitionId); }
else if (action === 'aggregate' || action === 'verify') aggregate();
else throw new Error('Usage: inventory | plan | status | run --partition <id> [--force] | run-next | aggregate | verify');
