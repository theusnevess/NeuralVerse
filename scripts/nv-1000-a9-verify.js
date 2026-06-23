#!/usr/bin/env node
/** NV-1000-A9 Verification Script */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a9-verify';
if (!fs.existsSync(OUTPUT_DIR)) {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  } catch(e) {}
}

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
    await new Promise((resolve) => server.listen(8099, '127.0.0.1', resolve));
    console.log('Server running at http://127.0.0.1:8099/\n');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.stack || error.message));
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });

    await page.goto('http://127.0.0.1:8099/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const baseContext = {
      userQuery: 'Tell the origin story for this concept',
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
      selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Dynamic Routing Mechanisms' },
      artifactType: 'Explanatory Text',
      currentRoute: '#/learning/path-advanced-rag-foundations/module/advanced-retrieval-pipelines/lesson/query-routing'
    };

    console.log('--- Test 1: Agent Module Loaded ---');
    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.storytellingLearningJourneyAgent;
      if (!agent) return { loaded: false };
      await agent.initialize();
      return {
        loaded: true,
        hasInitialize: typeof agent.initialize === 'function',
        hasRun: typeof agent.run === 'function',
        hasCanHandle: typeof agent.canHandle === 'function',
        hasDetectIntent: typeof agent.detectIntent === 'function',
        hasModes: typeof agent.getAvailableModes === 'function',
        hasCache: typeof agent.getCacheStats === 'function',
        modes: agent.getAvailableModes()
      };
    });
    check('storytellingLearningJourneyAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has canHandle function', moduleCheck.hasCanHandle);
    check('Has detectIntent function', moduleCheck.hasDetectIntent);
    check('Has getAvailableModes function', moduleCheck.hasModes);
    check('Has getCacheStats function', moduleCheck.hasCache);
    check('Has 10 storytelling modes', moduleCheck.modes?.length === 10);

    console.log('\n--- Test 2: Agent Modes ---');
    const modeQueries = [
      ['origin_story', 'Tell the origin story for this concept'],
      ['learning_journey', 'Explain the learning journey for this concept'],
      ['problem_driven', 'Frame the engineering or scientific problem for this concept'],
      ['concept_timeline', 'Build concept timeline for this concept'],
      ['human_perspective', 'Provide human perspective for this concept'],
      ['cross_lesson', 'Connect previous lessons for this concept'],
      ['mental_model', 'Build mental model for this concept'],
      ['scientific_journey', 'Explain scientific evolution for this concept'],
      ['motivation_relevance', 'Explain why this matters'],
      ['personalized_orientation', 'Orient my next learning steps for this concept']
    ];
    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.storytellingLearningJourneyAgent;
        return await agent.run({ ...baseContext, userQuery: query }, { mode });
      }, { mode, query, baseContext });
      check(`${mode}: operational`, result?.status === 'operational');
      check(`${mode}: returns sections`, Array.isArray(result?.sections) && result.sections.length >= 6);
      check(`${mode}: has Narrative Objective`, result?.sections?.some((s) => s.title === 'Narrative Objective'));
      check(`${mode}: has Historical/Factual Basis`, result?.sections?.some((s) => s.title === 'Historical/Factual Basis'));
      check(`${mode}: has Metaphorical Elements`, result?.sections?.some((s) => s.title === 'Metaphorical Elements'));
      check(`${mode}: has Limitations`, result?.sections?.some((s) => s.title === 'Limitations'));
      check(`${mode}: has Suggested Follow-up Topic`, result?.sections?.some((s) => s.title === 'Suggested Follow-up Topic'));
    }

    console.log('\n--- Test 3: Governance Compliance (No fabricated claims or mastery estimation) ---');
    const hasEstimationOrGrade = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.storytellingLearningJourneyAgent;
      const res = await agent.run({ ...baseContext, userQuery: 'Rate my mastery' }, { mode: 'personalized_orientation' });
      const str = JSON.stringify(res).toLowerCase();
      return ['grade', 'graded', 'score', 'scores', 'mastery', 'evaluated', 'readiness'].some((word) => str.includes(word));
    }, { baseContext });
    check('Does not estimate mastery or readiness levels', !hasEstimationOrGrade);

    console.log('\n--- Test 4: Orchestrator Integration ---');
    const orchResult = await page.evaluate(async ({ baseContext }) => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      return await orchestrator.invokeAgent('storytelling-learning-journey', 'Tell the origin story', { context: baseContext });
    }, { baseContext });
    check('Orchestrator invokes A9 agent', orchResult?.agentId === 'storytelling-learning-journey');
    check('Orchestrator returns storytelling sections', orchResult?.sections?.length >= 6);

    console.log('\n--- Test 5: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'storytelling-learning-journey');
    await page.waitForTimeout(300);
    const panelUi = await page.evaluate(() => {
      const narrativeActions = document.querySelector('[data-agent-narrative-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--narrative')];
      return {
        narrativeVisible: narrativeActions && narrativeActions.style.display !== 'none',
        buttonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((button) => !!button.getAttribute('aria-label')),
        otherActionsHidden: ['[data-agent-code-lab-actions]', '[data-agent-visual-actions]', '[data-agent-curriculum-actions]', '[data-agent-quick-actions]', '[data-agent-research-actions]', '[data-agent-transfer-actions]', '[data-agent-assessment-actions]', '[data-agent-obsidian-actions]'].every((sel) => document.querySelector(sel)?.style.display === 'none')
      };
    });
    check('Narrative actions visible when A9 selected', panelUi.narrativeVisible);
    check('Has 10 narrative action buttons', panelUi.buttonCount === 10);
    check('Narrative action buttons have labels', panelUi.allButtonsHaveLabels);
    check('Other action groups hidden', panelUi.otherActionsHidden);

    console.log('\n--- Test 6: Panel Narrative Cards ---');
    await page.fill('#nv-agent-input', 'Tell the origin story for this concept');
    await page.dispatchEvent('#nv-agent-input', 'input');
    await page.waitForFunction(() => !document.querySelector('.nv-agent-submit')?.disabled, null, { timeout: 3000 });
    await page.click('.nv-agent-submit');
    await page.waitForFunction(() => document.querySelectorAll('.nv-agent-section').length > 0, null, { timeout: 5000 }).catch(() => {});
    const responseUi = await page.evaluate(() => ({
      hasSections: document.querySelectorAll('.nv-agent-section').length > 0,
      hasNarrativeCard: document.querySelectorAll('.nv-agent-narrative-card').length > 0,
      hasReasoning: !!document.querySelector('[data-agent-reasoning-value]')?.textContent?.trim()
    }));
    check('Panel renders structured sections', responseUi.hasSections);
    check('Panel renders narrative cards', responseUi.hasNarrativeCard);
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
      return { registryCount: registry?.getAgentIds?.().length, a9Status: registry?.getAgentStatus?.('storytelling-learning-journey'), learningPaths: data.counts?.learningPaths, modules: data.counts?.modules, lessons: data.counts?.lessons, artifacts: data.counts?.artifacts };
    });
    check('Registry remains 10 canonical agents', preservation.registryCount === 10);
    check('A9 registry lifecycle remains scaffolded', preservation.a9Status === 'scaffolded');
    check('Curriculum index unchanged: 19 paths', preservation.learningPaths === 19);
    check('Curriculum index unchanged: 40 modules', preservation.modules === 40);
    check('Curriculum index unchanged: 120 lessons', preservation.lessons === 120);
    check('Curriculum index unchanged: 600 artifacts', preservation.artifacts === 600);

    console.log('\n--- Test 9: Runtime Errors ---');
    check(`console.error count: ${consoleErrors.length}`, consoleErrors.length === 0);
    check(`pageerror count: ${pageErrors.length}`, pageErrors.length === 0);
    check(`failed request count: ${failedRequests.length}`, failedRequests.length === 0);

    console.log('\n=== Verification Summary ===');
    console.log(`Total checks: 105`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);
    const decision = failed.length === 0 ? 'READY' : 'NOT READY';
    console.log(`\nNV-1000-A9 Decision: ${decision}`);
    try {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a9-results.json'), JSON.stringify({ passed, failed, decision, consoleErrors, pageErrors, failedRequests }, null, 2));
    } catch (err) {
      console.warn(`Warning: Could not write results JSON: ${err.message}`);
    }
    await browser.close();
  } catch (error) {
    console.error('Verification failed with error:', error.stack || error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
})();
