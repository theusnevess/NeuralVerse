#!/usr/bin/env node
/**
 * NV-1000-A4 Verification Script
 * Code, Simulation & Laboratory Agent — Playwright E2E Verification
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a4-verify';

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
    await new Promise((resolve) => server.listen(8094, '127.0.0.1', resolve));
    console.log('Server running at http://127.0.0.1:8094/\n');

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

    await page.goto('http://127.0.0.1:8094/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const baseContext = {
      userQuery: 'Show me how query routing works in code',
      selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
      selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
      selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
      selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Dynamic Routing Mechanisms' },
      artifactType: 'Explanatory Text',
      currentRoute: '#/learning/path-advanced-rag-foundations/module/advanced-retrieval-pipelines/lesson/query-routing'
    };

    // --- Test 1: Agent module loaded ---
    console.log('--- Test 1: Agent Module Loaded ---');
    const moduleCheck = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.codeSimulationLaboratoryAgent;
      if (!agent) return { loaded: false };
      await agent.initialize();
      return {
        loaded: true,
        hasInitialize: typeof agent.initialize === 'function',
        hasRun: typeof agent.run === 'function',
        hasCanHandle: typeof agent.canHandle === 'function',
        hasDetectIntent: typeof agent.detectIntent === 'function',
        hasGetAvailableModes: typeof agent.getAvailableModes === 'function',
        hasGetSupportedLanguages: typeof agent.getSupportedLanguages === 'function',
        hasGetCacheStats: typeof agent.getCacheStats === 'function',
        modes: agent.getAvailableModes(),
        languages: agent.getSupportedLanguages()
      };
    });
    check('codeSimulationLaboratoryAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has canHandle function', moduleCheck.hasCanHandle);
    check('Has detectIntent function', moduleCheck.hasDetectIntent);
    check('Has getAvailableModes function', moduleCheck.hasGetAvailableModes);
    check('Has getSupportedLanguages function', moduleCheck.hasGetSupportedLanguages);
    check('Has getCacheStats function', moduleCheck.hasGetCacheStats);
    check('Has 10 educational modes', moduleCheck.modes?.length === 10);
    check('Has 6 supported languages', moduleCheck.languages?.length === 6);

    // --- Test 2: Agent modes ---
    console.log('\n--- Test 2: Agent Modes ---');
    const modeQueries = [
      ['code_example', 'Show me Python code example for retrieval ranking'],
      ['step_execution', 'Explain the execution flow step by step'],
      ['algorithm_walkthrough', 'Walk through the algorithm iterations'],
      ['mini_lab', 'Give me a mini lab exercise'],
      ['simulation_specification', 'Can we simulate gradient descent?'],
      ['debugging', 'Debug common implementation mistakes'],
      ['complexity_analysis', 'Analyze time complexity of attention'],
      ['pipeline_builder', 'Build a RAG retrieval pipeline'],
      ['parameter_explorer', 'Explore top-k and threshold parameters'],
      ['experiment_design', 'Design a reproducible experiment']
    ];

    for (const [mode, query] of modeQueries) {
      const result = await page.evaluate(async ({ mode, query, baseContext }) => {
        const agent = window.NeuralVerse.codeSimulationLaboratoryAgent;
        return await agent.run({ ...baseContext, userQuery: query }, { mode });
      }, { mode, query, baseContext });
      check(`${mode}: operational`, result?.status === 'operational');
      check(`${mode}: returns sections`, Array.isArray(result?.sections) && result.sections.length >= 6);
      check(`${mode}: has Educational Goal`, result?.sections?.some((s) => s.title === 'Educational Goal'));
      check(`${mode}: has Reasoning Strategy`, result?.sections?.some((s) => s.title === 'Reasoning Strategy'));
      check(`${mode}: has Limitations`, result?.sections?.some((s) => s.title === 'Limitations'));
      check(`${mode}: has Suggested Next Exploration`, result?.sections?.some((s) => s.title === 'Suggested Next Exploration'));
    }

    // --- Test 3: Code generation strategy ---
    console.log('\n--- Test 3: Code Generation Strategy ---');
    const codeResult = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.codeSimulationLaboratoryAgent;
      return await agent.run({ ...baseContext, userQuery: 'Show me TypeScript code example' }, { mode: 'code_example', language: 'typescript' });
    }, { baseContext });
    const codeSection = codeResult.sections.find((s) => s.type === 'code-block');
    check('Code section rendered as code-block', !!codeSection);
    check('Code language is deterministic', codeSection?.language === 'typescript');
    check('Code includes explanatory comments', /\/\/|#/.test(codeSection?.content || ''));
    check('Code does not execute arbitrary user code', !/eval\(|Function\(/.test(codeSection?.content || ''));

    // --- Test 4: Specialized behavior ---
    console.log('\n--- Test 4: Specialized Behavior ---');
    const behavior = await page.evaluate(async ({ baseContext }) => {
      const agent = window.NeuralVerse.codeSimulationLaboratoryAgent;
      const simulation = await agent.run({ ...baseContext, userQuery: 'simulation controls for embeddings' }, { mode: 'simulation_specification' });
      const lab = await agent.run({ ...baseContext, userQuery: 'mini laboratory for query routing' }, { mode: 'mini_lab' });
      const debug = await agent.run({ ...baseContext, userQuery: 'debug retrieval implementation' }, { mode: 'debugging' });
      const complexity = await agent.run({ ...baseContext, userQuery: 'complexity of attention' }, { mode: 'complexity_analysis' });
      const pipeline = await agent.run({ ...baseContext, userQuery: 'RAG retrieval pipeline' }, { mode: 'pipeline_builder' });
      const parameters = await agent.run({ ...baseContext, userQuery: 'Explore top-k for RAG retrieval' }, { mode: 'parameter_explorer' });
      const experiment = await agent.run({ ...baseContext, userQuery: 'Design experiment for reranking' }, { mode: 'experiment_design' });
      return { simulation, lab, debug, complexity, pipeline, parameters, experiment, cache: agent.getCacheStats() };
    }, { baseContext });
    check('Simulation is specification-only', behavior.simulation.sections.some((s) => /not a generated executable widget/i.test(s.content || '')));
    check('Mini lab has observations', behavior.lab.sections.some((s) => s.title === 'Expected Observations'));
    check('Debugging has symptom table', behavior.debug.sections.some((s) => s.type === 'comparison-table'));
    check('Complexity uses Big-O notation', behavior.complexity.sections.some((s) => /O\(/.test(s.content || '')));
    check('Pipeline uses execution flow', behavior.pipeline.sections.some((s) => s.type === 'execution-flow'));
    check('Parameter explorer uses table', behavior.parameters.sections.some((s) => s.title === 'Parameter Exploration'));
    check('Experiment avoids fabricated results', behavior.experiment.sections.some((s) => /without inventing results|Avoid claiming benchmark/i.test(s.content || '')));
    check('Cache records entries', behavior.cache.entries >= 7);

    // --- Test 5: Orchestrator integration ---
    console.log('\n--- Test 5: Orchestrator Integration ---');
    const orchResult = await page.evaluate(async ({ baseContext }) => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      return await orchestrator.invokeAgent('code-simulation-lab', 'Build a toy code example', { context: baseContext });
    }, { baseContext });
    check('Orchestrator invokes A4 agent', orchResult?.agentId === 'code-simulation-lab');
    check('Orchestrator returns code lab sections', orchResult?.sections?.length >= 6);

    // --- Test 6: Panel UI ---
    console.log('\n--- Test 6: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'code-simulation-lab');
    await page.waitForTimeout(300);
    const panelUi = await page.evaluate(() => {
      const codeActions = document.querySelector('[data-agent-code-lab-actions]');
      const visualActions = document.querySelector('[data-agent-visual-actions]');
      const curriculumActions = document.querySelector('[data-agent-curriculum-actions]');
      const didacticActions = document.querySelector('[data-agent-quick-actions]');
      const buttons = [...document.querySelectorAll('.nv-agent-quick-action-btn--code-lab')];
      return {
        codeVisible: codeActions && codeActions.style.display !== 'none',
        visualHidden: visualActions && visualActions.style.display === 'none',
        curriculumHidden: curriculumActions && curriculumActions.style.display === 'none',
        didacticHidden: didacticActions && didacticActions.style.display === 'none',
        buttonCount: buttons.length,
        allButtonsHaveLabels: buttons.every((button) => !!button.getAttribute('aria-label'))
      };
    });
    check('Code Lab actions visible when A4 selected', panelUi.codeVisible);
    check('Has 10 code lab action buttons', panelUi.buttonCount === 10);
    check('Visual actions hidden when A4 selected', panelUi.visualHidden);
    check('Curriculum actions hidden when A4 selected', panelUi.curriculumHidden);
    check('Didactic actions hidden when A4 selected', panelUi.didacticHidden);
    check('Code Lab action buttons have labels', panelUi.allButtonsHaveLabels);

    // --- Test 7: Panel structured rendering ---
    console.log('\n--- Test 7: Panel Structured Rendering ---');
    await page.fill('#nv-agent-input', 'Show me Python code example for attention');
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(1500);
    const responseUi = await page.evaluate(() => ({
      hasSections: document.querySelectorAll('.nv-agent-section').length > 0,
      hasCodeBlock: document.querySelectorAll('.nv-agent-code-block').length > 0,
      codeScrollable: getComputedStyle(document.querySelector('.nv-agent-code-block pre')).overflowX === 'auto',
      hasLabCard: document.querySelectorAll('.nv-agent-lab-card').length > 0,
      hasReasoning: !!document.querySelector('[data-agent-reasoning-value]')?.textContent?.trim(),
      hasResponseActions: document.querySelector('[data-agent-response-actions]')?.style.display !== 'none'
    }));
    check('Panel renders structured sections', responseUi.hasSections);
    check('Panel renders syntax-friendly code block', responseUi.hasCodeBlock);
    check('Code block supports horizontal scroll', responseUi.codeScrollable);
    check('Panel renders lab card', responseUi.hasLabCard);
    check('Panel shows reasoning strategy', responseUi.hasReasoning);
    check('Panel response actions visible', responseUi.hasResponseActions);

    // --- Test 8: Keyboard & accessibility ---
    console.log('\n--- Test 8: Keyboard & Accessibility ---');
    await page.keyboard.press('Tab');
    const keyboardCheck = await page.evaluate(() => {
      const panel = document.querySelector('#nv-agent-panel');
      return {
        panelRole: panel?.getAttribute('role'),
        panelLabel: panel?.getAttribute('aria-label'),
        focusedElementExists: !!document.activeElement,
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
        a4Status: registry?.getAgentStatus?.('code-simulation-lab'),
        learningPaths: data.counts?.learningPaths,
        modules: data.counts?.modules,
        lessons: data.counts?.lessons,
        artifacts: data.counts?.artifacts
      };
    });
    check('Registry remains 10 canonical agents', preservation.registryCount === 10);
    check('A4 registry lifecycle remains scaffolded', preservation.a4Status === 'scaffolded');
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
    console.log(`\nNV-1000-A4 Decision: ${decision}`);

    try {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a4-results.json'), JSON.stringify({
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
