/**
 * NV-900-QA4 — Full System Regression Audit
 * Starts its own HTTP server, runs full audit, then stops server.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9191;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const ARTIFACTS_DIR = '/home/matheusneves/Projetos/NeuralVerse/neuralverse/screenshots/qa4-audit';

// --- IDs ---
const PATH_ID       = 'path-advanced-rag-foundations';
const MODULE_ID     = 'module-advanced-retrieval-pipelines';
const LESSON_ID     = 'lesson-query-routing';
const ARTIFACT_ID   = 'artifact-query-routing-explanatory-text';
const STANDALONE_MODULE_ID = 'module-agent-memory-orchestration';

if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// ── Inline static file server ────────────────────────
const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.md':   'text/markdown',
  '.txt':  'text/plain',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function serveFile(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(WEBSITE_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      // Serve index.html for SPA hash routing
      const idx = path.join(WEBSITE_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(idx));
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500);
    res.end(`Error: ${e.message}`);
  }
}

// ── Metrics ──────────────────────────────────────────
const M = {
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  overflows: [],
  ariaBugs: [],
  screenshots: [],
  routeResults: [],
  cqA: {},
};

function attachListeners(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('Favicon') && !t.includes('404')) {
        M.consoleErrors.push(t);
        console.error(`  [ERR] ${t.slice(0, 120)}`);
      }
    }
  });
  page.on('pageerror', e => {
    M.pageErrors.push(e.toString());
    console.error(`  [PAGEERR] ${e.toString().slice(0, 120)}`);
  });
  page.on('requestfailed', req => {
    const url = req.url();
    if (!url.includes('favicon')) {
      const err = req.failure()?.errorText || 'unknown';
      M.failedRequests.push({ url, err });
      console.error(`  [REQFAIL] ${url.slice(0, 80)} — ${err}`);
    }
  });
}

async function sc(page, name) {
  const p = path.join(ARTIFACTS_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  M.screenshots.push(name);
  console.log(`  📸 ${name}`);
}

async function checkOverflow(page, tag) {
  const ov = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  if (ov) { M.overflows.push(tag); console.warn(`  [OVERFLOW] ${tag}`); }
  return ov;
}

async function checkAria(page, hash) {
  const n = await page.evaluate(() =>
    document.querySelectorAll('[aria-current="page"]').length
  );
  const isUnknown = hash.includes('does-not-exist') || hash.includes('nonexistent');
  if (!isUnknown && n !== 1) {
    M.ariaBugs.push(`${hash}: aria-current count=${n}`);
    console.warn(`  [ARIA] ${hash}: count=${n}`);
  }
  return n;
}

async function auditRoute(page, hash, label, viewports, extra) {
  console.log(`\n─── ${label} (${hash})`);
  try {
    await page.goto(`${BASE_URL}${hash}`, { waitUntil: 'networkidle', timeout: 18000 });
  } catch(_) { /* hash navigation may throw on timeout */ }
  await page.waitForTimeout(1500);

  const blank = (await page.evaluate(() => document.body?.innerText?.trim() || '')).length < 40;
  if (blank) console.warn('  [BLANK?]');
  await checkAria(page, hash);
  const mainVis = await page.evaluate(() => {
    const m = document.querySelector('.nv-main-workspace, main, [role="main"]');
    return m ? m.offsetHeight > 0 : false;
  });

  const res = { route: hash, label, blank, mainVisible: mainVis, vp: {} };

  for (const [w, h, suffix] of viewports) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(350);
    const ov = await checkOverflow(page, `${hash}@${w}x${h}`);
    const sname = suffix;
    await sc(page, sname);
    res.vp[`${w}x${h}`] = { overflow: ov };
  }

  if (extra) await extra(page);
  M.routeResults.push(res);
  return res;
}

