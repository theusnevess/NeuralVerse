#!/usr/bin/env node
/**
 * Harness Compliance Validator
 *
 * Validates that the NeuralVerse Agentic Development Harness pipeline
 * was followed during a session. Checks for:
 *
 * - opencode.json mandatory instructions present
 * - BOOTSTRAP.md exists and contains required sections
 * - pipeline-gatekeeper skill exists
 * - All required skills are present
 * - AGENTS.md contains harness pipeline specification
 *
 * Run after each session to verify compliance.
 *
 * Usage:
 *   node scripts/harness-compliance-validator.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const OPENCODE_DIR = path.join(PROJECT_ROOT, '.opencode');
const SKILLS_DIR = path.join(OPENCODE_DIR, 'skills');
const AGENTS_FILE = path.join(PROJECT_ROOT, 'AGENTS.md');

let errors = [];
let warnings = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = {
    error: '\x1b[31mERROR\x1b[0m',
    warn: '\x1b[33mWARN\x1b[0m',
    ok: '\x1b[32mPASS\x1b[0m',
    info: '\x1b[36mINFO\x1b[0m',
    check: '\x1b[35mCHECK\x1b[0m'
  };
  console.log(`${prefix[level] || '    '}  ${message}`);
}

function check(condition, message) {
  checked++;
  if (condition) {
    passed++;
    log('ok', message);
  } else {
    errors.push(message);
    log('error', message);
  }
}

function warn(message) {
  warnings.push(message);
  log('warn', message);
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) { return null; }
}

function fileExists(filePath) { return fs.existsSync(filePath); }

// --- opencode.json Validation ---
function testOpenCodeConfig() {
  log('check', '=== opencode.json Configuration ===');

  const configPath = path.join(OPENCODE_DIR, 'opencode.json');
  check(fileExists(configPath), 'opencode.json exists');

  const content = readFile(configPath);
  if (!content) {
    check(false, 'opencode.json not readable');
    return;
  }

  let config;
  try {
    config = JSON.parse(content);
    check(true, 'opencode.json is valid JSON');
  } catch (e) {
    check(false, `opencode.json parse error: ${e.message}`);
    return;
  }

  check(Array.isArray(config.instructions), 'opencode.json has instructions array');
  check(config.instructions.length >= 4, `opencode.json has ${config.instructions.length} instructions (minimum 4)`);

  // Check mandatory instruction keywords
  const fullText = config.instructions.join(' ');
  check(fullText.includes('MANDATORY'), 'Instructions contain MANDATORY directive');
  check(fullText.includes('harness-orchestrator'), 'Instructions reference harness-orchestrator');
  check(fullText.includes('Harness Pipeline Used'), 'Instructions require Harness Pipeline Used summary');
  check(fullText.includes('FORBIDDEN'), 'Instructions contain FORBIDDEN directive');
}

// --- BOOTSTRAP.md Validation ---
function testBootstrap() {
  log('check', '=== BOOTSTRAP.md Validation ===');

  const bootstrapPath = path.join(OPENCODE_DIR, 'BOOTSTRAP.md');
  check(fileExists(bootstrapPath), 'BOOTSTRAP.md exists');

  const content = readFile(bootstrapPath);
  if (!content) {
    check(false, 'BOOTSTRAP.md not readable');
    return;
  }

  check(content.includes('Mandatory Bootstrap'), 'BOOTSTRAP.md has mandatory title');
  check(content.includes('HARD REQUIREMENT'), 'BOOTSTRAP.md has hard requirement section');
  check(content.includes('harness-orchestrator'), 'BOOTSTRAP.md references harness-orchestrator');
  check(content.includes('context-governance'), 'BOOTSTRAP.md references context-governance');
  check(content.includes('pipeline-gatekeeper'), 'BOOTSTRAP.md references pipeline-gatekeeper');
  check(content.includes('Task Classification'), 'BOOTSTRAP.md has task classification step');
  check(content.includes('Skill Selection'), 'BOOTSTRAP.md has skill selection step');
  check(content.includes('Execution Plan'), 'BOOTSTRAP.md has execution plan step');
  check(content.includes('Validation'), 'BOOTSTRAP.md has validation step');
  check(content.includes('Harness Pipeline Used'), 'BOOTSTRAP.md requires pipeline summary');
  check(content.includes('## Harness Pipeline Used'), 'BOOTSTRAP.md has pipeline summary format');
}

// --- Required Skills Validation ---
function testRequiredSkills() {
  log('check', '=== Required Skills ===');

  const requiredSkills = [
    'harness-orchestrator',
    'context-governance',
    'pipeline-gatekeeper',
    'token-economy-auditor',
    'testing-and-debugging',
    'git-hygiene',
    'architecture-review'
  ];

  for (const skill of requiredSkills) {
    const skillPath = path.join(SKILLS_DIR, skill, 'SKILL.md');
    check(fileExists(skillPath), `Skill exists: ${skill}`);

    if (fileExists(skillPath)) {
      const content = readFile(skillPath);
      if (content) {
        check(content.length > 100, `Skill ${skill} has content (>100 chars)`);
      }
    }
  }
}

// --- Pipeline Gatekeeper Skill Validation ---
function testPipelineGatekeeper() {
  log('check', '=== Pipeline Gatekeeper Skill ===');

  const gatekeeperPath = path.join(SKILLS_DIR, 'pipeline-gatekeeper', 'SKILL.md');
  check(fileExists(gatekeeperPath), 'pipeline-gatekeeper skill exists');

  const content = readFile(gatekeeperPath);
  if (!content) {
    check(false, 'pipeline-gatekeeper not readable');
    return;
  }

  check(content.includes('HARNESS GATE: BLOCKED'), 'Gatekeeper defines BLOCKED output');
  check(content.includes('HARNESS GATE: PASSED'), 'Gatekeeper defines PASSED output');
  check(content.includes('HARNESS POST-GATE'), 'Gatekeeper defines post-implementation gate');
  check(content.includes('HARNESS CHECKLIST'), 'Gatekeeper has checklist template');
  check(content.includes('harness-orchestrator'), 'Gatekeeper validates harness-orchestrator loaded');
  check(content.includes('context-governance'), 'Gatekeeper validates context-governance loaded');
  check(content.includes('execution plan'), 'Gatekeeper validates execution plan exists');
  check(content.includes('validation'), 'Gatekeeper validates validation was run');
}

// --- AGENTS.md Validation ---
function testAgentsMd() {
  log('check', '=== AGENTS.md Harness Specification ===');

  check(fileExists(AGENTS_FILE), 'AGENTS.md exists');

  const content = readFile(AGENTS_FILE);
  if (!content) {
    check(false, 'AGENTS.md not readable');
    return;
  }

  check(content.includes('Harness Pipeline Used'), 'AGENTS.md specifies Harness Pipeline Used format');
  check(content.includes('harness-orchestrator') || content.includes('Harness Orchestrator'), 'AGENTS.md references harness-orchestrator');
  check(content.includes('context-governance') || content.includes('Context Governance'), 'AGENTS.md references context-governance');
  check(content.includes('Pipeline Stages'), 'AGENTS.md defines pipeline stages');
  check(content.includes('git status'), 'AGENTS.md includes git status as first step');
  check(content.includes('Repository Discovery'), 'AGENTS.md includes repository discovery');
  check(content.includes('Specialist Skills'), 'AGENTS.md includes specialist skills step');
  check(content.includes('Validation'), 'AGENTS.md includes validation step');
  check(content.includes('Git Hygiene'), 'AGENTS.md includes git hygiene step');
}

// --- Enforcement Chain Validation ---
function testEnforcementChain() {
  log('check', '=== Enforcement Chain Integrity ===');

  // Verify opencode.json references BOOTSTRAP.md
  const config = readFile(path.join(OPENCODE_DIR, 'opencode.json'));
  if (config) {
    check(config.includes('BOOTSTRAP.md'), 'opencode.json references BOOTSTRAP.md');
  }

  // Verify BOOTSTRAP.md references pipeline-gatekeeper
  const bootstrap = readFile(path.join(OPENCODE_DIR, 'BOOTSTRAP.md'));
  if (bootstrap) {
    check(bootstrap.includes('pipeline-gatekeeper'), 'BOOTSTRAP.md references pipeline-gatekeeper');
  }

  // Verify pipeline-gatekeeper references harness-orchestrator
  const gatekeeper = readFile(path.join(SKILLS_DIR, 'pipeline-gatekeeper', 'SKILL.md'));
  if (gatekeeper) {
    check(gatekeeper.includes('harness-orchestrator'), 'pipeline-gatekeeper references harness-orchestrator');
    check(gatekeeper.includes('context-governance'), 'pipeline-gatekeeper references context-governance');
  }

  // Verify harness-orchestrator references context-governance
  const orchestrator = readFile(path.join(SKILLS_DIR, 'harness-orchestrator', 'SKILL.md'));
  if (orchestrator) {
    check(orchestrator.includes('context-governance'), 'harness-orchestrator references context-governance');
    check(orchestrator.includes('git-hygiene'), 'harness-orchestrator references git-hygiene');
  }

  // Verify chain completeness
  const chain = [
    'opencode.json -> BOOTSTRAP.md',
    'BOOTSTRAP.md -> pipeline-gatekeeper',
    'pipeline-gatekeeper -> harness-orchestrator',
    'harness-orchestrator -> context-governance',
    'harness-orchestrator -> specialist skills',
    'harness-orchestrator -> git-hygiene'
  ];
  log('info', 'Enforcement chain: ' + chain.join(' -> '));
}

// --- Run All Tests ---
function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Harness Compliance Validator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testOpenCodeConfig();
  console.log('');
  testBootstrap();
  console.log('');
  testRequiredSkills();
  console.log('');
  testPipelineGatekeeper();
  console.log('');
  testAgentsMd();
  console.log('');
  testEnforcementChain();
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Checks:  ${checked}`);
  console.log(`  Passed:  ${passed}`);
  console.log(`  Errors:  ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log('');

  if (errors.length === 0) {
    console.log('\x1b[32m  HARNESS ENFORCEMENT: ACTIVE\x1b[0m');
  } else {
    console.log('\x1b[31m  HARNESS ENFORCEMENT: INCOMPLETE\x1b[0m');
    console.log('');
    console.log('\x1b[31m  MISSING COMPONENTS:\x1b[0m');
    for (const err of errors) {
      console.log(`    \x1b[31m- ${err}\x1b[0m`);
    }
  }

  if (warnings.length > 0) {
    console.log('');
    console.log('\x1b[33m  WARNINGS:\x1b[0m');
    for (const warn of warnings) {
      console.log(`    \x1b[33m- ${warn}\x1b[0m`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
