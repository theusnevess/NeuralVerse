'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9502;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const SCREENSHOT_DIR = '/tmp/neuralverse-graph-expansion-audit';

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

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

  async function screenshot(name) {
    const p = path.join(SCREENSHOT_DIR, name);
    await page.screenshot({ path: p, fullPage: false });
    console.log(`  📸 ${p}`);
  }

  async function getNodeBoxes() {
    return page.locator('.nv-kg-node').evaluateAll(nodes =>
      nodes.map(n => {
        const type = n.dataset.type;
        const w = type === 'path' ? 280 : type === 'module' ? 200 : type === 'lesson' ? 160 : 130;
        const h = type === 'path' ? 80 : type === 'module' ? 58 : type === 'lesson' ? 44 : 34;
        const transformStr = n.getAttribute('transform') || '';
        const match = transformStr.match(/translate\(([^,]+),([^)]+)\)/);
        let wx = 0, wy = 0;
        if (match) { wx = parseFloat(match[1]); wy = parseFloat(match[2]); }
        return { id: n.dataset.nodeId, type, x: wx - w/2, y: wy - h/2, w, h };
      })
    );
  }

  try {
    console.log('\n── Area: Graph Branches Audit ──');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(KG_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('.nv-kg-node') !== null, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Navigation steps for staged graph
    const stages = [];
    const overlaps = [];

    // 1. Overview Stage
    await page.waitForTimeout(500);
    stages.push({ name: 'overview', boxes: await getNodeBoxes() });

    // 2. Path Focus (Click a path)
    const firstPath = page.locator('.nv-kg-node--path').first();
    await firstPath.hover({ force: true });
    await firstPath.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(800);
    stages.push({ name: 'path-focus', boxes: await getNodeBoxes() });
    await screenshot('branch-path-focus.png');

    // 3. Module Focus (Click a module)
    const firstModule = page.locator('.nv-kg-node--module').first();
    if (await firstModule.count() > 0) {
      await firstModule.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.waitForTimeout(800);
      stages.push({ name: 'module-focus', boxes: await getNodeBoxes() });
      await screenshot('branch-module-focus.png');
    }

    // 4. Lesson Focus (Click a lesson)
    const firstLesson = page.locator('.nv-kg-node--lesson').first();
    if (await firstLesson.count() > 0) {
      await firstLesson.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.waitForTimeout(800);
      stages.push({ name: 'lesson-focus', boxes: await getNodeBoxes() });
      await screenshot('branch-lesson-focus.png');
    }

    // 5. Artifact Focus (Click an artifact)
    const firstArtifact = page.locator('.nv-kg-node--artifact').first();
    if (await firstArtifact.count() > 0) {
      await firstArtifact.evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.waitForTimeout(800);
      stages.push({ name: 'artifact-focus', boxes: await getNodeBoxes() });
      await screenshot('branch-artifact-focus.png');
    }

    // Check for overlaps in all stages
    let totalOverlaps = 0;
    for (const stage of stages) {
      console.log(`Checking ${stage.name} for overlaps (${stage.boxes.length} nodes)...`);
      let stageOverlaps = 0;
      for (let i = 0; i < stage.boxes.length; i++) {
        for (let j = i + 1; j < stage.boxes.length; j++) {
          const a = stage.boxes[i], b = stage.boxes[j];
          if (!(a.x + a.w - 4 <= b.x || a.x + 4 >= b.x + b.w || a.y + a.h - 4 <= b.y || a.y + 4 >= b.y + b.h)) {
            stageOverlaps++;
            overlaps.push(`[${stage.name}] ${a.id} (${a.type}) overlaps ${b.id} (${b.type})`);
          }
        }
      }
      totalOverlaps += stageOverlaps;
    }

    if (totalOverlaps > 0) {
      console.error(`❌ FAILED: Found ${totalOverlaps} overlaps!`);
      overlaps.forEach(o => console.error(`   - ${o}`));
    } else {
      console.log('✅ PASSED: No node overlaps detected across all graph branches.');
    }

  } catch (e) {
    console.error('Test exception:', e);
  } finally {
    await browser.close();
    server.close();
    console.log('\n── Audit Complete ──');
  }
})();
