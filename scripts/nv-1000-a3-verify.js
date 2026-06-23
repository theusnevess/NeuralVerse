#!/usr/bin/env node
/**
 * NV-1000-A3 Verification Script
 * Visual & Interactive Media Agent — Playwright E2E Verification
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a3-verify';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.md': 'text/markdown'
};

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
  } catch (e) {
    res.writeHead(500);
    res.end(`Error: ${e.message}`);
  }
}

(async () => {
  const passed = [];
  const failed = [];
  let server;

  function check(label, condition) {
    if (condition) {
      passed.push(label);
      console.log(`  ✓ ${label}`);
    } else {
      failed.push(label);
      console.log(`  ✗ ${label}`);
    }
  }

  try {
    server = http.createServer(serveFile);
    await new Promise((resolve) => server.listen(8093, '127.0.0.1', resolve));
    console.log('Server running at http://127.0.0.1:8093/\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    page.on('response', (response) => {
      if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
    });

    await page.goto('http://127.0.0.1:8093/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const baseContext = {
      userQuery: 'Can you visualize attention as a matrix?',
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
      selectedArtifact: { id: 'artifact-query-routing-visual-intuition', title: 'Query Routing Visual Intuition' },
      artifactType: 'Visual Intuition',
      currentRoute: '#/learning/path-advanced-rag-foundations/module/advanced-retrieval-pipelines/lesson/query-routing'
    };

    // --- Test 1: Agent module loaded ---
    console.log('--- Test 1: Agent Module Loaded ---');
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
        diagramTypes: agent.getDiagramTypes()
      };
    });
    check('visualInteractiveMediaAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has canHandle function', moduleCheck.hasCanHandle);
    check('Has detectIntent function', moduleCheck.hasDetectIntent);
    check('Has getAvailableModes function', moduleCheck.hasGetAvailableModes);
    check('Has getDiagramTypes function', moduleCheck.hasGetDiagramTypes);
    check('Has getCacheStats function', moduleCheck.hasGetCacheStats);
    check('Has 10 visualization modes', moduleCheck.modes?.length === 10);
    check('Has diagram taxonomy', moduleCheck.diagramTypes?.length >= 13);

    // --- Test 2: Agent modes ---
    console.log('\n--- Test 2: Agent Modes ---');
    const modeQueries = [
      ['visual_intuition', 'Can you visualize embeddings?'],
      ['diagram_recommendation', 'Show me a diagram for RAG retrieval'],
      ['interactive_specification', 'Create an interactive visualization specification'],
      ['comparison_visualization', 'Compare visually CNN vs Transformer'],
      ['animation_specification', 'Suggest an animation for gradient descent'],
      ['timeline_construction', 'Build a timeline for an inference pipeline'],
      ['mathematical_visualization', 'Explain attention geometrically as a matrix'],
      ['scientific_illustration', 'Give scientific illustration guidance'],
      ['atlas_recommendation', 'How should this appear in the knowledge graph atlas?'],
      ['media_selection', 'What is the best teaching medium for this concept?']
    ];

    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.visualInteractiveMediaAgent;
        return await agent.run({ ...baseContext, userQuery: query }, { mode });
      }, { mode, query, baseContext });
      check(`${mode}: operational`, result?.status === 'operational');
      check(`${mode}: returns sections`, Array.isArray(result?.sections) && result.sections.length >= 3);
      check(`${mode}: explains chosen visualization`, result?.sections?.some((s) => s.title === 'Chosen Visualization'));
    }

    // --- Test 3: Diagram recommendation strategy ---
    console.log('\n--- Test 3: Diagram Recommendation Strategy ---');
    const diagramResults = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      const pipeline = await agent.run({ ...baseContext, userQuery: 'Show me a diagram for a RAG pipeline' }, { mode: 'diagram_recommendation' });
      const attention = await agent.run({ ...baseContext, userQuery: 'Show me a diagram for attention matrix' }, { mode: 'diagram_recommendation' });
      const vector = await agent.run({ ...baseContext, userQuery: 'Show me a diagram for embeddings and vectors' }, { mode: 'diagram_recommendation' });
      return { pipeline, attention, vector };
    }, { baseContext });
    check('RAG maps to pipeline', diagramResults.pipeline?.chosenVisualization === 'pipeline');
    check('Attention maps to attention matrix', diagramResults.attention?.chosenVisualization === 'attention matrix');
    check('Embeddings map to coordinate system', diagramResults.vector?.chosenVisualization === 'coordinate system');

    // --- Test 4: Reuse and cache behavior ---
    console.log('\n--- Test 4: Reuse and Cache Behavior ---');
    const cacheCheck = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.visualInteractiveMediaAgent;
      await agent.run({ ...baseContext, userQuery: 'Create an interactive visualization specification for self attention' }, { mode: 'interactive_specification' });
      await agent.run({ ...baseContext, userQuery: 'Create an interactive visualization specification for self attention' }, { mode: 'interactive_specification' });
      return agent.getCacheStats();
    }, { baseContext });
    check('Recommendation cache records entries', cacheCheck.entries >= 1);

    // --- Test 5: Orchestrator integration ---
    console.log('\n--- Test 5: Orchestrator Integration ---');
    const orchResult = await page.evaluate(async ({ baseContext }) => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      return await orchestrator.invokeAgent('visual-interactive-media', 'Generate a diagram for attention', { context: baseContext });
    }, { baseContext });
    check('Orchestrator invokes A3 agent', orchResult?.agentId === 'visual-interactive-media');
    check('Orchestrator returns visual sections', orchResult?.sections?.length >= 3);

    // --- Test 6: Panel UI ---
    console.log('\n--- Test 6: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'visual-interactive-media');
    await page.waitForTimeout(300);

    const panelUi = await page.evaluate(() => {
      const visualActions = document.querySelector('[data-agent-visual-actions]');
      const curriculumActions = document.querySelector('[data-agent-curriculum-actions]');
      const didacticActions = document.querySelector('[data-agent-quick-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--visual')];
      return {
        visualVisible: visualActions && visualActions.style.display !== 'none',
        curriculumHidden: curriculumActions && curriculumActions.style.display === 'none',
        didacticHidden: didacticActions && didacticActions.style.display === 'none',
        visualButtonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((button) => !!button.getAttribute('aria-label'))
      };
    });
    check('Visual actions visible when A3 selected', panelUi.visualVisible);
    check('Has 10 visual action buttons', panelUi.visualButtonCount === 10);
    check('Curriculum actions hidden when A3 selected', panelUi.curriculumHidden);
    check('Didactic actions hidden when A3 selected', panelUi.didacticHidden);
    check('Visual action buttons have labels', panelUi.allButtonsHaveLabels);

    // --- Test 7: Panel response cards ---
    console.log('\n--- Test 7: Panel Response Cards ---');
    await page.fill('#nv-agent-input', 'Show me a diagram for attention');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(1500);
    const responseUi = await page.evaluate(() => ({
      hasSections: document.querySelectorAll('.nv-agent-section').length > 0,
      hasVisualCards: document.querySelectorAll('.nv-agent-visual-card').length > 0,
      hasReasoning: !!document.querySelector('[data-agent-reasoning-value]')?.textContent?.trim(),
      hasResponseActions: document.querySelector('[data-agent-response-actions]')?.style.display !== 'none'
    }));
    check('Panel renders structured sections', responseUi.hasSections);
    check('Panel renders visual cards', responseUi.hasVisualCards);
    check('Panel shows reasoning strategy', responseUi.hasReasoning);
    check('Panel response actions visible', responseUi.hasResponseActions);

    // --- Test 8: Keyboard navigation and accessibility ---
    console.log('\n--- Test 8: Keyboard & Accessibility ---');
    await page.keyboard.press('Tab');
    const keyboardCheck = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      const active = document.activeElement;
      return {
        panelRole: panel?.getAttribute('role'),
        panelLabel: panel?.getAttribute('aria-label'),
        focusedElementExists: !!active,
        closeHasLabel: !!document.querySelector('.nv-agent-panel__close')?.getAttribute('aria-label')
      };
    });
    check('Panel has complementary role', keyboardCheck.panelRole === 'complementary');
    check('Panel has accessible label', !!keyboardCheck.panelLabel);
    check('Keyboard focus remains valid', keyboardCheck.focusedElementExists);
    check('Close button has aria-label', keyboardCheck.closeHasLabel);

    // --- Test 9: Responsive layout ---
    console.log('\n--- Test 9: Responsive Layout ---');
    for (const [label, width, height] of [
      ['mobile-390', 390, 844],
      ['tablet-768', 768, 1024],
      ['desktop-1024', 1024, 768],
      ['desktop-1440', 1440, 900]
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      check(`${label}: no horizontal overflow`, noOverflow);
    }

    // --- Test 10: Preservation ---
    console.log('\n--- Test 10: Preservation ---');
    const preservation = await page.evaluate(async () => {
      const registry = window.NeuralVerse?.agentRegistry;
      const resp = await fetch('data/curriculum-index.json');
      const data = await resp.json();
      return {
        registryCount: registry?.getAgentIds?.().length,
        a3Status: registry?.getAgentStatus?.('visual-interactive-media'),
        learningPaths: data.counts?.learningPaths,
        modules: data.counts?.modules,
        lessons: data.counts?.lessons,
        artifacts: data.counts?.artifacts
      };
    });
    check('Registry remains 10 canonical agents', preservation.registryCount === 10);
    check('A3 registry lifecycle remains scaffolded', preservation.a3Status === 'scaffolded');
    check('Curriculum index unchanged: 19 paths', preservation.learningPaths === 19);
    check('Curriculum index unchanged: 40 modules', preservation.modules === 40);
    check('Curriculum index unchanged: 120 lessons', preservation.lessons === 120);
    check('Curriculum index unchanged: 600 artifacts', preservation.artifacts === 600);

    // --- Test 11: Runtime errors ---
    console.log('\n--- Test 11: Runtime Errors ---');
    check(`console.error count: ${consoleErrors.length}`, consoleErrors.length === 0);
    check(`pageerror count: ${pageErrors.length}`, pageErrors.length === 0);
    check(`failed request count: ${failedRequests.length}`, failedRequests.length === 0);

    console.log('\n=== Verification Summary ===');
    console.log(`Total checks: ${passed.length + failed.length}`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);
    const decision = failed.length === 0 ? 'READY' : 'NOT READY';
    console.log(`\nNV-1000-A3 Decision: ${decision}`);

    try {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a3-results.json'), JSON.stringify({
        passed,
        failed,
        decision,
        consoleErrors,
        pageErrors,
        failedRequests
      }, null, 2));
    } catch (err) {
      console.warn(`Warning: Could not write results JSON (filesystem might be read-only): ${err.message}`);
    }

    await browser.close();
  } catch (error) {
    console.error('Verification failed with error:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
})();
