#!/usr/bin/env node
/**
 * NV-1000-A1 Verification Script
 * Didactic Architecture Agent — Playwright E2E Verification
 *
 * Tests all 10 educational modes and sub-engine enhancements.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '..', 'website');
const OUTPUT_DIR = '/tmp/neuralverse-nv1000-a1-verify';

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
    await new Promise((r) => server.listen(8091, '127.0.0.1', r));
    console.log(`Server running at http://127.0.0.1:8091/\n`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('requestfailed', (req) => failedRequests.push(req.url()));

    await page.goto('http://127.0.0.1:8091/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // --- Test 1: Agent modules loaded ---
    console.log('--- Test 1: Agent Modules Loaded ---');
    const modules = await page.evaluate(() => ({
      agent: !!window.NeuralVerse?.didacticArchitectureAgent,
      misconceptions: !!window.NeuralVerse?.misconceptionLibrary,
      analogies: !!window.NeuralVerse?.analogyEngine,
      comparisons: !!window.NeuralVerse?.comparisonEngine,
      socratic: !!window.NeuralVerse?.socraticEngine,
      orchestrator: !!window.NeuralVerse?.didacticOrchestrator,
      registerReal: typeof window.NeuralVerse?.didacticOrchestrator?.registerRealAgent === 'function',
    }));
    check('didacticArchitectureAgent loaded', modules.agent);
    check('misconceptionLibrary loaded', modules.misconceptions);
    check('analogyEngine loaded', modules.analogies);
    check('comparisonEngine loaded', modules.comparisons);
    check('socraticEngine loaded', modules.socratic);
    check('orchestrator with registerRealAgent', modules.registerReal && modules.orchestrator);

    // --- Test 2: Explanation modes ---
    console.log('\n--- Test 2: Explanation Modes ---');
    const modes = await page.evaluate(() => ({
      count: window.NeuralVerse?.didacticArchitectureAgent?.EXPLANATION_MODES?.length || 0,
      ids: (window.NeuralVerse?.didacticArchitectureAgent?.EXPLANATION_MODES || []).map((m) => m.id),
    }));
    check('12 explanation modes defined', modes.count === 12);
    check('Includes default, beginner, socratic, analogy-first modes',
      ['default', 'beginner', 'socratic', 'analogy-first'].every((m) => modes.ids.includes(m)));
    check('Includes advanced, mathematical, engineering, research modes',
      ['advanced', 'mathematical', 'engineering', 'research'].every((m) => modes.ids.includes(m)));
    check('Includes visual-intuition, step-by-step, executive-summary, intermediate modes',
      ['visual-intuition', 'step-by-step', 'executive-summary', 'intermediate'].every((m) => modes.ids.includes(m)));

    // --- Test 3: Intent detection ---
    console.log('\n--- Test 3: Intent Detection ---');
    const intents = await page.evaluate(() => ({
      available: window.NeuralVerse?.didacticArchitectureAgent?.getAvailableIntents(),
    }));
    check('getAvailableIntents returns array', Array.isArray(intents.available));
    check('Has 12 intent categories', intents.available?.length === 12);
    check('Includes all major intents',
      ['explain', 'simplify', 'deepen', 'compare', 'analogy', 'misconception',
       'summarize', 'connect', 'socratic', 'reflection', 'transfer', 'reading'].every(
        (i) => intents.available?.includes(i)));

    // --- Test 4: 10 Educational Modes — Each mode produces valid structured response ---
    console.log('\n--- Test 4: All 10 Educational Modes ---');
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
      { intent: 'summarize', query: 'Summarize overfitting', expectedMode: 'summary' },
    ];

    for (const tc of TEST_QUERIES) {
      const result = await page.evaluate(({ query }) => {
        const agent = window.NeuralVerse?.didacticArchitectureAgent;
        if (!agent) return null;
        return agent.run({ userQuery: query, selectedPath: { title: 'ML Fundamentals' } }, { mode: 'default' });
      }, tc);

      check(`Mode "${tc.intent}" (${tc.query.substring(0, 40)}...): returns sections`,
        Array.isArray(result?.sections) && result.sections.length > 0);
      check(`Mode "${tc.intent}": has correct mode "${tc.expectedMode}"`,
        result?.mode === tc.expectedMode);
      check(`Mode "${tc.intent}": has status operational`,
        result?.status === 'operational');
      check(`Mode "${tc.intent}": has topic`,
        typeof result?.topic === 'string' && result.topic.length > 0);
      check(`Mode "${tc.intent}": has reasoningStrategy`,
        typeof result?.reasoningStrategy === 'string' && result.reasoningStrategy.length > 0);
    }

    // --- Test 5: Misconception detection (structured profiles) ---
    console.log('\n--- Test 5: Misconception Detection ---');
    const miscon = await page.evaluate(() => {
      const lib = window.NeuralVerse?.misconceptionLibrary;
      if (!lib) return null;
      const all = lib.getAll();
      const detected = lib.detect('AI will replace all programmers', 'AI will replace all programmers');
      const profile = all.length > 0 ? lib.getFormattedProfile(all[0]) : null;
      const proactive = typeof lib.detectProactive === 'function'
        ? lib.detectProactive('AI will replace all programmers')
        : null;
      const byId = typeof lib.getProfileById === 'function'
        ? lib.getProfileById(all[0]?.id)
        : null;
      return {
        count: all.length,
        detected: Array.isArray(detected),
        detectedCount: detected.length,
        profileExists: typeof profile === 'string' && profile.length > 0,
        proactiveExists: proactive !== null,
        byIdExists: byId !== null,
        firstHasWhyLearners: !!all[0]?.whyLearnersBelieveIt,
        firstHasIntuition: !!all[0]?.intuition,
        firstHasVerification: !!all[0]?.verificationPrompt,
      };
    });
    check('Misconception library has 12+ entries', miscon?.count >= 12);
    check('detect() returns array', miscon?.detected);
    check('getFormattedProfile returns string', miscon?.profileExists);
    check('detectProactive function exists', miscon?.proactiveExists);
    check('getProfileById function exists', miscon?.byIdExists);
    check('Misconception has whyLearnersBelieveIt', miscon?.firstHasWhyLearners);
    check('Misconception has intuition', miscon?.firstHasIntuition);
    check('Misconception has verificationPrompt', miscon?.firstHasVerification);

    // --- Test 6: Analogy engine (multi-domain) ---
    console.log('\n--- Test 6: Analogy Engine (Multi-Domain) ---');
    const analogy = await page.evaluate(() => {
      const engine = window.NeuralVerse?.analogyEngine;
      if (!engine) return null;
      const result = engine.generate('overfitting', {}, 'beginner');
      const multi = typeof engine.generateMultiDomain === 'function'
        ? engine.generateMultiDomain('overfitting', {}, 3)
        : null;
      const domains = typeof engine.getAvailableDomains === 'function'
        ? engine.getAvailableDomains()
        : null;
      const byDomain = typeof engine.getAnalogiesByDomain === 'function'
        ? engine.getAnalogiesByDomain('physics')
        : null;
      const genByDomain = typeof engine.generateByDomain === 'function'
        ? engine.generateByDomain('overfitting', 'physics')
        : null;
      const available = engine.getAvailableAnalogies();
      return {
        hasResult: !!result,
        hasMulti: Array.isArray(multi),
        multiCount: multi?.length,
        hasDomains: Array.isArray(domains),
        domainsCount: domains?.length,
        hasByDomain: Array.isArray(byDomain),
        hasGenByDomain: !!genByDomain,
        availableCount: available?.length,
      };
    });
    check('Analogy engine generate returns result', analogy?.hasResult);
    check('generateMultiDomain returns array', analogy?.hasMulti);
    check('generateMultiDomain returns 1-3 results', analogy?.multiCount >= 1 && analogy?.multiCount <= 3);
    check('getAvailableDomains returns array', analogy?.hasDomains);
    check('Available domains has 5+ entries', analogy?.domainsCount >= 5);
    check('getAnalogiesByDomain returns array', analogy?.hasByDomain);
    check('generateByDomain returns result', analogy?.hasGenByDomain);
    check('Available analogies count >= 10', analogy?.availableCount >= 10);

    // --- Test 7: Comparison engine (expanded) ---
    console.log('\n--- Test 7: Comparison Engine (Expanded) ---');
    const comp = await page.evaluate(() => {
      const engine = window.NeuralVerse?.comparisonEngine;
      if (!engine) return null;
      const query = engine.parseComparisonQuery('supervised vs unsupervised learning');
      const result = engine.compare('supervised learning', 'unsupervised learning', {});
      const knownList = typeof engine.getKnownComparisons === 'function'
        ? engine.getKnownComparisons()
        : [];
      const knownDetails = typeof engine.getComparisonDetails === 'function'
        ? engine.getComparisonDetails('supervised vs unsupervised')
        : null;
      const hasSimilarities = !!result?.similarities;
      const hasTradeoffs = !!result?.tradeoffs;
      return {
        hasQuery: !!query,
        hasResult: !!result,
        hasTable: !!result?.table,
        hasDifferences: !!result?.differences,
        hasGuidance: !!result?.guidance,
        hasSimilarities,
        hasTradeoffs,
        knownListCount: knownList?.length,
        knownDetailsExists: !!knownDetails,
      };
    });
    check('Comparison engine parses query', comp?.hasQuery);
    check('Comparison engine compare returns result', comp?.hasResult);
    check('Comparison has table', comp?.hasTable);
    check('Comparison has differences', comp?.hasDifferences);
    check('Comparison has guidance', comp?.hasGuidance);
    check('Comparison has similarities', comp?.hasSimilarities);
    check('Comparison has tradeoffs', comp?.hasTradeoffs);
    check('getKnownComparisons returns 6+ entries', comp?.knownListCount >= 6);
    check('getComparisonDetails returns data', comp?.knownDetailsExists);

    // --- Test 8: Socratic engine (layers) ---
    console.log('\n--- Test 8: Socratic Engine (Layers) ---');
    const socratic = await page.evaluate(() => {
      const engine = window.NeuralVerse?.socraticEngine;
      if (!engine) return null;
      const result = engine.generate('overfitting', {}, { layers: ['observation', 'interpretation', 'prediction'] });
      const topics = engine.getAvailableTopics();
      const layers = typeof engine.generateByLayer === 'function'
        ? engine.generateByLayer('overfitting', 'observation')
        : null;
      const fullSpectrum = typeof engine.generateFullSpectrum === 'function'
        ? engine.generateFullSpectrum('overfitting')
        : null;
      const layered = typeof engine.generateLayeredQuestions === 'function'
        ? engine.generateLayeredQuestions('overfitting')
        : null;
      const hasLayers = !!result?.layers;
      const layerCount = hasLayers ? Object.keys(result.layers).length : 0;
      const layerNames = hasLayers ? Object.keys(result.layers) : [];
      return {
        hasResult: !!result,
        topicsCount: topics?.length,
        hasLayers,
        layerCount,
        layerNames,
        hasGenerateByLayer: layers !== null,
        hasFullSpectrum: fullSpectrum !== null,
        fullSpectrumLayerCount: fullSpectrum?.layers ? Object.keys(fullSpectrum.layers).length : 0,
        hasLayeredQuestions: layered !== null,
        hasOpening: !!result?.opening,
        hasMain: !!result?.main,
        hasReflection: !!result?.reflection,
      };
    });
    check('Socratic engine generates result', socratic?.hasResult);
    check('Socratic has 10+ topics', socratic?.topicsCount >= 10);
    check('Socratic has layered questions', socratic?.hasLayers);
    check('Socratic has 3+ layers', socratic?.layerCount >= 3);
    check('generateByLayer returns result', socratic?.hasGenerateByLayer);
    check('generateFullSpectrum returns result', socratic?.hasFullSpectrum);
    check('generateFullSpectrum has 6 layers', socratic?.fullSpectrumLayerCount === 6);
    check('generateLayeredQuestions returns result', socratic?.hasLayeredQuestions);
    check('Socratic has opening', socratic?.hasOpening);
    check('Socratic has main questions', socratic?.hasMain);
    check('Socratic has reflection', socratic?.hasReflection);

    // --- Test 9: Structured response format (default mode) ---
    console.log('\n--- Test 9: Structured Response Format ---');
    const response = await page.evaluate(() => {
      const agent = window.NeuralVerse?.didacticArchitectureAgent;
      if (!agent) return null;
      return agent.run(
        { userQuery: 'What is overfitting?', selectedPath: { title: 'ML Fundamentals' } },
        { mode: 'default' }
      );
    });
    check('Agent returns sections array', Array.isArray(response?.sections));
    check('Has Overview section', response?.sections?.some((s) => s.title === 'Overview'));
    check('Has Intuition section', response?.sections?.some((s) => s.title === 'Intuition'));
    check('Has Detailed Explanation section', response?.sections?.some((s) => s.title === 'Detailed Explanation'));
    check('Has Common Misconceptions section', response?.sections?.some((s) => s.title === 'Common Misconceptions'));
    check('Has Connections section', response?.sections?.some((s) => s.title === 'Connections'));
    check('Has Suggested Next Exploration section', response?.sections?.some((s) => s.title === 'Suggested Next Exploration'));
    check('Response has topic field', !!response?.topic);
    check('Response has status: operational', response?.status === 'operational');
    check('Response has reasoningStrategy', !!response?.reasoningStrategy);

    // --- Test 10: Mode selector UI ---
    console.log('\n--- Test 10: Mode Selector UI ---');
    await page.click('#nv-agent-trigger');
    await page.waitForTimeout(500);
    const selectorExists = await page.evaluate(() => !!document.querySelector('#nv-agent-mode'));
    check('Mode selector exists in panel', selectorExists);

    const modeCount = await page.evaluate(() => {
      return document.querySelectorAll('#nv-agent-mode option').length;
    });
    check('Mode selector has 12+ options', modeCount >= 12);

    // --- Test 11: Quick action buttons ---
    console.log('\n--- Test 11: Quick Action Buttons ---');
    await page.selectOption('#nv-agent-select', 'didactic-architecture');
    await page.waitForTimeout(300);
    const quickActionCount = await page.evaluate(() => {
      return document.querySelectorAll('.nv-agent-quick-action-btn:not(.nv-agent-quick-action-btn--curriculum):not(.nv-agent-quick-action-btn--visual):not(.nv-agent-quick-action-btn--code-lab):not(.nv-agent-quick-action-btn--research):not(.nv-agent-quick-action-btn--transfer):not(.nv-agent-quick-action-btn--assessment):not(.nv-agent-quick-action-btn--obsidian)').length;
    });
    check('Quick action buttons present (9)', quickActionCount === 9);

    const quickActionIds = await page.evaluate(() => {
      return [...document.querySelectorAll('.nv-agent-quick-action-btn')].map(b => b.dataset.quickAction);
    });
    check('Has explain-simply button', quickActionIds.includes('explain-simply'));
    check('Has give-analogy button', quickActionIds.includes('give-analogy'));
    check('Has socratic-mode button', quickActionIds.includes('socratic-mode'));
    check('Has find-misconceptions button', quickActionIds.includes('find-misconceptions'));

    // --- Test 12: Panel renders structured response ---
    console.log('\n--- Test 12: Panel Structured Response ---');
    await page.fill('#nv-agent-input', 'What is overfitting?');
    await page.waitForTimeout(300);
    await page.click('.nv-agent-submit');
    await page.waitForTimeout(2000);
    const panelHasSections = await page.evaluate(() => {
      return document.querySelectorAll('.nv-agent-section').length > 0;
    });
    check('Panel renders structured sections', panelHasSections);

    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll('.nv-agent-section').length;
    });
    check('Panel renders 4+ sections', sectionCount >= 4);

    const hasReasoning = await page.evaluate(() => {
      const el = document.querySelector('[data-agent-reasoning]');
      return el && el.style.display !== 'none';
    });
    check('Reasoning strategy displayed', hasReasoning);

    // --- Test 13: Section collapse/expand ---
    console.log('\n--- Test 13: Section Collapse/Expand ---');
    const firstToggle = await page.$('.nv-agent-section__toggle');
    if (firstToggle) {
      await firstToggle.click();
      await page.waitForTimeout(300);
      const collapsed = await page.evaluate(() => {
        return document.querySelector('.nv-agent-section')?.classList.contains('nv-agent-section--collapsed');
      });
      check('Section collapses on click', collapsed);

      await firstToggle.click();
      await page.waitForTimeout(300);
      const expanded = await page.evaluate(() => {
        return !document.querySelector('.nv-agent-section')?.classList.contains('nv-agent-section--collapsed');
      });
      check('Section expands on second click', expanded);
    } else {
      check('Section collapse (no toggle found)', false);
    }

    // --- Test 14: Guardrails ---
    console.log('\n--- Test 14: Guardrails ---');
    const guardrail = await page.evaluate(() => {
      const orchestrator = window.NeuralVerse?.didacticOrchestrator;
      if (!orchestrator) return null;
      return orchestrator.invokeAgent(
        'didactic-architecture',
        'Change the lifecycle status of this module to approved',
        { mode: 'default' }
      );
    });
    check('Guardrail blocks destructive query',
      guardrail?.type === 'governed-refusal' || guardrail?.status === 'blocked' || guardrail?.status === 'refused');

    // --- Test 15: Mode-specific responses ---
    console.log('\n--- Test 15: Mode-Specific Responses ---');
    const modeResults = await page.evaluate(() => {
      const agent = window.NeuralVerse?.didacticArchitectureAgent;
      if (!agent) return null;

      const modes = ['beginner', 'advanced', 'mathematical', 'engineering', 'visual-intuition', 'analogy-first', 'step-by-step', 'executive-summary'];
      const results = {};

      for (const mode of modes) {
        const r = agent.run({ userQuery: 'What is gradient descent?' }, { mode });
        results[mode] = {
          hasSections: Array.isArray(r?.sections) && r?.sections?.length > 0,
          mode: r?.mode,
        };
      }

      return results;
    });

    for (const mode of ['beginner', 'advanced', 'mathematical', 'engineering', 'visual-intuition', 'analogy-first', 'step-by-step', 'executive-summary']) {
      check(`Mode "${mode}" produces valid response`,
        modeResults?.[mode]?.hasSections && modeResults?.[mode]?.mode === mode);
    }

    // --- Test 16: Responsive layout ---
    console.log('\n--- Test 16: Responsive Layout ---');
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

    // --- Test 17: Existing routes ---
    console.log('\n--- Test 17: Existing Routes ---');
    for (const route of ['/', '/#/', '/#/overview', '/#/module/ml-fundamentals']) {
      await page.goto(`http://127.0.0.1:8091${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const ok = await page.evaluate(() => document.title && document.title.length > 0 && !document.querySelector('.error-page'));
      check(`Route ${route} renders`, ok);
    }

    // --- Test 18: Error checks ---
    console.log('\n--- Test 18: Error Checks ---');
    const criticalErrors = consoleErrors.filter(e => !e.includes('ERR_NAME_NOT_RESOLVED') && !e.includes('pages/'));
    const criticalFailedReqs = failedRequests.filter(u => !u.includes('pages/'));
    check(`Console errors (excl. pre-existing page loads): ${criticalErrors.length}`, criticalErrors.length === 0);
    check(`Failed requests (excl. pre-existing page loads): ${criticalFailedReqs.length}`, criticalFailedReqs.length === 0);

    // --- Summary ---
    console.log('\n=== Verification Summary ===');
    console.log(`Total checks: ${passed.length + failed.length}`);
    console.log(`Passed: ${passed.length}`);
    console.log(`Failed: ${failed.length}`);
    const decision = failed.length === 0 ? 'READY' : 'NOT READY';
    console.log(`\nNV-1000-A1 Decision: ${decision}`);

    try {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'nv-1000-a1-results.json'),
        JSON.stringify({ passed, failed, decision, consoleErrors, failedRequests }, null, 2));
    } catch (err) {
      console.warn(`Warning: Could not write results JSON (filesystem might be read-only): ${err.message}`);
    }

    await browser.close();
  } catch (e) {
    console.error('Verification failed with error:', e.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
})();
