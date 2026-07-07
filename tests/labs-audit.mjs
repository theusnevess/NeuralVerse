import { chromium } from 'playwright';

const BASE = 'http://localhost:8083';
const SCREENSHOTS = '/tmp/opencode/labs-audit';

async function run() {
  const fs = await import('fs');
  fs.mkdirSync(SCREENSHOTS, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop-1920', width: 1920, height: 1080 },
    { name: 'laptop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'tablet-landscape-1024', width: 1024, height: 768 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-375', width: 375, height: 667 },
    { name: 'mobile-landscape-844', width: 844, height: 390 },
  ];

  const consoleLogs = [];
  const errors = [];

  // === PHASE 1: Lab Index Page ===
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    
    page.on('console', msg => consoleLogs.push({ viewport: vp.name, route: 'index', type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => errors.push({ viewport: vp.name, route: 'index', error: err.message }));

    await page.goto(`${BASE}/#/laboratory`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${SCREENSHOTS}/index-${vp.name}.png`, fullPage: true });
    console.log(`Screenshot: index-${vp.name}.png`);

    await ctx.close();
  }

  // === PHASE 2: Lab Detail Page (Linear Regression) ===
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    
    page.on('console', msg => consoleLogs.push({ viewport: vp.name, route: 'detail', type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => errors.push({ viewport: vp.name, route: 'detail', error: err.message }));

    await page.goto(`${BASE}/#/laboratory/linear-regression`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `${SCREENSHOTS}/detail-${vp.name}.png`, fullPage: true });
    console.log(`Screenshot: detail-${vp.name}.png`);

    await ctx.close();
  }

  // === PHASE 3: Interaction Testing (Desktop) ===
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.on('console', msg => consoleLogs.push({ viewport: 'desktop', route: 'interaction', type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => errors.push({ viewport: 'desktop', route: 'interaction', error: err.message }));

  // Go to linear regression lab
  await page.goto(`${BASE}/#/laboratory/linear-regression`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Test slider interaction
  const sliders = await page.locator('.nv-lab-slider').all();
  console.log(`Found ${sliders.length} sliders`);

  if (sliders.length > 0) {
    // Move first slider
    const slider = sliders[0];
    const box = await slider.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.8, box.y + box.height / 2);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SCREENSHOTS}/interaction-slider-moved.png` });
      console.log('Screenshot: interaction-slider-moved.png');
    }
  }

  // Test Reset button
  const resetBtn = page.locator('[data-lab-reset]');
  if (await resetBtn.count() > 0) {
    await resetBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS}/interaction-reset.png` });
    console.log('Screenshot: interaction-reset.png');
  }

  // Test back button
  const backBtn = page.locator('.nv-lab-back-btn');
  if (await backBtn.count() > 0) {
    await backBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOTS}/interaction-back.png` });
    console.log('Screenshot: interaction-back.png');
  }

  // === PHASE 4: Accessibility Testing ===
  // Check keyboard navigation on index
  await page.goto(`${BASE}/#/laboratory`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Tab through cards
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: `${SCREENSHOTS}/a11y-tab-focus.png` });
  console.log('Screenshot: a11y-tab-focus.png');

  // Check ARIA attributes
  const ariaLabels = await page.evaluate(() => {
    const elements = document.querySelectorAll('[aria-label]');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      ariaLabel: el.getAttribute('aria-label'),
      role: el.getAttribute('role')
    }));
  });
  console.log('ARIA labels found:', ariaLabels.length);

  // Check heading hierarchy
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent.trim().substring(0, 60)
    }));
  });
  console.log('Heading hierarchy:', JSON.stringify(headings));

  // === PHASE 5: Performance Check ===
  await page.goto(`${BASE}/#/laboratory/linear-regression`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const perfMetrics = await page.evaluate(() => {
    const entries = performance.getEntriesByType('navigation');
    const nav = entries[0];
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
      loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      domInteractive: nav ? Math.round(nav.domInteractive - nav.startTime) : null,
      responseTime: nav ? Math.round(nav.responseEnd - nav.requestStart) : null,
    };
  });
  console.log('Performance metrics:', JSON.stringify(perfMetrics));

  // Check DOM element count
  const domCount = await page.evaluate(() => document.querySelectorAll('*').length);
  console.log('DOM elements:', domCount);

  // Check SVG count (for visualizations)
  const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length);
  console.log('SVG elements:', svgCount);

  // === PHASE 6: Check other labs ===
  const labSlugs = ['logistic-regression', 'gradient-descent', 'pca-projection', 'kmeans-clustering', 'transformer-attention'];
  for (const slug of labSlugs) {
    await page.goto(`${BASE}/#/laboratory/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREENSHOTS}/lab-${slug}.png` });
    console.log(`Screenshot: lab-${slug}.png`);
  }

  await page.close();
  await ctx.close();

  // === PHASE 7: Mobile interaction test ===
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileCtx.newPage();
  mobilePage.on('console', msg => consoleLogs.push({ viewport: 'mobile', route: 'interaction', type: msg.type(), text: msg.text() }));

  await mobilePage.goto(`${BASE}/#/laboratory`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: `${SCREENSHOTS}/mobile-index.png`, fullPage: true });
  console.log('Screenshot: mobile-index.png');

  await mobilePage.goto(`${BASE}/#/laboratory/linear-regression`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: `${SCREENSHOTS}/mobile-detail.png`, fullPage: true });
  console.log('Screenshot: mobile-detail.png');

  // Check if parameter panel overflows on mobile
  const mobileOverflow = await mobilePage.evaluate(() => {
    const paramPanel = document.querySelector('.nv-lab-parameter-panel');
    if (!paramPanel) return null;
    return {
      scrollWidth: paramPanel.scrollWidth,
      clientWidth: paramPanel.clientWidth,
      hasHorizontalOverflow: paramPanel.scrollWidth > paramPanel.clientWidth
    };
  });
  console.log('Mobile parameter panel overflow:', JSON.stringify(mobileOverflow));

  // Check if visualization panel is visible on mobile
  const mobileVizVisible = await mobilePage.evaluate(() => {
    const vizPanel = document.querySelector('.nv-lab-visualization-panel');
    if (!vizPanel) return null;
    const rect = vizPanel.getBoundingClientRect();
    return {
      visible: rect.height > 0 && rect.width > 0,
      height: rect.height,
      top: rect.top
    };
  });
  console.log('Mobile visualization panel:', JSON.stringify(mobileVizVisible));

  await mobilePage.close();
  await mobileCtx.close();

  // === PHASE 8: Console errors summary ===
  const consoleErrors = consoleLogs.filter(l => l.type === 'error' || l.type === 'warning');
  console.log('\n=== Console Errors/Warnings ===');
  consoleErrors.forEach(e => console.log(`[${e.viewport}/${e.route}] ${e.type}: ${e.text}`));
  console.log(`Total errors/warnings: ${consoleErrors.length}`);

  console.log('\n=== Page Errors ===');
  errors.forEach(e => console.log(`[${e.viewport}/${e.route}] ${e.error}`));
  console.log(`Total page errors: ${errors.length}`);

  // === PHASE 9: Check visual hierarchy ===
  const detailCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const detailPage = await detailCtx.newPage();
  await detailPage.goto(`${BASE}/#/laboratory/linear-regression`, { waitUntil: 'networkidle' });
  await detailPage.waitForTimeout(1000);

  const layoutMetrics = await detailPage.evaluate(() => {
    const viewer = document.querySelector('.nv-lab-viewer');
    const paramPanel = document.querySelector('.nv-lab-parameter-panel');
    const vizPanel = document.querySelector('.nv-lab-visualization-panel');
    const header = document.querySelector('.nv-lab-viewer-header');
    const viz = document.querySelector('[data-lab-visualization]');

    return {
      viewer: viewer ? { w: viewer.clientWidth, h: viewer.clientHeight } : null,
      paramPanel: paramPanel ? { w: paramPanel.clientWidth, h: paramPanel.clientHeight } : null,
      vizPanel: vizPanel ? { w: vizPanel.clientWidth, h: vizPanel.clientHeight } : null,
      header: header ? { h: header.clientHeight } : null,
      viz: viz ? { w: viz.clientWidth, h: viz.clientHeight } : null,
      paramPanelRatio: paramPanel && viewer ? (paramPanel.clientWidth / viewer.clientWidth * 100).toFixed(1) + '%' : null,
      vizPanelRatio: vizPanel && viewer ? (vizPanel.clientWidth / viewer.clientWidth * 100).toFixed(1) + '%' : null,
    };
  });
  console.log('\n=== Layout Metrics (Desktop) ===');
  console.log(JSON.stringify(layoutMetrics, null, 2));

  await detailPage.close();
  await detailCtx.close();

  await browser.close();
  console.log('\n=== Audit Complete ===');
  console.log(`Screenshots saved to: ${SCREENSHOTS}`);
}

run().catch(err => { console.error(err); process.exit(1); });
