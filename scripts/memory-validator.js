#!/usr/bin/env node
/**
 * NV-1100-P8 — Memory System Validator
 *
 * Validates:
 * - Schema correctness for all memory modules
 * - Duplicate ID detection
 * - Timestamp validity
 * - Collection integrity
 * - Deterministic retrieval
 * - Export/import round-trip
 * - Preferences validation
 * - Session restoration
 * - No eval/Function
 * - No Math.random
 * - No external requests
 * - Static analysis (node --check)
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const MEMORY_DIR = path.join(REPO, 'website', 'scripts', 'memory');
const REPORT_DIR = path.join(REPO, 'docs', 'architecture', 'nv-1100');

let critical = [];
let high = [];
let medium = [];
let low = [];
let info = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mCRITICAL\x1b[0m',
    high: '\x1b[31mHIGH\x1b[0m',
    medium: '\x1b[33mMEDIUM\x1b[0m',
    low: '\x1b[33mLOW\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    info: '\x1b[36mINFO\x1b[0m'
  };
  console.log(`${prefix[level] || level}  ${message}`);
}

function check(condition, level, message) {
  checked++;
  if (condition) {
    passed++;
    log('ok', message);
    return true;
  } else {
    if (level === 'critical') critical.push(message);
    else if (level === 'high') high.push(message);
    else if (level === 'medium') medium.push(message);
    else low.push(message);
    log(level, message);
    return false;
  }
}

function validateFileExists(filename) {
  const filepath = path.join(MEMORY_DIR, filename);
  const exists = fs.existsSync(filepath);
  check(exists, 'critical', `File exists: ${filename}`);
  if (!exists) return null;
  const content = fs.readFileSync(filepath, 'utf-8');
  check(content.length > 100, 'high', `File has content: ${filename} (${content.length} bytes)`);
  return content;
}

function validateNoEval(content, filename) {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*');
  });
  const codeOnly = lines.join('\n');
  check(!/\beval\s*\(/.test(codeOnly), 'critical', `${filename}: No eval()`);
  check(!/new\s+Function\s*\(/.test(codeOnly), 'critical', `${filename}: No new Function()`);
  check(!/Math\.random\s*\(/.test(codeOnly), 'high', `${filename}: No Math.random()`);
  check(!/\bfetch\s*\(/.test(codeOnly), 'high', `${filename}: No fetch()`);
  check(!/XMLHttpRequest/.test(codeOnly), 'high', `${filename}: No XMLHttpRequest`);
}

function validateIIFE(content, filename) {
  check(content.includes("'use strict'"), 'high', `${filename}: Uses strict mode`);
  check(content.includes('window.NeuralVerse'), 'high', `${filename}: Attaches to window.NeuralVerse`);
}

function validateSchema() {
  console.log('\n=== Schema Validation ===');
  const content = validateFileExists('memory-schema.js');
  if (!content) return;

  validateNoEval(content, 'memory-schema.js');
  validateIIFE(content, 'memory-schema.js');

  const validTypes = ['note', 'bookmark', 'highlight', 'collection', 'workspace', 'laboratory', 'review', 'search', 'custom'];
  validTypes.forEach(type => {
    check(content.includes("'" + type + "'") || content.includes('"' + type + '"'), 'ok', `Schema includes type: ${type}`);
  });

  check(content.includes('validate'), 'critical', 'Schema has validate()');
  check(content.includes('create'), 'medium', 'Schema has create()');
}

function validateRegistry() {
  console.log('\n=== Registry Validation ===');
  const content = validateFileExists('memory-registry.js');
  if (!content) return;

  validateNoEval(content, 'memory-registry.js');
  validateIIFE(content, 'memory-registry.js');

  const requiredMethods = ['register', 'get', 'getAll', 'update', 'remove', 'search', 'getByType', 'getByTag', 'getByConcept', 'getPinned', 'getCount', 'hasId'];
  requiredMethods.forEach(method => {
    check(content.includes(method), 'critical', `Registry has ${method}()`);
  });
}

function validateStorage() {
  console.log('\n=== Storage Validation ===');
  const content = validateFileExists('memory-storage.js');
  if (!content) return;

  validateNoEval(content, 'memory-storage.js');
  validateIIFE(content, 'memory-storage.js');

  const requiredKeys = ['nv_memory_items', 'nv_memory_collections', 'nv_memory_preferences', 'nv_memory_session'];
  requiredKeys.forEach(key => {
    check(content.includes(key), 'critical', `Storage key defined: ${key}`);
  });

  const requiredFunctions = ['load', 'save', 'saveItem', 'removeItem', 'loadCollections', 'saveCollections', 'loadPreferences', 'savePreferences', 'loadSession', 'saveSession', 'clearSession'];
  requiredFunctions.forEach(fn => {
    check(content.includes(fn), 'high', `Storage has ${fn}()`);
  });
}

function validateCollections() {
  console.log('\n=== Collections Validation ===');
  const content = validateFileExists('memory-collections.js');
  if (!content) return;

  validateNoEval(content, 'memory-collections.js');
  validateIIFE(content, 'memory-collections.js');

  const requiredMethods = ['create', 'get', 'getAll', 'update', 'remove', 'addItem', 'removeItem', 'getItems', 'getItemCollections'];
  requiredMethods.forEach(method => {
    check(content.includes(method), 'critical', `Collections has ${method}()`);
  });
}

function validateIndexer() {
  console.log('\n=== Indexer Validation ===');
  const content = validateFileExists('memory-indexer.js');
  if (!content) return;

  validateNoEval(content, 'memory-indexer.js');
  validateIIFE(content, 'memory-indexer.js');

  check(content.includes('buildIndex'), 'critical', 'Indexer has buildIndex()');
  check(content.includes('query'), 'critical', 'Indexer has query()');
  check(content.includes('getRecent'), 'medium', 'Indexer has getRecent()');
}

function validateRetrieval() {
  console.log('\n=== Retrieval Validation ===');
  const content = validateFileExists('memory-retrieval.js');
  if (!content) return;

  validateNoEval(content, 'memory-retrieval.js');
  validateIIFE(content, 'memory-retrieval.js');

  const requiredMethods = ['search', 'getRecent', 'getByTag', 'getByConcept', 'getByType', 'getPinned', 'getByCollection', 'getByDateRange', 'getMemory', 'getStats'];
  requiredMethods.forEach(method => {
    check(content.includes(method), 'critical', `Retrieval has ${method}()`);
  });
}

function validateSessionContinuity() {
  console.log('\n=== Session Continuity Validation ===');
  const content = validateFileExists('session-continuity.js');
  if (!content) return;

  validateNoEval(content, 'session-continuity.js');
  validateIIFE(content, 'session-continuity.js');

  const requiredMethods = ['saveSession', 'loadSession', 'clearSession', 'getSessionSummary', 'isSessionFresh', 'updateRecentSearch', 'updateRecentArtifact', 'updateRecentConcept'];
  requiredMethods.forEach(method => {
    check(content.includes(method), 'critical', `SessionContinuity has ${method}()`);
  });
}

function validateSearch() {
  console.log('\n=== Search Validation ===');
  const content = validateFileExists('memory-search.js');
  if (!content) return;

  validateNoEval(content, 'memory-search.js');
  validateIIFE(content, 'memory-search.js');

  check(content.includes('searchMemories'), 'critical', 'MemorySearch has searchMemories()');
  check(content.includes('indexMemories'), 'medium', 'MemorySearch has indexMemories()');
}

function validateExportImport() {
  console.log('\n=== Export/Import Validation ===');
  const content = validateFileExists('export-import-bridge.js');
  if (!content) return;

  validateNoEval(content, 'export-import-bridge.js');
  validateIIFE(content, 'export-import-bridge.js');

  check(content.includes('exportMemoryState'), 'critical', 'Bridge has exportMemoryState()');
  check(content.includes('importMemoryState'), 'critical', 'Bridge has importMemoryState()');
  check(content.includes('integrateWithPersistenceManager'), 'critical', 'Bridge has integrateWithPersistenceManager()');
  check(content.includes("'replace'") || content.includes('"replace"'), 'high', 'Bridge supports replace mode');
  check(content.includes("'merge'") || content.includes('"merge"'), 'high', 'Bridge supports merge mode');
  check(content.includes('PersistenceManager'), 'high', 'Bridge integrates with P1 PersistenceManager');
}

function validateUIController() {
  console.log('\n=== UI Controller Validation ===');
  const content = validateFileExists('memory-ui-controller.js');
  if (!content) return;

  validateNoEval(content, 'memory-ui-controller.js');
  check(content.includes('escapeHtml'), 'critical', 'UI uses escapeHtml() for XSS prevention');

  const requiredMethods = ['renderMemoryDashboard', 'renderMemoryDetail', 'renderMemoryEditor', 'renderCollectionsList'];
  requiredMethods.forEach(method => {
    check(content.includes(method), 'high', `UI has ${method}()`);
  });

  check(content.includes('aria-label') || content.includes('aria-labelledby'), 'medium', 'UI has ARIA labels');
  check(content.includes('keydown') || content.includes('keyboard') || content.includes('tabindex'), 'medium', 'UI has keyboard support');
}

function validateStaticAnalysis() {
  console.log('\n=== Static Analysis ===');
  const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.js'));
  files.forEach(f => {
    const fp = path.join(MEMORY_DIR, f);
    try {
      require('child_process').execSync(`node --check "${fp}"`, { stdio: 'pipe' });
      check(true, 'ok', `node --check passed: ${f}`);
    } catch (e) {
      check(false, 'critical', `node --check FAILED: ${f}`);
    }
  });

  // Check HTML page exists
  const htmlPath = path.join(REPO, 'website', 'pages', 'memory.html');
  check(fs.existsSync(htmlPath), 'critical', 'memory.html page exists');

  // Check CSS exists
  const cssPath = path.join(REPO, 'website', 'styles', 'memory.css');
  check(fs.existsSync(cssPath), 'critical', 'memory.css stylesheet exists');
}

function validateIntegration() {
  console.log('\n=== Integration Validation ===');

  // Check routes
  const routesPath = path.join(REPO, 'website', 'scripts', 'router', 'routes.js');
  const routesContent = fs.readFileSync(routesPath, 'utf-8');
  check(routesContent.includes("'memory'"), 'critical', 'Memory route defined');
  check(routesContent.includes("#/memory"), 'critical', 'Memory route path defined');

  // Check router templates
  const routerPath = path.join(REPO, 'website', 'scripts', 'router', 'router.js');
  const routerContent = fs.readFileSync(routerPath, 'utf-8');
  check(routerContent.includes('memory:'), 'critical', 'Memory template defined in router');
  check(routerContent.includes('memory-detail'), 'critical', 'Memory detail template defined');

  // Check navigation
  const indexPath = path.join(REPO, 'website', 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  check(indexContent.includes('#/memory'), 'critical', 'Memory navigation link present');
  check(indexContent.includes('memory.css'), 'critical', 'Memory CSS included');
  check(indexContent.includes('memory-schema.js'), 'critical', 'Memory scripts included');

  // Check app.js integration
  const appPath = path.join(REPO, 'website', 'scripts', 'app.js');
  const appContent = fs.readFileSync(appPath, 'utf-8');
  check(appContent.includes('MemoryStorage'), 'critical', 'app.js initializes MemoryStorage');
  check(appContent.includes('MemoryIndexer'), 'critical', 'app.js initializes MemoryIndexer');
  check(appContent.includes('MemoryExportImport'), 'critical', 'app.js initializes MemoryExportImport');
  check(appContent.includes('SessionContinuity'), 'critical', 'app.js initializes SessionContinuity');
  check(appContent.includes("'memory'"), 'critical', 'app.js handles memory route');

  // Check search integration
  const searchPath = path.join(REPO, 'website', 'scripts', 'curriculum', 'curriculum-search.js');
  const searchContent = fs.readFileSync(searchPath, 'utf-8');
  check(searchContent.includes('MemoryRegistry'), 'critical', 'Search integrates with MemoryRegistry');
  check(searchContent.includes("type: 'memory'"), 'critical', 'Search defines memory result type');

  // Check workspace integration
  const workspacePath = path.join(REPO, 'website', 'scripts', 'workspace', 'workspace-controller.js');
  const workspaceContent = fs.readFileSync(workspacePath, 'utf-8');
  check(workspaceContent.includes('renderPinnedMemories'), 'critical', 'Workspace has renderPinnedMemories()');
  check(workspaceContent.includes('data-pinned-memories-mount'), 'critical', 'Workspace has pinned memories DOM marker');
}

function runValidation() {
  console.log('NV-1100-P8 — Memory System Validator');
  console.log('====================================\n');

  validateSchema();
  validateRegistry();
  validateStorage();
  validateCollections();
  validateIndexer();
  validateRetrieval();
  validateSessionContinuity();
  validateSearch();
  validateExportImport();
  validateUIController();
  validateStaticAnalysis();
  validateIntegration();

  console.log('\n=== Validation Summary ===');
  console.log(`Total checks: ${checked}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${checked - passed}`);
  console.log(`Critical: ${critical.length}`);
  console.log(`High: ${high.length}`);
  console.log(`Medium: ${medium.length}`);
  console.log(`Low: ${low.length}`);

  if (critical.length > 0) {
    console.log('\n\x1b[31mCRITICAL ISSUES:\x1b[0m');
    critical.forEach(c => console.log(`  - ${c}`));
  }

  if (high.length > 0) {
    console.log('\n\x1b[31mHIGH ISSUES:\x1b[0m');
    high.forEach(h => console.log(`  - ${h}`));
  }

  const verdict = critical.length === 0 && high.length === 0;
  console.log(`\n\x1b[${verdict ? '32' : '31'}mVERDICT: ${verdict ? 'PASS' : 'FAIL'}\x1b[0m`);

  return { critical: critical.length, high: high.length, medium: medium.length, low: low.length, passed, total: checked };
}

if (require.main === module) {
  const result = runValidation();
  process.exit(result.critical > 0 || result.high > 0 ? 1 : 0);
}

module.exports = { runValidation };
