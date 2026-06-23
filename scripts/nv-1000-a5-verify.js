#!/usr/bin/env node
/** NV-1000-A5 Verification Script */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a5-verify';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown' };

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

(async () => {
  const passed = [];
  const failed = [];
  let server;
  function check(label, condition) {
    if (condition) { passed.push(label); console.log(`  ✓ ${label}`); }
    else { failed.push(label); console.log(`  ✗ ${label}`); }
  }

  try {
    server = http.createServer(serveFile);
    await new Promise((resolve) => server.listen(8095, '127.0.0.1', resolve));
    console.log('Server running at http://127.0.0.1:8095/\n');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });

    await page.goto('http://127.0.0.1:8095/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const baseContext = {
      userQuery: 'Connect query routing to research',
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
      selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Dynamic Routing Mechanisms' },
      artifactType: 'Explanatory Text',
      currentRoute: '#/learning/path-advanced-rag-foundations/module/advanced-retrieval-pipelines/lesson/query-routing'
    };

    console.log('--- Test 1: Agent Module Loaded ---');
    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.researchStateOfArtAgent;
      if (!agent) return { loaded: false };
      await agent.initialize();
      return {
        loaded: true,
        hasInitialize: typeof agent.initialize === 'function',
        hasRun: typeof agent.run === 'function',
        hasCanHandle: typeof agent.canHandle === 'function',
        hasDetectIntent: typeof agent.detectIntent === 'function',
        hasModes: typeof agent.getAvailableModes === 'function',
        hasConfidence: typeof agent.getConfidenceLevels === 'function',
        hasCache: typeof agent.getCacheStats === 'function',
        modes: agent.getAvailableModes(),
        confidence: agent.getConfidenceLevels()
      };
    });
    check('researchStateOfArtAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has canHandle function', moduleCheck.hasCanHandle);
    check('Has detectIntent function', moduleCheck.hasDetectIntent);
    check('Has getAvailableModes function', moduleCheck.hasModes);
    check('Has getConfidenceLevels function', moduleCheck.hasConfidence);
    check('Has getCacheStats function', moduleCheck.hasCache);
    check('Has 10 research modes', moduleCheck.modes?.length === 10);
    check('Has confidence taxonomy', ['Established', 'Emerging', 'Experimental', 'Speculative'].every((x) => moduleCheck.confidence?.includes(x)));

    console.log('\n--- Test 2: Agent Modes ---');
    const modeQueries = [
      ['historical_context', 'Give historical context for attention'],
      ['landmark_papers', 'What are landmark papers behind attention?'],
      ['benchmark_landscape', 'What benchmarks are used for retrieval?'],
      ['research_trends', 'What are research trends in RAG?'],
      ['open_problems', 'What open problems remain?'],
      ['method_comparison', 'Compare dense retrieval vs sparse retrieval'],
      ['reading_roadmap', 'What should I read after mastering this lesson?'],
      ['frontier_topics', 'What frontier topics connect here?'],
      ['evidence_confidence', 'How mature is the evidence?'],
      ['curriculum_bridge', 'Connect this to research']
    ];
    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.researchStateOfArtAgent;
        return await agent.run({ ...baseContext, userQuery: query }, { mode });
      }, { mode, query, baseContext });
      check(`${mode}: operational`, result?.status === 'operational');
      check(`${mode}: returns sections`, Array.isArray(result?.sections) && result.sections.length >= 6);
      check(`${mode}: has Research Scope`, result?.sections?.some((s) => s.title === 'Research Scope'));
      check(`${mode}: has Confidence Level`, result?.sections?.some((s) => s.title === 'Confidence Level'));
      check(`${mode}: has Known Limitations`, result?.sections?.some((s) => s.title === 'Known Limitations'));
      check(`${mode}: has Follow-up Reading`, result?.sections?.some((s) => s.title === 'Suggested Follow-up Reading'));
    }

    console.log('\n--- Test 3: Research Integrity ---');
    const integrity = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.researchStateOfArtAgent;
      const papers = await agent.run({ ...baseContext, userQuery: 'landmark papers attention' }, { mode: 'landmark_papers' });
      const benchmarks = await agent.run({ ...baseContext, userQuery: 'benchmark landscape retrieval rag' }, { mode: 'benchmark_landscape' });
      const frontier = await agent.run({ ...baseContext, userQuery: 'frontier future speculative topics' }, { mode: 'frontier_topics' });
      return { papers, benchmarks, frontier, cache: agent.getCacheStats() };
    }, { baseContext });
    check('Landmark response includes curated known paper', JSON.stringify(integrity.papers).includes('Attention Is All You Need'));
    check('Landmark response includes citation boundary', JSON.stringify(integrity.papers).includes('avoids fabricating'));
    check('Benchmark response avoids scores', !/\b\d+\.\d+\b/.test(JSON.stringify(integrity.benchmarks)));
    check('Benchmark response includes interpretation rule', JSON.stringify(integrity.benchmarks).includes('No benchmark scores'));
    check('Frontier response is experimental', integrity.frontier.confidenceLevel === 'Experimental');
    check('Cache records entries', integrity.cache.entries >= 3);

    console.log('\n--- Test 4: Orchestrator Integration ---');
    const orchResult = await page.evaluate(async ({ baseContext }) => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      return await orchestrator.invokeAgent('research-state-of-art', 'Connect retrieval to research', { context: baseContext });
    }, { baseContext });
    check('Orchestrator invokes A5 agent', orchResult?.agentId === 'research-state-of-art');
    check('Orchestrator returns research sections', orchResult?.sections?.length >= 6);

    console.log('\n--- Test 5: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'research-state-of-art');
    await page.waitForTimeout(300);
    const panelUi = await page.evaluate(() => {
      const researchActions = document.querySelector('[data-agent-research-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--research')];
      return {
        researchVisible: researchActions && researchActions.style.display !== 'none',
        buttonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((button) => !!button.getAttribute('aria-label')),
        otherActionsHidden: ['[data-agent-code-lab-actions]', '[data-agent-visual-actions]', '[data-agent-curriculum-actions]', '[data-agent-quick-actions]'].every((sel) => document.querySelector(sel)?.style.display === 'none')
      };
    });
    check('Research actions visible when A5 selected', panelUi.researchVisible);
    check('Has 10 research action buttons', panelUi.buttonCount === 10);
    check('Research action buttons have labels', panelUi.allButtonsHaveLabels);
    check('Other action groups hidden', panelUi.otherActionsHidden);

    console.log('\n--- Test 6: Panel Research Cards ---');
    await page.fill('#nv-agent-input', 'What are landmark papers behind attention?');
    await page.dispatchEvent('#nv-agent-input', 'input');
    await page.waitForFunction(() => !document.querySelector('.nv-agent-submit')?.disabled, null, { timeout: 3000 });
    await page.click('.nv-agent-submit');
    await page.waitForFunction(() => document.querySelectorAll('.nv-agent-section').length > 0, null, { timeout: 5000 }).catch(() => {});
    const responseUi = await page.evaluate(() => ({
      hasSections: document.querySelectorAll('.nv-agent-section').length > 0,
      hasResearchCard: document.querySelectorAll('.nv-agent-research-card').length > 0,
      hasConfidenceBadge: document.querySelectorAll('.nv-agent-confidence-badge').length > 0,
      hasTable: document.querySelectorAll('.nv-agent-table').length > 0,
      hasReasoning: !!document.querySelector('[data-agent-reasoning-value]')?.textContent?.trim()
    }));
    check('Panel renders structured sections', responseUi.hasSections);
    check('Panel renders research cards', responseUi.hasResearchCard);
    check('Panel renders confidence badges', responseUi.hasConfidenceBadge);
    check('Panel renders accessible research table', responseUi.hasTable);
    check('Panel shows reasoning strategy', responseUi.hasReasoning);

    console.log('\n--- Test 7: Keyboard & Responsive ---');
    await page.keyboard.press('Tab');
    const keyboardCheck = await page.evaluate(() => ({
      panelRole: document.querySelector('#nv-agent-panel')?.getAttribute('role'),
      panelLabel: document.querySelector('#nv-agent-panel')?.getAttribute('aria-label'),
      focusedElementExists: !!document.activeElement
    }));
    check('Panel has complementary role', keyboardCheck.panelRole === 'complementary');
    check('Panel has accessible label', !!keyboardCheck.panelLabel);
    check('Keyboard focus remains valid', keyboardCheck.focusedElementExists);
    for (const [label, width, height] of [['mobile-390', 390, 844], ['tablet-768', 768, 1024], ['desktop-1024', 1024, 768], ['desktop-1440', 1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      check(`${label}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    }

    console.log('\n--- Test 8: Preservation ---');
    const preservation = await page.evaluate(async () => {
      const registry = window.NeuralVerse?.agentRegistry;
      const resp = await fetch('data/curriculum-index.json');
      const data = await resp.json();
      return { registryCount: registry?.getAgentIds?.().length, a5Status: registry?.getAgentStatus?.('research-state-of-art'), learningPaths: data.counts?.learningPaths, modules: data.counts?.modules, lessons: data.counts?.lessons, artifacts: data.counts?.artifacts };
    });
    check('Registry remains 10 canonical agents', preservation.registryCount === 10);
    check('A5 registry lifecycle remains scaffolded', preservation.a5Status === 'scaffolded');
    check('Curriculum index unchanged: 19 paths', preservation.learningPaths === 19);
    check('Curriculum index unchanged: 40 modules', preservation.modules === 40);
    check('Curriculum index unchanged: 120 lessons', preservation.lessons === 120);
    check('Curriculum index unchanged: 600 artifacts', preservation.artifacts === 600);

    console.log('\n--- Test 9: Runtime Errors ---');
    check(`console.error count: ${consoleErrors.length}`, consoleErrors.length === 0);
    check(`pageerror count: ${pageErrors.length}`, pageErrors.length === 0);
    check(`failed request count: ${failedRequests.length}`, failedRequests.length === 0);

    console.log('\n=== Verification Summary ===');
    console.log(`Total checks: ${passed.length + failed.length}`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);
    const decision = failed.length === 0 ? 'READY' : 'NOT READY';
    console.log(`\nNV-1000-A5 Decision: ${decision}`);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a5-results.json'), JSON.stringify({ passed, failed, decision, consoleErrors, pageErrors, failedRequests }, null, 2));
    await browser.close();
  } catch (error) {
    console.error('Verification failed with error:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
})();
