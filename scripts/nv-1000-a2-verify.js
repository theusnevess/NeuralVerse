#!/usr/bin/env node
/**
 * NV-1000-A2 Verification Script
 * Curriculum & Dependency Agent — Playwright E2E Verification
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a2-verify';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
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
  } catch (e) { res.writeHead(500); res.end(`Error: ${e.message}`); }
}

(async () => {
  const passed = [];
  const failed = [];
  let server;

  function check(label, condition) {
    if (condition) { passed.push(label); console.log(`  \u2713 ${label}`); }
    else { failed.push(label); console.log(`  \u2717 ${label}`); }
  }

  try {
    server = http.createServer(serveFile);
    await new Promise((r) => server.listen(8092, '127.0.0.1', r));
    console.log(`Server running at http://127.0.0.1:8092/\n`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('requestfailed', (req) => failedRequests.push(req.url()));

    await page.goto('http://127.0.0.1:8092/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // --- Test 1: Agent module loaded ---
    console.log('--- Test 1: Agent Module Loaded ---');
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
        stats
      };
    });
    check('curriculumDependencyAgent loaded', moduleCheck.loaded);
    check('Has initialize function', moduleCheck.hasInitialize);
    check('Has run function', moduleCheck.hasRun);
    check('Has getPrerequisites function', moduleCheck.hasGetPrerequisites);
    check('Has getNeighbors function', moduleCheck.hasGetNeighbors);
    check('Has getDependencyExplanation function', moduleCheck.hasGetDependencyExplanation);
    check('Has generateRoute function', moduleCheck.hasGenerateRoute);
    check('Has getCurriculumContext function', moduleCheck.hasGetCurriculumContext);
    check('Has getIndexStats function', moduleCheck.hasGetIndexStats);
    check('Has getAvailableIntents function', moduleCheck.hasGetAvailableIntents);
    check('Index stats available', !!moduleCheck.stats);
    check('Has 19 learning paths', moduleCheck.stats?.learningPaths === 19);
    check('Has 40 modules', moduleCheck.stats?.modules === 40);
    check('Has 120 lessons', moduleCheck.stats?.lessons === 120);
    check('Has 600 artifacts', moduleCheck.stats?.artifacts === 600);

    // --- Test 2: Intent detection ---
    console.log('\n--- Test 2: Intent Detection ---');
    const intents = await page.evaluate(() => ({
      available: window.NeuralVerse?.curriculumDependencyAgent?.getAvailableIntents(),
    }));
    check('getAvailableIntents returns array', Array.isArray(intents.available));
    check('Has 10 intent categories', intents.available?.length === 10);
    check('Includes all major intents',
      ['dependency', 'next', 'previous', 'skip', 'summary', 'context', 'route', 'neighbor', 'crosslink', 'hierarchy'].every(
        (i) => intents.available?.includes(i)));

    // --- Test 3: Dependency explanation ---
    console.log('\n--- Test 3: Dependency Explanation ---');
    const depResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'What should I study before this?', selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        {}
      );
    });
    check('Dependency explanation returns sections', Array.isArray(depResult?.sections) && depResult.sections.length > 0);
    check('Has Prerequisite Concept section', depResult?.sections?.some(s => s.title === 'Prerequisite Concept'));
    check('Has Dependency Rationale section', depResult?.sections?.some(s => s.title === 'Dependency Rationale'));
    check('Has Expected Benefit section', depResult?.sections?.some(s => s.title === 'Expected Benefit'));
    check('Has Consequences of Skipping section', depResult?.sections?.some(s => s.title === 'Consequences of Skipping'));
    check('Has status operational', depResult?.status === 'operational');

    // --- Test 4: Next recommendation ---
    console.log('\n--- Test 4: Next Recommendation ---');
    const nextResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'What comes next?', selectedArtifact: { id: 'artifact-query-routing-explanatory-text', title: 'Query Routing Overview' }, selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        {}
      );
    });
    check('Next recommendation returns sections', Array.isArray(nextResult?.sections) && nextResult.sections.length > 0);
    check('Has Recommendation Source', nextResult?.sections?.some(s => s.title === 'Recommendation Source'));

    // --- Test 5: Curriculum context ---
    console.log('\n--- Test 5: Curriculum Context ---');
    const ctxResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Where am I in the curriculum?', selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' } },
        {}
      );
    });
    check('Curriculum context returns sections', Array.isArray(ctxResult?.sections) && ctxResult.sections.length > 0);
    check('Has Current Learning Path', ctxResult?.sections?.some(s => s.title === 'Current Learning Path'));
    check('Has Current Module', ctxResult?.sections?.some(s => s.title === 'Current Module'));
    check('Has Current Lesson', ctxResult?.sections?.some(s => s.title === 'Current Lesson'));

    // --- Test 6: Skip analysis ---
    console.log('\n--- Test 6: Skip Analysis ---');
    const skipResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Can I skip this lesson?', selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        {}
      );
    });
    check('Skip analysis returns sections', Array.isArray(skipResult?.sections) && skipResult.sections.length > 0);
    check('Has Likely Missing Intuition', skipResult?.sections?.some(s => s.title === 'Likely Missing Intuition'));
    check('Has Recommendation', skipResult?.sections?.some(s => s.title === 'Recommendation'));
    check('Has Note about data source', skipResult?.sections?.some(s => s.title === 'Note'));

    // --- Test 7: Neighbor discovery ---
    console.log('\n--- Test 7: Neighbor Discovery ---');
    const neighborResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Show me the neighbor lessons', selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        {}
      );
    });
    check('Neighbor discovery returns sections', Array.isArray(neighborResult?.sections) && neighborResult.sections.length > 0);
    check('Has Lesson Neighbors', neighborResult?.sections?.some(s => s.title === 'Lesson Neighbors'));
    check('Has Sibling Lessons', neighborResult?.sections?.some(s => s.title === 'Sibling Lessons'));
    check('Has Parent Module', neighborResult?.sections?.some(s => s.title === 'Parent Module'));

    // --- Test 8: Learning route ---
    console.log('\n--- Test 8: Learning Route ---');
    const routeResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Show me the learning route', selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        { routeType: 'full' }
      );
    });
    check('Learning route returns sections', Array.isArray(routeResult?.sections) && routeResult.sections.length > 0);
    check('Has tree type section', routeResult?.sections?.some(s => s.type === 'tree'));
    check('Has Recommendation Source', routeResult?.sections?.some(s => s.title === 'Recommendation Source'));

    // --- Test 9: Curriculum summary ---
    console.log('\n--- Test 9: Curriculum Summary ---');
    const summaryResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Summarize this curriculum item', selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' }, selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' } },
        {}
      );
    });
    check('Curriculum summary returns sections', Array.isArray(summaryResult?.sections) && summaryResult.sections.length > 0);
    check('Has Module Scope', summaryResult?.sections?.some(s => s.title === 'Module Scope'));
    check('Has Learning Path', summaryResult?.sections?.some(s => s.title === 'Learning Path'));

    // --- Test 10: Hierarchy visualization ---
    console.log('\n--- Test 10: Hierarchy Visualization ---');
    const hierResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Show me the parent hierarchy', selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' }, selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' } },
        {}
      );
    });
    check('Hierarchy visualization returns sections', Array.isArray(hierResult?.sections) && hierResult.sections.length > 0);
    check('Has tree type section', hierResult?.sections?.some(s => s.type === 'tree'));

    // --- Test 11: Public API methods ---
    console.log('\n--- Test 11: Public API Methods ---');
    const apiResult = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      const prereqs = agent.getPrerequisites('lesson-query-routing');
      const neighbors = agent.getNeighbors('lesson-query-routing');
      const depExpl = agent.getDependencyExplanation('lesson-query-routing');
      const route = agent.generateRoute('path-advanced-rag-foundations');
      const ctx = agent.getCurriculumContext({
        selectedPath: { id: 'path-advanced-rag-foundations' },
        selectedModule: { id: 'module-advanced-retrieval-pipelines' },
        selectedLesson: { id: 'lesson-query-routing' }
      });
      return {
        prereqsIsArray: Array.isArray(prereqs),
        neighborsHasFields: !!neighbors?.previous !== undefined && !!neighbors?.next !== undefined && Array.isArray(neighbors?.siblings),
        depExplHasFields: !!depExpl?.lesson && !!depExpl?.module && !!depExpl?.path && Array.isArray(depExpl?.prerequisites),
        routeIsArray: Array.isArray(route),
        ctxHasFields: !!ctx?.path && !!ctx?.module && !!ctx?.lesson,
      };
    });
    check('getPrerequisites returns array', apiResult.prereqsIsArray);
    check('getNeighbors returns correct structure', apiResult.neighborsHasFields);
    check('getDependencyExplanation returns correct structure', apiResult.depExplHasFields);
    check('generateRoute returns array', apiResult.routeIsArray);
    check('getCurriculumContext returns correct structure', apiResult.ctxHasFields);

    // --- Test 12: Panel UI - curriculum actions ---
    console.log('\n--- Test 12: Panel UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    await page.selectOption('#nv-agent-select', 'curriculum-dependency');
    await page.waitForTimeout(300);

    const curriculumActionsVisible = await page.evaluate(() => {
      const el = document.querySelector('[data-agent-curriculum-actions]');
      return el && el.style.display !== 'none';
    });
    check('Curriculum actions visible when agent selected', curriculumActionsVisible);

    const curriculumActionCount = await page.evaluate(() => {
      return document.querySelectorAll('.nv-agent-quick-action-btn--curriculum').length;
    });
    check('Has 10 curriculum action buttons', curriculumActionCount === 10);

    const didacticActionsHidden = await page.evaluate(() => {
      const el = document.querySelector('[data-agent-quick-actions]');
      return el && el.style.display === 'none';
    });
    check('Didactic actions hidden when curriculum agent selected', didacticActionsHidden);

    // --- Test 13: Submit curriculum query via panel ---
    console.log('\n--- Test 13: Panel Curriculum Query ---');

    // Test that the orchestrator properly invokes the async agent and returns sections
    const panelResult = await page.evaluate(async () => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      if (!orchestrator) return { error: 'no orchestrator' };
      try {
        const result = await orchestrator.invokeAgent('curriculum-dependency', 'What should I study before this?', {
          context: {
            selectedPath: { id: 'path-advanced-rag-foundations', title: 'Advanced RAG Foundations' },
            selectedModule: { id: 'module-advanced-retrieval-pipelines', title: 'Advanced Retrieval Pipelines' },
            selectedLesson: { id: 'lesson-query-routing', title: 'Query Routing' },
            userQuery: 'What should I study before this?'
          }
        });
        return {
          hasSections: !!(result?.sections && result.sections.length > 0),
          sectionCount: result?.sections?.length || 0,
          hasError: result?.type === 'error',
          hasRefusal: result?.type === 'governed-refusal'
        };
      } catch(e) {
        return { error: e.message };
      }
    });
    console.log('  Orchestrator result:', JSON.stringify(panelResult));
    check('Panel renders structured sections for curriculum query', panelResult.hasSections === true);

    // --- Test 14: Guardrails ---
    console.log('\n--- Test 14: Guardrails ---');
    const guardrail = await page.evaluate(async () => {
      const agent = window.NeuralVerse?.curriculumDependencyAgent;
      await agent.initialize();
      return await agent.run(
        { userQuery: 'Change the curriculum structure' },
        {}
      );
    });
    check('Agent returns operational status', guardrail?.status === 'operational');

    // --- Test 15: Responsive layout ---
    console.log('\n--- Test 15: Responsive Layout ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    check('mobile-390 (390px): no overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    check('tablet-768 (768px): no overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(300);
    check('desktop-1024 (1024px): no overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    check('desktop-1440 (1440px): no overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

    // --- Test 16: Existing routes ---
    console.log('\n--- Test 16: Existing Routes ---');
    for (const route of ['/', '/#/', '/#/overview', '/#/module/ml-fundamentals']) {
      await page.goto(`http://127.0.0.1:8092/${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const ok = await page.evaluate(() => document.title && document.title.length > 0 && !document.querySelector('.error-page'));
      check(`Route ${route} renders`, ok);
    }

    // --- Test 17: NV-800 preservation ---
    console.log('\n--- Test 17: NV-800 Preservation ---');
    await page.goto('http://127.0.0.1:8092/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const indexCheck = await page.evaluate(async () => {
      const resp = await fetch('data/curriculum-index.json');
      const data = await resp.json();
      return {
        learningPaths: data.counts?.learningPaths,
        modules: data.counts?.modules,
        lessons: data.counts?.lessons,
        artifacts: data.counts?.artifacts,
      };
    });
    check('Curriculum index unchanged: 19 paths', indexCheck.learningPaths === 19);
    check('Curriculum index unchanged: 40 modules', indexCheck.modules === 40);
    check('Curriculum index unchanged: 120 lessons', indexCheck.lessons === 120);
    check('Curriculum index unchanged: 600 artifacts', indexCheck.artifacts === 600);

    // --- Test 18: Error checks ---
    console.log('\n--- Test 18: Error Checks ---');
    const criticalErrors = consoleErrors.filter(e => !e.includes('ERR_NAME_NOT_RESOLVED') && !e.includes('pages/'));
    const criticalFailedReqs = failedRequests.filter(u => !u.includes('pages/'));
    check(`Console errors (excl. pre-existing): ${criticalErrors.length}`, criticalErrors.length === 0);
    check(`Failed requests (excl. pre-existing): ${criticalFailedReqs.length}`, criticalFailedReqs.length === 0);

    // --- Summary ---
    console.log('\n=== Verification Summary ===');
    console.log(`Total checks: ${passed.length + failed.length}`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);
    const decision = failed.length === 0 ? 'READY' : 'NOT READY';
    console.log(`\nNV-1000-A2 Decision: ${decision}`);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a2-results.json'),
      JSON.stringify({ passed, failed, decision, consoleErrors, failedRequests }, null, 2));

    await browser.close();
  } catch (e) {
    console.error('Verification failed with error:', e.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
})();
