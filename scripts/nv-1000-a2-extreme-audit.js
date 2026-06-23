#!/usr/bin/env node
/**
 * NV-1000-A2 Extreme Educational Audit
 * Curriculum & Dependency Agent — Full-Spectrum Quality Assurance
 *
 * Covers:
 *  - Educational quality (prerequisite, traversal, sequence, skip, context, neighbor, route, hierarchy)
 *  - UI rendering (curriculum quick actions, dependency cards, tree rendering)
 *  - Security (XSS, HTML injection)
 *  - Accessibility (ARIA, keyboard, focus)
 *  - Performance (no DOM leaks, stress test)
 *  - Governance (guardrails, no mutations, no mastery language)
 *  - Curriculum integrity (git status preservation)
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
const OUT_DIR = '/tmp/neuralverse-a2-extreme-audit';
const REPORT_PATH = path.join(OUT_DIR, 'a2-audit-report.json');

const VIEWPORTS = [
  { width: 390, height: 844, label: '390x844' },
  { width: 768, height: 900, label: '768x900' },
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1440, height: 900, label: '1440x900' }
];

const INTENT_CATEGORIES = [
  'dependency', 'next', 'previous', 'skip', 'summary',
  'context', 'route', 'neighbor', 'crosslink', 'hierarchy'
];

const GOVERNANCE_PATHS = ['docs/content', 'docs/architecture/nv-800', 'website/data/curriculum-index.json'];

const FORBIDDEN_PROMPTS = [
  'Remove prerequisite.',
  'Rewrite module order.',
  'Promote lesson.',
  'Mark Reviewed.',
  'Change curriculum graph.',
  'Delete dependency.',
  'Generate mastery.',
  'Generate Competency Evidence.'
];

const SECURITY_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<a href="javascript:alert(1)">Click</a>'
];

const DEEP_CONTEXT = {
  selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
  selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
  selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing and Intent Detection' },
  selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Dynamic Routing Mechanisms and Semantic Intent Detection' }
};

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

async function screenshot(page, name) {
  try {
    await page.screenshot({ path: path.join(OUT_DIR, name), fullPage: true });
  } catch (e) { console.warn(`Screenshot failed: ${name}`, e.message); }
}

async function main() {
  ensureOutDir();
  const beforeGovernanceStatus = gitStatus(GOVERNANCE_PATHS);

  const report = {
    id: 'NV-1000-A2-QA',
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
      window.NeuralVerse?.curriculumDependencyAgent &&
      window.NeuralVerse?.didacticOrchestrator
    ), { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Initialize A2 agent
    await page.evaluate(async () => {
      const agent = window.NeuralVerse.curriculumDependencyAgent;
      if (agent && typeof agent.initialize === 'function') {
        await agent.initialize();
      }
    });
    await page.waitForTimeout(1000);

    // =====================================================================
    // SECTION 1: Module Load & Public API
    // =====================================================================
    console.log('\n=== SECTION 1: Module Load & Public API ===');

    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      if (!agent) return { loaded: false };
      await agent.initialize();
      const stats = agent.getIndexStats();
      return {
        loaded: true,
        hasInitialize: typeof agent.initialize === 'function',
        hasRun: typeof agent.run === 'function',
        hasCanHandle: typeof agent.canHandle === 'function',
        hasGetPrerequisites: typeof agent.getPrerequisites === 'function',
        hasGetNeighbors: typeof agent.getNeighbors === 'function',
        hasGetDependencyExplanation: typeof agent.getDependencyExplanation === 'function',
        hasGenerateRoute: typeof agent.generateRoute === 'function',
        hasGetCurriculumContext: typeof agent.getCurriculumContext === 'function',
        hasGetIndexStats: typeof agent.getIndexStats === 'function',
        hasGetAvailableIntents: typeof agent.getAvailableIntents === 'function',
        statsLp: stats?.learningPaths,
        statsModules: stats?.modules,
        statsLessons: stats?.lessons,
        statsArtifacts: stats?.artifacts
      };
    });

    assert(report, 'module', moduleCheck.loaded, 'curriculumDependencyAgent loaded');
    assert(report, 'module', moduleCheck.hasInitialize, 'has initialize()');
    assert(report, 'module', moduleCheck.hasRun, 'has run()');
    assert(report, 'module', moduleCheck.hasCanHandle, 'has canHandle()');
    assert(report, 'module', moduleCheck.hasGetPrerequisites, 'has getPrerequisites()');
    assert(report, 'module', moduleCheck.hasGetNeighbors, 'has getNeighbors()');
    assert(report, 'module', moduleCheck.hasGetDependencyExplanation, 'has getDependencyExplanation()');
    assert(report, 'module', moduleCheck.hasGenerateRoute, 'has generateRoute()');
    assert(report, 'module', moduleCheck.hasGetCurriculumContext, 'has getCurriculumContext()');
    assert(report, 'module', moduleCheck.hasGetIndexStats, 'has getIndexStats()');
    assert(report, 'module', moduleCheck.hasGetAvailableIntents, 'has getAvailableIntents()');
    assert(report, 'module', moduleCheck.statsLp === 19, `stats: 19 learning paths`, moduleCheck.statsLp);
    assert(report, 'module', moduleCheck.statsModules === 40, `stats: 40 modules`, moduleCheck.statsModules);
    assert(report, 'module', moduleCheck.statsLessons === 120, `stats: 120 lessons`, moduleCheck.statsLessons);
    assert(report, 'module', moduleCheck.statsArtifacts === 600, `stats: 600 artifacts`, moduleCheck.statsArtifacts);

    // =====================================================================
    // SECTION 2: Intent Detection
    // =====================================================================
    console.log('=== SECTION 2: Intent Detection ===');

    const intents = await page.evaluate(() => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      return agent?.getAvailableIntents();
    });
    assert(report, 'intents', Array.isArray(intents) && intents.length === 10, `getAvailableIntents returns 10 intents`, intents?.length);

    for (const intent of INTENT_CATEGORIES) {
      assert(report, 'intents', intents?.includes(intent), `intent "${intent}" is available`);
    }

    const intentPatterns = await page.evaluate(() => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      const patterns = agent?.INTENT_PATTERNS || {};
      const results = {};
      for (const [intent, triggers] of Object.entries(patterns)) {
        results[intent] = { triggerCount: triggers.length, firstTrigger: triggers[0] };
      }
      return results;
    });

    for (const intent of INTENT_CATEGORIES) {
      const p = intentPatterns[intent];
      assert(report, 'intents', p && p.triggerCount >= 2, `intent "${intent}" has ${p?.triggerCount ?? 0}+ trigger patterns`);
    }

    // =====================================================================
    // SECTION 3: Prerequisite Explanation
    // =====================================================================
    console.log('=== SECTION 3: Prerequisite Explanation ===');

    const depResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'What should I study before this?', ...ctx },
        {}
      );
    }, DEEP_CONTEXT);

    assert(report, 'prerequisites', Array.isArray(depResult?.sections) && depResult.sections.length > 0, 'dependency explanation returns sections');
    const depTitles = depResult.sections.map(s => s.title);
    assert(report, 'prerequisites', depTitles.includes('Prerequisite Concept'), 'has Prerequisite Concept section');
    assert(report, 'prerequisites', depTitles.includes('Dependency Rationale'), 'has Dependency Rationale section');
    assert(report, 'prerequisites', depTitles.includes('Expected Benefit'), 'has Expected Benefit section');
    assert(report, 'prerequisites', depTitles.includes('Consequences of Skipping'), 'has Consequences of Skipping section');
    assert(report, 'prerequisites', depResult.status === 'operational', 'status is operational');
    assert(report, 'prerequisites', depResult.agentId === 'curriculum-dependency', 'agentId correct');
    assert(report, 'prerequisites', depResult.disclaimer === null, 'disclaimer is null (no fabricated content)');

    // Verify content references real data
    const prereqContent = depResult.sections.find(s => s.title === 'Prerequisite Concept')?.content || '';
    const hasRealPrereq = prereqContent.includes('Query') || prereqContent.includes('No prerequisites');
    assert(report, 'prerequisites', hasRealPrereq, 'prerequisite content references real curriculum data', prereqContent.substring(0, 100));

    const skipContent = depResult.sections.find(s => s.title === 'Consequences of Skipping')?.content || '';
    assert(report, 'prerequisites', !skipContent.includes('fabricated') && !skipContent.includes('invented'), 'no fabricated language in skip consequences');

    // =====================================================================
    // SECTION 4: Dependency Traversal
    // =====================================================================
    console.log('=== SECTION 4: Dependency Traversal ===');

    // Test with first lesson (no in-module prereqs)
    const firstLessonCtx = {
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing and Intent Detection' }
    };

    const firstLessonDep = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'prerequisite', ...ctx }, {});
    }, firstLessonCtx);

    const firstDepContent = firstLessonDep.sections?.find(s => s.title === 'Prerequisite Concept')?.content || '';
    assert(report, 'traversal', firstDepContent.includes('first lesson') || firstDepContent.includes('No prerequisites'), 'first lesson correctly identifies no intra-module prereqs', firstDepContent.substring(0, 80));

    // Test public API getPrerequisites
    const apiPrereqs = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return agent.getPrerequisites('lesson-query-routing');
    });
    assert(report, 'traversal', Array.isArray(apiPrereqs), 'getPrerequisites returns array');
    assert(report, 'traversal', apiPrereqs.length === 0, 'first lesson has 0 prerequisites (correct)');

    // Test getNeighbors
    const apiNeighbors = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return agent.getNeighbors('lesson-query-routing');
    });
    assert(report, 'traversal', apiNeighbors?.previous === null, 'first lesson has no previous sibling');
    assert(report, 'traversal', apiNeighbors?.next !== null, 'first lesson has next sibling');
    assert(report, 'traversal', Array.isArray(apiNeighbors?.siblings) && apiNeighbors.siblings.length > 0, 'first lesson has siblings');

    // Test getDependencyExplanation
    const apiDepExpl = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return agent.getDependencyExplanation('lesson-query-routing');
    });
    assert(report, 'traversal', apiDepExpl?.lesson === 'Query Routing and Intent Detection', 'getDependencyExplanation returns correct lesson title');
    assert(report, 'traversal', apiDepExpl?.module === 'Advanced Retrieval Pipelines', 'getDependencyExplanation returns correct module');
    assert(report, 'traversal', apiDepExpl?.path === 'Advanced RAG Foundations', 'getDependencyExplanation returns correct path');
    assert(report, 'traversal', Array.isArray(apiDepExpl?.prerequisites), 'getDependencyExplanation returns prerequisites array');

    // =====================================================================
    // SECTION 5: Learning Sequence Guidance
    // =====================================================================
    console.log('=== SECTION 5: Learning Sequence Guidance ===');

    const testSequencePrompts = [
      { query: 'What comes after embeddings?', ctx: DEEP_CONTEXT },
      { query: 'What should I study next?', ctx: { ...DEEP_CONTEXT, selectedArtifact: null } },
      { query: 'What is the recommended order?', ctx: { selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } } },
      { query: 'How does this lesson fit the curriculum?', ctx: DEEP_CONTEXT },
      { query: 'Where should I continue next?', ctx: DEEP_CONTEXT }
    ];

    for (const tc of testSequencePrompts) {
      const result = await page.evaluate(async ({ query, ctx }) => {
        const agent = window.NeuralVerse?.curriculumDependencyAgent;
        await agent.initialize();
        return await agent.run({ userQuery: query, ...ctx }, {});
      }, tc);
      assert(report, 'sequence', Array.isArray(result?.sections) && result.sections.length > 0, `"${tc.query.substring(0, 40)}..." returns sections`);
      assert(report, 'sequence', result?.status === 'operational', `"${tc.query.substring(0, 40)}..." status operational`);
    }

    // Verify next recommendation produces coherent output
    const nextResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'What comes next?', ...ctx }, {});
    }, DEEP_CONTEXT);

    const nextTitles = nextResult.sections.map(s => s.title);
    assert(report, 'sequence', nextResult.sections.length >= 2, 'next recommendation has 2+ sections');
    assert(report, 'sequence', nextTitles.includes('Recommendation Source') || nextTitles.includes('Next Artifact') || nextTitles.includes('Next Lesson'), 'next recommendation includes location-aware guidance');

    // =====================================================================
    // SECTION 6: Skip Analysis
    // =====================================================================
    console.log('=== SECTION 6: Skip Analysis ===');

    const skipResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Can I skip this lesson?', ...ctx }, {});
    }, DEEP_CONTEXT);

    const skipTitles = skipResult.sections.map(s => s.title);
    assert(report, 'skip', Array.isArray(skipResult.sections) && skipResult.sections.length > 0, 'skip analysis returns sections');
    assert(report, 'skip', skipTitles.includes('Likely Missing Intuition'), 'has Likely Missing Intuition');
    assert(report, 'skip', skipTitles.includes('Concepts Affected') || skipTitles.includes('Downstream Lessons Impacted'), 'has downstream impact analysis');
    assert(report, 'skip', skipTitles.includes('Recommendation'), 'has Recommendation section');
    assert(report, 'skip', skipTitles.includes('Note'), 'has Note about curriculum data source');

    // Verify no absolute statements
    const allContent = skipResult.sections.map(s => s.content).join(' ');
    assert(report, 'skip', !/(you must|definitely|always|never skip|guaranteed)/i.test(allContent), 'skip analysis avoids absolute statements');

    // =====================================================================
    // SECTION 7: Curriculum Position Awareness
    // =====================================================================
    console.log('=== SECTION 7: Curriculum Position Awareness ===');

    const ctxResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Where am I in the curriculum?', ...ctx }, {});
    }, DEEP_CONTEXT);

    const ctxTitles = ctxResult.sections.map(s => s.title);
    assert(report, 'position', ctxTitles.includes('Current Learning Path'), 'has Current Learning Path');
    assert(report, 'position', ctxTitles.includes('Current Module'), 'has Current Module');
    assert(report, 'position', ctxTitles.includes('Current Lesson'), 'has Current Lesson');
    assert(report, 'position', ctxTitles.includes('Current Artifact'), 'has Current Artifact');
    assert(report, 'position', ctxTitles.includes('Sibling Lessons'), 'has Sibling Lessons');

    const pathSection = ctxResult.sections.find(s => s.title === 'Current Learning Path')?.content || '';
    assert(report, 'position', pathSection.includes('Advanced RAG Foundations'), 'path context references real path title');

    const lessonSection = ctxResult.sections.find(s => s.title === 'Current Lesson')?.content || '';
    assert(report, 'position', lessonSection.includes('Query Routing'), 'lesson context references real lesson title');

    // =====================================================================
    // SECTION 8: Neighbor Recommendation
    // =====================================================================
    console.log('=== SECTION 8: Neighbor Recommendation ===');

    const neighborResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Show me neighbor lessons', ...ctx }, {});
    }, DEEP_CONTEXT);

    const neighborTitles = neighborResult.sections.map(s => s.title);
    assert(report, 'neighbor', neighborTitles.includes('Lesson Neighbors'), 'has Lesson Neighbors');
    assert(report, 'neighbor', neighborTitles.includes('Sibling Lessons'), 'has Sibling Lessons');
    assert(report, 'neighbor', neighborTitles.includes('Parent Module'), 'has Parent Module');

    // Verify neighbor content references real data
    const siblingSection = neighborResult.sections.find(s => s.title === 'Sibling Lessons')?.content || '';
    assert(report, 'neighbor', siblingSection.includes('lesson-') || siblingSection.includes('**'), 'sibling section uses real curriculum references');

    // =====================================================================
    // SECTION 9: Progress Orientation — No Mastery Language
    // =====================================================================
    console.log('=== SECTION 9: No Mastery Language ===');

    // Check all response types for forbidden terms
    const allResponses = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      const queries = [
        { query: 'What should I study before this?', ctx },
        { query: 'What comes next?', ctx },
        { query: 'Where am I?', ctx },
        { query: 'Summarize this', ctx },
        { query: 'Show me the route', ctx: { selectedPath: { id: 'path-advanced-rag-foundations' } } }
      ];
      const results = [];
      for (const q of queries) {
        const r = await agent.run({ userQuery: q.query, ...q.ctx }, {});
        const text = (r.sections || []).map(s => s.content).join(' ');
        results.push({ query: q.query, text });
      }
      return results;
    }, DEEP_CONTEXT);

    for (const r of allResponses) {
      const forbidden = /(You are ready|You mastered|90% complete|Pass\.|Score\.|mastery|mastered|competency evidence)/i;
      assert(report, 'mastery-language', !forbidden.test(r.text), `"${r.query}" avoids mastery/score/grade language`);
    }

    // =====================================================================
    // SECTION 10: Learning Route Generation
    // =====================================================================
    console.log('=== SECTION 10: Learning Route Generation ===');

    const routeResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Show me the learning route', selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        { routeType: 'full' }
      );
    });

    assert(report, 'route', Array.isArray(routeResult?.sections) && routeResult.sections.length > 0, 'learning route returns sections');
    assert(report, 'route', routeResult.sections.some(s => s.type === 'tree'), 'has tree type section');
    assert(report, 'route', routeResult.sections.some(s => s.title === 'Recommendation Source'), 'has Recommendation Source');

    const treeContent = routeResult.sections.find(s => s.type === 'tree')?.content || '';
    assert(report, 'route', treeContent.includes('Advanced RAG Foundations'), 'tree references real path title');
    assert(report, 'route', treeContent.includes('Advanced Retrieval Pipelines'), 'tree references real module title');

    // Test public API generateRoute
    const apiRoute = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return agent.generateRoute('path-advanced-rag-foundations');
    });
    assert(report, 'route', Array.isArray(apiRoute) && apiRoute.length > 0, 'generateRoute returns non-empty array');
    assert(report, 'route', apiRoute[0]?.type === 'module', 'route starts with module entry');
    assert(report, 'route', apiRoute.some(e => e.type === 'lesson'), 'route includes lesson entries');

    // =====================================================================
    // SECTION 11: Curriculum Hierarchy Visualization
    // =====================================================================
    console.log('=== SECTION 11: Curriculum Hierarchy ===');

    const hierResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Show me the parent hierarchy', ...ctx }, {});
    }, DEEP_CONTEXT);

    assert(report, 'hierarchy', Array.isArray(hierResult?.sections) && hierResult.sections.length > 0, 'hierarchy returns sections');
    assert(report, 'hierarchy', hierResult.sections.some(s => s.type === 'tree'), 'has tree type section');

    const hierContent = hierResult.sections.find(s => s.type === 'tree')?.content || '';
    assert(report, 'hierarchy', hierContent.includes('Learning Path:'), 'hierarchy includes Learning Path header');
    assert(report, 'hierarchy', hierContent.includes('Module:'), 'hierarchy includes Module entries');
    assert(report, 'hierarchy', hierContent.includes('Lesson:'), 'hierarchy includes Lesson entries');
    assert(report, 'hierarchy', hierContent.includes('Artifact:'), 'hierarchy includes Artifact entries');

    // =====================================================================
    // SECTION 12: Cross-Link Explanation
    // =====================================================================
    console.log('=== SECTION 12: Cross-Link Explanation ===');

    const crosslinkResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Show related concepts', ...ctx }, {});
    }, DEEP_CONTEXT);

    const crosslinkTitles = crosslinkResult.sections.map(s => s.title);
    assert(report, 'crosslink', crosslinkTitles.includes('Cross-Link Analysis'), 'has Cross-Link Analysis section');
    assert(report, 'crosslink', crosslinkTitles.includes('Related Learning Paths') || crosslinkTitles.includes('Note'), 'has related paths or disclaimer note');

    // =====================================================================
    // SECTION 13: Curriculum Consistency (Determinism)
    // =====================================================================
    console.log('=== SECTION 13: Curriculum Consistency ===');

    const consistencyResults = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();

      // Run same query 5 times, compare
      const runs = [];
      for (let i = 0; i < 5; i++) {
        const r = await agent.run({ userQuery: 'What should I study before this?', ...ctx }, {});
        const sections = r.sections.map(s => ({ title: s.title, content: s.content }));
        runs.push(sections);
      }

      // Compare all runs
      let allIdentical = true;
      for (let i = 1; i < runs.length; i++) {
        const prev = JSON.stringify(runs[0]);
        const curr = JSON.stringify(runs[i]);
        if (prev !== curr) { allIdentical = false; break; }
      }

      return { runsCount: runs.length, allIdentical };
    }, DEEP_CONTEXT);

    assert(report, 'consistency', consistencyResults.runsCount === 5, 'ran 5 identical queries');
    assert(report, 'consistency', consistencyResults.allIdentical, 'all 5 runs produce identical deterministic output');

    // =====================================================================
    // SECTION 14: Missing Prerequisite Detection
    // =====================================================================
    console.log('=== SECTION 14: Missing Prerequisite Detection ===');

    // Test with minimal context (no position)
    const noCtxResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'What should I study before this?' }, {});
    });

    assert(report, 'missing-prereq', Array.isArray(noCtxResult?.sections) && noCtxResult.sections.length > 0, 'handles query without context gracefully');

    const noCtxContent = noCtxResult.sections.map(s => s.content).join(' ');
    assert(report, 'missing-prereq', /navigate|No Current Position|no context/i.test(noCtxContent), 'diplomatically indicates missing context');

    // =====================================================================
    // SECTION 15: Curriculum Summary
    // =====================================================================
    console.log('=== SECTION 15: Curriculum Summary ===');

    const summaryResult = await page.evaluate(async (ctx) => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run({ userQuery: 'Summarize this curriculum item', ...ctx }, {});
    }, DEEP_CONTEXT);

    const summaryTitles = summaryResult.sections.map(s => s.title);
    assert(report, 'summary', summaryTitles.includes('Module Scope'), 'has Module Scope section');
    assert(report, 'summary', summaryTitles.includes('Lesson Purpose'), 'has Lesson Purpose section');
    assert(report, 'summary', summaryTitles.includes('Artifact Role'), 'has Artifact Role section');

    // =====================================================================
    // SECTION 16: UI — Curriculum Quick Actions
    // =====================================================================
    console.log('=== SECTION 16: Curriculum Quick Actions ===');

    // Open panel
    await page.evaluate(() => {
      if (!document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open')) {
        document.querySelector('#nv-agent-trigger')?.click();
      }
    });
    await page.waitForFunction(() => document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open'), { timeout: 5000 });
    await page.waitForTimeout(300);
    await screenshot(page, 'a2-panel-open.png');

    await page.selectOption('#nv-agent-select', 'curriculum-dependency');
    await page.waitForTimeout(300);

    const curriculumActions = await page.evaluate(() => {
      const container = document.querySelector('[data-agent-curriculum-actions]');
      if (!container) return { exists: false };
      const buttons = container.querySelectorAll('.nv-agent-quick-action-btn');
      return {
        exists: true,
        visible: container.style.display !== 'none',
        count: buttons.length,
        ids: [...buttons].map(b => b.dataset.quickAction),
        labels: [...buttons].map(b => b.textContent.trim()),
        allHaveAriaLabel: [...buttons].every(b => b.getAttribute('aria-label'))
      };
    });

    assert(report, 'ui', curriculumActions.exists, 'curriculum actions container exists');
    assert(report, 'ui', curriculumActions.visible, 'curriculum actions visible when curriculum-dependency selected');
    assert(report, 'ui', curriculumActions.count === 10, `curriculum action buttons: ${curriculumActions.count} (expected 10)`);
    assert(report, 'ui', curriculumActions.allHaveAriaLabel, 'all curriculum action buttons have aria-label');

    const expectedActionIds = ['show-prereqs', 'show-next', 'explain-position', 'dependency-chain', 'can-i-skip', 'curriculum-summary', 'learning-route', 'related-concepts', 'parent-hierarchy', 'neighbor-lessons'];
    for (const id of expectedActionIds) {
      assert(report, 'ui', curriculumActions.ids.includes(id), `curriculum action "${id}" exists`);
    }

    // Verify didactic actions hidden
    const didacticHidden = await page.evaluate(() => {
      const el = document.querySelector('[data-agent-quick-actions]');
      return el && el.style.display === 'none';
    });
    assert(report, 'ui', didacticHidden, 'didactic quick actions hidden when curriculum agent selected');

    // =====================================================================
    // SECTION 17: UI — Panel Controls for A2
    // =====================================================================
    console.log('=== SECTION 17: Panel Controls ===');

    const panelControls = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return {
        hasTrigger: !!document.querySelector('#nv-agent-trigger'),
        hasClose: !!panel?.querySelector('.nv-agent-panel__close'),
        hasInput: !!panel?.querySelector('#nv-agent-input'),
        hasSubmit: !!panel?.querySelector('.nv-agent-submit'),
        hasResponseContent: !!panel?.querySelector('[data-agent-response-content]'),
        hasGuardrailNotice: !!panel?.querySelector('[data-agent-guardrail-notice]'),
        hasHistoryToggle: !!panel?.querySelector('.nv-agent-panel__history-toggle'),
        modeRowHidden: (() => {
          const row = panel?.querySelector('[data-agent-mode-row]');
          return row && row.style.display === 'none';
        })()
      };
    });

    assert(report, 'ui', panelControls.hasTrigger, 'trigger exists');
    assert(report, 'ui', panelControls.hasClose, 'close button exists');
    assert(report, 'ui', panelControls.hasInput, 'input exists');
    assert(report, 'ui', panelControls.hasSubmit, 'submit exists');
    assert(report, 'ui', panelControls.hasResponseContent, 'response content exists');
    assert(report, 'ui', panelControls.hasGuardrailNotice, 'guardrail notice exists');
    assert(report, 'ui', panelControls.hasHistoryToggle, 'history toggle exists');
    assert(report, 'ui', panelControls.modeRowHidden, 'mode selector row hidden for curriculum-dependency agent');

    // =====================================================================
    // SECTION 18: UI — Tree Rendering
    // =====================================================================
    console.log('=== SECTION 18: Tree Rendering ===');

    // Submit a hierarchy query via panel
    await page.fill('#nv-agent-input', 'Show me the parent hierarchy');
    await page.waitForTimeout(100);
    await page.click('.nv-agent-submit');
    await page.waitForFunction(() => {
      const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
      return text.length > 0 && !text.includes('Processing query');
    }, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
    await screenshot(page, 'a2-dependency-tree.png');

    const renderedTree = await page.evaluate(() => {
      const content = document.querySelector('[data-agent-response-content]');
      if (!content) return null;
      const treeSections = content.querySelectorAll('.nv-agent-section');
      const treeNodes = content.querySelectorAll('.nv-agent-tree, .nv-agent-section__content');
      return {
        sectionCount: treeSections.length,
        hasTreeContent: treeNodes.length > 0,
        text: content.textContent?.substring(0, 300)
      };
    });
    assert(report, 'ui', renderedTree?.sectionCount >= 1, 'renders at least 1 collapsible section');
    assert(report, 'ui', renderedTree?.hasTreeContent, 'renders tree/hierarchy content');

    // =====================================================================
    // SECTION 19: Security — XSS
    // =====================================================================
    console.log('=== SECTION 19: Security ===');

    for (const payload of SECURITY_PAYLOADS) {
      await page.fill('#nv-agent-input', `Explain safely: ${payload}`);
      await page.waitForTimeout(50);
      await page.click('.nv-agent-submit');
      await page.waitForFunction(() => {
        const text = document.querySelector('[data-agent-response-content]')?.textContent || '';
        return text.length > 0 && !text.includes('Processing query');
      }, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(200);
    }

    const securityResult = await page.evaluate(() => {
      const content = document.querySelector('[data-agent-response-content]');
      if (!content) return {};
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

    assert(report, 'security', report.browserEvents.alerts.length === 0, `no alert dialogs (${report.browserEvents.alerts.length})`);
    assert(report, 'security', !securityResult.hasScriptNodes, 'no script nodes injected');
    assert(report, 'security', !securityResult.hasEventAttrs, 'no inline event handlers');
    assert(report, 'security', !securityResult.hasJsLinks, 'no javascript: links');

    // =====================================================================
    // SECTION 20: Accessibility
    // =====================================================================
    console.log('=== SECTION 20: Accessibility ===');

    const a11yPanel = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      return {
        panelRole: panel?.getAttribute('role'),
        panelLabel: panel?.getAttribute('aria-label'),
        triggerAriaControls: trigger?.getAttribute('aria-controls'),
        triggerAriaExpanded: trigger?.getAttribute('aria-expanded'),
        closeAriaLabel: panel?.querySelector('.nv-agent-panel__close')?.getAttribute('aria-label')
      };
    });
    assert(report, 'accessibility', a11yPanel.panelRole === 'complementary', 'panel role="complementary"');
    assert(report, 'accessibility', a11yPanel.panelLabel === 'Didactic Agent Assist', 'panel aria-label');
    assert(report, 'accessibility', a11yPanel.triggerAriaControls === 'nv-agent-panel', 'trigger aria-controls');
    assert(report, 'accessibility', a11yPanel.triggerAriaExpanded === 'true', 'trigger aria-expanded');
    assert(report, 'accessibility', a11yPanel.closeAriaLabel?.includes('Close'), 'close button aria-label');

    // Escape closes panel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const afterEscape = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      return {
        panelOpen: panel?.classList.contains('nv-agent-panel--open'),
        focusReturned: document.activeElement?.id === 'nv-agent-trigger'
      };
    });
    assert(report, 'accessibility', !afterEscape.panelOpen, 'Escape closes panel');
    assert(report, 'accessibility', afterEscape.focusReturned, 'focus returns to trigger');
    await screenshot(page, 'a2-keyboard-focus.png');

    // Re-open via Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const reopened = await page.evaluate(() => {
      return document.querySelector('#nv-agent-panel')?.classList.contains('nv-agent-panel--open');
    });
    assert(report, 'accessibility', reopened, 'Enter re-opens panel');

    // =====================================================================
    // SECTION 21: Responsive Layout
    // =====================================================================
    console.log('=== SECTION 21: Responsive Layout ===');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);
      const overflow = await hasHorizontalOverflow(page);
      const fitsPanel = await page.evaluate(() => {
        const panel = document.querySelector('#nv-agent-panel')?.getBoundingClientRect();
        if (!panel) return false;
        return panel.left >= -1 && panel.right <= window.innerWidth + 1 && panel.top >= -1;
      });
      assert(report, 'responsive', !overflow && fitsPanel, `panel fits without overflow at ${vp.label}`, { overflow, fitsPanel });
      if (vp.width === 390) await screenshot(page, 'a2-mobile-390.png');
    }

    // =====================================================================
    // SECTION 22: Performance — Stress Test
    // =====================================================================
    console.log('=== SECTION 22: Performance (Stress Test) ===');

    // 100 dependency lookups
    for (let i = 0; i < 20; i++) {
      await page.evaluate(async () => {
        const agent = window.NeuralVerse?.curriculumDependencyAgent;
        await agent.initialize();
        for (let j = 0; j < 5; j++) {
          agent.getPrerequisites('lesson-query-routing');
          agent.getNeighbors('lesson-query-routing');
          agent.getDependencyExplanation('lesson-query-routing');
          agent.getCurriculumContext({
            selectedPath: { id: 'path-advanced-rag-foundations' },
            selectedModule: { id: 'module-advanced-retrieval-pipelines' },
            selectedLesson: { id: 'lesson-query-routing' }
          });
        }
      });
    }

    // Rapid agent switches
    const agentIds = ['curriculum-dependency', 'didactic-architecture', 'curriculum-dependency', 'visual-interactive-media', 'curriculum-dependency'];
    for (const id of agentIds) {
      await page.selectOption('#nv-agent-select', id);
      await page.waitForTimeout(30);
    }

    // Panel reopen cycles
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        const panel = document.querySelector('#nv-agent-panel');
        if (panel?.classList.contains('nv-agent-panel--open')) {
          panel.querySelector('.nv-agent-panel__close')?.click();
        }
      });
      await page.waitForTimeout(50);
      await page.evaluate(() => {
        document.querySelector('#nv-agent-trigger')?.click();
      });
      await page.waitForTimeout(50);
    }

    const domIntegrity = await page.evaluate(() => {
      return {
        panelCount: document.querySelectorAll('#nv-agent-panel').length,
        selectorCount: document.querySelectorAll('#nv-agent-select').length,
        curriculumActionGroupCount: document.querySelectorAll('[data-agent-curriculum-actions]').length,
        inputCount: document.querySelectorAll('#nv-agent-input').length,
        submitCount: document.querySelectorAll('.nv-agent-submit').length,
        responseCount: document.querySelectorAll('[data-agent-response-content]').length
      };
    });

    assert(report, 'performance', domIntegrity.panelCount === 1, 'single panel element');
    assert(report, 'performance', domIntegrity.selectorCount === 1, 'single selector');
    assert(report, 'performance', domIntegrity.curriculumActionGroupCount === 1, 'single curriculum action group');
    assert(report, 'performance', domIntegrity.inputCount === 1, 'single input');
    assert(report, 'performance', domIntegrity.submitCount === 1, 'single submit');
    assert(report, 'performance', domIntegrity.responseCount === 1, 'single response container');

    // =====================================================================
    // SECTION 23: Governance — Guardrails
    // =====================================================================
    console.log('=== SECTION 23: Governance (Guardrails) ===');

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
          containsBlocked: /blocked|guardrail|governance|refused|refusal/i.test(content?.textContent || '')
        };
      });

      assert(report, 'governance',
        guardrailCheck.noticeVisible || guardrailCheck.containsBlocked,
        `forbidden prompt blocked: "${prompt.substring(0, 50)}..."`,
      );
    }

    // =====================================================================
    // SECTION 24: localStorage Audit
    // =====================================================================
    console.log('=== SECTION 24: localStorage Governance ===');

    const storageCheck = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const forbidden = keys.filter(k => /mastery|score|grade|curriculum.*mutat|rewritten.*depend/i.test(k));
      return { forbiddenKeys: forbidden, allKeys: keys };
    });

    assert(report, 'governance', storageCheck.forbiddenKeys.length === 0, 'no mastery/score/grade/curriculum-mutation localStorage keys', storageCheck.forbiddenKeys);

    // =====================================================================
    // SECTION 25: Browser Health
    // =====================================================================
    console.log('=== SECTION 25: Browser Health ===');

    assert(report, 'browser', report.browserEvents.consoleErrors.length === 0, `no console.error events (${report.browserEvents.consoleErrors.length})`, report.browserEvents.consoleErrors);
    assert(report, 'browser', report.browserEvents.pageErrors.length === 0, `no pageerror events (${report.browserEvents.pageErrors.length})`, report.browserEvents.pageErrors);
    assert(report, 'browser', report.browserEvents.failedRequests.length === 0, `no failed requests (${report.browserEvents.failedRequests.length})`, report.browserEvents.failedRequests);

    // =====================================================================
    // SECTION 26: Orchestrator Integration
    // =====================================================================
    console.log('=== SECTION 26: Orchestrator Integration ===');

    const orchestratorResult = await page.evaluate(async () => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      if (!orchestrator) return { error: 'no orchestrator' };
      const agents = orchestrator.getRegisteredAgents();
      const hasA2 = agents.some(a => a.id === 'curriculum-dependency');
      const result = await orchestrator.invokeAgent('curriculum-dependency', 'What should I study before this?', {
        context: {
          selectedPath: { id: 'path-advanced-rag-foundations' },
          selectedModule: { id: 'module-advanced-retrieval-pipelines' },
          selectedLesson: { id: 'lesson-query-routing' },
          userQuery: 'What should I study before this?'
        }
      });
      return {
        hasA2,
        hasSections: !!(result?.sections && result.sections.length > 0),
        hasError: result?.type === 'error',
        hasRefusal: result?.type === 'governed-refusal',
        sectionCount: result?.sections?.length || 0
      };
    });

    assert(report, 'orchestrator', orchestratorResult.hasA2, 'A2 registered in orchestrator');
    assert(report, 'orchestrator', orchestratorResult.hasSections, 'orchestrator invokes A2 and returns sections');
    assert(report, 'orchestrator', !orchestratorResult.hasError, 'no error from orchestrator invocation');
    assert(report, 'orchestrator', !orchestratorResult.hasRefusal, 'no refusal for valid query');

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

  console.log(`\nNV-1000-A2 Extreme Audit: ${report.decision}`);
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
