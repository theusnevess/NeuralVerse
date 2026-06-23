#!/usr/bin/env node
/** NV-1000-A7 Verification Script */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a7-verify';
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
    await new Promise((resolve) => server.listen(8097, '127.0.0.1', resolve));
    console.log('Server running at http://127.0.0.1:8097/\n');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.stack || error.message));
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });

    await page.goto('http://127.0.0.1:8097/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const baseContext = {
      userQuery: 'Give me practice questions for RAG systems',
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
      selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Dynamic Routing Mechanisms' },
      artifactType: 'Explanatory Text',
      currentRoute: '#/learning/path-advanced-rag-foundations/module/advanced-retrieval-pipelines/lesson/query-routing'
    };

    console.log('--- Test 1: Agent Module Loaded ---');
    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.assessmentReinforcementAgent;
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
    check('assessmentReinforcementAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has canHandle function', moduleCheck.hasCanHandle);
    check('Has detectIntent function', moduleCheck.hasDetectIntent);
    check('Has getAvailableModes function', moduleCheck.hasModes);
    check('Has getCacheStats function', moduleCheck.hasCache);
    check('Has 10 reinforcement modes', moduleCheck.modes?.length === 10);

    console.log('\n--- Test 2: Agent Modes ---');
    const modeQueries = [
      ['practice_questions', 'Generate practice questions for this concept'],
      ['flashcards', 'Build flashcards for this concept'],
      ['retrieval_practice', 'Create a retrieval practice exercise for this concept'],
      ['self_assessment', 'Provide a guided self-assessment for this concept'],
      ['mini_challenges', 'Create a mini challenge for this concept'],
      ['reinforcement_plan', 'Generate a reinforcement plan for this concept'],
      ['misconception_check', 'Create a misconception check for this concept'],
      ['reflection_journal', 'Generate a reflection journal prompt for this concept'],
      ['concept_connections', 'Generate concept connection exercises for this concept'],
      ['review_session', 'Build a structured review session for this concept']
    ];
    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.assessmentReinforcementAgent;
        return await agent.run({ ...baseContext, userQuery: query }, { mode });
      }, { mode, query, baseContext });
      check(`${mode}: operational`, result?.status === 'operational');
      check(`${mode}: returns sections`, Array.isArray(result?.sections) && result.sections.length >= 6);
      check(`${mode}: has Educational Objective`, result?.sections?.some((s) => s.title === 'Educational Objective'));
      check(`${mode}: has Why This Exercise Exists`, result?.sections?.some((s) => s.title === 'Why This Exercise Exists'));
      check(`${mode}: has Suggested Thinking Strategy`, result?.sections?.some((s) => s.title === 'Suggested Thinking Strategy'));
      check(`${mode}: has Related Concepts`, result?.sections?.some((s) => s.title === 'Related Concepts'));
      check(`${mode}: has Optional Extension`, result?.sections?.some((s) => s.title === 'Optional Extension'));
    }

    console.log('\n--- Test 3: Formative Assessment Governance (Evidence Boundary) ---');
    // Ensure no evaluative words are produced in the response contents
    const responseContents = [];
    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.assessmentReinforcementAgent;
        const res = await agent.run({ ...baseContext, userQuery: query }, { mode });
        return (res?.sections || []).map(s => s.content || '').join('\n');
      }, { mode, query, baseContext });
      responseContents.push(result);
    }
    const fullText = responseContents.join('\n').toLowerCase()
      .replace(/gradient/g, '')
      .replace(/backward pass/g, '')
      .replace(/forward pass/g, '')
      .replace(/bypass/g, '');

    const prohibitedKeywords = [
      'grade', 'grades', 'graded', 'scored', 'scores', 'mark', 'marks',
      'evaluation score', 'correct response rating', 'pass', 'failed',
      'competency', 'competencies', 'mastery'
    ];
    for (const keyword of prohibitedKeywords) {
      const regex = new RegExp('\\b' + keyword + '\\b', 'i');
      check(`Does not contain keyword "${keyword}"`, !regex.test(fullText));
    }

    console.log('\n--- Test 4: Orchestrator Integration ---');
    const orchResult = await page.evaluate(async ({ baseContext }) => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      return await orchestrator.invokeAgent('assessment-reinforcement', 'Generate practice questions', { context: baseContext });
    }, { baseContext });
    check('Orchestrator invokes A7 agent', orchResult?.agentId === 'assessment-reinforcement');
    check('Orchestrator returns reinforcement sections', orchResult?.sections?.length >= 6);

    console.log('\n--- Test 5: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'assessment-reinforcement');
    await page.waitForTimeout(300);
    const panelUi = await page.evaluate(() => {
      const assessmentActions = document.querySelector('[data-agent-assessment-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--assessment')];
      return {
        assessmentVisible: assessmentActions && assessmentActions.style.display !== 'none',
        buttonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((button) => !!button.getAttribute('aria-label')),
        otherActionsHidden: ['[data-agent-code-lab-actions]', '[data-agent-visual-actions]', '[data-agent-curriculum-actions]', '[data-agent-quick-actions]', '[data-agent-research-actions]', '[data-agent-transfer-actions]'].every((sel) => document.querySelector(sel)?.style.display === 'none')
      };
    });
    check('Assessment actions visible when A7 selected', panelUi.assessmentVisible);
    check('Has 10 assessment action buttons', panelUi.buttonCount === 10);
    check('Assessment action buttons have labels', panelUi.allButtonsHaveLabels);
    check('Other action groups hidden', panelUi.otherActionsHidden);

    console.log('\n--- Test 6: Panel Assessment Cards ---');
    await page.fill('#nv-agent-input', 'Build flashcards for this concept');
    await page.dispatchEvent('#nv-agent-input', 'input');
    await page.waitForFunction(() => !document.querySelector('.nv-agent-submit')?.disabled, null, { timeout: 3000 });
    await page.click('.nv-agent-submit');
    await page.waitForFunction(() => document.querySelectorAll('.nv-agent-section').length > 0, null, { timeout: 5000 }).catch(() => {});
    const responseUi = await page.evaluate(() => ({
      hasSections: document.querySelectorAll('.nv-agent-section').length > 0,
      hasReinforcementCard: document.querySelectorAll('.nv-agent-reinforcement-card').length > 0,
      hasReasoning: !!document.querySelector('[data-agent-reasoning-value]')?.textContent?.trim()
    }));
    check('Panel renders structured sections', responseUi.hasSections);
    check('Panel renders reinforcement cards', responseUi.hasReinforcementCard);
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
      return { registryCount: registry?.getAgentIds?.().length, a7Status: registry?.getAgentStatus?.('assessment-reinforcement'), learningPaths: data.counts?.learningPaths, modules: data.counts?.modules, lessons: data.counts?.lessons, artifacts: data.counts?.artifacts };
    });
    check('Registry remains 10 canonical agents', preservation.registryCount === 10);
    check('A7 registry lifecycle remains scaffolded', preservation.a7Status === 'scaffolded');
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
    console.log(`\nNV-1000-A7 Decision: ${decision}`);
    try {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a7-results.json'), JSON.stringify({ passed, failed, decision, consoleErrors, pageErrors, failedRequests }, null, 2));
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