// ────────────────────────────────────────────────────
(async () => {
  // Start server
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`\n🌐 Server on ${BASE_URL}`);

  // Confirm server OK
  try {
    await new Promise((resolve, reject) => {
      const req = http.get(`${BASE_URL}`, res => {
        console.log(`  Server HTTP status: ${res.statusCode}`);
        resolve();
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('timeout')));
    });
  } catch(e) {
    console.error('Server health check failed:', e.message);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('NV-900-QA4 — Full System Regression Audit');
  console.log('═══════════════════════════════════════════════════');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  attachListeners(page);

  // ── PRIMARY ROUTES ────────────────────────────────
  await auditRoute(page, '#/', 'Home', [
    [390, 844, 'home-mobile'],
    [1440, 900, 'home-desktop'],
  ]);

  await auditRoute(page, '#/learning', 'Learning', [
    [390, 844, 'learning-mobile'],
    [1440, 900, 'learning-desktop'],
  ]);

  await auditRoute(page, '#/modules', 'Modules', [
    [390, 844, 'modules-mobile'],
    [1440, 900, 'modules-desktop'],
  ]);

  await auditRoute(page, '#/workspace', 'Workspace', [
    [390, 844, 'workspace-mobile'],
    [1440, 900, 'workspace-desktop'],
  ]);

  await auditRoute(page, '#/content', 'Content', [
    [1440, 900, 'content-desktop'],
  ]);

  await auditRoute(page, '#/retrieval-playground', 'Retrieval', [
    [390, 844, 'retrieval-mobile'],
    [1440, 900, 'retrieval-desktop'],
  ]);

  await auditRoute(page, '#/settings', 'Settings', [
    [390, 844, 'settings-mobile'],
    [1440, 900, 'settings-desktop'],
  ]);

  await auditRoute(page, '#/does-not-exist', '404', [
    [1440, 900, '404-desktop'],
  ]);

  // ── CURRICULUM DEEP ROUTES ────────────────────────
  await auditRoute(page, `#/learning/${PATH_ID}`, 'Path Detail', [
    [1440, 900, 'learning-path-desktop'],
    [390, 844, 'learning-path-mobile'],
  ]);

  await auditRoute(page, `#/learning/${PATH_ID}/module/${MODULE_ID}`, 'Module Detail', [
    [1440, 900, 'module-desktop'],
    [390, 844, 'module-mobile'],
  ]);

  await auditRoute(page, `#/learning/${PATH_ID}/module/${MODULE_ID}/lesson/${LESSON_ID}`, 'Lesson Detail', [
    [1440, 900, 'lesson-desktop'],
    [390, 844, 'lesson-mobile'],
  ]);

  await auditRoute(
    page,
    `#/learning/${PATH_ID}/module/${MODULE_ID}/lesson/${LESSON_ID}/artifact/${ARTIFACT_ID}`,
    'Artifact Detail',
    [[1440, 900, 'artifact-desktop'], [390, 844, 'artifact-mobile']]
  );

  await auditRoute(page, `#/modules/${STANDALONE_MODULE_ID}`, 'Standalone Module', [
    [1440, 900, 'standalone-module-desktop'],
  ]);

  await auditRoute(page, '#/learning/path-nonexistent-999', 'Invalid Path (graceful)', [
    [1440, 900, 'invalid-path-desktop'],
  ]);

  // ── CURRICULUM QA ─────────────────────────────────
  console.log('\n📚 Curriculum QA');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}#/learning`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(2500);

  const pathCards = await page.evaluate(() => document.querySelectorAll('.nv-curriculum-card--path').length);
  console.log(`  path cards: ${pathCards} (expect 19)`);
  M.cqA.pathCards = pathCards;
  M.cqA.pathCardsOk = pathCards === 19;

  // Filter test
  let filterOk = false;
  const reviewedBtn = page.locator('.nv-curriculum-filter__button').filter({ hasText: 'Reviewed' }).first();
  if (await reviewedBtn.count() > 0) {
    await reviewedBtn.click(); await page.waitForTimeout(600);
    const afterReviewed = await page.evaluate(() => document.querySelectorAll('.nv-curriculum-card--path').length);
    console.log(`  after Reviewed filter: ${afterReviewed}`);
    const draftBtn = page.locator('.nv-curriculum-filter__button').filter({ hasText: 'Draft' }).first();
    if (await draftBtn.count() > 0) { await draftBtn.click(); await page.waitForTimeout(500); }
    const allBtn = page.locator('.nv-curriculum-filter__button').filter({ hasText: 'All' }).first();
    if (await allBtn.count() > 0) { await allBtn.click(); await page.waitForTimeout(500); }
    filterOk = true;
    console.log('  filter buttons: OK');
  }
  M.cqA.filterOk = filterOk;

  const badges = await page.evaluate(() => document.querySelectorAll('.nv-badge').length);
  console.log(`  badges: ${badges}`);
  M.cqA.badgesOk = badges > 0;

  await page.goto(`${BASE_URL}#/modules`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(2500);
  const modCards = await page.evaluate(() => document.querySelectorAll('.nv-curriculum-card--module').length);
  console.log(`  module cards: ${modCards} (expect 40)`);
  M.cqA.moduleCards = modCards;
  M.cqA.moduleCardsOk = modCards === 40;

  // ── MARKDOWN QA ───────────────────────────────────
  console.log('\n📄 Markdown QA');
  await page.goto(
    `${BASE_URL}#/learning/${PATH_ID}/module/${MODULE_ID}/lesson/${LESSON_ID}/artifact/${ARTIFACT_ID}`,
    { waitUntil: 'networkidle', timeout: 18000 }
  );
  await page.waitForTimeout(3000);

  const mdStats = await page.evaluate(() => ({
    reader: !!document.querySelector('.nv-curriculum-reader'),
    headings: document.querySelectorAll('.nv-curriculum-reader h2, .nv-curriculum-reader h3, .nv-curriculum-reader h4').length,
    paragraphs: document.querySelectorAll('.nv-curriculum-reader p').length,
    codeBlocks: document.querySelectorAll('.nv-curriculum-reader pre').length,
    tables: document.querySelectorAll('.nv-curriculum-table').length,
    blockquotes: document.querySelectorAll('.nv-curriculum-reader blockquote').length,
    lists: document.querySelectorAll('.nv-curriculum-reader ul, .nv-curriculum-reader ol').length,
    tableOverflow: Array.from(document.querySelectorAll('.nv-curriculum-table'))
      .some(t => t.scrollWidth > t.clientWidth),
    interactiveVizNotice: !!document.querySelector('.nv-curriculum-callout'),
  }));
  console.log('  markdown stats:', JSON.stringify(mdStats));
  M.cqA.markdown = mdStats;
  await sc(page, 'artifact-markdown-desktop');

  // Check a few more artifacts — find an interactive visualization
  const cvIdx = JSON.parse(fs.readFileSync(path.join(WEBSITE_DIR, 'data/curriculum-index.json'), 'utf8'));
  const vizArtifact = cvIdx.artifacts.find(a => a.type === 'Interactive Visualization');
  const vizLesson = vizArtifact ? cvIdx.lessons.find(l => l.artifactIds.includes(vizArtifact.id)) : null;
  const vizModule = vizLesson ? cvIdx.modules.find(m => m.lessonIds.includes(vizLesson.id)) : null;
  const vizPath = vizModule ? cvIdx.learningPaths.find(p => p.moduleIds.includes(vizModule.id)) : null;

  if (vizArtifact && vizLesson && vizModule && vizPath) {
    console.log(`  Testing Interactive Visualization artifact: ${vizArtifact.id}`);
    await page.goto(
      `${BASE_URL}#/learning/${vizPath.id}/module/${vizModule.id}/lesson/${vizLesson.id}/artifact/${vizArtifact.id}`,
      { waitUntil: 'networkidle', timeout: 18000 }
    );
    await page.waitForTimeout(2500);
    const hasCallout = await page.evaluate(() => !!document.querySelector('.nv-curriculum-callout'));
    console.log(`  Interactive Visualization callout: ${hasCallout}`);
    M.cqA.interactiveVizCallout = hasCallout;
    await sc(page, 'artifact-interactive-viz-desktop');
  }

  // ── RETRIEVAL WORKSPACE QA ────────────────────────
  console.log('\n🔬 Retrieval QA');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}#/retrieval-playground`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(2000);

  const searchInput = page.locator('#playground-search-input');
  if (await searchInput.count() > 0) {
    await searchInput.fill('transformer attention');
    await page.locator('#playground-search-button').click();
    await page.waitForTimeout(1500);
    await sc(page, 'retrieval-search-desktop');

    const results = await page.locator('#search-results-container .result-card').count();
    console.log(`  search results: ${results}`);
    M.cqA.retrieval = { searchResults: results };

    if (results > 0) {
      await page.locator('#search-results-container .result-card').first().click();
      await page.waitForTimeout(800);
      await sc(page, 'retrieval-inspector-desktop');
    }

    // Pin
    const pinBtn = page.locator('#playground-pin-button');
    if (await pinBtn.count() > 0 && !(await pinBtn.isDisabled())) {
      await pinBtn.click(); await page.waitForTimeout(400);
      await sc(page, 'retrieval-memory-desktop');
    }
  }

  // Graph
  const graphTab = page.locator('#tab-graph');
  if (await graphTab.count() > 0) {
    await graphTab.click(); await page.waitForTimeout(1500);
    await sc(page, 'retrieval-graph-desktop');
    M.cqA.retrieval = M.cqA.retrieval || {};
    M.cqA.retrieval.graphOk = true;
  }

  // Compare
  const stab = page.locator('#tab-search');
  if (await stab.count() > 0) { await stab.click(); await page.waitForTimeout(500); }
  const cmpBtns = page.locator('.search-card-compare-btn');
  const cmpN = await cmpBtns.count();
  if (cmpN >= 2) {
    await cmpBtns.nth(0).click(); await page.waitForTimeout(200);
    await cmpBtns.nth(1).click(); await page.waitForTimeout(600);
    const compareTab = page.locator('#tab-compare');
    if (await compareTab.count() > 0) {
      await compareTab.click(); await page.waitForTimeout(1200);
      await sc(page, 'retrieval-compare-desktop');
      M.cqA.retrieval.compareOk = true;
      const synthBtn = page.locator('button').filter({ hasText: /Compile|Synthesize|Evidence/i });
      const synthCount = await synthBtn.count();
      if (synthCount > 0) {
        try {
          await synthBtn.first().click({ timeout: 5000 });
          await page.waitForTimeout(2000);
          await sc(page, 'retrieval-synthesis-desktop');
          M.cqA.retrieval.synthesisOk = true;
        } catch(_) {
          console.warn('  [WARN] synthesis button not clickable (not visible in this state)');
          await sc(page, 'retrieval-synthesis-desktop');
          M.cqA.retrieval.synthesisOk = false;
        }
      }
    }
  }

  // Presentation
  const presTab = page.locator('#tab-presentation');
  if (await presTab.count() > 0) {
    await presTab.click(); await page.waitForTimeout(1200);
    await sc(page, 'retrieval-presentation-desktop');
    M.cqA.retrieval.presentationOk = true;
  }

  // Reload persistence
  await page.reload({ waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(1500);
  M.cqA.retrieval.reloadOk = (await page.locator('#playground-search-input').count()) > 0;
  console.log(`  reload persistence: ${M.cqA.retrieval.reloadOk}`);

  // ── NAVIGATION QA ─────────────────────────────────
  console.log('\n🧭 Navigation QA');
  await page.goto(`${BASE_URL}#/learning`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(800);
  await page.goBack(); await page.waitForTimeout(600);
  await page.goForward(); await page.waitForTimeout(600);
  const navHash = await page.evaluate(() => window.location.hash);
  console.log(`  history nav hash: ${navHash}`);

  // Deep refresh
  await page.goto(
    `${BASE_URL}#/learning/${PATH_ID}/module/${MODULE_ID}/lesson/${LESSON_ID}`,
    { waitUntil: 'networkidle', timeout: 18000 }
  );
  await page.waitForTimeout(2500);
  const deepRefreshOk = await page.evaluate(() => !!document.querySelector('[data-curriculum-root]'));
  console.log(`  deep route refresh: ${deepRefreshOk}`);
  M.cqA.navQA = { navHash, deepRefreshOk };

  // ── REDUCED MOTION ────────────────────────────────
  console.log('\n♿ Reduced Motion');
  const rmCtx = await browser.newContext({ reducedMotion: 'reduce' });
  const rmPage = await rmCtx.newPage();
  attachListeners(rmPage);
  await rmPage.goto(`${BASE_URL}#/`, { waitUntil: 'networkidle', timeout: 18000 });
  await rmPage.waitForTimeout(800);
  await rmPage.setViewportSize({ width: 1440, height: 900 });
  await sc(rmPage, 'reduced-motion-home-desktop');
  const animDuration = await rmPage.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--sys-motion-duration-normal').trim()
  );
  console.log(`  --sys-motion-duration-normal = "${animDuration}"`);
  M.cqA.reducedMotionToken = animDuration;
  await rmCtx.close();

  // ── A11Y QA ───────────────────────────────────────
  console.log('\n♿ Accessibility');
  await page.goto(`${BASE_URL}#/learning`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(1500);
  const a11y = await page.evaluate(() => ({
    emptyFocusable: Array.from(document.querySelectorAll('nav a, nav button'))
      .filter(e => e.tabIndex >= 0 && !e.innerText?.trim() && !e.getAttribute('aria-label')).length,
    navsWithLabel: document.querySelectorAll('nav[aria-label]').length,
    ariaCurrentCount: document.querySelectorAll('[aria-current="page"]').length,
    h1Count: document.querySelectorAll('h1').length,
    ariaExpanded: document.querySelectorAll('[aria-expanded]').length,
    buttons: document.querySelectorAll('button[type="button"], button[type="submit"]').length,
  }));
  console.log('  a11y:', JSON.stringify(a11y));
  M.cqA.a11y = a11y;

  // ── PERFORMANCE QA ────────────────────────────────
  console.log('\n⚡ Performance — index fetch count');
  const fetchLog = [];
  page.on('request', r => { if (r.url().includes('curriculum-index.json')) fetchLog.push(1); });
  await page.goto(`${BASE_URL}#/learning`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}#/modules`, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(1000);
  console.log(`  curriculum-index.json fetched ${fetchLog.length} time(s) across 2 route navigations`);
  M.cqA.indexFetchCount = fetchLog.length;
  M.cqA.indexFetchedOnce = fetchLog.length <= 1;

  await browser.close();
  server.close();

  // ── REPORT ────────────────────────────────────────
  const pass =
    M.consoleErrors.length === 0 &&
    M.pageErrors.length === 0 &&
    M.failedRequests.length === 0 &&
    M.overflows.length === 0 &&
    M.cqA.pathCardsOk &&
    M.cqA.moduleCardsOk;

  const report = {
    audit: 'NV-900-QA4',
    timestamp: new Date().toISOString(),
    status: pass ? 'PASS' : 'FAIL_WITH_ISSUES',
    counts: {
      routesTested: M.routeResults.length,
      screenshots: M.screenshots.length,
      consoleErrors: M.consoleErrors.length,
      pageErrors: M.pageErrors.length,
      failedRequests: M.failedRequests.length,
      overflows: M.overflows.length,
      ariaBugs: M.ariaBugs.length,
    },
    details: {
      consoleErrors: M.consoleErrors,
      pageErrors: M.pageErrors,
      failedRequests: M.failedRequests,
      overflows: M.overflows,
      ariaBugs: M.ariaBugs,
      screenshots: M.screenshots,
    },
    curriculumQA: M.cqA,
    routeResults: M.routeResults,
  };

  const rp = path.join(__dirname, '../final-qa-report.json');
  fs.writeFileSync(rp, JSON.stringify(report, null, 2));

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`STATUS: ${report.status}`);
  console.log(`console.errors : ${report.counts.consoleErrors}`);
  console.log(`page.errors    : ${report.counts.pageErrors}`);
  console.log(`failed.requests: ${report.counts.failedRequests}`);
  console.log(`overflows      : ${report.counts.overflows}`);
  console.log(`aria bugs      : ${report.counts.ariaBugs}`);
  console.log(`screenshots    : ${report.counts.screenshots}`);
  console.log(`path cards     : ${M.cqA.pathCards} (ok=${M.cqA.pathCardsOk})`);
  console.log(`module cards   : ${M.cqA.moduleCards} (ok=${M.cqA.moduleCardsOk})`);
  console.log(`filters        : ${M.cqA.filterOk}`);
  console.log(`retrieval      : ${JSON.stringify(M.cqA.retrieval)}`);
  console.log(`a11y           : ${JSON.stringify(M.cqA.a11y)}`);
  console.log(`report         → ${rp}`);
  console.log('═══════════════════════════════════════════════════');
})();
