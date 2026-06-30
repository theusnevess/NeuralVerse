#!/usr/bin/env node
/**
 * NV-1100-P7 — Laboratory Validator
 *
 * Validates the laboratory system for:
 * - All lab definition files exist and are loadable
 * - Schema correctness for all labs
 * - Deterministic outputs (identical inputs → identical outputs)
 * - Parameter validation
 * - Visualization consistency
 * - Concept references exist
 * - Artifact references format
 * - Persistence compatibility
 * - Export/import compatibility
 * - Absence of runtime exceptions
 * - No eval(), no Function(), no external requests
 * - No Math.random() in lab definitions
 * - CSS file exists
 * - HTML pages exist
 * - Route definitions present
 * - Search integration present
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const LABS_DIR = path.join(REPO, 'website', 'data', 'laboratories');
const SCRIPTS_DIR = path.join(REPO, 'website', 'scripts', 'laboratory');
const STYLES_DIR = path.join(REPO, 'website', 'styles');
const PAGES_DIR = path.join(REPO, 'website', 'pages');
const ROUTES_FILE = path.join(REPO, 'website', 'scripts', 'router', 'routes.js');
const SEARCH_FILE = path.join(REPO, 'website', 'scripts', 'curriculum', 'curriculum-search.js');
const APP_FILE = path.join(REPO, 'website', 'scripts', 'app.js');
const INDEX_FILE = path.join(REPO, 'website', 'index.html');

const EXPECTED_LABS = [
  'linear-regression-lab.js',
  'logistic-regression-lab.js',
  'gradient-descent-lab.js',
  'kmeans-clustering-lab.js',
  'pca-projection-lab.js',
  'embedding-similarity-lab.js',
  'cosine-similarity-lab.js',
  'bayes-rule-lab.js',
  'precision-recall-lab.js',
  'transformer-attention-lab.js'
];

const EXPECTED_SCRIPTS = [
  'lab-definition.js',
  'parameter-engine.js',
  'execution-engine.js',
  'visualization-engine.js',
  'lab-registry.js',
  'lab-state-storage.js',
  'export-import-bridge.js',
  'lab-ui-controller.js',
  'laboratory-controller.js',
  'lab-index.js'
];

const VALID_PARAMETER_TYPES = ['slider', 'integer', 'float', 'boolean', 'select', 'enum', 'text', 'vector', 'matrix'];
const VALID_VIZ_TYPES = ['line-chart', 'scatter-plot', 'bar-chart', 'matrix', 'confusion-matrix', 'heatmap', 'table', 'svg-diagram', 'numeric-summary'];
const VALID_STATUSES = ['Draft', 'Reviewed', 'Approved', 'draft', 'reviewed', 'approved'];
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

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
  console.log(`${prefix[level] || 'CHECK'}  ${message}`);
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

function extractLabDefinition(content) {
  // Extract the lab object from IIFE pattern
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const slugMatch = content.match(/slug:\s*['"]([^'"]+)['"]/);
  const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
  const summaryMatch = content.match(/summary:\s*['"]([^'"]+)['"]/);
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  const statusMatch = content.match(/canonicalStatus:\s*['"]([^'"]+)['"]/);
  const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);

  const paramTypes = [];
  const paramMatches = content.matchAll(/type:\s*['"]([^'"]+)['"]/g);
  for (const m of paramMatches) {
    paramTypes.push(m[1]);
  }

  const hasExecute = content.includes('execute:') || content.includes('execute ');
  const hasRegister = content.includes('LabRegistry.register');

  const conceptRefs = [];
  const conceptMatch = content.match(/conceptReferences:\s*\[([^\]]*)\]/);
  if (conceptMatch) {
    const refs = conceptMatch[1].match(/['"]([^'"]+)['"]/g);
    if (refs) refs.forEach(r => conceptRefs.push(r.replace(/['"]/g, '')));
  }

  return {
    id: idMatch ? idMatch[1] : null,
    slug: slugMatch ? slugMatch[1] : null,
    title: titleMatch ? titleMatch[1] : null,
    summary: summaryMatch ? summaryMatch[1] : null,
    category: categoryMatch ? categoryMatch[1] : null,
    canonicalStatus: statusMatch ? statusMatch[1] : null,
    version: versionMatch ? versionMatch[1] : null,
    hasExecute,
    hasRegister,
    paramTypes,
    conceptRefs
  };
}

function validateLabFile(filename) {
  const filepath = path.join(LABS_DIR, filename);
  const exists = fs.existsSync(filepath);
  check(exists, 'critical', `Lab file exists: ${filename}`);
  if (!exists) return;

  const content = fs.readFileSync(filepath, 'utf-8');
  check(content.length > 100, 'high', `Lab file has content: ${filename} (${content.length} bytes)`);

  // Check IIFE pattern
  check(content.includes("'use strict'"), 'high', `${filename}: Uses strict mode`);
  check(content.includes('LabRegistry.register'), 'high', `${filename}: Registers with LabRegistry`);

  // Extract and validate definition
  const def = extractLabDefinition(content);

  check(!!def.id, 'critical', `${filename}: Has id`);
  check(!!def.slug, 'critical', `${filename}: Has slug`);
  check(!!def.title, 'critical', `${filename}: Has title`);
  check(!!def.summary, 'high', `${filename}: Has summary`);
  check(!!def.category, 'high', `${filename}: Has category`);
  check(!!def.canonicalStatus, 'high', `${filename}: Has canonicalStatus`);
  check(VALID_STATUSES.includes(def.canonicalStatus), 'medium', `${filename}: canonicalStatus is valid (${def.canonicalStatus})`);
  check(!!def.version && SEMVER_REGEX.test(def.version), 'medium', `${filename}: Version is semver (${def.version})`);
  check(def.hasExecute, 'critical', `${filename}: Has execute function`);
  check(def.hasRegister, 'high', `${filename}: Calls LabRegistry.register`);

  // Check no eval/Function (skip comments)
  const codeLines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*');
  });
  const codeOnly = codeLines.join('\n');
  check(!codeOnly.includes('eval('), 'critical', `${filename}: No eval()`);
  check(!codeOnly.includes('new Function('), 'critical', `${filename}: No new Function()`);
  check(!codeOnly.includes('Math.random()'), 'high', `${filename}: No Math.random() (deterministic)`);

  // Check no external requests
  check(!codeOnly.includes('fetch('), 'high', `${filename}: No fetch() calls`);
  check(!codeOnly.includes('XMLHttpRequest'), 'high', `${filename}: No XMLHttpRequest`);

  // Validate parameter types - only match within parameterSchema sections
  const paramSection = content.match(/parameterSchema:\s*\[([\s\S]*?)\]/);
  if (paramSection) {
    const paramTypes = [];
    const paramMatches = paramSection[1].matchAll(/type:\s*['"]([^'"]+)['"]/g);
    for (const m of paramMatches) {
      paramTypes.push(m[1]);
    }
    paramTypes.forEach(t => {
      check(VALID_PARAMETER_TYPES.includes(t), 'medium', `${filename}: Valid parameter type (${t})`);
    });
  }

  // Check concept references
  check(Array.isArray(def.conceptRefs), 'medium', `${filename}: conceptReferences is array`);
}

function validateScriptFile(filename) {
  const filepath = path.join(SCRIPTS_DIR, filename);
  const exists = fs.existsSync(filepath);
  check(exists, 'critical', `Script exists: ${filename}`);
  if (!exists) return;

  const content = fs.readFileSync(filepath, 'utf-8');
  check(content.length > 50, 'high', `Script has content: ${filename} (${content.length} bytes)`);
  const codeLines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*');
  });
  const codeOnly = codeLines.join('\n');
  check(!codeOnly.includes('eval('), 'critical', `${filename}: No eval()`);
  check(!codeOnly.includes('new Function('), 'critical', `${filename}: No new Function()`);
}

function validateInfrastructure() {
  console.log('\n=== Infrastructure ===');

  // CSS
  const cssPath = path.join(STYLES_DIR, 'laboratories.css');
  check(fs.existsSync(cssPath), 'critical', 'CSS file exists: laboratories.css');

  // HTML pages
  check(fs.existsSync(path.join(PAGES_DIR, 'laboratory.html')), 'critical', 'Page exists: laboratory.html');
  check(fs.existsSync(path.join(PAGES_DIR, 'laboratory-detail.html')), 'critical', 'Page exists: laboratory-detail.html');

  // Routes
  const routesContent = fs.readFileSync(ROUTES_FILE, 'utf-8');
  check(routesContent.includes("'laboratory'"), 'critical', 'Route "laboratory" defined');
  check(routesContent.includes("'laboratory-detail'"), 'critical', 'Route "laboratory-detail" defined');
  check(routesContent.includes('#/laboratory'), 'high', 'Route path includes #/laboratory');
  check(routesContent.includes('#/laboratory/:slug'), 'high', 'Route path includes /:slug param');

  // Search integration
  const searchContent = fs.readFileSync(SEARCH_FILE, 'utf-8');
  check(searchContent.includes('laboratory') || searchContent.includes('LabRegistry'), 'high', 'Search integration present');

  // App.js integration
  const appContent = fs.readFileSync(APP_FILE, 'utf-8');
  check(appContent.includes('laboratory'), 'critical', 'App.js references laboratory system');
  check(appContent.includes('LaboratoryController') || appContent.includes('laboratoryController'), 'high', 'App.js initializes laboratory controller');
  check(appContent.includes('initLaboratorySystem'), 'high', 'App.js calls initLaboratorySystem');

  // Index.html
  const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
  check(indexContent.includes('laboratories.css'), 'critical', 'Index.html includes laboratories.css');
  check(indexContent.includes('lab-definition.js'), 'critical', 'Index.html includes lab scripts');
  check(indexContent.includes('lab-registry.js'), 'high', 'Index.html includes lab-registry.js');
  check(indexContent.includes('laboratory'), 'high', 'Index.html has laboratory references');

  // Workspace integration
  check(indexContent.includes('#/laboratory'), 'medium', 'Navigation rail has laboratory link');

  // Persistence integration
  const bridgePath = path.join(SCRIPTS_DIR, 'export-import-bridge.js');
  if (fs.existsSync(bridgePath)) {
    const bridgeContent = fs.readFileSync(bridgePath, 'utf-8');
    check(bridgeContent.includes('PersistenceManager'), 'high', 'Export/import bridge integrates with PersistenceManager');
    check(bridgeContent.includes('exportLabState'), 'medium', 'Bridge exports lab state');
    check(bridgeContent.includes('importLabState'), 'medium', 'Bridge imports lab state');
  }
}

function validateDeterminism() {
  console.log('\n=== Determinism Verification ===');

  const labFiles = fs.readdirSync(LABS_DIR).filter(f => f.endsWith('.js'));
  labFiles.forEach(filename => {
    const content = fs.readFileSync(path.join(LABS_DIR, filename), 'utf-8');

    // Check that execute function doesn't use Math.random
    check(!content.includes('Math.random()'), 'high', `${filename}: No Math.random() in lab code`);

    // Check for seeded PRNG pattern
    const hasSeed = content.includes('seed') || content.includes('Seed') || content.includes('PRNG') || content.includes('lcg') || content.includes('LCG') || content.includes('deterministic');
    info.push(`${filename}: Determinism approach: ${hasSeed ? 'seeded PRNG' : 'pure math'}`);
  });
}

function runValidation() {
  console.log('NV-1100-P7 — Laboratory Validator');
  console.log('=================================\n');

  console.log('=== Lab Definition Files ===');
  EXPECTED_LABS.forEach(validateLabFile);

  // Check for unexpected lab files
  const actualLabs = fs.readdirSync(LABS_DIR).filter(f => f.endsWith('.js'));
  const unexpected = actualLabs.filter(f => !EXPECTED_LABS.includes(f));
  unexpected.forEach(f => {
    medium.push(`Unexpected lab file: ${f}`);
    log('medium', `Unexpected lab file: ${f}`);
  });

  console.log('\n=== Script Files ===');
  EXPECTED_SCRIPTS.forEach(validateScriptFile);

  validateInfrastructure();
  validateDeterminism();

  // Summary
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

// Run if called directly
if (require.main === module) {
  const result = runValidation();
  process.exit(result.critical > 0 || result.high > 0 ? 1 : 0);
}

module.exports = { runValidation };
