'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9508;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const IMAGES_DIR = '/tmp/neuralverse-graph-reformulation';

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/markdown',
  '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2',
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
    res.writeHead(500); res.end(`Error: ${e.message}`);
  }
}

const KG_URL = `${BASE_URL}#/knowledge-graph`;

(async () => {
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Test server: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  let consoleErrors = 0;
  let pageErrors = 0;
  let failedRequests = 0;

  page.on('console', m => { if (m.type() === 'error') { console.error('Console error:', m.text()); consoleErrors++; } });
  page.on('pageerror', e => { console.error('Page error:', e.message); pageErrors++; });
  page.on('requestfailed', r => { console.error('Request failed:', r.url()); failedRequests++; });

  try {
    console.log('\n── Phase 1: Overview and Desktop Layout ──');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForSelector('.nv-kg-card--path', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Assert only paths are rendered
    const pathCards = page.locator('.nv-kg-card--path');
    const moduleCards = page.locator('.nv-kg-card--module');
    const pathCount = await pathCards.count();
    const moduleCount = await moduleCards.count();
    console.log(`Overview count: ${pathCount} Path cards, ${moduleCount} Module cards`);
    if (pathCount === 0 || moduleCount > 0) {
      throw new Error(`Overview layout assertion failed. Expected paths, got modules/lessons.`);
    }

    // Save screenshots
    await page.screenshot({ path: path.join(IMAGES_DIR, 'atlas-overview-1440.png') });
    await page.screenshot({ path: path.join(IMAGES_DIR, 'inspector-empty-1440.png') });

    console.log('\n── Phase 2: Mobile Overview Layout ──');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(IMAGES_DIR, 'atlas-overview-390.png') });

    // Switch back to desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    console.log('\n── Phase 3: Path Focus Stage 2 ──');
    // Click first path card
    await page.locator('.nv-kg-card--path').first().click();
    await page.waitForTimeout(800);

    // Verify hero and modules
    const stage2Hero = page.locator('.nv-kg-hero-card.nv-kg-card--path');
    const stage2Modules = page.locator('.nv-kg-card--module');
    console.log(`Path Focus: Hero path present? ${await stage2Hero.count() > 0}, Modules count: ${await stage2Modules.count()}`);
    if (await stage2Hero.count() === 0 || await stage2Modules.count() === 0) {
      throw new Error('Path focus failed: hero path card or module sub-cards missing.');
    }
    await page.screenshot({ path: path.join(IMAGES_DIR, 'path-focus-1440.png') });
    await page.screenshot({ path: path.join(IMAGES_DIR, 'inspector-selected-1440.png') });

    console.log('\n── Phase 4: Module Focus Stage 3 ──');
    // Click first module card
    await page.locator('.nv-kg-card--module').first().click();
    await page.waitForTimeout(800);

    // Verify lessons visible and no modules cards in main grid (only sibling pills if any)
    const stage3Hero = page.locator('.nv-kg-hero-card.nv-kg-card--module');
    const stage3Lessons = page.locator('.nv-kg-card--lesson');
    console.log(`Module Focus: Hero module present? ${await stage3Hero.count() > 0}, Lessons count: ${await stage3Lessons.count()}`);
    if (await stage3Hero.count() === 0 || await stage3Lessons.count() === 0) {
      throw new Error('Module focus failed: hero module card or lesson sub-cards missing.');
    }
    await page.screenshot({ path: path.join(IMAGES_DIR, 'module-focus-1440.png') });

    console.log('\n── Phase 5: Lesson Focus Stage 4 ──');
    // Click first lesson card
    await page.locator('.nv-kg-card--lesson').first().click();
    await page.waitForTimeout(800);

    // Verify artifacts visible
    const stage4Hero = page.locator('.nv-kg-hero-card.nv-kg-card--lesson');
    const stage4Artifacts = page.locator('.nv-kg-card--artifact');
    console.log(`Lesson Focus: Hero lesson present? ${await stage4Hero.count() > 0}, Artifacts count: ${await stage4Artifacts.count()}`);
    if (await stage4Hero.count() === 0 || await stage4Artifacts.count() === 0) {
      throw new Error('Lesson focus failed: hero lesson card or artifact sub-cards missing.');
    }
    await page.screenshot({ path: path.join(IMAGES_DIR, 'lesson-focus-1440.png') });

    console.log('\n── Phase 6: Artifact Focus Stage 5 ──');
    // Click first artifact card
    const targetArtifact = await stage4Artifacts.first();
    const targetArtifactTitle = await targetArtifact.locator('.nv-kg-card__title').textContent();
    const targetArtifactId = await targetArtifact.evaluate(el => el.getAttribute('aria-label').replace('Artifact: ', '')); // wait, aria-label is "Artifact: [Title]"
    
    await targetArtifact.click();
    await page.waitForTimeout(800);

    // Verify artifact is hero
    const stage5Hero = page.locator('.nv-kg-hero-card.nv-kg-card--artifact');
    console.log(`Artifact Focus: Hero artifact present? ${await stage5Hero.count() > 0}`);
    if (await stage5Hero.count() === 0) {
      throw new Error('Artifact focus failed: hero artifact card missing.');
    }
    await page.screenshot({ path: path.join(IMAGES_DIR, 'artifact-focus-1440.png') });

    console.log('\n── Phase 7: Navigation & Back / Reset ──');
    // Test back button
    const backBtn = page.locator('button:has-text("Back")').first();
    await backBtn.click();
    await page.waitForTimeout(800);
    // Should be back to Lesson Focus
    if (await page.locator('.nv-kg-hero-card.nv-kg-card--lesson').count() === 0) {
      throw new Error('Back navigation failed: did not return to Lesson Focus.');
    }

    // Test Reset Atlas button
    const resetBtn = page.locator('button:has-text("Reset Atlas")').first();
    await resetBtn.click();
    await page.waitForTimeout(800);
    // Should be back to Overview
    if (await page.locator('.nv-kg-card--path').count() === 0 || await page.locator('.nv-kg-card--module').count() > 0) {
      throw new Error('Reset Atlas failed: did not return to Overview.');
    }

    console.log('\n── Phase 8: Search Focus ──');
    // Type in search to find an artifact specifically
    const searchInput = page.locator('input.nv-kg-search');
    await searchInput.fill('artifact-context-fusion-exercise');
    await searchInput.dispatchEvent('change');
    await page.waitForTimeout(1000);

    // Verify it switched to Artifact Focus (Stage 5)
    if (await page.locator('.nv-kg-hero-card.nv-kg-card--artifact').count() === 0) {
      throw new Error('Search failed: did not switch to Stage 5 Artifact Focus.');
    }
    await page.screenshot({ path: path.join(IMAGES_DIR, 'search-to-artifact-1440.png') });

    console.log('\n── Phase 9: Mobile Stage View ──');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(IMAGES_DIR, 'mobile-stage-390.png') });

    // HTML / Accessibility Checks
    const h1Count = await page.locator('h1').count();
    if (h1Count !== 1) {
      throw new Error(`Accessibility failed: expected exactly 1 h1 per page, found ${h1Count}`);
    }

    console.log(`\n✅ ALL AUDITS PASSED SUCCESSFULLY`);
    console.log(`Console errors: ${consoleErrors}`);
    console.log(`Page errors: ${pageErrors}`);
    console.log(`Failed requests: ${failedRequests}`);
    
  } catch (e) {
    console.error('Audit FAILED:', e.message);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
})();
