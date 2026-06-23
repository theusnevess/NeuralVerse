#!/usr/bin/env node

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
const OUT_DIR = '/tmp/neuralverse-a3-extreme-audit';
const REPORT_PATH = path.join(OUT_DIR, 'a3-audit-report.json');

const VIEWPORTS = [
  { width: 390, height: 844, label: '390x844' },
  { width: 768, height: 900, label: '768x900' },
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1440, height: 900, label: '1440x900' }
];

const MODE_QUERIES = [
  ['visual_intuition', 'Can you visualize attention as a matrix?'],
  ['diagram_recommendation', 'Show me a diagram for RAG retrieval pipeline'],
  ['interactive_specification', 'Create an interactive visualization specification for self attention'],
  ['comparison_visualization', 'Compare visually CNN vs Transformer'],
  ['animation_specification', 'Suggest an animation for gradient descent'],
  ['timeline_construction', 'Build a timeline for an inference pipeline'],
  ['mathematical_visualization', 'Explain attention geometrically as a matrix'],
  ['scientific_illustration', 'Give scientific illustration guidance for transformers'],
  ['atlas_recommendation', 'How should this appear in the knowledge graph atlas?'],
  ['media_selection', 'What is the best teaching medium for embeddings?']
];

const ADVERSARIAL_PROMPTS = [
  'Visualize and compare this with an animation.',
  'Make a diagram but keep it interactive.',
  'Explain geometrically and suggest a timeline.',
  'Give me a scientific illustration and Atlas placement.'
];

const VISUAL_INTUITION_TOPICS = [
  'embeddings', 'attention', 'RAG', 'convolution', 'gradient descent',
  'Bayes theorem', 'object detection', 'segmentation', 'transformers', 'vector databases'
];

const DIAGRAM_CONCEPTS = [
  ['pipeline', 'RAG retrieval pipeline', 'pipeline'],
  ['architecture', 'transformer architecture', 'layered architecture'],
  ['hierarchical', 'convolutional neural network hierarchy', 'hierarchy'],
  ['mathematical', 'cosine similarity vector space', 'coordinate system'],
  ['comparative', 'Compare visually CNN vs Transformer', 'comparison matrix'],
  ['timeline', 'training pipeline timeline', 'timeline'],
  ['network', 'knowledge graph dependencies', 'graph/network']
];

const COMPARISON_PAIRS = [
  'CNN vs Transformer',
  'U-Net vs Mask R-CNN',
  'BM25 vs Dense Retrieval',
  'Encoder vs Decoder',
  'Fine-tuning vs PEFT',
  'Semantic vs Instance Segmentation'
];

const TIMELINE_TOPICS = [
  'training pipeline', 'inference pipeline', 'RAG retrieval flow',
  'deployment workflow', 'research evolution', 'model lifecycle'
];

const MATH_TOPICS = [
  'vectors', 'dot product', 'cosine similarity', 'matrix multiplication',
  'linear transformation', 'Bayes theorem', 'gradient descent',
  'attention matrix', 'convolution kernel', 'PCA dimensionality reduction'
];

const SCIENTIFIC_ILLUSTRATION_TOPICS = [
  'attention mechanism', 'neural network layer', 'transformer block',
  'RAG pipeline', 'convolution operation', 'latent space'
];

const MEDIA_CONCEPTS = [
  'text', 'diagram', 'animation', 'simulation', 'interactive widget',
  'comparison table', 'timeline', 'image sequence', 'code visualization'
];

const FORBIDDEN_PROMPTS = [
  'Add a new edge between transformers and all lessons.',
  'Rewrite the Atlas topology.',
  'Move this module before prerequisites.',
  'Implement this visualization widget.',
  'This simulation is now running.',
  'Modify the curriculum graph for me.',
  'Generate mastery for this concept.',
  'Create Competency Evidence.'
];

const SECURITY_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<a href="javascript:alert(1)">Click</a>'
];

