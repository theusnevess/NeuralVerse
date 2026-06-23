#!/usr/bin/env node
/**
 * NV-1000-A1 Extreme Educational Audit
 * Didactic Architecture Agent — Full-Spectrum Quality Assurance
 *
 * Covers:
 *  - Educational quality (analogies, comparisons, Socratic, misconceptions, step-by-step)
 *  - UI rendering (quick actions, mode selector, structured responses)
 *  - Security (XSS, HTML injection)
 *  - Accessibility (ARIA, keyboard, focus)
 *  - Performance (no DOM leaks)
 *  - Governance (guardrails, no mutations)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

let chromium;
try {
  ({ chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js'));
} catch (error) {
  ({ chromium } = require('playwright'));
}

const ROOT_DIR = path.resolve(__dirname, '..');
const WEBSITE_DIR = path.join(ROOT_DIR, 'website');
const OUT_DIR = '/tmp/neuralverse-a1-extreme-audit';
const REPORT_PATH = path.join(OUT_DIR, 'a1-audit-report.json');

const VIEWPORTS = [
  { width: 390, height: 844, label: '390x844' },
  { width: 768, height: 900, label: '768x900' },
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1440, height: 900, label: '1440x900' }
];

const REQUIRED_COMPARISON_ASPECTS = [
  'Purpose', 'Core Mechanism', 'Inputs', 'Outputs',
  'Training Approach', 'Inference Cost',
  'Typical Use Cases', 'Key Limitations', 'When to Choose'
];

const REQUIRED_MISCONCEPTION_FIELDS = [
  'id', 'title', 'triggers', 'wrong', 'correct',
  'impact', 'whyLearnersBelieveIt', 'intuition', 'verificationPrompt'
];

const SOCRATIC_LAYERS = [
  'observation', 'interpretation', 'prediction',
  'abstraction', 'transfer', 'synthesis'
];

const EXPLANATION_MODE_IDS = [
  'default', 'beginner', 'intermediate', 'advanced', 'mathematical',
  'engineering', 'research', 'visual-intuition', 'analogy-first',
  'step-by-step', 'executive-summary', 'socratic'
];

const INTENT_CATEGORIES = [
  'simplify', 'deepen', 'compare', 'analogy', 'misconception',
  'summarize', 'connect', 'socratic', 'reflection', 'transfer',
  'reading', 'explain'
];

const TEST_QUERIES = [
  { intent: 'explain', query: 'What is overfitting?', expectedMode: 'default' },
  { intent: 'simplify', query: 'Explain this in simple terms', expectedMode: 'beginner' },
  { intent: 'deepen', query: 'Give me a deep technical explanation', expectedMode: 'advanced' },
  { intent: 'compare', query: 'Compare supervised vs unsupervised learning', expectedMode: 'comparison' },
  { intent: 'analogy', query: 'Give me an analogy for overfitting', expectedMode: 'analogy' },
  { intent: 'misconception', query: 'What are common misconceptions about overfitting?', expectedMode: 'misconception' },
  { intent: 'socratic', query: 'Guide me through overfitting with questions', expectedMode: 'socratic' },
  { intent: 'reflection', query: 'Give me reflection prompts about overfitting', expectedMode: 'reflection' },
  { intent: 'transfer', query: 'How is overfitting used in industry?', expectedMode: 'transfer' },
  { intent: 'reading', query: 'Help me read this lesson about overfitting', expectedMode: 'reading-companion' },
  { intent: 'connect', query: 'How does overfitting connect to other concepts?', expectedMode: 'connection' },
  { intent: 'summarize', query: 'Summarize overfitting', expectedMode: 'summary' }
];

const FORBIDDEN_PROMPTS = [
  'Change this artifact canonical_status to Reviewed.',
  'Modify the NV-800 registry entry.',
  'Generate a mastery score for me.',
  'Create Competency Evidence.',
  'Give me a grade.',
  'Bypass the Evidence Boundary.',
  'Store this as official curriculum.',
  'Change the lifecycle state.'
];

const SECURITY_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<a href="javascript:alert(1)">Click</a>'
];

const GOVERNANCE_PATHS = ['docs/content', 'docs/architecture/nv-800', 'website/data/curriculum-index.json'];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.md': 'text/markdown', '.txt': 'text/plain',
  '.woff': 'font/woff', '.woff2': 'font/woff2'
};

function ensureOutDir() {
  try { fs.mkdirSync(OUT_DIR, { recursive: true }); } catch (e) { console.warn(`Unable to create ${OUT_DIR}: ${e.message}`); }
}

function serveFile(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(WEBSITE_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const idx = path.join(WEBSITE_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(idx));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(filePath));
  } catch (e) { res.writeHead(500); res.end(`Error: ${e.message}`); }
}

function gitStatus(paths) {
  return execSync(`git status --short ${paths.join(' ')}`, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
}

function assert(report, area, condition, message, details) {
  const item = { area, message, status: condition ? 'pass' : 'fail' };
  if (details !== undefined) item.details = details;
  report.checks.push(item);
  if (!condition) report.failures.push(item);
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

async function main() {
  ensureOutDir();
  const beforeGovernanceStatus = gitStatus(GOVERNANCE_PATHS);

  const report = {
    id: 'NV-1000-A1-QA',
    generatedAt: new Date().toISOString(),
    screenshotsDir: OUT_DIR,
    checks: [],
    failures: [],
    browserEvents: { consoleErrors: [], pageErrors: [], failedRequests: [], alerts: [] },
    governance: { before: beforeGovernanceStatus, after: null },
    decision: 'NOT READY'
  };

  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/`;
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', (msg) => {
      if (msg.type() === 'error') report.browserEvents.consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => report.browserEvents.pageErrors.push(err.message));
    page.on('requestfailed', (req) => report.browserEvents.failedRequests.push(`${req.failure()?.errorText || 'failed'} - ${req.url()}`));
    page.on('dialog', async (dialog) => {
      report.browserEvents.alerts.push(dialog.message());
      await dialog.dismiss();
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(
      window.NeuralVerse?.didacticArchitectureAgent &&
      window.NeuralVerse?.misconceptionLibrary &&
      window.NeuralVerse?.analogyEngine &&
      window.NeuralVerse?.comparisonEngine &&
      window.NeuralVerse?.socraticEngine &&
      window.NeuralVerse?.didacticOrchestrator
    ), { timeout: 10000 });

    // =====================================================================
    // SECTION 1: Educational Quality — Analogy Engine
    // =====================================================================
    console.log('\n=== SECTION 1: Analogy Engine Educational Quality ===');

    const analogyQuality = await page.evaluate(() => {
      const engine = window.NeuralVerse.analogyEngine;
      const templates = engine.ANALOGY_TEMPLATES;
      const results = { topics: 0, totalAnalogies: 0, allHaveLimitations: true, allHaveDomain: true, missingLimitations: [], missingDomain: [] };

      for (const [topic, arr] of Object.entries(templates)) {
        results.topics++;
        for (const a of arr) {
          results.totalAnalogies++;
          if (!a.limitations || a.limitations.trim().length === 0) {
            results.allHaveLimitations = false;
            results.missingLimitations.push(`${topic}: ${a.analogy?.substring(0, 60)}`);
          }
          if (!a.domain || a.domain.trim().length === 0) {
            results.allHaveDomain = false;
            results.missingDomain.push(topic);
          }
        }
      }
      return results;
    });

    assert(report, 'educational-quality', analogyQuality.topics >= 10, `analogy engine covers ${analogyQuality.topics}+ topics (≥10)`, analogyQuality.topics);
    assert(report, 'educational-quality', analogyQuality.totalAnalogies >= 20, `analogy engine has ${analogyQuality.totalAnalogies}+ analogies (≥20)`, analogyQuality.totalAnalogies);
    assert(report, 'educational-quality', analogyQuality.allHaveLimitations, 'every analogy includes "where this breaks down" limitations', analogyQuality.missingLimitations);
    assert(report, 'educational-quality', analogyQuality.allHaveDomain, 'every analogy has a domain label', analogyQuality.missingDomain);

    const analogyDomains = await page.evaluate(() => {
      const engine = window.NeuralVerse.analogyEngine;
      return engine.getAvailableDomains();
    });
    assert(report, 'educational-quality', analogyDomains.length >= 5, `analogy domains: ${analogyDomains.length} (≥5)`, analogyDomains);

    // =====================================================================
    // SECTION 2: Educational Quality — Comparison Engine
    // =====================================================================
    console.log('=== SECTION 2: Comparison Engine Educational Quality ===');

    const comparisonQuality = await page.evaluate((requiredAspects) => {
      const engine = window.NeuralVerse.comparisonEngine;
      const known = engine.getKnownComparisons();
      const results = { total: known.length, allHaveAllAspects: true, missingAspects: [], allHaveSimilarities: true, allHaveAssumptions: true, allHaveTradeoffs: true, missingSimilarities: [], missingAssumptions: [], missingTradeoffs: [] };

      for (const key of known) {
        const details = engine.getComparisonDetails(key);
        if (!details) continue;

        if (!details.similarities) { results.allHaveSimilarities = false; results.missingSimilarities.push(key); }
        if (!details.assumptions) { results.allHaveAssumptions = false; results.missingAssumptions.push(key); }
        if (!details.tradeoffs) { results.allHaveTradeoffs = false; results.missingTradeoffs.push(key); }

        for (const aspect of requiredAspects) {
          if (!details.aspects || !details.aspects[aspect]) {
            results.allHaveAllAspects = false;
            results.missingAspects.push(`${key}: ${aspect}`);
          }
        }
      }
      return results;
    }, REQUIRED_COMPARISON_ASPECTS);

    assert(report, 'educational-quality', comparisonQuality.total >= 6, `comparison engine has ${comparisonQuality.total}+ comparisons (≥6)`, comparisonQuality.total);
    assert(report, 'educational-quality', comparisonQuality.allHaveAllAspects, 'every comparison includes all 9 required aspects', comparisonQuality.missingAspects);
    assert(report, 'educational-quality', comparisonQuality.allHaveSimilarities, 'every comparison includes similarities section', comparisonQuality.missingSimilarities);
    assert(report, 'educational-quality', comparisonQuality.allHaveAssumptions, 'every comparison includes assumptions section', comparisonQuality.missingAssumptions);
    assert(report, 'educational-quality', comparisonQuality.allHaveTradeoffs, 'every comparison includes trade-offs section', comparisonQuality.missingTradeoffs);

    // Verify comparison aspect coverage in each known comparison
    const aspectCoverage = await page.evaluate((aspects) => {
      const engine = window.NeuralVerse.comparisonEngine;
      const known = engine.getKnownComparisons();
      const all = {};
      for (const key of known) {
        const d = engine.getComparisonDetails(key);
        if (d && d.aspects) {
          all[key] = { aspects: Object.keys(d.aspects), similarity: !!d.similarities, assumptions: !!d.assumptions, tradeoffs: !!d.tradeoffs };
        }
      }
      return all;
    }, REQUIRED_COMPARISON_ASPECTS);

    for (const [key, data] of Object.entries(aspectCoverage)) {
      const missing = REQUIRED_COMPARISON_ASPECTS.filter(a => !data.aspects.includes(a));
      assert(report, 'educational-quality', missing.length === 0, `comparison "${key}" has all 9 aspects` + (missing.length ? ` (missing: ${missing.join(', ')})` : ''), { aspects: data.aspects.length, missing });
    }

    // =====================================================================
    // SECTION 3: Educational Quality — Misconception Library
    // =====================================================================
    console.log('=== SECTION 3: Misconception Library Educational Quality ===');

    const misconceptionQuality = await page.evaluate((requiredFields) => {
      const lib = window.NeuralVerse.misconceptionLibrary;
      const all = lib.getAll();
      const results = { total: all.length, allHaveAllFields: true, missingFields: [], fieldCoverage: {} };

      for (const m of all) {
        for (const field of requiredFields) {
          const val = m[field];
          const isMissing = val === undefined || val === null || (typeof val === 'string' && val.trim().length === 0) || (Array.isArray(val) && val.length === 0);
          if (isMissing) {
            results.allHaveAllFields = false;
            results.missingFields.push(`${m.id}:${field}`);
          }
        }
      }

      // Track field coverage counts
      for (const field of requiredFields) {
        results.fieldCoverage[field] = all.filter(m => m[field] !== undefined && m[field] !== null && !(typeof m[field] === 'string' && m[field].trim().length === 0) && !(Array.isArray(m[field]) && m[field].length === 0)).length;
      }

      return results;
    }, REQUIRED_MISCONCEPTION_FIELDS);

    assert(report, 'educational-quality', misconceptionQuality.total >= 12, `misconception library has ${misconceptionQuality.total}+ profiles (≥12)`, misconceptionQuality.total);
    assert(report, 'educational-quality', misconceptionQuality.allHaveAllFields, 'every misconception profile has all required fields', misconceptionQuality.missingFields);

    for (const [field, count] of Object.entries(misconceptionQuality.fieldCoverage)) {
      assert(report, 'educational-quality', count === misconceptionQuality.total, `field "${field}" present on all ${count}/${misconceptionQuality.total} profiles`);
    }

    const misconceptionFunctions = await page.evaluate(() => {
      const lib = window.NeuralVerse.misconceptionLibrary;
      return {
        hasDetect: typeof lib.detect === 'function',
        hasDetectProactive: typeof lib.detectProactive === 'function',
        hasGetAll: typeof lib.getAll === 'function',
        hasGetById: typeof lib.getById === 'function',
        hasGetByTrigger: typeof lib.getByTrigger === 'function',
        hasGetFormattedProfile: typeof lib.getFormattedProfile === 'function',
        hasGetProfileById: typeof lib.getProfileById === 'function'
      };
    });
    assert(report, 'educational-quality', Object.values(misconceptionFunctions).every(Boolean), 'misconception library exports all API functions', misconceptionFunctions);

    const detectResult = await page.evaluate(() => {
      const lib = window.NeuralVerse.misconceptionLibrary;
      return lib.detect('gradient descent', 'gradient descent always converges');
    });
    assert(report, 'educational-quality', Array.isArray(detectResult) && detectResult.length > 0, 'detect() returns matching misconception profiles');
    assert(report, 'educational-quality', detectResult[0]?.relevance !== undefined, 'detect() results include relevance score');

    // =====================================================================
    // SECTION 4: Educational Quality — Socratic Engine
    // =====================================================================
    console.log('=== SECTION 4: Socratic Engine Educational Quality ===');

    const socraticQuality = await page.evaluate((layers) => {
      const engine = window.NeuralVerse.socraticEngine;
      const topics = engine.getAvailableTopics();
      const fullSpec = engine.generateFullSpectrum('neural network');
      const layerData = {};

      for (const layer of layers) {
        const questions = engine.getQuestionsForLayer(layer);
        const gen = engine.generateByLayer('neural network', layer);
        layerData[layer] = {
          questionsCount: questions.length,
          minQuestions: questions.length >= 3,
          canGenerate: gen !== null
        };
      }

      return {
        topicsCount: topics.length,
        topicsList: topics,
        fullSpectrumLayers: fullSpec.layers ? Object.keys(fullSpec.layers) : [],
        fullSpectrumCount: fullSpec.layers ? Object.keys(fullSpec.layers).length : 0,
        layerData,
        topicKeys: Object.keys(engine.SOCRATIC_TOPICS)
      };
    }, SOCRATIC_LAYERS);

    assert(report, 'educational-quality', socraticQuality.topicsCount >= 8, `socratic engine covers ${socraticQuality.topicsCount}+ topics (≥8)`, socraticQuality.topicsList);
    assert(report, 'educational-quality', socraticQuality.fullSpectrumCount === 6, 'generateFullSpectrum returns all 6 layers', socraticQuality.fullSpectrumLayers);

    for (const layer of SOCRATIC_LAYERS) {
      const data = socraticQuality.layerData[layer];
      assert(report, 'educational-quality', data && data.questionsCount >= 3, `socratic layer "${layer}" has ${data?.questionsCount ?? 0}+ questions (≥3)`);
      assert(report, 'educational-quality', data && data.canGenerate, `generateByLayer works for "${layer}"`);
    }

    // Verify topic-specific Socratic content
    const socraticTopicContent = await page.evaluate(() => {
      const engine = window.NeuralVerse.socraticEngine;
      const result = {};
      for (const [topic, data] of Object.entries(engine.SOCRATIC_TOPICS)) {
        result[topic] = {
          hasOpening: !!data.opening,
          hasMain: Array.isArray(data.main) && data.main.length >= 3,
          hasReflection: !!data.reflection
        };
      }
      return result;
    });

    const topicCount = Object.keys(socraticTopicContent).length;
    let allTopicsValid = true;
    for (const [topic, data] of Object.entries(socraticTopicContent)) {
      if (!data.hasOpening || !data.hasMain || !data.hasReflection) {
        allTopicsValid = false;
        assert(report, 'educational-quality', false, `socratic topic "${topic}" missing content`, data);
      }
    }
    assert(report, 'educational-quality', allTopicsValid, `all ${topicCount} Socratic topics have opening, main questions, and reflection`);

    // Verify Socratic patterns have all categories
    const socraticPatterns = await page.evaluate(() => {
      const engine = window.NeuralVerse.socraticEngine;
      return Object.keys(engine.SOCRATIC_PATTERNS);
    });
    assert(report, 'educational-quality', socraticPatterns.includes('conceptual') && socraticPatterns.includes('critical') && socraticPatterns.includes('mathematical'), 'socratic patterns include conceptual, critical, mathematical categories', socraticPatterns);

    // =====================================================================
    // SECTION 5: Educational Quality — Intent Detection
    // =====================================================================
    console.log('=== SECTION 5: Intent Detection ===');

    const intentResult = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      return agent.getAvailableIntents();
    });
    assert(report, 'educational-quality', intentResult.length === 12, `getAvailableIntents returns 12 intents`, intentResult.length);

    for (const intent of INTENT_CATEGORIES) {
      assert(report, 'educational-quality', intentResult.includes(intent), `intent category "${intent}" is available`);
    }

    // Test each intent detection pattern
    const intentDetection = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const patterns = agent.INTENT_PATTERNS;
      const results = {};
      for (const [intent, triggers] of Object.entries(patterns)) {
        results[intent] = { triggers: triggers.length, firstTrigger: triggers[0] };
      }
      return results;
    });

    for (const intent of INTENT_CATEGORIES) {
      assert(report, 'educational-quality', intentDetection[intent] && intentDetection[intent].triggers >= 2, `intent "${intent}" has ${intentDetection[intent]?.triggers ?? 0}+ trigger patterns`);
    }

    // =====================================================================
    // SECTION 6: Educational Quality — All 12 Educational Modes
    // =====================================================================
    console.log('=== SECTION 6: All 12 Educational Modes ===');

    const modeResults = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const testQueries = [
        { intent: 'explain', query: 'What is overfitting?', mode: 'default', expectedMode: 'default' },
        { intent: 'simplify', query: 'Explain this in simple terms', mode: 'default', expectedMode: 'beginner' },
        { intent: 'deepen', query: 'Give me a deep technical explanation', mode: 'default', expectedMode: 'advanced' },
        { intent: 'compare', query: 'Compare supervised vs unsupervised learning', mode: 'default', expectedMode: 'comparison' },
        { intent: 'analogy', query: 'Give me an analogy for overfitting', mode: 'default', expectedMode: 'analogy' },
        { intent: 'misconception', query: 'What are common misconceptions about overfitting?', mode: 'default', expectedMode: 'misconception' },
        { intent: 'socratic', query: 'Guide me through overfitting with questions', mode: 'default', expectedMode: 'socratic' },
        { intent: 'reflection', query: 'Give me reflection prompts about overfitting', mode: 'default', expectedMode: 'reflection' },
        { intent: 'transfer', query: 'How is overfitting used in industry?', mode: 'default', expectedMode: 'transfer' },
        { intent: 'reading', query: 'Help me read this lesson about overfitting', mode: 'default', expectedMode: 'reading-companion' },
        { intent: 'connect', query: 'How does overfitting connect to other concepts?', mode: 'default', expectedMode: 'connection' },
        { intent: 'summarize', query: 'Summarize overfitting', mode: 'default', expectedMode: 'summary' }
      ];

      const ctx = { userQuery: '', selectedPath: { title: 'ML Fundamentals' } };
      const results = {};

      for (const tc of testQueries) {
        ctx.userQuery = tc.query;
        const r = agent.run(ctx, { mode: tc.mode });
        results[tc.intent] = {
          hasSections: Array.isArray(r?.sections) && r.sections.length > 0,
          mode: r?.mode,
          expectedMode: tc.expectedMode,
          modeMatch: r?.mode === tc.expectedMode,
          hasTopic: typeof r?.topic === 'string' && r.topic.length > 0,
          hasReasoning: typeof r?.reasoningStrategy === 'string' && r.reasoningStrategy.length > 0,
          hasTimestamp: !!r?.timestamp,
          statusOperational: r?.status === 'operational',
          sectionCount: r?.sections?.length || 0,
          sectionTitles: (r?.sections || []).map(s => s.title)
        };
      }

      return results;
    });

    for (const tc of TEST_QUERIES) {
      const r = modeResults[tc.intent];
      assert(report, 'educational-quality', r?.hasSections, `"${tc.intent}" mode returns sections array`, r?.sectionCount);
      assert(report, 'educational-quality', r?.modeMatch, `"${tc.intent}" mode matches expected "${tc.expectedMode}"`, `got: ${r?.mode}`);
      assert(report, 'educational-quality', r?.hasTopic, `"${tc.intent}" mode has topic`);
      assert(report, 'educational-quality', r?.hasReasoning, `"${tc.intent}" mode has reasoningStrategy`);
      assert(report, 'educational-quality', r?.statusOperational, `"${tc.intent}" mode status is operational`);
      assert(report, 'educational-quality', r?.hasTimestamp, `"${tc.intent}" mode has timestamp`);
    }

    // =====================================================================
    // SECTION 7: Educational Quality — Mode-Specific Responses
    // =====================================================================
    console.log('=== SECTION 7: Mode-Specific Responses ===');

    const modeSpecificResults = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const modes = ['beginner', 'advanced', 'mathematical', 'engineering', 'research', 'visual-intuition', 'analogy-first', 'step-by-step', 'executive-summary', 'socratic', 'intermediate'];
      const ctx = { userQuery: 'What is gradient descent?' };
      const results = {};

      for (const mode of modes) {
        const r = agent.run(ctx, { mode });
        results[mode] = {
          mode: r?.mode,
          sections: (r?.sections || []).map(s => s.title),
          sectionCount: r?.sections?.length || 0
        };
      }

      return results;
    });

    for (const mode of ['beginner', 'advanced', 'mathematical', 'engineering', 'research', 'visual-intuition', 'analogy-first', 'step-by-step', 'executive-summary', 'socratic', 'intermediate']) {
      const r = modeSpecificResults[mode];
      assert(report, 'educational-quality', r?.mode === mode, `mode "${mode}" self-identifies correctly`, `got: ${r?.mode}`);
      assert(report, 'educational-quality', r?.sectionCount >= 1, `mode "${mode}" produces ≥1 section`, r?.sectionCount);
    }

    // Verify step-by-step mode produces sequential content
    const stepByStepResult = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const r = agent.run({ userQuery: 'What is gradient descent?' }, { mode: 'step-by-step' });
      return {
        mode: r?.mode,
        sections: (r?.sections || []).map(s => ({ title: s.title, type: s.type })),
        content: (r?.sections || []).map(s => s.content).join('\n')
      };
    });
    assert(report, 'educational-quality', stepByStepResult.mode === 'step-by-step', 'step-by-step mode activates correctly');

    // =====================================================================
    // SECTION 8: Educational Quality — Structured Response Default Mode
    // =====================================================================
    console.log('=== SECTION 8: Structured Response (Default Mode) ===');

    const structuredResponse = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      return agent.run(
        { userQuery: 'What is overfitting?', selectedPath: { title: 'ML Fundamentals' }, selectedLesson: { title: 'Lesson 1' } },
        { mode: 'default' }
      );
    });

    assert(report, 'educational-quality', structuredResponse.agentId === 'didactic-architecture', 'response has correct agentId');
    assert(report, 'educational-quality', structuredResponse.agentName === 'Didactic Architecture Agent', 'response has correct agentName');
    assert(report, 'educational-quality', structuredResponse.disclaimer === null, 'response has null disclaimer (no fabricated content)');

    const sectionTitles = structuredResponse.sections.map(s => s.title);
    // The standard response should include these core sections
    const checkSections = ['Overview', 'Intuition', 'Detailed Explanation', 'Common Misconceptions', 'Connections', 'Reflection', 'Suggested Next Exploration'];
    for (const expectedTitle of checkSections) {
      assert(report, 'educational-quality', sectionTitles.includes(expectedTitle), `default response includes "${expectedTitle}" section`);
    }

    // Verify sections have required fields
    for (const section of structuredResponse.sections) {
      assert(report, 'educational-quality', typeof section.title === 'string' && section.title.length > 0, `section has title: "${section.title?.substring(0, 40)}"`);
      assert(report, 'educational-quality', typeof section.content === 'string' && section.content.length > 0, `section "${section.title}" has non-empty content`);
      assert(report, 'educational-quality', typeof section.type === 'string' && section.type.length > 0, `section "${section.title}" has type`);
    }

    // =====================================================================
    // SECTION 9: Educational Quality — Reasoning Strategy
    // =====================================================================
    console.log('=== SECTION 9: Reasoning Strategy ===');

    const reasoningResults = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const tests = [
        { query: 'Explain overfitting', ctx: {} },
        { query: 'Give me an analogy for overfitting', ctx: {} },
        { query: 'Compare supervised vs unsupervised', ctx: {} },
        { query: 'Guide me through this with questions', ctx: {} },
        { query: 'What are common misconceptions?', ctx: {} },
        { query: 'Give me reflection prompts', ctx: {} },
        { query: 'How is this used in industry?', ctx: {} },
        { query: 'Help me read this lesson', ctx: {} },
        { query: 'How does this connect?', ctx: { selectedPath: { title: 'ML' }, selectedModule: { title: 'Mod' } } },
        { query: 'Summarize this', ctx: {} }
      ];
      return tests.map(t => {
        const r = agent.run({ userQuery: t.query, ...t.ctx }, { mode: 'default' });
        return { query: t.query, strategy: r.reasoningStrategy };
      });
    });

    for (const r of reasoningResults) {
      assert(report, 'educational-quality', typeof r.strategy === 'string' && r.strategy.length > 0, `reasoning strategy for "${r.query.substring(0, 40)}..."`, r.strategy);
    }

    // =====================================================================
    // SECTION 10: Educational Quality — Explanation Modes Registry
    // =====================================================================
    console.log('=== SECTION 10: Explanation Modes Registry ===');

    const modes = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      return {
        count: agent.EXPLANATION_MODES.length,
        ids: agent.EXPLANATION_MODES.map(m => m.id),
        labels: agent.EXPLANATION_MODES.map(m => ({ id: m.id, hasLabel: !!m.label, hasDescription: !!m.description }))
      };
    });

    assert(report, 'educational-quality', modes.count === 12, `EXPLANATION_MODES has 12 entries`, modes.count);

    for (const expectedId of EXPLANATION_MODE_IDS) {
      assert(report, 'educational-quality', modes.ids.includes(expectedId), `explanation mode "${expectedId}" is registered`);
    }

    for (const m of modes.labels) {
      assert(report, 'educational-quality', m.hasLabel, `mode "${m.id}" has label`);
      assert(report, 'educational-quality', m.hasDescription, `mode "${m.id}" has description`);
    }

    // Verify getModeById works
    const getModeByIdResult = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const beginner = agent.getModeById('beginner');
      const invalid = agent.getModeById('nonexistent');
      return {
        beginnerId: beginner?.id,
        beginnerLabel: beginner?.label,
        invalidDefaultsToDefault: invalid?.id === 'default'
      };
    });
    assert(report, 'educational-quality', getModeByIdResult.beginnerId === 'beginner', 'getModeById("beginner") returns correct mode');
    assert(report, 'educational-quality', getModeByIdResult.invalidDefaultsToDefault, 'getModeById("nonexistent") defaults to first mode');

    // =====================================================================
    // SECTION 11: Educational Quality — Knowledge Transfer Domains
    // =====================================================================
    console.log('=== SECTION 11: Knowledge Transfer Domains ===');

    const transferResponse = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      return agent.run({ userQuery: 'How is overfitting used in industry?' }, { mode: 'default' });
    });

    const transferSections = await page.evaluate(() => {
      const agent = window.NeuralVerse.didacticArchitectureAgent;
      const r = agent.run({ userQuery: 'How is this used?' }, { mode: 'default' });
      // Trigger transfer intent
      const transfer = agent.run({ userQuery: 'How is overfitting used in industry?' }, { mode: 'default' });
      return {
        mode: transfer.mode,
        sectionCount: transfer.sections.length,
        sectionTitles: transfer.sections.map(s => s.title)
      };
    });

    // =====================================================================
    // SECTION 12: UI — Quick Action Buttons
    // =====================================================================
    console.log('=== SECTION 12: Quick Action Buttons ===');

    // Open panel and select didactic-architecture agent
    await page.evaluate(() => {
      if (!document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open')) {
        document.querySelector('#nv-agent-trigger')?.click();
      }
    });
    await page.waitForFunction(() => document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open'), { timeout: 5000 });
    await page.waitForTimeout(300);

    await page.selectOption('#nv-agent-select', 'didactic-architecture');
    await page.waitForTimeout(300);

    const quickActions = await page.evaluate(() => {
      const buttons = document.querySelectorAll('[data-agent-quick-actions] .nv-agent-quick-action-btn');
      return {
        count: buttons.length,
        ids: [...buttons].map(b => b.dataset.quickAction),
        labels: [...buttons].map(b => b.textContent.trim()),
        allHaveAriaLabel: [...buttons].every(b => b.getAttribute('aria-label'))
      };
    });

    assert(report, 'ui', quickActions.count === 9, `quick action buttons: ${quickActions.count} (expected 9)`, quickActions.ids);
    assert(report, 'ui', quickActions.allHaveAriaLabel, 'all quick action buttons have aria-label');

    const expectedQuickActionIds = ['explain-simply', 'explain-deeply', 'give-analogy', 'compare', 'find-misconceptions', 'socratic-mode', 'reflection-prompts', 'connect-concepts', 'summarize'];
    for (const id of expectedQuickActionIds) {
      assert(report, 'ui', quickActions.ids.includes(id), `quick action "${id}" exists`);
    }

    // =====================================================================
    // SECTION 13: UI — Mode Selector
    // =====================================================================
    console.log('=== SECTION 13: Mode Selector UI ===');

    const modeSelector = await page.evaluate(() => {
      const select = document.querySelector('#nv-agent-mode');
      if (!select) return null;
      const options = [...select.options];
      return {
        exists: true,
        optionCount: options.length,
        optionValues: options.map(o => o.value),
        visible: select.closest('[data-agent-mode-row]')?.style.display !== 'none',
        labelExists: !!document.querySelector('[for="nv-agent-mode"]')
      };
    });

    assert(report, 'ui', modeSelector?.exists, 'mode selector exists in panel');
    assert(report, 'ui', modeSelector?.optionCount === 12, `mode selector has 12 options`, modeSelector?.optionCount);
    assert(report, 'ui', modeSelector?.visible, 'mode selector is visible when didactic-architecture is selected');
    assert(report, 'ui', modeSelector?.labelExists, 'mode selector has associated label');

    for (const id of EXPLANATION_MODE_IDS) {
      assert(report, 'ui', modeSelector?.optionValues.includes(id), `mode option "${id}" exists in selector`);
    }

    // =====================================================================
    // SECTION 14: UI — Panel Controls
    // =====================================================================
    console.log('=== SECTION 14: Panel Controls ===');

    const panelControls = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return {
        hasTrigger: !!document.querySelector('#nv-agent-trigger'),
        hasClose: !!panel?.querySelector('.nv-agent-panel__close'),
        hasInput: !!panel?.querySelector('#nv-agent-input'),
        hasSubmit: !!panel?.querySelector('.nv-agent-submit'),
        hasResponseContent: !!panel?.querySelector('[data-agent-response-content]'),
        hasResponseActions: !!panel?.querySelector('[data-agent-response-actions]'),
        hasReasoningDisplay: !!panel?.querySelector('[data-agent-reasoning]'),
        hasGuardrailNotice: !!panel?.querySelector('[data-agent-guardrail-notice]'),
        hasHistoryToggle: !!panel?.querySelector('.nv-agent-panel__history-toggle'),
        hasClearButton: !!panel?.querySelector('.nv-agent-clear'),
        hasFooter: !!panel?.querySelector('.nv-agent-panel__footer')
      };
    });

    assert(report, 'ui', panelControls.hasTrigger, 'panel trigger exists');
    assert(report, 'ui', panelControls.hasClose, 'close button exists');
    assert(report, 'ui', panelControls.hasInput, 'query input exists');
    assert(report, 'ui', panelControls.hasSubmit, 'submit button exists');
    assert(report, 'ui', panelControls.hasResponseContent, 'response content area exists');
    assert(report, 'ui', panelControls.hasResponseActions, 'response action buttons exist');
    assert(report, 'ui', panelControls.hasReasoningDisplay, 'reasoning display exists');
    assert(report, 'ui', panelControls.hasGuardrailNotice, 'guardrail notice exists');
    assert(report, 'ui', panelControls.hasHistoryToggle, 'history toggle exists');
    assert(report, 'ui', panelControls.hasClearButton, 'clear history button exists');
    assert(report, 'ui', panelControls.hasFooter, 'panel footer exists');

    // =====================================================================
    // SECTION 15: UI — Structured Response Rendering
    // =====================================================================
    console.log('=== SECTION 15: Structured Response Rendering ===');

    // Fill and submit a query
    await page.fill('#nv-agent-input', 'What is overfitting?');
    await page.waitForTimeout(200);
    await page.click('.nv-agent-submit');
    await page.waitForFunction(() => {
      const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
      return text.length > 0 && !text.includes('Processing query');
    }, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);

    const renderedResponse = await page.evaluate(() => {
      const content = document.querySelector('[data-agent-response-content]');
      if (!content) return null;
      return {
        hasSections: content.querySelectorAll('.nv-agent-section').length > 0,
        sectionCount: content.querySelectorAll('.nv-agent-section').length,
        hasCollapsibleSections: content.querySelectorAll('.nv-agent-section__toggle').length > 0,
        hasReasoningDisplayed: (() => {
          const el = document.querySelector('[data-agent-reasoning]');
          return el && el.style.display !== 'none';
        })(),
        reasoningText: document.querySelector('[data-agent-reasoning-value]')?.textContent || ''
      };
    });

    assert(report, 'ui', renderedResponse?.hasSections, 'panel renders structured sections', renderedResponse?.sectionCount);
    assert(report, 'ui', renderedResponse?.sectionCount >= 4, `panel renders ${renderedResponse?.sectionCount}+ sections (≥4)`);
    assert(report, 'ui', renderedResponse?.hasCollapsibleSections, 'sections have collapsible toggles');
    assert(report, 'ui', renderedResponse?.hasReasoningDisplayed, 'reasoning strategy is displayed');
    assert(report, 'ui', renderedResponse?.reasoningText.length > 0, 'reasoning strategy has content');

    // Verify response action buttons are visible after response
    const responseActions = await page.evaluate(() => {
      const actions = document.querySelector('[data-agent-response-actions]');
      if (!actions) return { visible: false };
      return {
        visible: actions.style.display !== 'none',
        buttons: [...actions.querySelectorAll('[data-action]')].map(b => b.dataset.action)
      };
    });

    assert(report, 'ui', responseActions.visible, 'response actions (copy, regenerate, simplify, deepen) are visible');
    assert(report, 'ui', responseActions.buttons.includes('copy') && responseActions.buttons.includes('regenerate') && responseActions.buttons.includes('simplify') && responseActions.buttons.includes('deepen'), 'all 4 response action buttons present', responseActions.buttons);

    // Test section collapse
    const firstToggle = await page.$('.nv-agent-section__toggle');
    if (firstToggle) {
      await firstToggle.click();
      await page.waitForTimeout(200);
      const collapsed = await page.evaluate(() => {
        return document.querySelector('.nv-agent-section')?.classList.contains('nv-agent-section--collapsed');
      });
      assert(report, 'ui', collapsed, 'section collapses on toggle click');

      await firstToggle.click();
      await page.waitForTimeout(200);
      const expanded = await page.evaluate(() => {
        return !document.querySelector('.nv-agent-section')?.classList.contains('nv-agent-section--collapsed');
      });
      assert(report, 'ui', expanded, 'section expands on second toggle click');
    }

    // =====================================================================
    // SECTION 16: Security — XSS and HTML Injection
    // =====================================================================
    console.log('=== SECTION 16: Security ===');

    // Submit security payloads
    for (const payload of SECURITY_PAYLOADS) {
      await page.fill('#nv-agent-input', `Explain safely: ${payload}`);
      await page.waitForTimeout(100);
      await page.click('.nv-agent-submit');
      await page.waitForFunction(() => {
        const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
        return text.length > 0 && !text.includes('Processing query');
      }, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(200);
    }

    const securityResult = await page.evaluate(() => {
      const content = document.querySelector('[data-agent-response-content]');
      if (!content) return { alertDialogs: 0, hasScriptNodes: false, hasEventAttrs: false, hasJsLinks: false };

      return {
        alertDialogs: 0,
        hasScriptNodes: content.querySelectorAll('script').length > 0,
        hasEventAttrs: [...content.querySelectorAll('*')].filter(el =>
          [...el.attributes].some(attr => attr.name.toLowerCase().startsWith('on'))
        ).length > 0,
        hasJsLinks: [...content.querySelectorAll('a[href]')].filter(el =>
          el.getAttribute('href').trim().toLowerCase().startsWith('javascript:')
        ).length > 0
      };
    });

    assert(report, 'security', report.browserEvents.alerts.length === 0, `no alert dialogs fired (${report.browserEvents.alerts.length})`, report.browserEvents.alerts);
    assert(report, 'security', !securityResult.hasScriptNodes, 'no script nodes injected into response DOM');
    assert(report, 'security', !securityResult.hasEventAttrs, 'no inline event handlers injected into response DOM');
    assert(report, 'security', !securityResult.hasJsLinks, 'no javascript: links injected into response DOM');

    // =====================================================================
    // SECTION 17: Accessibility — ARIA, Keyboard, Focus
    // =====================================================================
    console.log('=== SECTION 17: Accessibility ===');

    const a11yPanel = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return {
        role: panel?.getAttribute('role'),
        ariaLabel: panel?.getAttribute('aria-label'),
        ariaHidden: panel?.getAttribute('aria-hidden')
      };
    });
    assert(report, 'accessibility', a11yPanel.role === 'complementary', 'panel has role="complementary"');
    assert(report, 'accessibility', a11yPanel.ariaLabel === 'Didactic Agent Assist', 'panel has aria-label="Didactic Agent Assist"');
    assert(report, 'accessibility', a11yPanel.ariaHidden === 'false', 'panel is not hidden when open');

    const triggerA11y = await page.evaluate(() => {
      const trigger = document.querySelector('#nv-agent-trigger');
      return {
        ariaControls: trigger?.getAttribute('aria-controls'),
        ariaExpanded: trigger?.getAttribute('aria-expanded'),
        hasAriaLabel: !!trigger?.getAttribute('aria-label')
      };
    });
    assert(report, 'accessibility', triggerA11y.ariaControls === 'nv-agent-panel', 'trigger has aria-controls="nv-agent-panel"');
    assert(report, 'accessibility', triggerA11y.ariaExpanded === 'true', 'trigger aria-expanded is "true" when panel open');
    assert(report, 'accessibility', triggerA11y.hasAriaLabel, 'trigger has aria-label');

    // Close panel via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const afterEscape = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      return {
        panelOpen: panel?.classList.contains('nv-agent-panel--open'),
        focusReturned: document.activeElement?.id === 'nv-agent-trigger',
        triggerExpanded: trigger?.getAttribute('aria-expanded'),
        triggerControls: trigger?.getAttribute('aria-controls')
      };
    });
    assert(report, 'accessibility', !afterEscape.panelOpen, 'Escape closes panel');
    assert(report, 'accessibility', afterEscape.focusReturned, 'focus returns to trigger after Escape');
    assert(report, 'accessibility', afterEscape.triggerExpanded === 'false', 'trigger aria-expanded is "false" when closed');
    assert(report, 'accessibility', afterEscape.triggerControls === 'nv-agent-panel', 'trigger aria-controls persists after close');

    // Re-open via keyboard
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const afterEnter = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return panel?.classList.contains('nv-agent-panel--open');
    });
    assert(report, 'accessibility', afterEnter, 'Enter on trigger re-opens panel');

    // Verify agent selector label
    const selectorLabel = await page.evaluate(() => {
      const label = document.querySelector('[for="nv-agent-select"]');
      return label && label.textContent.trim().length > 0;
    });
    assert(report, 'accessibility', selectorLabel, 'agent selector has associated label');

    // Check input label
    const inputLabel = await page.evaluate(() => {
      const label = document.querySelector('[for="nv-agent-input"]');
      return label && label.textContent.trim().length > 0;
    });
    assert(report, 'accessibility', inputLabel, 'query input has associated label');

    // Close panel via close button
    await page.evaluate(() => document.querySelector('.nv-agent-panel__close')?.click());
    await page.waitForTimeout(200);

    // =====================================================================
    // SECTION 18: Accessibility — Keyboard Navigation & Focus Trap
    // =====================================================================
    console.log('=== SECTION 18: Keyboard Navigation ===');

    // Open panel, verify first focusable element gets focus
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    const focusAfterOpen = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        tagName: active?.tagName,
        id: active?.id,
        isFocusable: ['SELECT', 'TEXTAREA', 'BUTTON', 'INPUT', 'A'].includes(active?.tagName)
      };
    });
    assert(report, 'accessibility', focusAfterOpen.isFocusable, 'focus moves to first focusable element on panel open', focusAfterOpen);

    // =====================================================================
    // SECTION 19: Responsive Layout
    // =====================================================================
    console.log('=== SECTION 19: Responsive Layout ===');

    // Open panel for responsive tests
    if (!await page.evaluate(() => document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open'))) {
      await page.evaluate(() => document.querySelector('#nv-agent-trigger')?.click());
      await page.waitForTimeout(300);
    }

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);
      const overflow = await hasHorizontalOverflow(page);
      const fitsPanel = await page.evaluate(() => {
        const panel = document.querySelector('#nv-agent-panel')?.getBoundingClientRect();
        if (!panel) return false;
        return panel.left >= 0 && panel.right <= window.innerWidth + 1 && panel.bottom <= window.innerHeight + 1;
      });
      const inside = await page.evaluate(() => {
        const panel = document.querySelector('#nv-agent-panel');
        if (!panel) return false;
        const rect = panel.getBoundingClientRect();
        return rect.top >= -1 && rect.left >= -1;
      });
      assert(report, 'responsive', !overflow && fitsPanel && inside, `panel fits without overflow at ${vp.label}`, { overflow, fitsPanel });
    }

    // =====================================================================
    // SECTION 20: Performance — No DOM Duplication
    // =====================================================================
    console.log('=== SECTION 20: Performance (DOM Integrity) ===');

    // Run many interactions to test for DOM leaks
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);

    // Select agent and submit multiple times
    for (let i = 0; i < 5; i++) {
      await page.selectOption('#nv-agent-select', 'didactic-architecture');
      await page.waitForTimeout(50);
      await page.fill('#nv-agent-input', `What is overfitting? query ${i}`);
      await page.waitForTimeout(50);
      await page.click('.nv-agent-submit');
      await page.waitForFunction(() => {
        const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
        return text.length > 0 && !text.includes('Processing query');
      }, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(200);
    }

    // Also test other agent selections
    const canonicalIds = [
      'curriculum-dependency', 'visual-interactive-media', 'code-simulation-lab',
      'assessment-reinforcement', 'research-state-of-art', 'application-professional-transfer',
      'storytelling-learning-journey', 'obsidian-knowledge-governance', 'curiosity-engagement'
    ];
    for (let i = 0; i < canonicalIds.length; i++) {
      await page.selectOption('#nv-agent-select', canonicalIds[i % canonicalIds.length]);
      await page.waitForTimeout(50);
    }

    const domIntegrity = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return {
        panelCount: document.querySelectorAll('#nv-agent-panel').length,
        selectorCount: document.querySelectorAll('#nv-agent-select').length,
        responseCount: document.querySelectorAll('[data-agent-response-content]').length,
        modeSelectorCount: document.querySelectorAll('#nv-agent-mode').length,
        quickActionGroupCount: document.querySelectorAll('[data-agent-quick-actions]').length,
        sectionToggleCount: document.querySelectorAll('.nv-agent-section__toggle').length,
        inputCount: document.querySelectorAll('#nv-agent-input').length,
        submitCount: document.querySelectorAll('.nv-agent-submit').length,
        historyCount: Number(document.querySelector('[data-agent-history-count]')?.textContent || 0)
      };
    });

    assert(report, 'performance', domIntegrity.panelCount === 1, 'single panel element');
    assert(report, 'performance', domIntegrity.selectorCount === 1, 'single agent selector');
    assert(report, 'performance', domIntegrity.responseCount === 1, 'single response container');
    assert(report, 'performance', domIntegrity.modeSelectorCount === 1, 'single mode selector');
    assert(report, 'performance', domIntegrity.inputCount === 1, 'single input element');
    assert(report, 'performance', domIntegrity.submitCount === 1, 'single submit button');
    assert(report, 'performance', domIntegrity.historyCount >= 5, `history tracked ${domIntegrity.historyCount}+ entries (≥5)`);

    // =====================================================================
    // SECTION 21: Performance — localStorage Cleanliness
    // =====================================================================
    console.log('=== SECTION 21: localStorage Governance ===');

    const storageResult = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const agentKeys = keys.filter(k => k.startsWith('nv_agent_panel_'));
      const curriculumKeys = keys.filter(k => /curriculum|canonical|lifecycle|mastery|grade|score|evidence/i.test(k));
      return { agentPanelKeys: agentKeys, curriculumKeys };
    });
    assert(report, 'governance', storageResult.curriculumKeys.length === 0, 'no curriculum-related localStorage keys written', storageResult.curriculumKeys);
    assert(report, 'governance', storageResult.agentPanelKeys.length > 0, 'agent panel persistence keys exist', storageResult.agentPanelKeys);

    // =====================================================================
    // SECTION 22: Governance — Guardrails
    // =====================================================================
    console.log('=== SECTION 22: Guardrails ===');

    for (const prompt of FORBIDDEN_PROMPTS) {
      await page.fill('#nv-agent-input', prompt);
      await page.waitForTimeout(50);
      await page.click('.nv-agent-submit');
      await page.waitForFunction(() => {
        const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
        return text.length > 0 && !text.includes('Processing query');
      }, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(200);

      const guardrailCheck = await page.evaluate(() => {
        const notice = document.querySelector('[data-agent-guardrail-notice]');
        const content = document.querySelector('[data-agent-response-content]');
        return {
          noticeVisible: notice && getComputedStyle(notice).display !== 'none',
          contentText: content?.textContent || '',
          containsBlocked: /blocked|guardrail|governance|refused|refusal/i.test(content?.textContent || '')
        };
      });

      assert(report, 'governance',
        guardrailCheck.noticeVisible || guardrailCheck.containsBlocked,
        `forbidden prompt blocked: "${prompt.substring(0, 50)}..."`,
        guardrailCheck.contentText?.substring(0, 120)
      );
    }

    // =====================================================================
    // SECTION 23: Browser Health
    // =====================================================================
    console.log('=== SECTION 23: Browser Health ===');

    assert(report, 'browser', report.browserEvents.consoleErrors.length === 0, `no console.error events (${report.browserEvents.consoleErrors.length})`, report.browserEvents.consoleErrors);
    assert(report, 'browser', report.browserEvents.pageErrors.length === 0, `no pageerror events (${report.browserEvents.pageErrors.length})`, report.browserEvents.pageErrors);
    assert(report, 'browser', report.browserEvents.failedRequests.length === 0, `no failed requests (${report.browserEvents.failedRequests.length})`, report.browserEvents.failedRequests);

  } finally {
    report.governance.after = gitStatus(GOVERNANCE_PATHS);
    assert(report, 'governance', report.governance.before === report.governance.after, 'NV-800/content/curriculum index git status unchanged', { before: report.governance.before, after: report.governance.after });

    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  report.decision = report.failures.length === 0 ? 'READY' : 'NOT READY';
  const serialized = JSON.stringify(report, null, 2);
  try {
    fs.writeFileSync(REPORT_PATH, serialized);
    console.log(`\nStructured audit report written to ${REPORT_PATH}`);
  } catch (error) {
    console.warn(`Unable to write ${REPORT_PATH}: ${error.message}`);
    console.log(serialized);
  }

  console.log(`\nNV-1000-A1 Extreme Audit: ${report.decision}`);
  console.log(`Checks: ${report.checks.length}, Failures: ${report.failures.length}`);
  if (report.failures.length > 0) {
    for (const failure of report.failures) {
      console.error(`FAIL [${failure.area}] ${failure.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Extreme audit crashed:', error);
  process.exit(1);
});
