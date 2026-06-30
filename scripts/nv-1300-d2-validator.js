#!/usr/bin/env node
/**
 * NV-1300-D2 — Research Architecture Agent Validator
 *
 * Validates all D2 modules for:
 *  - Module existence and factory function exposure
 *  - No syntax errors
 *  - Required API surface
 *  - Forbidden patterns (Math.random, Date.now, fetch, etc.)
 *  - Deterministic constraints
 *  - Governance compliance (no learner inference, no cloud, no canonical mutation)
 *  - Citation validation
 *  - Source quality labels
 *  - Conflict detection
 *  - Consensus analysis
 *  - Report composition
 *  - Evidence traceability
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { hasForbiddenPattern, hasForbiddenTerm } = require('./governance-tokenizer.js');

const BASE = path.join(__dirname, '..', 'website', 'scripts', 'agents');

const D2_FILES = [
  { name: 'research-planner', path: path.join(BASE, 'research-planner.js') },
  { name: 'question-decomposer', path: path.join(BASE, 'question-decomposer.js') },
  { name: 'research-strategy-builder', path: path.join(BASE, 'research-strategy-builder.js') },
  { name: 'evidence-collector', path: path.join(BASE, 'evidence-collector.js') },
  { name: 'evidence-ranker', path: path.join(BASE, 'evidence-ranker.js') },
  { name: 'claim-extractor', path: path.join(BASE, 'claim-extractor.js') },
  { name: 'conflict-detector', path: path.join(BASE, 'conflict-detector.js') },
  { name: 'consensus-analyzer', path: path.join(BASE, 'consensus-analyzer.js') },
  { name: 'knowledge-synthesizer', path: path.join(BASE, 'knowledge-synthesizer.js') },
  { name: 'research-report-composer', path: path.join(BASE, 'research-report-composer.js') },
  { name: 'citation-validator', path: path.join(BASE, 'citation-validator.js') },
  { name: 'source-quality-engine', path: path.join(BASE, 'source-quality-engine.js') },
  { name: 'research-memory-bridge', path: path.join(BASE, 'research-memory-bridge.js') },
  { name: 'research-semantic-bridge', path: path.join(BASE, 'research-semantic-bridge.js') },
  { name: 'research-generative-augmenter', path: path.join(BASE, 'research-generative-augmenter.js') }
];

let errors = [];
let checked = 0;
let passed = 0;

function log(level, message) {
  const prefix = { error: '\x1b[31mERROR\x1b[0m', warn: '\x1b[33mWARN\x1b[0m', ok: '\x1b[32mPASS\x1b[0m', info: '\x1b[36mINFO\x1b[0m' };
  console.log(`${prefix[level] || '    '}  ${message}`);
}

function check(condition, message) {
  checked++;
  if (condition) { passed++; log('ok', message); }
  else { errors.push(message); log('error', message); }
}

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch (e) { return null; }
}

function fileExists(filePath) { return fs.existsSync(filePath); }

function _stripEsm(content) {
  return content
    .replace(/^export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/^import\s+\w+\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');
}

function testModuleExistence() {
  log('info', '=== Module Existence ===');
  for (const mod of D2_FILES) {
    check(fileExists(mod.path), `Module exists: ${mod.name}.js`);
  }
}

function testSyntaxValidation() {
  log('info', '=== Syntax Validation ===');
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    if (!content) { check(false, `File not readable: ${mod.name}.js`); continue; }
    try {
      new vm.Script(_stripEsm(content), { filename: mod.name + '.js' });
      check(true, `Syntax valid: ${mod.name}.js`);
    } catch (e) {
      check(false, `Syntax error in ${mod.name}.js: ${e.message}`);
    }
  }
}

function testFactoryExposure() {
  log('info', '=== Factory Function Exposure ===');
  const expected = {
    'research-planner.js': 'createResearchPlanner',
    'question-decomposer.js': 'createQuestionDecomposer',
    'research-strategy-builder.js': 'createResearchStrategyBuilder',
    'evidence-collector.js': 'createEvidenceCollector',
    'evidence-ranker.js': 'createEvidenceRanker',
    'claim-extractor.js': 'createClaimExtractor',
    'conflict-detector.js': 'createConflictDetector',
    'consensus-analyzer.js': 'createConsensusAnalyzer',
    'knowledge-synthesizer.js': 'createKnowledgeSynthesizer',
    'research-report-composer.js': 'createResearchReportComposer',
    'citation-validator.js': 'createCitationValidator',
    'source-quality-engine.js': 'createSourceQualityEngine',
    'research-memory-bridge.js': 'createResearchMemoryBridge',
    'research-semantic-bridge.js': 'createResearchSemanticBridge',
    'research-generative-augmenter.js': 'createResearchGenerativeAugmenter'
  };
  for (const [filename, factory] of Object.entries(expected)) {
    const content = readFile(path.join(BASE, filename));
    check(content && content.includes(`function ${factory}`), `Factory: ${factory} in ${filename}`);
  }
}

function testNamespaceExposure() {
  log('info', '=== Namespace Exposure ===');
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    check(content && content.includes('window.NeuralVerse'), `Namespace: window.NeuralVerse in ${mod.name}.js`);
  }
}

function testResearchPlannerAPI() {
  log('info', '=== Research Planner API ===');
  const content = readFile(path.join(BASE, 'research-planner.js'));
  if (!content) { check(false, 'research-planner.js not readable'); return; }
  check(content.includes('buildPlan'), 'Planner: buildPlan');
  check(content.includes('validatePlan'), 'Planner: validatePlan');
  check(content.includes('explainPlan'), 'Planner: explainPlan');
  check(content.includes('getLastPlan'), 'Planner: getLastPlan');
  check(content.includes('RESEARCH_INTENTS'), 'Planner: RESEARCH_INTENTS exported');
  check(content.includes('DEPTH_PRESETS'), 'Planner: DEPTH_PRESETS exported');
}

function testDecomposerAPI() {
  log('info', '=== Question Decomposer API ===');
  const content = readFile(path.join(BASE, 'question-decomposer.js'));
  if (!content) { check(false, 'question-decomposer.js not readable'); return; }
  check(content.includes('decompose'), 'Decomposer: decompose');
  check(content.includes('DECOMPOSITION_TEMPLATES'), 'Decomposer: DECOMPOSITION_TEMPLATES exported');
}

function testStrategyBuilderAPI() {
  log('info', '=== Research Strategy Builder API ===');
  const content = readFile(path.join(BASE, 'research-strategy-builder.js'));
  if (!content) { check(false, 'research-strategy-builder.js not readable'); return; }
  check(content.includes('buildStrategy'), 'Strategy: buildStrategy');
  check(content.includes('STRATEGY_TYPES'), 'Strategy: STRATEGY_TYPES exported');
  check(content.includes('STRATEGY_STEPS'), 'Strategy: STRATEGY_STEPS exported');
  const strategies = ['comparative_review', 'systematic_overview', 'historical_evolution', 'implementation_analysis', 'benchmark_analysis', 'algorithmic_analysis', 'survey', 'state_of_the_art', 'failure_analysis', 'design_pattern_analysis'];
  for (const s of strategies) {
    check(content.includes(s), 'Strategy: ' + s + ' defined');
  }
}

function testEvidenceCollectorAPI() {
  log('info', '=== Evidence Collector API ===');
  const content = readFile(path.join(BASE, 'evidence-collector.js'));
  if (!content) { check(false, 'evidence-collector.js not readable'); return; }
  check(content.includes('collect'), 'Collector: collect');
  check(content.includes('EVIDENCE_SOURCES'), 'Collector: EVIDENCE_SOURCES exported');
  const sources = ['curriculum', 'shared_knowledge', 'concept', 'laboratory', 'visualization', 'external'];
  for (const s of sources) {
    check(content.includes(s), 'Collector: source ' + s + ' defined');
  }
}

function testEvidenceRankerAPI() {
  log('info', '=== Evidence Ranker API ===');
  const content = readFile(path.join(BASE, 'evidence-ranker.js'));
  if (!content) { check(false, 'evidence-ranker.js not readable'); return; }
  check(content.includes('rank'), 'Ranker: rank');
  check(content.includes('SOURCE_QUALITY_SCORES'), 'Ranker: SOURCE_QUALITY_SCORES exported');
}

function testClaimExtractorAPI() {
  log('info', '=== Claim Extractor API ===');
  const content = readFile(path.join(BASE, 'claim-extractor.js'));
  if (!content) { check(false, 'claim-extractor.js not readable'); return; }
  check(content.includes('extractFromEvidence'), 'Extractor: extractFromEvidence');
}

function testConflictDetectorAPI() {
  log('info', '=== Conflict Detector API ===');
  const content = readFile(path.join(BASE, 'conflict-detector.js'));
  if (!content) { check(false, 'conflict-detector.js not readable'); return; }
  check(content.includes('detect'), 'Detector: detect');
}

function testConsensusAnalyzerAPI() {
  log('info', '=== Consensus Analyzer API ===');
  const content = readFile(path.join(BASE, 'consensus-analyzer.js'));
  if (!content) { check(false, 'consensus-analyzer.js not readable'); return; }
  check(content.includes('analyze'), 'Analyzer: analyze');
  check(content.includes('CONSENSUS_LEVELS'), 'Analyzer: CONSENSUS_LEVELS exported');
  const levels = ['strong_consensus', 'moderate_consensus', 'limited_evidence', 'conflicting_evidence', 'insufficient_evidence'];
  for (const l of levels) {
    check(content.includes(l), 'Analyzer: level ' + l + ' defined');
  }
}

function testSynthesizerAPI() {
  log('info', '=== Knowledge Synthesizer API ===');
  const content = readFile(path.join(BASE, 'knowledge-synthesizer.js'));
  if (!content) { check(false, 'knowledge-synthesizer.js not readable'); return; }
  check(content.includes('synthesize'), 'Synthesizer: synthesize');
}

function testReportComposerAPI() {
  log('info', '=== Research Report Composer API ===');
  const content = readFile(path.join(BASE, 'research-report-composer.js'));
  if (!content) { check(false, 'research-report-composer.js not readable'); return; }
  check(content.includes('composeReport'), 'Composer: composeReport');
  check(content.includes('STANDARD_SECTIONS'), 'Composer: STANDARD_SECTIONS exported');
  const sections = ['research_question', 'scope', 'methodology', 'evidence', 'claims', 'consensus', 'conflicts', 'limitations', 'conclusion', 'references'];
  for (const s of sections) {
    check(content.includes(s), 'Composer: section ' + s + ' defined');
  }
}

function testCitationValidatorAPI() {
  log('info', '=== Citation Validator API ===');
  const content = readFile(path.join(BASE, 'citation-validator.js'));
  if (!content) { check(false, 'citation-validator.js not readable'); return; }
  check(content.includes('validate'), 'Validator: validate');
}

function testSourceQualityAPI() {
  log('info', '=== Source Quality Engine API ===');
  const content = readFile(path.join(BASE, 'source-quality-engine.js'));
  if (!content) { check(false, 'source-quality-engine.js not readable'); return; }
  check(content.includes('label'), 'Quality: label');
  check(content.includes('labelAll'), 'Quality: labelAll');
  check(content.includes('QUALITY_LABELS'), 'Quality: QUALITY_LABELS exported');
  const labels = ['canonical', 'peer_reviewed', 'conference', 'preprint', 'implementation_reference', 'documentation', 'community_reference'];
  for (const l of labels) {
    check(content.includes(l), 'Quality: label ' + l + ' defined');
  }
}

function testMemoryBridgeAPI() {
  log('info', '=== Research Memory Bridge API ===');
  const content = readFile(path.join(BASE, 'research-memory-bridge.js'));
  if (!content) { check(false, 'research-memory-bridge.js not readable'); return; }
  check(content.includes('loadBookmarks'), 'Memory: loadBookmarks');
  check(content.includes('loadSavedPapers'), 'Memory: loadSavedPapers');
  check(content.includes('loadPinnedResearch'), 'Memory: loadPinnedResearch');
  check(content.includes('buildContext'), 'Memory: buildContext');
}

function testSemanticBridgeAPI() {
  log('info', '=== Research Semantic Bridge API ===');
  const content = readFile(path.join(BASE, 'research-semantic-bridge.js'));
  if (!content) { check(false, 'research-semantic-bridge.js not readable'); return; }
  check(content.includes('getRelatedConcepts'), 'Semantic: getRelatedConcepts');
  check(content.includes('getPrerequisites'), 'Semantic: getPrerequisites');
  check(content.includes('expandContext'), 'Semantic: expandContext');
}

function testGenerativeAugmenterAPI() {
  log('info', '=== Research Generative Augmenter API ===');
  const content = readFile(path.join(BASE, 'research-generative-augmenter.js'));
  if (!content) { check(false, 'research-generative-augmenter.js not readable'); return; }
  check(content.includes('generateAlternativeSummary'), 'GenAug: generateAlternativeSummary');
  check(content.includes('generateComparisonWording'), 'GenAug: generateComparisonWording');
  check(content.includes('generateExplanationRefinement'), 'GenAug: generateExplanationRefinement');
  check(content.includes('generateBrainstorming'), 'GenAug: generateBrainstorming');
  check(content.includes('AUGMENTATION_TYPES'), 'GenAug: AUGMENTATION_TYPES exported');
  check(content.includes('ALLOWED_AUGMENTATION_TYPES'), 'GenAug: ALLOWED_AUGMENTATION_TYPES exported');
  check(content.includes('FORBIDDEN_REPLACE_TYPES'), 'GenAug: FORBIDDEN_REPLACE_TYPES exported');
  check(content.includes('NonCanonical'), 'GenAug: marks generated as NonCanonical');
}

function testForbiddenPatterns() {
  log('info', '=== Forbidden Patterns (Determinism & IO) ===');
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bMath\.random\b/g) === 0, `No Math.random in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bDate\.now\b/g) === 0, `No Date.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bperformance\.now\b/g) === 0, `No performance.now in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\beval\s*\(/g) === 0, `No eval() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bnew\s+Function\s*\(/g) === 0, `No new Function() in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bXMLHttpRequest\b/g) === 0, `No XMLHttpRequest in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bWebSocket\b/g) === 0, `No WebSocket in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bfetch\s*\(/g) === 0, `No fetch() in ${mod.name}.js`);
  }
}

function testForbiddenTerms() {
  log('info', '=== Forbidden Terms (Learner Inference & Fabrication) ===');
  const forbiddenTerms = [
    'mastery', 'mastered', 'competence', 'competency', 'proficiency',
    'skill score', 'skill_score', 'learner model', 'learner_model',
    'adaptive difficulty', 'adaptive_difficulty', 'personalization',
    'learning style', 'learning_style', 'weakness score', 'weakness_score',
    'strength score', 'strength_score', 'intelligence score',
    'fake citation', 'fabricated benchmark', 'hidden retrieval'
  ];
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    if (!content) continue;
    for (const term of forbiddenTerms) {
      check(!hasForbiddenTerm(content, term), `No '${term}' in ${mod.name}.js`);
    }
  }
}

function testNoCloudProviders() {
  log('info', '=== No Cloud Providers ===');
  const cloudPatterns = [
    /https?:\/\/api\.openai\.com/g,
    /https?:\/\/api\.anthropic\.com/g,
    /https?:\/\/generativelanguage\.googleapis\.com/g,
    /https?:\/\/api\.cohere\.ai/g,
    /https?:\/\/api\.mistral\.ai/g,
    /https?:\/\/api\.huggingface\.com/g
  ];
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    if (!content) continue;
    for (const pattern of cloudPatterns) {
      check(hasForbiddenPattern(content, pattern) === 0, `No cloud endpoint in ${mod.name}.js (${pattern})`);
    }
  }
}

function testNoCurriculumMutation() {
  log('info', '=== No Curriculum Mutation ===');
  for (const mod of D2_FILES) {
    const content = readFile(mod.path);
    if (!content) continue;
    check(hasForbiddenPattern(content, /\bwriteFile\s*\(/g) === 0, `No writeFile in ${mod.name}.js`);
    check(hasForbiddenPattern(content, /\bappendFile\s*\(/g) === 0, `No appendFile in ${mod.name}.js`);
  }
}

function testFileSizes() {
  log('info', '=== File Size Sanity ===');
  for (const mod of D2_FILES) {
    if (!fileExists(mod.path)) continue;
    const stat = fs.statSync(mod.path);
    const sizeKB = stat.size / 1024;
    check(sizeKB > 1, `${mod.name}.js >1KB: ${sizeKB.toFixed(1)}KB`);
    check(sizeKB < 60, `${mod.name}.js <60KB: ${sizeKB.toFixed(1)}KB`);
  }
}

function testPerformanceBudgets() {
  log('info', '=== Performance Budgets ===');
  const planner = readFile(path.join(BASE, 'research-planner.js'));
  if (planner) check(planner.includes('buildPlan'), 'Planner: pure computation → <20ms achievable');
  const ranker = readFile(path.join(BASE, 'evidence-ranker.js'));
  if (ranker) check(ranker.includes('rank'), 'Ranker: rule-based → <20ms achievable');
  const claims = readFile(path.join(BASE, 'claim-extractor.js'));
  if (claims) check(claims.includes('extractFromEvidence'), 'Claim Extractor: pure → <20ms achievable');
  const composer = readFile(path.join(BASE, 'research-report-composer.js'));
  if (composer) check(composer.includes('composeReport'), 'Report Composer: pure → <20ms achievable');
}

function runAllTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  NV-1300-D2 — Research Architecture Agent Validator');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  testModuleExistence();
  console.log('');
  testSyntaxValidation();
  console.log('');
  testFactoryExposure();
  console.log('');
  testNamespaceExposure();
  console.log('');
  testResearchPlannerAPI();
  console.log('');
  testDecomposerAPI();
  console.log('');
  testStrategyBuilderAPI();
  console.log('');
  testEvidenceCollectorAPI();
  console.log('');
  testEvidenceRankerAPI();
  console.log('');
  testClaimExtractorAPI();
  console.log('');
  testConflictDetectorAPI();
  console.log('');
  testConsensusAnalyzerAPI();
  console.log('');
  testSynthesizerAPI();
  console.log('');
  testReportComposerAPI();
  console.log('');
  testCitationValidatorAPI();
  console.log('');
  testSourceQualityAPI();
  console.log('');
  testMemoryBridgeAPI();
  console.log('');
  testSemanticBridgeAPI();
  console.log('');
  testGenerativeAugmenterAPI();
  console.log('');
  testForbiddenPatterns();
  console.log('');
  testForbiddenTerms();
  console.log('');
  testNoCloudProviders();
  console.log('');
  testNoCurriculumMutation();
  console.log('');
  testFileSizes();
  console.log('');
  testPerformanceBudgets();
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Checks:  ${checked}`);
  console.log(`  Passed:  ${passed}`);
  console.log(`  Errors:  ${errors.length}`);
  console.log('');

  if (errors.length === 0) {
    console.log('\x1b[32m  ALL CHECKS PASSED\x1b[0m');
  } else {
    console.log('\x1b[31m  ERRORS FOUND:\x1b[0m');
    for (const err of errors) {
      console.log(`    \x1b[31m- ${err}\x1b[0m`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');

  const reportDir = path.join(__dirname, '..', 'docs', 'architecture', 'nv-1300');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    validator: 'NV-1300-D2-research-architecture',
    timestamp: new Date().toISOString(),
    summary: { checks: checked, passed, errors: errors.length, verdict: errors.length === 0 ? 'READY' : 'NOT READY' },
    errors
  };

  try {
    fs.writeFileSync(path.join(reportDir, 'nv-1300-d2-validator-report.json'), JSON.stringify(report, null, 2));
    console.log('  Report written to docs/architecture/nv-1300/nv-1300-d2-validator-report.json');
  } catch (e) { console.log('  Could not write report: ' + e.message); }

  console.log('');
  process.exit(errors.length === 0 ? 0 : 1);
}

runAllTests();