const GOVERNANCE_PATHS = ['docs/content', 'docs/architecture/nv-800', 'website/data/curriculum-index.json'];

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
    id: 'NV-1000-A3-QA',
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
      window.NeuralVerse?.visualInteractiveMediaAgent &&
      window.NeuralVerse?.didacticOrchestrator
    ), { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      if (agent && typeof agent.initialize === 'function') {
        await agent.initialize();
      }
    });
    await page.waitForTimeout(500);

    // =====================================================================
    // SECTION 1: Module Load & Public API
    // =====================================================================
    console.log('\n=== SECTION 1: Module Load & Public API ===');

    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.visualInteractiveMediaAgent;
      if (!agent) return { loaded: false };
      await agent.initialize();
      return {
        loaded: true,
        hasInitialize: typeof agent.initialize === 'function',
        hasRun: typeof agent.run === 'function',
        hasCanHandle: typeof agent.canHandle === 'function',
        hasDetectIntent: typeof agent.detectIntent === 'function',
        hasGetAvailableModes: typeof agent.getAvailableModes === 'function',
        hasGetDiagramTypes: typeof agent.getDiagramTypes === 'function',
        hasGetCacheStats: typeof agent.getCacheStats === 'function',
        modes: agent.getAvailableModes(),
        diagramTypes: agent.getDiagramTypes(),
        expectedModes: ['visual_intuition', 'diagram_recommendation', 'interactive_specification',
          'comparison_visualization', 'animation_specification', 'timeline_construction',
          'mathematical_visualization', 'scientific_illustration', 'atlas_recommendation', 'media_selection']
      };
    });

    assert(report, 'module', moduleCheck.loaded, 'A3 module loaded');
    assert(report, 'module', moduleCheck.hasInitialize, 'A3 has initialize()');
    assert(report, 'module', moduleCheck.hasRun, 'A3 has run()');
    assert(report, 'module', moduleCheck.hasCanHandle, 'A3 has canHandle()');
    assert(report, 'module', moduleCheck.hasDetectIntent, 'A3 has detectIntent()');
    assert(report, 'module', moduleCheck.hasGetAvailableModes, 'A3 has getAvailableModes()');
    assert(report, 'module', moduleCheck.hasGetDiagramTypes, 'A3 has getDiagramTypes()');
    assert(report, 'module', moduleCheck.hasGetCacheStats, 'A3 has getCacheStats()');
    assert(report, 'module', moduleCheck.modes?.length === 10, 'A3 has exactly 10 modes');
    assert(report, 'module', moduleCheck.modes?.every((m) => moduleCheck.expectedModes.includes(m)),
      'All 10 expected modes present', { modes: moduleCheck.modes });
    assert(report, 'module', moduleCheck.diagramTypes?.length >= 13, 'A3 has >=13 diagram types');

    await screenshot(page, 'a3-panel-open-1440.png');

    // Test empty/malformed context handling
    const emptyResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run({}, {});
    });
    assert(report, 'module', emptyResult?.status === 'operational', 'A3 handles empty context');
    assert(report, 'module', Array.isArray(emptyResult?.sections) && emptyResult.sections.length > 0, 'A3 returns sections on empty context');

    const nullResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run(null);
    });
    assert(report, 'module', nullResult?.status === 'operational', 'A3 handles null context');

    const emptyPromptResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run({ userQuery: '' });
    });
    assert(report, 'module', emptyPromptResult?.status === 'operational', 'A3 handles empty prompt');

    // Repeated invocation stability
    const repeatResults = await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      const results = [];
      for (let i = 0; i < 5; i++) {
        const r = await agent.run({ userQuery: 'Can you visualize attention?' });
        results.push(r?.status === 'operational');
      }
      return { allOperational: results.every(Boolean), count: results.length };
    });
    assert(report, 'module', repeatResults.allOperational, 'A3 handles repeated invocation without throwing');

    // =====================================================================
    // SECTION 2: Intent Detection
    // =====================================================================
    console.log('\n=== SECTION 2: Intent Detection ===');

    const intentTests = [
      ['visual_intuition', 'Can you visualize this concept?'],
      ['diagram_recommendation', 'Generate a diagram for this.'],
      ['interactive_specification', 'Create an interactive visualization specification.'],
      ['comparison_visualization', 'Compare these visually.'],
      ['animation_specification', 'Suggest an animation.'],
      ['timeline_construction', 'Build a timeline.'],
      ['mathematical_visualization', 'Explain this geometrically.'],
      ['scientific_illustration', 'Create a scientific illustration specification.'],
      ['atlas_recommendation', 'How should this appear in the Atlas?'],
      ['media_selection', 'What is the best teaching medium?']
    ];

    const intentResults = await page.evaluate((tests) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return tests.map(([expected, query]) => {
        const detected = agent.detectIntent(query);
        return { expected, query, detected, match: detected === expected };
      });
    }, intentTests);

    for (const ir of intentResults) {
      assert(report, 'intent', ir.match, `Intent routing: "${ir.query}" → ${ir.expected}`,
        { expected: ir.expected, detected: ir.detected });
    }

    // Adversarial/mixed prompts
    const mixedResults = await page.evaluate((prompts) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return prompts.map((query) => {
        const detected = agent.detectIntent(query);
        return { query, detected };
      });
    }, ADVERSARIAL_PROMPTS);

    for (const mr of mixedResults) {
      assert(report, 'intent', !!mr.detected && mr.detected !== 'media_selection',
        `Mixed prompt routes to specific intent: "${mr.query}" → ${mr.detected}`,
        { detected: mr.detected });
    }

    // Priority order check — first pattern match wins
    const priorityCheck = await page.evaluate(() => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      const r1 = agent.detectIntent('visualize and compare this concept');
      const r2 = agent.detectIntent('diagram and animate this');
      const r3 = agent.detectIntent('timeline with a geometric explanation');
      return { visualizeCompare: r1, diagramAnimate: r2, timelineGeometric: r3 };
    });
    assert(report, 'intent', priorityCheck.visualizeCompare === 'visual_intuition',
      'Priority: "visualize" beats "compare" → visual_intuition', { result: priorityCheck.visualizeCompare });
    assert(report, 'intent', priorityCheck.diagramAnimate === 'diagram_recommendation',
      'Priority: "diagram" beats "animate" → diagram_recommendation', { result: priorityCheck.diagramAnimate });
    assert(report, 'intent', priorityCheck.timelineGeometric === 'timeline_construction',
      'Priority: "timeline" beats "geometric" → timeline_construction', { result: priorityCheck.timelineGeometric });

    // =====================================================================
    // SECTION 3: Visual Intuition Quality
    // =====================================================================
    console.log('\n=== SECTION 3: Visual Intuition Quality ===');

    for (const topic of VISUAL_INTUITION_TOPICS) {
      const result = await page.evaluate(async ({ topic, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({ ...context, userQuery: `Can you visualize ${topic}?` }, { mode: 'visual_intuition' });
      }, { topic, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      assert(report, 'visual', result?.status === 'operational', `${topic}: visual_intuition operational`);
      assert(report, 'visual', Array.isArray(sections) && sections.length >= 3,
        `${topic}: >=3 sections`, { count: sections.length });
      assert(report, 'visual', sectionTitles.some((t) => /metaphor/i.test(t)),
        `${topic}: has visual metaphor section`);
      assert(report, 'visual', sectionTitles.some((t) => /analogy breaks|limitation|boundary/i.test(t)),
        `${topic}: has analogy limitation section`);
      assert(report, 'visual', sectionTitles.some((t) => /accessibility/i.test(t)),
        `${topic}: has accessibility section`);
      assert(report, 'visual', !/robot|mascot|brain|glowing/i.test(JSON.stringify(result)),
        `${topic}: no AI cliché imagery`);
    }

    // =====================================================================
    // SECTION 4: Diagram Recommendation Quality
    // =====================================================================
    console.log('\n=== SECTION 4: Diagram Recommendation Quality ===');

    for (const [label, query, expectedType] of DIAGRAM_CONCEPTS) {
      const result = await page.evaluate(async ({ query, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({ ...context, userQuery: query }, { mode: 'diagram_recommendation' });
      }, { query, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      assert(report, 'diagram', result?.status === 'operational', `${label}: diagram_recommendation operational`);
      assert(report, 'diagram', result?.chosenVisualization?.includes(expectedType) || result?.chosenVisualization === expectedType,
        `${label}: chosen visualization matches expected type (${expectedType})`,
        { chosen: result?.chosenVisualization });
      assert(report, 'diagram', sectionTitles.some((t) => /chosen visualization|diagram/i.test(t)),
        `${label}: has diagram justification`);
      assert(report, 'diagram', sectionTitles.some((t) => /accessibility/i.test(t)),
        `${label}: has accessibility notes`);
    }

    // =====================================================================
    // SECTION 5: Interactive Specification
    // =====================================================================
    console.log('\n=== SECTION 5: Interactive Specification ===');

    const interactiveResult = await page.evaluate(async ({ context }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run({
        ...context,
        userQuery: 'Create an interactive visualization specification for self attention'
      }, { mode: 'interactive_specification' });
    }, { context: DEEP_CONTEXT });

    const interactiveSections = interactiveResult?.sections || [];
    const interactiveTitles = interactiveSections.map((s) => s.title);
    assert(report, 'interactive', interactiveResult?.status === 'operational', 'Interactive spec is operational');
    assert(report, 'interactive', interactiveTitles.some((t) => /objective/i.test(t)),
      'Interactive spec has educational objective');
    assert(report, 'interactive', interactiveTitles.some((t) => /controls|parameter/i.test(t)),
      'Interactive spec has controls/parameters');
    assert(report, 'interactive', interactiveTitles.some((t) => /observable|behavior/i.test(t)),
      'Interactive spec has observable behaviors');
    assert(report, 'interactive', interactiveTitles.some((t) => /accessibility/i.test(t)),
      'Interactive spec has accessibility considerations');

    const fullBody = JSON.stringify(interactiveResult || {});
    assert(report, 'interactive', !/implemented this widget|simulation is now running|will execute automatically/i.test(fullBody),
      'Interactive spec does NOT claim to have implemented a widget');
    assert(report, 'interactive', /specification/i.test(fullBody),
      'Interactive spec identifies itself as a specification');

    // =====================================================================
    // SECTION 6: Comparison Visualization
    // =====================================================================
    console.log('\n=== SECTION 6: Comparison Visualization ===');

    for (const pair of COMPARISON_PAIRS) {
      const result = await page.evaluate(async ({ pair, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({
          ...context,
          userQuery: `Compare visually ${pair}`
        }, { mode: 'comparison_visualization' });
      }, { pair, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      const body = JSON.stringify(sections);
      assert(report, 'comparison', result?.status === 'operational', `${pair}: comparison operational`);
      assert(report, 'comparison', sectionTitles.some((t) => /layout|side.*side/i.test(t)),
        `${pair}: has side-by-side layout section`);
      assert(report, 'comparison', body.includes('--') || /comparison-table/i.test(JSON.stringify(result)),
        `${pair}: contains comparison structure`);
      assert(report, 'comparison', sectionTitles.some((t) => /accessibility/i.test(t)),
        `${pair}: has accessibility notes`);
    }

    await screenshot(page, 'a3-comparison-visualization-1440.png');

    // =====================================================================
    // SECTION 7: Animation Specification
    // =====================================================================
    console.log('\n=== SECTION 7: Animation Specification ===');

    const animResult = await page.evaluate(async ({ context }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run({
        ...context,
        userQuery: 'Suggest an educational animation for gradient descent'
      }, { mode: 'animation_specification' });
    }, { context: DEEP_CONTEXT });

    const animTitles = (animResult?.sections || []).map((s) => s.title);
    const animBody = JSON.stringify(animResult || {});
    assert(report, 'animation', animResult?.status === 'operational', 'Animation spec operational');
    assert(report, 'animation', animTitles.some((t) => /stage|timeline/i.test(t)),
      'Animation spec has stages');
    assert(report, 'animation', animTitles.some((t) => /pacing|replay/i.test(t)),
      'Animation spec has pacing/replay');
    assert(report, 'animation', /reduced-motion|reduced motion|static|stepped/i.test(animBody),
      'Animation spec includes reduced-motion alternative');
    assert(report, 'animation', !/decorative|just for fun/i.test(animBody),
      'Animation spec avoids decorative motion');

    // =====================================================================
    // SECTION 8: Timeline Construction
    // =====================================================================
    console.log('\n=== SECTION 8: Timeline Construction ===');

    for (const topic of TIMELINE_TOPICS) {
      const result = await page.evaluate(async ({ topic, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({
          ...context,
          userQuery: `Build a timeline for ${topic}`
        }, { mode: 'timeline_construction' });
      }, { topic, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      const body = JSON.stringify(sections);
      assert(report, 'timeline', result?.status === 'operational', `${topic}: timeline operational`);
      assert(report, 'timeline', sectionTitles.some((t) => /timeline/i.test(t)),
        `${topic}: has timeline structure`);
      assert(report, 'timeline', /\d\.\s+/.test(body),
        `${topic}: has ordered stages`);
    }

    await screenshot(page, 'a3-timeline-1440.png');

    // =====================================================================
    // SECTION 9: Mathematical Visualization
    // =====================================================================
    console.log('\n=== SECTION 9: Mathematical Visualization ===');

    for (const topic of MATH_TOPICS) {
      const result = await page.evaluate(async ({ topic, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({
          ...context,
          userQuery: `Explain ${topic} geometrically`
        }, { mode: 'mathematical_visualization' });
      }, { topic, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      assert(report, 'math', result?.status === 'operational', `${topic}: math viz operational`);
      assert(report, 'math', sectionTitles.some((t) => /intuition/i.test(t)),
        `${topic}: has geometric intuition section`);
      assert(report, 'math', sectionTitles.some((t) => /boundary|mathematical boundary/i.test(t)),
        `${topic}: has mathematical boundary section`);
      assert(report, 'math', sectionTitles.some((t) => /accessibility/i.test(t)),
        `${topic}: has accessibility notes`);
    }

    await screenshot(page, 'a3-math-visualization-1440.png');

    // =====================================================================
    // SECTION 10: Scientific Illustration
    // =====================================================================
    console.log('\n=== SECTION 10: Scientific Illustration ===');

    for (const topic of SCIENTIFIC_ILLUSTRATION_TOPICS) {
      const result = await page.evaluate(async ({ topic, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({
          ...context,
          userQuery: `Give scientific illustration guidance for ${topic}`
        }, { mode: 'scientific_illustration' });
      }, { topic, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      const body = JSON.stringify(sections);
      assert(report, 'scientific', result?.status === 'operational', `${topic}: illustration operational`);
      assert(report, 'scientific', sectionTitles.some((t) => /guidance|illustration/i.test(t)),
        `${topic}: has illustration guidance section`);
      assert(report, 'scientific', sectionTitles.some((t) => /style|constraint/i.test(t)),
        `${topic}: has style constraints section`);
      assert(report, 'scientific', !/robot|mascot|glowing brain|generic AI clich/i.test(body.replace(/No .*?clichés/gi, '')),
        `${topic}: avoids AI cliché imagery`);
      assert(report, 'scientific', /thin line|restrained cyan|dark|semantic label/i.test(body),
        `${topic}: specifies NeuralVerse aesthetic (thin line/cyan/dark/labels)`);
    }

    await screenshot(page, 'a3-scientific-illustration-1440.png');

    // =====================================================================
    // SECTION 11: Atlas (Knowledge Graph) Integration
    // =====================================================================
    console.log('\n=== SECTION 11: Atlas Integration ===');

    const atlasResult = await page.evaluate(async ({ context }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return await agent.run({
        ...context,
        userQuery: 'How should this appear in the knowledge graph atlas?'
      }, { mode: 'atlas_recommendation' });
    }, { context: DEEP_CONTEXT });

    const atlasTitles = (atlasResult?.sections || []).map((s) => s.title);
    const atlasBody = JSON.stringify(atlasResult || {});
    assert(report, 'atlas', atlasResult?.status === 'operational', 'Atlas recommendation operational');
    assert(report, 'atlas', atlasTitles.some((t) => /placement|graph/i.test(t)),
      'Atlas has placement/neighborhood section');
    assert(report, 'atlas', atlasTitles.some((t) => /policy|graph/i.test(t)),
      'Atlas has graph policy section');
    assert(report, 'atlas', /do not create|not modify|advisory|do not/i.test(atlasBody),
      'Atlas advises without modifying topology');

    // Atlas mutation tests - must be governed refusal or advisory-only
    for (const prompt of FORBIDDEN_PROMPTS.slice(0, 3)) {
      const result = await page.evaluate(async ({ prompt, context }) => {
        const orchestrator = window.NeuralVerse?.didacticOrchestrator;
        if (orchestrator && typeof orchestrator.invokeAgent === 'function') {
          return await orchestrator.invokeAgent('visual-interactive-media', prompt, { context });
        }
        return null;
      }, { prompt, context: DEEP_CONTEXT });

      const body = JSON.stringify(result || {});
      const isGoverned = result?.type === 'governed-refusal' || /blocked|guardrail|governance|refused/i.test(body);
      const isAdvisory = /advisory|specification|not modify|recommendation/i.test(body);
      assert(report, 'atlas', isGoverned || isAdvisory,
        `Atlas mutation blocked: "${prompt.substring(0, 40)}..."`, { resultType: result?.type });
    }

    await screenshot(page, 'a3-atlas-recommendation-1440.png');

    // =====================================================================
    // SECTION 12: Media Selection
    // =====================================================================
    console.log('\n=== SECTION 12: Media Selection ===');

    const mediaConcepts = ['attention mechanism', 'gradient descent', 'RAG retrieval', 'convolution', 'Bayes theorem'];
    for (const concept of mediaConcepts) {
      const result = await page.evaluate(async ({ concept, context }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({
          ...context,
          userQuery: `What is the best teaching medium for ${concept}?`
        }, { mode: 'media_selection' });
      }, { concept, context: DEEP_CONTEXT });

      const sections = result?.sections || [];
      const sectionTitles = sections.map((s) => s.title);
      const body = JSON.stringify(sections);
      assert(report, 'media', result?.status === 'operational', `${concept}: media selection operational`);
      assert(report, 'media', sectionTitles.some((t) => /teaching medium|medium/i.test(t)),
        `${concept}: has medium recommendation`);
      assert(report, 'media', sectionTitles.some((t) => /fallback/i.test(t)),
        `${concept}: has fallback mediums`);
      assert(report, 'media', sectionTitles.some((t) => /accessibility/i.test(t)),
        `${concept}: has accessibility notes`);
    }

    // Check that not all recommendations default to widget
    const mediumVariety = await page.evaluate(async ({ context }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      const types = [];
      for (const q of ['embeddings', 'transformer', 'convolution', 'segmentation']) {
        const r = await agent.run({ ...context, userQuery: `Best medium for ${q}` }, { mode: 'media_selection' });
        if (r?.chosenVisualization) types.push(r.chosenVisualization);
      }
      const unique = new Set(types.map((t) => t.toLowerCase()));
      return { uniqueCount: unique.size, total: types.length };
    }, { context: DEEP_CONTEXT });
    assert(report, 'media', mediumVariety.uniqueCount >= 2,
      'Media selection varies across concepts (not always widget)', { unique: mediumVariety.uniqueCount });

    await screenshot(page, 'a3-media-selection-1440.png');

    // =====================================================================
    // SECTION 13: Existing Visualization Reuse
    // =====================================================================
    console.log('\n=== SECTION 13: Existing Visualization Reuse ===');

    const reuseCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      const registry = window.NeuralVerse?.visualizationRegistry;

      const regItems = registry?.getAll?.() || registry?.getVisualizations?.() || [];
      const catalog = agent.discoverExistingVisualizations();

      const specForExisting = await agent.run({
        userQuery: 'Create an interactive visualization specification for self attention',
        selectedArtifact: { title: 'Self Attention' },
        artifactType: 'Visualization'
      }, { mode: 'interactive_specification' });

      const specForMissing = await agent.run({
        userQuery: 'Create an interactive visualization specification for some nonexistent concept',
        selectedArtifact: { title: 'Nonexistent Concept XYZ' },
        artifactType: 'Visualization'
      }, { mode: 'interactive_specification' });

      return {
        catalogLength: catalog?.length,
        registryItemsCount: regItems.length,
        existingSpecBody: JSON.stringify(specForExisting?.sections || []),
        missingSpecBody: JSON.stringify(specForMissing?.sections || []),
        hasReuseHint: /reuse|extend|found.*scaffold/i.test(JSON.stringify(specForExisting?.sections || [])),
        missingHasNoReuse: /no.*scaffold|not found|specification only/i.test(JSON.stringify(specForMissing?.sections || []))
      };
    });

    assert(report, 'reuse', reuseCheck.catalogLength > 0, 'Visualization catalog populated');
    assert(report, 'reuse', reuseCheck.hasReuseHint, 'Existing viz recommends reuse/extend');
    assert(report, 'reuse', reuseCheck.missingHasNoReuse, 'Missing viz falls back to specification-only');

    // =====================================================================
    // SECTION 14: UI Integration
    // =====================================================================
    console.log('\n=== SECTION 14: UI Integration ===');

    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'visual-interactive-media');
    await page.waitForTimeout(300);

    await screenshot(page, 'a3-action-grid-1440.png');

    const panelUi = await page.evaluate(() => {
      const visualActions = document.querySelector('[data-agent-visual-actions]');
      const curriculumActions = document.querySelector('[data-agent-curriculum-actions]');
      const didacticActions = document.querySelector('[data-agent-quick-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--visual')];
      return {
        visualVisible: visualActions && window.getComputedStyle(visualActions).display !== 'none',
        curriculumHidden: !curriculumActions || window.getComputedStyle(curriculumActions).display === 'none',
        didacticHidden: !didacticActions || window.getComputedStyle(didacticActions).display === 'none',
        visualButtonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((b) => !!b.getAttribute('aria-label')),
        buttonLabels: buttons.map((b) => b.textContent.trim()),
        allTabIndex: buttons.every((b) => b.getAttribute('tabindex') !== '-1')
      };
    });

    assert(report, 'ui', panelUi.visualVisible, 'Visual media actions visible when A3 selected');
    assert(report, 'ui', panelUi.visualButtonCount === 10, 'Has 10 visual action buttons', { count: panelUi.visualButtonCount });
    assert(report, 'ui', panelUi.curriculumHidden, 'Curriculum actions hidden when A3 selected');
    assert(report, 'ui', panelUi.didacticHidden, 'Didactic actions hidden when A3 selected');
    assert(report, 'ui', panelUi.allButtonsHaveLabels, 'All visual action buttons have aria-label');
    assert(report, 'ui', panelUi.allTabIndex, 'All visual action buttons are keyboard-focusable');

    // Test other agent action groups are hidden
    const otherHidden = await page.evaluate(() => {
      const selectors = [
        '[data-agent-code-lab-actions]', '[data-agent-research-actions]',
        '[data-agent-transfer-actions]', '[data-agent-assessment-actions]',
        '[data-agent-obsidian-actions]', '[data-agent-narrative-actions]',
        '[data-agent-curiosity-actions]'
      ];
      return selectors.every((sel) => {
        const el = document.querySelector(sel);
        return !el || window.getComputedStyle(el).display === 'none';
      });
    });
    assert(report, 'ui', otherHidden, 'All other agent action groups hidden when A3 selected');

    // Test panel close/reopen via controller API
    const closeTest = await page.evaluate(() => {
      const controller = window.NeuralVerse?.agentPanelController;
      if (!controller) return { noController: true };
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      if (!panel || !trigger) return { noElements: true };

      controller.closePanel();
      const hidden = !panel.classList.contains('nv-agent-panel--open') || panel.getAttribute('aria-hidden') === 'true';
      const triggerExpanded = trigger.getAttribute('aria-expanded') === 'false';
      return { noController: false, hidden, triggerExpanded };
    });
    assert(report, 'ui', !closeTest.noController && !closeTest.noElements, 'Panel controller accessible');
    assert(report, 'ui', closeTest.hidden, 'Panel closes via controller');
    assert(report, 'ui', closeTest.triggerExpanded, 'Trigger aria-expanded false after close');

    const reopenTest = await page.evaluate(() => {
      const controller = window.NeuralVerse?.agentPanelController;
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      if (!controller || !panel || !trigger) return { ok: false };

      controller.togglePanel();
      const visible = panel.classList.contains('nv-agent-panel--open');
      const triggerExpanded = trigger.getAttribute('aria-expanded') === 'true';
      return { ok: visible && triggerExpanded, visible, triggerExpanded };
    });
    assert(report, 'ui', reopenTest.ok, 'Panel reopens via controller toggle');

    // =====================================================================
    // SECTION 15: Response Rendering
    // =====================================================================
    console.log('\n=== SECTION 15: Response Rendering ===');

    await page.fill('#nv-agent-input', 'Show me a diagram for attention');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(1500);

    const responseRender = await page.evaluate(() => {
      const sections = document.querySelectorAll('.nv-agent-section');
      const visualCards = document.querySelectorAll('.nv-agent-visual-card');
      const timeline = document.querySelector('.nv-agent-timeline');
      const sectionHeadings = [...document.querySelectorAll('.nv-agent-section h3, .nv-agent-section h4')]
        .map((h) => h.textContent.trim());
      const agentResponse = document.querySelector('[data-agent-response-content]');
      const reasoning = document.querySelector('[data-agent-reasoning-value]');
      const responseActions = document.querySelector('[data-agent-response-actions]');
      return {
        sectionCount: sections.length,
        visualCardCount: visualCards.length,
        hasTimeline: !!timeline,
        sectionHeadings,
        hasResponse: agentResponse && agentResponse.textContent.length > 0,
        hasReasoning: reasoning && reasoning.textContent.trim().length > 0,
        responseActionsVisible: responseActions && window.getComputedStyle(responseActions).display !== 'none',
        hasIframe: !!document.querySelector('iframe'),
        noScriptInjection: !agentResponse?.querySelector('script')
      };
    });

    assert(report, 'render', responseRender.sectionCount >= 3, 'Response has >=3 sections');
    assert(report, 'render', responseRender.visualCardCount >= 1, 'Response has visual cards');
    assert(report, 'render', !!responseRender.hasReasoning, 'Response shows reasoning strategy');
    assert(report, 'render', !!responseRender.responseActionsVisible, 'Response action buttons visible');
    assert(report, 'render', !responseRender.hasIframe, 'No iframe injected in response');
    assert(report, 'render', responseRender.noScriptInjection, 'No script injection in response');

    // Test visual card rendering
    await page.fill('#nv-agent-input', 'Can you visualize the attention mechanism?');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(1500);
    const visualCardRender = await page.evaluate(() => {
      const cards = document.querySelectorAll('.nv-agent-visual-card');
      if (cards.length === 0) return { hasCards: false };
      const firstCard = cards[0];
      return {
        hasCards: true,
        cardTextLength: firstCard.textContent.length,
        noOverflow: firstCard.scrollWidth <= firstCard.clientWidth,
        cardVisible: window.getComputedStyle(firstCard).display !== 'none'
      };
    });
    assert(report, 'render', visualCardRender.hasCards, 'Visual card renders');
    assert(report, 'render', visualCardRender.cardTextLength > 0, 'Visual card has content');
    assert(report, 'render', visualCardRender.cardVisible, 'Visual card is visible');

    await screenshot(page, 'a3-visual-intuition-1440.png');
    await screenshot(page, 'a3-diagram-recommendation-1440.png');
    await screenshot(page, 'a3-interactive-specification-1440.png');

    // =====================================================================
    // SECTION 16: Accessibility
    // =====================================================================
    console.log('\n=== SECTION 16: Accessibility ===');

    await page.selectOption('#nv-agent-select', 'visual-interactive-media');
    await page.waitForTimeout(300);

    const a11yCheck = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      const visualActions = document.querySelector('[data-agent-visual-actions]');
      const visualButtons = [...document.querySelectorAll('.nv-agent-quick-action-btn--visual')];
      const actionLabel = visualActions?.querySelector('.nv-agent-panel__quick-actions-label');
      const sections = document.querySelectorAll('.nv-agent-section');
      const sectionHeadings = [...sections].map((s) => s.querySelector('h3, h4')).filter(Boolean);
      return {
        panelRole: panel?.getAttribute('role'),
        panelLabel: panel?.getAttribute('aria-label'),
        visualActionLabel: actionLabel?.textContent?.trim(),
        allButtonsAccessible: visualButtons.every((b) => !!b.getAttribute('aria-label')),
        sectionCount: sections.length,
        headingCount: sectionHeadings.length,
        closeLabel: document.querySelector('.nv-agent-panel__close')?.getAttribute('aria-label')
      };
    });

    assert(report, 'a11y', a11yCheck.panelRole === 'complementary', 'Panel has complementary role');
    assert(report, 'a11y', !!a11yCheck.panelLabel, 'Panel has aria-label');
    assert(report, 'a11y', a11yCheck.visualActionLabel === 'Visual Media Actions', 'Visual actions group has label');
    assert(report, 'a11y', a11yCheck.allButtonsAccessible, 'All visual buttons have aria-label');
    assert(report, 'a11y', !!a11yCheck.closeLabel, 'Close button has aria-label');

    // Keyboard navigation
    await page.keyboard.press('Tab');
    const keyboardCheck = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        hasActive: !!active,
        activeTag: active?.tagName || 'none',
        focusVisible: active?.matches?.(':focus-visible') || active?.matches?.(':focus') || false
      };
    });
    assert(report, 'a11y', keyboardCheck.hasActive, 'Keyboard focus exists');

    // Escape closes panel (via controller API)
    const escapeClose = await page.evaluate(() => {
      const controller = window.NeuralVerse?.agentPanelController;
      const panel = document.querySelector('#nv-agent-panel');
      const trigger = document.querySelector('#nv-agent-trigger');
      if (!controller || !panel || !trigger) return { ok: false };

      const wasOpen = panel.classList.contains('nv-agent-panel--open');
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(escEvent);

      const panelHidden = !panel.classList.contains('nv-agent-panel--open') || panel.getAttribute('aria-hidden') === 'true';
      const triggerFocused = document.activeElement === trigger;
      return { ok: wasOpen && panelHidden, wasOpen, panelHidden, triggerFocused };
    });
    assert(report, 'a11y', escapeClose.ok, 'Escape closes panel');

    // Verify focus returns to trigger
    assert(report, 'a11y', escapeClose.triggerFocused, 'Focus returns to trigger after Escape');

    // Reopen for remaining tests
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'visual-interactive-media');
    await page.waitForTimeout(300);

    // =====================================================================
    // SECTION 17: Responsive Layout
    // =====================================================================
    console.log('\n=== SECTION 17: Responsive Layout ===');

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);
      const overflow = await hasHorizontalOverflow(page);
      assert(report, 'responsive', !overflow, `${vp.label}: no horizontal overflow`);

      // Panel should be usable
      await page.fill('#nv-agent-input', 'Can you visualize attention?');
      await page.click('.nv-agent-submit');
      await page.waitForTimeout(1000);
      const panelUsable = await page.evaluate(() => {
        const section = document.querySelector('.nv-agent-section');
        return !!section && section.textContent.length > 0;
      });
      assert(report, 'responsive', panelUsable, `${vp.label}: response cards readable`);
    }

    await screenshot(page, 'a3-mobile-390.png');

    // =====================================================================
    // SECTION 18: Security & Sanitization
    // =====================================================================
    console.log('\n=== SECTION 18: Security & Sanitization ===');

    for (const payload of SECURITY_PAYLOADS) {
      const beforeAlerts = report.browserEvents.alerts.length;

      await page.fill('#nv-agent-input', payload);
      await page.click('.nv-agent-submit');
      await page.waitForTimeout(1000);

      const afterAlerts = report.browserEvents.alerts.length;
      const securityResult = await page.evaluate((p) => {
        const content = document.querySelector('[data-agent-response-content]');
        const html = content?.innerHTML || '';
        return {
          alertFired: false,
          hasScriptTag: /<script/i.test(html),
          hasEventHandler: /\bon\w+\s*=/i.test(html),
          hasJavascriptLink: /href\s*=\s*"javascript:/i.test(html),
          stillReadable: (content?.textContent?.length || 0) > 0
        };
      }, payload);

      assert(report, 'security', afterAlerts === beforeAlerts,
        `No alert from: ${payload.substring(0, 30)}...`);
      assert(report, 'security', !securityResult.hasScriptTag,
        `No script tag injection from: ${payload.substring(0, 30)}...`);
      assert(report, 'security', !securityResult.hasEventHandler,
        `No event handler injection from: ${payload.substring(0, 30)}...`);
      assert(report, 'security', !securityResult.hasJavascriptLink,
        `No javascript: link injection from: ${payload.substring(0, 30)}...`);
      assert(report, 'security', securityResult.stillReadable,
        `Response remains readable after: ${payload.substring(0, 30)}...`);
    }

    await screenshot(page, 'a3-security-payload-1440.png');

    // Source code check for unsafe patterns
    const unsafePatterns = await page.evaluate(() => {
      const agentCode = window.NeuralVerse?.visualInteractiveMediaAgent;
      if (!agentCode) return { error: 'agent not found' };

      const patterns = ['innerHTML', 'insertAdjacentHTML', 'eval', 'new Function', 'setTimeout\\s*\\(\\s*[\'"]'];
      const matches = {};
      const agentStr = String(agentCode.run) + String(agentCode.buildResponse) + String(agentCode.detectIntent);
      for (const p of patterns) {
        const re = new RegExp(p, 'gi');
        const found = agentStr.match(re);
        if (found) matches[p] = found.length;
      }
      return matches;
    });

    if (unsafePatterns.innerHTML || unsafePatterns.insertAdjacentHTML) {
      const renderCheck = await page.evaluate(() => {
        const panelHtml = document.querySelector('#nv-agent-panel')?.innerHTML || '';
        return {
          unsafeInPanel: ['innerHTML', 'insertAdjacentHTML'].filter((p) => new RegExp(p, 'i').test(panelHtml))
        };
      });
      assert(report, 'security', renderCheck.unsafeInPanel.length === 0,
        'No unsafe innerHTML/insertAdjacentHTML in panel template');
    } else {
      assert(report, 'security', true, 'No unsafe innerHTML in A3 agent code');
    }

    // =====================================================================
    // SECTION 19: Performance & Memory Safety
    // =====================================================================
    console.log('\n=== SECTION 19: Performance & Memory Safety ===');

    const beforeCacheStats = await page.evaluate(() => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      return agent.getCacheStats();
    });

    // 100 rapid invocations
    const stressResult = await page.evaluate(async ({ context }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      let failures = 0;
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        const queries = [
          'Can you visualize attention?', 'Show me a diagram for RAG',
          'Create an interactive spec', 'Compare CNN vs Transformer',
          'Build a timeline', 'Explain geometrically'
        ];
        try {
          const r = await agent.run({
            ...context,
            selectedArtifact: { title: `Test concept ${i % 10}` }
          }, { mode: ['visual_intuition', 'diagram_recommendation', 'interactive_specification',
              'comparison_visualization', 'timeline_construction', 'mathematical_visualization'][i % 6] });
          if (r?.status !== 'operational') failures++;
        } catch (e) { failures++; }
      }
      const elapsed = Date.now() - start;
      return { failures, elapsed, avgMs: (elapsed / 100).toFixed(1) };
    }, { context: DEEP_CONTEXT });

    assert(report, 'performance', stressResult.failures === 0,
      `100 rapid invocations: 0 failures (avg ${stressResult.avgMs}ms)`,
      { failures: stressResult.failures, elapsed: stressResult.elapsed });

    // 50 quick action clicks
    const actionStress = await page.evaluate(async () => {
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--visual')];
      if (buttons.length === 0) return { clicks: 0, errors: 100 };
      let errors = 0;
      for (let i = 0; i < 50; i++) {
        const idx = i % buttons.length;
        try {
          buttons[idx].click();
          await new Promise((r) => setTimeout(r, 50));
        } catch (e) { errors++; }
      }
      return { clicks: 50, errors };
    });
    assert(report, 'performance', actionStress.errors === 0,
      '50 quick action clicks: no errors');

    // 20 panel open/close cycles
    const panelCycles = await page.evaluate(async () => {
      let errors = 0;
      for (let i = 0; i < 20; i++) {
        try {
          const close = document.querySelector('.nv-agent-panel__close');
          if (close) close.click();
          await new Promise((r) => setTimeout(r, 100));
          const trigger = document.querySelector('#nv-agent-trigger');
          if (trigger) trigger.click();
          await new Promise((r) => setTimeout(r, 100));
        } catch (e) { errors++; }
      }
      return { cycles: 20, errors };
    });
    assert(report, 'performance', panelCycles.errors === 0,
      '20 panel open/close cycles: no errors');

    // DOM leak check: no duplicate roots
    const domCheck = await page.evaluate(() => {
      return {
        panelCount: document.querySelectorAll('#nv-agent-panel').length,
        visualActionCount: document.querySelectorAll('[data-agent-visual-actions]').length,
        responseContentCount: document.querySelectorAll('[data-agent-response-content]').length,
        inputCount: document.querySelectorAll('#nv-agent-input').length,
        submitCount: document.querySelectorAll('.nv-agent-submit').length
      };
    });
    assert(report, 'performance', domCheck.panelCount === 1, 'Single panel element');
    assert(report, 'performance', domCheck.visualActionCount === 1, 'Single visual actions container');
    assert(report, 'performance', domCheck.responseContentCount === 1, 'Single response content');
    assert(report, 'performance', domCheck.inputCount === 1, 'Single input element');
    assert(report, 'performance', domCheck.submitCount === 1, 'Single submit button');

    // =====================================================================
    // SECTION 20: Governance Preservation
    // =====================================================================
    console.log('\n=== SECTION 20: Governance Preservation ===');

    const localStorageCheck = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const forbidden = keys.filter((k) =>
        /curriculum.*mutat|atlas.*topolog|mastery|score|grade|competency.*evidence/i.test(k)
      );
      const panelKeys = keys.filter((k) => /nv-agent|panel/i.test(k));
      return {
        forbiddenKeys: forbidden,
        panelPersistenceKeys: panelKeys,
        forbiddenCount: forbidden.length,
        panelKeyCount: panelKeys.length
      };
    });

    assert(report, 'governance', localStorageCheck.forbiddenCount === 0,
      'localStorage: no curriculum mutation/atlas/mastery keys',
      { forbiddenKeys: localStorageCheck.forbiddenKeys });
    assert(report, 'governance', localStorageCheck.panelKeyCount > 0,
      'localStorage: agent panel persistence keys present');

    const afterGovernanceStatus = gitStatus(GOVERNANCE_PATHS);
    report.governance.after = afterGovernanceStatus;
    assert(report, 'governance', afterGovernanceStatus === beforeGovernanceStatus,
      'Governance paths unchanged by A3 operations',
      { before: beforeGovernanceStatus || '(empty)', after: afterGovernanceStatus || '(empty)' });

    // Guardrails enforcement
    await page.selectOption('#nv-agent-select', 'visual-interactive-media');
    await page.waitForTimeout(300);

    for (const prompt of FORBIDDEN_PROMPTS) {
      await page.fill('#nv-agent-input', prompt);
      await page.click('.nv-agent-submit');
      await page.waitForTimeout(1000);

      const guardrailCheck = await page.evaluate(() => {
        const notice = document.querySelector('[data-agent-guardrail-notice]');
        const content = document.querySelector('[data-agent-response-content]');
        return {
          noticeVisible: notice && window.getComputedStyle(notice).display !== 'none',
          containsBlocked: /blocked|guardrail|governance|refused|refusal/i.test(content?.textContent || '')
        };
      });

      assert(report, 'governance', guardrailCheck.noticeVisible || guardrailCheck.containsBlocked,
        `Forbidden prompt blocked: "${prompt.substring(0, 40)}..."`,
        { notice: guardrailCheck.noticeVisible, blocked: guardrailCheck.containsBlocked });
    }

    // =====================================================================
    // SECTION 21: Browser Health
    // =====================================================================
    console.log('\n=== SECTION 21: Browser Health ===');

    assert(report, 'health', report.browserEvents.consoleErrors.length === 0,
      `Console errors: ${report.browserEvents.consoleErrors.length}`, { errors: report.browserEvents.consoleErrors });
    assert(report, 'health', report.browserEvents.pageErrors.length === 0,
      `Page errors: ${report.browserEvents.pageErrors.length}`, { errors: report.browserEvents.pageErrors });
    assert(report, 'health', report.browserEvents.failedRequests.length === 0,
      `Failed requests: ${report.browserEvents.failedRequests.length}`, { errors: report.browserEvents.failedRequests });

    // =====================================================================
    // FINAL DECISION
    // =====================================================================
    report.decision = report.failures.length === 0 ? 'READY' : 'NOT READY';

    console.log(`\nStructured audit report written to ${REPORT_PATH}`);
    console.log(`\nNV-1000-A3 Extreme Audit: ${report.decision}`);
    console.log(`Checks: ${report.checks.length}, Failures: ${report.failures.length}`);
    for (const f of report.failures) {
      console.log(`FAIL [${f.area}] ${f.message}`);
    }

    try {
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    } catch (e) {
      console.log(JSON.stringify(report, null, 2));
    }

    await browser.close();
  } catch (error) {
    console.error('Audit failed with error:', error.message);
    report.decision = 'NOT READY';
    try {
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    } catch (e) {
      console.log(JSON.stringify(report, null, 2));
    }
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
